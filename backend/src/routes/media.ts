import { Router, type Request, type Response } from 'express';
import multer from 'multer';
import rateLimit from 'express-rate-limit';
import { fileTypeFromBuffer } from 'file-type';
import sharp from 'sharp';
import { requireAuth } from '../services/sessionService.js';
import { uploadToR2, listR2Files, deleteFromR2, generatePresignedUploadUrl } from '../services/r2Service.js';
import { generateVideoThumbnail } from '../services/videoThumbnailService.js';

const router = Router();

/**
 * Rate limiter for upload endpoint
 * Prevents DoS attacks via unlimited file uploads
 * 10 uploads per 15-minute window per IP
 */
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { error: 'Too many upload requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for trusted IPs (optional)
  skip: (req) => {
    const trustedIPs = process.env.TRUSTED_IPS?.split(',') || [];
    return trustedIPs.includes(req.ip || '');
  }
});

/**
 * Rate limiter for delete endpoint
 * 20 deletes per 15-minute window per IP
 */
const deleteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many delete requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Configure multer for memory storage
 * Files are stored in memory temporarily, then uploaded to Cloudflare R2
 * Single-tenant: all media goes to one R2 bucket
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB max
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'video/mp4',
      'video/webm'
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images (JPEG, PNG, WebP, GIF) and videos (MP4, WebM) allowed.'));
    }
  }
});

/**
 * POST /api/v1/media/upload
 * Upload media file to Cloudflare R2
 * Single-tenant: no organization context needed
 */
router.post('/upload', requireAuth, uploadLimiter, upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { buffer, originalname, mimetype, size } = req.file;

    // Validate file content type using magic numbers (not just MIME type header)
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'video/mp4',
      'video/webm'
    ];

    const detectedType = await fileTypeFromBuffer(buffer);

    if (!detectedType || !allowedMimeTypes.includes(detectedType.mime)) {
      return res.status(400).json({
        error: 'Invalid file type. Only images (JPEG, PNG, WebP, GIF) and videos (MP4, WebM) are allowed.',
        detected: detectedType?.mime || 'unknown'
      });
    }

    // Verify MIME type matches detected type (prevent spoofing)
    if (detectedType.mime !== mimetype) {
      console.warn(`MIME type mismatch: header=${mimetype}, actual=${detectedType.mime}`);
    }

    // Get folder from request body (backgrounds, events, posters, general)
    const folder = (req.body.folder as 'backgrounds' | 'events' | 'posters' | 'general') || 'general';

    // Optimize images before upload
    let optimizedBuffer = buffer;
    let finalMimeType = detectedType.mime;

    if (detectedType.mime.startsWith('image/')) {
      try {
        // Optimize image: resize if needed, convert to WebP for better compression
        const image = sharp(buffer);
        const metadata = await image.metadata();

        // Resize if image is larger than 2400px on any side
        const maxDimension = 2400;
        let resizeOptions = {};

        if (metadata.width && metadata.width > maxDimension) {
          resizeOptions = { width: maxDimension };
        } else if (metadata.height && metadata.height > maxDimension) {
          resizeOptions = { height: maxDimension };
        }

        // Convert to WebP with quality 85 for optimal size/quality balance
        optimizedBuffer = await image
          .resize(Object.keys(resizeOptions).length > 0 ? resizeOptions : undefined)
          .webp({ quality: 85, effort: 4 })
          .toBuffer();

        finalMimeType = 'image/webp';

        console.log(`Image optimized: ${(buffer.length / 1024).toFixed(1)}KB → ${(optimizedBuffer.length / 1024).toFixed(1)}KB (${((1 - optimizedBuffer.length / buffer.length) * 100).toFixed(1)}% reduction)`);
      } catch (error) {
        console.warn('Image optimization failed, using original:', error);
        // If optimization fails, use original buffer
        optimizedBuffer = buffer;
        finalMimeType = detectedType.mime;
      }
    }

    // Upload to Cloudflare R2 with auto-folder organization
    // Use optimized buffer and detected MIME type
    const { url, key, mediaType, folder: uploadedFolder } = await uploadToR2(optimizedBuffer, originalname, finalMimeType, folder);

    // Generate and upload thumbnail for videos
    let thumbnailUrl: string | undefined;
    if (detectedType.mime.startsWith('video/')) {
      try {
        console.log('Generating thumbnail for video...');
        const thumbnailBuffer = await generateVideoThumbnail(buffer, 1); // Capture at 1 second

        // Upload thumbnail to thumbnails/ folder
        const thumbnailFilename = key.replace(/\.(mp4|webm)$/i, '.webp');
        const thumbnailKey = `thumbnails/${thumbnailFilename.split('/').pop()}`;

        const thumbnailUpload = await uploadToR2(thumbnailBuffer, thumbnailFilename, 'image/webp', 'general');
        thumbnailUrl = thumbnailUpload.url;

        console.log(`Thumbnail generated and uploaded: ${thumbnailKey}`);
      } catch (thumbError) {
        console.warn('Thumbnail generation failed (continuing without thumbnail):', thumbError);
        // Don't fail the upload if thumbnail generation fails
      }
    }

    return res.status(201).json({
      message: `File uploaded successfully to Cloudflare R2 in ${uploadedFolder}/ folder`,
      media: {
        url,
        key,
        mediaType,
        mimetype: finalMimeType,
        size: optimizedBuffer.length,
        folder: uploadedFolder,
        originalFilename: originalname,
        thumbnailUrl
      }
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to upload file'
    });
  }
});

/**
 * GET /api/v1/media
 * List all media files from Cloudflare R2
 * Single-tenant: returns all media for the venue
 */
router.get('/', requireAuth, async (_req: Request, res: Response) => {
  try {
    const media = await listR2Files();
    return res.json({ media });
  } catch (error) {
    console.error('Error listing media:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to list media'
    });
  }
});

/**
 * DELETE /api/v1/media/:key
 * Delete a media file from Cloudflare R2
 * Single-tenant: direct delete, no tenant authorization
 */
router.delete('/:key(*)', requireAuth, deleteLimiter, async (req: Request, res: Response) => {
  try {
    const { key } = req.params;

    // Validate key format to prevent path traversal attacks
    if (!key || key.includes('..') || key.startsWith('/') || key.includes('\\')) {
      return res.status(400).json({ error: 'Invalid key format' });
    }

    // Validate key belongs to allowed folders
    const allowedFolders = ['backgrounds', 'events', 'posters', 'general'];
    const folder = key.split('/')[0];
    if (!allowedFolders.includes(folder)) {
      return res.status(403).json({ error: 'Access to this folder is not allowed' });
    }

    // Ensure key has proper structure (folder/filename)
    if (!key.includes('/') || key.split('/').length < 2) {
      return res.status(400).json({ error: 'Invalid key structure' });
    }

    await deleteFromR2(key);

    return res.json({ message: 'File deleted successfully from R2' });
  } catch (error) {
    console.error('Error deleting file:', error);
    return res.status(404).json({
      error: error instanceof Error ? error.message : 'Failed to delete file'
    });
  }
});

/**
 * POST /api/v1/media/presigned-url
 * Generate a pre-signed URL for direct browser upload to R2
 * Useful for large files or client-side uploads
 * Single-tenant: no organization context needed
 */
router.post('/presigned-url', requireAuth, async (req: Request, res: Response) => {
  try {
    const { filename, mimetype } = req.body;

    if (!filename || !mimetype) {
      return res.status(400).json({ error: 'filename and mimetype are required' });
    }

    const { uploadUrl, key } = await generatePresignedUploadUrl(filename, mimetype);

    return res.json({
      uploadUrl,
      key,
      message: 'Use this URL to upload directly to R2 from the browser'
    });
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to generate upload URL'
    });
  }
});

export { router as mediaRouter };

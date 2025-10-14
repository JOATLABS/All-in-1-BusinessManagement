import { Router, type Request, type Response } from 'express';
import multer from 'multer';
import { requireAuth } from '../services/sessionService.js';
import { uploadToR2, listR2Files, deleteFromR2, generatePresignedUploadUrl } from '../services/r2Service.js';

const router = Router();

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
router.post('/upload', requireAuth, upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { buffer, originalname, mimetype, size } = req.file;
    // Get folder from request body (backgrounds, events, posters, general)
    const folder = (req.body.folder as 'backgrounds' | 'events' | 'posters' | 'general') || 'general';

    // Upload to Cloudflare R2 with auto-folder organization
    const { url, key, mediaType, folder: uploadedFolder } = await uploadToR2(buffer, originalname, mimetype, folder);

    return res.status(201).json({
      message: `File uploaded successfully to Cloudflare R2 in ${uploadedFolder}/ folder`,
      media: {
        url,
        key,
        mediaType,
        mimetype,
        size,
        folder: uploadedFolder,
        originalFilename: originalname
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
router.delete('/:key', requireAuth, async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
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

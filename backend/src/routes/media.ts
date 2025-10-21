import { Router, type Request, type Response } from 'express';
import multer from 'multer';
import rateLimit from 'express-rate-limit';
import { fileTypeFromBuffer } from 'file-type';
import sharp, { type ResizeOptions } from 'sharp';
import { authenticateRequest } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/authorize.js';
import { log } from '../config/logger.js';
import {
  uploadToR2,
  listR2Files,
  deleteFromR2,
  generatePresignedUploadUrl,
} from '../services/r2Service.js';
import { generateVideoThumbnail } from '../services/videoThumbnailService.js';
import { transcodeVideoToMp4 } from '../services/videoTranscodeService.js';

const allowedImageMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'image/avif',
  'image/heic',
  'image/heif',
];

const allowedVideoMimeTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-m4v'];
const allowedModelMimeTypes = ['model/gltf-binary', 'model/gltf+json', 'model/gltf'];

const allowedMimeTypes = [...allowedImageMimeTypes, ...allowedVideoMimeTypes, ...allowedModelMimeTypes];

const isGlbBuffer = (buffer: Buffer): boolean => buffer.length >= 4 && buffer.toString('utf8', 0, 4) === 'glTF';

const mediaTypeErrorMessage =
  'Invalid file type. Only common image formats (JPEG, PNG, WebP, GIF, SVG, AVIF, HEIC), videos (MP4, WebM, MOV, M4V), and 3D ' +
  'models (GLB/GLTF) are allowed.';

const router = Router();

/**
 * Rate limiter for upload endpoint
 * Prevents DoS attacks via unlimited file uploads
 * 10 uploads per 15-minute window per IP
 */
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many upload requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    const trustedIPs = process.env.TRUSTED_IPS?.split(',') || [];
    return trustedIPs.includes(req.ip || '');
  },
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
  legacyHeaders: false,
});

/**
 * Configure multer for memory storage
 * Files are stored in memory temporarily, then uploaded to Cloudflare R2
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else if (file.mimetype === 'application/octet-stream') {
      cb(null, true);
    } else {
      cb(new Error(mediaTypeErrorMessage));
    }
  },
});

router.post(
  '/upload',
  authenticateRequest,
  requireRole(['superadmin', 'admin', 'staff']),
  uploadLimiter,
  upload.single('file'),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const { buffer, originalname, mimetype } = req.file;

      const detectedType = await fileTypeFromBuffer(buffer);
      const isGlb = isGlbBuffer(buffer);
      const effectiveMimeType = (() => {
        if (isGlb) {
          return 'model/gltf-binary';
        }

        if (detectedType?.mime) {
          return detectedType.mime;
        }

        if (allowedModelMimeTypes.includes(mimetype) || mimetype === 'application/octet-stream') {
          return isGlb ? 'model/gltf-binary' : mimetype;
        }

        return mimetype;
      })();

      const isAllowedMimeType = allowedMimeTypes.includes(effectiveMimeType);

      if (!isAllowedMimeType) {
        return res.status(400).json({
          error: mediaTypeErrorMessage,
          detected: detectedType?.mime || mimetype || 'unknown',
        });
      }

      if (detectedType && detectedType.mime !== mimetype && !isGlb) {
        log.warn('MIME type mismatch detected', {
          requestId: req.requestId,
          userId: req.user?.userId,
          reportedMime: mimetype,
          actualMime: detectedType.mime,
        });
      }

      const folder = (req.body.folder as 'backgrounds' | 'events' | 'posters' | 'general') || 'general';

      let optimizedBuffer = buffer;
      let finalMimeType = effectiveMimeType;

      // Optional image optimization - only if convertToWebp=true in request body
      const shouldConvertToWebp =
        req.body.convertToWebp === 'true' ||
        req.body.convertToWebp === true ||
        effectiveMimeType === 'image/heic' ||
        effectiveMimeType === 'image/heif' ||
        effectiveMimeType === 'image/avif';

      if (effectiveMimeType.startsWith('image/') && shouldConvertToWebp && effectiveMimeType !== 'image/svg+xml') {
        try {
          const image = sharp(buffer);
          const metadata = await image.metadata();

          const maxDimension = 2400;
          let resizeOptions: ResizeOptions | undefined;

          if (metadata.width && metadata.width > maxDimension) {
            resizeOptions = { width: maxDimension };
          } else if (metadata.height && metadata.height > maxDimension) {
            resizeOptions = { height: maxDimension };
          }

          optimizedBuffer = await image.resize(resizeOptions).webp({ quality: 85, effort: 4 }).toBuffer();
          finalMimeType = 'image/webp';

          log.info('Image optimized for upload', {
            requestId: req.requestId,
            userId: req.user?.userId,
            originalKb: Number((buffer.length / 1024).toFixed(1)),
            optimizedKb: Number((optimizedBuffer.length / 1024).toFixed(1)),
          });
        } catch (error) {
          log.warn('Image optimization failed, using original buffer', {
            requestId: req.requestId,
            userId: req.user?.userId,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
          optimizedBuffer = buffer;
          finalMimeType = effectiveMimeType;
        }
      }

      if (allowedVideoMimeTypes.includes(effectiveMimeType) && effectiveMimeType !== 'video/mp4') {
        try {
          const { buffer: transcodedBuffer, mimetype: transcodedMime, didTranscode } = await transcodeVideoToMp4(
            optimizedBuffer,
            effectiveMimeType
          );

          if (didTranscode) {
            log.info('Video transcoded for compatibility', {
              requestId: req.requestId,
              userId: req.user?.userId,
              from: effectiveMimeType,
              to: transcodedMime,
            });
          }

          optimizedBuffer = transcodedBuffer;
          finalMimeType = transcodedMime;
        } catch (transcodeError) {
          log.error('Video transcoding failed', transcodeError, {
            requestId: req.requestId,
            userId: req.user?.userId,
          });

          return res.status(500).json({
            error: 'Video processing failed. Please convert the file to MP4 and try again.',
          });
        }
      }

      const { url, key, mediaType, folder: uploadedFolder } = await uploadToR2(
        optimizedBuffer,
        originalname,
        finalMimeType,
        folder
      );

      let thumbnailUrl: string | undefined;
      if (finalMimeType.startsWith('video/')) {
        try {
          log.debug('Generating video thumbnail', {
            requestId: req.requestId,
            userId: req.user?.userId,
          });

          const thumbnailBuffer = await generateVideoThumbnail(optimizedBuffer, 1);
          const thumbnailKey = `thumbnails/${key.split('/').pop()?.replace(/\.[^.]+$/, '')}.webp`;
          const thumbnailUpload = await uploadToR2(thumbnailBuffer, `${key}.thumbnail.webp`, 'image/webp', 'thumbnails', {
            key: thumbnailKey,
          });
          thumbnailUrl = thumbnailUpload.url;

          log.info('Video thumbnail generated and uploaded', {
            requestId: req.requestId,
            userId: req.user?.userId,
            thumbnailKey,
          });
        } catch (thumbError) {
          log.warn('Thumbnail generation failed', {
            requestId: req.requestId,
            userId: req.user?.userId,
            error: thumbError instanceof Error ? thumbError.message : 'Unknown error',
          });
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
          thumbnailUrl,
        },
      });
    } catch (error) {
      log.error('Error uploading file', error, {
        requestId: req.requestId,
        userId: req.user?.userId,
      });
      return res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to upload file',
      });
    }
  }
);

router.get(
  '/',
  authenticateRequest,
  requireRole(['superadmin', 'admin', 'staff']),
  async (req: Request, res: Response) => {
    try {
      const media = await listR2Files();
      return res.json({ media });
    } catch (error) {
      log.error('Error listing media', error, {
        requestId: req.requestId,
        userId: req.user?.userId,
      });
      return res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to list media',
      });
    }
  }
);

router.delete(
  '/:key(*)',
  authenticateRequest,
  requireRole(['superadmin', 'admin', 'staff']),
  deleteLimiter,
  async (req: Request, res: Response) => {
    try {
      const { key } = req.params;

      if (!key || key.includes('..') || key.startsWith('/') || key.includes('\\')) {
        return res.status(400).json({ error: 'Invalid key format' });
      }

      const allowedFolders = ['backgrounds', 'events', 'posters', 'general', 'thumbnails'];
      const folder = key.split('/')[0];
      if (!allowedFolders.includes(folder)) {
        return res.status(403).json({ error: 'Access to this folder is not allowed' });
      }

      if (!key.includes('/') || key.split('/').length < 2) {
        return res.status(400).json({ error: 'Invalid key structure' });
      }

      await deleteFromR2(key);

      return res.json({ message: 'File deleted successfully from R2' });
    } catch (error) {
      log.error('Error deleting file from R2', error, {
        requestId: req.requestId,
        userId: req.user?.userId,
        key: req.params.key,
      });
      return res.status(404).json({
        error: error instanceof Error ? error.message : 'Failed to delete file',
      });
    }
  }
);

router.post(
  '/presigned-url',
  authenticateRequest,
  requireRole(['superadmin', 'admin', 'staff']),
  async (req: Request, res: Response) => {
    try {
      const { filename, mimetype } = req.body;

      if (!filename || !mimetype) {
        return res.status(400).json({ error: 'filename and mimetype are required' });
      }

      if (!allowedMimeTypes.includes(mimetype) && mimetype !== 'application/octet-stream') {
        return res.status(400).json({
          error: mediaTypeErrorMessage,
        });
      }

      const { uploadUrl, key } = await generatePresignedUploadUrl(filename, mimetype);

      return res.json({
        uploadUrl,
        key,
        message: 'Use this URL to upload directly to R2 from the browser',
      });
    } catch (error) {
      log.error('Error generating presigned media upload URL', error, {
        requestId: req.requestId,
        userId: req.user?.userId,
      });
      return res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to generate upload URL',
      });
    }
  }
);

export { router as mediaRouter };

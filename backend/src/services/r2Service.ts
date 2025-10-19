import { S3Client, PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

/**
 * Cloudflare R2 Storage Service
 * Single-tenant: all media stored in one bucket for the venue
 */

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucketName = process.env.R2_MEDIA_BUCKET;
const publicHost = process.env.R2_MEDIA_PUBLIC_HOST;

// Fail fast if required environment variables are missing
if (!accountId || !accessKeyId || !secretAccessKey || !bucketName || !publicHost) {
  throw new Error(
    'R2 configuration incomplete. Required environment variables: ' +
    'R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_MEDIA_BUCKET, R2_MEDIA_PUBLIC_HOST'
  );
}

/**
 * S3 Client configured for Cloudflare R2
 */
const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId,
    secretAccessKey
  }
});

/**
 * Get file extension from mimetype
 */
const getExtensionFromMimetype = (mimetype: string): string => {
  const mimetypeMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/svg+xml': 'svg',
    'image/avif': 'avif',
    'image/heic': 'heic',
    'image/heif': 'heif',
    'video/mp4': 'mp4',
    'video/webm': 'webm',
    'video/quicktime': 'mov',
    'video/x-m4v': 'm4v'
  };
  return mimetypeMap[mimetype] || 'bin';
};

/**
 * Determine media type from mimetype
 */
const getMediaType = (mimetype: string): 'image' | 'video' => {
  return mimetype.startsWith('video/') ? 'video' : 'image';
};

/**
 * Media folder types for auto-organization
 * Single-tenant: organize files by purpose in the single bucket
 */
export type MediaFolder = 'backgrounds' | 'events' | 'posters' | 'general' | 'thumbnails';

/**
 * Upload a file to Cloudflare R2 with automatic folder organization
 * Single-tenant: files organized into folders (backgrounds/, events/, etc.)
 */
export const uploadToR2 = async (
  buffer: Buffer,
  originalFilename: string,
  mimetype: string,
  folder: MediaFolder = 'general',
  options?: { key?: string }
): Promise<{ url: string; key: string; mediaType: 'image' | 'video'; folder: MediaFolder }> => {
  try {
    const ext = getExtensionFromMimetype(mimetype);
    const filename = `${randomUUID()}.${ext}`;
    // Auto-create folder structure: folder/filename
    const key = options?.key ?? `${folder}/${filename}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: mimetype,
      Metadata: {
        originalFilename,
        folder,
        uploadedAt: new Date().toISOString()
      }
    });

    await r2Client.send(command);

    // Public URL using custom domain
    const url = `https://${publicHost}/${key}`;
    const mediaType = getMediaType(mimetype);

    return { url, key, mediaType, folder };
  } catch (error) {
    console.error('Error uploading to R2:', error);
    throw new Error('Failed to upload file to R2');
  }
};

/**
 * List all files in R2 bucket
 * Single-tenant: returns all media for the venue
 */
export const listR2Files = async (): Promise<Array<{
  key: string;
  url: string;
  size: number;
  lastModified: Date;
  mediaType: 'image' | 'video';
  thumbnailUrl?: string;
}>> => {
  try {
    const command = new ListObjectsV2Command({
      Bucket: bucketName
    });

    const response = await r2Client.send(command);

    if (!response.Contents) {
      return [];
    }

    const thumbnailIndex = new Map<string, string>();

    for (const object of response.Contents) {
      if (!object.Key) continue;
      if (object.Key.startsWith('thumbnails/')) {
        const basename = object.Key.split('/').pop()?.replace(/\.[^.]+$/, '');
        if (basename) {
          thumbnailIndex.set(basename, `https://${publicHost}/${object.Key}`);
        }
      }
    }

    return response.Contents.filter((object) => object.Key && !object.Key.startsWith('thumbnails/')).map((object) => {
      const key = object.Key!;
      const basename = key.split('/').pop()?.replace(/\.[^.]+$/, '');
      const ext = key.split('.').pop()?.toLowerCase();
      const videoExts = ['mp4', 'webm', 'mov', 'm4v'];
      const mediaType = videoExts.includes(ext || '') ? 'video' : 'image';

      return {
        key,
        url: `https://${publicHost}/${key}`,
        size: object.Size || 0,
        lastModified: object.LastModified || new Date(),
        mediaType,
        thumbnailUrl: basename ? thumbnailIndex.get(basename) : undefined
      };
    });
  } catch (error) {
    console.error('Error listing R2 files:', error);
    throw new Error('Failed to list files from R2');
  }
};

/**
 * Delete a file from R2
 * Single-tenant: direct delete, no tenant authorization
 */
export const deleteFromR2 = async (key: string): Promise<void> => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key
    });

    await r2Client.send(command);
  } catch (error) {
    console.error('Error deleting from R2:', error);
    throw new Error('Failed to delete file from R2');
  }
};

/**
 * Generate a pre-signed URL for temporary upload access
 * Useful for direct browser uploads
 */
export const generatePresignedUploadUrl = async (
  filename: string,
  mimetype: string
): Promise<{ uploadUrl: string; key: string }> => {
  try {
    const ext = getExtensionFromMimetype(mimetype);
    const key = `${randomUUID()}.${ext}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: mimetype
    });

    const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 }); // 1 hour

    return { uploadUrl, key };
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    throw new Error('Failed to generate upload URL');
  }
};

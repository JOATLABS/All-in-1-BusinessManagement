import ffmpeg from 'fluent-ffmpeg';
import { createWriteStream, unlinkSync } from 'fs';
import { randomUUID } from 'crypto';
import { tmpdir } from 'os';
import { join } from 'path';
import sharp from 'sharp';
import { readFile } from 'fs/promises';

/**
 * Video Thumbnail Generation Service
 * Generates thumbnails from video files using FFmpeg
 */

/**
 * Generate a thumbnail from a video buffer
 * @param videoBuffer - The video file buffer
 * @param timePosition - Time position in seconds to capture (default: 1 second)
 * @returns Optimized thumbnail as WebP buffer
 */
export async function generateVideoThumbnail(
  videoBuffer: Buffer,
  timePosition: number = 1
): Promise<Buffer> {
  const tempVideoPath = join(tmpdir(), `video-${randomUUID()}.tmp`);
  const tempThumbnailPath = join(tmpdir(), `thumb-${randomUUID()}.png`);

  try {
    // Write video buffer to temporary file (FFmpeg needs file path)
    await new Promise<void>((resolve, reject) => {
      const writeStream = createWriteStream(tempVideoPath);
      writeStream.write(videoBuffer);
      writeStream.end();
      writeStream.on('finish', () => resolve());
      writeStream.on('error', reject);
    });

    // Generate thumbnail using FFmpeg
    await new Promise<void>((resolve, reject) => {
      ffmpeg(tempVideoPath)
        .screenshots({
          timestamps: [timePosition],
          filename: tempThumbnailPath.split('/').pop()!,
          folder: tmpdir(),
          size: '1280x?', // Width 1280px, auto height
        })
        .on('end', () => resolve())
        .on('error', (err) => reject(err));
    });

    // Read generated thumbnail
    const thumbnailBuffer = await readFile(tempThumbnailPath);

    // Optimize thumbnail with Sharp (convert to WebP)
    const optimizedThumbnail = await sharp(thumbnailBuffer)
      .resize(800, 450, { // 16:9 aspect ratio
        fit: 'cover',
        position: 'center'
      })
      .webp({ quality: 80 })
      .toBuffer();

    // Cleanup temporary files
    try {
      unlinkSync(tempVideoPath);
      unlinkSync(tempThumbnailPath);
    } catch (cleanupError) {
      console.warn('Failed to cleanup temp files:', cleanupError);
    }

    return optimizedThumbnail;

  } catch (error) {
    // Cleanup on error
    try {
      unlinkSync(tempVideoPath);
      if (tempThumbnailPath) unlinkSync(tempThumbnailPath);
    } catch {
      // Ignore cleanup errors
    }

    throw new Error(`Thumbnail generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Check if FFmpeg is available on the system
 * @returns true if FFmpeg is installed and accessible
 */
export function checkFFmpegAvailability(): Promise<boolean> {
  return new Promise((resolve) => {
    ffmpeg.getAvailableFormats((err) => {
      if (err) {
        console.warn('FFmpeg not available:', err.message);
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}

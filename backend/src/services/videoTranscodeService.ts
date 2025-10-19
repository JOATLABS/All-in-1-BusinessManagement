import ffmpeg from 'fluent-ffmpeg';
import { createWriteStream } from 'fs';
import { unlink } from 'fs/promises';
import { randomUUID } from 'crypto';
import { tmpdir } from 'os';
import { join } from 'path';
import { readFile } from 'fs/promises';

export interface TranscodeResult {
  buffer: Buffer;
  mimetype: string;
  didTranscode: boolean;
}

const TRANSCODABLE_MIMES = new Set(['video/quicktime', 'video/x-m4v', 'video/mov']);

export const transcodeVideoToMp4 = async (videoBuffer: Buffer, inputMime: string): Promise<TranscodeResult> => {
  if (inputMime === 'video/mp4') {
    return { buffer: videoBuffer, mimetype: 'video/mp4', didTranscode: false };
  }

  if (!TRANSCODABLE_MIMES.has(inputMime)) {
    return { buffer: videoBuffer, mimetype: inputMime, didTranscode: false };
  }

  const tempInputPath = join(tmpdir(), `upload-${randomUUID()}`);
  const tempOutputPath = `${tempInputPath}.mp4`;

  await new Promise<void>((resolve, reject) => {
    const writeStream = createWriteStream(tempInputPath);
    writeStream.on('error', reject);
    writeStream.on('finish', resolve);
    writeStream.end(videoBuffer);
  });

  try {
    await new Promise<void>((resolve, reject) => {
      ffmpeg(tempInputPath)
        .outputOptions([
          '-c:v libx264',
          '-preset medium',
          '-profile:v high',
          '-crf 18',
          '-pix_fmt yuv420p',
          '-movflags +faststart',
          '-c:a aac',
          '-b:a 192k'
        ])
        .format('mp4')
        .on('end', () => resolve())
        .on('error', (error) => reject(error))
        .save(tempOutputPath);
    });

    const transcodedBuffer = await readFile(tempOutputPath);
    return { buffer: transcodedBuffer, mimetype: 'video/mp4', didTranscode: true };
  } finally {
    await Promise.all([
      unlink(tempInputPath).catch(() => undefined),
      unlink(tempOutputPath).catch(() => undefined)
    ]);
  }
};

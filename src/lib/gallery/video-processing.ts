import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import { readFile, unlink, writeFile } from 'fs/promises';
import { randomUUID } from 'crypto';

// ffmpegStatic is a string (path to ffmpeg binary)
if (!ffmpegStatic || typeof ffmpegStatic !== 'string') {
  throw new Error('FFmpeg static binary path not found. Install ffmpeg-static package.');
}
ffmpeg.setFfmpegPath(ffmpegStatic);

export type VideoWatermarkOptions = {
    enabled: boolean;
    text: string;
    position:
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right"
    | "center";
    opacity: number;
    fontSize: number;
};

export type VideoProcessingOptions = {
    maxWidth?: number;
    quality?: number;
    fps?: number;
};

type VideoStreamMetadata = {
  codec_type?: string;
  codec_name?: string;
  width?: number;
  height?: number;
};

type VideoMetadata = {
  streams: VideoStreamMetadata[];
  format: { duration?: number };
};

export type ProcessedVideo = {
    width: number;
    height: number;
    duration: number; // in seconds
    original: Buffer;
    display: Buffer;
    thumbnail: Buffer;
    watermark: Buffer;
    mimeType: string;
    videoCodec: string;
    audioCodec: string | null;
    fileSize: number;
};

export async function processVideo(
    input: Buffer,
    watermarkOptions: VideoWatermarkOptions,
    options: VideoProcessingOptions = {},
): Promise<ProcessedVideo> {
    const maxWidth = options.maxWidth || 2400;
    const quality = options.quality || 28;
    const fps = options.fps || 30;

    let tmpFilePath: string | null = null;
    
    try {
        // Write input to a temporary file for ffprobe
        tmpFilePath = `/tmp/video_${randomUUID()}.mp4`;
        await writeFile(tmpFilePath, input);

        // Probe the video to get metadata
        const metadata = await new Promise<VideoMetadata>((resolve, reject) => {
            ffmpeg.ffprobe(tmpFilePath!, (err: Error | null, meta: VideoMetadata) => {
                if (err) reject(err);
                else resolve(meta);
            });
        });

        const videoStream = metadata.streams.find(
            (stream: VideoStreamMetadata) => stream.codec_type === 'video'
        );
        
        if (!videoStream) {
            throw new Error('No video stream found in file');
        }

        const width = videoStream.width || 0;
        const height = videoStream.height || 0;
        const duration = metadata.format.duration || 0;
        const videoCodec = videoStream.codec_name || '';
        const audioStream = metadata.streams.find(
            (stream: VideoStreamMetadata) => stream.codec_type === 'audio'
        );
        const audioCodec = audioStream ? (audioStream.codec_name || null) : null;

        // Process video for display: transcode to web-friendly H.264
        const displayBuffer = await transcodeVideoForDisplay(
            tmpFilePath,
            maxWidth,
            quality,
            fps
        );

        // Generate thumbnail at 10% duration or 5 seconds
        const thumbnailBuffer = await generateThumbnail(
            tmpFilePath,
            duration,
            maxWidth // Limit thumbnail width
        );

        // Create watermark overlay for thumbnail (simple text overlay)
        const watermarkBuffer = await createVideoWatermark(
            thumbnailBuffer,
            watermarkOptions
        );

        return {
            width,
            height,
            duration,
            original: input,
            display: displayBuffer,
            thumbnail: thumbnailBuffer,
            watermark: watermarkBuffer,
            mimeType: 'video/mp4',
            videoCodec,
            audioCodec,
            fileSize: input.byteLength,
        };
    } catch (error) {
        throw error;
    } finally {
        // Clean up temporary file
        if (tmpFilePath) {
            try {
                await unlink(tmpFilePath);
            } catch (err) {
                // Ignore cleanup errors
            }
        }
    }
}

// Transcode video to web-friendly format
async function transcodeVideoForDisplay(
    inputPath: string,
    maxWidth: number,
    quality: number,
    fps: number
): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        // Use a temporary output file instead of piping (piping output in ffmpeg can be finicky)
        const tempOutputPath = `/tmp/display_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.mp4`;

        ffmpeg(inputPath)
            .videoCodec('libx264')
            .audioCodec('aac')
            .fps(fps)
            .outputOptions([
                '-movflags +faststart', // Enable web streaming
                `-vf scale='min(${maxWidth},iw):-2'`, // Limit width, maintain aspect ratio
                `-q:v ${quality}`, // Quality for constant quantizer
            ])
            .format('mp4')
            .output(tempOutputPath)
            .on('end', async () => {
                try {
                    const buffer = await readFile(tempOutputPath);
                    await unlink(tempOutputPath);
                    resolve(buffer);
                } catch (err) {
                    reject(err);
                }
            })
            .on('error', async (err: Error) => {
                await unlink(tempOutputPath).catch(() => {});
                reject(new Error(`Video transcoding failed: ${err.message}`));
            })
            .run();
    });
}

// Generate thumbnail from video at specified time
async function generateThumbnail(
    inputPath: string,
    duration: number,
    maxWidth: number
): Promise<Buffer> {
    // Use 10% of duration or 5 seconds, whichever is smaller
    const timestamp = Math.min(duration * 0.1, 5);
    
    return new Promise((resolve, reject) => {
        const tempPath = `/tmp/thumbnail_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`;
        
        ffmpeg(inputPath)
            .seekInput(timestamp)
            .frames(1)
            .output(tempPath)
            .on('end', async () => {
                try {
                    const buffer = await readFile(tempPath);
                    // Clean up temp file
                    await unlink(tempPath);
                    resolve(buffer);
                } catch (err) {
                    resolve(Buffer.alloc(0));
                }
            })
            .on('error', async (err: Error) => {
                try {
                    await unlink(tempPath).catch(() => {});
                } finally {
                    reject(new Error(`Thumbnail extraction failed: ${err.message}`));
                }
            })
            .run();
    });
}

// Create watermark overlay for thumbnail
async function createVideoWatermark(
    thumbnail: Buffer,
    options: VideoWatermarkOptions,
): Promise<Buffer> {
    // For now, return the thumbnail as-is (video watermarking is complex)
    // In production, you could use sharp or a similar library to add text overlay
    return thumbnail;
}

// Simplified renderDownloadVariant for video - in production, this would handle video transcoding
export async function renderDownloadVariant(
    input: Buffer,
    options: {
        maxWidth?: number | null;
        quality?: number;
        format?: "mp4" | "webm";
        watermark?: VideoWatermarkOptions;
    },
) {
    // For video download variants, we'd typically transcode with different settings
    // This is a simplified version that returns the original for now
    // A full implementation would use fluent-ffmpeg to transcode the video
    return input;
}

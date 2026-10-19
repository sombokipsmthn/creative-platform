import sharp from "sharp";

export type WatermarkOptions = {
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

export type ProcessedImage = {
    width: number;
    height: number;
    original: Buffer;
    display: Buffer;
    thumbnail: Buffer;
    watermark: Buffer;
    mimeType: string;
};

function escapeXml(value: string) {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&apos;");
}

function watermarkPosition(
    position: WatermarkOptions["position"],
    width: number,
    height: number,
    textWidth: number,
    textHeight: number,
) {
    const padding = Math.max(
        24,
        Math.round(width * 0.025),
    );

    switch (position) {
        case "top-left":
            return {
                x: padding,
                y: padding + textHeight,
            };

        case "top-right":
            return {
                x: Math.max(
                    padding,
                    width - padding - textWidth,
                ),
                y: padding + textHeight,
            };

        case "bottom-left":
            return {
                x: padding,
                y: height - padding,
            };

        case "center":
            return {
                x: Math.max(
                    0,
                    (width - textWidth) / 2,
                ),
                y: Math.max(
                    textHeight,
                    (height + textHeight) / 2,
                ),
            };

        case "bottom-right":
        default:
            return {
                x: Math.max(
                    padding,
                    width - padding - textWidth,
                ),
                y: height - padding,
            };
    }
}

async function createWatermarkOverlay(
    width: number,
    height: number,
    options: WatermarkOptions,
) {
    const fontSize = Math.max(
        12,
        Math.min(160, options.fontSize),
    );

    const text = escapeXml(
        options.text || "KIPSMTHN",
    );

    const textWidth = Math.max(
        fontSize * 3,
        text.length * fontSize * 0.58,
    );

    const textHeight = fontSize;

    const { x, y } = watermarkPosition(
        options.position,
        width,
        height,
        textWidth,
        textHeight,
    );

    const opacity =
        Math.max(
            0,
            Math.min(100, options.opacity),
        ) / 100;

    return Buffer.from(`
    <svg
      width="${width}"
      height="${height}"
      xmlns="http://www.w3.org/2000/svg"
    >
      <text
        x="${x}"
        y="${y}"
        fill="white"
        fill-opacity="${opacity}"
        font-family="Arial, Helvetica, sans-serif"
        font-size="${fontSize}px"
        font-weight="600"
        letter-spacing="2px"
      >${text}</text>
    </svg>
  `);
}

export async function processImage(
    input: Buffer,
    watermarkOptions: WatermarkOptions,
): Promise<ProcessedImage> {
    const source = sharp(input, {
        failOn: "none",
    }).rotate();

    const metadata = await source.metadata();

    const width = metadata.width || 0;
    const height = metadata.height || 0;

    const display = await source
        .clone()
        .resize({
            width: 2400,
            height: 2400,
            fit: "inside",
            withoutEnlargement: true,
        })
        .jpeg({
            quality: 88,
            mozjpeg: true,
        })
        .toBuffer();

    const thumbnail = await source
        .clone()
        .resize({
            width: 700,
            height: 700,
            fit: "cover",
            position: "centre",
        })
        .jpeg({
            quality: 82,
            mozjpeg: true,
        })
        .toBuffer();

    let watermark = display;

    if (
        watermarkOptions.enabled &&
        watermarkOptions.text.trim()
    ) {
        const displayMeta = await sharp(
            display,
        ).metadata();

        const watermarkWidth =
            displayMeta.width || 2400;

        const watermarkHeight =
            displayMeta.height || 2400;

        const overlay =
            await createWatermarkOverlay(
                watermarkWidth,
                watermarkHeight,
                watermarkOptions,
            );

        watermark = await sharp(display)
            .composite([
                {
                    input: overlay,
                    blend: "over",
                },
            ])
            .jpeg({
                quality: 88,
                mozjpeg: true,
            })
            .toBuffer();
    }

    return {
        width,
        height,
        original: input,
        display,
        thumbnail,
        watermark,
        mimeType: "image/jpeg",
    };
}

export async function renderDownloadVariant(
    input: Buffer,
    options: {
        maxWidth?: number | null;
        quality?: number;
        format?: "jpg" | "webp" | "png";
        watermark?: WatermarkOptions;
    },
) {
    /*
     * First build the resized image.
     *
     * This is important because watermark placement must use
     * the dimensions of the final output rather than the
     * dimensions of the original source.
     */
    let image = sharp(input, {
        failOn: "none",
    }).rotate();

    if (options.maxWidth) {
        image = image.resize({
            width: Math.max(
                320,
                Math.min(
                    options.maxWidth,
                    8000,
                ),
            ),
            withoutEnlargement: true,
            fit: "inside",
        });
    }

    /*
     * Materialise the resized image before compositing
     * the watermark so Sharp has the correct dimensions.
     */
    if (
        options.watermark?.enabled &&
        options.watermark.text.trim()
    ) {
        const resizedBuffer =
            await image.toBuffer();

        const resizedMeta =
            await sharp(
                resizedBuffer,
            ).metadata();

        const width =
            resizedMeta.width || 2400;

        const height =
            resizedMeta.height || 1600;

        const overlay =
            await createWatermarkOverlay(
                width,
                height,
                options.watermark,
            );

        image = sharp(resizedBuffer).composite([
            {
                input: overlay,
                blend: "over",
            },
        ]);
    }

    const quality = Math.max(
        40,
        Math.min(
            options.quality || 90,
            100,
        ),
    );

    switch (options.format || "jpg") {
        case "png":
            return image
                .png({
                    compressionLevel: 8,
                })
                .toBuffer();

        case "webp":
            return image
                .webp({
                    quality,
                })
                .toBuffer();

        case "jpg":
        default:
            return image
                .jpeg({
                    quality,
                    mozjpeg: true,
                })
                .toBuffer();
    }
}
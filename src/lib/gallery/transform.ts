type DataRecord = Record<string, unknown>;

function asRecord(value: unknown): DataRecord {
  return value && typeof value === "object" ? value as DataRecord : {};
}

function read(record: DataRecord, camelCase: string, snakeCase?: string): unknown {
  if (record[camelCase] !== undefined && record[camelCase] !== null) {
    return record[camelCase];
  }

  if (snakeCase && record[snakeCase] !== undefined && record[snakeCase] !== null) {
    return record[snakeCase];
  }

  return undefined;
}

function stringValue(value: unknown, fallback = ""): string {
  return value === undefined || value === null ? fallback : String(value);
}

function nullableString(value: unknown): string | null {
  return value === undefined || value === null || value === "" ? null : String(value);
}

function numberValue(value: unknown, fallback = 0): number {
  if (value === undefined || value === null || value === "") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function nullableNumber(value: unknown): number | null {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function booleanValue(value: unknown, fallback = false): boolean {
  return value === undefined || value === null ? fallback : Boolean(value);
}

function dateValue(value: unknown): Date {
  if (!value) return new Date();
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

export function transformGalleryResponse(raw: Record<string, unknown>) {
  const gallery = asRecord(raw.gallery);
  const photos = Array.isArray(raw.photos) ? raw.photos : [];
  const collections = Array.isArray(raw.collections) ? raw.collections : [];
  const approval = raw.approval ? asRecord(raw.approval) : null;
  const presets = Array.isArray(raw.presets) ? raw.presets : [];
  const watermark = raw.watermark ? asRecord(raw.watermark) : null;

  return {
    gallery: {
      id: stringValue(gallery.id),
      title: stringValue(gallery.title),
      description: stringValue(gallery.description),
      category: stringValue(gallery.category),
      slug: stringValue(gallery.slug),
      status: stringValue(gallery.status, "draft"),
      portfolioPublishMode: stringValue(read(gallery, "portfolioPublishMode", "portfolio_publish_mode"), "none"),
      allowDownloads: booleanValue(read(gallery, "allowDownloads", "allow_downloads"), true),
      allowFavorites: booleanValue(read(gallery, "allowFavorites", "allow_favorites"), true),
      allowSelections: booleanValue(read(gallery, "allowSelections", "allow_selections"), true),
      coverPhotoId: stringValue(read(gallery, "coverPhotoId", "cover_photo_id")),
      coverUrl: stringValue(read(gallery, "coverUrl", "cover_url")),
      focal_point: (read(gallery, "focalPoint", "focal_point") as Record<string, number> | undefined),
      createdAt: dateValue(read(gallery, "createdAt", "created_at")),
      updatedAt: dateValue(read(gallery, "updatedAt", "updated_at")),
    } as Record<string, unknown>,

    photos: photos.map((photo) => {
      const p = asRecord(photo);

      return {
        id: stringValue(p.id),
        galleryId: stringValue(read(p, "galleryId", "gallery_id")),
        collectionId: nullableString(read(p, "collectionId", "collection_id")),
        filename: stringValue(p.filename, "Untitled media"),
        originalUrl: stringValue(read(p, "originalUrl", "original_url")),
        displayUrl: stringValue(read(p, "displayUrl", "display_url")),
        thumbnailUrl: stringValue(read(p, "thumbnailUrl", "thumbnail_url")),
        storagePath: stringValue(read(p, "storagePath", "storage_path")),
        originalPath: nullableString(read(p, "originalPath", "original_path")),
        displayPath: nullableString(read(p, "displayPath", "display_path")),
        thumbnailPath: nullableString(read(p, "thumbnailPath", "thumbnail_path")),
        mimeType: stringValue(read(p, "mimeType", "mime_type"), "application/octet-stream"),
        fileSize: numberValue(read(p, "fileSize", "file_size")),
        width: nullableNumber(p.width),
        height: nullableNumber(p.height),
        duration: nullableNumber(p.duration),
        videoCodec: nullableString(read(p, "videoCodec", "video_codec")),
        audioCodec: nullableString(read(p, "audioCodec", "audio_codec")),
        captureDate: read(p, "captureDate", "capture_date")
          ? dateValue(read(p, "captureDate", "capture_date"))
          : undefined,
        sortOrder: numberValue(read(p, "sortOrder", "sort_order")),
        isHidden: booleanValue(read(p, "isHidden", "is_hidden")),
        portfolioSelection: stringValue(read(p, "portfolioSelection", "portfolio_selection"), "inherit"),
        isFavorite: booleanValue(read(p, "isFavorite", "is_favorite")),
        isSelected: booleanValue(read(p, "isSelected", "is_selected")),
        downloadCount: numberValue(read(p, "downloadCount", "download_count")),
        altText: nullableString(read(p, "altText", "alt_text")),
        caption: nullableString(p.caption),
        isCover: booleanValue(read(p, "isCover", "is_cover")),
        collectionTitle: nullableString(read(p, "collectionTitle", "collection_title")),
        createdAt: dateValue(read(p, "createdAt", "created_at")),
        updatedAt: dateValue(read(p, "updatedAt", "updated_at")),
      };
    }),

    collections: collections.map((collection) => {
      const c = asRecord(collection);

      return {
        id: stringValue(c.id),
        galleryId: stringValue(read(c, "galleryId", "gallery_id")),
        title: stringValue(c.title),
        description: stringValue(c.description),
        portfolioSelection: stringValue(read(c, "portfolioSelection", "portfolio_selection"), "inherit"),
        clientVisibility: stringValue(read(c, "clientVisibility", "client_visibility"), "all"),
        photoCount: numberValue(read(c, "photoCount", "photo_count")),
        sortOrder: numberValue(read(c, "sortOrder", "sort_order")),
        createdAt: dateValue(read(c, "createdAt", "created_at")),
        updatedAt: dateValue(read(c, "updatedAt", "updated_at")),
      };
    }),

    approval: approval
      ? {
          id: stringValue(approval.id),
          galleryId: stringValue(read(approval, "galleryId", "gallery_id")),
          clientId: stringValue(read(approval, "clientId", "client_id")),
          status: stringValue(approval.status),
          requestedAt: read(approval, "requestedAt", "requested_at")
            ? dateValue(read(approval, "requestedAt", "requested_at"))
            : undefined,
          respondedAt: read(approval, "respondedAt", "responded_at")
            ? dateValue(read(approval, "respondedAt", "responded_at"))
            : undefined,
          responseNote: stringValue(read(approval, "responseNote", "response_note")),
          createdAt: dateValue(read(approval, "createdAt", "created_at")),
          updatedAt: dateValue(read(approval, "updatedAt", "updated_at")),
        }
      : null,

    presets: presets.map((preset) => {
      const p = asRecord(preset);

      return {
        id: stringValue(p.id),
        galleryId: stringValue(read(p, "galleryId", "gallery_id")),
        name: stringValue(p.name),
        variant: stringValue(p.variant),
        maxWidth: nullableNumber(read(p, "maxWidth", "max_width")),
        quality: numberValue(p.quality),
        format: stringValue(p.format),
        includeWatermark: booleanValue(read(p, "includeWatermark", "include_watermark")),
        createdAt: dateValue(read(p, "createdAt", "created_at")),
        updatedAt: dateValue(read(p, "updatedAt", "updated_at")),
      };
    }),

    watermark: watermark
      ? {
          id: stringValue(watermark.id),
          galleryId: stringValue(read(watermark, "galleryId", "gallery_id")),
          enabled: booleanValue(watermark.enabled),
          text: stringValue(watermark.text),
          position: stringValue(watermark.position),
          opacity: numberValue(watermark.opacity),
          fontSize: numberValue(read(watermark, "fontSize", "font_size")),
          imagePath: nullableString(read(watermark, "imagePath", "image_path")),
          createdAt: dateValue(read(watermark, "createdAt", "created_at")),
          updatedAt: dateValue(read(watermark, "updatedAt", "updated_at")),
        }
      : null,
  };
}

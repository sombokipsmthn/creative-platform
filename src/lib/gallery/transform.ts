export function transformGalleryResponse(raw: Record<string, unknown>) {
  const gallery = raw.gallery as Record<string, unknown> | null | undefined;
  const photos = raw.photos as unknown[] | null | undefined;
  const collections = raw.collections as unknown[] | null | undefined;
  const approval = raw.approval as Record<string, unknown> | null | undefined;
  const presets = raw.presets as unknown[] | null | undefined;
  const watermark = raw.watermark as Record<string, unknown> | null | undefined;

  return {
    gallery: {
      id: String((gallery || {})?.id || ""),
      title: String((gallery || {})?.title || ""),
      description: String((gallery || {})?.description || ""),
      category: String((gallery || {})?.category || ""),
      slug: String((gallery || {})?.slug || ""),
      status: String((gallery || {})?.status || "draft"),
      allowDownloads: Boolean((gallery || {})?.allow_downloads ?? true),
      allowFavorites: Boolean((gallery || {})?.allow_favorites ?? true),
      allowSelections: Boolean((gallery || {})?.allow_selections ?? true),
      coverPhotoId: String((gallery || {})?.cover_photo_id || ""),
      focal_point: (gallery || {})?.focal_point as Record<string, number> | undefined,
      createdAt: (gallery || {})?.created_at ? new Date((gallery || {})?.created_at as string) : new Date(),
      updatedAt: (gallery || {})?.updated_at ? new Date((gallery || {})?.updated_at as string) : new Date(),
    } as Record<string, unknown>,
    photos: (photos || []).map((photo) => {
      const p = photo as Record<string, unknown>;
      return {
        id: String(p.id),
        galleryId: String(p.gallery_id),
        collectionId: p.collection_id ? String(p.collection_id) : null,
        filename: String(p.filename),
        originalUrl: String(p.original_url),
        displayUrl: String(p.display_url),
        thumbnailUrl: String(p.thumbnail_url),
        storagePath: String(p.storage_path),
        mimeType: String(p.mime_type),
        fileSize: Number(p.file_size),
        width: p.width ? Number(p.width) : null,
        height: p.height ? Number(p.height) : null,
        duration: p.duration ? Number(p.duration) : null,
        videoCodec: p.video_codec ? String(p.video_codec) : null,
        audioCodec: p.audio_codec ? String(p.audio_codec) : null,
        captureDate: p.capture_date ? new Date(p.capture_date as string) : undefined,
        sortOrder: Number(p.sort_order),
        isHidden: Boolean(p.is_hidden),
        isFavorite: Boolean(p.is_favorite),
        isSelected: Boolean(p.is_selected),
        downloadCount: Number(p.download_count),
        createdAt: p.created_at ? new Date(p.created_at as string) : new Date(),
        updatedAt: p.updated_at ? new Date(p.updated_at as string) : new Date(),
      };
    }),
    collections: (collections || []).map((collection) => {
      const c = collection as Record<string, unknown>;
      return {
        id: String(c.id),
        galleryId: String(c.gallery_id),
        title: String(c.title),
        description: String(c.description || ""),
        sortOrder: Number(c.sort_order),
        createdAt: c.created_at ? new Date(c.created_at as string) : new Date(),
        updatedAt: c.updated_at ? new Date(c.updated_at as string) : new Date(),
      };
    }),
    approval: approval
      ? {
          id: String(approval.id),
          galleryId: String(approval.gallery_id),
          clientId: String(approval.client_id || ""),
          status: String(approval.status),
          requestedAt: approval.requested_at ? new Date(approval.requested_at as string) : undefined,
          respondedAt: approval.responded_at ? new Date(approval.responded_at as string) : undefined,
          responseNote: String(approval.response_note || ""),
          createdAt: approval.created_at ? new Date(approval.created_at as string) : new Date(),
          updatedAt: approval.updated_at ? new Date(approval.updated_at as string) : new Date(),
        }
      : null,
    presets: (presets || []).map((preset) => {
      const p = preset as Record<string, unknown>;
      return {
        id: String(p.id),
        galleryId: String(p.gallery_id),
        name: String(p.name),
        variant: String(p.variant),
        maxWidth: p.max_width ? Number(p.max_width) : null,
        quality: Number(p.quality),
        format: String(p.format),
        includeWatermark: Boolean(p.include_watermark),
        createdAt: p.created_at ? new Date(p.created_at as string) : new Date(),
        updatedAt: p.updated_at ? new Date(p.updated_at as string) : new Date(),
      };
    }),
    watermark: watermark
      ? {
          id: String(watermark.id),
          galleryId: String(watermark.gallery_id),
          enabled: Boolean(watermark.enabled),
          text: String(watermark.text),
          position: String(watermark.position),
          opacity: Number(watermark.opacity),
          fontSize: Number(watermark.font_size),
          createdAt: watermark.created_at ? new Date(watermark.created_at as string) : new Date(),
          updatedAt: watermark.updated_at ? new Date(watermark.updated_at as string) : new Date(),
        }
      : null,
  };
}

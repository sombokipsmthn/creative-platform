/**
 * Transform snake_case database objects to camelCase for the frontend.
 * This handles the conversion between PostgreSQL column names and TypeScript interfaces.
 */

export function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, char) => char.toUpperCase());
}

type JsonObject = Record<string, unknown>;

function transformValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(transformValue);
  }
  if (value !== null && typeof value === 'object') {
    return transformKeys(value as JsonObject);
  }
  return value;
}

export function transformKeys(obj: JsonObject): JsonObject {
  return Object.entries(obj).reduce<JsonObject>((acc, [key, value]) => {
    const camelKey = toCamelCase(key);
    acc[camelKey] = transformValue(value);
    return acc;
  }, {});
}

/**
 * Transform API gallery response to component format
 */
export function transformGalleryResponse(data: JsonObject) {
  return {
    gallery: transformKeys((data.gallery ?? {}) as JsonObject),
    collections: Array.isArray(data.collections)
      ? data.collections.map((item) => transformKeys(item as JsonObject))
      : [],
    photos: Array.isArray(data.photos)
      ? data.photos.map((item) => transformKeys(item as JsonObject))
      : [],
    approval: data.approval ? transformKeys(data.approval as JsonObject) : null,
    presets: Array.isArray(data.presets)
      ? data.presets.map((item) => transformKeys(item as JsonObject))
      : [],
    watermark: data.watermark ? transformKeys(data.watermark as JsonObject) : null,
  };
}

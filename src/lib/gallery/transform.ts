/**
 * Transform snake_case database objects to camelCase for the frontend.
 * This handles the conversion between PostgreSQL column names and TypeScript interfaces.
 */

export function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, char) => char.toUpperCase());
}

export function transformKeys<T extends Record<string, any>>(
  obj: T
): Record<string, any> {
  if (Array.isArray(obj)) {
    return obj.map(transformKeys) as any;
  }

  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  return Object.entries(obj).reduce((acc, [key, value]) => {
    const camelKey = toCamelCase(key);
    acc[camelKey] = Array.isArray(value) ? value.map(transformKeys) : 
                     (value !== null && typeof value === 'object') ? transformKeys(value) :
                     value;
    return acc;
  }, {} as Record<string, any>);
}

/**
 * Transform API gallery response to component format
 */
export function transformGalleryResponse(data: any) {
  return {
    gallery: transformKeys(data.gallery),
    collections: Array.isArray(data.collections) ? data.collections.map(transformKeys) : [],
    photos: Array.isArray(data.photos) ? data.photos.map(transformKeys) : [],
    approval: data.approval ? transformKeys(data.approval) : null,
    presets: Array.isArray(data.presets) ? data.presets.map(transformKeys) : [],
    watermark: data.watermark ? transformKeys(data.watermark) : null,
  };
}

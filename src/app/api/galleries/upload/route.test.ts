import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isPathSafe, sanitizeFilename, validateMimeTypeByExtension } from './route';

describe('Upload Security', () => {
  describe('isPathSafe', () => {
    it('should allow normal paths', () => {
      expect(isPathSafe('galleries/123/photo.jpg')).toBe(true);
      expect(isPathSafe('galleries/abc/image.png')).toBe(true);
    });

    it('should block path traversal', () => {
      expect(isPathSafe('../etc/passwd')).toBe(false);
      expect(isPathSafe('galleries/../secret')).toBe(false);
      expect(isPathSafe('galleries/123/../../admin')).toBe(false);
    });

    it('should block paths starting with /', () => {
      expect(isPathSafe('/etc/passwd')).toBe(false);
      expect(isPathSafe('/galleries/123')).toBe(false);
    });

    it('should block paths with spaces', () => {
      expect(isPathSafe('gallery photo.jpg')).toBe(false);
      expect(isPathSafe('galleries/123/my photo.jpg')).toBe(false);
    });
  });

  describe('sanitizeFilename', () => {
    it('should remove dangerous characters', () => {
      expect(sanitizeFilename('photo.jpg')).toBe('photo.jpg');
      expect(sanitizeFilename('my photo.jpg')).toBe('my photo.jpg');
      expect(sanitizeFilename('file<name>.jpg')).toBe('file_name_.jpg');
    });

    it('should remove empty segments', () => {
      expect(sanitizeFilename('..hidden.jpg')).toBe('hidden.jpg');
    });

    it('should limit length', () => {
      const longName = 'a'.repeat(300) + '.jpg';
      expect(sanitizeFilename(longName)).toHaveLength(200);
    });

    it('should handle empty filename', () => {
      expect(sanitizeFilename('')).toBe('media');
      expect(sanitizeFilename('...')).toBe('media');
    });
  });

  describe('validateMimeTypeByExtension', () => {
    it('should allow matching MIME types', () => {
      expect(validateMimeTypeByExtension('photo.jpg', 'image/jpeg')).toBe(true);
      expect(validateMimeTypeByExtension('image.png', 'image/png')).toBe(true);
      expect(validateMimeTypeByExtension('video.mp4', 'video/mp4')).toBe(true);
    });

    it('should reject mismatched MIME types', () => {
      expect(validateMimeTypeByExtension('photo.jpg', 'image/png')).toBe(false);
      expect(validateMimeTypeByExtension('image.png', 'video/mp4')).toBe(false);
    });

    it('should reject unknown extensions', () => {
      expect(validateMimeTypeByExtension('file.exe', 'application/octet-stream')).toBe(false);
      expect(validateMimeTypeByExtension('file.txt', 'text/plain')).toBe(false);
    });

    it('should be case-insensitive', () => {
      expect(validateMimeTypeByExtension('photo.JPG', 'image/jpeg')).toBe(true);
      expect(validateMimeTypeByExtension('VIDEO.MP4', 'video/mp4')).toBe(true);
    });
  });
});

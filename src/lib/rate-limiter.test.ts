import { describe, it, expect, beforeEach } from 'vitest';
import { createRateLimiter } from './rate-limiter';

describe('RateLimiter', () => {
  let limiter: ReturnType<typeof createRateLimiter>;

  beforeEach(() => {
    limiter = createRateLimiter({ windowMs: 1000, maxRequests: 3 });
  });

  it('should allow requests within limit', () => {
    expect(limiter.isAllowed('user1')).toBe(true);
    expect(limiter.isAllowed('user1')).toBe(true);
    expect(limiter.isAllowed('user1')).toBe(true);
  });

  it('should block requests over limit', () => {
    limiter.isAllowed('user1');
    limiter.isAllowed('user1');
    limiter.isAllowed('user1');
    expect(limiter.isAllowed('user1')).toBe(false);
  });

  it('should allow different users independently', () => {
    limiter.isAllowed('user1');
    limiter.isAllowed('user1');
    limiter.isAllowed('user1');
    expect(limiter.isAllowed('user1')).toBe(false);
    expect(limiter.isAllowed('user2')).toBe(true);
  });

  it('should get correct remaining count', () => {
    limiter.isAllowed('user1');
    expect(limiter.getRemaining('user1')).toBe(2);
    limiter.isAllowed('user1');
    expect(limiter.getRemaining('user1')).toBe(1);
  });

  it('should expire old requests after window', async () => {
    limiter.isAllowed('user1');
    limiter.isAllowed('user1');
    limiter.isAllowed('user1');
    expect(limiter.isAllowed('user1')).toBe(false);

    // Wait for window to pass
    await new Promise(resolve => setTimeout(resolve, 1100));

    expect(limiter.isAllowed('user1')).toBe(true);
  });

  it('should cleanup old entries', async () => {
    limiter.isAllowed('user1');
    limiter.isAllowed('user1');
    limiter.isAllowed('user2');
    expect(limiter.getRemaining('user1')).toBe(1);
    expect(limiter.getRemaining('user2')).toBe(2);

    // Wait for window to pass so entries become stale
    await new Promise(resolve => setTimeout(resolve, 1100));

    limiter.cleanup();
    // After cleanup, stale entries should be removed
    expect(limiter.getRemaining('user1')).toBe(3);
    expect(limiter.getRemaining('user2')).toBe(3);
  });

  it('should return retry-after seconds', () => {
    limiter.isAllowed('user1');
    limiter.isAllowed('user1');
    limiter.isAllowed('user1');
    const retryAfter = limiter.getRetryAfter('user1');
    expect(retryAfter).toBeGreaterThan(0);
    expect(retryAfter).toBeLessThanOrEqual(1);
  });

  it('should handle default configuration', () => {
    const defaultLimiter = createRateLimiter();
    expect(defaultLimiter.getRemaining('user1')).toBe(20);
  });
});

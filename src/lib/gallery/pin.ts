import bcrypt from 'bcryptjs';

/**
 * Hashes a PIN for secure storage.
 * Returns null if pin is empty/undefined.
 */
export async function hashPin(pin: string): Promise<string | null> {
  if (!pin || pin.trim().length === 0) {
    return null;
  }
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(pin, salt);
}

/**
 * Compares a plaintext PIN with a hashed PIN.
 * Returns false if hash is null (no PIN set).
 */
export async function comparePin(pin: string, hash: string | null): Promise<boolean> {
  if (!hash) {
    // No PIN configured - gallery is open access
    return true;
  }
  try {
    return await bcrypt.compare(pin, hash);
  } catch {
    return false;
  }
}

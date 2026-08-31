import bcrypt from 'bcryptjs';

/**
 * Hashes a PIN for secure storage.
 */
export async function hashPin(pin: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(pin, salt);
}

/**
 * Compares a plaintext PIN with a hashed PIN.
 */
export async function comparePin(pin: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pin, hash);
}

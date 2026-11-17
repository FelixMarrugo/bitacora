import { randomBytes, scrypt, timingSafeEqual } from 'crypto';

function deriveKey(password: string, salt: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, 64, (error, key) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(key);
    });
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const key = await deriveKey(password, salt);
  return `${salt}:${key.toString('hex')}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [salt, encodedKey] = storedHash.split(':');
  if (!salt || !encodedKey) {
    return false;
  }

  const expectedKey = Buffer.from(encodedKey, 'hex');
  const actualKey = await deriveKey(password, salt);
  return expectedKey.length === actualKey.length && timingSafeEqual(expectedKey, actualKey);
}

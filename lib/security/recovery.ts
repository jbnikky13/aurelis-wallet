import { hexToBytes, bytesToHex } from 'viem';

const PBKDF2_ITERATIONS = 310_000;
const SALT_BYTES = 16;
const IV_BYTES = 12;

function requireCrypto() {
  if (typeof crypto === 'undefined' || !crypto.subtle) throw new Error('Web Crypto API is unavailable.');
  return crypto;
}

function randomBytes(length: number) {
  const bytes = new Uint8Array(length);
  requireCrypto().getRandomValues(bytes);
  return bytes;
}

async function deriveKey(password: string, salt: Uint8Array) {
  if (password.length < 12) throw new Error('Recovery password must contain at least 12 characters.');
  const c = requireCrypto();
  const material = await c.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
  return c.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

export type EncryptedRecovery = {
  version: 1;
  algorithm: 'AES-GCM';
  kdf: 'PBKDF2-SHA256';
  iterations: number;
  salt: string;
  iv: string;
  ciphertext: string;
};

export async function encryptRecoverySecret(secret: string, password: string): Promise<EncryptedRecovery> {
  if (!secret) throw new Error('Recovery secret cannot be empty.');
  const salt = randomBytes(SALT_BYTES);
  const iv = randomBytes(IV_BYTES);
  const key = await deriveKey(password, salt);
  const encrypted = await requireCrypto().subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(secret),
  );
  return {
    version: 1,
    algorithm: 'AES-GCM',
    kdf: 'PBKDF2-SHA256',
    iterations: PBKDF2_ITERATIONS,
    salt: bytesToHex(salt),
    iv: bytesToHex(iv),
    ciphertext: bytesToHex(new Uint8Array(encrypted)),
  };
}

export async function decryptRecoverySecret(payload: EncryptedRecovery, password: string) {
  if (payload.version !== 1 || payload.algorithm !== 'AES-GCM' || payload.kdf !== 'PBKDF2-SHA256') {
    throw new Error('Unsupported recovery backup format.');
  }
  if (payload.iterations !== PBKDF2_ITERATIONS) throw new Error('Unsupported recovery KDF settings.');
  const key = await deriveKey(password, hexToBytes(payload.salt));
  try {
    const plaintext = await requireCrypto().subtle.decrypt(
      { name: 'AES-GCM', iv: hexToBytes(payload.iv) },
      key,
      hexToBytes(payload.ciphertext),
    );
    return new TextDecoder().decode(plaintext);
  } catch {
    throw new Error('Unable to decrypt recovery backup. Check the password or backup data.');
  }
}

export function validateRecoverySecret(secret: string) {
  if (secret.length < 12) throw new Error('Recovery secret is too short.');
  return secret;
}

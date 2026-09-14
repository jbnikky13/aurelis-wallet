import { hexToBytes, bytesToHex } from 'viem';

const PBKDF2_ITERATIONS = 310_000;
const SALT_BYTES = 16;
const IV_BYTES = 12;

type WebCryptoBytes = Uint8Array<ArrayBuffer>;
type HexString = `0x${string}`;

function requireCrypto() {
  if (typeof crypto === 'undefined' || !crypto.subtle) throw new Error('Web Crypto API is unavailable.');
  return crypto;
}

function randomBytes(length: number): WebCryptoBytes {
  const bytes = new Uint8Array(new ArrayBuffer(length));
  requireCrypto().getRandomValues(bytes);
  return bytes;
}

function toWebCryptoBytes(bytes: Uint8Array): WebCryptoBytes {
  const copy = new Uint8Array(new ArrayBuffer(bytes.byteLength));
  copy.set(bytes);
  return copy;
}

function decodeHex(value: string): WebCryptoBytes {
  if (!/^0x[0-9a-fA-F]*$/.test(value) || value.length % 2 !== 0) {
    throw new Error('Invalid recovery backup encoding.');
  }
  return toWebCryptoBytes(hexToBytes(value as HexString));
}

async function deriveKey(password: string, salt: Uint8Array) {
  if (password.length < 12) throw new Error('Recovery password must contain at least 12 characters.');
  const c = requireCrypto();
  const passwordBytes = new TextEncoder().encode(password);
  const material = await c.subtle.importKey('raw', toWebCryptoBytes(passwordBytes), 'PBKDF2', false, ['deriveKey']);
  return c.subtle.deriveKey(
    { name: 'PBKDF2', salt: toWebCryptoBytes(salt), iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
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
    toWebCryptoBytes(new TextEncoder().encode(secret)),
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

  let key: CryptoKey;
  try {
    const salt = decodeHex(payload.salt);
    const iv = decodeHex(payload.iv);
    const ciphertext = decodeHex(payload.ciphertext);
    if (salt.byteLength !== SALT_BYTES || iv.byteLength !== IV_BYTES || ciphertext.byteLength === 0) {
      throw new Error('Invalid recovery backup encoding.');
    }
    key = await deriveKey(password, salt);
    const plaintext = await requireCrypto().subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext,
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

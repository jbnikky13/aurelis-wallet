import { mnemonicToAccount, privateKeyToAccount } from 'viem/accounts';

const STORAGE_KEY = 'aurelis.encrypted.wallet.v1';

function bytesToBase64(bytes: Uint8Array) {
  let binary = '';
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

function base64ToBytes(value: string) {
  const binary = atob(value);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

// Keep WebCrypto inputs backed by a real ArrayBuffer. Newer TypeScript DOM
// definitions distinguish ArrayBuffer from the broader ArrayBufferLike type.
function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.slice().buffer as ArrayBuffer;
}

async function deriveKey(password: string, salt: Uint8Array) {
  const passwordBytes = new TextEncoder().encode(password);
  const material = await crypto.subtle.importKey(
    'raw',
    toArrayBuffer(passwordBytes),
    'PBKDF2',
    false,
    ['deriveKey'],
  );

  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: toArrayBuffer(salt), iterations: 210_000, hash: 'SHA-256' },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

export async function encryptWallet(secret: string, password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  const secretBytes = new TextEncoder().encode(secret);
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: toArrayBuffer(iv) },
    key,
    toArrayBuffer(secretBytes),
  );

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      version: 1,
      salt: bytesToBase64(salt),
      iv: bytesToBase64(iv),
      data: bytesToBase64(new Uint8Array(ciphertext)),
    }),
  );
}

export async function decryptWallet(password: string) {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) throw new Error('No encrypted AURELIS wallet found on this device.');

  const payload = JSON.parse(stored);
  const iv = base64ToBytes(payload.iv);
  const data = base64ToBytes(payload.data);
  const key = await deriveKey(password, base64ToBytes(payload.salt));
  let plaintext: ArrayBuffer;
  try {
    plaintext = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: toArrayBuffer(iv) },
      key,
      toArrayBuffer(data),
    );
  } catch {
    // AES-GCM intentionally exposes no detail about whether the password or
    // ciphertext was wrong. Give the UI a safe, actionable error instead of
    // leaking a browser-specific DOMException.
    throw new Error('Unable to decrypt wallet. Check your wallet password or restore the wallet from its recovery phrase.');
  }

  try {
    return new TextDecoder().decode(plaintext);
  } catch {
    throw new Error('Wallet data was decrypted but could not be decoded. Restore the wallet from its recovery phrase.');
  }
}

export function hasEncryptedWallet() {
  return typeof window !== 'undefined' && !!localStorage.getItem(STORAGE_KEY);
}

export function clearEncryptedWallet() {
  localStorage.removeItem(STORAGE_KEY);
}

export function deriveAccountFromMnemonic(mnemonic: string) {
  return mnemonicToAccount(mnemonic);
}

export function accountFromPrivateKey(privateKey: `0x${string}`) {
  return privateKeyToAccount(privateKey);
}

const STORAGE_KEY = 'aurelis.wallet.v1';

export type StoredWallet = { address: string; encrypted: string; version: 1 };

export function saveStoredWallet(wallet: StoredWallet) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(wallet));
}

export function loadStoredWallet(): StoredWallet | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw) as StoredWallet; } catch { return null; }
}

export function clearStoredWallet() {
  if (typeof window !== 'undefined') localStorage.removeItem(STORAGE_KEY);
}

export async function deriveEncryptionKey(password: string) {
  const data = new TextEncoder().encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return crypto.subtle.importKey('raw', hash, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
}

export async function encryptSecret(secret: string, password: string) {
  const key = await deriveEncryptionKey(password);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(secret));
  const bytes = new Uint8Array(encrypted);
  const merged = new Uint8Array(iv.length + bytes.length);
  merged.set(iv); merged.set(bytes, iv.length);
  return btoa(String.fromCharCode(...merged));
}

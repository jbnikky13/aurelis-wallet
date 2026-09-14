import { beforeEach, describe, expect, it } from 'vitest';
import { decryptWallet, encryptWallet, hasEncryptedWallet, clearEncryptedWallet } from '@/lib/wallet/crypto';

function installStorage() {
  const store = new Map<string, string>();
  const storage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, value),
    removeItem: (key: string) => store.delete(key),
    clear: () => store.clear(),
  };

  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: storage,
  });

  // crypto.ts intentionally checks for a browser window before reporting
  // whether an encrypted wallet exists. Provide the minimal browser surface
  // needed by these integration tests without introducing jsdom.
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: { localStorage: storage },
  });
}

function installCrypto() {
  if (typeof globalThis.crypto?.subtle?.deriveKey === 'function') return;
  throw new Error('Web Crypto API is required for wallet crypto integration tests.');
}

describe('AURELIS encrypted wallet integration', () => {
  beforeEach(() => {
    installStorage();
    installCrypto();
  });

  it('encrypts and decrypts wallet material without changing it', async () => {
    const secret = 'test recovery phrase material';
    const password = 'correct horse battery staple 123';
    await encryptWallet(secret, password);
    expect(hasEncryptedWallet()).toBe(true);
    await expect(decryptWallet(password)).resolves.toBe(secret);
  });

  it('rejects the wrong password', async () => {
    await encryptWallet('secret', 'strong password 123456');
    await expect(decryptWallet('wrong password')).rejects.toThrow();
  });

  it('clears the encrypted wallet from local storage', async () => {
    await encryptWallet('secret', 'strong password 123456');
    expect(hasEncryptedWallet()).toBe(true);
    clearEncryptedWallet();
    expect(hasEncryptedWallet()).toBe(false);
  });
});

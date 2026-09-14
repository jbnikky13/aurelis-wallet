import { beforeEach, describe, expect, it } from 'vitest';
import { decryptWallet, encryptWallet, hasEncryptedWallet, clearEncryptedWallet } from '@/lib/wallet/crypto';

function installStorage() {
  const store = new Map<string, string>();
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, value),
      removeItem: (key: string) => store.delete(key),
      clear: () => store.clear(),
    },
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

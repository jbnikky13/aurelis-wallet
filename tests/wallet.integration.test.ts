import { beforeEach, describe, expect, it } from 'vitest';
import { generateMnemonic, mnemonicToAccount } from 'viem/accounts';
import { english } from 'viem/accounts';
import {
  accountFromMnemonic,
  createMnemonic,
  validateMnemonic,
} from '@/lib/wallet/mnemonic';

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
  return store;
}

describe('AURELIS wallet integration', () => {
  beforeEach(() => {
    installStorage();
  });

  it('creates a valid recovery phrase and deterministic account', () => {
    const phrase = createMnemonic();
    expect(validateMnemonic(phrase)).toBe(true);
    expect(accountFromMnemonic(phrase).address).toMatch(/^0x[a-fA-F0-9]{40}$/);
    expect(accountFromMnemonic(phrase).address).toBe(
      mnemonicToAccount(phrase).address,
    );
  });

  it('imports a known valid recovery phrase consistently', () => {
    const phrase = generateMnemonic(english);
    const first = accountFromMnemonic(phrase).address;
    const second = accountFromMnemonic(phrase).address;
    expect(validateMnemonic(phrase)).toBe(true);
    expect(second).toBe(first);
  });

  it('rejects malformed recovery phrases', () => {
    expect(validateMnemonic('not a valid recovery phrase')).toBe(false);
    expect(validateMnemonic('')).toBe(false);
  });
});

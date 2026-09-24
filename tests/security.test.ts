import { describe, expect, it } from 'vitest';
import { assertAddress, assertAmount, assertChain, assertHex } from '../lib/security/validation';
import { normalizeTransaction } from '../lib/security/approval';

describe('AURELIS security validation', () => {
  it('accepts valid addresses and byte-aligned hex', () => {
    expect(assertAddress('0x0000000000000000000000000000000000000001')).toBeTruthy();
    expect(assertHex('0x1234')).toBe('0x1234');
  });

  it('rejects malformed addresses, hex, and amounts', () => {
    expect(() => assertAddress('bad')).toThrow();
    expect(() => assertHex('1234')).toThrow();
    expect(() => assertHex('0x')).toThrow();
    expect(() => assertHex('0x123')).toThrow();
    expect(() => assertAmount(-1n)).toThrow();
  });

  it('enforces positive chain identity', () => {
    expect(() => assertChain(1, 8453)).toThrow();
    expect(() => assertChain(0, 0)).toThrow();
    expect(assertChain(1, 1)).toBeUndefined();
  });

  it('normalizes valid transactions', () => {
    const tx = normalizeTransaction({
      to: '0x0000000000000000000000000000000000000001',
      value: 5n,
      data: '0x1234',
      chainId: 1,
    });
    expect(tx.value).toBe(5n);
    expect(tx.data).toBe('0x1234');
    expect(tx.chainId).toBe(1);
  });

  it('rejects invalid transaction data', () => {
    expect(() => normalizeTransaction({
      to: '0x0000000000000000000000000000000000000001',
      value: -1n,
      chainId: 1,
    })).toThrow();

    expect(() => normalizeTransaction({
      to: '0x0000000000000000000000000000000000000001',
      value: 1n,
      data: '0x123',
      chainId: 1,
    })).toThrow();

    expect(() => normalizeTransaction({
      to: '0x0000000000000000000000000000000000000001',
      value: 1n,
      chainId: 0,
    })).toThrow();
  });
});


describe('private secret derivation', () => {
  it('derives a private key from a valid recovery phrase', async () => {
    const { createMnemonic, privateKeyFromMnemonic, validateMnemonic } = await import('../lib/wallet/mnemonic');
    const mnemonic = createMnemonic();
    expect(validateMnemonic(mnemonic)).toBe(true);
    expect(privateKeyFromMnemonic(mnemonic)).toMatch(/^0x[0-9a-fA-F]{64}$/);
  });

  it('rejects an invalid recovery phrase', async () => {
    const { privateKeyFromMnemonic } = await import('../lib/wallet/mnemonic');
    expect(() => privateKeyFromMnemonic('not a valid recovery phrase')).toThrow();
  });
});

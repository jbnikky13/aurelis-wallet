import { describe, expect, it } from 'vitest';
import { describeDappTransaction, normalizeDappTransaction } from '../lib/security/dapp';

const account = '0x0000000000000000000000000000000000000001' as `0x${string}`;
const recipient = '0x0000000000000000000000000000000000000002' as `0x${string}`;

const tx = (extra: Record<string, unknown> = {}) => [{ from: account, to: recipient, value: '0x2a', ...extra }];

describe('dApp transaction security', () => {
  it('normalizes a valid native transfer', () => {
    const result = normalizeDappTransaction(tx(), 1, account);
    expect(result.value).toBe(42n);
    expect(result.chainId).toBe(1);
  });

  it('rejects sender mismatch', () => {
    expect(() => normalizeDappTransaction(tx({ from: recipient }), 1, account)).toThrow(/sender/i);
  });

  it('rejects chain mismatch', () => {
    expect(() => normalizeDappTransaction(tx({ chainId: '0x2105' }), 1, account)).toThrow(/network/i);
  });

  it('rejects malformed quantities and data', () => {
    expect(() => normalizeDappTransaction(tx({ value: '42' }), 1, account)).toThrow(/value/i);
    expect(() => normalizeDappTransaction(tx({ data: '0x123' }), 1, account)).toThrow(/data/i);
  });

  it('rejects unsupported transaction fields instead of silently ignoring them', () => {
    expect(() => normalizeDappTransaction(tx({ authorizationList: [] }), 1, account)).toThrow(/Unsupported/i);
  });

  it('produces a clear approval summary', () => {
    const result = normalizeDappTransaction(tx(), 1, account);
    expect(describeDappTransaction(result)).toMatchObject({ action: 'Send native asset', recipient });
  });
});

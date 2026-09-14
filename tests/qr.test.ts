import { describe, expect, it } from 'vitest';
import { extractWalletAddress } from '../lib/qr';

describe('QR wallet address parsing', () => {
  const address = '0x1111111111111111111111111111111111111111' as const;

  it('accepts a raw address', () => expect(extractWalletAddress(address)).toBe(address));
  it('extracts an address from a URL query', () => expect(extractWalletAddress(`ethereum:${address}?chainId=5042`)).toBe(address));
  it('extracts an embedded address', () => expect(extractWalletAddress(`pay:${address}`)).toBe(address));
  it('rejects unrelated QR content', () => expect(extractWalletAddress('https://example.com')).toBeNull());
});

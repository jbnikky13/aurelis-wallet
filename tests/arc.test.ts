import { describe, expect, it } from 'vitest';
import { arc, AURELIS_CHAINS } from '../lib/chains';

describe('Arc lifecycle configuration', () => {
  it('registers Arc mainnet with the expected EVM identity', () => {
    expect(arc.id).toBe(5042);
    expect(arc.nativeCurrency.symbol).toBe('USDC');
    expect(arc.nativeCurrency.decimals).toBe(18);
    expect(arc.blockExplorers.default.url).toBe('https://arc-scan.org');
    expect(AURELIS_CHAINS.some((chain) => chain.id === 5042)).toBe(true);
  });

  it('uses the Arc RPC configuration exposed to the wallet', () => {
    expect(arc.rpcUrls.default.http.length).toBeGreaterThan(0);
    expect(arc.rpcUrls.default.http[0]).toMatch(/^https:\/\//);
  });
});

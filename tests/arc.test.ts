import { describe, expect, it } from 'vitest';
import { arc, AURELIS_CHAINS } from '../lib/chains';

describe('Arc Mainnet production configuration', () => {
  it('registers the correct Arc Mainnet identity', () => {
    expect(arc.id).toBe(5042);
    expect(arc.name).toBe('Arc');
    expect(arc.testnet).toBe(false);
    expect(arc.nativeCurrency).toEqual({
      name: 'USDC',
      symbol: 'USDC',
      decimals: 18,
    });
    expect(arc.blockExplorers.default.url).toBe('https://explorer.arc.io');
    expect(AURELIS_CHAINS.some((chain) => chain.id === 5042)).toBe(true);
  });

  it('defaults to the official Arc Mainnet RPC', () => {
    expect(arc.rpcUrls.default.http).toEqual(['https://rpc.mainnet.arc.io']);
    expect(arc.rpcUrls.public.http).toEqual(['https://rpc.mainnet.arc.io']);
  });

  it('never configures Arc as a testnet', () => {
    expect(arc.testnet).toBe(false);
  });
});

import { createPublicClient, http, type PublicClient } from 'viem';
import { AURELIS_CHAINS } from './chains';

const rpcUrl = (chainId: number, fallback: string) => {
  if (typeof window !== 'undefined') {
    const configured = localStorage.getItem(`aurelis.rpc.${chainId}`);
    if (configured) return configured;
  }
  return fallback;
};

export function publicClientFor(chain: (typeof AURELIS_CHAINS)[number]): PublicClient {
  return createPublicClient({ chain, transport: http(rpcUrl(chain.id, chain.rpcUrls.default.http[0])) });
}

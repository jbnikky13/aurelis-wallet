import type { Chain } from 'viem';
import { createPublicClient, http, type PublicClient } from 'viem';

export function resilientClient(chain: Chain): PublicClient {
  const urls = [...(chain.rpcUrls.default.http ?? [])];
  const custom = typeof window !== 'undefined' ? localStorage.getItem(`aurelis.rpc.${chain.id}`) : null;
  if (custom) urls.unshift(custom);
  const unique = [...new Set(urls)];
  return createPublicClient({ chain, transport: http(unique[0] ?? undefined) });
}

export function explorerTxUrl(chain: Chain, hash: string) {
  const base = chain.blockExplorers?.default?.url;
  return base ? `${base}/tx/${hash}` : null;
}

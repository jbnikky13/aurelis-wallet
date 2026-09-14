import { createPublicClient, fallback, http, type PublicClient } from 'viem';
import { AURELIS_CHAINS } from './chains';
import { recordRuntimeEvent } from './monitoring';

const RPC_TIMEOUT = 10_000;
const RPC_RETRIES = 2;

function configuredRpc(chainId: number, fallbackUrl: string): string[] {
  const urls = [fallbackUrl];
  if (typeof window !== 'undefined') {
    try {
      const configured = localStorage.getItem(`aurelis.rpc.${chainId}`)?.trim();
      if (configured && configured !== fallbackUrl) urls.unshift(configured);
    } catch {
      recordRuntimeEvent({ level: 'warn', event: 'rpc-config-read-failed', chainId });
    }
  }
  return urls;
}

export function publicClientFor(chain: (typeof AURELIS_CHAINS)[number]): PublicClient {
  const urls = configuredRpc(chain.id, chain.rpcUrls.default.http[0]);
  const transports = urls.map((url) => http(url, {
    timeout: RPC_TIMEOUT,
    retryCount: RPC_RETRIES,
    retryDelay: 300,
  }));
  return createPublicClient({ chain, transport: fallback(transports, { rank: true }) });
}

export async function withRpcRecovery<T>(
  chainId: number,
  operation: () => Promise<T>,
  retries = 1,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      recordRuntimeEvent({
        level: attempt === retries ? 'error' : 'warn',
        event: 'rpc-operation-failed',
        chainId,
        message: error instanceof Error ? error.message : String(error),
      });
      if (attempt < retries) await new Promise((resolve) => setTimeout(resolve, 400 * (attempt + 1)));
    }
  }
  throw lastError instanceof Error ? lastError : new Error('RPC operation failed.');
}

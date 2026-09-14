import { NextResponse } from 'next/server';
import { AURELIS_CHAINS } from '@/lib/chains';
import { publicRuntimeConfig, validateRuntimeConfig } from '@/lib/config';
import { publicClientFor, withRpcRecovery } from '@/lib/providers';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const config = validateRuntimeConfig();
  const rpc = await Promise.all(
    AURELIS_CHAINS.map(async (chain) => {
      const started = Date.now();
      try {
        const block = await withRpcRecovery(chain.id, () => publicClientFor(chain).getBlockNumber(), 1);
        return { chainId: chain.id, name: chain.name, ok: true, block: block.toString(), latencyMs: Date.now() - started };
      } catch (error) {
        return { chainId: chain.id, name: chain.name, ok: false, latencyMs: Date.now() - started, error: error instanceof Error ? error.message : 'RPC unavailable' };
      }
    }),
  );

  const rpcHealthy = rpc.every((entry) => entry.ok);
  const ready = config.ok && rpcHealthy;
  return NextResponse.json(
    { status: ready ? 'ready' : 'degraded', config, runtime: publicRuntimeConfig(), rpc, checkedAt: new Date().toISOString() },
    { status: ready ? 200 : 503 },
  );
}

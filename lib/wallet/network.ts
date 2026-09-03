import type { Chain } from 'viem';
import { publicClientFor } from '../providers';

export async function assertHealthyNetwork(chain: Chain) {
  const client = publicClientFor(chain);
  const [blockNumber, gasPrice] = await Promise.all([client.getBlockNumber(), client.getGasPrice()]);
  if (blockNumber < 1n) throw new Error(`${chain.name} RPC is unavailable.`);
  return { blockNumber, gasPrice };
}

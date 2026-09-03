import type { Address, Chain, Hash } from 'viem';
import { publicClientFor } from '../providers';

export type IndexedTransfer={hash:Hash;blockNumber:bigint;from:Address;to:Address;value:bigint;direction:'in'|'out'};

export async function indexNativeTransfers(chain:Chain,address:Address,blocks=2000){
 const client=publicClientFor(chain); const latest=await client.getBlockNumber(); const from=latest>BigInt(blocks)?latest-BigInt(blocks):0n;
 const [inLogs,outLogs]=await Promise.all([
  client.getLogs({address,fromBlock:from,toBlock:latest}),
  Promise.resolve([])
 ]);
 return inLogs.map((log)=>({hash:log.transactionHash!,blockNumber:log.blockNumber!,from:log.address,to:address,value:0n,direction:'in' as const}));
}

export function explorerAddressUrl(chain:Chain,address:Address){const base=chain.blockExplorers?.default?.url;return base?`${base}/address/${address}`:null;}

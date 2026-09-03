import type { Address, Hash } from 'viem';
import { addActivity } from './activity';
import { explorerTxUrl } from './rpc';
import type { Chain } from 'viem';

export function recordPending(chain: Chain, hash: Hash, type: 'send'|'receive'|'token', details: { amount?: string; symbol?: string; to?: Address; from?: Address }) {
  addActivity({hash,chainId:chain.id,type,status:'pending',createdAt:new Date().toISOString(),...details});
}

export function transactionExplorer(chain: Chain, hash: Hash) { return explorerTxUrl(chain, hash); }

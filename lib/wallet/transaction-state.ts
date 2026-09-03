import type { Address, Hash } from 'viem';
import { publicClientFor } from '../providers';
import { addActivity, getActivity, type WalletActivity } from './activity';
import type { Chain } from 'viem';

export async function monitorTransaction(chain: Chain, hash: Hash, details: Omit<WalletActivity, 'hash'|'chainId'|'status'|'createdAt'>) {
  const client = publicClientFor(chain);
  try {
    const receipt = await client.waitForTransactionReceipt({ hash, pollingInterval: 3_000 });
    const status = receipt.status === 'success' ? 'confirmed' : 'failed';
    const current = getActivity().filter(x => x.hash !== hash);
    localStorage.setItem('aurelis.activity.v1', JSON.stringify(current));
    addActivity({ hash, chainId: chain.id, status, createdAt: new Date().toISOString(), ...details });
    return receipt;
  } catch (error) {
    const current = getActivity().filter(x => x.hash !== hash);
    localStorage.setItem('aurelis.activity.v1', JSON.stringify(current));
    addActivity({ hash, chainId: chain.id, status: 'failed', createdAt: new Date().toISOString(), ...details });
    throw error;
  }
}

export async function nextNonce(chain: Chain, address: Address) {
  return publicClientFor(chain).getTransactionCount({ address, blockTag: 'pending' });
}

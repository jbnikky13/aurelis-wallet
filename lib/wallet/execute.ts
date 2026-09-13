import type { Address, Chain, Hash, Hex, WalletClient } from 'viem';
import { addActivity } from './activity';
import { resilientClient } from './rpc';
import { recordPending } from './confirm';
import { normalizeDappTransaction, type SafeDappTransaction } from '../security/dapp';

export type ExecutionResult = {
  hash: Hash;
  explorerUrl: string | null;
};

function toHexQuantity(value: bigint | undefined) {
  return value === undefined ? undefined : `0x${value.toString(16)}` as Hex;
}

export async function executeDappTransaction(
  walletClient: WalletClient,
  chain: Chain,
  account: Address,
  params: unknown[],
): Promise<ExecutionResult> {
  const tx: SafeDappTransaction = normalizeDappTransaction(params, chain.id, account);
  const publicClient = resilientClient(chain);

  const request = {
    account,
    to: tx.to,
    value: tx.value,
    data: tx.data,
    gas: tx.gas,
    gasPrice: tx.gasPrice,
    nonce: tx.nonce,
    chain,
  } as const;

  const hash = await walletClient.sendTransaction(request);
  recordPending(chain, hash, tx.data && tx.data !== '0x' ? 'token' : 'send', {
    amount: tx.value.toString(),
    to: tx.to,
    from: tx.from,
  });

  void publicClient.waitForTransactionReceipt({ hash }).then((receipt) => {
    addActivity({
      hash,
      chainId: chain.id,
      type: tx.data && tx.data !== '0x' ? 'token' : 'send',
      status: receipt.status === 'success' ? 'confirmed' : 'failed',
      createdAt: new Date().toISOString(),
      amount: tx.value.toString(),
      to: tx.to,
      from: tx.from,
    });
  }).catch(() => {
    addActivity({
      hash,
      chainId: chain.id,
      type: tx.data && tx.data !== '0x' ? 'token' : 'send',
      status: 'failed',
      createdAt: new Date().toISOString(),
      amount: tx.value.toString(),
      to: tx.to,
      from: tx.from,
    });
  });

  return { hash, explorerUrl: chain.blockExplorers?.default ? `${chain.blockExplorers.default.url}/tx/${hash}` : null };
}

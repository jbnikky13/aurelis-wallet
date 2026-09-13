import type { Address, Chain, Hash, WalletClient } from 'viem';
import { erc20Abi } from 'viem';
import { resilientClient } from './rpc';
import { addActivity } from './activity';
import { recordPending } from './confirm';
import { assertAddress, assertAmount } from '../security/validation';

export type Erc20Execution = {
  hash: Hash;
  token: Address;
  kind: 'transfer' | 'approve' | 'revoke';
  explorerUrl: string | null;
};

export async function executeErc20(
  walletClient: WalletClient,
  chain: Chain,
  account: Address,
  token: Address,
  functionName: 'transfer' | 'approve',
  recipientOrSpender: Address,
  amount: bigint,
): Promise<Erc20Execution> {
  const safeAccount = assertAddress(account);
  const safeToken = assertAddress(token);
  const target = assertAddress(recipientOrSpender);
  const safeAmount = assertAmount(amount);
  const publicClient = resilientClient(chain);
  const kind = functionName === 'approve' ? (safeAmount === 0n ? 'revoke' : 'approve') : 'transfer';

  const hash = await walletClient.writeContract({
    account: safeAccount,
    address: safeToken,
    abi: erc20Abi,
    functionName,
    args: [target, safeAmount],
    chain,
  });

  // The activity model represents all ERC-20 actions as token activity.
  recordPending(chain, hash, 'token', {
    from: safeAccount,
    to: target,
    amount: safeAmount.toString(),
  });

  void publicClient.waitForTransactionReceipt({ hash }).then((receipt) => {
    addActivity({
      hash,
      chainId: chain.id,
      type: 'token',
      status: receipt.status === 'success' ? 'confirmed' : 'failed',
      createdAt: new Date().toISOString(),
      amount: safeAmount.toString(),
      to: target,
      from: safeAccount,
    });
  }).catch(() => {
    addActivity({
      hash,
      chainId: chain.id,
      type: 'token',
      status: 'failed',
      createdAt: new Date().toISOString(),
      amount: safeAmount.toString(),
      to: target,
      from: safeAccount,
    });
  });

  return {
    hash,
    token: safeToken,
    kind,
    explorerUrl: chain.blockExplorers?.default ? `${chain.blockExplorers.default.url}/tx/${hash}` : null,
  };
}

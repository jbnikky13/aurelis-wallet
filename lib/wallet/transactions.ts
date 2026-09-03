import type { Address, Hash } from 'viem';
import { parseEther } from 'viem';
import { publicClientFor } from '../providers';
import type { Chain } from 'viem';

export type NativeTransfer = { to: Address; amount: string };

export async function prepareNativeTransfer(chain: Chain, from: Address, transfer: NativeTransfer) {
  const client = publicClientFor(chain);
  const value = parseEther(transfer.amount);
  const gas = await client.estimateGas({ account: from, to: transfer.to, value });
  const fee = await client.getGasPrice();
  return { to: transfer.to, value, gas, gasPrice: fee, estimatedFee: gas * fee };
}

export async function waitForReceipt(chain: Chain, hash: Hash) {
  return publicClientFor(chain).waitForTransactionReceipt({ hash });
}

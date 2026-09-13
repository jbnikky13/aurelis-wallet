import type { Address, Chain, Hex, PublicClient } from 'viem';
import { normalizeDappTransaction, type SafeDappTransaction } from './dapp';

export type TransactionCheck = {
  transaction: SafeDappTransaction;
  balance: bigint;
  gasLimit: bigint;
  gasPrice: bigint;
  estimatedFee: bigint;
  totalRequired: bigint;
  sufficientBalance: boolean;
  simulationOk: boolean;
  simulationError?: string;
  warnings: string[];
};

export async function checkDappTransaction(
  client: PublicClient,
  chain: Chain,
  account: Address,
  params: unknown[],
): Promise<TransactionCheck> {
  const transaction = normalizeDappTransaction(params, chain.id, account);
  const balance = await client.getBalance({ address: account });
  const gasPrice = transaction.gasPrice ?? await client.getGasPrice();
  const estimatedGas = transaction.gas ?? await client.estimateGas({
    account,
    to: transaction.to,
    value: transaction.value,
    data: transaction.data,
  });
  const gasLimit = transaction.gas ?? (estimatedGas * 120n) / 100n;
  const estimatedFee = gasLimit * gasPrice;
  const totalRequired = transaction.value + estimatedFee;
  const warnings: string[] = [];

  if (balance < totalRequired) warnings.push('Insufficient native balance for value plus estimated network fee.');
  if (transaction.data !== undefined && transaction.data !== '0x') warnings.push('Contract calldata requires careful review before signing.');

  let simulationOk = true;
  let simulationError: string | undefined;
  try {
    await client.call({
      account,
      to: transaction.to,
      value: transaction.value,
      data: transaction.data as Hex | undefined,
      gas: gasLimit,
      gasPrice,
    });
  } catch (error) {
    simulationOk = false;
    simulationError = error instanceof Error ? error.message : 'Transaction simulation failed.';
    warnings.push('This transaction is expected to fail simulation and should not be signed.');
  }

  return {
    transaction,
    balance,
    gasLimit,
    gasPrice,
    estimatedFee,
    totalRequired,
    sufficientBalance: balance >= totalRequired,
    simulationOk,
    simulationError,
    warnings,
  };
}

import type { Address, Chain, Hex } from 'viem';
import { formatEther } from 'viem';
import { assertAddress, assertAmount, assertChain, assertHex } from './validation';
import { describeDappTransaction, type SafeDappTransaction } from './dapp';
import type { TransactionCheck } from './transaction-check';

export type SafeTransaction = {
  to: Address;
  value: bigint;
  data?: Hex;
  chainId: number;
};

/** Backwards-compatible validator used by the security test suite and simple send flows. */
export function normalizeTransaction(input: unknown): SafeTransaction {
  if (!input || typeof input !== 'object') throw new Error('Invalid transaction request.');
  const x = input as Record<string, unknown>;
  const to = assertAddress(x.to);
  const value = typeof x.value === 'bigint' ? x.value : 0n;
  assertAmount(value);
  const data = x.data === undefined ? undefined : assertHex(x.data);
  const chainId = Number(x.chainId);
  assertChain(chainId, chainId);
  return { to, value, data, chainId };
}

export type ApprovalSummary = {
  title: string;
  origin: string;
  network: string;
  account: Address;
  recipient: Address;
  amount: string;
  fee: string;
  total: string;
  simulation: 'PASS' | 'FAIL';
  balance: string;
  warnings: string[];
  requiresConfirmation: boolean;
};

export function buildApprovalSummary(
  check: TransactionCheck,
  chain: Chain,
  origin: string,
): ApprovalSummary {
  const description = describeDappTransaction(check.transaction);
  const warnings = [...check.warnings];
  if (!check.sufficientBalance) warnings.unshift('Insufficient balance.');
  if (!check.simulationOk) warnings.unshift('Simulation failed. Do not sign this transaction.');

  return {
    title: description.action,
    origin,
    network: chain.name,
    account: check.transaction.from,
    recipient: check.transaction.to,
    amount: `${formatEther(check.transaction.value)} ${chain.nativeCurrency.symbol}`,
    fee: `${formatEther(check.estimatedFee)} ${chain.nativeCurrency.symbol}`,
    total: `${formatEther(check.totalRequired)} ${chain.nativeCurrency.symbol}`,
    simulation: check.simulationOk ? 'PASS' : 'FAIL',
    balance: `${formatEther(check.balance)} ${chain.nativeCurrency.symbol}`,
    warnings: [...new Set(warnings)],
    requiresConfirmation: check.simulationOk && check.sufficientBalance,
  };
}

export function canApprove(summary: ApprovalSummary) {
  return summary.requiresConfirmation && summary.warnings.every((warning) => !warning.toLowerCase().includes('do not sign'));
}

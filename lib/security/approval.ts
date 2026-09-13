import { formatEther, type Address } from 'viem';
import type { Chain } from 'viem';
import { describeDappTransaction } from './dapp';
import type { TransactionCheck } from './transaction-check';

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

export function buildApprovalSummary(check: TransactionCheck, chain: Chain, origin: string): ApprovalSummary {
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
  return summary.requiresConfirmation && !summary.warnings.some((warning) => warning.toLowerCase().includes('do not sign'));
}

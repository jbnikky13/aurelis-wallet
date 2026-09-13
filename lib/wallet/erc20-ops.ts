import type { Address, Chain, Hex } from 'viem';
import { encodeFunctionData, erc20Abi, maxUint256 } from 'viem';
import { publicClientFor } from '../providers';
import { assertAddress, assertAmount } from '../security/validation';

export const MAX_ERC20_APPROVAL = maxUint256;

export type Erc20Call = {
  address: Address;
  abi: typeof erc20Abi;
  functionName: 'transfer' | 'approve';
  args: readonly [Address, bigint];
};

export function normalizeTokenAmount(value: bigint): bigint { return assertAmount(value); }

export function buildErc20Transfer(token: Address, recipient: Address, amount: bigint): Erc20Call {
  return { address: assertAddress(token), abi: erc20Abi, functionName: 'transfer', args: [assertAddress(recipient), normalizeTokenAmount(amount)] };
}

export function buildErc20Approval(token: Address, spender: Address, amount: bigint, allowUnlimited = false): Erc20Call {
  const normalized = normalizeTokenAmount(amount);
  if (normalized === MAX_ERC20_APPROVAL && !allowUnlimited) throw new Error('Unlimited token approval requires explicit confirmation.');
  return { address: assertAddress(token), abi: erc20Abi, functionName: 'approve', args: [assertAddress(spender), normalized] };
}

export function buildErc20Revoke(token: Address, spender: Address): Erc20Call {
  return buildErc20Approval(token, spender, 0n, true);
}

export async function readErc20Allowance(chain: Chain, token: Address, owner: Address, spender: Address) {
  const client = publicClientFor(chain);
  return client.readContract({ address: assertAddress(token), abi: erc20Abi, functionName: 'allowance', args: [assertAddress(owner), assertAddress(spender)] });
}

export function describeAllowance(allowance: bigint) {
  if (allowance === 0n) return { state: 'none' as const, warning: undefined };
  if (allowance === MAX_ERC20_APPROVAL) return { state: 'unlimited' as const, warning: 'Unlimited token allowance is active. Consider revoking it when no longer needed.' };
  return { state: 'limited' as const, warning: undefined };
}

export function erc20CallData(call: Erc20Call): { to: Address; data: Hex; value: bigint } {
  return { to: call.address, data: encodeFunctionData({ abi: call.abi, functionName: call.functionName, args: call.args }), value: 0n };
}

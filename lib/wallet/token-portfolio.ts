import type { Address, PublicClient } from 'viem';
import { erc20Abi } from 'viem';

export type TokenHolding = {
  token: Address;
  symbol: string;
  decimals: number;
  balance: bigint;
  allowance?: bigint;
};

export async function readTokenHolding(
  client: PublicClient,
  token: Address,
  owner: Address,
  spender?: Address,
): Promise<TokenHolding> {
  const [balance, symbol, decimals, allowance] = await Promise.all([
    client.readContract({ address: token, abi: erc20Abi, functionName: 'balanceOf', args: [owner] }),
    client.readContract({ address: token, abi: erc20Abi, functionName: 'symbol' }),
    client.readContract({ address: token, abi: erc20Abi, functionName: 'decimals' }),
    spender
      ? client.readContract({ address: token, abi: erc20Abi, functionName: 'allowance', args: [owner, spender] })
      : Promise.resolve(undefined),
  ]);

  return { token, symbol, decimals, balance, allowance };
}

export function formatTokenAmount(balance: bigint, decimals: number, maxFractionDigits = 6) {
  const base = 10n ** BigInt(decimals);
  const whole = balance / base;
  const fraction = (balance % base).toString().padStart(decimals, '0').slice(0, maxFractionDigits).replace(/0+$/, '');
  return fraction ? `${whole}.${fraction}` : whole.toString();
}

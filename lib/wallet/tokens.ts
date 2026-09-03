import { erc20Abi, formatUnits, parseUnits, type Address } from 'viem';
import { publicClientFor } from '../providers';
import type { Chain } from 'viem';

export type TokenBalance = { address: Address; symbol: string; decimals: number; balance: bigint; formatted: string };

export async function getTokenBalance(chain: Chain, token: Address, owner: Address): Promise<TokenBalance> {
  const client = publicClientFor(chain);
  const [balance, symbol, decimals] = await Promise.all([
    client.readContract({ address: token, abi: erc20Abi, functionName: 'balanceOf', args: [owner] }),
    client.readContract({ address: token, abi: erc20Abi, functionName: 'symbol' }),
    client.readContract({ address: token, abi: erc20Abi, functionName: 'decimals' }),
  ]);
  return { address: token, symbol, decimals, balance, formatted: formatUnits(balance, decimals) };
}

export async function prepareTokenTransfer(chain: Chain, token: Address, from: Address, to: Address, amount: string) {
  const client = publicClientFor(chain);
  const decimals = await client.readContract({ address: token, abi: erc20Abi, functionName: 'decimals' });
  const value = parseUnits(amount, decimals);
  const gas = await client.estimateContractGas({ address: token, abi: erc20Abi, functionName: 'transfer', args: [to, value], account: from });
  return { token, to, value, decimals, gas, gasPrice: await client.getGasPrice() };
}

import type { Address, Chain } from 'viem';
import { erc20Abi } from 'viem';
import { publicClientFor } from '../providers';

export type TokenMetadata = { address: Address; symbol: string; name: string; decimals: number };

export async function readTokenMetadata(chain: Chain, token: Address): Promise<TokenMetadata> {
  const client = publicClientFor(chain);
  const [symbol,name,decimals] = await Promise.all([
    client.readContract({address:token,abi:erc20Abi,functionName:'symbol'}),
    client.readContract({address:token,abi:erc20Abi,functionName:'name'}),
    client.readContract({address:token,abi:erc20Abi,functionName:'decimals'})
  ]);
  return {address:token,symbol,name,decimals};
}

export function saveToken(chainId:number, token:TokenMetadata) {
  const key=`aurelis.tokens.${chainId}`; const current=JSON.parse(localStorage.getItem(key)??'[]') as TokenMetadata[];
  const next=[token,...current.filter(x=>x.address.toLowerCase()!==token.address.toLowerCase())]; localStorage.setItem(key,JSON.stringify(next)); return next;
}

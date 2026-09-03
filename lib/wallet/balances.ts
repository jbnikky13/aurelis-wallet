import type { Address, Chain } from 'viem';
import { formatUnits } from 'viem';
import { publicClientFor } from '../providers';
import type { TokenMetadata } from './token-discovery';

export async function nativeBalance(chain:Chain,address:Address){const client=publicClientFor(chain);const balance=await client.getBalance({address});return {raw:balance,formatted:formatUnits(balance,18)};}
export async function erc20Balance(chain:Chain,address:Address,token:TokenMetadata){const client=publicClientFor(chain);const raw=await client.readContract({address:token.address,abi:[{type:'function',name:'balanceOf',stateMutability:'view',inputs:[{name:'account',type:'address'}],outputs:[{type:'uint256'}]}] as const,functionName:'balanceOf',args:[address]});return {raw,formatted:formatUnits(raw,token.decimals)};}

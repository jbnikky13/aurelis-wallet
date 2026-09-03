import type { Address, Chain, Hash } from 'viem';
import { isAddress } from 'viem';
import { validateDappRequest } from './dapp';

export type ProviderState={address:Address|null;chainId:number};
export type ApprovalHandler=(method:string,params:unknown[],origin:string)=>Promise<unknown>;

export function createAurelisProvider(state:ProviderState,approve:ApprovalHandler){
 return {request:async({method,params=[] ,origin='https://unknown'}:{method:string;params?:unknown[];origin?:string})=>{
   validateDappRequest({origin,method,params});
   if(method==='eth_chainId') return `0x${state.chainId.toString(16)}`;
   if(method==='eth_accounts') return state.address?[state.address]:[];
   if(method==='eth_requestAccounts') return state.address?[state.address]:[];
   if(method==='personal_sign'||method==='eth_sendTransaction') return approve(method,params,origin);
   throw new Error(`Unsupported provider method: ${method}`);
 }};
}

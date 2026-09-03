import {assertAddress,assertAmount,assertHex} from './validation';
import type {Address,Hex} from 'viem';
export type SafeTransaction={to:Address;value:bigint;data?:Hex;chainId:number};
export function normalizeTransaction(input:unknown):SafeTransaction{if(!input||typeof input!=='object')throw new Error('Invalid transaction request.');const x=input as Record<string,unknown>;const to=assertAddress(x.to);const value=typeof x.value==='bigint'?x.value:0n;assertAmount(value);const data=x.data===undefined?undefined:assertHex(x.data);const chainId=Number(x.chainId);if(!Number.isSafeInteger(chainId)||chainId<=0)throw new Error('Invalid chain ID.');return{to,value,data,chainId}}

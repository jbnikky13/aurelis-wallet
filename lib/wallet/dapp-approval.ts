import type {Address} from 'viem';
import {enqueueDappRequest} from './dapp-queue';
import {validateDappRequest} from './dapp';
export function queueTransaction(origin:string,chainId:number,account:Address,params:unknown[]){validateDappRequest({origin,method:'eth_sendTransaction',params});return enqueueDappRequest({origin,kind:'transaction',method:'eth_sendTransaction',params,chainId,account})}
export function queueMessageSignature(origin:string,chainId:number,account:Address,params:unknown[]){validateDappRequest({origin,method:'personal_sign',params});return enqueueDappRequest({origin,kind:'message',method:'personal_sign',params,chainId,account})}

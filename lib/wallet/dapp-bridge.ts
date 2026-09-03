import type {Address} from 'viem';
import {queueMessageSignature,queueTransaction} from './dapp-approval';
import {takeDappResult} from './dapp-queue';
export async function awaitDappApproval(id:string,timeoutMs=120000){const started=Date.now();return await new Promise((resolve,reject)=>{const poll=()=>{const result=takeDappResult(id);if(result)return result;if(Date.now()-started>timeoutMs)return reject(new Error('AURELIS approval timed out.'));setTimeout(poll,500)};poll()})}
export async function requestTransaction(origin:string,chainId:number,account:Address,params:unknown[]){const item=queueTransaction(origin,chainId,account,params);return await awaitDappApproval(item.id)}
export async function requestMessageSignature(origin:string,chainId:number,account:Address,params:unknown[]){const item=queueMessageSignature(origin,chainId,account,params);return await awaitDappApproval(item.id)}

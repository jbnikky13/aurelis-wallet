import { enqueueDappRequest } from './dapp-queue';
import { validateDappRequest } from './dapp';
import type { Address } from 'viem';

export type ReownRequest = { id?: number|string; topic?: string; params?: { request?: { method?: string; params?: unknown[] }; chainId?: string } };
export function queueReownRequest(origin:string,account:Address,input:ReownRequest){const request=input.params?.request;if(!request?.method)throw new Error('Invalid Reown request: missing method.');const method=request.method;const params=request.params??[];validateDappRequest({origin,method,params});const chainId=Number(String(input.params?.chainId??'eip155:1').split(':').pop());return enqueueDappRequest({origin,kind:method.includes('sign')?'message':'transaction',method,params,chainId,account});}

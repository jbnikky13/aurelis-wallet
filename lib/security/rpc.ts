import type {Chain} from 'viem';
export async function withRpcRetry<T>(fn:()=>Promise<T>,attempts=3){let last:unknown;for(let i=0;i<attempts;i++){try{return await fn()}catch(e){last=e;if(i<attempts-1)await new Promise(r=>setTimeout(r,250*(i+1)))}}throw last instanceof Error?last:new Error('RPC request failed.')}
export function rpcUrls(chain:Chain){const urls=chain.rpcUrls.default.http;return [...new Set(urls)]}

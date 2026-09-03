export type DappRequest = { origin:string; method:string; params:unknown[] };

const ALLOWED=['eth_chainId','eth_accounts','personal_sign','eth_sendTransaction'];
export function validateDappRequest(request:DappRequest){
  if(!request.origin.startsWith('https://') && !request.origin.startsWith('http://localhost')) throw new Error('Untrusted dApp origin.');
  if(!ALLOWED.includes(request.method)) throw new Error(`Unsupported dApp method: ${request.method}`);
  return true;
}

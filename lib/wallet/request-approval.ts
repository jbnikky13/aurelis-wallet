import {validateDappRequest,type DappRequest} from './dapp';
export type ApprovalResult={approved:boolean;reason?:string};
export function requestRequiresApproval(request:DappRequest){validateDappRequest(request);return request.method==='personal_sign'||request.method==='eth_sendTransaction';}
export function approveRequest(request:DappRequest,approved:boolean):ApprovalResult{validateDappRequest(request);return approved?{approved:true}:{approved:false,reason:'User rejected the request.'};}

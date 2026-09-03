import type { Address } from 'viem';

export type DappRequestKind='transaction'|'message'|'typed-data';
export type DappQueueRequest={id:string;origin:string;kind:DappRequestKind;method:string;params:unknown[];chainId:number;account:Address;createdAt:string};
export type DappDecision={approved:boolean;result?:string;error?:{code:number;message:string}};
const KEY='aurelis.dapp.queue.v1';
const RESULT_PREFIX='aurelis.dapp.result.';
function read():DappQueueRequest[]{if(typeof window==='undefined')return[];try{return JSON.parse(localStorage.getItem(KEY)??'[]')}catch{return[]}}
function write(items:DappQueueRequest[]){localStorage.setItem(KEY,JSON.stringify(items));window.dispatchEvent(new CustomEvent('aurelis:dapp-queue'))}
export function enqueueDappRequest(input:Omit<DappQueueRequest,'id'|'createdAt'>){const item={...input,id:globalThis.crypto?.randomUUID?.()??`${Date.now()}-${Math.random()}`,createdAt:new Date().toISOString()};write([...read(),item]);return item}
export function dequeueDappRequest(id:string){const item=read().find(x=>x.id===id);write(read().filter(x=>x.id!==id));return item}
export function getDappQueue(){return read()}
export function resolveDappRequest(id:string,decision:DappDecision){localStorage.setItem(RESULT_PREFIX+id,JSON.stringify(decision));window.dispatchEvent(new CustomEvent('aurelis:dapp-result',{detail:{id}}));dequeueDappRequest(id)}
export function takeDappResult(id:string):DappDecision|null{if(typeof window==='undefined')return null;const raw=localStorage.getItem(RESULT_PREFIX+id);if(!raw)return null;localStorage.removeItem(RESULT_PREFIX+id);try{return JSON.parse(raw)}catch{return null}}

import type { Address } from 'viem';
import { randomUUID } from 'crypto';

export type DappRequestKind='transaction'|'message'|'typed-data';
export type DappQueueRequest={id:string;origin:string;kind:DappRequestKind;method:string;params:unknown[];chainId:number;account:Address;createdAt:string};

const KEY='aurelis.dapp.queue.v1';
function read():DappQueueRequest[]{if(typeof window==='undefined')return[];try{return JSON.parse(localStorage.getItem(KEY)??'[]')}catch{return[]}}
function write(items:DappQueueRequest[]){localStorage.setItem(KEY,JSON.stringify(items));window.dispatchEvent(new CustomEvent('aurelis:dapp-queue'))}
export function enqueueDappRequest(input:Omit<DappQueueRequest,'id'|'createdAt'>){const item={...input,id:randomUUID(),createdAt:new Date().toISOString()};write([...read(),item]);return item}
export function dequeueDappRequest(id:string){const item=read().find(x=>x.id===id);write(read().filter(x=>x.id!==id));return item}
export function getDappQueue(){return read()}

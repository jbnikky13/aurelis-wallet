export type DappSession={origin:string;name?:string;connectedAt:string;chainId:number};
const KEY='aurelis.dapps.v1';
export function getDappSessions():DappSession[]{if(typeof window==='undefined')return[];try{return JSON.parse(localStorage.getItem(KEY)??'[]')}catch{return[]}}
export function connectDapp(session:DappSession){const next=[session,...getDappSessions().filter(x=>x.origin!==session.origin)];localStorage.setItem(KEY,JSON.stringify(next));return next}
export function disconnectDapp(origin:string){const next=getDappSessions().filter(x=>x.origin!==origin);localStorage.setItem(KEY,JSON.stringify(next));return next}

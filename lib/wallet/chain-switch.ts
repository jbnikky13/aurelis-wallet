import type {Chain} from 'viem';
import {getDappSessions,connectDapp} from './dapp-session';
export function switchDappChain(origin:string,chain:Chain){const session=getDappSessions().find(x=>x.origin===origin);if(!session)throw new Error('dApp is not connected.');return connectDapp({...session,chainId:chain.id});}

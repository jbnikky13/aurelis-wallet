'use client';
import EthereumProvider from '@walletconnect/ethereum-provider';
import type { Address } from 'viem';
import { getWalletConnectConfig } from './walletconnect-config';

let provider: EthereumProvider | null = null;
export async function getWalletConnectProvider(chains:number[],methods:string[],events:string[]){
 const config=getWalletConnectConfig();
 if(provider)return provider;
 provider=await EthereumProvider.init({projectId:config.projectId,optionalChains:chains,methods,events,showQrModal:true,metadata:config.metadata});
 return provider;
}
export async function connectWalletConnect(chains:number[]){const p=await getWalletConnectProvider(chains,['eth_sendTransaction','personal_sign','eth_signTypedData','eth_signTypedData_v4'],['chainChanged','accountsChanged']);await p.connect();return p.accounts as Address[];}
export async function disconnectWalletConnect(){if(provider){await provider.disconnect();provider=null;}}

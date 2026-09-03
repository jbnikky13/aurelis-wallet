import { EthereumProvider } from '@walletconnect/ethereum-provider';
import { getWalletConnectConfig } from './walletconnect-config';
import { AURELIS_CHAINS } from '../chains';

let provider: EthereumProvider | null = null;
export async function getReownProvider(){
 if(provider)return provider;
 const cfg=getWalletConnectConfig();
 provider=await EthereumProvider.init({projectId:cfg.projectId,metadata:cfg.metadata,showQrModal:true,optionalChains:AURELIS_CHAINS.map(c=>c.id),optionalMethods:['eth_chainId','eth_accounts','eth_requestAccounts','personal_sign','eth_signTypedData','eth_signTypedData_v4','eth_sendTransaction','wallet_switchEthereumChain'],optionalEvents:['accountsChanged','chainChanged']});
 return provider;
}
export async function connectReown(){const p=await getReownProvider();await p.connect();return p.accounts;}
export async function disconnectReown(){if(provider){await provider.disconnect();provider=null;}}
export function currentReownProvider(){return provider;}

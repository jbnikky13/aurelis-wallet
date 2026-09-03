import type { Address, Hash, Hex, Chain } from 'viem';
import { createWalletClient, http, parseTransaction } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { decryptWallet } from './crypto';
import { accountFromMnemonic } from './mnemonic';
import { publicClientFor } from '../providers';
import { EIP1193_ERRORS, ProviderRpcError } from './eip1193-errors';

function privateAccountFromMnemonic(mnemonic:string){const account=accountFromMnemonic(mnemonic);return privateKeyToAccount(account.privateKey as Hex)}
export async function signPersonalMessage(password:string,message:Hex){const mnemonic=await decryptWallet(password);return privateAccountFromMnemonic(mnemonic).signMessage({message:{raw:message}})}
export async function signDappTransaction(chain:Chain,password:string,tx:{to:Address;value?:bigint;data?:Hex;gas?:bigint;gasPrice?:bigint;nonce?:number}){const mnemonic=await decryptWallet(password);const account=privateAccountFromMnemonic(mnemonic);const client=publicClientFor(chain);const nonce=tx.nonce??await client.getTransactionCount({address:account.address,blockTag:'pending'});const gas=tx.gas??await client.estimateGas({account:account.address,to:tx.to,value:tx.value??0n,data:tx.data});const gasPrice=tx.gasPrice??await client.getGasPrice();const balance=await client.getBalance({address:account.address});const total=(tx.value??0n)+gas*gasPrice;if(balance<total)throw new ProviderRpcError(-32000,'Insufficient funds for transaction and gas.');const wallet=createWalletClient({account,chain,transport:http()});const hash=await wallet.sendTransaction({...tx,nonce,gas,gasPrice});return hash as Hash}
export function normalizeDappMessage(value:unknown):Hex{if(typeof value!=='string'||!/^0x[0-9a-fA-F]*$/.test(value))throw new ProviderRpcError(-32602,'personal_sign requires a hex message.');return value as Hex}

import type { Address, Chain } from 'viem';
import { publicClientFor } from '../providers';
export async function simulateNativeTransfer(chain:Chain,from:Address,to:Address,value:bigint){const client=publicClientFor(chain);const gas=await client.estimateGas({account:from,to,value});const gasPrice=await client.getGasPrice();const balance=await client.getBalance({address:from});if(balance<value+gas*gasPrice)throw new Error('Insufficient balance for amount plus estimated network fee.');return{gas,gasPrice,fee:gas*gasPrice,total:value+gas*gasPrice};}

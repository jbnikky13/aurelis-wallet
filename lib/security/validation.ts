import {isAddress,type Address,type Hex} from 'viem';
export function assertAddress(value:unknown):Address{if(typeof value!=='string'||!isAddress(value))throw new Error('Invalid wallet address.');return value as Address}
export function assertHex(value:unknown):Hex{if(typeof value!=='string'||!/^0x[0-9a-fA-F]*$/.test(value))throw new Error('Invalid hexadecimal data.');return value as Hex}
export function assertAmount(value:bigint){if(value<0n)throw new Error('Amount cannot be negative.');return value}
export function assertChain(expected:number,actual:number){if(expected!==actual)throw new Error(`Wrong network: expected ${expected}, received ${actual}.`)}

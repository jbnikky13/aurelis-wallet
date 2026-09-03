import {describe,expect,it} from 'vitest';
import {assertAddress,assertAmount,assertChain,assertHex} from '../lib/security/validation';
import {normalizeTransaction} from '../lib/security/approval';
describe('AURELIS security validation',()=>{
 it('accepts valid addresses and hex',()=>{expect(assertAddress('0x0000000000000000000000000000000000000001')).toBeTruthy();expect(assertHex('0x1234')).toBe('0x1234')});
 it('rejects invalid input',()=>{expect(()=>assertAddress('bad')).toThrow();expect(()=>assertHex('1234')).toThrow();expect(()=>assertAmount(-1n)).toThrow()});
 it('enforces chain identity',()=>{expect(()=>assertChain(1,8453)).toThrow();expect(assertChain(1,1)).toBeUndefined()});
 it('normalizes transactions',()=>{const tx=normalizeTransaction({to:'0x0000000000000000000000000000000000000001',value:5n,chainId:1});expect(tx.value).toBe(5n)})
});

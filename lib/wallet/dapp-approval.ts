import type { Address } from 'viem';
import { enqueueDappRequest } from './dapp-queue';
import { validateDappRequest } from './dapp';
import { normalizeDappTransaction } from '../security/dapp';

export function queueTransaction(origin: string, chainId: number, account: Address, params: unknown[]) {
  validateDappRequest({ origin, method: 'eth_sendTransaction', params });
  const normalized = normalizeDappTransaction(params, chainId, account);
  return enqueueDappRequest({
    origin,
    kind: 'transaction',
    method: 'eth_sendTransaction',
    params: [{
      from: normalized.from,
      to: normalized.to,
      value: `0x${normalized.value.toString(16)}`,
      ...(normalized.data !== undefined ? { data: normalized.data } : {}),
      ...(normalized.gas !== undefined ? { gas: `0x${normalized.gas.toString(16)}` } : {}),
      ...(normalized.gasPrice !== undefined ? { gasPrice: `0x${normalized.gasPrice.toString(16)}` } : {}),
      ...(normalized.nonce !== undefined ? { nonce: `0x${normalized.nonce.toString(16)}` } : {}),
      chainId: `0x${normalized.chainId.toString(16)}`,
    }],
    chainId,
    account,
  });
}

export function queueMessageSignature(origin: string, chainId: number, account: Address, params: unknown[]) {
  validateDappRequest({ origin, method: 'personal_sign', params });
  return enqueueDappRequest({ origin, kind: 'message', method: 'personal_sign', params, chainId, account });
}

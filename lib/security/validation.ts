import { isAddress, type Address, type Hex } from 'viem';

export function assertAddress(value: unknown): Address {
  if (typeof value !== 'string' || !isAddress(value)) {
    throw new Error('Invalid wallet address.');
  }
  return value as Address;
}

export function assertHex(value: unknown): Hex {
  if (
    typeof value !== 'string' ||
    value.length < 4 ||
    !/^0x(?:[0-9a-fA-F]{2})*$/.test(value)
  ) {
    throw new Error('Invalid hexadecimal data.');
  }
  return value as Hex;
}

export function assertAmount(value: bigint): bigint {
  if (typeof value !== 'bigint' || value < 0n) {
    throw new Error('Amount must be a non-negative bigint.');
  }
  return value;
}

export function assertChain(expected: number, actual: number): void {
  if (
    !Number.isSafeInteger(expected) ||
    expected <= 0 ||
    !Number.isSafeInteger(actual) ||
    actual <= 0 ||
    expected !== actual
  ) {
    throw new Error(`Wrong network: expected ${expected}, received ${actual}.`);
  }
}


export function assertContractAddress(value: unknown): Address {
  if (typeof value !== 'string' || !/^0x[0-9a-fA-F]{40}$/.test(value) || !isAddress(value)) {
    throw new Error('Invalid contract address.');
  }
  return value as Address;
}

export function readStoredContractAddress(key = 'aurelis.pharmatrace.contractAddress'): Address | null {
  if (typeof window === 'undefined') return null;
  const value = window.localStorage.getItem(key);
  if (!value) return null;
  try {
    return assertContractAddress(value.trim());
  } catch {
    return null;
  }
}

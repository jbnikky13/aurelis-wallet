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

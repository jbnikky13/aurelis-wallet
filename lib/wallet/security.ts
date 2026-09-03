export function validateAmount(value: string) {
  if (!value.trim()) throw new Error('Amount is required.');
  if (!/^\d+(\.\d+)?$/.test(value) || Number(value) <= 0) throw new Error('Enter a valid positive amount.');
  return value;
}

export function assertNotSameAddress(from: string, to: string) {
  if (from.toLowerCase() === to.toLowerCase()) throw new Error('Recipient must be different from the sending wallet.');
}

export function assertMainnetReady(allowMainnet: boolean) {
  if (!allowMainnet && typeof window !== 'undefined' && localStorage.getItem('aurelis.mainnet.enabled') !== 'true') {
    throw new Error('Mainnet transfers are locked until testnet verification is completed.');
  }
}

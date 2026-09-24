import { bytesToHex } from 'viem';
import { english, generateMnemonic, mnemonicToAccount } from 'viem/accounts';

export function createMnemonic() {
  return generateMnemonic(english);
}

export function accountFromMnemonic(mnemonic: string) {
  return mnemonicToAccount(mnemonic);
}

export function validateMnemonic(mnemonic: string) {
  try {
    mnemonicToAccount(mnemonic);
    return true;
  } catch {
    return false;
  }
}

/**
 * Derives the wallet's raw private key from its recovery phrase.
 * This must only be called after the user has explicitly re-authenticated.
 */
export function privateKeyFromMnemonic(mnemonic: string) {
  const privateKey = accountFromMnemonic(mnemonic).getHdKey().privateKey;
  if (!privateKey) throw new Error('Unable to derive the wallet private key.');
  return typeof privateKey === 'string' ? privateKey : bytesToHex(privateKey);
}

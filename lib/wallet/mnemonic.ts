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

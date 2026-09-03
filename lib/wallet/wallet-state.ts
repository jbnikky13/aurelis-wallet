import type { Address } from 'viem';
import { decryptWallet, hasEncryptedWallet, deriveAccountFromMnemonic } from './crypto';

const ADDRESS_KEY='aurelis.wallet.address';
const UNLOCKED_KEY='aurelis.wallet.unlocked';
export function walletExists(){return hasEncryptedWallet();}
export async function unlockWallet(password:string){const mnemonic=await decryptWallet(password);const account=deriveAccountFromMnemonic(mnemonic);localStorage.setItem(ADDRESS_KEY,account.address);localStorage.setItem(UNLOCKED_KEY,'true');return account.address as Address;}
export function lockWallet(){localStorage.removeItem(UNLOCKED_KEY);}
export function isWalletUnlocked(){return typeof window!=='undefined'&&localStorage.getItem(UNLOCKED_KEY)==='true';}
export function currentWalletAddress(){return typeof window!=='undefined'?(localStorage.getItem(ADDRESS_KEY) as Address|null):null;}

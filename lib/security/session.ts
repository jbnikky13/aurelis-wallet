const KEY='aurelis.session.expiresAt';
const DEFAULT_IDLE_MS=15*60*1000;
export function startWalletSession(idleMs=DEFAULT_IDLE_MS){if(typeof window==='undefined')return;sessionStorage.setItem(KEY,String(Date.now()+idleMs))}
export function touchWalletSession(idleMs=DEFAULT_IDLE_MS){startWalletSession(idleMs)}
export function isWalletSessionActive(){if(typeof window==='undefined')return false;const expiry=Number(sessionStorage.getItem(KEY)||0);return Number.isFinite(expiry)&&expiry>Date.now()}
export function endWalletSession(){if(typeof window!=='undefined')sessionStorage.removeItem(KEY)}

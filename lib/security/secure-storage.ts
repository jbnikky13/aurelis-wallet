const PREFIX='aurelis.secure.';
export function setSecureRecord(key:string,value:string){if(typeof window==='undefined')throw new Error('Secure storage requires a browser.');sessionStorage.setItem(PREFIX+key,value)}
export function getSecureRecord(key:string){if(typeof window==='undefined')return null;return sessionStorage.getItem(PREFIX+key)}
export function clearSecureRecord(key:string){if(typeof window!=='undefined')sessionStorage.removeItem(PREFIX+key)}
export function clearAllSecureRecords(){if(typeof window!=='undefined')for(let i=sessionStorage.length-1;i>=0;i--){const k=sessionStorage.key(i);if(k?.startsWith(PREFIX))sessionStorage.removeItem(k)}}

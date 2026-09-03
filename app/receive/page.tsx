'use client';

import { useEffect, useState } from 'react';
import { accountFromMnemonic } from '@/lib/wallet/mnemonic';
import { decryptWallet } from '@/lib/wallet/crypto';

export default function ReceivePage() {
  const [address, setAddress] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState('');
  useEffect(() => { const saved = localStorage.getItem('aurelis.cached.address'); if (saved) setAddress(saved); }, []);
  async function unlock() { try { setError(''); const phrase=await decryptWallet(password); const account=accountFromMnemonic(phrase); setAddress(account.address); localStorage.setItem('aurelis.cached.address', account.address); } catch { setError('Unable to unlock wallet.'); } }
  return <main className="shell"><section className="card form"><p className="eyebrow">AURELIS • RECEIVE</p><h1>Receive crypto</h1><p className="muted">Share your public address only. Never share your recovery phrase or private key.</p>{address ? <><div className="address-box">{address}</div><button className="primary" onClick={()=>navigator.clipboard?.writeText(address)}>Copy address</button></> : <><label>Wallet password</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Unlock wallet"/><button className="primary" onClick={unlock}>Show address</button></>}{error&&<div className="error">{error}</div>}<a href="/">Back to wallet</a></section></main>;
}

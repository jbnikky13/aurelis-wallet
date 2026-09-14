'use client';

import { useEffect, useState } from 'react';
import { accountFromMnemonic } from '@/lib/wallet/mnemonic';
import { decryptWallet } from '@/lib/wallet/crypto';

function qrUrl(address: string) { return `https://quickchart.io/qr?text=${encodeURIComponent(address)}&size=320&margin=2`; }

export default function ReceivePage() {
  const [address, setAddress] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState(''); const [copied, setCopied] = useState(false);
  useEffect(() => { const saved = localStorage.getItem('aurelis.cached.address'); if (saved) setAddress(saved); }, []);
  async function unlock() { try { setError(''); const phrase = await decryptWallet(password); const account = accountFromMnemonic(phrase); setAddress(account.address); localStorage.setItem('aurelis.cached.address', account.address); setPassword(''); } catch { setError('Unable to unlock wallet.'); } }
  async function copyAddress() { try { await navigator.clipboard.writeText(address); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch { setError('Unable to copy address. Press and hold the address to copy it.'); } }
  return <main className="shell"><section className="card form"><p className="eyebrow">AURELIS • RECEIVE</p><h1>Receive crypto</h1><p className="muted">Share your public address only. Never share your recovery phrase or private key.</p>
    {address ? <><div className="qr-card"><img src={qrUrl(address)} alt="QR code for AURELIS wallet address" width={240} height={240}/><span className="muted">Scan this QR code to send assets to this wallet.</span></div><div className="address-box">{address}</div><button className="primary" onClick={copyAddress}>{copied ? 'Address copied ✓' : 'Copy address'}</button></> : <><label>Wallet password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Unlock wallet"/><button className="primary" onClick={unlock}>Show address</button></>}
    {error && <div className="error">{error}</div>}<a href="/">Back to wallet</a>
  </section></main>;
}

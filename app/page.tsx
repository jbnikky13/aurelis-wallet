'use client';

import { useEffect, useMemo, useState } from 'react';
import { formatEther } from 'viem';
import { accountFromMnemonic } from '@/lib/wallet/mnemonic';
import { decryptWallet, hasEncryptedWallet } from '@/lib/wallet/crypto';
import { AURELIS_CHAINS, DEFAULT_CHAIN } from '@/lib/chains';
import { publicClientFor } from '@/lib/providers';

export default function Home() {
  const [address, setAddress] = useState<`0x${string}` | null>(null);
  const [balance, setBalance] = useState('0');
  const [unlock, setUnlock] = useState('');
  const [error, setError] = useState('');
  const [chainId, setChainId] = useState<number>(DEFAULT_CHAIN.id);
  const chain = useMemo(() => AURELIS_CHAINS.find((c) => c.id === chainId) ?? DEFAULT_CHAIN, [chainId]);

  useEffect(() => { const params = new URLSearchParams(window.location.search); const a = params.get('address') as `0x${string}` | null; if (a) setAddress(a); }, []);
  useEffect(() => { if (!address) return; let active = true; publicClientFor(chain).getBalance({ address }).then(v => active && setBalance(formatEther(v))).catch(() => active && setBalance('0')); return () => { active = false; }; }, [address, chain]);
  async function unlockWallet() { try { setError(''); const phrase = await decryptWallet(unlock); setAddress(accountFromMnemonic(phrase).address); setUnlock(''); } catch { setError('Unable to unlock wallet. Check your password.'); } }

  if (!address) return <main className="shell"><section className="card hero"><p className="eyebrow">AURELIS</p><h1>Your keys.<br/>Your assets.<br/>Your control.</h1><p className="muted">A clean, non-custodial multi-chain wallet.</p><div className="actions"><a className="primary" href="/wallet/create">Create wallet</a><a className="secondary" href="/wallet/import">Import wallet</a></div>{hasEncryptedWallet() && <div className="unlock"><label>Unlock existing wallet</label><input type="password" value={unlock} onChange={e => setUnlock(e.target.value)} placeholder="Wallet password"/><button className="primary" onClick={unlockWallet}>Unlock</button>{error && <div className="error">{error}</div>}</div>}</section></main>;

  return <main className="shell"><header className="top"><div><p className="eyebrow">AURELIS</p><h2>Portfolio</h2></div><span className="address">{address.slice(0,6)}…{address.slice(-4)}</span></header><section className="balance"><span>Total balance on {chain.name}</span><strong>{Number(balance).toFixed(6)} {chain.nativeCurrency.symbol}</strong></section><section className="grid"><div className="card"><span className="muted">Network</span><select value={chainId} onChange={e => setChainId(Number(e.target.value))}>{AURELIS_CHAINS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div><div className="card"><span className="muted">Wallet address</span><p className="address-full">{address}</p></div></section><nav className="nav"><a href="/send">Send</a><a href="/receive">Receive</a><a href="/assets">Assets</a><a href="/transactions">Transactions</a></nav></main>;
}

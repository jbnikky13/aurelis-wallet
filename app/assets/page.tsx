'use client';

import { useEffect, useState } from 'react';
import { formatEther } from 'viem';
import { AURELIS_CHAINS } from '@/lib/chains';
import { publicClientFor } from '@/lib/providers';

export default function AssetsPage() {
  const [address,setAddress]=useState(''); const [balances,setBalances]=useState<Record<number,string>>({});
  useEffect(()=>{const a=localStorage.getItem('aurelis.cached.address'); if(a)setAddress(a);},[]);
  useEffect(()=>{if(!address)return; Promise.all(AURELIS_CHAINS.map(async c=>[c.id,formatEther(await publicClientFor(c).getBalance({address:address as `0x${string}`}))] as const)).then(x=>setBalances(Object.fromEntries(x))).catch(()=>{});},[address]);
  return <main className="shell"><section className="card"><p className="eyebrow">AURELIS • ASSETS</p><h1>Multi-chain assets</h1><p className="muted">Native balances across supported networks.</p><div className="asset-list">{AURELIS_CHAINS.map(c=><div className="asset-row" key={c.id}><span>{c.name}</span><strong>{balances[c.id] ? Number(balances[c.id]).toFixed(6) : '—'} {c.nativeCurrency.symbol}</strong></div>)}</div><a href="/">Back to wallet</a></section></main>;
}

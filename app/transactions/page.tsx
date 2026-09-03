'use client';

import { useState } from 'react';
import { AURELIS_CHAINS } from '@/lib/chains';

export default function TransactionsPage() {
  const [chainId,setChainId]=useState(AURELIS_CHAINS[0].id); const chain=AURELIS_CHAINS.find(c=>c.id===chainId)!;
  return <main className="shell"><section className="card"><p className="eyebrow">AURELIS • ACTIVITY</p><h1>Transaction history</h1><p className="muted">Choose a network to view activity. Explorer indexing will be connected in the next data layer.</p><select value={chainId} onChange={e=>setChainId(Number(e.target.value))}>{AURELIS_CHAINS.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select><div className="empty"><strong>No indexed transactions yet</strong><span>Transactions broadcast by AURELIS can be opened through {chain.name}'s explorer once indexing is enabled.</span></div><a href="/">Back to wallet</a></section></main>;
}

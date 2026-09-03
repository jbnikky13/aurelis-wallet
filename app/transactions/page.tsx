'use client';

import { useEffect, useState } from 'react';
import { AURELIS_CHAINS } from '@/lib/chains';
import { getActivity, type WalletActivity } from '@/lib/wallet/activity';

export default function TransactionsPage() {
  const [chainId,setChainId]=useState(AURELIS_CHAINS[0].id); const [items,setItems]=useState<WalletActivity[]>([]);
  useEffect(()=>setItems(getActivity()),[]);
  const visible=items.filter(x=>x.chainId===chainId); const chain=AURELIS_CHAINS.find(c=>c.id===chainId)!;
  return <main className="shell"><section className="card"><p className="eyebrow">AURELIS • ACTIVITY</p><h1>Transaction history</h1><select value={chainId} onChange={e=>setChainId(Number(e.target.value))}>{AURELIS_CHAINS.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select><div className="asset-list">{visible.length ? visible.map(x=><div className="asset-row" key={x.hash}><span><strong>{x.type.toUpperCase()}</strong><br/><small>{x.hash.slice(0,10)}…{x.hash.slice(-8)}</small></span><span>{x.status}</span></div>) : <div className="empty"><strong>No local activity on {chain.name}</strong><span>New broadcasts will appear here.</span></div>}</div><a href="/">Back to wallet</a></section></main>;
}

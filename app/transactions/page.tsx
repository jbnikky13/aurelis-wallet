'use client';

import { useCallback, useEffect, useState } from 'react';
import { formatEther, isAddress } from 'viem';
import { AURELIS_CHAINS } from '@/lib/chains';
import { getActivity, type WalletActivity } from '@/lib/wallet/activity';

export default function TransactionsPage() {
  const [chainId, setChainId] = useState(AURELIS_CHAINS[0].id);
  const [address, setAddress] = useState<string | null>(null);
  const [items, setItems] = useState<WalletActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [indexed, setIndexed] = useState<boolean | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const value = params.get('address');
    const requestedChain = Number(params.get('chainId'));
    setAddress(value && isAddress(value) ? value : null);
    if (AURELIS_CHAINS.some((chain) => chain.id === requestedChain)) setChainId(requestedChain);
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    const local = getActivity().filter((item) => item.chainId === chainId);
    if (!address) { setItems(local); setIndexed(false); setLoading(false); return; }
    try {
      const response = await fetch(`/api/activity?address=${encodeURIComponent(address)}&chainId=${chainId}`, { cache: 'no-store' });
      const data = await response.json() as { items?: WalletActivity[]; indexed?: boolean };
      const merged = [...local, ...(data.items ?? [])];
      const unique = Array.from(new Map(merged.map((item) => [item.hash, item])).values());
      unique.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      setItems(unique);
      setIndexed(Boolean(data.indexed));
    } catch {
      setItems(local);
      setIndexed(false);
    } finally { setLoading(false); }
  }, [address, chainId]);

  useEffect(() => { void refresh(); }, [refresh]);

  const chain = AURELIS_CHAINS.find((c) => c.id === chainId)!;
  const isArc = chain.id === 5042;
  return <main className="shell"><section className="card">
    <p className="eyebrow">AURELIS • ACTIVITY</p><h1>Transaction history</h1>
    <p className="muted">{isArc ? 'Arc uses deterministic finality: one committed block is final.' : 'On-chain activity is merged with locally recorded broadcasts.'}</p>
    <select value={chainId} onChange={(e) => setChainId(Number(e.target.value))}>{AURELIS_CHAINS.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
    <button className="secondary" onClick={() => void refresh()} disabled={loading}>{loading ? 'Refreshing…' : 'Refresh history'}</button>
    {indexed === false && <p className="muted">On-chain history is temporarily unavailable. Locally recorded broadcasts remain visible.</p>}
    <div className="asset-list">{items.length ? items.map((x) => <div className="asset-row" key={x.hash}>
      <span><strong>{x.type.toUpperCase()}</strong><br/><small>{x.amount ? formatEther(BigInt(x.amount)) : '—'} {x.symbol ?? chain.nativeCurrency.symbol}</small><br/><small>{x.hash.slice(0, 10)}…{x.hash.slice(-8)}</small></span><span>{x.status}</span>
    </div>) : <div className="empty"><strong>No activity on {chain.name}</strong><span>Refresh after a transaction is confirmed.</span></div>}</div>
    <a href="/">Back to wallet</a>
  </section></main>;
}

'use client';

import { useCallback, useEffect, useState } from 'react';
import { formatEther } from 'viem';
import { AURELIS_CHAINS } from '@/lib/chains';
import { getActivity, type WalletActivity } from '@/lib/wallet/activity';
import { accountFromMnemonic } from '@/lib/wallet/mnemonic';
import { decryptWallet } from '@/lib/wallet/crypto';

export default function TransactionsPage() {
  const [chainId, setChainId] = useState(AURELIS_CHAINS[0].id);
  const [address, setAddress] = useState<string | null>(null);
  const [items, setItems] = useState<WalletActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [indexed, setIndexed] = useState<boolean | null>(null);

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
      setItems(unique); setIndexed(Boolean(data.indexed));
    } catch { setItems(local); setIndexed(false); }
    finally { setLoading(false); }
  }, [address, chainId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!cancelled) {
          const phrase = await decryptWallet('');
          setAddress(accountFromMnemonic(phrase).address);
        }
      } catch { /* Locked wallet: local activity still works. */ }
      await refresh();
    })();
    return () => { cancelled = true; };
  }, [refresh]);

  const chain = AURELIS_CHAINS.find((c) => c.id === chainId)!;
  return <main className="shell"><section className="card">
    <p className="eyebrow">AURELIS • ACTIVITY</p><h1>Transaction history</h1>
    <select value={chainId} onChange={(e) => setChainId(Number(e.target.value))}>{AURELIS_CHAINS.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
    <button className="secondary" onClick={refresh} disabled={loading}>{loading ? 'Refreshing…' : 'Refresh history'}</button>
    {indexed === false && <p className="muted">On-chain history is unavailable until the explorer API is configured. Locally recorded broadcasts remain visible.</p>}
    <div className="asset-list">{items.length ? items.map((x) => <div className="asset-row" key={x.hash}>
      <span><strong>{x.type.toUpperCase()}</strong><br/><small>{x.amount ? formatEther(BigInt(x.amount)) : '—'} {x.symbol ?? chain.nativeCurrency.symbol}</small><br/><small>{x.hash.slice(0, 10)}…{x.hash.slice(-8)}</small></span><span>{x.status}</span>
    </div>) : <div className="empty"><strong>No activity on {chain.name}</strong><span>Pull down/refresh after a transaction is confirmed.</span></div>}</div>
    <a href="/">Back to wallet</a>
  </section></main>;
}

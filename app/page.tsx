'use client';

import { useState } from 'react';
import { formatUsd } from '@/lib/wallet/format';

const assets = [
  { symbol: 'ETH', name: 'Ethereum', amount: '0.00', price: 0 },
  { symbol: 'USDC', name: 'USD Coin', amount: '0.00', price: 1 },
  { symbol: 'USDT', name: 'Tether', amount: '0.00', price: 1 },
];

const networks = ['Base', 'Ethereum', 'BNB Chain', 'Polygon', 'Arbitrum', 'Optimism', 'Avalanche'];

export default function Home() {
  const [network, setNetwork] = useState('Base');
  const [showReceive, setShowReceive] = useState(false);
  const [address] = useState('0x0000000000000000000000000000000000000000');

  return (
    <main className="min-h-screen px-5 py-6 md:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex items-center justify-between">
          <div><div className="text-2xl font-black tracking-tight">AURELIS</div><div className="muted text-xs">Web3 wallet</div></div>
          <div className="card flex items-center gap-2 px-3 py-2 text-sm">
            <span className="h-2 w-2 rounded-full bg-green-400" />
            <select value={network} onChange={(e) => setNetwork(e.target.value)} className="bg-transparent outline-none">{networks.map(n => <option className="bg-[#0d1118]" key={n}>{n}</option>)}</select>
          </div>
        </header>

        <section className="card mb-6 overflow-hidden p-7 md:p-10">
          <div className="muted text-sm">Total portfolio</div>
          <div className="mt-2 text-4xl font-bold">{formatUsd(0)}</div>
          <div className="muted mt-2 text-sm">No assets yet • {network}</div>
          <div className="mt-7 flex flex-wrap gap-3">
            <button className="rounded-xl bg-white px-5 py-3 font-semibold text-black">+ Add funds</button>
            <button onClick={() => setShowReceive(true)} className="rounded-xl border border-[#263142] px-5 py-3 font-semibold">Receive</button>
            <button className="rounded-xl border border-[#263142] px-5 py-3 font-semibold">Send</button>
          </div>
        </section>

        <div className="grid gap-6 md:grid-cols-[1.4fr_1fr]">
          <section className="card p-6">
            <div className="mb-5 flex items-center justify-between"><h2 className="text-lg font-semibold">Assets</h2><button className="muted text-sm">View all</button></div>
            <div className="space-y-2">{assets.map(asset => <div key={asset.symbol} className="flex items-center justify-between rounded-2xl p-3 hover:bg-white/5"><div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-full bg-white/10 font-bold">{asset.symbol[0]}</div><div><div className="font-medium">{asset.name}</div><div className="muted text-xs">{asset.amount} {asset.symbol}</div></div></div><div className="text-right"><div>{formatUsd(asset.price * Number(asset.amount))}</div><div className="muted text-xs">{asset.price ? formatUsd(asset.price) : '—'}</div></div></div>)}</div>
          </section>

          <section className="card p-6">
            <h2 className="text-lg font-semibold">Recent activity</h2>
            <div className="grid min-h-48 place-items-center text-center"><div><div className="text-3xl">◌</div><p className="muted mt-3 text-sm">Transactions will appear here</p></div></div>
          </section>
        </div>

        <footer className="muted mt-8 text-center text-xs">AURELIS is non-custodial. Never share your recovery phrase or private keys.</footer>
      </div>

      {showReceive && <div className="fixed inset-0 grid place-items-center bg-black/70 p-5" onClick={() => setShowReceive(false)}><div className="card w-full max-w-md p-7" onClick={e => e.stopPropagation()}><div className="flex justify-between"><h2 className="text-xl font-bold">Receive on {network}</h2><button onClick={() => setShowReceive(false)}>✕</button></div><p className="muted mt-2 text-sm">Send only compatible assets to this address.</p><div className="my-7 break-all rounded-xl border border-[#263142] p-4 font-mono text-xs">{address}</div><button onClick={() => navigator.clipboard?.writeText(address)} className="w-full rounded-xl bg-white py-3 font-semibold text-black">Copy address</button></div></div>}
    </main>
  );
}

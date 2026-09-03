'use client';

import { useEffect, useState } from 'react';
import { AURELIS_CHAINS } from '@/lib/chains';
import { formatUsd, portfolioTotal, type AssetQuote } from '@/lib/wallet/portfolio';

export default function PortfolioPage(){const [quotes,setQuotes]=useState<AssetQuote[]>([]);useEffect(()=>{const cached=localStorage.getItem('aurelis.quotes.v1');if(cached)try{setQuotes(JSON.parse(cached))}catch{}},[]);return <main className="shell"><section className="card"><p className="eyebrow">AURELIS • PORTFOLIO</p><h1>{formatUsd(portfolioTotal(quotes))}</h1><p className="muted">Portfolio valuation is ready for live price feeds. Current chain coverage: {AURELIS_CHAINS.length} networks.</p><div className="asset-list">{quotes.map(q=><div className="asset-row" key={`${q.chainId}-${q.symbol}`}><span>{q.symbol}</span><strong>{formatUsd(q.valueUsd)}</strong></div>)}</div>{!quotes.length&&<div className="empty"><strong>Price feed not connected yet</strong><span>Once a market-data provider is configured, AURELIS can populate live portfolio values.</span></div>}<a href="/">Back to wallet</a></section></main>}

'use client';

import { useEffect, useState } from 'react';

export default function SecurityPage() {
  const [testnet,setTestnet]=useState(false); const [mainnet,setMainnet]=useState(false);
  useEffect(()=>{setTestnet(localStorage.getItem('aurelis.testnet.mode')!=='false');setMainnet(localStorage.getItem('aurelis.mainnet.enabled')==='true');},[]);
  return <main className="shell"><section className="card form"><p className="eyebrow">AURELIS • SECURITY</p><h1>Security controls</h1><p className="muted">Mainnet transfers remain disabled by default while the wallet is being verified.</p><label><input type="checkbox" checked={testnet} onChange={e=>{setTestnet(e.target.checked);localStorage.setItem('aurelis.testnet.mode',String(e.target.checked));}}/> Testnet mode</label><label><input type="checkbox" checked={mainnet} onChange={e=>{setMainnet(e.target.checked);localStorage.setItem('aurelis.mainnet.enabled',String(e.target.checked));}}/> Enable mainnet transfers</label><p className="muted">Only enable mainnet after you have verified the wallet with test funds and understand that blockchain transactions cannot normally be reversed.</p><a href="/">Back to wallet</a></section></main>;
}

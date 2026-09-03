'use client';

import { useState } from 'react';
import { createMnemonic } from '@/lib/wallet/mnemonic';
import { encryptWallet } from '@/lib/wallet/crypto';
import { accountFromMnemonic } from '@/lib/wallet/mnemonic';

export default function CreateWalletPage() {
  const [mnemonic, setMnemonic] = useState('');
  const [password, setPassword] = useState('');
  const [created, setCreated] = useState(false);
  const [error, setError] = useState('');

  function generate() {
    setError('');
    setMnemonic(createMnemonic());
  }

  async function secureWallet() {
    try {
      if (!mnemonic || password.length < 8) throw new Error('Generate a recovery phrase and use a password of at least 8 characters.');
      const account = accountFromMnemonic(mnemonic);
      await encryptWallet(mnemonic, password);
      setCreated(true);
      window.history.replaceState({}, '', `/?address=${account.address}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to secure wallet.');
    }
  }

  return (
    <main className="shell">
      <section className="card wallet-create">
        <p className="eyebrow">AURELIS WALLET</p>
        <h1>Create your wallet</h1>
        <p className="muted">Your recovery phrase controls the wallet. Never share it with anyone.</p>
        <button className="primary" onClick={generate}>Generate recovery phrase</button>
        {mnemonic && <div className="phrase"><strong>Recovery phrase</strong><p>{mnemonic}</p></div>}
        {mnemonic && !created && <>
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" />
          <button className="primary" onClick={secureWallet}>Encrypt & open AURELIS</button>
        </>}
        {created && <div className="success">Wallet encrypted locally on this device.</div>}
        {error && <div className="error">{error}</div>}
        <a href="/">Back to dashboard</a>
      </section>
    </main>
  );
}

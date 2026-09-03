'use client';

import { useState } from 'react';
import { accountFromMnemonic, validateMnemonic } from '@/lib/wallet/mnemonic';
import { encryptWallet } from '@/lib/wallet/crypto';

export default function ImportWalletPage() {
  const [mnemonic, setMnemonic] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function submit() {
    try {
      const phrase = mnemonic.trim().replace(/\s+/g, ' ');
      if (!validateMnemonic(phrase)) throw new Error('Invalid recovery phrase.');
      if (password.length < 8) throw new Error('Password must be at least 8 characters.');
      const account = accountFromMnemonic(phrase);
      await encryptWallet(phrase, password);
      window.location.href = `/?address=${account.address}`;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to import wallet.');
    }
  }

  return (
    <main className="shell">
      <section className="card wallet-create">
        <p className="eyebrow">AURELIS WALLET</p>
        <h1>Import wallet</h1>
        <p className="muted">Recovery phrases are processed locally and encrypted before storage.</p>
        <label>Recovery phrase</label>
        <textarea value={mnemonic} onChange={(e) => setMnemonic(e.target.value)} placeholder="Enter your recovery phrase" rows={5} />
        <label>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" />
        <button className="primary" onClick={submit}>Import & encrypt wallet</button>
        {error && <div className="error">{error}</div>}
        <a href="/">Back to dashboard</a>
      </section>
    </main>
  );
}

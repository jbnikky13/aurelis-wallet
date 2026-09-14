'use client';

import { useState } from 'react';
import { accountFromMnemonic, validateMnemonic } from '@/lib/wallet/mnemonic';
import { encryptWallet } from '@/lib/wallet/crypto';

const MIN_PASSWORD_LENGTH = 12;

export default function ImportWalletPage() {
  const [mnemonic, setMnemonic] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (busy) return;
    try {
      setBusy(true);
      setError('');
      const phrase = mnemonic.trim().replace(/\s+/g, ' ');
      if (!validateMnemonic(phrase)) throw new Error('Invalid recovery phrase.');
      if (password.length < MIN_PASSWORD_LENGTH) {
        throw new Error(`Wallet password must contain at least ${MIN_PASSWORD_LENGTH} characters.`);
      }
      const account = accountFromMnemonic(phrase);
      await encryptWallet(phrase, password);
      setPassword('');
      window.location.href = `/?address=${account.address}`;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to import wallet.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="shell">
      <section className="card wallet-create">
        <p className="eyebrow">AURELIS WALLET • PHASE 10</p>
        <h1>Import wallet</h1>
        <p className="muted">Recovery phrases are processed locally and encrypted before storage.</p>
        <label>Recovery phrase</label>
        <textarea
          value={mnemonic}
          onChange={(event) => setMnemonic(event.target.value)}
          placeholder="Enter your recovery phrase"
          rows={5}
          autoComplete="off"
          spellCheck={false}
        />
        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
          autoComplete="new-password"
        />
        <button className="primary" onClick={submit} disabled={busy}>
          {busy ? 'Importing…' : 'Import & encrypt wallet'}
        </button>
        {error && <div className="error">{error}</div>}
        <a href="/">Back to dashboard</a>
      </section>
    </main>
  );
}

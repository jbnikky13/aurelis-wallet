'use client';

import { useState } from 'react';
import { createMnemonic, accountFromMnemonic } from '@/lib/wallet/mnemonic';
import { encryptWallet } from '@/lib/wallet/crypto';

const MIN_PASSWORD_LENGTH = 12;

export default function CreateWalletPage() {
  const [mnemonic, setMnemonic] = useState('');
  const [password, setPassword] = useState('');
  const [created, setCreated] = useState(false);
  const [error, setError] = useState('');

  function generate() {
    setError('');
    setCreated(false);
    setMnemonic(createMnemonic());
  }

  async function secureWallet() {
    try {
      if (!mnemonic) throw new Error('Generate a recovery phrase first.');
      if (password.length < MIN_PASSWORD_LENGTH) {
        throw new Error(`Wallet password must contain at least ${MIN_PASSWORD_LENGTH} characters.`);
      }
      const account = accountFromMnemonic(mnemonic);
      await encryptWallet(mnemonic, password);
      setPassword('');
      setCreated(true);
      window.history.replaceState({}, '', `/?address=${account.address}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to secure wallet.');
    }
  }

  return (
    <main className="shell">
      <section className="card wallet-create">
        <p className="eyebrow">AURELIS WALLET • PHASE 10</p>
        <h1>Create your wallet</h1>
        <p className="muted">Your recovery phrase controls the wallet. Never share it with anyone.</p>
        <button className="primary" onClick={generate}>Generate recovery phrase</button>
        {mnemonic && (
          <div className="phrase">
            <strong>Recovery phrase</strong>
            <p>{mnemonic}</p>
          </div>
        )}
        {mnemonic && !created && (
          <>
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
              autoComplete="new-password"
            />
            <button className="primary" onClick={secureWallet}>Encrypt & open AURELIS</button>
          </>
        )}
        {created && <div className="success">Wallet encrypted locally on this device.</div>}
        {error && <div className="error">{error}</div>}
        <a href="/">Back to dashboard</a>
      </section>
    </main>
  );
}

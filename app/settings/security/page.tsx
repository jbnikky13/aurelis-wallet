'use client';

import { useState } from 'react';
import { decryptWallet } from '@/lib/wallet/crypto';
import { privateKeyFromMnemonic } from '@/lib/wallet/mnemonic';

export default function SecurityPage() {
  const [testnet, setTestnet] = useState(() =>
    typeof window !== 'undefined' ? localStorage.getItem('aurelis.testnet.mode') !== 'false' : false,
  );
  const [mainnet, setMainnet] = useState(() =>
    typeof window !== 'undefined' ? localStorage.getItem('aurelis.mainnet.enabled') === 'true' : false,
  );
  const [password, setPassword] = useState('');
  const [secret, setSecret] = useState<{ recoveryPhrase: string; privateKey: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const [contractAddress, setContractAddress] = useState('');
  const [contractSaved, setContractSaved] = useState(false);

  function loadContractAddress() {
    const saved = localStorage.getItem('aurelis.pharmatrace.contractAddress') || '';
    setContractAddress(saved);
  }

  function saveContractAddress() {
    setError('');
    setContractSaved(false);
    const value = contractAddress.trim();
    if (!/^0x[0-9a-fA-F]{40}$/.test(value)) {
      setError('Enter a valid 20-byte contract address (0x followed by 40 hexadecimal characters). A private key is not a contract address.');
      return;
    }
    localStorage.setItem('aurelis.pharmatrace.contractAddress', value);
    setContractAddress(value);
    setContractSaved(true);
  }

  async function revealPrivateSecret() {
    if (busy) return;
    setError('');
    setBusy(true);
    try {
      if (!password) throw new Error('Enter your wallet password to reveal the private secret.');
      const recoveryPhrase = await decryptWallet(password);
      const privateKey = privateKeyFromMnemonic(recoveryPhrase);
      setSecret({ recoveryPhrase, privateKey });
      setPassword('');
    } catch (e) {
      setSecret(null);
      setError(e instanceof Error ? e.message : 'Unable to unlock the private secret.');
    } finally {
      setBusy(false);
    }
  }

  function hidePrivateSecret() {
    setSecret(null);
    setPassword('');
    setError('');
  }

  return (
    <main className="shell">
      <section className="card form">
        <p className="eyebrow">AURELIS • SECURITY</p>
        <h1>Security controls</h1>
        <p className="muted">Mainnet transfers remain disabled by default while the wallet is being verified.</p>

        <label>
          <input
            type="checkbox"
            checked={testnet}
            onChange={e => {
              setTestnet(e.target.checked);
              localStorage.setItem('aurelis.testnet.mode', String(e.target.checked));
            }}
          />{' '}
          Testnet mode
        </label>

        <label>
          <input
            type="checkbox"
            checked={mainnet}
            onChange={e => {
              setMainnet(e.target.checked);
              localStorage.setItem('aurelis.mainnet.enabled', String(e.target.checked));
            }}
          />{' '}
          Enable mainnet transfers
        </label>

        <p className="muted">
          Only enable mainnet after you have verified the wallet with test funds and understand that blockchain
          transactions cannot normally be reversed.
        </p>


        <hr />

        <p className="eyebrow">CONTRACT CONFIGURATION</p>
        <h2>PharmaTrace contract</h2>
        <p className="muted">Only the public deployed contract address belongs here. Never enter a seed phrase or private key.</p>
        <label htmlFor="pharmatrace-contract">Contract address</label>
        <input
          id="pharmatrace-contract"
          type="text"
          inputMode="text"
          autoComplete="off"
          spellCheck={false}
          value={contractAddress}
          onFocus={loadContractAddress}
          onChange={e => { setContractAddress(e.target.value); setContractSaved(false); }}
          placeholder="0x…40 hexadecimal characters"
        />
        <button className="primary" type="button" onClick={saveContractAddress}>Save contract address</button>
        {contractSaved && <div className="success">Contract address saved locally.</div>}

        <hr />

        <p className="eyebrow">PRIVATE SECRET</p>
        <h2>Recovery & private key</h2>
        <p className="muted">
          Your recovery phrase and private key control the wallet. They are never sent to a server.
          Re-authentication with your wallet password is required every time you reveal them.
        </p>

        {!secret ? (
          <>
            <label htmlFor="wallet-password">Wallet password</label>
            <input
              id="wallet-password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your wallet password"
              autoComplete="current-password"
            />
            <button className="primary" onClick={revealPrivateSecret} disabled={busy}>
              {busy ? 'Unlocking…' : 'Reveal private secret'}
            </button>
          </>
        ) : (
          <div className="phrase">
            <strong>Recovery phrase</strong>
            <p style={{ wordBreak: 'break-word' }}>{secret.recoveryPhrase}</p>
            <strong>Private key</strong>
            <p style={{ wordBreak: 'break-all' }}>{secret.privateKey}</p>
            <p className="muted">
              Never share either secret or store screenshots of them. Anyone with these credentials can control
              the wallet.
            </p>
            <button className="primary" onClick={hidePrivateSecret}>Hide private secret</button>
          </div>
        )}

        {error && <div className="error">{error}</div>}
        <a href="/">Back to wallet</a>
      </section>
    </main>
  );
}

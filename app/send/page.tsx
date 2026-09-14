'use client';

import { useMemo, useState } from 'react';
import { formatEther, isAddress, parseEther } from 'viem';
import { AURELIS_CHAINS, DEFAULT_CHAIN } from '@/lib/chains';
import { publicClientFor } from '@/lib/providers';
import { decryptWallet } from '@/lib/wallet/crypto';
import { accountFromMnemonic } from '@/lib/wallet/mnemonic';

export default function SendPage() {
  const [chainId, setChainId] = useState<number>(DEFAULT_CHAIN.id);
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const chain = useMemo(
    () => AURELIS_CHAINS.find((candidate) => candidate.id === chainId) ?? DEFAULT_CHAIN,
    [chainId],
  );

  async function send() {
    if (busy) return;
    try {
      setBusy(true);
      setError('');
      setStatus('Preparing transaction…');
      if (!isAddress(to)) throw new Error('Enter a valid recipient address.');
      if (!amount || Number(amount) <= 0) throw new Error('Enter an amount greater than zero.');

      const value = parseEther(amount);
      const mnemonic = await decryptWallet(password);
      const account = accountFromMnemonic(mnemonic);
      const client = publicClientFor(chain);
      const balance = await client.getBalance({ address: account.address });
      const gas = await client.estimateGas({ account, to: to as `0x${string}`, value });
      const gasPrice = await client.getGasPrice();
      const fee = gas * gasPrice;

      if (balance < value + fee) {
        throw new Error(
          `Insufficient ${chain.nativeCurrency.symbol} for the amount plus estimated network fee.`,
        );
      }

      const nonce = await client.getTransactionCount({ address: account.address });
      setStatus(
        `Ready to sign ${formatEther(value)} ${chain.nativeCurrency.symbol} on ${chain.name}.`,
      );

      const serialized = await account.signTransaction({
        to: to as `0x${string}`,
        value,
        gas,
        gasPrice,
        chainId: chain.id,
        nonce,
        type: 'legacy',
      });

      setStatus('Broadcasting transaction…');
      const txHash = await client.sendRawTransaction({ serializedTransaction: serialized });
      setStatus(`Broadcast successfully: ${txHash}`);
    } catch (e) {
      setStatus('');
      setError(e instanceof Error ? e.message : 'Transaction failed.');
    } finally {
      setBusy(false);
      setPassword('');
    }
  }

  return (
    <main className="shell">
      <section className="card form">
        <p className="eyebrow">AURELIS • SEND</p>
        <h1>Send {chain.nativeCurrency.symbol}</h1>
        <p className="muted">
          Native transfers are signed locally. Your recovery phrase is never sent to a server.
        </p>

        <label>Network</label>
        <select value={chainId} onChange={(event) => setChainId(Number(event.target.value))} disabled={busy}>
          {AURELIS_CHAINS.map((candidate) => (
            <option key={candidate.id} value={candidate.id}>
              {candidate.name} ({candidate.nativeCurrency.symbol})
            </option>
          ))}
        </select>

        <label>Recipient</label>
        <input
          value={to}
          onChange={(event) => setTo(event.target.value)}
          placeholder="0x…"
          autoComplete="off"
          spellCheck={false}
        />

        <label>Amount</label>
        <input
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          placeholder="0.00"
          inputMode="decimal"
        />

        <label>Wallet password</label>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Unlock to sign"
          autoComplete="current-password"
        />

        <button className="primary" onClick={send} disabled={busy}>
          {busy ? 'Sending…' : 'Review & send'}
        </button>
        {status && <div className="success">{status}</div>}
        {error && <div className="error">{error}</div>}
        <a href="/">Back to wallet</a>
      </section>
    </main>
  );
}

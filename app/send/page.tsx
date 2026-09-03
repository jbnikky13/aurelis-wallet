'use client';

import { useState } from 'react';
import { isAddress, parseEther, formatEther } from 'viem';
import { AURELIS_CHAINS, DEFAULT_CHAIN } from '@/lib/chains';
import { publicClientFor } from '@/lib/providers';
import { decryptWallet } from '@/lib/wallet/crypto';
import { accountFromMnemonic } from '@/lib/wallet/mnemonic';

export default function SendPage() {
  const [to, setTo] = useState(''); const [amount, setAmount] = useState(''); const [password, setPassword] = useState(''); const [status, setStatus] = useState(''); const [error, setError] = useState('');
  async function send() {
    try {
      setError(''); setStatus('Preparing transaction…');
      if (!isAddress(to)) throw new Error('Enter a valid recipient address.');
      const value = parseEther(amount);
      const mnemonic = await decryptWallet(password); const account = accountFromMnemonic(mnemonic); const client = publicClientFor(DEFAULT_CHAIN);
      const balance = await client.getBalance({ address: account.address });
      const gas = await client.estimateGas({ account, to: to as `0x${string}`, value }); const gasPrice = await client.getGasPrice();
      if (balance < value + gas * gasPrice) throw new Error('Insufficient native-token balance for amount and network fee.');
      setStatus(`Ready to sign ${formatEther(value)} ${DEFAULT_CHAIN.nativeCurrency.symbol}.`);
      const hash = await account.signTransaction({ to: to as `0x${string}`, value, gas, gasPrice, chainId: DEFAULT_CHAIN.id, nonce: await client.getTransactionCount({ address: account.address }), type: 'legacy' });
      const txHash = await client.sendRawTransaction({ serializedTransaction: hash });
      setStatus(`Broadcast: ${txHash}`);
    } catch (e) { setStatus(''); setError(e instanceof Error ? e.message : 'Transaction failed.'); }
  }
  return <main className="shell"><section className="card form"><p className="eyebrow">AURELIS • SEND</p><h1>Send {DEFAULT_CHAIN.nativeCurrency.symbol}</h1><p className="muted">Native transfers are signed locally. AURELIS never sends your recovery phrase to a server.</p><label>Recipient</label><input value={to} onChange={e=>setTo(e.target.value)} placeholder="0x…" autoComplete="off"/><label>Amount</label><input value={amount} onChange={e=>setAmount(e.target.value)} placeholder="0.00" inputMode="decimal"/><label>Wallet password</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Unlock to sign"/><button className="primary" onClick={send}>Review & send</button>{status&&<div className="success">{status}</div>}{error&&<div className="error">{error}</div>}<a href="/">Back to wallet</a></section></main>;
}

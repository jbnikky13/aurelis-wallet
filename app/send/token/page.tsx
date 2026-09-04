'use client';

import { useState } from 'react';
import { encodeFunctionData, erc20Abi, isAddress, parseUnits, type Address } from 'viem';
import { DEFAULT_CHAIN } from '@/lib/chains';
import { publicClientFor } from '@/lib/providers';
import { decryptWallet } from '@/lib/wallet/crypto';
import { accountFromMnemonic } from '@/lib/wallet/mnemonic';

export default function TokenSendPage() {
  const [token, setToken] = useState('');
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  async function send() {
    try {
      setError('');
      setStatus('Preparing token transfer…');
      if (!isAddress(token) || !isAddress(to)) throw new Error('Enter valid token and recipient addresses.');
      const mnemonic = await decryptWallet(password);
      const account = accountFromMnemonic(mnemonic);
      const client = publicClientFor(DEFAULT_CHAIN);
      const tokenAddress = token as Address;
      const recipient = to as Address;
      const decimals = await client.readContract({ address: tokenAddress, abi: erc20Abi, functionName: 'decimals' });
      const symbol = await client.readContract({ address: tokenAddress, abi: erc20Abi, functionName: 'symbol' });
      const value = parseUnits(amount, decimals);
      const nativeBalance = await client.getBalance({ address: account.address });
      const gas = await client.estimateContractGas({ address: tokenAddress, abi: erc20Abi, functionName: 'transfer', args: [recipient, value], account });
      const gasPrice = await client.getGasPrice();
      if (nativeBalance < gas * gasPrice) throw new Error(`Insufficient ${DEFAULT_CHAIN.nativeCurrency.symbol} for network fee.`);
      setStatus(`Signing ${amount} ${symbol} locally…`);
      const nonce = await client.getTransactionCount({ address: account.address });
      const data = encodeFunctionData({ abi: erc20Abi, functionName: 'transfer', args: [recipient, value] });
      const signed = await account.signTransaction({ to: tokenAddress, data, gas, gasPrice, nonce, chainId: DEFAULT_CHAIN.id, type: 'legacy' });
      const hash = await client.sendRawTransaction({ serializedTransaction: signed });
      setStatus(`Broadcast successfully: ${hash}`);
    } catch (e) {
      setStatus('');
      setError(e instanceof Error ? e.message : 'Token transfer failed.');
    }
  }

  return (
    <main className="shell">
      <section className="card form">
        <p className="eyebrow">AURELIS • TOKEN SEND</p>
        <h1>Send ERC-20</h1>
        <label>Token contract</label>
        <input value={token} onChange={(e) => setToken(e.target.value)} placeholder="0x…" />
        <label>Recipient</label>
        <input value={to} onChange={(e) => setTo(e.target.value)} placeholder="0x…" />
        <label>Amount</label>
        <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
        <label>Wallet password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Unlock to sign" />
        <button className="primary" onClick={send}>Review & send token</button>
        {status && <div className="success">{status}</div>}
        {error && <div className="error">{error}</div>}
        <a href="/">Back to wallet</a>
      </section>
    </main>
  );
}

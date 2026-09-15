'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { formatEther, isAddress, parseEther } from 'viem';
import { AURELIS_CHAINS, DEFAULT_CHAIN } from '@/lib/chains';
import { reportRuntimeError } from '@/lib/errors';
import { publicClientFor, withRpcRecovery } from '@/lib/providers';
import { addActivity } from '@/lib/wallet/activity';
import { decryptWallet } from '@/lib/wallet/crypto';
import { accountFromMnemonic } from '@/lib/wallet/mnemonic';
import { extractWalletAddress } from '@/lib/qr';

type BarcodeDetection = { rawValue?: string };
type BarcodeDetectorInstance = {
  detect: (source: ImageBitmapSource | HTMLVideoElement | HTMLImageElement | HTMLCanvasElement) => Promise<BarcodeDetection[]>;
};
type BarcodeDetectorConstructor = new (options?: { formats?: string[] }) => BarcodeDetectorInstance;
type BarcodeDetectorWindow = Window & { BarcodeDetector?: BarcodeDetectorConstructor };

export default function SendPage() {
  const [chainId, setChainId] = useState<number>(DEFAULT_CHAIN.id);
  const [to, setTo] = useState(''); const [amount, setAmount] = useState(''); const [password, setPassword] = useState('');
  const [status, setStatus] = useState(''); const [error, setError] = useState(''); const [busy, setBusy] = useState(false); const [scanning, setScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null); const streamRef = useRef<MediaStream | null>(null); const scanTimer = useRef<number | null>(null);
  const chain = useMemo(() => AURELIS_CHAINS.find((candidate) => candidate.id === chainId) ?? DEFAULT_CHAIN, [chainId]);

  useEffect(() => () => { if (scanTimer.current) window.clearInterval(scanTimer.current); streamRef.current?.getTracks().forEach(t => t.stop()); }, []);

  function stopScanner() { if (scanTimer.current) window.clearInterval(scanTimer.current); scanTimer.current = null; streamRef.current?.getTracks().forEach(t => t.stop()); streamRef.current = null; setScanning(false); }

  async function startScanner() {
    setError('');
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) { setError('Camera scanning requires a secure HTTPS connection and camera access.'); return; }
    const Detector = (window as BarcodeDetectorWindow).BarcodeDetector;
    if (!Detector) { setError('QR scanning is not supported by this browser. Use Paste Address instead.'); return; }
    try {
      const detector = new Detector({ formats: ['qr_code'] });
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
      streamRef.current = stream; setScanning(true);
      if (!videoRef.current) { stopScanner(); setError('Unable to initialize the QR camera preview.'); return; }
      videoRef.current.srcObject = stream; await videoRef.current.play();
      scanTimer.current = window.setInterval(async () => {
        if (!videoRef.current || videoRef.current.readyState < 2) return;
        try {
          const codes = await detector.detect(videoRef.current);
          const raw = codes[0]?.rawValue;
          if (!raw) return;
          const address = extractWalletAddress(raw);
          if (address) { setTo(address); setStatus('Recipient address scanned successfully.'); stopScanner(); }
        } catch { /* Keep scanning; transient camera frames can fail. */ }
      }, 350);
    } catch (e) { stopScanner(); setError(e instanceof Error && e.name === 'NotAllowedError' ? 'Camera permission was denied. Enable camera access or paste the address.' : 'Unable to start QR scanner.'); }
  }

  async function pasteAddress() {
    try { const value = await navigator.clipboard.readText(); const address = extractWalletAddress(value); if (!address) throw new Error('Clipboard does not contain a valid wallet address.'); setTo(address); setStatus('Recipient address pasted successfully.'); setError(''); }
    catch (e) { setError(e instanceof Error ? e.message : 'Unable to read clipboard. Paste the address manually.'); }
  }

  async function send() {
    if (busy) return;
    try { setBusy(true); setError(''); setStatus('Preparing transaction…');
      if (!isAddress(to)) throw new Error('Enter a valid recipient address.'); if (!amount || Number(amount) <= 0) throw new Error('Enter an amount greater than zero.');
      const value = parseEther(amount); const mnemonic = await decryptWallet(password); const account = accountFromMnemonic(mnemonic); const client = publicClientFor(chain);
      const balance = await withRpcRecovery(chain.id, () => client.getBalance({ address: account.address })); const gas = await withRpcRecovery(chain.id, () => client.estimateGas({ account, to: to as `0x${string}`, value })); const gasPrice = await withRpcRecovery(chain.id, () => client.getGasPrice()); const fee = gas * gasPrice;
      if (balance < value + fee) throw new Error(`Insufficient ${chain.nativeCurrency.symbol} for the amount plus estimated network fee.`);
      const nonce = await withRpcRecovery(chain.id, () => client.getTransactionCount({ address: account.address })); setStatus(`Ready to sign ${formatEther(value)} ${chain.nativeCurrency.symbol} on ${chain.name}.`);
      const serialized = await account.signTransaction({ to: to as `0x${string}`, value, gas, gasPrice, chainId: chain.id, nonce, type: 'legacy' }); setStatus('Broadcasting transaction…');
      const txHash = await withRpcRecovery(chain.id, () => client.sendRawTransaction({ serializedTransaction: serialized })); addActivity({ hash: txHash, chainId: chain.id, type: 'send', status: 'pending', createdAt: new Date().toISOString(), amount: value.toString(), symbol: chain.nativeCurrency.symbol, to, from: account.address }); setStatus(`Broadcast successfully: ${txHash}`);
    } catch (e) { setStatus(''); setError(reportRuntimeError('send-transaction-failed', e, chain.id)); } finally { setBusy(false); setPassword(''); }
  }

  return <main className="shell"><section className="card form"><p className="eyebrow">AURELIS • SEND</p><h1>Send {chain.nativeCurrency.symbol}</h1><p className="muted">Native transfers are signed locally. Your recovery phrase is never sent to a server.</p>
    <label>Network</label><select value={chainId} onChange={e => setChainId(Number(e.target.value))} disabled={busy}>{AURELIS_CHAINS.map(c => <option key={c.id} value={c.id}>{c.name} ({c.nativeCurrency.symbol})</option>)}</select>
    <label>Recipient</label><div className="input-row"><input value={to} onChange={e => setTo(e.target.value)} placeholder="0x…" autoComplete="off" spellCheck={false}/><button className="secondary" type="button" onClick={pasteAddress}>Paste</button><button className="secondary" type="button" onClick={scanning ? stopScanner : startScanner}>{scanning ? 'Stop' : 'Scan QR'}</button></div>
    {scanning && <div className="qr-scanner"><video ref={videoRef} playsInline muted/><p className="muted">Point your camera at a wallet QR code.</p></div>}
    <label>Amount</label><input value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" inputMode="decimal"/><label>Wallet password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Unlock to sign" autoComplete="current-password"/>
    <button className="primary" onClick={send} disabled={busy}>{busy ? 'Sending…' : 'Review & send'}</button>{status && <div className="success">{status}</div>}{error && <div className="error">{error}</div>}<a href="/">Back to wallet</a>
  </section></main>;
}

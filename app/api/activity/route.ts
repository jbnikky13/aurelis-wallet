import { NextRequest, NextResponse } from 'next/server';
import { isAddress } from 'viem';
import { AURELIS_CHAINS } from '@/lib/chains';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type ExplorerTx = {
  hash: `0x${string}`;
  from: string;
  to: string;
  value: string;
  timeStamp: string;
  isError?: string;
  txreceipt_status?: string;
};

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get('address');
  const chainId = Number(request.nextUrl.searchParams.get('chainId'));
  const chain = AURELIS_CHAINS.find((item) => item.id === chainId);

  if (!address || !isAddress(address) || !chain) {
    return NextResponse.json({ error: 'Invalid address or chain.' }, { status: 400 });
  }

  const apiKey = process.env.ETHERSCAN_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ items: [], indexed: false, reason: 'ETHERSCAN_API_KEY is not configured.' });
  }

  const url = new URL('https://api.etherscan.io/v2/api');
  url.searchParams.set('chainid', String(chain.id));
  url.searchParams.set('module', 'account');
  url.searchParams.set('action', 'txlist');
  url.searchParams.set('address', address);
  url.searchParams.set('startblock', '0');
  url.searchParams.set('endblock', '99999999');
  url.searchParams.set('page', '1');
  url.searchParams.set('offset', '50');
  url.searchParams.set('sort', 'desc');
  url.searchParams.set('apikey', apiKey);

  try {
    const response = await fetch(url, { next: { revalidate: 15 } });
    if (!response.ok) throw new Error(`Explorer HTTP ${response.status}`);
    const data = await response.json() as { status: string; result: ExplorerTx[] | string };
    if (!Array.isArray(data.result)) {
      return NextResponse.json({ items: [], indexed: false, reason: String(data.result) });
    }

    const normalized = data.result.map((tx) => ({
      hash: tx.hash,
      chainId: chain.id,
      type: tx.from.toLowerCase() === address.toLowerCase() ? 'send' : 'receive',
      status: tx.isError === '1' || tx.txreceipt_status === '0' ? 'failed' : 'confirmed',
      createdAt: new Date(Number(tx.timeStamp) * 1000).toISOString(),
      amount: tx.value,
      symbol: chain.nativeCurrency.symbol,
      to: tx.to,
      from: tx.from,
    }));

    return NextResponse.json({ items: normalized, indexed: true });
  } catch (error) {
    return NextResponse.json({ items: [], indexed: false, reason: error instanceof Error ? error.message : 'Explorer unavailable.' });
  }
}

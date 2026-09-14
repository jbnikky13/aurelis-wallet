import { arbitrum, avalanche, base, bsc, mainnet, optimism, polygon } from 'viem/chains';
import { defineChain, type Chain } from 'viem';

// Arc Mainnet is scheduled for public launch on September 16, 2026.
// The RPC is kept overridable so an official Circle endpoint can replace the
// public Arcscan gateway without another code change.
const arcRpc = process.env.NEXT_PUBLIC_ARC_RPC_URL?.trim() || 'https://rpc.arc-scan.org';

export const arc = defineChain({
  id: 5042,
  name: 'Arc',
  nativeCurrency: {
    name: 'USDC',
    symbol: 'USDC',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: [arcRpc] },
    public: { http: [arcRpc] },
  },
  blockExplorers: {
    default: { name: 'Arcscan', url: 'https://arc-scan.org' },
  },
  testnet: false,
});

export const AURELIS_CHAINS: Chain[] = [
  mainnet,
  base,
  bsc,
  polygon,
  arbitrum,
  optimism,
  avalanche,
  arc,
];

export const DEFAULT_CHAIN = base;
export const chainById = Object.fromEntries(AURELIS_CHAINS.map((chain) => [chain.id, chain])) as Record<number, Chain>;

import { arbitrum, avalanche, base, bsc, mainnet, optimism, polygon } from 'viem/chains';
import { defineChain, type Chain } from 'viem';

/**
 * Arc Mainnet
 * - Chain ID: 5042
 * - Native gas currency: USDC (18 native decimals)
 * - Official production RPC: https://rpc.mainnet.arc.io
 * - Official explorer: https://explorer.arc.io
 *
 * Arc is EVM-compatible and publicly live as of September 16, 2026.
 * The RPC remains overridable for operational resilience, but the
 * production default must always point at Arc Mainnet.
 */
const ARC_MAINNET_RPC = 'https://rpc.mainnet.arc.io';
const arcRpc = process.env.NEXT_PUBLIC_ARC_RPC_URL?.trim() || ARC_MAINNET_RPC;

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
    default: { name: 'Arc Explorer', url: 'https://explorer.arc.io' },
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

import { arbitrum, avalanche, base, bsc, ethereum, optimism, polygon } from 'viem/chains';
import type { Chain } from 'viem';

export const AURELIS_CHAINS: Chain[] = [ethereum, base, bsc, polygon, arbitrum, optimism, avalanche];
export const DEFAULT_CHAIN = base;

export const chainById = Object.fromEntries(AURELIS_CHAINS.map((chain) => [chain.id, chain])) as Record<number, Chain>;

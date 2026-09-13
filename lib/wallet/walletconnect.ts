'use client';

import EthereumProvider from '@walletconnect/ethereum-provider';
import type { Address } from 'viem';
import { getWalletConnectConfig } from './walletconnect-config';

type WalletConnectProvider = Awaited<ReturnType<typeof EthereumProvider.init>>;
type NonEmptyNumberArray = [number, ...number[]];

let provider: WalletConnectProvider | null = null;

export async function getWalletConnectProvider(
  chains: number[],
  methods: string[],
  events: string[],
): Promise<WalletConnectProvider> {
  const config = getWalletConnectConfig();
  if (provider) return provider;

  if (chains.length === 0) {
    throw new Error('WalletConnect requires at least one supported chain.');
  }

  const optionalChains = chains as NonEmptyNumberArray;

  provider = await EthereumProvider.init({
    projectId: config.projectId,
    optionalChains,
    methods,
    events,
    showQrModal: true,
    metadata: config.metadata,
  });

  return provider;
}

export async function connectWalletConnect(chains: number[]): Promise<Address[]> {
  const p = await getWalletConnectProvider(
    chains,
    ['eth_sendTransaction', 'personal_sign', 'eth_signTypedData', 'eth_signTypedData_v4'],
    ['chainChanged', 'accountsChanged'],
  );
  await p.connect();
  return p.accounts as Address[];
}

export async function disconnectWalletConnect(): Promise<void> {
  if (provider) {
    await provider.disconnect();
    provider = null;
  }
}

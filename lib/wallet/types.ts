export type StoredWallet = {
  version: 1;
  address: `0x${string}`;
  createdAt: string;
};

export type WalletSession = {
  address: `0x${string}`;
  chainId: number;
};

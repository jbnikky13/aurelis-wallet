# AURELIS Wallet

AURELIS is a modern, multi-chain, non-custodial EVM wallet.

## First version

- Multi-chain EVM network registry
- Portfolio dashboard
- Asset list
- Send/receive UI foundation
- Transaction history foundation
- Client-side encrypted wallet-storage primitives
- Supabase-ready configuration
- WalletConnect-ready configuration

## Supported networks

Ethereum, Base, BNB Chain, Polygon, Arbitrum, Optimism and Avalanche.

## Security principles

Private keys and recovery phrases must never be committed to GitHub or stored in Supabase. Production wallet creation/import will use audited wallet primitives and client-side encryption. The current receive address shown in the demo UI is intentionally a zero address and must not be used for funds.

## Development

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Status

AURELIS v0.1 foundation. The next implementation phase connects real wallet generation/import, live chain balances, transaction signing, RPC providers, and production security controls.

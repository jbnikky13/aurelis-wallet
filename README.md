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

Ethereum, Base, BNB Chain, Polygon, Arbitrum, Optimism, Avalanche, and Arc.

## Security principles

- Private keys and recovery phrases must never be committed to GitHub or stored in Supabase.
- Wallet secrets are handled locally and transaction signing stays client-side.
- No application-specific PharmaTrace contract integration, deployment flow, ABI, or contract registry is included in this wallet.
- No wallet signing flow is exposed to an external PharmaTrace deployment or registration process.
- Production wallet creation/import will use audited wallet primitives and client-side encryption.

## Development

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Status

AURELIS wallet foundation with multi-chain balances, wallet creation/import, send/receive flows, transaction history, security controls, and Arc support.

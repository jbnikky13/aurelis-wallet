# AURELIS Mobile

Native iOS/Android wallet client built with Expo and Expo Router.

## Run
```bash
cd mobile
npm install
npx expo start
```

Use an Expo development build for native biometric testing.

## Security
Recovery material is stored on-device with Expo SecureStore. Wallet unlock uses device authentication when available. Transaction signing happens locally. Public RPCs are used for blockchain reads and transaction broadcast; recovery material is never sent to RPCs.

The mobile client contains no PharmaTrace contract, deployment, approval, registration, or wallet back-channel.

## Current features
- Create/import wallet
- Recovery phrase backup flow
- Biometric unlock
- Secure local wallet storage
- Multi-chain selection
- Native balance
- Local transaction signing/broadcast
- Send/receive
- QR receive address
- Arc Mainnet
- Native deep-link scheme: `aurelis://`

Expo Router provides file-based native navigation and universal deep linking.
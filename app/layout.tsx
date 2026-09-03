import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AURELIS Wallet',
  description: 'A secure multi-chain Web3 wallet.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}

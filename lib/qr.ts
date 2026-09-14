import { isAddress } from 'viem';

export function extractWalletAddress(raw: string): `0x${string}` | null {
  const value = raw.trim();
  if (isAddress(value)) return value as `0x${string}`;
  try {
    const url = new URL(value);
    const candidate = url.searchParams.get('address') ?? url.searchParams.get('recipient') ?? url.pathname.match(/0x[a-fA-F0-9]{40}/)?.[0];
    return candidate && isAddress(candidate) ? candidate as `0x${string}` : null;
  } catch {
    const match = value.match(/0x[a-fA-F0-9]{40}/);
    return match && isAddress(match[0]) ? match[0] as `0x${string}` : null;
  }
}

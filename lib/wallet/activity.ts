export type WalletActivity = { hash: `0x${string}`; chainId: number; type: 'send' | 'receive' | 'token'; status: 'pending' | 'confirmed' | 'failed'; createdAt: string; amount?: string; symbol?: string; to?: string; from?: string };

const KEY = 'aurelis.activity.v1';

export function getActivity(): WalletActivity[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(KEY) ?? '[]'); } catch { return []; }
}

export function addActivity(item: WalletActivity) {
  const next = [item, ...getActivity()].slice(0, 100);
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

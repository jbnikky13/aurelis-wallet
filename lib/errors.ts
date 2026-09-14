import { recordRuntimeEvent } from './monitoring';

export function userFacingError(error: unknown, fallback = 'Something went wrong. Please try again.') {
  const message = error instanceof Error ? error.message : String(error ?? '');
  const lower = message.toLowerCase();
  if (lower.includes('insufficient')) return message;
  if (lower.includes('nonce')) return 'The network nonce changed. Refresh the wallet state and try again.';
  if (lower.includes('timeout') || lower.includes('timed out')) return 'The network request timed out. Please try again.';
  if (lower.includes('rate limit') || lower.includes('429')) return 'The network is rate-limiting requests. Please wait a moment and try again.';
  if (lower.includes('rpc') || lower.includes('transport') || lower.includes('network')) return 'Network connection failed. Check your connection and try again.';
  if (lower.includes('user rejected') || lower.includes('rejected')) return 'The transaction was cancelled.';
  return message || fallback;
}

export function reportRuntimeError(event: string, error: unknown, chainId?: number): string {
  const message = error instanceof Error ? error.message : String(error ?? 'Unknown error');
  recordRuntimeEvent({ level: 'error', event, message, chainId });
  return userFacingError(error);
}

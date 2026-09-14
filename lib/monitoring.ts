export type RuntimeEvent = {
  level: 'info' | 'warn' | 'error';
  event: string;
  chainId?: number;
  message?: string;
};

const KEY = 'aurelis.runtime.events';
const MAX_EVENTS = 40;

export function recordRuntimeEvent(event: RuntimeEvent): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    const next = Array.isArray(existing) ? [...existing, { ...event, at: new Date().toISOString() }] : [{ ...event, at: new Date().toISOString() }];
    localStorage.setItem(KEY, JSON.stringify(next.slice(-MAX_EVENTS)));
  } catch {
    // Monitoring must never break wallet functionality.
  }
  if (event.level === 'error') console.error(`[AURELIS:${event.event}]`, event.message ?? '');
  else if (event.level === 'warn') console.warn(`[AURELIS:${event.event}]`, event.message ?? '');
}

export function getRuntimeEvents(): RuntimeEvent[] {
  if (typeof window === 'undefined') return [];
  try {
    const value = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

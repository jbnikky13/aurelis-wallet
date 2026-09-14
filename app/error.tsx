'use client';

import { useEffect } from 'react';
import { recordRuntimeEvent } from '@/lib/monitoring';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    recordRuntimeEvent({ level: 'error', event: 'react-runtime-error', message: error.message });
  }, [error]);

  return (
    <main className="shell">
      <section className="card form">
        <p className="eyebrow">AURELIS • RECOVERY</p>
        <h1>Something went wrong</h1>
        <p className="muted">The wallet recovered the error without exposing wallet secrets.</p>
        <button className="primary" onClick={() => reset()}>Try again</button>
        <a href="/">Return to wallet</a>
      </section>
    </main>
  );
}

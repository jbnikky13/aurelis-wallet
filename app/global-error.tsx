'use client';

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body>
        <main className="shell">
          <section className="card form">
            <p className="eyebrow">AURELIS • RECOVERY</p>
            <h1>Wallet temporarily unavailable</h1>
            <p className="muted">A critical application error occurred. No wallet secret is displayed here.</p>
            <button className="primary" onClick={() => reset()}>Reload wallet</button>
          </section>
        </main>
      </body>
    </html>
  );
}

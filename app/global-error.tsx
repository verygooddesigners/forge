'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: '#0a0a0a', color: '#ffffff', fontFamily: 'sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', margin: 0 }}>
        <div style={{ textAlign: 'center' }}>
          <h2>Something went wrong</h2>
          <button onClick={reset} style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#6d28d9', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}>
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}

import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a0a0a', color: '#ffffff', fontFamily: 'sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '4rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>404</h1>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#a1a1aa' }}>Page Not Found</h2>
        <p style={{ color: '#71717a', marginBottom: '2rem' }}>The page you are looking for does not exist.</p>
        <Link href="/dashboard" style={{ padding: '0.5rem 1.5rem', background: '#6d28d9', color: '#fff', borderRadius: '0.375rem', textDecoration: 'none' }}>
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}

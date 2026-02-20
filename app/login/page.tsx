import LoginForm from './LoginForm';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-deepest p-4">
      <LoginForm />
    </div>
  );
}

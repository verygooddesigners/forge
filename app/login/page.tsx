import LoginForm from './LoginForm';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function LoginPage() {
  return (
    <div className="w-full h-full flex items-center justify-center p-8">
      <LoginForm />
    </div>
  );
}

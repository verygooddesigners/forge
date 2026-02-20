import ResetPasswordForm from './ResetPasswordForm';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-deepest p-4">
      <ResetPasswordForm />
    </div>
  );
}

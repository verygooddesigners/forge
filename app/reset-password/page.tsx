import ResetPasswordForm from './ResetPasswordForm';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function ResetPasswordPage() {
  return (
    <div className="w-full h-full flex items-center justify-center p-8">
      <ResetPasswordForm />
    </div>
  );
}

import AuthLayout from '@/features/auth/layouts/AuthLayout';
import SignupForm from '@/features/auth/components/SignupForm';

export default function SignupPage() {
  return (
    <AuthLayout>
      <SignupForm />
    </AuthLayout>
  );
}

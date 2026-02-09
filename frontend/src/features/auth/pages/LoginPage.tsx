import { AuthLayout } from '../../../shared/layouts/AuthLayout';
import { LoginForm } from '../components/LoginForm';

export function LoginPage() {
  return (
    <AuthLayout title="Вход в систему">
      <LoginForm />
    </AuthLayout>
  );
}

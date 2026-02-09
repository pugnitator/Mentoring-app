import { AuthLayout } from '../../../shared/layouts/AuthLayout';
import { RegisterForm } from '../components/RegisterForm';

export function RegisterPage() {
  return (
    <AuthLayout title="Регистрация">
      <RegisterForm />
    </AuthLayout>
  );
}

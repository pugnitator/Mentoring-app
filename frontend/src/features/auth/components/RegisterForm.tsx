import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useRegister, useAuthError } from '../hooks/useAuth';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { ErrorMessage } from '../../../shared/ui/ErrorMessage';
import { EMAIL_HINT } from '../constants';

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
type RoleOption = 'MENTOR' | 'MENTEE' | null;

function validatePassword(password: string): string | null {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return 'Пароль должен содержать минимум 8 символов';
  }
  if (!PASSWORD_REGEX.test(password)) {
    return 'Пароль должен содержать заглавные и строчные буквы, а также цифры';
  }
  return null;
}

export function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<RoleOption>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const register = useRegister();
  const errorMessage = useAuthError(register);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setConfirmPasswordError(null);
    setPasswordError(null);

    if (password !== confirmPassword) {
      setConfirmPasswordError('Пароли не совпадают');
      return;
    }
    const pError = validatePassword(password);
    setPasswordError(pError ?? null);
    if (pError) return;
    if (!role) return;
    register.mutate({ email, password, role });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorMessage && <ErrorMessage message={errorMessage} />}
      <Input
        label="Email"
        type="email"
        name="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        placeholder="user@example.com"
        hint={EMAIL_HINT}
      />
      <Input
        label="Пароль"
        type="password"
        name="password"
        autoComplete="new-password"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          setPasswordError(null);
          setConfirmPasswordError(null);
        }}
        required
        error={passwordError || undefined}
      />
      <Input
        label="Подтверждение пароля"
        type="password"
        name="confirmPassword"
        autoComplete="new-password"
        value={confirmPassword}
        onChange={(e) => {
          setConfirmPassword(e.target.value);
          setConfirmPasswordError(null);
        }}
        required
        error={confirmPasswordError || undefined}
      />
      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
        Минимум 8 символов, заглавные и строчные буквы, цифры
      </p>

      <fieldset>
        <legend className="mb-2 text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
          Роль <span style={{ color: 'var(--color-error)' }}>*</span>
        </legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <label
            className={`
              flex cursor-pointer flex-col rounded-xl border-2 p-4 transition
              ${role === 'MENTOR' ? 'border-[var(--color-accent-start)] bg-[var(--color-accent-start)]/10' : 'border-[var(--color-border)] hover:border-[var(--color-text-muted)]'}
            `}
          >
            <input
              type="radio"
              name="role"
              value="MENTOR"
              checked={role === 'MENTOR'}
              onChange={() => setRole('MENTOR')}
              className="sr-only"
            />
            <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Ментор</span>
            <span className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>Принимаю заявки на менторство</span>
          </label>
          <label
            className={`
              flex cursor-pointer flex-col rounded-xl border-2 p-4 transition
              ${role === 'MENTEE' ? 'border-[var(--color-accent-start)] bg-[var(--color-accent-start)]/10' : 'border-[var(--color-border)] hover:border-[var(--color-text-muted)]'}
            `}
          >
            <input
              type="radio"
              name="role"
              value="MENTEE"
              checked={role === 'MENTEE'}
              onChange={() => setRole('MENTEE')}
              className="sr-only"
            />
            <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Менти</span>
            <span className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>Ищу ментора для себя</span>
          </label>
        </div>
      </fieldset>

      <Button type="submit" className="w-full" loading={register.isPending} disabled={!role}>
        Зарегистрироваться
      </Button>
      <p className="text-center text-sm" style={{ color: 'var(--color-text-secondary)' }}>
        Уже есть аккаунт?{' '}
        <Link to="/login" className="font-medium" style={{ color: 'var(--color-accent-blue)' }}>
          Войти
        </Link>
      </p>
    </form>
  );
}

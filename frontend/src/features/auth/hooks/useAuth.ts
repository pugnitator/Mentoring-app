import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { setTokens } from '../../../shared/api/auth';
import { getErrorMessage } from '../../../shared/lib/errorHandler';
import type { RegisterData, LoginData } from '../../../shared/types/auth';

export function useLogin() {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (data: LoginData) => authApi.login(data),
    onSuccess: (res) => {
      setTokens(res.accessToken, res.refreshToken);
      navigate('/', { replace: true });
    },
  });
}

export function useRegister() {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (data: RegisterData) => authApi.register(data),
    onSuccess: (res) => {
      setTokens(res.accessToken, res.refreshToken);
      navigate('/', { replace: true });
    },
  });
}

export function useAuthError(mutation: { error: Error | null }) {
  return mutation.error ? getErrorMessage(mutation.error) : null;
}

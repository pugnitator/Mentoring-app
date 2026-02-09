import { AxiosError } from 'axios';

export interface ApiErrorBody {
  statusCode?: number;
  code?: string;
  message?: string | string[];
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorBody | undefined;
    if (data?.message) {
      return typeof data.message === 'string' ? data.message : data.message.join(', ');
    }
    if (error.message) return error.message;
  }
  if (error instanceof Error) return error.message;
  return 'Произошла ошибка. Попробуйте ещё раз.';
}

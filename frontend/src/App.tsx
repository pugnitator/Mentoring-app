import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { queryClient } from './shared/api/queryClient';
import { router } from './app/routes';
import { ThemeProvider } from './shared/context/ThemeContext';
import { ToastProvider } from './shared/context/ToastContext';

export function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

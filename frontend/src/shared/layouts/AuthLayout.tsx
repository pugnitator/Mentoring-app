import { type ReactNode } from 'react';
import { Card } from '../ui/Card';

interface AuthLayoutProps {
  title: string;
  children: ReactNode;
}

export function AuthLayout({ title, children }: AuthLayoutProps) {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4"
      style={{ backgroundColor: 'var(--color-bg-page)' }}
    >
      <Card className="w-full max-w-md space-y-8 p-8">
        <h1 className="text-center text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
          {title}
        </h1>
        {children}
      </Card>
    </div>
  );
}

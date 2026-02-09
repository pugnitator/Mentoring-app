import { type HTMLAttributes, type ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** При true — лёгкое поднятие тени при hover (для кликабельных карточек) */
  hover?: boolean;
  /** Цвет левой границы (например 'var(--color-warning)') для визуального типа карточки */
  leftBorder?: string;
}

export function Card({ children, hover, leftBorder, className = '', style, ...props }: CardProps) {
  return (
    <div
      className={`
        rounded-[var(--radius-card)] p-6
        ${hover ? 'transition-shadow duration-150 hover:shadow-lg' : ''}
        ${className}
      `}
      style={{
        backgroundColor: 'var(--color-surface)',
        boxShadow: 'var(--shadow-card)',
        ...(leftBorder ? { borderLeft: `4px solid ${leftBorder}` } : {}),
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

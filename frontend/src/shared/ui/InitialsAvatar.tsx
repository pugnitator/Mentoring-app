/** Круг с инициалами для карточек дашборда (без фото). Цвет по дизайн-системе. */
export function InitialsAvatar({
  firstName,
  lastName,
  size = 'md',
  className = '',
}: {
  firstName: string;
  lastName: string;
  size?: 'sm' | 'md';
  className?: string;
}) {
  const initial = (firstName?.charAt(0) || lastName?.charAt(0) || '?').toUpperCase();
  const sizeClass = size === 'sm' ? 'h-10 w-10 text-sm' : 'h-12 w-12 text-base';
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold ${sizeClass} ${className}`}
      style={{
        backgroundColor: 'var(--color-accent-secondary)',
        color: 'white',
      }}
      aria-hidden
    >
      {initial}
    </div>
  );
}

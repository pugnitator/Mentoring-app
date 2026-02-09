interface AvatarProps {
  avatarUrl: string | null;
  firstName: string;
  lastName: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-8 w-8 text-sm',
  md: 'h-12 w-12 text-base',
  lg: 'h-20 w-20 text-2xl',
};

export function Avatar({ avatarUrl, firstName, lastName, className = '', size = 'md' }: AvatarProps) {
  const initial = (firstName?.charAt(0) || lastName?.charAt(0) || '?').toUpperCase();

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={`${firstName} ${lastName}`}
        className={`rounded-full object-cover ${sizeClasses[size]} ${className}`}
      />
    );
  }

  return (
    <div
      className={`
        flex items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700
        dark:bg-indigo-900/40 dark:text-indigo-200
        ${sizeClasses[size]} ${className}
      `}
      aria-hidden
    >
      {initial}
    </div>
  );
}

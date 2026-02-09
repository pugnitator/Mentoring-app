import { Link } from 'react-router-dom';
import { Button } from '../../shared/ui/Button';

export function NotFoundPage() {
  return (
    <div
      className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4"
      style={{ color: 'var(--color-text-primary)' }}
    >
      <h1 className="text-6xl font-bold" style={{ color: 'var(--color-text-muted)' }}>
        404
      </h1>
      <p className="text-center text-lg" style={{ color: 'var(--color-text-secondary)' }}>
        Страница не найдена
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link to="/">
          <Button variant="secondary">На главную</Button>
        </Link>
        <Link to="/mentors">
          <Button>Каталог менторов</Button>
        </Link>
      </div>
    </div>
  );
}

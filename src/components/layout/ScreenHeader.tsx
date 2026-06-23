import type { ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props {
  title: string;
  subtitle?: string;
  back?: boolean;
  onBack?: () => void;
  right?: ReactNode;
}

export default function ScreenHeader({ title, subtitle, back, onBack, right }: Props) {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surf/90 backdrop-blur-md">
      <div
        className="flex items-center gap-2 px-4"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="flex h-14 flex-1 items-center gap-2">
          {back && (
            <button
              onClick={() => (onBack ? onBack() : navigate(-1))}
              className="-ml-1.5 flex h-9 w-9 items-center justify-center rounded-full active:bg-elev"
              aria-label="Back"
            >
              <ChevronLeft size={22} className="text-ink-1" />
            </button>
          )}
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold text-ink-1">{title}</h1>
            {subtitle && <p className="truncate text-xs text-ink-2">{subtitle}</p>}
          </div>
        </div>
        {right && <div className="flex items-center gap-1">{right}</div>}
      </div>
    </header>
  );
}

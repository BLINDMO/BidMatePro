import type { ReactNode } from 'react';

interface Props {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export default function EmptyState({ icon, title, subtitle, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center px-8 py-16 text-center">
      {icon && (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-elev text-ink-3 shadow-card">
          {icon}
        </div>
      )}
      <p className="text-base font-semibold text-ink-1">{title}</p>
      {subtitle && <p className="mt-1.5 max-w-[260px] text-sm text-ink-2">{subtitle}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

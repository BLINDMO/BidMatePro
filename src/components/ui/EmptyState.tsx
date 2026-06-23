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
      {icon && <div className="mb-3 text-4xl opacity-70">{icon}</div>}
      <p className="text-base font-semibold text-ink-1">{title}</p>
      {subtitle && <p className="mt-1 text-sm text-ink-2">{subtitle}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

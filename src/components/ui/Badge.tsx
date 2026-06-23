import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  color?: string;
  bg?: string;
  className?: string;
}

export default function Badge({ children, color, bg, className = '' }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${className}`}
      style={{ color: color ?? '#8896B3', backgroundColor: bg ?? 'rgba(136,150,179,0.12)' }}
    >
      {children}
    </span>
  );
}

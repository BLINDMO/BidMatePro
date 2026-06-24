import type { HTMLAttributes, ReactNode } from 'react';

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export default function Card({ children, className = '', ...rest }: Props) {
  return (
    <div
      className={`rounded-2xl border border-line bg-card p-4 shadow-card ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

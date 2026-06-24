import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  full?: boolean;
  children: ReactNode;
}

const variants: Record<Variant, string> = {
  primary: 'bg-amber text-[#0B0E16] font-semibold shadow-amber active:opacity-90',
  secondary: 'bg-elev text-ink-1 border border-line-md shadow-card active:bg-card',
  ghost: 'bg-transparent text-ink-2 active:bg-elev',
  danger: 'bg-rose/15 text-rose border border-rose/30 active:bg-rose/25',
};

const sizes: Record<Size, string> = {
  sm: 'h-10 px-3.5 text-sm rounded-xl',
  md: 'h-12 px-4 text-[15px] rounded-xl',
  lg: 'h-14 px-5 text-base rounded-2xl',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  full,
  className = '',
  children,
  ...rest
}: Props) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 transition-all duration-150 active:scale-[0.98] disabled:opacity-40 disabled:active:scale-100 ${variants[variant]} ${sizes[size]} ${full ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

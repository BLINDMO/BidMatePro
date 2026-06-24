import type { InputHTMLAttributes } from 'react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  suffix?: string;
}

export default function Input({ label, suffix, className = '', ...rest }: Props) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-[13px] font-medium text-ink-2">{label}</span>}
      <div className="relative">
        <input
          className={`h-12 w-full rounded-xl border border-line-md bg-surf px-3.5 text-base text-ink-1 placeholder:text-ink-3 outline-none transition-colors focus:border-amber focus:ring-2 focus:ring-amber/20 ${suffix ? 'pr-12' : ''} ${className}`}
          {...rest}
        />
        {suffix && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-ink-3">
            {suffix}
          </span>
        )}
      </div>
    </label>
  );
}

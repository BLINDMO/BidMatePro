import type { SelectHTMLAttributes } from 'react';

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export default function Select({ label, options, className = '', ...rest }: Props) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm text-ink-2">{label}</span>}
      <select
        className={`h-11 w-full appearance-none rounded-xl border border-line-md bg-surf px-3.5 text-[15px] text-ink-1 outline-none focus:border-amber/60 ${className}`}
        {...rest}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

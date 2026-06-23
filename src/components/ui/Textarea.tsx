import type { TextareaHTMLAttributes } from 'react';

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
}

export default function Textarea({ label, hint, className = '', ...rest }: Props) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm text-ink-2">{label}</span>}
      <textarea
        className={`w-full rounded-xl border border-line-md bg-surf px-3.5 py-2.5 text-[15px] text-ink-1 placeholder:text-ink-3 outline-none focus:border-amber/60 ${className}`}
        rows={3}
        {...rest}
      />
      {hint && <span className="mt-1 block text-xs text-ink-3">{hint}</span>}
    </label>
  );
}

import type { ReactNode } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export default function BottomSheet({ open, onClose, title, children }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative max-h-[88vh] w-full max-w-[430px] overflow-y-auto rounded-t-3xl border-t border-line-md bg-surf pb-[calc(env(safe-area-inset-bottom)+16px)]">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-surf px-5 py-3.5">
          <h3 className="text-lg font-semibold text-ink-1">{title}</h3>
          <button onClick={onClose} className="text-sm text-ink-2 active:text-ink-1">
            Close
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}

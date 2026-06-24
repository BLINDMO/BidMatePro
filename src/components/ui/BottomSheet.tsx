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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="relative max-h-[88vh] w-full max-w-[480px] overflow-y-auto rounded-t-4xl border-t border-line-md bg-surf pb-[calc(env(safe-area-inset-bottom)+16px)] shadow-pop">
        <div className="flex justify-center pt-2.5">
          <div className="h-1 w-9 rounded-full bg-line-md" />
        </div>
        <div className="sticky top-0 z-10 flex items-center justify-between bg-surf px-5 pb-3 pt-1.5">
          <h3 className="text-lg font-bold text-ink-1">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-full px-2 py-1 text-sm font-medium text-ink-2 active:text-ink-1"
          >
            Done
          </button>
        </div>
        <div className="px-5 py-2">{children}</div>
      </div>
    </div>
  );
}

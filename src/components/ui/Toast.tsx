import { useEffect } from 'react';
import { useUIStore } from '../../stores/uiStore';

const colors = {
  success: 'bg-jade/15 text-jade border-jade/30',
  error: 'bg-rose/15 text-rose border-rose/30',
  info: 'bg-sky/15 text-sky border-sky/30',
};

export default function Toast() {
  const toast = useUIStore((s) => s.toast);
  const clearToast = useUIStore((s) => s.clearToast);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(clearToast, 2600);
    return () => clearTimeout(t);
  }, [toast, clearToast]);

  if (!toast) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-[60] flex justify-center px-4">
      <div
        className={`max-w-[430px] rounded-xl border px-4 py-2.5 text-sm font-medium shadow-lg ${colors[toast.type]}`}
      >
        {toast.message}
      </div>
    </div>
  );
}

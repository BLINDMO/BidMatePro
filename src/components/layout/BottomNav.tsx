import { Home, ClipboardList, Plus, Ruler, MoreHorizontal } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';

const items = [
  { to: '/', icon: Home, label: 'Home', end: true },
  { to: '/jobs', icon: ClipboardList, label: 'Jobs', end: false },
  { to: '/measure', icon: Ruler, label: 'Measure', end: false },
  { to: '/more', icon: MoreHorizontal, label: 'More', end: false },
];

export default function BottomNav() {
  const navigate = useNavigate();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[430px] border-t border-line bg-surf/95 backdrop-blur-md">
      <div className="safe-bottom relative flex h-[68px] items-stretch">
        {items.slice(0, 2).map((it) => (
          <Tab key={it.to} {...it} />
        ))}
        <div className="flex flex-1 items-start justify-center">
          <button
            onClick={() => navigate('/estimate/new')}
            aria-label="New estimate"
            className="-mt-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber text-bg shadow-lg shadow-amber/20 active:opacity-80"
          >
            <Plus size={26} strokeWidth={2.6} />
          </button>
        </div>
        {items.slice(2).map((it) => (
          <Tab key={it.to} {...it} />
        ))}
      </div>
    </nav>
  );
}

function Tab({
  to,
  icon: Icon,
  label,
  end,
}: {
  to: string;
  icon: typeof Home;
  label: string;
  end: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className="flex flex-1 flex-col items-center justify-center gap-1 pt-2"
    >
      {({ isActive }) => (
        <>
          <Icon size={22} className={isActive ? 'text-amber' : 'text-ink-3'} />
          <span className={`text-[10px] ${isActive ? 'text-amber' : 'text-ink-3'}`}>{label}</span>
        </>
      )}
    </NavLink>
  );
}

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
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line-md bg-surf shadow-[0_-2px_16px_rgba(0,0,0,0.25)]">
      <div className="safe-bottom mx-auto flex h-[74px] w-full items-stretch">
        {items.slice(0, 2).map((it) => (
          <Tab key={it.to} {...it} />
        ))}
        <div className="flex flex-1 items-start justify-center">
          <button
            onClick={() => navigate('/estimate/new')}
            aria-label="New estimate"
            className="-mt-6 flex h-16 w-16 items-center justify-center rounded-[20px] bg-amber text-[#0B0E16] shadow-lg shadow-amber/30 active:scale-95"
          >
            <Plus size={30} strokeWidth={2.6} />
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
      className="flex flex-1 flex-col items-center justify-center gap-1 pt-2.5"
    >
      {({ isActive }) => (
        <>
          <Icon size={25} strokeWidth={isActive ? 2.4 : 2} className={isActive ? 'text-amber' : 'text-ink-2'} />
          <span className={`text-[11px] font-medium ${isActive ? 'text-amber' : 'text-ink-2'}`}>
            {label}
          </span>
        </>
      )}
    </NavLink>
  );
}

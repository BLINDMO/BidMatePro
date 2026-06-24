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
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line-md bg-surf/90 backdrop-blur-xl shadow-[0_-4px_24px_rgba(0,0,0,0.28)]">
      <div className="safe-bottom mx-auto flex h-[76px] w-full items-stretch">
        {items.slice(0, 2).map((it) => (
          <Tab key={it.to} {...it} />
        ))}
        <div className="flex flex-1 items-start justify-center">
          <button
            onClick={() => navigate('/estimate/new')}
            aria-label="New estimate"
            className="-mt-7 flex h-16 w-16 items-center justify-center rounded-[22px] bg-amber text-[#0B0E16] shadow-amber transition-transform active:scale-90"
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
    <NavLink to={to} end={end} className="relative flex flex-1 flex-col items-center justify-center gap-1 pt-3">
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute top-0 h-1 w-8 rounded-full bg-amber" />
          )}
          <Icon
            size={24}
            strokeWidth={isActive ? 2.4 : 2}
            className={isActive ? 'text-amber' : 'text-ink-2'}
          />
          <span className={`text-2xs font-semibold ${isActive ? 'text-amber' : 'text-ink-2'}`}>
            {label}
          </span>
        </>
      )}
    </NavLink>
  );
}

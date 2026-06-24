interface Props {
  tabs: { id: string; label: string }[];
  active: string;
  onChange: (id: string) => void;
}

export default function Tabs({ tabs, active, onChange }: Props) {
  return (
    <div className="flex gap-1 rounded-2xl bg-surf p-1 shadow-card">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all ${
            active === t.id ? 'bg-elev text-ink-1 shadow-card' : 'text-ink-2 active:text-ink-1'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

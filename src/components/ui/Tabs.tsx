interface Props {
  tabs: { id: string; label: string }[];
  active: string;
  onChange: (id: string) => void;
}

export default function Tabs({ tabs, active, onChange }: Props) {
  return (
    <div className="flex gap-1 rounded-xl bg-surf p-1">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
            active === t.id ? 'bg-elev text-ink-1' : 'text-ink-2'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

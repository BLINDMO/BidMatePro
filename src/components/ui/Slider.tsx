interface Props {
  label?: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  onChange: (v: number) => void;
}

export default function Slider({
  label,
  value,
  min = 0,
  max = 50,
  step = 1,
  suffix = '%',
  onChange,
}: Props) {
  return (
    <div>
      {label && (
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm text-ink-2">{label}</span>
          <span className="text-sm font-semibold text-amber">
            {value}
            {suffix}
          </span>
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-elev accent-amber"
      />
    </div>
  );
}

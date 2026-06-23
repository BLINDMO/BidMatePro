import { useEffect, useRef, useState } from 'react';

interface Props {
  onSave: (dataUrl: string, name: string) => void;
  onCancel: () => void;
  initialName?: string;
}

/** Simple canvas signature pad with pointer/touch drawing. */
export default function SignaturePad({ onSave, onCancel, initialName = '' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const dirty = useRef(false);
  const [name, setName] = useState(initialName);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#111827';
  }, []);

  const pos = (e: React.PointerEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const start = (e: React.PointerEvent) => {
    drawing.current = true;
    dirty.current = true;
    const ctx = canvasRef.current!.getContext('2d')!;
    const { x, y } = pos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };
  const move = (e: React.PointerEvent) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current!.getContext('2d')!;
    const { x, y } = pos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };
  const end = () => {
    drawing.current = false;
  };

  const clear = () => {
    const canvas = canvasRef.current!;
    canvas.getContext('2d')!.clearRect(0, 0, canvas.width, canvas.height);
    dirty.current = false;
  };

  const save = () => {
    if (!dirty.current) return;
    onSave(canvasRef.current!.toDataURL('image/png'), name);
  };

  return (
    <div className="space-y-3">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Full name"
        className="h-11 w-full rounded-xl border border-line-md bg-surf px-3.5 text-[15px] text-ink-1 outline-none focus:border-amber/60"
      />
      <div className="overflow-hidden rounded-xl border border-line-md bg-white">
        <canvas
          ref={canvasRef}
          className="h-44 w-full touch-none"
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
        />
      </div>
      <p className="text-center text-xs text-ink-3">Sign above with your finger or stylus</p>
      <div className="flex gap-2">
        <button onClick={clear} className="flex-1 rounded-xl border border-line-md bg-elev py-2.5 text-sm text-ink-1">
          Clear
        </button>
        <button onClick={onCancel} className="flex-1 rounded-xl border border-line-md bg-elev py-2.5 text-sm text-ink-1">
          Cancel
        </button>
        <button onClick={save} className="flex-1 rounded-xl bg-amber py-2.5 text-sm font-semibold text-[#0B0E16]">
          Save
        </button>
      </div>
    </div>
  );
}

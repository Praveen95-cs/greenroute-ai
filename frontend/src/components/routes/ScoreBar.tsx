interface ScoreBarProps {
  label: string;
  value: number;
  color?: string;
}

export default function ScoreBar({ label, value, color = 'bg-primary-500' }: ScoreBarProps) {
  const pct = Math.round(value * 100);

  return (
    <div>
      <div className="mb-1 flex justify-between text-xs">
        <span className="text-slate-600">{label}</span>
        <span className="font-medium text-slate-800">{pct}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

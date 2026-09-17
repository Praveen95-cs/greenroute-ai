interface AlertProps {
  tone?: 'error' | 'success' | 'warning' | 'info';
  children: React.ReactNode;
}

const TONES = {
  error: 'border-red-200 bg-red-50 text-red-700',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
  info: 'border-sky-200 bg-sky-50 text-sky-800',
};

export default function Alert({ tone = 'info', children }: AlertProps) {
  return (
    <div className={`rounded-xl border px-4 py-3 text-sm leading-6 ${TONES[tone]}`} role="status">
      {children}
    </div>
  );
}

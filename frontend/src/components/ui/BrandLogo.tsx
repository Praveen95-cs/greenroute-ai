import { Link } from 'react-router-dom';

interface BrandLogoProps {
  to?: string;
  compact?: boolean;
}

export default function BrandLogo({ to = '/', compact = false }: BrandLogoProps) {
  const mark = (
    <span className="inline-flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-sm shadow-primary-600/30">
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
          />
        </svg>
      </span>
      {!compact && (
        <span className="leading-tight">
          <span className="block text-sm font-bold tracking-tight text-slate-900">GreenRoute</span>
          <span className="block text-[11px] font-medium uppercase tracking-[0.16em] text-primary-700">
            AI
          </span>
        </span>
      )}
    </span>
  );

  return (
    <Link to={to} className="shrink-0 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500">
      {mark}
    </Link>
  );
}

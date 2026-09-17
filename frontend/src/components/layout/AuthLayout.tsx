import { Link } from 'react-router-dom';
import BrandLogo from '../ui/BrandLogo';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footerText: string;
  footerLink: string;
  footerLinkLabel: string;
}

export default function AuthLayout({
  title,
  subtitle,
  children,
  footerText,
  footerLink,
  footerLinkLabel,
}: AuthLayoutProps) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-slate-950 px-12 py-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.28),transparent_42%),radial-gradient(circle_at_80%_80%,rgba(14,165,233,0.18),transparent_40%)]" />
        <BrandLogo to="/" />
        <div className="relative max-w-md">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-300">
            Decision intelligence
          </p>
          <h2 className="mt-4 text-4xl font-bold tracking-tight">
            Choose the trip that fits time, cost, and carbon — not just the map.
          </h2>
          <p className="mt-4 text-sm leading-6 text-slate-300">
            GreenRoute ranks options with transparent scores so you can travel with intent.
          </p>
        </div>
        <p className="relative text-xs text-slate-400">Sustainable mobility for cities that need better choices.</p>
      </aside>

      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <BrandLogo to="/" />
          </div>

          <div className="card p-8">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
            <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
            <div className="mt-6">{children}</div>
          </div>

          <p className="mt-6 text-center text-sm text-slate-600">
            {footerText}{' '}
            <Link to={footerLink} className="font-semibold text-primary-700 hover:text-primary-800">
              {footerLinkLabel}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useHealthCheck, useReadinessCheck } from '../hooks/useHealthCheck';
import BrandLogo from '../components/ui/BrandLogo';

function StatusBadge({ label, status }: { label: string; status: string }) {
  const isUp = status === 'healthy' || status === 'ready' || status === 'up';
  const isChecking = status.includes('checking');

  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
          isChecking
            ? 'bg-slate-100 text-slate-600'
            : isUp
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-amber-100 text-amber-800'
        }`}
      >
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            isChecking ? 'bg-slate-400' : isUp ? 'bg-emerald-500' : 'bg-amber-500'
          }`}
        />
        {status}
      </span>
    </div>
  );
}

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const { data: health, isLoading: healthLoading, isError: healthError } = useHealthCheck();
  const { data: readiness, isLoading: readinessLoading } = useReadinessCheck();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <BrandLogo />
          <nav className="flex items-center gap-2">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn-primary">
                Open workspace
              </Link>
            ) : (
              <>
                <Link to="/login" className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900">
                  Sign in
                </Link>
                <Link to="/register" className="btn-primary">
                  Get started
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-5 inline-flex items-center rounded-full border border-primary-200 bg-primary-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-primary-800">
              SDG 11 · Sustainable cities
            </p>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
              The best way there is not always the fastest.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              Compare time, cost, carbon, reliability, and walking — then pick a route that matches
              how you actually want to travel.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link to={isAuthenticated ? '/routes/plan' : '/register'} className="btn-primary px-6 py-3">
                Plan a route
              </Link>
              <a href="#how-it-works" className="btn-secondary px-6 py-3">
                See how it works
              </a>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { step: '01', title: 'Set your priorities', desc: 'Budget, walking limits, and carbon vs. time.' },
              { step: '02', title: 'Compare modes', desc: 'Bus, metro, walk, car, and more — ranked together.' },
              { step: '03', title: 'Ask in plain language', desc: 'The assistant extracts constraints, not invented facts.' },
              { step: '04', title: 'Share the ride', desc: 'Match carpools with a transparent compatibility score.' },
            ].map((item) => (
              <article key={item.step} className="card p-6">
                <p className="text-xs font-bold tracking-[0.2em] text-primary-700">{item.step}</p>
                <h2 className="mt-3 font-semibold text-slate-900">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="system-status" className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
          <div className="card p-8">
            <h2 className="text-xl font-bold text-slate-900">Live system status</h2>
            <p className="mt-1 text-sm text-slate-600">
              Connectivity across the app, API, database, and AI service.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <StatusBadge label="Frontend" status="healthy" />
              <StatusBadge
                label="Backend API"
                status={healthLoading ? 'checking...' : healthError ? 'unreachable' : (health?.data.status ?? 'unknown')}
              />
              <StatusBadge
                label="PostgreSQL"
                status={readinessLoading ? 'checking...' : (readiness?.data.checks.database ?? 'unknown')}
              />
              <StatusBadge
                label="AI Service"
                status={readinessLoading ? 'checking...' : (readiness?.data.checks.aiService ?? 'unknown')}
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white/70">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:px-6">
          <span>GreenRoute AI · Sustainable mobility decisions</span>
          <span>Time · Cost · Carbon · Reliability</span>
        </div>
      </footer>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/ui/PageHeader';

const ACTIONS = [
  {
    to: '/routes/plan',
    title: 'Route planner',
    desc: 'Compare modes by time, cost, and carbon with a recommended option.',
    cta: 'Plan a trip',
  },
  {
    to: '/assistant',
    title: 'AI assistant',
    desc: 'Describe the trip in natural language. Constraints are extracted, not invented.',
    cta: 'Ask for a route',
  },
  {
    to: '/carpool',
    title: 'Carpool matching',
    desc: 'Find compatible riders with a transparent compatibility score.',
    cta: 'Find a match',
  },
];

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      <PageHeader
        eyebrow="Workspace"
        title={`${greeting()}, ${user?.firstName}`}
        description="Plan a lower-impact trip, or let the assistant turn a plain-language request into ranked options."
        actions={
          <Link to="/routes/plan" className="btn-primary">
            New route
          </Link>
        }
      />

      <section className="overflow-hidden rounded-3xl bg-slate-950 p-6 text-white sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-300">Recommended next step</p>
        <h2 className="mt-3 max-w-xl text-2xl font-bold tracking-tight sm:text-3xl">
          Compare every mode before you leave.
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
          GreenRoute scores each option with the same rules so you can see the trade-off — not just a single “fastest” line on a map.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/routes/plan" className="btn-primary">
            Open planner
          </Link>
          <Link to="/assistant" className="rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/15">
            Use assistant
          </Link>
        </div>
      </section>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {ACTIONS.map((action) => (
          <Link
            key={action.to}
            to={action.to}
            className="card group p-6 transition hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-md"
          >
            <h3 className="font-semibold text-slate-900">{action.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{action.desc}</p>
            <p className="mt-4 text-sm font-semibold text-primary-700 group-hover:text-primary-800">
              {action.cta} →
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Link to="/preferences" className="card p-5 transition hover:border-primary-200">
          <h3 className="font-semibold text-slate-900">Preferences</h3>
          <p className="mt-1 text-sm text-slate-600">Walking limits, budget, and scoring weights used on every search.</p>
        </Link>
        <Link to="/profile" className="card p-5 transition hover:border-primary-200">
          <h3 className="font-semibold text-slate-900">Profile</h3>
          <p className="mt-1 text-sm text-slate-600">Update your name and account details.</p>
        </Link>
      </div>
    </div>
  );
}

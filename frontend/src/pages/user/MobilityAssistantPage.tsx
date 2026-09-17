import { useState } from 'react';
import { Link } from 'react-router-dom';
import { mobilityQuery } from '../../api/ai';
import { getErrorMessage } from '../../api/client';
import RouteOptionCard from '../../components/routes/RouteOptionCard';
import type { MobilityQueryResponse } from '../../types/ai';

const EXAMPLE_QUERIES = [
  "I need to reach Anna University before 9 AM. I have a budget of 100 rupees and don't want to walk more than 10 minutes.",
  'Get me to Marina Beach sustainably from T Nagar',
  'Fastest way to Chennai Airport from Chennai Central under ₹200',
];

export default function MobilityAssistantPage() {
  const [query, setQuery] = useState(EXAMPLE_QUERIES[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MobilityQueryResponse['data'] | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await mobilityQuery(query, 'Chennai Central');
      setResult(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">AI Mobility Assistant</h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        Describe your trip in natural language. The assistant extracts constraints, searches routes
        using backend calculations, and explains the recommendation — without inventing travel facts.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <label htmlFor="query" className="block text-sm font-medium text-slate-700">
            Your travel request
          </label>
          <textarea
            id="query"
            rows={4}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            placeholder="I need to reach..."
          />

          <div className="mt-3 flex flex-wrap gap-2">
            {EXAMPLE_QUERIES.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => setQuery(example)}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 hover:bg-slate-200"
              >
                Example
              </button>
            ))}
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || query.length < 3}
            className="mt-4 rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
          >
            {loading ? 'Analyzing...' : 'Get recommendation'}
          </button>
        </div>
      </form>

      {result && (
        <div className="mt-8 space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-slate-900">Extracted constraints</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <ConstraintChip label="From" value={result.constraints.source} />
              <ConstraintChip label="To" value={result.constraints.destination} />
              <ConstraintChip label="Priority" value={result.constraints.priority} />
              {result.constraints.budget != null && (
                <ConstraintChip label="Budget" value={`₹${result.constraints.budget}`} />
              )}
              {result.constraints.maxWalkingMinutes != null && (
                <ConstraintChip
                  label="Max walking"
                  value={`${result.constraints.maxWalkingMinutes} min`}
                />
              )}
              <ConstraintChip
                label="Confidence"
                value={`${Math.round(result.constraints.confidence * 100)}%`}
              />
            </div>
            {result.ambiguities.length > 0 && (
              <ul className="mt-4 space-y-1 text-sm text-amber-700">
                {result.ambiguities.map((a) => (
                  <li key={a}>• {a}</li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border border-primary-200 bg-primary-50/50 p-6">
            <h2 className="font-semibold text-slate-900">Recommendation explanation</h2>
            <p className="mt-3 text-slate-700">{result.explanation.explanation}</p>
            <ul className="mt-4 space-y-1">
              {result.explanation.highlights.map((h) => (
                <li key={h} className="text-sm text-primary-800">
                  ✓ {h}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-slate-500">{result.explanation.responsible_ai_note}</p>
          </section>

          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Route options</h2>
              <Link
                to={`/routes/${result.route.route.id}`}
                className="text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                Full comparison →
              </Link>
            </div>
            <p className="mb-4 text-sm text-amber-700">{result.route.disclaimer}</p>
            <div className="grid gap-4 lg:grid-cols-2">
              {result.route.options.map((option, i) => (
                <RouteOptionCard key={option.id} option={option} rank={i + 1} />
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function ConstraintChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}

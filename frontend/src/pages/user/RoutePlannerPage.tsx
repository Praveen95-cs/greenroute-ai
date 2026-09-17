import { useState } from 'react';
import { Link } from 'react-router-dom';
import RouteSearchForm, { RouteResultsPanel } from '../../components/routes/RouteSearchForm';
import type { RouteSearchResponse } from '../../types/route';

export default function RoutePlannerPage() {
  const [results, setResults] = useState<RouteSearchResponse['data'] | null>(null);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Route Planner</h1>
        <p className="mt-2 text-slate-600">
          Compare transport options by time, cost, carbon emissions, and your personal preferences.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <RouteSearchForm
          onResults={(data) => {
            setResults(data);
          }}
        />
      </div>

      {results && (
        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <Link
              to={`/routes/${results.route.id}`}
              className="text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              Open full comparison →
            </Link>
          </div>
          <RouteResultsPanel results={results} />
        </div>
      )}
    </div>
  );
}

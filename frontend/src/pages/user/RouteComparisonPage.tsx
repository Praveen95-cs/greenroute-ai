import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getErrorMessage } from '../../api/client';
import { getRoute, rankRoutes } from '../../api/routes';
import RouteOptionCard from '../../components/routes/RouteOptionCard';
import type { ScoringWeights } from '../../types/route';

const DEFAULT_WEIGHTS: ScoringWeights = {
  time: 0.25,
  cost: 0.2,
  carbon: 0.3,
  reliability: 0.15,
  walking: 0.1,
};

export default function RouteComparisonPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [weights, setWeights] = useState<ScoringWeights>(DEFAULT_WEIGHTS);
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['route', id],
    queryFn: () => getRoute(id!),
    enabled: !!id,
  });

  const rankMutation = useMutation({
    mutationFn: () => rankRoutes(id!, weights),
    onSuccess: (result) => {
      queryClient.setQueryData(['route', id], (old: typeof data) =>
        old
          ? {
              ...old,
              options: result.options,
              recommendedOptionId:
                result.options.find((o) => o.isRecommended)?.id ?? old.recommendedOptionId,
            }
          : old,
      );
      setError(null);
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  if (isLoading) {
    return <div className="text-slate-600">Loading route comparison...</div>;
  }

  if (!data) {
    return (
      <div>
        <p className="text-slate-600">Route not found.</p>
        <Link to="/routes/plan" className="mt-4 inline-block text-primary-600">
          ← Back to planner
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link to="/routes/plan" className="text-sm text-primary-600 hover:text-primary-700">
        ← Back to planner
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Route Comparison</h1>
          <p className="mt-2 text-slate-600">
            {data.route.source.label} → {data.route.destination.label}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {data.route.straightLineKm.toFixed(1)} km ·{' '}
            {new Date(data.route.departureTime).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-slate-900">Adjust ranking weights</h2>
        <p className="mt-1 text-sm text-slate-600">
          Slide to prioritize what matters most. Scores recalculate deterministically.
        </p>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {(Object.keys(weights) as Array<keyof ScoringWeights>).map((key) => (
            <div key={key}>
              <label className="block text-xs font-medium capitalize text-slate-600">
                {key} ({Math.round(weights[key] * 100)}%)
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(weights[key] * 100)}
                onChange={(e) =>
                  setWeights((prev) => ({
                    ...prev,
                    [key]: Number(e.target.value) / 100,
                  }))
                }
                className="mt-1 w-full accent-primary-600"
              />
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => rankMutation.mutate()}
          disabled={rankMutation.isPending}
          className="mt-4 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
        >
          {rankMutation.isPending ? 'Re-ranking...' : 'Re-rank routes'}
        </button>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        {data.options.map((option, index) => (
          <RouteOptionCard key={option.id} option={option} rank={index + 1} />
        ))}
      </div>
    </div>
  );
}

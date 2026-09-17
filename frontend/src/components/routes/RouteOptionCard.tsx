import { Link } from 'react-router-dom';
import type { RouteOption } from '../../types/route';
import ScoreBar from './ScoreBar';

interface RouteOptionCardProps {
  option: RouteOption;
  rank: number;
}

const MODE_COLORS: Record<string, string> = {
  WALK: 'bg-emerald-500',
  BIKE: 'bg-lime-500',
  BUS: 'bg-blue-500',
  METRO: 'bg-indigo-500',
  TRAIN: 'bg-violet-500',
  CAR: 'bg-slate-500',
  CARPOOL: 'bg-teal-500',
  AUTO: 'bg-amber-500',
};

export default function RouteOptionCard({ option, rank }: RouteOptionCardProps) {
  const color = MODE_COLORS[option.transportMode.code] ?? 'bg-primary-500';

  return (
    <div
      className={`rounded-2xl border bg-white p-6 shadow-sm ${
        option.isRecommended ? 'border-primary-400 ring-2 ring-primary-100' : 'border-slate-200'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-500">#{rank}</span>
            <h3 className="text-lg font-semibold text-slate-900">{option.transportMode.name}</h3>
            {option.isRecommended && (
              <span className="rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-semibold text-primary-700">
                Recommended
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-500">{option.transportMode.code}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-slate-900">{option.durationMinutes} min</p>
          <p className="text-sm text-slate-500">{option.distanceKm.toFixed(1)} km</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <Metric label="Cost" value={`₹${option.estimatedCost.toFixed(0)}`} />
        <Metric label="CO₂" value={`${option.estimatedCo2Grams.toFixed(0)}g`} />
        <Metric label="Walking" value={`${option.walkingMinutes} min`} />
      </div>

      {option.scores && (
        <div className="mt-5 space-y-2">
          <ScoreBar label="Sustainability" value={option.scores.sustainability} color={color} />
          <ScoreBar label="Carbon" value={option.scores.carbon} color="bg-green-500" />
          <ScoreBar label="Time" value={option.scores.time} color="bg-blue-500" />
          <ScoreBar label="Cost efficiency" value={option.scores.cost} color="bg-amber-500" />
        </div>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2 text-center">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

export function RouteOptionCardCompact({
  option,
  routeId,
}: {
  option: RouteOption;
  routeId: string;
}) {
  return (
    <Link
      to={`/routes/${routeId}`}
      className="block rounded-xl border border-slate-200 bg-white p-4 hover:border-primary-300 hover:shadow-sm"
    >
      <div className="flex items-center justify-between">
        <span className="font-medium text-slate-900">{option.transportMode.name}</span>
        <span className="text-sm text-slate-600">{option.durationMinutes} min</span>
      </div>
      <div className="mt-2 flex gap-4 text-xs text-slate-500">
        <span>₹{option.estimatedCost.toFixed(0)}</span>
        <span>{option.estimatedCo2Grams.toFixed(0)}g CO₂</span>
        {option.isRecommended && <span className="text-primary-600 font-medium">Best match</span>}
      </div>
    </Link>
  );
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { acceptCarpoolMatch, createCarpoolRequest, getCarpoolMatches } from '../../api/carpool';
import { getErrorMessage } from '../../api/client';
import { PRESET_LOCATIONS } from '../../schemas/route';

export default function CarpoolPage() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [originLabel, setOriginLabel] = useState('Chennai Central');
  const [destLabel, setDestLabel] = useState('Anna University');
  const [seats, setSeats] = useState(2);
  const [detour, setDetour] = useState(3);

  const { data: matches = [], isLoading } = useQuery({
    queryKey: ['carpool-matches'],
    queryFn: getCarpoolMatches,
  });

  const createMutation = useMutation({
    mutationFn: createCarpoolRequest,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['carpool-matches'] });
      setMessage(
        data.matchCount > 0
          ? `Found ${data.matchCount} compatible match(es)!`
          : 'Request posted. No matches yet — check back later.',
      );
      setError(null);
    },
    onError: (err) => {
      setError(getErrorMessage(err));
      setMessage(null);
    },
  });

  const acceptMutation = useMutation({
    mutationFn: acceptCarpoolMatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carpool-matches'] });
      setMessage('Match accepted!');
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const resolve = (label: string) =>
    PRESET_LOCATIONS.find((l) => l.label === label) ?? PRESET_LOCATIONS[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const origin = resolve(originLabel);
    const dest = resolve(destLabel);

    createMutation.mutate({
      origin: { lat: origin.lat, lng: origin.lng, label: origin.label },
      destination: { lat: dest.lat, lng: dest.lng, label: dest.label },
      departureTime: new Date(Date.now() + 3600000).toISOString(),
      availableSeats: seats,
      maxDetourKm: detour,
    });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Carpool Matching</h1>
      <p className="mt-2 text-slate-600">
        Find compatible riders based on origin, destination, departure time, and detour tolerance.
        Compatibility scores are transparent and calculated deterministically.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 max-w-xl space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">Origin</label>
            <select
              value={originLabel}
              onChange={(e) => setOriginLabel(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              {PRESET_LOCATIONS.map((l) => (
                <option key={l.label} value={l.label}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Destination</label>
            <select
              value={destLabel}
              onChange={(e) => setDestLabel(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              {PRESET_LOCATIONS.map((l) => (
                <option key={l.label} value={l.label}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">Available seats</label>
            <input
              type="number"
              min={1}
              max={8}
              value={seats}
              onChange={(e) => setSeats(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Max detour (km)</label>
            <input
              type="number"
              min={0}
              max={20}
              step="0.5"
              value={detour}
              onChange={(e) => setDetour(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        {message && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {message}
          </div>
        )}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={createMutation.isPending}
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
        >
          {createMutation.isPending ? 'Searching...' : 'Post carpool request'}
        </button>
      </form>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-slate-900">Your matches</h2>
        {isLoading ? (
          <p className="mt-4 text-slate-600">Loading matches...</p>
        ) : matches.length === 0 ? (
          <p className="mt-4 text-slate-600">No matches yet. Post a request to find compatible riders.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {matches.map((match) => (
              <div
                key={match.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4"
              >
                <div>
                  <p className="font-medium text-slate-900">
                    {match.matchedUser.firstName} {match.matchedUser.lastName}
                  </p>
                  <p className="text-sm text-slate-600">
                    Compatibility: {Math.round(match.compatibilityScore * 100)}% · Detour:{' '}
                    {match.detourKm} km
                  </p>
                  {match.request && (
                    <p className="text-xs text-slate-500">
                      {match.request.origin.label} → {match.request.destination.label}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      match.status === 'ACCEPTED'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {match.status}
                  </span>
                  {match.status !== 'ACCEPTED' && (
                    <button
                      type="button"
                      onClick={() => acceptMutation.mutate(match.id)}
                      disabled={acceptMutation.isPending}
                      className="rounded-lg border border-primary-300 px-3 py-1 text-sm font-medium text-primary-700 hover:bg-primary-50"
                    >
                      Accept
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

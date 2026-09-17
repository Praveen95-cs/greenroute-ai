import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { getErrorMessage } from '../../api/client';
import { getPreferences, updatePreferences } from '../../api/user';
import { TRANSPORT_OPTIONS } from '../../constants';
import { parseOptionalNumber, preferencesSchema, type PreferencesFormValues } from '../../schemas/preferences';

export default function PreferencesPage() {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: preferences, isLoading } = useQuery({
    queryKey: ['preferences'],
    queryFn: getPreferences,
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { isDirty },
  } = useForm<PreferencesFormValues>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      sustainabilityPriority: 50,
      timePriority: 50,
    },
  });

  const sustainabilityPriority = watch('sustainabilityPriority');
  const timePriority = watch('timePriority');

  useEffect(() => {
    if (preferences) {
      reset({
        preferredTransport: preferences.preferredTransport ?? '',
        maxWalkingDistanceM:
          preferences.maxWalkingDistanceM != null
            ? String(preferences.maxWalkingDistanceM)
            : '',
        maxBudget: preferences.maxBudget != null ? String(preferences.maxBudget) : '',
        sustainabilityPriority: preferences.sustainabilityPriority,
        timePriority: preferences.timePriority,
      });
    }
  }, [preferences, reset]);

  const mutation = useMutation({
    mutationFn: updatePreferences,
    onSuccess: (updated) => {
      queryClient.setQueryData(['preferences'], updated);
      setMessage('Preferences saved successfully');
      setError(null);
    },
    onError: (err) => {
      setError(getErrorMessage(err));
      setMessage(null);
    },
  });

  const onSubmit = (values: PreferencesFormValues) => {
    mutation.mutate({
      preferredTransport: values.preferredTransport || null,
      maxWalkingDistanceM: parseOptionalNumber(values.maxWalkingDistanceM),
      maxBudget: parseOptionalNumber(values.maxBudget),
      sustainabilityPriority: values.sustainabilityPriority,
      timePriority: values.timePriority,
    });
  };

  if (isLoading) {
    return <div className="text-slate-600">Loading preferences...</div>;
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-slate-900">Mobility Preferences</h1>
      <p className="mt-2 text-slate-600">
        These settings influence route scoring and recommendations.
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-8 space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
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

        <div>
          <label htmlFor="preferredTransport" className="block text-sm font-medium text-slate-700">
            Preferred transport mode
          </label>
          <select
            id="preferredTransport"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            {...register('preferredTransport')}
          >
            {TRANSPORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="maxWalkingDistanceM" className="block text-sm font-medium text-slate-700">
            Maximum walking distance (meters)
          </label>
          <input
            id="maxWalkingDistanceM"
            type="number"
            min={0}
            placeholder="e.g. 800"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            {...register('maxWalkingDistanceM')}
          />
        </div>

        <div>
          <label htmlFor="maxBudget" className="block text-sm font-medium text-slate-700">
            Maximum budget per trip (₹)
          </label>
          <input
            id="maxBudget"
            type="number"
            min={0}
            step="0.01"
            placeholder="e.g. 100"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            {...register('maxBudget')}
          />
        </div>

        <div>
          <label htmlFor="sustainabilityPriority" className="block text-sm font-medium text-slate-700">
            Sustainability priority: {sustainabilityPriority ?? 50}%
          </label>
          <input
            id="sustainabilityPriority"
            type="range"
            min={0}
            max={100}
            className="mt-2 w-full accent-primary-600"
            {...register('sustainabilityPriority')}
          />
          <div className="flex justify-between text-xs text-slate-500">
            <span>Time/cost focus</span>
            <span>Carbon focus</span>
          </div>
        </div>

        <div>
          <label htmlFor="timePriority" className="block text-sm font-medium text-slate-700">
            Time priority: {timePriority ?? 50}%
          </label>
          <input
            id="timePriority"
            type="range"
            min={0}
            max={100}
            className="mt-2 w-full accent-primary-600"
            {...register('timePriority')}
          />
          <div className="flex justify-between text-xs text-slate-500">
            <span>Cost focus</span>
            <span>Speed focus</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={!isDirty || mutation.isPending}
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
        >
          {mutation.isPending ? 'Saving...' : 'Save preferences'}
        </button>
      </form>
    </div>
  );
}

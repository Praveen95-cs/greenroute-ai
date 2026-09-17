import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { getErrorMessage } from '../../api/client';
import { searchRoutes } from '../../api/routes';
import {
  MODE_OPTIONS,
  PRESET_LOCATIONS,
  routeSearchSchema,
  type RouteSearchFormValues,
} from '../../schemas/route';
import type { RouteSearchResponse } from '../../types/route';
import RouteOptionCard from './RouteOptionCard';

interface RouteSearchFormProps {
  onResults: (results: RouteSearchResponse['data']) => void;
}

export default function RouteSearchForm({ onResults }: RouteSearchFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [selectedModes, setSelectedModes] = useState<string[]>([
    'BUS',
    'METRO',
    'TRAIN',
    'CAR',
    'WALK',
  ]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RouteSearchFormValues>({
    resolver: zodResolver(routeSearchSchema),
    defaultValues: {
      sourceLabel: 'Chennai Central',
      sourceLat: 13.0827,
      sourceLng: 80.2707,
      destLabel: 'Anna University',
      destLat: 13.0067,
      destLng: 80.2206,
      departureTime: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
    },
  });

  const applyPreset = (type: 'source' | 'dest', preset: (typeof PRESET_LOCATIONS)[number]) => {
    if (type === 'source') {
      setValue('sourceLabel', preset.label);
      setValue('sourceLat', preset.lat);
      setValue('sourceLng', preset.lng);
    } else {
      setValue('destLabel', preset.label);
      setValue('destLat', preset.lat);
      setValue('destLng', preset.lng);
    }
  };

  const toggleMode = (mode: string) => {
    setSelectedModes((prev) =>
      prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode],
    );
  };

  const onSubmit = async (values: RouteSearchFormValues) => {
    setError(null);
    try {
      const results = await searchRoutes({
        source: {
          lat: values.sourceLat,
          lng: values.sourceLng,
          label: values.sourceLabel,
        },
        destination: {
          lat: values.destLat,
          lng: values.destLng,
          label: values.destLabel,
        },
        departureTime: new Date(values.departureTime).toISOString(),
        arrivalDeadline: values.arrivalDeadline
          ? new Date(values.arrivalDeadline).toISOString()
          : undefined,
        transportModes: selectedModes.length > 0 ? selectedModes : undefined,
      });
      onResults(results);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <LocationFields
          title="From"
          labelField="sourceLabel"
          latField="sourceLat"
          lngField="sourceLng"
          register={register}
          errors={errors}
          onPreset={(p) => applyPreset('source', p)}
        />
        <LocationFields
          title="To"
          labelField="destLabel"
          latField="destLat"
          lngField="destLng"
          register={register}
          errors={errors}
          onPreset={(p) => applyPreset('dest', p)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700">Departure time</label>
          <input
            type="datetime-local"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            {...register('departureTime')}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Arrival deadline (optional)
          </label>
          <input
            type="datetime-local"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            {...register('arrivalDeadline')}
          />
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-slate-700">Transport modes</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {MODE_OPTIONS.map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => toggleMode(mode)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                selectedModes.includes(mode)
                  ? 'bg-primary-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || selectedModes.length === 0}
        className="rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
      >
        {isSubmitting ? 'Searching routes...' : 'Find sustainable routes'}
      </button>
    </form>
  );
}

function LocationFields({
  title,
  labelField,
  latField,
  lngField,
  register,
  errors,
  onPreset,
}: {
  title: string;
  labelField: keyof RouteSearchFormValues;
  latField: keyof RouteSearchFormValues;
  lngField: keyof RouteSearchFormValues;
  register: ReturnType<typeof useForm<RouteSearchFormValues>>['register'];
  errors: ReturnType<typeof useForm<RouteSearchFormValues>>['formState']['errors'];
  onPreset: (preset: (typeof PRESET_LOCATIONS)[number]) => void;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="font-medium text-slate-900">{title}</h3>
      <div className="mt-3 space-y-3">
        <input
          placeholder="Location name"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          {...register(labelField)}
        />
        {errors[labelField] && (
          <p className="text-sm text-red-600">{errors[labelField]?.message as string}</p>
        )}
        <div className="grid grid-cols-2 gap-2">
          <input
            step="any"
            type="number"
            placeholder="Lat"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            {...register(latField, { valueAsNumber: true })}
          />
          <input
            step="any"
            type="number"
            placeholder="Lng"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            {...register(lngField, { valueAsNumber: true })}
          />
        </div>
        <div className="flex flex-wrap gap-1">
          {PRESET_LOCATIONS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => onPreset(preset)}
              className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600 hover:bg-slate-200"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function RouteResultsPanel({
  results,
}: {
  results: RouteSearchResponse['data'];
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        {results.disclaimer}
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">
          {results.options.length} route options
        </h2>
        <span className="text-sm text-slate-500">
          {results.straightLineKm.toFixed(1)} km straight-line
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {results.options.map((option, index) => (
          <RouteOptionCard key={option.id} option={option} rank={index + 1} />
        ))}
      </div>
    </div>
  );
}

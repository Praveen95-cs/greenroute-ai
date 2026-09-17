import { env } from '../../config/env';

export interface GeocodeHit {
  label: string;
  lat: number;
  lng: number;
}

interface NominatimHit {
  display_name: string;
  lat: string;
  lon: string;
}

export async function geocodePlaces(query: string): Promise<GeocodeHit[]> {
  const url = new URL('/search', env.NOMINATIM_BASE_URL);
  url.searchParams.set('q', query);
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', '6');
  url.searchParams.set('addressdetails', '0');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'GreenRoute-AI/0.1 (sustainable-mobility)',
        Accept: 'application/json',
      },
    });

    if (!response.ok) return [];

    const data = (await response.json()) as NominatimHit[];
    return data.map((hit) => ({
      label: hit.display_name,
      lat: Number(hit.lat),
      lng: Number(hit.lon),
    }));
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

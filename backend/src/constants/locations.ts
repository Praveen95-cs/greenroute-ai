export interface KnownLocation {
  label: string;
  lat: number;
  lng: number;
  aliases: string[];
}

export const KNOWN_LOCATIONS: KnownLocation[] = [
  {
    label: 'Chennai Central',
    lat: 13.0827,
    lng: 80.2707,
    aliases: ['chennai central', 'central station', 'central'],
  },
  {
    label: 'Anna University',
    lat: 13.0067,
    lng: 80.2206,
    aliases: ['anna university', 'anna univ', 'guindy campus'],
  },
  {
    label: 'T Nagar',
    lat: 13.0418,
    lng: 80.2341,
    aliases: ['t nagar', 'tnagar', 'thyagaraya nagar'],
  },
  {
    label: 'Chennai Airport',
    lat: 12.9941,
    lng: 80.1709,
    aliases: ['chennai airport', 'airport', 'maa'],
  },
  {
    label: 'Marina Beach',
    lat: 13.05,
    lng: 80.2824,
    aliases: ['marina beach', 'marina'],
  },
];

export function resolveLocation(label: string): KnownLocation | null {
  const normalized = label.toLowerCase().trim();

  for (const loc of KNOWN_LOCATIONS) {
    if (loc.label.toLowerCase() === normalized) return loc;
    if (loc.aliases.some((a) => normalized.includes(a) || a.includes(normalized))) {
      return loc;
    }
  }

  return null;
}

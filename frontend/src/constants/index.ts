export const AUTH_TOKEN_KEY = 'greenroute_access_token';

export const TRANSPORT_OPTIONS = [
  { value: '', label: 'No preference' },
  { value: 'WALK', label: 'Walking' },
  { value: 'BIKE', label: 'Bicycle' },
  { value: 'BUS', label: 'Bus' },
  { value: 'METRO', label: 'Metro' },
  { value: 'TRAIN', label: 'Train' },
  { value: 'CAR', label: 'Private Car' },
  { value: 'CARPOOL', label: 'Carpool' },
  { value: 'AUTO', label: 'Auto Rickshaw' },
] as const;

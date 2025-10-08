// lib/queries.ts
import { getAllProviders, type Provider } from './firestore';

// ---------- utilities ----------
function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function getStr(obj: Record<string, unknown>, key: string): string | undefined {
  const v = obj[key];
  return typeof v === 'string' && v.trim().length > 0 ? v.trim() : undefined;
}

/** Coerce unknown object into a Provider shape (no billing) */
export function coerceProvider(input: unknown): Provider {
  const r = isRecord(input) ? input : {};

  const mapsUrl = getStr(r, 'mapsUrl') ?? getStr(r, 'mapUrl');

  const id = getStr(r, 'id') ?? '';
  const name = getStr(r, 'name') ?? '';

  const country = getStr(r, 'country');
  const city = getStr(r, 'city');
  const phone = getStr(r, 'phone');
  const email = getStr(r, 'email');

  const lat =
    typeof r.lat === 'number'
      ? r.lat
      : typeof r.lat === 'string' && r.lat.trim()
        ? Number(r.lat)
        : undefined;

  const lng =
    typeof r.lng === 'number'
      ? r.lng
      : typeof r.lng === 'string' && r.lng.trim()
        ? Number(r.lng)
        : undefined;

  const placeId = getStr(r, 'placeId');

  const extras: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(r)) {
    if (
      ![
        'id',
        'name',
        'country',
        'city',
        'phone',
        'email',
        'mapsUrl',
        'mapUrl',
        'placeId',
        'lat',
        'lng',
      ].includes(k)
    ) {
      extras[k] = v;
    }
  }

  return {
    id,
    name,
    country,
    city,
    phone,
    email,
    mapsUrl,
    placeId,
    lat: Number.isFinite(lat) ? (lat as number) : undefined,
    lng: Number.isFinite(lng) ? (lng as number) : undefined,
    ...extras,
  };
}

/** Fetch providers (already TH/PH filtered in firestore.ts) */
export async function fetchProviders(): Promise<Provider[]> {
  return getAllProviders();
}

/** Lightweight count helper */
export async function fetchProvidersCount(): Promise<number> {
  const list = await fetchProviders();
  return list.length;
}

/** Filter by country/city only (no billing) */
export function filterProviders(
  providers: Provider[],
  opts: {
    country?: string;
    city?: string;
  },
): Provider[] {
  const { country, city } = opts;

  return providers.filter((p) => {
    const okCountry =
      country && country !== 'All' ? (p.country ?? '') === country : true;
    const okCity =
      city && city !== 'All'
        ? (p.city ?? '').toLowerCase() === city.toLowerCase()
        : true;

    return okCountry && okCity;
  });
}

/** Derive distinct countries and cities (for dropdowns). */
export function deriveFacets(providers: Provider[]) {
  const countries = new Set<string>();
  const citiesByCountry = new Map<string, Set<string>>();

  for (const p of providers) {
    if (p.country) {
      countries.add(p.country);
      if (!citiesByCountry.has(p.country)) {
        citiesByCountry.set(p.country, new Set());
      }
      if (p.city) {
        citiesByCountry.get(p.country)!.add(p.city);
      }
    }
  }

  return {
    countries: ['All', ...Array.from(countries).sort()],
    citiesFor: (country?: string) =>
      country && country !== 'All'
        ? ['All', ...Array.from(citiesByCountry.get(country) ?? []).sort()]
        : ['All'],
  };
}

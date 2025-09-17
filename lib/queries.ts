// lib/queries.ts
// Centralized query helpers aligned with lib/firestore.ts
// - Avoids `any` via safe narrows
// - Normalizes billing to 'Direct' | 'Reimbursement'
// - Provides helpers for counts, filtering, and facet derivation

import { getAllProviders, type Provider } from './firestore';

// ---------- utilities ----------

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function getStr(obj: Record<string, unknown>, key: string): string | undefined {
  const v = obj[key];
  return typeof v === 'string' && v.trim().length > 0 ? v.trim() : undefined;
}

// ---------- normalization ----------

export function normalizeBilling(
  billing?: string | null,
): Provider['billing'] {
  if (!billing) return undefined;
  const b = String(billing).trim().toLowerCase();
  if (b === 'direct') return 'Direct';
  if (b === 'reimbursement' || b === 'reimbursed') return 'Reimbursement';
  return undefined;
}

/**
 * Coerce an unknown Firestore-ish object into a strict Provider shape.
 * Useful for legacy/one-off imports. Prefer using getAllProviders() when possible.
 */
export function coerceProvider(input: unknown): Provider {
  const r = isRecord(input) ? input : {};

  // Prefer normalized mapsUrl; fall back to legacy mapUrl if present.
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

  // Keep extra keys without using `any`
  const extras: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(r)) {
    if (
      ![
        'id',
        'name',
        'country',
        'city',
        'billing',
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
    billing: normalizeBilling(getStr(r, 'billing')),
    phone,
    email,
    mapsUrl,
    placeId,
    lat: Number.isFinite(lat) ? (lat as number) : undefined,
    lng: Number.isFinite(lng) ? (lng as number) : undefined,
    ...extras,
  };
}

/**
 * Fetch all providers (already normalized in lib/firestore).
 * We lightly re-normalize billing here to be resilient to older data.
 */
export async function fetchProviders(): Promise<Provider[]> {
  const list = await getAllProviders(); // Provider[]
  return list.map((p) => ({
    ...p,
    billing:
      normalizeBilling(
        typeof p.billing === 'string' ? p.billing : undefined,
      ) ?? p.billing,
  }));
}

/** Lightweight count helper (client-side). */
export async function fetchProvidersCount(): Promise<number> {
  const list = await fetchProviders();
  return list.length;
}

/** Filter by country/city/billing (used by Providers screen). */
export function filterProviders(
  providers: Provider[],
  opts: {
    country?: string;
    city?: string;
    billing?: Provider['billing'];
  },
): Provider[] {
  const { country, city, billing } = opts;

  return providers.filter((p) => {
    const okCountry = country && country !== 'All' ? p.country === country : true;
    const okCity =
      city && city !== 'All'
        ? (p.city ?? '').toLowerCase() === city.toLowerCase()
        : true;
    const okBilling =
      typeof billing !== 'undefined' && billing !== null
        ? p.billing === billing
        : true;

    return okCountry && okCity && okBilling;
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
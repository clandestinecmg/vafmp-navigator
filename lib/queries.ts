// lib/queries.ts
// Centralized query helpers that are aligned with lib/firestore.ts
// - Ensures mapsUrl is present (falls back from legacy mapUrl if needed)
// - Normalizes billing to 'Direct' | 'Reimbursement'
// - Provides small helpers for counts and simple filtering

import { getAllProviders, type Provider } from './firestore';

// Normalize billing to the strict union while gracefully accepting legacy values.
function normalizeBilling(billing?: string): Provider['billing'] {
  if (!billing) return undefined;
  const b = billing.trim().toLowerCase();
  if (b === 'direct') return 'Direct';
  if (b === 'reimbursement' || b === 'reimbursed') return 'Reimbursement';
  return undefined;
}

// Coerce any shape coming from Firestore into our strict Provider.
export function coerceProvider(p: any): Provider {
  // Prefer mapsUrl; fall back from legacy "mapUrl" if present.
  const mapsUrl: string | undefined =
    typeof p?.mapsUrl === 'string' && p.mapsUrl.length > 0
      ? p.mapsUrl
      : typeof p?.mapUrl === 'string' && p.mapUrl.length > 0
      ? p.mapUrl
      : undefined;

  return {
    id: String(p.id),
    name: String(p.name ?? '').trim(),
    country: p.country ? String(p.country).trim() : undefined,
    city: p.city ? String(p.city).trim() : undefined,
    billing: normalizeBilling(p.billing),
    phone: p.phone ? String(p.phone).trim() : undefined,
    email: p.email ? String(p.email).trim() : undefined,
    mapsUrl,
  };
}

/**
 * Fetch all providers, normalized for the app.
 */
export async function fetchProviders(): Promise<Provider[]> {
  const raw = await getAllProviders();
  // getAllProviders() already returns Provider[] from firestore.ts,
  // but we still coerce to be resilient to legacy fields.
  return (raw as any[]).map(coerceProvider);
}

/**
 * Lightweight count helper (client-side).
 * For small data this is fine; if it grows, swap to Firestore count() aggregation.
 */
export async function fetchProvidersCount(): Promise<number> {
  const list = await fetchProviders();
  return list.length;
}

/**
 * Utility: filter by country/city/billing (used by Providers screen if needed).
 */
export function filterProviders(
  providers: Provider[],
  {
    country,
    city,
    billing,
  }: { country?: string; city?: string; billing?: Provider['billing'] }
): Provider[] {
  return providers.filter((p) => {
    const okCountry = country && country !== 'All' ? p.country === country : true;
    const okCity =
      city && city !== 'All'
        ? (p.city ?? '').toLowerCase() === city.toLowerCase()
        : true;
    const okBilling =
      billing && billing !== undefined ? p.billing === billing : true;

    return okCountry && okCity && okBilling;
  });
}

/**
 * Derive distinct countries and cities (for dropdowns).
 */
export function deriveFacets(providers: Provider[]) {
  const countries = new Set<string>();
  const citiesByCountry = new Map<string, Set<string>>();

  for (const p of providers) {
    if (p.country) {
      countries.add(p.country);
      if (!citiesByCountry.has(p.country)) citiesByCountry.set(p.country, new Set());
      if (p.city) citiesByCountry.get(p.country)!.add(p.city);
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
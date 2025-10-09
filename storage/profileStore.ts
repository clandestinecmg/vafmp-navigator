// storage/profileStore.ts
import { secureGet, secureSet, secureDelete } from './secure';
import { Profile, emptyProfile } from '../types/profile';

const KEY = 'profile';
const SCHEMA_VERSION = 1;

type Versioned<T> = { v: number; data: T };

function isVersionedProfile(x: unknown): x is Versioned<Profile> {
  if (typeof x !== 'object' || x === null) return false;
  const r = x as Record<string, unknown>;
  return (
    typeof r.v === 'number' && typeof r.data === 'object' && r.data !== null
  );
}

function sanitizeProfile(p: Partial<Profile> | null | undefined): Profile {
  const clean: Record<string, string> = {};
  for (const [k, v] of Object.entries(p || {})) {
    clean[k] = typeof v === 'string' ? v.trim() : '';
  }
  return { ...emptyProfile, ...(clean as Profile) };
}

export async function loadProfile(): Promise<Profile> {
  const raw = await secureGet(KEY);
  if (!raw) return emptyProfile;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (isVersionedProfile(parsed)) return sanitizeProfile(parsed.data);
    return sanitizeProfile(parsed as Profile); // legacy unversioned
  } catch (err) {
    console.warn('Profile parse failed, resetting.', err);
    return emptyProfile;
  }
}

export async function saveProfile(next: Profile): Promise<void> {
  const cleaned = sanitizeProfile(next);
  const payload: Versioned<Profile> = { v: SCHEMA_VERSION, data: cleaned };
  try {
    await secureSet(KEY, JSON.stringify(payload));
  } catch (err) {
    console.warn('Failed to save profile', err);
  }
}

export async function resetProfile(): Promise<void> {
  await secureDelete(KEY);
}

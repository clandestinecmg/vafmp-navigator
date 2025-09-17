// storage/profileStore.ts
import { secureGet, secureSet, secureDelete } from './secure';
import { Profile, emptyProfile, validateProfile } from '../types/profile';

const KEY = 'profile';
const SCHEMA_VERSION = 1;

type Versioned<T> = { v: number; data: T };

function isVersionedProfile(x: unknown): x is Versioned<Profile> {
  if (typeof x !== 'object' || x === null) return false;
  const rec = x as Record<string, unknown>;
  return (
    typeof rec.v === 'number' &&
    rec.data !== null &&
    typeof rec.data === 'object'
  );
}

export async function loadProfile(): Promise<Profile> {
  const raw = await secureGet(KEY);
  if (!raw) return emptyProfile;

  try {
    const parsed: unknown = JSON.parse(raw);

    // Handle current (versioned) format
    if (isVersionedProfile(parsed)) {
      return parsed.data ?? emptyProfile;
    }

    // Backward compat: legacy unversioned format stored the Profile directly
    return parsed as Profile;
  } catch {
    // Corrupt or non-JSON data -> reset to empty
    return emptyProfile;
  }
}

export async function saveProfile(next: Profile): Promise<void> {
  const v = validateProfile(next);
  if (!v.ok) throw new Error(v.reason);

  const payload: Versioned<Profile> = { v: SCHEMA_VERSION, data: next };
  await secureSet(KEY, JSON.stringify(payload));
}

export async function resetProfile(): Promise<void> {
  await secureDelete(KEY);
}
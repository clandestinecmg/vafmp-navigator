// hooks/userProfile.ts
import { useEffect, useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { Profile, emptyProfile } from '../types/profile';
import {
  loadProfile,
  saveProfile,
  resetProfile,
} from '../storage/profileStore';

export function useProfile() {
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [hydrated, setHydrated] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const p = await loadProfile();
      setProfile(p);
      setHydrated(true);
    })();
  }, []);

  const update = useCallback(async (next: Profile) => {
    try {
      setSaving(true);
      await saveProfile(next);
      setProfile(next);
    } catch (e: unknown) {
      const msg =
        e instanceof Error ? e.message : 'Could not save profile';
      Alert.alert('Profile Error', msg);
      throw e;
    } finally {
      setSaving(false);
    }
  }, []);

  const reset = useCallback(async () => {
    await resetProfile();
    setProfile(emptyProfile);
  }, []);

  return { profile, setProfile, update, reset, hydrated, saving };
}
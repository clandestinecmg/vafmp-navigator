// storage/secure.ts
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SCOPE = 'vafmp';
// SecureStore does NOT allow ":" in keys on Android. Use dot/underscore only.
const SECURE_PREFIX = `${SCOPE}.`;
const FALLBACK_PREFIX = `${SCOPE}__fb__`;

// ---- Public API -------------------------------------------------------------

export async function secureSet(key: string, value: string) {
  const secureKey = SECURE_PREFIX + key;
  try {
    await SecureStore.setItemAsync(secureKey, value, {
      keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
      requireAuthentication: false,
    });
  } catch (err) {
    console.warn('SecureStore.setItemAsync failed, falling back', err);
  }

  try {
    await AsyncStorage.setItem(FALLBACK_PREFIX + key, value);
  } catch (err) {
    console.warn('AsyncStorage fallback set failed', err);
  }
}

export async function secureGet(key: string) {
  const secureKey = SECURE_PREFIX + key;
  try {
    const v = await SecureStore.getItemAsync(secureKey);
    if (v != null) return v;
  } catch (err) {
    console.warn('SecureStore.getItemAsync failed', err);
  }

  try {
    return await AsyncStorage.getItem(FALLBACK_PREFIX + key);
  } catch (err) {
    console.warn('AsyncStorage fallback get failed', err);
    return null;
  }
}

export async function secureDelete(key: string) {
  const secureKey = SECURE_PREFIX + key;
  try {
    await SecureStore.deleteItemAsync(secureKey);
  } catch (err) {
    console.warn('SecureStore.deleteItemAsync failed', err);
  }

  try {
    await AsyncStorage.removeItem(FALLBACK_PREFIX + key);
  } catch (err) {
    console.warn('AsyncStorage fallback remove failed', err);
  }
}

/**
 * Wipe ALL app-namespaced fallback entries (profile, etc).
 * SecureStore can’t list keys, so we delete known ones explicitly from there.
 */
export async function secureWipeAll(knownKeys: string[] = []) {
  // wipe fallbacks
  try {
    const keys = await AsyncStorage.getAllKeys();
    const ours = keys.filter((k) => k.startsWith(FALLBACK_PREFIX));
    if (ours.length) await AsyncStorage.multiRemove(ours);
  } catch (err) {
    console.warn('AsyncStorage multi-remove failed', err);
  }

  // best-effort wipe in SecureStore for known keys
  await Promise.all(
    knownKeys.map(async (k) => {
      try {
        await SecureStore.deleteItemAsync(SECURE_PREFIX + k);
      } catch (err) {
        console.warn('SecureStore delete (known key) failed', k, err);
      }
    }),
  );
}

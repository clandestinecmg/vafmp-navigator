import * as SecureStore from 'expo-secure-store';

const SCOPE = 'vafmp';

export async function secureSet(key: string, value: string) {
  await SecureStore.setItemAsync(`${SCOPE}:${key}`, value, {
    keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
    requireAuthentication: false,
  });
}

export async function secureGet(key: string) {
  return SecureStore.getItemAsync(`${SCOPE}:${key}`);
}

export async function secureDelete(key: string) {
  return SecureStore.deleteItemAsync(`${SCOPE}:${key}`);
}

//lib/onMap.ts
import { Alert, Linking, Platform } from 'react-native';

/**
 * Open a location in the user's maps app.
 * - If `mapsUrl` is provided, we use it.
 * - Otherwise we build a search query from name/city/country.
 */
export function onMap(
  mapsUrl?: string,
  name?: string,
  city?: string,
  country?: string,
) {
  // If given a direct URL, prefer it
  if (mapsUrl && /^https?:\/\//i.test(mapsUrl)) {
    Linking.openURL(mapsUrl).catch(() =>
      Alert.alert('Error', 'Unable to open Maps app.'),
    );
    return;
  }

  const qParts = [name, city, country].filter(Boolean);
  const query = encodeURIComponent(qParts.join(', '));
  if (!query) {
    Alert.alert('No Map', 'This provider does not have a map link yet.');
    return;
  }

  const url =
    Platform.select({
      ios: `http://maps.apple.com/?q=${query}`,
      android: `geo:0,0?q=${query}`,
    }) ?? `https://maps.google.com/?q=${query}`;

  Linking.openURL(url).catch(() =>
    Alert.alert('Error', 'Unable to open Maps app.'),
  );
}

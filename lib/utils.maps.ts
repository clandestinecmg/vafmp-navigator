// lib/utils.maps.ts
import { Linking } from 'react-native';

export type LatLng = { lat?: number; lng?: number };

export function buildGoogleMapsUrl(
  params: {
    name?: string;
    city?: string;
    placeId?: string;
    mapsUrl?: string;
  } & LatLng,
) {
  const { mapsUrl, placeId, name, city, lat, lng } = params;

  if (mapsUrl) return mapsUrl;

  if (placeId) {
    const q = encodeURIComponent(name || '');
    return `https://www.google.com/maps/search/?api=1&query=${q}&query_place_id=${placeId}`;
    // Note: query_place_id ensures Google Maps opens the exact place listing (not a dropped pin) when possible.
  }

  if (typeof lat === 'number' && typeof lng === 'number') {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }

  const q = encodeURIComponent([name, city].filter(Boolean).join(' '));
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

export async function openInMaps(url: string) {
  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) await Linking.openURL(url);
  } catch {
    // noop
  }
}

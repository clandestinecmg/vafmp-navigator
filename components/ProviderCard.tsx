// components/ProviderCard.tsx
import * as React from 'react';
import { View, Text, StyleSheet, Pressable, Share, Linking } from 'react-native';
import { buildGoogleMapsUrl, openInMaps } from '../lib/utils.maps';

export type ProviderCardItem = {
  id: string;
  name: string;
  city?: string;
  country?: string;
  billing?: 'Direct' | 'Reimbursement' | string | null;
  phone?: string;
  mapsUrl?: string;
  placeId?: string;
  lat?: number;
  lng?: number;
};

type Props = {
  item: ProviderCardItem;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string, next: boolean) => void;
};

export default function ProviderCard({ item, isFavorite, onToggleFavorite }: Props) {
  // Tolerant badge (handles 'direct', 'Direct', missing, etc.)
  const billingRaw = (item.billing ?? '').toString();
  const badge = billingRaw.toLowerCase() === 'direct' ? 'Direct' : 'Reimbursement';

  const onPressMaps = () => {
    const url = buildGoogleMapsUrl({
      name: item.name,
      city: item.city,
      placeId: item.placeId,
      mapsUrl: item.mapsUrl,
      lat: item.lat,
      lng: item.lng,
    });
    openInMaps(url);
  };

  const onPressCall = () => {
    if (!item.phone) return;
    const tel = `tel:${item.phone.replace(/\s+/g, '')}`;
    Linking.openURL(tel).catch(() => {});
  };

  const onPressShare = async () => {
    const url = buildGoogleMapsUrl({
      name: item.name,
      city: item.city,
      placeId: item.placeId,
      mapsUrl: item.mapsUrl,
      lat: item.lat,
      lng: item.lng,
    });
    await Share.share({
      title: item.name,
      message: `${item.name}${url ? ` — ${url}` : ''}`,
    });
  };

  return (
    <View style={styles.card}>
      <View style={styles.rowBetween}>
        <Text style={styles.name}>{item.name}</Text>
        <View style={[styles.badge, badge === 'Direct' ? styles.badgeDirect : styles.badgeReimb]}>
          <Text style={[styles.badgeText, badge === 'Direct' ? styles.badgeTextDark : styles.badgeTextLight]}>
            {badge}
          </Text>
        </View>
      </View>

      <Text style={styles.sub}>
        {item.city ? `${item.city}, ` : ''}{item.country ?? ''}
      </Text>

      <View style={styles.actions}>
        <Pill onPress={onPressMaps} label="Open in Maps" />
        {item.phone ? <Pill onPress={onPressCall} label="Call" /> : null}
        <Pill onPress={onPressShare} label="Share" />
        <Pill
          onPress={() => onToggleFavorite?.(item.id, !isFavorite)}
          label={isFavorite ? '★ Saved' : '☆ Save'}
        />
      </View>
    </View>
  );
}

function Pill({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.pill, pressed && styles.pillPressed]}>
      <Text style={styles.pillText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 16, fontWeight: '700', flexShrink: 1, paddingRight: 8 },
  sub: { marginTop: 4, color: '#666' },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeDirect: { backgroundColor: '#d1fae5' },        // green-100
  badgeReimb: { backgroundColor: '#e0e7ff' },         // indigo-100
  badgeText: { fontSize: 12, fontWeight: '700' },
  badgeTextDark: { color: '#065f46' },                // green-800
  badgeTextLight: { color: '#3730a3' },               // indigo-800
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  pill: {
    backgroundColor: '#f3f4f6',                       // gray-100
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  pillPressed: { opacity: 0.8 },
  pillText: { fontWeight: '700', color: '#111827' },  // gray-900
});
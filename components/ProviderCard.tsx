// components/ProviderCard.tsx
import * as React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Share,
  Linking,
  Alert,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { buildGoogleMapsUrl, openInMaps } from '../lib/utils.maps';
import { colors, fs } from '../styles/shared';

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

export default function ProviderCard({
  item,
  isFavorite,
  onToggleFavorite,
}: Props) {
  const billing =
    (item.billing ?? '').toString().trim().toLowerCase() === 'direct'
      ? 'Direct'
      : 'Reimbursement';

  const onPressMaps = () => {
    const url = buildGoogleMapsUrl({
      name: item.name,
      city: item.city,
      placeId: item.placeId,
      mapsUrl: item.mapsUrl,
      lat: item.lat,
      lng: item.lng,
    });
    if (!url) {
      Alert.alert('No Location', 'This provider has no map location yet.');
      return;
    }
    openInMaps(url);
  };

  const onPressCall = () => {
    if (!item.phone) {
      Alert.alert(
        'No Phone',
        'This provider does not have a phone number yet.',
      );
      return;
    }
    const tel = item.phone.replace(/[^\d+]/g, '');
    Linking.openURL(`tel:${tel}`).catch(() => {});
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
    }).catch(() => {});
  };

  return (
    <View style={styles.card}>
      <View style={styles.rowBetween}>
        <Text style={styles.name}>{item.name}</Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            isFavorite ? 'Remove from favorites' : 'Add to favorites'
          }
          onPress={() => onToggleFavorite?.(item.id, !isFavorite)}
          hitSlop={10}
          style={{ paddingLeft: 8 }}
        >
          <MaterialIcons
            name={isFavorite ? 'star' : 'star-border'}
            size={24}
            color={isFavorite ? colors.gold : colors.muted}
          />
        </Pressable>
      </View>

      <Text style={styles.sub}>
        {item.city ? `${item.city}, ` : ''}
        {item.country ?? ''}
      </Text>

      <View style={styles.actions}>
        <IconPill
          icon="map"
          tint={colors.blue}
          label="Open in Maps"
          onPress={onPressMaps}
        />
        {item.phone ? (
          <IconPill
            icon="call"
            tint={colors.green}
            label="Call"
            onPress={onPressCall}
          />
        ) : null}
        <IconPill
          icon="share"
          tint={colors.gold}
          label="Share"
          onPress={onPressShare}
        />
      </View>

      <View style={styles.badgeRow}>
        <View
          style={[
            styles.badge,
            billing === 'Direct' ? styles.badgeDirect : styles.badgeReimb,
          ]}
        >
          <Text style={styles.badgeText}>{billing}</Text>
        </View>
      </View>
    </View>
  );
}

function IconPill({
  icon,
  label,
  onPress,
  tint,
}: {
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  label: string;
  onPress: () => void;
  tint: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.pill, pressed && styles.pillPressed]}
    >
      <View style={styles.pillRow}>
        <MaterialIcons name={icon} size={18} color={tint} />
        <Text style={[styles.pillText, { color: tint }]}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: fs(16),
    fontWeight: '700',
    flexShrink: 1,
    paddingRight: 8,
    color: colors.text,
  },
  // Match Resources body size
  sub: { marginTop: 4, color: colors.muted, fontSize: fs(16) },

  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  pill: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  pillPressed: { opacity: 0.9 },
  pillRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  pillText: { fontWeight: '800', fontSize: fs(14) },

  badgeRow: { marginTop: 10, flexDirection: 'row' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  badgeDirect: { backgroundColor: '#065f46' },
  badgeReimb: { backgroundColor: '#7f1d1d' },
  badgeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: fs(12),
    letterSpacing: 0.3,
  },
});

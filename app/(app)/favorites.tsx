import * as React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { auth } from '../../lib/firebase';
import {
  getFavoriteIds,
  toggleFavorite,
  getAllProviders,
  type Provider,
} from '../../lib/firestore';
import { shared, colors } from '../../styles/shared';

export default function Favorites() {
  const qc = useQueryClient();
  const uid = auth.currentUser?.uid ?? null;

  // Providers (for id -> doc)
  const { data: providers = [] } = useQuery<Provider[]>({
    queryKey: ['providers'],
    queryFn: getAllProviders,
  });

  // Favorite IDs
  const { data: favIds = [] } = useQuery<string[]>({
    queryKey: ['favorites', uid ?? 'anon'],
    queryFn: () => (uid ? getFavoriteIds(uid) : Promise.resolve<string[]>([])),
    enabled: !!uid,
  });

  const mapById = React.useMemo(() => {
    const m = new Map<string, Provider>();
    for (const p of providers as Provider[]) m.set(p.id, p);
    return m;
  }, [providers]);

  const favoriteProviders = React.useMemo(() => {
    if (!uid) return [] as Provider[];
    return (favIds as string[])
      .map((id) => mapById.get(id))
      .filter(Boolean) as Provider[];
  }, [favIds, mapById, uid]);

  const handleToggleFavorite = async (p: Provider) => {
    if (!uid) {
      Alert.alert('Please sign in', 'Sign in first to save favorites.');
      return;
    }
    try {
      const isFav = (favIds as string[]).includes(p.id);
      await toggleFavorite(uid, p.id, !isFav);
      qc.invalidateQueries({ queryKey: ['favorites', uid] });
    } catch (e: any) {
      Alert.alert('Error', String(e?.message || e));
    }
  };

  const onCall = (phone?: string) => {
    if (!phone) {
      Alert.alert('No Phone', 'This provider does not have a phone number yet.');
      return;
    }
    const tel = phone.replace(/[^\d+]/g, '');
    Linking.openURL(`tel:${tel}`).catch(() => {
      Alert.alert('Error', 'Unable to open dialer.');
    });
  };

  const onEmail = (email?: string, name?: string) => {
    if (!email) {
      Alert.alert('No Email', `This provider does not have an email yet${name ? `: ${name}` : ''}.`);
      return;
    }
    Linking.openURL(`mailto:${email}`).catch(() => {
      Alert.alert('Error', 'Unable to open email app.');
    });
  };

  const onMap = (p: Provider) => {
    const url =
      p.mapsUrl ||
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        [p.name, p.city, p.country].filter(Boolean).join(' ')
      )}`;
    Linking.openURL(url).catch(() => Alert.alert('Error', 'Unable to open maps.'));
  };

  const renderItem = ({ item }: { item: Provider }) => {
    const isFav = uid ? (favIds as string[]).includes(item.id) : false;
    const billing = (item.billing || '').toLowerCase();
    const billingStyle =
      billing === 'direct'
        ? [shared.badge, shared.badgeDirect]
        : billing === 'reimbursement'
        ? [shared.badge, shared.badgeReimb]
        : shared.badge;

    return (
      <View style={shared.card}>
        <View style={shared.cardHeader}>
          <Text style={styles.name}>{item.name}</Text>
          <TouchableOpacity onPress={() => handleToggleFavorite(item)}>
            <MaterialIcons
              name={isFav ? 'star' : 'star-border'}
              size={24}
              color={isFav ? '#facc15' : colors.muted}
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.sub}>{item.city}{item.country ? `, ${item.country}` : ''}</Text>

        <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
          <View style={billingStyle}>
            <Text style={shared.badgeText}>
              {item.billing === 'Direct' || item.billing === 'Reimbursement'
                ? item.billing
                : item.billing
                ? item.billing
                : 'Unknown'}
            </Text>
          </View>
        </View>

        <View style={shared.actionRow}>
          <TouchableOpacity style={shared.actionBtn} onPress={() => onCall(item.phone)}>
            <MaterialIcons name="call" size={22} color={colors.green} />
          </TouchableOpacity>

          <TouchableOpacity style={shared.actionBtn} onPress={() => onEmail(item.email, item.name)}>
            <MaterialIcons name="email" size={22} color={colors.amber} />
          </TouchableOpacity>

          <TouchableOpacity style={shared.actionBtn} onPress={() => onMap(item)}>
            <MaterialIcons name="map" size={22} color={colors.blue} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={shared.screen}>
      <View style={shared.safePad} />
      <Text style={shared.title}>Favorites</Text>

      {favoriteProviders.length === 0 ? (
        <Text style={shared.empty}>No favorites yet.</Text>
      ) : (
        <FlatList
          data={favoriteProviders}
          keyExtractor={(p) => p.id}
          contentContainerStyle={shared.listContent}
          renderItem={renderItem}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  name: { color: colors.text, fontWeight: '700', fontSize: 16, flex: 1, paddingRight: 8 },
  sub: { color: colors.muted, marginTop: 4 },
});
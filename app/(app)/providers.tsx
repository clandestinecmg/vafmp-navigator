import * as React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Picker } from '@react-native-picker/picker';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { auth } from '../../lib/firebase';
import {
  getAllProviders,
  getFavoriteIds,
  toggleFavorite,
  type Provider,
} from '../../lib/firestore';
import { shared, colors } from '../../styles/shared';

type Filters = {
  country: string | null;
  city: string | null;
  billing: 'Direct' | 'Reimbursement' | null;
};

const buildMapsSearch = (p: Provider) => {
  const parts = [p.name, p.city, p.country].filter(Boolean).join(' ');
  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(parts)}`;
  return url;
};

export default function Providers() {
  const qc = useQueryClient();
  const uid = auth.currentUser?.uid ?? null;

  // Providers
  const { data: providers = [] } = useQuery<Provider[]>({
    queryKey: ['providers'],
    queryFn: getAllProviders,
  });

  // User favorites (to render gold star)
  const { data: favIds = [] } = useQuery<string[]>({
    queryKey: ['favorites', uid ?? 'anon'],
    queryFn: () => (uid ? getFavoriteIds(uid) : Promise.resolve<string[]>([])),
    enabled: !!uid,
  });

  const countries = React.useMemo(
    () => Array.from(new Set(providers.map((p) => p.country).filter(Boolean))) as string[],
    [providers]
  );

  const [filters, setFilters] = React.useState<Filters>({
    country: null,
    city: null,
    billing: null,
  });

  const cities = React.useMemo(() => {
    const inCountry = providers.filter((p) =>
      filters.country ? p.country === filters.country : true
    );
    return Array.from(new Set(inCountry.map((p) => p.city).filter(Boolean))) as string[];
  }, [providers, filters.country]);

  const filtered = React.useMemo(() => {
    return providers.filter((p) => {
      if (filters.country && p.country !== filters.country) return false;
      if (filters.city && p.city !== filters.city) return false;
      if (filters.billing && p.billing !== filters.billing) return false;
      return true;
    });
  }, [providers, filters]);

  const onCall = (phone?: string) => {
    if (!phone) return Alert.alert('No Phone', 'This provider does not have a phone number yet.');
    const tel = phone.replace(/[^\d+]/g, '');
    Linking.openURL(`tel:${tel}`).catch(() => Alert.alert('Error', 'Unable to open dialer.'));
  };

  const onEmail = (email?: string, name?: string) => {
    if (!email) {
      return Alert.alert('No Email', `This provider does not have an email yet${name ? `: ${name}` : ''}.`);
    }
    Linking.openURL(`mailto:${email}`).catch(() => Alert.alert('Error', 'Unable to open email app.'));
  };

  const onMap = (p: Provider) => {
    const url = p.mapsUrl || buildMapsSearch(p);
    Linking.openURL(url).catch(() => Alert.alert('Error', 'Unable to open maps.'));
  };

  const handleToggleFavorite = async (p: Provider) => {
    if (!uid) {
      Alert.alert('Please sign in', 'Sign in first to save favorites.');
      return;
    }
    try {
      const isFav = (favIds as string[]).includes(p.id);
      await toggleFavorite(uid, p.id, !isFav);
      // Only refresh favorites; don’t refetch providers (avoids list flashing/vanish)
      qc.invalidateQueries({ queryKey: ['favorites', uid] });
    } catch (e: any) {
      Alert.alert('Error', String(e?.message || e));
    }
  };

  const clearFilters = () => setFilters({ country: null, city: null, billing: null });

  const renderItem = ({ item }: { item: Provider }) => {
    const isFav = uid ? (favIds as string[]).includes(item.id) : false;

    const billingStyle =
      item.billing === 'Direct'
        ? [shared.badge, shared.badgeDirect]
        : item.billing === 'Reimbursement'
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

        <Text style={styles.sub}>
          {item.city}{item.country ? `, ${item.country}` : ''}
        </Text>

        <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
          <View style={billingStyle}>
            <Text style={shared.badgeText}>{item.billing ?? 'Unknown'}</Text>
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
      <Text style={shared.title}>Providers</Text>

      {/* Filters (locked as-is per your approval) */}
      <View style={styles.filtersRow}>
        {/* Country */}
        <View style={styles.pickerWrap}>
          <MaterialIcons name="public" size={18} color={colors.muted} style={styles.pickerIcon} />
          <Picker
            selectedValue={filters.country ?? '__none__'}
            onValueChange={(v) => setFilters((f) => ({ ...f, country: v === '__none__' ? null : (v as string), city: null }))}
            style={styles.picker}
            dropdownIconColor={colors.muted}
            mode={Platform.OS === 'android' ? 'dropdown' : undefined}
            prompt="Select Country"
          >
            <Picker.Item label="Country" value="__none__" enabled={false} color={colors.muted} />
            {countries.map((c) => (
              <Picker.Item key={c} label={c} value={c} color="#000" />
            ))}
          </Picker>
        </View>

        {/* City */}
        <View style={styles.pickerWrap}>
          <MaterialIcons name="location-city" size={18} color={colors.muted} style={styles.pickerIcon} />
          <Picker
            selectedValue={filters.city ?? '__none__'}
            enabled={!!filters.country}
            onValueChange={(v) => setFilters((f) => ({ ...f, city: v === '__none__' ? null : (v as string) }))}
            style={styles.picker}
            dropdownIconColor={colors.muted}
            mode={Platform.OS === 'android' ? 'dropdown' : undefined}
            prompt="Select City"
          >
            <Picker.Item label="City" value="__none__" enabled={false} color={colors.muted} />
            {cities.map((c) => (
              <Picker.Item key={c} label={c} value={c} color="#000" />
            ))}
          </Picker>
        </View>

        {/* Billing */}
        <View style={styles.pickerWrap}>
          <MaterialIcons name="payments" size={18} color={colors.muted} style={styles.pickerIcon} />
          <Picker
            selectedValue={filters.billing ?? '__none__'}
            onValueChange={(v) =>
              setFilters((f) => ({
                ...f,
                billing: v === '__none__' ? null : (v as 'Direct' | 'Reimbursement'),
              }))
            }
            style={styles.picker}
            dropdownIconColor={colors.muted}
            mode={Platform.OS === 'android' ? 'dropdown' : undefined}
            prompt="Select Billing"
          >
            <Picker.Item label="Billing" value="__none__" enabled={false} color={colors.muted} />
            <Picker.Item label="Direct" value="Direct" color="#000" />
            <Picker.Item label="Reimbursement" value="Reimbursement" color="#000" />
          </Picker>
        </View>

        {/* Clear */}
        <TouchableOpacity onPress={clearFilters} style={styles.clearBtn}>
          <MaterialIcons name="filter-alt-off" size={18} color={colors.text} />
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(p) => p.id}
        contentContainerStyle={shared.listContent}
        renderItem={renderItem}
        initialNumToRender={8}
        windowSize={7}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  name: { color: colors.text, fontWeight: '700', fontSize: 16, flex: 1, paddingRight: 8 },
  sub: { color: colors.muted, marginTop: 4 },

  filtersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  pickerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: colors.border,
    borderWidth: 1,
    backgroundColor: colors.card,
    borderRadius: 10,
    paddingHorizontal: 8,
    height: 44,
    minWidth: 150,
    flexGrow: 1,
  },
  pickerIcon: { marginRight: 4 },
  picker: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 44,
  },
  clearText: { color: colors.text, fontWeight: '700' },
});
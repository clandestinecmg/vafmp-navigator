import * as React from 'react';
import { View, Text, FlatList, Alert, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useQuery } from '@tanstack/react-query';

import Background from '../../components/Background';
import { shared, colors } from '../../styles/shared';
import Select, { type Option as SelectOption } from '../../components/Select';
import ProviderCard from '../../components/ProviderCard';

import { auth } from '../../lib/authApi';
import { getAllProviders, type Provider } from '../../lib/firestore';
import { useFavoriteIds, useToggleFavorite } from '../../lib/favorites';

const S = StyleSheet.create({
  filterCard: {
    ...shared.cardUnified,
    paddingTop: 12,
    paddingBottom: 12,
    gap: 10,
  },
  bannerRow: {
    ...shared.row,
    justifyContent: 'center',
    paddingTop: 2,
  },
  bannerText: {
    ...shared.textLg,
    color: colors.text,
    fontWeight: '800',
  },
});

export default function Providers() {
  const {
    data: providers = [],
    isLoading,
    isError,
  } = useQuery<Provider[]>({
    queryKey: ['providers'],
    queryFn: getAllProviders,
  });

  // 🔒 Favorites (force uid to string|null to satisfy TS)
  const uid: string | null =
    (auth.currentUser?.uid as string | undefined) ?? null;
  const { data: favIds = [] } = useFavoriteIds(uid);
  const toggleFav = useToggleFavorite(uid);

  // 🎛 Filters (Country + City only)
  const [country, setCountry] = React.useState<string | null>(null);
  const [city, setCity] = React.useState<string | null>(null);

  // Options built from the provider pool
  const countryOptions: SelectOption[] = React.useMemo(() => {
    const s = new Set<string>();
    providers.forEach((p) => p.country && s.add(p.country));
    return Array.from(s)
      .sort()
      .map((v) => ({ label: v, value: v }));
  }, [providers]);

  const cityOptions: SelectOption[] = React.useMemo(() => {
    const inCountry = country
      ? providers.filter((p) => p.country === country)
      : providers;
    const s = new Set<string>();
    inCountry.forEach((p) => p.city && s.add(p.city));
    return Array.from(s)
      .sort()
      .map((v) => ({ label: v, value: v }));
  }, [providers, country]);

  // Apply filters
  const filtered: Provider[] = React.useMemo(
    () =>
      providers.filter((p) => {
        if (country && p.country !== country) return false;
        if (city && p.city !== city) return false;
        return true;
      }),
    [providers, country, city],
  );

  const onToggleFavorite = (id: string, next: boolean) => {
    if (!uid) {
      Alert.alert('Sign in required', 'Please sign in to save favorites.');
      return;
    }
    toggleFav.mutate({ providerId: id, next });
  };

  return (
    <Background>
      {/* Fix blank screen issue w/ MaterialIcons */}
      <MaterialIcons name="check" size={0.001} color="transparent" />
      <View style={shared.safePad} />

      <View style={shared.wrap}>
        <Text style={shared.titleCenter}>Providers</Text>

        {/* Filters (no Billing dropdown anymore) */}
        <View style={S.filterCard}>
          <View style={{ width: '100%' }}>
            <Select
              label="Country"
              icon="public"
              placeholder="All countries"
              value={country}
              options={countryOptions}
              onChange={(v) => {
                setCountry(v);
                setCity(null);
              }}
            />
          </View>

          <View style={{ width: '100%' }}>
            <Select
              label="City"
              icon="location-city"
              placeholder="All cities"
              value={city}
              disabled={!country}
              options={cityOptions}
              onChange={setCity}
            />
          </View>

          {/* Friendly banner replaces the old Billing dropdown */}
          <View style={S.bannerRow}>
            <MaterialIcons name="verified" size={20} color={colors.green} />
            <Text style={S.bannerText}>All Direct-Billing Providers</Text>
          </View>
        </View>
      </View>

      {/* List */}
      <FlatList<Provider>
        contentContainerStyle={shared.listContent}
        data={filtered}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={shared.empty}>
            {isLoading
              ? 'Loading providers…'
              : isError
                ? 'Failed to load providers.'
                : 'No results match your filters.'}
          </Text>
        }
        renderItem={({ item }) => (
          <ProviderCard
            item={item}
            isFavorite={favIds.includes(item.id)}
            onToggleFavorite={onToggleFavorite}
          />
        )}
      />
    </Background>
  );
}

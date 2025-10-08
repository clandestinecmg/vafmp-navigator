import * as React from 'react';
import { View, Text, FlatList, Alert } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useQuery } from '@tanstack/react-query';

import Background from '../../components/Background';
import { shared, colors, fs, lh } from '../../styles/shared';
import Select, { type Option as SelectOption } from '../../components/Select';
import ProviderCard from '../../components/ProviderCard';

import { auth } from '../../lib/authApi';
import { getAllProviders, type Provider } from '../../lib/firestore';
import { useFavoriteIds, useToggleFavorite } from '../../lib/favorites';

export default function Providers() {
  const {
    data: providers = [],
    isLoading,
    isError,
  } = useQuery<Provider[]>({
    queryKey: ['providers'],
    queryFn: getAllProviders,
  });

  const uid = auth.currentUser?.uid ?? null;
  const { data: favIds = [] } = useFavoriteIds(uid);
  const toggleFav = useToggleFavorite(uid);

  const [country, setCountry] = React.useState<string | null>(null);
  const [city, setCity] = React.useState<string | null>(null);

  const countryOptions: SelectOption[] = React.useMemo(() => {
    const s = new Set<string>();
    providers.forEach((p) => p.country && s.add(p.country));
    return Array.from(s)
      .sort()
      .map((v) => ({ label: v, value: v }));
  }, [providers]);

  const cityOptions: SelectOption[] = React.useMemo(() => {
    const filteredByCountry = country
      ? providers.filter((p) => p.country === country)
      : providers;
    const s = new Set<string>();
    filteredByCountry.forEach((p) => p.city && s.add(p.city));
    return Array.from(s)
      .sort()
      .map((v) => ({ label: v, value: v }));
  }, [providers, country]);

  // simple filtered array
  const filtered: Provider[] = providers.filter((p) => {
    if (country && p.country !== country) return false;
    if (city && p.city !== city) return false;
    return true;
  });

  const onToggleFavorite = (id: string, next: boolean) => {
    if (!uid) {
      Alert.alert('Sign in required', 'Please sign in to save favorites.');
      return;
    }
    toggleFav.mutate({ providerId: id, next });
  };

  return (
    <Background>
      <MaterialIcons name="check" size={0.001} color="transparent" />
      <View style={shared.safePad} />

      <Text style={[shared.titleCenter, { color: colors.gold }]}>
        Providers
      </Text>

      {/* Filters */}
      <View style={[shared.card, { gap: 10 }]}>
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

        {/* Replaced Billing dropdown */}
        <View
          style={{
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 12,
            paddingVertical: 12,
            paddingHorizontal: 12,
          }}
        >
          <Text
            style={{
              ...shared.text,
              color: colors.text,
              textAlign: 'center',
              fontSize: fs(16),
              lineHeight: lh(18),
              fontWeight: '600',
            }}
          >
            All providers are VAFMP direct-billing providers.
          </Text>
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

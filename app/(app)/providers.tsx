// app/(app)/providers.tsx
import * as React from 'react';
import { View, Text, FlatList, Alert } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import Background from '../../components/Background';
import { shared, colors } from '../../styles/shared';
import Select, { type Option as SelectOption } from '../../components/Select';
import ProviderCard from '../../components/ProviderCard';

import { auth } from '../../lib/authApi';
import {
  getAllProviders,
  getFavoriteIds,
  toggleFavorite,
  type Provider,
} from '../../lib/firestore';

export default function Providers() {
  const qc = useQueryClient();

  // --- Queries ---
  const { data: providers = [], isLoading, isError } = useQuery({
    queryKey: ['providers'],
    queryFn: getAllProviders,
  });

  const uid = auth.currentUser?.uid ?? null;
  const { data: favIds = [] } = useQuery({
    queryKey: ['favorites', uid],
    enabled: !!uid,
    queryFn: () => getFavoriteIds(uid!),
  });

  // --- Filters ---
  const [country, setCountry] = React.useState<string | null>(null);
  const [city, setCity] = React.useState<string | null>(null);
  const [billing, setBilling] = React.useState<string | null>(null);

  const countryOptions: SelectOption[] = React.useMemo(() => {
    const s = new Set<string>();
    providers.forEach(p => p.country && s.add(p.country));
    return Array.from(s).sort().map(v => ({ label: v, value: v }));
  }, [providers]);

  const cityOptions: SelectOption[] = React.useMemo(() => {
    const filtered = country
      ? providers.filter(p => p.country === country)
      : providers;
    const s = new Set<string>();
    filtered.forEach(p => p.city && s.add(p.city));
    return Array.from(s).sort().map(v => ({ label: v, value: v }));
  }, [providers, country]);

  const billingOptions: SelectOption[] = React.useMemo(
    () => [
      { label: 'Direct', value: 'Direct' },
      { label: 'Reimbursement', value: 'Reimbursement' },
    ],
    []
  );

  const filtered = providers.filter(p => {
    if (country && p.country !== country) return false;
    if (city && p.city !== city) return false;
    if (billing && (p.billing ?? p.billingType) !== billing) return false;
    return true;
  });

  // --- Favorite toggle ---
  const onToggleFavorite = async (id: string, next: boolean) => {
    if (!uid) {
      Alert.alert('Sign in required', 'Please sign in to save favorites.');
      return;
    }
    try {
      await toggleFavorite(uid, id, next);
      qc.invalidateQueries({ queryKey: ['favorites', uid] });
    } catch {
      Alert.alert('Error', 'Could not update favorites.');
    }
  };

  return (
    <Background>
      {/* tiny invisible icon so the font is surely “touched” on this screen */}
      <MaterialIcons name="check" size={0.001} color="transparent" />

      <View style={shared.safePad} />
      <Text style={shared.title}>Providers</Text>

      {/* Filters */}
      <View style={[shared.card, { gap: 10 }]}>
        <View style={shared.row}>
          <Select
            label="Country"
            icon="public"
            placeholder="All countries"
            value={country}
            options={countryOptions}
            onChange={(v) => {
              setCountry(v);
              setCity(null); // reset city when country changes
            }}
          />
        </View>

        <View style={shared.row}>
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

        <View style={shared.row}>
          <Select
            label="Billing"
            icon="payments"
            placeholder="All billing"
            value={billing}
            options={billingOptions}
            onChange={setBilling}
          />
        </View>
      </View>

      {/* List */}
      <FlatList
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
            item={item as unknown as Parameters<typeof ProviderCard>[0]['item']}
            isFavorite={favIds.includes(item.id)}
            onToggleFavorite={onToggleFavorite}
          />
        )}
      />
    </Background>
  );
}
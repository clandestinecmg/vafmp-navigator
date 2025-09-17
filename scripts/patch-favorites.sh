#!/usr/bin/env bash
set -euo pipefail

stamp="$(date +%s)"

# --- Ensure dirs exist ---
mkdir -p "lib" "app/(app)" "scripts"

# --- Backups (if files exist) ---
if [ -f "app/(app)/providers.tsx" ]; then
  cp "app/(app)/providers.tsx" "app/(app)/providers.tsx.bak.$stamp"
fi
if [ -f "app/(app)/favorites.tsx" ]; then
  cp "app/(app)/favorites.tsx" "app/(app)/favorites.tsx.bak.$stamp"
fi

# --- lib/favorites.ts (shared hooks) ---
cat > "lib/favorites.ts" <<'TS'
import {
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  collection,
  serverTimestamp,
  query,
} from 'firebase/firestore';
import { db } from './firebase';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const favoritesCol = (uid: string) =>
  collection(db, 'users', uid, 'favorites');

/** Read favorite IDs for a user (array of provider IDs) */
export function useFavoriteIds(uid?: string | null) {
  return useQuery({
    queryKey: ['favoriteIds', uid],
    enabled: !!uid,
    queryFn: async () => {
      if (!uid) return [] as string[];
      const snap = await getDocs(query(favoritesCol(uid)));
      return snap.docs.map((d) => d.id);
    },
  });
}

/** Toggle favorite with optimistic UI */
export function useToggleFavorite(uid?: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ providerId, next }: { providerId: string; next: boolean }) => {
      if (!uid) throw new Error('Not signed in');
      const favDoc = doc(db, 'users', uid, 'favorites', providerId);
      if (next) {
        await setDoc(favDoc, { createdAt: serverTimestamp() }, { merge: true });
      } else {
        await deleteDoc(favDoc);
      }
    },
    onMutate: async ({ providerId, next }) => {
      if (!uid) return;
      await qc.cancelQueries({ queryKey: ['favoriteIds', uid] });
      const prev = (qc.getQueryData<string[]>(['favoriteIds', uid]) || []);
      const optimistic = next
        ? Array.from(new Set([...prev, providerId]))
        : prev.filter((id) => id !== providerId);
      qc.setQueryData(['favoriteIds', uid], optimistic);
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (uid && ctx?.prev) qc.setQueryData(['favoriteIds', uid], ctx.prev);
    },
    onSettled: () => {
      if (uid) qc.invalidateQueries({ queryKey: ['favoriteIds', uid] });
    },
  });
}
TS

# --- app/(app)/providers.tsx (use shared hooks + proper toggle) ---
cat > "app/(app)/providers.tsx" <<'TS'
// app/(app)/providers.tsx
import * as React from 'react';
import { View, Text, FlatList, Alert } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useQuery } from '@tanstack/react-query';

import Background from '../../components/Background';
import { shared } from '../../styles/shared';
import Select, { type Option as SelectOption } from '../../components/Select';
import ProviderCard from '../../components/ProviderCard';

import { auth } from '../../lib/authApi';
import { getAllProviders, type Provider } from '../../lib/firestore';
import { useFavoriteIds, useToggleFavorite } from '../../lib/favorites';

export default function Providers() {
  // Data
  const { data: providers = [], isLoading, isError } = useQuery({
    queryKey: ['providers'],
    queryFn: getAllProviders,
  });

  // Auth + favorites
  const uid = auth.currentUser?.uid ?? null;
  const { data: favIds = [] } = useFavoriteIds(uid);
  const toggleFav = useToggleFavorite(uid);

  // Filters
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

  const filtered = providers.filter((p: Provider) => {
    if (country && p.country !== country) return false;
    if (city && p.city !== city) return false;
    if (billing && (p.billing ?? (p as any).billingType) !== billing) return false;
    return true;
  });

  // Toggle favorite handler (guards sign-in)
  const onToggleFavorite = (id: string, next: boolean) => {
    if (!uid) {
      Alert.alert('Sign in required', 'Please sign in to save favorites.');
      return;
    }
    toggleFav.mutate({ providerId: id, next });
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
              setCity(null);
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
            item={item as any}
            isFavorite={favIds.includes(item.id)}
            onToggleFavorite={onToggleFavorite}
          />
        )}
      />
    </Background>
  );
}
TS

# --- app/(app)/favorites.tsx (uses hooks + optimistic remove on this screen) ---
cat > "app/(app)/favorites.tsx" <<'TS'
// app/(app)/favorites.tsx
import * as React from 'react';
import { View, Text, FlatList } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useQuery } from '@tanstack/react-query';

import Background from '../../components/Background';
import { shared } from '../../styles/shared';
import ProviderCard from '../../components/ProviderCard';

import { auth } from '../../lib/authApi';
import { getAllProviders } from '../../lib/firestore';
import { useFavoriteIds, useToggleFavorite } from '../../lib/favorites';

export default function Favorites() {
  const uid = auth.currentUser?.uid ?? null;

  const { data: providers = [] } = useQuery({
    queryKey: ['providers'],
    queryFn: getAllProviders,
  });

  const { data: favIds = [], isLoading } = useFavoriteIds(uid);
  const toggleFav = useToggleFavorite(uid);

  const favorites = providers.filter((p) => favIds.includes(p.id));

  return (
    <Background>
      {/* tiny invisible icon so the font is surely “touched” on this screen */}
      <MaterialIcons name="check" size={0.001} color="transparent" />

      <View style={shared.safePad} />
      <Text style={shared.title}>Favorites</Text>

      <FlatList
        contentContainerStyle={shared.listContent}
        data={favorites}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={[shared.card, { alignItems: 'center' }]}>
            <MaterialIcons name="star-border" size={22} />
            <Text style={[shared.text, { marginTop: 6 }]}>
              {isLoading
                ? 'Loading your favorites…'
                : uid
                ? 'Your saved providers will appear here.'
                : 'Sign in to save favorites.'}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <ProviderCard
            item={item as any}
            isFavorite={true}
            onToggleFavorite={(id, next) => toggleFav.mutate({ providerId: id, next })}
          />
        )}
      />
    </Background>
  );
}
TS

echo "✅ Files written."
echo "Backups:"
ls -1 'app/(app)'/providers.tsx.bak.* 2>/dev/null || true
ls -1 'app/(app)'/favorites.tsx.bak.* 2>/dev/null || true

printf "\nNext:\n"
printf "  1) Restart dev: npx expo start\n"
printf "  2) Test on device: \n"
printf "     • In Favorites, tap the star to remove → it should disappear immediately.\n"
printf "     • In Providers, toggling a single card should only affect that card.\n"

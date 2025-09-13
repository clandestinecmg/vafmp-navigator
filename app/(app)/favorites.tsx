// app/(app)/favorites.tsx
import * as React from 'react';
import { View, Text, FlatList } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useQuery } from '@tanstack/react-query';

import Background from '../../components/Background';
import { shared } from '../../styles/shared';
import ProviderCard from '../../components/ProviderCard';

import { auth } from '../../lib/authApi';
import { getAllProviders, getFavoriteIds, toggleFavorite } from '../../lib/firestore';

export default function Favorites() {
  const uid = auth.currentUser?.uid ?? null;

  const { data: providers = [] } = useQuery({
    queryKey: ['providers'],
    queryFn: getAllProviders,
  });

  const { data: favIds = [], isLoading } = useQuery({
    queryKey: ['favorites', uid],
    queryFn: () => getFavoriteIds(uid!),
    enabled: !!uid,
  });

  const favorites = providers.filter(p => favIds.includes(p.id));

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
            onToggleFavorite={(id, next) => {
              if (!uid) return;
              toggleFavorite(uid, id, next).catch(() => {});
            }}
          />
        )}
      />
    </Background>
  );
}
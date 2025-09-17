import * as React from 'react';
import { View, Text, FlatList } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useQuery } from '@tanstack/react-query';

import Background from '../../components/Background';
import { shared } from '../../styles/shared';
import ProviderCard from '../../components/ProviderCard';

import { auth } from '../../lib/authApi';
import { getAllProviders, type Provider } from '../../lib/firestore';
import { useFavoriteIds, useToggleFavorite } from '../../lib/favorites';

export default function Favorites() {
  const uid = auth.currentUser?.uid ?? null;

  const { data: providers = [] } = useQuery<Provider[]>({
    queryKey: ['providers'],
    queryFn: getAllProviders,
  });

  const { data: favIds = [], isLoading } = useFavoriteIds(uid);
  const toggleFav = useToggleFavorite(uid);

  const favorites: Provider[] = providers.filter((p) => favIds.includes(p.id));

  return (
    <Background>
      {/* tiny invisible icon so the font is surely “touched” on this screen */}
      <MaterialIcons name="check" size={0.001} color="transparent" />

      <View style={shared.safePad} />
      <Text style={shared.title}>Favorites</Text>

      <FlatList<Provider>
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
            item={item}
            isFavorite={true}
            onToggleFavorite={(id, next) =>
              toggleFav.mutate({ providerId: id, next })
            }
          />
        )}
      />
    </Background>
  );
}
// app/(app)/home.tsx
import * as React from 'react';
import { View, Text } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useQuery } from '@tanstack/react-query';
import { getAllProviders, type Provider } from '../../lib/firestore';
import { shared, colors } from '../../styles/shared';

export default function Home() {
  const { data: providers = [], isLoading } = useQuery<Provider[]>({
    queryKey: ['providers'],
    queryFn: getAllProviders,
  });

  return (
    <View style={shared.screen}>
      <View style={shared.safePad} />
      <Text style={shared.title}>VAFMP Navigator</Text>

      <View style={shared.row}>
        <MaterialIcons name="check-circle" size={18} color={colors.green} />
        <Text style={[shared.text, { marginLeft: 8 }]}>Logged in (anonymous)</Text>
      </View>

      <View style={shared.card}>
        <View style={shared.cardHeader}>
          <Text style={shared.text}>Providers</Text>
          <MaterialIcons name="local-hospital" size={18} color={colors.blue} />
        </View>
        <Text style={shared.title}>{isLoading ? '–' : providers.length}</Text>
      </View>
    </View>
  );
}
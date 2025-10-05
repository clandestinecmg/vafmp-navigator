// app/index.tsx
import '../lib/global-shim';

import React from 'react';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import Background from '../components/Background';
import { useAuth } from '../hooks/useAuth';
import { colors } from '../styles/shared';

export default function Index(): React.ReactElement {
  const { user, initializing } = useAuth();

  if (initializing) {
    return (
      <Background>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.gold} />
        </View>
      </Background>
    );
  }

  return <Redirect href={user ? '/(app)/home' : '/(auth)/signin'} />;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

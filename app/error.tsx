import * as React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Link, useLocalSearchParams } from 'expo-router';
import { shared, colors } from '../styles/shared';

export default function ErrorScreen() {
  const params = useLocalSearchParams<{ error?: string }>();
  const msg = Array.isArray(params.error) ? params.error[0] : params.error;

  return (
    <View style={shared.screen}>
      <View style={shared.safePad} />
      <Text style={shared.title}>Something went wrong</Text>
      <Text style={shared.text}>{msg ?? 'An unexpected error occurred.'}</Text>
      <View style={{ flexDirection: 'row', gap: 12, padding: 16 }}>
        <Link href="/(app)/home" asChild>
          <Pressable style={shared.pill}>
            <Text style={{ color: colors.text, fontWeight: '700' }}>
              Go Home
            </Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}

// components/Fallback.tsx
import * as React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

export default function Fallback({
  title = 'Loading…',
  details,
}: { title?: string; details?: string }) {
  return (
    <View style={styles.wrap}>
      <ActivityIndicator size="large" />
      <Text style={styles.title}>{title}</Text>
      {!!details && <Text style={styles.details}>{details}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  title: { fontSize: 16, fontWeight: '700' },
  details: { textAlign: 'center', opacity: 0.7 },
});
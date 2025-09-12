import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function DebugAuth() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔧 Debug Auth Screen</Text>
      <Text style={styles.subtitle}>Placeholder screen for testing routes.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  subtitle: { fontSize: 16, color: '#555', textAlign: 'center' },
});

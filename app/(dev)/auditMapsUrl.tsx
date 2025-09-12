import * as React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function AuditMapsUrl() {
  const [busy, setBusy] = React.useState(false);
  const [results, setResults] = React.useState<{ withMapUrl: number; total: number }>({ withMapUrl: 0, total: 0 });

  const runAudit = async () => {
    try {
      setBusy(true);
      const snapshot = await getDocs(collection(db, 'providers'));
      let withMapUrl = 0;
      let total = 0;

      snapshot.forEach((doc) => {
        total++;
        const data = doc.data() as any;
        if (typeof data.mapUrl === 'string' && data.mapUrl.length > 0) {
          withMapUrl++;
        }
      });

      setResults({ withMapUrl, total });
      Alert.alert(
        'Audit Complete',
        `Total docs: ${total}\nDocs still using mapUrl: ${withMapUrl}\n\n` +
          (withMapUrl === 0 ? '✅ Safe to drop mapUrl fallback code.' : '⚠ Fix migration or clean manually.')
      );
    } catch (e: any) {
      Alert.alert('Error', String(e?.message || e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.safePad} />
      <Text style={styles.title}>Audit: mapUrl leftovers</Text>
      <Text style={styles.sub}>Checks if any provider docs still have a legacy mapUrl field.</Text>

      <TouchableOpacity style={styles.btn} onPress={runAudit} disabled={busy}>
        {busy ? <ActivityIndicator /> : <Text style={styles.btnText}>Run Audit</Text>}
      </TouchableOpacity>

      <View style={styles.card}>
        <Text style={styles.cardRow}>Total providers: {results.total}</Text>
        <Text style={styles.cardRow}>With mapUrl: {results.withMapUrl}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0b1220', paddingHorizontal: 16, paddingTop: 8 },
  safePad: { height: 12 },
  title: { color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 8 },
  sub: { color: '#9ca3af', marginBottom: 12 },
  btn: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  btnText: { color: '#fff', fontWeight: '700' },
  card: {
    borderWidth: 1,
    borderColor: '#1f2937',
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 12,
  },
  cardRow: { color: '#e5e7eb', marginBottom: 4 },
});
// app/(dev)/seedProviders.tsx
import * as React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { colors, shared } from '../../styles/shared';
import {
  adminDb,
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
} from '../../lib/firestore_admin';

// Prefer a single seed file; adjust path/name as needed
import seed from '../../seed/providers.seed.json';

// shape we expect in Firestore
type Provider = {
  id?: string;
  name: string;
  country?: string | null;
  city?: string | null;
  billing?: 'Direct' | 'Reimbursement' | string | null;
  phone?: string | null;
  email?: string | null;
  mapsUrl?: string | null;
  placeId?: string | null;
  lat?: number | null;
  lng?: number | null;
};

export default function DevSeedProviders() {
  const [log, setLog] = React.useState<string[]>([]);

  const append = (line: string) => setLog((l) => [...l, line]);

  const wipeAndSeed = async () => {
    try {
      setLog([]);
      append('Fetching current providers…');
      const colRef = collection(adminDb, 'providers');
      const snap = await getDocs(colRef);

      append(`Deleting ${snap.size} existing docs…`);
      // small sets are fine to delete sequentially; batch if you grow big
      for (const d of snap.docs) {
        await deleteDoc(doc(adminDb, 'providers', d.id));
      }

      append(`Seeding ${seed.length} providers…`);
      for (const raw of seed as Provider[]) {
        // give each doc an id if not present
        const ref = doc(colRef);
        const { id, ...rest } = raw || {};
        const data: Provider = {
          ...rest,
          // normalize billing
          billing: (rest.billing ?? '')
            .toString()
            .toLowerCase() === 'direct'
            ? 'Direct'
            : 'Reimbursement',
        };
        await setDoc(id ? doc(adminDb, 'providers', id) : ref, data);
      }

      append('✅ Done seeding.');
      Alert.alert('Seed Providers', 'Completed without tears.');
    } catch (e: any) {
      console.error(e);
      Alert.alert('Seed Providers', String(e?.message || e));
    }
  };

  return (
    <ScrollView style={shared.screen} contentContainerStyle={{ paddingBottom: 24 }}>
      <View style={shared.safePad} />
      <Text style={shared.title}>Dev: Seed Providers</Text>

      <View style={shared.card}>
        <Text style={shared.text}>Replaces all providers with the seed file.</Text>
        <View style={{ height: 12 }} />
        <TouchableOpacity style={styles.btn} onPress={wipeAndSeed}>
          <MaterialIcons name="download" size={18} color={colors.text} />
          <Text style={styles.btnText}>Wipe & Seed</Text>
        </TouchableOpacity>
      </View>

      {log.length > 0 && (
        <View style={shared.card}>
          <Text style={[shared.text, { marginBottom: 6 }]}>Log</Text>
          {log.map((l, i) => (
            <Text key={i} style={shared.textMuted}>• {l}</Text>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 10,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  btnText: { color: colors.text, fontWeight: '700' },
});
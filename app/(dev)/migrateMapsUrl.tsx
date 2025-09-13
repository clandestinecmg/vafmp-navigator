// app/(dev)/migrateMapsUrl.tsx
import * as React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { colors, shared } from '../../styles/shared';
import {
  adminDb,
  collection,
  doc,
  getDocs,
  updateDoc,
  deleteField,
} from '../../lib/firestore_admin';

// Renames `mapUrl` -> `mapsUrl` and keeps value; removes old field
export default function DevMigrateMapsUrl() {
  const [log, setLog] = React.useState<string[]>([]);
  const append = (l: string) => setLog((p) => [...p, l]);

  const run = async () => {
    try {
      setLog([]);
      const colRef = collection(adminDb, 'providers');
      const snap = await getDocs(colRef);
      append(`Scanning ${snap.size} providers…`);

      let changed = 0;
      for (const d of snap.docs) {
        const data = d.data() as any;
        if (data && data.mapUrl && !data.mapsUrl) {
          await updateDoc(doc(adminDb, 'providers', d.id), {
            mapsUrl: data.mapUrl,
            mapUrl: deleteField(),
          });
          changed++;
          append(`✓ ${d.id}: mapUrl → mapsUrl`);
        }
      }

      append(`✅ Migration complete. Updated ${changed} docs.`);
      Alert.alert('Migrate mapUrl → mapsUrl', `Updated ${changed} documents.`);
    } catch (e: any) {
      console.error(e);
      Alert.alert('Migration Error', String(e?.message || e));
    }
  };

  return (
    <ScrollView style={shared.screen} contentContainerStyle={{ paddingBottom: 24 }}>
      <View style={shared.safePad} />
      <Text style={shared.title}>Dev: mapUrl → mapsUrl</Text>

      <View style={shared.card}>
        <Text style={shared.text}>Renames legacy <Text style={{fontWeight: '800'}}>mapUrl</Text> to <Text style={{fontWeight: '800'}}>mapsUrl</Text>.</Text>
        <View style={{ height: 12 }} />
        <TouchableOpacity style={styles.btn} onPress={run}>
          <MaterialIcons name="sync" size={18} color={colors.text} />
          <Text style={styles.btnText}>Run Migration</Text>
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
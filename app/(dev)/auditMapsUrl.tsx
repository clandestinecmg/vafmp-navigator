// app/(dev)/auditMapsUrl.tsx
import * as React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { colors, shared } from '../../styles/shared';
import { adminDb, collection, getDocs } from '../../lib/firestore_admin';

type Finding = { id: string; name?: string | null; issue: string };

export default function DevAuditMapsUrl() {
  const [findings, setFindings] = React.useState<Finding[]>([]);

  const run = async () => {
    try {
      setFindings([]);
      const snap = await getDocs(collection(adminDb, 'providers'));
      const rows: Finding[] = [];
      snap.forEach((d) => {
        const data = d.data() as any;
        const missingMaps = !data.mapsUrl && !data.placeId && !(data.lat && data.lng);
        if (missingMaps) {
          rows.push({ id: d.id, name: data.name, issue: 'No mapsUrl/placeId/coords' });
        }
      });
      setFindings(rows);
      Alert.alert('Audit complete', `${rows.length} item(s) flagged.`);
    } catch (e: any) {
      console.error(e);
      Alert.alert('Audit Error', String(e?.message || e));
    }
  };

  return (
    <ScrollView style={shared.screen} contentContainerStyle={{ paddingBottom: 24 }}>
      <View style={shared.safePad} />
      <Text style={shared.title}>Dev: Audit map links</Text>

      <View style={shared.card}>
        <Text style={shared.text}>Lists providers missing any usable maps targeting info.</Text>
        <View style={{ height: 12 }} />
        <TouchableOpacity style={styles.btn} onPress={run}>
          <MaterialIcons name="search" size={18} color={colors.text} />
          <Text style={styles.btnText}>Run Audit</Text>
        </TouchableOpacity>
      </View>

      {findings.length > 0 && (
        <View style={shared.card}>
          <Text style={[shared.text, { marginBottom: 6 }]}>Findings</Text>
          {findings.map((f) => (
            <Text key={f.id} style={shared.textMuted}>
              • {f.name || '(no name)'} — {f.issue} [{f.id}]
            </Text>
          ))}
        </View>
      )}

      {findings.length === 0 && (
        <Text style={shared.textMuted}>No findings yet. (Probably because you didn’t press the button. 😉)</Text>
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
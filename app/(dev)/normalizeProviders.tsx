// app/(dev)/normalizeProviders.tsx
import * as React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { colors, shared } from '../../styles/shared';
import {
  adminDb,
  collection,
  getDocs,
  doc,
  writeBatch,
  deleteField,
  updateDoc,
} from '../../lib/firestore_admin';

// Normalizes billing (Direct/Reimbursement), drops legacy fields
export default function DevNormalizeProviders() {
  const [log, setLog] = React.useState<string[]>([]);
  const append = (s: string) => setLog((xs) => [...xs, s]);

  const run = async () => {
    try {
      setLog([]);
      const snap = await getDocs(collection(adminDb, 'providers'));
      append(`Scanning ${snap.size} providers…`);

      const batch = writeBatch(adminDb);
      let touched = 0;

      snap.forEach((d) => {
        const data = d.data() as any;
        let nextBilling: 'Direct' | 'Reimbursement' | null = null;

        if (typeof data.billing === 'string') {
          const b = data.billing.toLowerCase();
          if (b === 'direct') nextBilling = 'Direct';
          else if (b === 'reimbursement') nextBilling = 'Reimbursement';
        }

        const payload: any = {};
        if (nextBilling && data.billing !== nextBilling) {
          payload.billing = nextBilling;
        }
        if ('billingType' in data) {
          payload.billingType = deleteField();
        }

        if (Object.keys(payload).length > 0) {
          batch.update(doc(adminDb, 'providers', d.id), payload);
          touched++;
        }
      });

      if (touched > 0) {
        await batch.commit();
      }
      append(`✅ Normalized ${touched} document(s).`);
      Alert.alert('Normalize Providers', `Updated ${touched} document(s).`);
    } catch (e: any) {
      console.error(e);
      Alert.alert('Normalize Error', String(e?.message || e));
    }
  };

  return (
    <ScrollView style={shared.screen} contentContainerStyle={{ paddingBottom: 24 }}>
      <View style={shared.safePad} />
      <Text style={shared.title}>Dev: Normalize Providers</Text>

      <View style={shared.card}>
        <Text style={shared.text}>
          Enforces <Text style={{ fontWeight: '800' }}>billing</Text> to “Direct” or “Reimbursement”, removes legacy <Text style={{ fontWeight: '800' }}>billingType</Text>.
        </Text>
        <View style={{ height: 12 }} />
        <TouchableOpacity style={styles.btn} onPress={run}>
          <MaterialIcons name="auto-fix-high" size={18} color={colors.text} />
          <Text style={styles.btnText}>Normalize</Text>
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
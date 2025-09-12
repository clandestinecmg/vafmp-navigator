import * as React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { collection, getDocs, doc, updateDoc, deleteField } from 'firebase/firestore';
import { db } from '../../lib/firebase';
// If you have shared styles/colors, you can swap these in:
// import shared from '../../styles/shared'

type Totals = {
  scanned: number;
  toFixMapsUrl: number;
  toFixBilling: number;
  willUpdate: number;
};

const normalizeBilling = (raw: any): 'Direct' | 'Reimbursement' | undefined => {
  if (typeof raw !== 'string') return undefined;
  const v = raw.trim().toLowerCase();
  if (v === 'direct') return 'Direct';
  if (v === 'reimbursement') return 'Reimbursement';
  return undefined;
};

export default function MigrateMapsUrl() {
  const [busy, setBusy] = React.useState(false);
  const [lastTotals, setLastTotals] = React.useState<Totals | null>(null);

  const scan = async (): Promise<{ totals: Totals; plan: Array<{ id: string; updates: Record<string, any> }> }> => {
    const snapshot = await getDocs(collection(db, 'providers'));
    const plan: Array<{ id: string; updates: Record<string, any> }> = [];

    let scanned = 0;
    let toFixMapsUrl = 0;
    let toFixBilling = 0;

    for (const d of snapshot.docs) {
      scanned++;
      const data = d.data() as any;
      const updates: Record<string, any> = {};

      // mapsUrl migration
      const hasMapUrl = typeof data.mapUrl === 'string' && data.mapUrl.length > 0;
      const hasMapsUrl = typeof data.mapsUrl === 'string' && data.mapsUrl.length > 0;
      if (hasMapUrl && !hasMapsUrl) {
        updates.mapsUrl = data.mapUrl;
        updates.mapUrl = deleteField();
        toFixMapsUrl++;
      }

      // billing normalization
      const normalized = normalizeBilling(data.billing);
      if (normalized && data.billing !== normalized) {
        updates.billing = normalized;
        toFixBilling++;
      }

      if (Object.keys(updates).length > 0) {
        plan.push({ id: d.id, updates });
      }
    }

    const totals: Totals = {
      scanned,
      toFixMapsUrl,
      toFixBilling,
      willUpdate: plan.length,
    };

    return { totals, plan };
  };

  const handleDryRun = async () => {
    try {
      setBusy(true);
      const { totals } = await scan();
      setLastTotals(totals);

      Alert.alert(
        'Dry Run Complete',
        `Scanned: ${totals.scanned}\n` +
          `Need mapsUrl fix: ${totals.toFixMapsUrl}\n` +
          `Need billing normalize: ${totals.toFixBilling}\n` +
          `Docs to update: ${totals.willUpdate}\n\n` +
          `If this looks right, tap "Migrate Now".`
      );
    } catch (e: any) {
      Alert.alert('Error', String(e?.message || e));
    } finally {
      setBusy(false);
    }
  };

  const handleMigrate = async () => {
    try {
      setBusy(true);
      const { totals, plan } = await scan();
      setLastTotals(totals);

      if (plan.length === 0) {
        Alert.alert('Nothing to update', 'All documents look good already.');
        return;
      }

      let ok = 0;
      let fail = 0;
      for (const item of plan) {
        try {
          const ref = doc(collection(db, 'providers'), item.id);
          await updateDoc(ref, item.updates);
          ok++;
        } catch {
          fail++;
        }
      }

      Alert.alert(
        'Migration Complete',
        `Updated: ${ok}\nFailed: ${fail}\nScanned: ${totals.scanned}\n` +
          `mapsUrl fixes: ${totals.toFixMapsUrl}\nBilling normalized: ${totals.toFixBilling}`
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
      <Text style={styles.title}>Data Migration: mapUrl ➜ mapsUrl</Text>
      <Text style={styles.sub}>
        • Copies legacy <Text style={styles.code}>mapUrl</Text> to <Text style={styles.code}>mapsUrl</Text> and removes <Text style={styles.code}>mapUrl</Text>.
      </Text>
      <Text style={styles.sub}>• Normalizes billing to “Direct” or “Reimbursement”.</Text>

      {lastTotals && (
        <View style={styles.card}>
          <Text style={styles.cardRow}>Scanned: <Text style={styles.bold}>{lastTotals.scanned}</Text></Text>
          <Text style={styles.cardRow}>Need mapsUrl fix: <Text style={styles.bold}>{lastTotals.toFixMapsUrl}</Text></Text>
          <Text style={styles.cardRow}>Need billing normalize: <Text style={styles.bold}>{lastTotals.toFixBilling}</Text></Text>
          <Text style={styles.cardRow}>Docs to update: <Text style={styles.bold}>{lastTotals.willUpdate}</Text></Text>
        </View>
      )}

      <View style={styles.row}>
        <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={handleDryRun} disabled={busy}>
          {busy ? <ActivityIndicator /> : <Text style={styles.btnText}>Dry Run</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={handleMigrate} disabled={busy}>
          {busy ? <ActivityIndicator color="#fff" /> : <Text style={[styles.btnText, styles.btnTextPrimary]}>Migrate Now</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0b1220', paddingHorizontal: 16, paddingTop: 8 },
  safePad: { height: 12 },
  title: { color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 8 },
  sub: { color: '#9ca3af', marginBottom: 6 },
  code: { color: '#eab308', fontFamily: 'monospace' },
  row: { flexDirection: 'row', gap: 12, marginTop: 16 },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  btnSecondary: { backgroundColor: '#0b1220' },
  btnPrimary: { backgroundColor: '#2563eb' },
  btnText: { color: '#9ca3af', fontWeight: '700' },
  btnTextPrimary: { color: '#fff' },
  card: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#1f2937',
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 12,
  },
  cardRow: { color: '#e5e7eb', marginBottom: 4 },
  bold: { fontWeight: '800', color: '#fff' },
});
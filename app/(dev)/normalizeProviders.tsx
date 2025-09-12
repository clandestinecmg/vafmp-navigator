// app/(dev)/normalizeProviders.tsx
import * as React from 'react';
import { View, Text, StyleSheet, Pressable, Alert, ActivityIndicator } from 'react-native';
import { db } from '../../lib/firebase';
import {
  collection,
  getDocs,
  writeBatch,
  doc,
} from 'firebase/firestore';

export default function NormalizeProviders() {
  const [busy, setBusy] = React.useState(false);
  const [lastRun, setLastRun] = React.useState<string | null>(null);

  const run = async () => {
    try {
      setBusy(true);
      const snap = await getDocs(collection(db, 'providers'));

      const batch = writeBatch(db);
      let changes = 0;

      snap.forEach((d) => {
        const data = d.data() as any;

        // prefer `billing`, fall back to legacy `billingType`
        const raw = (data.billing ?? data.billingType ?? '').toString().toLowerCase();
        const normalized = raw === 'direct' ? 'Direct' : 'Reimbursement';

        let needsUpdate = false;
        const update: Record<string, any> = {};

        if (data.billing !== normalized) {
          update.billing = normalized;
          needsUpdate = true;
        }

        // Optional cleanup: if a legacy field exists, remove it
        if (typeof data.billingType !== 'undefined') {
          update.billingType = null; // sentinel for deletion with merge: true not supported in batch
          needsUpdate = true;
        }

        if (needsUpdate) {
          // Note: Firestore batch doesn't support field deletion with `null` directly.
          // We'll write `billing` now, then do a second pass to remove `billingType` via update with deleteField.
          batch.set(doc(db, 'providers', d.id), { billing: normalized }, { merge: true });
          changes++;
        }
      });

      if (changes > 0) {
        await batch.commit();
      }

      // Second pass: actually remove the legacy `billingType` field if present.
      // (Only if you want it gone; otherwise comment this section out.)
      const snap2 = await getDocs(collection(db, 'providers'));
      const { deleteField, updateDoc } = await import('firebase/firestore');
      let deletions = 0;
      for (const d of snap2.docs) {
        const data = d.data() as any;
        if (typeof data.billingType !== 'undefined') {
          await updateDoc(doc(db, 'providers', d.id), { billingType: deleteField() });
          deletions++;
        }
      }

      const msg = `Normalized ${changes} docs, removed legacy field from ${deletions} docs.`;
      setLastRun(new Date().toLocaleString());
      Alert.alert('Done', msg);
      console.log('[NormalizeProviders]', msg);
    } catch (e: any) {
      Alert.alert('Error', String(e?.message || e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Normalize Provider Billing</Text>
      <Text style={styles.desc}>
        This will set each provider’s <Text style={styles.mono}>billing</Text> field to {'"Direct"'} or {'"Reimbursement"'}
        based on existing values (case-insensitive) and remove legacy <Text style={styles.mono}>billingType</Text>.
      </Text>

      <Pressable style={[styles.btn, busy && styles.btnDisabled]} onPress={run} disabled={busy}>
        {busy ? <ActivityIndicator /> : <Text style={styles.btnText}>Run Normalizer</Text>}
      </Pressable>

      {lastRun ? <Text style={styles.meta}>Last run: {lastRun}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 16, gap: 12, justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '800' },
  desc: { color: '#555' },
  mono: { fontFamily: 'Courier', color: '#111' },
  btn: { marginTop: 12, backgroundColor: '#2563eb', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: '#fff', fontWeight: '800' },
  meta: { marginTop: 8, color: '#666' },
});
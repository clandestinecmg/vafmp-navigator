// app/(dev)/seedProviders.tsx
// Simple dev-only seeding screen. Writes providers with the correct `mapsUrl` field.
// Safe to keep around in (dev); remove from production builds.

import * as React from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { db } from '../../lib/firebase';
import { collection, doc, setDoc, deleteDoc, getDocs } from 'firebase/firestore';
import type { Provider } from '../../lib/firestore';

const sampleProviders: Omit<Provider, 'id'>[] = [
  {
    name: 'Bangkok International Hospital',
    country: 'Thailand',
    city: 'Bangkok',
    billing: 'Direct',
    phone: '+66-2-310-3000',
    email: undefined, // you’ll fill these manually later
    mapsUrl: 'https://maps.app.goo.gl/qJmdV7dUExample',
  },
  {
    name: 'Bumrungrad International Hospital',
    country: 'Thailand',
    city: 'Bangkok',
    billing: 'Reimbursement',
    phone: '+66-2-667-1000',
    email: undefined,
    mapsUrl: 'https://maps.app.goo.gl/9kq8cZzExample',
  },
  {
    name: 'St. Luke’s Medical Center Global City',
    country: 'Philippines',
    city: 'Taguig',
    billing: 'Direct',
    phone: '+63-2-8789-7700',
    email: undefined,
    mapsUrl: 'https://maps.app.goo.gl/AbCdEfExample',
  },
  {
    name: 'Seoul National University Hospital',
    country: 'South Korea',
    city: 'Seoul',
    billing: 'Reimbursement',
    phone: '+82-2-2072-2114',
    email: undefined,
    mapsUrl: 'https://maps.app.goo.gl/XYz123Example',
  },
];

async function wipeProviders(): Promise<number> {
  const snap = await getDocs(collection(db, 'providers'));
  const deletions: Promise<void>[] = [];
  snap.forEach((d) => deletions.push(deleteDoc(doc(db, 'providers', d.id))));
  await Promise.all(deletions);
  return snap.size;
}

async function seedProviders(): Promise<number> {
  const colRef = collection(db, 'providers');

  // Write each doc with an auto ID
  for (const p of sampleProviders) {
    // Minimal validation to avoid empty names
    const name = (p.name ?? '').trim();
    if (!name) continue;

    // NOTE: No legacy "mapUrl" here — only `mapsUrl`
    const data: Omit<Provider, 'id'> = {
      name,
      country: p.country?.trim(),
      city: p.city?.trim(),
      billing: p.billing === 'Direct' || p.billing === 'Reimbursement' ? p.billing : undefined,
      phone: p.phone?.trim(),
      email: p.email?.trim(),
      mapsUrl: p.mapsUrl?.trim(),
    };

    const newDoc = doc(colRef);
    await setDoc(newDoc, data);
  }

  const after = await getDocs(colRef);
  return after.size;
}

export default function SeedProvidersScreen() {
  const [busy, setBusy] = React.useState<'wipe' | 'seed' | null>(null);
  const [lastAction, setLastAction] = React.useState<string | null>(null);

  const onWipe = async () => {
    try {
      setBusy('wipe');
      const n = await wipeProviders();
      setLastAction(`Wiped ${n} provider(s).`);
      Alert.alert('Done', `Wiped ${n} provider(s).`);
    } catch (e: any) {
      Alert.alert('Error', String(e?.message || e));
    } finally {
      setBusy(null);
    }
  };

  const onSeed = async () => {
    try {
      setBusy('seed');
      const n = await seedProviders();
      setLastAction(`Seeded. Total providers now: ${n}.`);
      Alert.alert('Done', `Seeded. Total providers now: ${n}.`);
    } catch (e: any) {
      Alert.alert('Error', String(e?.message || e));
    } finally {
      setBusy(null);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.safePad} />
      <Text style={styles.title}>Dev · Seed Providers</Text>
      <Text style={styles.sub}>Writes sample providers with the correct <Text style={styles.code}>mapsUrl</Text> field.</Text>

      <View style={styles.row}>
        <TouchableOpacity style={[styles.btn, styles.btnDanger]} onPress={onWipe} disabled={!!busy}>
          {busy === 'wipe' ? <ActivityIndicator /> : <Text style={styles.btnText}>Wipe All</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={onSeed} disabled={!!busy}>
          {busy === 'seed' ? <ActivityIndicator /> : <Text style={styles.btnText}>Seed Sample</Text>}
        </TouchableOpacity>
      </View>

      {lastAction ? <Text style={styles.note}>{lastAction}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0b1220', paddingHorizontal: 16, paddingTop: 8 },
  safePad: { height: 12 },
  title: { color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 6 },
  sub: { color: '#9ca3af', marginBottom: 12 },
  code: { color: '#eab308', fontFamily: 'monospace' },
  row: { flexDirection: 'row', gap: 12 },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  btnDanger: { backgroundColor: '#7f1d1d', borderColor: '#ef4444' },
  btnPrimary: { backgroundColor: '#1d4ed8', borderColor: '#60a5fa' },
  btnText: { color: '#fff', fontWeight: '700' },
  note: { color: '#9ca3af', marginTop: 12 },
});
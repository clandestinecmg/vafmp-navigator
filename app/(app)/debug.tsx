// app/(app)/debug.tsx
import * as React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Background from '../../components/Background';
import { shared, fs } from '../../styles/shared';
import { useAuth } from '../../hooks/useAuth';
import { db, storage } from '../../lib/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';

export default function DebugScreen() {
  const [message, setMessage] = React.useState('Idle');
  const { user, signOutNow } = useAuth();

  const setMsg = (prefix: string, err: unknown) => {
    const msg = err instanceof Error ? err.message : String(err);
    setMessage(`${prefix}: ${msg}`);
  };

  const testAuth = async () => {
    try {
      const uid = user?.uid;
      setMessage(uid ? `Auth OK: ${uid}` : 'Auth OK: (no user?)');
    } catch (err) {
      setMsg('Auth FAIL', err);
    }
  };

  const testFirestore = async () => {
    const uid = user?.uid;
    if (!uid) {
      setMessage('Firestore FAIL: not signed in');
      return;
    }
    try {
      const col = collection(db, 'users', uid, 'debug');
      await addDoc(col, { hello: 'world', ts: Date.now() });
      const snap = await getDocs(col);
      setMessage(`Firestore OK: ${snap.size} docs under /users/${uid}/debug`);
    } catch (err) {
      setMsg('Firestore FAIL', err);
    }
  };

  const testStorage = async () => {
    const uid = user?.uid;
    if (!uid) {
      setMessage('Storage FAIL: not signed in');
      return;
    }
    try {
      const fileRef = ref(
        storage,
        `users/${uid}/attachments/test-${Date.now()}.txt`,
      );
      await uploadString(fileRef, 'Hello storage!', 'raw');
      const url = await getDownloadURL(fileRef);
      setMessage(`Storage OK: ${url}`);
    } catch (err) {
      setMsg('Storage FAIL', err);
    }
  };

  // Local “crash” test (no Sentry): just log an error and show message
  const testCrash = () => {
    try {
      throw new Error('Test crash from DebugScreen');
    } catch (err) {
      console.error('Captured test error:', err);
      setMsg('Crash captured (local log only)', err);
    }
  };

  // Simple perf “span” simulation: do two timed waits and report total
  const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
  const testPerf = async () => {
    const t0 = Date.now();
    await wait(500);
    await wait(300);
    const total = Date.now() - t0;
    setMessage(`Perf OK: simulated work finished in ~${total}ms`);
  };

  const testNetwork = async () => {
    try {
      const res = await fetch('https://httpbin.org/delay/1');
      const json = (await res.json()) as unknown;
      const keys =
        json && typeof json === 'object'
          ? Object.keys(json as Record<string, unknown>).length
          : 0;
      setMessage(`Network OK: status ${res.status}, keys: ${keys}`);
    } catch (err) {
      setMsg('Network FAIL', err);
    }
  };

  const testSignOut = async () => {
    try {
      await signOutNow();
      setMessage('Sign-out OK');
    } catch (err) {
      setMsg('Sign-out FAIL', err);
    }
  };

  return (
    <Background>
      <View style={shared.safePad} />
      <View style={styles.container}>
        <Text style={shared.titleCenter}>Debug Checks</Text>

        <Pressable
          style={[shared.btn, shared.btnPrimary, styles.btn]}
          onPress={testAuth}
        >
          <Text style={shared.btnLabel}>Test Auth</Text>
        </Pressable>

        <Pressable
          style={[shared.btn, shared.btnPrimary, styles.btn]}
          onPress={testFirestore}
        >
          <Text style={shared.btnLabel}>Test Firestore</Text>
        </Pressable>

        <Pressable
          style={[shared.btn, shared.btnPrimary, styles.btn]}
          onPress={testStorage}
        >
          <Text style={shared.btnLabel}>Test Storage</Text>
        </Pressable>

        <Pressable
          style={[shared.btn, shared.btnPrimary, styles.btn]}
          onPress={testNetwork}
        >
          <Text style={shared.btnLabel}>Test Network</Text>
        </Pressable>

        <Pressable
          style={[shared.btn, shared.btnPrimary, styles.btn]}
          onPress={testPerf}
        >
          <Text style={shared.btnLabel}>Test Performance</Text>
        </Pressable>

        <Pressable
          style={[shared.btn, shared.btnDanger, styles.btn]}
          onPress={testCrash}
        >
          <Text style={shared.btnLabel}>Test Crash (local)</Text>
        </Pressable>

        <Pressable
          style={[shared.btn, shared.btnDanger, styles.btn]}
          onPress={testSignOut}
        >
          <Text style={shared.btnLabel}>Sign Out</Text>
        </Pressable>

        <Text style={[shared.textMd, styles.msg]}>{message}</Text>
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: {
    ...shared.wrap,
    paddingTop: fs(8),
    alignItems: 'center',
  },
  btn: { marginTop: 12, minWidth: 220 },
  msg: { marginTop: 16, textAlign: 'center' },
});

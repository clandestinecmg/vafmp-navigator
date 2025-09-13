// app/(auth)/login.tsx
import * as React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Background from '../../components/Background';
import { shared, colors } from '../../styles/shared';

// ✅ Import ONLY from our wrapper to avoid the firebase/auth type drama
import {
  auth,
  onAuthStateChanged,
  signInAnonymously,
  type User,
} from '../../lib/authApi';

export default function Login() {
  const [user, setUser] = React.useState<User | null>(auth.currentUser);

  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return () => unsub();
  }, []);

  const onAnon = () => {
    signInAnonymously(auth).catch(() => {
      // no-op: you can surface a toast/alert if you want
    });
  };

  return (
    <Background>
      <View style={shared.safePad} />
      <View style={styles.container}>
        <Text style={shared.title}>Auth</Text>
        <Text style={shared.text}>
          {user ? `UID: ${user.uid}` : 'Not signed in'}
        </Text>

        <View style={styles.row}>
          <Pressable onPress={onAnon} style={shared.pill} accessibilityRole="button">
            <View style={styles.btnRow}>
              <MaterialIcons name="login" size={16} color={colors.text} />
              <Text style={styles.btnText}>Anon sign-in</Text>
            </View>
          </Pressable>
        </View>
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingTop: 8, flex: 1 },
  row: { flexDirection: 'row', gap: 12, padding: 16 },
  btnRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  btnText: { color: colors.text, fontWeight: '700' },
});
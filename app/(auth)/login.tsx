import * as React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { colors, shared } from '../../styles/shared';

export default function Login() {
  const router = useRouter();
  const [user, setUser] = React.useState<User | null>(auth.currentUser ?? null);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    const sub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => sub();
  }, []);

  const onAnon = async () => {
    try {
      setBusy(true);
      await signInAnonymously(auth);
      // Route to Home after successful sign-in
      router.replace('/(app)/home');
    } catch (e: any) {
      Alert.alert('Sign-in failed', String(e?.message || e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={shared.screen}>
      <View style={shared.safePad} />

      <Text style={shared.title}>Sign in</Text>

      <View style={shared.card}>
        <View style={shared.cardHeader}>
          <Text style={shared.text}>
            {user ? 'Logged in (anonymous)' : 'Not signed in'}
          </Text>
        </View>
        {!!user && (
          <Text style={shared.textMuted} selectable>
            UID: {user.uid}
          </Text>
        )}

        <View style={shared.actionRow}>
          <TouchableOpacity
            style={shared.actionBtn}
            onPress={onAnon}
            disabled={busy}
          >
            <MaterialIcons name="login" size={22} color={colors.amber} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
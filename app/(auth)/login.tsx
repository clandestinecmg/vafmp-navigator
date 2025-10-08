// app/(auth)/login.tsx
import * as React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Background from '../../components/Background';
import { shared, colors, fs, lh } from '../../styles/shared';
import { useRouter } from 'expo-router';
import {
  auth,
  onAuthStateChanged,
  signInAnonymously,
  type User,
} from '../../lib/authApi';
import { useBigToast } from '../../components/BigToast';

export default function Login() {
  const [user, setUser] = React.useState<User | null>(auth.currentUser);
  const router = useRouter();
  const { show, Toast } = useBigToast();

  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return () => unsub();
  }, []);

  // If already signed in, go straight to Profile
  React.useEffect(() => {
    if (user) router.replace('/(app)/profile');
  }, [user, router]);

  const onAnon = async () => {
    try {
      await signInAnonymously(auth);
      show('Signed in. Your PII will be saved locally on your device.');
      router.replace('/(app)/profile');
    } catch {
      show('Unable to sign in. Please try again.', { duration: 2200 });
    }
  };

  return (
    <Background>
      <View style={shared.safePad} />
      <View style={styles.container}>
        <Text style={[shared.titleCenter, { color: colors.gold }]}>
          Sign In
        </Text>
        <Text style={[shared.text, { textAlign: 'center', marginTop: 6 }]}>
          Sign in to save Favorites and store your Profile locally for quick
          form filling.
        </Text>

        <View style={{ height: 10 }} />

        <Pressable
          onPress={onAnon}
          style={({ pressed }) => [styles.cta, pressed && { opacity: 0.95 }]}
          accessibilityRole="button"
          accessibilityLabel="Sign in"
        >
          <MaterialIcons name="login" size={fs(18)} color="#111" />
          <Text style={styles.ctaLabel}>Sign In</Text>
        </Pressable>

        <View style={{ height: 16 }} />
        <Text
          style={[shared.text, { textAlign: 'center', color: colors.muted }]}
        >
          Your info lives on your device. You can clear it anytime from Profile.
        </Text>
      </View>
      <Toast />
    </Background>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    flex: 1,
    justifyContent: 'center',
  },
  cta: {
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    backgroundColor: colors.gold,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    minWidth: 220,
    justifyContent: 'center',
  },
  ctaLabel: {
    color: '#111',
    fontWeight: '900',
    fontSize: fs(18),
    lineHeight: lh(18),
    letterSpacing: 0.2,
  },
});

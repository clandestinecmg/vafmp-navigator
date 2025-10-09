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
  signOut,
  type User,
} from '../../lib/authApi';
import { useToast } from '../../components/ToastProvider';

export default function Login() {
  const [user, setUser] = React.useState<User | null>(auth.currentUser);
  const router = useRouter();
  const { show } = useToast();

  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return () => unsub();
  }, []);

  const onAnon = async () => {
    try {
      await signInAnonymously(auth);
      show('Signed in. Your PII will be saved locally on your device.'); // ~3s default
      router.replace('/(app)/profile');
    } catch {
      show('Unable to sign in. Please try again.', 4200);
    }
  };

  const onContinue = () => {
    show('You are signed in. Continue to Profile to review your info.', 3600);
    router.replace('/(app)/profile');
  };

  const onSignOut = async () => {
    try {
      await signOut(auth);
      show(
        'Your PII has been successfully cleared from your device.\nRefill Profile to auto-populate forms.',
      );
      // Stay on login; they can sign in again if they want
    } catch {
      show('Unable to sign out. Please try again.', 4200);
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

        <View style={{ height: 16 }} />

        {user ? (
          <>
            <Pressable
              onPress={onContinue}
              android_ripple={{ color: '#00000022', borderless: false }}
              style={({ pressed }) => [
                styles.ctaPrimary,
                pressed && { opacity: 0.95, transform: [{ scale: 0.98 }] },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Continue to profile"
            >
              <MaterialIcons name="arrow-forward" size={fs(18)} color="#111" />
              <Text style={styles.ctaPrimaryLabel}>Continue</Text>
            </Pressable>

            <View style={{ height: 12 }} />

            <Pressable
              onPress={onSignOut}
              android_ripple={{ color: '#ffffff22', borderless: false }}
              style={({ pressed }) => [
                styles.ctaSecondary,
                pressed && { opacity: 0.95, transform: [{ scale: 0.98 }] },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Sign out"
            >
              <MaterialIcons name="logout" size={fs(18)} color="#fff" />
              <Text style={styles.ctaSecondaryLabel}>Sign Out</Text>
            </Pressable>
          </>
        ) : (
          <Pressable
            onPress={onAnon}
            android_ripple={{ color: '#00000022', borderless: false }}
            style={({ pressed }) => [
              styles.ctaPrimary,
              pressed && { opacity: 0.95, transform: [{ scale: 0.98 }] },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Sign in"
          >
            <MaterialIcons name="login" size={fs(18)} color="#111" />
            <Text style={styles.ctaPrimaryLabel}>Sign In</Text>
          </Pressable>
        )}

        <View style={{ height: 16 }} />
        <Text
          style={[shared.text, { textAlign: 'center', color: colors.muted }]}
        >
          Your info lives on your device. You can clear it anytime from Profile.
        </Text>
      </View>
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
  ctaPrimary: {
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
  ctaPrimaryLabel: {
    color: '#111',
    fontWeight: '900',
    fontSize: fs(18),
    lineHeight: lh(18),
    letterSpacing: 0.2,
  },
  ctaSecondary: {
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    backgroundColor: colors.red,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minWidth: 220,
    justifyContent: 'center',
  },
  ctaSecondaryLabel: {
    color: '#fff',
    fontWeight: '900',
    fontSize: fs(16),
    lineHeight: lh(16),
    letterSpacing: 0.2,
  },
});

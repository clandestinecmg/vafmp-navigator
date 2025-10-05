// app/(auth)/signin.tsx
import * as React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  ToastAndroid,
  Alert,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Background from '../../components/Background';
import { shared, colors } from '../../styles/shared';
import { useAuth } from '../../hooks/useAuth';

export default function SignIn() {
  const { signInAnon, user, initializing } = useAuth();
  const { from } = useLocalSearchParams<{ from?: string }>();
  const router = useRouter();

  React.useEffect(() => {
    if (!initializing && user) {
      const dest = typeof from === 'string' && from ? from : '/(app)/home';
      router.replace(dest);
    }
  }, [initializing, user, from, router]);

  if (initializing || user) {
    return (
      <Background>
        <View style={{ flex: 1 }} />
      </Background>
    );
  }

  const toast = (msg: string) =>
    Platform.OS === 'android'
      ? ToastAndroid.show(msg, ToastAndroid.SHORT)
      : Alert.alert('Info', msg);

  const onAnon = async () => {
    try {
      await signInAnon();
      toast('Signed in');
      // redirect handled by effect
    } catch {
      toast('Could not sign in');
    }
  };

  return (
    <Background>
      <View style={shared.safePad} />
      <View style={styles.container}>
        <Text style={[shared.titleCenter, { color: colors.gold }]}>
          Sign In
        </Text>
        <Text style={[shared.text, { textAlign: 'center', marginBottom: 12 }]}>
          Quick access with anonymous sign-in. You can sign out anytime.
        </Text>

        <Pressable
          onPress={onAnon}
          style={({ pressed }) => [
            shared.btn,
            shared.btnPrimary,
            { opacity: pressed ? 0.9 : 1, marginTop: 6 },
          ]}
          accessibilityRole="button"
        >
          <View style={styles.btnRow}>
            <MaterialIcons name="login" size={18} color="#fff" />
            <Text style={shared.btnLabel}>Continue</Text>
          </View>
        </Pressable>
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});

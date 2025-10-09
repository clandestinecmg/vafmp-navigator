// app/(app)/profile.tsx
import React from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  type TextInputProps,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useProfile } from '../../hooks/userProfile';
import { shared, colors, fs, lh, GUTTER } from '../../styles/shared';
import type { Profile } from '../../types/profile';
import Background from '../../components/Background';
import { useBigToast } from '../../components/BigToast';

// 🔐 auth helpers
import { useAuth } from '../../hooks/useAuth';
import { auth, signOut, signInAnonymously } from '../../lib/authApi';

type Field = {
  key: keyof Profile;
  label: string;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  secureTextEntry?: boolean;
  autoComplete?: TextInputProps['autoComplete'];
  textContentType?: TextInputProps['textContentType'];
  placeholder?: string;
  autoCorrect?: boolean;
};

const FIELDS: Field[] = [
  {
    key: 'fullName',
    label: 'Full name',
    autoCapitalize: 'words',
    autoComplete: 'name',
    textContentType: 'name',
    placeholder: 'e.g., John Q. Veteran',
    autoCorrect: false,
  },
  {
    key: 'ssn',
    label: 'SSN',
    keyboardType: 'numeric',
    secureTextEntry: true,
    autoComplete: 'off',
    textContentType: 'none',
    placeholder: '123-45-6789',
    autoCorrect: false,
  },
  {
    key: 'dob',
    label: 'Date of birth',
    keyboardType: 'numeric',
    autoComplete: 'birthdate-full',
    textContentType: 'none',
    placeholder: 'YYYY-MM-DD',
    autoCorrect: false,
  },
  {
    key: 'address',
    label: 'Address',
    autoCapitalize: 'words',
    autoComplete: 'street-address',
    textContentType: 'fullStreetAddress',
    placeholder: 'Street, City, State, ZIP',
  },
  {
    key: 'phone',
    label: 'Phone',
    keyboardType: 'phone-pad',
    autoComplete: 'tel',
    textContentType: 'telephoneNumber',
    placeholder: '+1 555-555-5555',
    autoCorrect: false,
  },
  {
    key: 'email',
    label: 'Email',
    keyboardType: 'email-address',
    autoCapitalize: 'none',
    autoComplete: 'email',
    textContentType: 'emailAddress',
    placeholder: 'you@example.com',
    autoCorrect: false,
  },
];

export default function ProfileScreen() {
  const { profile, setProfile, update, hydrated, saving } = useProfile();
  const { user } = useAuth();
  const router = useRouter();
  const { show, Toast } = useBigToast();

  const setField = (key: keyof Profile, value: string) =>
    setProfile((p: Profile) => ({ ...p, [key]: value }));

  const handleLogout = async () => {
    try {
      await signOut(auth);
      show(
        'Your PII has been successfully cleared from your device.\nRefill Profile to auto-populate forms.',
      );
      // After logout, go back to Sign In
      setTimeout(() => router.replace('/(auth)/login'), 700);
    } catch {
      show('Unable to sign out. Please try again.', { duration: 2200 });
    }
  };

  const handleAnonLogin = async () => {
    try {
      await signInAnonymously(auth);
      show('Signed in. Your PII will be saved locally on your device.');
    } catch {
      show('Unable to sign in. Please try again.', { duration: 2200 });
    }
  };

  const handleSave = async () => {
    if (!hydrated || saving) return;
    try {
      // 🔒 sanitize to avoid "trim of undefined" in any downstream logic
      const cleaned = Object.fromEntries(
        Object.entries(profile).map(([k, v]) => [
          k,
          typeof v === 'string' ? v.trim() : '',
        ]),
      ) as Profile;

      await update(cleaned);
      show('Your PII has been saved locally on your device.');
      // Navigate to Home after a short beat so toast is visible
      setTimeout(() => router.replace('/(app)/home'), 700);
    } catch {
      show('Could not save your profile. Please try again.', {
        duration: 2200,
      });
    }
  };

  return (
    <Background>
      <ScrollView
        style={shared.screenOnImage}
        contentContainerStyle={{ padding: GUTTER, gap: 12, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={shared.safePad} />
        <Text style={[shared.titleCenter, { color: colors.gold }]}>
          Profile
        </Text>

        {/* Status badge */}
        <View style={styles.statusRow}>
          <View
            style={[
              styles.dot,
              { backgroundColor: user ? '#16a34a' : '#b91c1c' },
            ]}
          />
          <Text style={styles.statusText}>
            {user ? 'Signed in' : 'Not signed in'}
          </Text>
        </View>

        {/* Clear, senior-friendly auth buttons */}
        <View style={styles.authContainer}>
          {user ? (
            <Pressable
              onPress={handleLogout}
              accessibilityRole="button"
              accessibilityLabel="Sign Out"
              style={[styles.authBtn, { backgroundColor: colors.red }]}
            >
              <MaterialIcons name="logout" size={fs(18)} color="#fff" />
              <Text style={styles.authLabel}>Sign Out</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={handleAnonLogin}
              accessibilityRole="button"
              accessibilityLabel="Sign In"
              style={[styles.authBtn, { backgroundColor: colors.green }]}
            >
              <MaterialIcons name="login" size={fs(18)} color="#fff" />
              <Text style={styles.authLabel}>Sign In</Text>
            </Pressable>
          )}
        </View>

        <View style={[shared.card, styles.notice]}>
          <Text style={styles.noticeTitle}>Privacy note</Text>
          <Text style={styles.noticeText}>
            This profile is stored on your device ONLY to speed up forms. It is
            not synced to any server.
          </Text>
        </View>

        {FIELDS.map((f) => (
          <View key={f.key} style={shared.card}>
            <Text style={styles.label}>{f.label}</Text>
            <TextInput
              value={String(profile[f.key] ?? '')}
              onChangeText={(t) => setField(f.key, t)}
              keyboardType={f.keyboardType}
              autoCapitalize={f.autoCapitalize}
              secureTextEntry={f.secureTextEntry}
              placeholder={f.placeholder}
              placeholderTextColor={colors.muted}
              autoComplete={f.autoComplete}
              textContentType={f.textContentType}
              autoCorrect={f.autoCorrect}
              returnKeyType="next"
              style={styles.input}
            />
          </View>
        ))}

        <Pressable
          onPress={handleSave}
          accessibilityRole="button"
          accessibilityLabel="Save your profile"
          style={[styles.saveBtn, saving && { opacity: 0.7 }]}
          disabled={saving}
          hitSlop={8}
        >
          <MaterialIcons name="save" size={fs(18)} color="#fff" />
          <Text style={styles.saveLabel}>
            {saving ? 'Saving…' : 'Save Profile'}
          </Text>
        </Pressable>
      </ScrollView>
      <Toast />
    </Background>
  );
}

const styles = StyleSheet.create({
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'center',
    marginTop: -4,
  },
  dot: { width: 10, height: 10, borderRadius: 999 },
  statusText: {
    color: colors.text,
    fontSize: fs(14),
    lineHeight: lh(14),
    fontWeight: '800',
  },
  authContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 6,
    gap: 10,
  },
  authBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minWidth: 160,
    justifyContent: 'center',
  },
  authLabel: {
    color: '#fff',
    fontWeight: '900',
    fontSize: fs(16),
    lineHeight: lh(16),
    letterSpacing: 0.3,
  },
  label: {
    color: colors.muted,
    fontSize: fs(14),
    lineHeight: lh(14),
    marginBottom: 8,
    paddingHorizontal: 0,
  },
  input: {
    color: colors.text,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: fs(16),
    lineHeight: lh(16),
  },
  saveBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.blue,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginHorizontal: GUTTER,
    gap: 8,
  },
  saveLabel: {
    color: '#fff',
    fontWeight: '800',
    fontSize: fs(16),
    lineHeight: lh(16),
  },
  notice: { backgroundColor: '#0e1a31', borderColor: '#1d2a45' },
  noticeTitle: {
    color: colors.gold,
    fontWeight: '800',
    fontSize: fs(16),
    lineHeight: lh(16),
    marginBottom: 6,
  },
  noticeText: { color: colors.text, fontSize: fs(14), lineHeight: lh(18) },
});

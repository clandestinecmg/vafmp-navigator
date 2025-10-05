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
import { router } from 'expo-router';
import Background from '../../components/Background';
import { useProfile } from '../../hooks/userProfile';
import { useAuth } from '../../hooks/useAuth';
import { shared, colors, fs } from '../../styles/shared';
import type { Profile } from '../../types/profile';

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
  const { user, signOutNow } = useAuth();
  const isSignedIn = !!user;
  const signOutUser = signOutNow;

  const setField = (key: keyof Profile, value: string) =>
    setProfile((p: Profile) => ({ ...p, [key]: value }));

  return (
    <Background>
      <ScrollView
        style={shared.screenOnImage}
        contentContainerStyle={shared.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={shared.safePad} />
        <Text style={shared.titleCenter}>Local Profile</Text>

        {/* Privacy Note — same chrome/transparency as other cards, centered text */}
        <View style={[shared.cardUnified, styles.notice]}>
          <Text style={styles.noticeTitle}>Privacy Note</Text>
          <Text style={styles.noticeBody}>
            This profile is stored on your device only to speed up forms. It is
            not synced to any server.
          </Text>
        </View>

        {/* Fields */}
        <View style={shared.cardUnified}>
          {FIELDS.map(
            ({
              key,
              label,
              keyboardType,
              autoCapitalize,
              secureTextEntry,
              autoComplete,
              textContentType,
              placeholder,
              autoCorrect,
            }) => (
              <View key={key} style={{ marginBottom: 16 }}>
                <Text style={styles.label}>{label}</Text>
                <TextInput
                  value={String(profile[key] ?? '')}
                  onChangeText={(t) => setField(key, t)}
                  keyboardType={keyboardType}
                  autoCapitalize={autoCapitalize}
                  secureTextEntry={secureTextEntry}
                  placeholder={placeholder}
                  placeholderTextColor={colors.muted}
                  autoComplete={autoComplete}
                  textContentType={textContentType}
                  autoCorrect={autoCorrect}
                  returnKeyType="next"
                  style={styles.input}
                />
              </View>
            ),
          )}

          {/* Save */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Save profile locally"
            disabled={!hydrated || saving}
            onPress={() => update(profile)}
            style={[
              shared.btn,
              shared.btnPrimary,
              { opacity: hydrated && !saving ? 1 : 0.6, marginTop: 10 },
            ]}
            hitSlop={8}
          >
            <Text style={shared.btnLabel}>{saving ? 'Saving…' : 'Save'}</Text>
          </Pressable>
        </View>

        {/* Auth section */}
        {isSignedIn ? (
          <View style={shared.cardUnified}>
            <Text style={shared.sectionHeaderCenter}>Account</Text>
            <Text
              style={[
                shared.textMuted,
                { textAlign: 'center', marginBottom: 10 },
              ]}
            >
              UID: {user?.uid}
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={signOutUser}
              style={[shared.btn, shared.btnDanger]}
            >
              <Text style={shared.btnLabel}>Sign Out</Text>
            </Pressable>
          </View>
        ) : (
          <View style={shared.cardUnified}>
            <Text style={shared.sectionHeaderCenter}>Account</Text>
            <Text
              style={[
                shared.textMuted,
                { textAlign: 'center', marginBottom: 10 },
              ]}
            >
              Not signed in
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/(auth)/signin')}
              style={[shared.btn, shared.btnPrimary]}
            >
              <Text style={shared.btnLabel}>Sign In</Text>
            </Pressable>
          </View>
        )}

        <View style={shared.bottomSpacer} />
      </ScrollView>
    </Background>
  );
}

const styles = StyleSheet.create({
  label: {
    ...shared.textMd,
    color: colors.muted,
    marginBottom: 8,
  },
  input: {
    color: colors.text,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 14,
    fontSize: fs(18),
  },
  // same look/opacity as other cards
  notice: { backgroundColor: 'rgba(2,6,23,0.70)', borderColor: colors.border },
  noticeTitle: {
    ...shared.textLg,
    fontSize: fs(20),
    color: colors.gold,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  noticeBody: {
    ...shared.textMd,
    fontSize: fs(17),
    color: colors.text,
    textAlign: 'center',
  },
});

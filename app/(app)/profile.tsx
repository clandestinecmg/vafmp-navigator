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
import { useProfile } from '../../hooks/userProfile';
import { shared, colors, fs, lh, GUTTER } from '../../styles/shared';
import type { Profile } from '../../types/profile';
import Background from '../../components/Background';

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
  const setField = (key: keyof Profile, value: string) =>
    setProfile((p: Profile) => ({ ...p, [key]: value }));

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

        <View style={[shared.card, styles.notice]}>
          <Text style={styles.noticeTitle}>Privacy note</Text>
          <Text style={styles.noticeText}>
            This profile is stored on your device ONLY to speed up forms. It is
            not synced to any server.
          </Text>
        </View>

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
            <View key={key} style={shared.card}>
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

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Save profile locally"
          disabled={!hydrated || saving}
          onPress={() => update(profile)}
          style={[styles.saveBtn, { opacity: hydrated && !saving ? 1 : 0.6 }]}
          hitSlop={8}
        >
          <Text style={styles.saveLabel}>{saving ? 'Saving…' : 'Save'}</Text>
        </Pressable>
      </ScrollView>
    </Background>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: colors.blue,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginHorizontal: GUTTER, // unify width with cards
  },
  saveLabel: {
    color: '#fff',
    fontWeight: '800',
    fontSize: fs(16),
    lineHeight: lh(16),
    letterSpacing: 0.2,
  },
  notice: { backgroundColor: '#0e1a31', borderColor: '#1d2a45' },
  noticeTitle: {
    color: colors.gold,
    fontWeight: '800',
    fontSize: fs(16),
    lineHeight: lh(16),
    marginBottom: 6,
    paddingHorizontal: 0,
  },
  noticeText: {
    color: colors.text,
    fontSize: fs(14),
    lineHeight: lh(18),
    paddingHorizontal: 0,
  },
});

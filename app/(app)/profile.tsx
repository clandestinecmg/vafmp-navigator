// app/(app)/profile.tsx
import React from 'react';
import { ScrollView, View, Text, TextInput, Pressable } from 'react-native';
import { useProfile } from '../../hooks/userProfile';
import { shared, colors } from '../../styles/shared';
import type { Profile } from '../../types/profile';

type Field = {
  key: keyof Profile;
  label: string;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  secureTextEntry?: boolean;
};

const FIELDS: Field[] = [
  { key: 'fullName', label: 'Full name', autoCapitalize: 'words' },
  { key: 'ssn', label: 'SSN (123-45-6789)', keyboardType: 'numeric', secureTextEntry: true },
  { key: 'dob', label: 'DOB (YYYY-MM-DD)', keyboardType: 'numeric' },
  { key: 'address', label: 'Address', autoCapitalize: 'words' },
  { key: 'phone', label: 'Phone', keyboardType: 'phone-pad' },
  { key: 'email', label: 'Email', keyboardType: 'email-address', autoCapitalize: 'none' },
];

export default function ProfileScreen() {
  const { profile, setProfile, update, hydrated, saving } = useProfile();

  const setField = (key: keyof Profile, value: string) =>
    setProfile((p: Profile) => ({ ...p, [key]: value }));

  return (
    <ScrollView
      style={shared.screen}
      contentContainerStyle={{ padding: 16, gap: 12 }}
    >
      <Text style={shared.title}>Profile (Local Only)</Text>

      {FIELDS.map(({ key, label, keyboardType, autoCapitalize, secureTextEntry }) => (
        <View key={key} style={shared.card}>
          <Text style={shared.text}>{label}</Text>
          <TextInput
            value={profile[key] ?? ''}
            onChangeText={(t) => setField(key, t)}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            secureTextEntry={secureTextEntry}
            placeholderTextColor={colors.muted}
            style={{
              color: colors.text,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
              paddingVertical: 8,
            }}
          />
        </View>
      ))}

      <Pressable
        disabled={!hydrated || saving}
        onPress={() => update(profile)}
        style={{
          opacity: hydrated && !saving ? 1 : 0.6,
          backgroundColor: colors.blue,
          padding: 14,
          borderRadius: 12,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '700' }}>Save</Text>
      </Pressable>
    </ScrollView>
  );
}
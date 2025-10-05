// app/(app)/home.tsx
import * as React from 'react';
import { ScrollView, View, Text, StyleSheet, Pressable } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Background from '../../components/Background';
import { shared, colors, fs, GUTTER } from '../../styles/shared';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'expo-router';

export default function Home() {
  const { user, signOutNow } = useAuth();
  const isSignedIn = !!user;
  const router = useRouter();

  return (
    <Background>
      <ScrollView
        style={shared.page}
        contentContainerStyle={[
          shared.wrap,
          { paddingTop: GUTTER, paddingBottom: 40 },
        ]}
      >
        <View style={shared.safePad} />

        {/* Title */}
        <Text style={shared.titleCenter}>Welcome to FMP Navigator</Text>

        {/* Intro */}
        <View style={shared.card}>
          <Text style={S.introHeader}>
            This app helps U.S. Veterans and families overseas navigate the
            Foreign Medical Program (FMP): find reliable providers, access
            resources, and get crisis support.
          </Text>
          <Text style={[shared.textMd, { marginTop: 8 }]}>
            Your data stays on your device unless you choose to share it.
          </Text>
        </View>

        {/* Privacy First */}
        <View style={shared.card}>
          <Text
            style={[
              shared.sectionHeader,
              { color: colors.gold, fontWeight: '800' },
            ]}
          >
            Privacy First
          </Text>
          <Text style={[shared.textMd, { marginTop: 6 }]}>
            Profile details are stored locally to speed up forms. Nothing is
            synced to any server by default.
          </Text>
        </View>

        {/* Coming Soon */}
        <View style={shared.card}>
          <Text
            style={[
              shared.sectionHeader,
              { color: colors.gold, fontWeight: '800' },
            ]}
          >
            Coming Soon
          </Text>
          <Text style={[shared.textMd, { marginTop: 6 }]}>
            We’ll surface VA/FMP updates and helpful tips here. (A small
            ticker/widget can live in this card.)
          </Text>
        </View>

        {/* Account pill + UID preview */}
        <View style={shared.card}>
          {isSignedIn ? (
            <>
              <Text
                style={[
                  shared.textSm,
                  {
                    color: colors.muted,
                    textAlign: 'center',
                    marginBottom: 10,
                  },
                ]}
                numberOfLines={1}
              >
                UID: {user?.uid}
              </Text>

              <Pressable
                onPress={signOutNow}
                style={[shared.btn, shared.btnDanger, S.btnRow]}
                accessibilityRole="button"
                accessibilityLabel="Sign out"
              >
                <MaterialIcons
                  name="logout"
                  size={20}
                  color="#fff"
                  style={{ marginRight: 6 }}
                />
                <Text style={shared.btnLabel}>Sign Out</Text>
              </Pressable>
            </>
          ) : (
            <Pressable
              onPress={() => router.push('/(auth)/signin')}
              style={[shared.btn, shared.btnPrimary, S.btnRow]}
              accessibilityRole="button"
              accessibilityLabel="Sign in"
            >
              <MaterialIcons
                name="login"
                size={20}
                color="#fff"
                style={{ marginRight: 6 }}
              />
              <Text style={shared.btnLabel}>Sign In</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </Background>
  );
}

const S = StyleSheet.create({
  introHeader: {
    ...shared.textLg,
    fontSize: fs(19),
    fontWeight: '700',
    lineHeight: fs(24),
    color: colors.text,
    paddingHorizontal: 0,
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 200,
  },
});

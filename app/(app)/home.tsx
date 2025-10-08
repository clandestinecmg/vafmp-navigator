import * as React from 'react';
import { ScrollView, View, Text } from 'react-native';
import Background from '../../components/Background';
import { shared, colors, fs, lh, GUTTER } from '../../styles/shared';

export default function Home() {
  return (
    <Background>
      <ScrollView
        style={shared.screenOnImage}
        contentContainerStyle={{ padding: GUTTER, paddingBottom: 40 }}
      >
        <View style={shared.safePad} />
        <Text style={[shared.titleCenter, { color: colors.gold }]}>
          Welcome to FMP Navigator
        </Text>

        {/* Intro */}
        <View style={shared.card}>
          <Text
            style={[
              shared.text,
              {
                fontSize: fs(18),
                lineHeight: lh(22),
                fontWeight: '700',
                paddingHorizontal: 0,
              },
            ]}
          >
            This app helps U.S. Veterans and families overseas navigate the
            Foreign Medical Program (FMP): find reliable providers, access
            resources, and get crisis support.
          </Text>
          <Text style={[shared.text, { marginTop: 8, paddingHorizontal: 0 }]}>
            Your data stays on your device unless you choose to share it.
          </Text>
        </View>

        {/* Privacy */}
        <View style={shared.card}>
          <Text
            style={[
              shared.text,
              { fontWeight: '800', color: colors.gold, paddingHorizontal: 0 },
            ]}
          >
            Privacy First
          </Text>
          <Text style={[shared.text, { marginTop: 6, paddingHorizontal: 0 }]}>
            Profile details are stored locally to speed up forms. Nothing is
            synced to any server by default.
          </Text>
        </View>

        {/* Coming soon */}
        <View style={shared.card}>
          <Text
            style={[
              shared.text,
              { fontWeight: '800', color: colors.gold, paddingHorizontal: 0 },
            ]}
          >
            Coming Soon
          </Text>
          <Text style={[shared.text, { marginTop: 6, paddingHorizontal: 0 }]}>
            We’ll surface VA/FMP updates and helpful tips here. (A small
            ticker/widget can live in this card.)
          </Text>
        </View>
      </ScrollView>
    </Background>
  );
}

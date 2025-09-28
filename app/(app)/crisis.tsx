// app/(app)/crisis.tsx
import React from 'react';
import {
  ScrollView,
  View,
  Text,
  Pressable,
  Alert,
  Platform,
  Image,
  Dimensions,
} from 'react-native';
import * as Linking from 'expo-linking';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import ImageZoom from 'react-native-image-pan-zoom';
import crisisNumbers from '../../assets/seeds/crisis_numbers.json';
import { shared, colors, fs, lh, GUTTER } from '../../styles/shared';
import Background from '../../components/Background';

// Local AOR map image
import aorMap from '../../assets/crisis/dod-aor-map.jpg';

function openURL(url: string) {
  Linking.openURL(url).catch(() => Alert.alert('Could not open link'));
}
function openTel(number: string) {
  Linking.openURL(`tel:${number}`).catch(() =>
    Alert.alert('Could not open dialer'),
  );
}
function openSMS(number: string, body?: string) {
  const sep = Platform.OS === 'ios' ? '&' : '?';
  Linking.openURL(
    `sms:${number}${body ? `${sep}body=${encodeURIComponent(body)}` : ''}`,
  ).catch(() => Alert.alert('Could not open messages'));
}

// Card-specific styles (scaled)
const CARD = {
  base: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: colors.card,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginHorizontal: GUTTER,
  },
  title: {
    fontSize: fs(18),
    lineHeight: lh(18),
    fontWeight: '700' as const,
    marginBottom: 8,
    color: colors.text,
  },
  text: { fontSize: fs(16), lineHeight: lh(16), color: colors.text },
  link: {
    fontSize: fs(16),
    lineHeight: lh(16),
    textDecorationLine: 'underline' as const,
    color: colors.blue, // ← back to blue
    marginTop: 6,
  },
  btn: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center' as const,
    marginTop: 10,
    backgroundColor: colors.blue,
    borderWidth: 1,
    borderColor: colors.border,
  },
  btnLabel: {
    fontSize: fs(16),
    lineHeight: lh(16),
    fontWeight: '600' as const,
    color: '#fff',
  },
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    marginTop: 6,
  },
};

export default function Crisis() {
  const { width: W } = Dimensions.get('window');
  const cropWidth = W - GUTTER * 2;
  const cropHeight = 320;

  return (
    <Background>
      <ScrollView
        style={shared.screenOnImage}
        contentContainerStyle={{ padding: GUTTER, paddingBottom: 40 }}
      >
        <View style={shared.safePad} />
        <Text style={shared.titleCenter}>Crisis</Text>

        {/* Immediate danger banner (full-bleed for emphasis) */}
        <View
          style={[
            shared.fullBleed,
            CARD.base,
            {
              backgroundColor: colors.red,
              marginHorizontal: -GUTTER, // cancel container padding to bleed
              borderRadius: 0, // squared edges for banner feel
            },
          ]}
        >
          <Text style={[CARD.text, { fontWeight: '700' as const }]}>
            If you’re in immediate danger, call your local emergency number now.
          </Text>
        </View>

        {/* Veterans Crisis Line */}
        <View style={CARD.base}>
          <Text style={CARD.title}>U.S. Veterans Crisis Line</Text>
          <Text style={CARD.text}>
            24/7 confidential support for Veterans, service members, Guard &
            Reserve, and their families.
          </Text>
          <Text style={[CARD.text, { marginTop: 4 }]}>
            Services: talk/text with trained responders, safety planning, and
            referrals to VA & local care.
          </Text>

          <Pressable
            onPress={() => openURL('https://www.veteranscrisisline.net')}
          >
            <View style={CARD.row}>
              <MaterialIcons
                name="open-in-new"
                size={fs(18)}
                color={colors.blue}
              />
              <Text style={CARD.link}>Visit VeteransCrisisLine.net</Text>
            </View>
          </Pressable>

          <Pressable
            style={CARD.btn}
            onPress={() =>
              openURL('https://www.veteranscrisisline.net/get-help-now/chat/')
            }
          >
            <Text style={CARD.btnLabel}>Chat Online</Text>
          </Pressable>

          <Pressable style={CARD.btn} onPress={() => openTel('988')}>
            <Text style={CARD.btnLabel}>Call 988 (Press 1 for Veterans)</Text>
          </Pressable>

          <Pressable style={CARD.btn} onPress={() => openSMS('838255')}>
            <Text style={CARD.btnLabel}>Text 838255</Text>
          </Pressable>
        </View>

        {/* Future: Local crisis line by location */}
        <View style={CARD.base}>
          <Text style={CARD.title}>Local crisis line (by your location)</Text>
          <Text style={CARD.text}>
            We’ll automatically detect your country and show the nearest mental
            health hotline for your region (e.g., Thailand’s local line).
          </Text>
          <Text style={[CARD.text, { marginTop: 4 }]}>
            Coming soon — this will ask permission to access your location and
            match it against a vetted hotline directory.
          </Text>
        </View>

        {/* Overseas contacts (official U.S. entry points) */}
        <View style={CARD.base}>
          <Text style={CARD.title}>Calling from Overseas?</Text>
          <Text style={CARD.text}>
            Dial the U.S. country code (+1). If one number doesn’t connect, try
            another region. DSN 988 works from base phones.
          </Text>

          {Object.entries(crisisNumbers).map(([region, entries]) => (
            <View key={region} style={{ marginTop: 12 }}>
              <Text style={[CARD.text, { fontWeight: '700' as const }]}>
                {region}
              </Text>
              {entries.map((entry, idx) => (
                <Pressable
                  key={idx}
                  onPress={() =>
                    entry.type === 'tel' ? openTel(entry.number) : undefined
                  }
                  disabled={entry.type !== 'tel'}
                >
                  <View style={CARD.row}>
                    {entry.type === 'tel' ? (
                      <MaterialIcons
                        name="phone"
                        size={fs(18)}
                        color={colors.blue}
                      />
                    ) : null}
                    <Text style={CARD.link}>{entry.label}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          ))}
        </View>

        {/* AOR Map (zoom & pan) */}
        <View style={CARD.base}>
          <Text style={CARD.title}>DoD Areas of Responsibility (Map)</Text>

          <View
            style={{
              borderRadius: 12,
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.bg,
            }}
          >
            <ImageZoom
              cropWidth={cropWidth}
              cropHeight={cropHeight}
              imageWidth={cropWidth}
              imageHeight={cropHeight}
              minScale={1}
              maxScale={3}
              enableCenterFocus={false}
              pinchToZoom
              panToMove
              doubleClickInterval={250}
            >
              <Image
                source={aorMap}
                accessibilityLabel="Map showing Department of Defense geographic combatant commands and their areas of responsibility"
                style={{ width: cropWidth, height: cropHeight }}
                resizeMode="contain"
              />
            </ImageZoom>
          </View>

          <Text style={[CARD.text, { marginTop: 8 }]}>
            Pinch to zoom and drag to pan. Double-tap to zoom.
          </Text>
        </View>
      </ScrollView>
    </Background>
  );
}

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
import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';
import ImageZoom from 'react-native-image-pan-zoom';
import crisisNumbers from '../../assets/seeds/crisis_numbers.json';
import { shared, colors } from '../../styles/shared';

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
async function copyToClipboard(text: string) {
  await Clipboard.setStringAsync(text);
  Alert.alert('Copied to clipboard', text);
}

// Card-specific styles
const CARD = {
  base: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: colors.card,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 8,
    color: colors.text,
  },
  text: { fontSize: 15, color: colors.text },
  link: {
    fontSize: 15,
    textDecorationLine: 'underline' as const,
    color: colors.blue,
    marginTop: 6,
  },
  btn: {
    padding: 14,
    borderRadius: 12,
    alignItems: 'center' as const,
    marginTop: 10,
    backgroundColor: colors.blue,
    borderWidth: 1,
    borderColor: colors.border,
  },
  btnLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
  },
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginTop: 4,
  },
};

export default function Crisis() {
  const PADDING_X = 16 * 2;
  const { width: W } = Dimensions.get('window');
  const cropWidth = W - PADDING_X;
  const cropHeight = 320;

  return (
    <ScrollView
      style={shared.screen}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
    >
      {/* Immediate danger banner */}
      <View style={[CARD.base, { backgroundColor: colors.red }]}>
        <Text style={[CARD.text, { fontWeight: '700' }]}>
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

      {/* Overseas contacts */}
      <View style={CARD.base}>
        <Text style={CARD.title}>Calling from Overseas?</Text>
        <Text style={CARD.text}>
          Dialing the U.S. country code is required (+1). If one number doesn’t
          connect, try another region. DSN 988 works from base phones.
        </Text>

        {Object.entries(crisisNumbers).map(([region, entries]) => (
          <View key={region} style={{ marginTop: 12 }}>
            <Text style={[CARD.text, { fontWeight: '700' }]}>{region}</Text>
            {entries.map((entry, idx) => (
              <View key={idx} style={{ flexDirection: 'row', marginTop: 4 }}>
                <Pressable
                  onPress={() =>
                    entry.type === 'tel' ? openTel(entry.number) : undefined
                  }
                >
                  <Text style={CARD.link}>{entry.label}</Text>
                </Pressable>
                {entry.type === 'dsn' && (
                  <Pressable
                    style={[
                      CARD.btn,
                      {
                        marginTop: 0,
                        marginLeft: 10,
                        paddingVertical: 6,
                        paddingHorizontal: 12,
                      },
                    ]}
                    onPress={() => copyToClipboard(entry.number)}
                  >
                    <Text style={[CARD.btnLabel, { fontSize: 14 }]}>
                      Copy DSN
                    </Text>
                  </Pressable>
                )}
              </View>
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
  );
}

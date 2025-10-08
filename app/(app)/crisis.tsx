import * as React from 'react';
import {
  ScrollView,
  View,
  Text,
  Pressable,
  Alert,
  Platform,
  Image,
  useWindowDimensions,
} from 'react-native';
import * as Linking from 'expo-linking';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import ImageZoom from 'react-native-image-pan-zoom';
import crisisNumbers from '../../assets/seeds/crisis_numbers.json';
import { shared, colors, fs, lh, GUTTER } from '../../styles/shared';
import Background from '../../components/Background';
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
  title: (gold = false) => ({
    ...shared.text,
    fontSize: fs(18),
    lineHeight: lh(20),
    fontWeight: '800' as const,
    marginBottom: 8,
    color: gold ? colors.gold : colors.text,
  }),
  text: { ...shared.text, fontSize: fs(16), lineHeight: lh(18) },
  link: {
    ...shared.text,
    fontSize: fs(16),
    lineHeight: lh(18),
    color: colors.blue,
    textDecorationLine: 'underline' as const,
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
    ...shared.text,
    color: '#fff',
    fontWeight: '700' as const,
  },
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    marginTop: 6,
  },
};

export default function Crisis(): React.ReactElement {
  const { width: W } = useWindowDimensions();
  const cropWidth = W - GUTTER * 2;
  const cropHeight = 320;

  return (
    <Background>
      <ScrollView
        style={shared.screenOnImage}
        contentContainerStyle={{ padding: GUTTER, paddingBottom: 40 }}
      >
        <View style={shared.safePad} />
        <Text style={[shared.titleCenter, { color: colors.gold }]}>
          Veterans Crisis Line
        </Text>

        {/* Immediate danger banner */}
        <View
          style={[
            shared.fullBleed,
            CARD.base,
            {
              backgroundColor: colors.red,
              marginHorizontal: -GUTTER,
              borderRadius: 0,
              borderWidth: 0,
            },
          ]}
        >
          <Text style={[CARD.text, { fontWeight: '700' as const }]}>
            If you’re in immediate danger, call your local emergency number now.
          </Text>
        </View>

        {/* Veterans Crisis Line */}
        <View style={CARD.base}>
          <Text style={CARD.title(true)}>U.S. Veterans Crisis Line</Text>
          <Text style={CARD.text}>
            24/7 confidential support for Veterans, service members, Guard &
            Reserve, and their families.
          </Text>
          <Text style={[CARD.text, { marginTop: 4 }]}>
            Services include talk/text with trained responders, safety planning,
            and referrals to VA & local care.
          </Text>

          <Pressable
            accessibilityRole="link"
            hitSlop={8}
            onPress={() => openURL('https://www.veteranscrisisline.net')}
          >
            <View style={CARD.row}>
              <MaterialIcons
                name="language"
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

        {/* Local crisis line */}
        <View style={CARD.base}>
          <Text style={CARD.title(true)}>Local Crisis Line</Text>
          <Text style={CARD.text}>
            We’ll automatically detect your country and show the nearest mental
            health hotline for your region (e.g., Thailand’s local line).
          </Text>
          <Text style={[CARD.text, { marginTop: 4 }]}>
            Coming soon — this will request permission to access your location
            and match it against a vetted hotline directory.
          </Text>
        </View>

        {/* Overseas contacts */}
        <View style={CARD.base}>
          <Text style={CARD.title(true)}>Calling from Overseas?</Text>
          <Text style={CARD.text}>
            Dial the U.S. country code (+1). If one number doesn’t connect, try
            another region. DSN 988 works from all base phones.
          </Text>

          {Object.entries(crisisNumbers).map(([region, entries]) => (
            <View key={region} style={{ marginTop: 12 }}>
              <Text style={[CARD.text, { fontWeight: '700' as const }]}>
                {region}
              </Text>
              {entries.map((entry, idx) => (
                <Pressable
                  key={idx}
                  accessibilityRole={entry.type === 'tel' ? 'button' : 'text'}
                  hitSlop={entry.type === 'tel' ? 8 : 0}
                  onPress={() =>
                    entry.type === 'tel' ? openTel(entry.number) : undefined
                  }
                  disabled={entry.type !== 'tel'}
                >
                  <View style={CARD.row}>
                    {entry.type === 'tel' && (
                      <MaterialIcons
                        name="call"
                        size={fs(18)}
                        color={colors.blue}
                      />
                    )}
                    <Text style={CARD.link}>{entry.label}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          ))}
        </View>

        {/* DoD COM AOR Map */}
        <View style={CARD.base}>
          <Text style={CARD.title(true)}>DoD COM AOR</Text>

          <View
            style={{
              borderRadius: 12,
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.bg,
              alignSelf: 'stretch',
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
            >
              <Image
                source={aorMap}
                accessibilityLabel="Map showing Department of Defense Combatant Commands"
                style={{ width: cropWidth, height: cropHeight }}
                resizeMode="contain"
              />
            </ImageZoom>
          </View>

          <Text style={[CARD.text, { marginTop: 8 }]}>
            Pinch to zoom and drag to pan.
          </Text>
        </View>
      </ScrollView>
    </Background>
  );
}

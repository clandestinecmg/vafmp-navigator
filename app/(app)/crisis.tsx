// app/(app)/crisis.tsx
import * as React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  Linking,
  Image,
  Dimensions,
  Pressable,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import ImageZoom from 'react-native-image-pan-zoom';
import Background from '../../components/Background';
import { shared, colors, fs, GUTTER, MAX_WIDTH } from '../../styles/shared';

const aorMap = require('../../assets/crisis/dod-aor-map.jpg');

function callNumber(num: string) {
  const tel = num.replace(/[^\d+]/g, '');
  return Linking.openURL(`tel:${tel}`).catch(() =>
    Alert.alert('Error', 'Unable to open dialer.'),
  );
}

function openUrl(url: string) {
  return Linking.openURL(url).catch(() =>
    Alert.alert('Error', 'Unable to open link.'),
  );
}

export default function Crisis() {
  return (
    <Background>
      <ScrollView
        style={shared.page}
        contentContainerStyle={[
          shared.wrap,
          { paddingTop: GUTTER, paddingBottom: 40 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={shared.safePad} />
        <Text style={shared.titleCenter}>Crisis Resources</Text>

        {/* Red emergency banner */}
        <View style={S.emergencyBanner}>
          <Text style={S.emergencyText}>
            If you’re in immediate danger, call your local emergency number now.
          </Text>
        </View>

        {/* U.S. Veterans Crisis Line */}
        <View style={shared.card}>
          <Text style={S.sectionTitle}>U.S. Veterans Crisis Line</Text>

          <Text style={[shared.textMd, { marginTop: 6, textAlign: 'left' }]}>
            24/7 confidential support for Veterans, service members, Guard &
            Reserve, and their families. Services include talk/text with trained
            responders, safety planning, and referrals to VA & local care.
          </Text>

          <View style={S.row}>
            <MaterialIcons name="public" size={fs(18)} color={colors.gold} />
            <Text
              style={S.link}
              onPress={() => openUrl('https://www.veteranscrisisline.net/')}
            >
              Visit VeteransCrisisLine.net
            </Text>
          </View>

          <Pressable
            style={[shared.btn, shared.btnPrimary, { marginTop: 12 }]}
            onPress={() =>
              openUrl('https://www.veteranscrisisline.net/get-help-now/chat/')
            }
          >
            <Text style={shared.btnLabel}>Chat Online</Text>
          </Pressable>

          <Pressable
            style={[shared.btn, shared.btnPrimary, { marginTop: 10 }]}
            onPress={() => callNumber('988')}
          >
            <Text style={shared.btnLabel}>Call 988 (Press 1 for Veterans)</Text>
          </Pressable>

          <Pressable
            style={[shared.btn, shared.btnPrimary, { marginTop: 10 }]}
            onPress={async () => {
              try {
                const url = 'sms:838255';
                const ok = await Linking.canOpenURL(url);
                if (ok) await Linking.openURL(url);
              } catch {
                // swallow
              }
            }}
          >
            <Text style={shared.btnLabel}>Text 838255</Text>
          </Pressable>
        </View>

        {/* Local crisis line */}
        <View style={shared.card}>
          <Text style={S.sectionTitle}>Local Crisis Line</Text>
          <Text style={[shared.textMd, { textAlign: 'left' }]}>
            We’ll automatically detect your country and show the nearest mental
            health hotline for your region (e.g., Thailand’s local line).
          </Text>
          <Text style={[shared.textMd, { marginTop: 6, textAlign: 'left' }]}>
            Coming soon — this will ask permission to access your location and
            match it against a vetted hotline directory.
          </Text>
        </View>

        {/* Overseas numbers */}
        <View style={shared.card}>
          <Text style={S.sectionTitle}>Overseas Numbers by COM Region</Text>

          <View style={S.row}>
            <MaterialIcons name="info" size={fs(18)} color={colors.gold} />
            <Text style={[S.link, { fontWeight: '700' }]}>
              On base: DSN 988
            </Text>
          </View>

          <Text style={S.regionHeading}>NORTHCOM</Text>
          <View style={S.row}>
            <MaterialIcons name="phone" size={fs(18)} color={colors.green} />
            <Text style={S.link} onPress={() => callNumber('988')}>
              Dial 988 then Press 1
            </Text>
          </View>

          <Text style={S.regionHeading}>PACOM</Text>
          <View style={S.row}>
            <MaterialIcons name="phone" size={fs(18)} color={colors.green} />
            <Text style={S.link} onPress={() => callNumber('+18447025493')}>
              +1 844-702-5493 (off base)
            </Text>
          </View>

          <Text style={S.regionHeading}>EUCOM</Text>
          <View style={S.row}>
            <MaterialIcons name="phone" size={fs(18)} color={colors.green} />
            <Text style={S.link} onPress={() => callNumber('+18447025495')}>
              +1 844-702-5495 (off base)
            </Text>
          </View>

          <Text style={S.regionHeading}>CENTCOM</Text>
          <View style={S.row}>
            <MaterialIcons name="phone" size={fs(18)} color={colors.green} />
            <Text style={S.link} onPress={() => callNumber('+18554227719')}>
              +1 855-422-7719 (off base)
            </Text>
          </View>

          <Text style={S.regionHeading}>AFRICOM</Text>
          <View style={S.row}>
            <MaterialIcons name="phone" size={fs(18)} color={colors.green} />
            <Text style={S.link} onPress={() => callNumber('+18884826054')}>
              +1 888-482-6054 (off base)
            </Text>
          </View>

          <Text style={S.regionHeading}>SOUTHCOM</Text>
          <View style={S.row}>
            <MaterialIcons name="phone" size={fs(18)} color={colors.green} />
            <Text style={S.link} onPress={() => callNumber('+18669899599')}>
              +1 866-989-9599 (off base)
            </Text>
          </View>
        </View>

        {/* Map */}
        <View style={shared.card}>
          <Text style={S.sectionTitle}>DoD Areas of Responsibility</Text>

          {(() => {
            const src = Image.resolveAssetSource(aorMap);
            const screenW = Dimensions.get('window').width;
            const maxInner = Math.min(screenW, MAX_WIDTH);
            const innerW = Math.round(maxInner - 32); // ~card paddings
            const aspect = src.height / src.width || 0.5625;
            const innerH = Math.round(innerW * aspect);

            return (
              <View style={S.mapClipper}>
                <ImageZoom
                  cropWidth={innerW}
                  cropHeight={innerH}
                  imageWidth={innerW}
                  imageHeight={innerH}
                  minScale={1}
                  maxScale={3}
                  enableCenterFocus
                  pinchToZoom
                  panToMove
                >
                  <Image
                    source={aorMap}
                    style={{ width: innerW, height: innerH }}
                    resizeMode="cover"
                  />
                </ImageZoom>
              </View>
            );
          })()}

          <Text style={S.helperText}>Pinch to zoom and drag to pan.</Text>
        </View>
      </ScrollView>
    </Background>
  );
}

const lh = (px: number) => Math.round(fs(px) * 1.3);

const S = StyleSheet.create({
  emergencyBanner: {
    backgroundColor: '#D32F2F',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  emergencyText: {
    color: 'white',
    fontWeight: '700',
    textAlign: 'center',
  },
  sectionTitle: {
    ...shared.text,
    fontWeight: '800',
    fontSize: fs(20),
    lineHeight: lh(20),
    marginBottom: 10,
    textAlign: 'center',
    color: colors.gold,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  link: {
    ...shared.text,
    color: colors.gold,
    fontWeight: '700',
    fontSize: fs(18),
    lineHeight: lh(18),
    marginLeft: 8,
    flexShrink: 1,
  },
  regionHeading: {
    ...shared.text,
    fontWeight: '800',
    fontSize: fs(19),
    lineHeight: lh(19),
    textAlign: 'left',
    marginTop: 12,
    marginBottom: 4,
    color: colors.text,
  },
  mapClipper: {
    overflow: 'hidden',
    borderRadius: 12,
    alignSelf: 'center',
    backgroundColor: colors.bg,
  },
  helperText: {
    ...shared.textSm,
    textAlign: 'center',
    marginTop: 8,
    color: colors.text,
  },
});

import * as React from 'react';
import {
  View,
  Text,
  Linking,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { shared, colors, fs, GUTTER } from '../../styles/shared';
import {
  VAFMP_LINKS,
  VAFMP_CONTACT,
  VAFMP_TOLL_FREE,
} from '../../lib/resourcesData';
import Background from '../../components/Background';

export default function Resources() {
  const openUrl = (url: string) =>
    Linking.openURL(url).catch(() =>
      Alert.alert('Error', 'Unable to open link.'),
    );
  const sendEmail = () =>
    Linking.openURL(`mailto:${VAFMP_CONTACT.email}`).catch(() =>
      Alert.alert('Error', 'Unable to open mail client.'),
    );
  const callNumber = (num: string) =>
    Linking.openURL(`tel:${num.replace(/[^\d+]/g, '')}`).catch(() =>
      Alert.alert('Error', 'Unable to open dialer.'),
    );

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
        <Text style={shared.titleCenter}>Resources</Text>

        {/* VAFMP */}
        <View style={shared.card}>
          <Text style={styles.sectionTitle}>VAFMP</Text>
          {Object.values(VAFMP_LINKS).map((link) => {
            // Drop the redundant "VAFMP: " prefix in labels
            const niceLabel = link.label.replace(/^VAFMP:\s*/i, '');
            return (
              <TouchableOpacity
                key={link.label}
                style={styles.row}
                onPress={() => openUrl(link.url)}
                accessibilityRole="link"
                accessibilityLabel={niceLabel}
              >
                <MaterialIcons
                  name="public"
                  size={fs(18)}
                  color={colors.gold}
                  style={styles.icon}
                />
                <Text style={styles.link}>{niceLabel}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Contact */}
        <View style={shared.card}>
          <Text style={styles.sectionTitle}>Contact</Text>

          <TouchableOpacity
            style={styles.row}
            onPress={sendEmail}
            accessibilityRole="button"
            accessibilityLabel={`Email VAFMP at ${VAFMP_CONTACT.email}`}
          >
            <MaterialIcons
              name="email"
              size={fs(18)}
              color={colors.blue}
              style={styles.icon}
            />
            <Text style={styles.link}>Email VAFMP ({VAFMP_CONTACT.email})</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.row}
            onPress={() => callNumber(VAFMP_CONTACT.mainLine.number)}
            accessibilityRole="button"
            accessibilityLabel={`Call FMP main line ${VAFMP_CONTACT.mainLine.number}`}
          >
            <MaterialIcons
              name="call"
              size={fs(18)}
              color={colors.green}
              style={styles.icon}
            />
            <Text style={styles.link}>
              FMP Main Line: {VAFMP_CONTACT.mainLine.number}
            </Text>
          </TouchableOpacity>

          <Text style={styles.muted}>
            TTY: {VAFMP_CONTACT.mainLine.tty} • {VAFMP_CONTACT.mainLine.hours}
          </Text>
        </View>

        {/* Toll-Free */}
        <View style={shared.card}>
          <Text style={styles.sectionTitle}>Toll-Free Numbers</Text>

          {VAFMP_TOLL_FREE.map((item) => (
            <TouchableOpacity
              key={item.country}
              style={styles.row}
              onPress={() => callNumber(item.phone)}
              accessibilityRole="button"
              accessibilityLabel={`Call ${item.country} toll-free number ${item.phone}`}
            >
              <MaterialIcons
                name="phone"
                size={fs(18)}
                color={colors.green}
                style={styles.icon}
              />
              <Text style={styles.link}>
                {item.country}: {item.phone}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </Background>
  );
}

// simple helper for line height
const lh = (px: number) => Math.round(fs(px) * 1.3);

const styles = StyleSheet.create({
  sectionTitle: {
    ...shared.text,
    fontWeight: '800',
    fontSize: fs(20), // keep subheaders strong
    lineHeight: lh(20),
    marginBottom: 10,
    textAlign: 'center',
    color: colors.text,
  },
  row: { flexDirection: 'row', alignItems: 'center', marginVertical: 6 },
  icon: { marginRight: 10 },
  link: {
    ...shared.text,
    color: colors.gold,
    fontWeight: '700',
    fontSize: fs(18), // bumped inside-block text
    lineHeight: lh(18),
    flexShrink: 1,
  },
  muted: {
    ...shared.text,
    color: colors.muted,
    fontSize: fs(16),
    lineHeight: lh(16),
    marginTop: 4,
    textAlign: 'center',
  },
});

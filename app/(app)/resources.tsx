import * as React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert, ScrollView } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { shared, colors } from '../../styles/shared';

const OPEN = (url: string) =>
  Linking.openURL(url).catch(() => Alert.alert('Error', 'Unable to open link.'));

const MAIL = (to: string, subject?: string) => {
  const s = subject ? `?subject=${encodeURIComponent(subject)}` : '';
  Linking.openURL(`mailto:${to}${s}`).catch(() =>
    Alert.alert('Error', 'Unable to open email app.')
  );
};

export default function Resources() {
  const tollFree: Array<[string, string]> = [
    ['U.S. & Canada', '877-345-8179'],
    ['Australia', '1-800-354 965'],
    ['Costa Rica', '0800-013-0759'],
    ['Germany', '0800-1800-011'],
    ['Italy', '800-782-655'],
    ['Japan', '00531-13-0871'],
    ['Mexico', '001-877-345-8179'],
    ['Spain', '900-981-776'],
    ['United Kingdom', '0800-032-7425'],
  ];

  return (
    <View style={shared.screen}>
      <View style={shared.safePad} />
      <Text style={shared.title}>Resources</Text>

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Program Overview */}
        <View style={styles.block}>
          <Text style={styles.blockTitle}>VAFMP — Program Overview</Text>
          <TouchableOpacity style={styles.rowBtn} onPress={() => OPEN('https://www.va.gov/health-care/foreign-medical-program/')}>
            <MaterialIcons name="language" size={20} color={colors.text} />
            <Text style={styles.linkText}>Open Page</Text>
          </TouchableOpacity>
        </View>

        {/* Registration */}
        <View style={styles.block}>
          <Text style={styles.blockTitle}>VAFMP — Registration</Text>
          <TouchableOpacity
            style={styles.rowBtn}
            onPress={() =>
              OPEN('https://www.va.gov/health-care/foreign-medical-program/register-form-10-7959f-1/introduction')
            }
          >
            <MaterialIcons name="language" size={20} color={colors.text} />
            <Text style={styles.linkText}>Open Page</Text>
          </TouchableOpacity>
        </View>

        {/* How to File a Claim */}
        <View style={styles.block}>
          <Text style={styles.blockTitle}>VAFMP — How to File a Claim</Text>
          <TouchableOpacity
            style={styles.rowBtn}
            onPress={() => OPEN('https://www.va.gov/health-care/file-foreign-medical-program-claim/')}
          >
            <MaterialIcons name="language" size={20} color={colors.text} />
            <Text style={styles.linkText}>Open Page</Text>
          </TouchableOpacity>
        </View>

        {/* Contact */}
        <View style={styles.block}>
          <Text style={styles.blockTitle}>Contact</Text>

          <TouchableOpacity style={styles.rowBtn} onPress={() => MAIL('HAC.FMP@va.gov', 'VAFMP Inquiry')}>
            <MaterialIcons name="email" size={20} color={colors.text} />
            <Text style={styles.mailText}>Email VAFMP (HAC.FMP@va.gov)</Text>
          </TouchableOpacity>

          <View style={styles.innerGap} />

          <TouchableOpacity style={styles.rowBtn} onPress={() => OPEN('tel:+18339300816')}>
            <MaterialIcons name="phone" size={20} color={colors.text} />
            <Text style={styles.mailText}>FMP Main: +1-833-930-0816 (TTY 711)</Text>
          </TouchableOpacity>
        </View>

        {/* Toll-free by Country (numbers aligned right + phone icon) */}
        <View style={styles.block}>
          <Text style={styles.blockTitle}>Toll-free by Country</Text>

          {tollFree.map(([label, phone], idx) => (
            <View key={label}>
              {idx > 0 && <View style={styles.innerGap} />}
              <TouchableOpacity
                style={styles.lineRow}
                onPress={() => OPEN(`tel:${phone.replace(/[^\d+]/g, '')}`)}
              >
                <MaterialIcons name="phone" size={18} color={colors.text} style={{ marginRight: 8 }} />
                <Text style={styles.lineLeft}>{label}:</Text>
                <Text style={styles.lineRight}>{phone}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  blockTitle: {
    color: colors.text,
    fontWeight: '800',
    marginBottom: 10,
  },
  rowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  linkText: { color: colors.text, fontWeight: '700' },
  mailText: { color: colors.text, fontWeight: '700', flexShrink: 1 },
  innerGap: { height: 12 },

  lineRow: { flexDirection: 'row', alignItems: 'center' },
  lineLeft: { color: colors.text, fontWeight: '700', flex: 1 },
  lineRight: { color: colors.text, fontWeight: '700' },
});
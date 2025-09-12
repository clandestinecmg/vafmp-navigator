import * as React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert, ScrollView } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { shared, colors } from '../../styles/shared';

const OPEN = (url: string) =>
  Linking.openURL(url).catch(() => Alert.alert('Error', 'Unable to open link.'));

const DIAL = (num: string) =>
  Linking.openURL(`tel:${num.replace(/[^\d+]/g, '')}`).catch(() =>
    Alert.alert('Error', 'Unable to open dialer.')
  );

export default function Crisis() {
  return (
    <View style={shared.screen}>
      <View style={shared.safePad} />
      <Text style={shared.title}>Crisis</Text>

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Crisis Website (blurb) */}
        <View style={styles.block}>
          <Text style={styles.blockTitle}>Veterans Crisis Line — Website</Text>
          <Text style={styles.blurb}>
            Get help 24/7 with live chat and text options. If you’re in crisis or concerned about
            a Veteran, this is the fastest way to reach support.
          </Text>
          <TouchableOpacity style={styles.rowBtn} onPress={() => OPEN('https://www.veteranscrisisline.net/')}>
            <MaterialIcons name="language" size={20} color={colors.text} />
            <Text style={styles.linkText}>Visit Website</Text>
          </TouchableOpacity>
        </View>

        {/* International Crisis Lines */}
        <View style={styles.block}>
          <Text style={styles.blockTitle}>International Crisis Lines</Text>

          <View style={{ height: 10 }} />

          {/* NORTHCOM */}
          <TouchableOpacity style={styles.lineRow} onPress={() => DIAL('988')}>
            <MaterialIcons name="phone" size={18} color={colors.text} style={{ marginRight: 8 }} />
            <Text style={styles.lineLeft}>NORTHCOM (US):</Text>
            <Text style={styles.lineRight}>Dial 988 then press 1</Text>
          </TouchableOpacity>

          <View style={styles.innerGap} />

          {/* PACOM */}
          <TouchableOpacity style={styles.lineRow} onPress={() => DIAL('+80055515500')}>
            <MaterialIcons name="phone" size={18} color={colors.text} style={{ marginRight: 8 }} />
            <Text style={styles.lineLeft}>PACOM (Off-base):</Text>
            <Text style={styles.lineRight}>+800-5551-5500</Text>
          </TouchableOpacity>

          <View style={styles.innerGap} />

          {/* EUCOM */}
          <TouchableOpacity style={styles.lineRow} onPress={() => DIAL('+0080012758255')}>
            <MaterialIcons name="phone" size={18} color={colors.text} style={{ marginRight: 8 }} />
            <Text style={styles.lineLeft}>EUCOM (Off-base):</Text>
            <Text style={styles.lineRight}>00800-1275-8255</Text>
          </TouchableOpacity>

          <View style={styles.innerGap} />

          {/* CENTCOM */}
          <TouchableOpacity style={styles.lineRow} onPress={() => DIAL('+00180012758255')}>
            <MaterialIcons name="phone" size={18} color={colors.text} style={{ marginRight: 8 }} />
            <Text style={styles.lineLeft}>CENTCOM (Off-base):</Text>
            <Text style={styles.lineRight}>001-800-1275-8255</Text>
          </TouchableOpacity>

          <View style={styles.innerGap} />

          {/* AFRICOM */}
          <TouchableOpacity style={styles.lineRow} onPress={() => DIAL('+0018669661020')}>
            <MaterialIcons name="phone" size={18} color={colors.text} style={{ marginRight: 8 }} />
            <Text style={styles.lineLeft}>AFRICOM (Off-base):</Text>
            <Text style={styles.lineRight}>001-866-966-1020</Text>
          </TouchableOpacity>

          <View style={styles.innerGap} />

          {/* SOUTHCOM */}
          <TouchableOpacity style={styles.lineRow} onPress={() => DIAL('+00180012758255')}>
            <MaterialIcons name="phone" size={18} color={colors.text} style={{ marginRight: 8 }} />
            <Text style={styles.lineLeft}>SOUTHCOM (Off-base):</Text>
            <Text style={styles.lineRight}>001-800-1275-8255</Text>
          </TouchableOpacity>
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
    marginBottom: 8,
  },
  blurb: { color: colors.text, marginBottom: 10 },
  rowBtn: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  linkText: { color: colors.text, fontWeight: '700' },

  lineRow: { flexDirection: 'row', alignItems: 'center' },
  lineLeft: { color: colors.text, fontWeight: '700', flex: 1 },
  lineRight: { color: colors.text, fontWeight: '700' },
  innerGap: { height: 12 },
});
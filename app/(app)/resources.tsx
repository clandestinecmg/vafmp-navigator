// app/(app)/resources.tsx
import * as React from 'react';
import { View, Text, Linking, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { shared, colors } from '../../styles/shared';
import { VAFMP_LINKS, VAFMP_CONTACT, VAFMP_TOLL_FREE } from '../../lib/resourcesData';
import Background from '../../components/Background';

export default function Resources() {
  const openUrl = (url: string) =>
    Linking.openURL(url).catch(() => Alert.alert('Error', 'Unable to open link.'));
  const sendEmail = () =>
    Linking.openURL(`mailto:${VAFMP_CONTACT.email}`).catch(() =>
      Alert.alert('Error', 'Unable to open mail client.')
    );
  const callNumber = (num: string) =>
    Linking.openURL(`tel:${num.replace(/[^\d+]/g, '')}`).catch(() =>
      Alert.alert('Error', 'Unable to open dialer.')
    );

  return (
    <Background>
      <View style={shared.screenOnImage}>
        <View style={shared.safePad} />
        <Text style={shared.title}>Resources</Text>

        {/* VAFMP Links */}
        <View style={shared.card}>
          <Text style={styles.sectionTitle}>VAFMP</Text>
          {Object.values(VAFMP_LINKS).map((link) => (
            <TouchableOpacity
              key={link.label}
              style={styles.row}
              onPress={() => openUrl(link.url)}
            >
              <MaterialIcons name="open-in-new" size={18} color={colors.gold} style={styles.icon} />
              <Text style={styles.link}>{link.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Contact */}
        <View style={shared.card}>
          <Text style={styles.sectionTitle}>Contact</Text>
          <TouchableOpacity style={styles.row} onPress={sendEmail}>
            <MaterialIcons name="email" size={18} color={colors.blue} style={styles.icon} />
            <Text style={styles.link}>Email VAFMP ({VAFMP_CONTACT.email})</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.row} onPress={() => callNumber(VAFMP_CONTACT.mainLine.number)}>
            <MaterialIcons name="call" size={18} color={colors.green} style={styles.icon} />
            <Text style={styles.link}>FMP Main Line: {VAFMP_CONTACT.mainLine.number}</Text>
          </TouchableOpacity>
          <Text style={styles.muted}>
            TTY: {VAFMP_CONTACT.mainLine.tty} • {VAFMP_CONTACT.mainLine.hours}
          </Text>
        </View>

        {/* Toll-Free */}
        <View style={shared.card}>
          <Text style={styles.sectionTitle}>Toll-Free Numbers</Text>
          <FlatList
            data={VAFMP_TOLL_FREE}
            keyExtractor={(item) => item.country}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.row} onPress={() => callNumber(item.phone)}>
                <MaterialIcons name="phone" size={18} color={colors.green} style={styles.icon} />
                <Text style={styles.link}>{item.country}: {item.phone}</Text>
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={{ height: 6 }} />}
          />
        </View>
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  icon: { marginRight: 8 },
  link: { color: colors.gold, fontWeight: '700', flexShrink: 1 },
  muted: { color: colors.muted, fontSize: 12, marginTop: 2 },
});
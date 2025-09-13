// app/(app)/crisis.tsx
import * as React from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Background from '../../components/Background';
import { shared, colors } from '../../styles/shared';

export default function Crisis() {
  const call988 = () => Linking.openURL('tel:988').catch(() => {});
  const sms988  = () => Linking.openURL('sms:988').catch(() => {});
  const site988 = () => Linking.openURL('https://988lifeline.org/').catch(() => {});

  return (
    <Background>
      <View style={shared.screenOnImage}>
        <View style={shared.safePad} />
        <Text style={shared.title}>Crisis</Text>
        <Text style={shared.text}>
          If you’re in crisis, you can call or text 988, or visit the 988 Lifeline.
        </Text>

        <View style={shared.actionRow}>
          <TouchableOpacity style={shared.actionBtn} onPress={call988}>
            <MaterialIcons name="call" size={22} color={colors.red} />
          </TouchableOpacity>
          <TouchableOpacity style={shared.actionBtn} onPress={sms988}>
            <MaterialIcons name="sms" size={22} color={colors.gold} />
          </TouchableOpacity>
          <TouchableOpacity style={shared.actionBtn} onPress={site988}>
            <MaterialIcons name="open-in-new" size={22} color={colors.blue} />
          </TouchableOpacity>
        </View>
      </View>
    </Background>
  );
}
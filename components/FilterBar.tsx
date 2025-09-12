import * as React from 'react';
import { View, Pressable, Text, StyleSheet, ScrollView } from 'react-native';

export type Option = { label: string; value: string };
type Props = {
  label?: string;
  options: Option[];
  value: string | null;
  onChange: (v: string | null) => void;
};

function Chip({ active, children, onPress }: { active?: boolean; children: React.ReactNode; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{children}</Text>
    </Pressable>
  );
}

export function FilterBar({ label, options, value, onChange }: Props) {
  return (
    <View style={styles.wrap}>
      {!!label && <Text style={styles.label}>{label}</Text>}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        <Chip active={!value} onPress={() => onChange(null)}>All</Chip>
        {options.map(o => (
          <Chip key={o.value} active={value === o.value} onPress={() => onChange(o.value)}>
            {o.label}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 8 },
  label: { fontWeight: '700', marginBottom: 6 },
  row: { gap: 8, paddingRight: 8 },
  chip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, backgroundColor: '#f0f7fa' },
  chipActive: { backgroundColor: '#0a7ea4' },
  chipText: { color: '#0a7ea4', fontWeight: '700' },
  chipTextActive: { color: '#fff' },
});

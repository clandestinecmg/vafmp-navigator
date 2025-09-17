// components/FilterBar.tsx
import * as React from 'react';
import { View, Pressable, Text, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../styles/shared'; // using shared palette border, etc.

export type Option = { label: string; value: string };

type Props = {
  label?: string;
  options: Option[];
  value: string | null;
  onChange: (v: string | null) => void;
};

function Chip({
  active,
  children,
  onPress,
}: {
  active?: boolean;
  children: React.ReactNode;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        active && styles.chipActive,
        pressed && styles.chipPressed,
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected: !!active }}
    >
      <Text
        style={[styles.chipText, active && styles.chipTextActive]}
        numberOfLines={1}
      >
        {children}
      </Text>
    </Pressable>
  );
}

export function FilterBar({ label, options, value, onChange }: Props) {
  return (
    <View style={styles.wrap}>
      {!!label && <Text style={styles.label}>{label}</Text>}

      {/* “Panel” look: white card with dark border, chips inside */}
      <View style={styles.panel}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.row}
        >
          <Chip active={!value} onPress={() => onChange(null)}>
            All
          </Chip>
          {options.map((o) => (
            <Chip
              key={o.value}
              active={value === o.value}
              onPress={() => onChange(o.value)}
            >
              {o.label}
            </Chip>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 8, paddingHorizontal: 12 },
  label: {
    fontWeight: '700',
    marginBottom: 6,
    color: '#111827', // black-ish for contrast above white panel
  },

  // White panel with theme border (no behavior change)
  panel: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 6,
  },

  row: {
    gap: 8,
    paddingHorizontal: 8,
  },

  // Chips: white with black text; active = soft gray, still black text
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipPressed: {
    opacity: 0.9,
  },
  chipActive: {
    backgroundColor: '#e5e7eb', // Tailwind gray-200 equivalent
  },
  chipText: {
    color: '#111827', // black text for readability
    fontWeight: '700',
  },
  chipTextActive: {
    color: '#111827',
  },
});

export default FilterBar;

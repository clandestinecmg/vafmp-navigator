// components/Select.tsx
import * as React from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { colors, fs, GUTTER, shared } from '../styles/shared';

export type Option = { label: string; value: string };

type Props = {
  label: string;
  value: string | null;
  options: Option[];
  onChange: (v: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
  icon?: keyof typeof MaterialIcons.glyphMap;
};

export default function Select({
  label,
  value,
  options,
  onChange,
  placeholder,
  disabled,
  icon,
}: Props) {
  const [open, setOpen] = React.useState(false);
  const current = options.find((o) => o.value === value) || null;

  return (
    <>
      {/* Closed field — stretches to fill parent/card width */}
      <Pressable
        disabled={disabled}
        onPress={() => setOpen(true)}
        style={({ pressed }) => [
          styles.field,
          disabled && styles.fieldDisabled,
          pressed && styles.fieldPressed,
        ]}
      >
        {icon ? (
          <MaterialIcons
            name={icon}
            size={fs(20)}
            color={colors.muted}
            style={{ marginRight: 8 }}
          />
        ) : null}
        <Text
          numberOfLines={1}
          style={[styles.fieldText, !current && styles.placeholder]}
        >
          {current ? current.label : (placeholder ?? label)}
        </Text>
        <MaterialIcons
          name={open ? 'expand-less' : 'expand-more'}
          size={fs(22)}
          color={colors.muted}
          style={{ marginLeft: 8 }}
        />
      </Pressable>

      {/* Modal panel */}
      <Modal
        visible={open}
        animationType="fade"
        transparent
        onRequestClose={() => setOpen(false)}
      >
        <View style={styles.backdrop} />
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>{label}</Text>
            <Pressable onPress={() => setOpen(false)} hitSlop={8}>
              <MaterialIcons name="close" size={fs(22)} color="#111" />
            </Pressable>
          </View>

          <ScrollView
            style={{ maxHeight: 380 }}
            contentContainerStyle={{ paddingVertical: 6 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* “All” / Clear */}
            <Pressable
              onPress={() => {
                onChange(null);
                setOpen(false);
              }}
              style={({ pressed }) => [
                styles.option,
                pressed && styles.optionPressed,
              ]}
            >
              <Text style={styles.optionText}>All</Text>
            </Pressable>

            {options.map((o) => {
              const active = value === o.value;
              return (
                <Pressable
                  key={o.value}
                  onPress={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                  style={({ pressed }) => [
                    styles.option,
                    pressed && styles.optionPressed,
                    active && styles.optionActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.optionText,
                      active && styles.optionTextActive,
                    ]}
                  >
                    {o.label}
                  </Text>
                  {active ? (
                    <MaterialIcons name="check" size={fs(20)} color="#111" />
                  ) : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  // Closed field fills parent/card width
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: colors.border,
    borderWidth: 1,
    backgroundColor: colors.card,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 50,
    width: '100%',
    alignSelf: 'stretch',
  },
  fieldDisabled: { opacity: 0.5 },
  fieldPressed: { opacity: 0.85 },
  fieldText: {
    ...shared.textLg, // ← bigger default text
    fontWeight: '700',
    flex: 1,
  },
  placeholder: {
    color: colors.muted,
    fontWeight: Platform.OS === 'ios' ? '600' : '700',
  },

  // Modal chrome
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  panel: {
    position: 'absolute',
    left: GUTTER, // align with card margin
    right: GUTTER, // align with card margin
    top: '20%',
    borderRadius: 12,
    backgroundColor: '#fff',
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
    marginBottom: 8,
  },
  panelTitle: { fontSize: fs(20), fontWeight: '800', color: '#111' },

  // Options
  option: {
    paddingVertical: 14,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginVertical: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionPressed: { backgroundColor: '#f5f5f5' },
  optionActive: {
    backgroundColor: '#eef6ff',
    borderWidth: 1,
    borderColor: '#cfe1ff',
  },
  optionText: {
    // Larger list item text for accessibility
    fontSize: fs(18),
    fontWeight: '700',
    color: '#111',
  },
  optionTextActive: { color: '#0b3ea8' },
});

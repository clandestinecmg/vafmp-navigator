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
import { colors } from '../styles/shared';

export type Option = { label: string; value: string };

type Props = {
  label: string; // visible label on the closed field ("Country", "City", etc.)
  value: string | null; // current selected value
  options: Option[]; // choices
  onChange: (v: string | null) => void;
  placeholder?: string; // text when value === null (defaults to label)
  disabled?: boolean;
  icon?: keyof typeof MaterialIcons.glyphMap; // optional leading icon name
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
            size={18}
            color={colors.muted}
            style={{ marginRight: 6 }}
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
          size={20}
          color={colors.muted}
          style={{ marginLeft: 6 }}
        />
      </Pressable>

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
              <MaterialIcons name="close" size={22} color="#111" />
            </Pressable>
          </View>

          <ScrollView
            style={{ maxHeight: 360 }}
            contentContainerStyle={{ paddingVertical: 4 }}
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
                    <MaterialIcons name="check" size={18} color="#111" />
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
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: colors.border,
    borderWidth: 1,
    backgroundColor: colors.card,
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 44,
    minWidth: 150,
    flexGrow: 1,
  },
  fieldDisabled: { opacity: 0.5 },
  fieldPressed: { opacity: 0.85 },
  fieldText: { color: colors.text, flex: 1, fontSize: 14, fontWeight: '600' },
  placeholder: {
    color: colors.muted,
    fontWeight: Platform.OS === 'ios' ? '600' : '700',
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  panel: {
    position: 'absolute',
    left: 16,
    right: 16,
    top: '20%',
    borderRadius: 12,
    backgroundColor: '#fff', // ← white panel
    padding: 12,
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
    paddingBottom: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
    marginBottom: 6,
  },
  panelTitle: { fontSize: 16, fontWeight: '800', color: '#111' },

  option: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginVertical: 2,
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
  optionText: { color: '#111', fontSize: 14, fontWeight: '700' }, // ← black text
  optionTextActive: { color: '#0b3ea8' },
});

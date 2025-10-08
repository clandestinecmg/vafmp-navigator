// components/BigToast.tsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal, View, Text, StyleSheet, AccessibilityInfo } from 'react-native';
import { colors, fs, lh } from '../styles/shared';

type ToastOptions = { duration?: number };

export function useBigToast(defaultDuration = 1800) {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [duration, setDuration] = useState(defaultDuration);

  const show = useCallback(
    (msg: string, opts?: ToastOptions) => {
      setMessage(msg);
      setDuration(opts?.duration ?? defaultDuration);
      setVisible(true);
    },
    [defaultDuration],
  );

  useEffect(() => {
    let t: NodeJS.Timeout | null = null;
    if (visible) {
      AccessibilityInfo.announceForAccessibility(message);
      t = setTimeout(() => setVisible(false), duration);
    }
    return () => {
      if (t) clearTimeout(t);
    };
  }, [visible, duration, message]);

  const Toast = useMemo(
    () =>
      function ToastHost() {
        return (
          <Modal visible={visible} animationType="fade" transparent>
            <View style={styles.overlay}>
              <View style={styles.card} accessibilityRole="alert">
                <Text style={styles.text}>{message}</Text>
              </View>
            </View>
          </Modal>
        );
      },
    [visible, message],
  );

  return { show, Toast };
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 16,
    maxWidth: 560,
    width: '100%',
  },
  text: {
    color: colors.text,
    fontSize: fs(18),
    lineHeight: lh(18),
    fontWeight: '800',
    textAlign: 'center',
  },
});

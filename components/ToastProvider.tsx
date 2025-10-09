// components/ToastProvider.tsx
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Modal, View, Text, StyleSheet, AccessibilityInfo } from 'react-native';
import { colors, fs, lh } from '../styles/shared';

type ToastCtx = {
  show: (message: string, durationMs?: number) => void;
};

const ToastContext = createContext<ToastCtx | undefined>(undefined);

export function useToast(): ToastCtx {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((msg: string, durationMs = 2000) => {
    if (timeout.current) {
      clearTimeout(timeout.current);
      timeout.current = null;
    }
    setMessage(msg);
    setVisible(true);
    AccessibilityInfo.announceForAccessibility(msg);
    timeout.current = setTimeout(() => {
      setVisible(false);
      timeout.current = null;
    }, durationMs);
  }, []);

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Modal visible={visible} animationType="fade" transparent>
        <View style={styles.overlay}>
          <View style={styles.card} accessibilityRole="alert">
            <Text style={styles.text}>{message}</Text>
          </View>
        </View>
      </Modal>
    </ToastContext.Provider>
  );
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

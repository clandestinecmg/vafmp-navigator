// styles/shared.ts
import { StyleSheet, Platform, StatusBar } from 'react-native';

export const colors = {
  // Dark theme base
  bg: '#0b1220',
  card: '#111827',
  border: '#1f2937',
  text: '#e5e7eb',
  muted: '#9ca3af',

  // Accents
  blue: '#3b82f6',
  red: '#ef4444',
  gold: '#facc15',

  // Legacy aliases (kept for older screens)
  green: '#22c55e',
  amber: '#f59e0b',
  cardBg: '#111827',
  cardBorder: '#1f2937',
};

// single source of truth for card width rhythm
export const GUTTER = 6;

// type scale helpers
const SCALE = 1.16;
export const fs = (n: number) => Math.round(n * SCALE);
export const lh = (n: number) => Math.round(fs(n) * 1.4);

// top safe pad
const topSafe =
  Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 12 : 16;

export const shared = StyleSheet.create({
  // Layout
  screen: { flex: 1, backgroundColor: colors.bg },
  screenOnImage: { flex: 1, backgroundColor: 'transparent' },
  safePad: { height: topSafe },
  buffer: { height: 12 },

  // Typography
  title: {
    color: colors.text,
    fontSize: fs(24),
    lineHeight: lh(24),
    fontWeight: '800',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  titleGold: {
    color: colors.gold,
    fontSize: fs(24),
    lineHeight: lh(24),
    fontWeight: '800',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  titleCenter: {
    color: colors.text,
    fontSize: fs(24),
    lineHeight: lh(24),
    fontWeight: '800',
    textAlign: 'center',
    paddingHorizontal: 0,
    marginBottom: 10,
  },
  text: {
    color: colors.text,
    paddingHorizontal: 16,
    fontSize: fs(16),
    lineHeight: lh(16),
  },
  textMuted: {
    color: colors.muted,
    paddingHorizontal: 16,
    fontSize: fs(15),
    lineHeight: lh(15),
  },

  // Common rows & pills
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },

  pill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
  },

  fullBleed: {
    marginHorizontal: 0,
    borderRadius: 0,
  },

  // Cards / lists
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: GUTTER,
    marginTop: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    justifyContent: 'space-between',
  },
  listContent: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 18,
    gap: 14,
  },

  // Action row / buttons
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 14 },
  actionBtn: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    borderRadius: 10,
  },

  // Empty & helpers
  empty: {
    color: colors.muted,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: fs(15),
    lineHeight: lh(15),
  },
});

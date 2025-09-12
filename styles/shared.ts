// styles/shared.ts
import { StyleSheet, Platform, StatusBar } from 'react-native';

export const colors = {
  // Dark theme
  bg: '#0b1220',
  card: '#0f172a',
  border: '#1f2937',
  text: '#e5e7eb',
  muted: '#9ca3af',

  // Accent palette (icons/pills)
  green: '#22c55e',
  amber: '#f59e0b',
  blue:  '#3b82f6',
  red:   '#ef4444',

  // Back-compat aliases (some screens used these names)
  cardBg: '#0f172a',
  cardBorder: '#1f2937',
};

const topSafe =
  Platform.OS === 'android'
    ? (StatusBar.currentHeight ?? 0) + 12 // lowered a bit for notches, per your note
    : 16;

export const shared = StyleSheet.create({
  // Layout
  screen: { flex: 1, backgroundColor: colors.bg },
  safePad: { height: topSafe },
  buffer: { height: 12 },

  // Typography
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  text: { color: colors.text, paddingHorizontal: 16 },
  textMuted: { color: colors.muted, paddingHorizontal: 16 },

  // Common rows & pills
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  pill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: colors.border,
  },

  // Cards / lists
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    justifyContent: 'space-between',
  },
  listContent: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 12,
  },

  // Badges (billing)
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: colors.border,
  },
  badgeText: { color: colors.text, fontWeight: '700', fontSize: 12, letterSpacing: 0.3 },
  badgeDirect: { backgroundColor: '#065f46' }, // green-800
  badgeReimb:  { backgroundColor: '#7f1d1d' }, // red-900

  // Action row / buttons (call, email, map)
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
  actionBtn: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
    borderRadius: 10,
  },

  // Empty & helpers
  empty: { color: colors.muted, paddingHorizontal: 16, paddingVertical: 8 },
});
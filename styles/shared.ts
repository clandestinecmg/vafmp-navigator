// styles/shared.ts
import { StyleSheet, Platform, StatusBar } from 'react-native';

export const colors = {
  // Dark theme base
  bg: '#0b1220', // deep navy (app background)
  card: '#111827', // near-black slate for cards (a bit higher contrast)
  border: '#1f2937',
  text: '#e5e7eb',
  muted: '#9ca3af',

  // Patriotic accents
  blue: '#3b82f6', // links / info
  red: '#ef4444', // danger / destructive
  gold: '#facc15', // highlights (tab active, star, important actions)

  // Legacy aliases (leave these so older screens don’t explode)
  green: '#22c55e',
  amber: '#f59e0b', // kept for back-compat; prefer `gold` going forward
  cardBg: '#111827',
  cardBorder: '#1f2937',
};

// ----- Typography scale (global) --------------------------------------------
// Bump everything ~16% safely. You can change this to 1.2 if you want larger.
const SCALE = 1.16;

// Helper to scale font sizes and auto-derive a comfortable lineHeight.
const fs = (n: number) => Math.round(n * SCALE);
const lh = (n: number) => Math.round(fs(n) * 1.4);

// Top safe inset (“notch tax”)
const topSafe =
  Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 12 : 16;

export const shared = StyleSheet.create({
  // Layout
  screen: { flex: 1, backgroundColor: colors.bg },
  // Use this on screens wrapped by <Background> so the texture shows through
  screenOnImage: { flex: 1, backgroundColor: 'transparent' },
  safePad: { height: topSafe },
  buffer: { height: 12 },

  // Typography
  title: {
    color: colors.text,
    fontSize: fs(24), // was 24
    lineHeight: lh(24),
    fontWeight: '800',
    paddingHorizontal: 16,
    marginBottom: 10, // tiny bump helps with larger type
  },
  text: {
    color: colors.text,
    paddingHorizontal: 16,
    fontSize: fs(16), // was 16
    lineHeight: lh(16),
  },
  textMuted: {
    color: colors.muted,
    paddingHorizontal: 16,
    fontSize: fs(15), // was 15
    lineHeight: lh(15),
  },

  // Common rows & pills
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  pill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.border,
  },

  // Cards / lists
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 16, // was 14; give text breathing room
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 10, // was 8; spacing scales with type
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8, // was 6
    justifyContent: 'space-between',
  },
  listContent: {
    paddingHorizontal: 14, // was 12
    paddingTop: 10, // was 8
    paddingBottom: 18, // was 16
    gap: 14, // was 12
  },

  // Badges (billing)
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5, // slight bump
    backgroundColor: colors.border,
  },
  badgeText: {
    color: colors.text,
    fontWeight: '700',
    fontSize: fs(12), // was 12
    lineHeight: lh(12),
    letterSpacing: 0.3,
  },
  badgeDirect: { backgroundColor: '#065f46' }, // green-800
  badgeReimb: { backgroundColor: '#7f1d1d' }, // red-900

  // Action row / buttons (call, email, map)
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 14 }, // was 12
  actionBtn: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14, // was 12
    borderRadius: 10,
  },

  // Empty & helpers
  empty: {
    color: colors.muted,
    paddingHorizontal: 16,
    paddingVertical: 10, // was 8
    fontSize: fs(15),
    lineHeight: lh(15),
  },
});

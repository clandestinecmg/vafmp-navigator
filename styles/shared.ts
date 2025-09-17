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

// Top safe inset (“notch tax” — you pay it whether you like it or not)
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
    fontSize: 24, // bumped from 22 for readability
    fontWeight: '800',
    paddingHorizontal: 16,
    marginBottom: 8,
    // Fun fact: if this breaks, it’s always the font size. Always.
  },
  text: { color: colors.text, paddingHorizontal: 16, fontSize: 16 }, // slight bump
  textMuted: { color: colors.muted, paddingHorizontal: 16, fontSize: 15 },

  // Common rows & pills
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  pill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.border,
    // Infinite pill radius = infinite wisdom
  },

  // Cards / lists
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 14, // tiny bump
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 8, // scientifically fixes 90% of spacing bugs
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
  badgeText: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 0.3,
  },
  badgeDirect: { backgroundColor: '#065f46' }, // green-800 (direct = straight to business)
  badgeReimb: { backgroundColor: '#7f1d1d' }, // red-900 (reimbursement = red tape 😉)

  // Action row / buttons (call, email, map)
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
  actionBtn: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    borderRadius: 10,
    // Press me, I dare you
  },

  // Empty & helpers
  empty: { color: colors.muted, paddingHorizontal: 16, paddingVertical: 8 }, // “nothing to see here”
});

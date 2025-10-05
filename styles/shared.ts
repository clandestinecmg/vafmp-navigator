//styles/shared.ts

import { StyleSheet, Platform } from 'react-native';

/** ------- GLOBAL TUNING KNOBS ------- */
export const FONT_SCALE = 1.12; // ⬅️ global +12% text bump
export const SPACING_SCALE = 1.0; // keep spacing stable
export const MAX_WIDTH = 820;
/** ----------------------------------- */

export const GUTTER = Math.round(6 * SPACING_SCALE);

export const colors = {
  bg: '#0b0b10',
  text: '#f8fafc',
  muted: '#94a3b8',
  border: 'rgba(255,255,255,0.10)',
  card: 'rgba(2,6,23,0.70)',
  gold: '#fbbf24',
  blue: '#60a5fa',
  green: '#34d399',
  red: '#ef4444',
};

// font-size helper
export function fs(px: number): number {
  const val = px * FONT_SCALE;
  return Platform.OS === 'ios' ? val : Math.round(val);
}

// line-height helper
export function lh(px: number): number {
  const base = px * FONT_SCALE;
  const val = base * 1.25;
  return Platform.OS === 'ios' ? val : Math.round(val);
}

export const shared = StyleSheet.create({
  page: { flex: 1 },

  wrap: {
    width: '100%',
    maxWidth: MAX_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: GUTTER,
  },

  screen: { flex: 1, backgroundColor: colors.bg },
  screenOnImage: { flex: 1, backgroundColor: 'transparent' },

  fullBleed: { width: '100%', alignSelf: 'center' },

  pill: {
    paddingVertical: Math.round(12 * SPACING_SCALE),
    paddingHorizontal: Math.round(16 * SPACING_SCALE),
    borderRadius: Math.round(999 * SPACING_SCALE),
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },

  safePad: { height: Math.round(30 * SPACING_SCALE) },

  /** ----- Titles & Headers ----- */
  title: {
    fontSize: fs(26),
    fontWeight: '800',
    color: colors.gold,
    marginBottom: Math.round(12 * SPACING_SCALE),
  },
  titleCenter: {
    fontSize: fs(26),
    fontWeight: '800',
    color: colors.gold,
    marginBottom: Math.round(12 * SPACING_SCALE),
    textAlign: 'center',
  },
  sectionHeader: {
    fontSize: fs(18),
    fontWeight: '700',
    color: colors.text,
    marginBottom: Math.round(8 * SPACING_SCALE),
  },
  sectionHeaderCenter: {
    fontSize: fs(18),
    fontWeight: '700',
    color: colors.text,
    marginBottom: Math.round(8 * SPACING_SCALE),
    textAlign: 'center',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Math.round(8 * SPACING_SCALE),
  },

  /** ----- Cards (block style spacing baked in) ----- */
  card: {
    width: '100%',
    padding: Math.round(16 * SPACING_SCALE),
    borderRadius: Math.round(12 * SPACING_SCALE),
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: Math.round(16 * SPACING_SCALE),
  },

  cardUnified: {
    width: '100%',
    maxWidth: MAX_WIDTH,
    alignSelf: 'center',
    padding: Math.round(16 * SPACING_SCALE),
    borderRadius: Math.round(12 * SPACING_SCALE),
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: Math.round(16 * SPACING_SCALE),
  },

  /** ----- Typography ----- */
  text: { color: colors.text, fontSize: fs(14) },
  textMuted: { color: colors.muted, fontSize: fs(14) },

  textSm: { color: colors.text, fontSize: fs(14), lineHeight: lh(18) },
  textMd: { color: colors.text, fontSize: fs(16), lineHeight: lh(20) },
  textLg: { color: colors.text, fontSize: fs(18), lineHeight: lh(22) },
  textXl: {
    color: colors.text,
    fontSize: fs(24),
    lineHeight: lh(28),
    fontWeight: '700',
  },

  /** ----- Buttons ----- */
  btn: {
    paddingVertical: Math.round(12 * SPACING_SCALE),
    paddingHorizontal: Math.round(16 * SPACING_SCALE),
    borderRadius: Math.round(12 * SPACING_SCALE),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  btnPrimary: { backgroundColor: colors.blue },
  btnDanger: { backgroundColor: colors.red },
  btnLabel: {
    color: '#fff',
    fontSize: fs(18), // consistent with textLg scale
    lineHeight: lh(22), // matches shared.textLg rhythm
    fontWeight: '700', // heavier for clarity
    textAlign: 'center',
  },

  /** ----- Lists ----- */
  listContent: {
    paddingHorizontal: GUTTER,
    paddingBottom: Math.round(40 * SPACING_SCALE),
    alignSelf: 'center',
    width: '100%',
    maxWidth: MAX_WIDTH,
    gap: Math.round(16 * SPACING_SCALE),
  },

  scrollContent: {
    paddingHorizontal: GUTTER,
    paddingBottom: Math.round(40 * SPACING_SCALE),
    width: '100%',
    maxWidth: MAX_WIDTH,
    alignSelf: 'center',
  },

  empty: {
    textAlign: 'center',
    color: colors.muted,
    fontSize: fs(14),
    marginTop: Math.round(18 * SPACING_SCALE),
  },

  bottomSpacer: { height: Math.round(20 * SPACING_SCALE) },
});

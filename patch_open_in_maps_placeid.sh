set -euo pipefail

echo "▶️ Updating lib/models.ts (add googlePlaceId)…"
python3 - "$PWD/lib/models.ts" <<'PY'
import sys, re, pathlib
p = pathlib.Path(sys.argv[1])
s = p.read_text()
if 'googlePlaceId?' not in s:
    s = re.sub(r'(address\?: string;)', r"\1\n  googlePlaceId?: string;", s)
p.write_text(s)
print("models.ts patched")
PY

echo "▶️ Patching app/(app)/providers.tsx (prefer Place ID, then query)…"
cat > "app/(app)/providers.tsx" <<'EOF'
import * as React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Linking, Platform } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAllProviders, getFavorites, toggleFavorite } from '../../lib/firestore';
import type { Provider } from '../../lib/models';
import { auth } from '../../lib/firebase';
import { FilterBar, type Option } from '../../components/FilterBar';

function encode(s?: string) { return encodeURIComponent(s ?? ''); }

/**
 * Open the provider in the user's maps app.
 * Preference order (best to good):
 * 1) Google Maps placeId (deep links directly to official listing)
 * 2) Text query (name + address/city/country) so Google resolves the listing
 * 3) Coordinates as a last resort
 */
async function openInMaps(p: Provider) {
  const hasCoords = typeof p.lat === 'number' && typeof p.lng === 'number';
  const queryParts = [p.name, p.address, p.city, p.country].filter(Boolean).join(' ');
  const q = encode(queryParts);

  // If we have a Google Place ID, use it
  if (p.googlePlaceId) {
    const placeId = encode(p.googlePlaceId);
    const googleHttp = `https://www.google.com/maps/search/?api=1&query=${q || encode(p.name)}&query_place_id=${placeId}`;
    // If Google Maps app is available, prefer it
    const googleApp = `comgooglemaps://?q=${q || encode(p.name)}&zoom=16`;
    const canGoogle = await Linking.canOpenURL('comgooglemaps://');
    if (canGoogle) return Linking.openURL(googleApp);
    return Linking.openURL(googleHttp);
  }

  // Otherwise prefer a search query (lets Google select the POI)
  if (q) {
    const googleHttp = `https://www.google.com/maps/search/?api=1&query=${q}`;
    const googleApp = `comgooglemaps://?q=${q}&zoom=16`;
    const canGoogle = await Linking.canOpenURL('comgooglemaps://');
    if (canGoogle) return Linking.openURL(googleApp);
    // On iOS, we can also hint Apple Maps with name & coords
    if (Platform.OS === 'ios' && hasCoords) {
      return Linking.openURL(`http://maps.apple.com/?q=${q}&ll=${p.lat},${p.lng}`);
    }
    return Linking.openURL(googleHttp);
  }

  // Last resort: raw coordinates (will be a dropped pin)
  if (hasCoords) {
    if (Platform.OS === 'android') {
      return Linking.openURL(`geo:${p.lat},${p.lng}?q=${p.lat},${p.lng}(${encode(p.name)})`);
    } else {
      return Linking.openURL(`http://maps.apple.com/?ll=${p.lat},${p.lng}&q=${encode(p.name)}`);
    }
  }
}

export default function Providers() {
  const qc = useQueryClient();

  const providersQ = useQuery<Provider[]>({
    queryKey: ['providers'],
    queryFn: getAllProviders,
  });

  const favsQ = useQuery<Set<string>>({
    queryKey: ['favorites', auth.currentUser?.uid ?? 'anon'],
    queryFn: getFavorites,
    enabled: !!auth.currentUser,
    initialData: new Set(),
  });

  const [billing, setBilling] = React.useState<string | null>(null);
  const [country, setCountry] = React.useState<string | null>(null);

  const billingOptions: Option[] = [
    { label: 'Direct', value: 'direct' },
    { label: 'Reimb.', value: 'reimbursement' },
  ];

  const countries = React.useMemo(() => {
    const s = new Set<string>();
    providersQ.data?.forEach(p => s.add(p.country));
    const order = ['TH','PH','VN','KH','MY','ID','SG'];
    const found = Array.from(s);
    found.sort((a,b) => order.indexOf(a) - order.indexOf(b));
    return found;
  }, [providersQ.data]);

  const countryOptions: Option[] = countries.map(c => ({ label: c, value: c }));

  const filtered = React.useMemo(() => {
    let list = providersQ.data ?? [];
    if (billing) list = list.filter(p => p.billingType === billing);
    if (country) list = list.filter(p => p.country === country);
    return list;
  }, [providersQ.data, billing, country]);

  const onToggleFav = async (id: string) => {
    try {
      await toggleFavorite(id);
      await qc.invalidateQueries({ queryKey: ['favorites', auth.currentUser?.uid ?? 'anon'] });
    } catch (e) {
      console.warn('toggleFavorite error:', e);
    }
  };

  if (providersQ.isLoading) return <Centered text="Loading providers…" />;
  if (providersQ.error) {
    return <Centered text={'Error: ' + String((providersQ.error as any)?.message || providersQ.error)} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏥 Providers</Text>

      <FilterBar label="Billing" options={billingOptions} value={billing} onChange={setBilling} />
      <FilterBar label="Country" options={countryOptions} value={country} onChange={setCountry} />

      <FlatList
        data={filtered}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ paddingVertical: 8 }}
        renderItem={({ item }) => {
          const isFav = favsQ.data?.has(item.id);
          return (
            <View style={styles.card}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>
                {item.city ? item.city + ', ' : ''}{item.country} · {item.regionTag ?? '—'} · {item.billingType}
              </Text>
              <View style={styles.row}>
                <Pressable style={styles.badge} onPress={() => openInMaps(item)}>
                  <Text style={styles.badgeText}>Open in Maps</Text>
                </Pressable>
                <Pressable style={[styles.badge, isFav && styles.badgeActive]} onPress={() => onToggleFav(item.id)}>
                  <Text style={[styles.badgeText, isFav && styles.badgeActiveText]}>{isFav ? '★ Favorite' : '☆ Favorite'}</Text>
                </Pressable>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={<Centered text="No providers match these filters." />}
      />
    </View>
  );
}

function Centered({ text }: { text: string }) {
  return <View style={styles.center}><Text style={{ opacity: 0.7 }}>{text}</Text></View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  card: { padding: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: '#ddd', borderRadius: 12, marginBottom: 10, backgroundColor: '#fff' },
  name: { fontSize: 16, fontWeight: '700' },
  meta: { marginTop: 4, opacity: 0.7 },
  row: { flexDirection: 'row', gap: 10, marginTop: 8, flexWrap: 'wrap' },
  badge: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, backgroundColor: '#f0f7fa' },
  badgeText: { color: '#0a7ea4', fontWeight: '700' },
  badgeActive: { backgroundColor: '#0a7ea4' },
  badgeActiveText: { color: '#fff' },
});
EOF

echo "▶️ Optionally add googlePlaceId to any seed rows (kept as-is for now)."
echo "✅ Patch complete. Save & reload your app."

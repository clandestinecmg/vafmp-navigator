set -euo pipefail

echo "▶️ Update lib/models.ts (add googleMapsUrl)…"
python3 - "$PWD/lib/models.ts" <<'PY'
import sys, re, pathlib
p = pathlib.Path(sys.argv[1])
s = p.read_text()
if 'googleMapsUrl?' not in s:
    s = s.replace('googlePlaceId?: string;', 'googlePlaceId?: string;\n  googleMapsUrl?: string;')
p.write_text(s)
print("models.ts patched")
PY

echo "▶️ Ensure updateProvider exists in lib/firestore.ts…"
python3 - "$PWD/lib/firestore.ts" <<'PY'
import sys, re, pathlib
p = pathlib.Path(sys.argv[1])
s = p.read_text()
if 'updateDoc' not in s:
    s = s.replace("import { collection, doc, getDocs, setDoc, getDoc, deleteDoc } from 'firebase/firestore';",
                  "import { collection, doc, getDocs, setDoc, getDoc, deleteDoc, updateDoc } from 'firebase/firestore';")
if 'export async function updateProvider(' not in s:
    s += """

export async function updateProvider(id: string, data: Partial<Provider>): Promise<void> {
  const ref = doc(collection(db, 'providers'), id);
  await updateDoc(ref, data as any);
}
"""
p.write_text(s)
print("firestore.ts patched")
PY

echo "▶️ Replace app/(app)/providers.tsx (alerts + url fallback)…"
cat > "app/(app)/providers.tsx" <<'EOF'
import * as React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Linking, Platform, TextInput, Alert } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAllProviders, getFavorites, toggleFavorite, updateProvider } from '../../lib/firestore';
import type { Provider } from '../../lib/models';
import { auth } from '../../lib/firebase';
import { FilterBar, type Option } from '../../components/FilterBar';

function encode(s?: string) { return encodeURIComponent(s ?? ''); }

// Try to extract a Google Place ID from either a raw ID or a Google Maps URL.
function extractPlaceId(input: string): string | null {
  const raw = (input || '').trim();

  // Looks like a raw place ID?
  if (/^Ch[A-Za-z0-9_-]{8,}$/.test(raw)) return raw;

  // Try URL patterns
  try {
    const url = new URL(raw);
    const params = url.searchParams;

    // Common params
    for (const key of ['query_place_id', 'place_id', 'placeid', 'ftid']) {
      const v = params.get(key);
      if (v && /^Ch[A-Za-z0-9_-]{8,}$/.test(v)) return v;
    }

    // Fallback: pattern like ...!1s<placeid>!...
    // This is best-effort and may catch false positives.
    const m = raw.match(/!1s(Ch[A-Za-z0-9_-]{8,})!/);
    if (m && m[1]) return m[1];
  } catch {
    // not a URL
  }

  return null;
}

/** Open in Maps: googlePlaceId > googleMapsUrl > name query > coords */
async function openInMaps(p: Provider) {
  const hasCoords = typeof p.lat === 'number' && typeof p.lng === 'number';
  const queryParts = [p.name, p.address, p.city, p.country].filter(Boolean).join(' ');
  const q = encode(queryParts) || encode(p.name);

  if (p.googlePlaceId) {
    const placeId = encode(p.googlePlaceId);
    const googleHttp = `https://www.google.com/maps/search/?api=1&query=${q}&query_place_id=${placeId}`;
    const googleApp = `comgooglemaps://?q=${q}&zoom=16`;
    const canGoogle = await Linking.canOpenURL('comgooglemaps://');
    if (canGoogle) return Linking.openURL(googleApp);
    return Linking.openURL(googleHttp);
  }

  if (p.googleMapsUrl) {
    // Directly open the saved official URL
    return Linking.openURL(p.googleMapsUrl);
  }

  if (q) {
    const googleHttp = `https://www.google.com/maps/search/?api=1&query=${q}`;
    const googleApp = `comgooglemaps://?q=${q}&zoom=16`;
    const canGoogle = await Linking.canOpenURL('comgooglemaps://');
    if (canGoogle) return Linking.openURL(googleApp);
    if (Platform.OS === 'ios' && hasCoords) {
      return Linking.openURL(`http://maps.apple.com/?q=${q}&ll=${p.lat},${p.lng}`);
    }
    return Linking.openURL(googleHttp);
  }

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

  // Admin inline editor (dev only)
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [placeIdDraft, setPlaceIdDraft] = React.useState<string>('');

  const startEdit = (p: Provider) => {
    setEditingId(p.id);
    setPlaceIdDraft(p.googlePlaceId ?? p.googleMapsUrl ?? '');
  };

  const savePlaceIdOrUrl = async (p: Provider) => {
    const val = (placeIdDraft || '').trim();
    if (!val) {
      Alert.alert('Paste required', 'Paste a Google Maps Place ID or URL.');
      return;
    }
    const parsed = extractPlaceId(val);
    try {
      if (parsed) {
        await updateProvider(p.id, { googlePlaceId: parsed, googleMapsUrl: null as any });
        Alert.alert('Saved', 'Linked to official Google listing via Place ID.');
      } else {
        // Fallback to storing URL if we can’t parse a place_id
        await updateProvider(p.id, { googleMapsUrl: val });
        Alert.alert('Saved', 'Stored Google Maps URL. Open in Maps will use this link.');
      }
      setEditingId(null);
      setPlaceIdDraft('');
      await qc.invalidateQueries({ queryKey: ['providers'] });
    } catch (e: any) {
      Alert.alert('Error', String(e?.message || e));
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
          const isEditing = editingId === item.id;

          return (
            <View style={styles.card}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>
                {item.city ? item.city + ', ' : ''}{item.country} · {item.regionTag ?? '—'} · {item.billingType}
              </Text>

              {__DEV__ && (
                <View style={{ marginTop: 8 }}>
                  {isEditing ? (
                    <View style={{ gap: 8 }}>
                      <TextInput
                        value={placeIdDraft}
                        onChangeText={setPlaceIdDraft}
                        placeholder="Paste Place ID or Google Maps URL"
                        style={styles.input}
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                      <View style={styles.row}>
                        <Pressable style={[styles.badge, styles.save]} onPress={() => savePlaceIdOrUrl(item)}>
                          <Text style={[styles.badgeText, styles.saveText]}>Save</Text>
                        </Pressable>
                        <Pressable style={styles.badge} onPress={() => { setEditingId(null); setPlaceIdDraft(''); }}>
                          <Text style={styles.badgeText}>Cancel</Text>
                        </Pressable>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.row}>
                      <Pressable style={styles.badge} onPress={() => openInMaps(item)}>
                        <Text style={styles.badgeText}>Open in Maps</Text>
                      </Pressable>
                      <Pressable style={[styles.badge, isFav && styles.badgeActive]} onPress={() => toggleFavorite(item.id)}>
                        <Text style={[styles.badgeText, isFav && styles.badgeActiveText]}>
                          {isFav ? '★ Favorite' : '☆ Favorite'}
                        </Text>
                      </Pressable>
                      <Pressable style={styles.badge} onPress={() => startEdit(item)}>
                        <Text style={styles.badgeText}>Set Place ID/URL</Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              )}

              {!__DEV__ && (
                <View style={styles.row}>
                  <Pressable style={styles.badge} onPress={() => openInMaps(item)}>
                    <Text style={styles.badgeText}>Open in Maps</Text>
                  </Pressable>
                  <Pressable style={[styles.badge, isFav && styles.badgeActive]} onPress={() => toggleFavorite(item.id)}>
                    <Text style={[styles.badgeText, isFav && styles.badgeActiveText]}>
                      {isFav ? '★ Favorite' : '☆ Favorite'}
                    </Text>
                  </Pressable>
                </View>
              )}
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
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10 },
  save: { backgroundColor: '#0a7ea4' },
  saveText: { color: '#fff' },
});
EOF

echo "✅ Patch applied. Reload the app and try again."

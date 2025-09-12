set -euo pipefail

echo "▶️ Creating components folder…"
mkdir -p components

echo "▶️ Writing components/FilterBar.tsx…"
cat > components/FilterBar.tsx <<'EOF'
import * as React from 'react';
import { View, Pressable, Text, StyleSheet, ScrollView } from 'react-native';

export type Option = { label: string; value: string };
type Props = {
  label?: string;
  options: Option[];
  value: string | null;
  onChange: (v: string | null) => void;
};

function Chip({ active, children, onPress }: { active?: boolean; children: React.ReactNode; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{children}</Text>
    </Pressable>
  );
}

export function FilterBar({ label, options, value, onChange }: Props) {
  return (
    <View style={styles.wrap}>
      {!!label && <Text style={styles.label}>{label}</Text>}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        <Chip active={!value} onPress={() => onChange(null)}>All</Chip>
        {options.map(o => (
          <Chip key={o.value} active={value === o.value} onPress={() => onChange(o.value)}>
            {o.label}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 8 },
  label: { fontWeight: '700', marginBottom: 6 },
  row: { gap: 8, paddingRight: 8 },
  chip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, backgroundColor: '#f0f7fa' },
  chipActive: { backgroundColor: '#0a7ea4' },
  chipText: { color: '#0a7ea4', fontWeight: '700' },
  chipTextActive: { color: '#fff' },
});
EOF

echo "▶️ Patching app/(app)/providers.tsx…"
cat > "app/(app)/providers.tsx" <<'EOF'
import * as React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Linking, Platform } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAllProviders, getFavorites, toggleFavorite } from '../../lib/firestore';
import type { Provider } from '../../lib/models';
import { auth } from '../../lib/firebase';
import { FilterBar, type Option } from '../../components/FilterBar';

function openInMaps(p: Provider) {
  const hasCoords = typeof p.lat === 'number' && typeof p.lng === 'number';
  if (hasCoords) {
    const coordLabel = encodeURIComponent(p.name);
    if (Platform.OS === 'android') {
      Linking.openURL(`geo:${p.lat},${p.lng}?q=${p.lat},${p.lng}(${coordLabel})`);
    } else {
      Linking.openURL(`http://maps.apple.com/?ll=${p.lat},${p.lng}&q=${coordLabel}`);
    }
  } else {
    const q = encodeURIComponent([p.name, p.city, p.country].filter(Boolean).join(' '));
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${q}`);
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
    // Order common SEA codes
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

echo "✅ Patch written. Restart Expo or just reload."

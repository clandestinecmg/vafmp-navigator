set -euo pipefail

echo "▶️ Ensuring folders exist…"
mkdir -p "lib" "seed" "app/(dev)" "app/(app)"

echo "▶️ Writing lib/models.ts…"
cat > lib/models.ts <<'EOF'
export type BillingType = 'direct' | 'reimbursement';

export interface Provider {
  id: string;
  name: string;
  country: 'TH' | 'PH' | 'VN' | 'KH' | 'MY' | 'ID' | 'SG';
  city?: string;
  regionTag?: string; // e.g., 'Bangkok', 'Chiang Mai', 'HCMC'
  billingType: BillingType; // 'direct' or 'reimbursement'
  lat?: number;
  lng?: number;
  phone?: string;
  website?: string;
  address?: string;
}
EOF

echo "▶️ Writing lib/firestore.ts…"
cat > lib/firestore.ts <<'EOF'
import { collection, doc, getDocs, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import type { Provider } from './models';

export async function getAllProviders(): Promise<Provider[]> {
  const snap = await getDocs(collection(db, 'providers'));
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Provider, 'id'>) }));
}

export async function setProviders(providers: Provider[]) {
  const col = collection(db, 'providers');
  await Promise.all(
    providers.map((p) => {
      const { id, ...rest } = p;
      return setDoc(doc(col, id), rest);
    })
  );
}

export async function getFavorites(): Promise<Set<string>> {
  const u = auth.currentUser;
  if (!u) return new Set();
  const snap = await getDocs(collection(db, 'users', u.uid, 'favorites'));
  return new Set(snap.docs.map((d) => d.id));
}

export async function toggleFavorite(providerId: string): Promise<void> {
  const u = auth.currentUser;
  if (!u) throw new Error('Not signed in');
  const favRef = doc(db, 'users', u.uid, 'favorites', providerId);
  const curr = await getDoc(favRef);
  if (curr.exists()) await deleteDoc(favRef);
  else await setDoc(favRef, { createdAt: Date.now() });
}
EOF

echo "▶️ Writing seed/providers.seed.json…"
cat > seed/providers.seed.json <<'EOF'
[
  {
    "id": "th_bkk_bumrungrad",
    "name": "Bumrungrad International Hospital",
    "country": "TH",
    "city": "Bangkok",
    "regionTag": "Bangkok",
    "billingType": "direct",
    "lat": 13.7473,
    "lng": 100.5530,
    "phone": "+66 2011 2222",
    "website": "https://www.bumrungrad.com",
    "address": "33 Sukhumvit 3, Khlong Toei Nuea, Watthana, Bangkok"
  },
  {
    "id": "ph_mnl_stlukes_bgc",
    "name": "St. Luke's Medical Center - BGC",
    "country": "PH",
    "city": "Taguig",
    "regionTag": "Metro Manila",
    "billingType": "reimbursement",
    "lat": 14.5536,
    "lng": 121.0497,
    "phone": "+63 2 8789 7700",
    "website": "https://www.stlukes.com.ph",
    "address": "Rizal Drive cor. 32nd St and 5th Ave, Taguig"
  },
  {
    "id": "vn_hcmc_vinmec",
    "name": "Vinmec Central Park International Hospital",
    "country": "VN",
    "city": "Ho Chi Minh City",
    "regionTag": "HCMC",
    "billingType": "direct",
    "lat": 10.8010,
    "lng": 106.7150,
    "phone": "+84 28 3622 1166",
    "website": "https://www.vinmec.com",
    "address": "208 Nguyen Huu Canh, Ward 22, Binh Thanh District"
  },
  {
    "id": "kh_pnh_royal_phnom_penh",
    "name": "Royal Phnom Penh Hospital",
    "country": "KH",
    "city": "Phnom Penh",
    "regionTag": "Phnom Penh",
    "billingType": "reimbursement",
    "lat": 11.5683,
    "lng": 104.9229,
    "phone": "+855 23 991 000",
    "website": "https://www.royalphnompenhhospital.com",
    "address": "No. 888 Russian Federation Blvd (110), Phnom Penh"
  }
]
EOF

echo "▶️ Writing app/(dev)/seedProviders.tsx…"
cat > "app/(dev)/seedProviders.tsx" <<'EOF'
import * as React from 'react';
import { View, Text, Pressable, StyleSheet, Alert, ScrollView } from 'react-native';
// Use require to avoid TS JSON module config
const seed: any[] = require('../../seed/providers.seed.json');
import { setProviders } from '../../lib/firestore';
import { auth } from '../../lib/firebase';

export default function SeedProviders() {
  const [busy, setBusy] = React.useState(false);

  const onSeed = async () => {
    try {
      if (!auth.currentUser) {
        Alert.alert('Sign in required', 'Please sign in (anonymous) first.');
        return;
      }
      setBusy(true);
      await setProviders(seed as any);
      Alert.alert('Seeded', \`Wrote \${seed.length} providers to Firestore\`);
    } catch (e: any) {
      Alert.alert('Error', String(e?.message || e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Seed Providers (DEV)</Text>
      <Text style={styles.subtitle}>Records to write: {seed.length}</Text>
      <Pressable style={[styles.button, busy && styles.disabled]} disabled={busy} onPress={onSeed}>
        <Text style={styles.buttonText}>{busy ? 'Seeding…' : 'Write to Firestore'}</Text>
      </Pressable>
      <Text style={styles.note}>This screen won’t ship in production.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '700' },
  subtitle: { marginTop: 8, opacity: 0.8 },
  button: { marginTop: 20, backgroundColor: '#0a7ea4', paddingVertical: 14, paddingHorizontal: 18, borderRadius: 12 },
  buttonText: { color: '#fff', fontWeight: '700' },
  disabled: { opacity: 0.6 },
  note: { marginTop: 10, opacity: 0.6, fontSize: 12, textAlign: 'center' },
});
EOF

echo "▶️ Writing app/(app)/providers.tsx…"
cat > "app/(app)/providers.tsx" <<'EOF'
import * as React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAllProviders, getFavorites, toggleFavorite } from '../../lib/firestore';
import type { Provider } from '../../lib/models';
import { auth } from '../../lib/firebase';

export default function Providers() {
  const qc = useQueryClient();

  const providersQ = useQuery<Provider[]>({
    queryKey: ['providers'],
    queryFn: getAllProviders,
  });

  const favsQ = useQuery<Set<string>>({
    queryKey: ['favorites', auth.currentUser?.uid ?? 'anon'],
    queryFn: getFavorites,
    enabled: !!auth.currentUser, // only after sign-in
    initialData: new Set(),
  });

  const onToggleFav = async (id: string) => {
    try {
      await toggleFavorite(id);
      await qc.invalidateQueries({ queryKey: ['favorites', auth.currentUser?.uid ?? 'anon'] });
    } catch (e) {
      console.warn('toggleFavorite error:', e);
    }
  };

  if (providersQ.isLoading) {
    return <Centered text="Loading providers…" />;
  }
  if (providersQ.error) {
    return <Centered text={'Error: ' + String((providersQ.error as any)?.message || providersQ.error)} />;
  }

  const data = providersQ.data ?? [];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏥 Providers</Text>
      <FlatList
        data={data}
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
                <Pressable style={styles.badge}><Text style={styles.badgeText}>Details</Text></Pressable>
                <Pressable style={[styles.badge, isFav && styles.badgeActive]} onPress={() => onToggleFav(item.id)}>
                  <Text style={[styles.badgeText, isFav && styles.badgeActiveText]}>{isFav ? '★ Favorite' : '☆ Favorite'}</Text>
                </Pressable>
              </View>
            </View>
          );
        }}
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
  row: { flexDirection: 'row', gap: 10, marginTop: 8 },
  badge: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, backgroundColor: '#f0f7fa' },
  badgeText: { color: '#0a7ea4', fontWeight: '700' },
  badgeActive: { backgroundColor: '#0a7ea4' },
  badgeActiveText: { color: '#fff' },
});
EOF

echo "▶️ Writing app/_layout.tsx (stable Screens + dev tabs)…"
cat > app/_layout.tsx <<'EOF'
import { Tabs } from 'expo-router';
import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';

const queryClient = new QueryClient();

export default function RootLayout() {
  const [isAuthed, setIsAuthed] = React.useState(false);

  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setIsAuthed(!!u);
    });
    return () => unsub();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Tabs screenOptions={{ headerShown: false }}>
        <Tabs.Screen
          name="(auth)/login"
          options={{ title: 'Login', href: isAuthed ? null : undefined }}
        />
        <Tabs.Screen
          name="(app)/home"
          options={{ title: 'Home', href: isAuthed ? undefined : null }}
        />
        <Tabs.Screen
          name="(app)/providers"
          options={{ title: 'Providers', href: isAuthed ? undefined : null }}
        />
        {__DEV__ && (
          <>
            <Tabs.Screen name="(dev)/debugAuth" options={{ title: 'Debug' }} />
            <Tabs.Screen name="(dev)/seedProviders" options={{ title: 'Seed' }} />
          </>
        )}
      </Tabs>
    </QueryClientProvider>
  );
}
EOF

echo "▶️ Clearing Metro/watchman caches…"
watchman watch-del-all 2>/dev/null || true
rm -rf "$TMPDIR"/metro-* "$TMPDIR"/haste-map-* node_modules/.cache 2>/dev/null || true

echo "✅ Done. Now start Expo:"
echo "   npx expo start -c"

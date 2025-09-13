// app/(dev)/debugAuth.tsx
import * as React from 'react';
import { View, Text, Pressable } from 'react-native';
import { shared } from '../../styles/shared';

// ✅ Import from our wrapper instead of 'firebase/auth'
import {
  auth,
  onAuthStateChanged,
  signInAnonymously,
  signOut,
  type User,
} from '../../lib/authApi';

export default function DebugAuth() {
  const [user, setUser] = React.useState<User | null>(auth.currentUser);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return unsubscribe;
  }, []);

  return (
    <View style={shared.screen}>
      <View style={shared.safePad} />
      <Text style={shared.title}>🔧 Debug Auth</Text>
      <Text style={shared.text}>UID: {user?.uid ?? '—'}</Text>

      <View style={{ flexDirection: 'row', gap: 12, padding: 16 }}>
        <Pressable onPress={() => signInAnonymously(auth)} style={shared.pill}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>Anon sign-in</Text>
        </Pressable>
        <Pressable onPress={() => signOut(auth)} style={shared.pill}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>Sign out</Text>
        </Pressable>
      </View>
    </View>
  );
}
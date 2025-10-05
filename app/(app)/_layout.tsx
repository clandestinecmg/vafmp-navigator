// app/(app)/_layout.tsx
import * as React from 'react';
import { Tabs, useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Platform, ToastAndroid, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../styles/shared';
import { auth, onAuthStateChanged, type User } from '../../lib/authApi';

function notifySignInRequired(): void {
  const msg = 'Sign in to use this feature.';
  if (Platform.OS === 'android') {
    ToastAndroid.show(msg, ToastAndroid.SHORT);
  } else {
    Alert.alert('Sign in required', msg);
  }
}

export default function AppTabsLayout(): React.ReactElement {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [user, setUser] = React.useState<User | null>(auth.currentUser);

  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return () => unsub();
  }, []);

  const guard =
    (fromPath: string) =>
    (e: { preventDefault: () => void }): void => {
      if (!user) {
        e.preventDefault();
        notifySignInRequired();
        router.push({ pathname: '/(auth)/signin', params: { from: fromPath } });
      }
    };

  // dynamic bottom padding for gesture/nav bars
  const bottomPad = Math.max(insets.bottom, 10);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.muted,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: colors.bg,
          borderTopColor: colors.border,
          minHeight: 56,
          paddingTop: 6,
          paddingBottom: bottomPad,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '700' },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="crisis"
        options={{
          title: 'Crisis',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="health-and-safety" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="providers"
        listeners={{ tabPress: guard('/(app)/providers') }}
        options={{
          title: 'Providers',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="local-hospital" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="favorites"
        listeners={{ tabPress: guard('/(app)/favorites') }}
        options={{
          title: 'Favorites',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="star" size={size} color={color} />
          ),
        }}
      />

      {/* If you DON'T have app/(app)/resources.tsx, delete this screen to avoid warnings */}
      <Tabs.Screen
        name="resources"
        options={{
          title: 'Resources',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="menu-book" size={size} color={color} />
          ),
        }}
      />

      {/* If you DON'T have app/(app)/profile.tsx, delete this. */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="badge" size={size} color={color} />
          ),
        }}
      />

      {/* If you DON'T have app/(app)/debug.tsx, delete this. */}
      <Tabs.Screen
        name="debug"
        options={{
          title: 'Debug',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="bug-report" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

// app/_layout.tsx
import * as React from 'react';
import { Tabs } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { colors } from '../styles/shared';

const queryClient = new QueryClient();

function FontWarmup() {
  return <MaterialIcons name="check" size={0.001} color="transparent" />;
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <FontWarmup />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.gold,
          tabBarInactiveTintColor: colors.muted,
          tabBarStyle: {
            backgroundColor: colors.bg,
            borderTopColor: colors.border,
            height: 60,
            paddingTop: 6,
          },
          tabBarLabelStyle: { fontSize: 12, fontWeight: '700' },
        }}
      >
        {/* main tabs */}
        <Tabs.Screen
          name="(app)/home"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="home" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="(app)/providers"
          options={{
            title: 'Providers',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="local-hospital" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="(app)/favorites"
          options={{
            title: 'Favorites',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="star" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="(app)/resources"
          options={{
            title: 'Resources',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="menu-book" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="(app)/profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="badge" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="(app)/crisis"
          options={{
            title: 'Crisis',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons
                name="health-and-safety"
                size={size}
                color={color}
              />
            ),
          }}
        />
        {/* hide non-tab routes so they don't appear in the bar */}
        <Tabs.Screen name="index" options={{ href: null }} />
        <Tabs.Screen name="error" options={{ href: null }} />
        <Tabs.Screen name="(auth)/login" options={{ href: null }} />
      </Tabs>
    </QueryClientProvider>
  );
}

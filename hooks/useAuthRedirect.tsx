// hooks/useAuthRedirect.tsx
import * as React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from './useAuth';

export function useAuthRedirect() {
  const { user, initializing } = useAuth();
  const { from } = useLocalSearchParams<{ from?: string }>();
  const router = useRouter();

  React.useEffect(() => {
    if (!initializing && user) {
      router.replace(typeof from === 'string' && from ? from : '/(app)/home');
    }
  }, [initializing, user, from, router]);

  return { user, initializing };
}

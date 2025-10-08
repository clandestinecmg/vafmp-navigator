// app/index.tsx
import { Redirect } from 'expo-router';
import { useAuth } from '../hooks/useAuth';

export default function Index() {
  const { user } = useAuth();
  return <Redirect href={user ? '/(app)/home' : '/(auth)/login'} />;
}

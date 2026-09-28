import { useAuth } from '@clerk/expo';
import { Redirect, Stack } from 'expo-router';

export default function ProtectedLayout() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) return null;
  if (!isSignedIn) return <Redirect href="/(auth)/sign-in" />;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="generate" />
      <Stack.Screen name="gallery" />
      <Stack.Screen name="model/[id]" />
    </Stack>
  );
}

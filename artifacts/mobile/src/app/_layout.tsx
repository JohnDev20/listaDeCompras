import { Stack } from 'expo-router';
import { useAuthStore } from '@/store';
import React from 'react';

export default function RootLayout() {
  const { token } = useAuthStore();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
      }}
    >
      {token ? (
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      ) : (
        <Stack.Screen name="auth" options={{ headerShown: false }} />
      )}
    </Stack>
  );
}

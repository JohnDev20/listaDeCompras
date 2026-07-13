import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store';
import { colors } from '@/constants/theme';

export default function SplashScreen() {
  const router = useRouter();
  const { token, initialize } = useAuthStore();

  useEffect(() => {
    const checkAuth = async () => {
      await initialize();
      
      // Simulate splash screen delay
      setTimeout(() => {
        if (token) {
          router.replace('/(tabs)');
        } else {
          router.replace('/auth/login');
        }
      }, 1500);
    };

    checkAuth();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.light.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.light.background,
  },
});

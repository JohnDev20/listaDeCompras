import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store';
import { authAPI, setAuthToken } from '@/services/api';
import { Button } from '@/components/Button';
import { TextInputField } from '@/components/TextInputField';
import { colors, spacing, typography } from '@/constants/theme';
import { Text, TouchableOpacity } from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const { setToken, setUser } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Erro', 'Email e senha são obrigatórios');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.login(email, password);
      const { token, user } = response.data.data;

      setToken(token);
      setUser(user);
      setAuthToken(token);

      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert(
        'Erro ao fazer login',
        error.response?.data?.error || 'Verifique suas credenciais'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Lista de Compras</Text>
        <Text style={styles.subtitle}>Organize suas compras com facilidade</Text>
      </View>

      {/* Form */}
      <View style={styles.formContainer}>
        <TextInputField
          label="Email"
          placeholder="seu@email.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <TextInputField
          label="Senha"
          placeholder="Sua senha"
          value={password}
          onChangeText={setPassword}
        />

        <View style={styles.buttonContainer}>
          <Button
            label={loading ? 'Entrando...' : 'Entrar'}
            onPress={handleLogin}
            disabled={loading}
          />
        </View>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>ou</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity onPress={() => router.push('/auth/register')}>
          <Text style={styles.registerLink}>
            Não tem conta? <Text style={styles.registerLinkBold}>Crie uma agora</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  contentContainer: {
    padding: spacing.lg,
    justifyContent: 'center',
    minHeight: '100%',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.light.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.light.textSecondary,
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: colors.light.surface,
    borderRadius: 12,
    padding: spacing.lg,
  },
  buttonContainer: {
    marginTop: spacing.lg,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.light.border,
  },
  dividerText: {
    ...typography.bodySm,
    color: colors.light.textSecondary,
    marginHorizontal: spacing.md,
  },
  registerLink: {
    ...typography.body,
    color: colors.light.textSecondary,
    textAlign: 'center',
  },
  registerLinkBold: {
    color: colors.light.primary,
    fontWeight: '700',
  },
});

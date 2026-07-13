import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store';
import { authAPI, setAuthToken } from '@/services/api';
import { Button } from '@/components/Button';
import { TextInputField } from '@/components/TextInputField';
import { colors, spacing, typography } from '@/constants/theme';
import { Text, TouchableOpacity } from 'react-native';

export default function RegisterScreen() {
  const router = useRouter();
  const { setToken, setUser } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Erro', 'Todos os campos são obrigatórios');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não conferem');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Erro', 'A senha deve ter no mínimo 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.register(email, password, name);
      const { token, user } = response.data.data;

      setToken(token);
      setUser(user);
      setAuthToken(token);

      Alert.alert('Sucesso', 'Conta criada com sucesso!');
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert(
        'Erro ao criar conta',
        error.response?.data?.error || 'Tente novamente'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Criar Conta</Text>
        <Text style={styles.subtitle}>Organize suas compras com facilidade</Text>
      </View>

      {/* Form */}
      <View style={styles.formContainer}>
        <TextInputField
          label="Nome"
          placeholder="Seu nome completo"
          value={name}
          onChangeText={setName}
        />

        <TextInputField
          label="Email"
          placeholder="seu@email.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <TextInputField
          label="Senha"
          placeholder="Crie uma senha"
          value={password}
          onChangeText={setPassword}
        />

        <TextInputField
          label="Confirmar Senha"
          placeholder="Confirme sua senha"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <View style={styles.buttonContainer}>
          <Button
            label={loading ? 'Criando conta...' : 'Criar Conta'}
            onPress={handleRegister}
            disabled={loading}
          />
        </View>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>ou</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity onPress={() => router.push('/auth/login')}>
          <Text style={styles.loginLink}>
            Já tem conta? <Text style={styles.loginLinkBold}>Faça login</Text>
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
  loginLink: {
    ...typography.body,
    color: colors.light.textSecondary,
    textAlign: 'center',
  },
  loginLinkBold: {
    color: colors.light.primary,
    fontWeight: '700',
  },
});

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useAuthStore } from '@/store';
import { useRouter } from 'expo-router';
import { Button } from '@/components/Button';
import { colors, spacing, typography } from '@/constants/theme';
import { Text, Switch, TouchableOpacity } from 'react-native';

export default function SettingsScreen() {
  const router = useRouter();
  const { logout, user } = useAuthStore();
  const { isDarkMode, toggleDarkMode } = useAuthStore();
  const [exportLoading, setExportLoading] = useState(false);

  const handleLogout = () => {
    Alert.alert('Sair', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: () => {
          logout();
          router.replace('/auth/login');
        },
      },
    ]);
  };

  const handleExport = async () => {
    setExportLoading(true);
    try {
      // Call export API
      Alert.alert('Sucesso', 'Dados exportados com sucesso!');
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao exportar dados');
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* User Info */}
      <View style={styles.userSection}>
        <View style={styles.userAvatar}>
          <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() || 'U'}</Text>
        </View>
        <View>
          <Text style={styles.userName}>{user?.name || 'Usuário'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>
      </View>

      {/* Theme */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Aparência</Text>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Tema Escuro</Text>
          <Switch
            value={isDarkMode}
            onValueChange={toggleDarkMode}
            trackColor={{ false: colors.light.border, true: colors.light.primary }}
          />
        </View>
      </View>

      {/* Data Management */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dados</Text>
        <TouchableOpacity
          style={styles.settingButton}
          onPress={handleExport}
          disabled={exportLoading}
        >
          <Text style={styles.settingButtonText}>Exportar Dados (ZIP)</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingButton}>
          <Text style={styles.settingButtonText}>Importar Dados</Text>
        </TouchableOpacity>
      </View>

      {/* Account */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Conta</Text>
        <TouchableOpacity
          style={[styles.settingButton, styles.dangerButton]}
          onPress={handleLogout}
        >
          <Text style={[styles.settingButtonText, styles.dangerText]}>Sair</Text>
        </TouchableOpacity>
      </View>

      {/* About */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sobre</Text>
        <Text style={styles.aboutText}>Lista de Compras v1.0.0</Text>
        <Text style={styles.aboutText}>© 2026 JohnDev</Text>
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
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.light.surface,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  userAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  avatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  userName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.light.text,
  },
  userEmail: {
    ...typography.bodySm,
    color: colors.light.textSecondary,
    marginTop: spacing.xs,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.light.text,
    marginBottom: spacing.md,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.light.surface,
    borderRadius: 8,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  settingLabel: {
    ...typography.body,
    color: colors.light.text,
  },
  settingButton: {
    backgroundColor: colors.light.surface,
    borderRadius: 8,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  settingButtonText: {
    ...typography.body,
    color: colors.light.primary,
    fontWeight: '600',
  },
  dangerButton: {
    backgroundColor: '#fee2e2',
  },
  dangerText: {
    color: colors.light.danger,
  },
  aboutText: {
    ...typography.bodySm,
    color: colors.light.textSecondary,
    marginBottom: spacing.sm,
  },
});

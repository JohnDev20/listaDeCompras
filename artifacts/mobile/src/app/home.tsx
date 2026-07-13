import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, FlatList, Text, TouchableOpacity } from 'react-native';
import { useShoppingLists } from '@/services/api';
import { useRouter } from 'expo-router';
import { Button } from '@/components/Button';
import { colors, spacing, typography } from '@/constants/theme';
import { Plus, Settings } from 'lucide-react-native';

interface ListItem {
  id: string;
  name: string;
  status: 'active' | 'completed' | 'archived';
  products: any[];
  estimatedTotal: string;
  createdAt: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const { data: lists = [], isLoading } = useShoppingLists();

  const activeLists = lists.filter((list: ListItem) => list.status === 'active');
  const completedLists = lists.filter((list: ListItem) => list.status === 'completed');

  const renderListCard = (list: ListItem) => (
    <TouchableOpacity
      key={list.id}
      style={styles.listCard}
      onPress={() => router.push(`/lists/${list.id}`)}
    >
      <View style={styles.listCardHeader}>
        <Text style={styles.listCardTitle}>{list.name}</Text>
        <Text style={[styles.listCardStatus, list.status === 'completed' && styles.completedStatus]}>
          {list.status === 'active' ? 'Ativa' : 'Concluída'}
        </Text>
      </View>
      <View style={styles.listCardFooter}>
        <Text style={styles.listCardMeta}>
          {list.products?.length || 0} produtos
        </Text>
        {list.estimatedTotal && (
          <Text style={styles.listCardTotal}>
            R$ {list.estimatedTotal}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá!</Text>
          <Text style={styles.subtitle}>Suas listas de compras</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/settings')}>
          <Settings size={24} color={colors.light.primary} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Listas Ativas */}
        {activeLists.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Listas Ativas</Text>
            {activeLists.map(renderListCard)}
          </View>
        )}

        {/* Listas Concluídas */}
        {completedLists.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Concluídas</Text>
            {completedLists.map(renderListCard)}
          </View>
        )}

        {/* Empty State */}
        {lists.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Nenhuma lista criada</Text>
            <Text style={styles.emptySubtitle}>
              Comece criando sua primeira lista de compras
            </Text>
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/create-list')}
      >
        <Plus size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.light.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  greeting: {
    ...typography.h2,
    color: colors.light.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.bodySm,
    color: colors.light.textSecondary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.light.text,
    marginBottom: spacing.md,
  },
  listCard: {
    backgroundColor: colors.light.surface,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  listCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  listCardTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.light.text,
    flex: 1,
  },
  listCardStatus: {
    ...typography.caption,
    backgroundColor: colors.light.background,
    color: colors.light.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 4,
    fontWeight: '600',
  },
  completedStatus: {
    color: colors.light.success,
  },
  listCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listCardMeta: {
    ...typography.bodySm,
    color: colors.light.textSecondary,
  },
  listCardTotal: {
    ...typography.bodySm,
    fontWeight: '600',
    color: colors.light.success,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.light.text,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.light.textSecondary,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

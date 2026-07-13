import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, FlatList, Text, TouchableOpacity } from 'react-native';
import { useShoppingList, useDeleteShoppingList, useUpdateShoppingList } from '@/services/api';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from '@/components/Button';
import { ProductItem } from '@/components/ProductItem';
import { colors, spacing, typography } from '@/constants/theme';
import { Plus, Menu } from 'lucide-react-native';

export default function ShoppingListDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: list, isLoading } = useShoppingList(id || '');
  const deleteListMutation = useDeleteShoppingList();
  const updateListMutation = useUpdateShoppingList();
  const [showMenu, setShowMenu] = useState(false);

  const purchasedCount = list?.products?.filter((p: any) => p.isPurchased).length || 0;
  const totalCount = list?.products?.length || 0;
  const progressPercentage = totalCount > 0 ? (purchasedCount / totalCount) * 100 : 0;

  const handleTogglePurchased = async (productId: string) => {
    const product = list?.products?.find((p: any) => p.id === productId);
    if (product) {
      try {
        await updateListMutation.mutateAsync({
          id: id || '',
          data: {
            products: list.products.map((p: any) =>
              p.id === productId ? { ...p, isPurchased: !p.isPurchased } : p
            ),
          },
        });
      } catch (error: any) {
        Alert.alert('Erro', 'Erro ao atualizar produto');
      }
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    Alert.alert('Confirmar', 'Deseja deletar este produto?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Deletar',
        style: 'destructive',
        onPress: async () => {
          // Delete product logic would go here
        },
      },
    ]);
  };

  const handleDeleteList = async () => {
    Alert.alert('Confirmar', 'Deseja deletar esta lista?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Deletar',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteListMutation.mutateAsync(id || '');
            router.back();
          } catch (error: any) {
            Alert.alert('Erro', 'Erro ao deletar lista');
          }
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header com progresso */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{list?.name}</Text>
          <TouchableOpacity onPress={() => setShowMenu(!showMenu)}>
            <Menu size={24} color={colors.light.primary} />
          </TouchableOpacity>
        </View>

        {showMenu && (
          <View style={styles.menu}>
            <TouchableOpacity style={styles.menuItem} onPress={() => router.push(`/lists/${id}/edit`)}>
              <Text style={styles.menuItemText}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleDeleteList}>
              <Text style={[styles.menuItemText, styles.dangerText]}>Deletar</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min(progressPercentage, 100)}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {purchasedCount} de {totalCount} produtos comprados
          </Text>
        </View>

        {list?.estimatedTotal && (
          <View style={styles.totalsContainer}>
            <View style={styles.totalItem}>
              <Text style={styles.totalLabel}>Estimado:</Text>
              <Text style={styles.totalValue}>R$ {list.estimatedTotal}</Text>
            </View>
            {list?.actualTotal && (
              <View style={styles.totalItem}>
                <Text style={styles.totalLabel}>Gasto:</Text>
                <Text style={styles.totalValue}>R$ {list.actualTotal}</Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Lista de produtos */}
      <FlatList
        data={list?.products || []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProductItem
            id={item.id}
            name={item.name}
            quantity={item.quantity}
            unit={item.unit}
            category={item.category?.name || 'Outros'}
            brand={item.brand}
            price={item.actualPrice || item.estimatedPrice}
            isPurchased={item.isPurchased}
            onTogglePurchased={handleTogglePurchased}
            onEdit={() => router.push(`/products/${item.id}/edit`)}
            onDelete={handleDeleteProduct}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhum produto adicionado</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />

      {/* Botão flutuante */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push(`/lists/${id}/add-product`)}
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
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: colors.light.surface,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h2,
    color: colors.light.text,
    flex: 1,
  },
  menu: {
    backgroundColor: colors.light.background,
    borderRadius: 8,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  menuItem: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  menuItemText: {
    ...typography.body,
    color: colors.light.text,
  },
  dangerText: {
    color: colors.light.danger,
    fontWeight: '600',
  },
  progressContainer: {
    marginBottom: spacing.md,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.light.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.light.success,
  },
  progressText: {
    ...typography.bodySm,
    color: colors.light.textSecondary,
  },
  totalsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.light.background,
    borderRadius: 8,
    padding: spacing.md,
  },
  totalItem: {
    flex: 1,
  },
  totalLabel: {
    ...typography.caption,
    color: colors.light.textSecondary,
    marginBottom: spacing.xs,
  },
  totalValue: {
    ...typography.h3,
    color: colors.light.primary,
    fontWeight: '700',
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
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

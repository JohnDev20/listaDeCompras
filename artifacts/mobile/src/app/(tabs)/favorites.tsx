import React from 'react';
import { View, StyleSheet, ScrollView, FlatList, Text, TouchableOpacity } from 'react-native';
import { useFavorites, useAddFavorite } from '@/services/api';
import { colors, spacing, typography } from '@/constants/theme';
import { Star } from 'lucide-react-native';

interface FavoriteItem {
  id: string;
  productName: string;
  brand?: string;
  quantity: string;
  unit: string;
  category: any;
  lastUsedAt: string;
}

export default function FavoritesScreen() {
  const { data: favorites = [], isLoading } = useFavorites();

  const renderFavoriteItem = (item: FavoriteItem) => (
    <TouchableOpacity key={item.id} style={styles.favoriteCard}>
      <View style={styles.iconContainer}>
        <Star size={24} color={colors.light.warning} fill={colors.light.warning} />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.productName}>{item.productName}</Text>
        <View style={styles.cardMeta}>
          <Text style={styles.metaText}>
            {item.quantity} {item.unit}
          </Text>
          {item.brand && <Text style={styles.metaText}> • {item.brand}</Text>}
          {item.category && <Text style={styles.metaText}> • {item.category.name}</Text>}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Produtos Favoritos</Text>
        <Text style={styles.subtitle}>Seus produtos mais usados</Text>
      </View>

      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => renderFavoriteItem(item)}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Star size={48} color={colors.light.textSecondary} />
            <Text style={styles.emptyTitle}>Nenhum favorito ainda</Text>
            <Text style={styles.emptySubtitle}>
              Seus produtos mais usados aparecerão aqui
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  header: {
    backgroundColor: colors.light.surface,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  title: {
    ...typography.h2,
    color: colors.light.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.bodySm,
    color: colors.light.textSecondary,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  favoriteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.light.surface,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fef3c7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  cardContent: {
    flex: 1,
  },
  productName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.light.text,
    marginBottom: spacing.xs,
  },
  cardMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  metaText: {
    ...typography.caption,
    color: colors.light.textSecondary,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.light.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.light.textSecondary,
  },
});

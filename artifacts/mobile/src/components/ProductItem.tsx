import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@/constants/theme';
import { Trash2, MoreVertical } from 'lucide-react-native';

interface ProductItemProps {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  category: string;
  brand?: string;
  price?: string;
  isPurchased: boolean;
  onTogglePurchased: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const ProductItem: React.FC<ProductItemProps> = ({
  id,
  name,
  quantity,
  unit,
  category,
  brand,
  price,
  isPurchased,
  onTogglePurchased,
  onEdit,
  onDelete,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, isPurchased && styles.purchased]}
      onPress={() => onTogglePurchased(id)}
    >
      <View style={styles.checkbox}>
        {isPurchased && <Text style={styles.checkmark}>✓</Text>}
      </View>

      <View style={styles.content}>
        <Text style={[styles.name, isPurchased && styles.purchasedText]}>
          {name}
        </Text>
        <View style={styles.meta}>
          <Text style={styles.metaText}>
            {quantity} {unit}
          </Text>
          {brand && <Text style={styles.metaText}> • {brand}</Text>}
        </View>
      </View>

      {price && (
        <View style={styles.priceContainer}>
          <Text style={styles.price}>R$ {price}</Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => onDelete(id)}
      >
        <Trash2 size={18} color={colors.light.danger} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.light.surface,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  purchased: {
    backgroundColor: '#f0fdf4',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  checkmark: {
    color: colors.light.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  name: {
    ...typography.body,
    fontWeight: '600',
    color: colors.light.text,
  },
  purchasedText: {
    textDecorationLine: 'line-through',
    color: colors.light.textSecondary,
  },
  meta: {
    flexDirection: 'row',
    marginTop: spacing.xs,
  },
  metaText: {
    ...typography.caption,
    color: colors.light.textSecondary,
  },
  priceContainer: {
    marginHorizontal: spacing.md,
  },
  price: {
    ...typography.bodySm,
    fontWeight: '600',
    color: colors.light.success,
  },
  deleteButton: {
    padding: spacing.sm,
  },
});

import React, { useRef } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { useColors } from '@/hooks/useColors';
import type { ShoppingItem } from '@/types/shopping';
import { UNIT_LABELS } from '@/types/shopping';

interface ItemRowProps {
  item: ShoppingItem;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function ItemRow({ item, onToggle, onEdit, onDelete }: ItemRowProps) {
  const colors = useColors();
  const swipeableRef = useRef<React.ComponentRef<typeof Swipeable>>(null);

  const quantityLabel =
    item.quantity && item.quantity > 0
      ? `${formatQuantity(item.quantity)} ${UNIT_LABELS[item.unit]}`
      : null;

  const renderRightActions = () => (
    <View style={styles.deleteAction}>
      <Pressable
        style={[styles.deleteButton, { backgroundColor: colors.destructive }]}
        onPress={() => {
          swipeableRef.current?.close();
          onDelete();
        }}
        testID={`delete-item-${item.id}`}
      >
        <Feather name="trash-2" size={20} color={colors.destructiveForeground} />
      </Pressable>
    </View>
  );

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      friction={2}
      rightThreshold={40}
      overshootRight={false}
    >
      <View style={[styles.row, { backgroundColor: colors.card }]}>
        <Pressable
          onPress={() => {
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            onToggle();
          }}
          hitSlop={8}
          style={[
            styles.checkbox,
            {
              borderColor: item.checked ? colors.success : colors.border,
              backgroundColor: item.checked ? colors.success : 'transparent',
            },
          ]}
          testID={`toggle-item-${item.id}`}
        >
          {item.checked ? (
            <Feather name="check" size={14} color={colors.primaryForeground} />
          ) : null}
        </Pressable>

        <Pressable style={styles.content} onPress={onEdit}>
          <Text
            style={[
              styles.name,
              {
                color: item.checked ? colors.mutedForeground : colors.foreground,
                textDecorationLine: item.checked ? 'line-through' : 'none',
              },
            ]}
            numberOfLines={1}
          >
            {item.name}
          </Text>
          {(quantityLabel || item.note) ? (
            <Text
              style={[styles.subtitle, { color: colors.mutedForeground }]}
              numberOfLines={1}
            >
              {[quantityLabel, item.note].filter(Boolean).join(' · ')}
            </Text>
          ) : null}
        </Pressable>

        <Feather name="more-vertical" size={16} color={colors.mutedForeground} />
      </View>
    </Swipeable>
  );
}

function formatQuantity(quantity: number): string {
  return Number.isInteger(quantity) ? String(quantity) : quantity.toFixed(2);
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
  },
  subtitle: {
    fontSize: 12.5,
    fontFamily: 'Inter_400Regular',
  },
  deleteAction: {
    width: 64,
    alignItems: 'flex-end',
  },
  deleteButton: {
    width: 64,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

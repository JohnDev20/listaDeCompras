import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useCatalog } from '@/context/CatalogContext';
import type { ShoppingList } from '@/types/shopping';

interface ListCardProps {
  list: ShoppingList;
  onPress: () => void;
  onOpenMenu: () => void;
}

export function ListCard({ list, onPress, onOpenMenu }: ListCardProps) {
  const colors = useColors();
  const { getMarket } = useCatalog();
  const total = list.items.length;
  const done = list.items.filter((i) => i.checked).length;
  const progress = total > 0 ? done / total : 0;
  const market = getMarket(list.marketId);

  const metaParts = [
    total === 0 ? 'Lista vazia' : `${done} de ${total} ${total === 1 ? 'item' : 'itens'}`,
  ];
  if (market) metaParts.push(market.name);

  return (
    <Pressable
      onPress={() => {
        if (Platform.OS !== 'web') {
          Haptics.selectionAsync();
        }
        onPress();
      }}
      onLongPress={onOpenMenu}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
    >
      <View
        style={[styles.iconWrap, { backgroundColor: colors.secondary }]}
      >
        <Feather name="shopping-bag" size={20} color={colors.primary} />
      </View>

      <View style={styles.info}>
        <Text
          style={[styles.name, { color: colors.foreground }]}
          numberOfLines={1}
        >
          {list.name}
        </Text>
        <Text
          style={[styles.meta, { color: colors.mutedForeground }]}
          numberOfLines={1}
        >
          {metaParts.join(' · ')}
        </Text>
      </View>

      {total > 0 ? (
        <View style={styles.progressWrap}>
          <View style={[styles.progressTrack, { backgroundColor: colors.muted }]}>
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor:
                    progress === 1 ? colors.success : colors.primary,
                  width: `${Math.round(progress * 100)}%`,
                },
              ]}
            />
          </View>
        </View>
      ) : null}

      <Pressable
        onPress={onOpenMenu}
        hitSlop={10}
        style={styles.menuButton}
        testID={`list-menu-${list.id}`}
      >
        <Feather
          name="more-vertical"
          size={18}
          color={colors.mutedForeground}
        />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    gap: 12,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 3,
  },
  name: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  meta: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
  progressWrap: {
    width: 40,
  },
  progressTrack: {
    height: 5,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  menuButton: {
    padding: 4,
  },
});

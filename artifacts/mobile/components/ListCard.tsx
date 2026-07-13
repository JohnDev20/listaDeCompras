import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { useColors } from '@/hooks/useColors';
import type { ShoppingList } from '@/types/shopping';

interface ListCardProps {
  list: ShoppingList;
  onPress: () => void;
  onLongPress: () => void;
}

export function ListCard({ list, onPress, onLongPress }: ListCardProps) {
  const colors = useColors();
  const total = list.items.length;
  const done = list.items.filter((i) => i.checked).length;
  const progress = total > 0 ? done / total : 0;

  return (
    <Pressable
      onPress={() => {
        if (Platform.OS !== 'web') {
          Haptics.selectionAsync();
        }
        onPress();
      }}
      onLongPress={onLongPress}
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
        <Text style={[styles.meta, { color: colors.mutedForeground }]}>
          {total === 0
            ? 'Lista vazia'
            : `${done} de ${total} ${total === 1 ? 'item' : 'itens'}`}
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

      <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
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
    width: 46,
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
});

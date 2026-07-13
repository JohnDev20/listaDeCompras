import React, { useLayoutEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useShoppingLists } from '@/context/ShoppingListsContext';
import { useCatalog } from '@/context/CatalogContext';
import { ItemRow } from '@/components/ItemRow';
import { EmptyState } from '@/components/EmptyState';
import { buildShareText } from '@/utils/share';

export default function ListDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { getList, toggleItem, deleteItem, clearCheckedItems } =
    useShoppingLists();
  const { getMarket } = useCatalog();
  const [query, setQuery] = useState('');

  const list = getList(id);
  const market = getMarket(list?.marketId);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: list ? list.name : 'Lista',
      headerRight: () =>
        list ? (
          <View style={styles.headerActions}>
            <Pressable
              onPress={() =>
                router.push({ pathname: '/add-list', params: { listId: list.id } })
              }
              hitSlop={10}
            >
              <Feather name="edit-2" size={18} color={colors.primary} />
            </Pressable>
            <Pressable onPress={() => handleShare()} hitSlop={10}>
              <Feather name="share-2" size={20} color={colors.primary} />
            </Pressable>
          </View>
        ) : null,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation, list?.name, list?.items, list?.marketId]);

  const handleShare = async () => {
    if (!list) return;
    const message = buildShareText(list);
    if (Platform.OS === 'web') {
      Alert.alert('Compartilhar', message);
      return;
    }
    try {
      await Share.share({ message });
    } catch {
      // User dismissed the share sheet; nothing to do.
    }
  };

  const filteredItems = useMemo(() => {
    if (!list) return [];
    const items = query.trim()
      ? list.items.filter((item) =>
          item.name.toLowerCase().includes(query.trim().toLowerCase()),
        )
      : list.items;
    return [...items].sort((a, b) => {
      if (a.checked !== b.checked) return a.checked ? 1 : -1;
      return b.createdAt - a.createdAt;
    });
  }, [list, query]);

  if (!list) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <EmptyState
          icon="alert-circle"
          title="Lista não encontrada"
          subtitle="Essa lista pode ter sido excluída"
        />
      </View>
    );
  }

  const hasChecked = list.items.some((item) => item.checked);
  const totalCount = list.items.length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {market ? (
        <View style={styles.marketBadgeRow}>
          <View style={[styles.marketBadge, { backgroundColor: colors.secondary }]}>
            <Feather name="map-pin" size={12} color={colors.primary} />
            <Text style={[styles.marketBadgeText, { color: colors.foreground }]}>
              {market.name}
            </Text>
          </View>
        </View>
      ) : null}

      {totalCount > 0 ? (
        <View
          style={[
            styles.searchBar,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Feather name="search" size={17} color={colors.mutedForeground} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar itens"
            placeholderTextColor={colors.mutedForeground}
            style={[styles.searchInput, { color: colors.foreground }]}
            returnKeyType="search"
            autoCorrect={false}
          />
          {query.length > 0 ? (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <Feather name="x" size={17} color={colors.mutedForeground} />
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {totalCount === 0 ? (
        <EmptyState
          icon="shopping-cart"
          title="Lista vazia"
          subtitle="Toque no botão + para adicionar o primeiro item"
        />
      ) : filteredItems.length === 0 ? (
        <EmptyState
          icon="search"
          title="Nenhum item encontrado"
          subtitle={`Nenhum resultado para "${query}"`}
        />
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 96 },
          ]}
          renderItem={({ item }) => (
            <View
              style={[styles.rowWrap, { borderColor: colors.border }]}
            >
              <ItemRow
                item={item}
                onToggle={() => toggleItem(list.id, item.id)}
                onEdit={() =>
                  router.push({
                    pathname: '/add-item',
                    params: { listId: list.id, itemId: item.id },
                  })
                }
                onDelete={() => deleteItem(list.id, item.id)}
              />
            </View>
          )}
          scrollEnabled={filteredItems.length > 0}
        />
      )}

      {hasChecked ? (
        <Pressable
          onPress={() =>
            Alert.alert(
              'Limpar comprados',
              'Remover todos os itens já marcados como comprados?',
              [
                { text: 'Cancelar', style: 'cancel' },
                {
                  text: 'Remover',
                  style: 'destructive',
                  onPress: () => clearCheckedItems(list.id),
                },
              ],
            )
          }
          style={[
            styles.clearButton,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              bottom: insets.bottom + 92,
            },
          ]}
        >
          <Feather name="trash-2" size={14} color={colors.mutedForeground} />
          <Text style={[styles.clearButtonText, { color: colors.mutedForeground }]}>
            Limpar comprados
          </Text>
        </Pressable>
      ) : null}

      <Pressable
        onPress={() =>
          router.push({ pathname: '/add-item', params: { listId: list.id } })
        }
        style={[
          styles.fab,
          { backgroundColor: colors.primary, bottom: insets.bottom + 24 },
        ]}
        testID="add-item-button"
      >
        <Feather name="plus" size={26} color={colors.primaryForeground} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  marketBadgeRow: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  marketBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  marketBadgeText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
  },
  listContent: {
    paddingTop: 4,
  },
  rowWrap: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  clearButton: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
  },
  clearButtonText: {
    fontSize: 12.5,
    fontFamily: 'Inter_500Medium',
  },
});

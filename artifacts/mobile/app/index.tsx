import React, { useMemo, useState } from 'react';
import {
  ActionSheetIOS,
  Alert,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useShoppingLists } from '@/context/ShoppingListsContext';
import { ListCard } from '@/components/ListCard';
import { EmptyState } from '@/components/EmptyState';
import type { ShoppingList } from '@/types/shopping';

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { lists, isLoading, deleteList, duplicateList } = useShoppingLists();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return lists;
    const q = query.trim().toLowerCase();
    return lists.filter((l) => l.name.toLowerCase().includes(q));
  }, [lists, query]);

  const handleLongPress = (list: ShoppingList) => {
    const options = ['Renomear', 'Duplicar', 'Excluir', 'Cancelar'];
    const destructiveButtonIndex = 2;
    const cancelButtonIndex = 3;

    const handle = (index: number | undefined) => {
      if (index === 0) {
        router.push({ pathname: '/add-list', params: { listId: list.id } });
      } else if (index === 1) {
        duplicateList(list.id);
      } else if (index === destructiveButtonIndex) {
        Alert.alert(
          'Excluir lista',
          `Tem certeza que deseja excluir "${list.name}"?`,
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Excluir',
              style: 'destructive',
              onPress: () => deleteList(list.id),
            },
          ],
        );
      }
    };

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          destructiveButtonIndex,
          cancelButtonIndex,
        },
        handle,
      );
    } else {
      Alert.alert(list.name, undefined, [
        { text: 'Renomear', onPress: () => handle(0) },
        { text: 'Duplicar', onPress: () => handle(1) },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => handle(destructiveButtonIndex),
        },
        { text: 'Cancelar', style: 'cancel' },
      ]);
    }
  };

  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + 12 + webTopInset },
        ]}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>
          Minhas listas
        </Text>
        <Pressable
          onPress={() => router.push('/add-list')}
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          testID="create-list-button"
        >
          <Feather name="plus" size={22} color={colors.primaryForeground} />
        </Pressable>
      </View>

      {lists.length > 0 ? (
        <View
          style={[
            styles.searchBar,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Feather name="search" size={17} color={colors.mutedForeground} />
          <View style={styles.searchInputWrap}>
            <SearchInput
              value={query}
              onChangeText={setQuery}
              placeholder="Buscar listas"
              color={colors.foreground}
              placeholderColor={colors.mutedForeground}
            />
          </View>
          {query.length > 0 ? (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <Feather name="x" size={17} color={colors.mutedForeground} />
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {!isLoading && lists.length === 0 ? (
        <EmptyState
          icon="shopping-bag"
          title="Nenhuma lista ainda"
          subtitle="Toque no botão + para criar sua primeira lista de compras"
        />
      ) : !isLoading && filtered.length === 0 ? (
        <EmptyState
          icon="search"
          title="Nenhuma lista encontrada"
          subtitle={`Nenhum resultado para "${query}"`}
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 24 },
          ]}
          renderItem={({ item }) => (
            <ListCard
              list={item}
              onPress={() => router.push(`/list/${item.id}`)}
              onLongPress={() => handleLongPress(item)}
            />
          )}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          scrollEnabled={filtered.length > 0}
        />
      )}
    </View>
  );
}

function SearchInput({
  value,
  onChangeText,
  placeholder,
  color,
  placeholderColor,
}: {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  color: string;
  placeholderColor: string;
}) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={placeholderColor}
      style={{ fontSize: 15, fontFamily: 'Inter_400Regular', color }}
      returnKeyType="search"
      autoCorrect={false}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
  },
  addButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  searchInputWrap: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
  },
});

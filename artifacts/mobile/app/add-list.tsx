import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useShoppingLists } from '@/context/ShoppingListsContext';
import { useCatalog } from '@/context/CatalogContext';

export default function AddListScreen() {
  const { listId } = useLocalSearchParams<{ listId?: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { getList, createList, renameList } = useShoppingLists();
  const { markets, createMarket } = useCatalog();
  const existing = listId ? getList(listId) : undefined;
  const [name, setName] = useState(existing?.name ?? '');
  const [marketId, setMarketId] = useState<string | undefined>(
    existing?.marketId,
  );
  const [newMarketName, setNewMarketName] = useState('');
  const [addingMarket, setAddingMarket] = useState(false);

  const isEditing = Boolean(existing);

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (isEditing && existing) {
      renameList(existing.id, trimmed, marketId);
      router.back();
    } else {
      const created = createList(trimmed, marketId);
      router.back();
      router.push(`/list/${created.id}`);
    }
  };

  const handleCreateMarket = () => {
    const trimmed = newMarketName.trim();
    if (!trimmed) return;
    const market = createMarket(trimmed);
    setMarketId(market.id);
    setNewMarketName('');
    setAddingMarket(false);
  };

  return (
    <KeyboardAvoidingView
      behavior="padding"
      style={{ flex: 1 }}
      keyboardVerticalOffset={0}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.grabber}>
          <View
            style={[styles.grabberBar, { backgroundColor: colors.border }]}
          />
        </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.title, { color: colors.foreground }]}>
            {isEditing ? 'Editar lista' : 'Nova lista'}
          </Text>

          {isEditing && existing ? (
            <Text style={[styles.createdAt, { color: colors.mutedForeground }]}>
              Criada em {formatDate(existing.createdAt)}
            </Text>
          ) : null}

          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Ex: Compras da semana"
            placeholderTextColor={colors.mutedForeground}
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                color: colors.foreground,
              },
            ]}
            autoFocus={!isEditing}
            returnKeyType="done"
          />

          <Text style={[styles.label, { color: colors.mutedForeground }]}>
            Mercado
          </Text>
          <View style={styles.chipsRow}>
            <Pressable
              onPress={() => setMarketId(undefined)}
              style={[
                styles.chip,
                {
                  backgroundColor: !marketId ? colors.primary : colors.card,
                  borderColor: !marketId ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: !marketId ? colors.primaryForeground : colors.foreground },
                ]}
              >
                Sem mercado
              </Text>
            </Pressable>
            {markets.map((market) => {
              const selected = marketId === market.id;
              return (
                <Pressable
                  key={market.id}
                  onPress={() => setMarketId(market.id)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: selected ? colors.primary : colors.card,
                      borderColor: selected ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      {
                        color: selected
                          ? colors.primaryForeground
                          : colors.foreground,
                      },
                    ]}
                  >
                    {market.name}
                  </Text>
                </Pressable>
              );
            })}
            <Pressable
              onPress={() => setAddingMarket(true)}
              style={[
                styles.chip,
                styles.addChip,
                { borderColor: colors.border },
              ]}
            >
              <Feather name="plus" size={13} color={colors.mutedForeground} />
              <Text style={[styles.chipText, { color: colors.mutedForeground }]}>
                Novo
              </Text>
            </Pressable>
          </View>

          {addingMarket ? (
            <View style={styles.newMarketRow}>
              <TextInput
                value={newMarketName}
                onChangeText={setNewMarketName}
                placeholder="Nome do mercado"
                placeholderTextColor={colors.mutedForeground}
                style={[
                  styles.newMarketInput,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    color: colors.foreground,
                  },
                ]}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleCreateMarket}
              />
              <Pressable
                onPress={handleCreateMarket}
                style={[styles.newMarketButton, { backgroundColor: colors.primary }]}
              >
                <Feather name="check" size={17} color={colors.primaryForeground} />
              </Pressable>
            </View>
          ) : null}
        </ScrollView>

        <View style={[styles.actions, { paddingBottom: insets.bottom + 16 }]}>
          <Pressable
            onPress={() => router.back()}
            style={[styles.button, { backgroundColor: colors.secondary }]}
          >
            <Text style={[styles.buttonText, { color: colors.secondaryForeground }]}>
              Cancelar
            </Text>
          </Pressable>
          <Pressable
            onPress={handleSave}
            disabled={!name.trim()}
            style={[
              styles.button,
              {
                backgroundColor: colors.primary,
                opacity: name.trim() ? 1 : 0.5,
              },
            ]}
            testID="save-list-button"
          >
            <Text style={[styles.buttonText, { color: colors.primaryForeground }]}>
              Salvar
            </Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  grabber: {
    alignItems: 'center',
    paddingVertical: 8,
    display: Platform.OS === 'web' ? 'none' : 'flex',
  },
  grabberBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    marginTop: 8,
    marginBottom: 4,
  },
  createdAt: {
    fontSize: 12.5,
    fontFamily: 'Inter_400Regular',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    marginTop: 12,
  },
  label: {
    fontSize: 12.5,
    fontFamily: 'Inter_500Medium',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginTop: 20,
    marginBottom: 8,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
  },
  addChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'transparent',
    borderStyle: 'dashed',
  },
  chipText: {
    fontSize: 13.5,
    fontFamily: 'Inter_500Medium',
  },
  newMarketRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  newMarketInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14.5,
    fontFamily: 'Inter_400Regular',
  },
  newMarketButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
  },
});

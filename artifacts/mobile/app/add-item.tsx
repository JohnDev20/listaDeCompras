import React, { useState } from 'react';
import {
  Alert,
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
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { useColors } from '@/hooks/useColors';
import { useShoppingLists } from '@/context/ShoppingListsContext';
import type { ItemUnit } from '@/types/shopping';
import { UNIT_LABELS, UNIT_OPTIONS } from '@/types/shopping';

export default function AddItemScreen() {
  const { listId, itemId } = useLocalSearchParams<{
    listId: string;
    itemId?: string;
  }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { getList, addItem, updateItem, deleteItem } = useShoppingLists();

  const list = getList(listId);
  const existing = itemId
    ? list?.items.find((item) => item.id === itemId)
    : undefined;
  const isEditing = Boolean(existing);

  const [name, setName] = useState(existing?.name ?? '');
  const [quantity, setQuantity] = useState(existing?.quantity ?? 1);
  const [unit, setUnit] = useState<ItemUnit>(existing?.unit ?? 'un');
  const [note, setNote] = useState(existing?.note ?? '');

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed || !list) return;

    if (isEditing && existing) {
      updateItem(list.id, existing.id, {
        name: trimmed,
        quantity,
        unit,
        note,
      });
    } else {
      addItem(list.id, { name: trimmed, quantity, unit, note });
    }
    router.back();
  };

  const handleDelete = () => {
    if (!list || !existing) return;
    Alert.alert('Excluir item', `Remover "${existing.name}" da lista?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => {
          deleteItem(list.id, existing.id);
          router.back();
        },
      },
    ]);
  };

  const adjustQuantity = (delta: number) => {
    setQuantity((prev) => {
      const next = Math.round((prev + delta) * 100) / 100;
      return next < 0 ? 0 : next;
    });
  };

  if (!list) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.foreground }}>Lista não encontrada</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.grabber}>
        <View style={[styles.grabberBar, { backgroundColor: colors.border }]} />
      </View>

      <KeyboardAwareScrollViewCompat
        contentContainerStyle={styles.scrollContent}
        bottomOffset={40}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>
          {isEditing ? 'Editar item' : 'Novo item'}
        </Text>

        <Text style={[styles.label, { color: colors.mutedForeground }]}>
          Nome
        </Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Ex: Leite integral"
          placeholderTextColor={colors.mutedForeground}
          style={[
            styles.input,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              color: colors.foreground,
            },
          ]}
          autoFocus
        />

        <Text style={[styles.label, { color: colors.mutedForeground }]}>
          Quantidade
        </Text>
        <View style={styles.quantityRow}>
          <Pressable
            onPress={() => adjustQuantity(-1)}
            style={[styles.stepperButton, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Feather name="minus" size={18} color={colors.foreground} />
          </Pressable>
          <TextInput
            value={String(quantity)}
            onChangeText={(text) => {
              const parsed = Number(text.replace(',', '.'));
              setQuantity(Number.isNaN(parsed) ? 0 : parsed);
            }}
            keyboardType="decimal-pad"
            style={[
              styles.quantityInput,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                color: colors.foreground,
              },
            ]}
          />
          <Pressable
            onPress={() => adjustQuantity(1)}
            style={[styles.stepperButton, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Feather name="plus" size={18} color={colors.foreground} />
          </Pressable>
        </View>

        <Text style={[styles.label, { color: colors.mutedForeground }]}>
          Unidade
        </Text>
        <View style={styles.unitRow}>
          {UNIT_OPTIONS.map((option) => {
            const selected = option === unit;
            return (
              <Pressable
                key={option}
                onPress={() => setUnit(option)}
                style={[
                  styles.unitChip,
                  {
                    backgroundColor: selected ? colors.primary : colors.card,
                    borderColor: selected ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.unitChipText,
                    {
                      color: selected
                        ? colors.primaryForeground
                        : colors.foreground,
                    },
                  ]}
                >
                  {UNIT_LABELS[option]}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.label, { color: colors.mutedForeground }]}>
          Observações
        </Text>
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="Ex: marca específica, promoção..."
          placeholderTextColor={colors.mutedForeground}
          style={[
            styles.input,
            styles.noteInput,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              color: colors.foreground,
            },
          ]}
          multiline
        />

        {isEditing ? (
          <Pressable
            onPress={handleDelete}
            style={[styles.deleteRow]}
            testID="delete-item-action"
          >
            <Feather name="trash-2" size={16} color={colors.destructive} />
            <Text style={[styles.deleteText, { color: colors.destructive }]}>
              Excluir item
            </Text>
          </Pressable>
        ) : null}
      </KeyboardAwareScrollViewCompat>

      <View
        style={[
          styles.actions,
          { paddingBottom: insets.bottom + 16, borderTopColor: colors.border },
        ]}
      >
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
            { backgroundColor: colors.primary, opacity: name.trim() ? 1 : 0.5 },
          ]}
          testID="save-item-button"
        >
          <Text style={[styles.buttonText, { color: colors.primaryForeground }]}>
            Salvar
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  grabber: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  grabberBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 4,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    marginBottom: 16,
  },
  label: {
    fontSize: 12.5,
    fontFamily: 'Inter_500Medium',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
  noteInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepperButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  unitRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  unitChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
  },
  unitChipText: {
    fontSize: 13.5,
    fontFamily: 'Inter_500Medium',
  },
  deleteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
    alignSelf: 'center',
  },
  deleteText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
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

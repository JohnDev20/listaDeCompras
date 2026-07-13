import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useShoppingLists } from '@/context/ShoppingListsContext';

export default function AddListScreen() {
  const { listId } = useLocalSearchParams<{ listId?: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { getList, createList, renameList } = useShoppingLists();
  const existing = listId ? getList(listId) : undefined;
  const [name, setName] = useState(existing?.name ?? '');

  const isEditing = Boolean(existing);

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (isEditing && existing) {
      renameList(existing.id, trimmed);
      router.back();
    } else {
      const created = createList(trimmed);
      router.back();
      router.push(`/list/${created.id}`);
    }
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

        <Text style={[styles.title, { color: colors.foreground }]}>
          {isEditing ? 'Renomear lista' : 'Nova lista'}
        </Text>

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
          autoFocus
          returnKeyType="done"
          onSubmitEditing={handleSave}
        />

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
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
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

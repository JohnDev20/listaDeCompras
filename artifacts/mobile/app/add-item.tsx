import React, { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
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
import { useCatalog } from '@/context/CatalogContext';
import type { CategoryIcon, ItemUnit, Product } from '@/types/shopping';
import { CATEGORY_ICON_OPTIONS, UNIT_LABELS, UNIT_OPTIONS } from '@/types/shopping';

type Step = 'category' | 'form';

export default function AddItemScreen() {
  const { listId, itemId } = useLocalSearchParams<{
    listId: string;
    itemId?: string;
  }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { getList, addItem, updateItem, deleteItem } = useShoppingLists();
  const {
    categories,
    createCategory,
    getCategory,
    searchProducts,
    upsertProduct,
    recordPrice,
  } = useCatalog();

  const list = getList(listId);
  const existing = itemId
    ? list?.items.find((item) => item.id === itemId)
    : undefined;
  const isEditing = Boolean(existing);

  const [step, setStep] = useState<Step>(isEditing ? 'form' : 'category');
  const [categoryId, setCategoryId] = useState<string | undefined>(
    existing?.categoryId,
  );
  const [newCategoryName, setNewCategoryName] = useState('');
  const [pickerIcon, setPickerIcon] = useState<CategoryIcon>('package');

  const [name, setName] = useState(existing?.name ?? '');
  const [brand, setBrand] = useState(existing?.brand ?? '');
  const [quantity, setQuantity] = useState(existing?.quantity ?? 1);
  const [unit, setUnit] = useState<ItemUnit>(existing?.unit ?? 'un');
  const [note, setNote] = useState(existing?.note ?? '');
  const [price, setPrice] = useState(
    existing?.price ? String(existing.price) : '',
  );
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestions = useMemo(
    () => (showSuggestions ? searchProducts(name) : []),
    [showSuggestions, searchProducts, name],
  );

  const selectedCategory = getCategory(categoryId);

  const handlePickCategory = (id: string | undefined) => {
    setCategoryId(id);
    setStep('form');
  };

  const handleCreateCategory = () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    const category = createCategory(trimmed, pickerIcon);
    setNewCategoryName('');
    handlePickCategory(category.id);
  };

  const applyProduct = (product: Product) => {
    setName(product.name);
    setBrand(product.brand);
    setUnit(product.defaultUnit);
    if (product.categoryId) setCategoryId(product.categoryId);
    setShowSuggestions(false);
  };

  const handleSave = () => {
    const trimmedName = name.trim();
    if (!trimmedName || !list) return;

    const parsedPrice = price.trim()
      ? Number(price.replace(',', '.'))
      : undefined;
    const validPrice =
      parsedPrice !== undefined && !Number.isNaN(parsedPrice) && parsedPrice > 0
        ? parsedPrice
        : undefined;

    const product = upsertProduct({
      name: trimmedName,
      brand,
      categoryId,
      defaultUnit: unit,
    });

    const input = {
      name: trimmedName,
      quantity,
      unit,
      brand,
      note,
      categoryId,
      productId: product.id,
      price: validPrice,
    };

    if (isEditing && existing) {
      updateItem(list.id, existing.id, input);
    } else {
      addItem(list.id, input);
    }

    if (validPrice !== undefined && list.marketId) {
      recordPrice({
        productId: product.id,
        marketId: list.marketId,
        price: validPrice,
      });
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

  if (step === 'category') {
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
            Categoria do produto
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Escolha uma categoria para organizar seus itens
          </Text>

          <View style={styles.categoryGrid}>
            {categories.map((category) => (
              <Pressable
                key={category.id}
                onPress={() => handlePickCategory(category.id)}
                style={[
                  styles.categoryTile,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
                testID={`category-${category.id}`}
              >
                <View
                  style={[styles.categoryIconWrap, { backgroundColor: colors.secondary }]}
                >
                  <Feather name={category.icon} size={20} color={colors.primary} />
                </View>
                <Text
                  style={[styles.categoryTileText, { color: colors.foreground }]}
                  numberOfLines={1}
                >
                  {category.name}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.label, { color: colors.mutedForeground }]}>
            Nova categoria
          </Text>
          <View style={styles.iconRow}>
            {CATEGORY_ICON_OPTIONS.map((icon) => {
              const selected = pickerIcon === icon;
              return (
                <Pressable
                  key={icon}
                  onPress={() => setPickerIcon(icon)}
                  style={[
                    styles.iconChip,
                    {
                      backgroundColor: selected ? colors.primary : colors.card,
                      borderColor: selected ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Feather
                    name={icon}
                    size={16}
                    color={selected ? colors.primaryForeground : colors.foreground}
                  />
                </Pressable>
              );
            })}
          </View>
          <View style={styles.newCategoryRow}>
            <TextInput
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              placeholder="Ex: Congelados"
              placeholderTextColor={colors.mutedForeground}
              style={[
                styles.newCategoryInput,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  color: colors.foreground,
                },
              ]}
              returnKeyType="done"
              onSubmitEditing={handleCreateCategory}
            />
            <Pressable
              onPress={handleCreateCategory}
              disabled={!newCategoryName.trim()}
              style={[
                styles.newCategoryButton,
                {
                  backgroundColor: colors.primary,
                  opacity: newCategoryName.trim() ? 1 : 0.5,
                },
              ]}
            >
              <Feather name="check" size={17} color={colors.primaryForeground} />
            </Pressable>
          </View>
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
            onPress={() => handlePickCategory(undefined)}
            style={[styles.button, { backgroundColor: colors.primary }]}
            testID="skip-category-button"
          >
            <Text style={[styles.buttonText, { color: colors.primaryForeground }]}>
              Pular
            </Text>
          </Pressable>
        </View>
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
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formHeader}>
          <Text style={[styles.title, { color: colors.foreground }]}>
            {isEditing ? 'Editar item' : 'Novo item'}
          </Text>
          {!isEditing ? (
            <Pressable
              onPress={() => setStep('category')}
              style={[
                styles.categoryBadge,
                { backgroundColor: colors.secondary },
              ]}
            >
              <Feather
                name={selectedCategory?.icon ?? 'package'}
                size={13}
                color={colors.primary}
              />
              <Text style={[styles.categoryBadgeText, { color: colors.foreground }]}>
                {selectedCategory?.name ?? 'Sem categoria'}
              </Text>
              <Feather name="chevron-right" size={13} color={colors.mutedForeground} />
            </Pressable>
          ) : null}
        </View>

        <Text style={[styles.label, { color: colors.mutedForeground }]}>
          Nome
        </Text>
        <TextInput
          value={name}
          onChangeText={(text) => {
            setName(text);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
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
          autoFocus={!isEditing}
        />
        {suggestions.length > 0 ? (
          <View
            style={[
              styles.suggestionsBox,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            {suggestions.map((product) => (
              <Pressable
                key={product.id}
                onPress={() => applyProduct(product)}
                style={[styles.suggestionRow, { borderColor: colors.border }]}
                testID={`suggestion-${product.id}`}
              >
                <Feather name="clock" size={13} color={colors.mutedForeground} />
                <Text
                  style={[styles.suggestionText, { color: colors.foreground }]}
                  numberOfLines={1}
                >
                  {product.name}
                  {product.brand ? ` · ${product.brand}` : ''}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        <Text style={[styles.label, { color: colors.mutedForeground }]}>
          Marca
        </Text>
        <TextInput
          value={brand}
          onChangeText={setBrand}
          placeholder="Ex: Piracanjuba"
          placeholderTextColor={colors.mutedForeground}
          style={[
            styles.input,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              color: colors.foreground,
            },
          ]}
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
          Preço {list.marketId ? '' : '(opcional)'}
        </Text>
        <TextInput
          value={price}
          onChangeText={setPrice}
          placeholder="R$ 0,00"
          placeholderTextColor={colors.mutedForeground}
          keyboardType="decimal-pad"
          style={[
            styles.input,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              color: colors.foreground,
            },
          ]}
        />

        <Text style={[styles.label, { color: colors.mutedForeground }]}>
          Observações
        </Text>
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="Ex: promoção, embalagem grande..."
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
  },
  subtitle: {
    fontSize: 13.5,
    fontFamily: 'Inter_400Regular',
    marginTop: 4,
    marginBottom: 16,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  categoryBadgeText: {
    fontSize: 12.5,
    fontFamily: 'Inter_500Medium',
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
  suggestionsBox: {
    marginTop: 6,
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  suggestionText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    flex: 1,
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
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryTile: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 6,
  },
  categoryIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTileText: {
    fontSize: 11.5,
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
  },
  iconRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  iconChip: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newCategoryRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  newCategoryInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14.5,
    fontFamily: 'Inter_400Regular',
  },
  newCategoryButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
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

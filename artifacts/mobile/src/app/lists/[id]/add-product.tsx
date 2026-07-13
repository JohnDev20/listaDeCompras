import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCategories, useCreateProduct } from '@/services/api';
import { Button } from '@/components/Button';
import { TextInputField } from '@/components/TextInputField';
import { Picker } from '@/components/Picker';
import { colors, spacing } from '@/constants/theme';

const UNITS = [
  { label: 'Unidade', value: 'unidade' },
  { label: 'Quilograma (kg)', value: 'kg' },
  { label: 'Litro (l)', value: 'litro' },
  { label: 'Pacote', value: 'pacote' },
  { label: 'Caixa', value: 'caixa' },
  { label: 'Dúzia', value: 'duzia' },
];

export default function AddProductScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: categories = [] } = useCategories();
  const createProductMutation = useCreateProduct();

  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('unidade');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [brand, setBrand] = useState('');
  const [observations, setObservations] = useState('');
  const [estimatedPrice, setEstimatedPrice] = useState('');

  const handleAddProduct = async () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'Nome do produto é obrigatório');
      return;
    }

    if (!quantity.trim()) {
      Alert.alert('Erro', 'Quantidade é obrigatória');
      return;
    }

    if (!categoryId) {
      Alert.alert('Erro', 'Selecione uma categoria');
      return;
    }

    try {
      await createProductMutation.mutateAsync({
        shoppingListId: id,
        categoryId,
        name: name.trim(),
        quantity: parseFloat(quantity),
        unit,
        brand: brand.trim() || undefined,
        observations: observations.trim() || undefined,
        estimatedPrice: estimatedPrice ? parseFloat(estimatedPrice) : undefined,
      });

      Alert.alert('Sucesso', 'Produto adicionado com sucesso!');
      router.back();
    } catch (error: any) {
      Alert.alert('Erro', error.response?.data?.error || 'Erro ao adicionar produto');
    }
  };

  const categoryOptions = categories.map((cat: any) => ({
    label: cat.name,
    value: cat.id,
  }));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.formContainer}>
        <TextInputField
          label="Nome do Produto *"
          placeholder="Ex: Arroz, Leite"
          value={name}
          onChangeText={setName}
        />

        <TextInputField
          label="Quantidade *"
          placeholder="Ex: 2, 0.5"
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="decimal-pad"
        />

        <Picker
          label="Unidade *"
          options={UNITS}
          selectedValue={unit}
          onValueChange={(value) => setUnit(value as string)}
        />

        <Picker
          label="Categoria *"
          options={categoryOptions}
          selectedValue={categoryId}
          onValueChange={(value) => setCategoryId(value as string)}
          placeholder="Selecione uma categoria"
        />

        <TextInputField
          label="Marca (opcional)"
          placeholder="Ex: Marca do produto"
          value={brand}
          onChangeText={setBrand}
        />

        <TextInputField
          label="Observações (opcional)"
          placeholder="Ex: Sem glúten, Integral"
          value={observations}
          onChangeText={setObservations}
          multiline
          numberOfLines={2}
        />

        <TextInputField
          label="Preço Estimado (opcional)"
          placeholder="Ex: 10.50"
          value={estimatedPrice}
          onChangeText={setEstimatedPrice}
          keyboardType="decimal-pad"
        />

        <View style={styles.buttonContainer}>
          <Button
            label="Adicionar Produto"
            onPress={handleAddProduct}
            disabled={createProductMutation.isPending}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  contentContainer: {
    padding: spacing.lg,
  },
  formContainer: {
    backgroundColor: colors.light.surface,
    borderRadius: 12,
    padding: spacing.lg,
  },
  buttonContainer: {
    marginTop: spacing.lg,
  },
});

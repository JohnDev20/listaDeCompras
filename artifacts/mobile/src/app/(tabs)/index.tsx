import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useCreateShoppingList } from '@/services/api';
import { Button } from '@/components/Button';
import { TextInputField } from '@/components/TextInputField';
import { Picker } from '@/components/Picker';
import { useSupermarkets } from '@/services/api';
import { colors, spacing } from '@/constants/theme';
import { useRouter } from 'expo-router';

export default function CreateListScreen() {
  const router = useRouter();
  const { data: supermarkets = [] } = useSupermarkets();
  const createListMutation = useCreateShoppingList();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [supermarketId, setSupermarketId] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'Nome da lista é obrigatório');
      return;
    }

    try {
      await createListMutation.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
        supermarketId: supermarketId || undefined,
      });
      
      Alert.alert('Sucesso', 'Lista criada com sucesso!');
      router.back();
    } catch (error: any) {
      Alert.alert('Erro', error.response?.data?.error || 'Erro ao criar lista');
    }
  };

  const supermarketOptions = supermarkets.map((sm: any) => ({
    label: sm.name,
    value: sm.id,
  }));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.formContainer}>
        <TextInputField
          label="Nome da Lista"
          placeholder="Ex: Mercado, Farmácia"
          value={name}
          onChangeText={setName}
        />

        <TextInputField
          label="Descrição (opcional)"
          placeholder="Adicione uma descrição"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
        />

        <Picker
          label="Supermercado (opcional)"
          options={[
            { label: 'Nenhum', value: '' },
            ...supermarketOptions,
          ]}
          selectedValue={supermarketId}
          onValueChange={(value) => setSupermarketId(value as string)}
          placeholder="Selecione um supermercado"
        />

        <View style={styles.buttonContainer}>
          <Button
            label="Criar Lista"
            onPress={handleCreate}
            disabled={createListMutation.isPending}
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

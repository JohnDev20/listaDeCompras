import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useShoppingLists } from '@/context/ShoppingListsContext';
import { useCatalog } from '@/context/CatalogContext';
import {
  buildExportZip,
  mergeCatalogData,
  readImportZip,
  remapList,
  type ExportPayload,
} from '@/utils/dataTransfer';
import type { ShoppingList } from '@/types/shopping';

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { lists, mergeLists } = useShoppingLists();
  const catalog = useCatalog();

  const [selectedForExport, setSelectedForExport] = useState<Set<string>>(
    () => new Set(lists.map((l) => l.id)),
  );
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importPreview, setImportPreview] = useState<ExportPayload | null>(null);
  const [selectedForImport, setSelectedForImport] = useState<Set<string>>(
    new Set(),
  );

  const isWeb = Platform.OS === 'web';

  const toggleExportSelection = (id: string) => {
    setSelectedForExport((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleImportSelection = (id: string) => {
    setSelectedForImport((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleExport = async () => {
    if (isWeb) {
      Alert.alert(
        'Indisponível no navegador',
        'Exporte seus dados pelo aplicativo no celular.',
      );
      return;
    }
    const listsToExport = lists.filter((l) => selectedForExport.has(l.id));
    if (listsToExport.length === 0) {
      Alert.alert('Nenhuma lista selecionada', 'Selecione ao menos uma lista para exportar.');
      return;
    }
    setIsExporting(true);
    try {
      const payload: ExportPayload = {
        version: 1,
        exportedAt: Date.now(),
        lists: listsToExport,
        catalog: {
          categories: catalog.categories,
          markets: catalog.markets,
          products: catalog.products,
          priceEntries: catalog.priceEntries,
        },
      };
      const file = await buildExportZip(payload);
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(file.uri, {
          mimeType: 'application/zip',
          dialogTitle: 'Exportar dados da Lista de Compras',
        });
      } else {
        Alert.alert('Exportado', `Arquivo salvo em: ${file.uri}`);
      }
    } catch (error) {
      Alert.alert(
        'Erro ao exportar',
        error instanceof Error ? error.message : 'Tente novamente.',
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handlePickImportFile = async () => {
    if (isWeb) {
      Alert.alert(
        'Indisponível no navegador',
        'Importe seus dados pelo aplicativo no celular.',
      );
      return;
    }
    setIsImporting(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/zip', 'application/x-zip-compressed'],
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets?.[0]) return;
      const payload = await readImportZip(result.assets[0].uri);
      setImportPreview(payload);
      setSelectedForImport(new Set(payload.lists.map((l) => l.id)));
    } catch (error) {
      Alert.alert(
        'Erro ao importar',
        error instanceof Error
          ? error.message
          : 'Não foi possível ler o arquivo selecionado.',
      );
    } finally {
      setIsImporting(false);
    }
  };

  const handleConfirmImport = () => {
    if (!importPreview) return;
    const listsToImport = importPreview.lists.filter((l) =>
      selectedForImport.has(l.id),
    );
    if (listsToImport.length === 0) {
      Alert.alert('Nenhuma lista selecionada', 'Selecione ao menos uma lista para importar.');
      return;
    }

    const referencedCategoryIds = new Set<string>();
    const referencedMarketIds = new Set<string>();
    const referencedProductIds = new Set<string>();
    for (const list of listsToImport) {
      if (list.marketId) referencedMarketIds.add(list.marketId);
      for (const item of list.items) {
        if (item.categoryId) referencedCategoryIds.add(item.categoryId);
        if (item.productId) referencedProductIds.add(item.productId);
      }
    }
    const scopedCatalog = {
      categories: importPreview.catalog.categories.filter((c) =>
        referencedCategoryIds.has(c.id),
      ),
      markets: importPreview.catalog.markets.filter((m) =>
        referencedMarketIds.has(m.id),
      ),
      products: importPreview.catalog.products.filter((p) =>
        referencedProductIds.has(p.id),
      ),
      priceEntries: importPreview.catalog.priceEntries.filter((entry) =>
        referencedProductIds.has(entry.productId),
      ),
    };

    const maps = mergeCatalogData(scopedCatalog, {
      createCategory: catalog.createCategory,
      createMarket: catalog.createMarket,
      findProduct: catalog.findProduct,
      upsertProduct: catalog.upsertProduct,
      recordPrice: catalog.recordPrice,
    });

    const remapped: ShoppingList[] = listsToImport.map((list) =>
      remapList(list, maps),
    );
    mergeLists(remapped);
    setImportPreview(null);
    setSelectedForImport(new Set());
    Alert.alert(
      'Importação concluída',
      `${remapped.length} ${remapped.length === 1 ? 'lista importada' : 'listas importadas'} com sucesso.`,
    );
  };

  const exportCount = selectedForExport.size;

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.container,
        { paddingBottom: insets.bottom + 32 },
      ]}
    >
      <Section title="Exportar dados" colors={colors}>
        <Text style={[styles.helperText, { color: colors.mutedForeground }]}>
          Escolha as listas que deseja incluir no arquivo exportado (.zip).
          Categorias, mercados e histórico de preço são incluídos
          automaticamente.
        </Text>
        {lists.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            Você ainda não tem listas para exportar.
          </Text>
        ) : (
          <View style={styles.listGroup}>
            {lists.map((list) => (
              <Checkbox
                key={list.id}
                label={list.name}
                checked={selectedForExport.has(list.id)}
                onToggle={() => toggleExportSelection(list.id)}
                colors={colors}
              />
            ))}
          </View>
        )}
        <Pressable
          onPress={handleExport}
          disabled={isExporting || exportCount === 0}
          style={[
            styles.primaryButton,
            {
              backgroundColor: colors.primary,
              opacity: isExporting || exportCount === 0 ? 0.5 : 1,
            },
          ]}
          testID="export-data-button"
        >
          {isExporting ? (
            <ActivityIndicator color={colors.primaryForeground} />
          ) : (
            <>
              <Feather name="upload" size={16} color={colors.primaryForeground} />
              <Text style={[styles.primaryButtonText, { color: colors.primaryForeground }]}>
                Exportar {exportCount > 0 ? `(${exportCount})` : ''}
              </Text>
            </>
          )}
        </Pressable>
      </Section>

      <Section title="Importar dados" colors={colors}>
        <Text style={[styles.helperText, { color: colors.mutedForeground }]}>
          Selecione um arquivo .zip exportado anteriormente para restaurar ou
          mesclar listas.
        </Text>
        <Pressable
          onPress={handlePickImportFile}
          disabled={isImporting}
          style={[
            styles.secondaryButton,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
          testID="import-data-button"
        >
          {isImporting ? (
            <ActivityIndicator color={colors.foreground} />
          ) : (
            <>
              <Feather name="download" size={16} color={colors.foreground} />
              <Text style={[styles.secondaryButtonText, { color: colors.foreground }]}>
                Escolher arquivo .zip
              </Text>
            </>
          )}
        </Pressable>

        {importPreview ? (
          <View style={styles.importPreview}>
            <Text style={[styles.previewTitle, { color: colors.foreground }]}>
              {importPreview.lists.length}{' '}
              {importPreview.lists.length === 1
                ? 'lista encontrada'
                : 'listas encontradas'}
            </Text>
            <View style={styles.listGroup}>
              {importPreview.lists.map((list) => (
                <Checkbox
                  key={list.id}
                  label={`${list.name} (${list.items.length} itens)`}
                  checked={selectedForImport.has(list.id)}
                  onToggle={() => toggleImportSelection(list.id)}
                  colors={colors}
                />
              ))}
            </View>
            <View style={styles.importActions}>
              <Pressable
                onPress={() => {
                  setImportPreview(null);
                  setSelectedForImport(new Set());
                }}
                style={[styles.button, { backgroundColor: colors.secondary }]}
              >
                <Text style={[styles.buttonText, { color: colors.secondaryForeground }]}>
                  Cancelar
                </Text>
              </Pressable>
              <Pressable
                onPress={handleConfirmImport}
                style={[styles.button, { backgroundColor: colors.primary }]}
                testID="confirm-import-button"
              >
                <Text style={[styles.buttonText, { color: colors.primaryForeground }]}>
                  Importar
                </Text>
              </Pressable>
            </View>
          </View>
        ) : null}
      </Section>
    </ScrollView>
  );
}

function Section({
  title,
  colors,
  children,
}: {
  title: string;
  colors: ReturnType<typeof useColors>;
  children: React.ReactNode;
}) {
  return (
    <View
      style={[
        styles.section,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
        {title}
      </Text>
      {children}
    </View>
  );
}

function Checkbox({
  label,
  checked,
  onToggle,
  colors,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <Pressable onPress={onToggle} style={styles.checkboxRow}>
      <View
        style={[
          styles.checkboxBox,
          {
            borderColor: checked ? colors.primary : colors.border,
            backgroundColor: checked ? colors.primary : 'transparent',
          },
        ]}
      >
        {checked ? (
          <Feather name="check" size={12} color={colors.primaryForeground} />
        ) : null}
      </View>
      <Text
        style={[styles.checkboxLabel, { color: colors.foreground }]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 16,
  },
  section: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
  },
  helperText: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    lineHeight: 18,
  },
  emptyText: {
    fontSize: 13.5,
    fontFamily: 'Inter_400Regular',
  },
  listGroup: {
    gap: 10,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxLabel: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    flexShrink: 1,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 14,
  },
  primaryButtonText: {
    fontSize: 14.5,
    fontFamily: 'Inter_600SemiBold',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 14.5,
    fontFamily: 'Inter_600SemiBold',
  },
  importPreview: {
    marginTop: 4,
    gap: 12,
  },
  previewTitle: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  importActions: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
});

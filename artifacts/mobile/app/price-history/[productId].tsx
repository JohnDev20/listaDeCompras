import React, { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useCatalog } from '@/context/CatalogContext';
import { EmptyState } from '@/components/EmptyState';

export default function PriceHistoryScreen() {
  const { productId } = useLocalSearchParams<{ productId: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { getProduct, getMarket, getPriceHistory } = useCatalog();

  const product = getProduct(productId);
  const entries = useMemo(
    () => getPriceHistory(productId ?? ''),
    [getPriceHistory, productId],
  );

  const lowestPrice = useMemo(
    () => (entries.length > 0 ? Math.min(...entries.map((e) => e.price)) : null),
    [entries],
  );

  const bestByMarket = useMemo(() => {
    const map = new Map<string, number>();
    for (const entry of entries) {
      const current = map.get(entry.marketId);
      if (current === undefined || entry.price < current) {
        map.set(entry.marketId, entry.price);
      }
    }
    return Array.from(map.entries())
      .map(([marketId, price]) => ({ marketId, price }))
      .sort((a, b) => a.price - b.price);
  }, [entries]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>
          {product?.name ?? 'Produto'}
        </Text>
        {product?.brand ? (
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            {product.brand}
          </Text>
        ) : null}
      </View>

      {entries.length === 0 ? (
        <EmptyState
          icon="trending-up"
          title="Sem histórico de preço"
          subtitle="Adicione um preço ao registrar este item para começar a comparar"
        />
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 24 },
          ]}
          ListHeaderComponent={
            bestByMarket.length > 0 ? (
              <View style={styles.compareSection}>
                <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
                  Comparação por mercado
                </Text>
                {bestByMarket.map(({ marketId, price }) => {
                  const market = getMarket(marketId);
                  const isBest = price === lowestPrice;
                  return (
                    <View
                      key={marketId}
                      style={[
                        styles.compareRow,
                        {
                          backgroundColor: isBest ? colors.accent : colors.card,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <View style={styles.compareLeft}>
                        {isBest ? (
                          <Feather name="award" size={15} color={colors.accentForeground} />
                        ) : (
                          <Feather name="map-pin" size={15} color={colors.mutedForeground} />
                        )}
                        <Text
                          style={[
                            styles.compareMarket,
                            { color: isBest ? colors.accentForeground : colors.foreground },
                          ]}
                        >
                          {market?.name ?? 'Mercado desconhecido'}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.comparePrice,
                          { color: isBest ? colors.accentForeground : colors.foreground },
                        ]}
                      >
                        {formatCurrency(price)}
                      </Text>
                    </View>
                  );
                })}
                <Text style={[styles.sectionLabel, { color: colors.mutedForeground, marginTop: 20 }]}>
                  Todos os registros
                </Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => {
            const market = getMarket(item.marketId);
            const isLowest = item.price === lowestPrice;
            return (
              <View
                style={[
                  styles.entryRow,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <View style={styles.entryLeft}>
                  <Text style={[styles.entryMarket, { color: colors.foreground }]}>
                    {market?.name ?? 'Mercado desconhecido'}
                  </Text>
                  <Text style={[styles.entryDate, { color: colors.mutedForeground }]}>
                    {formatDate(item.date)}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.entryPrice,
                    { color: isLowest ? colors.success : colors.foreground },
                  ]}
                >
                  {formatCurrency(item.price)}
                </Text>
              </View>
            );
          }}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        />
      )}
    </View>
  );
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
  },
  subtitle: {
    fontSize: 13.5,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
  listContent: {
    paddingHorizontal: 20,
  },
  sectionLabel: {
    fontSize: 12.5,
    fontFamily: 'Inter_500Medium',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 8,
  },
  compareSection: {
    marginBottom: 4,
  },
  compareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  compareLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  compareMarket: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  comparePrice: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  entryLeft: {
    gap: 2,
  },
  entryMarket: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
  entryDate: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  entryPrice: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
  },
});

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  Category,
  CategoryIcon,
  ItemUnit,
  Market,
  PriceEntry,
  Product,
} from '@/types/shopping';
import { generateId } from '@/utils/id';

const STORAGE_KEY = 'lista-de-compras/catalog/v1';

interface CatalogData {
  categories: Category[];
  markets: Market[];
  products: Product[];
  priceEntries: PriceEntry[];
}

const DEFAULT_CATEGORIES: Array<{ name: string; icon: CategoryIcon }> = [
  { name: 'Hortifruti', icon: 'sun' },
  { name: 'Padaria', icon: 'coffee' },
  { name: 'Bebidas', icon: 'droplet' },
  { name: 'Limpeza', icon: 'feather' },
  { name: 'Higiene', icon: 'star' },
  { name: 'Mercearia', icon: 'package' },
];

function buildDefaultData(): CatalogData {
  const now = Date.now();
  return {
    categories: DEFAULT_CATEGORIES.map((c, index) => ({
      id: generateId(),
      name: c.name,
      icon: c.icon,
      createdAt: now + index,
    })),
    markets: [],
    products: [],
    priceEntries: [],
  };
}

interface CatalogContextValue {
  categories: Category[];
  markets: Market[];
  products: Product[];
  priceEntries: PriceEntry[];
  isLoading: boolean;
  getCategory: (id?: string) => Category | undefined;
  createCategory: (name: string, icon: CategoryIcon) => Category;
  deleteCategory: (id: string) => void;
  getMarket: (id?: string) => Market | undefined;
  createMarket: (name: string) => Market;
  renameMarket: (id: string, name: string) => void;
  deleteMarket: (id: string) => void;
  getProduct: (id?: string) => Product | undefined;
  findProduct: (name: string, brand: string) => Product | undefined;
  upsertProduct: (input: {
    name: string;
    brand: string;
    categoryId?: string;
    defaultUnit: ItemUnit;
  }) => Product;
  searchProducts: (query: string) => Product[];
  recordPrice: (input: {
    productId: string;
    marketId: string;
    price: number;
    date?: number;
  }) => void;
  getPriceHistory: (productId: string) => PriceEntry[];
  replaceAll: (data: Partial<CatalogData>) => void;
}

const CatalogContext = createContext<CatalogContextValue | null>(null);

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<CatalogData>({
    categories: [],
    markets: [],
    products: [],
    priceEntries: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!mounted) return;
        if (raw) {
          try {
            const parsed = JSON.parse(raw) as CatalogData;
            setData({
              categories: parsed.categories ?? [],
              markets: parsed.markets ?? [],
              products: parsed.products ?? [],
              priceEntries: parsed.priceEntries ?? [],
            });
          } catch {
            setData(buildDefaultData());
          }
        } else {
          setData(buildDefaultData());
        }
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const persist = useCallback((next: CatalogData) => {
    setData(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {
      // Best-effort persistence.
    });
  }, []);

  const getCategory = useCallback(
    (id?: string) => (id ? data.categories.find((c) => c.id === id) : undefined),
    [data.categories],
  );

  const createCategory = useCallback(
    (name: string, icon: CategoryIcon) => {
      const trimmed = name.trim();
      const existing = data.categories.find(
        (c) => c.name.toLowerCase() === trimmed.toLowerCase(),
      );
      if (existing) return existing;
      const category: Category = {
        id: generateId(),
        name: trimmed || 'Categoria',
        icon,
        createdAt: Date.now(),
      };
      persist({ ...data, categories: [...data.categories, category] });
      return category;
    },
    [data, persist],
  );

  const deleteCategory = useCallback(
    (id: string) => {
      persist({
        ...data,
        categories: data.categories.filter((c) => c.id !== id),
      });
    },
    [data, persist],
  );

  const getMarket = useCallback(
    (id?: string) => (id ? data.markets.find((m) => m.id === id) : undefined),
    [data.markets],
  );

  const createMarket = useCallback(
    (name: string) => {
      const trimmed = name.trim();
      const existing = data.markets.find(
        (m) => m.name.toLowerCase() === trimmed.toLowerCase(),
      );
      if (existing) return existing;
      const market: Market = {
        id: generateId(),
        name: trimmed || 'Mercado',
        createdAt: Date.now(),
      };
      persist({ ...data, markets: [...data.markets, market] });
      return market;
    },
    [data, persist],
  );

  const renameMarket = useCallback(
    (id: string, name: string) => {
      persist({
        ...data,
        markets: data.markets.map((m) =>
          m.id === id ? { ...m, name: name.trim() || m.name } : m,
        ),
      });
    },
    [data, persist],
  );

  const deleteMarket = useCallback(
    (id: string) => {
      persist({ ...data, markets: data.markets.filter((m) => m.id !== id) });
    },
    [data, persist],
  );

  const getProduct = useCallback(
    (id?: string) => (id ? data.products.find((p) => p.id === id) : undefined),
    [data.products],
  );

  const findProduct = useCallback(
    (name: string, brand: string) => {
      const n = name.trim().toLowerCase();
      const b = brand.trim().toLowerCase();
      return data.products.find(
        (p) => p.name.toLowerCase() === n && p.brand.toLowerCase() === b,
      );
    },
    [data.products],
  );

  const upsertProduct = useCallback(
    (input: {
      name: string;
      brand: string;
      categoryId?: string;
      defaultUnit: ItemUnit;
    }) => {
      const existing = findProduct(input.name, input.brand);
      if (existing) {
        const updated: Product = {
          ...existing,
          categoryId: input.categoryId ?? existing.categoryId,
          defaultUnit: input.defaultUnit,
        };
        persist({
          ...data,
          products: data.products.map((p) =>
            p.id === existing.id ? updated : p,
          ),
        });
        return updated;
      }
      const product: Product = {
        id: generateId(),
        name: input.name.trim(),
        brand: input.brand.trim(),
        categoryId: input.categoryId,
        defaultUnit: input.defaultUnit,
        createdAt: Date.now(),
      };
      persist({ ...data, products: [...data.products, product] });
      return product;
    },
    [data, findProduct, persist],
  );

  const searchProducts = useCallback(
    (query: string) => {
      const q = query.trim().toLowerCase();
      if (!q) return [];
      return data.products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.brand.toLowerCase().includes(q),
        )
        .slice(0, 8);
    },
    [data.products],
  );

  const recordPrice = useCallback(
    (input: {
      productId: string;
      marketId: string;
      price: number;
      date?: number;
    }) => {
      const entry: PriceEntry = {
        id: generateId(),
        productId: input.productId,
        marketId: input.marketId,
        price: input.price,
        date: input.date ?? Date.now(),
      };
      persist({ ...data, priceEntries: [entry, ...data.priceEntries] });
    },
    [data, persist],
  );

  const getPriceHistory = useCallback(
    (productId: string) =>
      data.priceEntries
        .filter((entry) => entry.productId === productId)
        .sort((a, b) => b.date - a.date),
    [data.priceEntries],
  );

  const replaceAll = useCallback(
    (partial: Partial<CatalogData>) => {
      persist({ ...data, ...partial });
    },
    [data, persist],
  );

  const value = useMemo<CatalogContextValue>(
    () => ({
      categories: data.categories,
      markets: data.markets,
      products: data.products,
      priceEntries: data.priceEntries,
      isLoading,
      getCategory,
      createCategory,
      deleteCategory,
      getMarket,
      createMarket,
      renameMarket,
      deleteMarket,
      getProduct,
      findProduct,
      upsertProduct,
      searchProducts,
      recordPrice,
      getPriceHistory,
      replaceAll,
    }),
    [
      data,
      isLoading,
      getCategory,
      createCategory,
      deleteCategory,
      getMarket,
      createMarket,
      renameMarket,
      deleteMarket,
      getProduct,
      findProduct,
      upsertProduct,
      searchProducts,
      recordPrice,
      getPriceHistory,
      replaceAll,
    ],
  );

  return (
    <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
  );
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) {
    throw new Error('useCatalog must be used within a CatalogProvider');
  }
  return ctx;
}

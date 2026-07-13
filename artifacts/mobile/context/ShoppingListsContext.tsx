import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ItemUnit, ShoppingItem, ShoppingList } from '@/types/shopping';
import { generateId } from '@/utils/id';

const STORAGE_KEY = 'lista-de-compras/lists/v1';

export interface ItemInput {
  name: string;
  quantity: number;
  unit: ItemUnit;
  brand: string;
  note: string;
  categoryId?: string;
  productId?: string;
  price?: number;
}

interface ShoppingListsContextValue {
  lists: ShoppingList[];
  isLoading: boolean;
  getList: (listId: string) => ShoppingList | undefined;
  createList: (name: string, marketId?: string) => ShoppingList;
  renameList: (listId: string, name: string, marketId?: string) => void;
  deleteList: (listId: string) => void;
  duplicateList: (listId: string) => ShoppingList | undefined;
  addItem: (listId: string, input: ItemInput) => void;
  updateItem: (listId: string, itemId: string, input: ItemInput) => void;
  toggleItem: (listId: string, itemId: string) => void;
  deleteItem: (listId: string, itemId: string) => void;
  clearCheckedItems: (listId: string) => void;
  replaceAll: (lists: ShoppingList[]) => void;
  mergeLists: (lists: ShoppingList[]) => void;
}

const ShoppingListsContext = createContext<ShoppingListsContextValue | null>(
  null,
);

export function ShoppingListsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!mounted) return;
        if (raw) {
          try {
            const parsed = JSON.parse(raw) as ShoppingList[];
            setLists(parsed);
          } catch {
            setLists([]);
          }
        }
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const persist = useCallback((next: ShoppingList[]) => {
    setLists(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {
      // Best-effort persistence; storage failures are rare on-device and
      // there's no destructive action to roll back here.
    });
  }, []);

  const getList = useCallback(
    (listId: string) => lists.find((l) => l.id === listId),
    [lists],
  );

  const createList = useCallback(
    (name: string, marketId?: string) => {
      const now = Date.now();
      const newList: ShoppingList = {
        id: generateId(),
        name: name.trim() || 'Nova lista',
        createdAt: now,
        updatedAt: now,
        items: [],
        marketId,
      };
      persist([newList, ...lists]);
      return newList;
    },
    [lists, persist],
  );

  const renameList = useCallback(
    (listId: string, name: string, marketId?: string) => {
      persist(
        lists.map((l) =>
          l.id === listId
            ? {
                ...l,
                name: name.trim() || l.name,
                marketId,
                updatedAt: Date.now(),
              }
            : l,
        ),
      );
    },
    [lists, persist],
  );

  const deleteList = useCallback(
    (listId: string) => {
      persist(lists.filter((l) => l.id !== listId));
    },
    [lists, persist],
  );

  const duplicateList = useCallback(
    (listId: string) => {
      const source = lists.find((l) => l.id === listId);
      if (!source) return undefined;
      const now = Date.now();
      const copy: ShoppingList = {
        id: generateId(),
        name: `${source.name} (cópia)`,
        createdAt: now,
        updatedAt: now,
        items: source.items.map((item) => ({
          ...item,
          id: generateId(),
          checked: false,
        })),
      };
      persist([copy, ...lists]);
      return copy;
    },
    [lists, persist],
  );

  const addItem = useCallback(
    (listId: string, input: ItemInput) => {
      const now = Date.now();
      const newItem: ShoppingItem = {
        id: generateId(),
        name: input.name.trim(),
        quantity: input.quantity,
        unit: input.unit,
        brand: input.brand.trim(),
        note: input.note.trim(),
        checked: false,
        createdAt: now,
        updatedAt: now,
        categoryId: input.categoryId,
        productId: input.productId,
        price: input.price,
      };
      persist(
        lists.map((l) =>
          l.id === listId
            ? { ...l, items: [newItem, ...l.items], updatedAt: now }
            : l,
        ),
      );
    },
    [lists, persist],
  );

  const updateItem = useCallback(
    (listId: string, itemId: string, input: ItemInput) => {
      const now = Date.now();
      persist(
        lists.map((l) =>
          l.id === listId
            ? {
                ...l,
                updatedAt: now,
                items: l.items.map((item) =>
                  item.id === itemId
                    ? {
                        ...item,
                        name: input.name.trim(),
                        quantity: input.quantity,
                        unit: input.unit,
                        brand: input.brand.trim(),
                        note: input.note.trim(),
                        categoryId: input.categoryId,
                        productId: input.productId,
                        price: input.price,
                        updatedAt: now,
                      }
                    : item,
                ),
              }
            : l,
        ),
      );
    },
    [lists, persist],
  );

  const toggleItem = useCallback(
    (listId: string, itemId: string) => {
      const now = Date.now();
      persist(
        lists.map((l) =>
          l.id === listId
            ? {
                ...l,
                updatedAt: now,
                items: l.items.map((item) =>
                  item.id === itemId
                    ? { ...item, checked: !item.checked, updatedAt: now }
                    : item,
                ),
              }
            : l,
        ),
      );
    },
    [lists, persist],
  );

  const deleteItem = useCallback(
    (listId: string, itemId: string) => {
      persist(
        lists.map((l) =>
          l.id === listId
            ? {
                ...l,
                updatedAt: Date.now(),
                items: l.items.filter((item) => item.id !== itemId),
              }
            : l,
        ),
      );
    },
    [lists, persist],
  );

  const clearCheckedItems = useCallback(
    (listId: string) => {
      persist(
        lists.map((l) =>
          l.id === listId
            ? {
                ...l,
                updatedAt: Date.now(),
                items: l.items.filter((item) => !item.checked),
              }
            : l,
        ),
      );
    },
    [lists, persist],
  );

  const replaceAll = useCallback(
    (next: ShoppingList[]) => {
      persist(next);
    },
    [persist],
  );

  const mergeLists = useCallback(
    (incoming: ShoppingList[]) => {
      const existingIds = new Set(lists.map((l) => l.id));
      const now = Date.now();
      const toAdd = incoming.map((l) =>
        existingIds.has(l.id)
          ? { ...l, id: generateId(), createdAt: now, updatedAt: now }
          : l,
      );
      persist([...toAdd, ...lists]);
    },
    [lists, persist],
  );

  const value = useMemo<ShoppingListsContextValue>(
    () => ({
      lists,
      isLoading,
      getList,
      createList,
      renameList,
      deleteList,
      duplicateList,
      addItem,
      updateItem,
      toggleItem,
      deleteItem,
      clearCheckedItems,
      replaceAll,
      mergeLists,
    }),
    [
      lists,
      isLoading,
      getList,
      createList,
      renameList,
      deleteList,
      duplicateList,
      addItem,
      updateItem,
      toggleItem,
      deleteItem,
      clearCheckedItems,
      replaceAll,
      mergeLists,
    ],
  );

  return (
    <ShoppingListsContext.Provider value={value}>
      {children}
    </ShoppingListsContext.Provider>
  );
}

export function useShoppingLists() {
  const ctx = useContext(ShoppingListsContext);
  if (!ctx) {
    throw new Error(
      'useShoppingLists must be used within a ShoppingListsProvider',
    );
  }
  return ctx;
}

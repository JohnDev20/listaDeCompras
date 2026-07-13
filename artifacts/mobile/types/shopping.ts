/**
 * Core data model for Lista de Compras.
 *
 * Fields marked "reserved for future use" are typed now so the storage
 * shape doesn't need to migrate later, but are not surfaced in the UI yet.
 */

export type ItemUnit =
  | 'un'
  | 'kg'
  | 'g'
  | 'l'
  | 'ml'
  | 'pct'
  | 'cx'
  | 'dz';

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  unit: ItemUnit;
  note: string;
  checked: boolean;
  createdAt: number;
  updatedAt: number;
  // Reserved for future use
  categoryId?: string;
  price?: number;
}

export interface ShoppingList {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  items: ShoppingItem[];
}

export const UNIT_LABELS: Record<ItemUnit, string> = {
  un: 'un',
  kg: 'kg',
  g: 'g',
  l: 'l',
  ml: 'ml',
  pct: 'pct',
  cx: 'cx',
  dz: 'dz',
};

export const UNIT_OPTIONS: ItemUnit[] = [
  'un',
  'kg',
  'g',
  'l',
  'ml',
  'pct',
  'cx',
  'dz',
];

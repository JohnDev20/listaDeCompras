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
  brand: string;
  note: string;
  checked: boolean;
  createdAt: number;
  updatedAt: number;
  categoryId?: string;
  /** Links back to the reusable product catalog entry, if any. */
  productId?: string;
  /** Price paid for this item, used to build price history. */
  price?: number;
}

export interface ShoppingList {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  items: ShoppingItem[];
  /** Supermarket this list is tied to, if any. */
  marketId?: string;
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

/** A reusable product category, chosen or created when adding an item. */
export interface Category {
  id: string;
  name: string;
  icon: CategoryIcon;
  createdAt: number;
}

export type CategoryIcon =
  | 'shopping-bag'
  | 'coffee'
  | 'droplet'
  | 'feather'
  | 'sun'
  | 'package'
  | 'gift'
  | 'star';

export const CATEGORY_ICON_OPTIONS: CategoryIcon[] = [
  'shopping-bag',
  'coffee',
  'droplet',
  'feather',
  'sun',
  'package',
  'gift',
  'star',
];

/** A supermarket/store a list can be tied to and prices are compared across. */
export interface Market {
  id: string;
  name: string;
  createdAt: number;
}

/**
 * A reusable catalog product: created the first time an item with that
 * name/brand is added, then offered as a suggestion on future additions.
 */
export interface Product {
  id: string;
  name: string;
  brand: string;
  categoryId?: string;
  defaultUnit: ItemUnit;
  createdAt: number;
}

/** One observed price for a product at a given market on a given date. */
export interface PriceEntry {
  id: string;
  productId: string;
  marketId: string;
  price: number;
  date: number;
}

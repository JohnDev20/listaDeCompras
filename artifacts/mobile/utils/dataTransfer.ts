import JSZip from 'jszip';
import { Directory, File, Paths } from 'expo-file-system';
import type {
  Category,
  Market,
  PriceEntry,
  Product,
  ShoppingList,
} from '@/types/shopping';
import { generateId } from '@/utils/id';

const DATA_ENTRY_NAME = 'lista-de-compras-data.json';

export interface ExportPayload {
  version: 1;
  exportedAt: number;
  lists: ShoppingList[];
  catalog: {
    categories: Category[];
    markets: Market[];
    products: Product[];
    priceEntries: PriceEntry[];
  };
}

/**
 * Builds a ZIP file containing the selected lists plus the full reference
 * catalog (categories, markets, products, price history) needed to make
 * sense of them, and returns the file URI ready to share.
 */
export async function buildExportZip(payload: ExportPayload): Promise<File> {
  const zip = new JSZip();
  zip.file(DATA_ENTRY_NAME, JSON.stringify(payload, null, 2));
  const content = await zip.generateAsync({ type: 'uint8array' });

  const fileName = `lista-de-compras-${formatFileDate(payload.exportedAt)}.zip`;
  const directory = Paths.cache;
  const file = new File(directory, fileName);
  if (file.exists) {
    file.delete();
  }
  file.create();
  file.write(content);
  return file;
}

function formatFileDate(timestamp: number): string {
  const date = new Date(timestamp);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(
    date.getHours(),
  )}${pad(date.getMinutes())}`;
}

/** Reads a picked ZIP file URI and extracts the export payload from it. */
export async function readImportZip(fileUri: string): Promise<ExportPayload> {
  const file = new File(fileUri);
  const bytes = await file.bytes();
  const zip = await JSZip.loadAsync(bytes);
  const entry = zip.file(DATA_ENTRY_NAME);
  if (!entry) {
    throw new Error('Arquivo inválido: dados não encontrados no ZIP.');
  }
  const raw = await entry.async('string');
  const parsed = JSON.parse(raw) as ExportPayload;
  if (!parsed || !Array.isArray(parsed.lists) || !parsed.catalog) {
    throw new Error('Arquivo inválido: formato de dados inesperado.');
  }
  return parsed;
}

export interface MergeCatalogHelpers {
  createCategory: (name: string, icon: Category['icon']) => Category;
  createMarket: (name: string) => Market;
  findProduct: (name: string, brand: string) => Product | undefined;
  upsertProduct: (input: {
    name: string;
    brand: string;
    categoryId?: string;
    defaultUnit: Product['defaultUnit'];
  }) => Product;
  recordPrice: (input: {
    productId: string;
    marketId: string;
    price: number;
    date?: number;
  }) => void;
}

/**
 * Merges an imported catalog into the local catalog, deduplicating
 * categories/markets/products by name, and returns ID remap tables so the
 * caller can rewrite list items to point at the merged (possibly new) IDs.
 */
export function mergeCatalogData(
  catalog: ExportPayload['catalog'],
  helpers: MergeCatalogHelpers,
) {
  const categoryIdMap = new Map<string, string>();
  const marketIdMap = new Map<string, string>();
  const productIdMap = new Map<string, string>();

  for (const category of catalog.categories) {
    const resolved = helpers.createCategory(category.name, category.icon);
    categoryIdMap.set(category.id, resolved.id);
  }

  for (const market of catalog.markets) {
    const resolved = helpers.createMarket(market.name);
    marketIdMap.set(market.id, resolved.id);
  }

  for (const product of catalog.products) {
    const remappedCategoryId = product.categoryId
      ? categoryIdMap.get(product.categoryId)
      : undefined;
    const existing = helpers.findProduct(product.name, product.brand);
    const resolved =
      existing ??
      helpers.upsertProduct({
        name: product.name,
        brand: product.brand,
        categoryId: remappedCategoryId,
        defaultUnit: product.defaultUnit,
      });
    productIdMap.set(product.id, resolved.id);
  }

  for (const entry of catalog.priceEntries) {
    const productId = productIdMap.get(entry.productId);
    const marketId = marketIdMap.get(entry.marketId);
    if (!productId || !marketId) continue;
    helpers.recordPrice({
      productId,
      marketId,
      price: entry.price,
      date: entry.date,
    });
  }

  return { categoryIdMap, marketIdMap, productIdMap };
}

/** Rewrites a list's items and market reference using the ID remap tables. */
export function remapList(
  list: ShoppingList,
  maps: {
    categoryIdMap: Map<string, string>;
    marketIdMap: Map<string, string>;
    productIdMap: Map<string, string>;
  },
): ShoppingList {
  return {
    ...list,
    id: generateId(),
    marketId: list.marketId ? maps.marketIdMap.get(list.marketId) : undefined,
    items: list.items.map((item) => ({
      ...item,
      id: generateId(),
      categoryId: item.categoryId
        ? maps.categoryIdMap.get(item.categoryId)
        : undefined,
      productId: item.productId
        ? maps.productIdMap.get(item.productId)
        : undefined,
    })),
  };
}

import { pgTable, text, serial, timestamp, boolean, decimal, integer, json, uuid, index, foreignKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date()),
});

// Supermarkets table
export const supermarkets = pgTable('supermarkets', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  name: text('name').notNull(),
  location: text('location'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => ({
  userIdIdx: index('idx_supermarkets_user_id').on(table.userId),
}));

// Shopping Lists table
export const shoppingLists = pgTable('shopping_lists', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  supermarketId: uuid('supermarket_id'),
  name: text('name').notNull(),
  description: text('description'),
  status: text('status').notNull().default('active'), // 'active' | 'completed' | 'archived'
  estimatedTotal: decimal('estimated_total', { precision: 10, scale: 2 }).default('0'),
  actualTotal: decimal('actual_total', { precision: 10, scale: 2 }).default('0'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  completedAt: timestamp('completed_at'),
  updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => ({
  userIdIdx: index('idx_shopping_lists_user_id').on(table.userId),
  supermarketIdIdx: index('idx_shopping_lists_supermarket_id').on(table.supermarketId),
}));

// Product Categories table
export const productCategories = pgTable('product_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  name: text('name').notNull(),
  icon: text('icon'),
  color: text('color'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => ({
  userIdIdx: index('idx_categories_user_id').on(table.userId),
}));

// Products table
export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  shoppingListId: uuid('shopping_list_id').notNull(),
  categoryId: uuid('category_id').notNull(),
  name: text('name').notNull(),
  quantity: decimal('quantity', { precision: 10, scale: 2 }).notNull(),
  unit: text('unit').notNull(), // 'kg', 'litro', 'unidade', 'pacote', etc
  brand: text('brand'),
  observations: text('observations'),
  estimatedPrice: decimal('estimated_price', { precision: 10, scale: 2 }),
  actualPrice: decimal('actual_price', { precision: 10, scale: 2 }),
  isPurchased: boolean('is_purchased').notNull().default(false),
  purchasedAt: timestamp('purchased_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => ({
  userIdIdx: index('idx_products_user_id').on(table.userId),
  shoppingListIdIdx: index('idx_products_shopping_list_id').on(table.shoppingListId),
  categoryIdIdx: index('idx_products_category_id').on(table.categoryId),
}));

// Product Price History table
export const productPriceHistory = pgTable('product_price_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').notNull(),
  supermarketId: uuid('supermarket_id').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  recordedAt: timestamp('recorded_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => ({
  productIdIdx: index('idx_price_history_product_id').on(table.productId),
  supermarketIdIdx: index('idx_price_history_supermarket_id').on(table.supermarketId),
}));

// Favorite Products table
export const favoriteProducts = pgTable('favorite_products', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  productName: text('product_name').notNull(),
  brand: text('brand'),
  quantity: decimal('quantity', { precision: 10, scale: 2 }).notNull(),
  unit: text('unit').notNull(),
  categoryId: uuid('category_id').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  lastUsedAt: timestamp('last_used_at').notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => ({
  userIdIdx: index('idx_favorite_products_user_id').on(table.userId),
  categoryIdIdx: index('idx_favorite_products_category_id').on(table.categoryId),
}));

// Default Categories seeding helper
export const defaultCategories = [
  { name: 'Frutas e Verduras', icon: '🥗', color: '#22c55e' },
  { name: 'Carnes', icon: '🥩', color: '#ef4444' },
  { name: 'Bebidas', icon: '🥤', color: '#3b82f6' },
  { name: 'Limpeza', icon: '🧹', color: '#f59e0b' },
  { name: 'Higiene', icon: '🧼', color: '#ec4899' },
  { name: 'Alimentos', icon: '🍞', color: '#8b5cf6' },
  { name: 'Outros', icon: '📦', color: '#6b7280' },
];

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  shoppingLists: many(shoppingLists),
  supermarkets: many(supermarkets),
  categories: many(productCategories),
  products: many(products),
  favoriteProducts: many(favoriteProducts),
}));

export const shoppingListsRelations = relations(shoppingLists, ({ one, many }) => ({
  user: one(users, {
    fields: [shoppingLists.userId],
    references: [users.id],
  }),
  supermarket: one(supermarkets, {
    fields: [shoppingLists.supermarketId],
    references: [supermarkets.id],
  }),
  products: many(products),
}));

export const supermarketsRelations = relations(supermarkets, ({ one, many }) => ({
  user: one(users, {
    fields: [supermarkets.userId],
    references: [users.id],
  }),
  shoppingLists: many(shoppingLists),
  priceHistory: many(productPriceHistory),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  user: one(users, {
    fields: [products.userId],
    references: [users.id],
  }),
  shoppingList: one(shoppingLists, {
    fields: [products.shoppingListId],
    references: [shoppingLists.id],
  }),
  category: one(productCategories, {
    fields: [products.categoryId],
    references: [productCategories.id],
  }),
  priceHistory: many(productPriceHistory),
}));

export const categoriesRelations = relations(productCategories, ({ one, many }) => ({
  user: one(users, {
    fields: [productCategories.userId],
    references: [users.id],
  }),
  products: many(products),
  favoriteProducts: many(favoriteProducts),
}));

export const priceHistoryRelations = relations(productPriceHistory, ({ one }) => ({
  product: one(products, {
    fields: [productPriceHistory.productId],
    references: [products.id],
  }),
  supermarket: one(supermarkets, {
    fields: [productPriceHistory.supermarketId],
    references: [supermarkets.id],
  }),
}));

export const favoriteProductsRelations = relations(favoriteProducts, ({ one }) => ({
  user: one(users, {
    fields: [favoriteProducts.userId],
    references: [users.id],
  }),
  category: one(productCategories, {
    fields: [favoriteProducts.categoryId],
    references: [productCategories.id],
  }),
}));

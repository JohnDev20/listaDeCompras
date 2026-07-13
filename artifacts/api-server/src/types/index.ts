export type User = {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ShoppingList = {
  id: string;
  userId: string;
  supermarketId?: string;
  name: string;
  description?: string;
  status: 'active' | 'completed' | 'archived';
  estimatedTotal: string;
  actualTotal: string;
  createdAt: Date;
  completedAt?: Date;
  updatedAt: Date;
  products?: Product[];
  supermarket?: Supermarket;
};

export type Product = {
  id: string;
  userId: string;
  shoppingListId: string;
  categoryId: string;
  name: string;
  quantity: string;
  unit: string;
  brand?: string;
  observations?: string;
  estimatedPrice?: string;
  actualPrice?: string;
  isPurchased: boolean;
  purchasedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  category?: ProductCategory;
  priceHistory?: ProductPriceHistory[];
};

export type ProductCategory = {
  id: string;
  userId: string;
  name: string;
  icon?: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Supermarket = {
  id: string;
  userId: string;
  name: string;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ProductPriceHistory = {
  id: string;
  productId: string;
  supermarketId: string;
  price: string;
  recordedAt: Date;
  updatedAt: Date;
};

export type FavoriteProduct = {
  id: string;
  userId: string;
  productName: string;
  brand?: string;
  quantity: string;
  unit: string;
  categoryId: string;
  createdAt: Date;
  lastUsedAt: Date;
};

export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

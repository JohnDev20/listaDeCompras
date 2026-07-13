import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth API
export const authAPI = {
  register: (email: string, password: string, name: string) =>
    apiClient.post('/auth/register', { email, password, name }),
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),
};

// Shopping Lists API
export const shoppingListsAPI = {
  getAll: () => apiClient.get('/shopping-lists'),
  getById: (id: string) => apiClient.get(`/shopping-lists/${id}`),
  create: (data: any) => apiClient.post('/shopping-lists', data),
  update: (id: string, data: any) => apiClient.put(`/shopping-lists/${id}`, data),
  delete: (id: string) => apiClient.delete(`/shopping-lists/${id}`),
};

// Products API
export const productsAPI = {
  create: (data: any) => apiClient.post('/products', data),
  update: (id: string, data: any) => apiClient.put(`/products/${id}`, data),
  delete: (id: string) => apiClient.delete(`/products/${id}`),
  getPriceHistory: (id: string) => apiClient.get(`/products/${id}/price-history`),
  addPriceRecord: (id: string, data: any) => apiClient.post(`/products/${id}/price-history`, data),
};

// Categories API
export const categoriesAPI = {
  getAll: () => apiClient.get('/categories'),
  create: (data: any) => apiClient.post('/categories', data),
  update: (id: string, data: any) => apiClient.put(`/categories/${id}`, data),
  delete: (id: string) => apiClient.delete(`/categories/${id}`),
};

// Supermarkets API
export const supermarketsAPI = {
  getAll: () => apiClient.get('/supermarkets'),
  create: (data: any) => apiClient.post('/supermarkets', data),
  update: (id: string, data: any) => apiClient.put(`/supermarkets/${id}`, data),
  delete: (id: string) => apiClient.delete(`/supermarkets/${id}`),
};

// Favorites API
export const favoritesAPI = {
  getAll: () => apiClient.get('/favorites'),
  add: (data: any) => apiClient.post('/favorites', data),
  remove: (id: string) => apiClient.delete(`/favorites/${id}`),
};

// Export/Import API
export const exportImportAPI = {
  export: (options: any) => apiClient.post('/export-import/export', options),
  import: (zipData: string, options: any) => apiClient.post('/export-import/import', { zipData, options }),
};

// Set authorization token
export const setAuthToken = (token: string) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

// React Query Hooks
export const useShoppingLists = () => {
  return useQuery({
    queryKey: ['shopping-lists'],
    queryFn: () => shoppingListsAPI.getAll().then((res) => res.data.data),
  });
};

export const useShoppingList = (id: string) => {
  return useQuery({
    queryKey: ['shopping-lists', id],
    queryFn: () => shoppingListsAPI.getById(id).then((res) => res.data.data),
  });
};

export const useCreateShoppingList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => shoppingListsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-lists'] });
    },
  });
};

export const useUpdateShoppingList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      shoppingListsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-lists'] });
    },
  });
};

export const useDeleteShoppingList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => shoppingListsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-lists'] });
    },
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesAPI.getAll().then((res) => res.data.data),
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => categoriesAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useSupermarkets = () => {
  return useQuery({
    queryKey: ['supermarkets'],
    queryFn: () => supermarketsAPI.getAll().then((res) => res.data.data),
  });
};

export const useCreateSupermarket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => supermarketsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supermarkets'] });
    },
  });
};

export const useFavorites = () => {
  return useQuery({
    queryKey: ['favorites'],
    queryFn: () => favoritesAPI.getAll().then((res) => res.data.data),
  });
};

export const useAddFavorite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => favoritesAPI.add(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });
};

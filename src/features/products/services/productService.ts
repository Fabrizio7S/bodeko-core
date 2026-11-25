import axios from 'axios';
import { api } from '@/config';
import type { Product, ProductInput, ProductStatus } from '../types';
/** Productos aislados por tienda; nunca elimina historial de ventas. */
export const productService = {
  /** Una tienda sin productos no es un error: se devuelve una lista vacía. */
  list: async (storeId: string) => {
    try {
      const { data } = await api.get<Product[]>(`/stores/${storeId}/products`);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) return [];
      throw error;
    }
  },
  save: async (storeId: string, body: ProductInput, id?: string) =>
    id
      ? (await api.put<Product>(`/stores/${storeId}/products/${id}`, body)).data
      : (await api.post<Product>(`/stores/${storeId}/products`, body)).data,
  status: async (storeId: string, id: string, status: ProductStatus) =>
    (await api.patch<Product>(`/stores/${storeId}/products/${id}/status`, { status })).data,
};

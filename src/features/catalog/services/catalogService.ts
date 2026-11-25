import axios from 'axios';
import { api } from '@/config';
import type { Page } from '@/core/types';
import type { CatalogFilters, CatalogProduct } from '../types';

const emptyPage = (page: number): Page<CatalogProduct> => ({
  content: [],
  page,
  size: 12,
  totalElements: 0,
  totalPages: 0,
});

/** Catálogo real con búsqueda, filtros y paginación en el servidor. */
export const catalogService = {
  /** Si la tienda no tiene productos se devuelve una página vacía, nunca un error. */
  search: async (storeId: string, filters: CatalogFilters) => {
    try {
      const { data } = await api.get<Page<CatalogProduct>>(`/public/stores/${storeId}/products`, {
        params: {
          search: filters.search || undefined,
          categoryId: filters.categoryId || undefined,
          inStock: filters.inStock || undefined,
          page: filters.page,
          size: 12,
        },
      });
      return data && Array.isArray(data.content) ? data : emptyPage(filters.page);
    } catch (error) {
      if (
        axios.isAxiosError<{ code?: string }>(error) &&
        error.response?.status === 404 &&
        error.response.data?.code !== 'STORE_NOT_FOUND'
      )
        return emptyPage(filters.page);
      throw error;
    }
  },
  detail: async (storeId: string, productId: string) =>
    (await api.get<CatalogProduct>(`/public/stores/${storeId}/products/${productId}`)).data,
};

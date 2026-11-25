import { api } from '@/config';
import type { Page } from '@/core/types';
import type { Product } from '@/features/products';
import type { Category } from '@/features/categories/types';
import type { OrderSummary } from '@/features/orders/types';
import type { DashboardMetrics, DaySales } from '../types';

/** Máximo que acepta el backend por página de pedidos. */
const RECENT_ORDERS = 100;
/** Estados que cuentan como venta cobrada. */
const SOLD = new Set(['PAID', 'SHIPPED', 'DELIVERED']);

/** Fecha local AAAA-MM-DD (no UTC), para agrupar por el día del bodeguero. */
export function localDay(value: Date): string {
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${value.getFullYear()}-${month}-${day}`;
}

/** Agrupa los pedidos recientes en ventas por día y pedidos por atender. */
export function summarizeOrders(orders: OrderSummary[], now = new Date()) {
  const week: DaySales[] = [];
  for (let offset = 6; offset >= 0; offset--) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset);
    week.push({ date: localDay(day), total: 0, orders: 0 });
  }
  const byDay = new Map(week.map((item) => [item.date, item]));
  for (const order of orders) {
    if (!SOLD.has(order.status)) continue;
    const bucket = byDay.get(localDay(new Date(order.createdAt)));
    if (!bucket) continue;
    bucket.total += order.total;
    bucket.orders += 1;
  }
  const today = week[week.length - 1] ?? { total: 0, orders: 0 };
  const firstDay = week[0]?.date ?? '';
  const weekSales = week.reduce((sum, item) => sum + item.total, 0);
  const weekOrders = week.reduce((sum, item) => sum + item.orders, 0);
  // Pagados primero (hay que prepararlos), luego los que esperan pago.
  const toAttend = [
    ...orders.filter((order) => order.status === 'PAID'),
    ...orders.filter((order) => order.status === 'PENDING'),
  ];
  const oldest = orders.at(-1);
  const partialWeek =
    orders.length >= RECENT_ORDERS && !!oldest && localDay(new Date(oldest.createdAt)) > firstDay;
  return {
    week,
    todaySales: today.total,
    todayOrders: today.orders,
    weekSales,
    weekOrders,
    averageTicket: weekOrders ? weekSales / weekOrders : 0,
    toAttend,
    partialWeek,
  };
}

/** Consulta en paralelo todo lo que muestra el resumen de la bodega. */
export async function getDashboardMetrics(storeId: string): Promise<DashboardMetrics> {
  const [products, categories, recent, pending, paid] = await Promise.all([
    api.get<Product[]>(`/stores/${storeId}/products`),
    api.get<Category[]>(`/stores/${storeId}/categories`),
    api.get<Page<OrderSummary>>(`/stores/${storeId}/orders`, {
      params: { page: 0, size: RECENT_ORDERS },
    }),
    api.get<Page<unknown>>(`/stores/${storeId}/orders`, { params: { status: 'PENDING', size: 1 } }),
    api.get<Page<unknown>>(`/stores/${storeId}/orders`, { params: { status: 'PAID', size: 1 } }),
  ]);
  const productList = Array.isArray(products.data) ? products.data : [];
  const count = (status: Product['status']) =>
    productList.filter((item) => item.status === status).length;
  return {
    products: productList.length,
    activeProducts: count('ACTIVE'),
    draftProducts: count('DRAFT'),
    inactiveProducts: count('INACTIVE'),
    categories: Array.isArray(categories.data) ? categories.data.length : 0,
    pendingOrders: pending.data.totalElements,
    paidOrders: paid.data.totalElements,
    ...summarizeOrders(recent.data.content ?? []),
  };
}

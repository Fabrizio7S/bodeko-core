import type { OrderSummary } from '@/features/orders/types';

/** Ventas de un día del gráfico semanal. */
export interface DaySales {
  /** Fecha local en formato AAAA-MM-DD. */
  date: string;
  total: number;
  orders: number;
}

/** Resumen del panel calculado con productos, categorías y pedidos recientes. */
export interface DashboardMetrics {
  products: number;
  activeProducts: number;
  draftProducts: number;
  inactiveProducts: number;
  categories: number;
  pendingOrders: number;
  paidOrders: number;
  todaySales: number;
  todayOrders: number;
  weekSales: number;
  weekOrders: number;
  averageTicket: number;
  week: DaySales[];
  /** Pedidos pagados (por preparar) y pendientes de pago, del más reciente al más antiguo. */
  toAttend: OrderSummary[];
  /** true si los 100 pedidos más recientes no alcanzan a cubrir los 7 días. */
  partialWeek: boolean;
}

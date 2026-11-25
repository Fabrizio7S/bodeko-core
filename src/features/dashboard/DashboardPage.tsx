import { useCallback, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import {
  Check,
  ClipboardList,
  Copy,
  MessageCircle,
  PackagePlus,
  RefreshCw,
  Tag,
  Trash2,
  TriangleAlert,
  Truck,
} from 'lucide-react';
import { toast } from 'sonner';
import { useResource } from '@/core/hooks/useResource';
import { lowStockService } from '@/features/inventory/services/lowStockService';
import { Badge, Button, ErrorNotice, Loading, PageHeader } from '@/core/components';
import type { Store } from '@/features/stores';
import { useSession } from '@/context/SessionContext';
import { money } from '@/utils/format';
import { storeUrl, whatsappShareUrl } from '@/utils/share';
import { useDashboard } from './hooks/useDashboard';
import { MetricCard } from './components/MetricCard';
import { WeekChart } from './components/WeekChart';
import { SetupChecklist } from './components/SetupChecklist';

const timeAgo = new Intl.RelativeTimeFormat('es-PE', { numeric: 'auto' });
/** "hace 5 minutos", "ayer"… más fácil de leer que una fecha completa. */
function since(value: string): string {
  const minutes = Math.round((new Date(value).getTime() - Date.now()) / 60000);
  if (Math.abs(minutes) < 60) return timeAgo.format(minutes, 'minute');
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return timeAgo.format(hours, 'hour');
  return timeAgo.format(Math.round(hours / 24), 'day');
}

/** Inicio del panel: lo que se vendió, lo que hay que atender y lo que hay que reponer. */
export function DashboardPage() {
  const store = useOutletContext<Store>();
  const { user } = useSession();
  const resource = useDashboard(store.id);
  const lowStock = useResource(useCallback(() => lowStockService.list(store.id), [store.id]));
  const [copied, setCopied] = useState(false);
  const data = resource.data;
  const base = `/admin/${store.id}`;
  const today = new Intl.DateTimeFormat('es-PE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date()).replace(/^./, (letter) => letter.toUpperCase());

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(storeUrl(store));
      setCopied(true);
      toast.success('Enlace copiado. Pégalo en tus estados o grupos.');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error('No se pudo copiar. Mantén presionado el enlace para copiarlo.');
    }
  }

  return (
    <>
      <span className="dash-date">{today}</span>
      <PageHeader
        title={`Hola, ${user?.fullName.split(' ')[0] || 'bienvenido'}`}
        description={`Así va ${store.name} hoy.`}
        actions={
          <div className="actions">
            <Button
              variant="secondary"
              onClick={() => {
                resource.reload();
                lowStock.reload();
              }}
              aria-label="Actualizar resumen"
            >
              <RefreshCw size={16} />
              <span className="desktop-label">Actualizar</span>
            </Button>
            <Link className="button primary" to={`${base}/productos`}>
              <PackagePlus size={16} />
              Agregar producto
            </Link>
          </div>
        }
      />
      <ErrorNotice message={resource.error} retry={resource.reload} />
      {resource.loading ? (
        <Loading />
      ) : (
        data && (
          <div className="dash-grid">
            <SetupChecklist store={store} metrics={data} onShare={copyLink} />

            <div className="kpi-row">
              <article className="kpi kpi-today tag-sign">
                <span className="kpi-label">Vendido hoy</span>
                <strong className="kpi-value">{money(data.todaySales, store.currency)}</strong>
                <small>
                  {data.todayOrders === 1 ? '1 pedido cobrado' : `${data.todayOrders} pedidos cobrados`}
                </small>
              </article>
              <MetricCard
                label="Por preparar"
                value={String(data.paidOrders)}
                hint={
                  data.pendingOrders
                    ? `${data.pendingOrders} esperando pago`
                    : 'Pedidos pagados sin enviar'
                }
                to={`${base}/ordenes`}
                alert={data.paidOrders > 0}
              />
              <MetricCard
                label="Últimos 7 días"
                value={money(data.weekSales, store.currency)}
                hint={`${data.weekOrders} pedidos cobrados`}
              />
              <MetricCard
                label="Ticket promedio"
                value={money(data.averageTicket, store.currency)}
                hint="Por pedido, últimos 7 días"
              />
            </div>

            <div className="dash-two">
              <section className="card" aria-labelledby="week-title">
                <div className="dash-card-head">
                  <h2 id="week-title">Ventas de la semana</h2>
                  <Link to={`${base}/ordenes`}>Ver pedidos</Link>
                </div>
                <WeekChart week={data.week} currency={store.currency} />
                {data.partialWeek && (
                  <p className="chart-foot">Calculado con tus últimos 100 pedidos.</p>
                )}
              </section>

              <section className="card" aria-labelledby="attend-title">
                <div className="dash-card-head">
                  <h2 id="attend-title">
                    <ClipboardList size={19} aria-hidden="true" /> Por atender
                  </h2>
                  <Link to={`${base}/ordenes`}>Todos</Link>
                </div>
                {data.toAttend.length ? (
                  <div className="row-list">
                    {data.toAttend.slice(0, 6).map((order) => (
                      <Link key={order.id} to={`${base}/ordenes/${order.id}`}>
                        <span className="row-main">
                          <strong>
                            {order.customerBusinessName ||
                              `${order.customerDocumentType} ${order.customerDocumentNumber}`}
                          </strong>
                          <small>
                            #{order.orderNumber} · {since(order.createdAt)}
                          </small>
                        </span>
                        <span className="row-side">
                          <strong>{money(order.total, store.currency)}</strong>
                          <Badge value={order.status} />
                        </span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="empty-inline">
                    <Check size={18} aria-hidden="true" /> Estás al día. No hay pedidos por atender.
                  </p>
                )}
              </section>
            </div>
          </div>
        )
      )}

      <div className="dash-two" style={{ marginTop: 16 }}>
        <section className="card" aria-labelledby="restock-title">
          <div className="dash-card-head">
            <h2 id="restock-title">
              <TriangleAlert size={19} aria-hidden="true" /> Por reponer
            </h2>
            <Link to={`${base}/inventario`}>Ver stock</Link>
          </div>
          <ErrorNotice message={lowStock.error} retry={lowStock.reload} />
          {lowStock.loading ? (
            <Loading />
          ) : lowStock.data?.length ? (
            <div className="row-list">
              {lowStock.data.slice(0, 6).map((item) => (
                <div key={item.variantId}>
                  <span className="row-main">
                    <strong>{item.productName}</strong>
                    <small>
                      {Object.values(item.options).join(' / ') || `Mínimo ${item.threshold}`} · pide{' '}
                      {item.suggestedQuantity} o más
                    </small>
                  </span>
                  <span className="row-side">
                    <strong>
                      Quedan {item.quantity}
                    </strong>
                    <span
                      className="stock-meter"
                      role="img"
                      aria-label={`${item.quantity} de ${item.threshold} mínimo`}
                    >
                      <i
                        style={{
                          width: `${Math.min(100, (item.quantity / Math.max(1, item.threshold)) * 100)}%`,
                        }}
                      />
                    </span>
                  </span>
                </div>
              ))}
            </div>
          ) : (
            !lowStock.error && (
              <p className="empty-inline">
                <Check size={18} aria-hidden="true" /> Tu stock está bien. Nada por reponer.
              </p>
            )
          )}
          {!!lowStock.data?.length && (
            <Link className="button secondary" style={{ marginTop: 14 }} to={`${base}/compras`}>
              <Truck size={16} /> Registrar compra a proveedor
            </Link>
          )}
        </section>

        <section className="card" aria-labelledby="quick-title">
          <div className="dash-card-head">
            <h2 id="quick-title">Atajos</h2>
          </div>
          {data && (
            <div className="catalog-health">
              <Link to={`${base}/productos`}>
                <b>{data.activeProducts}</b> a la venta
              </Link>
              {data.draftProducts > 0 && (
                <Link to={`${base}/productos`}>
                  <b>{data.draftProducts}</b> en borrador
                </Link>
              )}
              {data.inactiveProducts > 0 && (
                <Link to={`${base}/productos`}>
                  <b>{data.inactiveProducts}</b> pausados
                </Link>
              )}
            </div>
          )}
          <div className="quick-grid">
            <Link to={`${base}/productos`}>
              <PackagePlus size={20} aria-hidden="true" />
              Nuevo producto
              <small>Precio, foto y presentación</small>
            </Link>
            <Link to={`${base}/compras`}>
              <Truck size={20} aria-hidden="true" />
              Compra a proveedor
              <small>Suma stock al recibir</small>
            </Link>
            <Link to={`${base}/inventario/mermas`}>
              <Trash2 size={20} aria-hidden="true" />
              Registrar merma
              <small>Vencido, roto o perdido</small>
            </Link>
            <Link to={`${base}/ofertas`}>
              <Tag size={20} aria-hidden="true" />
              Crear oferta
              <small>Precio especial por fechas</small>
            </Link>
          </div>
        </section>
      </div>

      <section className="card share-card" style={{ marginTop: 16 }} aria-labelledby="share-title">
        <div>
          <h2 id="share-title">Tu tienda en línea</h2>
          <p className="muted">Compártela con tus vecinos y clientes para que te hagan pedidos.</p>
          <span className="share-url">{storeUrl(store)}</span>
        </div>
        <div className="actions">
          <Button variant="secondary" onClick={copyLink}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copiado' : 'Copiar enlace'}
          </Button>
          <a className="button primary" href={whatsappShareUrl(store)} target="_blank" rel="noreferrer">
            <MessageCircle size={16} />
            Enviar por WhatsApp
          </a>
        </div>
      </section>
    </>
  );
}

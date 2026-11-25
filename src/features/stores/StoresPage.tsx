import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Boxes,
  MessageCircle,
  Package,
  ReceiptText,
  Store,
  Truck,
} from 'lucide-react';
import { useSession } from '@/context/SessionContext';
import './landing.css';

const features = [
  {
    icon: Package,
    title: 'Tus productos con precio y foto',
    text: 'Ordénalos por categorías y presentaciones: 1 L, 5 kg, paquete o unidad.',
  },
  {
    icon: Boxes,
    title: 'Stock que avisa',
    text: 'Te dice qué se está acabando y cuánto pedir antes de quedarte sin nada.',
  },
  {
    icon: ReceiptText,
    title: 'Pedidos con boleta o factura',
    text: 'Tus clientes piden desde el celular; tú ves quién pagó y qué falta enviar.',
  },
  {
    icon: Truck,
    title: 'Compras y mermas',
    text: 'Registra lo que llega del proveedor y lo que se venció o se rompió.',
  },
];

const CATEGORIES = [
  'Abarrotes', 'Bebidas', 'Lácteos', 'Panadería', 'Limpieza',
  'Snacks', 'Carnes', 'Verduras', 'Licores', 'Útiles escolares',
];

/** Activa bk-reveal cuando el elemento entra en pantalla. */
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in-view'); obs.unobserve(e.target); } }),
      { threshold: 0.1 },
    );
    el.querySelectorAll<HTMLElement>('.bk-reveal').forEach((t) => obs.observe(t));
    return () => obs.disconnect();
  }, []);
  return ref;
}

export function StoresPage() {
  const { user } = useSession();
  const start = user?.role === 'ADMIN' ? '/admin' : '/registro';
  const startLabel = user?.role === 'ADMIN' ? 'Ir a mi bodega' : 'Crear mi tienda';
  const pageRef = useScrollReveal();

  // Duplicamos las categorías para que el scroll sea infinito sin saltos
  const tickerItems = [...CATEGORIES, ...CATEGORIES];

  return (
    <div className="bk-landing" ref={pageRef}>
      {/* ── Hero ── */}
      <section className="bk-hero" aria-labelledby="hero-title">
        <div className="bk-hero-copy">
          <p className="bk-kicker">
            <Store size={16} aria-hidden="true" /> Para bodegas y minimarkets
          </p>
          <h1 id="hero-title">Tu bodega, también en el celular de tus vecinos.</h1>
          <p className="bk-lead">
            Sube tus productos, controla tu stock y recibe pedidos con boleta o factura. Todo desde
            el navegador, sin instalar nada.
          </p>
          <div className="bk-actions">
            <Link className="button primary bk-big" to={start}>
              {startLabel} <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <a className="button secondary bk-big" href="#como-empezar">
              Cómo empezar
            </a>
          </div>
        </div>

        <div className="bk-sign-wrap" aria-hidden="true">
          <span className="bk-string" />
          <div className="bk-sign tag-sign">
            <span className="bk-sign-small">Atendemos</span>
            <strong>
              también
              <br />
              por internet
            </strong>
            <span className="bk-sign-url">bodeko / tu-bodega</span>
          </div>
          <div className="bk-sign-note">
            <MessageCircle size={16} />
            Comparte tu enlace por WhatsApp y recibe pedidos.
          </div>
        </div>
      </section>

      {/* ── Ticker de categorías ── */}
      <div className="bk-ticker" aria-hidden="true">
        <div className="bk-ticker-track">
          {tickerItems.map((cat, i) => (
            <span className="bk-ticker-item" key={i}>
              <span className="bk-ticker-dot" />
              {cat}
            </span>
          ))}
        </div>
      </div>

      {/* ── Funciones ── */}
      <section id="funciones" className="bk-section bk-reveal" aria-labelledby="features-title">
        <h2 id="features-title">Lo que hoy anotas en el cuaderno, aquí se ordena solo.</h2>
        <div className="bk-features">
          {features.map(({ icon: Icon, title, text }) => (
            <article key={title}>
              <Icon size={22} aria-hidden="true" />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ── Preview del panel ── */}
      <section className="bk-preview-section bk-reveal" aria-label="Vista previa del panel">
        <span className="bk-eyebrow">Tu panel</span>
        <h2>Todo tu negocio, en una sola pantalla.</h2>
        <p>Catálogo, stock, pedidos y ventas. Así se ve tu bodega desde adentro.</p>

        <div className="bk-browser">
          {/* Barra del navegador */}
          <div className="bk-browser-bar">
            <div className="bk-dots">
              <span /><span /><span />
            </div>
            <div className="bk-addr">bodeko.app/panel</div>
          </div>

          {/* Contenido del dashboard */}
          <div className="bk-dash-mock">
            <div className="bk-dash-top">
              <div>
                <div className="bk-dash-greeting">Hola, Rosa 👋</div>
                <div className="bk-dash-date">Así va Bodega Doña Rosa hoy.</div>
              </div>
              <button className="bk-dash-btn">+ Agregar producto</button>
            </div>

            {/* KPIs */}
            <div className="bk-kpi-row">
              <div className="bk-kpi-card accent">
                <div className="bk-kpi-label">Vendido hoy</div>
                <div className="bk-kpi-value">S/ 248</div>
                <div className="bk-kpi-hint">3 pedidos cobrados</div>
              </div>
              <div className="bk-kpi-card">
                <div className="bk-kpi-label">Por preparar</div>
                <div className="bk-kpi-value">2</div>
                <div className="bk-kpi-hint">Pedidos pagados sin enviar</div>
              </div>
              <div className="bk-kpi-card">
                <div className="bk-kpi-label">Últimos 7 días</div>
                <div className="bk-kpi-value">S/ 1,420</div>
                <div className="bk-kpi-hint">11 pedidos cobrados</div>
              </div>
              <div className="bk-kpi-card">
                <div className="bk-kpi-label">Ticket promedio</div>
                <div className="bk-kpi-value">S/ 129</div>
                <div className="bk-kpi-hint">Por pedido, 7 días</div>
              </div>
            </div>

            {/* Fila inferior */}
            <div className="bk-dash-row">
              {/* Mini gráfico */}
              <div className="bk-mini-card">
                <div className="bk-mini-title">Ventas de la semana</div>
                <div className="bk-chart-bars">
                  {[35, 55, 40, 70, 48, 90, 60].map((h, i) => (
                    <div key={i} className={`bk-bar${i === 5 ? ' active' : ''}`} style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
              {/* Por atender */}
              <div className="bk-mini-card">
                <div className="bk-mini-title">Por atender</div>
                {[
                  { name: 'Bodega Central', total: 'S/ 85', status: 'Pagado' },
                  { name: 'Juan Pérez', total: 'S/ 42', status: 'Pagado' },
                  { name: 'María López', total: 'S/ 121', status: 'Pendiente' },
                ].map((o) => (
                  <div key={o.name} className="bk-order-row">
                    <span className="bk-order-name">{o.name}</span>
                    <span>{o.total}</span>
                    <span className="bk-order-status">{o.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pasos ── */}
      <section id="como-empezar" className="bk-section bk-steps bk-reveal" aria-labelledby="steps-title">
        <h2 id="steps-title">Empieza en tres pasos</h2>
        <ol>
          <li>
            <b>1</b>
            <div>
              <h3>Crea tu cuenta</h3>
              <p>Con tu nombre, correo y celular.</p>
            </div>
          </li>
          <li>
            <b>2</b>
            <div>
              <h3>Registra tu bodega</h3>
              <p>Nombre, RUC y el enlace con el que te encontrarán.</p>
            </div>
          </li>
          <li>
            <b>3</b>
            <div>
              <h3>Sube productos y comparte</h3>
              <p>Pásale el enlace a tus clientes por WhatsApp o en tus estados.</p>
            </div>
          </li>
        </ol>
      </section>

      {/* ── CTA ── */}
      <section className="bk-cta bk-reveal" aria-labelledby="cta-title">
        <h2 id="cta-title">Abre tu bodega en internet hoy mismo.</h2>
        <Link className="button bk-big bk-cta-button" to={start}>
          {startLabel} <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </section>
    </div>
  );
}

import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Boxes,
  ClipboardList,
  MessageCircle,
  Package,
  ReceiptText,
  Store,
  Truck,
} from 'lucide-react';
import { ErrorNotice, Loading } from '@/core/components';
import { useSession } from '@/context/SessionContext';
import { useTopSellingStores } from './hooks/useTopSellingStores';
import './landing.css';

/** Lo que el sistema hace de verdad; cada punto corresponde a una sección del panel. */
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

/** Portada pensada para el dueño de la bodega; las tiendas destacadas vienen de la API. */
export function StoresPage() {
  const resource = useTopSellingStores();
  const { user } = useSession();
  const stores = resource.data ?? [];
  const start = user?.role === 'ADMIN' ? '/admin' : '/registro';
  const startLabel = user?.role === 'ADMIN' ? 'Ir a mi bodega' : 'Crear mi tienda';

  return (
    <div className="bk-landing">
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

      <section id="funciones" className="bk-section" aria-labelledby="features-title">
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

      <section id="como-empezar" className="bk-section bk-steps" aria-labelledby="steps-title">
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

      <section id="tiendas" className="bk-section" aria-labelledby="stores-title">
        <div className="bk-section-head">
          <h2 id="stores-title">Bodegas que ya venden con Bodeko</h2>
          <Link to="/tiendas">
            Ver todas <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
        <ErrorNotice message={resource.error} retry={resource.reload} />
        {resource.loading ? (
          <Loading />
        ) : resource.error ? null : stores.length === 0 ? (
          <p className="bk-muted">
            Aquí aparecerán las tiendas con más pedidos. ¿La tuya será la primera?
          </p>
        ) : (
          <ol className="bk-stores">
            {stores.map((store, index) => (
              <li key={store.id}>
                <Link to={`/tienda/${encodeURIComponent(store.subdomain)}`}>
                  <span className="bk-rank">{index + 1}</span>
                  <span className="bk-store-name">
                    <strong>{store.name}</strong>
                    <small>
                      <ClipboardList size={13} aria-hidden="true" /> {store.salesCount}{' '}
                      {store.salesCount === 1 ? 'pedido' : 'pedidos'}
                    </small>
                  </span>
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="bk-cta" aria-labelledby="cta-title">
        <h2 id="cta-title">Abre tu bodega en internet hoy mismo.</h2>
        <Link className="button bk-big bk-cta-button" to={start}>
          {startLabel} <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </section>
    </div>
  );
}

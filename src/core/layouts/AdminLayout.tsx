import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useParams } from 'react-router-dom';
import {
  Boxes,
  ChevronsUpDown,
  ExternalLink,
  History,
  House,
  LayoutGrid,
  Menu,
  MessageCircle,
  Package,
  Settings,
  ShoppingBag,
  Tag,
  Trash2,
  Truck,
  X,
  type LucideIcon,
} from 'lucide-react';
import { Button, ErrorNotice, Loading } from '@/core/components';
import { useStores, type Store } from '@/features/stores';
import { whatsappShareUrl } from '@/utils/share';
import { useTableLabels } from '@/core/hooks/useTableLabels';

interface Section {
  path: string;
  label: string;
  icon: LucideIcon;
}
/** Menú agrupado por lo que hace el bodeguero en el día, no por módulo técnico. */
const groups: { title: string; items: Section[] }[] = [
  {
    title: 'Vender',
    items: [
      { path: '', label: 'Resumen', icon: House },
      { path: '/ordenes', label: 'Pedidos', icon: ShoppingBag },
      { path: '/ofertas', label: 'Ofertas', icon: Tag },
    ],
  },
  {
    title: 'Catálogo',
    items: [
      { path: '/productos', label: 'Productos', icon: Package },
      { path: '/categorias', label: 'Categorías', icon: LayoutGrid },
    ],
  },
  {
    title: 'Almacén',
    items: [
      { path: '/inventario', label: 'Stock', icon: Boxes },
      { path: '/compras', label: 'Compras a proveedores', icon: Truck },
      { path: '/inventario/mermas', label: 'Mermas', icon: Trash2 },
      { path: '/inventario/movimientos', label: 'Movimientos', icon: History },
    ],
  },
  { title: 'Mi bodega', items: [{ path: '/configuracion', label: 'Configuración', icon: Settings }] },
];
/** Las cuatro tareas más frecuentes van en la barra inferior del celular. */
const tabs: Section[] = [
  { path: '', label: 'Inicio', icon: House },
  { path: '/ordenes', label: 'Pedidos', icon: ShoppingBag },
  { path: '/productos', label: 'Productos', icon: Package },
  { path: '/inventario', label: 'Stock', icon: Boxes },
];

function NavGroups({ store }: { store: Store }) {
  return (
    <nav aria-label="Administración de la bodega">
      {groups.map((group) => (
        <div className="nav-group" key={group.title}>
          <span>{group.title}</span>
          {group.items.map(({ path, label, icon: Icon }) => (
            <NavLink key={path} end to={`/admin/${store.id}${path}`}>
              <Icon size={18} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </div>
      ))}
    </nav>
  );
}

function StoreSwitch({ store }: { store: Store }) {
  return (
    <Link className="store-switch" to="/admin" title="Cambiar de bodega">
      <span className="store-initial" aria-hidden="true">
        {store.name.slice(0, 1).toUpperCase()}
      </span>
      <span>
        <strong>{store.name}</strong>
        <small>Cambiar de bodega</small>
      </span>
      <ChevronsUpDown size={16} aria-hidden="true" />
    </Link>
  );
}

/** Verifica pertenencia usando el listado del propietario antes de mostrar la tienda. */
export function AdminLayout() {
  const { storeId = '' } = useParams();
  const stores = useStores(true);
  const [moreOpen, setMoreOpen] = useState(false);
  const sheet = useRef<HTMLDialogElement>(null);
  const content = useRef<HTMLDivElement>(null);
  useTableLabels(content);
  const { pathname } = useLocation();
  useEffect(() => setMoreOpen(false), [pathname]);
  useEffect(() => {
    const element = sheet.current;
    if (!element) return;
    if (moreOpen && !element.open) element.showModal();
    if (!moreOpen && element.open) element.close();
  }, [moreOpen]);
  if (stores.loading) return <Loading />;
  if (stores.error) return <ErrorNotice message={stores.error} retry={stores.reload} />;
  const store = stores.data?.find((item) => item.id === storeId) as Store | undefined;
  if (!store)
    return <ErrorNotice message="No se encontró esta bodega entre las que administras." />;
  const share = whatsappShareUrl(store);
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <StoreSwitch store={store} />
        <NavGroups store={store} />
        <div className="sidebar-share">
          <Link className="button secondary" to={`/tienda/${store.subdomain}`}>
            <ExternalLink size={16} aria-hidden="true" />
            Ver mi tienda
          </Link>
          <a className="button secondary" href={share} target="_blank" rel="noreferrer">
            <MessageCircle size={16} aria-hidden="true" />
            Compartir por WhatsApp
          </a>
        </div>
      </aside>

      <div className="admin-content" ref={content}>
        <div className="mobile-storebar">
          <StoreSwitch store={store} />
          <Link
            className="button secondary"
            to={`/tienda/${store.subdomain}`}
            aria-label="Ver mi tienda"
          >
            <ExternalLink size={17} />
          </Link>
        </div>
        <Outlet context={store} />
      </div>

      <nav className="mobile-tabbar" aria-label="Accesos principales">
        {tabs.map(({ path, label, icon: Icon }) => (
          <NavLink key={path} end to={`/admin/${store.id}${path}`}>
            <Icon size={20} aria-hidden="true" />
            {label}
          </NavLink>
        ))}
        <button type="button" onClick={() => setMoreOpen(true)} aria-haspopup="dialog">
          <Menu size={20} aria-hidden="true" />
          Más
        </button>
      </nav>
      <dialog
        ref={sheet}
        className="more-sheet"
        aria-label="Todas las secciones"
        onCancel={(event) => {
          event.preventDefault();
          setMoreOpen(false);
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) setMoreOpen(false);
        }}
      >
        <div className="more-sheet-head">
          <strong>{store.name}</strong>
          <Button variant="secondary" aria-label="Cerrar menú" onClick={() => setMoreOpen(false)}>
            <X size={18} />
          </Button>
        </div>
        <NavGroups store={store} />
        <div className="sidebar-share" style={{ marginTop: 16 }}>
          <a className="button secondary" href={share} target="_blank" rel="noreferrer">
            <MessageCircle size={16} aria-hidden="true" />
            Compartir mi tienda por WhatsApp
          </a>
        </div>
      </dialog>
    </div>
  );
}

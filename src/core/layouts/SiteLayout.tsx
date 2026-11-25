import { Link, Outlet, useLocation } from 'react-router-dom';
import { LogOut, Store } from 'lucide-react';
import { Button } from '@/core/components';
import { useSession } from '@/context/SessionContext';
import { APP_NAME } from '@/config';

/** Marco global con identidad de marca y navegación de sesión. */
export function SiteLayout() {
  const { user, logout } = useSession();
  const isLanding = useLocation().pathname === '/';
  return (
    <div className={isLanding ? 'landing-site' : undefined}>
      <a className="skip-link" href="#contenido">
        Ir al contenido principal
      </a>
      <header className="site-header">
        <div className="header-inner">
          <Link to="/" className="brand" aria-label={`${APP_NAME}, inicio`}>
            <Store size={27} />
            <span>
              {APP_NAME}
              <span className="brand-dot">.</span>
            </span>
          </Link>
          <nav aria-label="Navegación principal">
            {isLanding ? (
              <>
                <a className="nav-anchor" href="#funciones">Qué incluye</a>
                <a className="nav-anchor" href="#como-empezar">Cómo empezar</a>
                <Link to="/tiendas">Tiendas</Link>
              </>
            ) : (
              <Link to="/tiendas">Tiendas</Link>
            )}
            {user?.role === 'ADMIN' && <Link to="/admin">Mi bodega</Link>}
            {user?.role === 'SUPER_ADMIN' && <Link to="/superadmin">Gestión de plataforma</Link>}
          </nav>
          <div className="header-account">
            {user ? (
              <>
                <span className="user-name">{user.fullName}</span>
                <Button
                  variant="secondary"
                  aria-label="Cerrar sesión"
                  onClick={() => {
                    logout();
                    // Vuelve al inicio después de cerrar la sesión.
                    window.location.replace('/');
                  }}
                >
                  <LogOut size={16} />
                  <span className="desktop-label">Salir</span>
                </Button>
              </>
            ) : (
              <>
                <Link to="/ingresar">Iniciar sesión</Link>
                <Link className="button primary" to="/registro">
                  Crear mi tienda
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main id="contenido" className="main-container">
        <Outlet />
      </main>
      <footer className="site-footer">
        <span className="brand">{APP_NAME}.</span>
        <span>La tienda en línea de tu bodega.</span>
        <Link to="/tiendas">Ver todas las tiendas</Link>
      </footer>
    </div>
  );
}

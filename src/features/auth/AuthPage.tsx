import { AuthForm } from './components/AuthForm';

const CATEGORIES = [
  { name: 'Abarrotes', items: 'Arroz, azúcar, aceite...' },
  { name: 'Bebidas', items: 'Agua, gaseosas, jugos...' },
  { name: 'Lácteos', items: 'Leche, queso, yogur...' },
  { name: 'Panadería', items: 'Pan, galletas, tostadas...' },
  { name: 'Limpieza', items: 'Jabón, detergente, lejía...' },
  { name: 'Snacks', items: 'Papas, chifles, maní...' },
  { name: 'Carnes', items: 'Pollo, res, menudencia...' },
  { name: 'Licores', items: 'Cerveza, vino, ron...' },
];

/** Vista pública de acceso y registro, centrada y adaptable a dispositivos móviles. */
export function AuthPage({ register = false }: { register?: boolean }) {
  return (
    <div className="auth-layout">
      {/* Panel visual izquierdo */}
      <div className="auth-visual" aria-hidden="true">
        <div className="auth-visual-inner">
          <p className="auth-visual-brand">Bodeko.</p>
          <p className="auth-visual-tagline">
            Vende tus<br />productos<br />en línea.
          </p>

          <div className="auth-cat-grid">
            {CATEGORIES.map((cat) => (
              <div key={cat.name} className="auth-cat-card">
                <span className="auth-cat-name">{cat.name}</span>
                <span className="auth-cat-items">{cat.items}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Formulario */}
      <section className="card auth-card">
        <h2>{register ? 'Crea tu cuenta' : 'Bienvenido de nuevo'}</h2>
        <p className="muted">
          {register
            ? 'Registra tu cuenta de propietario para crear y gestionar tu tienda.'
            : 'Ingresa para gestionar tu negocio.'}
        </p>
        <AuthForm key={register ? 'register' : 'login'} register={register} />
      </section>
    </div>
  );
}

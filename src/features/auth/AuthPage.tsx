import { AuthForm } from './components/AuthForm';

/** Vista pública de acceso y registro, centrada y adaptable a dispositivos móviles. */
export function AuthPage({ register = false }: { register?: boolean }) {
  return (
    <div className="auth-layout">
      {/* Panel visual izquierdo */}
      <div className="auth-visual" aria-hidden="true">
        <div className="auth-visual-inner">
          <p className="auth-visual-brand">Bodeko.</p>
          <p className="auth-visual-tagline">Tu bodega,<br />en el celular<br />de tus vecinos.</p>

          {/* Tarjetas flotantes animadas */}
          <div className="auth-float-card auth-float-1">
            <span className="auth-float-label">Vendido hoy</span>
            <span className="auth-float-value">S/ 248</span>
            <span className="auth-float-hint">↑ 3 pedidos cobrados</span>
          </div>

          <div className="auth-float-card auth-float-2">
            <div className="auth-float-row">
              <span className="auth-float-dot" />
              <span>Bodega Doña Rosa</span>
            </div>
            <div className="auth-float-row auth-float-row-muted">
              <span>Nuevo pedido</span>
              <strong>S/ 85</strong>
            </div>
          </div>

          <div className="auth-float-card auth-float-3">
            <span className="auth-float-label">Stock bajo</span>
            <div className="auth-float-items">
              <span>Leche Gloria 1L</span>
              <span>Arroz Costeño 5kg</span>
            </div>
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

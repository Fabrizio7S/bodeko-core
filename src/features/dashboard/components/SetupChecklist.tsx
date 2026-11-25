import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import type { Store } from '@/features/stores';
import type { DashboardMetrics } from '../types';

const sharedKey = (storeId: string) => `bodeko.shared.${storeId}`;
function readShared(storeId: string): boolean {
  try {
    return localStorage.getItem(sharedKey(storeId)) === '1';
  } catch {
    return false;
  }
}

/** Primeros pasos de una bodega nueva. Desaparece cuando todo está hecho. */
export function SetupChecklist({
  store,
  metrics,
  onShare,
}: {
  store: Store;
  metrics: DashboardMetrics;
  onShare: () => void;
}) {
  const [shared, setShared] = useState(() => readShared(store.id));
  const base = `/admin/${store.id}`;
  const steps = [
    { done: metrics.categories > 0, label: 'Crea tus categorías', hint: 'Abarrotes, bebidas, limpieza…', to: `${base}/categorias` },
    { done: metrics.products > 0, label: 'Agrega tu primer producto', hint: 'Con precio y foto', to: `${base}/productos` },
    { done: metrics.activeProducts > 0, label: 'Ponlo a la venta', hint: 'Cambia su estado a Activo', to: `${base}/productos` },
    { done: shared, label: 'Comparte tu tienda', hint: 'Copia el enlace', to: '' },
  ];
  const completed = steps.filter((step) => step.done).length;
  if (completed === steps.length) return null;
  return (
    <section className="card setup" aria-labelledby="setup-title">
      <div>
        <h2 id="setup-title">Deja lista tu bodega</h2>
        <p>
          {completed} de {steps.length} pasos. Al terminar, tus clientes ya pueden pedirte desde el
          celular.
        </p>
        <div className="setup-progress" aria-hidden="true">
          <i style={{ width: `${(completed / steps.length) * 100}%` }} />
        </div>
      </div>
      <ol className="setup-steps">
        {steps.map((step, index) => {
          const content = (
            <>
              <span className="setup-check" aria-hidden="true">
                {step.done ? <Check size={14} strokeWidth={3} /> : index + 1}
              </span>
              <span>
                {step.label}
                {!step.done && <small style={{ display: 'block' }}>{step.hint}</small>}
              </span>
            </>
          );
          return (
            <li key={step.label} className={step.done ? 'done' : undefined}>
              {step.to ? (
                <Link to={step.to}>{content}</Link>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    onShare();
                    try {
                      localStorage.setItem(sharedKey(store.id), '1');
                    } catch {
                      /* sin almacenamiento: el paso se marca solo en esta visita */
                    }
                    setShared(true);
                  }}
                >
                  {content}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

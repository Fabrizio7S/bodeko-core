import { Link } from 'react-router-dom';

/** Indicador del resumen: etiqueta, valor ya formateado y una línea de contexto. */
export interface MetricCardProps {
  label: string;
  value: string;
  hint?: string;
  /** Si se indica, toda la tarjeta lleva a esa sección. */
  to?: string;
  /** Resalta el valor cuando requiere acción. */
  alert?: boolean;
}
/** Tarjeta de indicador de lectura rápida. */
export function MetricCard({ label, value, hint, to, alert }: MetricCardProps) {
  const className = `card kpi${alert ? ' kpi-alert' : ''}`;
  const body = (
    <>
      <span className="kpi-label">{label}</span>
      <strong className="kpi-value">{value}</strong>
      {hint && <small>{hint}</small>}
    </>
  );
  return to ? (
    <Link className={className} to={to}>
      {body}
    </Link>
  ) : (
    <article className={className}>{body}</article>
  );
}

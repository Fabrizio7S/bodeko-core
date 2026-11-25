import { money } from '@/utils/format';
import type { DaySales } from '../types';

const weekday = new Intl.DateTimeFormat('es-PE', { weekday: 'short' });

/** Barras simples de 7 días; el día de hoy va en tinta para ubicarse rápido. */
export function WeekChart({ week, currency }: { week: DaySales[]; currency: string }) {
  const max = Math.max(...week.map((day) => day.total), 0);
  const last = week.length - 1;
  return (
    <div className="week-chart" role="list" aria-label="Ventas cobradas por día">
      {week.map((day, index) => {
        const [y = 0, m = 1, d = 1] = day.date.split('-').map(Number);
        const label = index === last ? 'Hoy' : weekday.format(new Date(y, m - 1, d)).replace('.', '');
        const height = max ? Math.max(2, (day.total / max) * 100) : 2;
        return (
          <div
            key={day.date}
            role="listitem"
            className={`week-bar${index === last ? ' is-today' : ''}`}
            aria-label={`${label}: ${money(day.total, currency)}, ${day.orders} pedidos`}
            title={`${day.orders} pedidos`}
          >
            <b aria-hidden="true">{day.total ? money(day.total, currency).replace(/\.00$/, '') : ''}</b>
            <span className="week-track" aria-hidden="true">
              <i style={{ height: `${height}%` }} />
            </span>
            <span aria-hidden="true">{label}</span>
          </div>
        );
      })}
    </div>
  );
}

import { useEffect, type RefObject } from 'react';

/** Copia el texto de cada encabezado en data-label de sus celdas. */
function labelTables(root: HTMLElement) {
  root.querySelectorAll('table').forEach((table) => {
    const headers = Array.from(table.querySelectorAll('thead th')).map(
      (th) => th.textContent?.trim() ?? '',
    );
    table.querySelectorAll('tbody tr').forEach((row) => {
      Array.from(row.children).forEach((cell, index) => {
        const label = headers[index] ?? '';
        if (cell.getAttribute('data-label') !== label) cell.setAttribute('data-label', label);
      });
    });
  });
}

/**
 * En celular las tablas se muestran como tarjetas (ver .admin-content table en theme.css).
 * Este hook pone la etiqueta de la columna en cada celda sin tocar cada página.
 */
export function useTableLabels(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    labelTables(root);
    const observer = new MutationObserver(() => labelTables(root));
    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  });
}

import type { PublicStore } from '@/features/stores';

/** Enlace público del catálogo de una bodega. */
export function storeUrl(store: Pick<PublicStore, 'subdomain'>): string {
  return `${window.location.origin}/tienda/${encodeURIComponent(store.subdomain)}`;
}

/** Mensaje listo para que el bodeguero comparta su tienda con sus clientes por WhatsApp. */
export function whatsappShareUrl(store: Pick<PublicStore, 'name' | 'subdomain'>): string {
  const text = `¡Hola! Ya puedes ver los productos de ${store.name} y hacer tu pedido aquí: ${storeUrl(store)}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

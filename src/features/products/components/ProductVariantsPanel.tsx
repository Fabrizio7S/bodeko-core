import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { ChevronDown, ChevronUp, Package, PenLine, TrendingDown, TrendingUp } from 'lucide-react';
import { Button, ErrorNotice, Field, Loading } from '@/core/components';
import { useResource } from '@/core/hooks/useResource';
import { useAction } from '@/core/hooks/useAction';
import { inventoryService } from '@/features/inventory/services/inventoryService';
import { isInteger, isMoney } from '@/utils/validation';
import { productVariantService } from '../services/productVariantService';
import type { ProductVariant } from '../types';

/** Administra SKU, opciones, precio y existencias de las variantes de un producto. */
export function ProductVariantsPanel({ storeId, productId }: { storeId: string; productId: string }) {
  const [sku, setSku] = useState('');
  const [optionsText, setOptionsText] = useState('');
  const [price, setPrice] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const action = useAction();
  const resource = useResource(
    useCallback(() => productVariantService.list(storeId, productId), [storeId, productId]),
  );
  const parsedOptions = optionsText.split(',').map((p) => p.trim()).filter(Boolean);
  const options = Object.fromEntries(parsedOptions.map((p) => {
    const [key = '', ...value] = p.split('=');
    return [key.trim(), value.join('=').trim()];
  }));
  const optionsValid = parsedOptions.length > 0 && parsedOptions.length <= 8
    && parsedOptions.every((p) => p.includes('='))
    && Object.keys(options).length === parsedOptions.length
    && Object.entries(options).every(([k, v]) => k && v && k.length <= 40 && v.length <= 80)
    && new Set(parsedOptions.map((p) => (p.split('=')[0] ?? '').trim().toLowerCase())).size === parsedOptions.length;

  async function create(event: FormEvent) {
    event.preventDefault();
    setSubmitted(true);
    if (!sku.trim() || !optionsValid || !isMoney(price) || Number(price) < 0.01 || Number(price) > 100000) return;
    const result = await action.run(
      () => productVariantService.create(storeId, productId, { sku: sku.trim(), options, basePrice: Number(price) }),
      'Variante agregada.',
    );
    if (result) {
      setSku(''); setOptionsText(''); setPrice('');
      setSubmitted(false); setShowAdd(false);
      resource.reload();
    }
  }

  return (
    <section className="card vp-panel" aria-labelledby="variant-heading">
      <div className="vp-panel-header">
        <div>
          <h3 id="variant-heading">Variantes y existencias</h3>
          <p className="vp-panel-desc">
            Cada variante tiene su propio SKU, precio y stock. Úsalas para diferentes tamaños, sabores o presentaciones.
          </p>
        </div>
      </div>

      <ErrorNotice message={resource.error || action.error} retry={resource.reload} />

      {resource.loading ? (
        <Loading />
      ) : (
        <div className="vp-list">
          {(resource.data ?? []).map((variant) => (
            <VariantStockRow
              key={variant.id}
              storeId={storeId}
              productId={productId}
              variant={variant}
              onSaved={resource.reload}
            />
          ))}
        </div>
      )}

      {/* Botón para mostrar/ocultar form de nueva variante */}
      <button
        type="button"
        className="vp-add-toggle"
        onClick={() => setShowAdd((v) => !v)}
        aria-expanded={showAdd}
      >
        {showAdd ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        {showAdd ? 'Cancelar' : '+ Agregar nueva variante'}
      </button>

      {showAdd && (
        <form className="vp-add-form form-stack" noValidate onSubmit={(e) => void create(e)}>
          <div className="vp-add-form-hint">
            <Package size={16} />
            <span>Ejemplo: una presentación de 1 kg y otra de 5 kg son dos variantes del mismo producto.</span>
          </div>
          <Field
            label="SKU (código único)"
            example="ARROZ-5KG"
            value={sku}
            maxLength={80}
            onChange={(v) => setSku(v.replace(/[^A-Za-z0-9._-]/g, ''))}
            error={submitted && !sku.trim() ? 'Ingresa un SKU.' : ''}
            required
          />
          <Field
            label="Opciones"
            example="Tamaño=5kg  ó  Talla=M, Color=Negro"
            value={optionsText}
            maxLength={500}
            onChange={setOptionsText}
            error={submitted && !optionsValid ? 'Usa el formato Nombre=Valor, separados por coma.' : ''}
            required
          />
          <Field
            label="Precio"
            example="20.00"
            rule="money"
            inputMode="decimal"
            value={price}
            onChange={setPrice}
            error={submitted && (!isMoney(price) || Number(price) < 0.01) ? 'Ingresa un precio válido.' : ''}
            required
          />
          <Button type="submit" pending={action.pending}>Guardar variante</Button>
        </form>
      )}
    </section>
  );
}

function VariantStockRow({ storeId, productId, variant, onSaved }: {
  storeId: string; productId: string; variant: ProductVariant; onSaved: () => void;
}) {
  const [quantity, setQuantity] = useState(String(variant.quantity));
  const [editing, setEditing] = useState(false);
  const [sku, setSku] = useState(variant.sku);
  const [optionsText, setOptionsText] = useState(
    Object.entries(variant.options).map(([k, v]) => `${k}=${v}`).join(', '),
  );
  const [price, setPrice] = useState(String(variant.basePrice));
  const [movementType, setMovementType] = useState('STOCK_ENTRY');
  const [stockReason, setStockReason] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const action = useAction();
  const editAction = useAction();
  const statusAction = useAction();

  useEffect(() => {
    setQuantity(String(variant.quantity));
    setSku(variant.sku);
    setOptionsText(Object.entries(variant.options).map(([k, v]) => `${k}=${v}`).join(', '));
    setPrice(String(variant.basePrice));
  }, [variant]);

  const optionLabels = Object.entries(variant.options).map(([k, v]) => `${k}: ${v}`);
  const parsedOptions = optionsText.split(',').map((p) => p.trim()).filter(Boolean);
  const updatedOptions = Object.fromEntries(parsedOptions.map((p) => {
    const [key = '', ...value] = p.split('=');
    return [key.trim(), value.join('=').trim()];
  }));
  const validOptions = parsedOptions.length > 0 && parsedOptions.length <= 8
    && parsedOptions.every((p) => p.includes('='))
    && Object.keys(updatedOptions).length === parsedOptions.length
    && Object.entries(updatedOptions).every(([k, v]) => k.length > 0 && k.length <= 40 && v.length > 0 && v.length <= 80)
    && new Set(parsedOptions.map((p) => (p.split('=')[0] ?? '').trim().toLowerCase())).size === parsedOptions.length;

  const isEntry = movementType === 'STOCK_ENTRY' || movementType === 'RETURN';

  return (
    <div className={`vp-row ${variant.active ? '' : 'vp-row--paused'}`}>
      {/* Cabecera de la variante */}
      <div className="vp-row-header">
        <div className="vp-row-info">
          {optionLabels.length > 0 ? (
            <div className="vp-row-chips">
              {optionLabels.map((label) => (
                <span key={label} className="vp-chip">{label}</span>
              ))}
            </div>
          ) : (
            <span className="vp-row-chips"><span className="vp-chip">Presentación estándar</span></span>
          )}
          <span className="vp-row-sku">{variant.sku}</span>
          <span className="vp-row-price">S/ {variant.basePrice.toFixed(2)}</span>
        </div>
        <div className="vp-row-actions">
          <span className={`vp-badge ${variant.active ? 'vp-badge--active' : 'vp-badge--paused'}`}>
            {variant.active ? 'Activa' : 'Pausada'}
          </span>
          <Button
            type="button"
            variant="secondary"
            pending={statusAction.pending}
            onClick={() =>
              void statusAction.run(
                () => productVariantService.changeStatus(storeId, productId, variant.id, !variant.active),
                variant.active ? 'Variante pausada.' : 'Variante activada.',
              ).then((r) => { if (r) onSaved(); })
            }
          >
            {variant.active ? 'Pausar venta' : 'Activar venta'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => setEditing((v) => !v)}>
            <PenLine size={14} />
            {editing ? 'Cancelar' : 'Editar'}
          </Button>
        </div>
      </div>

      <ErrorNotice message={statusAction.error} />

      {/* Formulario de edición (colapsable) */}
      {editing && (
        <form
          className="vp-edit-form form-stack"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(true);
            if (!sku.trim() || !validOptions || !isMoney(price) || Number(price) < 0.01 || Number(price) > 100000) return;
            void editAction.run(
              () => productVariantService.update(storeId, productId, variant.id, {
                sku: sku.trim(), options: updatedOptions, basePrice: Number(price),
              }),
              'Variante actualizada.',
            ).then((r) => { if (r) { setEditing(false); setSubmitted(false); onSaved(); } });
          }}
        >
          <Field label="SKU" example="POLO-NEG-M" value={sku} maxLength={80}
            onChange={(v) => setSku(v.replace(/[^A-Za-z0-9._-]/g, ''))}
            error={submitted && !sku.trim() ? 'Ingresa un SKU válido.' : ''} required />
          <Field label="Opciones" example="Talla=M, Color=Negro" value={optionsText} maxLength={500}
            onChange={setOptionsText}
            error={submitted && !validOptions ? 'Revisa el formato y usa nombres distintos.' : ''} required />
          <Field label="Precio" example="29.90" rule="money" inputMode="decimal" value={price}
            onChange={setPrice}
            error={submitted && (!isMoney(price) || Number(price) < 0.01 || Number(price) > 100000) ? 'Ingresa un precio válido.' : ''} required />
          <ErrorNotice message={editAction.error} />
          <Button type="submit" pending={editAction.pending}>Guardar cambios</Button>
        </form>
      )}

      {/* Bloque de stock */}
      <div className="vp-stock-block">
        <div className="vp-stock-current">
          <span className="vp-stock-label">Stock actual</span>
          <span className={`vp-stock-qty ${variant.quantity === 0 ? 'vp-stock-qty--zero' : ''}`}>
            {variant.quantity}
            <span className="vp-stock-unit">unid.</span>
          </span>
        </div>

        <form
          className="vp-stock-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (!isInteger(quantity, 0)) return;
            void action.run(
              () => inventoryService.variantQuantity(storeId, productId, variant.id, Number(quantity), movementType, stockReason),
              'Existencias actualizadas.',
            ).then((r) => { if (r) onSaved(); });
          }}
        >
          <div className="vp-stock-form-title">
            {isEntry
              ? <><TrendingUp size={15} className="vp-stock-icon-in" /> Registrar entrada</>
              : <><TrendingDown size={15} className="vp-stock-icon-out" /> Registrar salida / ajuste</>
            }
          </div>

          <div className="vp-stock-fields">
            <label className="field vp-stock-type">
              <span>¿Qué ocurrió?</span>
              <select value={movementType} onChange={(e) => setMovementType(e.target.value)}>
                <option value="STOCK_ENTRY">Llegó mercadería nueva</option>
                <option value="RETURN">Devolución de cliente</option>
                <option value="ADJUSTMENT">Corrección de conteo</option>
                <option value="DAMAGE">Producto dañado / merma</option>
                <option value="LOSS">Pérdida o robo</option>
              </select>
            </label>

            <Field
              label="Nueva cantidad total"
              example="12"
              rule="digits"
              inputMode="numeric"
              value={quantity}
              onChange={setQuantity}
              error={!isInteger(quantity, 0) ? 'Ingresa un número entero.' : ''}
            />

            <Field
              label="Motivo (opcional)"
              example="Reposición semanal"
              value={stockReason}
              maxLength={500}
              onChange={setStockReason}
            />
          </div>

          <Button type="submit" variant="secondary" pending={action.pending}>
            Actualizar stock
          </Button>
          <ErrorNotice message={action.error} />
        </form>
      </div>
    </div>
  );
}

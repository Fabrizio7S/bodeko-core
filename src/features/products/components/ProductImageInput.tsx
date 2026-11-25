import { useEffect, useId, useRef, useState, type ChangeEvent } from 'react';
import { ImageOff, ImageUp, LoaderCircle, Trash2 } from 'lucide-react';
import { errorMessage } from '@/utils/errors';
import { productService } from '../services/productService';

/** Mismos límites que valida la API; se revisan antes de subir para avisar al instante. */
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_BYTES = 5 * 1024 * 1024;

export interface ProductImageInputProps {
  storeId: string;
  /** URL pública actual del producto (al editar) o vacío. */
  initialUrl?: string | null;
  /** Valor para `imageUrl`: la ruta subida, la URL original o null si se quitó. */
  onChange: (value: string | null) => void;
  /** Avisa mientras hay una subida en curso, para no guardar el producto a medias. */
  onBusyChange?: (busy: boolean) => void;
}

/** Elige una imagen del equipo, la sube a la tienda y muestra la vista previa. */
export function ProductImageInput({
  storeId,
  initialUrl,
  onChange,
  onBusyChange,
}: ProductImageInputProps) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const attempt = useRef(0);
  const localPreview = useRef<string | null>(null);
  const [preview, setPreview] = useState<string | null>(initialUrl || null);
  const [broken, setBroken] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  function releaseLocalPreview() {
    if (localPreview.current) URL.revokeObjectURL(localPreview.current);
    localPreview.current = null;
  }
  useEffect(() => releaseLocalPreview, []);
  useEffect(() => onBusyChange?.(uploading), [uploading, onBusyChange]);

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Permite volver a elegir el mismo archivo después de un error.
    event.target.value = '';
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Solo se admiten imágenes JPG, PNG, WEBP o GIF.');
      return;
    }
    if (file.size > MAX_BYTES) {
      setError('La imagen pesa más de 5 MB. Elige una más liviana.');
      return;
    }
    const current = ++attempt.current;
    const previous = preview;
    releaseLocalPreview();
    localPreview.current = URL.createObjectURL(file);
    setPreview(localPreview.current);
    setBroken(false);
    setError('');
    setUploading(true);
    try {
      const uploaded = await productService.uploadImage(storeId, file);
      if (current !== attempt.current) return;
      onChange(uploaded.path);
      // Si el bucket no tiene URL pública configurada, se mantiene la vista previa local.
      if (/^https?:\/\//i.test(uploaded.url)) {
        releaseLocalPreview();
        setPreview(uploaded.url);
      }
    } catch (failure) {
      if (current !== attempt.current) return;
      releaseLocalPreview();
      setPreview(previous);
      setError(errorMessage(failure));
    } finally {
      if (current === attempt.current) setUploading(false);
    }
  }

  function remove() {
    attempt.current++;
    releaseLocalPreview();
    setPreview(null);
    setUploading(false);
    setError('');
    onChange(null);
  }

  return (
    <div className="field image-input">
      <span className="field-label" id={`${id}-label`}>
        Imagen del producto (opcional)
      </span>
      <div className="image-input-body">
        <div className="image-input-preview" aria-busy={uploading}>
          {preview && !broken ? (
            <img src={preview} alt="Vista previa de la imagen" onError={() => setBroken(true)} />
          ) : (
            <ImageOff size={28} aria-hidden="true" />
          )}
          {uploading && (
            <span className="image-input-overlay">
              <LoaderCircle size={22} className="spin" aria-hidden="true" />
            </span>
          )}
        </div>
        <div className="image-input-actions">
          <input
            ref={input}
            id={id}
            type="file"
            accept={ACCEPTED_TYPES.join(',')}
            className="sr-only"
            tabIndex={-1}
            aria-labelledby={`${id}-label`}
            onChange={(event) => void upload(event)}
          />
          <button
            type="button"
            className="button secondary"
            disabled={uploading}
            aria-describedby={`${id}-help`}
            onClick={() => input.current?.click()}
          >
            <ImageUp size={16} aria-hidden="true" />
            {uploading ? 'Subiendo…' : preview ? 'Cambiar imagen' : 'Subir imagen'}
          </button>
          {preview && !uploading && (
            <button type="button" className="button secondary" onClick={remove}>
              <Trash2 size={16} aria-hidden="true" />
              Quitar
            </button>
          )}
        </div>
      </div>
      <small id={`${id}-help`} className={error ? 'field-error' : ''} role={error ? 'alert' : undefined}>
        {error || 'JPG, PNG, WEBP o GIF de hasta 5 MB.'}
      </small>
    </div>
  );
}

import { useRef, useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { validateImageFile, uploadImage, removeImage } from '@/lib/storage';
import { useToast } from '@/components/Toast';

interface Props {
  value: string | null;
  onChange: (url: string | null) => void;
  kind: 'logo' | 'product';
  label?: string;
  shape?: 'square' | 'circle';
  size?: number;
  className?: string;
}

export function ImageUpload({
  value,
  onChange,
  kind,
  label = 'Upload image',
  shape = 'square',
  size = 80,
  className = '',
}: Props) {
  const { session } = useAuth();
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !session) return;

    const err = validateImageFile(file);
    if (err) {
      toast(err, 'error');
      return;
    }

    setUploading(true);
    try {
      if (value) await removeImage(value);
      const url = await uploadImage(session.user.id, file, kind);
      onChange(url);
      toast('Image uploaded.');
    } catch {
      toast('Could not upload image. Please try again.', 'error');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  async function handleRemove() {
    if (value) await removeImage(value);
    onChange(null);
  }

  const shapeCls = shape === 'circle' ? 'rounded-full' : 'rounded-xl';

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFile}
        className="hidden"
      />
      {value ? (
        <div className="flex items-center gap-3">
          <img
            src={value}
            alt="Preview"
            className={`${shapeCls} object-cover border border-stone-200`}
            style={{ width: size, height: size }}
          />
          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-700 transition hover:bg-stone-50 disabled:opacity-60"
            >
              {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
              Replace
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
            >
              <X size={13} />
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={`flex ${shapeCls} border-2 border-dashed border-stone-300 items-center justify-center bg-stone-50 text-stone-400 transition hover:border-stone-400 hover:text-stone-500 disabled:opacity-60`}
          style={{ width: size, height: size }}
        >
          {uploading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Upload size={20} />
          )}
        </button>
      )}
      {label && !value && (
        <p className="mt-1.5 text-xs text-stone-400">{label}</p>
      )}
    </div>
  );
}

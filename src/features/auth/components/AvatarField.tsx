import { useEffect, useRef, useState } from 'react';
import { Trash2, Upload, UserCircle } from 'lucide-react';

import { Button, Icon, Text } from '@/shared/components/ui';

interface AvatarFieldProps {
  /** avatarUrl actual del usuario (user_metadata), si ya tiene uno guardado. */
  initialUrl?: string;
  /** Se emite con el File elegido, o null al eliminar. La subida a Storage la hace el caller. */
  onChange: (file: File | null) => void;
}

/**
 * Selección de foto de perfil sin librería: input file nativo + preview local
 * vía URL.createObjectURL hasta que el caller sube el file y confirma
 * avatarUrl; revoca la object URL al reemplazar/desmontar para no filtrar memoria.
 */
export function AvatarField({ initialUrl, onChange }: AvatarFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialUrl ?? null);
  // Solo los object URLs propios (creados por este componente) se revocan —
  // initialUrl es una URL http de Storage, revocarla sería un no-op inofensivo
  // pero incorrecto conceptualmente: no la creamos, no nos toca liberarla.
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const nextUrl = URL.createObjectURL(file);
    objectUrlRef.current = nextUrl;
    setPreviewUrl(nextUrl);
    onChange(file);
  };

  const handleRemove = () => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = null;
    setPreviewUrl(null);
    if (inputRef.current) inputRef.current.value = '';
    onChange(null);
  };

  return (
    <div className="flex flex-col gap-2">
      <Text variant="body-sm" className="text-muted font-semibold">
        Profile picture
      </Text>

      <div className="flex items-center gap-4">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Profile preview"
            className="border-border size-16 rounded-full border object-cover"
          />
        ) : (
          <Icon icon={UserCircle} size={64} className="text-muted" />
        )}

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => inputRef.current?.click()}>
            <Icon icon={Upload} />
            Upload
          </Button>
          {previewUrl && (
            <Button variant="ghost" onClick={handleRemove}>
              <Icon icon={Trash2} />
              Remove
            </Button>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => handleFile(event.target.files?.[0])}
        />
      </div>
    </div>
  );
}

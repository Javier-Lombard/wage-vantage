import { useEffect, useRef, useState } from 'react';
import { Trash2, Upload, UserCircle } from 'lucide-react';

import { Button, Icon, Text } from '@/shared/components/ui';

interface AvatarFieldProps {
  /** Se emite con el File elegido, o null al eliminar. Persistencia aún mockeada. */
  onChange: (file: File | null) => void;
}

/**
 * Selección de foto de perfil sin librería: input file nativo + preview local
 * vía URL.createObjectURL. No sube nada todavía (Supabase Storage pendiente);
 * revoca la object URL al reemplazar/desmontar para no filtrar memoria.
 */
export function AvatarField({ onChange }: AvatarFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    onChange(file);
  };

  const handleRemove = () => {
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
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

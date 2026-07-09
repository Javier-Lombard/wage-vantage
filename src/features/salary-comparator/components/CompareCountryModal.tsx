import { X } from 'lucide-react';
import { useState } from 'react';

import { Badge, Button, Icon, Modal } from '@/shared/components/ui';

import { CountryAwareCombobox } from './CountryAwareCombobox';
import { SALARY_FORM_FIELDS } from './fieldConfig';

import type { SalaryFormField } from './fieldConfig';

interface CompareCountryModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** País ya elegido en el SalaryForm — excluido del combobox, no tiene
   * sentido comparar un país contra sí mismo. */
  baseCountry: string | undefined;
  /** Países ya añadidos a la comparación — excluidos del combobox y
   * mostrados como chips con opción de quitar. */
  extraCountries: string[];
  onAddCountry: (country: string) => void;
  onRemoveCountry: (country: string) => void;
  /** true solo cuando el tier ya alcanzó su maxCountries y no tiene upsell
   * superior (premium en su tope) — ahí el botón se deshabilita en vez de
   * disparar un gate que no llevaría a ningún sitio. Para guest/free en su
   * límite, el botón sigue habilitado: el click es lo que dispara el gate
   * (login/upgrade) en el padre. */
  isAtHardLimit: boolean;
}

/** Reutiliza la config del primer combobox del form (país) para que el
 * selector del modal sea idéntico al del formulario, sin duplicar opciones ni
 * el endpoint de países. `country` siempre existe en SALARY_FORM_FIELDS; si se
 * eliminara, este throw lo hace evidente en desarrollo en vez de fallar mudo. */
function getCountryField(): SalaryFormField {
  const field = SALARY_FORM_FIELDS.find((f) => f.id === 'country');
  if (!field) throw new Error('Country field missing from SALARY_FORM_FIELDS');
  return field;
}

const COUNTRY_FIELD = getCountryField();

/**
 * Modal para elegir países contra los que comparar. Monta el mismo combobox de
 * país que el paso 1 del formulario (vía CountryAwareCombobox), excluyendo el
 * país base y los ya añadidos para que sea imposible elegir un duplicado. La
 * decisión de qué pasa al exceder el límite del tier (login/upgrade) vive en
 * el padre (SalaryCalculator) — este modal solo notifica la intención de
 * añadir vía onAddCountry.
 */
export function CompareCountryModal({
  isOpen,
  onClose,
  baseCountry,
  extraCountries,
  onAddCountry,
  onRemoveCountry,
  isAtHardLimit,
}: CompareCountryModalProps) {
  const [country, setCountry] = useState<string | null>(null);
  const excludeOptions = baseCountry ? [baseCountry, ...extraCountries] : extraCountries;

  const handleAdd = () => {
    if (!country) return;
    onAddCountry(country);
    setCountry(null);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Compare with another country">
      <div className="space-y-6">
        {extraCountries.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {extraCountries.map((extraCountry) => (
              <li key={extraCountry}>
                <Badge className="gap-1.5 pr-1.5">
                  {extraCountry}
                  <button
                    type="button"
                    onClick={() => onRemoveCountry(extraCountry)}
                    aria-label={`Remove ${extraCountry} from comparison`}
                    className="hover:bg-info/20 rounded-sm"
                  >
                    <Icon icon={X} size={14} />
                  </button>
                </Badge>
              </li>
            ))}
          </ul>
        )}

        <CountryAwareCombobox
          field={COUNTRY_FIELD}
          value={country}
          fetchedOptions={undefined}
          isFetchingOptions={false}
          onChange={setCountry}
          excludeOptions={excludeOptions}
        />

        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={!country || isAtHardLimit} onClick={handleAdd}>
            Add country
          </Button>
        </div>
      </div>
    </Modal>
  );
}

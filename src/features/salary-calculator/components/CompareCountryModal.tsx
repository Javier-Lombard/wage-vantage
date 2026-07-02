import { useState } from 'react';

import { Button, Modal } from '@/shared/components/ui';

import { CountryAwareCombobox } from './CountryAwareCombobox';
import { SALARY_FORM_FIELDS } from './fieldConfig';

interface CompareCountryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/** Reutiliza la config del primer combobox del form (país) para que el
 * selector del modal sea idéntico al del formulario, sin duplicar opciones ni
 * el endpoint de países. `country` siempre existe en SALARY_FORM_FIELDS; si se
 * eliminara, este throw lo hace evidente en desarrollo en vez de fallar mudo. */
const COUNTRY_FIELD = SALARY_FORM_FIELDS.find((field) => field.id === 'country');

if (!COUNTRY_FIELD) {
  throw new Error('Country field missing from SALARY_FORM_FIELDS');
}

/**
 * Modal para elegir el país contra el que comparar. Monta el mismo combobox de
 * país que el paso 1 del formulario (vía CountryAwareCombobox, que trae sus
 * opciones del endpoint de países). La comparación real —segundo box-plot— es
 * una fase posterior; de momento confirmar solo cierra (MainChart sigue en su
 * estado placeholder).
 */
export function CompareCountryModal({ isOpen, onClose }: CompareCountryModalProps) {
  const [country, setCountry] = useState<string | null>(null);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Compare with another country">
      <div className="space-y-6">
        <CountryAwareCombobox
          field={COUNTRY_FIELD}
          value={country}
          fetchedOptions={undefined}
          isFetchingOptions={false}
          onChange={setCountry}
        />

        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          {/* TODO: al implementar la comparación, disparar el segundo box-plot con `country`. */}
          <Button disabled={!country} onClick={onClose}>
            Compare
          </Button>
        </div>
      </div>
    </Modal>
  );
}

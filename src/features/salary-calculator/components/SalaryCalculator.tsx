import { useSalaryFormState } from '../hooks/useSalaryFormState';
import { useWageInsights } from '../hooks/useWageInsights';
import { useWageStats } from '../hooks/useWageStats';

import { MainChart } from './MainChart';
import { SalaryForm } from './SalaryForm';

/**
 * Contenedor de la feature: cablea los tres hooks (estado del formulario,
 * cascada de filtros y derivación estadística) y reparte sus salidas a
 * SalaryForm y MainChart. Mantiene la lógica de negocio fuera de la página,
 * que queda como ensamblador fino (architecture.md §pages).
 *
 * Es también dueño del layout responsive del widget: en móvil la chart va
 * arriba y el formulario debajo; en desktop el formulario a la izquierda y la
 * chart a la derecha. El orden del DOM sigue el de lectura móvil y se reordena
 * en desktop con `lg:order-*` para no duplicar markup.
 */
export function SalaryCalculator() {
  const { step, values, setFieldValue, goNext, goBack, canAdvance } = useSalaryFormState();
  const { data, isFetching, nextOptionsField } = useWageInsights(values);
  const aggregation = useWageStats(data?.monthlyWages);

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
      <div className="lg:order-2">
        <MainChart aggregation={aggregation} isLoading={isFetching} />
      </div>

      <div className="border-border-subtle bg-surface rounded-2xl border p-6 lg:order-1">
        <SalaryForm
          step={step}
          values={values}
          onFieldChange={setFieldValue}
          onNext={goNext}
          onBack={goBack}
          canAdvance={canAdvance}
          fetchedOptions={data?.options}
          isFetchingOptions={isFetching}
          nextOptionsField={nextOptionsField}
        />
      </div>
    </div>
  );
}

import { SalaryCalculator } from '@/features/salary-comparator';
import { Text } from '@/shared/components/ui';

/**
 * Ensamblador fino de la ruta raíz: aporta el landmark <main>, la jerarquía
 * semántica SEO (un único <h1>, intro en <p>) y monta el widget de la feature.
 * Sin lógica de negocio — el cableado de datos vive en SalaryCalculator
 * (architecture.md §pages).
 */
export function Home() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-16 md:px-8 lg:px-16">
      <header className="mb-12 max-w-2xl">
        <Text variant="h3" className="text-center">
          Compare your salary
        </Text>
      </header>

      <section aria-label="Salary comparison calculator">
        <h2 className="sr-only">Salary comparison calculator</h2>
        <SalaryCalculator />
      </section>
    </main>
  );
}

import { SalaryCalculator } from '@/features/salary-calculator';
import { Text } from '@/shared/components/ui';

/**
 * Ensamblador fino de la ruta raíz: aporta el landmark <main>, la jerarquía
 * semántica SEO (un único <h1>, intro en <p>) y monta el widget de la feature.
 * Sin lógica de negocio — el cableado de datos vive en SalaryCalculator
 * (architecture.md §pages).
 */
export function Home() {
  return (
    <main className="mx-auto h-[calc(100vh-4rem)] max-w-7xl overflow-y-auto px-4 py-16 md:px-8 lg:px-16">
      <header className="mb-12 max-w-2xl">
        <Text variant="h1" className="text-foreground">
          Compare your salary against real market data
        </Text>

      </header>

      <section aria-label="Salary comparison calculator">
        <h2 className="sr-only">Salary comparison calculator</h2>
        <SalaryCalculator />
      </section>
    </main>
  );
}

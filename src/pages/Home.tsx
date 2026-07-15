import { SalaryCalculator } from '@/features/salary-comparator';

/**
 * Ensamblador fino de la ruta raíz: aporta el landmark <main> y monta el
 * widget de la feature. Sin lógica de negocio — el cableado de datos vive
 * en SalaryCalculator (architecture.md §pages).
 */
export function Home() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-16 md:px-8 lg:px-16">
      <section aria-label="Salary comparison calculator">
        <h1 className="sr-only">Salary comparison calculator</h1>
        <SalaryCalculator />
      </section>
    </main>
  );
}

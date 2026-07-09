import { Skeleton } from './Skeleton';

/** Fallback genérico de Suspense a nivel de ruta: header + dos bloques de contenido. */
export function PageSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 lg:px-16">
      <Skeleton className="mb-12 h-8 w-64 rounded-md" />
      <div className="space-y-4">
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    </div>
  );
}

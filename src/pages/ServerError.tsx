import { ServerCrash } from 'lucide-react';
import { isRouteErrorResponse, useRouteError } from 'react-router';

import { BackButton, Icon, Text } from '@/shared/components/ui';

/**
 * errorElement del árbol /dashboard: si el error es un 404 real (subruta sin
 * match dentro del dashboard) usa el mismo copy de "no encontrado" que
 * NotFound; solo cuando es un error de verdad (render/loader) se muestra el
 * mensaje de error de servidor con el acento en `text-error`.
 */
export function ServerError() {
  const error = useRouteError();
  const isMissingRoute = isRouteErrorResponse(error) && error.status === 404;

  return (
    <main className="mx-auto max-w-3xl px-4 py-16 md:px-8 lg:px-16">
      <BackButton to="/dashboard" label="Back to dashboard" />

      <header className="flex items-center gap-4">
        <Icon
          icon={ServerCrash}
          size={32}
          className={isMissingRoute ? 'text-muted' : 'text-error'}
        />
        <Text variant="h1">{isMissingRoute ? 'Page not found' : 'Something went wrong'}</Text>
      </header>

      <Text variant="body-lg" className="text-muted mt-4">
        {isMissingRoute
          ? "The page you're looking for doesn't exist within your dashboard."
          : 'An unexpected error occurred. Please try again in a moment.'}
      </Text>
    </main>
  );
}

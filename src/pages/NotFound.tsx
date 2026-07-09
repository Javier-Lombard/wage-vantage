import { FileQuestion } from 'lucide-react';
import { isRouteErrorResponse, useRouteError } from 'react-router';

import { BackButton, Icon, Text } from '@/shared/components/ui';

/**
 * errorElement raíz: captura tanto un 404 sintético de React Router (ruta sin
 * match) como cualquier error de render no capturado en el árbol público.
 */
export function NotFound() {
  const error = useRouteError();
  const isMissingRoute = isRouteErrorResponse(error) && error.status === 404;

  return (
    <main className="mx-auto max-w-3xl px-4 py-16 md:px-8 lg:px-16">
      <BackButton to="/" label="Back to home" />

      <header className="flex items-center gap-4">
        <Icon icon={FileQuestion} size={32} className="text-muted" />
        <Text variant="h1">{isMissingRoute ? 'Page not found' : 'Something went wrong'}</Text>
      </header>

      <Text variant="body-lg" className="text-muted mt-4">
        {isMissingRoute
          ? "The page you're looking for doesn't exist or has moved."
          : 'An unexpected error occurred while loading this page.'}
      </Text>
    </main>
  );
}

import { ErrorBoundary } from './ErrorBoundary';

import type { ComponentType, ReactNode } from 'react';

/** Envuelve `Component` en un ErrorBoundary sin repetir el JSX en cada call site. */
export function withErrorBoundary<P extends object>(
  WrappedComponent: ComponentType<P>,
  fallback?: ReactNode,
) {
  function ComponentWithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  }

  ComponentWithErrorBoundary.displayName = `withErrorBoundary(${WrappedComponent.displayName ?? WrappedComponent.name ?? 'Component'})`;

  return ComponentWithErrorBoundary;
}

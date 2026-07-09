import { AlertTriangle } from 'lucide-react';
import { Component } from 'react';

import { Button } from './Button';
import { Card } from './Card';
import { Icon } from './Icon';
import { Text } from './Typography';

import type { ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/** Fallback por defecto: mismo footprint que un chart real (Card + copy corto + Retry). */
function DefaultFallback({ onRetry }: { onRetry: () => void }) {
  return (
    <Card className="flex flex-col items-center justify-center gap-3 text-center">
      <Icon icon={AlertTriangle} size={24} className="text-error" />
      <Text variant="body-sm" className="text-muted">
        Something went wrong loading this chart.
      </Text>
      <Button variant="outline" onClick={onRetry}>
        Retry
      </Button>
    </Card>
  );
}

/**
 * Los Error Boundaries de React solo pueden implementarse como class component
 * (getDerivedStateFromError/componentDidCatch no tienen equivalente en hooks).
 * Aísla el fallo de un chart de Recharts (datos malformados, excepción en
 * render) para que no tumbe el resto de la página.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  private handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? <DefaultFallback onRetry={this.handleRetry} />;
    }

    return this.props.children;
  }
}

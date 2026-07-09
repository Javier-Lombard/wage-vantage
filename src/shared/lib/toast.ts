import { toast as sonnerToast } from 'sonner';

/**
 * Wrapper sobre sonner que fuerza el mensaje a string — el resto del proyecto
 * importa de aquí, nunca de 'sonner' directamente, para mantener un único
 * punto de entrada si cambia la librería de toasts.
 */
export const toast = {
  success: (message: string) => sonnerToast.success(message),
  error: (message: string) => sonnerToast.error(message),
  info: (message: string) => sonnerToast.info(message),
};

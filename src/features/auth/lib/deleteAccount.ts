import { supabase } from '@/shared/lib/supabaseClient';

/**
 * Invoca la Edge Function delete-account (borra la cuenta del usuario
 * autenticado — identidad derivada de su JWT, no de nada que mande el
 * cliente). Lanza si la invocación falla.
 */
export async function invokeDeleteAccount(): Promise<void> {
  const response = await supabase.functions.invoke<unknown>('delete-account', {
    method: 'DELETE',
  });

  const invokeError: unknown = response.error;
  if (invokeError) {
    throw invokeError instanceof Error ? invokeError : new Error('delete-account invocation failed');
  }
}

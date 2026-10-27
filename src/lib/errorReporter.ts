import { supabase } from './supabaseClient';

export const GENERIC_ERROR_MESSAGE = 'No fue posible completar la operación. Intenta de nuevo.';

function serializeError(error: unknown) {
  if (error instanceof Error) return { message: error.message, stack: error.stack ?? null };
  if (typeof error === 'object' && error !== null) return { message: JSON.stringify(error), stack: null };
  return { message: String(error), stack: null };
}

export async function reportApplicationError(error: unknown, context: string) {
  const serialized = serializeError(error);
  if (!supabase) return;

  try {
    await supabase.from('app_errors').insert({
      context,
      message: serialized.message,
      stack: serialized.stack,
      path: window.location.pathname,
    });
  } catch {
    // Logging failures must never create another visible application error.
  }
}

export function toGenericError(error: unknown, context: string) {
  void reportApplicationError(error, context);
  return GENERIC_ERROR_MESSAGE;
}

export function installGlobalErrorMiddleware() {
  const handleError = (event: ErrorEvent) => {
    void reportApplicationError(event.error ?? event.message, 'window.error');
  };
  const handleRejection = (event: PromiseRejectionEvent) => {
    void reportApplicationError(event.reason, 'window.unhandledrejection');
  };

  window.addEventListener('error', handleError);
  window.addEventListener('unhandledrejection', handleRejection);
  return () => {
    window.removeEventListener('error', handleError);
    window.removeEventListener('unhandledrejection', handleRejection);
  };
}

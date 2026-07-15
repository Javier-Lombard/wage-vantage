/**
 * Edge Function: delete-account
 *
 * Elimina permanentemente la cuenta del usuario que invoca la función.
 * El userId se deriva del JWT verificado server-side (verifyJwt) — nunca
 * se acepta un id en el body, así que un usuario solo puede borrar su
 * propia cuenta, jamás la de otro.
 *
 * Antes de borrar el usuario en Auth, limpia sus objetos en el bucket
 * Avatars: auth.admin.deleteUser falla si el usuario todavía posee
 * objetos en Storage. Todo lo demás (templates, comparisons, payData)
 * vive en user_metadata y se borra junto con la fila de auth.users.
 *
 * Deploy: supabase functions deploy delete-account --no-verify-jwt
 * (reutiliza el secret WAGE_VANTAGE_SERVICE_ROLE_KEY ya existente)
 *
 * Método esperado: DELETE, sin body — la identidad viaja en el header
 * Authorization, que supabase.functions.invoke() adjunta automáticamente.
 * Respuesta: 204 sin body si se borró correctamente.
 */

import { handleCors, corsHeaders } from './cors.ts';
import { verifyJwt } from './auth.ts';

const AVATARS_BUCKET = 'Avatars';

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  if (req.method !== 'DELETE') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json', ...corsHeaders } },
    );
  }

  const auth = await verifyJwt(req);
  if ('error' in auth) {
    return new Response(
      JSON.stringify({ error: auth.error }),
      { status: auth.status, headers: { 'Content-Type': 'application/json', ...corsHeaders } },
    );
  }

  const { userId } = auth;

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('WAGE_VANTAGE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !serviceKey) {
    return new Response(
      JSON.stringify({ error: 'Server misconfiguration' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } },
    );
  }

  const serviceHeaders = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` };

  // Limpieza best-effort: si falla, no bloquea el borrado — admin.deleteUser
  // reportará su propio error si de verdad quedan objetos huérfanos.
  try {
    const listResponse = await fetch(`${supabaseUrl}/storage/v1/object/list/${AVATARS_BUCKET}`, {
      method: 'POST',
      headers: { ...serviceHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ prefix: `${userId}/`, limit: 1000 }),
    });

    if (listResponse.ok) {
      const items = (await listResponse.json()) as { name: string }[];
      if (items.length > 0) {
        const prefixes = items.map((item) => `${AVATARS_BUCKET}/${userId}/${item.name}`);
        const removeResponse = await fetch(`${supabaseUrl}/storage/v1/object/remove`, {
          method: 'DELETE',
          headers: { ...serviceHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({ prefixes }),
        });
        if (!removeResponse.ok) {
          console.error('[delete-account] Avatar cleanup failed:', await removeResponse.text());
        }
      }
    } else {
      console.error('[delete-account] Avatar list failed:', await listResponse.text());
    }
  } catch (err) {
    console.error('[delete-account] Avatar cleanup error:', err);
  }

  const deleteResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
    method: 'DELETE',
    headers: serviceHeaders,
  });

  if (!deleteResponse.ok) {
    const errorBody = await deleteResponse.text();
    console.error('[delete-account] Delete user error:', deleteResponse.status, errorBody);
    return new Response(
      JSON.stringify({ error: 'Failed to delete account' }),
      { status: deleteResponse.status, headers: { 'Content-Type': 'application/json', ...corsHeaders } },
    );
  }

  return new Response(null, { status: 204, headers: corsHeaders });
});

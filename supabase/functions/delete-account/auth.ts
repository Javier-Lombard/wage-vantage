export interface AuthResult {
    userId: string;
    error?: never;
}

export interface AuthError {
    userId?: never;
    error: string;
    status: number;
}

export async function verifyJwt(
    req: Request,
): Promise<AuthResult | AuthError> {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { error: 'Missing or invalid Authorization header', status: 401 };
    }

    const token = authHeader.replace('Bearer ', '').trim();

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !anonKey) {
        return { error: 'Server misconfiguration: missing Supabase env vars', status: 500 };
    }

    const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
        headers: {
            Authorization: `Bearer ${token}`,
            apikey: anonKey,
        },
    });

    if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        const message = (body as Record<string, string>).message ?? 'Unauthorized';
        return { error: message, status: response.status };
    }

    const user = await response.json() as { id: string };
    return { userId: user.id };
}

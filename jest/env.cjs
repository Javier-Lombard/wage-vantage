// Valores ficticios para que los módulos que crean el cliente de Supabase carguen en tests.
// Nunca credenciales reales: los tests deben mockear la red, no golpear el proyecto.
process.env.VITE_SUPABASE_URL = 'http://localhost:54321';
process.env.VITE_SUPABASE_ANON_KEY = 'test-anon-key';

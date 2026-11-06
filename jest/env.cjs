// Valores ficticios para que los módulos que crean el cliente de Supabase carguen en tests.
// Nunca credenciales reales: los tests deben mockear la red, no golpear el proyecto.
process.env.VITE_SUPABASE_URL = 'http://localhost:54321';
process.env.VITE_SUPABASE_ANON_KEY = 'test-anon-key';

// jsdom no expone TextEncoder/TextDecoder en el global que ven los módulos
// bajo test (aunque Node sí los tiene) — react-router los usa al cargar, así
// que cualquier test que importe algo que arrastre react-router rompe sin esto.
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('node:util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

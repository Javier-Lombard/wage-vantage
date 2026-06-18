const data = JSON.parse(require('fs').readFileSync(0, 'utf-8'));
const command = data.tool_input?.command || '';

if (!/git commit/.test(command)) {
  process.exit(0); // no es un commit, deja pasar sin más
}

const { execSync } = require('child_process');

try {
  execSync('npx tsc --noEmit', { stdio: 'pipe' });
  execSync('npx eslint . --max-warnings=0', { stdio: 'pipe' });
  process.exit(0); // todo limpio, permite el commit
} catch (err) {
  console.error('Commit bloqueado: hay errores de TypeScript o ESLint sin resolver.');
  console.error(err.stdout?.toString() || err.message);
  process.exit(2); // código distinto de 0 = bloquea la acción
}
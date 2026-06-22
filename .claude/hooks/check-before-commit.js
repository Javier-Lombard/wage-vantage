const data = JSON.parse(require('fs').readFileSync(0, 'utf-8'));
const command = data.tool_input?.command || '';

if (!/git commit/.test(command)) {
  process.exit(0); // no es un commit, deja pasar sin más
}

const { execSync } = require('child_process');

// Formato: a diferencia de tsc/eslint, esto se autocorrige en vez de bloquear.
// Se ejecuta primero porque normaliza el árbol antes de que tsc/eslint lo lean.
try {
  execSync('npx prettier --check .', { stdio: 'pipe' });
} catch {
  const before = execSync('git diff --name-only; git diff --staged --name-only', {
    stdio: ['ignore', 'pipe', 'ignore'],
  }).toString();

  execSync('npx prettier --write .', { stdio: 'pipe' });

  // Solo re-stagear lo que ya estaba trackeado/staged antes del autofix,
  // para no arrastrar archivos sueltos sin relación al commit en curso.
  const candidates = [...new Set(before.split('\n').filter(Boolean))];
  if (candidates.length > 0) {
    execSync(`git add ${candidates.map((f) => `"${f}"`).join(' ')}`, { stdio: 'pipe' });
  }

  console.error(
    `Prettier reformateó y re-stageó ${candidates.length} archivo(s) antes del commit:`,
  );
  console.error(candidates.map((f) => `  - ${f}`).join('\n'));
}

try {
  execSync('npx tsc --noEmit', { stdio: 'pipe' });
  execSync('npx eslint . --max-warnings=0', { stdio: 'pipe' });
  process.exit(0); // todo limpio, permite el commit
} catch (err) {
  console.error('Commit bloqueado: hay errores de TypeScript o ESLint sin resolver.');
  console.error(err.stdout?.toString() || err.message);
  process.exit(2); // código distinto de 0 = bloquea la acción
}

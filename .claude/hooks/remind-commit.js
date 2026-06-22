// PostToolUse hook: recuerda comitear cuando se acumulan cambios sin guardar.
// A diferencia de check-before-commit.js, este NUNCA bloquea: solo muestra un
// aviso (systemMessage) y sale con código 0. El conteo se basa en el estado
// real del repo (git status --porcelain), no en qué herramienta lo provocó.

const { execSync } = require('child_process');

// Leemos el payload de stdin para no romper el contrato del hook, aunque el
// conteo no dependa del tool_input: git es la única fuente de verdad aquí.
try {
  JSON.parse(require('fs').readFileSync(0, 'utf-8'));
} catch {
  // Sin payload válido no hay nada que hacer; salimos en silencio.
  process.exit(0);
}

let lines;
try {
  const output = execSync('git status --porcelain', {
    stdio: ['ignore', 'pipe', 'ignore'],
  })
    .toString()
    .trim();
  lines = output ? output.split('\n') : [];
} catch {
  // Fuera de un repo git (o git no disponible): nada que recordar.
  process.exit(0);
}

const count = lines.length;

// El formato porcelain es "XY <ruta>"; los renombrados usan "orig -> nuevo".
// Nos quedamos con la ruta de destino para detectar manifests de dependencias.
const touchesManifest = lines.some((line) => {
  const path = line.slice(3).split(' -> ').pop();
  return path === 'package.json' || path === 'package-lock.json';
});

// 1-2 archivos sin tocar manifests: cambio pequeño, sin aviso.
if (count <= 2 && !touchesManifest) {
  process.exit(0);
}

let message;
if (count >= 6 || touchesManifest) {
  const reason = touchesManifest ? 'incluyen package.json/package-lock.json' : `${count} archivos`;
  message =
    `⚠️  Cambios grandes sin comitear (${reason}). ` +
    'Alto riesgo de pérdida de trabajo: considera comitear ya.';
} else {
  // count en 3-5, sin manifests.
  message =
    `📝 Hay ${count} archivos modificados sin comitear (cambio mediano). ` +
    'Buen momento para un commit.';
}

process.stdout.write(JSON.stringify({ systemMessage: message }));
process.exit(0);

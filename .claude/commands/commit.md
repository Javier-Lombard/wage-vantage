---
description: Stage, write a Conventional Commits message from the real diff, commit (runs the pre-commit hook), then push — automatically on feature/* branches, with confirmation on main.
disable-model-invocation: true
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git add:*), Bash(git commit:*), Bash(git push:*), Bash(git log:*), Bash(git branch:*)
---

Estás ejecutando el flujo `/commit`. Haz **únicamente** esto — no inicies ni reanudes ninguna otra tarea. Sigue estos pasos en orden:

## 1. Inspecciona el árbol de trabajo

Ejecuta `git status` y `git diff` (y `git diff --staged` para los cambios ya en staging) para ver exactamente qué cambió, tanto en staging como sin staging. Lee el diff real — el mensaje de commit debe describir lo que realmente cambió, no una suposición.

## 2. Detente si no hay nada que commitear

Si no hay cambios en staging ni sin staging, dile al usuario que no hay nada que commitear y **detente**. No crees un commit vacío.

## 3. Pon en staging los cambios relevantes

- Si los cambios relevantes ya están en staging, déjalos como están.
- Si hay cambios sin staging que claramente forman una sola unidad lógica, ponlos en staging con `git add`.
- **Si los archivos modificados parecen no estar relacionados entre sí** (p. ej. un cambio de feature más un ajuste de configuración no relacionado más una edición de docs), **no** hagas `git add .` a ciegas. Enumera los grupos que detectes y pregunta al usuario qué archivos incluir en este commit — o si conviene dividir en varios commits. Respeta su respuesta.

## 4. Escribe un mensaje de Conventional Commits a partir del diff real

Compón un mensaje de commit que siga Conventional Commits, eligiendo el tipo según lo que el diff realmente hace:

- `feat:` — una nueva funcionalidad o capacidad visible para el usuario
- `fix:` — una corrección de bug
- `chore:` — tooling, configuración, dependencias, scaffolding (sin cambio de comportamiento en src)
- `docs:` — solo documentación
- `style:` — formato/espacios/solo Prettier, sin cambio de lógica
- `refactor:` — reestructuración interna sin cambio de comportamiento
- `test:` — añadir o ajustar tests

Reglas:

- Línea de asunto en modo imperativo, en minúscula después del tipo, sin punto final, ≤ ~72 caracteres.
- Añade un scope cuando aclare el significado (p. ej. `feat(salary-calculator): ...`).
- Añade un cuerpo (línea en blanco, luego bullets) cuando el cambio no sea trivial y el "por qué" no resulte obvio solo con el asunto.
- Basa el mensaje en el diff **real**. Nunca uses un placeholder genérico como "update files" o "various changes".
- El mensaje de commit se escribe **siempre en español**, sin excepción. El idioma del producto final (UI, código, identificadores) sigue siendo inglés — eso no cambia —, pero los commits, igual que los commands y la comunicación en estas sesiones, se escriben en español. Los tipos de Conventional Commits (`feat:`, `fix:`, `chore:`, etc.) se mantienen en inglés tal cual, ya que son parte del estándar, no texto descriptivo — solo el subject y el body van en español.

## 5. Commitea (el hook de pre-commit lo validará)

Ejecuta `git commit` con tu mensaje.

Un hook `PreToolUse` (`.claude/hooks/check-before-commit.js`) se ejecuta automáticamente en cada `git commit`. Este hook:

- ejecuta `prettier --check .`, y si hay una discordancia la **autocorrige** con `prettier --write .`, vuelve a poner en staging los archivos afectados, y deja que el commit continúe;
- ejecuta `tsc --noEmit` y `eslint . --max-warnings=0`, que **bloquean** el commit (código de salida 2) si hay errores de tipos o de lint.

Si el commit es **bloqueado** por tsc/eslint, muestra al usuario la salida de error del hook, corrige los errores reportados (o pregunta al usuario cómo proceder si la corrección no es obvia), y solo entonces reintenta el commit. No intentes saltarte el hook (sin `--no-verify`).

Tras un commit exitoso, ejecuta `git log --oneline -1` para confirmar y muestra al usuario el commit que se creó.

## 6. Detecta la rama actual

Ejecuta `git branch --show-current` para determinar dónde acaba de aterrizar este commit.

## 7. Push — automático en feature branches, confirmado en todo lo demás

- **Si el nombre de la rama coincide con `feature/*`:** estas son ramas de corta duración, de un solo desarrollador, según el git workflow de este repo — el push no conlleva riesgo de sorprender a nadie más, así que ejecuta `git push` (usa `git push -u origin HEAD` si no hay upstream todavía) **automáticamente, sin preguntar**. Reporta el resultado del push al usuario.
- **Si la rama es `main` (o cualquier otra que no coincida con `feature/*`):** mantén el comportamiento original — **no** hagas push automáticamente. Pregunta al usuario si quiere hacer `git push`, y solo ejecútalo si confirma. Si declina, detente — el commit se queda local, lo cual está bien.

---

**Importante:** Este comando existe para que commitear sea una acción explícita, iniciada por el usuario. Nunca ejecutes este flujo por iniciativa propia en medio de otra tarea — solo cuando el usuario invoque `/commit` explícitamente. El push automático del paso 7 está limitado estrictamente a ramas `feature/*`; `main` siempre requiere confirmación explícita antes de hacer push.

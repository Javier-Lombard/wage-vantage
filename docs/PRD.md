# PRD — Wage Comparator

| Campo                   | Valor                                                                                                                                                                                                                               |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Versión                 | 1.0                                                                                                                                                                                                                                 |
| Fecha                   | 7 de noviembre de 2026                                                                                                                                                                                                              |
| Estado del producto     | MVP funcional en desarrollo activo (proyecto de portfolio)                                                                                                                                                                          |
| Fuente de verdad        | Este documento describe el comportamiento **tal y como está implementado** en el código, más las brechas detectadas (§12)                                                                                                           |
| Documentos relacionados | [architecture.md](architecture.md) · [DESIGN.md](DESIGN.md) · [conventions.md](conventions.md) · [salary-comparator-data-flow.md](salary-comparator-data-flow.md) · [gemini-enrichment-flow.md](diagrams/gemini-enrichment-flow.md) |

**Cómo leer los casos de uso.** Cada uno tiene un ID (`UC-xx`) y uno de estos estados:

- **Implementado** — funciona de extremo a extremo con datos reales.
- **Parcial** — funciona, con limitaciones que se listan en el propio caso y en §12.
- **Simulado** — la interfaz está completa, pero el backend o los datos son ficticios.

El texto de la interfaz se cita en inglés, tal como aparece en la aplicación.

---

## 1. Resumen

Wage Comparator es una aplicación web que permite comparar un salario mensual con la distribución salarial real de un perfil profesional concreto en países europeos. El usuario describe su perfil en un formulario de tres pasos y obtiene un box plot (mínimo, Q1, mediana, Q3 y máximo) que se actualiza con cada selección, con su propio salario marcado como línea de referencia. Puede añadir otros países a la misma gráfica y pasar a una hoja de comparación con gráficas adicionales.

La calculadora es pública y no requiere registro. Una cuenta gratuita permite guardar plantillas del formulario y comparaciones. El plan Premium amplía los límites, desbloquea los datos detallados de la hoja de comparación y la exportación.

## 2. Problema y oportunidad

- Las fuentes oficiales (Encuesta de Estructura Salarial de Eurostat) son tablas difíciles de consultar para un perfil concreto.
- Quien negocia una subida, valora una oferta o planea mudarse necesita saber dónde cae su salario dentro de la distribución de **su** perfil, no frente a una media nacional.
- Muchas combinaciones de perfil tienen muy pocos registros. El producto completa esas muestras con una estimación generada por IA (Gemini) para no dejar al usuario sin respuesta.

## 3. Objetivos

### Objetivos de producto

- **O1.** Responder "¿cómo está mi salario frente a perfiles como el mío?" sin registro y en menos de un minuto.
- **O2.** Comparar el mismo perfil entre varios países en una sola vista.
- **O3.** Convertir visitantes en usuarios registrados (guardar trabajo) y usuarios gratuitos en Premium (más países, datos detallados, exportación).

### Objetivos técnicos (portfolio)

- Demostrar una arquitectura feature-based con Redux Toolkit + RTK Query, Supabase (Auth, Postgres con RPC, Storage, Edge Functions) y un box plot construido sobre Recharts.
- Interfaz accesible, responsive y con modo oscuro y claro.

### No objetivos

- No es asesoramiento financiero ni legal (lo indica la página Privacy & Terms).
- No procesa pagos reales en esta versión: la suscripción está simulada.
- No hay internacionalización: la interfaz está solo en inglés.
- No hay panel de administración ni roles internos.
- No hay aplicación nativa: es una web responsive.

## 4. Actores

| Actor                              | Descripción                                                                                               |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Invitado (guest)                   | Visitante sin sesión. Usa la calculadora completa con un máximo de 2 países.                              |
| Usuario Free                       | Tiene cuenta (email confirmado o Google) y no es Premium.                                                 |
| Usuario Premium                    | Usuario con `premium: true` en su perfil.                                                                 |
| Supabase                           | Auth, Postgres (tabla `TABLE_0` y funciones RPC), Storage (bucket `Avatars`) y Edge Functions.            |
| Edge Function `enrich-salary-data` | Llama a Gemini desde el servidor para estimar la distribución salarial cuando la muestra real es pequeña. |
| Edge Function `delete-account`     | Borra la cuenta del usuario y sus avatares con privilegios de servicio.                                   |
| Google OAuth                       | Proveedor de inicio de sesión social.                                                                     |

## 5. Planes y matriz de acceso

Definida en [premium/config.ts](../src/features/premium/config.ts). El plan se deriva siempre de la sesión: sin sesión es `guest`; con sesión y sin Premium es `free`.

| Capacidad                                                                  | Guest               | Free                 | Premium                                   |
| -------------------------------------------------------------------------- | ------------------- | -------------------- | ----------------------------------------- |
| Calculadora (formulario + box plot)                                        | Sí                  | Sí                   | Sí                                        |
| Países en la gráfica (total, incluido el país base)                        | 2                   | 2                    | 3                                         |
| Al intentar superar el límite de países                                    | Pide iniciar sesión | Pide pasar a Premium | Botón "Add country" deshabilitado         |
| Plantillas guardadas                                                       | 0                   | 1                    | 4                                         |
| Comparaciones guardadas                                                    | 0                   | 1                    | 4                                         |
| Datos detallados en la hoja (Salary Distribution, Occupation Salary Bands) | Bloqueado           | Bloqueado            | Sí                                        |
| Exportar (PDF, PNG, CSV)                                                   | Upsell              | Upsell               | Sí                                        |
| Vistas de gráfica por comparación (`chartViews`)                           | 1                   | 1                    | 3 (definido, no aplicado)                 |
| Precio                                                                     | —                   | 0 €                  | 2,99 €/mes (mensual) · 1,99 €/mes (anual) |

## 6. Mapa de pantallas

| Ruta                              | Pantalla              | Acceso                                      | Casos de uso  |
| --------------------------------- | --------------------- | ------------------------------------------- | ------------- |
| `/`                               | Home — calculadora    | Público                                     | UC-01 a UC-09 |
| `/comparison`                     | Comparison Sheet      | Público (requiere estado de navegación)     | UC-11 a UC-15 |
| `/plans`                          | Planes y precios      | Público                                     | UC-27, UC-28  |
| `/about`                          | About                 | Público                                     | UC-34         |
| `/privacy`                        | Privacy & Terms       | Público                                     | UC-34         |
| `/confirm-email`                  | Confirmación de email | Público (destino del email de registro)     | UC-17         |
| `/reset-password`                 | Nueva contraseña      | Público (destino del email de recuperación) | UC-20         |
| `/dashboard`                      | Dashboard             | Requiere sesión                             | UC-23         |
| `/dashboard/templates`            | My Templates          | Requiere sesión                             | UC-09, UC-10  |
| `/dashboard/comparisons`          | Saved Comparisons     | Requiere sesión                             | UC-13, UC-14  |
| `/dashboard/settings`             | Account Settings      | Requiere sesión                             | UC-24, UC-25  |
| `/dashboard/settings/manage-plan` | Manage Plan           | Requiere sesión                             | UC-28 a UC-31 |
| Cualquier otra                    | Not found / error     | —                                           | UC-35         |

**Diálogos transversales:** inicio de sesión y registro, solicitud de restablecimiento de contraseña, avisos de "inicia sesión para…", upgrade a Premium, guardar plantilla, guardar comparación, exportar, método de pago y confirmaciones de acciones destructivas.

---

## 7. Casos de uso

### 7.1 Calculadora salarial (`/`)

El formulario tiene 9 campos en 3 pasos. La disposición es: en móvil, gráfica arriba, botón de comparar y formulario debajo; en escritorio, formulario a la izquierda y gráfica a la derecha.

| Paso           | Campo               | Origen de las opciones                     | ¿Filtra los datos?            |
| -------------- | ------------------- | ------------------------------------------ | ----------------------------- |
| 1 · Basics     | Country             | Base de datos                              | Sí                            |
| 1 · Basics     | Gender              | Fijas: Male, Female                        | Sí                            |
| 1 · Basics     | Monthly Wage        | Entrada numérica                           | No (solo línea de referencia) |
| 2 · Role       | Occupation          | Base de datos, en cascada                  | Sí                            |
| 2 · Role       | Occupation Level    | Base de datos, en cascada                  | Sí                            |
| 2 · Role       | Economic Activity   | Base de datos, en cascada                  | Sí                            |
| 3 · Background | Education Level     | Base de datos, en cascada                  | Sí                            |
| 3 · Background | Years of Experience | Fijas: 0-2, 3-5, 6-10, 10+ years           | No (solo perfil para la IA)   |
| 3 · Background | Company Size        | Fijas: 1-10, 11-50, 51-200, 200+ employees | No (solo perfil para la IA)   |

#### UC-01 · Completar el paso 1 "Basics"

`Implementado` · Actor: cualquiera

**Precondición:** ninguna.

**Flujo principal**

1. El usuario abre la home. La gráfica muestra el logo y el texto "Fill in the form to see how your salary compares."
2. Abre el combobox **Country**, que admite búsqueda por texto, y elige un país.
3. El sistema pide los salarios de ese país y, en la misma petición, las opciones de Occupation para el paso 2. La gráfica muestra el loader y después el box plot.
4. Elige **Gender**. El sistema vuelve a pedir los datos con el filtro país + género y la gráfica se actualiza.
5. Introduce su **Monthly Wage**. La gráfica dibuja una línea roja discontinua "Your monthly wage"; no se lanza ninguna petición.
6. El botón "Next step" se habilita cuando los tres campos tienen valor.

**Alternativos y excepciones**

- 2a. Mientras se cargan los países, el combobox aparece deshabilitado con el texto "Loading...".
- 3a. En móvil, la página sube hasta arriba para que la gráfica quede a la vista. En escritorio no se desplaza si la gráfica ya es visible. El desplazamiento respeta `prefers-reduced-motion`.
- 3b. En dispositivos táctiles, el teclado virtual se cierra al elegir una opción.
- 5a. Si el usuario vacía el salario, el campo cuenta como vacío y "Next step" vuelve a deshabilitarse.

**Reglas de negocio**

- No se consulta ningún dato hasta que se elige un país.
- La lista de países se pide una sola vez por pestaña.
- Para avanzar de paso, todos los campos del paso actual deben tener valor.

#### UC-02 · Refinar el perfil en los pasos "Role" y "Background"

`Implementado` · Actor: cualquiera

**Precondición:** paso 1 completo.

**Flujo principal**

1. El usuario pulsa "Next step" y llega al paso 2. Las opciones de Occupation ya están cargadas.
2. Elige **Occupation**. El sistema pide los datos con todos los filtros acumulados y recibe, en la misma respuesta, las opciones de Occupation Level. La gráfica se actualiza.
3. Repite con **Occupation Level** (que carga Economic Activity) y **Economic Activity** (que carga Education Level).
4. Pulsa "Next step" y llega al paso 3. Elige **Education Level**; la gráfica se actualiza con el último filtro.
5. Elige **Years of Experience** y **Company Size** de listas fijas. La gráfica no cambia: estos dos campos solo se envían como perfil a la estimación por IA (UC-04).
6. "Back" vuelve al paso anterior conservando los valores.

**Reglas de negocio**

- Cascada: cada combobox de base de datos solo ofrece valores que existen para los filtros ya elegidos.
- Cada selección produce una única petición, que devuelve a la vez los datos de la gráfica y las opciones del siguiente campo.
- Un campo ya respondido sigue mostrando su valor aunque ya no reciba opciones nuevas.
- Los resultados se guardan en caché 5 minutos por combinación de filtros: avanzar y retroceder de paso no repite consultas.
- Cambiar un campo anterior no reinicia los posteriores (ver §12, brecha 15).

#### UC-03 · Ver la distribución salarial en el box plot

`Implementado` · Actor: cualquiera

**Estados de la gráfica**

| Estado       | Condición                                                  | Qué se ve                                                                                                                                                  |
| ------------ | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sin empezar  | No hay país elegido                                        | Logo y texto guía.                                                                                                                                         |
| Cargando     | Cualquier país (base o de comparación) está pidiendo datos | Loader con frases rotativas cada 2 s: "Enriching your data with AI...", "Analyzing regional salary patterns...", "Almost there — refining the estimate..." |
| Datos listos | El país base tiene datos                                   | Box plot.                                                                                                                                                  |

**Contenido del box plot**

- Una caja por país, con el país base primero. Cada país tiene un color de la paleta de gráficas (`chart-1` a `chart-6`).
- Bigotes de mínimo a máximo, caja de Q1 a Q3 y línea de mediana.
- Eje Y en euros. El eje X no muestra nombres: la relación color–país se indica en una leyenda de chips al pie.
- Línea de referencia "Your monthly wage" si el usuario introdujo su salario.
- Tooltip con Max, Q3, Median, Q1 y Min al pasar el cursor (escritorio) o tocar (móvil), con el texto de ayuda correspondiente ("Move cursor over chart to see tooltip" / "Tap chart to see tooltip").
- Leyenda explicativa de cada estadístico.

**Reglas de negocio**

- Los percentiles se calculan con interpolación lineal (el método por defecto de Excel y numpy).
- Antes de calcular se descartan los salarios superiores a 15.000 €/mes: el dataset contiene errores (valores de miles de millones y algún país con moneda local sin convertir).
- Un país cuyos datos aún no han llegado no se dibuja; nunca se pinta una caja a medias.
- Con un solo país, la caja ocupa el 75 % del ancho de su categoría.

#### UC-04 · Completar con IA las muestras pequeñas

`Implementado` · Actor: sistema

**Disparador:** una consulta devuelve menos de 8 salarios plausibles (≤ 15.000 €/mes) para un país.

**Flujo principal**

1. El sistema cuenta los salarios plausibles de la respuesta.
2. Si hay menos de 8, busca en la caché de la pestaña una estimación previa para ese país y ese perfil.
3. Si no la hay, invoca la Edge Function `enrich-salary-data` con el país y el perfil (Gender, Occupation, Occupation Level, Economic Activity, Education Level, Years Of Experience, Company Size). La función consulta Gemini y devuelve `min`, `q1`, `median`, `q3` y `max`.
4. El sistema valida la forma de la respuesta y guarda la estimación en la caché de la pestaña.
5. Si no había ningún salario real, usa la estimación tal cual. Si había entre 1 y 7, promedia percentil a percentil los datos reales con la estimación, garantizando `min ≤ q1 ≤ mediana ≤ q3 ≤ max`.
6. La gráfica dibuja el resultado sin distinguir su origen.

**Excepciones**

- 3a. Si la Edge Function falla o la respuesta no tiene la forma esperada, la consulta termina con error. Hoy la gráfica se queda en el loader (§12, brecha 14).

**Reglas de negocio**

- La clave de la API de Gemini nunca llega al navegador.
- La estimación se reutiliza durante toda la pestaña: recargar no vuelve a llamar a la IA y los números no cambian para el mismo perfil.
- Los errores no se guardan en caché: el siguiente intento vuelve a llamar a la IA.
- La interfaz no indica al usuario que la distribución incluye una estimación (§14, pregunta abierta).

#### UC-05 · Retomar el formulario tras recargar o cambiar de página

`Implementado` · Actor: cualquiera

**Flujo principal**

1. El usuario rellena parte del formulario y, opcionalmente, añade países de comparación.
2. Recarga la página o navega a otra ruta y vuelve a la home.
3. El formulario se restaura en el mismo paso y con los mismos valores, y los países de comparación siguen en la gráfica.
4. Si han pasado menos de 5 minutos, la gráfica se sirve desde caché; si no, se vuelve a pedir.

**Reglas de negocio**

- El estado vive en `sessionStorage`: dura lo que la pestaña y se pierde al cerrarla.
- Si un campo guardado no es válido, se descarta solo ese campo, no el formulario entero.
- Cargar una plantilla (UC-09) sustituye lo guardado y reinicia en el paso 1.

#### UC-06 · Comparar con otros países

`Implementado` · Actor: cualquiera (con límites por plan)

**Precondición:** país base elegido. Antes, el botón "Compare with another country" está deshabilitado.

**Flujo principal**

1. El usuario pulsa "Compare with another country".
2. Se abre el modal con los países ya añadidos (como chips con botón para quitarlos) y un combobox de país que excluye el país base y los ya añadidos.
3. Elige un país y pulsa "Add country".
4. Si el plan lo permite, el país se añade, el modal se cierra y la gráfica muestra el loader y después una caja nueva con el siguiente color.

**Alternativos y excepciones**

- 4a. **Guest en su límite:** se abre el aviso "Log in to compare more countries" con "Log In", "Create an account" y "Maybe later".
- 4b. **Free en su límite:** se abre el diálogo "Upgrade to compare more countries" con la lista de ventajas Premium. "Upgrade to Premium" solo cierra el diálogo (§12, brechas 2 y 3).
- 4c. **Premium en su límite (3 países):** "Add country" aparece deshabilitado.
- 5a. **Quitar un país:** el usuario pulsa la × de su chip y la caja desaparece de la gráfica.

**Reglas de negocio**

- Límite total de países: 2 para Guest y Free, 3 para Premium.
- No se puede añadir el país base ni un país repetido.
- Cada país de comparación usa los mismos filtros del formulario (solo cambia el país) y tiene su propia estimación por IA si su muestra es pequeña.
- Los países de comparación se piden en paralelo y se conservan en la sesión (UC-05).

#### UC-07 · Ir a la hoja de comparación

`Implementado` · Actor: cualquiera

**Precondición:** paso 3 completo.

**Flujo principal**

1. En el paso 3, el usuario pulsa "Go to comparison sheet".
2. El sistema navega a `/comparison` con los valores del formulario y los países de comparación (UC-11).

### 7.2 Plantillas del formulario

#### UC-08 · Guardar el formulario como plantilla

`Parcial` · Actor: Free, Premium (Guest recibe un aviso)

**Precondición:** el usuario está en el paso 3. El enlace "Save as a template" solo aparece en ese paso.

**Flujo principal**

1. El usuario pulsa "Save as a template".
2. Se abre el diálogo "Save as Template" con el campo "Template Name".
3. Escribe un nombre y pulsa "Save Template".
4. La plantilla se añade a su perfil y aparece el aviso "Template saved".

**Alternativos y excepciones**

- 1a. **Guest:** se abre el aviso "Log in to save this as a template" con "Log In", "Create an account" y "Maybe later".
- 4a. Si falla el guardado, aparece un aviso con el mensaje de error.

**Reglas de negocio**

- La plantilla guarda los 9 valores del formulario, incluido el salario, junto con un id y el nombre.
- Límite por plan: 1 (Free) y 4 (Premium). Hoy no se comprueba al guardar desde el formulario (§12, brecha 4).
- Hoy se admite un nombre vacío (§12, brecha 22).

#### UC-09 · Rellenar el formulario desde una plantilla

`Implementado` · Actor: Free, Premium (Guest recibe un aviso)

**Flujo principal**

1. El usuario pulsa "Fast fill with a template", visible en los tres pasos.
2. Con sesión, el sistema le lleva a `/dashboard/templates`.
3. Pulsa "Load Template" en una tarjeta.
4. El sistema vuelve a la home con el formulario relleno, en el paso 1, y la gráfica carga los datos del perfil.

**Alternativos**

- 1a. **Guest:** se abre el aviso "Log in to fast-fill from a saved template".

**Reglas de negocio**

- La plantilla sustituye lo que hubiera guardado en la sesión.
- Tras aplicarse, la plantilla se descarta del historial de navegación: recargar no la vuelve a aplicar encima de lo editado después.

#### UC-10 · Gestionar plantillas

`Implementado` · Actor: Free, Premium · Pantalla: `/dashboard/templates`

**Flujo principal**

1. El usuario ve sus plantillas como tarjetas con nombre y resumen (por ejemplo, "Nurse in Spain").
2. Puede cargar una (UC-09) o eliminarla.
3. Para eliminar, pulsa la papelera, confirma en el diálogo y la tarjeta desaparece.
4. Si está por debajo de su límite, ve el botón "Save new template (n/máx)", que le lleva a la home.

**Alternativos**

- 1a. Sin plantillas: mensaje "No saved templates yet." y botón "Save your first template".
- 3a. Si el borrado falla, aparece un aviso con el error.

**Reglas de negocio**

- El botón para crear otra plantilla se oculta al alcanzar el límite del plan.

### 7.3 Hoja de comparación (`/comparison`)

#### UC-11 · Consultar la hoja de comparación

`Parcial` · Actor: cualquiera (algunas gráficas solo para Premium)

**Precondición:** llegar desde el formulario (UC-07), desde una comparación guardada (UC-13) o desde el panel de comparaciones recientes del dashboard.

**Contenido**

- Título "Comparison Sheet", chips con los países (el país del usuario resaltado) y los botones "Save" y "Export".
- Cuatro tarjetas de gráfica, cada una aislada de las demás ante errores:

| Gráfica                       | Datos                                                                                                     | Acceso                                                                    |
| ----------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Salary Distribution           | Reales: box plot por país con el agregado nacional (sin filtros de perfil) y la línea "Your monthly wage" | Solo Premium; el resto ve el aviso "Upgrade to Premium for detailed data" |
| Salary Growth — Last 10 Years | **Simulados**: barras por país de 2015 a 2024, etiquetadas "provisional data"                             | Todos                                                                     |
| Sector Distribution           | **Simulados**: dos curvas de densidad y la línea "You"; solo usa los dos primeros países                  | Todos                                                                     |
| Occupation Salary Bands       | **Simulados**: banda P25–P75 por nivel, mediana del sector y "Your salary"                                | Solo Premium                                                              |

**Modos**

- **En vivo** (llegada desde el formulario): el sistema pide los datos de cada país, con estimación por IA si la muestra es pequeña.
- **Reproducción** (llegada desde una comparación guardada): usa las estadísticas guardadas y no hace ninguna petición.

**Excepciones**

- Acceso directo a `/comparison` sin estado de navegación: la hoja aparece sin países (§12, brecha 13).

**Limitaciones conocidas**

- La gráfica real usa el agregado nacional y no los filtros del perfil, así que puede no coincidir con el box plot de la home (§12, brecha 9).

#### UC-12 · Guardar una comparación

`Parcial` · Actor: Free, Premium (Guest recibe un aviso)

**Flujo principal**

1. En la hoja, el usuario pulsa "Save".
2. Se abre el diálogo "Save Comparison Sheet" con el campo "Comparison Name".
3. Escribe un nombre y pulsa "Save".
4. La comparación se añade a su perfil y aparece el aviso "Comparison saved".

**Alternativos y excepciones**

- 1a. **Guest:** se abre el aviso "Log in to save this comparison".
- 4a. Si falla el guardado, aparece un aviso con el error.

**Reglas de negocio**

- Se guarda una instantánea: id, nombre, fecha, países (en orden), país principal, salario y las estadísticas calculadas de cada país (`null` en los que aún no habían cargado).
- Del formulario solo se guardan el país y el salario (§12, brecha 11).
- Límite por plan: 1 (Free) y 4 (Premium). Hoy no se comprueba al guardar (§12, brecha 4).

#### UC-13 · Reabrir una comparación guardada

`Parcial` · Actor: Free, Premium

**Flujo principal**

1. En `/dashboard/comparisons`, el usuario pulsa "View Comparison" en una tarjeta.
2. Se abre la hoja en modo reproducción, con los mismos países y las estadísticas del momento en que se guardó.

**Alternativos**

- 1a. Desde el panel "Recent Comparisons" del dashboard, la hoja se abre en modo en vivo y solo con el país principal (§12, brecha 12).

#### UC-14 · Gestionar comparaciones guardadas

`Implementado` · Actor: Free, Premium · Pantalla: `/dashboard/comparisons`

**Flujo principal**

1. El usuario ve sus comparaciones como tarjetas con nombre y resumen (países).
2. Puede abrir una (UC-13) o eliminarla tras confirmar en un diálogo.
3. Si está por debajo de su límite, ve el botón "Save new comparison (n/máx)", que le lleva a la home.

**Alternativos**

- 1a. Sin comparaciones: mensaje "No saved comparisons yet." y botón "Save your first comparison".

#### UC-15 · Exportar la comparación

`Simulado` · Actor: Premium (Guest y Free reciben un upsell)

**Flujo principal**

1. En la hoja, el usuario Premium pulsa "Export".
2. Se abre el diálogo "Export comparison" con tres formatos: PDF (por defecto), PNG y CSV.
3. Elige uno y pulsa "Export". El diálogo se cierra.

**Alternativos**

- 1a. **Guest o Free:** se abre el diálogo "Upgrade to export your comparison" con la lista de ventajas Premium. "Upgrade to Premium" solo cierra el diálogo (§12, brecha 2).

**Limitaciones conocidas**

- Hoy no se genera ningún archivo (§12, brecha 1).

### 7.4 Cuenta y autenticación

#### UC-16 · Crear una cuenta con email

`Implementado` · Actor: Guest

**Puntos de entrada:** el icono de cuenta del navbar, el enlace "Create an account" de cualquier aviso de inicio de sesión, o el enlace del propio diálogo de acceso.

**Flujo principal**

1. Se abre el diálogo de acceso en modo "Create an account".
2. El usuario introduce email y contraseña y pulsa "Sign Up".
3. El sistema crea la cuenta y envía un email de confirmación que apunta a `/confirm-email`.
4. Aparece el aviso "Check your email to confirm your account".

**Alternativos y excepciones**

- 3a. Si el proyecto no exigiera confirmación, la sesión se abriría directamente con el aviso "Account created. Welcome!".
- 3b. Si el registro falla (email ya usado, contraseña débil…), aparece un aviso con el mensaje de Supabase.

#### UC-17 · Confirmar el email

`Implementado` · Actor: usuario recién registrado · Pantalla: `/confirm-email`

**Flujo principal**

1. El usuario pulsa el enlace del email.
2. La página muestra "Confirming your email..." y, al abrirse la sesión, "Email confirmed! You're all set.".
3. Puede ir a la home ("Go to Home") o al dashboard ("Go to Dashboard").

**Excepciones**

- 2a. Si el enlace ha caducado, la página muestra "This link may have expired — try logging in again." y "Go to Dashboard" queda deshabilitado.

#### UC-18 · Iniciar sesión con email

`Implementado` · Actor: Guest con cuenta

**Flujo principal**

1. El usuario abre el diálogo de acceso (modo "Log in"), introduce email y contraseña y pulsa "Log In".
2. Aparece el aviso "Welcome back!" y el diálogo se cierra.
3. El navbar muestra su avatar (o el icono de cuenta) con un punto verde de sesión activa. Sus límites de plan se aplican de inmediato.

**Excepciones**

- 1a. Credenciales incorrectas: aviso con el mensaje de error.
- 1b. Email sin confirmar: el sistema cierra la sesión recién abierta y muestra "Please confirm your email before logging in.".

**Reglas de negocio**

- Si el inicio de sesión se lanzó desde un aviso (por ejemplo, al guardar una plantilla), el usuario debe repetir la acción original después.

#### UC-19 · Iniciar sesión con Google

`Implementado` · Actor: Guest

**Flujo principal**

1. En el diálogo de acceso, el usuario pulsa "Continue with Google".
2. Se le redirige a Google y, al autorizar, vuelve a la aplicación con la sesión abierta.

**Reglas de negocio**

- El botón "Continue with GitHub" es visible pero está deshabilitado hasta configurar ese proveedor (§12, brecha 23).
- Un usuario de Google empieza con el perfil vacío (sin nombre ni avatar propios).

#### UC-20 · Recuperar la contraseña

`Implementado` · Actor: Guest con cuenta

**Flujo principal**

1. En el diálogo de acceso (modo "Log in"), el usuario pulsa "Forgot password?".
2. Se abre "Reset your password". Introduce su email y pulsa "Send reset link".
3. Aparece el aviso "Check your email for a reset link".
4. El usuario pulsa el enlace del email y llega a `/reset-password`.
5. Cuando el sistema valida el enlace, el campo "New password" se habilita.
6. Introduce la nueva contraseña y pulsa "Update password". Aparece "Password updated" y vuelve a la home con la sesión abierta.

**Excepciones**

- 5a. Si se entra en `/reset-password` sin un enlace válido, la página muestra "Waiting to confirm your reset link..." y el formulario sigue deshabilitado.
- 6a. Si la actualización falla, aparece un aviso con el error.

#### UC-21 · Cerrar sesión

`Implementado` · Actor: Free, Premium

**Flujo principal**

1. En escritorio, el usuario abre el menú de cuenta y pulsa "Sign out". En móvil, lo hace desde el menú lateral.
2. Aparece el aviso "Signed out" y el sistema vuelve a tratarle como Guest.
3. Si estaba en `/dashboard`, se le redirige a la home.

#### UC-22 · Avisos contextuales de inicio de sesión

`Implementado` · Actor: Guest

Cuando un invitado intenta una acción que requiere cuenta, se muestra un aviso con tres opciones: "Log In" (abre el diálogo de acceso en modo login), "Create an account" (lo abre en modo registro) y "Maybe later".

| Disparador                           | Título del aviso                          |
| ------------------------------------ | ----------------------------------------- |
| "Fast fill with a template"          | Log in to fast-fill from a saved template |
| "Save as a template"                 | Log in to save this as a template         |
| "Save" en la hoja de comparación     | Log in to save this comparison            |
| Añadir un país por encima del límite | Log in to compare more countries          |

Existe una quinta variante ("Sign in to continue", sobre exportar a PDF) que hoy no se usa en ninguna pantalla.

### 7.5 Dashboard y perfil

#### UC-23 · Consultar el dashboard

`Implementado` · Actor: Free, Premium · Pantalla: `/dashboard`

**Acceso:** desde el menú de cuenta ("Dashboard") en escritorio, o tocando el icono de cuenta en móvil.

**Contenido**

- Cuatro tarjetas enlazadas:
  - **Saved Comparisons** — "n comparisons saved".
  - **Saved Templates** — "n of máx used".
  - **Manage Plan & Billing** — nombre del plan actual.
  - **Account Settings** — "Email, password, security".
- Panel **Recent Comparisons**: total guardado, las 3 más recientes por fecha y el enlace "View all →". Sin comparaciones muestra "No recent chart data available.".

#### UC-24 · Editar el perfil y las credenciales

`Parcial` · Actor: Free, Premium · Pantalla: `/dashboard/settings`

**Flujo principal**

1. El usuario ve su foto de perfil, nombre, email y un campo "New Password" vacío.
2. Puede subir una imagen (con vista previa inmediata), cambiar nombre, email o contraseña.
3. Pulsa "Save Changes".
4. El sistema sube el avatar a Storage (si hay uno nuevo), actualiza el nombre y el avatar en el perfil y, solo si han cambiado, el email y la contraseña.
5. Aparece el aviso "Settings saved".

**Excepciones**

- 4a. Si algún paso falla, aparece un aviso con el error.

**Reglas de negocio**

- Dejar la contraseña en blanco mantiene la actual.
- Cada usuario solo puede escribir en su propia carpeta del bucket de avatares.

**Limitaciones conocidas**

- "Remove" quita la vista previa pero no borra el avatar guardado (§12, brecha 16).
- Cambiar el email exige confirmarlo por correo, pero la interfaz no lo avisa.

#### UC-25 · Eliminar la cuenta

`Implementado` · Actor: Free, Premium · Pantalla: `/dashboard/settings` (Danger Zone)

**Flujo principal**

1. El usuario pulsa "Delete account" en la sección Danger Zone.
2. Confirma en el diálogo "Delete your account?".
3. El sistema invoca la Edge Function `delete-account`, que borra sus avatares y su usuario (plantillas, comparaciones y datos de pago se borran con él).
4. Se cierra la sesión, aparece el aviso "Account deleted" y el usuario vuelve a la home.

**Excepciones**

- 3a. Si el borrado falla, aparece un aviso con el error y la cuenta sigue intacta.

**Reglas de negocio**

- La acción es irreversible.
- La identidad se obtiene del token de sesión verificado en el servidor: un usuario solo puede borrar su propia cuenta.

#### UC-26 · Proteger el área privada

`Implementado` · Actor: sistema

**Flujo principal**

1. Cualquier ruta bajo `/dashboard` comprueba la sesión. Mientras se resuelve, no muestra nada.
2. Sin sesión, redirige a la home.
3. Con sesión, muestra la página.

**Reglas de negocio**

- La redirección no abre el diálogo de acceso (§12, brecha 24).
- Un error dentro del dashboard muestra una página de error propia con "Back to dashboard".

### 7.6 Planes y facturación

#### UC-27 · Consultar planes y precios

`Implementado` · Actor: cualquiera · Pantalla: `/plans`

**Contenido**

- Cabecera "Get the full salary picture".
- Selector Monthly / Annual que cambia el precio mostrado de Premium (2,99 €/mes o 1,99 €/mes).
- Tarjetas Free y Premium con sus ventajas. Premium aparece como "Recommended".
- El botón del plan actual aparece deshabilitado como "Current plan". Un invitado ve Free como plan actual.

**Limitaciones conocidas**

- La tarjeta Free muestra "$0" mientras el resto de la aplicación usa euros (§12, brecha 18).
- Un usuario Premium ve un botón "Upgrade to Free" activo que no hace nada.

#### UC-28 · Pasar a Premium

`Simulado` · Actor: Free

**Flujo principal**

1. En `/plans`, el usuario pulsa "Upgrade to Premium".
2. El sistema le lleva a `/dashboard/settings/manage-plan` y abre automáticamente el diálogo "Payment Method".
3. Introduce una tarjeta válida (UC-29) y pulsa "Save Card".
4. Su perfil pasa a Premium, se guarda la tarjeta y aparece el aviso "Payment method saved — welcome to Premium!".
5. Los límites Premium se aplican de inmediato.

**Alternativos y excepciones**

- 1a. **Guest:** aparece el aviso "Log in to upgrade to Premium" y no se navega.
- 1b. Desde Manage Plan, la tarjeta "Upgrade to Premium" lleva a `/plans`.
- 3a. Si el usuario cancela el diálogo, sigue en Free.
- 3b. Recargar la página no vuelve a abrir el diálogo.

**Reglas de negocio**

- Premium solo se activa al guardar una tarjeta, nunca antes.
- No hay cobro ni procesador de pagos, y no se añade ninguna entrada al historial de facturación.
- El número completo y el CVC nunca se guardan ni se envían: solo la marca, los 4 últimos dígitos y la caducidad.
- La marca Premium vive en datos de perfil que el propio usuario puede modificar (§12, brecha 6).

#### UC-29 · Gestionar el método de pago

`Simulado` · Actor: Free, Premium · Pantalla: Manage Plan

**Flujo principal**

1. En el panel "Payment Method", el usuario pulsa "+ Add payment method" (o "Update" si ya tiene tarjeta).
2. Rellena Card Number, Expiry y CVC. Los campos se formatean mientras escribe (bloques de 4 dígitos y barra en MM/YY).
3. Pulsa "Save Card". La tarjeta se guarda y aparece el aviso "Payment method saved".
4. El panel muestra, por ejemplo, "Visa •••• 4242 · expires 12/27".

**Excepciones**

- 3a. Validación, con el error bajo cada campo:
  - Número: entre 13 y 19 dígitos ("Enter a valid card number").
  - Caducidad: formato MM/YY, mes de 1 a 12 ("Enter a valid expiry (MM/YY)") y no vencida ("Card has expired").
  - CVC: 3 o 4 dígitos ("Enter a valid CVC").

**Reglas de negocio**

- La marca se detecta por el prefijo del número: Visa, Mastercard, Amex o "Card".
- Al cerrar o cancelar, los datos escritos se descartan.

#### UC-30 · Cancelar la suscripción

`Parcial` · Actor: Premium · Pantalla: Manage Plan

**Flujo principal**

1. El usuario pulsa "Cancel Subscription".
2. Confirma en el diálogo "Cancel your subscription?" (o elige "Keep Premium").
3. Su perfil vuelve a Free.

**Limitaciones conocidas**

- El texto promete mantener Premium hasta el final del periodo de facturación, pero se retira de inmediato (§12, brecha 8).
- No está definido qué pasa con las plantillas y comparaciones que superan el límite Free (§14).

#### UC-31 · Consultar el plan actual y el historial de facturación

`Simulado` · Actor: Free, Premium · Pantalla: Manage Plan

**Contenido**

- Tarjeta del plan actual: nombre y precio. Premium muestra "Renews <fecha>" y la etiqueta "ACTIVE"; Free muestra "No active subscription — upgrade anytime.".
- Free ve además la tarjeta de upgrade.
- "Billing History": fecha, descripción e importe de cada cargo, o "No billing history yet.".

**Limitaciones conocidas**

- La fecha de renovación es fija y el historial nunca se rellena (§12, brecha 7).

### 7.7 Transversales

#### UC-32 · Cambiar entre tema claro y oscuro

`Parcial` · Actor: cualquiera

**Flujo principal**

1. En escritorio, el usuario pulsa el icono de sol o luna del navbar. En móvil, el botón "Light mode" / "Dark mode" del menú lateral.
2. Toda la interfaz, gráficas incluidas, cambia de tema.

**Reglas de negocio**

- El tema oscuro es el de referencia y el predeterminado. El claro es una inversión con las mismas proporciones de contraste.

**Limitaciones conocidas**

- La preferencia no se guarda: al recargar vuelve al oscuro. Los avisos emergentes siempre se muestran en oscuro (§12, brecha 17).

#### UC-33 · Navegar por la aplicación

`Implementado` · Actor: cualquiera

**Escritorio**

- Navbar fija con logo, enlaces "About" y "Plans" (el activo resaltado), botón de tema y botón de cuenta.
- Botón de cuenta: sin sesión, abre el diálogo de acceso; con sesión, abre un menú con "Dashboard" y "Sign out", que se cierra al hacer clic fuera.

**Móvil**

- Cabecera con botón de cuenta (abre el diálogo de acceso o lleva al dashboard), logo y botón de menú.
- El menú lateral entra desde la derecha con los enlaces, el botón de tema y "Sign out". Se cierra con Escape, tocando fuera o al elegir un enlace, y bloquea el desplazamiento de la página mientras está abierto.

**Común**

- Indicador verde junto al avatar cuando hay sesión.
- Pie con "© <año> Wage Comparator", el enlace "Privacy & Terms" y un enlace al código en GitHub.
- Botón "Back" en las páginas secundarias.
- Cada página se carga bajo demanda, con un esqueleto mientras llega.

#### UC-34 · Consultar información del producto

`Implementado` · Actor: cualquiera · Pantallas: `/about`, `/privacy`

**Contenido de `/about`**

- Propuesta de valor en cuatro tarjetas: Statistical Precision, Pan-European Coverage, Privacy First y Real-Time Insights.
- Fuentes de datos y explicación de mediana, Q1 y Q3 con un ejemplo de siete salarios.
- Privacidad, derechos RGPD y preguntas frecuentes.
- Contacto: support@wagecomparator.eu.

**Contenido de `/privacy`:** qué datos se guardan (solo lo que el usuario guarda explícitamente) y condiciones de uso (las comparaciones son estimaciones informativas).

**Limitaciones conocidas**

- About afirma "20+ European countries" y actualización trimestral, pero el dataset tiene 11 países y es estático (§12, brecha 20).

#### UC-35 · Recuperarse de errores

`Parcial` · Actor: cualquiera

| Situación                                  | Comportamiento                                                              |
| ------------------------------------------ | --------------------------------------------------------------------------- |
| Ruta inexistente                           | "Page not found" con "Back to home"                                         |
| Error de renderizado en una página pública | "Something went wrong" con "Back to home"                                   |
| Error o ruta inexistente en `/dashboard`   | Página de error propia con "Back to dashboard"                              |
| Error dentro de una gráfica                | Solo falla esa gráfica; el resto de la página sigue funcionando             |
| Error en una acción del usuario            | Aviso emergente con el mensaje                                              |
| Error al pedir datos salariales            | La gráfica se queda en el loader, sin mensaje ni reintento (§12, brecha 14) |

---

## 8. Datos

### 8.1 Dataset salarial

- Tabla `TABLE_0` en Postgres (Supabase), con las columnas Country, Gender, Occupation, Occupation Level, Economic Activity, Education Level y Monthly Wage.
- 11 países, con hasta unas 5.800 filas por país. Fuente declarada: Eurostat SES.
- Solo se accede mediante dos funciones RPC, que devuelven arrays ya agregados para esquivar el límite de 1.000 filas por respuesta:
  - `wage_distinct_options(p_filters, p_field)` → valores distintos y no nulos de una columna.
  - `wage_monthly_wages(p_filters)` → salarios mensuales que cumplen los filtros.
- Calidad: contiene valores absurdos (por ejemplo, miles de millones de euros al mes en Francia) y registros en moneda local sin convertir (Dinamarca). Se filtran con el tope de 15.000 €/mes.

### 8.2 Perfil de usuario

Todo el estado del usuario se guarda en los metadatos de su usuario de Supabase Auth; no hay tablas propias. Al leerlos, las entradas con forma incorrecta se descartan sin romper la aplicación.

| Campo             | Contenido                                                                                                   | Casos de uso  |
| ----------------- | ----------------------------------------------------------------------------------------------------------- | ------------- |
| `name`            | Nombre visible                                                                                              | UC-24         |
| `avatarUrl`       | URL pública del avatar                                                                                      | UC-24, UC-33  |
| `premium`         | Si el usuario es Premium                                                                                    | UC-28, UC-30  |
| `payData.card`    | Marca, últimos 4 dígitos y caducidad, o vacío                                                               | UC-29         |
| `payData.history` | Cargos: id, fecha, descripción, importe                                                                     | UC-31         |
| `templates`       | Lista de plantillas: id, nombre y los 9 valores del formulario                                              | UC-08 a UC-10 |
| `comparisons`     | Lista de comparaciones: id, nombre, fecha, países, país principal, salario, valores y estadísticas por país | UC-12 a UC-14 |

### 8.3 Archivos

Bucket `Avatars`, con la ruta `<userId>/avatar_<marca de tiempo>.<extensión>`. Las políticas de acceso exigen que la primera carpeta coincida con el usuario autenticado. Las imágenes se sirven con URL pública.

### 8.4 Estado en el navegador (`sessionStorage`)

| Clave                                        | Contenido                                  |
| -------------------------------------------- | ------------------------------------------ |
| `salary-comparator:form-step`                | Paso actual del formulario (1 a 3)         |
| `salary-comparator:form-values`              | Valores del formulario                     |
| `salary-comparator:extra-countries`          | Países de comparación                      |
| `salary-comparator:enrichment:<país+perfil>` | Estimación de la IA para ese país y perfil |

## 9. Integraciones

| Integración                        | Uso                                                                                                                             |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Supabase Auth                      | Registro con confirmación de email, inicio de sesión con email y Google, recuperación de contraseña, perfil de usuario          |
| Supabase Postgres                  | Dataset salarial mediante las dos funciones RPC                                                                                 |
| Supabase Storage                   | Avatares de usuario                                                                                                             |
| Edge Function `enrich-salary-data` | Recibe el país y un perfil de 7 campos y devuelve una distribución estimada por Gemini. No está versionada en este repositorio. |
| Edge Function `delete-account`     | Borrado de cuenta con privilegios de servicio; método DELETE, responde 204                                                      |
| Google Gemini                      | Estimación salarial, llamada solo desde el servidor                                                                             |
| Vercel                             | Alojamiento de la SPA, con todas las rutas redirigidas a `index.html`                                                           |

## 10. Requisitos no funcionales

### Rendimiento

- Cada página es un fragmento que se carga bajo demanda.
- Cada selección del formulario genera una sola petición, que trae los datos de la gráfica y las opciones del siguiente campo.
- Caché en tres niveles: resultados por combinación de filtros durante 5 minutos, lista de países durante toda la pestaña y estimaciones de IA durante toda la pestaña.
- Los países de comparación se piden en paralelo.

### Accesibilidad

- Comboboxes con roles ARIA y navegación por teclado (flechas, Enter, Escape), etiqueta, ayuda y mensaje de error asociados.
- Las gráficas tienen capa de accesibilidad de Recharts y una descripción solo para lectores de pantalla. El loader se anuncia como región viva.
- Foco visible en todos los controles, etiquetas accesibles en los botones de icono y menú móvil como diálogo modal que se cierra con Escape.
- El desplazamiento automático respeta `prefers-reduced-motion`.
- Tokens de color ajustados para mantener el contraste en modo claro.

### Diseño y responsive

- Diseño mobile-first: en móvil, gráfica encima del formulario; en escritorio (`lg`), dos columnas; menú lateral por debajo de `md`.
- Sistema de diseño en [DESIGN.md](DESIGN.md): tipografía Poppins, acento `#DFFF88` y paleta de 6 colores reservada a las gráficas, igual en ambos temas.

### Seguridad y privacidad

- La clave de Gemini nunca llega al navegador.
- El borrado de cuenta obtiene la identidad del token de sesión, no de datos enviados por el cliente.
- Solo se guarda lo que el usuario guarda explícitamente; no hay analítica ni seguimiento del uso anónimo.
- Los datos completos de la tarjeta nunca se guardan ni se envían.
- **Riesgo:** el plan Premium y los límites se aplican solo en el cliente, y la marca `premium` vive en metadatos que el propio usuario puede modificar (§12, brecha 6).

### Calidad

- TypeScript en modo estricto, ESLint con reglas de tipos y de fronteras entre features, Prettier obligatorio antes de cada commit.
- Tests con Jest y Testing Library (hoy cubren Button, `useFeatureAccess` y ExportButton).
- Storybook para los componentes base, con el addon de accesibilidad.

## 11. Métricas de éxito (propuestas)

La aplicación no tiene analítica. Estas métricas requerirían instrumentarla:

| Métrica                                                            | Objetivo relacionado |
| ------------------------------------------------------------------ | -------------------- |
| % de visitantes que eligen un país (activación)                    | O1                   |
| % de visitantes que completan los 3 pasos                          | O1                   |
| % de sesiones con al menos un país de comparación                  | O2                   |
| Conversión de Guest a Free desde los avisos de inicio de sesión    | O3                   |
| Conversión de Free a Premium                                       | O3                   |
| % de consultas que requieren estimación por IA, y su tasa de error | Calidad de datos     |
| Tiempo desde la selección hasta la gráfica (p95)                   | O1                   |

## 12. Brechas conocidas

Detectadas al revisar el código para este documento.

| #   | Área          | Brecha                                                                                                                                                             | Dónde                                                                                                                                                                             |
| --- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Exportación   | Exportar no genera ningún archivo: la hoja pasa un manejador vacío.                                                                                                | [ComparisonSheet.tsx](../src/features/comparison/components/ComparisonSheet.tsx)                                                                                                  |
| 2   | Upsell        | "Upgrade to Premium" en los diálogos de upgrade (comparar y exportar) solo cierra el diálogo; no lleva a `/plans`.                                                 | [SalaryCalculator.tsx](../src/features/salary-comparator/components/SalaryCalculator.tsx), [ExportButton.tsx](../src/features/export/components/ExportButton.tsx)                 |
| 3   | Upsell        | El upsell de comparar países dice "Exporting is a Premium feature. Upgrade to unlock:" (texto por defecto del diálogo).                                            | [UpgradeDialog.tsx](../src/features/premium/components/UpgradeDialog.tsx)                                                                                                         |
| 4   | Límites       | Los límites de plantillas y comparaciones no se comprueban al guardar; solo ocultan el botón de las páginas de gestión.                                            | [SalaryCalculator.tsx](../src/features/salary-comparator/components/SalaryCalculator.tsx), [ComparisonSheet.tsx](../src/features/comparison/components/ComparisonSheet.tsx)       |
| 5   | Límites       | `chartViews` está definido por plan pero no se usa en ninguna parte.                                                                                               | [config.ts](../src/features/premium/config.ts)                                                                                                                                    |
| 6   | Seguridad     | Premium y límites solo se aplican en el cliente; `premium` está en metadatos editables por el usuario. Debe pasar al servidor antes de cobrar.                     | [AuthProvider.tsx](../src/features/auth/AuthProvider.tsx)                                                                                                                         |
| 7   | Facturación   | Pago simulado: sin cobro, el historial nunca se rellena y la fecha de renovación es fija (`2026-08-01`).                                                           | [ManagePlan.tsx](../src/pages/ManagePlan.tsx)                                                                                                                                     |
| 8   | Facturación   | Cancelar retira Premium al momento, aunque el texto promete mantenerlo hasta el final del periodo.                                                                 | [ManagePlan.tsx](../src/pages/ManagePlan.tsx)                                                                                                                                     |
| 9   | Hoja          | La hoja usa el agregado nacional, sin los filtros del perfil, así que no coincide con el box plot de la home.                                                      | [ComparisonSheet.tsx](../src/features/comparison/components/ComparisonSheet.tsx)                                                                                                  |
| 10  | Hoja          | Tres de las cuatro gráficas usan datos simulados; Sector Distribution solo usa los dos primeros países.                                                            | [comparison/components/](../src/features/comparison/components/)                                                                                                                  |
| 11  | Hoja          | Una comparación guardada solo conserva el país y el salario del formulario; el resumen no puede mostrar la ocupación.                                              | [ComparisonSheet.tsx](../src/features/comparison/components/ComparisonSheet.tsx)                                                                                                  |
| 12  | Hoja          | "Recent Comparisons" abre la hoja en modo en vivo y solo con el país principal, a diferencia de "View Comparison".                                                 | [RecentComparisonsPanel.tsx](../src/features/comparison/components/RecentComparisonsPanel.tsx)                                                                                    |
| 13  | Hoja          | Entrar en `/comparison` sin estado muestra una hoja vacía, sin mensaje ni redirección.                                                                             | [ComparisonPage.tsx](../src/pages/ComparisonPage.tsx)                                                                                                                             |
| 14  | Errores       | Si falla la consulta salarial (o la IA), la gráfica se queda en el loader sin mensaje ni reintento.                                                                | [MainChart.tsx](../src/features/salary-comparator/components/MainChart.tsx)                                                                                                       |
| 15  | Formulario    | Cambiar un campo anterior no reinicia los posteriores; la combinación puede quedarse sin datos reales y pasar entera a la estimación por IA.                       | [useSalaryFormState.ts](../src/features/salary-comparator/hooks/useSalaryFormState.ts)                                                                                            |
| 16  | Perfil        | "Remove" en el avatar no borra el avatar guardado.                                                                                                                 | [UserSettings.tsx](../src/pages/UserSettings.tsx)                                                                                                                                 |
| 17  | Tema          | El tema no se guarda entre recargas (CLAUDE.md prevé guardarlo en `localStorage`); los avisos emergentes siempre van en oscuro.                                    | [ThemeProvider.tsx](../src/app/providers/ThemeProvider.tsx), [AppProviders.tsx](../src/app/AppProviders.tsx)                                                                      |
| 18  | Planes        | La tarjeta Free muestra "$0" frente a € en el resto; Premium ve un "Upgrade to Free" que no hace nada; un invitado recibe un aviso en lugar del diálogo de acceso. | [PlanCard.tsx](../src/features/premium/components/PlanCard.tsx), [Plans.tsx](../src/pages/Plans.tsx)                                                                              |
| 19  | Planes        | La tarjeta de upgrade de Manage Plan anuncia "4 countries"; Premium permite 3.                                                                                     | [ManagePlanPanel.tsx](../src/features/premium/components/ManagePlanPanel.tsx)                                                                                                     |
| 20  | Contenido     | About anuncia "20+ European countries" y actualización trimestral; el dataset tiene 11 países y es estático.                                                       | [About.tsx](../src/pages/About.tsx)                                                                                                                                               |
| 21  | Exportación   | El botón de exportar comprueba `accurateData` en lugar de `canExport` (cambio sin commitear). Hoy ambos valen lo mismo en todos los planes.                        | [ExportButton.tsx](../src/features/export/components/ExportButton.tsx)                                                                                                            |
| 22  | Validación    | Se pueden guardar plantillas y comparaciones con nombre vacío.                                                                                                     | [SaveTemplateDialog.tsx](../src/features/templates/components/SaveTemplateDialog.tsx), [SaveComparisonDialog.tsx](../src/features/comparison/components/SaveComparisonDialog.tsx) |
| 23  | Acceso        | El inicio de sesión con GitHub está deshabilitado.                                                                                                                 | [AuthDialog.tsx](../src/features/auth/components/AuthDialog.tsx)                                                                                                                  |
| 24  | Acceso        | Entrar en `/dashboard` sin sesión redirige a la home sin abrir el diálogo de acceso.                                                                               | [ProtectedRoute.tsx](../src/app/ProtectedRoute.tsx)                                                                                                                               |
| 25  | Transparencia | La interfaz no indica cuándo la distribución incluye una estimación por IA.                                                                                        | [MainChart.tsx](../src/features/salary-comparator/components/MainChart.tsx)                                                                                                       |

## 13. Siguientes pasos sugeridos

Derivados de las brechas; no son compromisos de roadmap.

1. **Cerrar el embudo de upgrade:** que "Upgrade to Premium" lleve a `/plans`, corregir los textos (brechas 2, 3, 18 y 19) y llevar al invitado al diálogo de acceso.
2. **Llevar los permisos al servidor:** marca Premium en datos que el usuario no pueda editar, límites comprobados al guardar y pagos con un procesador real (brechas 4, 6, 7 y 8).
3. **Completar la hoja de comparación:** aplicar los filtros del perfil, guardar el formulario completo, unificar la apertura desde el dashboard y gestionar el acceso sin estado (brechas 9, 11, 12 y 13).
4. **Exportación real** en PDF, PNG y CSV (brecha 1).
5. **Datos reales** para Salary Growth, Sector Distribution y Occupation Salary Bands (brecha 10).
6. **Estado de error con reintento** en la gráfica principal (brecha 14).
7. **Animaciones previstas** en [architecture.md §5](architecture.md): transiciones entre pasos del formulario y animación de las gráficas al actualizarse.

## 14. Preguntas abiertas

- ¿Qué pasa con las plantillas y comparaciones que superan el límite Free cuando un usuario deja Premium?
- ¿Debe la interfaz avisar cuando la distribución incluye una estimación por IA?
- ¿La hoja de comparación debe usar los filtros del perfil o el agregado nacional?
- ¿El plan anual se cobra como 1,99 €/mes facturado una vez al año (23,88 €)? La interfaz solo muestra el precio mensual equivalente.
- ¿Debe el inicio de sesión lanzado desde un aviso completar después la acción original (guardar, comparar)?
- ¿Cuál es la fuente exacta y la frecuencia de actualización del dataset?

## 15. Glosario

| Término             | Definición                                                                                                  |
| ------------------- | ----------------------------------------------------------------------------------------------------------- |
| Box plot            | Gráfica que resume una distribución con mínimo, Q1, mediana, Q3 y máximo.                                   |
| Q1 / Q3             | Percentiles 25 y 75: un cuarto de los salarios queda por debajo de Q1 y tres cuartos por debajo de Q3.      |
| Mediana             | Percentil 50: la mitad de los salarios queda por debajo.                                                    |
| Cascada             | Mecanismo por el que cada campo del formulario solo ofrece valores que existen dados los campos anteriores. |
| País base           | El país elegido en el paso 1; siempre va primero y con el primer color.                                     |
| Salario plausible   | Salario mensual igual o inferior a 15.000 €; los superiores se descartan como errores del dataset.          |
| Estimación por IA   | Distribución calculada por Gemini cuando hay menos de 8 salarios plausibles.                                |
| Plantilla           | Conjunto guardado de valores del formulario para rellenarlo de nuevo con un clic.                           |
| Hoja de comparación | Página `/comparison` con cuatro gráficas sobre los países elegidos.                                         |
| Modo reproducción   | Apertura de una comparación guardada usando sus estadísticas guardadas, sin pedir datos nuevos.             |
| Tier / plan         | Nivel de acceso del usuario: Guest, Free o Premium.                                                         |

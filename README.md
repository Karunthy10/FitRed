# FIT·RED — proyecto Vite (con componentes separados)

Migrado el 13 jul 2026 desde el deployment plano de Vercel (un solo
`app.js` sin build step) a un proyecto Vite con React local y el código
dividido en archivos por pantalla/responsabilidad.

## Estructura

```
src/
  main.jsx                 <- punto de entrada, monta <App/>
  style.css
  data/
    seed.js                <- datos semilla: ejercicios, rutina de
                               ejemplo, posts de comunidad, tempos, cues
    store.js                <- el "backend falso": todo el estado vive
                               en localStorage, aquí están las funciones
                               que leen/escriben (votar, crear rutina,
                               registrar set, calcular e1RM, etc.)
  components/
    App.jsx                <- nav + router simple entre pantallas
    Entrenar.jsx            <- sesión de hoy, captura de sets, timer,
                               historial
    Rutinas.jsx              <- mis rutinas + rutinas de la comunidad
    RoutineEditor.jsx        <- editor de una rutina (agregar/quitar
                               días y ejercicios)
    Ejercicios.jsx           <- mapa de músculos + catálogo de
                               ejercicios por músculo
    ExerciseForum.jsx        <- debate/comentarios de un ejercicio
    Comunidad.jsx            <- feed de posts + crear post
    PostDetail.jsx           <- detalle de un post + comentarios
    Progreso.jsx             <- heatmap por músculo, PRs, gráficas,
                               exportar/importar respaldo
    BodyMap.jsx              <- el SVG del cuerpo humano clickeable
    ui.jsx                   <- piezas chiquitas reusadas en varias
                               pantallas: Chip (botón pastilla), Vote
                               (▲/▼), Heart (❤ like), formatMMSS (timer)
```

## Notas importantes

- **Nombres de variable cortos (`q`, `H`, `C`, `j`, etc.):** vienen del
  código minificado original, NO los renombré al separar archivos, para
  minimizar el riesgo de romper algo en la migración. Cada archivo
  importa exactamente las funciones de `store.js`/`ui.jsx` que usa —
  puedes renombrarlas tú mismo con Claude Code cuando quieras (es un
  buen primer proyecto para el skill `frontend-design`).
- **Sin JSX "bonito":** el código sigue usando llamadas directas
  `jsx(...)`/`jsxs(...)` en vez de la sintaxis `<Componente/>` — porque
  venía de código ya compilado. Convertirlo a JSX real es otro buen
  paso de limpieza a futuro, pero no es necesario para que funcione.
- **Verificado con pruebas automatizadas (Playwright, Chromium
  headless):** 16/16 checks pasando — las 5 pestañas cargan, el mapa
  de músculos + catálogo de ejercicios funciona, el editor de rutina
  abre, el foro de un ejercicio abre, el detalle de un post abre, y el
  flujo completo de captura de set (peso → reps → ✓ → timer de
  descanso) funciona sin errores de consola.
- **Tu progreso (pesos/reps) no se migra** — por decisión tuya, se
  queda en el localStorage de la URL vieja de Vercel y no se respaldó.

## Cómo correrlo

    npm install
    npm run dev        # servidor local con hot reload
    npm run build       # build de producción -> carpeta dist/
    npm run preview     # sirve el build de producción localmente

## Deploy a Vercel

Ya trae `vite.config.js` con el plugin de React; Vercel detecta el
framework (Vite) automáticamente al subir esta carpeta.

## Pendiente

- Faltan `icon-192.png` e `icon-180.png` en `public/` (Claude Code
  puede generarlos).

/**
 * app.js — Orquestador principal
 *
 * Para agregar un módulo nuevo:
 *   1. Crear modules/mi-modulo.js exportando el objeto de módulo
 *   2. Importarlo aquí y llamar router.register(MiModulo)
 *   3. Listo — el sidebar y el layout se construyen automáticamente.
 */
import * as router from './core/router.js';

// ── Módulos ────────────────────────────────
import Vectors        from './modules/vectors.js';
import Lines2D        from './modules/lines2d.js';
import Lines3D        from './modules/lines3d.js';
import Planes         from './modules/planes.js';
import Intersections  from './modules/intersections.js';
import Metrics        from './modules/metrics.js';
import Economics      from './modules/economics.js';
import Theory         from './modules/theory.js';
import ExerciseLines  from './modules/exercise_lines.js';
import ParameterK     from './modules/parameter_k.js';
import ExerciseGuide  from './modules/exercise_guide.js';

// ── Registro ───────────────────────────────
router.register(Vectors);
router.register(Lines2D);
router.register(Lines3D);
router.register(Planes);
router.register(Intersections);
router.register(Metrics);
router.register(Economics);
router.register(Theory);
router.register(ExerciseLines);
router.register(ParameterK);
router.register(ExerciseGuide);

// ── Arrancar ───────────────────────────────
router.start('vectors');

// ── Re-render on resize ────────────────────
window.addEventListener('resize', () => {
  // Plotly containers respond automatically (responsive:true)
  // Canvas-based modules need a nudge
  const active = document.querySelector('.module.active');
  if (!active) return;
  const id = active.id.replace('mod-', '');
  const mod = { vectors: Vectors, metrics: Metrics }[id];
  mod?.init?.();
});

/**
 * modules/exercise_guide.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Módulo: Guía de Ejercicios
 *
 * Contiene todos los ejercicios relevantes de la guía de Álgebra CBC prearmados.
 * El usuario elige el número de ejercicio, el sistema lo carga, lo resuelve
 * paso a paso y lo visualiza en 2D/3D automáticamente.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { norm, sub, cross, dot, scale, add, fmt, areParallel, solve2x2, unit, angleDeg } from '../core/math.js';
import { line3D, layout3D, plot3D } from '../core/plotly3d.js';

// ─────────────────────────────────────────────────────────────
//  EXERCISE DATABASE
// ─────────────────────────────────────────────────────────────
const EXERCISES = [

  // ── VECTORES ──────────────────────────────────────────────

  {
    num: 24, title: 'Representar puntos en R³', category: 'vectores',
    description: 'Representar en R³: A=(2,0,0), B=(2,2,0), C=(2,2,2), D=(0,0,−1), E=(0,3,1), F=(2,0,−1).',
    type: 'points3d',
    data: {
      points: [
        { label: 'A', coords: [2,0,0], color: '#6c63ff' },
        { label: 'B', coords: [2,2,0], color: '#00d4ff' },
        { label: 'C', coords: [2,2,2], color: '#ff6b9d' },
        { label: 'D', coords: [0,0,-1], color: '#00e5a0' },
        { label: 'E', coords: [0,3,1], color: '#ffb347' },
        { label: 'F', coords: [2,0,-1], color: '#c084fc' },
      ]
    }
  },

  {
    num: 25, title: 'Suma de vectores en R³', category: 'vectores',
    description: 'Si A=(0,0,2) y B=(4,0,0), C=A+B. Representar A, B, C y calcular C.',
    type: 'vector_ops',
    data: {
      vectors: [
        { label: 'A', coords: [0,0,2], color: '#6c63ff' },
        { label: 'B', coords: [4,0,0], color: '#00d4ff' },
      ],
      ops: [{ type: 'add', a: 'A', b: 'B', label: 'C' }]
    }
  },

  {
    num: 27, title: 'Combinación lineal (hallar α)', category: 'vectores',
    description: 'Si A=(1,1,−2), B=(−1,−3,4), C=(1,−1,0); hallar α tal que αA + B = C.',
    type: 'lin_comb',
    data: {
      A: [1,1,-2], B: [-1,-3,4], C: [1,-1,0],
      hint: 'Se plantea el sistema αA + B = C componente a componente y se resuelve para α.',
    }
  },

  // ── RECTAS ────────────────────────────────────────────────

  {
    num: 28, title: 'Ecuación paramétrica de rectas', category: 'rectas',
    description: 'Escribir la ecuación paramétrica de las rectas a) a e) y visualizarlas.',
    type: 'lines3d_multi',
    data: {
      lines: [
        { label: 'a)', p: [0,0,0], d: [1,-1,2], color: '#6c63ff', note: 'Dirección (1,−1,2), pasa por el origen' },
        { label: 'b)', p: [0,2,-3], d: [1,-1,2], color: '#00d4ff', note: 'Dirección (1,−1,2), pasa por (0,2,−3)' },
        { label: 'c)', p: [0,3,2], d: [2,1,-1], color: '#ff6b9d', note: 'Paralela a L: λ(2,1,−1)+(−2,4,1), pasa por (0,3,2)' },
        { label: 'd)', p: [3,4,-1], d: [3,4,-1], color: '#00e5a0', note: 'Pasa por (3,4,−1) y el origen → d=(3,4,−1)−(0,0,0)' },
        { label: 'e)', p: [1,5,1], d: [-5,-2,1], color: '#ffb347', note: 'Pasa por (1,5,1) y (−4,3,2) → d=(−4−1,3−5,2−1)' },
      ]
    }
  },

  {
    num: 29, title: 'Rectas paralelas y punto en recta', category: 'rectas',
    description: 'L₁: λ(1,2,−1)+(1,3,5). L₂ paralela a L₁ pasa por (3,2,4). a) Punto de L₂ con x₁=0. b) ¿(−1,−1,7) y (1,−2,6) están en L₂?',
    type: 'line_point_check',
    data: {
      L1: { p: [1,3,5], d: [1,2,-1] },
      L2: { p: [3,2,4], d: [1,2,-1] },  // parallel → same direction
      checkPoints: [[-1,-1,7],[1,-2,6]],
      targetX: 0,  // find point on L2 with x=0
    }
  },

  {
    num: 30, title: 'Hallar k para rectas paralelas', category: 'rectas',
    description: 'Hallar todos los valores de k para los cuales la recta que pasa por (1,−1,1) y (4,k,−2) es paralela a L: t(1,2,−1)+(0,3,2).',
    type: 'find_k_parallel',
    data: {
      P1: [1,-1,1],
      P2_template: [4, 'k', -2],
      L_ref: { p: [0,3,2], d: [1,2,-1] },
    }
  },

  {
    num: 31, title: 'Posición relativa de 4 rectas', category: 'rectas',
    description: 'L₁:α(1,2,1)+(2,3,2), L₂:β(0,1,−1)+(1,3,−1), L₃:(2,4,2)+(1,5,0), L₄:(2,4,2)+(3,5,3). Hallar intersecciones y analizar posiciones relativas.',
    type: 'lines_intersect',
    data: {
      lines: [
        { label: 'L₁', p: [2,3,2], d: [1,2,1], color: '#6c63ff' },
        { label: 'L₂', p: [1,3,-1], d: [0,1,-1], color: '#00d4ff' },
        { label: 'L₃', p: [1,5,0], d: [2,4,2], color: '#ff6b9d' },
        { label: 'L₄', p: [3,5,3], d: [2,4,2], color: '#00e5a0' },
      ]
    }
  },

  {
    num: 32, title: 'Recta paralela a L pasando por A', category: 'rectas',
    description: 'Sean L: β(1,1,−2)+(0,0,3) y A=(3,1,0). Determinar un punto B tal que la recta que pasa por A y B sea paralela a L.',
    type: 'parallel_through_point',
    data: {
      L: { p: [0,0,3], d: [1,1,-2] },
      A: [3,1,0],
    }
  },

  // ── PLANOS ────────────────────────────────────────────────

  {
    num: 34, title: 'Ecuación paramétrica de planos', category: 'planos',
    description: 'Escribir la ecuación paramétrica y representar el plano a) A=(0,0,0), B=(1,0,0), C=(0,1,0).',
    type: 'plane_3pts',
    data: {
      cases: [
        { label: 'a)', A: [0,0,0], B: [1,0,0], C: [0,1,0], color: '#6c63ff' },
        { label: 'b)', A: [0,0,1], B: [1,0,1], C: [0,1,1], color: '#00d4ff' },
        { label: 'd)', A: [0,0,0], B: [2,0,1], C: [1,0,3], color: '#ff6b9d' },
        { label: 'e)', A: [1,3,1], B: [2,1,1], C: [3,4,1], color: '#00e5a0' },
      ]
    }
  },

  // ── INTERSECCIONES ────────────────────────────────────────

  {
    num: 36, title: 'Intersección de dos planos', category: 'intersecciones',
    description: 'Hallar la intersección de los planos π₁ y π₂ para cada caso.',
    type: 'plane_intersection',
    data: {
      cases: [
        { label: 'a)', pi1: { normal: [1,0,0], d: 0 }, pi2: { normal: [0,0,1], d: 0 }, note: 'x₁=0 ∩ x₃=0' },
        { label: 'b)', pi1: { normal: [0,1,0], d: 0 }, pi2: { normal: [0,0,1], d: -2 }, note: 'x₂=0 ∩ x₃=2' },
        { label: 'c)', pi1: { normal: [1,0,1], d: 0 }, pi2: { normal: [0,1,-1], d: 0 }, note: 'x₁+x₃=0 ∩ x₂−x₃=0' },
        { label: 'd)', pi1: { normal: [1,1,-2], d: 0 }, pi2: { normal: [2,0,1], d: -2 }, note: 'x₁+x₂−2x₃=0 ∩ 2x₁+x₃=2' },
        { label: 'e)', pi1: { normal: [1,1,-1], d: 0 }, pi2: { normal: [2,2,-2], d: -3 }, note: 'x₁+x₂−x₃=0 ∩ 2x₁+2x₂−2x₃=3 (paralelos)' },
        { label: 'f)', pi1: { normal: [1,1,-1], d: -1 }, pi2: { normal: [2,2,-2], d: -2 }, note: 'x₁+x₂−x₃=1 ∩ 2x₁+2x₂−2x₃=2 (coincidentes)' },
      ]
    }
  },

  {
    num: 40, title: 'Intersección de recta y plano', category: 'intersecciones',
    description: 'Hallar la intersección de la recta L con el plano π para cada caso.',
    type: 'line_plane_intersect',
    data: {
      cases: [
        { label: 'a)', L: { p: [2,2,3], d: [1,2,1] }, pi: { normal: [0,0,1], d: 0 }, note: 'L:α(1,2,1)+(2,2,3) ∩ x₃=0' },
        { label: 'd)', L: { p: [0,1,1], d: [0,1,-1] }, pi: { normal: [0,1,1], d: -2 }, note: 'L:α(0,1,−1)+(0,1,1) ∩ x₂+x₃=2' },
        { label: 'e)', L: { p: [0,1,1], d: [0,1,-1] }, pi: { normal: [0,1,1], d: 0 },  note: 'L:α(0,1,−1)+(0,1,1) ∩ x₂+x₃=0' },
      ]
    }
  },

  // ── ECONOMÍA ──────────────────────────────────────────────

  {
    num: 41, title: 'Ecuación presupuestaria en R³', category: 'economía',
    description: 'Presupuesto $900. Lechuga $25/kg, Tomate $30/kg, Zanahoria $10/kg. Plantear plano presupuestario.',
    type: 'budget_plane',
    data: {
      budget: 900,
      goods: ['Lechuga', 'Tomate', 'Zanahoria'],
      prices: [25, 30, 10],
      questions: [
        'Máxima cantidad de Zanahoria: $900/$10 = 90 kg',
        'Si compra 12 kg lechuga y 4 kg tomate: 25(12)+30(4)=420 → resta $480 → 480/10 = 48 kg zanahoria',
      ]
    }
  },

  {
    num: 42, title: 'Ecuación presupuestaria en R²', category: 'economía',
    description: 'Presupuesto $400. Cuaderno $16/u. Máximo 80 biromes. Plantear recta balance.',
    type: 'budget_line',
    data: {
      budget: 400,
      goods: ['Cuadernos', 'Biromes'],
      prices: [16, 400/80],  // price of birome = 400/80 = 5
      questions: [
        'Precio birome: $400/80 = $5',
        'Máx cuadernos: $400/$16 = 25',
        'Si compra 32 biromes: 5(32)=160 → resta $240 → 240/16 = 15 cuadernos',
      ]
    }
  },

];

// ─────────────────────────────────────────────────────────────
//  MODULE EXPORT
// ─────────────────────────────────────────────────────────────
export default {
  id:      'exercise_guide',
  label:   'Guía de Ejercicios',
  icon:    '📚',
  section: 'ejercicios',

  template: () => /* html */`
    <div style="display:grid;grid-template-columns:280px 1fr;height:100%;overflow:hidden;">

      <!-- LEFT: exercise list -->
      <div style="display:flex;flex-direction:column;overflow:hidden;border-right:1px solid var(--border);background:var(--bg-panel);">
        <div style="padding:14px;border-bottom:1px solid var(--border);">
          <div style="font-size:11px;font-weight:700;color:var(--text-muted);letter-spacing:.8px;margin-bottom:8px;">BUSCAR</div>
          <input type="text" id="egSearch" placeholder="🔍  Buscar ejercicio..." style="width:100%;box-sizing:border-box;background:var(--bg-base);border:1px solid var(--border);border-radius:var(--radius-md);color:var(--text-primary);font-size:12px;padding:7px 10px;outline:none;">
        </div>
        <div id="egList" style="flex:1;overflow-y:auto;padding:8px;"></div>
      </div>

      <!-- RIGHT: resizable content + viz -->
      <div id="egRight" style="display:grid;grid-template-rows:1fr 6px 340px;overflow:hidden;">

        <!-- TOP: steps/solution -->
        <div id="egContent" style="overflow-y:auto;padding:20px;background:var(--bg-base);">
          <div style="height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;color:var(--text-muted);gap:10px;">
            <span style="font-size:48px;">📚</span>
            <span style="font-size:16px;font-weight:600;">Seleccioná un ejercicio de la izquierda</span>
            <span style="font-size:12px;">Todos los ejercicios de la Práctica 1</span>
          </div>
        </div>

        <!-- DRAG HANDLE -->
        <div id="egDragHandle" style="
          background: var(--border);
          cursor: row-resize;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s;
          user-select: none;
        "
          onmouseenter="this.style.background='var(--accent)';this.style.opacity='0.7'"
          onmouseleave="this.style.background='var(--border)';this.style.opacity='1'"
        >
          <svg width="32" height="6" viewBox="0 0 32 6" fill="none">
            <rect y="0" width="32" height="2" rx="1" fill="currentColor" style="color:var(--text-muted)"/>
            <rect y="4" width="32" height="2" rx="1" fill="currentColor" style="color:var(--text-muted)"/>
          </svg>
        </div>

        <!-- BOTTOM: 3D viz -->
        <div id="egViz" style="background:var(--bg-base);display:none;overflow:hidden;">
          <div id="egPlot" style="width:100%;height:100%;"></div>
        </div>

      </div>

    </div>
  `,

  init() {
    _buildList(EXERCISES);
    document.getElementById('egSearch').addEventListener('input', e => {
      const q = e.target.value.toLowerCase();
      _buildList(EXERCISES.filter(ex =>
        String(ex.num).includes(q) ||
        ex.title.toLowerCase().includes(q) ||
        ex.category.toLowerCase().includes(q)
      ));
    });
    _initDragHandle();
  }
};

// ─────────────────────────────────────────────────────────────
//  DRAG-TO-RESIZE: content ↕ visualization
// ─────────────────────────────────────────────────────────────
function _initDragHandle() {
  const handle  = document.getElementById('egDragHandle');
  const right   = document.getElementById('egRight');
  const vizPanel = document.getElementById('egViz');
  if (!handle || !right) return;

  let dragging = false;
  let startY   = 0;
  let startVizH = 340; // px — matches initial grid row

  handle.addEventListener('mousedown', e => {
    dragging  = true;
    startY    = e.clientY;
    // Read current viz height from computed style
    const rows = getComputedStyle(right).gridTemplateRows.split(' ');
    // rows[2] is the bottom panel height (e.g. "340px")
    startVizH = parseFloat(rows[2]) || 340;
    document.body.style.cursor   = 'row-resize';
    document.body.style.userSelect = 'none';
    e.preventDefault();
  });

  window.addEventListener('mousemove', e => {
    if (!dragging) return;
    const delta  = startY - e.clientY;        // drag up → bigger viz
    const totalH = right.getBoundingClientRect().height;
    const HANDLE = 6;
    const MIN    = 80;
    const MAX    = totalH - HANDLE - MIN;

    let newVizH = Math.min(MAX, Math.max(MIN, startVizH + delta));
    right.style.gridTemplateRows = `1fr ${HANDLE}px ${newVizH}px`;

    // Trigger Plotly resize
    const plot = document.getElementById('egPlot');
    if (plot && plot._fullLayout) {
      try { window.Plotly?.relayout('egPlot', {}); } catch(_) {}
    }
  });

  window.addEventListener('mouseup', () => {
    if (!dragging) return;
    dragging = false;
    document.body.style.cursor    = '';
    document.body.style.userSelect = '';
  });
}

// ─────────────────────────────────────────────────────────────
const CATEGORY_COLORS = {
  vectores:        '#6c63ff',
  rectas:          '#00d4ff',
  planos:          '#ff6b9d',
  intersecciones:  '#00e5a0',
  economía:        '#ffb347',
};

function _buildList(exercises) {
  const list = document.getElementById('egList');
  if (!list) return;

  // Group by category
  const groups = {};
  for (const ex of exercises) {
    if (!groups[ex.category]) groups[ex.category] = [];
    groups[ex.category].push(ex);
  }

  let html = '';
  for (const [cat, exs] of Object.entries(groups)) {
    const color = CATEGORY_COLORS[cat] || '#6c63ff';
    html += `<div style="margin-bottom:4px;">
      <div style="font-size:10px;font-weight:700;color:${color};letter-spacing:.8px;padding:6px 8px 4px;">${cat.toUpperCase()}</div>`;
    for (const ex of exs) {
      html += `
        <div onclick="window._egSelectExercise(${ex.num})"
             style="display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:var(--radius-sm);cursor:pointer;margin-bottom:2px;transition:background 0.15s;"
             id="eg-item-${ex.num}"
             onmouseenter="this.style.background='var(--bg-hover)'"
             onmouseleave="this.style.background='transparent'">
          <span style="font-size:11px;font-weight:800;color:${color};min-width:26px;padding:2px 5px;background:${color}20;border-radius:4px;text-align:center;">${ex.num}</span>
          <span style="font-size:12px;color:var(--text-primary);line-height:1.3;">${ex.title}</span>
        </div>`;
    }
    html += `</div>`;
  }
  list.innerHTML = html;
}

// ─────────────────────────────────────────────────────────────
//  SELECT & RENDER EXERCISE
// ─────────────────────────────────────────────────────────────
window._egSelectExercise = function(num) {
  // Highlight active
  document.querySelectorAll('[id^="eg-item-"]').forEach(el => {
    el.style.background = 'transparent';
    el.style.borderLeft = 'none';
  });
  const active = document.getElementById(`eg-item-${num}`);
  if (active) {
    active.style.background = 'var(--bg-hover)';
    active.style.borderLeft = '2px solid var(--accent)';
  }

  const ex = EXERCISES.find(e => e.num === num);
  if (!ex) return;

  const content = document.getElementById('egContent');
  const vizPanel = document.getElementById('egViz');

  const color = CATEGORY_COLORS[ex.category] || '#6c63ff';

  // Header
  let html = `
    <div style="max-width:900px;">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
        <span style="font-size:10px;font-weight:700;color:${color};padding:3px 9px;background:${color}20;border-radius:20px;letter-spacing:.5px;">${ex.category.toUpperCase()}</span>
        <span style="font-size:11px;color:var(--text-muted);">Ejercicio ${ex.num}</span>
      </div>
      <h2 style="font-size:20px;font-weight:800;color:var(--text-primary);margin:0 0 10px;">${ex.title}</h2>
      <p style="font-size:13px;color:var(--text-secondary);line-height:1.6;margin-bottom:20px;padding:14px;background:var(--bg-card);border:1px solid var(--border);border-left:3px solid ${color};border-radius:var(--radius-md);">${ex.description}</p>
  `;

  // Solve
  const solution = _solve(ex);
  html += solution.html;
  html += `</div>`;

  content.innerHTML = html;

  // 3D/2D Visualization
  const right = document.getElementById('egRight');
  if (solution.traces && solution.traces.length > 0) {
    vizPanel.style.display = 'block';
    // Restore viz row if it was collapsed
    if (right) {
      const rows = getComputedStyle(right).gridTemplateRows.split(' ');
      const vizH = parseFloat(rows[2]) || 0;
      if (vizH < 80) right.style.gridTemplateRows = `1fr 6px 340px`;
    }
    setTimeout(() => {
      plot3D('egPlot', solution.traces, solution.layout || layout3D(`Ejercicio ${ex.num}`));
    }, 50);
  } else {
    // Collapse viz row
    if (right) right.style.gridTemplateRows = `1fr 0px 0px`;
    vizPanel.style.display = 'none';
  }
};

// ─────────────────────────────────────────────────────────────
//  SOLVER ENGINE
// ─────────────────────────────────────────────────────────────
function _solve(ex) {
  switch (ex.type) {
    case 'points3d':         return _solvePoints3D(ex);
    case 'vector_ops':       return _solveVectorOps(ex);
    case 'lin_comb':         return _solveLinComb(ex);
    case 'lines3d_multi':    return _solveLines3DMulti(ex);
    case 'line_point_check': return _solveLinePointCheck(ex);
    case 'find_k_parallel':  return _solveFindKParallel(ex);
    case 'lines_intersect':  return _solveLinesIntersect(ex);
    case 'parallel_through_point': return _solveParallelThrough(ex);
    case 'plane_3pts':       return _solvePlane3Pts(ex);
    case 'plane_intersection': return _solvePlaneIntersection(ex);
    case 'line_plane_intersect': return _solveLinePlane(ex);
    case 'budget_plane':     return _solveBudgetPlane(ex);
    case 'budget_line':      return _solveBudgetLine(ex);
    default: return { html: '<p>Tipo de ejercicio no implementado aún.</p>', traces: [] };
  }
}

// ── Helper: step card ──
function _step(label, content) {
  return `<div style="display:flex;gap:10px;margin-bottom:6px;line-height:1.6;font-family:var(--font-mono);font-size:12px;">
    <span style="color:var(--text-muted);flex-shrink:0;min-width:160px;">${label}</span>
    <span style="color:var(--text-primary);">${content}</span>
  </div>`;
}
function _box(title, content, color='var(--success)') {
  return `<div style="background:${color}12;border:1px solid ${color}44;border-radius:var(--radius-md);padding:12px 14px;margin-bottom:12px;">
    <div style="font-size:10px;font-weight:700;letter-spacing:.6px;margin-bottom:6px;color:${color};">${title}</div>
    ${content}
  </div>`;
}
function _section(title) {
  return `<div style="font-size:10px;font-weight:700;color:var(--text-muted);letter-spacing:.8px;margin:16px 0 8px;">${title}</div>`;
}

// ── points 3D ──
function _solvePoints3D(ex) {
  const { points } = ex.data;
  let html = _section('REPRESENTACIÓN EN R³');
  html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px;">';
  for (const p of points) {
    html += `<div style="background:var(--bg-card);border:1px solid var(--border);border-left:3px solid ${p.color};border-radius:var(--radius-sm);padding:8px 10px;font-family:var(--font-mono);font-size:12px;">
      <span style="color:${p.color};font-weight:700;">${p.label}</span>
      = (${p.coords.join(', ')})
    </div>`;
  }
  html += '</div>';

  const traces = [{
    type: 'scatter3d', mode: 'markers+text',
    x: points.map(p => p.coords[0]),
    y: points.map(p => p.coords[1]),
    z: points.map(p => p.coords[2]),
    marker: { size: 8, color: points.map(p => p.color) },
    text: points.map(p => p.label),
    textposition: 'top center',
    textfont: { size: 12, color: points.map(p => p.color) },
    name: 'Puntos',
  }];

  return { html, traces, layout: layout3D('Puntos en R³') };
}

// ── vector ops ──
function _solveVectorOps(ex) {
  const { vectors, ops } = ex.data;
  const vmap = {};
  for (const v of vectors) vmap[v.label] = v;

  let html = _section('VECTORES');
  for (const v of vectors) {
    html += _step(`${v.label} =`, `(${v.coords.join(', ')})`);
  }

  const resultVecs = [...vectors];
  for (const op of ops) {
    if (op.type === 'add') {
      const a = vmap[op.a].coords;
      const b = vmap[op.b].coords;
      const res = add(a, b);
      html += _section(`OPERACIÓN: ${op.a} + ${op.b} = ${op.label}`);
      html += _step(`${op.a} + ${op.b}`, `(${a.join(',')}) + (${b.join(',')}) = (${res.join(', ')})`);
      html += _box(`Resultado: ${op.label}`, `<span style="font-family:var(--font-mono);font-size:14px;font-weight:700;color:var(--accent2);">(${res.join(', ')})</span>`);
      resultVecs.push({ label: op.label, coords: res, color: '#00e5a0' });
      vmap[op.label] = { label: op.label, coords: res };
    }
  }

  const traces = [{
    type: 'scatter3d', mode: 'markers+text',
    x: resultVecs.map(v => v.coords[0]),
    y: resultVecs.map(v => v.coords[1]),
    z: resultVecs.map(v => v.coords[2]),
    marker: { size: 8, color: resultVecs.map(v => v.color) },
    text: resultVecs.map(v => v.label),
    textposition: 'top center',
    textfont: { size: 12, color: resultVecs.map(v => v.color) },
    name: 'Vectores',
  }];

  // Add arrows from origin for A and B
  for (const v of vectors) {
    traces.push({
      type: 'scatter3d', mode: 'lines',
      x: [0, v.coords[0]], y: [0, v.coords[1]], z: [0, v.coords[2]],
      line: { color: v.color, width: 4 },
      name: v.label, showlegend: false,
    });
  }

  return { html, traces, layout: layout3D('Suma de Vectores') };
}

// ── linear combination ──
function _solveLinComb(ex) {
  const { A, B, C } = ex.data;
  let html = _section('SISTEMA DE ECUACIONES');
  html += `<p style="font-family:var(--font-mono);font-size:12px;color:var(--text-secondary);margin-bottom:10px;">Buscamos α tal que αA + B = C</p>`;
  html += _step('αA + B = C', `α(${A.join(',')}) + (${B.join(',')}) = (${C.join(',')})`);
  html += _section('COMPONENTE A COMPONENTE');

  // α*A[i] + B[i] = C[i]  →  α = (C[i] - B[i]) / A[i]
  let alpha = null;
  let consistent = true;
  const steps = [];
  for (let i = 0; i < 3; i++) {
    const varName = ['x₁','x₂','x₃'][i];
    const eq = `α·(${A[i]}) + (${B[i]}) = ${C[i]}`;
    if (Math.abs(A[i]) < 1e-10) {
      if (Math.abs(B[i] - C[i]) > 1e-10) consistent = false;
      steps.push({ eq, result: 'Free (0=0)', valid: Math.abs(B[i] - C[i]) < 1e-10 });
    } else {
      const val = (C[i] - B[i]) / A[i];
      if (alpha === null) alpha = val;
      else if (Math.abs(alpha - val) > 1e-6) consistent = false;
      steps.push({ eq, result: `α = ${fmt(val)}`, valid: true });
    }
  }

  for (const s of steps) {
    html += _step(s.eq, `<span style="color:${s.valid ? 'var(--success)' : 'var(--error)'};">${s.result}</span>`);
  }

  html += _section('RESULTADO');
  if (consistent && alpha !== null) {
    html += _box('✅ Solución', `<span style="font-family:var(--font-mono);font-size:16px;font-weight:800;color:var(--accent2);">α = ${fmt(alpha)}</span><br><span style="font-family:var(--font-mono);font-size:12px;color:var(--text-muted);">Verificación: ${fmt(alpha)}·(${A.join(',')}) + (${B.join(',')}) = (${A.map((a,i)=>fmt(alpha*a+B[i])).join(',')})</span>`);
  } else {
    html += _box('❌ Sin solución', 'El sistema no es consistente — no existe un α real que satisfaga las 3 ecuaciones.', 'var(--error)');
  }

  return { html, traces: [] };
}

// ── lines 3D multi ──
function _solveLines3DMulti(ex) {
  const { lines } = ex.data;
  let html = _section('ECUACIONES PARAMÉTRICAS');

  const traces = [];
  for (const l of lines) {
    html += `<div style="background:var(--bg-card);border:1px solid var(--border);border-left:3px solid ${l.color};border-radius:var(--radius-sm);padding:10px 12px;margin-bottom:8px;">
      <div style="font-weight:700;color:${l.color};margin-bottom:4px;font-size:12px;">${l.label}</div>
      <div style="font-family:var(--font-mono);font-size:12px;color:var(--text-primary);">L: λ(${l.d.join(',')}) + (${l.p.join(',')})</div>
      <div style="font-size:11px;color:var(--text-muted);margin-top:4px;">${l.note}</div>
    </div>`;
    if (norm(l.d) > 1e-9) {
      traces.push(line3D(l.p, l.d, [-5, 5], l.color, l.label));
    }
  }

  return { html, traces, layout: layout3D('Rectas en R³') };
}

// ── line point check ──
function _solveLinePointCheck(ex) {
  const { L1, L2, checkPoints, targetX } = ex.data;
  let html = _section('RECTAS');
  html += _step('L₁', `λ(${L1.d.join(',')}) + (${L1.p.join(',')})`);
  html += _step('L₂', `λ(${L2.d.join(',')}) + (${L2.p.join(',')}) — paralela a L₁`);

  // a) Find point on L2 with x1 = targetX
  html += _section(`a) PUNTO DE L₂ CON x₁ = ${targetX}`);
  if (Math.abs(L2.d[0]) < 1e-10) {
    html += _step('d₁ = 0', 'La recta L₂ tiene coordenada x₁ constante — no hay solución si x₁ del punto base ≠ 0');
  } else {
    const lambda = (targetX - L2.p[0]) / L2.d[0];
    const pt = L2.p.map((v, i) => v + lambda * L2.d[i]);
    html += _step(`x₁: ${L2.p[0]} + λ·(${L2.d[0]}) = ${targetX}`, `λ = ${fmt(lambda)}`);
    html += _box('Punto en L₂ con x₁ = 0', `<span style="font-family:var(--font-mono);font-size:14px;font-weight:700;color:var(--accent2);">(${pt.map(x=>fmt(x)).join(', ')})</span>`);
  }

  // b) Check if points are on L2
  html += _section('b) ¿LOS PUNTOS ESTÁN EN L₂?');
  for (const pt of checkPoints) {
    const delta = sub(pt, L2.p);
    // Check if delta = lambda * d for some lambda
    let lam = null;
    let consistent = true;
    for (let i = 0; i < 3; i++) {
      if (Math.abs(L2.d[i]) > 1e-10) {
        const l = delta[i] / L2.d[i];
        if (lam === null) lam = l;
        else if (Math.abs(l - lam) > 1e-6) { consistent = false; break; }
      } else if (Math.abs(delta[i]) > 1e-10) {
        consistent = false; break;
      }
    }
    html += _step(`(${pt.join(',')})`, `<span style="color:${consistent ? 'var(--success)' : 'var(--error)'};font-weight:700;">${consistent ? `✅ SÍ está (λ=${fmt(lam)})` : '❌ NO está'}</span>`);
  }

  const traces = [
    line3D(L1.p, L1.d, [-6, 6], '#6c63ff', 'L₁'),
    line3D(L2.p, L2.d, [-6, 6], '#00d4ff', 'L₂'),
    {
      type: 'scatter3d', mode: 'markers+text',
      x: checkPoints.map(p => p[0]), y: checkPoints.map(p => p[1]), z: checkPoints.map(p => p[2]),
      marker: { size: 7, color: '#ffb347' },
      text: checkPoints.map(p => `(${p.join(',')})`),
      textposition: 'top center', textfont: { color: '#ffb347', size: 9 },
      name: 'Puntos a verificar',
    }
  ];

  return { html, traces, layout: layout3D('Rectas y puntos') };
}

// ── find k parallel ──
function _solveFindKParallel(ex) {
  const { P1, P2_template, L_ref } = ex.data;
  let html = _section('CONDICIÓN DE PARALELISMO');
  const d_ref = L_ref.d;
  html += _step('d_L_ref', `(${d_ref.join(',')})`);
  html += _step('d_recta', `(${P2_template[0]}−${P1[0]}, k−(${P1[1]}), ${P2_template[2]}−${P1[2]})`);
  
  const dx = P2_template[0] - P1[0];
  const dz = P2_template[2] - P1[2];
  html += _step('d_recta (simplificado)', `(${dx}, k−(${P1[1]}), ${dz})`);
  
  html += _section('PARA QUE SEAN PARALELAS: d_recta = λ · d_ref');
  html += _step(`${dx} = λ · ${d_ref[0]}`, `λ = ${fmt(dx/d_ref[0])}`);
  const lambda = dx / d_ref[0];
  html += _step(`${dz} = λ · ${d_ref[2]}`, `Verificación: ${fmt(lambda)} · ${d_ref[2]} = ${fmt(lambda*d_ref[2])} ${Math.abs(lambda*d_ref[2]-dz)<1e-6 ? '✅' : '❌'}`);
  const k = P1[1] + lambda * d_ref[1];
  html += _step(`k − ${P1[1]} = ${lambda} · ${d_ref[1]}`, `k = ${P1[1]} + ${fmt(lambda*d_ref[1])} = ${fmt(k)}`);

  html += _box('✅ Valor de k', `<span style="font-family:var(--font-mono);font-size:18px;font-weight:800;color:var(--accent2);">k = ${fmt(k)}</span>`);

  const P2 = [P2_template[0], k, P2_template[2]];
  const d  = sub(P2, P1);
  const traces = [
    line3D(P1, d, [-5,5], '#6c63ff', 'Recta (obtenida)'),
    line3D(L_ref.p, L_ref.d, [-5,5], '#00d4ff', 'L referencia'),
  ];
  return { html, traces, layout: layout3D('Rectas paralelas') };
}

// ── 4 lines position ──
function _solveLinesIntersect(ex) {
  const { lines } = ex.data;
  let html = _section('ANÁLISIS PAR A PAR');
  const traces = [];

  // Draw all lines
  for (const l of lines) {
    if (norm(l.d) > 1e-9) traces.push(line3D(l.p, l.d, [-5,5], l.color, l.label));
  }

  const pairs = [];
  for (let i = 0; i < lines.length; i++) {
    for (let j = i+1; j < lines.length; j++) {
      pairs.push(_analyzeLinePair(lines[i], lines[j]));
    }
  }

  const TYPE_INFO = {
    intersect:  { emoji: '🟢', text: 'Se cortan', color: 'var(--success)' },
    parallel:   { emoji: '🔵', text: 'Paralelas',  color: '#00d4ff' },
    coincident: { emoji: '⚪', text: 'Coincidentes', color: 'var(--text-muted)' },
    skew:       { emoji: '🟡', text: 'Alabeadas',   color: '#ffb347' },
  };

  // Summary table
  html += `<table style="width:100%;border-collapse:collapse;font-family:var(--font-mono);font-size:12px;margin-bottom:16px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-md);overflow:hidden;">
    <thead><tr style="font-size:10px;color:var(--text-muted);background:var(--bg-hover);">
      <th style="padding:8px 12px;text-align:left;">Par</th>
      <th style="padding:8px;text-align:left;">Posición</th>
      <th style="padding:8px;text-align:left;">Intersección</th>
    </tr></thead><tbody>`;
  for (const p of pairs) {
    const info = TYPE_INFO[p.type];
    html += `<tr style="border-top:1px solid var(--border);">
      <td style="padding:8px 12px;"><span style="color:${lines.find(l=>l.label===p.n1)?.color}">${p.n1}</span> ∩ <span style="color:${lines.find(l=>l.label===p.n2)?.color}">${p.n2}</span></td>
      <td style="padding:8px;color:${info.color};font-weight:700;">${info.emoji} ${info.text}</td>
      <td style="padding:8px;color:var(--accent2);">${p.point ? `(${p.point.map(x=>fmt(x)).join(', ')})` : '—'}</td>
    </tr>`;
  }
  html += `</tbody></table>`;

  // Details collapsible
  for (const p of pairs) {
    const info = TYPE_INFO[p.type];
    const id = `pair${p.n1}${p.n2}`.replace(/[₁₂₃₄]/g,'_');
    html += `<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-md);margin-bottom:8px;overflow:hidden;">
      <div onclick="document.getElementById('${id}').style.display=document.getElementById('${id}').style.display==='none'?'block':'none'"
           style="padding:10px 14px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;background:var(--bg-hover);">
        <span style="font-weight:700;font-size:13px;">${p.n1} ∩ ${p.n2} — <span style="color:${info.color};">${info.emoji} ${info.text}</span></span>
        <span style="color:var(--text-muted);">▾</span>
      </div>
      <div id="${id}" style="display:none;padding:12px 14px;font-family:var(--font-mono);font-size:11.5px;">
        ${p.steps.map(s => _step(s.label, s.text)).join('')}
        ${p.point ? _box('Punto de Intersección', `<span style="color:var(--accent2);font-size:14px;font-weight:700;">(${p.point.map(x=>fmt(x)).join(', ')})</span>  <span style="color:var(--text-muted);">t=${fmt(p.t)} s=${fmt(p.s)}</span>`) : ''}
      </div>
    </div>`;
    if (p.point) {
      traces.push({
        type: 'scatter3d', mode: 'markers+text',
        x:[p.point[0]], y:[p.point[1]], z:[p.point[2]],
        marker:{ size:8, color:'#00e5a0' },
        text:[`${p.n1}∩${p.n2}`], textposition:'top center', textfont:{color:'#00e5a0',size:9},
        name:`${p.n1}∩${p.n2}`,
      });
    }
  }

  return { html, traces, layout: layout3D('Rectas en R³') };
}

function _analyzeLinePair(La, Lb) {
  const { p: p1, d: d1, label: n1 } = La;
  const { p: p2, d: d2, label: n2 } = Lb;
  const steps = [];
  const delta = sub(p2, p1);
  const cr = cross(d1, d2);
  const normCr = norm(cr);

  steps.push({ label: 'd₁×d₂', text: `(${cr.map(x=>fmt(x)).join(',')})  ‖‖=${fmt(normCr)}` });

  if (normCr < 1e-8) {
    const crDelta = cross(d1, delta);
    steps.push({ label: 'd₁×(P₂−P₁)', text: `(${crDelta.map(x=>fmt(x)).join(',')})` });
    if (norm(crDelta) < 1e-8) return { n1, n2, type:'coincident', point:null, t:null, s:null, steps};
    return { n1, n2, type:'parallel', point:null, t:null, s:null, steps };
  }

  const axisPairs = [{ axes:[0,1] }, { axes:[0,2] }, { axes:[1,2] }];
  let sol = null;
  for (const { axes:[a,b] } of axisPairs) {
    const s = solve2x2(d1[a],-d2[a],delta[a], d1[b],-d2[b],delta[b]);
    if (s) { sol = s; break; }
  }
  if (!sol) return { n1, n2, type:'skew', point:null, t:null, s:null, steps };
  const { x:t, y:s } = sol;
  steps.push({ label: 'Sistema 2x2', text: `t=${fmt(t)}  s=${fmt(s)}` });
  const pt1 = p1.map((v,i) => v + t*d1[i]);
  const pt2 = p2.map((v,i) => v + s*d2[i]);
  const res = norm(sub(pt1,pt2));
  steps.push({ label: 'Verificación ‖P₁(t)−P₂(s)‖', text: fmt(res,6) });
  if (res > 1e-4) return { n1, n2, type:'skew', point:null, t:null, s:null, steps };
  return { n1, n2, type:'intersect', point:pt1, t, s, steps };
}

// ── parallel through point ──
function _solveParallelThrough(ex) {
  const { L, A } = ex.data;
  let html = _section('RESOLUCIÓN');
  html += _step('L', `β(${L.d.join(',')}) + (${L.p.join(',')})`);
  html += _step('A', `(${A.join(',')})`);
  html += _section('RECTA PARALELA A L QUE PASA POR A');
  html += `<p style="font-size:12px;color:var(--text-secondary);margin-bottom:10px;">La recta paralela tiene el mismo vector director d=(${L.d.join(',')}).<br>Cualquier punto B=(A + t·d) para t≠0.</p>`;
  const t = 1;
  const B = A.map((v,i) => v + t*L.d[i]);
  html += _step('B = A + 1·d', `(${A.join(',')}) + (${L.d.join(',')}) = (${B.join(',')})`);
  html += _box('✅ Respuesta', `<span style="font-family:var(--font-mono);">Recta: β(${L.d.join(',')}) + (${A.join(',')})<br>Un punto B posible: <span style="color:var(--accent2);font-weight:700;">(${B.join(', ')})</span></span>`);

  const traces = [
    line3D(L.p, L.d, [-6,6], '#6c63ff', 'L'),
    line3D(A, L.d, [-6,6], '#00d4ff', 'Recta por A'),
    { type:'scatter3d', mode:'markers+text', x:[A[0],B[0]], y:[A[1],B[1]], z:[A[2],B[2]],
      marker:{size:8, color:['#ff6b9d','#00e5a0']}, text:['A','B'],
      textposition:'top center', textfont:{size:10,color:'white'}, showlegend:false }
  ];
  return { html, traces, layout: layout3D('Rectas paralelas') };
}

// ── plane 3 pts ──
function _solvePlane3Pts(ex) {
  const { cases } = ex.data;
  const colors = ['#6c63ff','#00d4ff','#ff6b9d','#00e5a0'];
  let html = _section('ECUACIONES PARAMÉTRICAS DE LOS PLANOS');
  const traces = [];

  cases.forEach((c, idx) => {
    const u = sub(c.B, c.A);
    const v = sub(c.C, c.A);
    const n = cross(u, v);
    const d = -dot(n, c.A);
    const color = colors[idx] || '#6c63ff';

    html += `<div style="background:var(--bg-card);border:1px solid var(--border);border-left:3px solid ${color};border-radius:var(--radius-sm);padding:10px 12px;margin-bottom:8px;font-family:var(--font-mono);font-size:12px;">
      <div style="font-weight:700;color:${color};margin-bottom:6px;">Caso ${c.label}</div>
      ${_step('A, B, C', `(${c.A.join(',')}), (${c.B.join(',')}), (${c.C.join(',')})`)}
      ${_step('u = B−A', `(${u.join(',')})`)}
      ${_step('v = C−A', `(${v.join(',')})`)}
      ${_step('Paramétrica', `λ(${u.join(',')}) + μ(${v.join(',')}) + (${c.A.join(',')})`)}
      ${norm(n)>1e-9 ? _step('Normal n=u×v', `(${n.join(',')})`) : ''}
      ${norm(n)>1e-9 ? _step('Implícita', `${n[0]}x₁ + ${n[1]}x₂ + ${n[2]}x₃ = ${-d}`) : ''}
    </div>`;

    // Plot plane as mesh
    const range = 2;
    const steps = 5;
    const xs=[], ys=[], zs=[];
    for (let li=-range; li<=range; li+=range/steps) {
      for (let mu=-range; mu<=range; mu+=range/steps) {
        const pt = [c.A[0]+li*u[0]+mu*v[0], c.A[1]+li*u[1]+mu*v[1], c.A[2]+li*u[2]+mu*v[2]];
        xs.push(pt[0]); ys.push(pt[1]); zs.push(pt[2]);
      }
    }
    traces.push({
      type:'mesh3d', x:xs, y:ys, z:zs,
      color, opacity:0.3, name:`Plano ${c.label}`,
    });
    traces.push({
      type:'scatter3d', mode:'markers+text',
      x:[c.A[0],c.B[0],c.C[0]], y:[c.A[1],c.B[1],c.C[1]], z:[c.A[2],c.B[2],c.C[2]],
      marker:{size:6, color},
      text:['A','B','C'], textposition:'top center', textfont:{color, size:10},
      showlegend:false,
    });
  });

  return { html, traces, layout: layout3D('Planos en R³') };
}

// ── plane intersection ──
function _solvePlaneIntersection(ex) {
  const { cases } = ex.data;
  let html = _section('INTERSECCIÓN DE PLANOS');
  const traces = [];

  for (const c of cases) {
    html += `<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-sm);padding:10px 12px;margin-bottom:8px;">
      <div style="font-weight:700;color:var(--accent);margin-bottom:6px;font-size:12px;">Caso ${c.label} — ${c.note}</div>`;
    
    const n1 = c.pi1.normal, n2 = c.pi2.normal;
    const d_line = cross(n1, n2);
    const nCross = norm(d_line);
    html += _step('n₁×n₂', `(${d_line.map(x=>fmt(x)).join(',')})  ‖‖=${fmt(nCross)}`);
    
    if (nCross < 1e-8) {
      // Check coincident or parallel
      const k1 = c.pi1.d, k2 = c.pi2.d;
      const isCoincident = Math.abs(n1[0]*n2[1]-n1[1]*n2[0]) < 1e-8 && 
                           n1.every((v,i) => Math.abs(v - n2[i]*( Math.abs(n2[0])>1e-10 ? n1[0]/n2[0] : 1)) < 1e-8);
      html += _step('Resultado', `<span style="color:#ffb347;font-weight:700;">${nCross<1e-8 ? '— Planos PARALELOS o COINCIDENTES (no se cortan en una recta)' : ''}</span>`);
    } else {
      html += _step('d de recta intersección', `(${d_line.map(x=>fmt(x)).join(',')})`);
      html += _step('Tipo', '<span style="color:var(--success);font-weight:700;">Se intersecan en una RECTA</span>');
    }
    html += `</div>`;
  }

  return { html, traces:[], layout: layout3D('') };
}

// ── line-plane intersection ──
function _solveLinePlane(ex) {
  const { cases } = ex.data;
  let html = _section('INTERSECCIÓN RECTA ∩ PLANO');
  const traces = [];

  for (const c of cases) {
    html += `<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-sm);padding:10px 12px;margin-bottom:8px;">
      <div style="font-weight:700;color:var(--accent);margin-bottom:6px;font-size:12px;">Caso ${c.label} — ${c.note}</div>`;
    
    const { L, pi } = c;
    const dotND = dot(pi.normal, L.d);
    html += _step('n·d', `(${pi.normal.join(',')})·(${L.d.join(',')}) = ${fmt(dotND)}`);
    
    if (Math.abs(dotND) < 1e-10) {
      const check = dot(pi.normal, L.p) + pi.d;
      html += _step('Resultado', `<span style="color:#ffb347;font-weight:700;">${Math.abs(check)<1e-8 ? '⚪ La recta está CONTENIDA en el plano' : '🔵 La recta es PARALELA al plano (sin intersección)'}</span>`);
    } else {
      const t = -(dot(pi.normal, L.p) + pi.d) / dotND;
      const pt = L.p.map((v,i) => v + t*L.d[i]);
      html += _step('t = −(n·P₀+d) / (n·d)', `t = ${fmt(t)}`);
      html += _step('Punto = P₀ + t·d', `(${pt.map(x=>fmt(x)).join(', ')})`);
      html += _box('✅ Punto de Intersección', `<span style="font-family:var(--font-mono);font-size:14px;font-weight:700;color:var(--accent2);">(${pt.map(x=>fmt(x)).join(', ')})</span>`);

      traces.push(line3D(L.p, L.d, [-5,5], '#6c63ff', `L ${c.label}`));
      traces.push({
        type:'scatter3d', mode:'markers+text',
        x:[pt[0]], y:[pt[1]], z:[pt[2]],
        marker:{size:9, color:'#00e5a0'},
        text:[`∩ ${c.label}`], textposition:'top center', textfont:{color:'#00e5a0',size:10},
      });
    }
    html += `</div>`;
  }

  return { html, traces, layout: layout3D('Recta ∩ Plano') };
}

// ── budget plane ──
function _solveBudgetPlane(ex) {
  const { budget, goods, prices, questions } = ex.data;
  let html = _section('ECUACIÓN PRESUPUESTARIA');
  const terms = goods.map((g,i) => `$${prices[i]}·${g}`).join(' + ');
  html += _box('Plano Balance', `<span style="font-family:var(--font-mono);font-size:13px;">${terms} = $${budget}</span>`);
  html += _section('INTERCEPTOS (máximos individuales)');
  const maxs = prices.map(p => fmt(budget/p));
  for (let i=0; i<goods.length; i++) {
    html += _step(`Máx ${goods[i]}`, `$${budget} / $${prices[i]} = <span style="color:var(--accent2);font-weight:700;">${maxs[i]} unidades</span>`);
  }
  html += _section('RESOLUCIÓN DE PREGUNTAS');
  for (const q of questions) {
    html += `<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-sm);padding:8px 12px;margin-bottom:6px;font-size:12px;color:var(--text-secondary);">📌 ${q}</div>`;
  }

  // 3D budget plane mesh
  const [pA, pB, pC] = prices;
  const pts = [];
  for (let a=0; a<=budget/pA; a+=budget/pA/8) {
    for (let b=0; b<=(budget-pA*a)/pB; b+=(budget/pA/8)) {
      const c = (budget - pA*a - pB*b)/pC;
      if (c>=0) pts.push([a,b,c]);
    }
  }
  const traces = [{
    type:'scatter3d', mode:'markers',
    x:pts.map(p=>p[0]), y:pts.map(p=>p[1]), z:pts.map(p=>p[2]),
    marker:{ size:3, color:pts.map(p=>p[2]), colorscale:'Viridis', opacity:0.7 },
    name:'Plano Balance',
  }];

  return { html, traces, layout: {
    ...layout3D('Plano Presupuestario'),
    scene: { xaxis:{title: goods[0]}, yaxis:{title: goods[1]}, zaxis:{title: goods[2]} }
  }};
}

// ── budget line ──
function _solveBudgetLine(ex) {
  const { budget, goods, prices, questions } = ex.data;
  let html = _section('ECUACIÓN PRESUPUESTARIA');
  const [pA, pB] = prices;
  html += _box('Recta Balance', `<span style="font-family:var(--font-mono);font-size:13px;">$${fmt(pA)}·x + $${fmt(pB)}·y = $${budget}</span>`);
  html += _section('INTERCEPTOS');
  html += _step(`Máx ${goods[0]}`, `$${budget}/$${fmt(pA)} = <span style="color:var(--accent2);font-weight:700;">${fmt(budget/pA)}</span>`);
  html += _step(`Máx ${goods[1]}`, `$${budget}/$${fmt(pB)} = <span style="color:var(--accent2);font-weight:700;">${fmt(budget/pB)}</span>`);
  html += _section('RESOLUCIÓN');
  for (const q of questions) {
    html += `<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-sm);padding:8px 12px;margin-bottom:6px;font-size:12px;color:var(--text-secondary);">📌 ${q}</div>`;
  }

  // 2D line plot via Plotly
  const maxA = budget/pA;
  const maxB = budget/pB;
  const traces = [{
    type: 'scatter', mode: 'lines+markers',
    x: [0, maxA], y: [maxB, 0],
    line: { color: '#6c63ff', width: 3 },
    marker: { size: 8, color: '#6c63ff' },
    name: 'Recta Balance',
  }];
  const layout2d = {
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
    font: { color: '#e2e8f0', family: 'Inter' },
    margin: { t:20, r:20, b:40, l:50 },
    xaxis: { title: goods[0], gridcolor: '#334155', color: '#94a3b8', zeroline: true, zerolinecolor:'#475569' },
    yaxis: { title: goods[1], gridcolor: '#334155', color: '#94a3b8', zeroline: true, zerolinecolor:'#475569' },
    showlegend: true,
    legend: { bgcolor: 'rgba(0,0,0,0)', font: { color: '#e2e8f0' } },
  };
  return { html, traces, layout: layout2d };
}

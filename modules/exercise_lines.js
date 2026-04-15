/**
 * modules/exercise_lines.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Módulo: Ejercicio de Rectas en R³
 *
 * Permite ingresar hasta 4 rectas en la forma P₀ + t·d (punto + director),
 * calcula automáticamente todas las intersecciones par a par, clasifica la
 * posición relativa de cada par, muestra el procedimiento paso a paso y
 * visualiza todo en 3D simultáneamente.
 *
 * Ideal para verificar ejercicios tipo del CBC donde se dan N rectas y se
 * pide hallar intersecciones y analizar posiciones relativas.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { norm, sub, cross, dot, scale, add, fmt, areParallel, solve2x2 } from '../core/math.js';
import { line3D, arrow3D, layout3D, plot3D } from '../core/plotly3d.js';

// Palette for up to 6 lines
const LINE_COLORS = ['#6c63ff', '#00d4ff', '#ff6b9d', '#00e5a0', '#ffb347', '#c084fc'];
const LINE_NAMES  = ['L₁', 'L₂', 'L₃', 'L₄', 'L₅', 'L₆'];

export default {
  id:      'exercise_lines',
  label:   'Ejercicio Rectas',
  icon:    '🧮',
  section: 'ejercicios',

  template: () => /* html */`
    <div style="display:grid;grid-template-columns:320px 1fr;height:100%;overflow:hidden;">

      <!-- LEFT: inputs + results -->
      <div style="display:flex;flex-direction:column;overflow:hidden;border-right:1px solid var(--border);">

        <!-- Line inputs -->
        <div style="flex-shrink:0;overflow-y:auto;padding:14px;border-bottom:1px solid var(--border);background:var(--bg-panel);">
          <div style="font-size:12px;font-weight:700;color:var(--text-muted);letter-spacing:.8px;margin-bottom:10px;">INGRESÁ LAS RECTAS</div>
          <div id="lineInputsContainer"></div>

          <button class="btn-primary" id="btnAnalyze" style="margin-top:10px;">
            ▶ Calcular y Visualizar
          </button>
        </div>

        <!-- Results -->
        <div style="flex:1;overflow-y:auto;padding:14px;background:var(--bg-base);">
          <div style="font-size:12px;font-weight:700;color:var(--text-muted);letter-spacing:.8px;margin-bottom:10px;">RESULTADOS</div>
          <div id="pairResults">
            <span style="color:var(--text-muted);font-size:12px;">Ingresá los datos y presioná calcular.</span>
          </div>
        </div>

      </div>

      <!-- RIGHT: 3D visualization -->
      <div style="display:flex;flex-direction:column;overflow:hidden;background:var(--bg-base);">
        <div style="padding:11px 16px;font-size:13px;font-weight:600;border-bottom:1px solid var(--border);background:var(--bg-card);display:flex;align-items:center;gap:8px;">
          <span>📊</span> Visualización 3D — Todas las rectas
        </div>
        <div style="flex:1;position:relative;overflow:hidden;">
          <div id="exerciseLines3D" style="width:100%;height:100%;"></div>
        </div>
      </div>

    </div>
  `,

  init() {
    _buildLineInputs();
    document.getElementById('btnAnalyze')?.addEventListener('click', _analyze);
    // Pre-load the example from the guide
    _loadExample();
    _analyze();
  },
};

/* ─────────────────────────────────────────────
   INPUT BUILDER
───────────────────────────────────────────── */
const NUM_LINES = 4; // configurable

function _buildLineInputs() {
  const container = document.getElementById('lineInputsContainer');
  if (!container) return;

  let html = '';
  for (let i = 0; i < NUM_LINES; i++) {
    const color = LINE_COLORS[i];
    const name  = LINE_NAMES[i];
    html += `
      <div style="margin-bottom:12px;background:var(--bg-card);border:1px solid var(--border);border-left:3px solid ${color};border-radius:var(--radius-sm);padding:10px 12px;">
        <div style="font-size:12px;font-weight:700;color:${color};margin-bottom:6px;">${name}</div>
        <div style="font-size:10px;color:var(--text-muted);margin-bottom:4px;">Punto base P₀ = (x₀, y₀, z₀)</div>
        <div style="display:flex;gap:5px;margin-bottom:6px;">
          <input type="number" id="l${i}_px" style="${_inputStyle()}" placeholder="x₀"/>
          <input type="number" id="l${i}_py" style="${_inputStyle()}" placeholder="y₀"/>
          <input type="number" id="l${i}_pz" style="${_inputStyle()}" placeholder="z₀"/>
        </div>
        <div style="font-size:10px;color:var(--text-muted);margin-bottom:4px;">Vector director d = (d₁, d₂, d₃)</div>
        <div style="display:flex;gap:5px;">
          <input type="number" id="l${i}_dx" style="${_inputStyle()}" placeholder="d₁"/>
          <input type="number" id="l${i}_dy" style="${_inputStyle()}" placeholder="d₂"/>
          <input type="number" id="l${i}_dz" style="${_inputStyle()}" placeholder="d₃"/>
        </div>
      </div>`;
  }
  container.innerHTML = html;
}

function _inputStyle() {
  return `flex:1;background:var(--bg-base);border:1px solid var(--border);border-radius:4px;color:var(--text-primary);font-family:var(--font-mono);font-size:12px;padding:5px 6px;min-width:0;`;
}

/* ─────────────────────────────────────────────
   EXAMPLE LOADER (Ejercicio 31 del guía)
   L1: α(1,2,1) + (2,3,2)   → P=(2,3,2)  d=(1,2,1)
   L2: β(0,1,-1) + (1,3,-1) → P=(1,3,-1) d=(0,1,-1)
   L3: γ(2,4,2) + (1,5,0)   → P=(1,5,0)  d=(2,4,2)
   L4: δ(2,4,2) + (3,5,3)   → P=(3,5,3)  d=(2,4,2)
───────────────────────────────────────────── */
function _loadExample() {
  const examples = [
    { p: [2, 3, 2],  d: [1, 2, 1]  },
    { p: [1, 3, -1], d: [0, 1, -1] },
    { p: [1, 5, 0],  d: [2, 4, 2]  },
    { p: [3, 5, 3],  d: [2, 4, 2]  },
  ];
  examples.forEach((ex, i) => {
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
    set(`l${i}_px`, ex.p[0]); set(`l${i}_py`, ex.p[1]); set(`l${i}_pz`, ex.p[2]);
    set(`l${i}_dx`, ex.d[0]); set(`l${i}_dy`, ex.d[1]); set(`l${i}_dz`, ex.d[2]);
  });
}

/* ─────────────────────────────────────────────
   READ LINES
───────────────────────────────────────────── */
function _readLines() {
  const lines = [];
  for (let i = 0; i < NUM_LINES; i++) {
    const g = id => +(document.getElementById(id)?.value ?? 0);
    lines.push({
      name:  LINE_NAMES[i],
      color: LINE_COLORS[i],
      p: [g(`l${i}_px`), g(`l${i}_py`), g(`l${i}_pz`)],
      d: [g(`l${i}_dx`), g(`l${i}_dy`), g(`l${i}_dz`)],
    });
  }
  return lines;
}

/* ─────────────────────────────────────────────
   MAIN ANALYSIS
───────────────────────────────────────────── */
function _analyze() {
  const lines = _readLines();
  const pairs = _getAllPairs(lines);

  _renderResults(pairs);
  _render3D(lines, pairs);
}

function _getAllPairs(lines) {
  const pairs = [];
  for (let i = 0; i < lines.length; i++) {
    for (let j = i + 1; j < lines.length; j++) {
      pairs.push(_analyzePair(lines[i], lines[j]));
    }
  }
  return pairs;
}

/* ─────────────────────────────────────────────
   PAIR ANALYSIS (with step-by-step)
───────────────────────────────────────────── */
function _analyzePair(La, Lb) {
  const { p: p1, d: d1, name: n1, color: c1 } = La;
  const { p: p2, d: d2, name: n2, color: c2 } = Lb;

  const steps = [];
  const delta = sub(p2, p1); // P₂ - P₁

  steps.push({
    label: 'Direcciones',
    text: `d₁=(${d1.join(',')})&nbsp;&nbsp;d₂=(${d2.join(',')})`,
  });

  // 1) Check parallelism
  const cr = cross(d1, d2);
  const normCr = norm(cr);
  steps.push({
    label: 'd₁×d₂',
    text: `(${cr.map(x=>fmt(x)).join(',')})&nbsp;&nbsp;‖d₁×d₂‖=${fmt(normCr)}`,
  });

  if (normCr < 1e-8) {
    // Parallel or coincident
    const crDelta = cross(d1, delta);
    steps.push({
      label: `d₁×(P₂−P₁)`,
      text: `(${crDelta.map(x=>fmt(x)).join(',')})`,
    });
    if (norm(crDelta) < 1e-8) {
      return { n1, n2, c1, c2, type: 'coincident', point: null, t: null, s: null, steps };
    }
    return { n1, n2, c1, c2, type: 'parallel', point: null, t: null, s: null, steps };
  }

  // 2) Try to solve system — iterate over axis pairs to avoid degenerate cases
  const pairs2x2 = [
    { axes: [0, 1], label: '(x,y)' },
    { axes: [0, 2], label: '(x,z)' },
    { axes: [1, 2], label: '(y,z)' },
  ];

  let sol = null;
  let usedLabel = '';
  for (const { axes: [a, b], label } of pairs2x2) {
    const s = solve2x2(d1[a], -d2[a], delta[a], d1[b], -d2[b], delta[b]);
    if (s) { sol = s; usedLabel = label; break; }
  }

  if (!sol) {
    return { n1, n2, c1, c2, type: 'skew', point: null, t: null, s: null, steps };
  }

  const { x: t, y: s } = sol;
  steps.push({
    label: `Sistema ${usedLabel}`,
    text: `t = ${fmt(t)} &nbsp;&nbsp; s = ${fmt(s)}`,
  });

  // Check third equation
  const pt1 = p1.map((v, i) => v + t * d1[i]);
  const pt2 = p2.map((v, i) => v + s * d2[i]);
  const residual = norm(sub(pt1, pt2));

  steps.push({
    label: 'Verificación',
    text: `L₁(t)=(${pt1.map(x=>fmt(x)).join(',')})&nbsp;&nbsp;|&nbsp;&nbsp;L₂(s)=(${pt2.map(x=>fmt(x)).join(',')})`,
  });
  steps.push({
    label: '‖P₁(t)−P₂(s)‖',
    text: fmt(residual, 6),
  });

  if (residual > 1e-4) {
    return { n1, n2, c1, c2, type: 'skew', point: null, t: null, s: null, steps };
  }

  return { n1, n2, c1, c2, type: 'intersect', point: pt1, t, s, steps };
}

/* ─────────────────────────────────────────────
   RENDER RESULTS (HTML)
───────────────────────────────────────────── */
const TYPE_LABELS = {
  intersect:  { emoji: '🟢', text: 'Se cortan',      cls: 'result-val'     },
  parallel:   { emoji: '🔵', text: 'Paralelas',       cls: 'result-warn'    },
  coincident: { emoji: '⚪', text: 'Coincidentes',   cls: 'result-formula' },
  skew:       { emoji: '🟡', text: 'Alabeadas',       cls: 'result-warn'    },
};

function _renderResults(pairs) {
  const box = document.getElementById('pairResults');
  if (!box) return;

  let html = '';
  for (const pair of pairs) {
    const { n1, n2, c1, c2, type, point, t, s, steps } = pair;
    const info = TYPE_LABELS[type] ?? { emoji: '❓', text: type, cls: '' };
    const pairId = `pair_${n1}_${n2}`.replace(/[₁₂₃₄]/g, m => ['1','2','3','4'][['₁','₂','₃','₄'].indexOf(m)]);

    html += `
      <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-md);margin-bottom:10px;overflow:hidden;">

        <!-- Header -->
        <div style="display:flex;align-items:center;justify-content:space-between;padding:9px 12px;cursor:pointer;background:var(--bg-hover);"
             onclick="document.getElementById('${pairId}_body').style.display=document.getElementById('${pairId}_body').style.display==='none'?'block':'none'">
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="font-size:15px;">${info.emoji}</span>
            <span style="font-weight:700;font-size:13px;">
              <span style="color:${c1}">${n1}</span>
              <span style="color:var(--text-muted);margin:0 4px;">∩</span>
              <span style="color:${c2}">${n2}</span>
            </span>
            <span style="font-size:11px;font-weight:600;" class="${info.cls}">${info.text}</span>
          </div>
          <span style="color:var(--text-muted);font-size:12px;">▾</span>
        </div>

        <!-- Body -->
        <div id="${pairId}_body" style="padding:10px 12px;font-family:var(--font-mono);font-size:11.5px;">

          ${point ? `
            <div style="background:rgba(0,229,160,0.08);border:1px solid rgba(0,229,160,0.3);border-radius:4px;padding:7px 10px;margin-bottom:8px;">
              <span style="color:var(--success);font-weight:700;">Punto de intersección:</span><br/>
              <span style="color:var(--accent2);">(${point.map(x=>fmt(x)).join(', ')})</span>
              &nbsp;&nbsp;
              <span style="color:var(--text-muted);">t = ${fmt(t)}&nbsp;&nbsp;s = ${fmt(s)}</span>
            </div>
          ` : ''}

          <!-- Step by step -->
          <div style="color:var(--text-muted);font-size:10px;font-weight:700;letter-spacing:.6px;margin-bottom:6px;">PROCEDIMIENTO</div>
          ${steps.map(step => `
            <div style="display:flex;gap:8px;margin-bottom:4px;line-height:1.5;">
              <span style="color:var(--text-muted);flex-shrink:0;min-width:120px;">${step.label}</span>
              <span style="color:var(--text-primary);">${step.text}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // Summary table
  const summaryRows = pairs.map(p => {
    const info = TYPE_LABELS[p.type];
    return `<tr>
      <td style="color:${p.c1};padding:4px 8px;">${p.n1}</td>
      <td style="color:${p.c2};padding:4px 8px;">${p.n2}</td>
      <td style="padding:4px 8px;">${info.emoji} <span class="${info.cls}">${info.text}</span></td>
      <td style="padding:4px 8px;color:var(--accent2);">${p.point ? `(${p.point.map(x=>fmt(x)).join(',')})` : '—'}</td>
    </tr>`;
  }).join('');

  html = `
    <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-md);padding:12px;margin-bottom:12px;">
      <div style="font-size:11px;font-weight:700;color:var(--text-muted);letter-spacing:.6px;margin-bottom:8px;">RESUMEN</div>
      <table style="width:100%;border-collapse:collapse;font-family:var(--font-mono);font-size:11.5px;">
        <thead>
          <tr style="font-size:10px;color:var(--text-muted);">
            <th style="text-align:left;padding:3px 8px;">Par</th>
            <th></th>
            <th style="text-align:left;padding:3px 8px;">Posición</th>
            <th style="text-align:left;padding:3px 8px;">Intersección</th>
          </tr>
        </thead>
        <tbody>${summaryRows}</tbody>
      </table>
    </div>
  ` + html;

  box.innerHTML = html;
}

/* ─────────────────────────────────────────────
   3D RENDER
───────────────────────────────────────────── */
function _render3D(lines, pairs) {
  const traces = [];

  // Draw each line
  for (const line of lines) {
    const { p, d, name, color } = line;
    if (norm(d) < 1e-9) continue;
    traces.push(line3D(p, d, [-4, 4], color, name));
    // Base point marker
    traces.push({
      type: 'scatter3d', mode: 'markers+text',
      x: [p[0]], y: [p[1]], z: [p[2]],
      marker: { size: 6, color },
      text: [`P(${p.join(',')})`],
      textposition: 'top center',
      textfont: { color, size: 9 },
      name: `P₀ ${name}`,
      showlegend: false,
    });
  }

  // Draw intersection points
  const intPairs = pairs.filter(p => p.type === 'intersect');
  if (intPairs.length > 0) {
    traces.push({
      type: 'scatter3d', mode: 'markers+text',
      x: intPairs.map(p => p.point[0]),
      y: intPairs.map(p => p.point[1]),
      z: intPairs.map(p => p.point[2]),
      marker: { size: 10, color: '#00e5a0', symbol: 'circle', line: { color: 'white', width: 1 } },
      text: intPairs.map(p => `${p.n1}∩${p.n2}`),
      textposition: 'top center',
      textfont: { color: '#00e5a0', size: 10 },
      name: 'Intersecciones',
    });
  }

  const lyt = layout3D('Rectas en R³');
  plot3D('exerciseLines3D', traces, lyt);
}

/**
 * modules/parameter_k.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Módulo: Explorador con Parámetro 'k'
 * Permite usar la incógnita 'k' en las componentes de rectas y ver
 * en tiempo real (con un slider) cómo cambian las gráficas y las propiedades.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { norm, sub, cross, dot, scale, add, fmt, areParallel, solve2x2 } from '../core/math.js';
import { line3D, arrow3D, layout3D, plot3D } from '../core/plotly3d.js';

const LINE_COLORS = ['#6c63ff', '#ff6b9d'];
const LINE_NAMES  = ['L₁', 'L₂'];

export default {
  id:      'parameter_k',
  label:   'Incógnita (k)',
  icon:    '🎚️',
  section: 'ejercicios',

  template: () => /* html */`
    <div style="display:grid;grid-template-columns:350px 1fr;height:100%;overflow:hidden;">

      <!-- LEFT: inputs + results -->
      <div style="display:flex;flex-direction:column;overflow:hidden;border-right:1px solid var(--border);">

        <!-- Line inputs -->
        <div style="flex-shrink:0;overflow-y:auto;padding:14px;border-bottom:1px solid var(--border);background:var(--bg-panel);">
          <div style="font-size:12px;font-weight:700;color:var(--text-muted);letter-spacing:.8px;margin-bottom:10px;">
            INGRESÁ RECTAS (Podés usar 'k')
          </div>
          <div style="font-size:11px;color:var(--text-muted);margin-bottom:10px;">
            Ej: <code>2*k</code>, <code>k+1</code>, <code>1</code>, <code>k^2</code>.
          </div>
          <div id="kLineInputsContainer"></div>

          <!-- Slider control -->
          <div style="margin-top:16px;padding:12px;background:var(--bg-base);border:1px solid var(--border);border-radius:var(--radius-md);">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
              <span style="font-size:13px;font-weight:700;color:var(--accent);">Valor de k = <span id="kValDisplay">0.00</span></span>
            </div>
            <div style="display:flex;gap:10px;align-items:center;">
              <input type="number" id="kMin" value="-10" style="width:40px;font-size:11px;padding:2px;text-align:center;background:var(--bg-card);border:1px solid var(--border);color:var(--text-primary);border-radius:4px;">
              <input type="range" id="kSlider" min="-10" max="10" step="0.1" value="0" style="flex:1;cursor:pointer;accent-color:var(--accent);">
              <input type="number" id="kMax" value="10" style="width:40px;font-size:11px;padding:2px;text-align:center;background:var(--bg-card);border:1px solid var(--border);color:var(--text-primary);border-radius:4px;">
            </div>
          </div>
        </div>

        <!-- Results -->
        <div style="flex:1;overflow-y:auto;padding:14px;background:var(--bg-base);">
          <div style="font-size:12px;font-weight:700;color:var(--text-muted);letter-spacing:.8px;margin-bottom:10px;">RESULTADOS EN TIEMPO REAL</div>
          <div id="kPairResults"></div>
        </div>

      </div>

      <!-- RIGHT: 3D visualization -->
      <div style="display:flex;flex-direction:column;overflow:hidden;background:var(--bg-base);">
        <div style="padding:11px 16px;font-size:13px;font-weight:600;border-bottom:1px solid var(--border);background:var(--bg-card);display:flex;align-items:center;justify-content:space-between;">
          <div style="display:flex;align-items:center;gap:8px;">
            <span>📊</span> Visualización Dinámica
          </div>
          <button id="btnPlayK" class="btn-primary" style="padding: 4px 10px; font-size:11px;">▶ Animar k</button>
        </div>
        <div style="flex:1;position:relative;overflow:hidden;">
          <div id="paramLines3D" style="width:100%;height:100%;"></div>
        </div>
      </div>

    </div>
  `,

  init() {
    _buildInputs();
    _loadExample();
    
    // Listeners
    const inputs = document.querySelectorAll('#kLineInputsContainer input[type="text"]');
    inputs.forEach(inp => inp.addEventListener('input', _triggerUpdate));
    
    const slider = document.getElementById('kSlider');
    slider.addEventListener('input', (e) => {
      document.getElementById('kValDisplay').textContent = Number(e.target.value).toFixed(2);
      _updateAll();
    });

    document.getElementById('kMin').addEventListener('change', (e) => {
      slider.min = e.target.value; _triggerUpdate();
    });
    document.getElementById('kMax').addEventListener('change', (e) => {
      slider.max = e.target.value; _triggerUpdate();
    });

    document.getElementById('btnPlayK').addEventListener('click', _toggleAnimation);

    // Initial update
    _updateAll();
  },
};

/* ─────────────────────────────────────────────
   BUILD INPUTS
───────────────────────────────────────────── */
function _buildInputs() {
  const container = document.getElementById('kLineInputsContainer');
  if (!container) return;

  let html = '';
  for (let i = 0; i < 2; i++) {
    const color = LINE_COLORS[i];
    const name  = LINE_NAMES[i];
    html += `
      <div style="margin-bottom:12px;background:var(--bg-card);border:1px solid var(--border);border-left:3px solid ${color};border-radius:var(--radius-sm);padding:10px 12px;">
        <div style="font-size:12px;font-weight:700;color:${color};margin-bottom:6px;">${name}</div>
        <div style="font-size:10px;color:var(--text-muted);margin-bottom:4px;">Punto base P₀ = (x₀, y₀, z₀)</div>
        <div style="display:flex;gap:5px;margin-bottom:6px;">
          <input type="text" id="kl${i}_px" style="${_inStyle()}" placeholder="x₀"/>
          <input type="text" id="kl${i}_py" style="${_inStyle()}" placeholder="y₀"/>
          <input type="text" id="kl${i}_pz" style="${_inStyle()}" placeholder="z₀"/>
        </div>
        <div style="font-size:10px;color:var(--text-muted);margin-bottom:4px;">Vector director d = (d₁, d₂, d₃)</div>
        <div style="display:flex;gap:5px;">
          <input type="text" id="kl${i}_dx" style="${_inStyle()}" placeholder="d₁"/>
          <input type="text" id="kl${i}_dy" style="${_inStyle()}" placeholder="d₂"/>
          <input type="text" id="kl${i}_dz" style="${_inStyle()}" placeholder="d₃"/>
        </div>
      </div>`;
  }
  container.innerHTML = html;
}

function _inStyle() {
  return `flex:1;background:var(--bg-base);border:1px solid var(--border);border-radius:4px;color:var(--text-primary);font-family:var(--font-mono);font-size:12px;padding:5px 6px;min-width:0;text-align:center;`;
}

function _loadExample() {
  // L1: P=(0, 2, 1), d=(k, 1, 0)
  // L2: P=(2, 0, 1), d=(1, k, 0)
  // Intersectan cuando k=1
  const ex = [
    { p: ['0', '2', '1'], d: ['k', '1', '0'] },
    { p: ['2', '0', '1'], d: ['1', 'k', '0'] },
  ];
  ex.forEach((e, i) => {
    const s = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
    s(`kl${i}_px`, e.p[0]); s(`kl${i}_py`, e.p[1]); s(`kl${i}_pz`, e.p[2]);
    s(`kl${i}_dx`, e.d[0]); s(`kl${i}_dy`, e.d[1]); s(`kl${i}_dz`, e.d[2]);
  });
}

// Expr evaluator
function _evalExpr(exprStr, kVal) {
  if (!exprStr || exprStr.trim() === '') return 0;
  try {
    const s = exprStr.replace(/\^/g, '**');
    const f = new Function('k', 'return (' + s + ')');
    const res = f(kVal);
    return isNaN(res) ? 0 : res;
  } catch(e) {
    return 0;
  }
}

let animId = null;
let animating = false;

function _toggleAnimation() {
  const btn = document.getElementById('btnPlayK');
  if (animating) {
    animating = false;
    btn.textContent = '▶ Animar k';
    cancelAnimationFrame(animId);
  } else {
    animating = true;
    btn.textContent = '⏸ Detener';
    _animateStep();
  }
}

function _animateStep() {
  if (!animating) return;
  const slider = document.getElementById('kSlider');
  const min = parseFloat(slider.min);
  const max = parseFloat(slider.max);
  const step = parseFloat(slider.step) || ((max - min) / 200);
  let val = parseFloat(slider.value);
  val += step;
  if(val > max) val = min;
  
  slider.value = val;
  document.getElementById('kValDisplay').textContent = Number(val).toFixed(2);
  _updateAll();
  
  // Throttle animation slightly for Plotly performance
  setTimeout(() => {
    animId = requestAnimationFrame(_animateStep);
  }, 50);
}

// Un debounce paraPlotly
let updateTid = null;
function _triggerUpdate() {
  const slider = document.getElementById('kSlider');
  document.getElementById('kValDisplay').textContent = Number(slider.value).toFixed(2);
  clearTimeout(updateTid);
  updateTid = setTimeout(_updateAll, 50);
}

function _updateAll() {
  const kVal = parseFloat(document.getElementById('kSlider')?.value || 0);
  
  const lines = [];
  for (let i = 0; i < 2; i++) {
    const g = id => _evalExpr(document.getElementById(id)?.value ?? '0', kVal);
    const p = [g(`kl${i}_px`), g(`kl${i}_py`), g(`kl${i}_pz`)];
    const d = [g(`kl${i}_dx`), g(`kl${i}_dy`), g(`kl${i}_dz`)];
    lines.push({ name: LINE_NAMES[i], color: LINE_COLORS[i], p, d });
  }

  // Analyze pair
  const result = _analyzePair(lines[0], lines[1]);
  _renderResults(result, kVal);
  _render3D(lines, result);
}

/* ─────────────────────────────────────────────
   ANALYSIS LOGIC (Adapted from exercise_lines)
───────────────────────────────────────────── */
function _analyzePair(La, Lb) {
  const { p: p1, d: d1, name: n1, color: c1 } = La;
  const { p: p2, d: d2, name: n2, color: c2 } = Lb;

  const delta = sub(p2, p1);
  const cr = cross(d1, d2);
  const normCr = norm(cr);

  if (normCr < 1e-8) {
    const crDelta = cross(d1, delta);
    if (norm(crDelta) < 1e-8) return { type: 'coincident', p1,p2,d1,d2 };
    return { type: 'parallel', p1,p2,d1,d2 };
  }

  const pairs2x2 = [
    { axes: [0, 1] }, { axes: [0, 2] }, { axes: [1, 2] }
  ];

  let sol = null;
  for (const { axes: [a, b] } of pairs2x2) {
    const s = solve2x2(d1[a], -d2[a], delta[a], d1[b], -d2[b], delta[b]);
    if (s) { sol = s; break; }
  }

  if (!sol) return { type: 'skew', p1,p2,d1,d2 };

  const { x: t, y: s } = sol;
  const pt1 = p1.map((v, i) => v + t * d1[i]);
  const pt2 = p2.map((v, i) => v + s * d2[i]);
  const residual = norm(sub(pt1, pt2));

  if (residual > 1e-4) return { type: 'skew', p1,p2,d1,d2 };
  return { type: 'intersect', point: pt1, t, s, p1,p2,d1,d2 };
}

const TYPE_LABELS = {
  intersect:  { emoji: '🟢', text: 'Se cortan en un punto', cls: 'result-val' },
  parallel:   { emoji: '🔵', text: 'Son Paralelas', cls: 'result-warn' },
  coincident: { emoji: '⚪', text: 'Son Coincidentes', cls: 'result-formula' },
  skew:       { emoji: '🟡', text: 'Son Alabeadas', cls: 'result-warn' },
};

function _renderResults(res, kVal) {
  const box = document.getElementById('kPairResults');
  if (!box) return;
  const info = TYPE_LABELS[res.type];

  let html = `
    <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-md);padding:12px;margin-bottom:12px;">
      <div style="font-size:13px;font-weight:700;margin-bottom:10px;display:flex;align-items:center;gap:8px;">
        <span style="font-size:18px;">${info.emoji}</span>
        <span class="${info.cls}">${info.text}</span>
      </div>
  `;

  if (res.point) {
    html += `
      <div style="background:rgba(0,229,160,0.08);border:1px solid rgba(0,229,160,0.3);border-radius:4px;padding:7px 10px;margin-bottom:8px;font-family:var(--font-mono);font-size:12px;">
        <span style="color:var(--success);font-weight:700;">Intersección:</span>
        <span style="color:var(--accent2);">(${res.point.map(x=>fmt(x)).join(', ')})</span>
      </div>
    `;
  }

  // Show live vectors
  html += `
      <div style="font-family:var(--font-mono);font-size:11px;color:var(--text-muted);margin-top:10px;">
        <div style="margin-bottom:4px;">Con k = ${kVal.toFixed(2)}:</div>
        <div><span style="color:${LINE_COLORS[0]}">L₁</span>: P=(${res.p1.map(x=>fmt(x)).join(',')}) d=(${res.d1.map(x=>fmt(x)).join(',')})</div>
        <div><span style="color:${LINE_COLORS[1]}">L₂</span>: P=(${res.p2.map(x=>fmt(x)).join(',')}) d=(${res.d2.map(x=>fmt(x)).join(',')})</div>
      </div>
    </div>
  `;
  
  box.innerHTML = html;
}

function _render3D(lines, res) {
  const traces = [];

  for (const line of lines) {
    const { p, d, name, color } = line;
    if (norm(d) < 1e-9) continue;
    traces.push(line3D(p, d, [-10, 10], color, name));
    traces.push({
      type: 'scatter3d', mode: 'markers+text',
      x: [p[0]], y: [p[1]], z: [p[2]],
      marker: { size: 6, color },
      text: [`P₀ ${name}`],textposition: 'top center',textfont: { color, size: 9 },
      showlegend: false, hoverinfo: 'none'
    });
  }

  if (res.type === 'intersect' && res.point) {
    traces.push({
      type: 'scatter3d', mode: 'markers+text',
      x: [res.point[0]], y: [res.point[1]], z: [res.point[2]],
      marker: { size: 8, color: '#00e5a0', symbol: 'circle' },
      text: ['Intersección'], textposition: 'top center', textfont: { color: '#00e5a0', size: 10 },
      name: 'Punto Intersección',
    });
  }

  const lyt = layout3D('Explorador Dinámico con k');
  plot3D('paramLines3D', traces, lyt);
}

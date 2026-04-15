/**
 * modules/vectors.js
 * Vectores en R² y R³ — soporta tres vectores u, v, w.
 * Visualiza suma, diferencia, combinación lineal y ortogonalidad.
 */
import { norm, dot, add, sub, scale, cross, unit, angleDeg, fmt, areOrthogonal } from '../core/math.js';
import { setupCanvas, initCanvas, drawArrow, drawDashed } from '../core/canvas2d.js';
import { arrow3D, layout3D, plot3D } from '../core/plotly3d.js';

/* ─────────────────────────────────────────────
   STATE
───────────────────────────────────────────── */
let dim = 2; // 2 or 3

function getVectors() {
  const g = id => +(document.getElementById(id)?.value ?? 0);
  return {
    u: [g('ux'), g('uy'), dim === 3 ? g('uz') : 0],
    v: [g('vx'), g('vy'), dim === 3 ? g('vz') : 0],
    w: [g('wx'), g('wy'), dim === 3 ? g('wz') : 0],
    lambda: g('lambda'),
    mu:     g('mu'),
  };
}

/* ─────────────────────────────────────────────
   MODULE DEFINITION
───────────────────────────────────────────── */
export default {
  id: 'vectors',
  label: 'Vectores',
  icon: '→',
  section: 'módulos',

  template: () => /* html */`
    <div class="module-layout">

      <!-- THEORY -->
      <div class="panel theory-panel">
        <div class="panel-header"><span class="panel-icon">📐</span> Teoría — Vectores</div>
        <div class="theory-content">
          <h3>¿Qué es un vector?</h3>
          <p>Un <strong>vector</strong> en Rⁿ tiene <em>magnitud</em> y <em>dirección</em>:</p>
          <div class="formula-box">v = (v₁, v₂) ∈ R²&nbsp;&nbsp;|&nbsp;&nbsp;v = (v₁, v₂, v₃) ∈ R³</div>

          <h3>Operaciones</h3>
          <div class="ops-grid">
            <div class="op-card"><div class="op-name">Suma</div><div class="op-formula">u+v = (u₁+v₁, ...)</div></div>
            <div class="op-card"><div class="op-name">Escalar</div><div class="op-formula">λ·v = (λv₁, ...)</div></div>
            <div class="op-card"><div class="op-name">Norma</div><div class="op-formula">‖v‖ = √(Σvᵢ²)</div></div>
            <div class="op-card"><div class="op-name">Punto</div><div class="op-formula">u·v = Σuᵢvᵢ</div></div>
          </div>

          <h3>Ángulo entre vectores</h3>
          <div class="formula-box">cos θ = (u·v) / (‖u‖·‖v‖)</div>
          <p>u ⊥ v &nbsp;⟺&nbsp; u·v = 0</p>

          <h3>Combinación Lineal</h3>
          <div class="formula-box">w = λ·u + μ·v&nbsp;&nbsp;(λ, μ ∈ R)</div>
          <p>u, v son <strong>lin. independientes</strong> si λu+μv = 0 ⟹ λ=μ=0.</p>

          <h3>Producto Vectorial (R³)</h3>
          <div class="formula-box">u × v = (u₂v₃−u₃v₂, u₃v₁−u₁v₃, u₁v₂−u₂v₁)</div>
          <p>‖u×v‖ = área del paralelogramo generado por u y v.</p>

          <h3>Leyenda de colores</h3>
          <div class="vec-legend">
            <div class="vec-chip"><div class="vec-chip-dot" style="background:#6c63ff"></div>u</div>
            <div class="vec-chip"><div class="vec-chip-dot" style="background:#00d4ff"></div>v</div>
            <div class="vec-chip"><div class="vec-chip-dot" style="background:#ff6b9d"></div>w</div>
            <div class="vec-chip"><div class="vec-chip-dot" style="background:#00e5a0"></div>u+v</div>
            <div class="vec-chip"><div class="vec-chip-dot" style="background:#ffb347"></div>λ·u</div>
          </div>
        </div>
      </div>

      <!-- VISUALIZATION -->
      <div class="panel viz-panel">
        <div class="panel-header">
          <span class="panel-icon">📊</span> Visualización
          <div class="viz-tabs">
            <button class="viz-tab active" id="vecTab2d">2D</button>
            <button class="viz-tab"        id="vecTab3d">3D</button>
          </div>
        </div>
        <div class="viz-content" id="vec-2d-viz">
          <canvas id="vectorCanvas2D"></canvas>
        </div>
        <div class="viz-content hidden" id="vec-3d-viz">
          <div id="vector3DContainer" style="width:100%;height:100%;"></div>
        </div>
      </div>

      <!-- INPUTS -->
      <div class="panel input-panel">
        <div class="panel-header"><span class="panel-icon">✏️</span> Vectores</div>
        <div class="inputs-section">
          <div class="dimension-toggle">
            <label>Dimensión:</label>
            <div class="toggle-group">
              <button class="toggle-btn active" id="vDim2">R²</button>
              <button class="toggle-btn"        id="vDim3">R³</button>
            </div>
          </div>

          <h4>Vector u</h4>
          <div class="coord-inputs">
            <div class="coord-group"><label>u₁</label><input type="number" id="ux" value="3"/></div>
            <div class="coord-group"><label>u₂</label><input type="number" id="uy" value="1"/></div>
            <div class="coord-group hidden" id="uzG"><label>u₃</label><input type="number" id="uz" value="2"/></div>
          </div>

          <h4>Vector v</h4>
          <div class="coord-inputs">
            <div class="coord-group"><label>v₁</label><input type="number" id="vx" value="1"/></div>
            <div class="coord-group"><label>v₂</label><input type="number" id="vy" value="3"/></div>
            <div class="coord-group hidden" id="vzG"><label>v₃</label><input type="number" id="vz" value="0"/></div>
          </div>

          <h4>Vector w</h4>
          <div class="coord-inputs">
            <div class="coord-group"><label>w₁</label><input type="number" id="wx" value="-2"/></div>
            <div class="coord-group"><label>w₂</label><input type="number" id="wy" value="2"/></div>
            <div class="coord-group hidden" id="wzG"><label>w₃</label><input type="number" id="wz" value="1"/></div>
          </div>

          <hr class="input-sep"/>

          <h4>Escalares</h4>
          <div class="coord-inputs">
            <div class="coord-group"><label>λ</label><input type="number" id="lambda" value="2" step="0.5"/></div>
            <div class="coord-group"><label>μ</label><input type="number" id="mu"     value="1" step="0.5"/></div>
          </div>

          <div class="results-box" id="vecResults">
            <span class="text-muted">Ingresá los vectores para ver resultados.</span>
          </div>
        </div>
      </div>
    </div>
  `,

  init() {
    // Dimension toggle
    document.getElementById('vDim2')?.addEventListener('click', () => _setDim(2));
    document.getElementById('vDim3')?.addEventListener('click', () => _setDim(3));

    // Viz tabs
    document.getElementById('vecTab2d')?.addEventListener('click', e => _switchTab('2d', e.target));
    document.getElementById('vecTab3d')?.addEventListener('click', e => _switchTab('3d', e.target));

    // Live update on any input change
    document.getElementById(`mod-vectors`)?.querySelectorAll('input').forEach(inp => {
      inp.addEventListener('input', () => _render());
    });

    _render();
  },
};

/* ─────────────────────────────────────────────
   PRIVATE
───────────────────────────────────────────── */
function _setDim(d) {
  dim = d;
  ['uzG', 'vzG', 'wzG'].forEach(id => {
    document.getElementById(id)?.classList.toggle('hidden', d !== 3);
  });
  document.getElementById('vDim2')?.classList.toggle('active', d === 2);
  document.getElementById('vDim3')?.classList.toggle('active', d === 3);
  _render();
}

function _switchTab(tab, btn) {
  document.querySelectorAll('#mod-vectors .viz-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('vec-2d-viz')?.classList.toggle('hidden', tab === '3d');
  document.getElementById('vec-3d-viz')?.classList.toggle('hidden', tab === '2d');
  _render(tab);
}

function _render(tab) {
  const is3d = document.getElementById('vec-3d-viz')?.classList.contains('hidden') === false;
  _updateResults();
  if (is3d) _draw3D(); else _draw2D();
}

function _updateResults() {
  const { u, v, w, lambda, mu } = getVectors();
  const uv_sum  = add(u, v);
  const uw_sum  = add(u, w);
  const vw_sum  = add(v, w);
  const uvw_sum = add(add(u, v), w);
  const uScaled = scale(u, lambda);
  const linComb = add(scale(u, lambda), scale(v, mu));
  const angUV   = angleDeg(u, v);
  const angUW   = angleDeg(u, w);
  const n_u = norm(u), n_v = norm(v), n_w = norm(w);
  const crossUV = dim === 3 ? cross(u, v) : null;

  const box = document.getElementById('vecResults');
  box.innerHTML = `
    <div class="result-row"><span class="result-key">‖u‖</span><span class="result-val">${fmt(n_u)}</span></div>
    <div class="result-row"><span class="result-key">‖v‖</span><span class="result-val">${fmt(n_v)}</span></div>
    <div class="result-row"><span class="result-key">‖w‖</span><span class="result-val">${fmt(n_w)}</span></div>
    <div class="result-row"><span class="result-key">u+v</span><span class="result-formula">(${uv_sum.slice(0,dim).map(x=>fmt(x)).join(', ')})</span></div>
    <div class="result-row"><span class="result-key">u+v+w</span><span class="result-formula">(${uvw_sum.slice(0,dim).map(x=>fmt(x)).join(', ')})</span></div>
    <div class="result-row"><span class="result-key">λu+μv</span><span class="result-formula">(${linComb.slice(0,dim).map(x=>fmt(x)).join(', ')})</span></div>
    <div class="result-row"><span class="result-key">u·v</span><span class="result-val">${fmt(dot(u,v))}</span></div>
    <div class="result-row"><span class="result-key">u·w</span><span class="result-val">${fmt(dot(u,w))}</span></div>
    <div class="result-row"><span class="result-key">∠(u,v)</span><span class="result-val">${angUV !== null ? fmt(angUV)+'°' : 'N/A'}</span></div>
    <div class="result-row"><span class="result-key">∠(u,w)</span><span class="result-val">${angUW !== null ? fmt(angUW)+'°' : 'N/A'}</span></div>
    <div class="result-row"><span class="result-key">u⊥v?</span><span class="${areOrthogonal(u,v)?'result-val':'result-warn'}">${areOrthogonal(u,v)?'SÍ':'NO'}</span></div>
    ${crossUV ? `<div class="result-row"><span class="result-key">u×v</span><span class="result-formula">(${crossUV.map(x=>fmt(x)).join(', ')})</span></div>` : ''}
  `;
}

function _draw2D() {
  const canvas = setupCanvas('vectorCanvas2D');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const sc = Math.min(canvas.width, canvas.height) / 12;
  const { cx, cy, toScreen } = initCanvas(ctx, canvas, sc);

  const { u, v, w, lambda, mu } = getVectors();
  const uv  = add(u, v);
  const uvw = add(uv, w);
  const lu  = scale(u, lambda);

  // Dashed parallelogram for u+v
  const [su, sv, suv] = [toScreen(u), toScreen(v), toScreen(uv)];
  drawDashed(ctx, su[0], su[1], suv[0], suv[1], '#3a4170');
  drawDashed(ctx, sv[0], sv[1], suv[0], suv[1], '#3a4170');

  // Vectors from origin
  drawArrow(ctx, cx, cy, ...toScreen(u),   '#6c63ff', 'u');
  drawArrow(ctx, cx, cy, ...toScreen(v),   '#00d4ff', 'v');
  drawArrow(ctx, cx, cy, ...toScreen(w),   '#ff6b9d', 'w');
  drawArrow(ctx, cx, cy, ...toScreen(uv),  '#00e5a0', 'u+v');
  drawArrow(ctx, cx, cy, ...toScreen(uvw), '#a0f0a0', 'u+v+w');
  drawArrow(ctx, cx, cy, ...toScreen(lu),  '#ffb347', `λu`);
}

function _draw3D() {
  const { u, v, w, lambda, mu } = getVectors();
  const uv  = add(u, v);
  const uvw = add(uv, w);
  const lu  = scale(u, lambda);

  const traces = [
    arrow3D([0,0,0], u,   '#6c63ff', 'u'),
    arrow3D([0,0,0], v,   '#00d4ff', 'v'),
    arrow3D([0,0,0], w,   '#ff6b9d', 'w'),
    arrow3D([0,0,0], uv,  '#00e5a0', 'u+v'),
    arrow3D([0,0,0], uvw, '#a0f0a0', 'u+v+w'),
    arrow3D([0,0,0], lu,  '#ffb347', 'λ·u'),
  ];

  plot3D('vector3DContainer', traces, layout3D('Vectores en R³'));
}

/**
 * modules/lines2d.js
 * Rectas en R² — 4 formas de ingresar, conversión automática, visualización.
 */
import { norm, sub, scale, add, fmt } from '../core/math.js';
import { setupCanvas, initCanvas, drawArrow, drawDashed, drawDot } from '../core/canvas2d.js';

export default {
  id: 'lines2d',
  label: 'Rectas en R²',
  icon: '╱',
  section: 'módulos',

  template: () => /* html */`
    <div class="module-layout">
      <!-- THEORY -->
      <div class="panel theory-panel">
        <div class="panel-header"><span class="panel-icon">📐</span> Teoría — Rectas en R²</div>
        <div class="theory-content">
          <h3>4 Formas Equivalentes</h3>
          <div class="form-cards">
            <div class="form-card">
              <div class="form-title">1. Paramétrica</div>
              <div class="formula-box">(x,y) = P₀ + t·d,&nbsp; t∈R</div>
              <p>P₀ = punto base, d = vector director</p>
            </div>
            <div class="form-card">
              <div class="form-title">2. Implícita / Simétrica</div>
              <div class="formula-box">ax + by = c</div>
              <p>n = (a, b) es el vector <strong>normal</strong> a la recta.</p>
            </div>
            <div class="form-card">
              <div class="form-title">3. Segmentaria</div>
              <div class="formula-box">x/a + y/b = 1</div>
              <p>a y b son los interceptos sobre cada eje.</p>
            </div>
            <div class="form-card">
              <div class="form-title">4. Pendiente–Ordenada</div>
              <div class="formula-box">y = mx + b</div>
              <p>m = pendiente, b = ordenada al origen.</p>
            </div>
          </div>
          <h3>Conversiones clave</h3>
          <p><strong>Paramétrica → Implícita:</strong> despejar t en una ecuación y sustituir en la otra.</p>
          <p><strong>Implícita → Paramétrica:</strong> un punto cualquiera + d = (b, −a).</p>
          <p><strong>Rectas paralelas:</strong> misma dirección (d₁ ‖ d₂).</p>
          <p><strong>Rectas perpendiculares:</strong> d₁ · d₂ = 0.</p>
        </div>
      </div>

      <!-- VISUALIZATION -->
      <div class="panel viz-panel">
        <div class="panel-header"><span class="panel-icon">📊</span> Visualización 2D</div>
        <div class="viz-content">
          <canvas id="linesCanvas2D"></canvas>
        </div>
      </div>

      <!-- INPUTS -->
      <div class="panel input-panel">
        <div class="panel-header"><span class="panel-icon">✏️</span> Definir Recta</div>
        <div class="inputs-section">
          <div class="input-mode-select">
            <label>Ingresar por:</label>
            <select id="lineInputMode">
              <option value="point-dir">Punto + Vector Director</option>
              <option value="two-points">Dos Puntos</option>
              <option value="slope">Pendiente + Ordenada</option>
              <option value="implicit">Forma Implícita (ax+by=c)</option>
            </select>
          </div>
          <div id="lineInputFields"></div>
          <button class="btn-primary" id="btnLine2D">Calcular y Graficar</button>
          <div class="results-box" id="line2DResults">
            <span class="text-muted">Definí la recta y presioná calcular.</span>
          </div>
        </div>
      </div>
    </div>
  `,

  init() {
    const sel = document.getElementById('lineInputMode');
    sel?.addEventListener('change', () => _buildInputs());
    document.getElementById('btnLine2D')?.addEventListener('click', () => _compute());
    _buildInputs();
    _compute();
  },
};

/* ─────────────────────────────────────────────
   PRIVATE
───────────────────────────────────────────── */
function _buildInputs() {
  const mode = document.getElementById('lineInputMode')?.value;
  const templates = {
    'point-dir': `
      <h4>Punto P₀</h4>
      <div class="coord-inputs">
        <div class="coord-group"><label>x₀</label><input type="number" id="l2px" value="1"/></div>
        <div class="coord-group"><label>y₀</label><input type="number" id="l2py" value="2"/></div>
      </div>
      <h4>Vector Director d</h4>
      <div class="coord-inputs">
        <div class="coord-group"><label>d₁</label><input type="number" id="l2dx" value="2"/></div>
        <div class="coord-group"><label>d₂</label><input type="number" id="l2dy" value="1"/></div>
      </div>`,
    'two-points': `
      <h4>Punto A</h4>
      <div class="coord-inputs">
        <div class="coord-group"><label>x₁</label><input type="number" id="l2ax" value="0"/></div>
        <div class="coord-group"><label>y₁</label><input type="number" id="l2ay" value="0"/></div>
      </div>
      <h4>Punto B</h4>
      <div class="coord-inputs">
        <div class="coord-group"><label>x₂</label><input type="number" id="l2bx" value="4"/></div>
        <div class="coord-group"><label>y₂</label><input type="number" id="l2by" value="2"/></div>
      </div>`,
    'slope': `
      <h4>Pendiente y Ordenada</h4>
      <div class="coord-inputs">
        <div class="coord-group"><label>m</label><input type="number" id="l2m" value="2" step="0.5"/></div>
        <div class="coord-group"><label>b</label><input type="number" id="l2bi" value="1" step="0.5"/></div>
      </div>`,
    'implicit': `
      <h4>ax + by = c</h4>
      <div class="coord-inputs">
        <div class="coord-group"><label>a</label><input type="number" id="l2ia" value="2"/></div>
        <div class="coord-group"><label>b</label><input type="number" id="l2ib" value="-1"/></div>
        <div class="coord-group"><label>c</label><input type="number" id="l2ic" value="0"/></div>
      </div>`,
  };
  const el = document.getElementById('lineInputFields');
  if (el) el.innerHTML = templates[mode] ?? '';
}

function _readLine() {
  const g = id => +(document.getElementById(id)?.value ?? 0);
  const mode = document.getElementById('lineInputMode')?.value;
  let p0, dir, a, b, c;

  if (mode === 'point-dir') {
    p0 = [g('l2px'), g('l2py')];
    dir = [g('l2dx'), g('l2dy')];
    a = -dir[1]; b = dir[0]; c = a * p0[0] + b * p0[1];
  } else if (mode === 'two-points') {
    const A = [g('l2ax'), g('l2ay')];
    const B = [g('l2bx'), g('l2by')];
    p0 = A; dir = sub(B, A);
    a = -dir[1]; b = dir[0]; c = a * p0[0] + b * p0[1];
  } else if (mode === 'slope') {
    const m = g('l2m'), bi = g('l2bi');
    a = m; b = -1; c = -bi;
    dir = [1, m]; p0 = [0, bi];
  } else {
    a = g('l2ia'); b = g('l2ib'); c = g('l2ic');
    dir = [b, -a];
    p0 = Math.abs(a) > 1e-9 ? [c / a, 0] : [0, c / b];
  }
  return { p0, dir, a, b, c };
}

function _compute() {
  const { p0, dir, a, b, c } = _readLine();
  const slope = dir[0] !== 0 ? dir[1] / dir[0] : Infinity;
  const intercept = p0[1] - slope * p0[0];
  const nDir = norm([a, b]);

  const box = document.getElementById('line2DResults');
  box.innerHTML = `
    <div class="result-row"><span class="result-key">Paramétrica</span></div>
    <div class="result-formula">X = (${fmt(p0[0])},${fmt(p0[1])}) + t·(${fmt(dir[0])},${fmt(dir[1])})</div>
    <div class="result-row"><span class="result-key">Implícita</span><span class="result-formula">${fmt(a)}x + ${fmt(b)}y = ${fmt(c)}</span></div>
    <div class="result-row"><span class="result-key">Pendiente m</span><span class="result-val">${isFinite(slope) ? fmt(slope) : '∞ (vertical)'}</span></div>
    <div class="result-row"><span class="result-key">Ordenada b</span><span class="result-val">${isFinite(intercept) ? fmt(intercept) : 'N/A'}</span></div>
    <div class="result-row"><span class="result-key">Normal n</span><span class="result-formula">(${fmt(a)}, ${fmt(b)})</span></div>
    <div class="result-row"><span class="result-key">‖n‖</span><span class="result-val">${fmt(nDir)}</span></div>
  `;
  _draw(p0, dir, a, b, c);
}

function _draw(p0, dir, a, b, c) {
  const canvas = setupCanvas('linesCanvas2D');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const sc = 45;
  const { cx, cy, toScreen } = initCanvas(ctx, canvas, sc);

  const T = 20;
  const start = toScreen(add(p0, scale(dir, -T)));
  const end   = toScreen(add(p0, scale(dir,  T)));

  // Line
  ctx.strokeStyle = '#6c63ff';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(...start);
  ctx.lineTo(...end);
  ctx.stroke();

  // Point P0
  const [px, py] = toScreen(p0);
  drawDot(ctx, px, py, '#00e5a0', `P₀(${fmt(p0[0])},${fmt(p0[1])})`);

  // Director vector
  drawArrow(ctx, px, py, px + dir[0]*sc, py - dir[1]*sc, '#00d4ff', 'd');

  // Normal vector
  if (a !== 0 || b !== 0) {
    const n = norm([a, b]);
    const nu = [a / n, b / n];
    drawArrow(ctx, px, py, px + nu[0]*sc*0.9, py - nu[1]*sc*0.9, '#ff6b9d', 'n');
  }
}

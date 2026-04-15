/**
 * modules/planes.js
 * Planos en R³ — 3 formas de ingreso, normal, visualización 3D.
 */
import { norm, sub, cross, dot, scale, unit, fmt } from '../core/math.js';
import { arrow3D, planeSurface, point3D, layout3D, plot3D } from '../core/plotly3d.js';

export default {
  id: 'planes',
  label: 'Planos en R³',
  icon: '▱',
  section: 'módulos',

  template: () => /* html */`
    <div class="module-layout">
      <div class="panel theory-panel">
        <div class="panel-header"><span class="panel-icon">📐</span> Teoría — Planos en R³</div>
        <div class="theory-content">
          <h3>Forma Implícita</h3>
          <div class="formula-box">ax + by + cz = d</div>
          <p>El vector <strong>normal</strong> al plano es n = (a, b, c).</p>

          <h3>Forma Paramétrica</h3>
          <div class="formula-box">(x,y,z) = P₀ + s·u + t·v&nbsp;&nbsp; s,t∈R</div>
          <p>u, v son dos vectores linealmente independientes en el plano.</p>

          <h3>Determinar un plano con...</h3>
          <ul>
            <li>3 puntos no colineales A, B, C:
              <br/>u = B−A,&nbsp; v = C−A,&nbsp; n = u × v</li>
            <li>1 punto + vector normal</li>
            <li>Forma implícita directa</li>
          </ul>

          <h3>Producto Vectorial (normal)</h3>
          <div class="formula-box">n = u × v = (u₂v₃−u₃v₂, u₃v₁−u₁v₃, u₁v₂−u₂v₁)</div>

          <h3>Distancia punto–plano</h3>
          <div class="formula-box">d(Q, π) = |aQ_x + bQ_y + cQ_z − d| / ‖n‖</div>
        </div>
      </div>

      <div class="panel viz-panel">
        <div class="panel-header"><span class="panel-icon">📊</span> Visualización 3D</div>
        <div class="viz-content">
          <div id="planesContainer" style="width:100%;height:100%;"></div>
        </div>
      </div>

      <div class="panel input-panel">
        <div class="panel-header"><span class="panel-icon">✏️</span> Definir Plano</div>
        <div class="inputs-section">
          <div class="input-mode-select">
            <label>Ingresar por:</label>
            <select id="planeInputMode">
              <option value="implicit">Forma Implícita (ax+by+cz=d)</option>
              <option value="point-normal">Punto + Normal</option>
              <option value="three-points">Tres Puntos</option>
            </select>
          </div>
          <div id="planeInputFields"></div>
          <button class="btn-primary" id="btnPlane">Calcular y Graficar</button>
          <div class="results-box" id="planeResults">
            <span class="text-muted">Definí el plano y presioná calcular.</span>
          </div>
        </div>
      </div>
    </div>
  `,

  init() {
    document.getElementById('planeInputMode')?.addEventListener('change', () => _buildInputs());
    document.getElementById('btnPlane')?.addEventListener('click', () => _compute());
    _buildInputs();
    _compute();
  },
};

function _buildInputs() {
  const mode = document.getElementById('planeInputMode')?.value;
  const templates = {
    implicit: `
      <h4>ax + by + cz = d</h4>
      <div class="coord-inputs">
        <div class="coord-group"><label>a</label><input type="number" id="pla" value="1"/></div>
        <div class="coord-group"><label>b</label><input type="number" id="plb" value="1"/></div>
        <div class="coord-group"><label>c</label><input type="number" id="plc" value="1"/></div>
        <div class="coord-group"><label>d</label><input type="number" id="pld" value="3"/></div>
      </div>`,
    'point-normal': `
      <h4>Punto P₀</h4>
      <div class="coord-inputs">
        <div class="coord-group"><label>x₀</label><input type="number" id="pnx" value="1"/></div>
        <div class="coord-group"><label>y₀</label><input type="number" id="pny" value="0"/></div>
        <div class="coord-group"><label>z₀</label><input type="number" id="pnz" value="0"/></div>
      </div>
      <h4>Normal n</h4>
      <div class="coord-inputs">
        <div class="coord-group"><label>n₁</label><input type="number" id="pnn1" value="1"/></div>
        <div class="coord-group"><label>n₂</label><input type="number" id="pnn2" value="2"/></div>
        <div class="coord-group"><label>n₃</label><input type="number" id="pnn3" value="-1"/></div>
      </div>`,
    'three-points': `
      <h4>Punto A</h4>
      <div class="coord-inputs">
        <div class="coord-group"><label>x</label><input type="number" id="ptax" value="1"/></div>
        <div class="coord-group"><label>y</label><input type="number" id="ptay" value="0"/></div>
        <div class="coord-group"><label>z</label><input type="number" id="ptaz" value="0"/></div>
      </div>
      <h4>Punto B</h4>
      <div class="coord-inputs">
        <div class="coord-group"><label>x</label><input type="number" id="ptbx" value="0"/></div>
        <div class="coord-group"><label>y</label><input type="number" id="ptby" value="2"/></div>
        <div class="coord-group"><label>z</label><input type="number" id="ptbz" value="0"/></div>
      </div>
      <h4>Punto C</h4>
      <div class="coord-inputs">
        <div class="coord-group"><label>x</label><input type="number" id="ptcx" value="0"/></div>
        <div class="coord-group"><label>y</label><input type="number" id="ptcy" value="0"/></div>
        <div class="coord-group"><label>z</label><input type="number" id="ptcz" value="3"/></div>
      </div>`,
  };
  const el = document.getElementById('planeInputFields');
  if (el) el.innerHTML = templates[mode] ?? '';
}

function _readPlane() {
  const g = id => +(document.getElementById(id)?.value ?? 0);
  const mode = document.getElementById('planeInputMode')?.value;
  let a, b, c, d;

  if (mode === 'implicit') {
    a = g('pla'); b = g('plb'); c = g('plc'); d = g('pld');
  } else if (mode === 'point-normal') {
    const p = [g('pnx'), g('pny'), g('pnz')];
    const n = [g('pnn1'), g('pnn2'), g('pnn3')];
    [a, b, c] = n; d = dot(n, p);
  } else {
    const A = [g('ptax'), g('ptay'), g('ptaz')];
    const B = [g('ptbx'), g('ptby'), g('ptbz')];
    const C = [g('ptcx'), g('ptcy'), g('ptcz')];
    const u = sub(B, A), v = sub(C, A);
    const n = cross(u, v);
    [a, b, c] = n; d = dot(n, A);
  }
  return { a, b, c, d };
}

function _compute() {
  const { a, b, c, d } = _readPlane();
  const nn = norm([a, b, c]);
  const nu = unit([a, b, c]);

  // Intercepts
  const ix = Math.abs(a) > 1e-9 ? d/a : '∞';
  const iy = Math.abs(b) > 1e-9 ? d/b : '∞';
  const iz = Math.abs(c) > 1e-9 ? d/c : '∞';

  document.getElementById('planeResults').innerHTML = `
    <div class="result-row"><span class="result-key">Implícita</span><span class="result-formula">${fmt(a)}x + ${fmt(b)}y + ${fmt(c)}z = ${fmt(d)}</span></div>
    <div class="result-row"><span class="result-key">Normal n</span><span class="result-formula">(${fmt(a)}, ${fmt(b)}, ${fmt(c)})</span></div>
    <div class="result-row"><span class="result-key">‖n‖</span><span class="result-val">${fmt(nn)}</span></div>
    <div class="result-row"><span class="result-key">n̂ (unit)</span><span class="result-formula">(${nu.map(x=>fmt(x,2)).join(', ')})</span></div>
    <div class="result-row"><span class="result-key">Intercpt.</span><span class="result-formula">x:${typeof ix==='number'?fmt(ix):'∞'} y:${typeof iy==='number'?fmt(iy):'∞'} z:${typeof iz==='number'?fmt(iz):'∞'}</span></div>
  `;

  _draw(a, b, c, d, nu);
}

function _draw(a, b, c, d, nu) {
  const traces = [
    planeSurface(a, b, c, d, { opacity: 0.65 }),
    arrow3D([0,0,0], scale(nu, 2.5), '#ff6b9d', 'Normal n'),
  ];
  plot3D('planesContainer', traces, layout3D('Plano en R³'));
}

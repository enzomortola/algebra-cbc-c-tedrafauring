/**
 * modules/lines3d.js
 * Rectas en R³ — punto + vector director, visualización 3D interactiva.
 * Detecta la relación entre dos rectas: cortan / paralelas / alabeadas / coincidentes.
 */
import { norm, sub, cross, dot, scale, add, fmt, areParallel, solve2x2 } from '../core/math.js';
import { arrow3D, line3D, point3D, layout3D, plot3D } from '../core/plotly3d.js';

export default {
  id: 'lines3d',
  label: 'Rectas en R³',
  icon: '⟋',
  section: 'módulos',

  template: () => /* html */`
    <div class="module-layout">
      <!-- THEORY -->
      <div class="panel theory-panel">
        <div class="panel-header"><span class="panel-icon">📐</span> Teoría — Rectas en R³</div>
        <div class="theory-content">
          <h3>Ecuación Paramétrica</h3>
          <p>Determinada por un punto P₀ y un vector director d ≠ 0:</p>
          <div class="formula-box">(x,y,z) = (x₀,y₀,z₀) + t·(d₁,d₂,d₃),&nbsp; t∈R</div>

          <h3>Relación entre dos rectas</h3>
          <ul>
            <li>🟢 <strong>Se cortan</strong> → un punto de intersección</li>
            <li>🔵 <strong>Paralelas</strong> → mismo dir., sin punto en común</li>
            <li>🟡 <strong>Alabeadas</strong> → no paralelas y no se cortan</li>
            <li>⚪ <strong>Coincidentes</strong> → misma recta</li>
          </ul>

          <h3>Verificar intersección</h3>
          <p>Plantear el sistema paramétrico igualando componentes y resolver para t y s:</p>
          <div class="formula-box">
            x₀₁ + t·d₁₁ = x₀₂ + s·d₁₂<br/>
            y₀₁ + t·d₂₁ = y₀₂ + s·d₂₂<br/>
            z₀₁ + t·d₃₁ = z₀₂ + s·d₃₂
          </div>
          <p>Si se obtiene t y s consistentes en las 3 ecuaciones → se cortan.</p>
        </div>
      </div>

      <!-- VISUALIZATION -->
      <div class="panel viz-panel">
        <div class="panel-header"><span class="panel-icon">📊</span> Visualización 3D</div>
        <div class="viz-content">
          <div id="lines3DContainer" style="width:100%;height:100%;"></div>
        </div>
      </div>

      <!-- INPUTS -->
      <div class="panel input-panel">
        <div class="panel-header"><span class="panel-icon">✏️</span> Definir Rectas en R³</div>
        <div class="inputs-section">
          <h4 style="color:var(--vec-u)">Recta 1 — Punto P₁</h4>
          <div class="coord-inputs">
            <div class="coord-group"><label>x₀</label><input type="number" id="l1px" value="0"/></div>
            <div class="coord-group"><label>y₀</label><input type="number" id="l1py" value="0"/></div>
            <div class="coord-group"><label>z₀</label><input type="number" id="l1pz" value="0"/></div>
          </div>
          <h4 style="color:var(--vec-u)">Recta 1 — Director d₁</h4>
          <div class="coord-inputs">
            <div class="coord-group"><label>d₁</label><input type="number" id="l1dx" value="1"/></div>
            <div class="coord-group"><label>d₂</label><input type="number" id="l1dy" value="1"/></div>
            <div class="coord-group"><label>d₃</label><input type="number" id="l1dz" value="0"/></div>
          </div>

          <hr class="input-sep"/>

          <h4 style="color:var(--vec-v)">Recta 2 — Punto P₂</h4>
          <div class="coord-inputs">
            <div class="coord-group"><label>x₀</label><input type="number" id="l2px" value="2"/></div>
            <div class="coord-group"><label>y₀</label><input type="number" id="l2py" value="0"/></div>
            <div class="coord-group"><label>z₀</label><input type="number" id="l2pz" value="0"/></div>
          </div>
          <h4 style="color:var(--vec-v)">Recta 2 — Director d₂</h4>
          <div class="coord-inputs">
            <div class="coord-group"><label>d₁</label><input type="number" id="l2dx2" value="-1"/></div>
            <div class="coord-group"><label>d₂</label><input type="number" id="l2dy2" value="1"/></div>
            <div class="coord-group"><label>d₃</label><input type="number" id="l2dz2" value="0"/></div>
          </div>

          <button class="btn-primary" id="btnLines3D">Graficar y Analizar</button>
          <div class="results-box" id="line3DResults">
            <span class="text-muted">Definí las rectas y presioná graficar.</span>
          </div>
        </div>
      </div>
    </div>
  `,

  init() {
    document.getElementById('btnLines3D')?.addEventListener('click', () => _compute());
    _compute();
  },
};

/* ─────────────────────────────────────────────
   PRIVATE
───────────────────────────────────────────── */
function _read() {
  const g = id => +(document.getElementById(id)?.value ?? 0);
  return {
    p1: [g('l1px'), g('l1py'), g('l1pz')],
    d1: [g('l1dx'), g('l1dy'), g('l1dz')],
    p2: [g('l2px'), g('l2py'), g('l2pz')],
    d2: [g('l2dx2'), g('l2dy2'), g('l2dz2')],
  };
}

function _analyzeRelation(p1, d1, p2, d2) {
  const norms = norm(d1) * norm(d2);
  if (norms < 1e-10) return { type: 'degenerate', msg: 'Un vector director es nulo.' };

  if (areParallel(d1, d2)) {
    // Check coincident: p2-p1 parallel to d1
    const delta = sub(p2, p1);
    if (areParallel(delta, d1) || norm(delta) < 1e-10) {
      return { type: 'coincident', msg: 'Las rectas son COINCIDENTES.' };
    }
    return { type: 'parallel', msg: 'Las rectas son PARALELAS (sin intersección).' };
  }

  // Try to find t, s using components 0 and 1
  const sol = solve2x2(d1[0], -d2[0], p2[0]-p1[0], d1[1], -d2[1], p2[1]-p1[1]);
  if (!sol) {
    // Try components 0 and 2
    const sol2 = solve2x2(d1[0], -d2[0], p2[0]-p1[0], d1[2], -d2[2], p2[2]-p1[2]);
    if (!sol2) return { type: 'skew', msg: 'Las rectas son ALABEADAS.' };
    const { x: t, y: s } = sol2;
    const check = Math.abs((p1[1] + t*d1[1]) - (p2[1] + s*d2[1]));
    if (check > 1e-6) return { type: 'skew', msg: 'Las rectas son ALABEADAS.' };
    const ix = p1.map((v, i) => v + t * d1[i]);
    return { type: 'intersect', msg: 'Las rectas SE CORTAN.', t, s, point: ix };
  }

  const { x: t, y: s } = sol;
  const p1point = p1.map((v, i) => v + t * d1[i]);
  const p2point = p2.map((v, i) => v + s * d2[i]);
  const dist = norm(sub(p1point, p2point));

  if (dist > 1e-6) return { type: 'skew', msg: 'Las rectas son ALABEADAS.' };
  return { type: 'intersect', msg: 'Las rectas SE CORTAN.', t, s, point: p1point };
}

function _compute() {
  const { p1, d1, p2, d2 } = _read();
  const rel = _analyzeRelation(p1, d1, p2, d2);

  const typeColors = { intersect: 'result-val', parallel: 'result-warn', coincident: 'result-formula', skew: 'result-warn', degenerate: 'result-error' };
  const n1 = norm(d1), n2 = norm(d2);

  let extra = '';
  if (rel.type === 'intersect') {
    extra = `<div class="result-row"><span class="result-key">t</span><span class="result-val">${fmt(rel.t)}</span></div>
             <div class="result-row"><span class="result-key">s</span><span class="result-val">${fmt(rel.s)}</span></div>
             <div class="result-row"><span class="result-key">Punto ∩</span><span class="result-formula">(${rel.point.map(x=>fmt(x)).join(', ')})</span></div>`;
  }

  document.getElementById('line3DResults').innerHTML = `
    <div class="result-row"><span class="result-key">Relación</span><span class="${typeColors[rel.type]}">${rel.msg}</span></div>
    <div class="result-row"><span class="result-key">‖d₁‖</span><span class="result-val">${fmt(n1)}</span></div>
    <div class="result-row"><span class="result-key">‖d₂‖</span><span class="result-val">${fmt(n2)}</span></div>
    ${extra}
    <div class="result-formula mt-8">R1: X=(${p1.map(x=>fmt(x)).join(',')})+t·(${d1.map(x=>fmt(x)).join(',')})<br/>R2: X=(${p2.map(x=>fmt(x)).join(',')})+s·(${d2.map(x=>fmt(x)).join(',')})</div>
  `;

  _draw(p1, d1, p2, d2, rel);
}

function _draw(p1, d1, p2, d2, rel) {
  const traces = [
    line3D(p1, d1, [-4, 4], '#6c63ff', 'Recta 1'),
    arrow3D(p1, p1.map((v,i) => v + d1[i]), '#6c63ff', 'd₁'),
    { type:'scatter3d', mode:'markers+text', x:[p1[0]], y:[p1[1]], z:[p1[2]], marker:{size:7,color:'#6c63ff'}, text:['P₁'], textposition:'top center', textfont:{color:'#6c63ff',size:11}, name:'P₁' },

    line3D(p2, d2, [-4, 4], '#00d4ff', 'Recta 2'),
    arrow3D(p2, p2.map((v,i) => v + d2[i]), '#00d4ff', 'd₂'),
    { type:'scatter3d', mode:'markers+text', x:[p2[0]], y:[p2[1]], z:[p2[2]], marker:{size:7,color:'#00d4ff'}, text:['P₂'], textposition:'top center', textfont:{color:'#00d4ff',size:11}, name:'P₂' },
  ];

  if (rel.type === 'intersect') {
    traces.push({
      type:'scatter3d', mode:'markers+text',
      x:[rel.point[0]], y:[rel.point[1]], z:[rel.point[2]],
      marker:{size:10, color:'#00e5a0', symbol:'circle'},
      text:[`∩`], textposition:'top center', textfont:{color:'#00e5a0',size:14},
      name:'Intersección'
    });
  }

  plot3D('lines3DContainer', traces, layout3D('Rectas en R³'));
}

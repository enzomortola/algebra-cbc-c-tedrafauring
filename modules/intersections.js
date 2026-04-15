/**
 * modules/intersections.js
 * Intersecciones: Recta∩Recta (R²), Recta∩Plano (R³), Plano∩Plano (R³).
 */
import { norm, sub, cross, dot, scale, add, fmt, solve2x2 } from '../core/math.js';
import { arrow3D, line3D, planeSurface, layout3D, layout2D, plot3D, plot2D } from '../core/plotly3d.js';

let mode = 'rr'; // 'rr' | 'rp' | 'pp'

export default {
  id: 'intersections',
  label: 'Intersecciones',
  icon: '✕',
  section: 'módulos',

  template: () => /* html */`
    <div class="module-layout">
      <div class="panel theory-panel">
        <div class="panel-header"><span class="panel-icon">📐</span> Teoría — Intersecciones</div>
        <div class="theory-content">
          <h3>Recta ∩ Recta (R²)</h3>
          <p>Resolver el sistema lineal 2×2. Resulta en:</p>
          <ul>
            <li><strong>1 solución</strong> → se cortan</li>
            <li><strong>Sin solución</strong> → paralelas</li>
            <li><strong>∞ soluciones</strong> → coincidentes</li>
          </ul>

          <h3>Recta ∩ Plano (R³)</h3>
          <p>Sustituir la paramétrica de la recta en la implícita del plano:</p>
          <div class="formula-box">a(x₀+td₁) + b(y₀+td₂) + c(z₀+td₃) = d<br/>t = (d − n·P₀) / (n·dir)</div>
          <ul>
            <li>n·dir ≠ 0 → un punto</li>
            <li>n·dir = 0, n·P₀ ≠ d → paralela sin intersección</li>
            <li>n·dir = 0, n·P₀ = d → recta contenida en el plano</li>
          </ul>

          <h3>Plano ∩ Plano (R³)</h3>
          <p>La intersección es una <strong>recta</strong> si los planos no son paralelos.</p>
          <div class="formula-box">dir = n₁ × n₂</div>
          <p>Luego se busca un punto sobre ambos planos.</p>
        </div>
      </div>

      <div class="panel viz-panel">
        <div class="panel-header">
          <span class="panel-icon">📊</span> Visualización
          <div class="viz-tabs">
            <button class="viz-tab active" id="intTabRR">Recta∩Recta</button>
            <button class="viz-tab"        id="intTabRP">Recta∩Plano</button>
            <button class="viz-tab"        id="intTabPP">Plano∩Plano</button>
          </div>
        </div>
        <div class="viz-content">
          <div id="intersectContainer" style="width:100%;height:100%;"></div>
        </div>
      </div>

      <div class="panel input-panel">
        <div class="panel-header"><span class="panel-icon">✏️</span> Calcular Intersección</div>
        <div class="inputs-section" id="intersectInputs"></div>
      </div>
    </div>
  `,

  init() {
    document.getElementById('intTabRR')?.addEventListener('click', e => _setMode('rr', e.target));
    document.getElementById('intTabRP')?.addEventListener('click', e => _setMode('rp', e.target));
    document.getElementById('intTabPP')?.addEventListener('click', e => _setMode('pp', e.target));
    _setMode('rr', document.getElementById('intTabRR'));
  },
};

function _setMode(m, btn) {
  mode = m;
  document.querySelectorAll('#mod-intersections .viz-tab').forEach(b => b.classList.remove('active'));
  btn?.classList.add('active');
  _buildInputs();
}

function _buildInputs() {
  const el = document.getElementById('intersectInputs');
  if (!el) return;

  const templates = {
    rr: `
      <h4 style="color:var(--vec-u)">Recta 1: P₁ + t·d₁</h4>
      <div class="coord-inputs">
        <div class="coord-group"><label>P₁x</label><input type="number" id="r1px" value="0"/></div>
        <div class="coord-group"><label>P₁y</label><input type="number" id="r1py" value="0"/></div>
        <div class="coord-group"><label>d₁x</label><input type="number" id="r1dx" value="1"/></div>
        <div class="coord-group"><label>d₁y</label><input type="number" id="r1dy" value="1"/></div>
      </div>
      <h4 style="color:var(--vec-v)">Recta 2: P₂ + s·d₂</h4>
      <div class="coord-inputs">
        <div class="coord-group"><label>P₂x</label><input type="number" id="r2px" value="3"/></div>
        <div class="coord-group"><label>P₂y</label><input type="number" id="r2py" value="0"/></div>
        <div class="coord-group"><label>d₂x</label><input type="number" id="r2dx" value="-1"/></div>
        <div class="coord-group"><label>d₂y</label><input type="number" id="r2dy" value="1"/></div>
      </div>
      <button class="btn-primary" id="btnIntersect">Calcular</button>
      <div class="results-box" id="intersectResults"><span class="text-muted">Presioná calcular.</span></div>`,
    rp: `
      <h4 style="color:var(--vec-u)">Recta: P + t·d</h4>
      <div class="coord-inputs">
        <div class="coord-group"><label>Px</label><input type="number" id="rpPx" value="0"/></div>
        <div class="coord-group"><label>Py</label><input type="number" id="rpPy" value="0"/></div>
        <div class="coord-group"><label>Pz</label><input type="number" id="rpPz" value="0"/></div>
        <div class="coord-group"><label>dx</label><input type="number" id="rpDx" value="1"/></div>
        <div class="coord-group"><label>dy</label><input type="number" id="rpDy" value="1"/></div>
        <div class="coord-group"><label>dz</label><input type="number" id="rpDz" value="1"/></div>
      </div>
      <h4 style="color:var(--accent2)">Plano: ax+by+cz=d</h4>
      <div class="coord-inputs">
        <div class="coord-group"><label>a</label><input type="number" id="rpA" value="1"/></div>
        <div class="coord-group"><label>b</label><input type="number" id="rpB" value="2"/></div>
        <div class="coord-group"><label>c</label><input type="number" id="rpC" value="-1"/></div>
        <div class="coord-group"><label>d</label><input type="number" id="rpD" value="3"/></div>
      </div>
      <button class="btn-primary" id="btnIntersect">Calcular</button>
      <div class="results-box" id="intersectResults"><span class="text-muted">Presioná calcular.</span></div>`,
    pp: `
      <h4 style="color:var(--vec-u)">Plano 1: a₁x+b₁y+c₁z=d₁</h4>
      <div class="coord-inputs">
        <div class="coord-group"><label>a₁</label><input type="number" id="pp1a" value="1"/></div>
        <div class="coord-group"><label>b₁</label><input type="number" id="pp1b" value="0"/></div>
        <div class="coord-group"><label>c₁</label><input type="number" id="pp1c" value="0"/></div>
        <div class="coord-group"><label>d₁</label><input type="number" id="pp1d" value="2"/></div>
      </div>
      <h4 style="color:var(--vec-v)">Plano 2: a₂x+b₂y+c₂z=d₂</h4>
      <div class="coord-inputs">
        <div class="coord-group"><label>a₂</label><input type="number" id="pp2a" value="0"/></div>
        <div class="coord-group"><label>b₂</label><input type="number" id="pp2b" value="1"/></div>
        <div class="coord-group"><label>c₂</label><input type="number" id="pp2c" value="0"/></div>
        <div class="coord-group"><label>d₂</label><input type="number" id="pp2d" value="1"/></div>
      </div>
      <button class="btn-primary" id="btnIntersect">Calcular</button>
      <div class="results-box" id="intersectResults"><span class="text-muted">Presioná calcular.</span></div>`,
  };
  el.innerHTML = templates[mode] ?? '';
  document.getElementById('btnIntersect')?.addEventListener('click', () => _compute());
}

function _compute() {
  if (mode === 'rr') _computeRR();
  else if (mode === 'rp') _computeRP();
  else _computePP();
}

/* ── RR ──────────────────────────────────── */
function _computeRR() {
  const g = id => +(document.getElementById(id)?.value ?? 0);
  const p1 = [g('r1px'), g('r1py')];
  const d1 = [g('r1dx'), g('r1dy')];
  const p2 = [g('r2px'), g('r2py')];
  const d2 = [g('r2dx'), g('r2dy')];

  const sol = solve2x2(d1[0], -d2[0], p2[0]-p1[0], d1[1], -d2[1], p2[1]-p1[1]);
  const box = document.getElementById('intersectResults');
  const tRange = 8;

  let html;
  if (!sol) {
    const cp = (p2[0]-p1[0])*d1[1] - (p2[1]-p1[1])*d1[0];
    html = Math.abs(cp) < 1e-9
      ? `<span class="result-formula">Las rectas son COINCIDENTES (∞ soluciones)</span>`
      : `<span class="result-warn">Las rectas son PARALELAS (sin intersección)</span>`;
    box.innerHTML = html;
    // draw anyway
    plot2D('intersectContainer', [
      { type:'scatter', mode:'lines', x:[-tRange,tRange].map(t=>p1[0]+t*d1[0]), y:[-tRange,tRange].map(t=>p1[1]+t*d1[1]), line:{color:'#6c63ff',width:3}, name:'Recta 1' },
      { type:'scatter', mode:'lines', x:[-tRange,tRange].map(t=>p2[0]+t*d2[0]), y:[-tRange,tRange].map(t=>p2[1]+t*d2[1]), line:{color:'#00d4ff',width:3}, name:'Recta 2' },
    ], layout2D({ scaleanchor: true }));
    return;
  }

  const { x: t } = sol;
  const ix = p1[0] + t*d1[0], iy = p1[1] + t*d1[1];
  box.innerHTML = `
    <div class="result-row"><span class="result-key">Estado</span><span class="result-val">SE CORTAN ✓</span></div>
    <div class="result-row"><span class="result-key">t</span><span class="result-val">${fmt(sol.x)}</span></div>
    <div class="result-row"><span class="result-key">s</span><span class="result-val">${fmt(sol.y)}</span></div>
    <div class="result-row"><span class="result-key">Punto ∩</span><span class="result-formula">(${fmt(ix)}, ${fmt(iy)})</span></div>
  `;

  plot2D('intersectContainer', [
    { type:'scatter', mode:'lines', x:[-tRange,tRange].map(t=>p1[0]+t*d1[0]), y:[-tRange,tRange].map(t=>p1[1]+t*d1[1]), line:{color:'#6c63ff',width:3}, name:'Recta 1' },
    { type:'scatter', mode:'lines', x:[-tRange,tRange].map(t=>p2[0]+t*d2[0]), y:[-tRange,tRange].map(t=>p2[1]+t*d2[1]), line:{color:'#00d4ff',width:3}, name:'Recta 2' },
    { type:'scatter', mode:'markers+text', x:[ix], y:[iy], marker:{size:12,color:'#00e5a0'}, text:[`(${fmt(ix)},${fmt(iy)})`], textposition:'top right', textfont:{color:'#00e5a0',size:11}, name:'Intersección' },
  ], layout2D({ scaleanchor: true }));
}

/* ── RP ──────────────────────────────────── */
function _computeRP() {
  const g = id => +(document.getElementById(id)?.value ?? 0);
  const p  = [g('rpPx'),g('rpPy'),g('rpPz')];
  const d  = [g('rpDx'),g('rpDy'),g('rpDz')];
  const a=g('rpA'), b=g('rpB'), c=g('rpC'), dPlane=g('rpD');

  const nDotD = a*d[0]+b*d[1]+c*d[2];
  const box = document.getElementById('intersectResults');

  if (Math.abs(nDotD) < 1e-10) {
    const inPlane = Math.abs(a*p[0]+b*p[1]+c*p[2]-dPlane) < 1e-10;
    box.innerHTML = inPlane
      ? `<span class="result-formula">La recta está CONTENIDA en el plano (∞ soluciones)</span>`
      : `<span class="result-warn">La recta es PARALELA al plano (sin intersección)</span>`;
    _drawRP(p, d, a, b, c, dPlane, null);
    return;
  }

  const t = (dPlane - (a*p[0]+b*p[1]+c*p[2])) / nDotD;
  const ix = p.map((v,i) => v + t*d[i]);

  box.innerHTML = `
    <div class="result-row"><span class="result-key">Estado</span><span class="result-val">SE CORTAN ✓</span></div>
    <div class="result-row"><span class="result-key">t</span><span class="result-val">${fmt(t)}</span></div>
    <div class="result-row"><span class="result-key">Punto ∩</span><span class="result-formula">(${ix.map(x=>fmt(x)).join(', ')})</span></div>
    <div class="result-row"><span class="result-key">Verif.</span><span class="result-val">${fmt(a*ix[0]+b*ix[1]+c*ix[2])} = ${fmt(dPlane)} ✓</span></div>
  `;
  _drawRP(p, d, a, b, c, dPlane, ix);
}

function _drawRP(p, d, a, b, c, dPlane, intPt) {
  const traces = [
    planeSurface(a, b, c, dPlane, { opacity: 0.5, name: 'Plano' }),
    line3D(p, d, [-5, 5], '#00d4ff', 'Recta'),
  ];
  if (intPt) {
    traces.push({ type:'scatter3d', mode:'markers+text', x:[intPt[0]], y:[intPt[1]], z:[intPt[2]], marker:{size:10,color:'#00e5a0'}, text:['∩'], textposition:'top center', textfont:{color:'#00e5a0',size:14}, name:'Intersección' });
  }
  plot3D('intersectContainer', traces, layout3D('Recta ∩ Plano'));
}

/* ── PP ──────────────────────────────────── */
function _computePP() {
  const g = id => +(document.getElementById(id)?.value ?? 0);
  const n1=[g('pp1a'),g('pp1b'),g('pp1c')], d1=g('pp1d');
  const n2=[g('pp2a'),g('pp2b'),g('pp2c')], d2=g('pp2d');

  const dir = cross(n1, n2);
  const box = document.getElementById('intersectResults');

  if (norm(dir) < 1e-10) {
    box.innerHTML = `<span class="result-warn">Los planos son PARALELOS (sin intersección en recta)</span>`;
    _drawPP(n1, d1, n2, d2, null, null);
    return;
  }

  // Find a point on the intersection line
  let p0 = null;
  const [a1,b1,c1] = n1, [a2,b2,c2] = n2;

  for (const [fixAxis, fixVal] of [[2,0],[1,0],[0,0]]) {
    let s;
    if (fixAxis === 2)      s = solve2x2(a1,b1,d1,a2,b2,d2);
    else if (fixAxis === 1) s = solve2x2(a1,c1,d1,a2,c2,d2);
    else                    s = solve2x2(b1,c1,d1,b2,c2,d2);

    if (s) {
      if      (fixAxis === 2) p0 = [s.x, s.y, 0];
      else if (fixAxis === 1) p0 = [s.x, 0, s.y];
      else                    p0 = [0, s.x, s.y];
      break;
    }
  }

  if (!p0) {
    box.innerHTML = `<span class="result-error">No se pudo determinar un punto de la recta intersección.</span>`;
    return;
  }

  box.innerHTML = `
    <div class="result-row"><span class="result-key">Estado</span><span class="result-val">Intersección en RECTA ✓</span></div>
    <div class="result-row"><span class="result-key">Dir.</span><span class="result-formula">(${dir.map(x=>fmt(x)).join(', ')})</span></div>
    <div class="result-row"><span class="result-key">Punto</span><span class="result-formula">(${p0.map(x=>fmt(x)).join(', ')})</span></div>
    <div class="result-formula mt-8">X=(${p0.map(x=>fmt(x)).join(',')})+t·(${dir.map(x=>fmt(x)).join(',')})</div>
  `;
  _drawPP(n1, d1, n2, d2, p0, dir);
}

function _drawPP(n1, d1, n2, d2, p0, dir) {
  const traces = [
    { ...planeSurface(n1[0],n1[1],n1[2],d1,{opacity:0.5,colorscale:[[0,'#2a1f5e'],[1,'#6c63ff']]}), name:'Plano 1' },
    { ...planeSurface(n2[0],n2[1],n2[2],d2,{opacity:0.5,colorscale:[[0,'#0d3a3a'],[1,'#00d4ff']]}), name:'Plano 2' },
  ];
  if (p0 && dir) {
    traces.push(line3D(p0, dir, [-4,4], '#00e5a0', 'Intersección'));
  }
  plot3D('intersectContainer', traces, layout3D('Plano ∩ Plano'));
}

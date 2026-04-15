/**
 * modules/economics.js
 * Aplicaciones económicas: punto de equilibrio, restricción presupuestaria (2 y 3 bienes).
 */
import { fmt } from '../core/math.js';
import { layout2D, layout3D, planeSurface, plot2D, plot3D } from '../core/plotly3d.js';

let mode = 'breakeven'; // 'breakeven' | 'budget2' | 'budget3'

export default {
  id: 'economics',
  label: 'Aplicaciones Económicas',
  icon: '$',
  section: 'módulos',

  template: () => /* html */`
    <div class="module-layout">
      <div class="panel theory-panel">
        <div class="panel-header"><span class="panel-icon">📐</span> Teoría — Económica</div>
        <div class="theory-content">
          <h3>Modelo Costo–Ingreso</h3>
          <div class="formula-box">C(x) = CF + cv·x<br/>I(x) = p·x</div>
          <p>CF = costos fijos, cv = costo variable/unidad, p = precio de venta.</p>

          <h3>Punto de Equilibrio</h3>
          <p>Donde C(x*) = I(x*) → beneficio = 0.</p>
          <div class="formula-box">x* = CF / (p − cv)&nbsp;&nbsp;(con p > cv)</div>
          <p>Para x > x*: utilidad positiva. Para x < x*: pérdida.</p>

          <h3>Restricción Presupuestaria (2 bienes)</h3>
          <div class="formula-box">p₁·x₁ + p₂·x₂ = M</div>
          <p>Es una <strong>recta</strong> en el primer cuadrante (x₁≥0, x₂≥0).</p>
          <ul>
            <li>Intercepto x₁: M/p₁</li>
            <li>Intercepto x₂: M/p₂</li>
            <li>Pendiente: −p₁/p₂</li>
          </ul>

          <h3>Restricción Presupuestaria (3 bienes)</h3>
          <div class="formula-box">p₁·x₁ + p₂·x₂ + p₃·x₃ = M</div>
          <p>Es un <strong>plano</strong> en el primer octante (x₁,x₂,x₃ ≥ 0).</p>
        </div>
      </div>

      <div class="panel viz-panel">
        <div class="panel-header">
          <span class="panel-icon">📊</span> Gráfico
          <div class="viz-tabs">
            <button class="viz-tab active" id="econTab1">Punto Equilibrio</button>
            <button class="viz-tab"        id="econTab2">Presup. 2 bienes</button>
            <button class="viz-tab"        id="econTab3">Presup. 3 bienes</button>
          </div>
        </div>
        <div class="viz-content">
          <div id="econContainer" style="width:100%;height:100%;"></div>
        </div>
      </div>

      <div class="panel input-panel">
        <div class="panel-header"><span class="panel-icon">✏️</span> Parámetros</div>
        <div class="inputs-section" id="econInputs"></div>
      </div>
    </div>
  `,

  init() {
    document.getElementById('econTab1')?.addEventListener('click', e => _setMode('breakeven', e.target));
    document.getElementById('econTab2')?.addEventListener('click', e => _setMode('budget2', e.target));
    document.getElementById('econTab3')?.addEventListener('click', e => _setMode('budget3', e.target));
    _setMode('breakeven', document.getElementById('econTab1'));
  },
};

function _setMode(m, btn) {
  mode = m;
  document.querySelectorAll('#mod-economics .viz-tab').forEach(b => b.classList.remove('active'));
  btn?.classList.add('active');
  _buildInputs();
  _compute();
}

function _buildInputs() {
  const el = document.getElementById('econInputs');
  if (!el) return;

  const templates = {
    breakeven: `
      <h4>Costos Fijos (CF)</h4>
      <div class="coord-inputs">
        <div class="coord-group" style="flex:1"><label>CF</label><input type="number" id="eCF" value="5000" min="0"/></div>
      </div>
      <h4>Costo Variable / unidad (cv)</h4>
      <div class="coord-inputs">
        <div class="coord-group" style="flex:1"><label>cv</label><input type="number" id="eCV" value="30" step="5" min="0"/></div>
      </div>
      <h4>Precio de Venta (p)</h4>
      <div class="coord-inputs">
        <div class="coord-group" style="flex:1"><label>p</label><input type="number" id="eP" value="80" step="5" min="0"/></div>
      </div>
      <div class="results-box" id="econResults"><span class="text-muted">Actualizá los valores.</span></div>`,
    budget2: `
      <h4>Presupuesto (M)</h4>
      <div class="coord-inputs">
        <div class="coord-group" style="flex:1"><label>M</label><input type="number" id="eM" value="100" min="1"/></div>
      </div>
      <h4>Precios</h4>
      <div class="coord-inputs">
        <div class="coord-group"><label>p₁</label><input type="number" id="ep1" value="5" step="1" min="0.1"/></div>
        <div class="coord-group"><label>p₂</label><input type="number" id="ep2" value="4" step="1" min="0.1"/></div>
      </div>
      <div class="results-box" id="econResults"><span class="text-muted">Actualizá los valores.</span></div>`,
    budget3: `
      <h4>Presupuesto (M)</h4>
      <div class="coord-inputs">
        <div class="coord-group" style="flex:1"><label>M</label><input type="number" id="eM3" value="120" min="1"/></div>
      </div>
      <h4>Precios</h4>
      <div class="coord-inputs">
        <div class="coord-group"><label>p₁</label><input type="number" id="ep1_3" value="4" step="1" min="0.1"/></div>
        <div class="coord-group"><label>p₂</label><input type="number" id="ep2_3" value="3" step="1" min="0.1"/></div>
        <div class="coord-group"><label>p₃</label><input type="number" id="ep3_3" value="6" step="1" min="0.1"/></div>
      </div>
      <div class="results-box" id="econResults"><span class="text-muted">Actualizá los valores.</span></div>`,
  };
  el.innerHTML = templates[mode] ?? '';

  // Live update
  el.querySelectorAll('input').forEach(inp => inp.addEventListener('input', _compute));
}

function _compute() {
  if (mode === 'breakeven') _drawBreakeven();
  else if (mode === 'budget2') _drawBudget2();
  else _drawBudget3();
}

function _drawBreakeven() {
  const g = id => +(document.getElementById(id)?.value ?? 0);
  const CF = g('eCF'), cv = g('eCV'), p = g('eP');
  const box = document.getElementById('econResults');

  if (p <= cv) {
    box.innerHTML = `<span class="result-warn">p debe ser mayor que cv para tener punto de equilibrio.</span>`;
    return;
  }

  const xStar = CF / (p - cv);
  const xMax = xStar * 2.2 || 200;
  const N = 100;
  const xs = Array.from({ length: N }, (_, i) => (i / (N-1)) * xMax);

  box.innerHTML = `
    <div class="result-row"><span class="result-key">x* (equilibrio)</span><span class="result-val">${fmt(xStar, 1)} unidades</span></div>
    <div class="result-row"><span class="result-key">Ingreso en x*</span><span class="result-val">$${fmt(p * xStar, 2)}</span></div>
    <div class="result-row"><span class="result-key">Margen contrib.</span><span class="result-val">$${fmt(p - cv)}/u</span></div>
    <div class="result-formula">C(x) = ${CF} + ${cv}x<br/>I(x) = ${p}x</div>
  `;

  const l = layout2D({ xLabel: 'Cantidad (x)', yLabel: '$' });
  l.shapes = [{ type:'line', x0:xStar, x1:xStar, y0:0, y1:p*xStar, line:{color:'#00e5a0',width:2,dash:'dot'} }];
  l.annotations = [{
    x: xStar, y: p*xStar,
    text: `x*=${fmt(xStar,1)}`, showarrow:true, arrowcolor:'#00e5a0',
    font:{color:'#00e5a0',size:11}, bgcolor:'#131626', bordercolor:'#00e5a0'
  }];

  plot2D('econContainer', [
    { x:xs, y:xs.map(x=>CF+cv*x), mode:'lines', name:'Costo C(x)', line:{color:'#ff6b9d',width:2.5} },
    { x:xs, y:xs.map(x=>p*x),     mode:'lines', name:'Ingreso I(x)', line:{color:'#00d4ff',width:2.5} },
    { x:xs, y:xs.map(x=>(p-cv)*x-CF), mode:'lines', name:'Beneficio', line:{color:'#ffb347',width:2,dash:'dot'} },
    { x:[xStar], y:[p*xStar], mode:'markers', name:'Equilibrio', marker:{size:12,color:'#00e5a0'} },
  ], l);
}

function _drawBudget2() {
  const g = id => +(document.getElementById(id)?.value ?? 0);
  const M = g('eM'), p1 = g('ep1'), p2 = g('ep2');
  if (p1 <= 0 || p2 <= 0 || M <= 0) return;

  const x1Max = M / p1, x2Max = M / p2;

  document.getElementById('econResults').innerHTML = `
    <div class="result-formula">${p1}x₁ + ${p2}x₂ = ${M}</div>
    <div class="result-row"><span class="result-key">x₁ máx</span><span class="result-val">${fmt(x1Max)}</span></div>
    <div class="result-row"><span class="result-key">x₂ máx</span><span class="result-val">${fmt(x2Max)}</span></div>
    <div class="result-row"><span class="result-key">Pendiente</span><span class="result-val">−${fmt(p1/p2)}</span></div>
    <div class="result-row"><span class="result-key">Normal</span><span class="result-formula">(${p1}, ${p2})</span></div>
  `;

  const l = layout2D({ xLabel: 'x₁ (bien 1)', yLabel: 'x₂ (bien 2)' });
  l.xaxis.range = [0, x1Max * 1.25];
  l.yaxis.range = [0, x2Max * 1.25];
  l.shapes = [{ type:'path', path:`M 0 0 L ${x1Max} 0 L 0 ${x2Max} Z`, fillcolor:'rgba(108,99,255,0.10)', line:{color:'transparent'} }];

  plot2D('econContainer', [
    { x:[0, x1Max], y:[x2Max, 0], mode:'lines+markers', name:'Restricción presupuestaria', line:{color:'#6c63ff',width:3}, marker:{size:8,color:'#6c63ff'} },
  ], l);
}

function _drawBudget3() {
  const g = id => +(document.getElementById(id)?.value ?? 0);
  const M = g('eM3'), p1 = g('ep1_3'), p2 = g('ep2_3'), p3 = g('ep3_3');
  if (p1 <= 0 || p2 <= 0 || p3 <= 0 || M <= 0) return;

  document.getElementById('econResults').innerHTML = `
    <div class="result-formula">${p1}x₁ + ${p2}x₂ + ${p3}x₃ = ${M}</div>
    <div class="result-row"><span class="result-key">x₁ máx</span><span class="result-val">${fmt(M/p1)}</span></div>
    <div class="result-row"><span class="result-key">x₂ máx</span><span class="result-val">${fmt(M/p2)}</span></div>
    <div class="result-row"><span class="result-key">x₃ máx</span><span class="result-val">${fmt(M/p3)}</span></div>
    <div class="result-row"><span class="result-key">Normal</span><span class="result-formula">(${p1}, ${p2}, ${p3})</span></div>
  `;

  // Build surface: x3 = (M - p1*x1 - p2*x2) / p3, clipped to ≥ 0
  const x1Max = M/p1, x2Max = M/p2;
  const steps = 22;
  const x1vals = Array.from({length:steps}, (_,i) => x1Max*i/(steps-1));
  const x2vals = Array.from({length:steps}, (_,i) => x2Max*i/(steps-1));
  const xs=[], ys=[], zs=[];
  for (const x1 of x1vals) {
    const ry=[], rz=[];
    for (const x2 of x2vals) {
      const z = (M - p1*x1 - p2*x2) / p3;
      ry.push(x2); rz.push(z >= 0 ? z : null);
    }
    xs.push(x1vals.map(()=>x1)); ys.push(ry); zs.push(rz);
  }

  const l = layout3D('Restricción Presupuestaria 3 bienes', { x:'x₁', y:'x₂', z:'x₃' });
  plot3D('econContainer', [
    { type:'surface', x:xs, y:ys, z:zs, opacity:0.75, colorscale:[[0,'#2a1f5e'],[0.5,'#6c63ff'],[1,'#00d4ff']], showscale:false, name:'Restricción' },
    { type:'scatter3d', mode:'markers+text', x:[M/p1,0,0], y:[0,M/p2,0], z:[0,0,M/p3], marker:{size:9,color:'#00e5a0'}, text:[`(${fmt(M/p1)},0,0)`,`(0,${fmt(M/p2)},0)`,`(0,0,${fmt(M/p3)})`], textposition:'top center', textfont:{color:'#00e5a0',size:10}, name:'Interceptos' },
  ], l);
}

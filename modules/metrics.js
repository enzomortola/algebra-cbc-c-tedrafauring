/**
 * modules/metrics.js
 * Norma, distancia, producto escalar, ángulo, ortogonalidad.
 */
import { norm, dot, sub, scale, unit, angleDeg, fmt, areOrthogonal } from '../core/math.js';
import { setupCanvas, initCanvas, drawArrow, drawDashed } from '../core/canvas2d.js';

let dim = 2;

export default {
  id: 'metrics',
  label: 'Norma y Distancia',
  icon: '⟺',
  section: 'módulos',

  template: () => /* html */`
    <div class="module-layout">
      <div class="panel theory-panel">
        <div class="panel-header"><span class="panel-icon">📐</span> Teoría — Norma y Distancia</div>
        <div class="theory-content">
          <h3>Norma (módulo)</h3>
          <div class="formula-box">‖v‖ = √(v₁² + v₂² + ... + vₙ²)</div>
          <p>Siempre ‖v‖ ≥ 0. Si ‖v‖ = 1 → vector <strong>unitario</strong>.</p>

          <h3>Vector Unitario</h3>
          <div class="formula-box">v̂ = v / ‖v‖</div>

          <h3>Distancia entre dos puntos</h3>
          <div class="formula-box">d(A, B) = ‖B − A‖ = √(Σ(bᵢ−aᵢ)²)</div>

          <h3>Producto Escalar (punto)</h3>
          <div class="formula-box">A · B = Σ aᵢbᵢ = ‖A‖·‖B‖·cos θ</div>

          <h3>Ángulo entre vectores</h3>
          <div class="formula-box">θ = arccos( A·B / (‖A‖·‖B‖) )</div>

          <h3>Ortogonalidad</h3>
          <p>A ⊥ B &nbsp;⟺&nbsp; A·B = 0 &nbsp;⟺&nbsp; θ = 90°</p>

          <h3>Proyección de A sobre B</h3>
          <div class="formula-box">proj_B(A) = (A·B / ‖B‖²) · B</div>
        </div>
      </div>

      <div class="panel viz-panel">
        <div class="panel-header"><span class="panel-icon">📊</span> Visualización 2D</div>
        <div class="viz-content">
          <canvas id="metricsCanvas"></canvas>
        </div>
      </div>

      <div class="panel input-panel">
        <div class="panel-header"><span class="panel-icon">✏️</span> Calcular</div>
        <div class="inputs-section">
          <div class="dimension-toggle">
            <label>Dimensión:</label>
            <div class="toggle-group">
              <button class="toggle-btn active" id="mDim2">R²</button>
              <button class="toggle-btn"        id="mDim3">R³</button>
            </div>
          </div>

          <h4>Vector A</h4>
          <div class="coord-inputs">
            <div class="coord-group"><label>a₁</label><input type="number" id="ma1" value="4"/></div>
            <div class="coord-group"><label>a₂</label><input type="number" id="ma2" value="1"/></div>
            <div class="coord-group hidden" id="ma3g"><label>a₃</label><input type="number" id="ma3" value="2"/></div>
          </div>

          <h4>Vector B</h4>
          <div class="coord-inputs">
            <div class="coord-group"><label>b₁</label><input type="number" id="mb1" value="2"/></div>
            <div class="coord-group"><label>b₂</label><input type="number" id="mb2" value="3"/></div>
            <div class="coord-group hidden" id="mb3g"><label>b₃</label><input type="number" id="mb3" value="0"/></div>
          </div>

          <div class="results-box" id="metricsResults">
            <span class="text-muted">Modificá los vectores para ver resultados.</span>
          </div>
        </div>
      </div>
    </div>
  `,

  init() {
    document.getElementById('mDim2')?.addEventListener('click', () => _setDim(2));
    document.getElementById('mDim3')?.addEventListener('click', () => _setDim(3));

    document.getElementById('mod-metrics')?.querySelectorAll('input').forEach(inp => {
      inp.addEventListener('input', () => _compute());
    });

    _compute();
  },
};

function _setDim(d) {
  dim = d;
  document.getElementById('ma3g')?.classList.toggle('hidden', d !== 3);
  document.getElementById('mb3g')?.classList.toggle('hidden', d !== 3);
  document.getElementById('mDim2')?.classList.toggle('active', d === 2);
  document.getElementById('mDim3')?.classList.toggle('active', d === 3);
  _compute();
}

function _read() {
  const g = id => +(document.getElementById(id)?.value ?? 0);
  return {
    A: [g('ma1'), g('ma2'), dim === 3 ? g('ma3') : 0],
    B: [g('mb1'), g('mb2'), dim === 3 ? g('mb3') : 0],
  };
}

function _compute() {
  const { A, B } = _read();
  const nA = norm(A), nB = norm(B);
  const dist = norm(sub(B, A));
  const dotAB = dot(A, B);
  const theta = angleDeg(A, B);
  const uA = unit(A);
  const proj = nB > 1e-10 ? scale(B, dotAB / (nB * nB)) : [0, 0, 0];

  document.getElementById('metricsResults').innerHTML = `
    <div class="result-row"><span class="result-key">‖A‖</span><span class="result-val">${fmt(nA)}</span></div>
    <div class="result-row"><span class="result-key">‖B‖</span><span class="result-val">${fmt(nB)}</span></div>
    <div class="result-row"><span class="result-key">d(A, B)</span><span class="result-val">${fmt(dist)}</span></div>
    <div class="result-row"><span class="result-key">A · B</span><span class="result-val">${fmt(dotAB)}</span></div>
    <div class="result-row"><span class="result-key">Ángulo θ</span><span class="result-val">${theta !== null ? fmt(theta) + '°' : 'N/A'}</span></div>
    <div class="result-row"><span class="result-key">A ⊥ B?</span><span class="${areOrthogonal(A,B)?'result-val':'result-warn'}">${areOrthogonal(A,B)?'SÍ':'NO'}</span></div>
    <div class="result-row"><span class="result-key">Â (unit)</span><span class="result-formula">(${uA.slice(0,dim).map(x=>fmt(x,2)).join(', ')})</span></div>
    <div class="result-row"><span class="result-key">proj_B(A)</span><span class="result-formula">(${proj.slice(0,dim).map(x=>fmt(x,2)).join(', ')})</span></div>
  `;

  _draw(A, B, proj);
}

function _draw(A, B, proj) {
  const canvas = setupCanvas('metricsCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const sc = Math.min(canvas.width, canvas.height) / 14;
  const { cx, cy, toScreen } = initCanvas(ctx, canvas, sc);

  const sA = toScreen([A[0], A[1]]);
  const sB = toScreen([B[0], B[1]]);
  const sP = toScreen([proj[0], proj[1]]);

  // Projection dashed line
  drawDashed(ctx, sA[0], sA[1], sP[0], sP[1], '#3a4170');
  drawDashed(ctx, sP[0], sP[1], sB[0], sB[1], '#3a4170', [2,2]);

  // Vectors
  drawArrow(ctx, cx, cy, sA[0], sA[1], '#6c63ff', 'A');
  drawArrow(ctx, cx, cy, sB[0], sB[1], '#00d4ff', 'B');

  // Projection vector
  if (norm(proj.slice(0,2)) > 0.1) {
    drawArrow(ctx, cx, cy, sP[0], sP[1], '#ffb347', 'proj');
  }

  // Distance line A→B
  drawDashed(ctx, sA[0], sA[1], sB[0], sB[1], '#00e5a0', [6,4]);
  const mx = (sA[0]+sB[0])/2, my = (sA[1]+sB[1])/2;
  ctx.fillStyle = '#00e5a0';
  ctx.font = '11px Inter, sans-serif';
  ctx.fillText(`d=${fmt(norm(sub(B,A)))}`, mx+5, my-5);

  // Angle arc
  const nA = norm(A), nB = norm(B);
  if (nA > 0.1 && nB > 0.1) {
    const angA = Math.atan2(-A[1], A[0]);
    const angB = Math.atan2(-B[1], B[0]);
    ctx.strokeStyle = '#ffb347';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, 28, Math.min(angA,angB), Math.max(angA,angB));
    ctx.stroke();
  }
}

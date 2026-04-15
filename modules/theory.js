/**
 * modules/theory.js
 * Guía teórica completa — página de cards con resumen por tema.
 */
export default {
  id: 'theory',
  label: 'Guía Teórica',
  icon: '📖',
  section: 'teoría',

  template: () => /* html */`
    <div class="theory-full-page">
      <div class="theory-chapters">

        <div class="chapter-card">
          <div class="chapter-num">01</div>
          <h3>Vectores en Rⁿ</h3>
          <p>Un vector es un elemento del espacio vectorial Rⁿ. Geométricamente, es una flecha con magnitud y dirección desde el origen.</p>
          <div class="formula-box">v = (v₁, ..., vₙ) ∈ Rⁿ</div>
          <p><strong>Suma:</strong> componente a componente.<br/><strong>Escalar:</strong> (λv)ᵢ = λ·vᵢ</p>
          <p><strong>Comb. lineal:</strong> w = α·u + β·v, con α,β ∈ R.</p>
          <p><strong>L. independencia:</strong> u, v son L.I. si αu+βv=0 ⟹ α=β=0.</p>
        </div>

        <div class="chapter-card">
          <div class="chapter-num">02</div>
          <h3>Norma y Producto Escalar</h3>
          <div class="formula-box">‖v‖ = √(Σvᵢ²)&nbsp;&nbsp;&nbsp;û = v/‖v‖<br/>u·v = Σuᵢvᵢ = ‖u‖‖v‖cosθ</div>
          <p><strong>Ortogonalidad:</strong> u·v = 0 ⟺ u ⊥ v</p>
          <p><strong>Desigualdad Cauchy-Schwarz:</strong> |u·v| ≤ ‖u‖·‖v‖</p>
          <p><strong>Proyección:</strong> proj_v(u) = (u·v/‖v‖²)·v</p>
        </div>

        <div class="chapter-card">
          <div class="chapter-num">03</div>
          <h3>Rectas en R²</h3>
          <div class="formula-box">Paramétrica: X = P₀ + t·d, t∈R<br/>Implícita:   ax + by = c<br/>Pendiente:   y = mx + b</div>
          <p><strong>Vector normal:</strong> n = (a, b) ⊥ a la recta.</p>
          <p><strong>Director → implícita:</strong> a = -d₂, b = d₁, c = a·x₀ + b·y₀</p>
          <p><strong>Paralelas:</strong> d₁ ‖ d₂ &nbsp;|&nbsp; <strong>Perp.:</strong> d₁·d₂ = 0</p>
        </div>

        <div class="chapter-card">
          <div class="chapter-num">04</div>
          <h3>Rectas en R³</h3>
          <div class="formula-box">(x,y,z) = (x₀,y₀,z₀) + t·(d₁,d₂,d₃)</div>
          <p>Relaciones posibles entre dos rectas:</p>
          <ul>
            <li>🟢 Se cortan → 1 punto</li>
            <li>🔵 Paralelas → mismo dir., sin punto</li>
            <li>🟡 Alabeadas → no paralelas, no se cortan</li>
            <li>⚪ Coincidentes → misma recta</li>
          </ul>
        </div>

        <div class="chapter-card">
          <div class="chapter-num">05</div>
          <h3>Planos en R³</h3>
          <div class="formula-box">Implícita:    ax + by + cz = d<br/>Paramétrica: X = P₀ + s·u + t·v<br/>Normal:       n = u × v</div>
          <p><strong>3 formas de definir un plano:</strong></p>
          <ul>
            <li>3 puntos no colineales</li>
            <li>Punto + vector normal</li>
            <li>Punto + 2 vectores independientes</li>
          </ul>
          <p><strong>Dist. punto–plano:</strong> |n·Q − d| / ‖n‖</p>
        </div>

        <div class="chapter-card">
          <div class="chapter-num">06</div>
          <h3>Intersecciones</h3>
          <p><strong>Recta∩Recta (R²):</strong> sistema 2×2 → 1 sol / paralelas / coincidentes.</p>
          <p><strong>Recta∩Plano (R³):</strong> sustituir paramétrica en implícita → despejar t.</p>
          <div class="formula-box">t = (d − n·P₀) / (n·dir)</div>
          <p><strong>Plano∩Plano (R³):</strong> dir = n₁×n₂ → recta o paralelos.</p>
        </div>

        <div class="chapter-card">
          <div class="chapter-num">07</div>
          <h3>Producto Vectorial (R³)</h3>
          <div class="formula-box">u×v = (u₂v₃−u₃v₂, u₃v₁−u₁v₃, u₁v₂−u₂v₁)<br/>‖u×v‖ = ‖u‖·‖v‖·|sinθ|</div>
          <p>u×v es perpendicular a u y a v.</p>
          <p><strong>Área paralelogramo:</strong> A = ‖u×v‖</p>
          <p><strong>u×v = 0</strong> ⟺ u ‖ v (paralelos)</p>
        </div>

        <div class="chapter-card">
          <div class="chapter-num">08</div>
          <h3>Aplicaciones Económicas</h3>
          <div class="formula-box">Equilibrio: x* = CF/(p−cv)<br/>Restricción: Σpᵢxᵢ = M</div>
          <p>La restricción presupuestaria es:</p>
          <ul>
            <li>2 bienes → <strong>recta</strong> en el 1er cuadrante</li>
            <li>3 bienes → <strong>plano</strong> en el 1er octante</li>
          </ul>
          <p>Los interceptos son M/pᵢ en cada eje.</p>
        </div>

      </div>
    </div>
  `,

  init() {
    // Static page — no dynamic logic needed
  },
};

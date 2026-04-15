# 🧮 Álgebra CBC — Visualizador Interactivo

Herramienta web para visualizar y resolver ejercicios de Álgebra lineal del CBC.  
Soporta vectores, rectas, planos, intersecciones y aplicaciones económicas en **R² y R³**.

---

## 🚀 Cómo iniciarlo

El proyecto usa **ES Modules nativos**, por lo que necesita un servidor HTTP local  
(no funciona si abrís el `index.html` directo con doble-click).

### Opción 1 — `npx serve` (recomendado, sin instalar nada)

Abrí una terminal en la carpeta del proyecto y ejecutá:

```bash
npx serve . --listen 3030
```

Luego abrí el navegador en:

```
http://localhost:3030
```

### Opción 2 — VS Code con Live Server

1. Instalá la extensión **Live Server** en VS Code
2. Click derecho sobre `index.html` → **"Open with Live Server"**
3. Se abre automáticamente en el browser

### Opción 3 — Python (si ya lo tenés instalado)

```bash
# Python 3
python -m http.server 3030
```

Luego abrí `http://localhost:3030`

---

## 📁 Estructura del proyecto

```
practicas algebra/
│
├── index.html              ← Punto de entrada (shell mínimo)
├── app.js                  ← Orquestador: importa y registra módulos
│
├── styles/
│   ├── base.css            ← Tokens de diseño, reset, tipografía
│   ├── layout.css          ← Sidebar, topbar, grilla de paneles
│   ├── components.css      ← Paneles, inputs, botones, cards
│   └── utilities.css       ← Helpers (.hidden, scrollbars, etc.)
│
├── core/
│   ├── math.js             ← Álgebra pura (norm, dot, cross, solve2x2...)
│   ├── canvas2d.js         ← Helpers de dibujo en canvas 2D
│   ├── plotly3d.js         ← Fábricas de trazas y layouts de Plotly
│   └── router.js           ← Registro de módulos y navegación
│
└── modules/
    ├── vectors.js           ← Vectores u, v, w en R² y R³
    ├── lines2d.js           ← Rectas en R² (4 formas)
    ├── lines3d.js           ← Rectas en R³ + análisis de posición relativa
    ├── planes.js            ← Planos en R³ (3 formas de ingreso)
    ├── intersections.js     ← Intersecciones R∩R, R∩π, π∩π
    ├── metrics.js           ← Norma, distancia, producto punto, ángulo
    ├── economics.js         ← Punto de equilibrio, restricción presupuestaria
    ├── theory.js            ← Guía teórica de todos los temas
    └── exercise_lines.js    ← 🧮 Ejercicio: ingresás N rectas y calcula todo
```

---

## ➕ Cómo agregar un módulo nuevo

1. Creá el archivo `modules/mi-tema.js` exportando el objeto:

```js
export default {
  id:       'mi-tema',      // identificador único
  label:    'Mi Tema',      // nombre en el sidebar
  icon:     '🔢',           // ícono
  section:  'módulos',      // sección del sidebar
  template: () => `...`,    // HTML del panel (string)
  init() { /* lógica */ },  // se llama al navegar al módulo
};
```

2. En `app.js`, agregá dos líneas:

```js
import MiTema from './modules/mi-tema.js';
router.register(MiTema);
```

**Listo.** El sidebar, el panel y la navegación se construyen solos.

---

## 🧮 Módulo de Ejercicios (el más útil)

En el sidebar, sección **EJERCICIOS → 🧮 Ejercicio Rectas**:

1. Ingresás hasta 4 rectas en la forma **Punto + Vector Director**
2. Presionás **▶ Calcular y Visualizar**
3. El sistema calcula automáticamente:
   - Posición relativa de cada par (se cortan / paralelas / alabeadas / coincidentes)
   - Punto de intersección con t y s
   - Procedimiento paso a paso para verificar tu resolución
   - Visualización 3D interactiva de todas las rectas

> **Viene cargado con el Ejercicio 31 del guía como ejemplo.**

---

## 🛠️ Dependencias

- **Plotly.js** (cargado desde CDN) — gráficos 2D y 3D interactivos
- **Google Fonts** (cargado desde CDN) — tipografía Inter + JetBrains Mono
- Sin npm, sin bundler, sin instalación adicional ✅

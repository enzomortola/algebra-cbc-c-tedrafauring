/**
 * core/plotly3d.js
 * Factory functions for Plotly 3D traces and layouts.
 * Centralizes all Plotly config so modules stay clean.
 */

/* ── LAYOUT PRESETS ──────────────────────── */
const AXIS_STYLE = {
  showbackground: true,
  backgroundcolor: '#131626',
  gridcolor: '#252b4a',
  zerolinecolor: '#3a4170',
  tickfont: { color: '#9da4c8', family: 'JetBrains Mono, monospace', size: 10 },
};

/**
 * Build a Plotly 3D scene layout.
 * @param {string} title
 * @param {{x?:string, y?:string, z?:string}} axisLabels
 */
export function layout3D(title = '', axisLabels = {}) {
  return {
    paper_bgcolor: '#0d0f1a',
    plot_bgcolor:  '#0d0f1a',
    font: { color: '#e8eaf6', family: 'Inter, sans-serif' },
    scene: {
      xaxis: { ...AXIS_STYLE, title: { text: axisLabels.x ?? 'X', font: { color: '#9da4c8' } } },
      yaxis: { ...AXIS_STYLE, title: { text: axisLabels.y ?? 'Y', font: { color: '#9da4c8' } } },
      zaxis: { ...AXIS_STYLE, title: { text: axisLabels.z ?? 'Z', font: { color: '#9da4c8' } } },
      bgcolor: '#0d0f1a',
      camera: { eye: { x: 1.4, y: 1.4, z: 1.2 } },
    },
    margin: { l: 0, r: 0, t: 32, b: 0 },
    showlegend: true,
    legend: {
      font: { color: '#9da4c8', size: 11 },
      bgcolor: '#131626',
      bordercolor: '#252b4a',
      borderwidth: 1,
    },
    title: { text: title, font: { color: '#e8eaf6', size: 13 } },
  };
}

/**
 * Plotly 2D scatter layout preset.
 * @param {{ xLabel?:string, yLabel?:string, scaleanchor?: boolean }} opts
 */
export function layout2D(opts = {}) {
  const axis = {
    gridcolor: '#252b4a',
    zerolinecolor: '#3a4170',
    tickfont: { color: '#9da4c8', family: 'JetBrains Mono, monospace', size: 10 },
  };
  return {
    paper_bgcolor: '#0d0f1a',
    plot_bgcolor:  '#131626',
    font: { color: '#e8eaf6', family: 'Inter, sans-serif' },
    xaxis: { ...axis, title: { text: opts.xLabel ?? 'x' } },
    yaxis: { ...axis, title: { text: opts.yLabel ?? 'y' }, ...(opts.scaleanchor ? { scaleanchor: 'x' } : {}) },
    margin: { l: 48, r: 16, t: 28, b: 44 },
    showlegend: true,
    legend: { font: { color: '#9da4c8', size: 11 }, bgcolor: '#131626', bordercolor: '#252b4a', borderwidth: 1 },
  };
}

/* ── TRACE FACTORIES ─────────────────────── */

/**
 * Arrow trace in 3D: a line from `from` to `to`.
 */
export function arrow3D(from, to, color, name) {
  return {
    type: 'scatter3d',
    mode: 'lines+markers+text',
    x: [from[0], to[0]],
    y: [from[1], to[1]],
    z: [from[2] ?? 0, to[2] ?? 0],
    line: { color, width: 5 },
    marker: { size: [3, 8], color: [color, color] },
    text: ['', name],
    textposition: 'top center',
    textfont: { color, size: 12 },
    name,
  };
}

/**
 * Surface trace for a plane ax + by + cz = d over a grid.
 */
export function planeSurface(a, b, c, d, opts = {}) {
  const range = opts.range ?? 4;
  const steps = opts.steps ?? 18;
  const colorscale = opts.colorscale ?? [[0, '#2a1f5e'], [0.5, '#6c63ff'], [1, '#00d4ff']];
  const opacity = opts.opacity ?? 0.6;

  const vals = Array.from({ length: steps + 1 }, (_, i) => -range + 2 * range * i / steps);
  let xs, ys, zs;

  if (Math.abs(c) > 1e-6) {
    xs = []; ys = []; zs = [];
    for (const x of vals) {
      const ry = [], rz = [];
      for (const y of vals) { ry.push(y); rz.push((d - a * x - b * y) / c); }
      xs.push(vals.map(() => x)); ys.push(ry); zs.push(rz);
    }
  } else if (Math.abs(b) > 1e-6) {
    xs = []; ys = []; zs = [];
    for (const x of vals) {
      const ry = [], rz = [];
      for (const z of vals) { ry.push((d - a * x - c * z) / b); rz.push(z); }
      xs.push(vals.map(() => x)); ys.push(ry); zs.push(rz);
    }
  } else {
    const xVal = d / (a || 1e-9);
    xs = vals.map(() => vals.map(() => xVal));
    ys = vals.map(() => [...vals]);
    zs = vals.map(() => [...vals]);
  }

  return { type: 'surface', x: xs, y: ys, z: zs, opacity, colorscale, showscale: false, name: opts.name ?? 'Plano' };
}

/**
 * Line trace in 3D from a parametric definition.
 * @param {number[]} p0  - base point
 * @param {number[]} dir - direction vector
 * @param {number[]} tRange - [tMin, tMax]
 * @param {string}   color
 * @param {string}   name
 */
export function line3D(p0, dir, tRange = [-4, 4], color = '#6c63ff', name = 'Recta') {
  const steps = 40;
  const [tMin, tMax] = tRange;
  const ts = Array.from({ length: steps }, (_, i) => tMin + (tMax - tMin) * i / (steps - 1));
  return {
    type: 'scatter3d',
    mode: 'lines',
    x: ts.map(t => p0[0] + t * dir[0]),
    y: ts.map(t => p0[1] + t * dir[1]),
    z: ts.map(t => p0[2] + t * dir[2]),
    line: { color, width: 5 },
    name,
  };
}

/** Single point marker in 3D */
export function point3D(p, color, name, labelOffset = '') {
  return {
    type: 'scatter3d',
    mode: 'markers+text',
    x: [p[0]], y: [p[1]], z: [p[2]],
    marker: { size: 8, color, symbol: 'circle' },
    text: [name],
    textposition: 'top center',
    textfont: { color, size: 11 },
    name,
  };
}

/** Render to a container element (clears previous plot) */
export function plot3D(containerId, traces, layoutConfig) {
  Plotly.newPlot(containerId, traces, layoutConfig, { responsive: true, displayModeBar: false });
}

export function plot2D(containerId, traces, layoutConfig) {
  Plotly.newPlot(containerId, traces, layoutConfig, { responsive: true, displayModeBar: false });
}

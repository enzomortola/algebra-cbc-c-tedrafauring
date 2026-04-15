/**
 * core/math.js
 * Pure linear algebra helpers — no side effects, no DOM.
 * All functions are exported and fully testable.
 */

/** Euclidean norm of a vector */
export const norm = v => Math.sqrt(v.reduce((acc, x) => acc + x * x, 0));

/** Dot product */
export const dot = (u, v) => u.reduce((acc, x, i) => acc + x * v[i], 0);

/** Element-wise addition */
export const add = (u, v) => u.map((x, i) => x + v[i]);

/** Element-wise subtraction */
export const sub = (u, v) => u.map((x, i) => x - v[i]);

/** Scalar multiplication */
export const scale = (v, lambda) => v.map(x => x * lambda);

/** Cross product (R³ only) */
export const cross = (u, v) => [
  u[1] * v[2] - u[2] * v[1],
  u[2] * v[0] - u[0] * v[2],
  u[0] * v[1] - u[1] * v[0],
];

/** Unit vector (returns zero vector if norm ≈ 0) */
export const unit = v => {
  const n = norm(v);
  return n > 1e-10 ? v.map(x => x / n) : v.map(() => 0);
};

/** Angle between two vectors in degrees */
export const angleDeg = (u, v) => {
  const nu = norm(u), nv = norm(v);
  if (nu < 1e-10 || nv < 1e-10) return null;
  return Math.acos(Math.max(-1, Math.min(1, dot(u, v) / (nu * nv)))) * 180 / Math.PI;
};

/** Round to d decimal places, removing trailing zeros */
export const fmt = (n, d = 3) => parseFloat(n.toFixed(d));

/** Check if two vectors are parallel (collinear) */
export const areParallel = (u, v) => norm(cross(u, v)) < 1e-10;

/** Check if two vectors are orthogonal */
export const areOrthogonal = (u, v) => Math.abs(dot(u, v)) < 1e-10;

/**
 * Solve 2x2 linear system:
 *   a1*x + b1*y = c1
 *   a2*x + b2*y = c2
 * Returns { x, y } or null if singular.
 */
export function solve2x2(a1, b1, c1, a2, b2, c2) {
  const det = a1 * b2 - a2 * b1;
  if (Math.abs(det) < 1e-10) return null;
  return {
    x: (c1 * b2 - c2 * b1) / det,
    y: (a1 * c2 - a2 * c1) / det,
  };
}

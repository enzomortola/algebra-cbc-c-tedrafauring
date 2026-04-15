/**
 * core/canvas2d.js
 * 2D Canvas drawing utilities for the algebra visualizer.
 * All functions take a CanvasRenderingContext2D as first argument.
 */

/**
 * Resize a canvas to match its parent's client size.
 * Returns the canvas, or null if not found.
 */
export function setupCanvas(id) {
  const canvas = document.getElementById(id);
  if (!canvas) return null;
  const parent = canvas.parentElement;
  canvas.width  = parent.clientWidth  || 600;
  canvas.height = parent.clientHeight || 440;
  return canvas;
}

/**
 * Draw a coordinate grid centered at (cx, cy).
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} W  - canvas width
 * @param {number} H  - canvas height
 * @param {number} sc - pixels per unit
 * @param {number} cx - x-pixel of origin
 * @param {number} cy - y-pixel of origin
 */
export function drawGrid(ctx, W, H, sc, cx, cy) {
  // Minor grid lines
  ctx.strokeStyle = '#1a1e35';
  ctx.lineWidth = 1;
  for (let x = cx % sc; x < W; x += sc) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = cy % sc; y < H; y += sc) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }

  // Axes
  ctx.strokeStyle = '#3a4170';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, H); ctx.stroke();

  // Axis labels & tick numbers
  ctx.fillStyle = '#565c7e';
  ctx.font = '10px JetBrains Mono, monospace';
  const stepsX = Math.ceil(W / sc / 2);
  for (let i = -stepsX; i <= stepsX; i++) {
    if (i === 0) continue;
    const px = cx + i * sc;
    if (px > 4 && px < W - 4) ctx.fillText(i, px - 4, cy + 14);
    const py = cy - i * sc;
    if (py > 4 && py < H - 4) ctx.fillText(i, cx + 5, py + 3);
  }

  // Axis name labels
  ctx.fillStyle = '#9da4c8';
  ctx.font = '12px Inter, sans-serif';
  ctx.fillText('x', W - 14, cy - 6);
  ctx.fillText('y', cx + 7,  12);
}

/**
 * Draw an arrow from (x1,y1) to (x2,y2) with an optional text label.
 */
export function drawArrow(ctx, x1, y1, x2, y2, color, label) {
  const headLen = 10;
  const angle = Math.atan2(y2 - y1, x2 - x1);

  ctx.strokeStyle = color;
  ctx.fillStyle   = color;
  ctx.lineWidth   = 2.5;

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  // Arrowhead
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(
    x2 - headLen * Math.cos(angle - Math.PI / 6),
    y2 - headLen * Math.sin(angle - Math.PI / 6)
  );
  ctx.lineTo(
    x2 - headLen * Math.cos(angle + Math.PI / 6),
    y2 - headLen * Math.sin(angle + Math.PI / 6)
  );
  ctx.closePath();
  ctx.fill();

  if (label) {
    ctx.font = 'bold 13px Inter, sans-serif';
    ctx.fillStyle = color;
    ctx.fillText(label, x2 + 8, y2 - 6);
  }
}

/**
 * Draw a dashed line.
 */
export function drawDashed(ctx, x1, y1, x2, y2, color = '#3a4170', dash = [5, 4]) {
  ctx.setLineDash(dash);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.setLineDash([]);
}

/**
 * Draw a filled dot with optional label.
 */
export function drawDot(ctx, x, y, color, label, labelOffX = 8, labelOffY = -8) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2);
  ctx.fill();
  if (label) {
    ctx.font = '11px Inter, sans-serif';
    ctx.fillStyle = color;
    ctx.fillText(label, x + labelOffX, y + labelOffY);
  }
}

/**
 * Fill the canvas with the base background color and draw a grid.
 * Returns the screen-space converter function: [mathX, mathY] → [canvasX, canvasY]
 */
export function initCanvas(ctx, canvas, sc) {
  const W = canvas.width, H = canvas.height;
  const cx = W / 2, cy = H / 2;

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#0d0f1a';
  ctx.fillRect(0, 0, W, H);
  drawGrid(ctx, W, H, sc, cx, cy);

  const toScreen = ([x, y]) => [cx + x * sc, cy - y * sc];
  return { W, H, cx, cy, toScreen };
}

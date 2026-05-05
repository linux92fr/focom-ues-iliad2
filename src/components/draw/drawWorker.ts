export function drawWorker(ctx, x, y, t) {
  ctx.save();
  ctx.translate(x, y);

  ctx.fillStyle = "#1e3a8a";
  ctx.fillRect(-10, -40, 20, 40);

  ctx.beginPath();
  ctx.arc(0, -55, 10, 0, Math.PI * 2);
  ctx.fillStyle = "#f1c27d";
  ctx.fill();

  ctx.restore();
}

export function drawWorker(ctx, x, y, t) {
  ctx.save();
  ctx.translate(x, y);

  // corps
  ctx.fillStyle = "#1e3a8a";
  ctx.fillRect(-10, -40, 20, 40);

  // tête
  ctx.beginPath();
  ctx.arc(0, -55, 10, 0, Math.PI * 2);
  ctx.fillStyle = "#f1c27d";
  ctx.fill();

  // bras animé
  const arm = Math.sin(t * 6) * 0.5;

  ctx.save();
  ctx.translate(10, -30);
  ctx.rotate(arm);

  ctx.fillStyle = "#f1c27d";
  ctx.fillRect(0, 0, 25, 6);

  ctx.fillStyle = "#e5e7eb";
  ctx.fillRect(25, -5, 15, 15);

  ctx.restore();

  ctx.restore();
}

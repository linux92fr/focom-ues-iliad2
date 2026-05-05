export function drawLadder(ctx, x, y) {
  ctx.strokeStyle = "#94a3b8";

  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y - 120);
  ctx.moveTo(x + 40, y);
  ctx.lineTo(x + 40, y - 120);
  ctx.stroke();
}

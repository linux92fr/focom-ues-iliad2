export function drawCampaignFO(ctx, t, canvas) {

  const duration = 8;
  const progress = (t % duration) / duration;

  const enter   = Math.min(progress / 0.2, 1);
  const climb   = Math.min(Math.max((progress - 0.2) / 0.2, 0), 1);
  const posters = Math.min(Math.max((progress - 0.4) / 0.3, 0), 1);
  const reveal  = Math.min(Math.max((progress - 0.7) / 0.3, 0), 1);

  drawWall(ctx, canvas);
  drawPosters(ctx, canvas, posters);
  drawWorkerScene(ctx, canvas, enter, climb);

  if (reveal > 0) {
    drawFinalText(ctx, canvas, reveal);
  }
}

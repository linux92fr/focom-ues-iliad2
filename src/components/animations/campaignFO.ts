import { drawWorker } from "../draw/drawWorker";
import { drawLadder } from "../draw/drawLadder";

export function drawCampaignFO(ctx, t, canvas) {
  const W = canvas.width;
  const H = canvas.height;

  const duration = 8;
  const progress = (t % duration) / duration;

  const enter   = Math.min(progress / 0.2, 1);
  const climb   = Math.min(Math.max((progress - 0.2) / 0.2, 0), 1);
  const posters = Math.min(Math.max((progress - 0.4) / 0.3, 0), 1);
  const reveal  = Math.min(Math.max((progress - 0.7) / 0.3, 0), 1);

  // 🧱 mur
  ctx.fillStyle = "#2b2b2b";
  ctx.fillRect(0, 0, W, H);

  // 🪧 affiches
  drawPosters(ctx, W, H, posters);

  // 👷 ouvrier + escabot
  const baseX = -150 + enter * (W * 0.3);
  const baseY = H * 0.75;
  const workerY = baseY - climb * 100;

  drawLadder(ctx, baseX + 40, baseY);
  drawWorker(ctx, baseX, workerY, t);

  // 🔴 slogan final
  if (reveal > 0) {
    ctx.save();
    ctx.globalAlpha = reveal;

    const scale = 0.8 + 0.3 * reveal;

    ctx.translate(W / 2, H / 2);
    ctx.scale(scale, scale);

    ctx.shadowColor = "#ef4444";
    ctx.shadowBlur = 20;

    ctx.fillStyle = "#ef4444";
    ctx.font = "bold 48px sans-serif";
    ctx.textAlign = "center";

    ctx.fillText("VOTEZ FO COM", 0, 0);

    ctx.restore();
  }
}

function drawPosters(ctx, W, H, progress) {
  const slogans = ["ENSEMBLE", "DÉFENDRE", "NOS DROITS", "FO COM"];

  const cols = 2;
  const rows = 2;

  const w = W / cols;
  const h = H / rows;

  let i = 0;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const appear = i / 4;

      if (progress > appear) {
        const p = (progress - appear) * 4;

        ctx.save();

        ctx.globalAlpha = Math.min(p, 1);

        const scale = 0.7 + 0.3 * p;

        ctx.translate(x * w + w / 2, y * h + h / 2);
        ctx.scale(scale, scale);
        ctx.rotate((1 - p) * 0.2);

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(-w/2+10, -h/2+10, w-20, h-20);

        ctx.fillStyle = "#e11d48";
        ctx.font = "bold 20px sans-serif";
        ctx.textAlign = "center";

        ctx.fillText(slogans[i], 0, 0);

        ctx.restore();
      }

      i++;
    }
  }
}

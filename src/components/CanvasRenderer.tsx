import React, { useRef, useEffect } from "react";
import { drawCampaignFO } from "./animations/campaignFO";

export function CanvasRenderer({ stickers, bgRef, mode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const t0 = useRef(Date.now());

  const draw = (t: number) => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const W = canvas.width;
    const H = canvas.height;

    ctx.clearRect(0, 0, W, H);

    // background
    if (bgRef?.current) {
      ctx.drawImage(bgRef.current, 0, 0, W, H);
    } else {
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(0, 0, W, H);
    }

    // 🎬 mode campagne
    if (mode === "campaignFO") {
      drawCampaignFO(ctx, t, canvas);
    }

    // stickers (optionnel, simple)
    stickers.forEach((s) => {
      const img = new Image();
      img.src = s.src;
      ctx.drawImage(img, s.x, s.y, s.width, s.height);
    });
  };

  useEffect(() => {
    const loop = () => {
      const t = (Date.now() - t0.current) / 1000;
      draw(t);
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [mode, stickers]);

  return (
    <canvas
      ref={canvasRef}
      width={900}
      height={500}
      className="w-full rounded-xl"
    />
  );
}

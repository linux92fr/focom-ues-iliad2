// CanvasRenderer.tsx
export function CanvasRenderer({ stickers, bgRef, mode }) {

  const canvasRef = useRef(null);

  const drawFrame = (t) => {
    const ctx = canvasRef.current.getContext("2d");

    // background
    // ...

    if (mode === "campaignFO") {
      drawCampaignFO(ctx, t);
    }

    // stickers
    // ...
  };

  return <canvas ref={canvasRef} />;
}

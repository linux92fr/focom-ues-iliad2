import { useState, useRef, useEffect, useCallback } from "react";
import {
  Download, RotateCw, RotateCcw, ZoomIn, ZoomOut,
  Trash2, Image as ImageIcon, Layers, Move, FlipHorizontal,
  X, Plus, Play, Square, Zap, Check, Send, Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CanvasRenderer } from "./CanvasRenderer";

const [mode, setMode] = useState<"normal" | "campaignFO">("normal");

const LOGO_FO = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663612648040/LldXxCbhFdcPcHwX.png";

// ── Types ──────────────────────────────────────────────────────────────────────
type AnimType = "none" | "pulse" | "bounce" | "rotate" | "shake" | "flicker" | "wave";

interface Sticker {
  id: string;
  src: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  flipH: boolean;
  opacity: number;
  anim: AnimType;
  animSpeed: number;
}

const ANIM_LABELS: Record<AnimType, string> = {
  none:    "Aucune",
  pulse:   "💓 Pulsation",
  bounce:  "⬆️ Rebond",
  rotate:  "🔄 Rotation",
  shake:   "📳 Vibration",
  flicker: "✨ Scintillement",
  wave:    "🌊 Vague",
};

const PRESET_STICKERS = [
  { src: LOGO_FO, label: "Logo FO COM" },
  { src: "/fo-militants.png", label: "Militants FO" },
];

function uid() { return Math.random().toString(36).slice(2); }

// ── Calcul offsets d'animation ─────────────────────────────────────────────────
function getAnimOffset(s: Sticker, t: number) {
  const f = t * s.animSpeed;
  switch (s.anim) {
    case "pulse":   return { dx: 0, dy: 0, scale: 1 + 0.08 * Math.sin(f * 3), rot: 0, alpha: 1 };
    case "bounce":  return { dx: 0, dy: -Math.abs(Math.sin(f * 3)) * 20, scale: 1, rot: 0, alpha: 1 };
    case "rotate":  return { dx: 0, dy: 0, scale: 1, rot: f * 60, alpha: 1 };
    case "shake":   return { dx: Math.sin(f * 12) * 6, dy: 0, scale: 1, rot: Math.sin(f * 12) * 3, alpha: 1 };
    case "flicker": return { dx: 0, dy: 0, scale: 1, rot: 0, alpha: 0.4 + 0.6 * Math.abs(Math.sin(f * 8)) };
    case "wave":    return { dx: Math.sin(f * 2) * 12, dy: Math.cos(f * 2) * 6, scale: 1, rot: Math.sin(f * 2) * 5, alpha: 1 };
    default:        return { dx: 0, dy: 0, scale: 1, rot: 0, alpha: 1 };
  }
}

// ── Composant principal ────────────────────────────────────────────────────────
interface PosterComposerProps {
  onPublish?: (dataUrl: string) => void;
}

export default function PosterComposer({ onPublish }: PosterComposerProps) {
  const canvasRef      = useRef<HTMLCanvasElement>(null);
  const bgRef          = useRef<HTMLImageElement | null>(null);
  const stickerImgs    = useRef<Record<string, HTMLImageElement>>({});
  const rafRef         = useRef<number>(0);
  const t0Ref          = useRef<number>(Date.now());
  const mrRef          = useRef<MediaRecorder | null>(null);
  const chunksRef      = useRef<BlobPart[]>([]);

  const [bgSrc, setBgSrc]         = useState<string | null>(null);
  const [stickers, setStickers]   = useState<Sticker[]>([]);
  const [selected, setSelected]   = useState<string | null>(null);
  const [dragging, setDragging]   = useState<{ id: string; ox: number; oy: number } | null>(null);
  const [canvasSize, setCanvasSize] = useState({ w: 800, h: 500 });
  const [isAnimating, setIsAnim]  = useState(false);
  const [isRecording, setIsRec]   = useState(false);
  const [recSec, setRecSec]       = useState(0);
  const [published, setPublished] = useState(false);

  const sel   = stickers.find(s => s.id === selected) ?? null;
  const hasAn = stickers.some(s => s.anim !== "none");

  // ── Dessin ────────────────────────────────────────────────────────────────────
  const drawFrame = useCallback((animated: boolean) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const t = animated ? (Date.now() - t0Ref.current) / 1000 : 0;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (bgRef.current) {
      ctx.drawImage(bgRef.current, 0, 0, canvas.width, canvas.height);
    } else {
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#475569";
      ctx.font = "18px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Importez une photo de fond", canvas.width / 2, canvas.height / 2);
    }

    for (const s of stickers) {
      const img = stickerImgs.current[s.id];
      if (!img) continue;
      const o = animated ? getAnimOffset(s, t) : { dx: 0, dy: 0, scale: 1, rot: 0, alpha: 1 };
      ctx.save();
      ctx.globalAlpha = s.opacity * o.alpha;
      ctx.translate(s.x + s.width / 2 + o.dx, s.y + s.height / 2 + o.dy);
      ctx.rotate(((s.rotation + o.rot) * Math.PI) / 180);
      ctx.scale(o.scale * (s.flipH ? -1 : 1), o.scale);
      ctx.drawImage(img, -s.width / 2, -s.height / 2, s.width, s.height);
      ctx.restore();

      if (s.id === selected && !animated) {
        ctx.save();
        ctx.translate(s.x + s.width / 2, s.y + s.height / 2);
        ctx.rotate((s.rotation * Math.PI) / 180);
        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 3]);
        ctx.strokeRect(-s.width / 2 - 4, -s.height / 2 - 4, s.width + 8, s.height + 8);
        ctx.restore();
      }
    }
  }, [stickers, selected]);

  // ── Boucle RAF ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isAnimating) {
      const loop = () => { drawFrame(true); rafRef.current = requestAnimationFrame(loop); };
      rafRef.current = requestAnimationFrame(loop);
      return () => cancelAnimationFrame(rafRef.current);
    } else {
      drawFrame(false);
    }
  }, [isAnimating, drawFrame]);

  useEffect(() => { if (!isAnimating) drawFrame(false); }, [stickers, selected, bgSrc, canvasSize, isAnimating, drawFrame]);

  // ── Contrôle animation ────────────────────────────────────────────────────────
  const startAnim = () => { t0Ref.current = Date.now(); setSelected(null); setIsAnim(true); };
  const stopAnim  = () => { setIsAnim(false); if (isRecording) stopRec(); };

  // ── Enregistrement vidéo ──────────────────────────────────────────────────────
  const startRec = () => {
    const canvas = canvasRef.current!;
    if (!isAnimating) startAnim();
    const stream = canvas.captureStream(30);
    const mr = new MediaRecorder(stream, { mimeType: "video/webm;codecs=vp9" });
    chunksRef.current = [];
    mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    mr.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "focom-animation.webm";
      a.click();
      toast.success("Vidéo exportée !");
    };
    mr.start();
    mrRef.current = mr;
    setIsRec(true);
    setRecSec(0);
  };

  const stopRec = () => { mrRef.current?.stop(); setIsRec(false); };

  useEffect(() => {
    if (!isRecording) return;
    const id = setInterval(() => setRecSec(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [isRecording]);

  // ── Fond ──────────────────────────────────────────────────────────────────────
  const loadBg = (file: File) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      bgRef.current = img;
      const maxW = Math.min(900, img.width);
      setCanvasSize({ w: maxW, h: Math.round(img.height * (maxW / img.width)) });
      setBgSrc(url);
    };
    img.src = url;
  };

  // ── Sticker ───────────────────────────────────────────────────────────────────
  const addSticker = useCallback((src: string, label: string) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const id = uid();
      stickerImgs.current[id] = img;
      const w = Math.min(200, canvasSize.w / 3);
      const h = (img.height / img.width) * w;
      setStickers(prev => [...prev, { id, src, label, x: canvasSize.w / 2 - w / 2, y: canvasSize.h / 2 - h / 2, width: w, height: h, rotation: 0, flipH: false, opacity: 1, anim: "none", animSpeed: 1 }]);
      setSelected(id);
    };
    img.src = src;
  }, [canvasSize]);

  // ── Drag ──────────────────────────────────────────────────────────────────────
  const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const r = canvasRef.current!.getBoundingClientRect();
    return { x: (e.clientX - r.left) * (canvasSize.w / r.width), y: (e.clientY - r.top) * (canvasSize.h / r.height) };
  };
  const hitTest = (x: number, y: number) => {
    for (let i = stickers.length - 1; i >= 0; i--) {
      const s = stickers[i];
      if (x >= s.x && x <= s.x + s.width && y >= s.y && y <= s.y + s.height) return s.id;
    }
    return null;
  };
  const onMD = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isAnimating) return;
    const { x, y } = getPos(e);
    const hit = hitTest(x, y);
    setSelected(hit);
    if (hit) { const s = stickers.find(s => s.id === hit)!; setDragging({ id: hit, ox: x - s.x, oy: y - s.y }); }
  };
  const onMM = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!dragging) return;
    const { x, y } = getPos(e);
    setStickers(prev => prev.map(s => s.id === dragging.id ? { ...s, x: x - dragging.ox, y: y - dragging.oy } : s));
  };

  const upd = (patch: Partial<Sticker>) => setStickers(prev => prev.map(s => s.id === selected ? { ...s, ...patch } : s));

  // ── Export PNG ────────────────────────────────────────────────────────────────
  const exportPng = () => {
    const wasAnim = isAnimating;
    if (wasAnim) setIsAnim(false);
    setSelected(null);
    setTimeout(() => {
      drawFrame(false);
      const a = document.createElement("a");
      a.download = "focom-affiche.png";
      a.href = canvasRef.current!.toDataURL("image/png");
      a.click();
      toast.success("Image exportée !");
      if (wasAnim) startAnim();
    }, 80);
  };

  // ── Publier ───────────────────────────────────────────────────────────────────
  const handlePublish = () => {
    const wasAnim = isAnimating;
    if (wasAnim) setIsAnim(false);
    setSelected(null);
    setTimeout(() => {
      drawFrame(false);
      const dataUrl = canvasRef.current!.toDataURL("image/jpeg", 0.92);
      if (onPublish) onPublish(dataUrl);
      toast.success("Composition validée et publiée !");
      setPublished(true);
      setTimeout(() => setPublished(false), 3000);
      if (wasAnim) startAnim();
    }, 80);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4">
      <div className="max-w-5xl mx-auto space-y-4">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Layers className="w-5 h-5 text-red-400" />Compositeur d'affiches
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">Composez · Animez · Publiez</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {!isAnimating ? (
              <Button onClick={startAnim} disabled={!hasAn} variant="outline" className="gap-2 border-purple-600 text-purple-400 hover:bg-purple-900/30 disabled:opacity-40">
                <Play className="w-4 h-4" />Animer
              </Button>
            ) : (
              <Button onClick={stopAnim} variant="outline" className="gap-2 border-amber-500 text-amber-400 hover:bg-amber-900/30">
                <Square className="w-4 h-4" />Arrêter
              </Button>
      <Button onClick={() => setMode("campaignFO")}>
  🎬 Mode campagne
</Button>
            )}
            {isAnimating && !isRecording && (
              <Button onClick={startRec} variant="outline" className="gap-2 border-red-600 text-red-400 hover:bg-red-900/30">
                <Video className="w-4 h-4" />Enregistrer
              </Button>
            )}
            {isRecording && (
              <Button onClick={stopRec} className="gap-2 bg-red-600 hover:bg-red-700 animate-pulse">
                <Square className="w-4 h-4" />{recSec}s — Stop
              </Button>
            )}
            <Button onClick={exportPng} variant="outline" className="gap-2 border-teal-600 text-teal-400 hover:bg-teal-900/30">
              <Download className="w-4 h-4" />PNG
            </Button>
            <Button onClick={handlePublish} className={`gap-2 transition-all ${published ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}>
              {published ? <><Check className="w-4 h-4" />Validé !</> : <><Send className="w-4 h-4" />Valider & Publier</>}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Canvas */}
          <div className="lg:col-span-3 space-y-2">
            <div className="rounded-xl overflow-hidden border border-slate-700 shadow-2xl">
  <CanvasRenderer
    stickers={stickers}
    bgRef={bgRef}
    mode={mode}
  />
</div>
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>{stickers.length} élément{stickers.length > 1 ? "s" : ""}</span>
              {isAnimating && (
                <span className="flex items-center gap-1.5 text-purple-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse inline-block" />
                  Animation{isRecording && <span className="text-red-400 ml-2">● REC {recSec}s</span>}
                </span>
              )}
              <label className="cursor-pointer hover:text-white flex items-center gap-1.5 transition-colors">
                <ImageIcon className="w-3.5 h-3.5" />{bgSrc ? "Changer fond" : "Importer fond"}
                <input type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) loadBg(e.target.files[0]); }} />
              </label>
            </div>
          </div>

          {/* Panneau */}
          <div className="space-y-3">
            {/* Affiches prédéfinies */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-3 space-y-2">
              <p className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Affiches</p>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_STICKERS.map(ps => (
                  <button key={ps.src} onClick={() => addSticker(ps.src, ps.label)}
                    className="flex flex-col items-center gap-1 p-2 rounded-lg bg-slate-700 hover:bg-slate-600 border border-slate-600 hover:border-red-500 transition-all">
                    <img src={ps.src} alt={ps.label} className="w-10 h-10 object-contain" />
                    <span className="text-[10px] text-slate-300 text-center">{ps.label}</span>
                  </button>
                ))}
              </div>
              <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 border border-dashed border-slate-500 hover:border-teal-500 cursor-pointer transition-colors text-xs text-slate-300">
                <Plus className="w-3.5 h-3.5 text-teal-400" />Importer une affiche
                <input type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) addSticker(URL.createObjectURL(e.target.files[0]), e.target.files[0].name); }} />
              </label>
            </div>

            {/* Contrôles */}
            {sel && !isAnimating ? (
              <div className="bg-slate-800 rounded-xl border border-red-800/50 p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-red-400 uppercase tracking-wide truncate flex-1">{sel.label.slice(0, 16)}</p>
                  <button onClick={() => { setStickers(p => p.filter(s => s.id !== selected)); setSelected(null); }} className="p-1 rounded hover:bg-red-900/40 text-slate-400 hover:text-red-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Taille */}
                <div className="space-y-1">
                  <Label className="text-xs text-slate-400">Taille</Label>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => upd({ width: sel.width * 0.9, height: sel.height * 0.9 })} className="p-1.5 rounded bg-slate-700 hover:bg-slate-600"><ZoomOut className="w-3 h-3" /></button>
                    <Slider min={20} max={canvasSize.w * 0.9} value={[sel.width]} onValueChange={([v]) => upd({ width: v, height: v * (sel.height / sel.width) })} className="flex-1" />
                    <button onClick={() => upd({ width: sel.width * 1.1, height: sel.height * 1.1 })} className="p-1.5 rounded bg-slate-700 hover:bg-slate-600"><ZoomIn className="w-3 h-3" /></button>
                  </div>
                </div>

                {/* Rotation */}
                <div className="space-y-1">
                  <Label className="text-xs text-slate-400">Rotation {sel.rotation}°</Label>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => upd({ rotation: sel.rotation - 15 })} className="p-1.5 rounded bg-slate-700 hover:bg-slate-600"><RotateCcw className="w-3 h-3" /></button>
                    <Slider min={-180} max={180} value={[sel.rotation]} onValueChange={([v]) => upd({ rotation: v })} className="flex-1" />
                    <button onClick={() => upd({ rotation: sel.rotation + 15 })} className="p-1.5 rounded bg-slate-700 hover:bg-slate-600"><RotateCw className="w-3 h-3" /></button>
                  </div>
                </div>

                {/* Opacité */}
                <div className="space-y-1">
                  <Label className="text-xs text-slate-400">Opacité {Math.round(sel.opacity * 100)}%</Label>
                  <Slider min={10} max={100} value={[sel.opacity * 100]} onValueChange={([v]) => upd({ opacity: v / 100 })} />
                </div>

                {/* Flip */}
                <button onClick={() => upd({ flipH: !sel.flipH })}
                  className={`w-full flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs border transition-colors ${sel.flipH ? "bg-teal-900/40 border-teal-600 text-teal-300" : "bg-slate-700 border-slate-600 text-slate-300"}`}>
                  <FlipHorizontal className="w-3.5 h-3.5" />Miroir horizontal
                </button>

                {/* Animation */}
                <div className="pt-2 border-t border-slate-700 space-y-2">
                  <p className="text-xs font-semibold text-purple-400 uppercase tracking-wide flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />Animation
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(Object.keys(ANIM_LABELS) as AnimType[]).map(a => (
                      <button key={a} onClick={() => upd({ anim: a })}
                        className={`px-2 py-1.5 rounded-lg text-[11px] font-medium border transition-all ${sel.anim === a ? "bg-purple-700 border-purple-500 text-white" : "bg-slate-700 border-slate-600 text-slate-300 hover:border-purple-500"}`}>
                        {ANIM_LABELS[a]}
                      </button>
                    ))}
                  </div>
                  {sel.anim !== "none" && (
                    <div className="space-y-1">
                      <Label className="text-xs text-slate-400">Vitesse ×{sel.animSpeed.toFixed(1)}</Label>
                      <Slider min={2} max={30} step={1} value={[sel.animSpeed * 10]} onValueChange={([v]) => upd({ animSpeed: v / 10 })} />
                    </div>
                  )}
                </div>

                <button onClick={() => upd({ rotation: 0, flipH: false, opacity: 1, anim: "none", animSpeed: 1 })}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white bg-slate-700 hover:bg-slate-600 border border-slate-600 transition-colors">
                  <X className="w-3.5 h-3.5" />Réinitialiser
                </button>
              </div>
            ) : sel && isAnimating ? (
              <div className="bg-slate-800 rounded-xl border border-purple-700/40 p-3 text-center">
                <p className="text-xs text-purple-400">Arrêtez l'animation pour modifier</p>
              </div>
            ) : (
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 text-center">
                <Move className="w-6 h-6 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-500">Cliquez sur une affiche pour la modifier</p>
              </div>
            )}

            {/* Calques */}
            {stickers.length > 0 && (
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-3 space-y-1.5">
                <p className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Calques</p>
                {[...stickers].reverse().map(s => (
                  <button key={s.id} onClick={() => { if (!isAnimating) setSelected(s.id); }}
                    className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs transition-colors ${s.id === selected && !isAnimating ? "bg-red-900/40 border border-red-700/60 text-white" : "bg-slate-700 border border-transparent text-slate-300 hover:bg-slate-600"}`}>
                    <img src={s.src} alt={s.label} className="w-5 h-5 object-contain flex-shrink-0" />
                    <span className="truncate flex-1">{s.label}</span>
                    {s.anim !== "none" && <Zap className="w-3 h-3 text-purple-400 flex-shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-500 text-center pb-4">
          💡 <strong className="text-purple-400">Animer</strong> pour prévisualiser ·{" "}
          <strong className="text-red-400">Enregistrer</strong> pour exporter en vidéo WebM ·{" "}
          <strong className="text-teal-400">PNG</strong> pour une image fixe ·{" "}
          <strong className="text-white">Valider & Publier</strong> pour intégrer au site
        </p>
      </div>
    </div>
  );
}

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Upload, Download, RotateCw, RotateCcw, ZoomIn, ZoomOut,
  Trash2, Image as ImageIcon, Layers, Move, FlipHorizontal,
  Check, X, Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const LOGO_FO = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663612648040/LldXxCbhFdcPcHwX.png";

// ── Types ──────────────────────────────────────────────────────────────────────
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
}

// ── Stickers prédéfinis FOCOM ──────────────────────────────────────────────────
const PRESET_STICKERS = [
  { src: LOGO_FO, label: "Logo FO COM" },
  { src: "/fo-militants.png", label: "Militants FO" },
];

// ── Helpers ────────────────────────────────────────────────────────────────────
function uid() { return Math.random().toString(36).slice(2); }

// ── Composant principal ────────────────────────────────────────────────────────
export default function PosterComposer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bgRef = useRef<HTMLImageElement | null>(null);
  const stickerImgsRef = useRef<Record<string, HTMLImageElement>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  const [bgSrc, setBgSrc] = useState<string | null>(null);
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [dragging, setDragging] = useState<{ id: string; ox: number; oy: number } | null>(null);
  const [canvasSize, setCanvasSize] = useState({ w: 800, h: 500 });

  const selectedSticker = stickers.find(s => s.id === selected) ?? null;

  // ── Charger image de fond ────────────────────────────────────────────────────
  const loadBg = (file: File) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      bgRef.current = img;
      // Redimensionner le canvas proportionnellement (max 900px)
      const maxW = Math.min(900, img.width);
      const scale = maxW / img.width;
      setCanvasSize({ w: maxW, h: Math.round(img.height * scale) });
      setBgSrc(url);
    };
    img.src = url;
  };

  // ── Ajouter un sticker ───────────────────────────────────────────────────────
  const addSticker = useCallback((src: string, label: string) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const id = uid();
      stickerImgsRef.current[id] = img;
      const w = Math.min(200, canvasSize.w / 3);
      const h = (img.height / img.width) * w;
      setStickers(prev => [...prev, {
        id, src, label,
        x: canvasSize.w / 2 - w / 2,
        y: canvasSize.h / 2 - h / 2,
        width: w, height: h,
        rotation: 0, flipH: false, opacity: 1,
      }]);
      setSelected(id);
    };
    img.src = src;
  }, [canvasSize]);

  const addCustomSticker = (file: File) => {
    const url = URL.createObjectURL(file);
    addSticker(url, file.name);
  };

  // ── Redessiner le canvas ─────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Fond
    if (bgRef.current) {
      ctx.drawImage(bgRef.current, 0, 0, canvas.width, canvas.height);
    } else {
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#334155";
      ctx.font = "20px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Importez une photo de fond", canvas.width / 2, canvas.height / 2);
    }

    // Stickers
    for (const s of stickers) {
      const img = stickerImgsRef.current[s.id];
      if (!img) continue;

      ctx.save();
      ctx.globalAlpha = s.opacity;
      ctx.translate(s.x + s.width / 2, s.y + s.height / 2);
      ctx.rotate((s.rotation * Math.PI) / 180);
      if (s.flipH) ctx.scale(-1, 1);
      ctx.drawImage(img, -s.width / 2, -s.height / 2, s.width, s.height);
      ctx.restore();

      // Contour si sélectionné
      if (s.id === selected) {
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
  }, [stickers, selected, canvasSize, bgSrc]);

  // ── Drag sur canvas ──────────────────────────────────────────────────────────
  const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const scaleX = canvasSize.w / rect.width;
    const scaleY = canvasSize.h / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const hitTest = (x: number, y: number): string | null => {
    for (let i = stickers.length - 1; i >= 0; i--) {
      const s = stickers[i];
      if (x >= s.x && x <= s.x + s.width && y >= s.y && y <= s.y + s.height) {
        return s.id;
      }
    }
    return null;
  };

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getPos(e);
    const hit = hitTest(x, y);
    setSelected(hit);
    if (hit) {
      const s = stickers.find(s => s.id === hit)!;
      setDragging({ id: hit, ox: x - s.x, oy: y - s.y });
    }
  };

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!dragging) return;
    const { x, y } = getPos(e);
    setStickers(prev => prev.map(s =>
      s.id === dragging.id
        ? { ...s, x: x - dragging.ox, y: y - dragging.oy }
        : s
    ));
  };

  const onMouseUp = () => setDragging(null);

  // ── Contrôles sticker sélectionné ────────────────────────────────────────────
  const updateSelected = (patch: Partial<Sticker>) => {
    setStickers(prev => prev.map(s => s.id === selected ? { ...s, ...patch } : s));
  };

  const deleteSelected = () => {
    setStickers(prev => prev.filter(s => s.id !== selected));
    setSelected(null);
  };

  // ── Export ────────────────────────────────────────────────────────────────────
  const exportImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setSelected(null); // retirer le contour rouge

    setTimeout(() => {
      const link = document.createElement("a");
      link.download = "focom-composition.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("Image téléchargée !");
    }, 100);
  };

  // ── Touch support (mobile) ───────────────────────────────────────────────────
  const onTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const t = e.touches[0];
    const rect = canvasRef.current!.getBoundingClientRect();
    const scaleX = canvasSize.w / rect.width;
    const scaleY = canvasSize.h / rect.height;
    const x = (t.clientX - rect.left) * scaleX;
    const y = (t.clientY - rect.top) * scaleY;
    const hit = hitTest(x, y);
    setSelected(hit);
    if (hit) {
      const s = stickers.find(s => s.id === hit)!;
      setDragging({ id: hit, ox: x - s.x, oy: y - s.y });
    }
  };

  const onTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!dragging) return;
    const t = e.touches[0];
    const rect = canvasRef.current!.getBoundingClientRect();
    const scaleX = canvasSize.w / rect.width;
    const scaleY = canvasSize.h / rect.height;
    const x = (t.clientX - rect.left) * scaleX;
    const y = (t.clientY - rect.top) * scaleY;
    setStickers(prev => prev.map(s =>
      s.id === dragging.id ? { ...s, x: x - dragging.ox, y: y - dragging.oy } : s
    ));
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4">
      <div className="max-w-5xl mx-auto space-y-4">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-red-400" />
              Compositeur d'affiches
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">Glissez vos affiches sur la photo, puis exportez</p>
          </div>
          <Button onClick={exportImage} className="bg-red-600 hover:bg-red-700 gap-2">
            <Download className="w-4 h-4" />Exporter
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">

          {/* ── Canvas ──────────────────────────────────────────────────── */}
          <div className="lg:col-span-3" ref={containerRef}>
            <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-800 shadow-2xl">
              <canvas
                ref={canvasRef}
                width={canvasSize.w}
                height={canvasSize.h}
                className="w-full cursor-crosshair touch-none"
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseUp}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={() => setDragging(null)}
              />
            </div>

            {/* ── Import fond ──────────────────────────────────────────── */}
            <label className="mt-3 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-600 hover:border-slate-400 cursor-pointer transition-colors text-sm text-slate-300 hover:text-white">
              <ImageIcon className="w-4 h-4 text-teal-400" />
              {bgSrc ? "Changer la photo de fond" : "📷 Importer une photo de fond"}
              <input type="file" accept="image/*" className="hidden"
                onChange={e => { if (e.target.files?.[0]) loadBg(e.target.files[0]); }}
              />
            </label>
          </div>

          {/* ── Panneau latéral ─────────────────────────────────────────── */}
          <div className="space-y-4">

            {/* Affiches prédéfinies */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 space-y-3">
              <p className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Affiches FOCOM</p>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_STICKERS.map(ps => (
                  <button
                    key={ps.src}
                    onClick={() => addSticker(ps.src, ps.label)}
                    className="flex flex-col items-center gap-1.5 p-2 rounded-lg bg-slate-700 hover:bg-slate-600 border border-slate-600 hover:border-red-500 transition-all"
                  >
                    <img src={ps.src} alt={ps.label} className="w-10 h-10 object-contain" />
                    <span className="text-[10px] text-slate-300 text-center leading-tight">{ps.label}</span>
                  </button>
                ))}
              </div>

              {/* Affiche personnalisée */}
              <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 border border-dashed border-slate-500 hover:border-teal-500 cursor-pointer transition-colors text-xs text-slate-300 hover:text-white">
                <Plus className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                Importer une affiche
                <input type="file" accept="image/*" className="hidden"
                  onChange={e => { if (e.target.files?.[0]) addCustomSticker(e.target.files[0]); }}
                />
              </label>
            </div>

            {/* Contrôles sticker sélectionné */}
            {selectedSticker ? (
              <div className="bg-slate-800 rounded-xl border border-red-800/50 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-red-400 uppercase tracking-wide flex items-center gap-1.5">
                    <Move className="w-3.5 h-3.5" />
                    {selectedSticker.label.slice(0, 18)}
                  </p>
                  <button onClick={deleteSelected} className="p-1.5 rounded-lg hover:bg-red-900/40 text-slate-400 hover:text-red-400 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Taille */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-400">Taille</Label>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateSelected({ width: selectedSticker.width * 0.9, height: selectedSticker.height * 0.9 })}
                      className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors">
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <Slider
                      min={20} max={canvasSize.w * 0.9}
                      value={[selectedSticker.width]}
                      onValueChange={([v]) => {
                        const ratio = selectedSticker.height / selectedSticker.width;
                        updateSelected({ width: v, height: v * ratio });
                      }}
                      className="flex-1"
                    />
                    <button onClick={() => updateSelected({ width: selectedSticker.width * 1.1, height: selectedSticker.height * 1.1 })}
                      className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors">
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Rotation */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-400">Rotation : {selectedSticker.rotation}°</Label>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateSelected({ rotation: selectedSticker.rotation - 15 })}
                      className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors">
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                    <Slider
                      min={-180} max={180}
                      value={[selectedSticker.rotation]}
                      onValueChange={([v]) => updateSelected({ rotation: v })}
                      className="flex-1"
                    />
                    <button onClick={() => updateSelected({ rotation: selectedSticker.rotation + 15 })}
                      className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors">
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Opacité */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-400">Opacité : {Math.round(selectedSticker.opacity * 100)}%</Label>
                  <Slider
                    min={10} max={100}
                    value={[selectedSticker.opacity * 100]}
                    onValueChange={([v]) => updateSelected({ opacity: v / 100 })}
                  />
                </div>

                {/* Flip */}
                <button
                  onClick={() => updateSelected({ flipH: !selectedSticker.flipH })}
                  className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium border transition-colors ${
                    selectedSticker.flipH
                      ? "bg-teal-900/40 border-teal-600 text-teal-300"
                      : "bg-slate-700 border-slate-600 text-slate-300 hover:border-slate-400"
                  }`}
                >
                  <FlipHorizontal className="w-3.5 h-3.5" />
                  Miroir horizontal {selectedSticker.flipH ? <Check className="w-3 h-3" /> : null}
                </button>

                {/* Remettre à zéro */}
                <button
                  onClick={() => updateSelected({ rotation: 0, flipH: false, opacity: 1 })}
                  className="w-full flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white bg-slate-700 hover:bg-slate-600 border border-slate-600 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />Réinitialiser
                </button>
              </div>
            ) : (
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 text-center">
                <Move className="w-6 h-6 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-500">Cliquez sur une affiche pour la modifier</p>
              </div>
            )}

            {/* Calques */}
            {stickers.length > 0 && (
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 space-y-2">
                <p className="text-xs font-semibold text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />Calques ({stickers.length})
                </p>
                {[...stickers].reverse().map(s => (
                  <button
                    key={s.id}
                    onClick={() => setSelected(s.id)}
                    className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs transition-colors ${
                      s.id === selected
                        ? "bg-red-900/40 border border-red-700/60 text-white"
                        : "bg-slate-700 border border-transparent text-slate-300 hover:bg-slate-600"
                    }`}
                  >
                    <img src={s.src} alt={s.label} className="w-6 h-6 object-contain flex-shrink-0" />
                    <span className="truncate">{s.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

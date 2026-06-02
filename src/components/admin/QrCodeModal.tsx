import { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Printer, Share2 } from "lucide-react";
import logoFocom from "@/assets/logo-focom.png";

const FIL_URL = "https://focomues-iliad.fr/fil";

interface QrCodeModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export default function QrCodeModal({ open, onOpenChange }: QrCodeModalProps) {
  const svgRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    const svg = svgRef.current?.querySelector("svg");
    if (!svg) return;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);
    const img = new Image();
    const blob = new Blob([svgStr], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const size = 512;
      canvas.width = size;
      canvas.height = size + 60;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, size, size);
      ctx.fillStyle = "#1e293b";
      ctx.font = "bold 18px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Scannez pour accéder aux actualités FO COM", size / 2, size + 30);
      ctx.fillStyle = "#64748b";
      ctx.font = "14px sans-serif";
      ctx.fillText(FIL_URL, size / 2, size + 52);
      const a = document.createElement("a");
      a.download = "qr-focom-fil-actualites.png";
      a.href = canvas.toDataURL("image/png");
      a.click();
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const handlePrint = () => {
    const win = window.open("", "_blank");
    if (!win) return;
    const svg = svgRef.current?.querySelector("svg");
    if (!svg) return;
    const svgStr = new XMLSerializer().serializeToString(svg);
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>QR Code — Fil d'actualités FO COM</title>
        <style>
          body { margin: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; font-family: sans-serif; background: white; }
          img { width: 280px; height: 280px; }
          h2 { font-size: 18px; color: #1e293b; margin: 16px 0 4px; text-align: center; }
          p { font-size: 13px; color: #64748b; margin: 0; text-align: center; }
          .url { font-size: 12px; color: #94a3b8; margin-top: 8px; }
        </style>
      </head>
      <body>
        <img src="data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgStr)))}" />
        <h2>Scannez pour accéder aux actualités FO COM</h2>
        <p>Tracts, articles et informations syndicales en temps réel</p>
        <p class="url">${FIL_URL}</p>
      </body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 500);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: "Fil d'actualités FO COM", url: FIL_URL });
    } else {
      await navigator.clipboard.writeText(FIL_URL);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-900">
            QR Code — Fil d'actualités
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-2">
          <p className="text-xs text-slate-500 text-center">
            Ce QR code pointe vers le fil d'actualités mobile. Imprimez-le une fois, le contenu se met à jour automatiquement.
          </p>

          <div
            ref={svgRef}
            className="rounded-2xl border-4 border-slate-100 p-3 bg-white shadow-sm"
          >
            <QRCodeSVG
              value={FIL_URL}
              size={220}
              bgColor="#ffffff"
              fgColor="#1e293b"
              level="H"
              imageSettings={{
                src: logoFocom,
                width: 52,
                height: 52,
                excavate: true,
              }}
            />
          </div>

          <p className="text-[11px] text-slate-400 font-mono break-all text-center">{FIL_URL}</p>

          <div className="flex gap-2 w-full">
            <Button onClick={handleDownload} className="flex-1 bg-red-600 hover:bg-red-700 text-white gap-2" size="sm">
              <Download className="w-4 h-4" /> PNG
            </Button>
            <Button onClick={handlePrint} variant="outline" className="flex-1 gap-2" size="sm">
              <Printer className="w-4 h-4" /> Imprimer
            </Button>
            <Button onClick={handleShare} variant="outline" size="sm" className="gap-2">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

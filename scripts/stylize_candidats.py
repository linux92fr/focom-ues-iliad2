from pathlib import Path
from PIL import Image, ImageFilter, ImageOps, ImageEnhance, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
TARGETS = [
    ROOT / "public/candidats/dbrou.png",
    ROOT / "public/candidats/mzerarka.png",
    ROOT / "public/candidats/nysidibe.jpg",
]

BG = (188, 190, 190)
NAVY = (10, 18, 36)
RED = (198, 18, 24)
WHITE = (255, 255, 255)
BLACK = (22, 22, 22)


def cover_square(img: Image.Image, size: int = 1080) -> Image.Image:
    img = ImageOps.exif_transpose(img).convert("RGBA")
    w, h = img.size
    scale = size / min(w, h)
    resized = img.resize((round(w * scale), round(h * scale)), Image.Resampling.LANCZOS)
    left = (resized.width - size) // 2
    top = max(0, (resized.height - size) // 2)
    return resized.crop((left, top, left + size, top + size))


def cartoonize(img: Image.Image) -> Image.Image:
    base = cover_square(img)
    bg = Image.new("RGBA", base.size, BG + (255,))
    bg.alpha_composite(base)
    rgb = bg.convert("RGB")

    # Effet portrait illustré : couleurs lissées/postérisées + contours sombres.
    smooth = rgb.filter(ImageFilter.MedianFilter(5))
    smooth = smooth.filter(ImageFilter.SMOOTH_MORE).filter(ImageFilter.SMOOTH_MORE)
    smooth = ImageEnhance.Color(smooth).enhance(1.25)
    smooth = ImageEnhance.Contrast(smooth).enhance(1.10)
    smooth = ImageOps.posterize(smooth, 4)

    gray = ImageOps.grayscale(rgb).filter(ImageFilter.MedianFilter(3))
    edges = gray.filter(ImageFilter.FIND_EDGES)
    edges = ImageOps.autocontrast(edges).filter(ImageFilter.MaxFilter(3))
    line = ImageOps.invert(edges).convert("L")
    line = ImageEnhance.Contrast(line).enhance(1.8)
    result = Image.composite(smooth, Image.new("RGB", smooth.size, BLACK), line)
    result = ImageEnhance.Sharpness(result).enhance(1.25).convert("RGBA")

    # Médaillon FO comme sur l’exemple, positionné en bas à droite du buste.
    draw = ImageDraw.Draw(result)
    W, H = result.size
    logo_w, logo_h = int(W * 0.30), int(H * 0.15)
    x0, y0 = int(W * 0.58), int(H * 0.78)
    x1, y1 = x0 + logo_w, y0 + logo_h
    draw.rounded_rectangle((x0, y0, x1, y1), radius=int(logo_h * 0.18), fill=NAVY + (230,))

    try:
        font = ImageFont.truetype("DejaVuSans-Bold.ttf", int(logo_h * 0.82))
    except Exception:
        font = ImageFont.load_default()
    text = "FO"
    bbox = draw.textbbox((0, 0), text, font=font, stroke_width=6)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    tx = x0 + (logo_w - tw) // 2
    ty = y0 + (logo_h - th) // 2 - int(logo_h * 0.06)
    draw.text((tx, ty), text, font=font, fill=RED, stroke_fill=WHITE, stroke_width=6)

    return result


def main() -> None:
    for path in TARGETS:
        if not path.exists():
            raise FileNotFoundError(path)
        original = Image.open(path)
        styled = cartoonize(original)
        if path.suffix.lower() in {".jpg", ".jpeg"}:
            styled.convert("RGB").save(path, quality=94, optimize=True, progressive=True)
        else:
            styled.save(path, optimize=True)
        print(f"Stylisé : {path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()

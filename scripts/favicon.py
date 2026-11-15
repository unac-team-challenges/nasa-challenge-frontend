"""Genera public/favicon.ico (16, 32 y 48 px) con fondo transparente desde public/favicon.svg.

Cada tamaño se rasteriza a su resolución real (no se reduce desde uno más grande), así sale
lo más nítido posible. Los navegadores modernos usan el SVG; el .ico es el respaldo.

Requiere Pillow y rsvg-convert (librsvg). Uso (desde la raíz del frontend):
  python scripts/favicon.py
"""
import io
import subprocess
from pathlib import Path

from PIL import Image

RAIZ = Path(__file__).resolve().parent.parent
SVG, ICO = RAIZ / "public" / "favicon.svg", RAIZ / "public" / "favicon.ico"
TAMANOS = (16, 32, 48)


def svg_a_png(n):
    png = subprocess.run(["rsvg-convert", "-w", str(n), "-h", str(n), str(SVG)],
                         check=True, capture_output=True).stdout
    return Image.open(io.BytesIO(png)).convert("RGBA")


def main():
    imgs = [svg_a_png(n) for n in TAMANOS]
    for img in imgs:  # autochequeo: esquinas transparentes
        n = img.width
        assert img.getpixel((0, 0))[3] == 0 and img.getpixel((n - 1, n - 1))[3] == 0, n
    imgs[-1].save(ICO, sizes=[(n, n) for n in TAMANOS], append_images=imgs[:-1])
    print(f"{ICO.relative_to(RAIZ)}: {list(TAMANOS)} px")


if __name__ == "__main__":
    main()

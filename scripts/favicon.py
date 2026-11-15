"""Genera public/favicon.ico (16, 32 y 48 px) con fondo transparente.

- 16 y 32 px: pixel art calculado desde la misma geometría de public/favicon.svg, alineado
  a la grilla. Cada píxel toma UN color sólido (el que más área cubre), sin antialias, así
  no se ve borroso. La órbita es un trazo continuo de 1 px; a 16 px se quita el aro rosa
  para que el Perú se vea más grande.
- 48 px: se rasteriza el SVG tal cual (a ese tamaño el antialias ya no molesta).

Requiere Pillow y rsvg-convert (librsvg). Uso (desde la raíz del frontend):
  python scripts/favicon.py
"""
import io
import math
import subprocess
from pathlib import Path

from PIL import Image

RAIZ = Path(__file__).resolve().parent.parent
SVG, ICO = RAIZ / "public" / "favicon.svg", RAIZ / "public" / "favicon.ico"

# Paleta de favicon.svg (muestreada de logo.jpeg).
NAVY, ROSA, TEAL, VIDRIO, ORBITA, BLANCO = "#1F3354", "#CC3B72", "#2BB59A", "#F5F9F8", "#2FA8A8", "#FFFFFF"

# Silueta del Perú en el espacio 64×64 del SVG, centrada en (36, 27). Corte rosa/teal en y = 28.3.
PERU = [(35.6, 14.7), (38.7, 16.8), (42.8, 17.7), (42.8, 20.3), (38.7, 24.5), (39.1, 27.3), (42, 27.4),
        (43.4, 29.5), (44.5, 31.5), (44.1, 34.9), (43.4, 38.2), (42.2, 39.4), (34.3, 33.4), (33.2, 30.8),
        (30.6, 25.4), (29.3, 23.4), (27.5, 20.9), (28.9, 19.2), (29.9, 20.5), (31.2, 21.3), (32, 18.6),
        (35.2, 16.8)]

# Geometría por tamaño, en unidades del SVG (64). c: centro de la lente; r_*: radios de cada capa
# (r_rosa = 0 quita el aro rosa); mango: segmento y medio grosor; borde: contorno blanco.
TAMANOS = {
    16: dict(c=(38, 26), r_navy=22, borde=4, r_rosa=0, r_vidrio=18, mango=((22, 42), (6, 58)), mango_r=6,
             peru_escala=1.25, orbita=(32, 10)),
    32: dict(c=(37, 26), r_navy=21, borde=2.5, r_rosa=17, r_vidrio=14.5, mango=((22, 41), (7, 56)), mango_r=4.5,
             peru_escala=1.0, orbita=(30, 9.5)),
}
SUBMUESTRAS = 8  # 8×8 muestras por píxel para decidir qué color cubre más


def _dentro(x, y, pts):
    dentro = False
    for (x1, y1), (x2, y2) in zip(pts, pts[1:] + pts[:1]):
        if (y1 > y) != (y2 > y) and x < x1 + (y - y1) * (x2 - x1) / (y2 - y1):
            dentro = not dentro
    return dentro


def _dist_segmento(x, y, a, b):
    (ax, ay), (bx, by) = a, b
    dx, dy = bx - ax, by - ay
    t = max(0.0, min(1.0, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy)))
    return math.hypot(x - ax - t * dx, y - ay - t * dy)


def _color(x, y, g):
    """Color de la capa de más arriba en el punto (x, y), o None si es transparente."""
    cx, cy = g["c"]
    r, m = math.hypot(x - cx, y - cy), _dist_segmento(x, y, *g["mango"])
    color = None
    if m <= g["mango_r"] + g["borde"] or r <= g["r_navy"] + g["borde"]:
        color = BLANCO
    if m <= g["mango_r"] or r <= g["r_navy"]:
        color = NAVY
    if r <= g["r_rosa"]:
        color = ROSA
    if r <= g["r_vidrio"]:
        color = VIDRIO
    s = g["peru_escala"]
    u, v = (x - cx) / s + 36, (y - cy) / s + 27
    if _dentro(u, v, PERU):
        color = ROSA if v < 28.3 else TEAL
    return color


def pixel_art(n, g):
    q = 64 / n  # unidades del SVG por píxel
    img = Image.new("RGBA", (n, n))
    for j in range(n):
        for i in range(n):
            votos = {}
            for b in range(SUBMUESTRAS):
                for a in range(SUBMUESTRAS):
                    c = _color((i + (a + 0.5) / SUBMUESTRAS) * q, (j + (b + 0.5) / SUBMUESTRAS) * q, g)
                    votos[c] = votos.get(c, 0) + 1
            ganador = max(votos, key=votos.get)
            if ganador:
                img.putpixel((i, j), Image.new("RGBA", (1, 1), ganador).getpixel((0, 0)))

    # Órbita: recorre la elipse (rotada −25°, como en el SVG) y pinta 1 px por punto. Dentro de la
    # lente solo se dibuja el tramo delantero, para que pase por delante sin tapar el aro de atrás.
    (cx, cy), (rx, ry), ang = g["c"], g["orbita"], math.radians(-25)
    orbita = Image.new("RGBA", (1, 1), ORBITA).getpixel((0, 0))
    pasos = 2000
    for k in range(pasos):
        t = 2 * math.pi * k / pasos
        ex, ey = rx * math.cos(t), ry * math.sin(t)
        x = cx + ex * math.cos(ang) - ey * math.sin(ang)
        y = cy + ex * math.sin(ang) + ey * math.cos(ang)
        i, j = int(x / q), int(y / q)
        if not (0 <= i < n and 0 <= j < n):
            continue
        if math.hypot((i + 0.5) * q - cx, (j + 0.5) * q - cy) <= g["r_navy"] and ey <= 0:
            continue
        img.putpixel((i, j), orbita)
    return img


def svg_a_png(n):
    png = subprocess.run(["rsvg-convert", "-w", str(n), "-h", str(n), str(SVG)],
                         check=True, capture_output=True).stdout
    return Image.open(io.BytesIO(png)).convert("RGBA")


def main():
    imgs = {n: pixel_art(n, g) for n, g in TAMANOS.items()}
    imgs[48] = svg_a_png(48)
    # Autochequeo: esquinas transparentes en todos los tamaños.
    for n, img in imgs.items():
        assert img.getpixel((0, 0))[3] == 0 and img.getpixel((n - 1, n - 1))[3] == 0, n
    imgs[48].save(ICO, sizes=[(n, n) for n in sorted(imgs)], append_images=[imgs[16], imgs[32]])
    print(f"{ICO.relative_to(RAIZ)}: {sorted(imgs)} px")


if __name__ == "__main__":
    main()

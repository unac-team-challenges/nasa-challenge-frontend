"""Genera public/logo.webp: el logo del equipo (logo.jpeg, fondo blanco) con fondo transparente.

No es un "borrar el blanco" a ciegas: el vidrio de la lupa también es casi blanco.
  1. Dentro del lente (círculo fijo, medido en el jpeg de 2048 px) todo queda opaco.
  2. Afuera, lo claro (glow, bordes suavizados, fondo) pasa por "color a alfa" contra el
     blanco: el glow queda translúcido y los bordes no dejan halo blanco en el tema oscuro.
  3. El interior de las figuras oscuras o saturadas (mango, satélite, estrellas, órbita) queda
     opaco: "color a alfa" volvería translúcido el rosa o el verde.
Recorta al contenido, lo deja cuadrado y lo baja a 160 px (≈ 3x de los 44 px de la cabecera).

Uso (desde la raíz del frontend):
  python scripts/logo.py ../logo.jpeg
"""
import sys
from pathlib import Path

from PIL import Image, ImageChops, ImageFilter

SALIDA = Path(__file__).resolve().parent.parent / "public" / "logo.webp"
LADO = 160
# Lente en el jpeg original de 2048 px (borde exterior del aro azul ≈ 530 px)
CENTRO, RADIO = (1069, 862), 500
OBJETO = 200  # canal mínimo < 200: pixel de figura (no fondo ni glow)


def a_alfa(r: int, g: int, b: int) -> tuple[int, int, int, int]:
    """Color a alfa contra blanco: el alfa mínimo que, sobre blanco, da el mismo color."""
    a = max(255 - r, 255 - g, 255 - b) / 255
    if a < 0.03:
        return (255, 255, 255, 0)
    f = lambda c: max(0, min(255, round((c - 255 * (1 - a)) / a)))
    return (f(r), f(g), f(b), round(a * 255))


def main(origen: str) -> None:
    im = Image.open(origen).convert("RGB")
    w, h = im.size
    escala = w / 2048
    cx, cy, rr = CENTRO[0] * escala, CENTRO[1] * escala, (RADIO * escala) ** 2

    minimo = ImageChops.darker(ImageChops.darker(*im.split()[:2]), im.split()[2])
    objeto = minimo.point(lambda v: 255 if v < OBJETO else 0)
    # Interior = objeto y todo su entorno de 2 px también es objeto (lo demás es borde)
    interior = objeto.filter(ImageFilter.MinFilter(5)).load()

    src, out = im.load(), Image.new("RGBA", im.size)
    dst = out.load()
    for y in range(h):
        for x in range(w):
            r, g, b = src[x, y]
            if (x - cx) ** 2 + (y - cy) ** 2 <= rr or interior[x, y]:
                dst[x, y] = (r, g, b, 255)
            else:
                dst[x, y] = a_alfa(r, g, b)

    caja = out.getchannel("A").point(lambda v: 255 if v > 8 else 0).getbbox()
    out = out.crop(caja)
    lado = max(out.size)
    cuadro = Image.new("RGBA", (lado, lado))
    cuadro.paste(out, ((lado - out.width) // 2, (lado - out.height) // 2))
    cuadro.resize((LADO, LADO), Image.Resampling.LANCZOS).save(
        SALIDA, "WEBP", quality=90, method=6
    )
    print(f"{SALIDA} ({SALIDA.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "../logo.jpeg")

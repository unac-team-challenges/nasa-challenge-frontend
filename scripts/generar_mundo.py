#!/usr/bin/env python3
"""Precalcula el suelo del mapa 3D (src/features/mapa/escena/escena.ts): relieve de Sudamérica, mar, ríos y fronteras.

Todo se calcula aquí, una sola vez; el navegador solo carga una imagen y un JSON pequeño.

Fuentes (públicas, sin cuenta):
- Elevación y batimetría: AWS Terrain Tiles, formato "terrarium" (SRTM de NASA en tierra, ETOPO1 de NOAA
  en el mar). https://registry.opendata.aws/terrain-tiles/
- Fronteras: Natural Earth 1:50m, empaquetado como world-atlas@2.0.2 (TopoJSON).
- Ríos y lagos: Natural Earth 1:50m v5.1.2 (ne_50m_rivers_lake_centerlines, ne_50m_lakes).

Salida:
- mundo.webp (RGB, 1024×1024, equirectangular en la caja WORLD_BOX)
    R = en tierra: sombreado del relieve (0 oscuro, 1 claro); en el mar: profundidad (0 somero, 1 fosa)
    G = máscara de tierra levemente difuminada (la costa está donde G cruza 0,5)
    B = máscara de tierra muy difuminada (aguas someras y sombra)
- mundo2.webp (RGB, misma caja)
    R = en tierra: elevación / 6000 m; en el mar: profundidad / 8500 m (cada dominio usa los 8 bits
        completos: ~24 m por nivel en tierra, ~33 m en el mar). Da el relieve 3D, el color por altitud
        y las curvas de nivel
    G = agua continental: ríos y lagos de Natural Earth 1:50m (Amazonas, Titicaca...)
    B = fronteras entre países
(la caja también está en MUNDO, en src/features/mapa/escena/escena.ts) (las fronteras ya van dibujadas en mundo2.webp).

Uso (desde la raíz del repo; necesita numpy, scipy y pillow):
    python3 scripts/generar_mundo.py
Si cambias la caja (LON0..LAT1), actualiza MUNDO en src/features/mapa/escena/escena.ts.
"""
import io
import json
import math
import urllib.request
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

AQUI = Path(__file__).resolve().parent.parent / "public" / "mapa"  # salida
CACHE = Path(__file__).resolve().parent / ".cache_mundo"
LON0, LON1, LAT0, LAT1 = -110.0, -30.0, -60.0, 25.0  # caja: Sudamérica y el sur de Centroamérica
W = H = 1024
Z = 5  # nivel de teselas: 256 px cubren 11,25° → ~0,044° por píxel
UA = {"User-Agent": "detective-del-peru-generador/1.0"}


def descargar(url, destino):
    if not destino.exists():
        destino.parent.mkdir(parents=True, exist_ok=True)
        with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r:
            destino.write_bytes(r.read())
    return destino.read_bytes()


def merc_y(lat):  # fila global (en teselas) de una latitud en Web Mercator
    return (1 - math.asinh(math.tan(math.radians(lat))) / math.pi) / 2 * 2 ** Z


def elevacion():
    x0, x1 = int((LON0 + 180) / 360 * 2 ** Z), int((LON1 + 180) / 360 * 2 ** Z)
    y0, y1 = int(merc_y(LAT1)), int(merc_y(LAT0))
    mosaico = np.zeros(((y1 - y0 + 1) * 256, (x1 - x0 + 1) * 256), np.float32)
    for ty in range(y0, y1 + 1):
        for tx in range(x0, x1 + 1):
            png = descargar(f"https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{Z}/{tx}/{ty}.png",
                            CACHE / f"t{Z}_{tx}_{ty}.png")
            rgb = np.asarray(Image.open(io.BytesIO(png)).convert("RGB"), np.float32)
            e = rgb[..., 0] * 256 + rgb[..., 1] + rgb[..., 2] / 256 - 32768
            mosaico[(ty - y0) * 256:(ty - y0 + 1) * 256, (tx - x0) * 256:(tx - x0 + 1) * 256] = e
    # Reproyección a la malla equirectangular (fila 0 = norte)
    lons = np.linspace(LON0, LON1, W)
    lats = np.linspace(LAT1, LAT0, H)
    px = ((lons + 180) / 360 * 2 ** Z - x0) * 256 - 0.5
    py = np.array([(merc_y(la) - y0) * 256 - 0.5 for la in lats])
    PX, PY = np.meshgrid(px, py)
    return ndimage.map_coordinates(mosaico, [PY, PX], order=1, mode="nearest"), lats


def sombreado(e, lats, exag, az=315.0, alt=45.0):
    dy = (LAT1 - LAT0) / H * 111320.0
    dx = (LON1 - LON0) / W * 111320.0 * np.cos(np.radians(lats))[:, None]
    gy, gx = np.gradient(e * exag)
    gx, gy = gx / dx, gy / dy
    pend = np.arctan(np.hypot(gx, gy))
    asp = np.arctan2(-gy, gx)  # fila 0 = norte: el gradiente en y apunta al sur
    zen, a = np.radians(90 - alt), np.radians(360 - az + 90)
    hs = np.cos(zen) * np.cos(pend) + np.sin(zen) * np.sin(pend) * np.cos(a - asp)
    return np.clip(hs, 0, 1)


def fronteras():
    topo = json.loads(descargar("https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-50m.json",
                                CACHE / "countries-50m.json"))
    sx, sy = topo["transform"]["scale"]
    tx, ty = topo["transform"]["translate"]
    arcos = []
    for arc in topo["arcs"]:
        x = y = 0
        pts = []
        for dxq, dyq in arc:
            x += dxq
            y += dyq
            pts.append((x * sx + tx, y * sy + ty))
        arcos.append(pts)
    uso = {}
    for i, g in enumerate(topo["objects"]["countries"]["geometries"]):
        anillos = g.get("arcs", [])
        polis = anillos if g["type"] == "MultiPolygon" else [anillos]
        for poli in polis:
            for anillo in poli:
                for a in anillo:
                    uso.setdefault(a if a >= 0 else ~a, set()).add(i)
    out = []
    for a, paises in uso.items():
        if len(paises) < 2:  # usado por un solo país: es costa, no frontera
            continue
        pts = [(round(x, 2), round(y, 2)) for x, y in arcos[a] if LON0 <= x <= LON1 and LAT0 <= y <= LAT1]
        if len(pts) >= 2:
            out.append(pts)
    return out


NE = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/"
SS = 2  # se dibuja al doble y se reduce: líneas suavizadas


def a_px(lon, lat):
    return ((lon - LON0) / (LON1 - LON0) * W * SS, (LAT1 - lat) / (LAT1 - LAT0) * H * SS)


def rasterizar(lineas, poligonos, ancho):
    img = Image.new("L", (W * SS, H * SS), 0)
    d = ImageDraw.Draw(img)
    for anillo in poligonos:
        d.polygon([a_px(*p) for p in anillo], fill=255)
    for linea, w in lineas:
        d.line([a_px(*p) for p in linea], fill=255, width=max(1, round(w * ancho)), joint="curve")
    return np.asarray(img.resize((W, H), Image.LANCZOS), np.float32) / 255


def dentro(coords):
    return any(LON0 - 2 <= x <= LON1 + 2 and LAT0 - 2 <= y <= LAT1 + 2 for x, y in coords)


def agua():
    rios = json.loads(descargar(NE + "ne_50m_rivers_lake_centerlines.geojson", CACHE / "ne_50m_rivers_lake_centerlines.geojson"))
    lagos = json.loads(descargar(NE + "ne_50m_lakes.geojson", CACHE / "ne_50m_lakes.geojson"))
    lineas, polis = [], []
    for f in rios["features"]:
        g = f["geometry"]
        partes = g["coordinates"] if g["type"] == "MultiLineString" else [g["coordinates"]]
        rank = f["properties"].get("scalerank", 5) or 5
        for parte in partes:
            if dentro(parte):
                lineas.append((parte, max(0.6, 2.4 - 0.3 * rank)))  # ríos grandes más anchos
    for f in lagos["features"]:
        g = f["geometry"]
        partes = g["coordinates"] if g["type"] == "MultiPolygon" else [g["coordinates"]]
        for parte in partes:
            if dentro(parte[0]):
                polis.append(parte[0])
    return rasterizar(lineas, polis, SS)


def main():
    AQUI.mkdir(parents=True, exist_ok=True)
    e, lats = elevacion()
    tierra = (e > 0).astype(np.float32)
    hs_t = sombreado(e, lats, exag=8.0)
    hs_m = sombreado(np.minimum(e, 0), lats, exag=3.0)
    prof = np.clip(-e, 0, 8000) / 8000
    hondo = np.clip(prof ** 0.6 + 0.25 * (0.6 - hs_m), 0, 1)
    R = np.where(tierra > 0, hs_t, hondo)
    G = ndimage.gaussian_filter(tierra, 1.2)
    B = ndimage.gaussian_filter(tierra, 7.0)
    img = (np.dstack([R, G, B]) * 255 + 0.5).clip(0, 255).astype(np.uint8)
    Image.fromarray(img, "RGB").save(AQUI / "mundo.webp", lossless=True, quality=100, method=6)
    fr = fronteras()
    es = ndimage.gaussian_filter(e, 0.8)
    elev = np.where(tierra > 0, np.clip(es, 0, 6000) / 6000, np.clip(-es, 0, 8500) / 8500)
    ag = agua() * tierra
    fb = rasterizar([(l, 1.0) for l in fr], [], 1.6 * SS) * tierra
    img2 = (np.dstack([np.clip(elev, 0, 1), ag, fb]) * 255 + 0.5).clip(0, 255).astype(np.uint8)
    Image.fromarray(img2, "RGB").save(AQUI / "mundo2.webp", lossless=True, quality=100, method=6)
    # Controles: Lima es tierra, el mar frente a Lima es mar y la fosa Perú-Chile es honda
    def celda(lon, lat):
        return int((LAT1 - lat) / (LAT1 - LAT0) * (H - 1)), int((lon - LON0) / (LON1 - LON0) * (W - 1))
    assert e[celda(-77.03, -12.05)] > 0, "Lima debería ser tierra"
    assert e[celda(-79.0, -12.5)] < 0, "frente a Lima debería ser mar"
    assert e[celda(-71.4, -24.0)] < -6000, "la fosa Perú-Chile frente a Antofagasta pasa de 6000 m"
    assert e[celda(-69.4, -15.8)] > 3500, "el Titicaca está a más de 3500 m"
    assert ag[celda(-69.4, -15.8)] > 0.5, "el Titicaca debería estar en la capa de agua"
    print(f"mundo2.webp {(AQUI / 'mundo2.webp').stat().st_size // 1024} KB; agua {ag.mean():.3%} de la caja")
    print(f"mundo.webp {W}x{H}, {(AQUI / 'mundo.webp').stat().st_size // 1024} KB; elevación {e.min():.0f}..{e.max():.0f} m; "
          f"fronteras {len(fr)} líneas, {sum(map(len, fr))} puntos")


if __name__ == "__main__":
    main()

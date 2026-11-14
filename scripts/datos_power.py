"""Genera src/data/power.json: datos REALES de NASA POWER por departamento para el frontend.

Mismo método que pipeline/exploracion/josue/scripts/power_departamentos.py (backend):
  1. Malla regional de POWER en 4 recuadros (máx. 10° por lado), 1981–2024.
  2. Cada celda va al departamento que contiene su centro (punto en polígono, sin geopandas).
  3. Promedio de las celdas por mes → media anual (solo años con 12 meses).
  4. Tendencia con lab5_tendencias.py de Josue (TFPW + Sen con IC95 + Benjamini-Hochberg),
     con su umbral exigente:
       pocos_datos        : < 4 celdas  o  < 20 años
       real               : q < 0.05  y  IC95 sin 0  y  |lag1| <= 0.5
       posible_casualidad : el resto
  5. Además, la misma tendencia SIN los años de El Niño (para el Caso 1 de la ficha).

Variables: lluvia (PRECTOTCORR, mm/día → mm/año) y temperatura (T2M, °C).
Uso (sin cuenta, solo internet):  python scripts/datos_power.py
Pendiente: mover este paso al pipeline del backend cuando la API sirva las tendencias.
"""
import json
import sys
import urllib.parse
import urllib.request
from datetime import date
from pathlib import Path

AQUI = Path(__file__).resolve().parent
sys.path.insert(0, str(AQUI))
from lab5_tendencias import analizar, bh  # noqa: E402  (copia del backend, validada por Josue)

RAIZ = AQUI.parent
CACHE = AQUI / ".cache_power"
URL = "https://power.larc.nasa.gov/api/temporal/monthly/regional"
RECUADROS = {"NO": (-9, 0, -81.5, -73), "NE": (-9, 0, -73, -68.5),
             "SO": (-18.5, -9, -81.5, -73), "SE": (-18.5, -9, -73, -68.5)}
VARIABLES = {
    "lluvia": {"param": "PRECTOTCORR", "factor": 365.0, "unidad": "mm/año"},
    "temperatura": {"param": "T2M", "factor": 1.0, "unidad": "°C"},
}
PERIODOS = {"largo": (1981, 2024), "reciente": (2001, 2024)}
# Años de El Niño fuerte en la costa norte del Perú (lluvias extremas)
ANIOS_NINO = [1983, 1998, 2016, 2017, 2023]
MIN_CELDAS, MIN_AÑOS, MAX_LAG1, ALFA = 4, 20, 0.5, 0.05


def bajar(param, nombre, caja):
    CACHE.mkdir(exist_ok=True)
    f = CACHE / f"{param}_{nombre}.json"
    if f.exists():
        return json.loads(f.read_text(encoding="utf-8"))
    smin, smax, wmin, wmax = caja
    q = urllib.parse.urlencode({"parameters": param, "community": "AG", "latitude-min": smin,
                                "latitude-max": smax, "longitude-min": wmin, "longitude-max": wmax,
                                "start": 1981, "end": 2024, "format": "JSON"})
    with urllib.request.urlopen(f"{URL}?{q}", timeout=600) as r:
        texto = r.read().decode("utf-8")
    f.write_text(texto, encoding="utf-8")
    return json.loads(texto)


def dentro(x, y, anillo):
    ins = False
    j = len(anillo) - 1
    for i in range(len(anillo)):
        xi, yi = anillo[i]
        xj, yj = anillo[j]
        if (yi > y) != (yj > y) and x < (xj - xi) * (y - yi) / (yj - yi) + xi:
            ins = not ins
        j = i
    return ins


def departamento_de(lon, lat, deps):
    for d in deps:
        for poly in d["polys"]:
            if dentro(lon, lat, poly[0]) and not any(dentro(lon, lat, h) for h in poly[1:]):
                return d["id"]
    return None


def estado(r, celdas):
    if celdas < MIN_CELDAS or r.get("n_years", 0) < MIN_AÑOS:
        return "pocos_datos", f"celdas={celdas}, años={r.get('n_years')}"
    motivos = []
    if r["q_value"] >= ALFA:
        motivos.append(f"q={r['q_value']:.3f}")
    if r["ci_low"] <= 0 <= r["ci_high"]:
        motivos.append("IC95 incluye 0")
    if abs(r["lag1"]) > MAX_LAG1:
        motivos.append(f"lag1={r['lag1']:.2f}")
    return ("real", "") if not motivos else ("posible_casualidad", "; ".join(motivos))


def tendencias(series, celdas, ini, fin, quitar=()):
    bloque = {}
    for dep, s in series.items():
        sub = {a: v for a, v in s.items() if ini <= a <= fin and a not in quitar}
        bloque[dep] = analizar(sub) if celdas.get(dep, 0) else {"n_years": 0, "status": "pocos_datos"}
    con_p = [d for d in bloque if "p_value" in bloque[d]]
    for d, q in zip(con_p, bh([bloque[d]["p_value"] for d in con_p])):
        bloque[d]["q_value"] = q
    zonas = {}
    for dep, r in bloque.items():
        st, motivo = estado(r, celdas.get(dep, 0)) if "q_value" in r else ("pocos_datos", "sin serie")
        z = {"id": dep, "celdas": celdas.get(dep, 0), "n_years": r.get("n_years", 0), "status": st, "motivo": motivo}
        for k in ("slope_per_decade", "ci_low", "ci_high", "pct_change_per_decade", "intercept",
                  "p_value", "q_value", "lag1", "year_start", "year_end"):
            if r.get(k) is not None:
                z[k] = round(float(r[k]), 6)
        zonas[dep] = z
    return zonas


def main():
    deps = json.loads((RAIZ / "src" / "data" / "departamentos.json").read_text(encoding="utf-8"))
    salida = {
        "generado": date.today().isoformat(),
        "fuente": "NASA POWER (MERRA-2), API mensual regional, promedio de todas las celdas de cada departamento",
        "metodo": "Mann-Kendall con TFPW, pendiente de Sen con IC95, Benjamini-Hochberg; umbral de Josue",
        "anios_nino": ANIOS_NINO,
        "periodos": {k: {"year_start": a, "year_end": b} for k, (a, b) in PERIODOS.items()},
        "variables": {},
    }
    for var, cfg in VARIABLES.items():
        mensual = {}  # (dep, año, mes) -> [valores de celdas]
        celdas = {}
        vistas = set()
        for nombre, caja in RECUADROS.items():
            datos = bajar(cfg["param"], nombre, caja)
            for feat in datos["features"]:
                lon, lat = feat["geometry"]["coordinates"][:2]
                if (lon, lat) in vistas:
                    continue  # celdas del borde entre recuadros
                vistas.add((lon, lat))
                dep = departamento_de(lon, lat, deps)
                if not dep:
                    continue
                celdas[dep] = celdas.get(dep, 0) + 1
                for k, v in feat["properties"]["parameter"][cfg["param"]].items():
                    if k.endswith("13") or v == -999:
                        continue
                    mensual.setdefault((dep, int(k[:4]), int(k[4:])), []).append(v)
        anual = {d["id"]: {} for d in deps}
        por_anio = {}
        for (dep, a, m), vals in mensual.items():
            por_anio.setdefault((dep, a), []).append(sum(vals) / len(vals))
        for (dep, a), meses in por_anio.items():
            if len(meses) == 12:
                anual[dep][a] = sum(meses) / 12 * cfg["factor"]
        bloque = {"unidad": cfg["unidad"], "parametro": cfg["param"], "periodos": {}, "sin_nino": {},
                  "series": {dep: [[a, round(v, 3)] for a, v in sorted(s.items())] for dep, s in anual.items()}}
        for per, (ini, fin) in PERIODOS.items():
            bloque["periodos"][per] = tendencias(anual, celdas, ini, fin)
            bloque["sin_nino"][per] = tendencias(anual, celdas, ini, fin, quitar=ANIOS_NINO)
        salida["variables"][var] = bloque
        cuenta = {}
        for per in PERIODOS:
            for z in bloque["periodos"][per].values():
                cuenta[(per, z["status"])] = cuenta.get((per, z["status"]), 0) + 1
        print(var, "celdas:", dict(sorted(celdas.items())))
        print(var, "estados:", dict(sorted(cuenta.items())))
    destino = RAIZ / "src" / "data" / "power.json"
    destino.write_text(json.dumps(salida, ensure_ascii=False, separators=(",", ":"), allow_nan=False),
                       encoding="utf-8")
    print("escrito", destino, round(destino.stat().st_size / 1024), "KB")


if __name__ == "__main__":
    main()

"""Copia local de la vegetación (plan B): los mismos números que sirve la API.

Lee los archivos del backend (nasa-challenge-backend) y escribe:
  src/data/vegetacion.json          tendencias y series por departamento (forma de power.json)
  src/data/celdas_vegetacion.json   malla de NDVI a 0,25° (igual que /api/celdas?variable=vegetacion)

Uso: python3 scripts/copiar_vegetacion.py ../nasa-challenge-backend

La tendencia es la del backend (pipeline/tendencias.py, 2001–2024). MODIS empieza en 2001, así que
el periodo «largo» repite el «reciente»; «sin El Niño» repite la tendencia normal (la casilla de
El Niño solo aparece con la lluvia).
"""
import json
import shutil
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
CAMPOS = ["slope_per_decade", "ci_low", "ci_high", "p_value", "q_value", "lag1",
          "n_years", "year_start", "year_end"]


def main(backend: Path):
    datos = backend / "data"
    zonas = json.loads((datos / "zonas" / "vegetacion.json").read_text(encoding="utf-8"))
    if len(zonas) != 25:
        sys.exit(f"zonas/vegetacion.json tiene {len(zonas)} zonas, se esperaban 25")
    por_id, series = {}, {}
    for z in zonas:
        st = z["stats"]
        por_id[z["id"]] = {"id": z["id"], "celdas": z["celdas"], "status": st["status"],
                           "motivo": st.get("aviso", ""), **{k: st[k] for k in CAMPOS if k in st}}
        ficha = json.loads((datos / "zonas" / "vegetacion" / f"{z['id']}.json").read_text(encoding="utf-8"))
        series[z["id"]] = [[p["anio"], p["valor"]] for p in ficha["serie"]]
    bloque = {
        "unidad": "NDVI",
        "parametro": "NDVI (MODIS MOD13A3)",
        "periodos": {"largo": por_id, "reciente": por_id},
        "sin_nino": {"largo": por_id, "reciente": por_id},
        "series": series,
    }
    (RAIZ / "src" / "data" / "vegetacion.json").write_text(
        json.dumps(bloque, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    shutil.copyfile(datos / "celdas" / "vegetacion.json", RAIZ / "src" / "data" / "celdas_vegetacion.json")
    print("src/data/vegetacion.json y src/data/celdas_vegetacion.json listos")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit("uso: python3 scripts/copiar_vegetacion.py <ruta a nasa-challenge-backend>")
    main(Path(sys.argv[1]))

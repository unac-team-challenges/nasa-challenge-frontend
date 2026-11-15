"""Copia local de la lluvia de IMERG (segunda fuente) -> src/data/imerg.json.

Es el plan B del bloque «¿Coinciden dos fuentes de NASA?» de la ficha: los mismos números que
sirve la API en /api/zonas?variable=lluvia_imerg, sacados de data/zonas/lluvia_imerg.json del
backend (pipeline/tendencias.py). No recalcula nada: solo pasa de mm/día a mm/año, como la web.

Uso (desde la raíz del frontend):
  python scripts/datos_imerg.py ../nasa-challenge-backend/data/zonas/lluvia_imerg.json
"""
import json
import sys
from datetime import date
from pathlib import Path

SALIDA = Path(__file__).resolve().parent.parent / "src" / "data" / "imerg.json"
DIAS = 365  # mm/día -> mm/año (factorUnidad en src/api/consultas.ts)


def main(origen):
    zonas = json.loads(Path(origen).read_text(encoding="utf-8"))
    if len(zonas) != 25:
        sys.exit(f"{origen}: {len(zonas)} zonas, se esperaban 25")
    salida = {
        "generado": date.today().isoformat(),
        "fuente": "GPM IMERG v07 (NASA)",
        "unidad": "mm/año",
        "origen": "nasa-challenge-backend: data/zonas/lluvia_imerg.json",
        "zonas": {
            z["id"]: {
                "slope_per_decade": round(z["stats"]["slope_per_decade"] * DIAS, 2),
                "ci_low": round(z["stats"]["ci_low"] * DIAS, 2),
                "ci_high": round(z["stats"]["ci_high"] * DIAS, 2),
                "status": z["stats"]["status"],
                "n_years": z["stats"]["n_years"],
            }
            for z in zonas
        },
    }
    SALIDA.write_text(json.dumps(salida, ensure_ascii=False, indent=1, allow_nan=False) + "\n", encoding="utf-8")
    print(f"escrito {SALIDA} ({len(salida['zonas'])} zonas)")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])

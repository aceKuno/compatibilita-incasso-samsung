"""Genera site/data.js a partire dall'Excel di compatibilità.

Uso:  python tools/build_data.py

Legge il foglio "Lista modelli" e scrive un file JS compatto con i soli campi
necessari al sito (niente anni di rilevazione, niente dati di vendita).
In più ricalcola l'esito con le regole del foglio "Gamma Samsung e regole"
e segnala le righe in cui il ricalcolo non coincide con l'Excel.
"""
import json
import sys
from pathlib import Path

import openpyxl

ROOT = Path(__file__).resolve().parent.parent
XLSX = ROOT / "Compatibilita_Frigo_Incasso_Samsung.xlsx"
OUT = ROOT / "site" / "data.js"

TYPES = ["BMF (combinato)", "Monoporta", "TMF (doppia porta)", "Sottopiano",
         "Multiporta", "Side by side", "Altro"]
MOUNTS = ["A traino (slide)", "Porta fissa", "n.d."]
SAMSUNG = ["BRB80F26ACS0", "BRB70F30BES0EF", "BRB38G705DWW"]
OUTCOMES = ["Compatibile", "Da verificare", "Non compatibile"]
JUNK_MODELS = {"TRADE MODEL", "UNK"}


def rnd(x):
    """Arrotondamento al cm intero (mezzo verso il pari, come nell'Excel)."""
    return round(x)


def rule(tipologia, w, h):
    """Restituisce (esito, sku) secondo le regole del foglio Excel."""
    if tipologia != "BMF (combinato)":
        return "Non compatibile", None
    if w is None or h is None:
        return "Da verificare", None
    w, h = rnd(w), rnd(h)
    h_ok = 177 <= h <= 196
    if 52 <= w <= 56 and h_ok:
        return "Compatibile", SAMSUNG[0] if h <= 191 else SAMSUNG[1]
    if 68 <= w <= 71 and h_ok:
        return "Compatibile", SAMSUNG[2]
    w_near = 51 <= w <= 57 or 67 <= w <= 72
    h_near = 175 <= h <= 198
    if w_near and h_near:
        return "Da verificare", None
    return "Non compatibile", None


def num(x):
    if x is None:
        return None
    return int(x) if float(x).is_integer() else round(float(x), 1)


def main():
    wb = openpyxl.load_workbook(XLSX, data_only=True)
    rows = list(wb["Lista modelli"].iter_rows(values_only=True))[1:]
    out, mismatches, skipped = [], [], 0
    for r in rows:
        brand, model, tip, w, h, d, mount, sku, esito, note = r[:10]
        model = str(model).strip()
        if model.upper() in JUNK_MODELS:
            skipped += 1
            continue
        calc = rule(tip, w, h)
        if calc != (esito, sku):
            mismatches.append((brand, model, tip, w, h, esito, sku, calc))
        out.append([
            str(brand).strip(), model, TYPES.index(tip), num(w), num(h), num(d),
            MOUNTS.index(mount), SAMSUNG.index(sku) if sku else -1,
            OUTCOMES.index(esito), note or "",
        ])
    out.sort(key=lambda x: (x[0], x[1]))
    payload = {"types": TYPES, "mounts": MOUNTS, "samsung": SAMSUNG,
               "outcomes": OUTCOMES, "rows": out}
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text("window.FRIDGE_DATA=" + json.dumps(payload, ensure_ascii=False,
                   separators=(",", ":")) + ";\n", encoding="utf-8")
    print(f"scritte {len(out)} righe in {OUT} ({OUT.stat().st_size // 1024} KB), "
          f"{skipped} righe senza codice modello escluse")
    print(f"ricalcolo regole: {len(mismatches)} differenze rispetto all'Excel")
    for m in mismatches[:40]:
        print("   ", m)
    return 0


if __name__ == "__main__":
    sys.exit(main())

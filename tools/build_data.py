"""Genera site/data.js a partire dall'Excel di compatibilità.

Uso:  python tools/build_data.py [percorso.xlsx]

Senza argomenti usa l'Excel "Compatibilita_Frigo_Incasso_Samsung*.xlsx" più recente
nella cartella principale. Legge il foglio "Lista modelli" e scrive un file JS
compatto con i soli campi necessari al sito (niente anni di rilevazione, niente
fonte). In più ricalcola l'esito con le regole del foglio "Gamma Samsung e regole"
e segnala le righe in cui il ricalcolo non coincide con l'Excel.
"""
import json
import sys
from pathlib import Path

import openpyxl

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "site" / "data.js"

TYPES = ["BMF (combinato)", "Monoporta", "TMF (doppia porta)", "Sottopiano",
         "Multiporta", "Side by side", "Altro"]
MOUNTS = ["A traino (slide)", "Porta fissa", "n.d."]
# Tipologie Samsung (colonna "Modello Samsung compatibile" dell'Excel) → nome sul sito
FAMILY_KEYS = ["BRB80F26 - BRB70F26", "BRB70F30", "BRB38G70"]
FAMILIES = ["F1rst 60 AI", "F1rst 60 AI Plus", "F1rst 75 AI"]
OUTCOMES = ["Compatibile", "Da verificare", "Non compatibile"]
JUNK_MODELS = {"TRADE MODEL", "UNK"}


def rule(tipologia, w, h):
    """Restituisce (esito, indice tipologia Samsung) secondo le regole dell'Excel.

    Misure arrotondate al cm (mezzo verso il pari, come Excel/Python round).
    Segmento 55: L 52–56, A 176–187 → F1rst 60 AI; A 188–198 → F1rst 60 AI Plus.
    Segmento 70: L 67–71, A 176–198 → F1rst 75 AI.
    1 cm fuori range o misure mancanti → Da verificare.
    """
    if tipologia != "BMF (combinato)":
        return "Non compatibile", None
    if w is None or h is None:
        return "Da verificare", None
    w, h = round(w), round(h)
    if 176 <= h <= 198:
        if 52 <= w <= 56:
            return "Compatibile", 0 if h <= 187 else 1
        if 67 <= w <= 71:
            return "Compatibile", 2
    w_near = 51 <= w <= 57 or 66 <= w <= 72
    if w_near and 175 <= h <= 199:
        return "Da verificare", None
    return "Non compatibile", None


def num(x):
    if x is None:
        return None
    return int(x) if float(x).is_integer() else round(float(x), 1)


def find_xlsx():
    if len(sys.argv) > 1:
        return Path(sys.argv[1])
    files = sorted(ROOT.glob("Compatibilita_Frigo_Incasso_Samsung*.xlsx"),
                   key=lambda p: p.stat().st_mtime)
    if not files:
        sys.exit("Excel non trovato nella cartella principale")
    return files[-1]


def main():
    xlsx = find_xlsx()
    print(f"Excel: {xlsx.name}")
    wb = openpyxl.load_workbook(xlsx, data_only=True)
    rows = list(wb["Lista modelli"].iter_rows(values_only=True))[1:]
    out, mismatches, skipped = [], [], 0
    for r in rows:
        brand, model, tip, w, h, d, mount, fam, esito, note = r[:10]
        if brand is None and model is None:
            continue
        model = str(model).strip()
        if model.upper() in JUNK_MODELS:
            skipped += 1
            continue
        fam_i = FAMILY_KEYS.index(fam) if fam else None
        calc = rule(tip, w, h)
        if calc != (esito, fam_i):
            mismatches.append((brand, model, tip, w, h, esito, fam, calc))
        out.append([
            str(brand).strip(), model, TYPES.index(tip), num(w), num(h), num(d),
            MOUNTS.index(mount), -1 if fam_i is None else fam_i,
            OUTCOMES.index(esito), note or "",
        ])
    out.sort(key=lambda x: (x[0], x[1]))
    payload = {"types": TYPES, "mounts": MOUNTS, "families": FAMILIES,
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

# Compatibilità frigoriferi da incasso → Samsung F1rst

Sito statico: si scrive il codice del frigorifero da incasso attuale e si vede
quale tipologia Samsung F1rst lo sostituisce nella stessa nicchia:

| Tipologia        | Nicchia     | Versioni in libreria |
|------------------|-------------|----------------------|
| F1rst 60 AI      | 55 × 178 cm | 8 attuali + 2 generazione precedente |
| F1rst 60 AI Plus | 55 × 194 cm | 2 |
| F1rst 75 AI      | 70 × 194 cm | 3 |

## Versioni

- **Generale** (`/`): propone la tipologia e mostra tutte le versioni F1rst con le
  stesse misure, così ogni retailer sceglie quella che ha in assortimento.
- **Retailer** (`/unieuro`, cioè `/?r=unieuro`): propone direttamente il modello
  dell'assortimento (Unieuro: BRB80F26ACS0, BRB70F30BES0, BRB38G705DWW) e la gamma
  mostra solo quei modelli. Per aggiungere un retailer: voce in `RETAILERS` in
  `site/app.js` e, se serve un link breve, una riga in `site/_redirects`.

La libreria F1rst (`SKUS` in `site/app.js`) è presa dalle schede prodotto di
samsung.com/it: misure, capacità, classe energetica e caratteristiche.

## Privacy

- Nessun backend, nessun cookie, nessun analytics, nessun font o script esterno.
- La ricerca gira interamente nel browser: il codice digitato non lascia il dispositivo.
- Unica risorsa esterna: le immagini prodotto, caricate da `images.samsung.com`.
- `site/_headers` imposta una Content-Security-Policy che blocca ogni altra connessione
  e `noindex` per i motori di ricerca (togli `X-Robots-Tag` e `robots.txt` se vuoi
  che il sito sia indicizzato).

## Struttura

```
site/            sito pubblicato (Cloudflare Pages)
  index.html
  styles.css
  app.js         ricerca, esito, schede prodotto
  data.js        elenco modelli (generato)
  _headers       header di sicurezza per Cloudflare Pages
  _redirects     link brevi delle versioni retailer (/unieuro)
tools/
  build_data.py  rigenera site/data.js dall'Excel
```

## Font e logo

Il sito usa i font Samsung SS Head / SS Body e il lettermark ufficiale, secondo il
Samsung Typographic Playbook 2025 (Head sopra i 18 pt, Body sotto; titoli Head Bold,
testi Body Regular, enfasi Body Bold, disclaimer Body Light). Sono file proprietari:
stanno in `site/fonts/` e `site/brand/` solo in locale e vengono pubblicati sul sito,
ma non sono nel repository. Senza quei file il sito usa i font di sistema.

## Aggiornare i dati

L'Excel sorgente non è nel repository. Mettilo nella cartella principale con un nome
che inizia per `Compatibilita_Frigo_Incasso_Samsung` (lo script prende il più
recente, oppure passagli il percorso), poi:

```bash
pip install openpyxl
python tools/build_data.py
```

Lo script esporta solo marca, modello, tipologia, misure, montaggio, esito e nota,
e controlla che le regole di compatibilità usate dal sito (verifica con le misure)
diano lo stesso esito dell'Excel su tutte le righe.

## Pubblicare

```bash
npx wrangler pages deploy site --project-name compatibilita-incasso-samsung --branch main
```

## Provare in locale

```bash
python -m http.server 8765 --directory site
```

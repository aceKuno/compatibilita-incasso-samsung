# Compatibilità frigoriferi da incasso → Samsung F1rst

Sito statico: si scrive il codice del frigorifero da incasso attuale e si vede
quale Samsung F1rst (BRB80F26ACS0, BRB70F30BES0EF, BRB38G705DWW) lo sostituisce
nella stessa nicchia, con le caratteristiche principali e il link alla scheda
prodotto su samsung.com.

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
tools/
  build_data.py  rigenera site/data.js dall'Excel
```

## Aggiornare i dati

L'Excel sorgente non è nel repository. Mettilo nella cartella principale con il nome
`Compatibilita_Frigo_Incasso_Samsung.xlsx`, poi:

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

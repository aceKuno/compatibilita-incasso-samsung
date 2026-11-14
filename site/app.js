/* Compatibilità frigoriferi da incasso → Samsung F1rst.
   Tutto gira nel browser: nessuna richiesta di rete, nessun dato salvato. */
(function () {
  "use strict";

  var D = window.FRIDGE_DATA;
  var MAX_ROWS = 60;
  var IMG = "https://images.samsung.com/is/image/samsung/p6pim/it/";
  var PDP = "https://www.samsung.com/it/refrigerators/built-in-bottom-mount-freezer/";
  var LABEL = "https://images.samsung.com/is/content/samsung/p6/common/energylabel/common-energylabel-";

  var TYPE_LABEL = [
    "Combinato (freezer in basso)", "Monoporta", "Doppia porta (freezer in alto)",
    "Sottopiano", "Multiporta", "Side by side", "Altro"
  ];
  var TYPE_SHORT = ["Combinato", "Monoporta", "Doppia porta", "Sottopiano", "Multiporta", "Side by side", "Altro"];
  var MOUNT_LABEL = ["A traino", "Porta fissa", "Non disponibile"];
  var OUTCOME_CLASS = ["ok", "warn", "no"];

  var U = {
    ai: ["AI Energy Mode", "Con SmartThings adatta compressore e sbrinamento alle tue abitudini: fino al 10% di energia in meno*."],
    twin: ["Twin Cooling™", "Frigo e freezer raffreddati in modo indipendente: giusta umidità e nessun odore che si mescola."],
    twinPlus: ["Twin Cooling Plus™", "Due sistemi di raffreddamento indipendenti per frigo e freezer: freschezza più a lungo, odori separati."],
    coolSelect: ["Cool Select+", "Una zona che cambia funzione con un tocco: da frigo a freezer, da 2° fino a -23°."],
    optimal2: ["Optimal Fresh+", "Cassetto a due zone: più freddo a sinistra per carne e pesce, a destra frutta e verdura."],
    optimal1: ["Optimal Fresh+", "Cassetto dedicato a carne e pesce, più freddo del resto del frigorifero."],
    metal: ["Metal Cooling", "Il pannello in metallo trattiene il freddo e recupera in fretta la temperatura dopo ogni apertura."],
    noFrost: ["Total No Frost", "Niente ghiaccio né brina, in frigo e in freezer: non si sbrina più."],
    power: ["Power Cool / Power Freeze", "Raffreddamento e congelamento rapidi premendo un pulsante."],
    powerFreeze: ["Power Freeze", "Congelamento rapido con un pulsante, ideale anche per il ghiaccio."],
    space: ["SpaceMax™", "Pareti più sottili: più spazio dentro, stesso ingombro fuori."],
    rack: ["Rack & Shelf™", "Ripiano multifunzione: portabottiglie anche per formati grandi, oppure piano d'appoggio."],
    tray: ["Multi Tray", "Vassoio estraibile sotto i ripiani per lattine, uova e piccoli alimenti."],
    light: ["Luci dimmerabili", "Luminosità interna regolabile dall'app, con modalità notte."],
    smart: ["SmartThings", "Consumi sotto controllo, avvisi di manutenzione e gestione della dispensa dall'app."]
  };

  var PRODUCTS = [
    {
      sku: "BRB80F26ACS0", name: "F1rst 60 AI", tag: "Nicchia 55 × 178 cm",
      title: "Frigorifero combinato da incasso 1,78 m, 264 L, Total No Frost",
      w: 54, h: 177.5, d: 55, cap: 264, cls: "C",
      img: IMG + "brb80f26acs0ef/gallery/it-brb80f-twc-537143-brb80f26acs0ef-544977110",
      url: PDP + "brb80f-twc-264l-white-brb80f26acs0ef/",
      label: LABEL + "brb80f26acs0ef-energylabel.pdf",
      usps: ["ai", "twin", "coolSelect", "metal", "optimal2", "noFrost", "power", "space", "rack", "smart"],
      chips: ["AI Energy Mode", "Twin Cooling™", "Cool Select+", "Metal Cooling", "Total No Frost"]
    },
    {
      sku: "BRB70F30BES0EF", name: "F1rst 60 AI Plus", tag: "Nicchia 55 × 194 cm",
      title: "Frigorifero combinato da incasso 1,94 m, 298 L, Total No Frost",
      w: 54, h: 193.5, d: 55, cap: 298, cls: "E",
      img: IMG + "brb70f30bes0ef/gallery/it-brb80f-twc-537141-brb70f30bes0ef-544977088",
      url: PDP + "brb80f-twc-298l-white-brb70f30bes0ef/",
      label: LABEL + "brb70f30bes0ef-energylabel.pdf",
      usps: ["ai", "twin", "coolSelect", "optimal2", "noFrost", "power", "space", "light", "smart"],
      chips: ["AI Energy Mode", "Twin Cooling™", "Cool Select+", "Optimal Fresh+", "Total No Frost"]
    },
    {
      sku: "BRB38G705DWW", name: "F1rst 75 AI", tag: "Nicchia 70 × 194 cm",
      title: "Frigorifero combinato da incasso 1,94 m, 389 L, Total No Frost",
      w: 69, h: 193.5, d: 55, cap: 389, cls: "D",
      img: IMG + "brb38g705dwwef/gallery/it-built-in-bottom-mount-freezer-smartthings-ai-energy-mode-and-metal-cooling-503518-brb38g705dwwef-540943701",
      url: PDP + "brb6500d-382l-white-brb38g705dwwef/",
      label: LABEL + "brb38g705dwwef-energylabel.pdf",
      usps: ["ai", "twinPlus", "optimal1", "metal", "noFrost", "powerFreeze", "space", "tray", "light", "smart"],
      chips: ["AI Energy Mode", "Twin Cooling Plus™", "Metal Cooling", "Multi Tray", "Total No Frost"]
    }
  ];

  /* ---------- helpers ---------- */
  function $(id) { return document.getElementById(id); }

  function el(tag, attrs) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === "class") node.className = attrs[k];
        else if (k === "text") node.textContent = attrs[k];
        else node.setAttribute(k, attrs[k]);
      });
    }
    for (var i = 2; i < arguments.length; i++) {
      var c = arguments[i];
      if (c == null) continue;
      node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    }
    return node;
  }

  function svg(cls, paths) {
    var ns = "http://www.w3.org/2000/svg";
    var s = document.createElementNS(ns, "svg");
    s.setAttribute("viewBox", "0 0 24 24");
    s.setAttribute("aria-hidden", "true");
    if (cls) s.setAttribute("class", cls);
    paths.forEach(function (d) {
      var p = document.createElementNS(ns, "path");
      p.setAttribute("d", d);
      s.appendChild(p);
    });
    return s;
  }

  function norm(s) {
    return String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  }

  function cm(x) {
    return x == null ? "n.d." : String(x).replace(".", ",");
  }

  function dims(w, h, d) {
    if (w == null && h == null) return "Misure non disponibili";
    var s = cm(w) + " × " + cm(h);
    if (d != null) s += " × " + cm(d);
    return s + " cm";
  }

  /* ---------- indice di ricerca ---------- */
  var INDEX = D.rows.map(function (r, i) {
    return { i: i, nm: norm(r[1]), nb: norm(r[0]) };
  });

  function search(raw) {
    var qAll = norm(raw);
    if (qAll.length < 2) return null;
    var tokens = raw.split(/\s+/).map(norm).filter(Boolean);
    var hits = [];
    for (var k = 0; k < INDEX.length; k++) {
      var e = INDEX[k], score;
      if (e.nm === qAll) score = 0;
      else if (e.nm.indexOf(qAll) === 0) score = 1;
      else if (e.nm.indexOf(qAll) > 0) score = 2;
      else {
        var all = true;
        for (var t = 0; t < tokens.length; t++) {
          if (e.nm.indexOf(tokens[t]) < 0 && e.nb.indexOf(tokens[t]) < 0) { all = false; break; }
        }
        if (!all) continue;
        score = 3;
      }
      hits.push({ i: e.i, score: score });
    }
    hits.sort(function (a, b) { return a.score - b.score || a.i - b.i; });
    return hits;
  }

  /* ---------- regole (stesse del foglio Excel), per la verifica con le misure ---------- */
  function roundCm(x) {
    var f = Math.floor(x), frac = x - f;
    if (Math.abs(frac - 0.5) < 1e-9) return f % 2 === 0 ? f : f + 1;
    return Math.round(x);
  }

  function rule(type, w, h) {
    if (type !== 0) {
      var why = type === 1 ? "Monoporta: il mobile cambia"
        : type === 2 ? "Freezer in alto: il mobile cambia"
        : "Tipologia non coperta dalla gamma Samsung da incasso";
      return { outcome: 2, sku: -1, note: why };
    }
    var W = roundCm(w), H = roundCm(h);
    var hOk = H >= 177 && H <= 196;
    if (W >= 52 && W <= 56 && hOk) return { outcome: 0, sku: H <= 191 ? 0 : 1, note: "" };
    if (W >= 68 && W <= 71 && hOk) return { outcome: 0, sku: 2, note: "" };
    var wNear = (W >= 51 && W <= 57) || (W >= 67 && W <= 72);
    var hNear = H >= 175 && H <= 198;
    if (wNear && hNear) return { outcome: 1, sku: -1, note: "Misure appena fuori range: misurare la nicchia" };
    return { outcome: 2, sku: -1, note: "Misure fuori range (" + cm(w) + " x " + cm(h) + " cm)" };
  }

  /* ---------- immagini ---------- */
  function productImage(p, size) {
    var img = el("img", {
      src: p.img + "?$" + size + "_PNG$", alt: "Samsung " + p.name + " " + p.sku,
      loading: "lazy", decoding: "async", referrerpolicy: "no-referrer"
    });
    img.addEventListener("error", function () {
      var ph = el("div", { class: "ph" });
      var s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      s.setAttribute("viewBox", "0 0 84 132");
      s.setAttribute("aria-hidden", "true");
      s.innerHTML = '<rect x="2" y="2" width="80" height="128" rx="6"/><path d="M2 78h80M14 30v20M14 90v14"/>';
      ph.appendChild(s);
      ph.appendChild(document.createTextNode(p.name));
      img.replaceWith(ph);
    });
    return img;
  }

  /* ---------- scheda prodotto Samsung ---------- */
  function productCard(p) {
    var specs = el("ul", { class: "specs" },
      el("li", null, el("b", { text: cm(p.w) + " × " + cm(p.h) + " × " + cm(p.d) }), el("span", { text: "L × A × P (cm)" })),
      el("li", null, el("b", { text: p.cap + " L" }), el("span", { text: "Capacità totale" })),
      el("li", null, el("b", { text: "Classe " + p.cls }), el("span", { text: "Efficienza energetica" })),
      el("li", null, el("b", { text: "A traino" }), el("span", { text: "Montaggio anta" }))
    );
    var usps = el("ul", { class: "usps" });
    p.usps.forEach(function (k) {
      usps.appendChild(el("li", null, el("b", { text: U[k][0] }), el("span", { text: U[k][1] })));
    });
    return el("article", { class: "product" },
      el("div", { class: "product-media" }, productImage(p, "1164_932")),
      el("div", { class: "product-body" },
        el("span", { class: "tag", text: "Il Samsung compatibile" }),
        el("h3", { text: "Samsung " + p.name }),
        el("p", { class: "product-sub", text: p.title }),
        el("p", { class: "sku", text: p.sku }),
        specs,
        el("p", { class: "usp-title", text: "Perché sceglierlo" }),
        usps,
        el("div", { class: "cta" },
          el("a", { class: "btn btn-dark", href: p.url, target: "_blank", rel: "noopener noreferrer", text: "Scheda prodotto su samsung.com" }),
          el("a", { class: "link", href: p.label, target: "_blank", rel: "noopener noreferrer", text: "Etichetta energetica (PDF)" })
        )
      )
    );
  }

  /* ---------- esito ---------- */
  function showDetail(o, opts) {
    var p = o.sku >= 0 ? PRODUCTS[o.sku] : null;
    var cls = OUTCOME_CLASS[o.outcome];
    var headline, text;
    if (o.outcome === 0) {
      headline = "Compatibile";
      text = "Si sostituisce con Samsung " + p.name + " (" + p.sku + "), nella stessa nicchia.";
    } else if (o.outcome === 1) {
      headline = "Da verificare";
      text = "Le misure sono al limite o non sono disponibili: misura la nicchia e confrontala con la gamma F1rst qui sotto.";
    } else {
      headline = "Non compatibile";
      text = "Nessun Samsung F1rst da incasso entra in questa nicchia senza modificare il mobile.";
    }

    var facts = el("ul", { class: "facts" },
      el("li", null, el("b", { text: "Tipologia" }), TYPE_LABEL[o.type]),
      el("li", null, el("b", { text: o.d != null ? "L × A × P" : "L × A" }), dims(o.w, o.h, o.d))
    );
    if (o.mount != null) facts.appendChild(el("li", null, el("b", { text: "Montaggio anta" }), MOUNT_LABEL[o.mount]));

    var verdict = el("div", { class: "verdict " + cls },
      el("div", { class: "verdict-top" },
        el("div", null,
          el("p", { class: "verdict-label", text: "Esito" }),
          el("h2", { text: headline })
        )
      ),
      el("p", { class: "verdict-text", text: text }),
      el("div", { class: "old" },
        el("p", { class: "old-name" }, el("span", { text: o.brand }), o.model),
        facts
      ),
      o.note ? el("div", { class: "note" }, el("b", { text: "Nota per il venditore" }), o.note) : null,
      el("p", { class: "remind", text: "Prima dell'acquisto verifica sempre le misure della nicchia (L × A × P): l'elenco riporta le misure del prodotto, non della nicchia." })
    );

    var box = $("detail");
    box.textContent = "";
    box.appendChild(verdict);
    if (p) box.appendChild(productCard(p));
    else box.appendChild(el("div", { class: "cta" }, el("a", { class: "btn btn-light", href: "#gamma", text: "Vedi la gamma F1rst da incasso" })));
    $("dettaglio").hidden = false;
    if (opts && opts.focus) {
      box.focus({ preventScroll: true });
      $("dettaglio").scrollIntoView({ block: "start", behavior: "instant" });
    }
  }

  function fromRow(i) {
    var r = D.rows[i];
    return { brand: r[0], model: r[1], type: r[2], w: r[3], h: r[4], d: r[5], mount: r[6], sku: r[7], outcome: r[8], note: r[9] };
  }

  /* ---------- lista risultati ---------- */
  var current = -1;

  function renderResults(raw) {
    var list = $("results"), status = $("status");
    list.textContent = "";
    status.textContent = "";
    $("clear").hidden = raw.length === 0;
    var hits = search(raw.trim());
    if (hits === null) {
      if (raw.trim().length === 1) status.appendChild(el("span", { class: "light", text: "Scrivi almeno 2 caratteri." }));
      hideDetail();
      return;
    }
    if (hits.length === 0) {
      status.appendChild(document.createTextNode("Nessun modello trovato. "));
      status.appendChild(el("span", { class: "light", text: "Prova con meno caratteri, oppure usa la verifica con le misure qui sotto." }));
      hideDetail();
      return;
    }
    status.appendChild(document.createTextNode(hits.length === 1 ? "1 modello trovato" : hits.length + " modelli trovati"));
    if (hits.length > MAX_ROWS) {
      status.appendChild(el("span", { class: "light", text: " · ecco i primi " + MAX_ROWS + ": aggiungi caratteri per restringere" }));
    }
    hits.slice(0, MAX_ROWS).forEach(function (h) {
      var r = D.rows[h.i];
      var btn = el("button", { type: "button", class: "row", "data-i": String(h.i) },
        el("div", { class: "row-main" },
          el("div", { class: "row-brand", text: r[0] }),
          el("div", { class: "row-model", text: r[1] })
        ),
        el("div", { class: "row-meta", text: TYPE_SHORT[r[2]] + " · " + dims(r[3], r[4], null) }),
        el("span", { class: "badge " + OUTCOME_CLASS[r[8]], text: D.outcomes[r[8]] }),
        svg("row-chev", ["m9 6 6 6-6 6"])
      );
      if (h.i === current) btn.setAttribute("aria-current", "true");
      list.appendChild(el("li", null, btn));
    });
    var exact = hits[0].score === 0 && (hits.length === 1 || hits[1].score !== 0);
    if (hits.length === 1 || exact) select(hits[0].i, false);
    else hideDetail();
  }

  function hideDetail() {
    current = -1;
    $("dettaglio").hidden = true;
    $("detail").textContent = "";
  }

  function select(i, focus) {
    current = i;
    Array.prototype.forEach.call($("results").querySelectorAll(".row"), function (b) {
      if (Number(b.getAttribute("data-i")) === i) b.setAttribute("aria-current", "true");
      else b.removeAttribute("aria-current");
    });
    showDetail(fromRow(i), { focus: focus });
  }

  /* ---------- gamma ---------- */
  function renderRange() {
    var grid = $("range-grid");
    PRODUCTS.forEach(function (p) {
      var chips = el("ul", { class: "chips" });
      p.chips.forEach(function (c) { chips.appendChild(el("li", { text: c })); });
      grid.appendChild(el("article", { class: "card" },
        el("div", { class: "card-media" }, productImage(p, "330_330")),
        el("div", { class: "card-body" },
          el("h3", { text: p.name }),
          el("p", { class: "sku", text: p.sku }),
          el("ul", { class: "card-specs" },
            el("li", null, "Per nicchie", el("b", { text: p.tag.replace("Nicchia ", "") })),
            el("li", null, "L × A × P", el("b", { text: cm(p.w) + " × " + cm(p.h) + " × " + cm(p.d) + " cm" })),
            el("li", null, "Capacità", el("b", { text: p.cap + " L" })),
            el("li", null, "Classe energetica", el("b", { text: p.cls }))
          ),
          chips,
          el("a", { class: "btn btn-light", href: p.url, target: "_blank", rel: "noopener noreferrer", text: "Scopri di più" })
        )
      ));
    });
  }

  /* ---------- eventi ---------- */
  var input = $("q");

  input.addEventListener("input", function () { renderResults(input.value); });

  $("search-form").addEventListener("submit", function (ev) {
    ev.preventDefault();
    var first = $("results").querySelector(".row");
    if (first) select(Number(first.getAttribute("data-i")), true);
    input.blur();
  });

  $("clear").addEventListener("click", function () {
    input.value = "";
    renderResults("");
    input.focus();
  });

  $("results").addEventListener("click", function (ev) {
    var btn = ev.target.closest(".row");
    if (btn) select(Number(btn.getAttribute("data-i")), true);
  });

  $("manual-form").addEventListener("submit", function (ev) {
    ev.preventDefault();
    var type = Number($("m-type").value);
    var w = parseFloat($("m-w").value.replace(",", "."));
    var h = parseFloat($("m-h").value.replace(",", "."));
    var err = $("m-error");
    if (!(w >= 20 && w <= 150) || !(h >= 40 && h <= 250)) {
      err.textContent = "Inserisci larghezza e altezza in centimetri (es. 54 e 177,5).";
      err.hidden = false;
      return;
    }
    err.hidden = true;
    var res = rule(type, w, h);
    current = -1;
    Array.prototype.forEach.call($("results").querySelectorAll(".row"), function (b) { b.removeAttribute("aria-current"); });
    showDetail({
      brand: "MISURE INSERITE", model: "Frigorifero attuale", type: type, w: w, h: h, d: null,
      mount: null, sku: res.sku, outcome: res.outcome, note: res.note
    }, { focus: true });
  });

  renderRange();

  var m = /^#q=(.+)$/.exec(location.hash);
  if (m) {
    try { input.value = decodeURIComponent(m[1]).slice(0, 60); } catch (e) { /* hash non valido: ignora */ }
    renderResults(input.value);
  }
})();

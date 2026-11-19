/* Compatibilità frigoriferi da incasso → Samsung F1rst.
   Tutto gira nel browser: nessuna richiesta di rete, nessun dato salvato.

   Versione generale: propone la tipologia Samsung (F1rst 60 AI, F1rst 60 AI Plus,
   F1rst 75 AI) e mostra tutte le versioni F1rst di quella tipologia.
   Versione retailer (?r=unieuro): propone il modello preciso dell'assortimento. */
(function () {
  "use strict";

  var D = window.FRIDGE_DATA;
  var MAX_ROWS = 60;
  var IMG = "https://images.samsung.com/is/image/samsung/";
  var PDP = "https://www.samsung.com/it/refrigerators/built-in-bottom-mount-freezer/";
  var LABEL = "https://images.samsung.com/is/content/samsung/p6/common/energylabel/common-energylabel-";

  /* ---------- assortimenti retailer ---------- */
  var RETAILERS = {
    unieuro: { name: "Unieuro", skus: ["BRB80F26ACS0", "BRB70F30BES0", "BRB38G705DWW"] }
  };
  var RKEY = (new URLSearchParams(location.search).get("r") || "").toLowerCase();
  var RETAILER = RETAILERS[RKEY] || null;

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
    coolSelect: ["Cool Select+", "Il freezer cambia funzione con un tocco: anche zona frigo o refrigerazione a -5°, -1° o 2°."],
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
    smart: ["SmartThings", "Wi-Fi integrato: consumi sotto controllo, avvisi e gestione del frigorifero dall'app."]
  };
  /* ordine in cui mostrare le caratteristiche; "chip" = etichetta breve */
  var FEAT_ORDER = ["ai", "twinPlus", "twin", "coolSelect", "metal", "optimal2", "optimal1", "noFrost", "power", "powerFreeze", "space", "rack", "tray", "light", "smart"];
  var CHIP = {
    ai: "AI Energy Mode", twinPlus: "Twin Cooling Plus™", twin: "Twin Cooling™", coolSelect: "Cool Select+",
    metal: "Metal Cooling", optimal2: "Optimal Fresh+", optimal1: "Optimal Fresh+", noFrost: "Total No Frost",
    power: "Power Cool", powerFreeze: "Power Freeze", space: "SpaceMax™", rack: "Rack & Shelf™",
    tray: "Multi Tray", light: "Luci dimmerabili", smart: "Wi-Fi"
  };

  /* ---------- tipologie Samsung (stesso ordine di data.js → families) ---------- */
  var FAMILIES = [
    { name: "F1rst 60 AI", niche: "55 × 178 cm", w: 54, h: 177.5, d: 55, height: "1,78 m" },
    { name: "F1rst 60 AI Plus", niche: "55 × 194 cm", w: 54, h: 193.5, d: 55, height: "1,94 m" },
    { name: "F1rst 75 AI", niche: "70 × 194 cm", w: 69, h: 193.5, d: 55, height: "1,94 m" }
  ];

  /* ---------- libreria F1rst (fonte: schede prodotto samsung.com/it) ---------- */
  function p6(sku, id) { return "p6pim/it/" + sku.toLowerCase() + "ef/gallery/" + id; }
  var A60 = ["ai", "optimal2", "noFrost", "space", "light", "smart"];
  var A75 = ["ai", "twinPlus", "coolSelect", "optimal1", "metal", "noFrost", "power", "space", "smart"];
  var SKUS = [
    // F1rst 60 AI · 264 L, Twin Cooling
    { sku: "BRB80F26ACS0", fam: 0, cap: 264, cls: "C", kwh: 148, slug: "brb80f-twc-264l-white-brb80f26acs0ef",
      img: p6("BRB80F26ACS0", "it--brb80f26acs0ef-550030700"), f: A60.concat(["twin", "coolSelect", "metal", "power", "rack"]) },
    { sku: "BRB80F26BCS0", fam: 0, cap: 264, cls: "C", kwh: 148, slug: "brb80f-twc-264l-white-brb80f26bcs0ef",
      img: p6("BRB80F26BCS0", "it--brb80f26bcs0ef-550034960"), f: A60.concat(["twin", "coolSelect", "metal", "power"]) },
    { sku: "BRB80F26ADS0", fam: 0, cap: 264, cls: "D", kwh: 185, slug: "brb80f-twc-264l-white-brb80f26ads0ef",
      img: p6("BRB80F26ADS0", "it--brb80f26ads0ef-550040525"), f: A60.concat(["twin", "coolSelect", "metal", "power", "rack"]) },
    { sku: "BRB80F26BDS0", fam: 0, cap: 264, cls: "D", kwh: 185, slug: "brb80f-twc-264l-white-brb80f26bds0ef",
      img: p6("BRB80F26BDS0", "it--brb80f26bds0ef-550036811"), f: A60.concat(["twin", "coolSelect", "metal", "power"]) },
    { sku: "BRB70F26BDS0", fam: 0, cap: 264, cls: "D", kwh: 185, slug: "brb80f-twc-264l-white-brb70f26bds0ef",
      img: p6("BRB70F26BDS0", "it--brb70f26bds0ef-550035329"), f: A60.concat(["twin", "coolSelect", "power"]) },
    // F1rst 60 AI · 267 L, raffreddamento singolo
    { sku: "BRB80F26CES0", fam: 0, cap: 267, cls: "E", kwh: 231, slug: "brb80f-mono-brb70f26cef0ef-267l-white-brb80f26ces0ef",
      img: p6("BRB80F26CES0", "it-brb80f-mono-brb70f26cef0ef-537147-brb80f26ces0ef-544978001"), f: A60.concat(["metal", "powerFreeze", "rack"]) },
    { sku: "BRB80F26DES0", fam: 0, cap: 267, cls: "E", kwh: 231, slug: "brb80f-mono-brb70f26cef0ef-267l-white-brb80f26des0ef",
      img: p6("BRB80F26DES0", "it-brb80f-mono-brb70f26cef0ef-537148-brb80f26des0ef-544978064"), f: A60.concat(["metal", "powerFreeze"]) },
    { sku: "BRB70F26CES0", fam: 0, cap: 267, cls: "E", kwh: 231, slug: "brb80f-mono-brb70f26cef0ef-267l-white-brb70f26ces0ef",
      img: p6("BRB70F26CES0", "it-brb80f-mono-brb70f26cef0ef-brb70f26ces0ef-544976994"), f: A60.concat(["powerFreeze", "rack"]) },
    // F1rst generazione precedente (stessa nicchia 55 × 178)
    { sku: "BRB260087WW", fam: 0, cap: 266, cls: "G", kwh: 317, prev: true, slug: "266l-snow-white-brb260087ww-ef",
      label: "brb260087ww-ef", img: "it-bottom-mount-freezer-brb260087ww-brb260087ww-ef-frontivorywhite-61779711",
      f: ["twinPlus", "coolSelect", "metal", "noFrost", "power", "rack"] },
    { sku: "BRB260010WW", fam: 0, cap: 268, cls: "G", kwh: 354, prev: true, slug: "268l-snow-white-brb260010ww-ef",
      label: "brb260010ww-ef", img: "it-bottom-mount-freezer-brb260010ww-brb260010ww-ef-frontwhite-161036082",
      f: ["noFrost", "powerFreeze"] },
    // F1rst 60 AI Plus · 298 L
    { sku: "BRB80F30AES0", fam: 1, cap: 298, cls: "E", kwh: 229, slug: "brb80f-twc-298l-white-brb80f30aes0ef",
      img: p6("BRB80F30AES0", "it-brb80f-twc-537149-brb80f30aes0ef-544978592"), f: A60.concat(["twin", "coolSelect", "metal", "power", "rack"]) },
    { sku: "BRB70F30BES0", fam: 1, cap: 298, cls: "E", kwh: 229, slug: "brb80f-twc-298l-white-brb70f30bes0ef",
      img: p6("BRB70F30BES0", "it-brb80f-twc-537141-brb70f30bes0ef-544977088"), f: A60.concat(["twin", "coolSelect", "power"]) },
    // F1rst 75 AI · 389 L
    { sku: "BRB38G705DWW", fam: 2, cap: 389, cls: "D", kwh: 206, slug: "brb6500d-382l-white-brb38g705dwwef",
      img: p6("BRB38G705DWW", "it--brb38g705dwwef-550027866"), f: A75.concat(["tray"]) },
    { sku: "BRB38G705EWW", fam: 2, cap: 389, cls: "E", kwh: 258, slug: "brb6500d-382l-white-brb38g705ewwef",
      img: p6("BRB38G705EWW", "it-built-in-bottom-mount-freezer-smartthings-ai-energy-mode-and-metal-cooling-503523-brb38g705ewwef-540944215"), f: A75.concat(["tray"]) },
    { sku: "BRB38G703EWW", fam: 2, cap: 389, cls: "E", kwh: 258, slug: "brb6500d-382l-white-brb38g703ewwef",
      img: p6("BRB38G703EWW", "it-built-in-bottom-mount-freezer-smartthings-ai-energy-mode-and-metal-cooling-brb38g703ewwef-540870660"), f: A75 }
  ];
  SKUS.forEach(function (p) {
    var F = FAMILIES[p.fam];
    p.name = F.name;
    p.w = F.w; p.h = F.h; p.d = F.d;
    p.url = PDP + p.slug + "/";
    p.labelUrl = LABEL + (p.label || p.sku.toLowerCase() + "ef") + "-energylabel.pdf";
    p.img = IMG + p.img;
    p.f = FEAT_ORDER.filter(function (k) { return p.f.indexOf(k) >= 0; });
    if (p.prev) p.name = "F1rst";
  });

  /* assortimento visibile in questa versione */
  var VISIBLE = RETAILER
    ? SKUS.filter(function (p) { return RETAILER.skus.indexOf(p.sku) >= 0; })
    : SKUS;

  FAMILIES.forEach(function (F, i) {
    F.skus = VISIBLE.filter(function (p) { return p.fam === i; });
    var cur = F.skus.filter(function (p) { return !p.prev; });
    if (!cur.length) cur = F.skus;
    /* caratteristiche presenti in tutte le versioni attuali = caratteristiche della tipologia */
    F.common = FEAT_ORDER.filter(function (k) {
      return cur.length && cur.every(function (p) { return p.f.indexOf(k) >= 0; });
    });
    F.lead = cur[0];
    var caps = cur.map(function (p) { return p.cap; });
    var cls = cur.map(function (p) { return p.cls; }).sort();
    F.capText = Math.min.apply(null, caps) === Math.max.apply(null, caps)
      ? caps[0] + " L" : Math.min.apply(null, caps) + "–" + Math.max.apply(null, caps) + " L";
    F.clsText = cls[0] === cls[cls.length - 1] ? cls[0] : cls[0] + "–" + cls[cls.length - 1];
  });

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

  function extLink(cls, href, text) {
    return el("a", { class: cls, href: href, target: "_blank", rel: "noopener noreferrer", text: text });
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
        : type === 2 ? "Freezer in alto (TMF): il mobile cambia"
        : "Tipologia non coperta dalla gamma Samsung da incasso";
      return { outcome: 2, fam: -1, note: why };
    }
    var W = roundCm(w), H = roundCm(h);
    if (H >= 176 && H <= 198) {
      if (W >= 52 && W <= 56) return { outcome: 0, fam: H <= 187 ? 0 : 1, note: "" };
      if (W >= 67 && W <= 71) return { outcome: 0, fam: 2, note: "" };
    }
    var wNear = (W >= 51 && W <= 57) || (W >= 66 && W <= 72);
    if (wNear && H >= 175 && H <= 199) {
      return { outcome: 1, fam: -1, note: "Misure appena fuori range (" + cm(w) + " x " + cm(h) + " cm): misurare la nicchia" };
    }
    return { outcome: 2, fam: -1, note: "Misure fuori range (" + cm(w) + " x " + cm(h) + " cm)" };
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

  function uspList(keys) {
    var ul = el("ul", { class: "usps" });
    keys.forEach(function (k) {
      ul.appendChild(el("li", null, el("b", { text: U[k][0] }), el("span", { text: U[k][1] })));
    });
    return ul;
  }

  function chipList(keys) {
    var ul = el("ul", { class: "chips" });
    keys.forEach(function (k) { ul.appendChild(el("li", { text: CHIP[k] })); });
    return ul;
  }

  function specGrid(items) {
    var ul = el("ul", { class: "specs" });
    items.forEach(function (it) {
      ul.appendChild(el("li", null, el("b", { text: it[0] }), el("span", { text: it[1] })));
    });
    return ul;
  }

  /* ---------- scheda: modello preciso (versione retailer) ---------- */
  function productCard(p) {
    return el("article", { class: "product" },
      el("div", { class: "product-media" }, productImage(p, "1164_932")),
      el("div", { class: "product-body" },
        el("span", { class: "tag", text: RETAILER ? "Disponibile da " + RETAILER.name : "Il Samsung compatibile" }),
        el("h3", { text: "Samsung " + p.name }),
        el("p", { class: "product-sub", text: "Combinato da incasso " + FAMILIES[p.fam].height + ", " + p.cap + " L, Total No Frost" }),
        el("p", { class: "sku", text: p.sku }),
        specGrid([
          [cm(p.w) + " × " + cm(p.h) + " × " + cm(p.d), "L × A × P (cm)"],
          [p.cap + " L", "Capacità totale"],
          ["Classe " + p.cls, "Efficienza energetica · " + p.kwh + " kWh/anno"],
          ["A traino", "Montaggio anta"]
        ]),
        el("p", { class: "usp-title", text: "Perché sceglierlo" }),
        uspList(p.f),
        el("div", { class: "cta" },
          extLink("btn btn-dark", p.url, "Scheda prodotto su samsung.com"),
          extLink("link", p.labelUrl, "Etichetta energetica (PDF)")
        )
      )
    );
  }

  /* ---------- scheda: tipologia (versione generale) ---------- */
  function variantRow(p, common) {
    var extra = p.f.filter(function (k) { return common.indexOf(k) < 0; });
    return el("li", { class: "variant" + (p.prev ? " prev" : "") },
      el("div", { class: "variant-media" }, productImage(p, "330_330")),
      el("div", { class: "variant-main" },
        el("p", { class: "variant-sku", text: p.sku }),
        el("p", { class: "variant-meta", text: p.cap + " L · Classe " + p.cls + (p.prev ? " · generazione precedente" : "") }),
        extra.length ? chipList(extra) : null
      ),
      extLink("variant-link", p.url, "Scheda")
    );
  }

  function familyCard(fi) {
    var F = FAMILIES[fi];
    var list = el("ul", { class: "variants" });
    F.skus.forEach(function (p) { list.appendChild(variantRow(p, F.common)); });
    return el("article", { class: "product" },
      el("div", { class: "product-media" }, productImage(F.lead, "1164_932")),
      el("div", { class: "product-body" },
        el("span", { class: "tag", text: "La tipologia Samsung compatibile" }),
        el("h3", { text: "Samsung " + F.name }),
        el("p", { class: "product-sub", text: "Combinato da incasso " + F.height + ", " + F.capText + ", Total No Frost · per nicchie " + F.niche }),
        specGrid([
          [cm(F.w) + " × " + cm(F.h) + " × " + cm(F.d), "L × A × P (cm)"],
          [F.capText, "Capacità totale"],
          ["Classe " + F.clsText, "Efficienza energetica"],
          ["A traino", "Montaggio anta"]
        ]),
        el("p", { class: "usp-title", text: "Su tutte le versioni" }),
        uspList(F.common),
        el("p", { class: "usp-title", text: "Versioni " + F.name + " (" + F.skus.length + ")" }),
        el("p", { class: "variants-hint", text: "Stesse misure: scegli la versione presente nel tuo assortimento. Le etichette indicano le caratteristiche in più." }),
        list
      )
    );
  }

  /* ---------- esito ---------- */
  function showDetail(o, opts) {
    var F = o.fam >= 0 ? FAMILIES[o.fam] : null;
    var p = F && RETAILER ? F.skus[0] : null;
    var cls = OUTCOME_CLASS[o.outcome];
    var headline, text;
    if (o.outcome === 0) {
      headline = "Compatibile";
      text = p
        ? "Si sostituisce con Samsung " + p.name + " (" + p.sku + "), nella stessa nicchia."
        : "Si sostituisce con un Samsung " + F.name + " (nicchia " + F.niche + "): " +
          (F.skus.length === 1 ? "una versione disponibile." : F.skus.length + " versioni con le stesse misure.");
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
        ),
        F ? el("p", { class: "verdict-fam", text: "Samsung " + F.name }) : null
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
    else if (F) box.appendChild(familyCard(o.fam));
    else box.appendChild(el("div", { class: "cta" }, el("a", { class: "btn btn-light", href: "#gamma", text: "Vedi la gamma F1rst da incasso" })));
    $("dettaglio").hidden = false;
    if (opts && opts.focus) {
      box.focus({ preventScroll: true });
      $("dettaglio").scrollIntoView({ block: "start", behavior: "instant" });
    }
  }

  function fromRow(i) {
    var r = D.rows[i];
    return { brand: r[0], model: r[1], type: r[2], w: r[3], h: r[4], d: r[5], mount: r[6], fam: r[7], outcome: r[8], note: r[9] };
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
        el("span", { class: "badge " + OUTCOME_CLASS[r[8]], text: r[7] >= 0 ? FAMILIES[r[7]].name : D.outcomes[r[8]] }),
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

  /* ---------- gamma / libreria ---------- */
  function skuCard(p) {
    return el("article", { class: "card" + (p.prev ? " prev" : "") },
      el("div", { class: "card-media" }, productImage(p, "330_330")),
      el("div", { class: "card-body" },
        p.prev ? el("p", { class: "card-flag", text: "Generazione precedente" }) : null,
        el("h4", { text: p.name }),
        el("p", { class: "sku", text: p.sku }),
        el("ul", { class: "card-specs" },
          el("li", null, "Capacità", el("b", { text: p.cap + " L" })),
          el("li", null, "Classe energetica", el("b", { text: p.cls + " · " + p.kwh + " kWh/anno" }))
        ),
        chipList(p.f.filter(function (k) { return ["ai", "twinPlus", "twin", "coolSelect", "metal", "rack", "tray"].indexOf(k) >= 0; })),
        extLink("btn btn-light", p.url, "Scopri di più")
      )
    );
  }

  function renderRange() {
    var wrap = $("range-families");
    FAMILIES.forEach(function (F) {
      if (!F.skus.length) return;
      var grid = el("div", { class: "range-grid" });
      F.skus.forEach(function (p) { grid.appendChild(skuCard(p)); });
      wrap.appendChild(el("section", { class: "fam" },
        el("div", { class: "fam-head" },
          el("h3", { text: "Samsung " + F.name }),
          el("p", { text: "Per nicchie " + F.niche + " · " + dims(F.w, F.h, F.d) + " · " + F.capText +
            (RETAILER ? "" : " · " + F.skus.length + (F.skus.length === 1 ? " versione" : " versioni")) })
        ),
        grid
      ));
    });
  }

  /* ---------- versione retailer ---------- */
  function applyRetailer() {
    if (!RETAILER) return;
    document.title = "Compatibilità frigoriferi da incasso | Samsung F1rst · " + RETAILER.name;
    $("retailer").textContent = "Assortimento " + RETAILER.name;
    $("retailer").hidden = false;
    $("range-lead").textContent = "I Samsung F1rst da incasso disponibili da " + RETAILER.name + ": uno per ciascuna nicchia più diffusa.";
    $("home").setAttribute("href", "?r=" + RKEY);
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
      mount: null, fam: res.fam, outcome: res.outcome, note: res.note
    }, { focus: true });
  });

  applyRetailer();
  renderRange();

  var m = /^#q=(.+)$/.exec(location.hash);
  if (m) {
    try { input.value = decodeURIComponent(m[1]).slice(0, 60); } catch (e) { /* hash non valido: ignora */ }
    renderResults(input.value);
  }
})();

/* ==================================================================
   INCUNABULA CROATICA — logika stranice
   ------------------------------------------------------------------
   Datoteka je podijeljena na označena poglavlja:
     1.  Pomoćne funkcije
     2.  Priprema podataka
     3.  Karta
     4.  Stanje filtara
     5.  Ispis bočnog popisa
     6.  Ispis kartica
     7.  Vremenska crta
     8.  Analiza (stupci)
     9.  Pokazatelji i bilješke
     10. Prozor sa zapisom
     11. Vođeni obilazak
     12. Izvoz podataka
     13. Povezivanje sučelja
     14. Sitnice (traka napretka, pojavljivanje, obavijesti)
   ================================================================== */
(function () {
"use strict";

/* ============ 1. POMOĆNE FUNKCIJE ============ */
var $  = function (s, k) { return (k || document).querySelector(s); };
var $$ = function (s, k) { return Array.prototype.slice.call((k || document).querySelectorAll(s)); };

/** Uklanja dijakritike da pretraga radi i bez kvačica. */
function bezKvacica(s) {
  return String(s || "")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d").replace(/Đ/g, "D")
    .toLowerCase();
}

/** Sprječava da tekst iz podataka postane HTML. */
function esc(s) {
  return String(s === null || s === undefined ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

/** 1 zapis / 2 zapisa / 5 zapisa — hrvatska sklonidba uz broj. */
function sklon(n, jed, dva, mnozina) {
  var d = n % 10, dd = n % 100;
  if (d === 1 && dd !== 11) return jed;
  if (d >= 2 && d <= 4 && (dd < 12 || dd > 14)) return dva;
  return mnozina;
}

function prebroji(niz) {
  var m = {};
  niz.forEach(function (k) { if (k) m[k] = (m[k] || 0) + 1; });
  return m;
}

function poredajBroj(mapa) {
  return Object.keys(mapa)
    .map(function (k) { return { kljuc: k, broj: mapa[k] }; })
    .sort(function (a, b) { return b.broj - a.broj || a.kljuc.localeCompare(b.kljuc, "hr"); });
}

var usporedi = function (a, b) { return String(a || "").localeCompare(String(b || ""), "hr"); };

/* ============ 2. PRIPREMA PODATAKA ============ */
var ZAPISI        = window.ZAPISI || [];
var MJ_TISAK      = window.MJESTA_TISKANJA || {};
var MJ_CUVANJE    = window.MJESTA_CUVANJA || {};
var POSTAVKE      = window.POSTAVKE || {};
var DIGITALIZIRANO = window.DIGITALIZIRANO || {};

var hrTiskari  = (POSTAVKE.hrvatskiTiskari || []).map(bezKvacica);
var hrAutori   = (POSTAVKE.hrvatskiAutori || []).map(bezKvacica);
var hrJezik    = POSTAVKE.hrvatskojezicna || [];

ZAPISI.forEach(function (z) {
  z.digitalno = DIGITALIZIRANO[z.id] || [];
  z.imaDigitalno = z.digitalno.length > 0;

  var tiskariTxt = bezKvacica(z.tiskari.join(" "));
  z.hrTiskar = hrTiskari.some(function (t) { return t && tiskariTxt.indexOf(t) !== -1; });

  var autorTxt = bezKvacica(z.autor + " " + z.naziv);
  z.hrAutor = hrAutori.some(function (a) { return a && autorTxt.indexOf(a) !== -1; });

  z.hrJezik = hrJezik.indexOf(z.id) !== -1;

  z.gradoviCuvanja = z.primjerci.map(function (p) { return p.mjesto; }).filter(Boolean);
  z.brojPrimjeraka = z.primjerci.length;

  z.trazi = bezKvacica([
    z.naziv, z.autor, z.naslov, z.mjestoTiskanja, z.godina,
    z.tiskari.join(" "),
    z.autorKomentara.join(" "), z.autorDodataka.join(" "),
    z.urednik.join(" "), z.prevoditelj.join(" "), z.ilustrator.join(" "),
    z.primjerci.map(function (p) { return p.ustanova + " " + p.mjesto; }).join(" ")
  ].join(" "));

  /* Ime pod kojim se zapis prikazuje: autor ako postoji, inače odrednica. */
  z.prikazAutor = z.autor || z.naziv || "";
});

var godine = ZAPISI.map(function (z) { return z.godina; }).filter(Boolean);
var GOD_MIN = Math.min.apply(null, godine);
var GOD_MAX = Math.max.apply(null, godine);

/* Zapisi bez koordinata za mjesto tiskanja ne mogu se prikazati na karti. */
var bezMjesta = ZAPISI.filter(function (z) { return !z.mjestoTiskanja; });
var bezKoordinata = ZAPISI.filter(function (z) {
  return z.mjestoTiskanja && !MJ_TISAK[z.mjestoTiskanja];
});
if (bezKoordinata.length) {
  console.warn("Nedostaju koordinate u data/mjesta.js za:",
    Array.from(new Set(bezKoordinata.map(function (z) { return z.mjestoTiskanja; }))));
}

/* ============ 3. KARTA ============ */
var POCETNI_POGLED = { centar: [46.6, 12.4], zum: 5 };
var OKVIR = null;   /* okvir koji obuhvaca sva mjesta tiskanja */
var karta, slojMjesta, slojCuvanja, slojPutova;
var markeri = {};       /* naziv mjesta -> Leaflet marker */
var maxPoMjestu = 1;

function napraviKartu() {
  karta = L.map("map", {
    center: POCETNI_POGLED.centar,
    zoom: POCETNI_POGLED.zum,
    minZoom: 3,
    maxZoom: 12,
    /* Djelomicne razine zuma: bez njih Leaflet skace po cijelim brojevima
       pa kadar ispadne osjetno siri nego sto treba. */
    zoomSnap: 0.25,
    zoomDelta: 0.5,
    scrollWheelZoom: false,
    zoomControl: true,
    attributionControl: true
  });
  karta.attributionControl.setPrefix('<a href="https://leafletjs.com">Leaflet</a>');

  L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: "abcd"
  }).addTo(karta);

  /* Natpisi gradova idu u zasebnu ravninu kako ih sepija-filtar podloge ne bi zamutio. */
  karta.createPane("natpisi");
  karta.getPane("natpisi").style.zIndex = 350;
  karta.getPane("natpisi").style.pointerEvents = "none";
  L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png", {
    subdomains: "abcd", opacity: .6, pane: "natpisi"
  }).addTo(karta);

  slojPutova  = L.layerGroup().addTo(karta);
  slojCuvanja = L.layerGroup();
  slojMjesta  = L.layerGroup().addTo(karta);

  /* Kotačić miša pomiče stranicu; zumira se tek nakon klika na kartu. */
  karta.on("focus click", function () { karta.scrollWheelZoom.enable(); });
  karta.on("mouseout", function () { karta.scrollWheelZoom.disable(); });

  /* Natpisi gradova pale se tek od zuma 6 navise. */
  function osvjeziRazinuDetalja() {
    karta.getContainer().classList.toggle("zoom-detalj", karta.getZoom() >= 6);
  }
  karta.on("zoomend", osvjeziRazinuDetalja);
  osvjeziRazinuDetalja();

  var ukupnoPoMjestu = prebroji(ZAPISI.map(function (z) { return z.mjestoTiskanja; }));
  maxPoMjestu = Math.max.apply(null, Object.keys(ukupnoPoMjestu).map(function (k) { return ukupnoPoMjestu[k]; }));

  Object.keys(MJ_TISAK).forEach(function (naziv) {
    var podaci = MJ_TISAK[naziv];
    if (!podaci || !podaci.koord) return;
    var marker = L.marker(podaci.koord, {
      icon: ikonaMjesta(naziv, ukupnoPoMjestu[naziv] || 0),
      riseOnHover: true,
      keyboard: true,
      title: naziv
    });
    marker.bindPopup(oblacicMjesta(naziv), {
      maxWidth: 300, minWidth: 250, closeButton: true,
      /* razmak da oblacic ne zavrsi ispod alatne trake iznad karte */
      autoPanPaddingTopLeft: [16, 78], autoPanPaddingBottomRight: [16, 24]
    });
    marker.addTo(slojMjesta);
    markeri[naziv] = marker;
  });

  /* Pogled se namjesta tako da stanu sva mjesta tiskanja. */
  var tocke = Object.keys(MJ_TISAK)
    .map(function (n) { return MJ_TISAK[n].koord; })
    .filter(Boolean);
  if (tocke.length) {
    OKVIR = L.latLngBounds(tocke).pad(0.06);
    karta.fitBounds(OKVIR, { animate: false });
  }

  Object.keys(MJ_CUVANJE).forEach(function (grad) {
    L.marker(MJ_CUVANJE[grad], {
      icon: L.divIcon({
        className: "hold-pin",
        html: '<div class="hold-body" title="' + esc(grad) + '"></div>',
        iconSize: [11, 11], iconAnchor: [5.5, 5.5]
      }),
      title: grad
    }).bindTooltip(grad, { direction: "top", offset: [0, -6] })
      .on("click", function () { stanje.mjestoCuvanja = grad; sinkroniziraj(); primijeni(); })
      .addTo(slojCuvanja);
  });

  /* Klik na gumb u oblačiću — poveznica s filtrom. */
  karta.on("popupopen", function (e) {
    var gumb = e.popup.getElement() && e.popup.getElement().querySelector(".pop-btn");
    if (!gumb) return;
    gumb.addEventListener("click", function () {
      stanje.mjesto = gumb.getAttribute("data-mjesto");
      sinkroniziraj(); primijeni();
      karta.closePopup();
      document.getElementById("placeList").scrollIntoView({ block: "nearest" });
    });
  });
}

function ikonaMjesta(naziv, broj) {
  var d = broj ? 24 + 30 * Math.sqrt(broj / maxPoMjestu) : 18;
  var hrv = ZAPISI.some(function (z) { return z.mjestoTiskanja === naziv && (z.hrTiskar || z.mjestoTiskanja === "Senj"); });
  return L.divIcon({
    className: "pin",
    html: '<div class="pin-body' + (hrv ? " cro" : "") + '" style="font-size:' + Math.max(10, d * .36) + 'px">' +
            (broj || "") +
          '</div><span class="pin-label">' + esc(naziv) + "</span>",
    iconSize: [d, d],
    iconAnchor: [d / 2, d / 2]
  });
}

function oblacicMjesta(naziv) {
  var podaci = MJ_TISAK[naziv];
  var svi = ZAPISI.filter(function (z) { return z.mjestoTiskanja === naziv; });
  var god = svi.map(function (z) { return z.godina; }).filter(Boolean);
  var tiskari = Object.keys(prebroji([].concat.apply([], svi.map(function (z) { return z.tiskari; }))));
  var primjeraka = svi.reduce(function (s, z) { return s + z.brojPrimjeraka; }, 0);

  return '' +
    '<div class="pop-title">' + esc(naziv) + "</div>" +
    '<div class="pop-sub">' + esc(podaci.drzava || "") + "</div>" +
    (podaci.biljeska ? '<p class="pop-note">' + esc(podaci.biljeska) + "</p>" : "") +
    '<div class="pop-stats">' +
      "<div><b>" + svi.length + "</b><small>izdanja</small></div>" +
      '<div><b class="raspon">' + (god.length ? Math.min.apply(null, god) + "–" + Math.max.apply(null, god) : "–") + "</b><small>godine</small></div>" +
      "<div><b>" + tiskari.length + "</b><small>" + sklon(tiskari.length, "tiskar", "tiskara", "tiskara") + "</small></div>" +
      "<div><b>" + primjeraka + "</b><small>primjeraka</small></div>" +
    "</div>" +
    '<button class="pop-btn" data-mjesto="' + esc(naziv) + '">Prikaži izdanja iz ovoga grada</button>';
}

/** Blago zakrivljena linija između dvije točke. */
function luk(od, doo, debljina) {
  var tocke = [], n = 24;
  var dx = doo[1] - od[1], dy = doo[0] - od[0];
  var duljina = Math.sqrt(dx * dx + dy * dy);
  var izboj = duljina * 0.16;
  var sx = -dy / (duljina || 1), sy = dx / (duljina || 1);
  for (var i = 0; i <= n; i++) {
    var t = i / n, w = 4 * t * (1 - t);      /* najveći otklon na sredini */
    tocke.push([
      od[0] + dy * t + sy * izboj * w,
      od[1] + dx * t + sx * izboj * w
    ]);
  }
  return L.polyline(tocke, {
    color: "#b08d57",
    weight: debljina,
    opacity: .42,
    smoothFactor: 1,
    interactive: false
  });
}

function crtajPutove(zapisi) {
  slojPutova.clearLayers();
  if (!prikazPutova) return;
  var parovi = {};
  zapisi.forEach(function (z) {
    var a = MJ_TISAK[z.mjestoTiskanja];
    if (!a) return;
    z.gradoviCuvanja.forEach(function (grad) {
      var b = MJ_CUVANJE[grad];
      if (!b) return;
      var k = z.mjestoTiskanja + "→" + grad;
      if (!parovi[k]) parovi[k] = { od: a.koord, doo: b, broj: 0 };
      parovi[k].broj++;
    });
  });
  var maks = Math.max.apply(null, Object.keys(parovi).map(function (k) { return parovi[k].broj; }).concat([1]));
  Object.keys(parovi).forEach(function (k) {
    var p = parovi[k];
    luk(p.od, p.doo, 0.6 + 2.6 * Math.sqrt(p.broj / maks)).addTo(slojPutova);
  });
}

/* ============ 4. STANJE FILTARA ============ */
var stanje = {
  tekst: "", mjesto: "", tiskar: "", mjestoCuvanja: "", skupina: "",
  godOd: null, godDo: null, sort: "godina-asc", prikazano: 12
};
var prikazPutova = false, prikazCuvanja = false;
var trenutni = [];   /* trenutačno filtrirani zapisi */

function filtriraj() {
  var t = bezKvacica(stanje.tekst).trim();
  return ZAPISI.filter(function (z) {
    if (t && z.trazi.indexOf(t) === -1) return false;
    if (stanje.mjesto && z.mjestoTiskanja !== stanje.mjesto) return false;
    if (stanje.tiskar && z.tiskari.indexOf(stanje.tiskar) === -1) return false;
    if (stanje.mjestoCuvanja && z.gradoviCuvanja.indexOf(stanje.mjestoCuvanja) === -1) return false;
    if (stanje.skupina === "hrTiskar" && !z.hrTiskar) return false;
    if (stanje.skupina === "hrAutor" && !z.hrAutor) return false;
    if (stanje.skupina === "hrJezik" && !z.hrJezik) return false;
    if (stanje.skupina === "digital" && !z.imaDigitalno) return false;
    if (stanje.godOd && (!z.godina || z.godina < stanje.godOd)) return false;
    if (stanje.godDo && (!z.godina || z.godina > stanje.godDo)) return false;
    return true;
  });
}

function poredaj(zapisi) {
  var kopija = zapisi.slice();
  var pravila = {
    "godina-asc":  function (a, b) { return (a.godina || 0) - (b.godina || 0) || usporedi(a.naslov, b.naslov); },
    "godina-desc": function (a, b) { return (b.godina || 0) - (a.godina || 0) || usporedi(a.naslov, b.naslov); },
    "autor":       function (a, b) { return usporedi(a.prikazAutor, b.prikazAutor); },
    "naslov":      function (a, b) { return usporedi(a.naslov, b.naslov); },
    "mjesto":      function (a, b) { return usporedi(a.mjestoTiskanja, b.mjestoTiskanja) || (a.godina || 0) - (b.godina || 0); },
    "primjerci":   function (a, b) { return b.brojPrimjeraka - a.brojPrimjeraka || (a.godina || 0) - (b.godina || 0); }
  };
  return kopija.sort(pravila[stanje.sort] || pravila["godina-asc"]);
}

function primijeni() {
  trenutni = poredaj(filtriraj());
  osvjeziMarkere();
  crtajPutove(trenutni);
  ispisiPopisMjesta();
  ispisiKartice();
  ispisiVremenskuCrtu();
  ispisiAnalizu();
  ispisiOznake();
  $("#filterCount").textContent = trenutni.length;
  $("#collectionCount").textContent =
    trenutni.length + " " + sklon(trenutni.length, "zapis", "zapisa", "zapisa") +
    " od ukupno " + ZAPISI.length;
  var jos = $("#showMoreBtn");
  jos.style.display = trenutni.length > stanje.prikazano ? "" : "none";
  jos.textContent = "Prikaži još " + Math.min(12, trenutni.length - stanje.prikazano);
}

function osvjeziMarkere() {
  var poMjestu = prebroji(trenutni.map(function (z) { return z.mjestoTiskanja; }));
  Object.keys(markeri).forEach(function (naziv) {
    var el = markeri[naziv].getElement();
    if (!el) return;
    var tijelo = el.querySelector(".pin-body");
    if (!tijelo) return;
    var broj = poMjestu[naziv] || 0;
    tijelo.textContent = broj || "";
    tijelo.classList.toggle("prigusen", broj === 0);
    tijelo.classList.toggle("aktivan", stanje.mjesto === naziv);
  });
}

/* ============ 5. ISPIS BOČNOG POPISA ============ */
function ispisiPopisMjesta() {
  var spremnik = $("#placeList");
  if (!trenutni.length) {
    spremnik.innerHTML = '<p class="empty-note">Nijedan zapis ne odgovara zadanim uvjetima.<br>Pokušajte poništiti filtre.</p>';
    return;
  }
  var skupine = {};
  trenutni.forEach(function (z) {
    var k = z.mjestoTiskanja || "Mjesto tiskanja nije zabilježeno";
    (skupine[k] = skupine[k] || []).push(z);
  });

  var html = Object.keys(skupine)
    .sort(function (a, b) { return skupine[b].length - skupine[a].length || usporedi(a, b); })
    .map(function (mjesto) {
      var lista = skupine[mjesto];
      var otvoreno = stanje.mjesto === mjesto || Object.keys(skupine).length <= 3;
      return '<div class="place-group' + (otvoreno ? " open" : "") + '" role="listitem">' +
        '<button class="place-head" type="button" data-mjesto="' + esc(mjesto) + '">' +
          '<span class="pn">' + esc(mjesto) + "</span>" +
          '<span class="pc">' + lista.length + "</span>" +
        "</button>" +
        '<div class="place-items">' +
          lista.slice().sort(function (a, b) { return (a.godina || 0) - (b.godina || 0); }).map(function (z) {
            return '<button class="pi" type="button" data-id="' + z.id + '">' +
              (z.imaDigitalno ? "<i>◆</i> " : "") + esc(z.naslov) +
              "<em>" + esc(z.prikazAutor || "—") + (z.godina ? " · " + z.godina : "") + "</em>" +
            "</button>";
          }).join("") +
        "</div>" +
      "</div>";
    }).join("");

  spremnik.innerHTML = html;

  $$(".place-head", spremnik).forEach(function (gumb) {
    gumb.addEventListener("click", function () {
      var skupina = gumb.parentElement;
      skupina.classList.toggle("open");
      var mjesto = gumb.getAttribute("data-mjesto");
      if (MJ_TISAK[mjesto] && skupina.classList.contains("open")) {
        /* Oblacic se otvara tek kad karta sleti — inace ga animacija leta
           pretekne pa se ne stigne sam pomaknuti ispod alatne trake. */
        karta.flyTo(MJ_TISAK[mjesto].koord, 7, { duration: 1.1 });
        karta.once("moveend", function () {
          if (markeri[mjesto]) markeri[mjesto].openPopup();
        });
      }
    });
  });
  $$(".pi", spremnik).forEach(function (gumb) {
    gumb.addEventListener("click", function () { otvoriZapis(+gumb.getAttribute("data-id")); });
  });
}

/* ============ 6. ISPIS KARTICA ============ */
function ispisiKartice() {
  var spremnik = $("#cards");
  var vidljivi = trenutni.slice(0, stanje.prikazano);
  if (!vidljivi.length) {
    spremnik.innerHTML = '<p class="empty-note">Nema zapisa za zadane uvjete.</p>';
    return;
  }
  spremnik.innerHTML = vidljivi.map(function (z) {
    var oznake = [];
    if (z.imaDigitalno) oznake.push('<span class="tag gold">Digitalizirano</span>');
    if (z.hrTiskar)     oznake.push('<span class="tag red">Hrvatski tiskar</span>');
    if (z.hrAutor)      oznake.push('<span class="tag">Hrvatski autor</span>');
    if (z.hrJezik)      oznake.push('<span class="tag">Glagoljica / hrvatski</span>');
    return '<button class="card" type="button" data-id="' + z.id + '">' +
      '<div class="card-year">' + (z.godina || "—") + "</div>" +
      '<h3 class="card-title">' + esc(z.naslov) + "</h3>" +
      '<div class="card-author">' + esc(z.prikazAutor || "bez navedenoga autora") + "</div>" +
      '<div class="card-meta">' +
        "<span>" + esc(z.mjestoTiskanja || "mjesto nije zabilježeno") +
          (z.tiskari.length ? " · <b>" + esc(z.tiskari[0]) + "</b>" + (z.tiskari.length > 1 ? " i dr." : "") : "") +
        "</span>" +
        "<span>" + z.brojPrimjeraka + " " + sklon(z.brojPrimjeraka, "zabilježen primjerak", "zabilježena primjerka", "zabilježenih primjeraka") + "</span>" +
      "</div>" +
      (oznake.length ? '<div class="card-tags">' + oznake.join("") + "</div>" : "") +
    "</button>";
  }).join("");

  $$(".card", spremnik).forEach(function (k) {
    k.addEventListener("click", function () { otvoriZapis(+k.getAttribute("data-id")); });
  });
}

/* ============ 7. VREMENSKA CRTA ============ */
function ispisiVremenskuCrtu() {
  var traka = $("#timeline"), os = $("#timelineAxis");
  var poGodini = prebroji(trenutni.map(function (z) { return z.godina; }));
  var maks = Math.max.apply(null, Object.keys(poGodini).map(function (g) { return poGodini[g]; }).concat([1]));

  var stupci = "", oznake = "";
  for (var g = GOD_MIN; g <= GOD_MAX; g++) {
    var n = poGodini[g] || 0;
    var aktivna = stanje.godOd === g && stanje.godDo === g;
    stupci += '<button class="tl-bar' + (n ? "" : " prazan") + (aktivna ? " aktivan" : "") + '"' +
      ' type="button" data-god="' + g + '"' +
      ' style="height:' + (n ? Math.max(4, (n / maks) * 100) : 2) + '%"' +
      ' title="' + g + ": " + n + " " + sklon(n, "zapis", "zapisa", "zapisa") + '"' +
      ' aria-label="' + g + ": " + n + '"><span>' + (n || "") + "</span></button>";
    oznake += "<div>" + (g % 5 === 0 ? g : "") + "</div>";
  }
  traka.innerHTML = stupci;
  os.innerHTML = oznake;

  $$(".tl-bar", traka).forEach(function (b) {
    b.addEventListener("click", function () {
      var g = +b.getAttribute("data-god");
      if (stanje.godOd === g && stanje.godDo === g) { stanje.godOd = stanje.godDo = null; }
      else { stanje.godOd = stanje.godDo = g; }
      sinkroniziraj(); primijeni();
    });
  });
}

/* ============ 8. ANALIZA ============ */
function ispisiStupce(spremnik, mapa, koliko) {
  var redci = poredajBroj(mapa).slice(0, koliko || 8);
  var maks = redci.length ? redci[0].broj : 1;
  spremnik.innerHTML = redci.length
    ? redci.map(function (r) {
        return '<div class="bar-row">' +
          '<span class="bar-name">' + esc(r.kljuc) + "</span>" +
          '<span class="bar-val">' + r.broj + "</span>" +
          '<span class="bar-track"><span class="bar-fill" style="width:' + (r.broj / maks * 100) + '%"></span></span>' +
        "</div>";
      }).join("")
    : '<p class="empty-note">Nema podataka.</p>';
}

function ispisiAnalizu() {
  ispisiStupce($("#barsPlaces"),  prebroji(trenutni.map(function (z) { return z.mjestoTiskanja; })));
  ispisiStupce($("#barsPrinters"), prebroji([].concat.apply([], trenutni.map(function (z) { return z.tiskari; }))));
  ispisiStupce($("#barsHolding"), prebroji([].concat.apply([], trenutni.map(function (z) { return z.gradoviCuvanja; }))));
}

/* ============ 9. POKAZATELJI I BILJEŠKE ============ */
function ispisiPokazatelje() {
  var mjesta   = Object.keys(prebroji(ZAPISI.map(function (z) { return z.mjestoTiskanja; })));
  var tiskari  = Object.keys(prebroji([].concat.apply([], ZAPISI.map(function (z) { return z.tiskari; }))));
  var primjeraka = ZAPISI.reduce(function (s, z) { return s + z.brojPrimjeraka; }, 0);
  var digitalnih = ZAPISI.filter(function (z) { return z.imaDigitalno; }).length;

  brojac($("#mTotal"),   ZAPISI.length);
  brojac($("#mPlaces"),  mjesta.length);
  brojac($("#mPrinters"), tiskari.length);
  brojac($("#mCopies"),  primjeraka);
  brojac($("#mDigital"), digitalnih);

  $("#heroMeta").textContent =
    ZAPISI.length + " zapisa · " + mjesta.length + " mjesta tiskanja · " +
    GOD_MIN + "–" + GOD_MAX + " · primjerci u " +
    Object.keys(prebroji([].concat.apply([], ZAPISI.map(function (z) { return z.gradoviCuvanja; })))).length +
    " hrvatskih mjesta";

  $("#noteRecords").textContent =
    ZAPISI.length + " bibliografskih zapisa i " + primjeraka + " zabilježenih primjeraka iz tablice Incunabula Croatica";
  $("#noteGeo").textContent =
    Object.keys(MJ_TISAK).length + " mjesta tiskanja i " + Object.keys(MJ_CUVANJE).length +
    " mjesta čuvanja s koordinatama (data/mjesta.js)";

  var biljeske = [];
  if (bezMjesta.length) {
    biljeske.push(bezMjesta.length + " " + sklon(bezMjesta.length, "zapis nema", "zapisa nema", "zapisa nema") +
      " podatak o mjestu tiskanja (br. " + bezMjesta.map(function (z) { return z.id; }).join(", ") +
      ") pa se ne može prikazati kao točka na karti");
  }
  var izvan = ZAPISI.filter(function (z) { return z.godina && z.godina > 1500; });
  if (izvan.length) {
    biljeske.push(izvan.length + " " + sklon(izvan.length, "zapis je", "zapisa su", "zapisa je") +
      " iz godine nakon 1500. (br. " + izvan.map(function (z) { return z.id; }).join(", ") +
      ") pa strogo uzevši ne pripada razdoblju inkunabula");
  }
  if (bezKoordinata.length) biljeske.push(bezKoordinata.length + " zapisa nema koordinate mjesta tiskanja");
  $("#noteIssues").textContent = biljeske.length ? biljeske.join("; ") + "." : "Nisu zabilježena odstupanja.";
}

function brojac(el, cilj) {
  if (!el) return;
  var pocetak = null, trajanje = 900;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { el.textContent = cilj; return; }
  function korak(vrijeme) {
    if (!pocetak) pocetak = vrijeme;
    var p = Math.min((vrijeme - pocetak) / trajanje, 1);
    el.textContent = Math.round(cilj * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(korak);
  }
  requestAnimationFrame(korak);
}

/* ============ 10. PROZOR SA ZAPISOM ============ */
var otvoreniId = null;

function upit(z) {
  return encodeURIComponent([z.prikazAutor, z.naslov, z.godina].filter(Boolean).join(" "));
}

function otvoriZapis(id) {
  var z = ZAPISI.filter(function (r) { return r.id === id; })[0];
  if (!z) return;
  otvoreniId = id;

  var suradnici = [
    ["Autor komentara", z.autorKomentara],
    ["Autor dodataka",  z.autorDodataka],
    ["Urednik",         z.urednik],
    ["Prevoditelj",     z.prevoditelj],
    ["Ilustrator",      z.ilustrator]
  ].filter(function (p) { return p[1] && p[1].length; });

  var oznake = [];
  if (z.imaDigitalno) oznake.push('<span class="tag gold">Digitalizirano</span>');
  if (z.hrTiskar)     oznake.push('<span class="tag red">Hrvatski tiskar</span>');
  if (z.hrAutor)      oznake.push('<span class="tag">Hrvatski autor</span>');
  if (z.hrJezik)      oznake.push('<span class="tag">Glagoljica / hrvatski</span>');

  var html = '' +
    '<p class="m-kicker">Zapis br. ' + z.id + " · Incunabula Croatica</p>" +
    '<h2 class="m-title" id="modalTitle">' + esc(z.naslov) + "</h2>" +
    '<p class="m-author">' + esc(z.prikazAutor || "bez navedenoga autora") + "</p>" +
    (oznake.length ? '<div class="m-tags">' + oznake.join("") + "</div>" : "") +

    '<dl class="m-grid">' +
      "<div><dt>Godina</dt><dd>" + (z.godina || "nije zabilježena") + "</dd></div>" +
      "<div><dt>Mjesto tiskanja</dt><dd>" + esc(z.mjestoTiskanja || "nije zabilježeno") + "</dd></div>" +
      "<div><dt>" + sklon(z.tiskari.length, "Tiskar", "Tiskari", "Tiskari") + "</dt><dd>" +
        (z.tiskari.length ? z.tiskari.map(esc).join("<br>") : "nije zabilježen") + "</dd></div>" +
      "<div><dt>Odrednica</dt><dd>" + esc(z.naziv || "—") + "</dd></div>" +
      suradnici.map(function (p) {
        return "<div><dt>" + p[0] + "</dt><dd>" + p[1].map(esc).join("<br>") + "</dd></div>";
      }).join("") +
    "</dl>" +

    '<section class="m-block">' +
      "<h4>Zabilježeni primjerci (" + z.brojPrimjeraka + ")</h4>" +
      '<div class="m-copies">' +
        (z.primjerci.length ? z.primjerci.map(function (p) {
          return '<div class="m-copy"><span class="mc-city">' + esc(p.mjesto || "—") + "</span>" +
                 "<span>" + esc(p.ustanova || "—") + "</span></div>";
        }).join("") : '<p class="m-hint">Nije zabilježen nijedan primjerak.</p>') +
      "</div>" +
    "</section>" +

    '<section class="m-block">' +
      "<h4>Digitalizirani primjerak</h4>" +
      '<div class="m-links">' +
        (z.digitalno.length
          ? z.digitalno.map(function (d) {
              return '<a class="m-link verified" href="' + esc(d.url) + '" target="_blank" rel="noopener noreferrer">' +
                "<span><b>" + esc(d.naziv || "Digitalizirani primjerak") + "</b>" +
                "<small>" + esc(d.ustanova || "") + (d.vrsta ? " · " + esc(d.vrsta) : "") + "</small></span>" +
                '<span class="arrow">↗</span></a>';
            }).join("")
          : '<p class="m-hint">Za ovaj zapis još nije upisana provjerena poveznica. ' +
            "Kad je pronađete, dodajte je u <code>data/digitalizirano.js</code> pod ključem " + z.id + ".</p>") +
      "</div>" +
    "</section>" +

    '<section class="m-block">' +
      "<h4>Pretraga u katalozima</h4>" +
      '<div class="m-links">' +
        (POSTAVKE.katalozi || []).map(function (k) {
          return '<a class="m-link" href="' + esc(k.url.replace("{q}", upit(z))) + '" target="_blank" rel="noopener noreferrer">' +
            "<span><b>" + esc(k.naziv) + "</b><small>" + esc(k.opis || "") + "</small></span>" +
            '<span class="arrow">↗</span></a>';
        }).join("") +
      "</div>" +
    "</section>" +

    (z.napomena ? '<section class="m-block"><h4>Napomena iz tablice</h4><p class="m-hint">' + esc(z.napomena) + "</p></section>" : "");

  $("#modalContent").innerHTML = html;

  var polozaj = trenutni.map(function (r) { return r.id; }).indexOf(id);
  $("#modalPos").textContent = polozaj >= 0 ? (polozaj + 1) + " / " + trenutni.length : "izvan trenutačnog filtra";
  $("#modalPrev").disabled = polozaj <= 0;
  $("#modalNext").disabled = polozaj < 0 || polozaj >= trenutni.length - 1;

  $("#modal").classList.remove("hidden");
  document.body.style.overflow = "hidden";
  $("#modalClose").focus();
  if (history.replaceState) history.replaceState(null, "", "#zapis-" + id);
}

function zatvoriZapis() {
  $("#modal").classList.add("hidden");
  document.body.style.overflow = "";
  otvoreniId = null;
  if (history.replaceState) history.replaceState(null, "", location.pathname + location.search);
}

function pomakniZapis(smjer) {
  var i = trenutni.map(function (r) { return r.id; }).indexOf(otvoreniId);
  if (i < 0) return;
  var j = i + smjer;
  if (j >= 0 && j < trenutni.length) otvoriZapis(trenutni[j].id);
}

/* ============ 11. VOĐENI OBILAZAK ============ */
var koraci = POSTAVKE.obilazak || [], korak = 0;

function pokreniObilazak() {
  if (!koraci.length) return;
  korak = 0;
  document.body.classList.add("tour-active");
  $("#tour").classList.remove("hidden");
  document.getElementById("karta").scrollIntoView({ behavior: "smooth", block: "start" });
  setTimeout(prikaziKorak, 450);
}

function prikaziKorak() {
  var k = koraci[korak];
  if (!k) return;
  $("#tourStep").textContent = "Korak " + (korak + 1) + " od " + koraci.length;
  $("#tourTitle").textContent = k.naslov;
  $("#tourText").textContent = k.tekst;
  $("#tourDots").innerHTML = koraci.map(function (_, i) {
    return "<i" + (i === korak ? ' class="on"' : "") + "></i>";
  }).join("");
  $("#tourNext").textContent = korak === koraci.length - 1 ? "Završi" : "Dalje ›";
  $("#tourPrev").disabled = korak === 0;

  if (k.putovi && !prikazPutova) prebaciPutove(true);
  if (k.mjesto && MJ_TISAK[k.mjesto]) {
    karta.flyTo(MJ_TISAK[k.mjesto].koord, k.zum || 5, { duration: 1.4 });
  } else if (OKVIR) {
    karta.flyToBounds(OKVIR, { duration: 1.4 });
  } else {
    karta.flyTo(POCETNI_POGLED.centar, k.zum || 5, { duration: 1.4 });
  }
  if (k.mjesto && markeri[k.mjesto]) {
    karta.once("moveend", function () { markeri[k.mjesto].openPopup(); });
  } else {
    karta.closePopup();
  }
}

function zavrsiObilazak() {
  document.body.classList.remove("tour-active");
  $("#tour").classList.add("hidden");
  karta.closePopup();
}

/* ============ 12. IZVOZ PODATAKA ============ */
function izveziCSV() {
  var stupci = ["RBR", "Autor", "Naslov", "Godina", "Tiskar", "Mjesto tiskanja",
                "Ustanova", "Mjesto čuvanja", "Digitalna poveznica"];
  function celija(v) { return '"' + String(v === null || v === undefined ? "" : v).replace(/"/g, '""') + '"'; }
  var redci = [stupci.map(celija).join(",")];
  trenutni.forEach(function (z) {
    redci.push([
      z.id, z.prikazAutor, z.naslov, z.godina || "", z.tiskari.join("; "), z.mjestoTiskanja,
      z.primjerci.map(function (p) { return p.ustanova; }).join("; "),
      z.gradoviCuvanja.join("; "),
      z.digitalno.map(function (d) { return d.url; }).join("; ")
    ].map(celija).join(","));
  });
  /* \ufeff je oznaka koja Excelu kaze da je datoteka u UTF-8 kodiranju. */
  var blob = new Blob(["\ufeff" + redci.join("\r\n")], { type: "text/csv;charset=utf-8;" });
  var a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "inkunabule-izbor-" + trenutni.length + ".csv";
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
  obavijest("Preuzeto " + trenutni.length + " " + sklon(trenutni.length, "zapis", "zapisa", "zapisa"));
}

/* ============ 13. POVEZIVANJE SUČELJA ============ */
function napuniIzbornike() {
  function napuni(id, mapa, prazno) {
    var el = $(id);
    var redci = poredajBroj(mapa);
    el.innerHTML = '<option value="">' + prazno + "</option>" +
      redci.map(function (r) {
        return '<option value="' + esc(r.kljuc) + '">' + esc(r.kljuc) + " (" + r.broj + ")</option>";
      }).join("");
  }
  napuni("#placeFilter",   prebroji(ZAPISI.map(function (z) { return z.mjestoTiskanja; })), "Mjesto tiskanja");
  napuni("#printerFilter", prebroji([].concat.apply([], ZAPISI.map(function (z) { return z.tiskari; }))), "Tiskar");
  napuni("#holdingFilter", prebroji([].concat.apply([], ZAPISI.map(function (z) { return z.gradoviCuvanja; }))), "Mjesto čuvanja");
}

function sinkroniziraj() {
  $("#search").value        = stanje.tekst;
  $("#placeFilter").value   = stanje.mjesto;
  $("#printerFilter").value = stanje.tiskar;
  $("#holdingFilter").value = stanje.mjestoCuvanja;
  $("#tagFilter").value     = stanje.skupina;
  $("#yearFrom").value      = stanje.godOd || "";
  $("#yearTo").value        = stanje.godDo || "";
  $("#sortBy").value        = stanje.sort;
}

function ispisiOznake() {
  var oznake = [];
  if (stanje.tekst)         oznake.push(["tekst", "Pretraga", stanje.tekst]);
  if (stanje.mjesto)        oznake.push(["mjesto", "Tiskano u", stanje.mjesto]);
  if (stanje.tiskar)        oznake.push(["tiskar", "Tiskar", stanje.tiskar]);
  if (stanje.mjestoCuvanja) oznake.push(["mjestoCuvanja", "Čuva se u", stanje.mjestoCuvanja]);
  if (stanje.skupina) {
    var nazivi = { hrTiskar: "Hrvatski tiskar", hrAutor: "Hrvatski autor",
                   hrJezik: "Glagoljska izdanja", digital: "Digitalizirano" };
    oznake.push(["skupina", "Skupina", nazivi[stanje.skupina]]);
  }
  if (stanje.godOd || stanje.godDo) {
    oznake.push(["godine", "Godine", (stanje.godOd || GOD_MIN) + "–" + (stanje.godDo || GOD_MAX)]);
  }
  $("#activeChips").innerHTML = oznake.map(function (o) {
    return '<button class="chip" type="button" data-polje="' + o[0] + '">' +
      esc(o[1]) + ": <b>" + esc(o[2]) + "</b> ×</button>";
  }).join("");
  $$("#activeChips .chip").forEach(function (c) {
    c.addEventListener("click", function () {
      var polje = c.getAttribute("data-polje");
      if (polje === "godine") { stanje.godOd = stanje.godDo = null; }
      else { stanje[polje] = ""; }
      sinkroniziraj(); primijeni();
    });
  });
}

function ponistiFiltre() {
  stanje.tekst = stanje.mjesto = stanje.tiskar = stanje.mjestoCuvanja = stanje.skupina = "";
  stanje.godOd = stanje.godDo = null;
  stanje.prikazano = 12;
  sinkroniziraj(); primijeni();
}

function prebaciPutove(uklj) {
  prikazPutova = uklj === undefined ? !prikazPutova : uklj;
  $("#toggleArcs").setAttribute("aria-pressed", String(prikazPutova));
  if (prikazPutova && !prikazCuvanja) prebaciCuvanja(true);
  crtajPutove(trenutni);
}

function prebaciCuvanja(uklj) {
  prikazCuvanja = uklj === undefined ? !prikazCuvanja : uklj;
  $("#toggleHolding").setAttribute("aria-pressed", String(prikazCuvanja));
  if (prikazCuvanja) slojCuvanja.addTo(karta); else karta.removeLayer(slojCuvanja);
}

function povezi() {
  var odgoda;
  $("#search").addEventListener("input", function (e) {
    clearTimeout(odgoda);
    var v = e.target.value;
    odgoda = setTimeout(function () { stanje.tekst = v; stanje.prikazano = 12; primijeni(); }, 180);
  });
  $("#placeFilter").addEventListener("change",   function (e) { stanje.mjesto = e.target.value; primijeni(); });
  $("#printerFilter").addEventListener("change", function (e) { stanje.tiskar = e.target.value; primijeni(); });
  $("#holdingFilter").addEventListener("change", function (e) { stanje.mjestoCuvanja = e.target.value; primijeni(); });
  $("#tagFilter").addEventListener("change",     function (e) { stanje.skupina = e.target.value; primijeni(); });
  $("#yearFrom").addEventListener("change", function (e) { stanje.godOd = +e.target.value || null; primijeni(); });
  $("#yearTo").addEventListener("change",   function (e) { stanje.godDo = +e.target.value || null; primijeni(); });
  $("#sortBy").addEventListener("change",   function (e) { stanje.sort = e.target.value; primijeni(); });
  $("#resetFilters").addEventListener("click", ponistiFiltre);
  $("#exportBtn").addEventListener("click", izveziCSV);
  $("#showMoreBtn").addEventListener("click", function () { stanje.prikazano += 12; primijeni(); });

  $("#toggleArcs").addEventListener("click", function () { prebaciPutove(); });
  $("#toggleHolding").addEventListener("click", function () { prebaciCuvanja(); });
  $("#resetView").addEventListener("click", function () {
    if (OKVIR) karta.flyToBounds(OKVIR, { duration: 1 });
    else karta.flyTo(POCETNI_POGLED.centar, POCETNI_POGLED.zum, { duration: 1 });
    karta.closePopup();
  });

  $("#modalClose").addEventListener("click", zatvoriZapis);
  $("#modalPrev").addEventListener("click", function () { pomakniZapis(-1); });
  $("#modalNext").addEventListener("click", function () { pomakniZapis(1); });
  $("#modal").addEventListener("click", function (e) {
    if (e.target.hasAttribute("data-close")) zatvoriZapis();
  });

  $("#tourBtn").addEventListener("click", pokreniObilazak);
  $("#tourClose").addEventListener("click", zavrsiObilazak);
  $("#tourPrev").addEventListener("click", function () { if (korak > 0) { korak--; prikaziKorak(); } });
  $("#tourNext").addEventListener("click", function () {
    if (korak === koraci.length - 1) zavrsiObilazak();
    else { korak++; prikaziKorak(); }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      if (!$("#modal").classList.contains("hidden")) zatvoriZapis();
      else if (!$("#tour").classList.contains("hidden")) zavrsiObilazak();
    }
    if (!$("#modal").classList.contains("hidden")) {
      if (e.key === "ArrowLeft")  pomakniZapis(-1);
      if (e.key === "ArrowRight") pomakniZapis(1);
    } else if (!$("#tour").classList.contains("hidden")) {
      if (e.key === "ArrowLeft" && korak > 0) { korak--; prikaziKorak(); }
      if (e.key === "ArrowRight" && korak < koraci.length - 1) { korak++; prikaziKorak(); }
    } else if (e.key === "/" && document.activeElement !== $("#search")) {
      e.preventDefault(); $("#search").focus();
    }
  });
}

/* ============ 14. SITNICE ============ */
function obavijest(tekst) {
  var t = $("#toast");
  t.textContent = tekst;
  t.classList.add("show");
  clearTimeout(t._t);
  t._t = setTimeout(function () { t.classList.remove("show"); }, 2600);
}

function trakaNapretka() {
  var traka = $("#progress"), nav = $("#nav");
  function osvjezi() {
    var visina = document.documentElement.scrollHeight - window.innerHeight;
    traka.style.width = (visina > 0 ? (window.scrollY / visina) * 100 : 0) + "%";
    nav.classList.toggle("scrolled", window.scrollY > 12);
  }
  window.addEventListener("scroll", osvjezi, { passive: true });
  osvjezi();
}

function pojavljivanje() {
  var meta = $$(".section, .metrics-wrap, .hero-text, .hero-visual");
  if (!("IntersectionObserver" in window)) { meta.forEach(function (e) { e.classList.add("in"); }); return; }
  meta.forEach(function (e) { e.classList.add("reveal"); });
  var promatrac = new IntersectionObserver(function (unosi) {
    unosi.forEach(function (u) {
      if (u.isIntersecting) { u.target.classList.add("in"); promatrac.unobserve(u.target); }
    });
  }, { threshold: .08, rootMargin: "0px 0px -40px" });
  meta.forEach(function (e) { promatrac.observe(e); });
}

function otvoriIzAdrese() {
  var m = /^#zapis-(\d+)$/.exec(location.hash);
  if (m) { setTimeout(function () { otvoriZapis(+m[1]); }, 400); return; }
  var p = /^#mjesto-(.+)$/.exec(location.hash);
  if (p) {
    var naziv = decodeURIComponent(p[1]);
    if (MJ_TISAK[naziv]) { stanje.mjesto = naziv; sinkroniziraj(); primijeni(); }
  }
}

/* ============ POKRETANJE ============ */
function pokreni() {
  if (!ZAPISI.length) {
    console.error("Podaci nisu učitani. Provjerite jesu li datoteke iz mape data/ dostupne.");
    return;
  }
  napraviKartu();
  napuniIzbornike();
  sinkroniziraj();
  povezi();
  primijeni();
  ispisiPokazatelje();
  trakaNapretka();
  pojavljivanje();
  otvoriIzAdrese();
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", pokreni);
else pokreni();

})();

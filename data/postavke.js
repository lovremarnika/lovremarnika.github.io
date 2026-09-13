/* ------------------------------------------------------------------
 * data/postavke.js — uredničke odluke i tekstovi
 *
 * OVU DATOTEKU UREĐUJETE RUČNO. Skripta za pripremu podataka je ne dira.
 * Ovdje se nalazi sve što je stvar vaše prosudbe, a ne sirovih podataka:
 * tko se broji kao hrvatski tiskar, tko kao hrvatski autor, koji se
 * katalozi nude za pretragu i što piše u vođenom obilasku karte.
 * ------------------------------------------------------------------ */

window.POSTAVKE = {

  /* --------------------------------------------------------------
   * 1. HRVATSKI TISKARI
   * Ime mora odgovarati zapisu u stupcu "Tiskar". Zapis koji sadrži
   * bilo koje od ovih imena dobiva oznaku "hrvatski tiskar".
   * -------------------------------------------------------------- */
  hrvatskiTiskari: [
    "Paltašić, Andrija",      // Andrija Paltašić Kotoranin
    "Dobrićević, Dobrić",     // Boninus de Boninis s Lastova
    "Baromić, Blaž",          // Blaž Baromić, Senj
    "Bedričić, Silvestar",
    "Turčić, Gašpar",
    "Grgur Senjanin"
  ],

  /* --------------------------------------------------------------
   * 2. HRVATSKI AUTORI
   * Uspoređuje se s poljem "naziv" (odrednica) i "autor".
   * Popis je uredničke naravi — provjerite ga i prilagodite kriteriju
   * koji primjenjujete u radu.
   * -------------------------------------------------------------- */
  hrvatskiAutori: [
    "Šižgorić, Juraj",
    "Šimun Hvaranin",
    "Pucić, Karlo",
    "Nimira, Martinus de",
    "Nikola Modruški",
    "Dragišić, Juraj",
    "Cipiko, Koriolan",
    "Bunić, Jakov",
    "Vergerius, Petrus Paulus",
    "Niger, Franjo"
  ],

  /* --------------------------------------------------------------
   * 3. HRVATSKOJEZIČNA I GLAGOLJSKA IZDANJA
   * Upisuju se redni brojevi (stupac RBR) odvojeni zarezom.
   * -------------------------------------------------------------- */
  hrvatskojezicna: [1, 2, 3, 4, 34],

  /* --------------------------------------------------------------
   * 4. KATALOZI ZA PRETRAGU
   * Za svaki zapis stranica sama složi poveznicu na pretragu u ovim
   * katalozima. {q} se zamjenjuje upitom (autor + naslov + godina).
   * Ovo NISU poveznice na konkretan digitalizirani primjerak — one se
   * upisuju ručno u data/digitalizirano.js.
   * -------------------------------------------------------------- */
  katalozi: [
    { naziv: "ISTC (CERL)",        url: "https://data.cerl.org/istc/_search?query={q}",              opis: "Incunabula Short Title Catalogue — mjerodavni popis europskih inkunabula" },
    { naziv: "GW",                 url: "https://www.gesamtkatalogderwiegendrucke.de/GWEN.xhtml?q={q}", opis: "Gesamtkatalog der Wiegendrucke" },
    { naziv: "Digitalna zbirka NSK", url: "https://digitalna.nsk.hr/pb/?object=list&q={q}",           opis: "Digitalizirana građa Nacionalne i sveučilišne knjižnice" },
    { naziv: "Europeana",          url: "https://www.europeana.eu/hr/search?query={q}",               opis: "Europski agregator digitalizirane baštine" },
    { naziv: "Internet Archive",   url: "https://archive.org/search?query={q}",                       opis: "Slobodno dostupne digitalne preslike" },
    { naziv: "Google Books",       url: "https://www.google.com/search?tbm=bks&q={q}",                opis: "Digitalizirane knjige u Google Booksu" }
  ],

  /* --------------------------------------------------------------
   * 5. VOĐENI OBILAZAK (gumb "Vođeni obilazak")
   * Svaki korak: naslov, tekst i mjesto na koje karta odleti.
   * "mjesto" mora biti ključ iz data/mjesta.js, ili null za cijelu Europu.
   * -------------------------------------------------------------- */
  obilazak: [
    { mjesto: null,        zum: 4.4, naslov: "Europa oko 1470.",        tekst: "U pedesetak godina od Gutenbergova izuma tiskarstvo preplavljuje kontinent. Devedeset i šest izdanja iz ove zbirke nastalo je u osamnaest gradova — a svako od njih danas se čuva u nekoj hrvatskoj ustanovi." },
    { mjesto: "Venecija",  zum: 7,   naslov: "Venecija — polovica zbirke", tekst: "Gotovo svako drugo izdanje u bazi tiskano je u Veneciji. Ondje radi Andrija Paltašić Kotoranin, s dvadeset pet zapisa najzastupljeniji tiskar ove zbirke." },
    { mjesto: "Brescia",   zum: 7,   naslov: "Brescia — Dobrić Dobrićević", tekst: "Lastovljanin Dobrić Dobrićević, u Italiji poznat kao Boninus de Boninis, potpisuje dvadeset tri izdanja — među njima i Danteovu Komediju iz 1487." },
    { mjesto: "Rim",       zum: 7,   naslov: "Rim — prvi hrvatski autori", tekst: "Govor Nikole Modruškog iz 1474. jedan je od najranijih zapisa u zbirci i rano svjedočanstvo hrvatske prisutnosti u europskom tisku." },
    { mjesto: "Senj",      zum: 7.5, naslov: "Senj — tisak na hrvatskom tlu", tekst: "Godine 1494. glagoljski misal tiskan je u Senju. Tiskara Blaža Baromića jedina je u ovoj zbirci koja radi u Hrvatskoj." },
    { mjesto: "Basel",     zum: 5.5, naslov: "Sjeverni rub zbirke",     tekst: "Basel, Nürnberg, Augsburg i Löwen pokazuju koliko je daleko sezala mreža kojom su knjige stizale na istočnu obalu Jadrana." },
    { mjesto: null,        zum: 5,   naslov: "Putovi primjeraka",       tekst: "Uključite prikaz putova i vidjet ćete drugu polovicu priče: linije od tiskare do ustanove u kojoj se primjerak danas čuva — od Cavtata i Dubrovnika do Košljuna i Našica.", putovi: true }
  ]
};

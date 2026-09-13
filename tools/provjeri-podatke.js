/* ------------------------------------------------------------------
 * tools/provjeri-podatke.js — provjera podataka
 *
 * Pokretanje (iz korijena projekta):
 *     node tools/provjeri-podatke.js
 *
 * Javlja sve nesuglasice izmedju tablice i rucno uredjivanih datoteka:
 * ponovljene redne brojeve, gradove bez koordinata, nepovezane primjerke,
 * imena iz postavki koja se ni s cim ne poklapaju.
 * ------------------------------------------------------------------ */
global.window = {};
require("../data/zapisi.js");
require("../data/mjesta.js");
require("../data/postavke.js");
require("../data/digitalizirano.js");

var Z = window.ZAPISI, T = window.MJESTA_TISKANJA,
    C = window.MJESTA_CUVANJA, P = window.POSTAVKE, D = window.DIGITALIZIRANO;

var greske = [], upozorenja = [];
function bezKvacica(s) {
  return String(s).normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").toLowerCase();
}

/* 1. Redni brojevi moraju biti jedinstveni */
var ids = Z.map(function (z) { return z.id; });
var dup = ids.filter(function (v, i) { return ids.indexOf(v) !== i; });
if (dup.length) greske.push("ponovljeni redni brojevi: " + dup.join(", "));

/* 2. Svako mjesto tiskanja treba koordinate u data/mjesta.js */
var bezKoord = Object.keys(Z.reduce(function (m, z) {
  if (z.mjestoTiskanja && !T[z.mjestoTiskanja]) m[z.mjestoTiskanja] = 1;
  return m;
}, {}));
if (bezKoord.length) greske.push("mjesta tiskanja bez koordinata: " + bezKoord.join(", "));

/* 3. Isto za mjesta cuvanja */
var gradovi = {};
Z.forEach(function (z) { z.primjerci.forEach(function (p) { if (p.mjesto) gradovi[p.mjesto] = 1; }); });
var bezC = Object.keys(gradovi).filter(function (g) { return !C[g]; });
if (bezC.length) greske.push("mjesta cuvanja bez koordinata: " + bezC.join(", "));

/* 4. Ustanova i mjesto moraju ici u paru */
var nepar = Z.filter(function (z) {
  return z.primjerci.some(function (p) { return !p.ustanova || !p.mjesto; });
}).map(function (z) { return z.id; });
if (nepar.length) greske.push("zapisi u kojima ustanova i mjesto nisu upareni: " + nepar.join(", "));

/* 5. Poveznice moraju pokazivati na postojeci zapis i imati adresu */
Object.keys(D).forEach(function (k) {
  if (ids.indexOf(+k) === -1) greske.push("digitalizirano.js: nema zapisa broj " + k);
  (D[k] || []).forEach(function (d, i) {
    if (!d.url || !/^https?:\/\//.test(d.url)) {
      greske.push("digitalizirano.js: zapis " + k + ", poveznica " + (i + 1) + " nema ispravnu adresu");
    }
  });
});

/* 6. Koraci obilaska moraju pokazivati na poznato mjesto */
(P.obilazak || []).forEach(function (k, i) {
  if (k.mjesto && !T[k.mjesto]) greske.push("obilazak, korak " + (i + 1) + ": nepoznato mjesto " + k.mjesto);
});

/* --- upozorenja: nije greska, ali vjerojatno nije namjerno --- */
var koristena = {};
Z.forEach(function (z) { if (z.mjestoTiskanja) koristena[z.mjestoTiskanja] = 1; });
Object.keys(T).forEach(function (k) {
  if (!koristena[k]) upozorenja.push("koordinate za " + k + " postoje, ali nijedan zapis ondje nije tiskan");
});
Object.keys(C).forEach(function (k) {
  if (!gradovi[k]) upozorenja.push("koordinate za " + k + " postoje, ali ondje se ne cuva nijedan primjerak");
});

var sviTiskari = [];
Z.forEach(function (z) { sviTiskari = sviTiskari.concat(z.tiskari); });
(P.hrvatskiTiskari || []).forEach(function (t) {
  if (!sviTiskari.some(function (x) { return x.indexOf(t) !== -1; })) {
    upozorenja.push('postavke.js: hrvatski tiskar "' + t + '" ne poklapa se ni s jednim zapisom');
  }
});
var sviAutori = Z.map(function (z) { return bezKvacica(z.autor + " " + z.naziv); });
(P.hrvatskiAutori || []).forEach(function (a) {
  if (!sviAutori.some(function (x) { return x.indexOf(bezKvacica(a)) !== -1; })) {
    upozorenja.push('postavke.js: hrvatski autor "' + a + '" ne poklapa se ni s jednim zapisom');
  }
});
(P.hrvatskojezicna || []).forEach(function (id) {
  if (ids.indexOf(id) === -1) upozorenja.push("postavke.js: hrvatskojezicna sadrzi nepostojeci broj " + id);
});
Z.forEach(function (z) {
  if (!z.mjestoTiskanja) upozorenja.push("zapis " + z.id + " (" + z.naslov + ") nema mjesto tiskanja");
  if (z.godina && z.godina > 1500) upozorenja.push("zapis " + z.id + " (" + z.naslov + ") je iz " + z.godina + ".");
});

/* --- ispis --- */
var primjeraka = Z.reduce(function (s, z) { return s + z.primjerci.length; }, 0);
var digitalnih = Object.keys(D).length;
console.log("Zapisa: " + Z.length + "  |  primjeraka: " + primjeraka +
            "  |  mjesta tiskanja: " + Object.keys(koristena).length +
            "  |  mjesta cuvanja: " + Object.keys(gradovi).length +
            "  |  provjerenih poveznica: " + digitalnih);

if (upozorenja.length) {
  console.log("\nNAPOMENE (" + upozorenja.length + "):");
  upozorenja.forEach(function (u) { console.log("  - " + u); });
}
if (greske.length) {
  console.log("\nGRESKE (" + greske.length + "):");
  greske.forEach(function (g) { console.log("  ! " + g); });
  process.exit(1);
}
console.log("\nSve je u redu.");

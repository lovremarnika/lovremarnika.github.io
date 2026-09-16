/* ------------------------------------------------------------------
 * data/postavke.js — uredničke odluke
 *
 * OVU DATOTEKU UREĐUJETE RUČNO. Skripta za pripremu podataka je ne dira.
 * Ovdje je ono što je stvar vaše prosudbe, a ne sirovih podataka:
 * tko se broji kao hrvatski tiskar, tko kao hrvatski autor i koja se
 * izdanja vode kao hrvatskojezična.
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
  hrvatskojezicna: [1, 2, 3, 4, 34]
};

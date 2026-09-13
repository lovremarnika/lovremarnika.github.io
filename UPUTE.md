# Upute za uređivanje stranice u Visual Studio Codeu

Ovaj dokument objašnjava kako sami mijenjati sve dijelove stranice
*Incunabula Croatica* — od boja i tekstova do bibliografskih podataka.
Pisan je za nekoga tko dosad nije programirao.

---

## Sadržaj

1. [Što vam treba](#1-što-vam-treba)
2. [Kako otvoriti projekt i vidjeti promjene uživo](#2-kako-otvoriti-projekt-i-vidjeti-promjene-uživo)
3. [Koja datoteka čemu služi](#3-koja-datoteka-čemu-služi)
4. [Mijenjanje boja, slova i izgleda](#4-mijenjanje-boja-slova-i-izgleda)
5. [Mijenjanje tekstova na stranici](#5-mijenjanje-tekstova-na-stranici)
6. [Dodavanje i ispravljanje bibliografskih zapisa](#6-dodavanje-i-ispravljanje-bibliografskih-zapisa)
7. [Dodavanje mjesta i koordinata](#7-dodavanje-mjesta-i-koordinata)
8. [Dodavanje poveznice na digitalizirani primjerak](#8-dodavanje-poveznice-na-digitalizirani-primjerak)
9. [Hrvatski tiskari, hrvatski autori, glagoljska izdanja](#9-hrvatski-tiskari-hrvatski-autori-glagoljska-izdanja)
10. [Mijenjanje vođenog obilaska](#10-mijenjanje-vođenog-obilaska)
11. [Postavke karte](#11-postavke-karte)
12. [Objavljivanje na internetu](#12-objavljivanje-na-internetu)
13. [Kad nešto ne radi](#13-kad-nešto-ne-radi)
14. [Prečice i sitnice koje štede vrijeme](#14-prečice-i-sitnice-koje-štede-vrijeme)

---

## 1. Što vam treba

| Alat | Čemu služi | Gdje ga naći |
|---|---|---|
| **Visual Studio Code** | uređivanje datoteka | code.visualstudio.com |
| **Live Server** (dodatak za VS Code) | stranica se sama osvježava dok pišete | u VS Codeu: `Ctrl+Shift+X`, upišite `Live Server`, autor Ritwick Dey → **Install** |
| **Python 3** | *samo* ako mijenjate bibliografske podatke u tablici (poglavlje 6) | python.org — pri instalaciji obavezno kvačica **Add Python to PATH** |

Ako ne dirate tablicu, Python vam uopće ne treba.

---

## 2. Kako otvoriti projekt i vidjeti promjene uživo

1. U VS Codeu: **File → Open Folder…** i odaberite mapu projekta
   (onu u kojoj je `index.html`). Nemojte otvarati pojedinačnu datoteku —
   otvorite **cijelu mapu**, inače neki putevi neće raditi.
2. U popisu datoteka lijevo desnom tipkom kliknite `index.html` →
   **Open with Live Server**.
3. Otvorit će se preglednik s adresom poput `http://127.0.0.1:5500/index.html`.
4. Sad uredite bilo što, pritisnite `Ctrl+S` (spremi) i **preglednik se sam osvježi**.

> **Zašto Live Server, a ne dvoklik na `index.html`?**
> Dvoklik otvara stranicu preko `file://` adrese. To uglavnom radi, ali neki
> preglednici u tom načinu blokiraju dijelove stranice. S Live Serverom ste
> u istim uvjetima u kojima će stranica biti i na internetu.

**Ako se promjena ne vidi:** u pregledniku pritisnite `Ctrl+F5`
(ili `Cmd+Shift+R` na Macu). To prisilno ponovno učitava datoteke,
bez korištenja spremljene kopije.

---

## 3. Koja datoteka čemu služi

```
lovremarnika.github.io/
├── index.html              ← struktura i SVI vidljivi tekstovi
├── style.css               ← izgled: boje, slova, razmaci
├── script.js               ← ponašanje: karta, filtri, pretraga
│
├── data/
│   ├── incunabula-izvor.csv    ← IZVORNA tablica (ovdje ispravljate podatke)
│   ├── zapisi.js               ← generirano iz CSV-a — NE uređujte ručno
│   ├── mjesta.js               ← koordinate gradova  ← uređujete ručno
│   ├── postavke.js             ← uredničke odluke i tekstovi obilaska ← ručno
│   └── digitalizirano.js       ← provjerene digitalne poveznice ← ručno
│
├── tools/
│   └── pripremi-podatke.py     ← skripta: CSV → zapisi.js
│
├── vendor/leaflet/             ← knjižnica za kartu — ne dirati
└── UPUTE.md                    ← ovaj dokument
```

**Pravilo palca:**
- mijenjate **riječi koje se vide** → `index.html`
- mijenjate **kako izgleda** → `style.css`
- mijenjate **podatke o knjigama** → `data/` (i po potrebi pokrenete skriptu)
- `script.js` i `vendor/` nećete trebati dirati za uobičajene izmjene

---

## 4. Mijenjanje boja, slova i izgleda

Otvorite **`style.css`**. Sasvim na vrhu je odsječak `:root` — to je
popis svih boja i mjera na jednome mjestu. Promjena ondje mijenja
cijelu stranicu odjednom.

```css
:root{
  --pergament:      #f5f1e8;   /* osnovna pozadina stranice */
  --papir:          #fdfbf6;   /* kartice i ploče */
  --tinta:          #1c1815;   /* glavni tekst */
  --rubrika:        #9b2226;   /* crvena — naglasci, godine, markeri */
  --zlato:          #b08d57;   /* zlatna — digitalizirano, istaknuto */
  ...
}
```

**Kako promijeniti boju:**
1. Kliknite na mali obojani kvadratić lijevo od koda boje — VS Code otvori
   birač boja. Odaberite novu i kod se sam upiše.
2. Spremite (`Ctrl+S`). Preglednik se osvježi.

**Nekoliko korisnih izmjena:**

| Želim… | Promijenite |
|---|---|
| drukčiju crvenu (markeri, godine, naglasci) | `--rubrika` |
| drukčiju zlatnu (oznake „digitalizirano”) | `--zlato` |
| svjetliju/tamniju pozadinu | `--pergament` |
| veći ili manji glavni naslov | `--h1` (npr. `clamp(2.6rem, 6.2vw, 5.2rem)` → povećajte zadnji broj) |
| višu ili nižu kartu | `--visina-karte: 640px` |
| širu ili užu stranicu | `--maks-sirina: 1280px` |

**Promjena pisma.** Stranica koristi *Cormorant Garamond* (naslovi) i
*Inter* (ostalo). Ako želite druga pisma:

1. Na fonts.google.com odaberite pismo → **Get font** → **Get embed code**
   i kopirajte redak koji počinje s `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?...`.
2. U `index.html` njime zamijenite postojeći takav redak (oko 15. retka).
3. U `style.css` upišite nazive u varijable:
   ```css
   --serif: "Vaše naslovno pismo", Georgia, serif;
   --sans:  "Vaše tekstualno pismo", Arial, sans-serif;
   ```
   Nazive iza prvoga ostavite — to je zaliha ako se pismo ne učita.

---

## 5. Mijenjanje tekstova na stranici

Svi vidljivi tekstovi su u **`index.html`**. Potražite ih tipkama
`Ctrl+F` (traži unutar datoteke) ili `Ctrl+Shift+F` (traži po svim
datotekama projekta).

Primjer — glavni naslov:

```html
<h1>Mjesta tiskanja<br><em>hrvatskih inkunabula</em></h1>
```

Mijenjate **samo tekst između oznaka**, oznake (`<h1>`, `<em>`, `<br>`)
ostavljate na miru:
- `<h1>…</h1>` — naslov
- `<em>…</em>` — dio ispisan crvenim kurzivom
- `<br>` — prijelom u novi redak

Ostali tekstovi koje ćete vjerojatno htjeti dotjerati:

| Što | Potražite u `index.html` |
|---|---|
| podnaslov ispod naslova | `class="lead"` |
| natpisi na gumbima | `Istraži kartu`, `Pregledaj zbirku` |
| opisi iznad svakog odsječka | `class="section-head"` |
| cijelo poglavlje *Metodologija* | `id="metodologija"` |
| podnožje stranice | `<footer>` |
| naslov u kartici preglednika | `<title>` |

> **Hrvatski znakovi.** Datoteke su u UTF-8 kodiranju, pa č, ć, ž, š i đ
> slobodno pišete izravno. Ako vam se u pregledniku pojave čudni znakovi,
> pogledajte donji desni rub VS Codea — mora pisati **UTF-8**. Ako ne piše,
> kliknite na to i odaberite **Save with Encoding → UTF-8**.

---

## 6. Dodavanje i ispravljanje bibliografskih zapisa

Podaci o knjigama žive u **`data/incunabula-izvor.csv`**. Iz te se datoteke
skriptom generira `data/zapisi.js`, koji stranica zapravo čita.

> **Važno:** `data/zapisi.js` **nemojte uređivati ručno.** Svako novo
> pokretanje skripte prebrisat će vaše izmjene. Uvijek ispravljajte CSV.

### Postupak

**Korak 1 — otvorite tablicu.**
CSV možete uređivati na dva načina:
- **u Excelu:** dvoklik na datoteku. Pri spremanju odaberite
  *CSV UTF-8 (delimited by comma)*, inače će kvačice puknuti.
- **u VS Codeu:** dvoklik na `incunabula-izvor.csv`. Preglednije je ako
  instalirate dodatak **Rainbow CSV** (`Ctrl+Shift+X` → `Rainbow CSV`) —
  on oboji stupce.

**Korak 2 — unesite izmjenu.** Stupci su ovim redom:

| # | Stupac | Napomena |
|---|---|---|
| 1 | RBR | redni broj; mora biti **jedinstven** |
| 2 | Naziv | odrednica (npr. `HIERONYMUS, SANCTUS`) |
| 3 | Autor | |
| 4–8 | Autor komentara, Autor dodataka, Urednik, Prevoditelj, Ilustrator | mogu ostati prazni |
| 9 | Naslov | |
| 10 | Godina izdavanja | samo broj |
| 11 | Tiskar | više tiskara → svaki u **novi redak unutar iste ćelije** |
| 12 | Mjesto tiskanja | mora se poklapati s nazivom u `data/mjesta.js` |
| 13 | Ustanova | više ustanova → svaka u novi redak |
| 14 | Mjesto | grad ustanove; **mora imati isti broj redaka kao stupac 13** |

> Ustanova i mjesto uparuju se **redak po redak**. Ako u stupcu *Ustanova*
> imate tri retka, i u stupcu *Mjesto* mora biti tri retka, istim redom.

**Korak 3 — pokrenite skriptu.**
U VS Codeu otvorite terminal: **Terminal → New Terminal** (prečica `` Ctrl+` ``, na hrvatskoj tipkovnici obično `Ctrl+ö`), pa upišite:

```bash
python3 tools/pripremi-podatke.py
```

Na Windowsima je naredba obično:

```bash
python tools\pripremi-podatke.py
```

Skripta ispiše koliko je zapisa obradila i upozori na nedostajuće podatke:

```
Zapisano 96 zapisa u data/zapisi.js

Napomene o podacima:
  zapis 74 (OFFICIUM): godina 1501 je izvan razdoblja inkunabula
  zapis 3 (Misal po zakonu rimskoga dvora): nema mjesta tiskanja
```

**Korak 4 — provjerite podatke.** U istom terminalu:

```bash
node tools/provjeri-podatke.js
```

Alat u sekundi provjeri sve što se lako previdi: ponovljene redne brojeve,
gradove kojima nedostaju koordinate, primjerke kojima ustanova i mjesto nisu
upareni, poveznice bez ispravne adrese i imena iz `postavke.js` koja se ni s
čim ne poklapaju. Ispiše `Sve je u redu.` ili točno navede što ne valja.

(Za ovo vam treba **Node.js** s nodejs.org. Nije obavezno — stranica radi i
bez toga — ali je najbrži način da uhvatite tipfeler.)

**Korak 5 — osvježite preglednik** (`Ctrl+F5`).

### Ako nemate Python

Možete iznimno i ručno dopisati zapis u `data/zapisi.js`. Kopirajte
postojeći redak, zalijepite ga i izmijenite vrijednosti. Pazite:
- svaki redak osim posljednjeg završava **zarezom**
- tekst ide u **dvostruke navodnike**
- ako navodnik treba unutar teksta, pišite `\"`

Nakon toga **isti unos upišite i u CSV**, da se ne izgubi kad idući put
pokrenete skriptu.

---

## 7. Dodavanje mjesta i koordinata

Ako u tablicu unesete grad kojega još nema na karti, morate mu dodati
koordinate. Otvorite **`data/mjesta.js`**.

**Kako naći koordinate:**
1. Otvorite openstreetmap.org
2. Desni klik na traženo mjesto → **Prikaži adresu** (*Show address*)
3. Gore lijevo pojave se dva broja, npr. `45.4371 / 12.3326`.
   Prvi je zemljopisna širina, drugi dužina.

**Mjesto tiskanja** (veliki kružni marker) dodaje se u `MJESTA_TISKANJA`:

```js
window.MJESTA_TISKANJA = {
  "Venecija":  { koord: [45.4371, 12.3326], drzava: "Italija",  biljeska: "Najveće tiskarsko središte…" },

  "Milano":    { koord: [45.4642,  9.1900], drzava: "Italija",  biljeska: "Kratak opis koji se pojavi u oblačiću." },
};
```

**Mjesto čuvanja** (mali romb) dodaje se u `MJESTA_CUVANJA`:

```js
window.MJESTA_CUVANJA = {
  "Zagreb":  [45.8131, 15.9775],

  "Osijek":  [45.5550, 18.6955],
};
```

Na što paziti:
- naziv u navodnicima mora biti **znak za znak** jednak onome u tablici
  (uključujući kvačice) — inače grad neće biti prepoznat
- iza svakog unosa ide **zarez**
- ako grad nema koordinate, stranica i dalje radi, ali ga nema na karti;
  upozorenje se ispiše u konzoli preglednika (vidi poglavlje 13)

---

## 8. Dodavanje poveznice na digitalizirani primjerak

Ovo je vjerojatno najvažnije poglavlje za dovršetak rada.

Stranica razlikuje dvije razine, namjerno:

- **Pretraga u katalozima** — automatski složen upit prema ISTC-u, GW-u,
  NSK-u, Europeani i drugima. Pojavljuje se kod svakog zapisa i ne tvrdi
  ništa; samo vam pomaže da brže dođete do izvora.
- **Provjerena poveznica** — ona koju ste **sami otvorili i potvrdili** da
  vodi na digitalizirani primjerak baš toga izdanja. Samo se ona označava
  zlatnom oznakom i broji u pokazatelju *„provjerenih digitalnih poveznica”*
  na vrhu stranice.

Zato je `data/digitalizirano.js` na početku prazan — brojka mora rasti
onako kako vi provjeravate izvore, a ne prije toga.

### Kako dodati poveznicu

1. Otvorite zapis na stranici i kliknite jednu od poveznica pod
   **Pretraga u katalozima**.
2. Kad nađete digitalizirani primjerak, kopirajte adresu iz preglednika.
3. Zapamtite **redni broj zapisa** — piše na vrhu prozora
   (*„Zapis br. 41 · Incunabula Croatica”*).
4. Otvorite `data/digitalizirano.js` i upišite:

```js
window.DIGITALIZIRANO = {

  41: [
    {
      naziv: "Epistolae, Rim 1470.",
      url: "https://ovdje-zalijepite-adresu",
      ustanova: "Nacionalna i sveučilišna knjižnica u Zagrebu",
      vrsta: "cjelovit"
    }
  ],

  4: [
    {
      naziv: "Senjski glagoljski misal (1494.)",
      url: "https://...",
      ustanova: "NSK",
      vrsta: "djelomičan"
    }
  ],

};
```

Objašnjenje polja:

| Polje | Što upisati |
|---|---|
| `41:` | redni broj zapisa (RBR) |
| `naziv` | kako će poveznica pisati na stranici |
| `url` | puna adresa, uvijek u navodnicima |
| `ustanova` | tko čuva digitalizirani primjerak |
| `vrsta` | `"cjelovit"`, `"djelomičan"` ili `"opis"` |

Jedan zapis može imati **više poveznica** — samo dodajte još jedan blok
`{ … }` unutar uglatih zagrada, odvojen zarezom.

Nakon spremanja brojka *„provjerenih digitalnih poveznica”* poraste sama,
zapis dobije zlatnu oznaku, a filtar **Skupina → Ima provjerenu digitalnu
poveznicu** počne ga hvatati.

---

## 9. Hrvatski tiskari, hrvatski autori, glagoljska izdanja

Ove tri oznake nisu u izvornoj tablici — one su **vaša urednička odluka**
i zato stoje odvojeno, u `data/postavke.js`.

```js
hrvatskiTiskari: [
  "Paltašić, Andrija",
  "Dobrićević, Dobrić",
  "Baromić, Blaž",
  ...
],

hrvatskiAutori: [
  "Šižgorić, Juraj",
  "Nikola Modruški",
  ...
],

hrvatskojezicna: [1, 2, 3, 4, 34],
```

- **`hrvatskiTiskari`** — ime mora odgovarati zapisu u stupcu *Tiskar*.
  Dovoljno je da se podudara dio imena.
- **`hrvatskiAutori`** — uspoređuje se s odrednicom i s autorom.
  Ovaj popis svakako pregledajte i uskladite s kriterijem koji
  primjenjujete u radu.
- **`hrvatskojezicna`** — samo redni brojevi, odvojeni zarezom.

Promjena se odmah vidi u oznakama na karticama i u filtru **Skupina**.

---

## 10. Mijenjanje vođenog obilaska

Gumb **Vođeni obilazak** vodi gledatelja kroz kartu korak po korak —
korisno pri obrani rada. Koraci su u `data/postavke.js`, u polju `obilazak`:

```js
obilazak: [
  { mjesto: null,       zum: 4.4, naslov: "Europa oko 1470.",
    tekst: "U pedesetak godina od Gutenbergova izuma…" },

  { mjesto: "Venecija", zum: 7,   naslov: "Venecija — polovica zbirke",
    tekst: "Gotovo svako drugo izdanje u bazi…" },
]
```

| Polje | Značenje |
|---|---|
| `mjesto` | naziv grada iz `data/mjesta.js`, ili `null` za pogled na cijelu Europu |
| `zum` | koliko blizu: `4` daleko, `7` grad, `10` vrlo blizu |
| `naslov` | naslov koraka |
| `tekst` | objašnjenje |
| `putovi: true` | neobavezno — na tome koraku sam uključi prikaz putova primjeraka |

Korake slobodno dodajete, brišete i premještate. Brojevi *„Korak 3 od 7”*
računaju se sami.

---

## 11. Postavke karte

### Visina karte
`style.css`, na vrhu: `--visina-karte: 640px;`
Bočna ploča sama se prilagodi istoj visini.

### Početni kadar
Karta se pri učitavanju sama namjesti tako da stanu **sva** mjesta tiskanja.
Ako želite fiksni kadar, u `script.js` potražite `POCETNI_POGLED` i
izbrišite (ili zakomentirajte s `//`) redak s `fitBounds`.

### Izgled podloge
U `script.js`, u funkciji `napraviKartu`, stoji adresa karte:

```js
L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png", …)
```

Zamjenom `voyager_nolabels` dobivate drukčiju podlogu:
- `light_nolabels` — vrlo svijetla, gotovo bijela
- `dark_nolabels` — tamna
- `rastertiles/voyager_nolabels` — sadašnja, topla

Topli „papirnati” ton dolazi iz `style.css`:

```css
.leaflet-tile-pane{ filter:sepia(.42) saturate(.72) brightness(1.04) contrast(.96); }
```

Smanjite `sepia` prema `0` za neutralniju kartu, povećajte prema `1` za jaču.

### Koliko kartica prikazati odjednom
U `script.js` potražite `prikazano: 12` (početni broj) i
`stanje.prikazano += 12` (koliko ih doda gumb *Prikaži još*).

---

## 12. Objavljivanje na internetu

Vaše spremište zove se `lovremarnika.github.io`, što znači da GitHub Pages
objavljuje ono što se nalazi u grani **`main`**, na adresi
`https://lovremarnika.github.io`.

Izmjene su nastale na zasebnoj grani. Kad ih pregledate i budete zadovoljni:

**Iz VS Codea (najjednostavnije):**
1. Lijevo kliknite ikonu **Source Control** (`Ctrl+Shift+G`)
2. Upišite kratak opis izmjene u okvir na vrhu
3. **✓ Commit** → zatim **Sync Changes**

**Spajanje u `main`** napravite na GitHubu: otvorite spremište, GitHub će
ponuditi **Compare & pull request** za vašu granu → **Create pull request**
→ **Merge pull request**.

Objava traje otprilike minutu. Ako se promjena ne vidi, pritisnite `Ctrl+F5`.

> Stranica ne treba nikakav poslužitelj ni bazu — to su samo datoteke.
> Isti taj skup datoteka možete predati i na USB-u ili priložiti radu;
> radit će i bez interneta, osim što karta neće imati podlogu, a pisma
> će se zamijeniti zalihama.

---

## 13. Kad nešto ne radi

### Prvo pokrenite alat za provjeru

```bash
node tools/provjeri-podatke.js
```

Većinu grešaka u podacima uhvatit će on i reći vam točno gdje su.

### Zatim pogledajte konzolu
U pregledniku pritisnite **F12** → kartica **Console**.
Ondje piše što je pošlo po zlu i u kojem retku koje datoteke.

### Stranica je bijela ili prazna
Gotovo uvijek greška u nekoj `.js` datoteci u mapi `data/`.
Konzola pokaže crveni redak, npr.
`Uncaught SyntaxError: Unexpected token }` — to znači da negdje
**fali ili je višak zarez**.

### Najčešće pogreške u datotekama iz `data/`

| Simptom | Uzrok | Rješenje |
|---|---|---|
| bijela stranica | fali zarez između dva unosa | dodajte `,` |
| bijela stranica | višak zareza iza **zadnjeg** unosa u nizu | uklonite ga |
| bijela stranica | tekst bez navodnika | stavite `"tekst"` |
| grad nije na karti | naziv se ne poklapa s tablicom | provjerite kvačice i razmake |
| poveznica ne radi | adresa bez `https://` | dopišite ga |

> VS Code vam pomaže: pogrešan kod podcrtava **crvenom valovitom crtom**.
> Prijeđite mišem preko podcrtanoga i pokazat će objašnjenje. Ako nigdje
> nema crvenog, datoteka je sintaktički ispravna.

### Karta se ne vidi
Provjerite postoji li mapa `vendor/leaflet` i u njoj `leaflet.js`.
Ako je nema, karta se ne može učitati.

### Kvačice su se pokvarile (`Paltašiæ` umjesto `Paltašić`)
Datoteka je spremljena u pogrešnom kodiranju. U VS Codeu, dolje desno
kliknite na oznaku kodiranja → **Reopen with Encoding → UTF-8**,
provjerite izgleda li tekst dobro, pa → **Save with Encoding → UTF-8**.

### Vratiti se na zadnje spremljeno stanje
`Ctrl+Z` poništava zadnje izmjene. Ako ste već spremili, otvorite
**Source Control** (`Ctrl+Shift+G`), desni klik na datoteku →
**Discard Changes**. To vraća datoteku na zadnju potvrđenu verziju.

---

## 14. Prečice i sitnice koje štede vrijeme

| Prečica | Što radi |
|---|---|
| `Ctrl+S` | spremi |
| `Ctrl+Z` / `Ctrl+Y` | poništi / vrati |
| `Ctrl+F` | traži u datoteci |
| `Ctrl+Shift+F` | traži po **svim** datotekama projekta |
| `Ctrl+P` | brzo otvori datoteku po imenu |
| `Ctrl+/` | zakomentiraj redak (isključi ga bez brisanja) |
| `Alt+Shift+F` | posloži kod uredno |
| `` Ctrl+` `` (HR: `Ctrl+ö`) | otvori/zatvori terminal |
| `Ctrl+B` | sakrij/prikaži popis datoteka |

**Komentari** su bilješke koje stranica ne prikazuje — korisni da
zapišete zašto ste nešto promijenili:

```js
// jedan redak u .js datoteci
/* više redaka */
```
```css
/* ovako u .css datoteci */
```
```html
<!-- ovako u .html datoteci -->
```

### Prečice na samoj stranici

| Tipka | Radnja |
|---|---|
| `/` | skok u polje za pretragu |
| `←` `→` | prethodni / sljedeći zapis dok je otvoren prozor |
| `Esc` | zatvori prozor ili obilazak |

### Poveznica na pojedini zapis
Adresa `…/index.html#zapis-41` otvara stranicu s već otvorenim zapisom
broj 41, a `…/index.html#mjesto-Venecija` s filtrom na Veneciju.
Zgodno za citiranje u radu ili za slanje mentoru.

---

**Savjet za kraj:** prije veće izmjene napravite *commit* u VS Codeu.
Tako se uvijek možete vratiti na stanje koje je radilo.

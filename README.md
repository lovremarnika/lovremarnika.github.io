# Incunabula Croatica

Interaktivna karta mjesta tiskanja hrvatskih inkunabula — digitalno-humanistički
prikaz bibliografskih podataka, geografije ranoga tiska i primjeraka sačuvanih
u hrvatskim ustanovama.

**Uživo:** https://lovremarnika.github.io

## Što stranica pokazuje

- **96 bibliografskih zapisa** iz tablice *Incunabula Croatica* (1470.–1501.)
- **18 mjesta tiskanja** na karti Europe, s veličinom markera prema broju izdanja
- **180 zabilježenih primjeraka** u 20 hrvatskih gradova i mjesta
- **putove primjeraka** — linije od tiskarske radionice do ustanove koja
  primjerak danas čuva
- pretragu, filtre (mjesto, tiskar, mjesto čuvanja, razdoblje, skupina),
  vremensku crtu po godinama i izvoz odabira u CSV
- vođeni obilazak karte u sedam koraka, za izlaganje rada

## Pokretanje

Stranica je skup statičnih datoteka — ne treba ni poslužitelj ni baza.

- **Najjednostavnije:** u VS Codeu desni klik na `index.html` →
  *Open with Live Server*
- Ili dvoklik na `index.html` (radi, uz manja ograničenja preglednika)

## Struktura

| Putanja | Sadržaj |
|---|---|
| `index.html` | struktura stranice i svi vidljivi tekstovi |
| `style.css` | izgled; sve boje i mjere skupljene su u `:root` na vrhu |
| `script.js` | karta, filtri, pretraga, obilazak |
| `data/incunabula-izvor.csv` | izvorna bibliografska tablica |
| `data/zapisi.js` | **generirano** iz CSV-a — ne uređivati ručno |
| `data/mjesta.js` | koordinate mjesta tiskanja i mjesta čuvanja |
| `data/postavke.js` | uredničke odluke, katalozi, koraci obilaska |
| `data/digitalizirano.js` | provjerene poveznice na digitalizirane primjerke |
| `tools/pripremi-podatke.py` | pretvara CSV u `data/zapisi.js` |
| `tools/provjeri-podatke.js` | provjerava usklađenost podataka |
| `vendor/leaflet/` | Leaflet 1.9.4 (BSD-2-Clause), lokalno |

Nakon izmjene u CSV-u:

```bash
python3 tools/pripremi-podatke.py   # CSV -> data/zapisi.js
node tools/provjeri-podatke.js      # provjera (nije obavezno)
```

## Digitalne poveznice

Stranica razlikuje dvije razine i to je namjerno:

- **pretraga u katalozima** — automatski složen upit prema ISTC-u, GW-u,
  digitalnoj zbirci NSK-a, Europeani, Internet Archiveu i Google Booksu;
  polazišna pomoć, ne tvrdnja da digitalizirani primjerak postoji;
- **provjerena poveznica** — upisuje se ručno u `data/digitalizirano.js`
  tek nakon što je otvorena i potvrđena, i samo se ona broji u pokazatelju
  digitaliziranih primjeraka.

## Napomene o građi

- zapis br. 3 (*Misal po zakonu rimskoga dvora*, 1483.) nema podatak o
  mjestu tiskanja pa se ne može prikazati kao točka na karti;
- zapis br. 74 (*Officium*, 1501.) izlazi iz razdoblja inkunabula u užem smislu;
- hrvatski dijakritici bili su oštećeni u izvornoj tablici (`æ` umjesto `ć`,
  `è` umjesto `č`) i vraćeni su pri obradi.

## Upute za uređivanje

Detaljne upute za rad u Visual Studio Codeu: **[UPUTE.md](UPUTE.md)**

## Izvori

Kartografska podloga © OpenStreetMap contributors, © CARTO.
Bibliografski podaci iz priložene tablice *Incunabula Croatica*.

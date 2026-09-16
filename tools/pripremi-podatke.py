#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Pretvorba data/incunabula-izvor.csv u data/zapisi.js

Pokretanje (iz korijena projekta):
    python3 tools/pripremi-podatke.py


"""
import csv, json, os, re, sys

KORIJEN = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ULAZ = os.path.join(KORIJEN, "data", "incunabula-izvor.csv")
IZLAZ = os.path.join(KORIJEN, "data", "zapisi.js")


POPRAVCI = {
    "æ": "ć",  
    "Æ": "Ć",
    "è": "č",  
    "È": "Č",
    "ð": "đ",  
    "Ð": "Đ",
    " ": " ",       
}

MALE_RIJECI = {"de", "di", "da", "del", "della", "von", "van", "der", "le", "la",
               "st.", "sanctus", "e", "a", "u", "i", "po", "za", "od"}


def ocisti(s):
    for kriv, ispravan in POPRAVCI.items():
        s = s.replace(kriv, ispravan)
    return re.sub(r"[ \t]+", " ", s).strip()


def redovi(s):
    """Celija moze sadrzavati vise vrijednosti odvojenih prijelomom retka."""
    return [ocisti(d) for d in s.split("\n") if ocisti(d)]


def lijepo_ime(s):
    """VERGILIUS MARO, PUBLIUS -> Vergilius Maro, Publius (mjesovito ostavlja)."""
    if not s:
        return ""
    slova = [z for z in s if z.isalpha()]
    if not slova or not all(z.isupper() for z in slova):
        return s
    dijelovi = []
    for rijec in s.split(" "):
        if not rijec:
            continue
        nisko = rijec.lower()
        if nisko.strip(".,") in MALE_RIJECI and dijelovi:
            dijelovi.append(nisko)
        else:
            dijelovi.append(nisko[0].upper() + nisko[1:])
    return " ".join(dijelovi)


def main():
    if not os.path.exists(ULAZ):
        sys.exit("Ne nalazim " + ULAZ)

    with open(ULAZ, encoding="utf-8", newline="") as f:
        sve = list(csv.reader(f))

    zapisi, upozorenja = [], []

    for red in sve[1:]:
        red = (red + [""] * 16)[:16]
        rbr = ocisti(red[0])
        if not rbr:
            continue

        ustanove, gradovi = redovi(red[12]), redovi(red[13])
        primjerci = []
        for i in range(max(len(ustanove), len(gradovi))):
            primjerci.append({
                "ustanova": ustanove[i] if i < len(ustanove) else "",
                "mjesto": gradovi[i] if i < len(gradovi) else "",
            })

        godina_txt = ocisti(red[9])
        godina = int(godina_txt) if godina_txt.isdigit() else None
        mjesto = ocisti(red[11])
        naslov = ocisti(red[8])
        naziv = ocisti(red[1])

        if not mjesto:
            upozorenja.append("  zapis %s (%s): nema mjesta tiskanja" % (rbr, naslov))
        if godina and godina > 1500:
            upozorenja.append("  zapis %s (%s): godina %d je izvan razdoblja inkunabula" % (rbr, naslov, godina))

        zapisi.append({
            "id": int(rbr),
            "naziv": lijepo_ime(naziv),
            "autor": lijepo_ime(ocisti(red[2].replace("\n", "; "))),
            "autorKomentara": [lijepo_ime(x) for x in redovi(red[3])],
            "autorDodataka": [lijepo_ime(x) for x in redovi(red[4])],
            "urednik": [lijepo_ime(x) for x in redovi(red[5])],
            "prevoditelj": [lijepo_ime(x) for x in redovi(red[6])],
            "ilustrator": [lijepo_ime(x) for x in redovi(red[7])],
            "naslov": naslov,
            "godina": godina,
            "tiskari": redovi(red[10]),
            "mjestoTiskanja": mjesto,
            "primjerci": primjerci,
            "napomena": " ".join(x for x in (ocisti(red[14]), ocisti(red[15])) if x),
        })

    zapisi.sort(key=lambda z: z["id"])

    tijelo = ",\n".join("  " + json.dumps(z, ensure_ascii=False) for z in zapisi)
    zaglavlje = (
        "/* ------------------------------------------------------------------\n"
        " * data/zapisi.js - bibliografski zapisi\n"
        " *\n"
        " * GENERIRANO iz data/incunabula-izvor.csv skriptom\n"
        " * tools/pripremi-podatke.py. Ako ovdje rucno mijenjate podatke,\n"
        " * ponovno pokretanje skripte pregazit ce vase izmjene - zato\n"
        " * ispravke radije unesite u CSV pa pokrenite skriptu iznova.\n"
        " * ------------------------------------------------------------------ */\n"
    )
    with open(IZLAZ, "w", encoding="utf-8") as f:
        f.write(zaglavlje + "window.ZAPISI = [\n" + tijelo + "\n];\n")

    print("Zapisano %d zapisa u %s" % (len(zapisi), os.path.relpath(IZLAZ, KORIJEN)))
    if upozorenja:
        print("\nNapomene o podacima:")
        print("\n".join(dict.fromkeys(upozorenja)))


if __name__ == "__main__":
    main()

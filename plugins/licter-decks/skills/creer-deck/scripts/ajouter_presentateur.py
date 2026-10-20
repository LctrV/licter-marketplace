#!/usr/bin/env python3
"""Insère (ou met à jour) la vue présentateur Licter dans un deck HTML.

Usage : python3 ajouter_presentateur.py deck.html [-o sortie.html]
Sans -o, le deck est modifié sur place. Relancer le script remplace l'ancienne version.
"""
import argparse
import re
import sys
from pathlib import Path

START, END = "<!-- licter-presentateur:debut -->", "<!-- licter-presentateur:fin -->"
JS = Path(__file__).resolve().parent.parent / "assets" / "presentateur.js"


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("deck", help="deck HTML")
    ap.add_argument("-o", "--output", help="fichier de sortie (défaut : le deck lui-même)")
    a = ap.parse_args()

    src = Path(a.deck)
    html = src.read_text(encoding="utf-8")
    js = JS.read_text(encoding="utf-8")
    if re.search(r"</(script|head|body|html)", js, re.I):
        sys.exit("✗ presentateur.js contient une balise de fin (script, head, body ou html) : impossible de l'intégrer tel quel.")

    html = re.sub(re.escape(START) + r".*?" + re.escape(END) + r"\n?", "", html, flags=re.S)
    n_sec = len(re.findall(r"<section\b[^>]*\bid=", html, re.I))
    n_notes = len(re.findall(r"<aside\b[^>]*class=\"[^\"]*\bnotes\b", html, re.I))
    n_duree = len(re.findall(r"\bdata-duree=", html, re.I))
    has_api = "__DECK__" in html
    block = f'{START}\n<script id="vue-presentateur">\n{js}\n</script>\n{END}\n'
    if re.search(r"</body>", html, re.I):
        html = re.sub(r"</body>", lambda m: block + m.group(0), html, count=1, flags=re.I)
    else:
        html += "\n" + block

    out = Path(a.output) if a.output else src
    out.write_text(html, encoding="utf-8")

    print(f"✓ Vue présentateur ajoutée : {out}")
    print(f"  {n_sec} sections avec id · {n_notes} blocs de notes · {n_duree} durées prévues")
    if not has_api:
        print("  ⚠ window.__DECK__ introuvable : navigation de secours (classe .active ou défilement).")


if __name__ == "__main__":
    main()

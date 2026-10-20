#!/usr/bin/env python3
"""Injecte l'éditeur Licter (calque de modifications admin) dans un deck HTML.

Usage :
    python3 inject.py deck.html -o deck_editable.html --root "#deck" --client "Dior" --code "MonCode2026"
    python3 inject.py deck.html --artifact            # sortie prête à publier comme artefact claude.ai

Le deck doit avoir un conteneur (par défaut #app5) dont les enfants directs sont des <section id="...">.
Relancer le script sur un fichier déjà équipé remplace l'éditeur (marqueurs licter-editeur).
"""
import argparse
import hashlib
import json
import re
import sys
from pathlib import Path

ASSETS = Path(__file__).resolve().parent.parent / "assets"
START, END = "<!-- licter-editeur:debut -->", "<!-- licter-editeur:fin -->"
CSS_START, CSS_END = "/* licter-editeur:debut */", "/* licter-editeur:fin */"


def slug(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-") or "deck"


def strip_previous(html):
    html = re.sub(re.escape(START) + r".*?" + re.escape(END), "", html, flags=re.S)
    html = re.sub(r"<style[^>]*>\s*" + re.escape(CSS_START) + r".*?" + re.escape(CSS_END) + r"\s*</style>", "", html, flags=re.S)
    return html


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("deck", help="fichier HTML du deck")
    ap.add_argument("-o", "--out", help="fichier de sortie (défaut : <deck>_editable.html)")
    ap.add_argument("--root", default="#app5", help="sélecteur du conteneur des sections (un id : #deck)")
    ap.add_argument("--client", default="Client", help="nom du client affiché dans l'éditeur (fichiers, e-mails, IA)")
    ap.add_argument("--sector", default="", help="secteur du client, pour les textes générés par l'IA (ex. luxe, banque)")
    ap.add_argument("--code", default="Licter2026@", help="code d'accès admin (verrou d'interface, pas une sécurité)")
    ap.add_argument("--period", default="", help="période du deck (ex. « Octobre 2026 ») : variable {{mois}} et nom des sauvegardes")
    ap.add_argument("--tokens", help="JSON {cle: valeur} ou {cle: [libellé, valeur]} : variables {{cle}} des textes ajoutés")
    ap.add_argument("--edits", help="edits.json à embarquer (modifications déjà faites)")
    ap.add_argument("--rebuild", action="store_true", help="le deck re-génère ses sections en JavaScript (comme les decks Licter v5)")
    ap.add_argument("--artifact", action="store_true", help="sortie au format artefact claude.ai (sans doctype/html/head/body)")
    a = ap.parse_args()

    src = Path(a.deck)
    html = strip_previous(src.read_text(encoding="utf-8"))
    rid = a.root.lstrip("#")
    if a.root.startswith("#") and not re.search(r"""id=["']%s["']""" % re.escape(rid), html):
        sys.exit(f"✗ Conteneur {a.root} introuvable dans {src.name} : précisez --root (ex. --root \"#deck\").")
    n_sec = len(re.findall(r"<section\b[^>]*\bid=", html))
    if n_sec == 0:
        print("⚠ Aucune <section id=…> trouvée : l'éditeur fonctionnera, mais les pages ne seront pas reconnues.")

    css = (ASSETS / "editor.css").read_text(encoding="utf-8")
    js = (ASSETS / "editor.js").read_text(encoding="utf-8")
    if a.root != "#app5":
        css = css.replace("#app5", a.root)

    tokens = {}
    if a.period:
        tokens["mois"] = ["Période du deck", a.period]
    if a.tokens:
        tokens.update(json.loads(Path(a.tokens).read_text(encoding="utf-8")))
    cfg = {"root": a.root, "client": a.client, "sector": a.sector or "", "hash": hashlib.sha256(a.code.encode()).hexdigest(),
           "key": f"licter-edits-{slug(a.client)}-", "file": slug(src.stem)[:40], "rebuild": bool(a.rebuild), "tokens": tokens}
    if a.period:
        cfg["period"] = a.period
    edits = Path(a.edits).read_text(encoding="utf-8") if a.edits else json.dumps({"v": 1, "el": {}, "add": [], "bg": {}, "updated": None})

    style_block = f"<style>{CSS_START}\n{css}\n{CSS_END}</style>"
    edits_safe = edits.replace("</", "<\\/")
    js_block = (f"{START}\n<script id=\"edits5\" type=\"application/json\">{edits_safe}</script>\n"
                f"<script>window.__DECK_EDITOR__ = {json.dumps(cfg, ensure_ascii=False)};</script>\n<script>\n{js}\n</script>\n{END}")

    if re.search(r"</head>", html, re.I):
        html = re.sub(r"</head>", lambda m: style_block + "\n</head>", html, count=1, flags=re.I)
    else:
        m = re.search(r"</style>", html, re.I)
        html = html[:m.end()] + "\n" + style_block + html[m.end():] if m else style_block + "\n" + html
    if re.search(r"</body>", html, re.I):
        html = re.sub(r"</body>", lambda m: js_block + "\n</body>", html, count=1, flags=re.I)
    else:
        html = html + "\n" + js_block

    if a.artifact:
        title = re.search(r"<title>.*?</title>", html, re.S | re.I)
        head = re.search(r"<head[^>]*>(.*?)</head>", html, re.S | re.I)
        body = re.search(r"<body[^>]*>(.*)</body>", html, re.S | re.I)
        if head and body:
            styles = "\n".join(re.findall(r"<style[^>]*>.*?</style>|<link[^>]+fonts\.googleapis[^>]+>", head.group(1), re.S | re.I))
            html = (title.group(0) if title else f"<title>{a.client} — deck</title>") + "\n" + styles + "\n" + body.group(1)

    out = Path(a.out) if a.out else src.with_name(src.stem + ("_artefact" if a.artifact else "_editable") + ".html")
    out.write_text(html, encoding="utf-8")
    print(f"✓ Éditeur injecté → {out}  ({len(html) / 1e6:.1f} Mo, {n_sec} section(s), conteneur {a.root})")
    print(f"  Accès admin : bouton ⚿ en bas à gauche ou Ctrl/Cmd + Maj + E, code « {a.code} ».")


if __name__ == "__main__":
    main()

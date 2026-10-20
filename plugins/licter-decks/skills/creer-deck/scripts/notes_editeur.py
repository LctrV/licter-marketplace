#!/usr/bin/env python3
"""Extrait les notes orales et les durées d'un deck pour l'éditeur Licter.

Usage : python3 notes_editeur.py deck.html [-o notes_editeur.json]
Lit dans chaque <section id> : <aside class="notes"> et data-duree (minutes).
Le fichier produit se passe à l'éditeur (inject.py --edits) : son mode « Présenter » reprend alors les mêmes notes
et les mêmes durées par page.
"""
import argparse
import json
from html.parser import HTMLParser
from pathlib import Path

BLOCK = {"p", "li", "br", "div", "h1", "h2", "h3", "h4", "ul", "ol"}


class Deck(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack = []          # pile des sections ouvertes : [id, profondeur]
        self.depth = 0
        self.notes_depth = None  # profondeur de l'aside.notes en cours
        self.cur = None
        self.notes, self.dur, self.order = {}, {}, []

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag in ("br",):
            if self.notes_depth is not None:
                self.notes[self.cur].append("\n")
            return
        self.depth += 1
        if tag == "section" and a.get("id"):
            self.stack.append((a["id"], self.depth))
            self.order.append(a["id"])
            d = (a.get("data-duree") or "").replace(",", ".").strip()
            try:
                if d:
                    self.dur[a["id"]] = float(d)
            except ValueError:
                pass
        if tag == "aside" and "notes" in (a.get("class") or "").split() and self.stack and self.notes_depth is None:
            self.notes_depth = self.depth
            self.cur = self.stack[-1][0]
            self.notes.setdefault(self.cur, [])
        elif self.notes_depth is not None and tag == "li":
            self.notes[self.cur].append("\n• ")
        elif self.notes_depth is not None and tag in BLOCK:
            self.notes[self.cur].append("\n")

    def handle_endtag(self, tag):
        if tag == "br":
            return
        if self.notes_depth is not None and self.depth == self.notes_depth and tag == "aside":
            self.notes_depth = None
        elif self.notes_depth is not None and tag in BLOCK and tag != "li":
            self.notes[self.cur].append("\n")
        if self.stack and self.stack[-1][1] == self.depth and tag == "section":
            self.stack.pop()
        self.depth -= 1

    def handle_data(self, data):
        if self.notes_depth is not None:
            self.notes[self.cur].append(data)


def clean(parts):
    txt = "".join(parts)
    lines = [" ".join(l.split()) for l in txt.split("\n")]
    out, blank = [], False
    for l in lines:
        if not l:
            blank = bool(out)
            continue
        if blank and out:
            out.append("")
        out.append(l)
        blank = False
    return "\n".join(out).strip()


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("deck")
    ap.add_argument("-o", "--output", default="notes_editeur.json")
    a = ap.parse_args()
    p = Deck()
    p.feed(Path(a.deck).read_text(encoding="utf-8"))
    notes = {k: clean(v) for k, v in p.notes.items() if clean(v)}
    out = {"v": 4, "notes": notes, "dur": {k: (int(v) if v == int(v) else v) for k, v in p.dur.items()}}
    Path(a.output).write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"✓ {a.output} : {len(notes)} notes, {len(out['dur'])} durées, sur {len(p.order)} sections")
    sans = [i for i in p.order if i not in notes]
    if sans:
        print("  Sections sans note : " + ", ".join(sans))


if __name__ == "__main__":
    main()

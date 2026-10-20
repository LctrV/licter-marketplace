# Decks d'essai

Pour vérifier l'éditeur sur chaque format après une évolution :

| Fichier | Format | Conteneur | Unité détectée |
|---|---|---|---|
| `../../templates/deck-vierge.html` | défilement vertical, fluide | `#deck` | rem |
| `deck-horizontal.html` | défilement horizontal aimanté | `#deck` | rem |
| `deck-diapositives-1920.html` | diapositives, scène 1920 × 1080 réduite, flèches | `#deck` | px |
| `deck-reveal.html` | Reveal.js 4 (chargé depuis cdnjs) | `.reveal .slides` | px |

```bash
python3 ../scripts/inject.py deck-reveal.html -o /tmp/reveal_ed.html --root ".reveal .slides" --code T
node navigation.mjs /tmp/reveal_ed.html T slides
```

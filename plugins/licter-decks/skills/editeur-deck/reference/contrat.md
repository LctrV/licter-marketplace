# Contrat d'intégration de l'éditeur Licter

## Structure HTML

```html
<main id="deck">                 <!-- conteneur : --root "#deck" -->
  <section id="couverture">…</section>   <!-- une page ; id stable -->
  <section id="chiffres">…</section>
</main>
```

- Les sections sont les **enfants directs** du conteneur. L'éditeur leur ajoute des pages, des fonds, des
  transitions, des blocs positionnés en `rem` (le deck doit définir sa taille de `rem` ; le modèle utilise
  `font-size: calc(100vw / 160)` sur `html`, soit 10 px à 1 600 px de large).
- Le CSS de l'éditeur vise `#app5` ; `inject.py` le réécrit vers le conteneur choisi.
- Éléments facultatifs reconnus s'ils existent : `#rail5` (sommaire à points), `#brand5` (marque en haut à gauche),
  `#tip5` (infobulle), `#edits5` (modifications embarquées, écrit par `inject.py`).

## Configuration : `window.__DECK_EDITOR__` (écrite par `inject.py`, avant le script de l'éditeur)

| Clé | Défaut | Rôle |
|---|---|---|
| `root` | `#app5` | sélecteur du conteneur des sections |
| `client` | `LVMH` | nom du client : fichiers exportés, e-mail d'envoi, citations, prompts IA, marque |
| `sector` | `luxe` | secteur, pour le ton des textes générés par l'IA |
| `hash` | empreinte de `Licter2026@` | SHA-256 du code admin (`inject.py --code` le calcule) |
| `key` | `lvmh-v5-edits-` | préfixe du brouillon local (navigateur) ; un par client |
| `file` | `v5` | segment des noms de fichiers exportés |
| `period` | — | période si le deck ne fournit pas de données (`{{mois}}`, nom des sauvegardes) |
| `tokens` | `{}` | variables `{{cle}}` : `{ "cle": "valeur" }` ou `{ "cle": ["Libellé", "valeur"] }` |
| `rebuild` | `true` (v5) / `false` (inject) | le deck re-génère-t-il ses sections en JS ? Si non, « Télécharger » conserve le HTML tel quel |
| `story` | `window.__STORY__` | source des données Licter (voir plus bas) |
| `layout` | détecté | `vertical`, `horizontal` ou `slides` (une page à la fois) |
| `unit` | `rem` (v5) / auto (inject) | unité des blocs ajoutés : `rem` (deck fluide) ou `px` (pixels de maquette de la section) |
| `go(id)` | — | fonction du deck pour afficher la page `id` (prioritaire sur la navigation automatique) |
| `current()` | — | fonction du deck qui renvoie l'`id` de la page affichée |

## Navigation selon le format

| Format | Page courante | Aller à une page |
|---|---|---|
| vertical | section qui croise le milieu de l'écran | `scrollIntoView` |
| horizontal | section la plus visible | `scrollIntoView({inline: 'start'})`, sinon flèches simulées |
| diapositives | section visible (display, visibility, opacité) la plus grande | `go(id)` du deck, sinon `Reveal.slide(i)`, sinon flèches simulées (← →) |

Échelle : une section réduite ou agrandie par `transform` (scène fixe) est mesurée (largeur affichée / largeur de
maquette) ; glisser, guides, grille et pose des blocs en tiennent compte.

Formats imposés par l'éditeur (Réglages → Format de lecture, `edits.set.fmt` = `v` | `h` | `s`) : classes
`ed-fmt-v|h|s` sur `<html>`, réservées aux decks fluides.

## Données e-réputation Licter (facultatif) : `window.__STORY__`

Format produit par `pipeline/build.py` (méthode `v4_payload`) du projet LVMH, référence d'implémentation :

```js
window.__STORY__ = {
  meta: { period: "Septembre 2026", warnings: ["…"] },          // avertissements du build → « Préparer le rapport du mois »
  labels: { period, month, m, m1, y1, m1name, m1period, y1period, nm },
  data: {
    days:   [{ date: "2026-09-01", total, pos, neu, neg, net }],   // publications quotidiennes
    m1days: [totaux du mois précédent], y1days: [totaux N-1],
    tot:    { cur: { total, pos_pct, neu_pct, neg_pct, net, radarly, linkedin, tiktok }, m1: {…}, y1: {…} },
    emv:    { current, m1, y1, reach_split: { Radarly, Linkedin, TikTok } },
    matrix: [{ sujet, label, pilier, volume, pos, neu, neg, net, m1: { net, volume } }],
    conc:   { Client: posts, Concurrent: posts }, conc_y1: { … },
    baro:   { brands: { Client: { posts, score_volume, score_sentiment, score_total, m1 } }, timeline: [{ month: "2026-09", Client: 192, … }] },
    focus:  [{ sheet: "LVMH Prize", kind: "daily", series: [{ date, value }] }],
    hist:   [{ key: "2026-09", label, year, months, n, total, net, pos_pct, neg_pct, emv, top, top_volume }]
  },
  nodes: { … }   // contenu éditorial des sections (decks v5)
};
```

Présence de `data.tot.cur` = mode « Licter » : variables chiffrées, blocs « Données », graphiques prêts à l'emploi,
alertes, historique, modèles de page analytiques. Le nom du client doit être la clé utilisée dans `conc` et `baro.brands`.

## Points d'accroche des sections Licter v5 (facultatif)

Les réglages propres aux sections (commandes sous la courbe, filtres de matrice, modes concurrents, comparaison
du baromètre, tonalité sur 12 mois, EMV mois par mois, filtre « À retenir », part de la conversation) n'apparaissent
que si le deck expose l'objet correspondant : `window.__v5conv`, `__v5mx`, `__v5conc`, `__v5baro`, `__v5perc`,
`__v5val`, `__v5ret`, `__v5topics` (méthode `setOpts(o)` ou équivalent, voir `engine/v5.js` du projet LVMH).
Un deck quelconque n'a pas besoin de les fournir.

## Capacités d'artefact claude.ai utilisées

| Capacité | Usage |
|---|---|
| `artifact` | « Enregistrer » : republie la page avec `edits.json` à jour |
| `assets` | images et vidéos importées dans l'éditeur |
| `downloads` | exports (JSON, HTML, PNG, CSV, PPTX, Markdown) |
| `sample` (`images: true`) | assistant IA : insights, titres, traduction, relecture, carte post depuis une capture |
| `comments` (`composer_only`) | commentaires de relecture |
| `room` | présence des relecteurs connectés |

Sans artefact (fichier local), tout fonctionne sauf l'enregistrement partagé, l'IA et les commentaires.

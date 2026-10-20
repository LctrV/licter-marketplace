# Faire évoluer le plugin licter-decks

## Recevoir les mises à jour (tout le monde)

Une mise à jour n'arrive que si la **version** du plugin a changé (`plugins/licter-decks/.claude-plugin/plugin.json`).

- **Automatiquement** (recommandé, une seule fois) : dans Claude Code, `/plugin` → onglet *Marketplaces* → `licter`
  → *Enable auto-update*. Les nouvelles versions s'installent alors au démarrage de Claude Code.
- **À la main** :

```bash
claude plugin marketplace update licter
```

```bash
claude plugin update licter-decks@licter
```

  puis redémarrer Claude Code (ou `/reload-plugins` dans une session).
- **claude.ai** (si l'organisation a synchronisé le dépôt) : la synchronisation se fait depuis Paramètres de
  l'organisation → Plugins & skills ; avec « Synchroniser automatiquement », chaque push est repris.

## Proposer une modification (membres avec accès en écriture)

1. Cloner le dépôt : `git clone https://github.com/LctrV/licter-marketplace.git`, créer une branche.
2. Modifier ce qu'il faut :
   - workflow de création : `plugins/licter-decks/skills/creer-deck/SKILL.md` ; vue présentateur :
     `creer-deck/assets/presentateur.js` (sans balise de fin `</head>`, `</body>`, `</html>` ni `</script>` dans le code) ;
   - instructions de l'éditeur : `plugins/licter-decks/skills/editeur-deck/SKILL.md` (et `reference/contrat.md`) ;
   - éditeur : `skills/editeur-deck/assets/editor.js` et `editor.css` ;
   - injection : `scripts/inject.py` ; deck de départ : `templates/deck-vierge.html`.
3. Tester (Playwright requis : `npm i playwright` dans un dossier de travail) :

```bash
cd plugins/licter-decks/skills/editeur-deck
python3 scripts/inject.py templates/deck-vierge.html -o /tmp/v.html --root "#deck" --code T
node tests/smoke.mjs /tmp/v.html T
node tests/navigation.mjs /tmp/v.html T vertical
```

   et de même sur les decks de `tests/exemples/` (horizontal, diapositives 1920, Reveal.js : voir le LISEZMOI).
   Pour la vue présentateur (depuis `plugins/licter-decks/skills/creer-deck`) :

```bash
python3 scripts/ajouter_presentateur.py tests/deck-exemple.html -o /tmp/p.html
node tests/presentateur.mjs /tmp/p.html
```

   Chaque test doit afficher `"ok": true`.
4. **Incrémenter la version** dans `plugins/licter-decks/.claude-plugin/plugin.json` (1.1.0 → 1.1.1 pour un correctif,
   1.2.0 pour une nouveauté). Sans cela, personne ne reçoit la modification.
5. Valider puis pousser (ou ouvrir une pull request) :

```bash
claude plugin validate --strict plugins/licter-decks
```

## Lien avec le projet LVMH

L'éditeur est aussi utilisé par le rapport LVMH (`LVMH/engine/`). `python3 pipeline/sync_plugin.py --bump --push`
(dans le projet LVMH) récupère d'abord les changements de l'équipe, copie dans le bon sens, refuse d'écraser une
modification faite des deux côtés, incrémente la version et pousse.

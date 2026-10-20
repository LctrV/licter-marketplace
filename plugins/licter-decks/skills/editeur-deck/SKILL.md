---
name: editeur-deck
description: Ajoute l'éditeur admin Licter (modifications par code d'accès, blocs, animations, présentation, artefact claude.ai partagé) à un deck HTML DÉJÀ TERMINÉ. À utiliser UNIQUEMENT quand l'utilisateur demande explicitement d'ajouter l'éditeur Licter à un deck fini (« ajoute l'éditeur », « rends ce deck éditable », « mets l'éditeur Licter dessus ») ou de mettre à jour l'éditeur d'un deck qui l'a déjà. Ne jamais l'utiliser de sa propre initiative, ni pendant la création ou la modification d'un deck, ni pour créer un deck.
argument-hint: "[deck_termine.html]"
allowed-tools: Bash(python3 ${CLAUDE_SKILL_DIR}/scripts/inject.py *), Bash(node ${CLAUDE_SKILL_DIR}/tests/smoke.mjs *), Bash(node ${CLAUDE_SKILL_DIR}/tests/navigation.mjs *)
---

# Éditeur de deck Licter

## Quand l'utiliser (règle de l'équipe)

- **Seulement sur demande explicite de l'utilisateur**, et **à la fin**, sur un deck **déjà terminé**.
- Ne jamais ajouter l'éditeur de sa propre initiative : ni en créant un deck, ni en le modifiant, ni « pour bien faire ».
  Créer un deck reste un travail normal, sans éditeur ; on peut tout au plus rappeler en une ligne, à la livraison,
  que l'éditeur peut être ajouté sur demande.
- Si le deck n'est visiblement pas fini (contenu provisoire, sections vides, demande de modifications en cours),
  le dire et demander confirmation avant d'injecter : l'éditeur se pose en dernier.

L'éditeur est un calque posé par-dessus un deck HTML : rien n'est réécrit dans le deck, toutes les retouches
(textes, positions, styles, blocs ajoutés, pages, animations, réglages lecteur) forment un objet `edits`
enregistré à part (`edits.json` dans l'artefact, ou le navigateur en local). Accès par code admin
(bouton ⚿ en bas à gauche ou Ctrl/Cmd + Maj + E) ; le code est un verrou d'interface, pas une sécurité :
les vrais droits d'enregistrement sont ceux de l'artefact.

Fichiers du skill :
- [assets/editor.js](assets/editor.js), [assets/editor.css](assets/editor.css) : l'éditeur (ne pas modifier à la main dans un deck : réinjecter).
- [scripts/inject.py](scripts/inject.py) : injection dans un deck.
- [tests/smoke.mjs](tests/smoke.mjs) : test automatique (blocs, outils, mobile).
- [templates/deck-vierge.html](templates/deck-vierge.html) : deck de départ conforme (uniquement si l'utilisateur demande expressément ce modèle).
- [reference/contrat.md](reference/contrat.md) : configuration complète, données Licter, capacités d'artefact. Le lire avant une intégration inhabituelle.

## 1. Vérifier que le deck est compatible

Le deck doit avoir **un conteneur** (ex. `<main id="deck">`, ou `.reveal .slides` pour Reveal.js) dont **chaque
enfant direct est une `<section id="…">`** (une section = une page pour l'éditeur). Les `id` doivent être stables
d'un build à l'autre : ce sont les adresses des modifications enregistrées. Si le deck n'a pas cette structure,
l'adapter (envelopper les slides dans des `<section id>`), sans toucher au contenu.

**Tous les formats de deck sont pris en charge**, détectés au chargement :
- **défilement vertical** (pages empilées, récit au scroll) ;
- **défilement horizontal** (pages côte à côte, conteneur à défilement horizontal, éventuellement aimanté) ;
- **diapositives** (une page visible à la fois, navigation par flèches : deck maison, Reveal.js, scène 1920 × 1080
  réduite par `transform: scale`…).
L'éditeur trouve la page affichée, y va (API du deck, Reveal.js, défilement, sinon flèches simulées), pose les blocs
sur la bonne page et convertit les déplacements à l'échelle de la scène. Forcer le format si la détection se trompe :
`--layout vertical|horizontal|slides`. Si le deck expose sa propre API, la brancher dans `__DECK_EDITOR__`
(`go(id)`, `current()` → id, voir [reference/contrat.md](reference/contrat.md)).

**Unité des blocs ajoutés** (`--unit`, automatique) : `rem` si la police racine du deck suit la largeur de l'écran
(`font-size` en `vw`/`calc`, comme le modèle et les decks Licter), sinon `px` « de maquette » (pixels de la section,
mis à l'échelle avec elle : scène 1920 × 1080, Reveal.js 960 × 700, deck à taille fixe).

Si le deck re-génère ses sections en JavaScript au chargement (comme les decks Licter v5), passer `--rebuild`.

Le modèle `templates/deck-vierge.html` (conteneur `#deck`, 5 sections d'exemple, typographie et couleurs Licter)
n'est utilisé que si l'utilisateur le demande expressément ; il ne remplace pas le deck de l'utilisateur.

## 2. Injecter l'éditeur

```bash
python3 ${CLAUDE_SKILL_DIR}/scripts/inject.py deck.html -o deck_editable.html \
  --root "#deck" --client "Nom du client" --sector "luxe" --code "CodeAdmin" --period "Octobre 2026"
```

- `--root` : sélecteur du conteneur (défaut `#app5`). `--client` : nom affiché (fichiers exportés, e-mails, prompts IA).
- `--code` : code admin (défaut `Licter2026@`) ; demander à l'utilisateur s'il en veut un propre au client.
- `--tokens vars.json` : variables `{{cle}}` utilisables dans les textes ajoutés (`{"publications": ["Publications", "12 480"]}`).
- `--layout` / `--unit` : forcer le format ou l'unité si la détection automatique se trompe (voir étape 1).
- `--edits edits.json` : embarquer des modifications déjà faites. `--artifact` : sortie au format artefact (voir étape 4).
- Relancer le script sur un fichier déjà équipé remplace l'ancienne version de l'éditeur (mise à jour).

## 3. Tester

```bash
node ${CLAUDE_SKILL_DIR}/tests/smoke.mjs deck_editable.html CodeAdmin ./captures
```

Prérequis : le paquet `playwright` (`npm i playwright` dans un dossier de travail, puis lancer depuis ce dossier,
ou `PLAYWRIGHT=/chemin/vers/node_modules/playwright`). Chrome installé est utilisé s'il existe.
Le test doit afficher `"ok": true` : tous les blocs et outils sans erreur, aucun débordement horizontal à 390 px.
Puis le test de navigation, en donnant le format attendu :

```bash
node ${CLAUDE_SKILL_DIR}/tests/navigation.mjs deck_editable.html CodeAdmin slides ./captures
```

Il vérifie le format détecté, l'accès à une page, l'ajout d'un bloc sur la page affichée, un glisser de 100 px exact
à l'écran (échelle de la scène comprise), la page suivante et, pour un deck fluide, les formats de lecture imposés.
Regarder les captures avant de livrer.

## 4. Publier comme artefact partagé (recommandé pour l'équipe et le client)

1. Produire la version artefact : `inject.py … --artifact -o deck_artefact.html`.
2. Publier avec l'outil Artifact, `file_path` = ce fichier, et ces capacités (elles servent à l'enregistrement,
   aux images, aux téléchargements, à l'IA, aux commentaires et à la présence) :
   `{"artifact": {}, "assets": {}, "downloads": true, "sample": {"images": true}, "comments": {"composer_only": true}, "room": {}}`
3. **Mises à jour** : republier le même `file_path` (ou l'URL de l'artefact) **sans passer `files`**, pour conserver
   l'`edits.json` enregistré depuis la page. En cas de conflit de version, relire l'artefact, vérifier que seules
   les modifications de l'équipe diffèrent, puis republier.
4. Donner à l'utilisateur le lien et le code admin. Le partage (« toute personne disposant du lien ») se règle
   depuis le menu Partager de la page.

En local (sans artefact), les modifications restent dans le navigateur : « Exporter » produit `edits.json`
(à réinjecter avec `--edits`), « Télécharger » produit un HTML autonome avec les modifications.

## 5. Données e-réputation Licter (optionnel)

Si le deck fournit `window.__STORY__ = {meta, labels, data}` au format des rapports e-réputation Licter
(publications quotidiennes, tonalité, EMV, matrice, concurrents, baromètre, historique), l'éditeur active
en plus les variables chiffrées (`{{publications}}`, `{{sentiment_net}}`…), les blocs « Données », les graphiques
prêts à l'emploi, les alertes et les modèles de page analytiques. Sans ces données, ces menus sont masqués
et les variables inconnues deviennent « [à compléter] ». Détail du format : [reference/contrat.md](reference/contrat.md).

## Format de lecture (option pour l'équipe)

Dans l'éditeur, Réglages → **Format de lecture** : un deck fluide peut être lu en défilement vertical, en défilement
horizontal (pages côte à côte, aimantées) ou en diapositives (une page à la fois ; transition fondu, glissement, zoom),
avec flèches, molette et glisser au doigt. Un deck à taille fixe (scène mise à l'échelle, Reveal.js) garde sa propre
présentation : l'option est alors désactivée.

## Limites à rappeler

- Les modifications visent les éléments par leur position dans chaque section : si la structure d'une section change
  fortement au build suivant, certaines retouches de cette section peuvent ne plus s'appliquer (les blocs ajoutés, eux, restent).
- Les modifications d'un deck ne se transfèrent pas à un autre deck ; « Mes blocs » (bibliothèque) et la charte s'exportent.
- Le code admin n'est qu'un verrou d'interface.
- Les sections animées au défilement (récit au scroll) ne fonctionnent qu'en format vertical.
- Deck à diapositives sans API ni Reveal.js : l'éditeur navigue en simulant les flèches ; si le deck ne les écoute pas,
  fournir `go(id)` / `current()` dans la configuration.

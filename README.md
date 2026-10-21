# Plugins Licter pour Claude

Dépôt « marketplace » interne. Il contient pour l'instant un plugin :

| Plugin | Contenu |
|---|---|
| `licter-decks` | Skill **creer-deck** : construit un deck HTML en un seul prompt, ou étape par étape (matière, cadrage, storyline, contenu, style, squelette, finitions, relecture, oral, export, éditeur) en mode express ou complet, avec questions et validation à chaque étape, et une vue présentateur (notes, slide suivante, chronomètres, écran noir). Skill **editeur-deck** : rend n'importe quel deck ou rapport HTML éditable par l'équipe (éditeur admin par code, 46 à 67 blocs, graphiques, animations et transitions, mode présentation, assistant IA, enregistrement dans un artefact claude.ai partagé), pour tout format de deck (défilement vertical, horizontal, diapositives, Reveal.js, scène 1920 × 1080), avec un deck de départ et des tests automatiques. |

## Installer (chaque membre de l'équipe)

### Claude Code (terminal, application de bureau, IDE)

```bash
claude plugin marketplace add https://github.com/LctrV/licter-marketplace.git
```

```bash
claude plugin install licter-decks@licter
```

(ou, dans une session : `/plugin marketplace add https://github.com/LctrV/licter-marketplace.git` puis `/plugin install licter-decks@licter`.)
Le dépôt est public : aucun compte GitHub n'est nécessaire. Utiliser l'adresse `https://…` (et non `git@github.com:…`),
qui évite l'erreur « SSH authentication failed ».

### claude.ai (pour toute l'organisation)

Un propriétaire de l'organisation l'ajoute une fois : **Paramètres de l'organisation → Plugins & skills → Ajouter →
Synchroniser depuis GitHub**, puis choisit l'accès par défaut (« Installé par défaut » conseillé).
Le plugin apparaît alors pour chacun dans claude.ai, l'application de bureau et Claude Code (`licter-decks@synced`).

## Utiliser

### Créer un deck étape par étape

```text
/licter-decks:creer-deck sujet, brief ou dossier de matière
```

Claude demande d'abord le mode :

- **1 prompt** (le raccourci) : vous joignez vos fichiers et écrivez une phrase. Claude montre d'abord la structure
  des slides (titre, contenu, durée de chacune) et attend votre OK, puis livre le deck d'une traite (notes, durées et
  vue présentateur compris), que vous corrigez par petites demandes. Deux validations : la structure, puis le deck. Idéal pour un premier jet ou un deck interne. Prompt type :

  ```text
  Génère-moi un deck de slides HTML animé, interactif et designé, pour [public] sur le sujet [sujet].
  Prends les chiffres uniquement dans les fichiers joints et cite la source sous chaque graphique.
  Respecte la charte Licter. 12 slides, 20 minutes d'oral, mes notes sous chaque slide.
  Un seul fichier HTML, en 16:9, navigable au clavier.
  ```

  Si la demande est déjà un prompt complet comme celui-ci, Claude ne pose pas la question du mode et lance le raccourci.
- **complet** : 11 étapes (0 à 10), une validation chacune : préparer la matière, cadrer, storyline, contenu,
  direction artistique, squelette, finitions, relecture, oral, export, éditeur Licter ;
- **express** : les mêmes étapes regroupées en 4 blocs, 4 validations (decks internes, ateliers, délais courts).

À chaque étape, il pose ses questions, montre un livrable court et attend un « OK » avant de continuer. Il peut aussi
se lancer de lui-même quand on lui demande un deck HTML.

L'étape **oral** ajoute les notes, le minutage par slide, les questions difficiles et la **vue présentateur** :
touche **P** dans le deck (fenêtre à part pour le deuxième écran ; **Maj + P** par-dessus le deck), avec la slide
affichée et la suivante, les notes, les chronomètres (slide, total, rythme), la navigation synchronisée et l'écran
noir (**B**). À l'étape 10, il prépare `notes_editeur.json` et propose de taper `/licter-decks:editeur-deck` sur le
fichier final : le mode « Présenter » de l'éditeur reprend alors les mêmes notes et durées.

### Ajouter l'éditeur à un deck terminé

L'éditeur **ne s'ajoute jamais tout seul** : Claude crée et modifie les decks normalement, sans lui. Une fois le deck
terminé, taper la commande :

```text
/licter-decks:editeur-deck mon_deck.html
```

C'est le seul moyen de le lancer (le skill est verrouillé : une demande en phrase ne suffit pas). Le skill guide Claude : vérification de la structure, injection,
test, publication en artefact, transmission du lien et du code admin.

Sans Claude, le script s'utilise seul :

```bash
python3 plugins/licter-decks/skills/editeur-deck/scripts/inject.py deck.html --root "#deck" --client "Client" --code "Code2026"
```

## Mises à jour et contributions

- Recevoir les nouvelles versions : activer la mise à jour automatique (`/plugin` → *Marketplaces* → `licter` →
  *Enable auto-update*), ou `claude plugin marketplace update licter` puis `claude plugin update licter-decks@licter`.
- Proposer une modification (accès en écriture au dépôt) : voir [CONTRIBUER.md](CONTRIBUER.md). Toujours incrémenter
  la version du plugin, sinon personne ne reçoit le changement.

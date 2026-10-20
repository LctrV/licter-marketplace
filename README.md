# Plugins Licter pour Claude

Dépôt « marketplace » interne. Il contient pour l'instant un plugin :

| Plugin | Contenu |
|---|---|
| `licter-decks` | Skill **editeur-deck** : rend n'importe quel deck ou rapport HTML éditable par l'équipe (éditeur admin par code, 46 à 67 blocs, graphiques, animations et transitions, mode présentation, assistant IA, enregistrement dans un artefact claude.ai partagé), avec un deck de départ et un test automatique. |

## Installer (chaque membre de l'équipe)

### Claude Code (terminal, application de bureau, IDE)

```bash
claude plugin marketplace add https://github.com/LctrV/licter-marketplace.git
```

```bash
claude plugin install licter-decks@licter
```

(ou, dans une session : `/plugin marketplace add https://github.com/LctrV/licter-marketplace.git` puis `/plugin install licter-decks@licter`.)
Le dépôt est privé : il faut y être invité comme collaborateur, et que git puisse s'y connecter en HTTPS
(`gh auth login` puis `gh auth setup-git`). L'adresse `https://…` évite l'erreur « SSH authentication failed ».

### claude.ai (pour toute l'organisation)

Un propriétaire de l'organisation l'ajoute une fois : **Paramètres de l'organisation → Plugins & skills → Ajouter →
Synchroniser depuis GitHub** (dépôt privé), puis choisit l'accès par défaut (« Installé par défaut » conseillé).
Le plugin apparaît alors pour chacun dans claude.ai, l'application de bureau et Claude Code (`licter-decks@synced`).

## Utiliser

Dans Claude : « rends ce deck éditable », « crée un deck HTML éditable pour le client X », ou directement
`/licter-decks:editeur-deck mon_deck.html`. Le skill guide Claude : vérification de la structure, injection,
test, publication en artefact, transmission du lien et du code admin.

Sans Claude, le script s'utilise seul :

```bash
python3 plugins/licter-decks/skills/editeur-deck/scripts/inject.py deck.html --root "#deck" --client "Client" --code "Code2026"
```

## Mettre à jour l'éditeur

La source de l'éditeur est le projet LVMH (`engine/editor.js`, `engine/editor.css`). Après une évolution :

```bash
python3 pipeline/sync_plugin.py --bump
```

puis valider (`claude plugin validate --strict plugins/licter-decks`), committer et pousser ce dépôt.
Chacun reçoit la nouvelle version avec `claude plugin marketplace update licter` puis `claude plugin update licter-decks@licter`
(ou automatiquement si la mise à jour automatique du marketplace est activée dans `/plugin`).
Une version non incrémentée n'est pas redistribuée.

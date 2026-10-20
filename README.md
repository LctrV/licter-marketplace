# Plugins Licter pour Claude

Dépôt « marketplace » interne. Il contient pour l'instant un plugin :

| Plugin | Contenu |
|---|---|
| `licter-decks` | Skill **editeur-deck** : rend n'importe quel deck ou rapport HTML éditable par l'équipe (éditeur admin par code, 46 à 67 blocs, graphiques, animations et transitions, mode présentation, assistant IA, enregistrement dans un artefact claude.ai partagé), pour tout format de deck (défilement vertical, horizontal, diapositives, Reveal.js, scène 1920 × 1080), avec un deck de départ et des tests automatiques. |

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

## Mises à jour et contributions

- Recevoir les nouvelles versions : activer la mise à jour automatique (`/plugin` → *Marketplaces* → `licter` →
  *Enable auto-update*), ou `claude plugin marketplace update licter` puis `claude plugin update licter-decks@licter`.
- Proposer une modification (accès en écriture au dépôt) : voir [CONTRIBUER.md](CONTRIBUER.md). Toujours incrémenter
  la version du plugin, sinon personne ne reçoit le changement.

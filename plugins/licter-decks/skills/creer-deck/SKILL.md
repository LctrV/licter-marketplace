---
name: creer-deck
description: Construit un deck de présentation HTML étape par étape (préparer la matière, cadrer, storyline, contenu, direction artistique, squelette, finitions, relecture, oral avec vue présentateur, export, éditeur Licter), en mode complet ou express, en posant des questions et en demandant une validation à chaque étape. À utiliser quand on veut créer un deck, une présentation ou un rapport HTML Licter, sur n'importe quel sujet, à partir d'un brief, de données ou d'une analyse.
argument-hint: "[sujet, brief ou dossier de matière]"
allowed-tools: Bash(python3 ${CLAUDE_SKILL_DIR}/scripts/ajouter_presentateur.py *), Bash(python3 ${CLAUDE_SKILL_DIR}/scripts/notes_editeur.py *), Bash(node ${CLAUDE_SKILL_DIR}/tests/presentateur.mjs *)
---

# Créer un deck HTML Licter, étape par étape

Ce skill guide la construction d'un deck HTML en **11 étapes (0 à 10)**, en **mode complet** ou en **mode express**.
Chaque étape (ou chaque bloc d'étapes en express) suit le même cycle :

```
Questions → Livrable court → ✅ Validation → étape suivante
                  ↑              │
                  └── ❌ corrections
```

Fichiers du skill :
- [assets/presentateur.js](assets/presentateur.js) : la vue présentateur (ne pas la recopier à la main : utiliser le script).
- [scripts/ajouter_presentateur.py](scripts/ajouter_presentateur.py) : insère ou met à jour la vue présentateur dans un deck.
- [scripts/notes_editeur.py](scripts/notes_editeur.py) : extrait notes et durées pour l'éditeur Licter (étape 10).
- [tests/presentateur.mjs](tests/presentateur.mjs) : test automatique de la vue présentateur ;
  [tests/deck-exemple.html](tests/deck-exemple.html) : deck minimal conforme à l'étape 5.

## Règles strictes

1. **Choisir le mode avant tout** (voir ci-dessous), puis **une seule étape (ou un seul bloc) à la fois**. Annoncer
   où l'on en est : « **Étape 2/10 : Storyline** » ou « **Bloc 1/4 : Matière, cadrage, storyline** ».
2. **Commencer chaque étape par 3 à 5 questions pertinentes**, adaptées à ce qui est déjà connu. Ne jamais poser une
   question dont la réponse se trouve dans la matière fournie ou dans les échanges précédents ; supprimer les questions
   devenues inutiles. Utiliser l'outil de questions s'il est disponible, sinon une liste numérotée.
3. **Produire un livrable court**, puis terminer par :
   « ✅ Je valide / ❌ Je corrige : qu'est-ce qui ne va pas ? »
4. **Ne jamais passer à l'étape suivante sans un OK explicite** (« ok », « validé », « go »…). Un silence, une question
   ou une remarque n'est pas une validation. Après une correction, représenter le livrable corrigé et redemander.
5. **Ne pas écrire de code avant l'étape 5** (bloc 3 en express). Les étapes précédentes se font en texte.
6. Pour un choix, proposer **2 ou 3 options au maximum, avec une recommandation**.
7. **N'inventer aucun chiffre** : n'utiliser que ceux de la matière fournie, citer la source, signaler tout manque.
   Ne pas recalculer un KPI déjà fourni.
8. Si l'utilisateur veut sauter une étape, l'accepter, en notant en une ligne ce que l'étape aurait vérifié.
   On peut passer d'un mode à l'autre en cours de route si l'utilisateur le demande.
9. Garder en tête un récapitulatif des décisions validées (message clé, plan, style, durée) et s'y tenir ensuite.

Si `$ARGUMENTS` contient un sujet, un brief ou un chemin de dossier, s'en servir dès le choix du mode et l'étape 0.

## Choisir le mode (première question, toujours)

Demander : « Mode complet ou mode express ? » avec une recommandation selon ce qu'on sait déjà :

| | Mode complet | Mode express |
|---|---|---|
| Pour | deck client, comité, enjeu fort, plus de 10 slides | deck interne, atelier, moins de 10 slides, délai court |
| Étapes | les 11 étapes, une validation chacune | 4 blocs, 4 validations |
| Oral (étape 8) | complet : notes, minutage, questions difficiles, répétition | notes et durées proposées d'office, vue présentateur incluse |

### Mode express : les 4 blocs

Les étapes sont les mêmes que ci-dessous, mais regroupées. Par bloc : **5 questions au maximum** (les plus
déterminantes), un livrable qui réunit ceux des étapes du bloc, **une seule validation**.

1. **Matière, cadrage, storyline** (étapes 0, 1, 2) → inventaire en 3 lignes, brief en 4 lignes, liste des titres affirmatifs.
2. **Contenu et style** (étapes 3, 4) → table de correspondance et planche de style.
3. **Squelette et finitions** (étapes 5, 6) → le deck codé et soigné en une passe, aperçu montré.
4. **Relecture, oral, export, éditeur** (étapes 7, 8, 9, 10) → checklist de relecture faite, notes et durées ajoutées,
   vue présentateur insérée, exports, puis la question de l'éditeur Licter (étape 10, qui reste une question à part).

---

## Étape 0 : Préparer la matière

**Objectif** : savoir de quoi on dispose avant de construire.

Questions types :
- Quels fichiers as-tu (brief, données, analyse, charte, logo, images) ? Lesquels font foi ?
- Y a-t-il des données confidentielles à anonymiser (noms, montants exacts) ?
- Les chiffres sont-ils déjà calculés, ou dois-je en calculer certains ? Avec quelle méthode ?
- Quelle période et quelle source dois-je citer ?

Si l'utilisateur fournit des fichiers, les lire et en tirer les réponses avant de poser les questions restantes.
Si l'utilisateur n'a encore rien (ni brief, ni données), le dire et passer à l'étape 1 : le brief s'y écrit.

**Livrable** : un inventaire (fichier → contenu → usage prévu), les manques repérés et, s'il y a une analyse,
5 à 10 insights au format « constat + chiffre + so what ».

**✅ Validation** : « L'inventaire est complet et rien ne manque. »

## Étape 1 : Cadrer

**Objectif** : un brief clair en 4 lignes.

Questions types :
- Qui est l'audience (fonction, niveau, attentes) ?
- Que doit-elle retenir, décider ou faire après la présentation ?
- Quel format : durée, présentiel ou envoi seul, projeté ou lu sur écran ?
- Si l'audience ne retient qu'une phrase, laquelle ?

Si un brief existe déjà, le reformuler en 4 lignes et ne demander que ce qui manque.

**Livrable** : objectif, audience, format (durée, environ 1 slide pour 2 minutes), message clé en une phrase.

**✅ Validation** : « Le message clé est le bon. »

## Étape 2 : Storyline

**Objectif** : un récit qui tient en lisant seulement les titres.

Questions types :
- Commencer par la conclusion (recommandation d'abord) ou par le contexte ?
- Y a-t-il un point sensible ou une objection attendue à traiter ?
- Combien de slides au maximum ? Faut-il des annexes ?
- Un insight doit-il absolument figurer, ou au contraire être écarté ?

**Livrable** : un plan en pyramide (1 message principal, 3 arguments, preuves) puis la liste numérotée des slides,
chacune avec un **titre affirmatif** (« Les avis négatifs ont augmenté de 34 % au T3 », pas « Avis négatifs »).
Ce qui ne sert pas le message principal part en annexe.

**✅ Validation** : « Le récit tient en lisant seulement les titres. »

## Étape 3 : Contenu slide par slide

**Objectif** : un message et une preuve par slide.

Questions types :
- Pour tel insight, quel visuel : graphique, chiffre clé, citation, schéma, image ?
- Ce chiffre doit-il être arrondi ou exact ?
- Sur la slide X, deux options sont possibles : laquelle choisis-tu ?

**Livrable** : la table de correspondance :

| # | Titre (affirmation) | Visuel | Données (fichier, colonne) |
|---|---|---|---|

Les notes orales et le minutage se font à l'étape 8.

**✅ Validation** : « Chaque slide a un seul message et sa preuve. »

## Étape 4 : Direction artistique

**Objectif** : fixer le style une fois pour tout le deck.

Questions types :
- Faut-il respecter une charte (couleurs, polices, logo) ? Laquelle ?
- Fond clair ou sombre ? Ton sobre, éditorial ou impactant ?
- As-tu 2 ou 3 références visuelles qui te plaisent ?
- Le deck sera-t-il imprimé ou exporté en PDF ? (cela change les contrastes et le fond)

**Livrable** : une planche de style courte : 1 fond, 1 couleur de texte, 1 ou 2 couleurs d'accent, 2 polices au
maximum, le logo, la liste des 5 ou 6 layouts prévus (couverture, titre de section, texte + visuel, chiffres clés,
graphique, conclusion). Pas de code à cette étape.

**✅ Validation** : « Ce style convient pour tout le deck. »

## Étape 5 : Squelette

**Objectif** : un deck complet mais brut, avec toute la structure et tout le contenu en place.

Questions types :
- Quel format de lecture : diapositives (une page à la fois), défilement vertical ou horizontal ?
- Quels besoins de navigation : flèches clavier, compteur, plein écran, sommaire ?
- Le deck doit-il fonctionner hors connexion le jour J ? (alors pas de police ni d'image externe)
- Quel nom de fichier ?

Règles de construction (elles rendent les étapes 8 et 10 possibles sans retouche) :
- **Un seul fichier HTML**, CSS et JavaScript intégrés ; couleurs et polices en **variables CSS sur `:root`**
  reprenant la planche de l'étape 4.
- **Un conteneur unique** (par exemple `<main id="deck">`) dont **chaque enfant direct est une
  `<section id="…">`** : une section = une slide. Le JavaScript du deck change de slide (classes, défilement) mais
  ne régénère pas les sections.
- **Des `id` stables et lisibles** (`couverture`, `contexte`, `irritants`…), jamais générés aléatoirement :
  ce sont les adresses des notes, des durées et des modifications de l'éditeur Licter.
- **Une API de navigation** `window.__DECK__ = { ids(), current(), go(id), next(), prev() }`, et un événement
  `deck:change` (`dispatchEvent(new CustomEvent('deck:change', { detail: { id } }))`) émis à chaque changement de
  slide. `next()` / `prev()` passent par les apparitions progressives s'il y en a. Exemple complet :
  [tests/deck-exemple.html](tests/deck-exemple.html).
- Navigation clavier : flèches, Espace, Page suivante / précédente (les télécommandes de présentation envoient
  ces touches). **Ne pas utiliser la touche P** : elle ouvre la vue présentateur (étape 8).
- Tailles fluides : police racine liée à la largeur de l'écran (par exemple `html { font-size: calc(100vw / 160); }`)
  et tailles en `rem`, ou scène fixe 1920 × 1080 mise à l'échelle.
- Graphiques avec une librairie à version fixe (par exemple Chart.js depuis cdnjs), alimentés uniquement par les
  données validées à l'étape 3. Source et période en bas de chaque slide de données.
- Ne pas ajouter l'éditeur Licter à cette étape (voir l'étape 10).

Ouvrir le deck dans un navigateur (aperçu ou artefact) pour le montrer, si l'environnement le permet.

**Livrable** : le fichier HTML et une capture ou un lien d'aperçu.

**✅ Validation** : « La structure et la navigation sont OK, on passe aux finitions. »

## Étape 6 : Finitions

**Objectif** : soigner le deck par petits lots.

Questions types :
- Quelles slides te gênent le plus ? (on les traite en priorité)
- Veux-tu des animations ? Si oui, uniquement des apparitions progressives ?
- Les graphiques doivent-ils être interactifs (survol) ou statiques ?

Travailler **par lots de 3 à 5 slides**, avec une validation à chaque lot, pas seulement à la fin.
Faire des corrections ciblées ; ne jamais régénérer tout le deck pour une retouche.

**Livrable** : le lot de slides retravaillé.

**✅ Validation** : un OK par lot, puis « Toutes les slides sont finalisées. »

## Étape 7 : Relecture

**Objectif** : zéro erreur avant de préparer l'oral.

Questions types :
- Sur quel écran sera-t-il projeté ? (taille du texte, contraste)
- Quelqu'un d'autre doit-il relire avant diffusion ?
- Y a-t-il des points sur lesquels tu as un doute ?

Vérifier soi-même, sans attendre qu'on le demande :
- **chaque chiffre affiché**, comparé à la source (lister les écarts) ;
- fautes d'orthographe et cohérence des titres ;
- lisibilité (environ 24 px minimum en 1080p, 30 mots maximum par slide) ;
- navigation du début à la fin, affichage en plein écran et sur un écran étroit.

**Livrable** : la checklist de contrôle avec, pour chaque point, ✅ ou la correction faite.

**✅ Validation** : « Tous les chiffres sont vérifiés et le test en plein écran est fait. »

## Étape 8 : Préparer l'oral (notes, minutage, vue présentateur)

**Objectif** : que la personne qui présente soit prête, pas seulement le deck.

Questions types :
- Qui présente ? Une seule personne ou plusieurs (qui prend quelles slides) ?
- Combien de temps exactement, questions comprises ? Que couper en priorité si le temps manque ?
- Préfères-tu des notes rédigées (phrases complètes) ou des puces (mots-clés) ?
- Présenteras-tu avec deux écrans (ordinateur + projecteur) ou un seul ?

**8a. Notes orales.** Dans chaque `<section id>`, ajouter un bloc masqué :
```html
<aside class="notes">
  <p>Phrase d'accroche.</p>
  <ul><li>Point à dire</li><li>Chiffre à souligner, avec sa source</li></ul>
  <p>Transition vers la slide suivante.</p>
</aside>
```
Les notes disent ce que la slide ne montre pas (contexte, anecdote, transition) : pas de relecture du texte de la slide.
Pour plusieurs orateurs, commencer les notes par le prénom de la personne qui parle.

**8b. Minutage.** Mettre la durée prévue (en minutes, décimales possibles) sur chaque section :
`<section id="irritants" data-duree="2.5">`. Le total doit tenir dans la durée validée à l'étape 1, en gardant
environ 15 % de marge pour les questions. Montrer le tableau slide → durée, avec le total.

**8c. Questions difficiles.** Lister les 5 questions que l'audience risque de poser, chacune avec une réponse courte
et, si besoin, une slide d'annexe qui y répond (ajoutée en fin de deck, avec sa note).

**8d. Vue présentateur.** L'insérer avec le script (relancer le même script après toute modification du deck) :
```bash
python3 ${CLAUDE_SKILL_DIR}/scripts/ajouter_presentateur.py deck.html
```
Puis la tester si Playwright est disponible (`npm i playwright` dans un dossier de travail, ou `PLAYWRIGHT=…`) :
```bash
node ${CLAUDE_SKILL_DIR}/tests/presentateur.mjs deck.html ./captures
```
Le test doit afficher `"ok": true`. Regarder les captures.

Ce qu'elle offre (à expliquer à l'utilisateur) :
- **P** dans le deck : ouvre la vue présentateur dans une fenêtre à part, à placer sur l'écran de l'ordinateur pendant
  que le deck est projeté en plein écran. **Maj + P** : la vue s'affiche par-dessus le deck (répétition sur un seul
  écran). Si le navigateur bloque les fenêtres (par exemple dans un artefact), elle s'affiche par-dessus le deck.
- La slide affichée et la slide suivante en miniature, les notes (taille réglable avec A− / A+), la position
  (« 3 / 12 » et le titre), une barre de progression et l'heure.
- Trois chronomètres : temps sur la slide (orange à 80 % de sa durée prévue, rouge au-delà), temps total par rapport
  au total prévu, et le rythme (« Dans les temps », « En retard de 1:20 », « En avance de 0:45 »).
- Navigation depuis la vue présentateur (← → Espace, Page suivante / précédente, liste « Aller à »), synchronisée dans
  les deux sens avec le deck projeté. **B** : écran noir sur le deck projeté. **T** : pause du chronomètre.
  **R** : remise à zéro. **Échap** : fermer.
- La touche P est ignorée quand l'éditeur Licter est en mode admin ou en présentation.

**8e. Répétition.** Proposer une répétition chronométrée (vue présentateur en Maj + P) et ajuster ensuite les notes ou
les durées des slides qui débordent.

**Livrable** : le deck avec notes, durées et vue présentateur ; le tableau de minutage ; la liste des questions
difficiles et leurs réponses.

**✅ Validation** : « Les notes, le minutage et la vue présentateur me conviennent. »

## Étape 9 : Export

**Objectif** : les versions figées du deck.

Questions types :
- Quel format : fichier HTML, PDF, ou les deux ?
- Pour le PDF : une slide par page, avec ou sans les notes orales ?

Pour le PDF, ajouter un `@media print` (une section par page, fond conservé), puis exporter avec Chrome
(« Imprimer » → « Enregistrer en PDF ») ou un outil sans interface si l'environnement le permet.
**PDF avec notes** : ajouter la classe `imprimer-notes` sur `<html>` avant l'impression ; la vue présentateur affiche
alors les notes sous chaque slide à l'impression. Le lien partagé et modifiable vient de l'étape 10.

**Livrable** : les fichiers exportés.

**✅ Validation** : « Les exports s'ouvrent correctement. »

## Étape 10 : Éditeur Licter

**Objectif** : rendre le deck terminé modifiable par l'équipe ou le client.

Questions types :
- Le deck doit-il être modifiable par l'équipe ou le client, ou rester figé ?
- Qui pourra le modifier ? Faut-il un code admin propre au client ?
- Faut-il le publier comme artefact claude.ai partagé, pour enregistrer les modifications en ligne ?
- Quel fichier est la version finale ? (celui validé à l'étape 9)

Si l'utilisateur ne veut pas d'éditeur, conclure : le deck est terminé.

Sinon :
1. Préparer les notes et les durées pour le mode « Présenter » de l'éditeur (ce mode a ses propres notes) :
   ```bash
   python3 ${CLAUDE_SKILL_DIR}/scripts/notes_editeur.py deck_final.html -o notes_editeur.json
   ```
2. Demander explicitement :

   > Le deck est validé. Pour ajouter l'éditeur Licter, tape la commande :
   > `/licter-decks:editeur-deck deck_final.html`
   > et précise-lui d'embarquer les notes : `--edits notes_editeur.json`.

L'éditeur ne peut être lancé **que par cette commande tapée par l'utilisateur** : ne pas l'injecter soi-même, ne pas
appeler `inject.py` directement, ne pas lancer le skill `editeur-deck` à la place de l'utilisateur. Rappeler les
réponses déjà données (client, code admin, publication en artefact) pour qu'elles servent au skill `editeur-deck`.
La vue présentateur (touche P) reste disponible pour tous les lecteurs du deck ; le mode « Présenter » de l'éditeur
(laser, stylo, projecteur) est réservé à l'admin et reprend les mêmes notes et durées grâce à `notes_editeur.json`.

**Livrable** : `notes_editeur.json` et la commande à taper, avec le bon nom de fichier.

**✅ Validation** : une fois l'éditeur ajouté par `editeur-deck`, « J'ai testé l'accès avec le code, une modification
s'enregistre, la touche P fonctionne et le lien marche chez un destinataire. »

---

## Fin du workflow

Terminer par un récapitulatif court : mode suivi, message clé, nombre de slides, durée prévue, fichiers produits,
lien éventuel, et ce qui reste à faire (répétition, relecture par un tiers, éditeur à ajouter…).

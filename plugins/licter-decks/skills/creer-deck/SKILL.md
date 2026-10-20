---
name: creer-deck
description: Construit un deck de présentation HTML étape par étape (préparer la matière, cadrer, storyline, contenu, direction artistique, squelette, finitions, relecture, export, éditeur Licter), en posant des questions et en demandant une validation à chaque étape. À utiliser quand on veut créer un deck, une présentation ou un rapport HTML Licter, sur n'importe quel sujet, à partir d'un brief, de données ou d'une analyse.
argument-hint: "[sujet, brief ou dossier de matière]"
---

# Créer un deck HTML Licter, étape par étape

Ce skill guide la construction d'un deck HTML en **10 étapes (0 à 9)**. Chaque étape suit le même cycle :

```
Questions → Livrable court → ✅ Validation → étape suivante
                  ↑              │
                  └── ❌ corrections
```

## Règles strictes

1. **Une seule étape à la fois.** Annoncer l'étape en cours : « **Étape 2/9 : Storyline** ».
2. **Commencer chaque étape par 3 à 5 questions pertinentes**, adaptées à ce qui est déjà connu. Ne jamais poser une
   question dont la réponse se trouve dans la matière fournie ou dans les échanges précédents ; supprimer les questions
   devenues inutiles. Utiliser l'outil de questions s'il est disponible, sinon une liste numérotée.
3. **Produire un livrable court**, puis terminer par :
   « ✅ Je valide / ❌ Je corrige : qu'est-ce qui ne va pas ? »
4. **Ne jamais passer à l'étape suivante sans un OK explicite** (« ok », « validé », « go »…). Un silence, une question
   ou une remarque n'est pas une validation. Après une correction, représenter le livrable corrigé et redemander.
5. **Ne pas écrire de code avant l'étape 5.** Les étapes 0 à 4 se font en texte.
6. Pour un choix, proposer **2 ou 3 options au maximum, avec une recommandation**.
7. **N'inventer aucun chiffre** : n'utiliser que ceux de la matière fournie, citer la source, signaler tout manque.
   Ne pas recalculer un KPI déjà fourni.
8. Si l'utilisateur veut sauter une étape, l'accepter, en notant en une ligne ce que l'étape aurait vérifié.
9. Garder en tête un récapitulatif des décisions validées (message clé, plan, style) et s'y tenir dans les étapes suivantes.

Si `$ARGUMENTS` contient un sujet, un brief ou un chemin de dossier, s'en servir dès l'étape 0.

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
- Veux-tu des notes orales sous chaque slide ?
- Sur la slide X, deux options sont possibles : laquelle choisis-tu ?

**Livrable** : la table de correspondance :

| # | Titre (affirmation) | Visuel | Données (fichier, colonne) | Notes orales |
|---|---|---|---|---|

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

Règles de construction (elles rendent l'étape 9 possible sans retouche) :
- **Un seul fichier HTML**, CSS et JavaScript intégrés ; couleurs et polices en **variables CSS sur `:root`**
  reprenant la planche de l'étape 4.
- **Un conteneur unique** (par exemple `<main id="deck">`) dont **chaque enfant direct est une
  `<section id="…">`** : une section = une slide.
- **Des `id` stables et lisibles** (`couverture`, `contexte`, `irritants`…), jamais générés aléatoirement :
  ce sont les adresses des modifications de l'éditeur Licter.
- Tailles fluides : police racine liée à la largeur de l'écran (par exemple `html { font-size: calc(100vw / 160); }`)
  et tailles en `rem`, ou scène fixe 1920 × 1080 mise à l'échelle.
- Graphiques avec une librairie à version fixe (par exemple Chart.js depuis cdnjs), alimentés uniquement par les
  données validées à l'étape 3. Source et période en bas de chaque slide de données.
- Notes orales dans un élément masqué de la section si elles ont été demandées.
- Ne pas ajouter l'éditeur Licter à cette étape (voir l'étape 9).

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

**Objectif** : zéro erreur avant diffusion.

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

## Étape 8 : Export

**Objectif** : les versions figées du deck.

Questions types :
- Quel format : fichier HTML, PDF, ou les deux ?
- Pour le PDF : une slide par page, avec ou sans les notes orales ?

Pour le PDF, ajouter un `@media print` (une section par page, fond conservé), puis exporter avec Chrome
(« Imprimer » → « Enregistrer en PDF ») ou un outil sans interface si l'environnement le permet.
Le lien partagé et modifiable vient de l'étape 9.

**Livrable** : les fichiers exportés.

**✅ Validation** : « Les exports s'ouvrent correctement. »

## Étape 9 : Éditeur Licter

**Objectif** : rendre le deck terminé modifiable par l'équipe ou le client.

Questions types :
- Le deck doit-il être modifiable par l'équipe ou le client, ou rester figé ?
- Qui pourra le modifier ? Faut-il un code admin propre au client ?
- Faut-il le publier comme artefact claude.ai partagé, pour enregistrer les modifications en ligne ?
- Quel fichier est la version finale ? (celui validé à l'étape 7)

Si l'utilisateur ne veut pas d'éditeur, conclure : le deck est terminé.

Sinon, demander explicitement :

> Le deck est validé. Pour ajouter l'éditeur Licter, tape la commande :
> `/licter-decks:editeur-deck <fichier_final.html>`

L'éditeur ne peut être lancé **que par cette commande tapée par l'utilisateur** : ne pas l'injecter soi-même, ne pas
appeler `inject.py` directement, ne pas lancer le skill `editeur-deck` à la place de l'utilisateur. Rappeler les
réponses déjà données (client, code admin, publication en artefact) pour qu'elles servent au skill `editeur-deck`.

**Livrable** : la commande à taper, avec le bon nom de fichier.

**✅ Validation** : une fois l'éditeur ajouté par `editeur-deck`, « J'ai testé l'accès avec le code, une modification
s'enregistre et le lien fonctionne chez un destinataire. »

---

## Fin du workflow

Terminer par un récapitulatif court : message clé, nombre de slides, fichiers produits, lien éventuel, et ce qui
reste à faire (relecture par un tiers, éditeur à ajouter…).

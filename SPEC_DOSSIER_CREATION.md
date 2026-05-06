# Spec — Création de dossier (drop-first par défaut + onboarding manuel)

**Statut** : v1
**Auteur** : Meg
**Périmètre** : Comportement à la création d'un dossier (manuelle ou via dépôt) + état d'onboarding du chat sur dossier vide

---

## 1. Contexte

Avant : créer un dossier manuellement passait par un wizard 2 étapes ("Infos" puis "Comment souhaitez-vous créer votre chiffrage ?"), puis ouvrait l'Info Dossier en layout legacy avec une baseline pré-seedée (DSA, DFT, PGPA, victimes indirectes…).

Deux problèmes :
- **Les baselines mentent** — l'écran donne l'impression d'un dossier déjà commencé, alors que rien n'a été extrait.
- **Le wizard 2 étapes ajoute un clic sans valeur** — la majorité des avocats veulent juste atterrir dans le dossier.

Plato est conçu **drop-first** : on dépose les pièces, l'agent extrait, le dossier se remplit. La création manuelle reste utile pour les cas où on n'a pas (encore) les pièces, mais elle doit converger vers le même comportement — un dossier vide qui invite au dépôt.

---

## 2. Comportement

### 2.1 Création manuelle d'un dossier

- **Wizard à une seule étape** — infos victime + fait générateur, c'est tout
- "Lancer le dossier" → ouvre l'Info Dossier en layout drop-first, **sans aucun seed** (pas de DSA, DFT, PGPA, FDA, DSF, ni victimes indirectes)
- Le dossier est marqué `dropFirstActive = true` (flag persisté), ce qui pilote :
  - le rendu de l'Info Dossier (drop-first plutôt que legacy)
  - le rendu de l'onglet Pièces (drop-first plutôt que legacy)
  - le rendu de l'empty state du chat (voir 2.2)

### 2.2 Onboarding sur le chat (`dropFirstActive` + chat vide)

Quand `chatMessages.length === 0` sur un dossier drop-first, le chat affiche :

- Icône Plato 48 px avec halo orange diffus (radial-gradient + blur)
- Titre serif "Bonjour Meghan"
- Phrase d'intro : « Bienvenue sur votre nouveau dossier. Je suis **Plato**, votre assistant dédié à l'évaluation du préjudice corporel. »
- CTA primaire **"Démarrer avec Plato"** — pill sombre (`#292524`) avec un anneau conique animé (orange → ambre → violet → rose → orange, `spin-slow` 4s linéaire) et `Sparkles` blanc

Au clic, déclenche le scénario `canvas-commencer-dossier` :
1. `USER_MESSAGE` : "Démarrer avec Plato"
2. `AGENT_PLAIN_MESSAGE` : Plato se présente (extraction auto, identification des postes, recherche JP) et invite à déposer les pièces

**Pas d'alternative "saisie manuelle"** dans l'onboarding chat — voir Décisions.

### 2.3 Empty state Info Dossier legacy

Sur l'ancienne layout (un dossier vidé via `/empty` par exemple), si **toutes** les infos sont vides — `victimeData`, `faitGenerateur`, et `victimesIndirectes` — un bandeau IA s'affiche en haut :

- Pictogramme `Sparkles`
- "Le dossier est vide."
- Bouton primaire **"Remplir les informations dossier"** → scénario `canvas-dossier-info` (l'agent prend la main et propose de compléter)

### 2.4 Onglet Pièces — click-to-pick

La drop zone legacy n'avait que drag/drop. Ajout d'un `<input type="file">` caché et d'un `onClick` qui le déclenche, en plus du drag/drop existant.

Le routing : un dossier `dropFirstActive` ouvre le drop-first pieces tab même avec `dropFirstPieces.length === 0` (avant on basculait uniquement quand il y avait au moins une pièce).

### 2.5 Commande `/empty`

Étendue pour vider aussi `victimeData` et `rapportBannerDismissed` → état totalement neutre, le bandeau "Le dossier est vide" devient atteignable.

### 2.6 Refresh de marque

- **Nouveau SVG Plato** — silhouette de tour d'échecs noire, scalable (16, 48 px). Remplace le carré orange avec la lettre "P". Le `PlatoIcon` accepte un prop `color` (défaut `#292524`).
- `favicon.png` orange (`#E8713A`)
- `<title>` "Plato - Proto"
- `theme-color` `#E8713A`
- Description méta, OG/Twitter (titre, description, image)
- Avatars sidebar + liste matters → `userAvatar` (chess-piece, style victimes indirectes) à la place des dégradés violet/indigo

---

## 3. Décisions clés

- **Pas de baselines à la création manuelle** — les lignes DSA/DFT/PGPA pré-remplies donnaient l'illusion d'un dossier déjà commencé. Mieux vaut un écran vide qui invite explicitement au dépôt.
- **Wizard 1 étape, pas 2** — l'étape "Comment souhaitez-vous chiffrer ?" perd son sens dès lors que tous les nouveaux dossiers sont drop-first.
- **Pas de bouton "saisie manuelle" dans l'onboarding chat** — on ne veut pas distraire de la voie principale (déposer les pièces). L'avocat peut toujours remplir les champs Info Dossier à la main, mais on ne le promeut pas.
- **Flag `dropFirstActive` plutôt que `dropFirstPieces.length > 0`** — il faut pouvoir rendre la nouvelle layout *avant* qu'aucune pièce ne soit déposée. Le flag persiste la décision de layout indépendamment du contenu.
- **Anneau conique animé sur le CTA "Démarrer avec Plato"** — signale visuellement que c'est l'action IA primaire, sans surcharger (pas d'icône scintillante, pas de chrome lourd). Une seule animation, 4 s, en boucle.
- **Suppression du bandeau "Ajouter un rapport plus tard"** sur la layout drop-first — l'invitation à déposer se fait maintenant côté chat. Garder les deux créait du bruit.

---

## 4. Hors-périmètre v1

- Variante "saisie manuelle assistée" — l'agent pose des questions structurées pour remplir le dossier. Possible plus tard via un flow type `UserAsk`.
- Seed de victimes indirectes — toujours désactivé sur création manuelle.
- Toggle pour revenir à la layout legacy — pas de bascule, drop-first est le défaut absolu pour les nouveaux dossiers.
- Animation d'apparition typewriter sur "Bonjour Meghan" — un simple `animate-fade-up` suffit.

---

## 5. Liens

- Scénarios : `src/data/demoScenarios.js` → `canvas-commencer-dossier`, `canvas-dossier-info`
- Composant onboarding : `src/App.js` (empty state du chat, ~ligne 4365)
- Wizard de création : `src/App.js` (`creationWizard`, étape `infos` uniquement)
- PR : [#24](https://github.com/eastermeggg/plato-proto-meg/pull/24)

# Spec — Actes (Rédaction d'actes)

**Statut** : v1 (chat-first)
**Auteur** : Meg
**Périmètre** : User jobs + comportement de l'agent + UI

---

## 1. Contexte

L'avocat dommage corporel rédige plusieurs types d'actes pendant un dossier — assignation, référé, conclusions, dire à expert, mise en demeure, protocole, note en délibéré.

Plato est **chat-first** : l'avocat ne remplit pas un acte à la main. Il décrit ce qu'il veut, l'agent infère le scénario, demande les manques, génère le document.

Le poste actes est un **livrable** du dossier (≠ poste de calcul). Il vit aux côtés des Pièces, du Chiffrage et des Référentiels.

---

## 2. User jobs

### 2.1 AAU je peux démarrer le flow d'onboarding pour un acte

- **Empty state** dans l'onglet Actes — icône, titre "Rédigez votre premier acte", description listant les types possibles, CTA "Rédiger un acte"
- Le CTA déclenche le flow `/redaction-onboarding` :
  - Message user "Écrire mon premier acte"
  - Agent : welcome + liste des types + question ouverte "Qu'est-ce qu'on rédige ensemble ?"
  - User répond → entre dans le flow standard

### 2.2 AAU je peux demander la rédaction d'un acte

#### Trough the chat

Trois entrées :
- **Slash command** (`/redaction-assignation`, `/redaction-modif`, `/redaction-user-ask`)
- **Langage naturel** ("rédige une assignation contre Mme Martin au TJ Paris")
- **Drag & drop d'un doc + instruction** ("redige moi une assignation" avec un fichier déposé) → utilise le doc déposé comme modèle, saute l'étape "modèle ?"

#### Manuellement (modale)

- Bouton **"Nouvel acte"** dans le sub-header de l'onglet Actes
- Modal :
  - **Sélecteur de modèle** (recherche, optionnel)
  - **Textarea instructions**
  - CTA **"Lancer la rédaction"**
- Submit → modale ferme, chat ouvre avec message user pré-rempli, le flow chat prend le relais

### 2.3 AAU je peux ajouter un modèle

#### In workspace (Listing + modale)
- Page **Modèles d'actes** dans la sidebar
- Tableau **Nom du modèle + Date** (filename d'origine, simple)
- Modal "Ajouter un modèle" : drag/drop ou file picker

#### In the chat
- **Dropdown select** via le paperclip → onglet "Modèles d'actes" (sub-menu avec recherche)
- **`@mention`** dans la barre de saisie → dropdown groupé (Bordereau / Hors bordereau / Modèles)
- **Drag & drop** d'un fichier dans la zone chat — auto-sauvegardé dans la bibliothèque modèles (sans duplicate)

### 2.4 AAU je peux voir mes actes

#### Listing
- Sub-header edge-to-edge avec bouton "Nouvel acte" à droite
- Tableau : icône fichier · **Titre** · **Modifié**
- Ligne cliquable → ouvre l'acte

#### Acte single view (canvas)
- Top bar : ← · nom · "Modèle utilisé" · "Modifié le …" · **Copier** · **Télécharger**
- Page mockup A4, markdown rendu style Notion
- *Badges pièces inline + bordereau appendix : voir US dédiée*

##### AAU je peux copier / télécharger l'acte
- **Copier** : markdown brut au presse-papier
- **Télécharger** : .docx ou .pdf (TBD)

### 2.5 AAU je peux modifier un acte (zone-edit)

**SelectSection Flow** — la modification ciblée est le mode primaire (rewrite full-doc reste possible mais hors scope ici).

- **Sélection texte** dans le canvas → highlight bleu persistant (overlay sur `Range.getClientRects()`, robuste aux re-renders)
- **Context chip** dans le chat : passe en bleu, affiche `ACTE · {extrait sélectionné}`, X pour clear
- **Placeholder** dynamique : *"Demandez une modification sur cette partie…"*
- **Envoi instruction** → reasoning bref → **restream uniquement la zone sélectionnée** en place (le reste du doc ne bouge pas)
- Moteur reconnaît : `supprime`, `remplace par X`, `ajoute`, `ajoute avant`, `reformule`, `raccourcis` ; fallback = expansion contextuelle

### 2.6 AAU je peux voir l'agent raisonner

Visibilité légère, sans surcharger :
- **ReasoningStepper collapsible** affiché aux deux étapes clés du flow (analyse contexte + plan)
- **Document quoting** : tout doc cité par l'agent rendu comme **pill cliquable** ouvrant le preview drawer

### 2.7 AAU l'agent me pose des questions ciblées

Deux modes selon le type de question :

| Mode | Quand | Format |
|------|-------|--------|
| **Texte libre dans le chat** | Questions ouvertes ("Décrivez le contexte…") | Message agent classique, user répond librement |
| **UserAsk structurée** | Questions fermées ("Tribunal ?", "Date du fait ?") | UI dédiée : 3 propositions cliquables + custom answer, pagination dots, "Passer", arrow-up |

Déclenchée automatiquement si Reasoning #1 surface des gaps, ou manuellement via `/redaction-user-ask`.

### 2.8 (P2) AAU l'agent me protège des rédactions risquées

Gating tier-based selon état du dossier :
- **Tier 1 — Direct** : pas de chiffrage requis (ex. référé-expertise) → génère sans alerte
- **Tier 2 — Warning** : SE manquant → propose deux options (chiffrer d'abord / rédiger avec mention "à parfaire")
- **Tier 3 — Blocked** : postes essentiels manquants → liste les manques, redirige vers chiffrage, ne génère pas

---

## 3. Le flow de rédaction (5 étapes)

```
User: "rédige une assignation pour Martin"
            ↓
Step 1 — Template check
  Agent cherche modèles workspace + projet :
  - trouvé(s) → suggère, demande confirm
  - rien → demande dépôt ou "non" pour skip
  - user dépose un doc → l'utilise
            ↓
Step 2 — Reasoning #1 (visible, collapsible)
  Lecture requête / contexte / manques
            ↓
        Gaps ?
       ↙       ↘
     OUI        NON
      ↓          ↓
Step 3 — Clarify    Skip à Step 4
(texte libre OU
UserAsk structurée
selon nature des
questions)
      ↓
      └────┬────┘
           ↓
Step 4 — Reasoning #2 + Plan (collapsible)
  Structure / décisions / sources
           ↓
Step 5 — Génération
  Doc apparaît sur canvas
```

---

## 4. Types d'actes pris en charge (v1)

Assignation · Conclusions · Requête · Dire à expert · Courrier / mise en demeure · Protocole · Note en délibéré

Chacun a sa structure, ses sections types, et son template par défaut si aucun modèle n'est fourni.

---

## 5. Hors-périmètre v1

- Versioning des actes (historique de révisions)
- Comparaison côté défense
- Multi-langue
- Templates tenant-level (au-delà du workspace)
- Tier gating (P2)

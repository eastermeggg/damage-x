# Plato — Rédaction d'actes : script de présentation

> Voiceover / talking points pour la démo équipe.
> Durée estimée : 5–7 min.

---

## 1. Intro — Le problème

Aujourd'hui un avocat en dommage corporel passe des heures à rédiger des actes : assignations, conclusions, dires à expert, courriers de relance... À chaque fois il repart d'un modèle Word, copie-colle des éléments du dossier, reformate, vérifie les pièces citées.

**Plato change ça.** On a construit un agent de rédaction qui connaît le dossier, les pièces, le chiffrage — et qui rédige un acte complet en quelques secondes.

---

## 2. Le flow en 5 étapes

On a designé un pipeline en 5 étapes, entièrement piloté par la donnée :

| Étape | Ce qui se passe | UX |
|---|---|---|
| **1. Template** | L'agent cherche un modèle dans la bibliothèque du cabinet | Message chat + suggestion cliquable (pill) |
| **2. Reasoning #1** | Analyse du contexte : pièces du dossier, parties, faits | Stepper animé avec étapes cochées |
| **3. Clarification** | L'agent identifie les manques et pose des questions | Message chat ou UserAsk (propositions numérotées) |
| **4. Reasoning #2** | Plan de rédaction : structure, sources, choix juridiques | Stepper animé |
| **5. Génération** | Le document stream en temps réel dans le canvas | Canvas pleine page, streaming caractère par caractère |

Chaque type d'acte a sa propre config : les étapes de reasoning, le message de clarification, le contenu généré. Tout est déclaratif dans `ACT_TYPE_FLOW_CONFIG`.

---

## 3. Onboarding — Premier acte

Quand l'onglet Actes est vide, l'utilisateur voit un empty state avec un CTA "Rédiger un acte".

Un clic déclenche le flow d'onboarding :
- Message utilisateur "Écrire mon premier acte" envoyé dans le chat
- L'agent répond avec la liste des types d'actes disponibles
- L'utilisateur répond librement ("je veux une assignation en référé")
- Plato détecte le type, cherche un template, et lance le pipeline

**Zéro friction.** Pas de formulaire, pas de wizard. Une conversation.

---

## 4. 7 types d'actes

Chaque type génère un document distinct, adapté :

| Type | Contenu généré |
|---|---|
| **Assignation** | Acte introductif avec faits, préjudice, nécessité d'expertise, demandes |
| **Conclusions** | Récapitulatives avec liquidation poste par poste (DSA, PGPA, DFT, SE) |
| **Requête en référé** | Requête courte : objet, faits, urgence, demandes |
| **Dire à expert** | Lettre contestant le rapport préliminaire, demandant des investigations |
| **Courrier** | Mise en demeure à l'assureur avec historique et délai |
| **Protocole transactionnel** | Accord complet avec ventilation 185k€, articles, renonciation |
| **Note en délibéré** | Note post-audience répondant à un moyen soulevé d'office |

---

## 5. Le canvas — Écriture augmentée

Le document s'affiche dans un canvas pleine page avec :

- **Pièces inline** — Chaque référence à une pièce du dossier apparaît comme un badge bleu cliquable (`Pièce 1 - Facture CHU Bordeaux`). L'avocat voit immédiatement quelles pièces sont citées.

- **Bordereau automatique** — En fin de document, un bordereau de pièces communiquées est généré automatiquement sous forme de table numérotée, cohérent avec le reste du design system.

- **Sélection de zone** — L'utilisateur sélectionne un passage du texte, et la barre de contexte s'active. Il peut demander : "reformule ce paragraphe", "ajoute la jurisprudence", "supprime cette partie". L'agent modifie la zone en conservant le reste.

---

## 6. Templates & pièces — Intelligence contextuelle

- **Recherche de template** : Quand l'utilisateur lance une rédaction, l'agent cherche dans la bibliothèque de modèles du cabinet. S'il en trouve un, il le propose via une pill cliquable dans le chat. L'utilisateur peut l'accepter, en déposer un autre via le trombone, ou partir de zéro.

- **Preview document** : Cliquer sur une pill document dans le chat ouvre un side drawer avec l'aperçu du document (thumbnail + métadonnées : nom, type, date, postes liés). Le chat reste visible derrière.

- **Pièces du dossier** : L'agent cite les pièces pertinentes directement dans l'acte. Le bordereau en fin de document liste toutes les pièces référencées.

---

## 7. UserAsk — Questions intelligentes

Quand l'agent a besoin de précisions, il peut transformer la zone de saisie en un panneau de questions structurées :

- Questions numérotées avec 3 propositions par question
- L'utilisateur peut choisir une proposition ou taper sa propre réponse
- Navigation entre les questions avec pagination
- Possibilité de passer une question
- Les réponses sont collectées et envoyées en une seule fois

C'est plus efficace qu'un aller-retour conversationnel pour des questions fermées.

---

## 8. Architecture technique

**3 couches :**

1. **Data** (`redactionScenarios.js`) — Config déclarative par type d'acte : reasoning steps, gap messages, contenu généré, commandes slash
2. **State & Flow** (`useRedactionCommands.js`) — Reducer + action player générique. Chaque action (message, delay, reasoning, canvas, stream) est un objet dans un tableau. `playActions()` les exécute séquentiellement.
3. **UI** — `ActCanvas` (document + badges + bordereau + sélection), `ActesList` (table de documents), chat sidebar (pills, steppers, UserAsk)

**Pattern clé** : tout est data-driven. Ajouter un nouveau type d'acte = ajouter une entrée dans `ACT_TYPE_FLOW_CONFIG` + un mock texte. Zéro changement dans le hook ou le canvas.

---

## 9. Ce qu'on montre dans la démo

1. **Onboarding** — Empty state → "Rédiger un acte" → conversation → assignation générée
2. **Template match** — L'agent trouve un modèle, le propose en pill cliquable
3. **Clarification** — L'agent pose des questions avant de rédiger
4. **Streaming** — Le document apparaît en temps réel dans le canvas
5. **Pièces inline** — Badges bleus dans le texte + bordereau en fin de doc
6. **Modification** — Sélection d'une zone → instruction → modification appliquée
7. **Multi-types** — Montrer conclusions ou courrier pour contraster avec l'assignation

---

## 10. Prochaines étapes

- Connecter à un vrai LLM pour la génération (remplacer les mocks)
- Historique des versions (v1, v2, v3 d'un même acte)
- Export Word / PDF avec mise en page juridique
- Collaboration : commentaires, suggestions, validation par un associé
- Templates : upload et gestion de la bibliothèque de modèles du cabinet

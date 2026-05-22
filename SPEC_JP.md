# Spec — Jurisprudences (JP)

**Statut** : v1
**Auteur** : Meg
**Périmètre** : Comment les JP s'organisent entre le **cabinet**, le **dossier** et la **recherche** (agent + base Plato JP). User jobs, comportement de l'agent, scénarios et règles de scope.

---

## 1. Contexte

L'avocat en dommage corporel travaille avec deux types de JP :

- **Les JP qu'il connaît et qu'il réutilise** — son barème personnel, les décisions de référence de son cabinet. Ex : *Cass. 2e civ., 6 juillet 2023, n° 21-24.567* sur la valeur du point de DFP. C'est sa boussole.
- **Les JP qu'il trouve pour un dossier précis** — décisions ad hoc, alignées au profil de sa victime. Ex : *CA Rennes, 10 janvier 2024* pour une étudiante de 22 ans → utile pour le taux d'ATPT sur ce dossier-là, pas forcément ailleurs.

Plato traite ces deux types comme deux univers distincts : **cabinet** (playbook) et **dossier** (case-file). L'agent fait le pont.

Trois surfaces UI :

| Surface | Réponse à la question |
|---------|----------------------|
| **Mémoire & préférences** | Quelles JP mon cabinet a-t-il consacrées comme références ? |
| **Onglet JP du dossier** | Quelles JP j'ai retenues pour ce dossier ? |
| **Recherche** | Quelles JP existent sur ce sujet — d'abord dans mon cabinet, puis dans Plato JP ? |

---

## 2. Comment Plato organise les JP

Plato range chaque JP selon **où elle s'applique**, pas selon ce qu'elle dit. Une même décision peut vivre dans plusieurs contextes en même temps — sans être dupliquée.

### 2.1 Trois portées possibles

- **Cabinet** — la JP fait partie de la bibliothèque de référence du cabinet. Elle vaut pour tous les dossiers à venir. Marquée d'un ⭐ partout où elle apparaît.
- **Dossier transverse** — la JP s'applique au dossier en cours, mais sans être liée à un poste précis (ex : décision de principe sur la consolidation).
- **Poste** — la JP justifie un montant sur un poste donné du dossier (ex : ATPT à 28 €/h). Une même décision peut être attachée à plusieurs postes du même dossier.

**Exemple** : *Cass. 2e civ. 06/07/2023* (point DFP à 2 350 €/pt) peut être à la fois dans le cabinet de Me Durand, sur le dossier Lefèvre en transverse, et spécifiquement attachée au poste DFP. Plato sait que c'est la même décision — pas trois copies — et garde leurs raisons d'usage indépendamment.

### 2.2 La note de pertinence vit par rattachement

Quand l'avocat sauvegarde une JP sur un poste, l'agent lui demande dans le chat « pourquoi pour ce poste ? ». La réponse devient la note de pertinence **de ce rattachement-là**. Si la même JP est aussi sauvée sur un autre poste ou en transverse, la note peut être différente. Une décision sert rarement à la même chose dans deux contextes.

### 2.3 Trois types de décisions

| Type | Origine | Marquage |
|------|---------|----------|
| **Plato JP** | Décision présente dans la base nationale | Aucun |
| **Fiche cabinet** | Décision uploadée manuellement par le cabinet (PDF + métadonnées + apport) | Pill « Fiche cabinet » |
| **Non référencée** | Décision citée par l'avocat dans ses préférences, mais introuvable | Pill « Non référencée » — invitation à uploader le PDF |

---

## 3. User jobs — Cabinet

### 3.1 Ajouter une JP à la JP de référence du cabinet

Trois entrées :

- **Depuis le détail d'une décision** — bouton « Sauver » → popover avec une case « Cabinet »
- **Depuis Mémoire et préférences** — recherche par numéro de pourvoi + bouton « + Ajouter » sur la ligne
- **Manuellement (fiche cabinet)** — bouton « Ajouter une fiche » dans Mémoire, ou via le chat (« J'ai trouvé une décision sur Légifrance… ») → modale demandant PDF/lien · juridiction · date · numéro · postes concernés · un champ **Impact** (« ce que la décision apporte »)

**Exemple** : Me Durand ouvre *Cass. 2e civ. 22-15.432* depuis une recherche, clique « Sauver » → coche « Cabinet ». L'arrêt rejoint la JP de référence du cabinet ; à partir de là, l'agent le citera en première position chaque fois qu'un dossier touche au point de DFP. L'agent lui demande dans le chat : « Pourquoi avoir sauvegardé cette décision pour le cabinet ? » (voir §4.4).

### 3.2 Voir mes JP de référence

Une seule surface : **Mémoire et préférences** → section « JP de référence ». Pas d'onglet cabinet dans le panneau de recherche du dossier — le cabinet est un pool pour l'agent, pas une liste à exposer dans chaque dossier (voir §7).

La section permet de :
- Rechercher une décision par numéro de pourvoi — résultats en direct sur Plato JP et sur les JP saisies dans le texte de préférences
- L'ajouter d'un clic (« + Ajouter ») ou voir qu'elle est déjà en référence
- Parcourir les JP déjà sauvegardées, et en retirer une au survol

**Empty state** : « Aucune jurisprudence de référence — Recherchez une décision par numéro ci-dessus, ou ajoutez-en une manuellement. »

### 3.3 Retirer une JP du cabinet

- Action × sur la ligne dans Mémoire
- Retire la JP **uniquement du cabinet** — les dossiers qui la citent la gardent
- Si c'était une fiche cabinet, la fiche est aussi supprimée

**Exemple** : Me Durand avait référencé *CA Lyon 14/11/2023* (ATPT 24 €/h province) comme JP cabinet. Depuis un nouveau barème, il préfère *CA Paris 22/03/2024* (27 €/h). Il retire la ligne CA Lyon de Mémoire → la JP disparaît du cabinet, mais reste sur le dossier *Dupont* qui la citait au poste ATPT.

### 3.4 Reconnaître les JP qui viennent du cabinet

Sur n'importe quelle ligne JP (détail, listing dossier, résultat de recherche), un **⭐** signale « JP de référence du cabinet ». L'indicateur apparaît automatiquement, peu importe la surface.

### 3.5 Uploader le PDF d'une fiche cabinet

La modale d'ajout manuel demande :
- Le PDF (drag & drop ou file picker)
- Un champ **Impact** = ce que la décision apporte (2-3 lignes)
- Les postes concernés

Une fois ouverte, une fiche cabinet montre l'aperçu PDF (ou un lien externe) et, à côté, les champs Référence · Apport · Source.

**Exemple** : Me Durand récupère sur Légifrance un *CA Aix 12/10/2023* qui retient un taux ATPT de 30 €/h en région PACA. Plato JP ne l'a pas. Il clique « Ajouter une fiche », drag/drop le PDF, remplit la juridiction, la date, le n°, coche ATPT et écrit dans Impact : « Taux 30 €/h pour aide spécialisée — référence haute pour la région PACA ». L'agent l'inclura désormais dans ses recherches ATPT en région sud.

---

## 4. User jobs — Dossier

### 4.1 Retenir une JP pour ce dossier

Trois entrées :
- **Depuis le détail d'une décision** — bouton « Sauver » → popover à 3 sections : Cabinet · Dossier transverse · Postes du dossier (multi-sélection)
- **Depuis une JP dans le chat** — icône bookmark sur la card
- **Auto-rattachement à un poste** — quand l'agent surface une JP en contexte d'un poste, l'avocat peut juste cocher le poste

Deux variantes :
- **Transverse au dossier** : la JP vaut pour le dossier en général
- **Spécifique à un poste** : la JP justifie un montant sur un poste. Une même décision peut être attachée à plusieurs postes du même dossier — pas de copies.

**Exemple** : sur un dossier piéton/voiture, je retiens *CA Rennes 10/01/2024* uniquement sur le poste ATPT (étudiante 22 ans, taux 28 €/h), et *Cass. 2e civ. 06/07/2023* en transverse parce qu'elle pose la méthode de valorisation du point de DFP utile partout dans le dossier.

### 4.2 Voir les JP retenues pour un poste

Dans le détail d'un poste, section **« Jurisprudences retenues »** : une card par décision.

- **Contenu** : juridiction · date · n° · profil · montant retenu **sur ce poste précis** (filtré, pas la liste totale)
- **Actions** : ouvrir le détail, retirer du poste, lancer une recherche pour en ajouter

**Empty state** : « Aucune jurisprudence retenue — L'agent privilégie vos JP de référence du cabinet, puis cherche dans Plato JP en fonction du contexte du dossier. » CTA **Rechercher une JP**.

### 4.2 bis Voir les JP retenues sur le dossier (onglet JP)

Cards plus riches que sur un poste, car vue d'ensemble du dossier.

- **Contenu** : juridiction · date · n° · profil · ⭐ si la JP est aussi au cabinet · badge survivante/décédée · postes concernés (chips DSA, DFT, ATPT…) avec le montant retenu sur chacun · la **note de pertinence** rédigée par l'avocat
- **Actions** :
  - Ouvrir le détail
  - Retirer la JP de tout le dossier (le rattachement cabinet reste)
  - Cliquer la card → ouvre le détail **avec le popover de sauvegarde déjà déployé** : c'est le chemin pour décocher un poste précis sans tout perdre

### 4.3 Choisir précisément où sauvegarder

Le popover « Sauver » regroupe trois sections **indépendantes** :
- Cabinet
- Ce dossier (transverse)
- Postes du dossier (multi-sélection, avec le quantum courant en regard de chaque poste)

On peut cocher Cabinet + 2 postes sans cocher Dossier transverse. Chaque coche / décoche est immédiate, pas de bouton « Enregistrer » final.

**Exemple** : Me Durand consulte *CA Rennes 10/01/2024*. Sa cliente Mme Lefèvre est étudiante 22 ans à Paris — profil quasi-identique. Il coche **ATPT** (le poste où s'applique le taux 28 €/h), coche aussi **Dossier (transverse)** pour pouvoir la citer dans son assignation, mais ne coche **pas Cabinet** car l'arrêt est trop profil-spécifique pour devenir une référence du cabinet.

### 4.4 Ajouter une note de pertinence après chaque sauvegarde

À chaque rattachement dossier (transverse ou poste), on peut adosser une **note de pertinence** — courte phrase qui dit pourquoi cette décision compte ici.

**Flow dans le chat** :
1. L'avocat sauve une JP via le popover.
2. Deux messages apparaissent dans le chat :
   - Bulle utilisateur : « Sauvegarde ce dossier (transverse). »
   - Bulle agent : « J'ai bien pris en compte ta sauvegarde. Pourquoi avoir sauvegardé *CA Rennes 10/01/2024* pour **ce dossier (transverse)** ? Cette note t'aidera lors de la rédaction. »
3. La prochaine réponse de l'avocat devient la note ; elle s'applique à tous les rattachements concernés par cette sauvegarde.
4. La bulle agent passe en état « répondue » avec la note citée.
5. L'avocat peut aussi répondre « Pas maintenant » — l'agent l'invite à compléter plus tard depuis la fiche.

**Exemple** :
- Me Durand sauve *CA Rennes 10/01/2024* sur le poste ATPT
- Agent : « Pourquoi avoir sauvegardé *CA Rennes 10/01/2024* pour le poste **ATPT** ? »
- Me Durand : « Profil quasi-identique : étudiante 22 ans, accident de la route, aide non-spécialisée. Taux 28 €/h reproductible directement. »
- La note s'attache au rattachement ATPT et apparaît dans la card du poste, dans le détail, et dans la motivation que l'agent rédigera pour le chiffrage.

L'avocat peut aussi éditer la note plus tard depuis le détail de la décision.

### 4.5 Retirer une JP d'un poste sans la perdre du dossier

- × sur une card JP dans un poste → retire **seulement** le rattachement poste
- × sur une card JP dans l'onglet JP → retire **tous** les rattachements dossier (mais conserve le rattachement cabinet)
- Clic sur la card de l'onglet JP → ouvre le détail avec le popover Sauver déjà déployé → l'avocat décoche les scopes qu'il veut

**Exemple** : Me Durand avait rattaché *CA Versailles 05/09/2023* (ATPT 26 €/h) à l'ATPT et au DFT du dossier Lefèvre. En relisant, l'arrêt ne dit rien d'utile sur le DFT. Il clique la card → popover déployé, décoche **DFT** seulement → le rattachement DFT disparaît, l'ATPT reste.

### 4.6 Savoir d'où vient une JP rattachée

Sur chaque card du dossier :
- **⭐** = la JP est aussi au cabinet
- **Chips de postes** (ex : `ATPT · DFP`) = la JP est attachée à ces postes
- Absence de ⭐ = JP rattachée uniquement à ce dossier

---

## 5. User jobs — Recherche & assistance

La recherche de JP est l'usage central de l'agent. Elle se fait **dans le chat** par défaut — la barre de recherche manuelle est une porte de secours. Le point commun : **l'agent infère le contexte** (poste courant, profil victime, juridiction, autres postes du dossier) plutôt que de demander à l'avocat de tout retaper.

### 5.1 Demander une JP en chat libre

L'avocat tape ce qu'il veut. L'agent identifie l'intention « recherche JP » et renvoie 3-5 décisions en cards, prêtes à être ouvertes, sauvegardées ou citées.

**Exemple** : sur un dossier ATPT, « Liste-moi les jurisprudences récentes sur le taux horaire d'ATPT, je veux comparer ». L'agent revient avec 5 décisions de cours d'appel, et conclut par une synthèse de fourchette (« entre 25 et 28 €/h »).

### 5.2 La recherche peut être imbriquée dans une autre demande

- *« Rédige une assignation pour Mme Dupont et cite-moi 3 décisions récentes sur le DFP »* → l'agent rédige ET surface les JP citées en pills inline dans l'acte
- *« Chiffre le poste ATPT et propose-moi les JP pertinentes »* → l'agent calcule le quantum et joint les décisions justifiant le taux retenu
- *« Compare ce dossier à des cas similaires »* → l'agent extrait le profil et rapproche des décisions au même profil

### 5.3 Les boutons « Rechercher » et les empty states lancent un message dans le chat

Les CTAs ne lancent **pas** une recherche silencieuse — ils **déclenchent un message utilisateur visible** qui ouvre le flow. L'avocat voit ce que l'agent va chercher, peut corriger en cours de route, et la recherche reste traçable dans l'historique.

C'est vrai depuis :
- L'onglet JP du dossier (vide ou rempli)
- La section JP d'un poste (vide ou rempli)

La requête est volontairement non-qualifiée — c'est un point de départ que l'avocat affine via ses réponses.

### 5.4 La recherche s'adapte à la position dans l'app

**Dans un poste** — contexte injecté : poste courant + profil victime + faits. L'agent ne pose pas de question préliminaire.
*Exemple* : sur le dossier Lefèvre (étudiante 22 ans, Paris), depuis la section JP de l'ATPT, « Rechercher » → l'agent renvoie directement 3 décisions ATPT alignées profil — il ne demande pas « pour quel poste ? ».

**Au niveau du dossier** — contexte injecté : profil + faits, sans poste précis. L'agent peut demander une précision si plusieurs angles sont possibles.
*Exemple* : « Tu as plusieurs postes à chiffrer (ATPT, DFP, DFT). Tu veux une recherche sur un poste précis, ou des décisions de principe transverses ? »

**Hors dossier** — aucun contexte injecté. Recherche brute par mots-clés, filtres ou numéro de pourvoi. Réservé à l'avocat qui sait précisément ce qu'il cherche.

### 5.5 L'agent privilégie systématiquement les JP de référence du cabinet

Quel que soit le point d'entrée, l'agent suit cet ordre :
1. **Pool prioritaire** : JP de référence du cabinet, filtrées par pertinence au contexte
2. **Fallback** : base Plato JP nationale

Cet ordre est systématique, pas un opt-in. Voir aussi §7.

### 5.6 Recherche manuelle (mode expert)

Quand l'avocat sait exactement ce qu'il cherche, le panneau Recherche reste disponible :
- Barre de recherche libre (juridiction, n° décision, résumé, catégorie, chambre, montant)
- Filtres latéraux : juridictions, postes, plage de dates
- Résultats triés par date décroissante, chaque card permet d'ouvrir le détail ou de sauvegarder directement (popover 3 scopes)

C'est un mode expert — la majorité des avocats restera dans le chat.

### 5.7 Voir le détail d'une décision

Le détail s'ouvre soit en inline (occupe le canvas du dossier) soit en overlay (depuis le chat).

**Contenu** :
- Identité : titre, date, numéro
- Résumé · Thèmes · Texte intégral à onglets, avec recherche interne et highlight des occurrences
- Note de pertinence (éditable inline)
- Montants retenus — filtrés sur le poste courant si on vient d'un poste, sinon tous
- Profil victime, données médicales, lien Légifrance

**Actions** :
- Télécharger le PDF
- Sauver (popover 3 scopes — voir §4.3)
- Naviguer prev/next dans le result set de la recherche en cours (touches ← →)
- Fermer

**Mode fiche cabinet** : on voit l'aperçu PDF (ou un lien externe) à la place du texte intégral, et les champs Référence · Apport · Source à droite.

### 5.8 Ajouter une décision que Plato n'a pas (fiche cabinet)

Deux entrées :
- En chat : « J'ai trouvé une décision intéressante sur Légifrance… »
- Depuis Mémoire : bouton « Ajouter une fiche »

Le flow demande la source (recherche dans Plato JP, lien externe ou upload PDF), puis la portée (transverse au dossier et/ou postes concernés). À l'enregistrement, la décision devient citable par l'agent dans la rédaction.

### 5.9 Survoler une JP pour un aperçu

Au survol d'une JP citée inline dans le chat, une petite carte d'aperçu apparaît :
- Identité (juridiction · chambre · date · numéro)
- Catégorie · poste · montant
- Résumé court avec fade-out
- Action « Ouvrir la décision »

---

## 6. Scénarios démo

Les scénarios pilotent la démo via la palette `/jp-…` (slash commands dans le chat). Principaux :

| Slash | Effet |
|-------|-------|
| `/jp-cards` | Recherche ATPT → 5 décisions en cards + synthèse de fourchette |
| `/search-atpt-paris` | Recherche contextuelle « étudiante à Paris » → 4 décisions ATPT alignées profil |
| `/search-dfp` | 2 décisions sur la valeur du point DFP |
| `/open-rennes` | Ouvre le détail de *CA Rennes 10/01/2024* |
| `/open-nav` | Même décision, avec un result set de 4 → teste prev/next |
| `/add-manual` | Lance le flow d'ajout d'une fiche cabinet |
| `/demo` | Parcours complet : recherche → cards → drawer ouvert avec navigation |

---

## 7. Décisions clés

- **La recherche se fait dans le chat — pas en silence**. Les boutons « Rechercher » lancent toujours un message utilisateur visible et un scénario chat. L'avocat voit ce que l'agent va chercher, peut corriger, et la recherche reste traçable. La barre de recherche manuelle est un mode expert.
- **L'agent infère le contexte depuis la position de l'avocat**. Dans un poste → poste + profil. Au dossier → profil + faits (l'agent peut demander une précision). Hors dossier → recherche brute. L'avocat ne retape pas ce qu'il a sous les yeux.
- **Deux univers, pas une liste unifiée**. Cabinet = playbook ; dossier = case-file. Mélanger les deux crée de l'ambiguïté (« si je supprime ici, ça désauvegarde du cabinet ? ») et noie l'avocat sous des JP qu'il n'a pas choisies pour ce dossier-là.
- **Le cabinet est un pool prioritaire pour l'agent, pas une liste à afficher**. L'avocat ne voit pas ses 50 JP de référence sur chaque dossier ; il les voit appliquées via les réponses de l'agent quand elles sont pertinentes.
- **Note de pertinence par rattachement, pas par décision**. Une JP utilisée sur deux dossiers peut avoir deux raisons d'être différentes. Capture dans le chat après chaque sauvegarde, jamais en modale bloquante.
- **Le clic sur une card de l'onglet JP est un chemin de suppression granulaire**. Il ouvre le détail avec le popover Sauver déjà déployé — l'avocat décoche les scopes au lieu de chercher un menu « retirer de … ».
- **L'empty state d'un poste lance une vraie liste comparative**. Quand l'avocat n'a aucune JP retenue, ce qu'il veut c'est 5 décisions à comparer, pas une réponse contextuelle courte.
- **Pas de tri / pin custom dans la JP de référence**. Ordre = date d'ajout décroissante. Le cabinet n'est pas un Notion qu'on bricole — c'est un pool de référence.
- **Indicateurs minimalistes** (⭐ cabinet). Pas de couleurs distinctives ni de borders pour différencier les scopes — ça surchargerait.
- **Le détail d'une JP masque le sous-header parent**. L'identité de la JP suffit ; le contexte poste/cascade/acte est redondant à ce moment-là.

---

## 8. Hors-périmètre v1

- **Édition / versioning des fiches cabinet** — read-mostly après création.
- **Réordonnancement custom du cabinet** — ordre = date d'ajout.
- **Recherche cross-dossier** (« toutes les JP que j'ai citées dans mes 10 derniers dossiers »).
- **Annotation collaborative** (notes partagées entre avocats du cabinet sur une JP).
- **Export / citation formatée** (Word, papier en-tête) — sortie via copier-coller.
- **Suggestions proactives de l'agent** (« Cette JP s'applique à ton dossier en cours, veux-tu la rattacher ? ») — toujours déclenché par l'avocat.
- **JP pour victimes indirectes** — postes IV déclarés mais pas de section JP dédiée.
- **Réconciliation automatique des JP non référencées** vers Plato JP — manuel pour l'instant.

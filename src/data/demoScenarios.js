// ─── Demo Scenarios — JP Integration ──────────────────────────────────
// Each scenario is an ordered array of DemoAction payloads.
// The reducer in useDemoCommands dispatches them sequentially with delays.

export const DEMO_SCENARIOS = {
  'search-atpt-paris': {
    label: 'Recherche ATPT Paris',
    description: 'Agent recherche des JP sur le taux horaire ATPT en région parisienne',
    actions: [
      { type: 'USER_MESSAGE', text: 'Recherche des jurisprudences sur le taux horaire ATPT pour une étudiante à Paris' },
      { type: 'DELAY', ms: 400 },
      { type: 'AGENT_REASONING', headline: 'Recherche JP', detail: 'Interrogation de la base Plato JP pour les décisions relatives au taux horaire d\'ATPT en Île-de-France…' },
      { type: 'DELAY', ms: 1200 },
      { type: 'AGENT_MESSAGE', text: "J'ai trouvé 4 décisions pertinentes sur le taux horaire d'ATPT en région parisienne. Les taux retenus varient de 25 à 28 €/h :\n\n{pill:jp-atpt-01} confirme un taux de 28 €/h pour une étudiante à Paris. {pill:jp-atpt-02} retient 26 €/h en banlieue de Versailles, tandis que {pill:jp-atpt-03} fixe 27 €/h pour un retraité parisien. {pill:jp-atpt-06} applique 25 €/h à Lille pour comparaison.", pills: ['jp-atpt-01', 'jp-atpt-02', 'jp-atpt-03', 'jp-atpt-06'] },
    ],
  },

  'search-dfp': {
    label: 'Recherche DFP',
    description: 'Agent recherche des JP sur la valeur du point de DFP',
    actions: [
      { type: 'USER_MESSAGE', text: 'Quelles sont les jurisprudences récentes sur la valeur du point de DFP ?' },
      { type: 'DELAY', ms: 400 },
      { type: 'AGENT_REASONING', headline: 'Recherche JP', detail: 'Recherche de décisions relatives à la valorisation du point de déficit fonctionnel permanent…' },
      { type: 'DELAY', ms: 1000 },
      { type: 'AGENT_MESSAGE', text: "Voici 2 décisions récentes sur la valeur du point de DFP :\n\n{pill:jp-dfp-01} — la Cour de cassation confirme 2 350 €/pt pour une victime de 32 ans (DFP 15%). {pill:jp-dfp-02} retient 1 850 €/pt pour une victime de 58 ans (DFP 25%), reflétant l'ajustement par l'âge.", pills: ['jp-dfp-01', 'jp-dfp-02'] },
    ],
  },

  'open-rennes': {
    label: 'Ouvrir CA Rennes',
    description: 'Ouvre le drawer sur la décision CA Rennes 10/01/2024',
    actions: [
      { type: 'OPEN_DRAWER', decisionId: 'jp-atpt-01' },
    ],
  },

  'open-nav': {
    label: 'Drawer avec navigation',
    description: 'Ouvre le drawer avec un result set de 4 décisions pour tester prev/next',
    actions: [
      { type: 'OPEN_DRAWER', decisionId: 'jp-atpt-01', resultSet: ['jp-atpt-01', 'jp-atpt-02', 'jp-atpt-03', 'jp-atpt-06'] },
    ],
  },

  'add-manual': {
    label: 'Ajout manuel',
    description: "Déclenche le stepper d'ajout manuel de JP",
    actions: [
      { type: 'USER_MESSAGE', text: "J'ai trouvé une décision intéressante sur Légifrance, je voudrais l'ajouter au dossier" },
      { type: 'DELAY', ms: 400 },
      { type: 'TRIGGER_STEPPER', stepperType: 'jp-add' },
    ],
  },

  'save': {
    label: 'Sauvegarder JP',
    description: "Déclenche le stepper de sauvegarde depuis le drawer",
    actions: [
      { type: 'TRIGGER_STEPPER', stepperType: 'jp-save' },
    ],
  },

  'view-jp': {
    label: 'Onglet JP',
    description: "Bascule le canvas vers l'onglet Jurisprudence du dossier",
    actions: [
      { type: 'SWITCH_CANVAS_VIEW', view: 'jp-list' },
    ],
  },

  'view-poste-atpt': {
    label: 'Poste ATPT',
    description: 'Ouvre le PosteDetailView pour ATPT',
    actions: [
      { type: 'SWITCH_CANVAS_VIEW', view: 'poste-detail', posteId: 'atpt' },
    ],
  },

  'demo': {
    label: 'Parcours complet',
    description: 'Recherche ATPT → ouverture drawer avec navigation',
    actions: [
      { type: 'USER_MESSAGE', text: 'Recherche des jurisprudences sur le taux horaire ATPT pour une étudiante à Paris' },
      { type: 'DELAY', ms: 400 },
      { type: 'AGENT_REASONING', headline: 'Recherche JP', detail: 'Interrogation de la base Plato JP pour les décisions relatives au taux horaire d\'ATPT en Île-de-France…' },
      { type: 'DELAY', ms: 1200 },
      { type: 'AGENT_MESSAGE', text: "J'ai trouvé 4 décisions pertinentes sur le taux horaire d'ATPT en région parisienne. Les taux retenus varient de 25 à 28 €/h :\n\n{pill:jp-atpt-01} confirme un taux de 28 €/h pour une étudiante à Paris. {pill:jp-atpt-02} retient 26 €/h en banlieue de Versailles, tandis que {pill:jp-atpt-03} fixe 27 €/h pour un retraité parisien. {pill:jp-atpt-06} applique 25 €/h à Lille pour comparaison.", pills: ['jp-atpt-01', 'jp-atpt-02', 'jp-atpt-03', 'jp-atpt-06'] },
      { type: 'DELAY', ms: 800 },
      { type: 'OPEN_DRAWER', decisionId: 'jp-atpt-01', resultSet: ['jp-atpt-01', 'jp-atpt-02', 'jp-atpt-03', 'jp-atpt-06'] },
    ],
  },
};

export const SCENARIO_LIST = Object.entries(DEMO_SCENARIOS).map(([key, s]) => ({
  command: key,
  label: s.label,
  description: s.description,
}));

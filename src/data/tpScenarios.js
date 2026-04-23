// ============================================================
// Tiers Payeurs — hardcoded demo scenarios (spec v2)
// ============================================================
// Baseline + TP overlay architecture:
//   - Baseline provides expense lines, forms, structure (in baselineData.js)
//   - TP scenarios carry: tiersPayeurs, lignesTP, imputations,
//     damageOverrides, droitDePreference, cascade, extractionMode,
//     ligneExtractions, pgpaRevenusPercusBadges
//   - Amounts calibrated to match real baseline totals:
//       DSA: 6 242,50 €   DFT: 5 385 €     PGPA: 31 700 €
//       PGPF échu: 4 600 €  PGPF à échoir: 229 750 €
//       SE: 15 000 €   DFP: 27 000 €   PEP: 4 500 €
// ============================================================

// ── Shared TP entities ─────────────────────────────────────
const CPAM = { id: 'cpam-idf', nom: 'CPAM Île-de-France', type: 'cpam', sigle: 'CPAM' };
const HARMONIE = { id: 'harmonie', nom: 'Harmonie Mutuelle', type: 'mutuelle', sigle: 'Harmonie' };
const SNCF = { id: 'sncf', nom: 'Employeur SNCF', type: 'employeur', sigle: 'SNCF' };
const CPAM_ATMP = { id: 'cpam-atmp', nom: 'CPAM (AT/MP)', type: 'cpam', sigle: 'CPAM' };

const TP_SCENARIOS = {

  // ── Baseline: no TP, rate 100% ───────────────────────
  baseline: {
    key: 'baseline',
    label: 'Sans tiers payeurs',
    description: 'Accident simple, responsabilité 100 %, aucun tiers payeur.',
    tauxResponsabilite: 100,
    tiersPayeurs: [],
    lignesTP: [],
    extractionMode: {},
    droitDePreference: {},
    cascade: null,
    agentMessage: 'Dossier réinitialisé sans tiers payeurs.',
  },

  // ── CR globale + perte de chance — rate 30%, multi-TP ──────────
  // Mode A: créance récapitulative on DSA + PGPA
  // DSA: 6 242,50 × 30% = 1 872,75 envelope. CPAM 3 545 + Harmonie 663 = 4 208 claims.
  //   Victim gets all 1 872,75 (droit de préf.), TP gets 0.
  // PGPA: 31 700 × 30% = 9 510 envelope. CPAM 11 650 + SNCF 8 500 = 20 150 claims.
  //   Victim gets all 9 510 (droit de préf.), TP gets 0.
  'cr-globale--perte-de-chance': {
    key: 'cr-globale--perte-de-chance',
    label: 'CR globale + perte de chance 30 %',
    description: 'Erreur médicale, perte de chance retenue à 30 %. Créance récapitulative. CPAM + Harmonie + SNCF.',
    tauxResponsabilite: 30,

    tiersPayeurs: [CPAM, HARMONIE, SNCF],

    extractionMode: { dsa: 'recap', pgpa: 'recap' },

    lignesTP: [
      {
        id: 'ltp-cr-cpam', tiersPayeurId: 'cpam-idf',
        nature: 'CREANCE_RECAPITULATIVE', regle: 'SIMPLE', montant: 15195,
        postesProjetes: [{ poste: 'dsa', montant: 3545 }, { poste: 'pgpa', montant: 11650 }],
        piece: 'Créance récapitulative CPAM du 12/01/2024',
      },
      {
        id: 'ltp-cr-harmonie', tiersPayeurId: 'harmonie',
        nature: 'CREANCE_RECAPITULATIVE', regle: 'SIMPLE', montant: 663,
        postesProjetes: [{ poste: 'dsa', montant: 663 }],
        piece: 'Décompte Harmonie du 05/02/2024',
      },
      {
        id: 'ltp-cr-sncf', tiersPayeurId: 'sncf',
        nature: 'CREANCE_RECAPITULATIVE', regle: 'SIMPLE', montant: 8500,
        postesProjetes: [{ poste: 'pgpa', montant: 8500 }],
        piece: 'Attestation maintien salaire SNCF du 18/01/2024',
      },
    ],

    imputations: [
      { posteId: 'dsa', tiersPayeurId: 'cpam-idf', ligneTPId: 'ltp-cr-cpam', grossAmount: 3545 },
      { posteId: 'dsa', tiersPayeurId: 'harmonie', ligneTPId: 'ltp-cr-harmonie', grossAmount: 663 },
      { posteId: 'pgpa', tiersPayeurId: 'cpam-idf', ligneTPId: 'ltp-cr-cpam', grossAmount: 11650 },
      { posteId: 'pgpa', tiersPayeurId: 'sncf', ligneTPId: 'ltp-cr-sncf', grossAmount: 8500 },
    ],

    damageOverrides: {},

    // DSA: envelope 1872.75, victim engaged 2034.50 → victim gets 1872.75, TP 0
    // PGPA: envelope 9510, victim engaged 11550 → victim gets 9510, TP 0
    droitDePreference: {
      dsa: {
        posteId: 'dsa',
        prejudice: 6242.50,
        taux: 30,
        enveloppe: 1872.75,
        victimePref: 1872.75,
        resteTP: 0,
        tpDetails: [
          { tiersPayeurId: 'cpam-idf', sigle: 'CPAM', creance: 3545, recouvre: 0, nonRecouvre: 3545 },
          { tiersPayeurId: 'harmonie', sigle: 'Harmonie', creance: 663, recouvre: 0, nonRecouvre: 663 },
        ],
      },
      pgpa: {
        posteId: 'pgpa',
        prejudice: 31700,
        taux: 30,
        enveloppe: 9510,
        victimePref: 9510,
        resteTP: 0,
        tpDetails: [
          { tiersPayeurId: 'cpam-idf', sigle: 'CPAM', creance: 11650, recouvre: 0, nonRecouvre: 11650 },
          { tiersPayeurId: 'sncf', sigle: 'SNCF', creance: 8500, recouvre: 0, nonRecouvre: 8500 },
        ],
      },
    },

    cascade: null,

    agentMessage: "Créance récapitulative globale, perte de chance retenue à 30 %. CPAM (15 195 €) + Harmonie (663 €) + SNCF (8 500 €). Sur DSA et PGPA, l'enveloppe réduite est entièrement absorbée par la victime — les TP ne récupèrent rien.",
  },

  // ── Ligne par ligne — rate 100%, per-invoice extraction ──────
  // Mode B on DSA: TP amounts per expense line
  // PGPA: IJ CPAM integrated into Revenus perçus with badges
  'ligne--classique': {
    key: 'ligne--classique',
    label: 'Ligne par ligne — classique',
    description: 'Accident de la route, responsabilité 100 %. Extraction ligne par ligne sur DSA. IJ CPAM + employeur sur PGPA.',
    tauxResponsabilite: 100,

    tiersPayeurs: [CPAM, HARMONIE, SNCF],

    extractionMode: { dsa: 'ligne', pgpa: 'ij' },

    // Per-line TP extraction for DSA (Mode B)
    ligneExtractions: {
      dsa: [
        { ligneId: 'dsa-1', tpAmounts: { 'cpam-idf': 3800, 'harmonie': 500 } },   // 4500 → RAC 200
        { ligneId: 'dsa-2', tpAmounts: { 'cpam-idf': 900, 'harmonie': 250 } },    // 1280 → RAC 130
        { ligneId: 'dsa-3', tpAmounts: { 'cpam-idf': 250, 'harmonie': 30 } },     // 320 → RAC 40
        { ligneId: 'dsa-4', tpAmounts: { 'cpam-idf': 55, 'harmonie': 10 } },      // 87.50 → RAC 22.50
        { ligneId: 'dsa-5', tpAmounts: { 'cpam-idf': 20, 'harmonie': 3 } },       // 55 → RAC 32
      ],
    },

    // PGPA badges: map revenu perçu / IJ IDs to TP badge labels
    pgpaRevenusPercusBadges: {
      'pgpa-percu-1': { badgeLabel: 'Employeur', sigle: 'SNCF', tiersPayeurId: 'sncf' },
      'pgpa-ij-1': { badgeLabel: 'CPAM IJ', sigle: 'CPAM', tiersPayeurId: 'cpam-idf' },
    },

    lignesTP: [
      {
        id: 'ltp-lpl-cpam-dsa', tiersPayeurId: 'cpam-idf',
        nature: 'EXTRACTION_LIGNE', regle: 'SIMPLE', montant: 5025,
        postesProjetes: [{ poste: 'dsa', montant: 5025 }],
        piece: 'Extraction ligne par ligne — factures DSA',
      },
      {
        id: 'ltp-lpl-harmonie-dsa', tiersPayeurId: 'harmonie',
        nature: 'EXTRACTION_LIGNE', regle: 'SIMPLE', montant: 793,
        postesProjetes: [{ poste: 'dsa', montant: 793 }],
        piece: 'Extraction ligne par ligne — factures DSA',
      },
      {
        id: 'ltp-lpl-cpam-ij', tiersPayeurId: 'cpam-idf',
        nature: 'IJ', regle: 'SIMPLE', montant: 11650,
        postesProjetes: [{ poste: 'pgpa', montant: 11650 }],
        piece: 'Relevé IJ CPAM — Mars 2023 à Sept 2024',
      },
      {
        id: 'ltp-lpl-sncf', tiersPayeurId: 'sncf',
        nature: 'CREANCE_RECAPITULATIVE', regle: 'SIMPLE', montant: 8500,
        postesProjetes: [{ poste: 'pgpa', montant: 8500 }],
        piece: 'Attestation maintien salaire SNCF du 18/01/2024',
      },
    ],

    imputations: [
      { posteId: 'dsa', tiersPayeurId: 'cpam-idf', ligneTPId: 'ltp-lpl-cpam-dsa', grossAmount: 5025 },
      { posteId: 'dsa', tiersPayeurId: 'harmonie', ligneTPId: 'ltp-lpl-harmonie-dsa', grossAmount: 793 },
      { posteId: 'pgpa', tiersPayeurId: 'cpam-idf', ligneTPId: 'ltp-lpl-cpam-ij', grossAmount: 11650 },
      { posteId: 'pgpa', tiersPayeurId: 'sncf', ligneTPId: 'ltp-lpl-sncf', grossAmount: 8500 },
    ],

    damageOverrides: {},
    droitDePreference: {},
    cascade: null,

    agentMessage: "Extraction ligne par ligne activée. DSA : CPAM (5 025 €) + Harmonie (793 €) extraits par facture. PGPA : IJ CPAM (11 650 €) intégrées dans les revenus perçus + maintien SNCF (8 500 €). Responsabilité 100 %.",
  },

  // ── Cascade AT/MP — temporal, rate 100% ─────────
  // Rente AT/MP capitalisée en cascade PGPF → IP → DFP.
  // Rente: 12 600 €/an × coeff. 20 = 252 000 à échoir + 4 600 échus = 256 600 total.
  // PGPF: prejudice 234 350 (échu 4 600 + à échoir 229 750). Rente absorbe tout → victime 0.
  // Remaining: 256 600 - 234 350 = 22 250
  //   → IP: prejudice 15 000, absorbe 15 000 → victime 0. Remaining: 7 250.
  //   → DFP: prejudice 27 000, absorbe 7 250 → victime 19 750. (jurisprudence variable)
  // SNCF maintien: 8 500 on PGPA → victime 23 200.
  cascade: {
    key: 'cascade',
    label: 'Cascade AT/MP',
    description: 'Accident du travail, rente AT/MP capitalisée en cascade PGPF → IP → DFP. Échu + à échoir.',
    tauxResponsabilite: 100,

    tiersPayeurs: [CPAM_ATMP, SNCF],

    extractionMode: { pgpa: 'recap' },

    // Override dossierPostes to include IP
    dossierPostesOverride: ['dsa', 'pgpa', 'dft', 'pgpf', 'ipp', 'se', 'dfp', 'pep'],

    lignesTP: [
      {
        id: 'ltp-uc4-rente', tiersPayeurId: 'cpam-atmp',
        nature: 'RENTE', regle: 'CASCADE_CAPITALISEE', montant: 256600,
        postesOrdonnes: ['pgpf', 'ipp', 'dfp'],
        renteTemporelle: {
          renteAnnuelle: 12600,
          arreragesEchus: 4600,
          coefficient: 20,
          bareme: 'Gazette du Palais 2024',
          arreragesAEchoir: 252000,
          total: 256600,
        },
        piece: 'Notification rente CPAM AT/MP du 05/06/2023',
      },
      {
        id: 'ltp-uc4-sncf', tiersPayeurId: 'sncf',
        nature: 'CREANCE_RECAPITULATIVE', regle: 'SIMPLE', montant: 8500,
        postesProjetes: [{ poste: 'pgpa', montant: 8500 }],
        piece: 'Attestation maintien salaire SNCF du 10/01/2024',
      },
    ],

    imputations: [
      { posteId: 'pgpa', tiersPayeurId: 'sncf', ligneTPId: 'ltp-uc4-sncf', grossAmount: 8500 },
      {
        posteId: 'pgpf', tiersPayeurId: 'cpam-atmp', ligneTPId: 'ltp-uc4-rente',
        grossAmount: 234350,
        montantImputeEchu: 4600,
        montantImputeAEchoir: 229750,
      },
      {
        posteId: 'ipp', tiersPayeurId: 'cpam-atmp', ligneTPId: 'ltp-uc4-rente',
        grossAmount: 15000,
        montantImputeEchu: 0,
        montantImputeAEchoir: 15000,
      },
      {
        posteId: 'dfp', tiersPayeurId: 'cpam-atmp', ligneTPId: 'ltp-uc4-rente',
        grossAmount: 7250,
        montantImputeEchu: 0,
        montantImputeAEchoir: 7250,
      },
    ],

    // Override only for temporal postes where cascade changes the split
    damageOverrides: {
      pgpfEchu: 4600,
      pgpfAEchoir: 229750,
      ipp: 15000,
    },

    droitDePreference: {},

    cascade: {
      ligneTPId: 'ltp-uc4-rente',
      tiersPayeurId: 'cpam-atmp',
      sigle: 'CPAM',
      label: 'Rente AT/MP CPAM',
      renteAnnuelle: 12600,
      coefficient: 20,
      bareme: 'Gazette du Palais 2024',
      capitalise: 256600,
      arreragesEchus: 4600,
      arreragesAEchoir: 252000,
      ordre: ['pgpf', 'ipp', 'dfp'],
      etapes: [
        {
          posteId: 'pgpf', label: 'PGPF', prejudice: 234350,
          absorbe: 234350, absorbeEchu: 4600, absorbeAEchoir: 229750,
          statut: 'totalement absorbé',
        },
        {
          posteId: 'ipp', label: 'IP', prejudice: 15000,
          absorbe: 15000, absorbeEchu: 0, absorbeAEchoir: 15000,
          statut: 'totalement absorbé',
        },
        {
          posteId: 'dfp', label: 'DFP', prejudice: 27000,
          absorbe: 7250, absorbeEchu: 0, absorbeAEchoir: 7250,
          statut: 'partiellement absorbé',
          jurisprudentiallyVariable: true,
        },
      ],
      totalAbsorbe: 256600,
      nonRecouvre: 0,
    },

    agentMessage: "Rente AT/MP identifiée (12 600 €/an). Arrérages échus : 4 600 €. Capitalisé (× 20) : 252 000 €. Total créance : 256 600 €. Cascade patrimoniale : PGPF totalement absorbé (234 350 €), IP totalement absorbé (15 000 €), DFP partiellement absorbé (7 250 € sur 27 000 €, victime 19 750 € — jurisprudence variable). SNCF maintien : 8 500 € sur PGPA.",
  },
};

// ============================================================
// LOAD-TIME PROCESSING
// ============================================================

Object.values(TP_SCENARIOS).forEach((scenario) => {
  // Derive flat _imputations array from scenario.imputations
  scenario._imputations = (scenario.imputations || []).map((imp, i) => {
    // Determine source label based on the ligneTP nature
    const ligne = (scenario.lignesTP || []).find(l => l.id === imp.ligneTPId);
    let source = 'créance récapitulative';
    if (ligne?.nature === 'EXTRACTION_LIGNE') source = 'ligne par ligne';
    else if (ligne?.nature === 'IJ') source = 'IJ';
    else if (imp.ligneTPId?.includes('rente')) source = 'cascade';

    return {
      id: `imp-${scenario.key}-${imp.posteId}-${i}`,
      ligneTPId: imp.ligneTPId,
      tiersPayeurId: imp.tiersPayeurId,
      posteId: imp.posteId,
      montantImpute: imp.grossAmount,
      montantImputeEchu: imp.montantImputeEchu || null,
      montantImputeAEchoir: imp.montantImputeAEchoir || null,
      source,
    };
  });
});

// ============================================================
// EXPORTS
// ============================================================

export const TP_COMMAND_LIST = [
  { command: 'tp-reset', label: 'TP · Reset', description: 'Revenir au scénario sans tiers payeurs' },
  { command: 'tp-cr-globale--perte-de-chance', label: 'TP · CR globale + perte de chance', description: 'Taux 30 %, créance récapitulative, droit de préférence' },
  { command: 'tp-ligne--classique', label: 'TP · Ligne par ligne', description: 'Taux 100 %, extraction DSA par facture, IJ CPAM + SNCF sur PGPA' },
  { command: 'tp-cascade', label: 'TP · Cascade AT/MP', description: 'Rente capitalisée, cascade PGPF → IP → DFP' },
  { command: 'tp-help', label: 'TP · Aide', description: 'Afficher les commandes tiers payeurs' },
];

export const TP_COMMAND_MAP = {
  'tp-reset': 'baseline',
  'tp-cr-globale--perte-de-chance': 'cr-globale--perte-de-chance',
  'tp-ligne--classique': 'ligne--classique',
  'tp-cascade': 'cascade',
};

export const getTPScenario = (key) => TP_SCENARIOS[key] || TP_SCENARIOS.baseline;

export default TP_SCENARIOS;

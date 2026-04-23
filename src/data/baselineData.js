// ============================================================
// Baseline data — always-present poste data for every dossier
// ============================================================
// These constants are the single source of truth for initial
// poste state. App.js imports them for useState defaults and
// handleCreateDossier. TP scenarios overlay on top of this.
// ============================================================

export const BASELINE_DSA_LIGNES = [
  { id: 'dsa-1', status: 'validated', label: 'Hospitalisation CHU Bordeaux', description: 'Séjour du 15 au 22 mars 2023', type: 'Hospitalisation', date: '15/03/2023', montant: 4500, dejaRembourse: 3200, tiers: 'CHU Bordeaux', pieceIds: ['p-1', 'p-8', 'p-5'] },
  { id: 'dsa-2', status: 'validated', label: 'Séances de kinésithérapie', description: '32 séances de rééducation du genou', type: 'Rééducation', date: '01/04/2023', dateFin: '30/09/2023', isPeriodique: true, periodicite: 'Hebdomadaire', montant: 1280, dejaRembourse: 640, tiers: 'Cabinet Martin', pieceIds: ['p-2'] },
  { id: 'dsa-3', status: 'validated', label: 'IRM genou gauche', type: 'Imagerie', date: '25/06/2023', montant: 320, dejaRembourse: 280, tiers: 'Centre Imagerie Sud', pieceIds: ['p-12', 'p-5'] },
  { id: 'dsa-4', status: 'validated', label: 'Médicaments juillet 2023', type: 'Pharmacie', date: '20/07/2023', montant: 87.50, dejaRembourse: 65, tiers: 'Pharmacie des Lilas', pieceIds: ['p-7', 'p-6'] },
  { id: 'dsa-5', status: 'validated', label: 'Consultation orthopédique', type: 'Consultation', date: '15/08/2023', montant: 55, dejaRembourse: 23, tiers: 'Dr. Petit', pieceIds: ['p-14'] },
];

export const BASELINE_DFT_LIGNES = [
  { id: 'dft-1', status: 'validated', label: 'Hospitalisation initiale', debut: '15/03/2023', fin: '22/03/2023', jours: 8, taux: 100, montant: 264, pieceIds: ['p-5'], confidence: null, commentaire: '' },
  { id: 'dft-2', status: 'validated', label: 'Hospitalisation chirurgie', debut: '28/03/2023', fin: '02/04/2023', jours: 6, taux: 100, montant: 198, pieceIds: ['p-5'], confidence: null, commentaire: '' },
  { id: 'dft-3', status: 'validated', label: 'Alitement strict post-op', debut: '03/04/2023', fin: '15/04/2023', jours: 13, taux: 100, montant: 429, pieceIds: ['p-5'], confidence: null, commentaire: '' },
  { id: 'dft-4', status: 'validated', label: 'Convalescence post-opératoire', debut: '16/04/2023', fin: '30/06/2023', jours: 76, taux: 50, montant: 1254, pieceIds: ['p-5'], confidence: null, commentaire: '' },
  { id: 'dft-5', status: 'validated', label: 'Rééducation active intensive', debut: '01/07/2023', fin: '30/09/2023', jours: 92, taux: 40, montant: 1214, pieceIds: ['p-5'], confidence: null, commentaire: '' },
  { id: 'dft-6', status: 'validated', label: 'Rééducation d\'entretien', debut: '01/10/2023', fin: '31/12/2023', jours: 92, taux: 25, montant: 759, pieceIds: ['p-5'], confidence: null, commentaire: '' },
  { id: 'dft-7', status: 'validated', label: 'Gêne résiduelle pré-consolidation', debut: '01/01/2024', fin: '12/09/2024', jours: 256, taux: 15, montant: 1267, pieceIds: ['p-5'], confidence: null, commentaire: '' },
];

export const BASELINE_PGPA_DATA = {
  periode: { debut: '15/03/2023', fin: '12/09/2024', mois: 18 },
  revenuRef: {
    revalorisation: 'ipc-annuel',
    coefficientPerteChance: 100,
    lignes: [
      { id: 'pgpa-rev-1', type: 'revenu', label: 'Salaire net imposable', annee: '2022', montant: 32400, revalorise: 33696, aRevaloriser: true, pieceIds: ['p-3', 'p-11'] },
      { id: 'pgpa-rev-2', type: 'revenu', label: 'Salaire net imposable', annee: '2021', montant: 31200, revalorise: 33384, aRevaloriser: true, pieceIds: ['p-9'] },
      { id: 'pgpa-gain-1', type: 'gain', label: 'Prime annuelle', annee: '2022', montant: 2400, revalorise: 2496, aRevaloriser: true, pieceIds: ['p-3'] },
      { id: 'pgpa-gain-2', type: 'gain', label: 'Heures supplémentaires', annee: '2022', montant: 1800, revalorise: 1872, aRevaloriser: true, pieceIds: ['p-3', 'p-11'] },
    ],
    total: 37800,
  },
  revenusPercus: [
    { id: 'pgpa-percu-1', label: 'Maintien partiel salaire', periode: 'Mars - Juin 2023', periodeDebut: '15/03/2023', periodeFin: '30/06/2023', dureeJours: 107, montant: 8500, tiers: 'Employeur', pieceIds: ['p-10', 'p-11', 'p-3'] },
  ],
  ijPercues: [
    { id: 'pgpa-ij-1', label: 'IJ Sécurité sociale', tiers: 'CPAM Gironde', periode: 'Mars 2023 - Sept 2024', periodeDebut: '15/03/2023', periodeFin: '12/09/2024', jours: 546, montantBrut: 12500, csgCrds: 850, montant: 11650, pieceIds: ['p-4', 'p-10'] },
    { id: 'pgpa-ij-2', label: 'IJ Prévoyance', tiers: 'AG2R', periode: 'Juil 2023 - Sept 2024', periodeDebut: '01/07/2023', periodeFin: '12/09/2024', jours: 439, montantBrut: 5200, csgCrds: 350, montant: 4850, pieceIds: ['p-13'] },
  ],
};

export const BASELINE_PGPF_DATA = {
  periodes: {
    'pgpf-cl': {
      label: 'Consolidation → Liquidation',
      periode: { debut: '12/09/2024', fin: '15/01/2025', mois: 4 },
      revenuRef: { total: 37800 },
      revenusPercus: [
        { id: 'pgpf-cl-percu-1', label: 'Salaire reprise mi-temps', periode: 'Oct - Déc 2024', montant: 4800, pieceIds: ['p-10'] },
      ],
      ijPercues: [
        { id: 'pgpf-cl-ij-1', label: 'IJ Sécurité sociale', tiers: 'CPAM Gironde', periode: 'Sept - Déc 2024', montant: 3200, pieceIds: ['p-4'] },
      ],
    },
    'pgpf-al': {
      label: 'Après Liquidation (capitalisation)',
      periode: { debut: '15/01/2025', fin: 'Viager' },
      params: {
        age: 42, perteGainAnnuelle: 12600, bareme: 'Gazette du Palais 2025 – 0,5%',
        ageDernierArreage: 67, coefficient: 18.234, montantCapitalise: 229750,
      },
      tiersPayeurs: [
        { id: 'pgpf-tp-1', label: 'CPAM Gironde', renteAnnuelle: 4800, montantCapitalise: 87523, modified: false },
        { id: 'pgpf-tp-2', label: 'AG2R Prévoyance', renteAnnuelle: 2400, montantCapitalise: 43762, modified: true },
      ],
    },
  },
};

export const BASELINE_FORM_POSTE_DATA = {
  se: { referentiel: 'cours-appel-2024', cotation: 4, montant: 15000 },
  pep: { referentiel: 'cours-appel-2024', cotation: 3, montant: 4500 },
  dfp: { referentiel: 'cours-appel-2024', age: 42, taux: 18, trancheAge: 'inferieure', trancheTaux: 'inferieure', pointBase: 1500, montant: 27000 },
};

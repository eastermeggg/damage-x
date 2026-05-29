// Bordereau seed — MARTINIE-style example mapping the legacy 14 pieces
// (p-1 … p-14) into a hierarchical category tree, plus a few extra pieces
// to showcase the Hors bordereau section and the rare "Sans catégorie"
// case.
//
// IDs p-1 to p-14 are intentionally preserved: chiffrage data (FDP, FO,
// PRP, IV postes) references them via `pieceIds: ['p-1', 'p-7', …]` and
// renaming would break those references.
//
// Gap at IV: root categories have orders [0, 1, 2, 4]. The numbering helper
// derives romans from `order + 1`, so the displayed sequence is I, II, III,
// V — IV is intentionally skipped (MARTINIE pattern from spec §3).

export const BORDEREAU_CATEGORIES = [
  // I. Procédure — empty, shows the design for an empty category
  { id: 'cat-procedure', name: 'Procédure', parentId: null, order: 0 },

  // II. Médical
  { id: 'cat-medical', name: 'Médical', parentId: null, order: 1 },
  { id: 'cat-expertises', name: 'Expertises', parentId: 'cat-medical', order: 0 },
  { id: 'cat-soins', name: 'Comptes-rendus & soins', parentId: 'cat-medical', order: 1 },

  // III. Frais médicaux — flat (no subcategories)
  { id: 'cat-frais-med', name: 'Frais médicaux', parentId: null, order: 2 },

  // ── (order=3 deliberately absent → IV is skipped in the rendered sequence)

  // V. Pertes de revenus
  { id: 'cat-revenus', name: 'Pertes de revenus', parentId: null, order: 4 },
  { id: 'cat-bulletins', name: 'Bulletins de salaire', parentId: 'cat-revenus', order: 0 },
  { id: 'cat-indemnites', name: 'Indemnités & attestations', parentId: 'cat-revenus', order: 1 },
];

export const BORDEREAU_PIECES = [
  // ── II-A. Expertises
  { id: 'p-5', nom: 'Rapport Dr. Martin.pdf', nomOriginal: 'rapport_expertise_martin.pdf', intitule: "Rapport d'expertise", date: '12/09/2024', type: 'Rapport', used: true,
    categoryId: 'cat-expertises', inclureDansBordereau: true, orderInCategory: 0 },

  // ── II-B. Comptes-rendus & soins
  { id: 'p-8', nom: 'Compte-rendu urgences.pdf', nomOriginal: 'cr_urgences_150323.pdf', intitule: 'Compte-rendu passage urgences', date: '15/03/2023', type: 'Compte-rendu', used: true,
    categoryId: 'cat-soins', inclureDansBordereau: true, orderInCategory: 0 },
  { id: 'p-6', nom: 'Ordonnance médicaments.pdf', nomOriginal: 'ordonnance_jul2023.pdf', intitule: 'Ordonnance médicaments juillet', date: '18/07/2023', type: 'Ordonnance', used: true,
    categoryId: 'cat-soins', inclureDansBordereau: true, orderInCategory: 1 },
  { id: 'p-10', nom: 'Avis arrêt travail.pdf', nomOriginal: 'arret_travail_mars2023.pdf', intitule: "Avis d'arrêt de travail initial", date: '16/03/2023', type: 'Attestation', used: true,
    categoryId: 'cat-soins', inclureDansBordereau: true, orderInCategory: 2 },

  // ── III. Frais médicaux (direct pieces, no subcategories)
  { id: 'p-1', nom: 'Facture CHU Bordeaux.pdf', nomOriginal: 'facture_chu_2023_03.pdf', intitule: 'Facture hospitalisation CHU Bordeaux', date: '15/03/2023', type: 'Facture', used: true,
    categoryId: 'cat-frais-med', inclureDansBordereau: true, orderInCategory: 0 },
  { id: 'p-2', nom: 'Factures kiné (lot).pdf', nomOriginal: 'kine_factures_lot.pdf', intitule: 'Factures kinésithérapie Cabinet Martin', date: '01/04/2023', type: 'Facture', used: true,
    categoryId: 'cat-frais-med', inclureDansBordereau: true, orderInCategory: 1 },
  { id: 'p-12', nom: 'Facture IRM.pdf', nomOriginal: 'facture_irm_juin2023.pdf', intitule: 'Facture IRM Centre Imagerie Sud', date: '25/06/2023', type: 'Facture', used: true,
    categoryId: 'cat-frais-med', inclureDansBordereau: true, orderInCategory: 2 },
  { id: 'p-7', nom: 'Facture pharmacie.pdf', nomOriginal: 'pharmacie_2023.pdf', intitule: 'Facture pharmacie des Lilas', date: '20/07/2023', type: 'Facture', used: true,
    categoryId: 'cat-frais-med', inclureDansBordereau: true, orderInCategory: 3 },
  { id: 'p-14', nom: 'Facture consultation Dr. Petit.pdf', nomOriginal: 'consult_dr_petit.pdf', intitule: 'Consultation orthopédique Dr. Petit', date: '15/08/2023', type: 'Facture', used: true,
    categoryId: 'cat-frais-med', inclureDansBordereau: true, orderInCategory: 4 },

  // ── V-A. Bulletins de salaire
  { id: 'p-3', nom: 'Bulletins salaire 2022.pdf', nomOriginal: 'bulletins_2022.pdf', intitule: 'Bulletins de salaire année 2022', date: '10/01/2023', type: 'Bulletin', used: true,
    categoryId: 'cat-bulletins', inclureDansBordereau: true, orderInCategory: 0 },
  { id: 'p-9', nom: 'Bulletins salaire 2021.pdf', nomOriginal: 'bulletins_2021.pdf', intitule: 'Bulletins de salaire année 2021', date: '10/01/2022', type: 'Bulletin', used: true,
    categoryId: 'cat-bulletins', inclureDansBordereau: true, orderInCategory: 1 },

  // ── V-B. Indemnités & attestations
  { id: 'p-4', nom: 'Attestation CPAM.pdf', nomOriginal: 'cpam_attestation.pdf', intitule: 'Attestation de versement IJ CPAM', date: '20/05/2023', type: 'Attestation', used: true,
    categoryId: 'cat-indemnites', inclureDansBordereau: true, orderInCategory: 0 },
  { id: 'p-11', nom: 'Attestation employeur.pdf', nomOriginal: 'attestation_employeur.pdf', intitule: 'Attestation de salaire employeur', date: '20/03/2023', type: 'Attestation', used: true,
    categoryId: 'cat-indemnites', inclureDansBordereau: true, orderInCategory: 1 },
  { id: 'p-13', nom: 'Décompte AG2R.pdf', nomOriginal: 'decompte_ag2r.pdf', intitule: 'Décompte indemnités prévoyance AG2R', date: '15/08/2023', type: 'Décompte', used: true,
    categoryId: 'cat-indemnites', inclureDansBordereau: true, orderInCategory: 2 },

  // ── Sans catégorie (not yet classified — newly arrived, rare in practice)
  { id: 'p-sc1', nom: 'Constat huissier voirie.pdf', nomOriginal: 'constat_huissier_2024.pdf', intitule: "Constat d'huissier — état de la chaussée", date: '18/03/2024', type: 'Constat', used: false,
    categoryId: null, inclureDansBordereau: true, orderInCategory: 0 },
];

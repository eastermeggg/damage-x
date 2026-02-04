import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, ChevronDown, Folder, FileText, Calculator, Plus, X, Edit3, Check, AlertTriangle, RefreshCw, Calendar, Landmark, Upload, Sparkles, Loader2, Search, HelpCircle, Eye, Trash2, FileQuestion, Download, Settings, AlertCircle, Receipt, ClipboardList, FileSpreadsheet, Image, Activity, File, FolderOpen, FileSearch, ListChecks, ShieldCheck, MoreHorizontal, User, LogOut, Copy, Plug2 } from 'lucide-react';

const POSTES_TAXONOMY = [
  {
    section: 'VICTIME DIRECTE',
    categories: [
      { title: 'Préjudices patrimoniaux temporaires', id: 'vd-pat-temp', postes: [
        { id: 'dsa', acronym: 'DSA', label: 'Dépenses de santé actuelles', enabled: true },
        { id: 'pgpa', acronym: 'PGPA', label: 'Pertes de gains professionnels actuels', enabled: true },
        { id: 'fda', label: 'Frais divers actuels', enabled: false },
        { id: 'psuf', label: 'Préjudice scolaire, universitaire ou de formation', enabled: false },
        { id: 'atpt', label: 'Assistance par une tierce personne temporaire', enabled: false },
      ]},
      { title: 'Préjudices extra patrimoniaux temporaires', id: 'vd-expat-temp', postes: [
        { id: 'dft', acronym: 'DFT', label: 'Déficit fonctionnel temporaire', enabled: true },
        { id: 'pet', label: 'Préjudice esthétique temporaire', enabled: false },
      ]},
      { title: 'Préjudices patrimoniaux permanents', id: 'vd-pat-perm', postes: [
        { id: 'dsf', label: 'Dépenses de santé futures', enabled: false },
        { id: 'fdf', label: 'Frais divers futurs', enabled: false },
        { id: 'fla', label: 'Frais de logement adapté', enabled: false },
        { id: 'fva', label: 'Frais de véhicule adapté', enabled: false },
        { id: 'pgpf', label: 'Pertes de gains professionnels futurs', enabled: false },
        { id: 'ipp', label: 'Incidence professionnelle', enabled: false },
        { id: 'atpf', label: 'Assistance par une tierce personne future', enabled: false },
      ]},
      { title: 'Préjudices extra patrimoniaux permanents', id: 'vd-expat-perm', postes: [
        { id: 'dfp', label: 'Déficit fonctionnel permanent', enabled: false },
        { id: 'pa', label: "Préjudice d'agrément", enabled: false },
        { id: 'pep', label: 'Préjudice esthétique permanent', enabled: false },
        { id: 'ps', label: 'Préjudice sexuel', enabled: false },
        { id: 'pe', label: "Préjudice d'établissement", enabled: false },
        { id: 'ppe', label: 'Préjudice permanent exceptionnel', enabled: false },
      ]},
      { title: 'Autres préjudices hors consolidation', id: 'vd-hors-conso', postes: [
        { id: 'plpe', label: 'Préjudices liés aux pathologies évolutives', enabled: false },
        { id: 'pim', label: "Préjudices d'impréparation médicale", enabled: false },
        { id: 'panx', label: "Préjudice d'anxiété", enabled: false },
        { id: 'pami', label: "Préjudice d'angoisse de mort imminente", enabled: false },
      ]},
      { title: 'Annexes', id: 'vd-annexes', postes: [
        { id: 'dm', label: 'Dommage matériel', enabled: false },
        { id: 'indp', label: 'Indemnité provisionnelle', enabled: false },
        { id: 'int', label: 'Intérêts', enabled: false },
        { id: 'autres', label: 'Autres postes de préjudice', enabled: false },
      ]},
    ]
  },
  {
    section: 'VICTIME(S) INDIRECTE(S)',
    categories: [
      { title: 'Préjudices patrimoniaux', id: 'vi-pat', postes: [
        { id: 'fdp', label: 'Frais divers des proches', enabled: false },
        { id: 'fo', label: "Frais d'obsèques", enabled: false },
      ]},
      { title: 'Préjudices extra patrimoniaux', id: 'vi-expat', postes: [
        { id: 'pepe', label: 'Préjudices extra-patrimoniaux exceptionnels', enabled: false },
        { id: 'pai', label: "Préjudice d'angoisse et d'inquiétude", enabled: false },
        { id: 'pafv', label: "Préjudice d'accompagnement de fin de vie", enabled: false },
      ]},
    ]
  }
];

export default function App() {

  // ========== LOCALSTORAGE PERSISTENCE ==========
  const LS_GLOBAL = 'norma_global';
  const LS_DOSSIER = 'norma_dossier_';
  const lsSave = (key, data) => { try { localStorage.setItem(key, JSON.stringify(data)); } catch (e) { console.warn('LS save:', e); } };
  const lsLoad = (key) => { try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : null; } catch (e) { return null; } };
  const isInitialLoad = useRef(true);

  // ========== STATE ==========
  const [currentPage, setCurrentPage] = useState('list'); // 'list' | 'dossier'
  const [activeDossierId, setActiveDossierId] = useState(null);

  // ========== LISTE DES DOSSIERS ==========
  const [dossiers, setDossiers] = useState([
    { id: 'dossier-1', reference: 'Dupont Jean', typeFait: 'Accident du travail', date: '16/09/2013', lastEditBy: 'Meghan R.', lastEditDate: '30/01/2026' },
    { id: 'dossier-2', reference: 'Martin Sophie', typeFait: 'Accident de la route', date: '03/04/2021', lastEditBy: 'Meghan R.', lastEditDate: '28/01/2026' },
    { id: 'dossier-3', reference: 'Bernard Pierre', typeFait: 'Agression', date: '12/11/2022', lastEditBy: 'Thomas L.', lastEditDate: '25/01/2026' },
    { id: 'dossier-4', reference: 'Lefebvre Marie', typeFait: 'Erreur médicale', date: '08/07/2020', lastEditBy: 'Meghan R.', lastEditDate: '20/01/2026' },
    { id: 'dossier-5', reference: 'Moreau Lucas', typeFait: 'Accident du travail', date: '22/02/2023', lastEditBy: 'Thomas L.', lastEditDate: '15/01/2026' },
  ]);

  const [navStack, setNavStack] = useState([
    { id: 'dossier-1', type: 'dossier', title: 'Dossier Dupont', activeTab: 'détail' }
  ]);
  const [expandedCategories, setExpandedCategories] = useState(['patrimoniaux-temp', 'extra-patrimoniaux-temp', 'patrimoniaux-perm']);
  const [expandedSections, setExpandedSections] = useState(['pgpf-cl', 'pgpf-al']);
  const [editPanel, setEditPanel] = useState(null);
  const [editingPieceIds, setEditingPieceIds] = useState([]); // Pour tracker les pieceIds pendant l'édition d'une ligne
  const [showAddModal, setShowAddModal] = useState(null); // null | 'dsa' | 'pgpa' | etc.
  const [addModalTab, setAddModalTab] = useState('upload'); // 'upload' | 'pieces' | 'manual'
  const [showPreview, setShowPreview] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState([]);
  const [searchPieces, setSearchPieces] = useState('');
  const [searchPostes, setSearchPostes] = useState('');
  const [searchPiecesPanel, setSearchPiecesPanel] = useState('');
  const [expandedTaxoCategories, setExpandedTaxoCategories] = useState([
    'vd-pat-temp', 'vd-expat-temp', 'vd-pat-perm', 'vd-expat-perm', 'vd-hors-conso', 'vd-annexes', 'vi-pat', 'vi-expat'
  ]);
  const [showChiffrageParams, setShowChiffrageParams] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(null); // null | 'resume' | 'expertise'
  const [creationWizard, setCreationWizard] = useState(null); // null | { step: 'infos', formData: {...} } | { step: 'mode-chiffrage', formData: {...} }

  const typesFaitGenerateur = ['Accident de la route', 'Accident du travail', 'Accident médical', 'Agression', 'Accident domestique', 'Autre'];

  // ========== PARAMÈTRES CHIFFRAGE (niveau dossier) ==========
  const [chiffrageParams, setChiffrageParams] = useState({
    // Dates clés
    dateOuverture: '16/09/2013',
    dateRapportExpertise: '04/03/2019',
    dateLiquidation: '02/02/2023',
    dateConsolidation: '11/12/2017',
    // Fraction indemnisable
    fractionIndemnisable: 100,
    // Tiers payeurs
    tiersPayeurs: ['CPAM', 'CNMSS', 'AJE'],
    // Référentiels et barèmes
    referentielSE: 'cours-appel-2024',
    referentielSEMode: 'maximum', // minimum | moyenne | maximum
    baremeCapitalisation: 'gazette-palais-2025-0.5',
    referentielDFP: 'cours-appel-2024',
    // Bases journalières
    baseJournaliereDFT: 33,
    forfaitHoraireATPT: null,
  });

  // ========== DOSSIER DATA ==========
  const [victimeData, setVictimeData] = useState({
    nom: 'Dupont',
    prenom: 'Jean',
    sexe: 'Homme',
    dateNaissance: '15/06/1982',
    dateDeces: null
  });

  const [faitGenerateur, setFaitGenerateur] = useState({
    type: 'Accident de la route',
    dateAccident: '15/03/2023',
    datePremiereConstatation: '15/03/2023',
    dateConsolidation: '12/09/2024',
    resume: 'Accident de la circulation survenu le 15 mars 2023. M. Dupont circulait à vélo lorsqu\'il a été percuté par un véhicule automobile. Traumatisme du membre inférieur gauche avec fracture du plateau tibial. Hospitalisation de 8 jours au CHU de Bordeaux, suivie d\'une rééducation de 18 mois.'
  });

  // Calcul âge
  const calcAge = (dateNaissance, dateFin = null) => {
    const [day, month, year] = dateNaissance.split('/');
    const birth = new Date(year, month - 1, day);
    const end = dateFin ? (() => { const [d, m, y] = dateFin.split('/'); return new Date(y, m - 1, d); })() : new Date();
    let age = end.getFullYear() - birth.getFullYear();
    if (end.getMonth() < birth.getMonth() || (end.getMonth() === birth.getMonth() && end.getDate() < birth.getDate())) age--;
    return age;
  };

  // Conversion YYYY-MM-DD → DD/MM/YYYY
  const formatDateFR = (isoDate) => {
    if (!isoDate) return '';
    const [y, m, d] = isoDate.split('-');
    return `${d}/${m}/${y}`;
  };

  // ========== INFORMATIONS DOSSIER ==========
  const [dossierStatut, setDossierStatut] = useState('ouvert'); // 'ouvert' | 'fermé' | 'archive'
  const [dossierRef, setDossierRef] = useState('DOS-2024-001');
  const [dossierIntitule, setDossierIntitule] = useState('Dossier Dupont');
  const [dossierDateOuverture, setDossierDateOuverture] = useState('15/03/2023');
  const [dossierAvocat, setDossierAvocat] = useState('Me. Durand');
  const [dossierNotes, setDossierNotes] = useState('');
  const [resumeAffaire, setResumeAffaire] = useState('M. Jean Dupont, cycliste, a été victime d\'un accident de la circulation le 15 mars 2023 à Bordeaux. Alors qu\'il circulait sur une piste cyclable, il a été percuté par un véhicule automobile dont le conducteur n\'avait pas respecté la priorité. L\'impact a provoqué une chute violente entraînant un traumatisme du membre inférieur gauche avec fracture du plateau tibial.');
  const [commentaireExpertise, setCommentaireExpertise] = useState('L\'expert a retenu une consolidation au 12/09/2024 avec les séquelles suivantes : limitation de la flexion du genou gauche, douleurs résiduelles à l\'effort. Le taux d\'AIPP est fixé à 15%.');

  const [victimesIndirectes, setVictimesIndirectes] = useState([
    { id: 'vi-1', nom: 'Dupont', prenom: 'Marie', sexe: 'Femme', dateNaissance: '22/08/1984', lien: 'Épouse' },
    { id: 'vi-2', nom: 'Dupont', prenom: 'Lucas', sexe: 'Homme', dateNaissance: '10/03/2012', lien: 'Enfant' },
    { id: 'vi-3', nom: 'Dupont', prenom: 'Emma', sexe: 'Femme', dateNaissance: '05/11/2015', lien: 'Enfant' }
  ]);

  // ========== PIECES (niveau dossier) ==========
  const [pieces, setPieces] = useState([
    { id: 'p-1', nom: 'Facture CHU Bordeaux.pdf', nomOriginal: 'facture_chu_2023_03.pdf', intitule: 'Facture hospitalisation CHU Bordeaux', date: '15/03/2023', type: 'Facture', used: true },
    { id: 'p-2', nom: 'Factures kiné (lot).pdf', nomOriginal: 'kine_factures_lot.pdf', intitule: 'Factures kinésithérapie Cabinet Martin', date: '01/04/2023', type: 'Facture', used: true },
    { id: 'p-3', nom: 'Bulletins salaire 2022.pdf', nomOriginal: 'bulletins_2022.pdf', intitule: 'Bulletins de salaire année 2022', date: '10/01/2023', type: 'Bulletin', used: true },
    { id: 'p-4', nom: 'Attestation CPAM.pdf', nomOriginal: 'cpam_attestation.pdf', intitule: 'Attestation de versement IJ CPAM', date: '20/05/2023', type: 'Attestation', used: true },
    { id: 'p-5', nom: 'Rapport Dr. Martin.pdf', nomOriginal: 'rapport_expertise_martin.pdf', intitule: 'Rapport d\'expertise médicale Dr. Martin', date: '12/09/2024', type: 'Expertise', used: true },
    { id: 'p-6', nom: 'Ordonnance médicaments.pdf', nomOriginal: 'ordonnance_jul2023.pdf', intitule: 'Ordonnance médicaments juillet', date: '18/07/2023', type: 'Ordonnance', used: true },
    { id: 'p-7', nom: 'Facture pharmacie.pdf', nomOriginal: 'pharmacie_2023.pdf', intitule: 'Facture pharmacie des Lilas', date: '20/07/2023', type: 'Facture', used: true },
    { id: 'p-8', nom: 'Compte-rendu urgences.pdf', nomOriginal: 'cr_urgences_150323.pdf', intitule: 'Compte-rendu passage urgences', date: '15/03/2023', type: 'Compte-rendu', used: true },
    { id: 'p-9', nom: 'Bulletins salaire 2021.pdf', nomOriginal: 'bulletins_2021.pdf', intitule: 'Bulletins de salaire année 2021', date: '10/01/2022', type: 'Bulletin', used: true },
    { id: 'p-10', nom: 'Avis arrêt travail.pdf', nomOriginal: 'arret_travail_mars2023.pdf', intitule: 'Avis d\'arrêt de travail initial', date: '16/03/2023', type: 'Attestation', used: true },
    { id: 'p-11', nom: 'Attestation employeur.pdf', nomOriginal: 'attestation_employeur.pdf', intitule: 'Attestation de salaire employeur', date: '20/03/2023', type: 'Attestation', used: true },
    { id: 'p-12', nom: 'Facture IRM.pdf', nomOriginal: 'facture_irm_juin2023.pdf', intitule: 'Facture IRM Centre Imagerie Sud', date: '25/06/2023', type: 'Facture', used: true },
    { id: 'p-13', nom: 'Décompte AG2R.pdf', nomOriginal: 'decompte_ag2r.pdf', intitule: 'Décompte indemnités prévoyance AG2R', date: '15/08/2023', type: 'Décompte', used: true },
    { id: 'p-14', nom: 'Facture consultation Dr. Petit.pdf', nomOriginal: 'consult_dr_petit.pdf', intitule: 'Consultation orthopédique Dr. Petit', date: '15/08/2023', type: 'Facture', used: true }
  ]);

  // ========== DSA ==========
  const [dsaLignes, setDsaLignes] = useState([
    // 3 docs - Hospitalisation complète
    { id: 'dsa-1', status: 'validated', label: 'Hospitalisation CHU Bordeaux', description: 'Séjour du 15 au 22 mars 2023', type: 'Hospitalisation', date: '15/03/2023', montant: 4500, dejaRembourse: 3200, tiers: 'CHU Bordeaux', pieceIds: ['p-1', 'p-8', 'p-5'] },
    // 1 doc - Kiné
    { id: 'dsa-2', status: 'validated', label: 'Séances de kinésithérapie', description: '32 séances de rééducation du genou', type: 'Rééducation', date: '01/04/2023', dateFin: '30/09/2023', isPeriodique: true, periodicite: 'Hebdomadaire', montant: 1280, dejaRembourse: 640, tiers: 'Cabinet Martin', pieceIds: ['p-2'] },
    // 2 docs - IRM
    { id: 'dsa-3', status: 'validated', label: 'IRM genou gauche', type: 'Imagerie', date: '25/06/2023', montant: 320, dejaRembourse: 280, tiers: 'Centre Imagerie Sud', pieceIds: ['p-12', 'p-5'] },
    // 2 docs - Pharmacie
    { id: 'dsa-4', status: 'validated', label: 'Médicaments juillet 2023', type: 'Pharmacie', date: '20/07/2023', montant: 87.50, dejaRembourse: 65, tiers: 'Pharmacie des Lilas', pieceIds: ['p-7', 'p-6'] },
    // 1 doc - Consultation
    { id: 'dsa-5', status: 'validated', label: 'Consultation orthopédique', type: 'Consultation', date: '15/08/2023', montant: 55, dejaRembourse: 23, tiers: 'Dr. Petit', pieceIds: ['p-14'] }
  ]);

  // ========== PGPA ==========
  const [pgpaData, setPgpaData] = useState({
    periode: { debut: '15/03/2023', fin: '12/09/2024', mois: 18 },
    revenuRef: {
      revalorisation: 'ipc-annuel',
      coefficientPerteChance: 100,
      lignes: [
        // 2 docs - Salaire 2022
        { id: 'pgpa-rev-1', type: 'revenu', label: 'Salaire net imposable', annee: '2022', montant: 32400, revalorise: 33696, aRevaloriser: true, pieceIds: ['p-3', 'p-11'] },
        // 1 doc - Salaire 2021
        { id: 'pgpa-rev-2', type: 'revenu', label: 'Salaire net imposable', annee: '2021', montant: 31200, revalorise: 33384, aRevaloriser: true, pieceIds: ['p-9'] },
        // 1 doc - Prime
        { id: 'pgpa-gain-1', type: 'gain', label: 'Prime annuelle', annee: '2022', montant: 2400, revalorise: 2496, aRevaloriser: true, pieceIds: ['p-3'] },
        // 2 docs - Heures sup
        { id: 'pgpa-gain-2', type: 'gain', label: 'Heures supplémentaires', annee: '2022', montant: 1800, revalorise: 1872, aRevaloriser: true, pieceIds: ['p-3', 'p-11'] },
      ],
      total: 37800
    },
    revenusPercus: [
      // 3 docs - Maintien salaire
      { id: 'pgpa-percu-1', label: 'Maintien partiel salaire', periode: 'Mars - Juin 2023', periodeDebut: '15/03/2023', periodeFin: '30/06/2023', dureeJours: 107, montant: 8500, tiers: 'Employeur', pieceIds: ['p-10', 'p-11', 'p-3'] },
    ],
    ijPercues: [
      // 2 docs - IJ CPAM
      { id: 'pgpa-ij-1', label: 'IJ Sécurité sociale', tiers: 'CPAM Gironde', periode: 'Mars 2023 - Sept 2024', periodeDebut: '15/03/2023', periodeFin: '12/09/2024', jours: 546, montantBrut: 12500, csgCrds: 850, montant: 11650, pieceIds: ['p-4', 'p-10'] },
      // 1 doc - IJ Prévoyance
      { id: 'pgpa-ij-2', label: 'IJ Prévoyance', tiers: 'AG2R', periode: 'Juil 2023 - Sept 2024', periodeDebut: '01/07/2023', periodeFin: '12/09/2024', jours: 439, montantBrut: 5200, csgCrds: 350, montant: 4850, pieceIds: ['p-13'] },
    ]
  });

  // ========== PGPF ==========
  const [pgpfData, setPgpfData] = useState({
    periodes: {}
  });

  // ========== DFT ==========
  const [dftLignes, setDftLignes] = useState([]);

  // (wizard supprimé - sera remplacé par flow création dossier)

  // ========== PERSISTENCE HELPERS ==========
  const EMPTY_DOSSIER = {
    victimeData: { nom: '', prenom: '', sexe: 'Homme', dateNaissance: '', dateDeces: null },
    faitGenerateur: { type: '', dateAccident: '', datePremiereConstatation: '', dateConsolidation: '', resume: '' },
    chiffrageParams: {
      dateOuverture: '', dateRapportExpertise: '', dateLiquidation: '', dateConsolidation: '',
      fractionIndemnisable: 100, tiersPayeurs: [],
      referentielSE: 'cours-appel-2024', referentielSEMode: 'maximum',
      baremeCapitalisation: 'gazette-palais-2025-0.5', referentielDFP: 'cours-appel-2024',
      baseJournaliereDFT: 33, forfaitHoraireATPT: null,
    },
    dossierStatut: 'ouvert', dossierRef: '', dossierIntitule: '', dossierDateOuverture: '',
    dossierAvocat: '', dossierNotes: '', resumeAffaire: '', commentaireExpertise: '',
    victimesIndirectes: [], pieces: [], dsaLignes: [],
    pgpaData: { periode: { debut: '', fin: '', mois: 0 }, revenuRef: { revalorisation: 'ipc-annuel', coefficientPerteChance: 100, lignes: [], total: 0 }, revenusPercus: [], ijPercues: [] },
    pgpfData: { periodes: {} }, dftLignes: [],
  };

  const collectCurrentDossierData = () => ({
    victimeData, faitGenerateur, chiffrageParams,
    dossierStatut, dossierRef, dossierIntitule, dossierDateOuverture, dossierAvocat, dossierNotes,
    resumeAffaire, commentaireExpertise, victimesIndirectes, pieces,
    dsaLignes, pgpaData, pgpfData, dftLignes,
  });

  const loadDossierData = (dossierId) => {
    const data = lsLoad(LS_DOSSIER + dossierId) || EMPTY_DOSSIER;
    setVictimeData(data.victimeData ?? EMPTY_DOSSIER.victimeData);
    setFaitGenerateur(data.faitGenerateur ?? EMPTY_DOSSIER.faitGenerateur);
    setChiffrageParams(data.chiffrageParams ?? EMPTY_DOSSIER.chiffrageParams);
    setDossierStatut(data.dossierStatut ?? 'ouvert');
    setDossierRef(data.dossierRef ?? '');
    setDossierIntitule(data.dossierIntitule ?? '');
    setDossierDateOuverture(data.dossierDateOuverture ?? '');
    setDossierAvocat(data.dossierAvocat ?? '');
    setDossierNotes(data.dossierNotes ?? '');
    setResumeAffaire(data.resumeAffaire ?? '');
    setCommentaireExpertise(data.commentaireExpertise ?? '');
    setVictimesIndirectes(data.victimesIndirectes ?? []);
    setPieces(data.pieces ?? []);
    setDsaLignes(data.dsaLignes ?? []);
    setPgpaData(data.pgpaData ?? EMPTY_DOSSIER.pgpaData);
    setPgpfData(data.pgpfData ?? EMPTY_DOSSIER.pgpfData);
    // Migration: fusionner anciens dfttLignes + dftpLignes si format legacy
    setDftLignes(data.dftLignes ?? [...(data.dfttLignes ?? []), ...(data.dftpLignes ?? [])]);
  };

  const saveDossierData = (dossierId) => {
    if (!dossierId) return;
    lsSave(LS_DOSSIER + dossierId, collectCurrentDossierData());
  };

  // ========== PERSISTENCE EFFECTS ==========

  // Init: restore from localStorage on mount
  useEffect(() => {
    const savedGlobal = lsLoad(LS_GLOBAL);
    if (savedGlobal) {
      setDossiers(savedGlobal.dossiers);
      setCurrentPage(savedGlobal.currentPage || 'list');
      setActiveDossierId(savedGlobal.activeDossierId);
      if (savedGlobal.navStack) setNavStack(savedGlobal.navStack);
      if (savedGlobal.activeDossierId && savedGlobal.currentPage === 'dossier') {
        loadDossierData(savedGlobal.activeDossierId);
      }
    } else {
      // First-ever load: seed dossier-1 mock data
      lsSave(LS_DOSSIER + 'dossier-1', collectCurrentDossierData());
      lsSave(LS_GLOBAL, { dossiers, activeDossierId: null, currentPage: 'list', navStack });
    }
    isInitialLoad.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-save current dossier data on any change
  useEffect(() => {
    if (isInitialLoad.current || !activeDossierId) return;
    saveDossierData(activeDossierId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDossierId, victimeData, faitGenerateur, chiffrageParams,
    dossierStatut, dossierRef, dossierIntitule, dossierDateOuverture, dossierAvocat, dossierNotes,
    resumeAffaire, commentaireExpertise, victimesIndirectes, pieces,
    dsaLignes, pgpaData, pgpfData, dftLignes]);

  // Auto-save global state
  useEffect(() => {
    if (isInitialLoad.current) return;
    lsSave(LS_GLOBAL, { dossiers, activeDossierId, currentPage, navStack });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dossiers, activeDossierId, currentPage, navStack]);

  // ========== CALCULS ==========
  const dsaTotal = dsaLignes.filter(l => l.status === 'validated').reduce((s, l) => s + (l.montant || 0), 0);
  
  const pgpaRevPercusTotal = pgpaData.revenusPercus.reduce((s, l) => s + l.montant, 0);
  const pgpaIjTotal = pgpaData.ijPercues.reduce((s, l) => s + l.montant, 0);
  const pgpaTotal = pgpaData.revenuRef.total > 0 ? Math.round((pgpaData.revenuRef.total / 12) * pgpaData.periode.mois - pgpaRevPercusTotal - pgpaIjTotal) : 0;
  
  const pgpfTotal = 0; // Sera calculé quand on aura des données
  const pgpfClTotal = 0; // PGPF Consolidation -> Liquidation (échu)
  const pgpfAlTotal = 0; // PGPF Après Liquidation (capitalisation)

  const dftTotal = dftLignes.reduce((s, l) => s + l.montant, 0);

  // Postes actifs = seulement ceux qui ont des données
  const activePostes = [
    dsaLignes.length > 0 && { id: 'dsa', title: 'DSA', fullTitle: 'Dépenses de Santé Actuelles', montant: dsaTotal, category: 'patrimoniaux-temp' },
    pgpaData.revenuRef.lignes.length > 0 && { id: 'pgpa', title: 'PGPA', fullTitle: 'Pertes de Gains Professionnels Actuels', montant: pgpaTotal, category: 'patrimoniaux-temp' },
    dftLignes.length > 0 && { id: 'dft', title: 'DFT', fullTitle: 'Déficit Fonctionnel Temporaire', montant: dftTotal, category: 'extra-patrimoniaux-temp' },
    Object.keys(pgpfData.periodes).length > 0 && { id: 'pgpf', title: 'PGPF', fullTitle: 'Pertes de Gains Professionnels Futurs', montant: pgpfTotal, category: 'patrimoniaux-perm' }
  ].filter(Boolean);

  // Postes suggérés désactivés (non modélisés, affichage uniquement)
  const disabledPostes = [
    { id: 'atpt', title: 'ATPT', fullTitle: 'Assistance Tierce Personne Temporaire', montant: 8400, category: 'patrimoniaux-temp', disabled: true, pieceIds: ['p-5'] },
    { id: 'pet', title: 'PET', fullTitle: 'Préjudice Esthétique Temporaire', montant: 2500, category: 'extra-patrimoniaux-temp', disabled: true, pieceIds: ['p-5'] },
    { id: 'se', title: 'SE', fullTitle: 'Souffrances Endurées', montant: 15000, category: 'extra-patrimoniaux-temp', disabled: true, pieceIds: ['p-5'] },
  ];

  const allPostes = [...activePostes, ...disabledPostes];

  const categories = [
    { id: 'patrimoniaux-temp', title: 'Préjudices Patrimoniaux Temporaires', postes: allPostes.filter(p => p.category === 'patrimoniaux-temp') },
    { id: 'extra-patrimoniaux-temp', title: 'Préjudices Extra-Patrimoniaux Temporaires', postes: allPostes.filter(p => p.category === 'extra-patrimoniaux-temp') },
    { id: 'patrimoniaux-perm', title: 'Préjudices Patrimoniaux Permanents', postes: allPostes.filter(p => p.category === 'patrimoniaux-perm') }
  ];

  const totalChiffrage = allPostes.filter(p => !p.disabled).reduce((s, p) => s + p.montant, 0);

  // ========== HELPERS ==========
  const currentLevel = navStack[navStack.length - 1];

  const fmt = (n) => n != null ? n.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + ' €' : '— €';
  const getPieceLabel = (pieceId) => {
    const idx = pieces.findIndex(p => p.id === pieceId);
    return idx >= 0 ? `P${idx + 1}` : '?';
  };
  const getPiece = (pieceId) => pieces.find(p => p.id === pieceId);

  const getFilteredTaxonomy = () => {
    const search = searchPostes.trim().toLowerCase();
    if (!search) return POSTES_TAXONOMY;
    return POSTES_TAXONOMY.map(section => ({
      ...section,
      categories: section.categories.map(cat => ({
        ...cat,
        postes: cat.postes.filter(p =>
          p.label.toLowerCase().includes(search) ||
          (p.acronym && p.acronym.toLowerCase().includes(search))
        )
      })).filter(cat => cat.postes.length > 0)
    })).filter(section => section.categories.length > 0);
  };

  const getPosteMontant = (posteId) => {
    const poste = allPostes.find(p => p.id === posteId);
    return poste ? poste.montant : null;
  };

  // ========== PIECES HELPERS ==========
  const getTypeColor = (type) => {
    const colors = {
      'Facture': 'bg-blue-100 text-blue-700',
      'Bulletin': 'bg-green-100 text-green-700',
      'Attestation': 'bg-purple-100 text-purple-700',
      'Expertise': 'bg-amber-100 text-amber-700',
      'Imagerie': 'bg-pink-100 text-pink-700',
      'Ordonnance': 'bg-cyan-100 text-cyan-700'
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  const getPieceUsage = (pieceId) => {
    const usages = [];
    if (dsaLignes.some(l => l.pieceIds?.includes(pieceId))) usages.push('DSA');
    if (pgpaData.revenuRef.lignes.some(l => l.pieceIds?.includes(pieceId))) usages.push('PGPA');
    if (pgpaData.revenusPercus.some(l => l.pieceIds?.includes(pieceId))) usages.push('PGPA');
    if (pgpaData.ijPercues.some(l => l.pieceIds?.includes(pieceId))) usages.push('PGPA');
    if (dftLignes.some(l => l.pieceIds?.includes(pieceId))) usages.push('DFT');
    return [...new Set(usages)];
  };

  const sortPiecesByDate = (piecesArray) => {
    return [...piecesArray].sort((a, b) => {
      const parseDate = (d) => { const [day, month, year] = d.split('/'); return new Date(year, month - 1, day); };
      return parseDate(a.date) - parseDate(b.date);
    });
  };

  // ========== PIECES LIST COMPONENT ==========
  const renderPiecesList = (piecesArray, showUploadZone = true) => {
    const sortedPieces = sortPiecesByDate(piecesArray);
    
    return (
      <div className="space-y-4">
        {/* Header avec upload */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">{piecesArray.length} pièce{piecesArray.length > 1 ? 's' : ''}</span>
          {showUploadZone && (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                Array.from(e.dataTransfer.files).forEach(file => {
                  const newPiece = {
                    id: `p-${Date.now()}-${Math.random()}`,
                    nom: file.name,
                    nomOriginal: file.name,
                    intitule: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
                    date: new Date().toLocaleDateString('fr-FR'),
                    type: file.name.toLowerCase().includes('facture') ? 'Facture' 
                      : file.name.toLowerCase().includes('bulletin') ? 'Bulletin'
                      : file.name.toLowerCase().includes('ordo') ? 'Ordonnance'
                      : file.name.toLowerCase().includes('irm') || file.name.toLowerCase().includes('radio') ? 'Imagerie'
                      : 'Document',
                    used: false
                  };
                  setPieces(prev => [...prev, newPiece]);
                });
              }}
              className={`flex items-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
            >
              <Upload className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Déposer des documents</span>
            </div>
          )}
        </div>
        
        {/* Liste des pièces */}
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">N°</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Utilisé dans</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sortedPieces.map((piece) => {
                const globalIndex = pieces.findIndex(p => p.id === piece.id) + 1;
                const usages = getPieceUsage(piece.id);
                return (
                  <tr 
                    key={piece.id} 
                    className="hover:bg-gray-50 cursor-pointer group"
                    onClick={() => setEditPanel({ type: 'piece-detail', data: { ...piece, index: globalIndex, usages } })}
                  >
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 text-gray-700 text-sm font-medium rounded group-hover:bg-blue-100 group-hover:text-blue-700">
                        P{globalIndex}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <span className="font-medium text-gray-900">{piece.intitule || piece.nom.replace(/\.[^/.]+$/, '')}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(piece.type)}`}>
                        {piece.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {usages.length > 0 ? (
                        <div className="flex items-center gap-1">
                          {usages.map(u => (
                            <span key={u} className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">{u}</span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">Non utilisé</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const tabsConfig = { dossier: ['Détail', 'Chiffrage', 'Pièces'], poste: [] };
  const currentTabs = tabsConfig[currentLevel.type] || [];
  const getSiblings = () => currentLevel.type === 'poste' ? allPostes.filter(p => p.id !== currentLevel.id && !p.disabled) : [];

  // ========== NAVIGATION ==========
  const navigateTo = (item) => setNavStack([...navStack, { ...item, type: item.type || 'poste', activeTab: tabsConfig[item.type]?.[0]?.toLowerCase() }]);
  const navigateToStackLevel = (index) => setNavStack(navStack.slice(0, index + 1));
  const navigateToSibling = (sibling) => {
    const newStack = [...navStack];
    newStack[newStack.length - 1] = { ...sibling, type: 'poste' };
    setNavStack(newStack);
  };
  const setActiveTab = (tab) => {
    const newStack = [...navStack];
    newStack[newStack.length - 1].activeTab = tab.toLowerCase();
    setNavStack(newStack);
  };
  const toggleCategory = (id) => setExpandedCategories(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  const toggleSection = (id) => setExpandedSections(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);

  // ========== DOCUMENT DETECTION HELPERS ==========
  const detectDocumentType = (fileName) => {
    const ln = fileName.toLowerCase();

    // Détection explicite par mots-clés
    if (ln.includes('rapport') || ln.includes('expertise') || ln.includes('medical') || ln.includes('expert')) {
      return { type: 'rapport', suggestedName: 'Rapport d\'expertise médicale', confidence: 96 };
    }
    if (ln.includes('facture') || ln.includes('fact_') || ln.includes('invoice') || ln.includes('note_honoraires')) {
      return { type: 'facture', suggestedName: 'Facture médicale', confidence: 94 };
    }
    if (ln.includes('ordonnance') || ln.includes('prescription') || ln.includes('ordo')) {
      return { type: 'ordonnance', suggestedName: 'Ordonnance médicale', confidence: 92 };
    }
    if (ln.includes('bulletin') || ln.includes('salaire') || ln.includes('paie') || ln.includes('fiche_paie')) {
      return { type: 'bulletin', suggestedName: 'Bulletin de salaire', confidence: 95 };
    }
    if (ln.includes('arret') || ln.includes('travail') || ln.includes('itt') || ln.includes('certificat')) {
      return { type: 'arret', suggestedName: 'Arrêt de travail', confidence: 91 };
    }
    if (ln.includes('radio') || ln.includes('irm') || ln.includes('scanner') || ln.includes('imagerie')) {
      return { type: 'imagerie', suggestedName: 'Imagerie médicale', confidence: 89 };
    }
    if (ln.includes('kine') || ln.includes('kiné') || ln.includes('reeducation') || ln.includes('seance')) {
      return { type: 'reeducation', suggestedName: 'Facture kinésithérapie', confidence: 90 };
    }

    // Détection "intelligente" basée sur patterns de nommage courants
    // Simule une vraie IA qui infère le type même sans mots-clés explicites
    const ext = ln.split('.').pop();
    const nameWithoutExt = ln.replace(/\.[^/.]+$/, '');

    // Si le nom contient des dates ou numéros, probablement une facture
    if (/\d{2}[_-]\d{2}[_-]\d{4}/.test(nameWithoutExt) || /\d{6,}/.test(nameWithoutExt)) {
      return { type: 'facture', suggestedName: 'Facture (détectée par pattern)', confidence: 78 };
    }

    // Si PDF et nom court/générique, supposer rapport d'expertise (document principal)
    if (ext === 'pdf' && nameWithoutExt.length < 20) {
      return { type: 'rapport', suggestedName: 'Rapport d\'expertise (inféré)', confidence: 72 };
    }

    // Si image, probablement imagerie médicale
    if (['jpg', 'jpeg', 'png', 'dicom'].includes(ext)) {
      return { type: 'imagerie', suggestedName: 'Imagerie médicale (image)', confidence: 85 };
    }

    // Fallback intelligent : assigner un type basé sur position dans upload
    // Premier fichier = rapport, suivants = factures
    const fallbackTypes = ['rapport', 'facture', 'bulletin', 'ordonnance', 'facture'];
    const fallbackNames = ['Rapport d\'expertise', 'Facture médicale', 'Bulletin de salaire', 'Ordonnance', 'Facture complémentaire'];
    const hashIndex = Math.abs(fileName.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % fallbackTypes.length;

    return {
      type: fallbackTypes[hashIndex],
      suggestedName: fallbackNames[hashIndex] + ' (auto-détecté)',
      confidence: 65 + Math.floor(Math.random() * 15)
    };
  };

  const handleStartExtraction = async () => {
    const formData = {};
    const uploadedFiles = [];

    // Utiliser les fichiers capturés au début (déjà avec types assignés)
    const currentFiles = uploadedFiles;

    // Trouver le rapport d'expertise - avec fallback sur premier PDF ou premier fichier
    const rapportFile = currentFiles.find(f => f.type === 'rapport')
      || currentFiles.find(f => f.originalName?.toLowerCase().endsWith('.pdf'))
      || currentFiles[0];

    // Toujours générer des données IA si on a au moins un fichier
    const extractedData = currentFiles.length > 0
      ? simulateRapportExtraction(rapportFile?.name || 'document.pdf')
      : getDefaultExtractedData();

    // Appliquer les données extraites au dossier

    // Ajouter les lignes DSA
    if (extractedData?.dsaLines?.length > 0) {
      setDsaLignes(prev => [
        ...extractedData.dsaLines.map(line => ({
          ...line,
          pieceIds: [],
          dejaRembourse: 0
        })),
        ...prev
      ]);
    }

    // Ajouter les périodes DFT avec pièce rapport d'expertise
    if (extractedData?.dftPeriods?.length > 0) {
      setDftLignes(prev => [
        ...extractedData.dftPeriods.map(p => ({ ...p, pieceIds: ['p-5'] })),
        ...prev
      ]);
    }

    // Ajouter les données PGPA
    if (extractedData?.pgpaData) {
      const pgpa = extractedData.pgpaData;
      setPgpaData(prev => ({
        periode: pgpa.periode || prev.periode,
        revenuRef: {
          revalorisation: pgpa.revenuRef?.revalorisation || prev.revenuRef.revalorisation,
          total: pgpa.revenuRef?.total || 0,
          lignes: [
            ...(pgpa.revenuRef?.lignes || []),
            ...prev.revenuRef.lignes.filter(l => !l.status || l.status !== 'ai-suggested')
          ]
        },
        revenusPercus: [
          ...(pgpa.revenusPercus || []),
          ...prev.revenusPercus.filter(l => !l.status || l.status !== 'ai-suggested')
        ],
        ijPercues: [
          ...(pgpa.ijPercues || []),
          ...prev.ijPercues.filter(l => !l.status || l.status !== 'ai-suggested')
        ]
      }));
    }

    // Créer les pièces
    if (currentFiles?.length > 0) {
      currentFiles.forEach(file => {
        const newPieceId = `p-${Date.now()}-${Math.random()}`;
        setPieces(prev => [...prev, {
          id: newPieceId,
          nom: file.name,
          date: new Date().toLocaleDateString('fr-FR'),
          type: file.type === 'rapport' ? 'Rapport expertise' : 'Document',
          used: true
        }]);
      });
    }

    // Update dossier-level resume/expertise from extracted data
    if (extractedData?.resumeAffaire) {
      setResumeAffaire(extractedData.resumeAffaire);
    }
    if (extractedData?.commentaireExpertise) {
      setCommentaireExpertise(extractedData.commentaireExpertise);
    }

    // Navigate to dossier chiffrage tab after extraction
    setTimeout(() => {
      setNavStack(prev => [
        { ...prev[0], activeTab: 'chiffrage' }
      ]);
    }, 500);
  };

  const getDefaultExtractedData = () => ({
    resumeAffaire: '',
    commentaireExpertise: '',
    dateConsolidation: '',
    tauxAIPP: null,
    dsaLines: [],
    dftPeriods: [],
    dfpData: null
  });

  const simulateRapportExtraction = (fileName) => {
    // Simulation réaliste d'extraction IA depuis un rapport d'expertise
    const timestamp = Date.now();
    return {
      resumeAffaire: `M. Jean Dupont, âgé de 42 ans, mécanicien automobile, a été victime d'un accident de la circulation le 15 mars 2023. Alors qu'il circulait sur son scooter, il a été percuté par un véhicule qui n'a pas respecté un stop. Il a subi un traumatisme du genou gauche avec rupture du ligament croisé antérieur, nécessitant une intervention chirurgicale et une longue rééducation.`,

      commentaireExpertise: `L'expert, le Dr Martin, retient une consolidation au 12 septembre 2024. Il note des séquelles fonctionnelles significatives avec limitation de la flexion du genou gauche, douleurs résiduelles à la marche prolongée et à la montée des escaliers. Le retentissement professionnel est important, la victime ne pouvant plus exercer son métier de mécanicien nécessitant des positions accroupies prolongées. Un reclassement professionnel est préconisé.`,

      dateConsolidation: '12/09/2024',
      tauxAIPP: 15,

      // Postes DSA suggérés (Dépenses de Santé Actuelles)
      dsaLines: [
        {
          id: `dsa-ai-${timestamp}-1`,
          label: 'Hospitalisation initiale - CHU Bordeaux',
          type: 'Hospitalisation',
          date: '15/03/2023',
          montant: 2850,
          tiers: 'CHU Bordeaux',
          confidence: 94,
          status: 'ai-suggested'
        },
        {
          id: `dsa-ai-${timestamp}-2`,
          label: 'Intervention chirurgicale LCA',
          type: 'Hospitalisation',
          date: '28/03/2023',
          montant: 4200,
          tiers: 'Clinique du Sport',
          confidence: 91,
          status: 'ai-suggested'
        },
        {
          id: `dsa-ai-${timestamp}-3`,
          label: 'Consultation orthopédique post-op',
          type: 'Consultation',
          date: '10/04/2023',
          montant: 60,
          tiers: 'Dr Leblanc',
          confidence: 93,
          status: 'ai-suggested'
        },
        {
          id: `dsa-ai-${timestamp}-4`,
          label: 'Séances kinésithérapie (45 séances)',
          type: 'Rééducation',
          date: '2023-2024',
          montant: 1800,
          tiers: 'Cabinet Kiné Martin',
          confidence: 88,
          status: 'ai-suggested'
        },
        {
          id: `dsa-ai-${timestamp}-5`,
          label: 'IRM de contrôle genou',
          type: 'Imagerie',
          date: '15/06/2023',
          montant: 380,
          tiers: 'Centre Imagerie Bordeaux',
          confidence: 92,
          status: 'ai-suggested'
        },
        {
          id: `dsa-ai-${timestamp}-6`,
          label: 'Médicaments anti-inflammatoires',
          type: 'Pharmacie',
          date: '03/2023 - 09/2024',
          montant: 245,
          tiers: 'Pharmacie des Lilas',
          confidence: 78,
          status: 'ai-suggested'
        },
        {
          id: `dsa-ai-${timestamp}-7`,
          label: 'Attelle de genou post-opératoire',
          type: 'Appareillage',
          date: '30/03/2023',
          montant: 180,
          tiers: 'Orthopédie Plus',
          confidence: 85,
          status: 'ai-suggested'
        },
        {
          id: `dsa-ai-${timestamp}-8`,
          label: 'Consultations Dr Martin (suivi)',
          type: 'Consultation',
          date: '2023-2024',
          montant: 300,
          tiers: 'Dr Martin',
          confidence: 87,
          status: 'ai-suggested'
        }
      ],

      // Périodes DFT (toutes incapacités temporaires)
      dftPeriods: [
        {
          id: `dft-ai-${timestamp}-1`,
          label: 'Hospitalisation initiale',
          debut: '15/03/2023',
          fin: '22/03/2023',
          jours: 8,
          taux: 100,
          montant: 200,
          confidence: 96,
          status: 'ai-suggested'
        },
        {
          id: `dft-ai-${timestamp}-2`,
          label: 'Hospitalisation chirurgie',
          debut: '28/03/2023',
          fin: '02/04/2023',
          jours: 6,
          taux: 100,
          montant: 150,
          confidence: 94,
          status: 'ai-suggested'
        },
        {
          id: `dft-ai-${timestamp}-3`,
          label: 'Alitement strict post-op',
          debut: '03/04/2023',
          fin: '15/04/2023',
          jours: 13,
          taux: 100,
          montant: 325,
          confidence: 91,
          status: 'ai-suggested'
        },
        {
          id: `dft-ai-${timestamp}-4`,
          label: 'Convalescence post-opératoire',
          debut: '16/04/2023',
          fin: '30/06/2023',
          jours: 76,
          taux: 50,
          montant: 950,
          confidence: 89,
          status: 'ai-suggested'
        },
        {
          id: `dft-ai-${timestamp}-5`,
          label: 'Rééducation active intensive',
          debut: '01/07/2023',
          fin: '30/09/2023',
          jours: 92,
          taux: 40,
          montant: 920,
          confidence: 86,
          status: 'ai-suggested'
        },
        {
          id: `dft-ai-${timestamp}-6`,
          label: 'Rééducation d\'entretien',
          debut: '01/10/2023',
          fin: '31/12/2023',
          jours: 92,
          taux: 25,
          montant: 575,
          confidence: 84,
          status: 'ai-suggested'
        },
        {
          id: `dft-ai-${timestamp}-7`,
          label: 'Gêne résiduelle pré-consolidation',
          debut: '01/01/2024',
          fin: '12/09/2024',
          jours: 256,
          taux: 15,
          montant: 960,
          confidence: 82,
          status: 'ai-suggested'
        }
      ],

      // DFP (permanent)
      dfpData: {
        taux: 15,
        ageConsolidation: 43,
        pointValue: 1580,
        montantTotal: 23700,
        confidence: 92,
        status: 'ai-suggested'
      },

      // PGPA (Pertes de Gains Professionnels Actuels)
      pgpaData: {
        periode: {
          debut: '15/03/2023',
          fin: '12/09/2024',
          mois: 18
        },
        revenuRef: {
          revalorisation: 4,
          total: 36240,
          lignes: [
            {
              id: `pgpa-ai-rev-${timestamp}-1`,
              type: 'revenu',
              label: 'Salaire net imposable',
              annee: '2022',
              montant: 32400,
              revalorise: 33696,
              aRevaloriser: true,
              pieceIds: [],
              confidence: 91,
              status: 'ai-suggested'
            },
            {
              id: `pgpa-ai-rev-${timestamp}-2`,
              type: 'revenu',
              label: 'Salaire net imposable',
              annee: '2021',
              montant: 30800,
              revalorise: 33264,
              aRevaloriser: true,
              pieceIds: [],
              confidence: 88,
              status: 'ai-suggested'
            },
            {
              id: `pgpa-ai-gain-${timestamp}-1`,
              type: 'gain',
              label: 'Prime annuelle',
              annee: '2022',
              montant: 2400,
              revalorise: 2496,
              aRevaloriser: true,
              pieceIds: [],
              confidence: 85,
              status: 'ai-suggested'
            },
            {
              id: `pgpa-ai-gain-${timestamp}-2`,
              type: 'gain',
              label: 'Heures supplémentaires',
              annee: '2022',
              montant: 1600,
              revalorise: 1664,
              aRevaloriser: true,
              pieceIds: [],
              confidence: 79,
              status: 'ai-suggested'
            }
          ]
        },
        revenusPercus: [
          {
            id: `pgpa-ai-percu-${timestamp}-1`,
            label: 'Maintien partiel salaire employeur',
            periode: 'Mars - Juin 2023',
            periodeDebut: '15/03/2023',
            periodeFin: '30/06/2023',
            dureeJours: 107,
            montant: 8500,
            tiers: 'Employeur',
            pieceIds: [],
            confidence: 87,
            status: 'ai-suggested'
          }
        ],
        ijPercues: [
          {
            id: `pgpa-ai-ij-${timestamp}-1`,
            label: 'Indemnités journalières CPAM',
            tiers: 'CPAM Gironde',
            periode: 'Mars 2023 - Sept 2024',
            periodeDebut: '15/03/2023',
            periodeFin: '12/09/2024',
            jours: 546,
            montantBrut: 12500,
            csgCrds: 850,
            montant: 11650,
            pieceIds: [],
            confidence: 93,
            status: 'ai-suggested'
          },
          {
            id: `pgpa-ai-ij-${timestamp}-2`,
            label: 'Complément prévoyance AG2R',
            tiers: 'AG2R La Mondiale',
            periode: 'Juillet 2023 - Sept 2024',
            periodeDebut: '01/07/2023',
            periodeFin: '12/09/2024',
            jours: 439,
            montantBrut: 5200,
            csgCrds: 350,
            montant: 4850,
            pieceIds: [],
            confidence: 81,
            status: 'ai-suggested'
          }
        ]
      }
    };
  };

  // (handleCreateProcedureFromWizard supprimé - wizard supprimé)

  // ========== ACTIONS IA — Génération à la demande ==========
  const handleGenerateResume = async () => {
    setAiGenerating('resume');
    await new Promise(r => setTimeout(r, 2000));
    setFaitGenerateur(prev => ({
      ...prev,
      resume: `M. ${victimeData.prenom} ${victimeData.nom}, ${victimeData.sexe === 'Homme' ? 'âgé' : 'âgée'} de ${calcAge(victimeData.dateNaissance)} ans, a été victime d'un ${faitGenerateur.type.toLowerCase()} survenu le ${faitGenerateur.dateAccident}. L'accident a entraîné un traumatisme nécessitant une prise en charge médicale immédiate avec hospitalisation. La consolidation a été fixée au ${faitGenerateur.dateConsolidation || '[date à préciser]'}.`
    }));
    setAiGenerating(null);
  };

  const handleGenerateExpertise = async () => {
    setAiGenerating('expertise');
    await new Promise(r => setTimeout(r, 2500));
    setCommentaireExpertise(`L'expert judiciaire a examiné ${victimeData.sexe === 'Homme' ? 'M.' : 'Mme'} ${victimeData.prenom} ${victimeData.nom} et retenu une consolidation au ${faitGenerateur.dateConsolidation || '[date à préciser]'}. Les séquelles fonctionnelles persistent avec des limitations dans les activités quotidiennes. Le déficit fonctionnel permanent est évalué. L'expert note un retentissement professionnel significatif sur l'activité antérieure.`);
    setAiGenerating(null);
  };

  // ========== CRÉATION DOSSIER ==========
  const handleCreateDossier = (formData, activeTab = 'chiffrage') => {
    // Save current dossier before creating new one
    if (activeDossierId) saveDossierData(activeDossierId);

    const newId = `dossier-${Date.now()}`;

    setDossiers(prev => [{
      id: newId,
      reference: `${formData.nom} ${formData.prenom}`,
      typeFait: formData.typeFait,
      date: formData.dateAccident,
      lastEditBy: 'Meghan R.',
      lastEditDate: new Date().toLocaleDateString('fr-FR')
    }, ...prev]);

    setVictimeData({
      nom: formData.nom,
      prenom: formData.prenom,
      sexe: formData.sexe,
      dateNaissance: formData.dateNaissance,
      dateDeces: formData.dateDeces || null
    });
    setFaitGenerateur({
      type: formData.typeFait,
      dateAccident: formData.dateAccident,
      datePremiereConstatation: formData.dateAccident,
      dateConsolidation: formData.dateConsolidation,
      resume: ''
    });
    setChiffrageParams(prev => ({
      ...EMPTY_DOSSIER.chiffrageParams,
      ...(formData.dateConsolidation ? { dateConsolidation: formData.dateConsolidation } : {}),
      ...(formData.dateLiquidation ? { dateLiquidation: formData.dateLiquidation } : {})
    }));
    setDossierStatut('ouvert');
    setDossierRef('');
    setDossierIntitule(`${formData.nom} ${formData.prenom}`);
    setDossierDateOuverture(new Date().toLocaleDateString('fr-FR'));
    setDossierAvocat('');
    setDossierNotes('');
    setCommentaireExpertise('');
    setResumeAffaire('');
    setVictimesIndirectes([]);
    setPieces([]);
    setDsaLignes([]);
    setDftLignes([]);
    setPgpaData({ periode: { debut: '', fin: '', mois: 0 }, revenuRef: { revalorisation: 'ipc-annuel', coefficientPerteChance: 100, lignes: [], total: 0 }, revenusPercus: [], ijPercues: [] });
    setPgpfData({ periodes: {} });

    setNavStack([{ id: newId, type: 'dossier', title: `${formData.nom} ${formData.prenom}`, activeTab }]);
    setActiveDossierId(newId);
    setCurrentPage('dossier');
    setCreationWizard(null);
  };

  // ========== EXTRACTION DEPUIS EMPTY STATE ==========
  const [extractionState, setExtractionState] = useState(null); // { phase, progress }

  const handleDocumentUploadForExtraction = async (files) => {
    const fileList = Array.from(files);
    if (fileList.length === 0) return;

    // Démarrer l'extraction avec UI de progression
    setExtractionState({ phase: 'upload', progress: 0 });

    // Simuler l'upload
    await new Promise(r => setTimeout(r, 800));
    setExtractionState({ phase: 'analyse', progress: 20 });

    // Simuler l'OCR
    await new Promise(r => setTimeout(r, 1200));
    setExtractionState({ phase: 'ocr', progress: 40 });

    // Simuler l'extraction
    await new Promise(r => setTimeout(r, 1500));
    setExtractionState({ phase: 'extraction', progress: 60 });

    // Simuler la génération des postes
    await new Promise(r => setTimeout(r, 1200));
    setExtractionState({ phase: 'postes', progress: 80 });

    // Générer les données extraites
    const extractedData = simulateRapportExtraction(fileList[0].name);
    const timestamp = Date.now();

    // Ajouter les pièces uploadées (rapport)
    const uploadedPieceIds = [];
    fileList.forEach(file => {
      const detected = detectDocumentType(file.name);
      const newPieceId = `p-${timestamp}-${Math.random()}`;
      uploadedPieceIds.push(newPieceId);
      setPieces(prev => [...prev, {
        id: newPieceId,
        nom: detected.suggestedName,
        intitule: detected.suggestedName,
        originalName: file.name,
        date: new Date().toLocaleDateString('fr-FR'),
        type: detected.type === 'rapport' ? 'Expertise' : 'Document',
        confidence: detected.confidence,
        used: true
      }]);
    });

    // Ajouter les périodes DFT avec pièce rapport
    if (extractedData?.dftPeriods?.length > 0) {
      setDftLignes(prev => [
        ...extractedData.dftPeriods.map(p => ({ ...p, pieceIds: [uploadedPieceIds[0]] })),
        ...prev
      ]);
    }

    // Finaliser
    await new Promise(r => setTimeout(r, 500));
    setExtractionState({ phase: 'done', progress: 100 });

    // Reset après 1s
    await new Promise(r => setTimeout(r, 1000));
    setExtractionState(null);
  };

  // ========== DSA HANDLERS ==========
  const simulateExtraction = (fileName) => {
    const ln = fileName.toLowerCase();
    if (ln.includes('pharmacie') || ln.includes('ordonnance')) return { status: 'success', confidence: 94, data: { label: 'Pharmacie - Médicaments', type: 'Pharmacie', date: '12/11/2024', montant: 87.50, tiers: 'Pharmacie des Lilas' }};
    if (ln.includes('radio') || ln.includes('irm')) return { status: 'success', confidence: 89, data: { label: 'IRM genou', type: 'Imagerie', date: '03/10/2024', montant: 320, tiers: 'Centre Imagerie' }};
    if (ln.includes('kine') || ln.includes('kiné')) return { status: 'success', confidence: 91, data: { label: 'Kinésithérapie (10 séances)', type: 'Rééducation', date: '15/10/2024', montant: 400, tiers: 'Cabinet Kiné' }};
    if (ln.includes('flou') || ln.includes('illisible')) return { status: 'partial', confidence: 35, data: {}, warnings: ['Document illisible', 'Aucune donnée extraite'] };
    if (ln.includes('erreur') || ln.includes('corrupt')) return { status: 'error', error: 'Impossible de lire le fichier' };
    const fallbackPool = [
      { label: 'Consultation spécialiste', type: 'Consultation', date: '15/09/2024', montant: 75, tiers: 'Dr Martin' },
      { label: 'Séance ostéopathie', type: 'Rééducation', date: '22/10/2024', montant: 60, tiers: 'Cabinet Ostéo' },
      { label: 'Analyses biologiques', type: 'Biologie', date: '08/11/2024', montant: 145.30, tiers: 'Laboratoire Central' },
      { label: 'Transport médical (taxi)', type: 'Transport', date: '03/10/2024', montant: 42, tiers: 'Taxi Médical' },
    ];
    const fb = fallbackPool[Math.floor(Math.random() * fallbackPool.length)];
    return { status: 'success', confidence: 82, data: fb };
  };

  const handleUploadPieceForPanel = (files) => {
    for (const file of Array.from(files)) {
      const newPieceId = `p-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setPieces(prev => [...prev, {
        id: newPieceId,
        nom: file.name,
        nomOriginal: file.name,
        intitule: file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '),
        date: new Date().toLocaleDateString('fr-FR'),
        type: 'Document',
        used: true
      }]);
      setEditingPieceIds(prev => [...prev, newPieceId]);
    }
  };

  const handleUploadFiles = async (files, posteType) => {
    setShowAddModal(null);
    for (const file of Array.from(files)) {
      const procId = `proc-${Date.now()}-${Math.random()}`;
      setProcessing(prev => [...prev, { id: procId, name: file.name, phase: 'upload' }]);
      await new Promise(r => setTimeout(r, 600));
      setProcessing(prev => prev.map(p => p.id === procId ? { ...p, phase: 'extracting' } : p));
      await new Promise(r => setTimeout(r, 1200));
      
      const result = simulateExtraction(file.name);
      const newPieceId = `p-${Date.now()}`;
      setPieces(prev => [...prev, { id: newPieceId, nom: file.name, date: new Date().toLocaleDateString('fr-FR'), type: 'Document', used: true }]);
      
      if (posteType === 'dsa') {
        const hasAllData = result.data?.label && result.data?.type && result.data?.date && result.data?.montant;
        setDsaLignes(prev => [{
          id: `dsa-${Date.now()}`,
          status: result.status === 'error' ? 'error' : hasAllData ? 'ai-suggested' : 'pending',
          fileName: file.name,
          pieceIds: [newPieceId],
          confidence: result.confidence,
          warnings: result.warnings,
          error: result.error,
          label: result.data?.label || null,
          type: result.data?.type || null,
          date: result.data?.date || null,
          montant: result.data?.montant || null,
          tiers: result.data?.tiers || null,
          dejaRembourse: 0
        }, ...prev]);
      }
      else if (posteType === 'pgpa-revenu-ref') {
        const mockRevRef = [
          { label: 'Salaire net imposable', type: 'revenu', montant: 32000 + Math.round(Math.random() * 6000), confidence: 91 },
          { label: 'Prime annuelle', type: 'gain', montant: 1500 + Math.round(Math.random() * 1500), confidence: 87 },
          { label: 'Heures supplémentaires', type: 'gain', montant: 800 + Math.round(Math.random() * 1200), confidence: 83 },
        ];
        const mock = mockRevRef[Math.floor(Math.random() * mockRevRef.length)];
        const annee = (new Date().getFullYear() - 1 - Math.floor(Math.random() * 2)) + '';
        setPgpaData(prev => ({
          ...prev,
          revenuRef: {
            ...prev.revenuRef,
            lignes: [{
              id: `pgpa-rev-${Date.now()}`,
              type: mock.type,
              status: 'ai-suggested',
              label: mock.label,
              annee,
              montant: mock.montant,
              revalorise: Math.round(mock.montant * 1.04),
              aRevaloriser: true,
              pieceIds: [newPieceId],
              confidence: mock.confidence
            }, ...prev.revenuRef.lignes],
            total: prev.revenuRef.total + mock.montant
          }
        }));
      }
      else if (posteType === 'pgpa-revenu-percu') {
        const mockRevPercu = [
          { label: 'Maintien de salaire employeur', montant: 8500, tiers: 'Employeur', dureeJours: 107, confidence: 88 },
          { label: 'Salaire partiel pendant arrêt', montant: 4200, tiers: 'Employeur', dureeJours: 75, confidence: 85 },
        ];
        const mock = mockRevPercu[Math.floor(Math.random() * mockRevPercu.length)];
        setPgpaData(prev => ({
          ...prev,
          revenusPercus: [{
            id: `pgpa-percu-${Date.now()}`,
            status: 'ai-suggested',
            label: mock.label,
            periode: 'Mars - Juin 2023',
            periodeDebut: '15/03/2023',
            periodeFin: '30/06/2023',
            dureeJours: mock.dureeJours,
            montant: mock.montant,
            tiers: mock.tiers,
            pieceIds: [newPieceId],
            confidence: mock.confidence
          }, ...prev.revenusPercus]
        }));
      }
      else if (posteType === 'pgpa-ij') {
        const mockIJ = [
          { label: 'IJ Sécurité sociale', tiers: 'CPAM', montantBrut: 12500, jours: 546, confidence: 90 },
          { label: 'IJ Prévoyance complémentaire', tiers: 'AG2R', montantBrut: 5200, jours: 439, confidence: 86 },
        ];
        const mock = mockIJ[Math.floor(Math.random() * mockIJ.length)];
        const csgCrds = Math.round(mock.montantBrut * 0.067);
        setPgpaData(prev => ({
          ...prev,
          ijPercues: [{
            id: `pgpa-ij-${Date.now()}`,
            status: 'ai-suggested',
            label: mock.label,
            tiers: mock.tiers,
            periode: 'Mars 2023 - Sept 2024',
            periodeDebut: '15/03/2023',
            periodeFin: '12/09/2024',
            jours: mock.jours,
            montantBrut: mock.montantBrut,
            csgCrds: csgCrds,
            montant: mock.montantBrut - csgCrds,
            pieceIds: [newPieceId],
            confidence: mock.confidence
          }, ...prev.ijPercues]
        }));
      }
      else if (posteType === 'dft') {
        const mockDft = [
          { label: 'Hospitalisation', jours: 8, taux: 100, confidence: 94 },
          { label: 'Alitement strict post-opératoire', jours: 13, taux: 100, confidence: 91 },
          { label: 'Hospitalisation chirurgie', jours: 6, taux: 100, confidence: 88 },
          { label: 'Convalescence post-opératoire', jours: 76, taux: 50, confidence: 89 },
          { label: 'Rééducation active intensive', jours: 92, taux: 40, confidence: 86 },
          { label: 'Gêne résiduelle pré-consolidation', jours: 256, taux: 15, confidence: 82 },
        ];
        const mock = mockDft[Math.floor(Math.random() * mockDft.length)];
        const baseJ = chiffrageParams.baseJournaliereDFT || 33;
        setDftLignes(prev => [{
          id: `dft-${Date.now()}`,
          status: 'ai-suggested',
          label: mock.label,
          debut: '15/03/2023',
          fin: (() => { const d = new Date(2023, 2, 15 + mock.jours); return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`; })(),
          jours: mock.jours,
          taux: mock.taux,
          montant: Math.round(mock.jours * baseJ * mock.taux / 100),
          pieceIds: [newPieceId],
          confidence: mock.confidence
        }, ...prev]);
      }
      setProcessing(prev => prev.filter(p => p.id !== procId));
    }
  };

  const handleAddFromPiece = (piece, posteType) => {
    setShowAddModal(null);
    if (posteType === 'dsa') {
      const result = simulateExtraction(piece.nom);
      const hasAllData = result.data?.label && result.data?.type && result.data?.date && result.data?.montant;
      setDsaLignes(prev => [{
        id: `dsa-${Date.now()}`,
        status: hasAllData ? 'ai-suggested' : 'pending',
        fileName: piece.nom,
        pieceIds: [piece.id],
        confidence: result.confidence,
        warnings: result.warnings,
        label: result.data?.label || null,
        type: result.data?.type || null,
        date: result.data?.date || null,
        montant: result.data?.montant || null,
        tiers: result.data?.tiers || null,
        dejaRembourse: 0
      }, ...prev]);
      setPieces(prev => prev.map(p => p.id === piece.id ? { ...p, used: true } : p));
    }
    else if (posteType === 'pgpa-revenu-ref') {
      const mockRevRef = [
        { label: 'Salaire net imposable', type: 'revenu', montant: 32000 + Math.round(Math.random() * 6000), confidence: 91 },
        { label: 'Prime annuelle', type: 'gain', montant: 1500 + Math.round(Math.random() * 1500), confidence: 87 },
        { label: 'Heures supplémentaires', type: 'gain', montant: 800 + Math.round(Math.random() * 1200), confidence: 83 },
      ];
      const mock = mockRevRef[Math.floor(Math.random() * mockRevRef.length)];
      const annee = (new Date().getFullYear() - 1 - Math.floor(Math.random() * 2)) + '';
      setPgpaData(prev => ({
        ...prev,
        revenuRef: {
          ...prev.revenuRef,
          lignes: [{
            id: `pgpa-rev-${Date.now()}`,
            type: mock.type,
            status: 'ai-suggested',
            label: mock.label,
            annee,
            montant: mock.montant,
            revalorise: Math.round(mock.montant * 1.04),
            aRevaloriser: true,
            pieceIds: [piece.id],
            confidence: mock.confidence
          }, ...prev.revenuRef.lignes],
          total: prev.revenuRef.total + mock.montant
        }
      }));
      setPieces(prev => prev.map(p => p.id === piece.id ? { ...p, used: true } : p));
    }
    else if (posteType === 'pgpa-revenu-percu') {
      const mockRevPercu = [
        { label: 'Maintien de salaire employeur', montant: 8500, tiers: 'Employeur', dureeJours: 107, confidence: 88 },
        { label: 'Salaire partiel pendant arrêt', montant: 4200, tiers: 'Employeur', dureeJours: 75, confidence: 85 },
      ];
      const mock = mockRevPercu[Math.floor(Math.random() * mockRevPercu.length)];
      setPgpaData(prev => ({
        ...prev,
        revenusPercus: [{
          id: `pgpa-percu-${Date.now()}`,
          status: 'ai-suggested',
          label: mock.label,
          periode: 'Mars - Juin 2023',
          periodeDebut: '15/03/2023',
          periodeFin: '30/06/2023',
          dureeJours: mock.dureeJours,
          montant: mock.montant,
          tiers: mock.tiers,
          pieceIds: [piece.id],
          confidence: mock.confidence
        }, ...prev.revenusPercus]
      }));
      setPieces(prev => prev.map(p => p.id === piece.id ? { ...p, used: true } : p));
    }
    else if (posteType === 'pgpa-ij') {
      const mockIJ = [
        { label: 'IJ Sécurité sociale', tiers: 'CPAM', montantBrut: 12500, jours: 546, confidence: 90 },
        { label: 'IJ Prévoyance complémentaire', tiers: 'AG2R', montantBrut: 5200, jours: 439, confidence: 86 },
      ];
      const mock = mockIJ[Math.floor(Math.random() * mockIJ.length)];
      const csgCrds = Math.round(mock.montantBrut * 0.067);
      setPgpaData(prev => ({
        ...prev,
        ijPercues: [{
          id: `pgpa-ij-${Date.now()}`,
          status: 'ai-suggested',
          label: mock.label,
          tiers: mock.tiers,
          periode: 'Mars 2023 - Sept 2024',
          periodeDebut: '15/03/2023',
          periodeFin: '12/09/2024',
          jours: mock.jours,
          montantBrut: mock.montantBrut,
          csgCrds: csgCrds,
          montant: mock.montantBrut - csgCrds,
          pieceIds: [piece.id],
          confidence: mock.confidence
        }, ...prev.ijPercues]
      }));
      setPieces(prev => prev.map(p => p.id === piece.id ? { ...p, used: true } : p));
    }
    else if (posteType === 'dft') {
      const mockDft = [
        { label: 'Hospitalisation', jours: 8, taux: 100, confidence: 94 },
        { label: 'Alitement strict post-opératoire', jours: 13, taux: 100, confidence: 91 },
        { label: 'Hospitalisation chirurgie', jours: 6, taux: 100, confidence: 88 },
        { label: 'Convalescence post-opératoire', jours: 76, taux: 50, confidence: 89 },
        { label: 'Rééducation active intensive', jours: 92, taux: 40, confidence: 86 },
        { label: 'Gêne résiduelle pré-consolidation', jours: 256, taux: 15, confidence: 82 },
      ];
      const mock = mockDft[Math.floor(Math.random() * mockDft.length)];
      const baseJ = chiffrageParams.baseJournaliereDFT || 33;
      setDftLignes(prev => [{
        id: `dft-${Date.now()}`,
        status: 'ai-suggested',
        label: mock.label,
        debut: '15/03/2023',
        fin: (() => { const d = new Date(2023, 2, 15 + mock.jours); return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`; })(),
        jours: mock.jours,
        taux: mock.taux,
        montant: Math.round(mock.jours * baseJ * mock.taux / 100),
        pieceIds: [piece.id],
        confidence: mock.confidence
      }, ...prev]);
      setPieces(prev => prev.map(p => p.id === piece.id ? { ...p, used: true } : p));
    }
  };

  const handleAddManual = (posteType) => {
    setShowAddModal(null);
    if (posteType === 'dsa') {
      const newLigne = {
        id: `dsa-${Date.now()}`,
        status: 'pending',
        fileName: null,
        pieceIds: [],
        confidence: null,
        warnings: ['Saisie manuelle'],
        label: null,
        type: null,
        date: null,
        montant: null,
        tiers: null,
        dejaRembourse: 0
      };
      setDsaLignes(prev => [newLigne, ...prev]);
      openDsaEditPanel(newLigne);
    }
    else if (posteType === 'pgpa-revenu-ref') {
      const newLigne = { id: `pgpa-rev-${Date.now()}`, type: 'revenu', status: 'pending', label: null, annee: '', montant: null, revalorise: null, aRevaloriser: true, pieceIds: [] };
      setPgpaData(prev => ({ ...prev, revenuRef: { ...prev.revenuRef, lignes: [newLigne, ...prev.revenuRef.lignes] } }));
      openPgpaEditPanel('pgpa-revenu', newLigne);
    }
    else if (posteType === 'pgpa-revenu-percu') {
      const newLigne = { id: `pgpa-percu-${Date.now()}`, status: 'pending', label: null, periode: '', periodeDebut: '', periodeFin: '', dureeJours: 0, montant: null, tiers: '', pieceIds: [] };
      setPgpaData(prev => ({ ...prev, revenusPercus: [newLigne, ...prev.revenusPercus] }));
      openPgpaEditPanel('pgpa-revenu-percu', newLigne);
    }
    else if (posteType === 'pgpa-ij') {
      const newLigne = { id: `pgpa-ij-${Date.now()}`, status: 'pending', label: null, tiers: '', periode: '', periodeDebut: '', periodeFin: '', jours: 0, montantBrut: null, csgCrds: 0, montant: null, pieceIds: [] };
      setPgpaData(prev => ({ ...prev, ijPercues: [newLigne, ...prev.ijPercues] }));
      openPgpaEditPanel('pgpa-ij', newLigne);
    }
    else if (posteType === 'dft') {
      const newLigne = { id: `dft-${Date.now()}`, status: 'pending', label: null, debut: '', fin: '', jours: 0, taux: 100, montant: 0, pieceIds: [], confidence: null, commentaire: '' };
      setDftLignes(prev => [newLigne, ...prev]);
      setEditingPieceIds([]);
      setSearchPiecesPanel('');
      setEditPanel({ type: 'dft-ligne', data: newLigne });
    }
  };

  const handleValidateLigne = (ligneId) => setDsaLignes(prev => prev.map(l => l.id === ligneId ? { ...l, status: 'validated' } : l));
  const handleRejectLigne = (ligneId) => setDsaLignes(prev => prev.filter(l => l.id !== ligneId));
  const handleSaveLigne = (ligneId, data) => {
    setDsaLignes(prev => prev.map(l => l.id === ligneId ? { ...l, ...data, pieceIds: editingPieceIds, status: 'validated' } : l));
    setEditPanel(null);
    setEditingPieceIds([]);
    setShowPreview(false);
  };

  // Helper pour ouvrir le panel d'édition DSA avec initialisation des pieceIds
  const openDsaEditPanel = (ligne) => {
    setEditingPieceIds(ligne.pieceIds || []);
    setSearchPiecesPanel('');
    setEditPanel({ type: 'dsa-ligne', data: ligne });
  };

  // Helper pour ouvrir le panel d'édition PGPA avec initialisation des pieceIds
  const openPgpaEditPanel = (type, ligne) => {
    setEditingPieceIds(ligne.pieceIds || []);
    setSearchPiecesPanel('');
    setEditPanel({ type, data: ligne });
  };

  // ========== SIDEBAR ==========
  const renderSidebar = () => {
    const icons = { dossier: Folder, poste: FileText };
    
    // Titre dynamique par niveau
    const getItemTitle = (item) => {
      if (item.type === 'dossier') {
        const age = calcAge(victimeData.dateNaissance);
        return `${victimeData.nom} ${victimeData.prenom} (${age})`;
      }
      return item.title;
    };
    
    // Contexte par niveau - seulement ce qui n'est plus visible quand on descend
    const getContextInfo = (item, index) => {
      const isLast = index === navStack.length - 1;
      
      if (item.type === 'dossier') {
        // Dates clés seulement si on n'est plus au niveau dossier
        if (!isLast) {
          return {
            line1: `${faitGenerateur.dateAccident} → ${faitGenerateur.dateConsolidation}`
          };
        }
        return null;
      }
      
      if (item.type === 'poste') {
        // Seulement si on descendrait plus bas (ex: périodes PGPF)
        return null;
      }
      
      return null;
    };
    
    return (
      <div className="w-64 bg-white border-r border-zinc-200/60 flex flex-col h-full">
        {/* Logo Norma - clic = retour liste dossiers */}
        <button
          onClick={backToList}
          className="px-4 py-4 border-b border-zinc-200 hover:bg-zinc-50 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-[14px]">N</span>
            </div>
            <span className="font-semibold text-[16px] text-zinc-800">Norma</span>
          </div>
        </button>
        
        {/* Navigation Stack - Full width avec dividers */}
        <div className="flex-1 overflow-y-auto">
          {navStack.map((item, index) => {
            const isLast = index === navStack.length - 1;
            const hasSubSection = item.subSection;
            
            // === DOSSIER ===
            if (item.type === 'dossier') {
              return (
                <div key={`${item.id}-${index}`} className="border-b border-zinc-200">
                  <button 
                    onClick={() => !isLast && navigateToStackLevel(index)}
                    className={`w-full px-4 py-4 text-left transition-colors ${!isLast ? 'hover:bg-zinc-50 cursor-pointer' : ''}`}
                  >
                    {/* Avatar + Nom */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-[14px] font-medium text-zinc-600">
                        {victimeData.prenom[0]}{victimeData.nom[0]}
                      </div>
                      <div>
                        <div className="font-medium text-[14px] text-zinc-800">{victimeData.prenom} {victimeData.nom}</div>
                        <div className="text-[12px] text-zinc-400">{calcAge(victimeData.dateNaissance)} ans · {victimeData.sexe}</div>
                      </div>
                    </div>
                    {/* Dates */}
                    <div className="mt-3 text-[12px] text-zinc-400 space-y-1">
                      <div className="flex justify-between">
                        <span>Accident</span>
                        <span className="text-zinc-600">{faitGenerateur.dateAccident}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Consolidation</span>
                        <span className="text-zinc-600">{faitGenerateur.dateConsolidation}</span>
                      </div>
                    </div>
                  </button>
                </div>
              );
            }
            
            // === POSTE ===
            const Icon = icons[item.type] || FileText;
            let montant = null;
            if (item.type === 'poste') montant = item.montant || (item.id === 'pgpa' ? pgpaTotal : item.id === 'dsa' ? dsaTotal : 0);
            
            // Highlight seulement si c'est le dernier ET pas de sous-section
            const isHighlighted = isLast && !hasSubSection;
            
            return (
              <div key={`${item.id}-${index}`} className="border-b border-zinc-200">
                <button 
                  onClick={() => {
                    if (isLast && hasSubSection) {
                      // Retour au sommaire PGPA
                      setNavStack(prev => {
                        const newStack = [...prev];
                        delete newStack[newStack.length - 1].subSection;
                        return [...newStack];
                      });
                    } else if (!isLast) {
                      navigateToStackLevel(index);
                    }
                  }}
                  className={`w-full px-4 py-3 text-left transition-colors relative ${
                    isHighlighted 
                      ? 'bg-gradient-to-r from-zinc-100 to-zinc-50' 
                      : !isLast || hasSubSection ? 'hover:bg-zinc-50 cursor-pointer' : ''
                  }`}
                >
                  {/* Barre active à droite */}
                  {isHighlighted && (
                    <div className="absolute right-0 top-2 bottom-2 w-[3px] bg-zinc-800 rounded-full" />
                  )}
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 flex-shrink-0 text-zinc-400" strokeWidth={1.5} />
                    <span className={`font-medium text-[14px] ${isHighlighted ? 'text-zinc-800' : 'text-zinc-700'}`}>
                      {item.title}
                    </span>
                  </div>
                  {montant !== null && montant > 0 && (
                    <div className={`mt-1 ml-[26px] text-[13px] font-semibold tabular-nums ${isHighlighted ? 'text-zinc-600' : 'text-zinc-500'}`}>
                      {fmt(montant)}
                    </div>
                  )}
                </button>
                
                {/* Sous-sections PGPA */}
                {item.id === 'pgpa' && isLast && hasSubSection && (
                  <div className="px-4 pb-3 space-y-0.5">
                    {[
                      { id: 'revenus-ref', label: 'Revenus de référence' },
                      { id: 'revenus-percus', label: 'Revenus perçus' },
                      { id: 'ij', label: 'Indemnités journalières' }
                    ].map(sub => {
                      const isSubActive = item.subSection === sub.id;
                      return (
                        <button
                          key={sub.id}
                          onClick={() => {
                            setNavStack(prev => {
                              const newStack = [...prev];
                              newStack[newStack.length - 1] = { ...newStack[newStack.length - 1], subSection: sub.id };
                              return newStack;
                            });
                          }}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] transition-colors relative ${
                            isSubActive
                              ? 'bg-gradient-to-r from-zinc-100 to-zinc-50 font-medium text-zinc-800'
                              : 'text-zinc-500 hover:bg-zinc-100'
                          }`}
                        >
                          {isSubActive && (
                            <div className="absolute right-1 top-1 bottom-1 w-[3px] bg-zinc-800 rounded-full" />
                          )}
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isSubActive ? 'bg-zinc-800' : 'bg-zinc-300'}`} />
                          <span>{sub.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
          
          {/* Paramètres du poste */}
          {currentLevel.type === 'poste' && (
            <div className="px-4 py-3 border-b border-zinc-200">
              <div className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-2">
                Paramètres
              </div>
              <div className="space-y-2">
                {currentLevel.id === 'dsa' && (
                  <div>
                    <label className="block text-[12px] text-zinc-500 mb-1">Revalorisation</label>
                    <select 
                      defaultValue="ipc-annuel"
                      className="w-full px-2.5 py-1.5 text-[13px] border border-zinc-200 rounded-md bg-white"
                    >
                      <option value="ipc-annuel">IPC annuel</option>
                      <option value="ipc-mensuel">IPC mensuel</option>
                      <option value="aucune">Aucune</option>
                    </select>
                  </div>
                )}
                {currentLevel.id === 'pgpa' && (
                  <div>
                    <label className="block text-[12px] text-zinc-500 mb-1">Revalorisation</label>
                    <select 
                      value={pgpaData.revenuRef.revalorisation}
                      onChange={(e) => setPgpaData(prev => ({ 
                        ...prev, 
                        revenuRef: { ...prev.revenuRef, revalorisation: e.target.value } 
                      }))}
                      className="w-full px-2.5 py-1.5 text-[13px] border border-zinc-200 rounded-md bg-white"
                    >
                      <option value="ipc-annuel">IPC annuel</option>
                      <option value="smic-horaire">SMIC horaire</option>
                      <option value="aucune">Aucune</option>
                    </select>
                  </div>
                )}
                {currentLevel.id === 'dft' && (
                  <div>
                    <label className="block text-[12px] text-zinc-500 mb-1">Base journalière</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={chiffrageParams.baseJournaliereDFT}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setChiffrageParams(prev => ({ ...prev, baseJournaliereDFT: val }));
                        }}
                        className="w-full px-2.5 py-1.5 pr-10 text-[13px] border border-zinc-200 rounded-md"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-zinc-400">€/j</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1">Utilisée par défaut pour chaque ligne</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Taxonomie des postes */}
          {currentLevel.type === 'dossier' && currentLevel.activeTab === 'chiffrage' && (
            <div className="px-4 py-3 border-t border-zinc-200">
              <div className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-2">Postes</div>

              {/* Search */}
              <div className="relative mb-3">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" strokeWidth={1.5} />
                <input type="text" value={searchPostes} onChange={(e) => setSearchPostes(e.target.value)}
                  placeholder="Rechercher un poste..."
                  className="w-full pl-8 pr-7 py-1.5 text-[12px] border border-zinc-200 rounded-md bg-white placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-300" />
                {searchPostes && (
                  <button onClick={() => setSearchPostes('')} className="absolute right-2 top-1/2 -translate-y-1/2">
                    <X className="w-3 h-3 text-zinc-400" />
                  </button>
                )}
              </div>

              {/* Taxonomy */}
              {(() => {
                const filtered = getFilteredTaxonomy();
                if (filtered.length === 0) return <p className="text-[12px] text-zinc-400 text-center py-4">Aucun poste trouvé</p>;
                return (
                  <div className="space-y-3">
                    {filtered.map(section => (
                      <div key={section.section}>
                        <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">{section.section}</div>
                        <div className="space-y-0.5">
                          {section.categories.map(cat => {
                            const isExpanded = expandedTaxoCategories.includes(cat.id) || searchPostes.trim() !== '';
                            const sorted = [...cat.postes.filter(p => p.enabled), ...cat.postes.filter(p => !p.enabled)];
                            return (
                              <div key={cat.id}>
                                <button onClick={() => setExpandedTaxoCategories(prev => prev.includes(cat.id) ? prev.filter(id => id !== cat.id) : [...prev, cat.id])}
                                  className="w-full flex items-center gap-1.5 py-1.5 text-[11px] font-medium text-zinc-500 hover:text-zinc-700 transition-colors">
                                  {isExpanded ? <ChevronDown className="w-3 h-3 flex-shrink-0" strokeWidth={2} /> : <ChevronRight className="w-3 h-3 flex-shrink-0" strokeWidth={2} />}
                                  <span className="truncate text-left">{cat.title}</span>
                                </button>
                                {isExpanded && (
                                  <div className="ml-4 space-y-0.5">
                                    {sorted.map(p => {
                                      const montant = getPosteMontant(p.id);
                                      if (p.enabled) {
                                        return (
                                          <button key={p.id} onClick={() => navigateTo({ id: p.id, title: p.acronym, fullTitle: p.label, type: 'poste', montant: montant || 0 })}
                                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition-colors hover:bg-zinc-100 group">
                                            {p.acronym && <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-semibold bg-zinc-100 text-zinc-700 rounded flex-shrink-0 group-hover:bg-zinc-200">{p.acronym}</span>}
                                            <span className="text-[12px] text-zinc-700 truncate flex-1">{p.label}</span>
                                            {montant != null && montant > 0 && <span className="text-[11px] font-medium text-zinc-500 tabular-nums flex-shrink-0">{fmt(montant)}</span>}
                                          </button>
                                        );
                                      }
                                      return (
                                        <div key={p.id} className="flex items-center gap-2 px-2 py-1.5 rounded-md cursor-default">
                                          <span className="text-[12px] text-zinc-300 truncate">{p.label}</span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
        
        {/* User section - bottom */}
        <div className="border-t border-zinc-200 px-4 py-3">
          <button className="w-full flex items-center gap-3 p-2 -m-2 rounded-lg hover:bg-zinc-50 transition-colors">
            <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-[12px] font-medium text-zinc-600">
              JD
            </div>
            <div className="flex-1 text-left">
              <div className="text-[13px] font-medium text-zinc-700">Jean Durand</div>
              <div className="text-[11px] text-zinc-400">Avocat</div>
            </div>
            <Settings className="w-4 h-4 text-zinc-400" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    );
  };

  // ========== ADD MODAL (DSA) ==========
  const renderAddModal = () => {
    if (!showAddModal) return null;
    const filteredPieces = pieces.filter(p => 
      !p.used && p.nom.toLowerCase().includes(searchPieces.toLowerCase())
    );
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4">
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <h3 className="font-semibold text-lg">Ajouter une dépense</h3>
            <button onClick={() => setShowAddModal(null)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
          </div>
          
          {/* Tabs */}
          <div className="flex border-b">
            {[
              { id: 'upload', label: 'Nouveau document', icon: Upload },
              { id: 'pieces', label: 'Pièces existantes', icon: Folder },
              { id: 'manual', label: 'Saisie manuelle', icon: Edit3 }
            ].map(tab => (
              <button key={tab.id} onClick={() => setAddModalTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium ${addModalTab === tab.id ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700'}`}>
                <tab.icon className="w-4 h-4" />{tab.label}
              </button>
            ))}
          </div>
          
          <div className="p-6">
            {/* Upload */}
            {addModalTab === 'upload' && (
              <div>
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleUploadFiles(e.dataTransfer.files, showAddModal); }}
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                >
                  <Upload className={`w-10 h-10 mx-auto mb-3 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
                  <p className="text-gray-600 mb-3">Glissez vos documents ici</p>
                  <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => e.target.files && handleUploadFiles(e.target.files, showAddModal)} className="hidden" id="upload-input" />
                  <label htmlFor="upload-input" className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg cursor-pointer hover:bg-blue-700">Parcourir</label>
                </div>
                <div className="mt-4 flex items-center gap-2 p-3 bg-amber-50 rounded-lg">
                  <Sparkles className="w-5 h-5 text-amber-600" />
                  <span className="text-sm text-amber-800">L'IA extraira automatiquement les informations</span>
                </div>
              </div>
            )}
            
            {/* Pièces existantes */}
            {addModalTab === 'pieces' && (
              <div>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" value={searchPieces} onChange={(e) => setSearchPieces(e.target.value)} placeholder="Rechercher une pièce..." className="w-full pl-10 pr-4 py-2 border rounded-lg" />
                </div>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {filteredPieces.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">Aucune pièce disponible</p>
                  ) : filteredPieces.map(p => (
                    <button key={p.id} onClick={() => handleAddFromPiece(p, showAddModal)}
                      className="w-full flex items-center gap-3 p-3 border rounded-lg hover:border-blue-400 hover:bg-blue-50 text-left">
                      <FileText className="w-8 h-8 text-gray-400" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{p.nom}</div>
                        <div className="text-xs text-gray-500">{p.type} • {p.date}</div>
                      </div>
                      <Plus className="w-5 h-5 text-blue-600" />
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Saisie manuelle */}
            {addModalTab === 'manual' && (
              <div className="text-center py-6">
                <FileQuestion className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-600 mb-4">Créer une ligne sans document associé</p>
                <button onClick={() => handleAddManual(showAddModal)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Créer une ligne manuelle
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ========== EDIT PANEL ==========
  // Helper pour les styles de formulaire
  const FormSection = ({ title, children, noBorder }) => (
    <div className={`${noBorder ? '' : 'pb-6 mb-6 border-b border-zinc-100'}`}>
      {title && <h4 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-4">{title}</h4>}
      {children}
    </div>
  );
  
  const FormField = ({ label, children, hint, className = '' }) => (
    <div className={className}>
      {label && <label className="block text-[13px] font-medium text-zinc-700 mb-2">{label}</label>}
      {children}
      {hint && <p className="mt-1.5 text-[11px] text-zinc-400">{hint}</p>}
    </div>
  );
  
  const inputClass = "w-full px-3.5 py-2.5 text-[14px] border border-zinc-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-zinc-100 focus:border-zinc-400 transition-colors";
  const selectClass = "w-full px-3.5 py-2.5 text-[14px] border border-zinc-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-zinc-100 focus:border-zinc-400 transition-colors appearance-none";

  const renderEditPanel = () => {
    if (!editPanel) return null;
    const data = editPanel.data;
    const isPieceDetail = editPanel.type === 'piece-detail';
    const panelWidth = isPieceDetail ? 'w-[900px]' : (showPreview ? 'w-[1000px]' : 'w-[480px]');
    
    return (
      <div className="fixed inset-0 bg-black/50 flex justify-end z-50" onClick={() => { setEditPanel(null); setShowPreview(false); }}>
        <div 
          className={`bg-white h-full shadow-2xl flex flex-col transition-all duration-300 ${panelWidth}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header - Clean */}
          <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-white">
            <div className="flex items-center gap-3">
              {isPieceDetail && <span className="px-2.5 py-1 bg-zinc-800 text-white text-[11px] font-medium rounded">P{data.index}</span>}
              <h3 className="text-[15px] font-semibold text-zinc-800">{isPieceDetail ? (data.intitule || data.nom) : (editPanel.title || 'Édition')}</h3>
              {data?.status === 'ai-suggested' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[11px] font-medium rounded-full">
                  <Sparkles className="w-3 h-3" />AI suggested
                </span>
              )}
            </div>
            <button onClick={() => { setEditPanel(null); setShowPreview(false); }} className="p-2 hover:bg-zinc-100 rounded-lg transition-colors">
              <X className="w-5 h-5 text-zinc-400" />
            </button>
          </div>
          
          {/* Content */}
          <div className="flex-1 flex overflow-hidden bg-zinc-50/30">
            {/* Preview for DSA */}
            {showPreview && data.fileName && !isPieceDetail && (
              <div className="w-[500px] border-r bg-zinc-900 flex flex-col flex-shrink-0">
                <div className="px-4 py-3 border-b border-zinc-700 flex items-center justify-between">
                  <span className="text-[13px] text-zinc-300 truncate">{data.fileName}</span>
                  <button onClick={() => setShowPreview(false)} className="p-1 hover:bg-zinc-700 rounded text-zinc-400"><X className="w-4 h-4" /></button>
                </div>
                <div className="flex-1 p-6 flex items-center justify-center">
                  <div className="bg-white rounded-lg shadow-xl w-full max-w-sm aspect-[210/297] p-6 flex flex-col">
                    <div className="text-[11px] text-zinc-400 mb-4">DOCUMENT</div>
                    <div className="h-3 bg-zinc-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-zinc-200 rounded w-1/2 mb-4"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-2 bg-zinc-100 rounded w-full"></div>
                      <div className="h-2 bg-zinc-100 rounded w-5/6"></div>
                      <div className="h-2 bg-zinc-100 rounded w-4/6"></div>
                    </div>
                    <div className="mt-auto pt-4 border-t flex justify-between text-[13px]">
                      <span className="text-zinc-500">Total</span>
                      <span className="font-bold">{data.montant ? fmt(data.montant) : '—'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}}
            
            {/* Form */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6">
                {/* DSA Ligne - Panel systémique */}
                {editPanel.type === 'dsa-ligne' && (() => {
                  // Helper pour le style des champs extraits par IA
                  const isIaExtracted = data.confidence != null;
                  const needsValidation = data.status === 'pending';
                  const iaFieldClass = (fieldValue) => {
                    if (!isIaExtracted) return '';

                    if (fieldValue == null || fieldValue === '') return 'border-amber-400 bg-amber-50/50';
                    return '';
                  };
                  
                  return (
                    <>
                      {/* Bandeau IA si extraction */}
                      {isIaExtracted && (
                        <div className={`flex items-center gap-3 p-4 rounded-xl ${
                          data.confidence >= 80 ? 'bg-emerald-50 border border-emerald-200' : 'bg-amber-50 border border-amber-200'
                        }`}>
                          <Sparkles className={`w-5 h-5 ${data.confidence >= 80 ? 'text-emerald-600' : 'text-amber-600'}`} />
                          <div className="flex-1">
                            <span className={`text-[13px] font-medium ${data.confidence >= 80 ? 'text-emerald-700' : 'text-amber-700'}`}>
                              Extraction IA • Confiance {data.confidence}%
                            </span>
                            {needsValidation && (
                              <p className="text-xs text-amber-600 mt-0.5">Vérifiez les champs surlignés</p>
                            )}
                          </div>
                          {data.status === 'ai-suggested' && (
                            <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded">Suggestion IA</span>
                          )}
                        </div>
                      )}
                      
                      {/* Section Pièces justificatives */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b">Pièces justificatives</h4>
                        {editingPieceIds.length > 0 && (
                          <div className="space-y-2 mb-3">
                            {editingPieceIds.map(pid => {
                              const piece = getPiece(pid);
                              return piece ? (
                                <div key={pid} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg border group">
                                  <span className="w-8 h-8 bg-blue-100 text-blue-700 text-xs font-medium rounded flex items-center justify-center flex-shrink-0">{getPieceLabel(pid)}</span>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{piece.intitule || piece.nom}</p>
                                    <p className="text-xs text-gray-500">{piece.type}</p>
                                  </div>
                                  <button onClick={() => setShowPreview(!showPreview)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"><Eye className="w-4 h-4" /></button>
                                  <button onClick={() => setEditingPieceIds(prev => prev.filter(id => id !== pid))} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                                </div>
                              ) : null;
                            })}
                          </div>
                        )}
                        <div className="border-2 border-dashed rounded-lg p-3 space-y-3 bg-gray-50/50">
                          {pieces.filter(p => !editingPieceIds.includes(p.id)).length > 0 && (
                            <div>
                              <div className="relative mb-2">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" strokeWidth={1.5} />
                                <input type="text" value={searchPiecesPanel} onChange={(e) => setSearchPiecesPanel(e.target.value)} placeholder="Rechercher une pièce..."
                                  className="w-full pl-8 pr-7 py-1.5 text-[12px] border border-zinc-200 rounded-md bg-white placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-300" />
                                {searchPiecesPanel && <button onClick={() => setSearchPiecesPanel('')} className="absolute right-2 top-1/2 -translate-y-1/2"><X className="w-3 h-3 text-zinc-400" /></button>}
                              </div>
                              <div className="max-h-32 overflow-y-auto space-y-1">
                                {pieces.filter(p => !editingPieceIds.includes(p.id)).filter(p => !searchPiecesPanel.trim() || (p.intitule || p.nom || '').toLowerCase().includes(searchPiecesPanel.trim().toLowerCase()) || (p.type || '').toLowerCase().includes(searchPiecesPanel.trim().toLowerCase())).map(piece => (
                                  <button key={piece.id} onClick={() => { setEditingPieceIds(prev => [...prev, piece.id]); setSearchPiecesPanel(''); }}
                                    className="w-full flex items-center gap-2 p-2 text-left text-sm bg-white border rounded hover:bg-blue-50 hover:border-blue-300 transition-colors">
                                    <span className="w-6 h-6 bg-blue-100 text-blue-700 text-[10px] font-medium rounded flex items-center justify-center flex-shrink-0">{getPieceLabel(piece.id)}</span>
                                    <span className="truncate flex-1">{piece.intitule || piece.nom}</span>
                                    <span className="text-xs text-gray-400">{piece.type}</span>
                                    <Plus className="w-4 h-4 text-blue-600" />
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                          <input type="file" id="panel-piece-upload" multiple accept=".pdf,.jpg,.jpeg,.png" className="hidden"
                            onChange={(e) => { if (e.target.files?.length) { handleUploadPieceForPanel(e.target.files); e.target.value = ''; } }} />
                          <button onClick={() => document.getElementById('panel-piece-upload').click()}
                            className="w-full flex items-center justify-center gap-2 p-2 text-sm text-zinc-600 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 hover:border-zinc-300 transition-colors">
                            <Upload className="w-4 h-4" />
                            Ajouter un document
                          </button>
                        </div>
                      </div>

                      {/* Section Informations */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b">Informations</h4>
                        
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm font-medium text-gray-700">Libellé</label>
                            <input 
                              type="text" 
                              defaultValue={data.label || ''} 
                              id="edit-label" 
                              placeholder="Ex: Consultation Dr. Martin" 
                              className={`mt-1 w-full px-3 py-2 border rounded-lg ${iaFieldClass(data.label)}`}
                            />
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium text-gray-700">Description de l'acte</label>
                            <textarea 
                              defaultValue={data.description || ''} 
                              id="edit-description" 
                              rows={2}
                              placeholder="Description détaillée (optionnel)"
                              className="mt-1 w-full px-3 py-2 border rounded-lg resize-none"
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-sm font-medium text-gray-700">Type de dépense</label>
                              <select 
                                defaultValue={data.type || ''} 
                                id="edit-type" 
                                className={`mt-1 w-full px-3 py-2 border rounded-lg ${iaFieldClass(data.type)}`}
                              >
                                <option value="">Sélectionner...</option>
                                <option>Hospitalisation</option>
                                <option>Consultation</option>
                                <option>Rééducation</option>
                                <option>Pharmacie</option>
                                <option>Imagerie</option>
                                <option>Appareillage</option>
                                <option>Transport</option>
                                <option>Autre</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-700">Tiers / Prestataire</label>
                              <input 
                                type="text" 
                                defaultValue={data.tiers || ''} 
                                id="edit-tiers" 
                                placeholder="Ex: CHU Bordeaux" 
                                className="mt-1 w-full px-3 py-2 border rounded-lg"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Section Dates */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b">Dates</h4>
                        
                        <div className="space-y-3">
                          {/* Toggle ponctuel / périodique */}
                          <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input 
                                type="radio" 
                                name="date-type" 
                                value="ponctuel" 
                                defaultChecked={!data.isPeriodique}
                                className="text-blue-600"
                              />
                              <span className="text-sm">Ponctuelle</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input 
                                type="radio" 
                                name="date-type" 
                                value="periodique" 
                                defaultChecked={data.isPeriodique}
                                className="text-blue-600"
                              />
                              <span className="text-sm">Périodique</span>
                            </label>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-sm font-medium text-gray-700">Date dépense</label>
                              <input 
                                type="text" 
                                defaultValue={data.date || ''} 
                                id="edit-date" 
                                placeholder="JJ/MM/AAAA" 
                                className={`mt-1 w-full px-3 py-2 border rounded-lg ${iaFieldClass(data.date)}`}
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-700">Date fin</label>
                              <input 
                                type="text" 
                                defaultValue={data.dateFin || ''} 
                                id="edit-date-fin" 
                                placeholder="JJ/MM/AAAA" 
                                className="mt-1 w-full px-3 py-2 border rounded-lg"
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-sm font-medium text-gray-700">Périodicité</label>
                              <select 
                                defaultValue={data.periodicite || ''} 
                                id="edit-periodicite" 
                                className="mt-1 w-full px-3 py-2 border rounded-lg"
                              >
                                <option value="">—</option>
                                <option>Quotidien</option>
                                <option>Hebdomadaire</option>
                                <option>Mensuel</option>
                                <option>Annuel</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-700">Date devis</label>
                              <input 
                                type="text" 
                                defaultValue={data.dateDevis || ''} 
                                id="edit-date-devis" 
                                placeholder="JJ/MM/AAAA" 
                                className="mt-1 w-full px-3 py-2 border rounded-lg"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Section Montants */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b">Montants</h4>
                        
                        <div className="space-y-3">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                              type="checkbox" 
                              defaultChecked={data.aRevalo || false}
                              id="edit-revalo"
                              className="rounded text-blue-600"
                            />
                            <span className="text-sm">À revaloriser</span>
                          </label>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-sm font-medium text-gray-700">Montant unitaire</label>
                              <div className="mt-1 relative">
                                <input 
                                  type="number" 
                                  step="0.01" 
                                  defaultValue={data.montantUnitaire ?? ''} 
                                  id="edit-montant-unitaire" 
                                  placeholder="0.00" 
                                  className="w-full px-3 py-2 pr-8 border rounded-lg"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-700">Montant total</label>
                              <div className="mt-1 relative">
                                <input
                                  type="number"
                                  step="0.01"
                                  defaultValue={data.montant ?? ''}
                                  id="edit-montant"
                                  readOnly
                                  className="w-full px-3 py-2 pr-8 border rounded-lg bg-zinc-50 text-zinc-500 cursor-default"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-sm font-medium text-gray-700">Déjà remboursé</label>
                              <div className="mt-1 relative">
                                <input 
                                  type="number" 
                                  step="0.01" 
                                  defaultValue={data.dejaRembourse || 0} 
                                  id="edit-rembourse" 
                                  className="w-full px-3 py-2 pr-8 border rounded-lg"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-700">Reste à charge retenu</label>
                              <div className="mt-1 relative">
                                <input 
                                  type="number" 
                                  step="0.01" 
                                  defaultValue={data.resteAChargeRetenu ?? ((data.montant || 0) - (data.dejaRembourse || 0))} 
                                  id="edit-reste-charge" 
                                  className="w-full px-3 py-2 pr-8 border rounded-lg bg-gray-50 font-medium"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
                              </div>
                              <p className="mt-1 text-xs text-gray-500">Revalorisé s'il y a lieu</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })()}
                
                {/* Piece Detail Panel */}
                {editPanel.type === 'piece-detail' && (
                  <div className="flex gap-6 h-full">
                    {/* Left: Preview */}
                    <div className="w-1/2 bg-gray-900 rounded-lg flex items-center justify-center p-6">
                      <div className="bg-white rounded-lg shadow-xl w-full max-w-[280px] aspect-[3/4] p-6 flex flex-col">
                        <div className="text-xs text-gray-400 mb-3 uppercase tracking-wide">{data.type}</div>
                        <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2 mb-6"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-2 bg-gray-100 rounded w-full"></div>
                          <div className="h-2 bg-gray-100 rounded w-5/6"></div>
                          <div className="h-2 bg-gray-100 rounded w-4/6"></div>
                          <div className="h-2 bg-gray-100 rounded w-full"></div>
                          <div className="h-2 bg-gray-100 rounded w-3/4"></div>
                        </div>
                        <div className="mt-4 pt-4 border-t text-xs text-gray-400">
                          {data.date}
                        </div>
                      </div>
                    </div>
                    
                    {/* Right: Details */}
                    <div className="w-1/2 space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Intitulé</label>
                        <input
                          id="piece-intitule"
                          type="text"
                          defaultValue={data.intitule || data.nom?.replace(/\.[^/.]+$/, '')}
                          className="mt-1 w-full px-3 py-2 border rounded-lg"
                          placeholder="Intitulé descriptif"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700">Nom du fichier original</label>
                        <div className="mt-1 px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-600 truncate">
                          {data.nomOriginal || data.nom}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Type</label>
                          <select id="piece-type" defaultValue={data.type} className="mt-1 w-full px-3 py-2 border rounded-lg">
                            <option>Facture</option>
                            <option>Bulletin</option>
                            <option>Attestation</option>
                            <option>Expertise</option>
                            <option>Imagerie</option>
                            <option>Ordonnance</option>
                            <option>Document</option>
                          </select>
                        </div>
                      </div>

                      {/* Utilisations */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Utilisé dans</label>
                        {data.usages && data.usages.length > 0 ? (
                          <div className="space-y-2">
                            {data.usages.includes('DSA') && (
                              <div className="flex items-center justify-between p-2.5 bg-blue-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-blue-600" />
                                  <span className="text-sm font-medium text-blue-800">DSA</span>
                                </div>
                                <span className="text-xs text-blue-600">Liquidation</span>
                              </div>
                            )}
                            {data.usages.includes('PGPA') && (
                              <div className="flex items-center justify-between p-2.5 bg-green-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-green-600" />
                                  <span className="text-sm font-medium text-green-800">PGPA</span>
                                </div>
                                <span className="text-xs text-green-600">Liquidation</span>
                              </div>
                            )}
                            {data.usages.includes('DFT') && (
                              <div className="flex items-center justify-between p-2.5 bg-amber-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-amber-600" />
                                  <span className="text-sm font-medium text-amber-800">DFT</span>
                                </div>
                                <span className="text-xs text-amber-600">Liquidation</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-500 text-center">
                            Cette pièce n'est utilisée dans aucun poste
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Panel édition Victime */}
                {editPanel.type === 'victime' && (
                  <>
                    <FormSection title="Identité">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField label="Nom">
                          <input type="text" id="victime-nom" defaultValue={victimeData.nom} className={inputClass} />
                        </FormField>
                        <FormField label="Prénom">
                          <input type="text" id="victime-prenom" defaultValue={victimeData.prenom} className={inputClass} />
                        </FormField>
                      </div>
                    </FormSection>
                    
                    <FormSection title="État civil">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField label="Sexe">
                          <select id="victime-sexe" defaultValue={victimeData.sexe} className={selectClass}>
                            <option>Homme</option>
                            <option>Femme</option>
                          </select>
                        </FormField>
                        <FormField label="Date de naissance">
                          <input type="text" id="victime-naissance" defaultValue={victimeData.dateNaissance} className={inputClass} placeholder="JJ/MM/AAAA" />
                        </FormField>
                      </div>
                    </FormSection>
                    
                    <FormSection title="Décès" noBorder>
                      <FormField label="Date de décès" hint="Laisser vide si non applicable">
                        <input type="text" id="victime-deces" defaultValue={victimeData.dateDeces || ''} className={inputClass} placeholder="JJ/MM/AAAA" />
                      </FormField>
                    </FormSection>
                  </>
                )}
                
                {/* Panel édition Fait générateur */}
                {editPanel.type === 'fait-generateur' && (
                  <>
                    <FormSection title="Type d'événement">
                      <FormField label="Type de fait générateur">
                        <select id="fait-type" defaultValue={faitGenerateur.type} className={selectClass}>
                          <option>Accident de la route</option>
                          <option>Accident du travail</option>
                          <option>Accident médical</option>
                          <option>Agression</option>
                          <option>Accident domestique</option>
                          <option>Autre</option>
                        </select>
                      </FormField>
                    </FormSection>
                    
                    <FormSection title="Dates clés">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField label="Date de l'accident">
                          <input type="text" id="fait-date-accident" defaultValue={faitGenerateur.dateAccident} className={inputClass} placeholder="JJ/MM/AAAA" />
                        </FormField>
                        <FormField label="Date première constatation">
                          <input type="text" id="fait-date-constat" defaultValue={faitGenerateur.datePremiereConstatation} className={inputClass} placeholder="JJ/MM/AAAA" />
                        </FormField>
                        <FormField label="Date de consolidation">
                          <input type="text" id="fait-date-conso" defaultValue={faitGenerateur.dateConsolidation} className={inputClass} placeholder="JJ/MM/AAAA" />
                        </FormField>
                      </div>
                    </FormSection>
                    
                    <FormSection title="Description" noBorder>
                      <FormField label="Résumé des faits">
                        <textarea 
                          id="fait-resume" 
                          defaultValue={faitGenerateur.resume} 
                          rows={5}
                          className={`${inputClass} resize-none`}
                          placeholder="Décrivez les circonstances de l'accident..."
                        />
                      </FormField>
                    </FormSection>
                  </>
                )}
                
                {/* Panel édition Commentaire expertise */}
                {editPanel.type === 'dossier-expertise' && (
                  <>
                    <FormSection title="Commentaire d'expertise" noBorder>
                      <FormField>
                        <textarea
                          id="proc-commentaire"
                          defaultValue={commentaireExpertise}
                          rows={10}
                          className="w-full px-3 py-2 border rounded-lg resize-none"
                          placeholder="Conclusions et observations de l'expert..."
                        />
                      </FormField>
                    </FormSection>
                  </>
                )}
                
                {/* Panel édition Victime indirecte */}
                {editPanel.type === 'victime-indirecte' && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b">Identité</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Nom</label>
                          <input type="text" id="vi-nom" defaultValue={data?.nom || ''} className="mt-1 w-full px-3 py-2 border rounded-lg" />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Prénom</label>
                          <input type="text" id="vi-prenom" defaultValue={data?.prenom || ''} className="mt-1 w-full px-3 py-2 border rounded-lg" />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b">État civil</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Sexe</label>
                          <select id="vi-sexe" defaultValue={data?.sexe || 'Homme'} className="mt-1 w-full px-3 py-2 border rounded-lg">
                            <option>Homme</option>
                            <option>Femme</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Date de naissance</label>
                          <input type="text" id="vi-naissance" defaultValue={data?.dateNaissance || ''} className="mt-1 w-full px-3 py-2 border rounded-lg" placeholder="JJ/MM/AAAA" />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b">Lien avec la victime</h4>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Type de lien</label>
                        <select id="vi-lien" defaultValue={data?.lien || 'Conjoint'} className="mt-1 w-full px-3 py-2 border rounded-lg">
                          <option>Époux</option>
                          <option>Épouse</option>
                          <option>Conjoint</option>
                          <option>Conjointe</option>
                          <option>Partenaire PACS</option>
                          <option>Concubin</option>
                          <option>Concubine</option>
                          <option>Enfant</option>
                          <option>Père</option>
                          <option>Mère</option>
                          <option>Frère</option>
                          <option>Sœur</option>
                          <option>Grand-parent</option>
                          <option>Petit-enfant</option>
                          <option>Autre</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Panel Nouvelle procédure supprimé */}

                {/* Panel Édition Dossier */}
                {editPanel.type === 'dossier-edit' && (
                  <>
                    <FormSection title="Informations générales">
                      <FormField label="Référence dossier">
                        <input type="text" id="dossier-ref" defaultValue={dossierRef} className={inputClass} />
                      </FormField>
                      <FormField label="Intitulé du dossier">
                        <input type="text" id="dossier-intitule" defaultValue={dossierIntitule} className={inputClass} />
                      </FormField>
                    </FormSection>

                    <FormSection title="Statut">
                      <FormField label="État du dossier">
                        <select id="dossier-statut" defaultValue={dossierStatut} className={selectClass}>
                          <option value="ouvert">Ouvert</option>
                          <option value="ferme">Fermé</option>
                          <option value="archive">Archivé</option>
                        </select>
                      </FormField>
                      <FormField label="Date d'ouverture">
                        <input type="text" id="dossier-date-ouverture" defaultValue={dossierDateOuverture} className={inputClass} placeholder="JJ/MM/AAAA" />
                      </FormField>
                    </FormSection>

                    <FormSection title="Intervenants" noBorder>
                      <FormField label="Avocat en charge">
                        <input type="text" id="dossier-avocat" defaultValue={dossierAvocat} className={inputClass} />
                      </FormField>
                      <FormField label="Notes internes">
                        <textarea
                          id="dossier-notes"
                          rows={3}
                          className={`${inputClass} resize-none`}
                          placeholder="Notes internes sur le dossier..."
                          defaultValue={dossierNotes}
                        />
                      </FormField>
                    </FormSection>
                  </>
                )}

                {/* ========== PANELS PGPA ========== */}
                
                {/* Panel PGPA - Revenu de référence */}
                {editPanel.type === 'pgpa-revenu' && (
                  <div className="space-y-6">
                    {/* Section Pièces justificatives */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b">Pièces justificatives</h4>
                      {editingPieceIds.length > 0 && (
                        <div className="space-y-2 mb-3">
                          {editingPieceIds.map(pid => {
                            const piece = getPiece(pid);
                            return piece ? (
                              <div key={pid} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg border group">
                                <span className="w-8 h-8 bg-blue-100 text-blue-700 text-xs font-medium rounded flex items-center justify-center flex-shrink-0">{getPieceLabel(pid)}</span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{piece.intitule || piece.nom}</p>
                                  <p className="text-xs text-gray-500">{piece.type}</p>
                                </div>
                                <button onClick={() => setShowPreview(!showPreview)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"><Eye className="w-4 h-4" /></button>
                                <button onClick={() => setEditingPieceIds(prev => prev.filter(id => id !== pid))} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                              </div>
                            ) : null;
                          })}
                        </div>
                      )}
                      <div className="border-2 border-dashed rounded-lg p-3 space-y-3 bg-gray-50/50">
                        {pieces.filter(p => !editingPieceIds.includes(p.id)).length > 0 && (
                          <div>
                            <div className="relative mb-2">
                              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" strokeWidth={1.5} />
                              <input type="text" value={searchPiecesPanel} onChange={(e) => setSearchPiecesPanel(e.target.value)} placeholder="Rechercher une pièce..."
                                className="w-full pl-8 pr-7 py-1.5 text-[12px] border border-zinc-200 rounded-md bg-white placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-300" />
                              {searchPiecesPanel && <button onClick={() => setSearchPiecesPanel('')} className="absolute right-2 top-1/2 -translate-y-1/2"><X className="w-3 h-3 text-zinc-400" /></button>}
                            </div>
                            <div className="max-h-32 overflow-y-auto space-y-1">
                              {pieces.filter(p => !editingPieceIds.includes(p.id)).filter(p => !searchPiecesPanel.trim() || (p.intitule || p.nom || '').toLowerCase().includes(searchPiecesPanel.trim().toLowerCase()) || (p.type || '').toLowerCase().includes(searchPiecesPanel.trim().toLowerCase())).map(piece => (
                                <button key={piece.id} onClick={() => { setEditingPieceIds(prev => [...prev, piece.id]); setSearchPiecesPanel(''); }}
                                  className="w-full flex items-center gap-2 p-2 text-left text-sm bg-white border rounded hover:bg-blue-50 hover:border-blue-300 transition-colors">
                                  <span className="w-6 h-6 bg-blue-100 text-blue-700 text-[10px] font-medium rounded flex items-center justify-center flex-shrink-0">{getPieceLabel(piece.id)}</span>
                                  <span className="truncate flex-1">{piece.intitule || piece.nom}</span>
                                  <span className="text-xs text-gray-400">{piece.type}</span>
                                  <Plus className="w-4 h-4 text-blue-600" />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        <input type="file" id="panel-piece-upload" multiple accept=".pdf,.jpg,.jpeg,.png" className="hidden"
                          onChange={(e) => { if (e.target.files?.length) { handleUploadPieceForPanel(e.target.files); e.target.value = ''; } }} />
                        <button onClick={() => document.getElementById('panel-piece-upload').click()}
                          className="w-full flex items-center justify-center gap-2 p-2 text-sm text-zinc-600 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 hover:border-zinc-300 transition-colors">
                          <Upload className="w-4 h-4" />
                          Ajouter un document
                        </button>
                      </div>
                    </div>

                    {/* Section Informations */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b">Informations</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Type</label>
                          <select id="pgpa-revenu-type" defaultValue={data.type || 'revenu'} className="mt-1 w-full px-3 py-2 border rounded-lg">
                            <option value="revenu">Revenu professionnel</option>
                            <option value="gain">Gain supplémentaire (prime, indemnité...)</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-700">Intitulé</label>
                          <input id="pgpa-revenu-label" type="text" defaultValue={data.label || ''} placeholder="Ex: Salaire net imposable" className="mt-1 w-full px-3 py-2 border rounded-lg" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-700">Année</label>
                            <input id="pgpa-revenu-annee" type="text" defaultValue={data.annee || ''} placeholder="2022" className="mt-1 w-full px-3 py-2 border rounded-lg" />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700">Unité de temps</label>
                            <select id="pgpa-revenu-unite" defaultValue={data.unite || 'annuel'} className="mt-1 w-full px-3 py-2 border rounded-lg">
                              <option value="annuel">Annuel</option>
                              <option value="mensuel">Mensuel</option>
                              <option value="journalier">Journalier</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-700">Commentaire</label>
                          <textarea id="pgpa-revenu-commentaire" rows={2} defaultValue={data.commentaire || ''} placeholder="Informations complémentaires..." className="mt-1 w-full px-3 py-2 border rounded-lg resize-none" />
                        </div>
                      </div>
                    </div>
                    
                    {/* Section Montants */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b">Montants</h4>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-700">Revenu net payé</label>
                            <div className="mt-1 relative">
                              <input id="pgpa-revenu-montant" type="number" step="0.01" defaultValue={data.montant || ''} readOnly className="w-full px-3 py-2 pr-8 border rounded-lg bg-zinc-50 text-zinc-500 cursor-default" />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700">Montant revalorisé</label>
                            <div className="mt-1 relative">
                              <input id="pgpa-revenu-revalorise" type="number" step="0.01" defaultValue={data.revalorise || ''} className="w-full px-3 py-2 pr-8 border rounded-lg bg-gray-50 font-medium" readOnly />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
                            </div>
                            <p className="mt-1 text-xs text-gray-500">Calculé automatiquement selon le barème</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <input type="checkbox" id="pgpa-revenu-revalo-checkbox" defaultChecked={data.aRevaloriser !== false} className="rounded text-blue-600" />
                            <label htmlFor="pgpa-revenu-revalo-checkbox" className="text-sm font-medium text-gray-700">Appliquer la revalorisation</label>
                          </div>
                          <div className="text-sm text-gray-500">
                            Quotient : <span className="font-medium">1.04</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Panel PGPA - Revenu perçu période */}
                {editPanel.type === 'pgpa-revenu-percu' && (
                  <div className="space-y-6">
                    {/* Section Pièces justificatives */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b">Pièces justificatives</h4>
                      {editingPieceIds.length > 0 && (
                        <div className="space-y-2 mb-3">
                          {editingPieceIds.map(pid => {
                            const piece = getPiece(pid);
                            return piece ? (
                              <div key={pid} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg border group">
                                <span className="w-8 h-8 bg-blue-100 text-blue-700 text-xs font-medium rounded flex items-center justify-center flex-shrink-0">{getPieceLabel(pid)}</span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{piece.intitule || piece.nom}</p>
                                  <p className="text-xs text-gray-500">{piece.type}</p>
                                </div>
                                <button onClick={() => setShowPreview(!showPreview)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"><Eye className="w-4 h-4" /></button>
                                <button onClick={() => setEditingPieceIds(prev => prev.filter(id => id !== pid))} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                              </div>
                            ) : null;
                          })}
                        </div>
                      )}
                      <div className="border-2 border-dashed rounded-lg p-3 space-y-3 bg-gray-50/50">
                        {pieces.filter(p => !editingPieceIds.includes(p.id)).length > 0 && (
                          <div>
                            <div className="relative mb-2">
                              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" strokeWidth={1.5} />
                              <input type="text" value={searchPiecesPanel} onChange={(e) => setSearchPiecesPanel(e.target.value)} placeholder="Rechercher une pièce..."
                                className="w-full pl-8 pr-7 py-1.5 text-[12px] border border-zinc-200 rounded-md bg-white placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-300" />
                              {searchPiecesPanel && <button onClick={() => setSearchPiecesPanel('')} className="absolute right-2 top-1/2 -translate-y-1/2"><X className="w-3 h-3 text-zinc-400" /></button>}
                            </div>
                            <div className="max-h-32 overflow-y-auto space-y-1">
                              {pieces.filter(p => !editingPieceIds.includes(p.id)).filter(p => !searchPiecesPanel.trim() || (p.intitule || p.nom || '').toLowerCase().includes(searchPiecesPanel.trim().toLowerCase()) || (p.type || '').toLowerCase().includes(searchPiecesPanel.trim().toLowerCase())).map(piece => (
                                <button key={piece.id} onClick={() => { setEditingPieceIds(prev => [...prev, piece.id]); setSearchPiecesPanel(''); }}
                                  className="w-full flex items-center gap-2 p-2 text-left text-sm bg-white border rounded hover:bg-blue-50 hover:border-blue-300 transition-colors">
                                  <span className="w-6 h-6 bg-blue-100 text-blue-700 text-[10px] font-medium rounded flex items-center justify-center flex-shrink-0">{getPieceLabel(piece.id)}</span>
                                  <span className="truncate flex-1">{piece.intitule || piece.nom}</span>
                                  <span className="text-xs text-gray-400">{piece.type}</span>
                                  <Plus className="w-4 h-4 text-blue-600" />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        <input type="file" id="panel-piece-upload" multiple accept=".pdf,.jpg,.jpeg,.png" className="hidden"
                          onChange={(e) => { if (e.target.files?.length) { handleUploadPieceForPanel(e.target.files); e.target.value = ''; } }} />
                        <button onClick={() => document.getElementById('panel-piece-upload').click()}
                          className="w-full flex items-center justify-center gap-2 p-2 text-sm text-zinc-600 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 hover:border-zinc-300 transition-colors">
                          <Upload className="w-4 h-4" />
                          Ajouter un document
                        </button>
                      </div>
                    </div>

                    {/* Section Informations */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b">Informations</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Intitulé</label>
                          <input id="pgpa-percu-label" type="text" defaultValue={data.label || ''} placeholder="Ex: Maintien de salaire partiel" className="mt-1 w-full px-3 py-2 border rounded-lg" />
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-700">Organisme / Tiers</label>
                          <input id="pgpa-percu-tiers" type="text" defaultValue={data.tiers || ''} placeholder="Ex: Employeur, Prévoyance..." className="mt-1 w-full px-3 py-2 border rounded-lg" />
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-700">Commentaire</label>
                          <textarea id="pgpa-percu-commentaire" rows={2} defaultValue={data.commentaire || ''} placeholder="Informations complémentaires..." className="mt-1 w-full px-3 py-2 border rounded-lg resize-none" />
                        </div>
                      </div>
                    </div>
                    
                    {/* Section Période */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b">Période</h4>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-700">Date de début</label>
                            <input id="pgpa-percu-debut" type="text" defaultValue={data.periodeDebut || ''} placeholder="JJ/MM/AAAA" className="mt-1 w-full px-3 py-2 border rounded-lg" />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700">Date de fin</label>
                            <input id="pgpa-percu-fin" type="text" defaultValue={data.periodeFin || ''} placeholder="JJ/MM/AAAA" className="mt-1 w-full px-3 py-2 border rounded-lg" />
                          </div>
                        </div>

                        <div className="p-3 bg-blue-50 rounded-lg flex items-center justify-between">
                          <span className="text-sm text-blue-700">Durée calculée</span>
                          <span className="font-semibold text-blue-900">{data.dureeJours || '—'} jours</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Section Montants */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b">Montants</h4>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-700">Revenu perçu net</label>
                            <div className="mt-1 relative">
                              <input id="pgpa-percu-montant" type="number" step="0.01" defaultValue={data.montant || ''} readOnly className="w-full px-3 py-2 pr-8 border rounded-lg bg-zinc-50 text-zinc-500 cursor-default" />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700">Unité de temps</label>
                            <select id="pgpa-percu-unite" defaultValue={data.unite || 'total'} className="mt-1 w-full px-3 py-2 border rounded-lg">
                              <option value="total">Total période</option>
                              <option value="mensuel">Par mois</option>
                              <option value="journalier">Par jour</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <input type="checkbox" id="pgpa-percu-no-revalo" defaultChecked={data.noRevalo || false} className="rounded text-blue-600" />
                            <label htmlFor="pgpa-percu-no-revalo" className="text-sm font-medium text-gray-700">Montant à ne pas revaloriser</label>
                          </div>
                        </div>
                        
                        <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-amber-800">Perte de gains sur la période</span>
                            <span className="font-semibold text-amber-900">{fmt(data.perteGains || 0)}</span>
                          </div>
                          <p className="text-xs text-amber-600 mt-1">Revenu de référence − Revenu perçu</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Panel PGPA - Indemnités journalières */}
                {editPanel.type === 'pgpa-ij' && (
                  <div className="space-y-6">
                    {/* Section Pièces justificatives */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b">Pièces justificatives</h4>
                      {editingPieceIds.length > 0 && (
                        <div className="space-y-2 mb-3">
                          {editingPieceIds.map(pid => {
                            const piece = getPiece(pid);
                            return piece ? (
                              <div key={pid} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg border group">
                                <span className="w-8 h-8 bg-blue-100 text-blue-700 text-xs font-medium rounded flex items-center justify-center flex-shrink-0">{getPieceLabel(pid)}</span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{piece.intitule || piece.nom}</p>
                                  <p className="text-xs text-gray-500">{piece.type}</p>
                                </div>
                                <button onClick={() => setShowPreview(!showPreview)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"><Eye className="w-4 h-4" /></button>
                                <button onClick={() => setEditingPieceIds(prev => prev.filter(id => id !== pid))} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                              </div>
                            ) : null;
                          })}
                        </div>
                      )}
                      <div className="border-2 border-dashed rounded-lg p-3 space-y-3 bg-gray-50/50">
                        {pieces.filter(p => !editingPieceIds.includes(p.id)).length > 0 && (
                          <div>
                            <div className="relative mb-2">
                              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" strokeWidth={1.5} />
                              <input type="text" value={searchPiecesPanel} onChange={(e) => setSearchPiecesPanel(e.target.value)} placeholder="Rechercher une pièce..."
                                className="w-full pl-8 pr-7 py-1.5 text-[12px] border border-zinc-200 rounded-md bg-white placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-300" />
                              {searchPiecesPanel && <button onClick={() => setSearchPiecesPanel('')} className="absolute right-2 top-1/2 -translate-y-1/2"><X className="w-3 h-3 text-zinc-400" /></button>}
                            </div>
                            <div className="max-h-32 overflow-y-auto space-y-1">
                              {pieces.filter(p => !editingPieceIds.includes(p.id)).filter(p => !searchPiecesPanel.trim() || (p.intitule || p.nom || '').toLowerCase().includes(searchPiecesPanel.trim().toLowerCase()) || (p.type || '').toLowerCase().includes(searchPiecesPanel.trim().toLowerCase())).map(piece => (
                                <button key={piece.id} onClick={() => { setEditingPieceIds(prev => [...prev, piece.id]); setSearchPiecesPanel(''); }}
                                  className="w-full flex items-center gap-2 p-2 text-left text-sm bg-white border rounded hover:bg-blue-50 hover:border-blue-300 transition-colors">
                                  <span className="w-6 h-6 bg-blue-100 text-blue-700 text-[10px] font-medium rounded flex items-center justify-center flex-shrink-0">{getPieceLabel(piece.id)}</span>
                                  <span className="truncate flex-1">{piece.intitule || piece.nom}</span>
                                  <span className="text-xs text-gray-400">{piece.type}</span>
                                  <Plus className="w-4 h-4 text-blue-600" />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        <input type="file" id="panel-piece-upload" multiple accept=".pdf,.jpg,.jpeg,.png" className="hidden"
                          onChange={(e) => { if (e.target.files?.length) { handleUploadPieceForPanel(e.target.files); e.target.value = ''; } }} />
                        <button onClick={() => document.getElementById('panel-piece-upload').click()}
                          className="w-full flex items-center justify-center gap-2 p-2 text-sm text-zinc-600 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 hover:border-zinc-300 transition-colors">
                          <Upload className="w-4 h-4" />
                          Ajouter un document
                        </button>
                      </div>
                    </div>

                    {/* Section Tiers payeur */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b">Tiers payeur</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Organisme</label>
                          <select id="pgpa-ij-tiers" defaultValue={data.tiers || ''} className="mt-1 w-full px-3 py-2 border rounded-lg">
                            <option value="">— Sélectionner —</option>
                            {chiffrageParams.tiersPayeurs.map((t, i) => (
                              <option key={i} value={t}>{t}</option>
                            ))}
                            <option value="autre">Autre...</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-700">Libellé / Description</label>
                          <input id="pgpa-ij-label" type="text" defaultValue={data.label || ''} placeholder="Ex: IJ Sécurité sociale" className="mt-1 w-full px-3 py-2 border rounded-lg" />
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-700">Commentaire</label>
                          <textarea id="pgpa-ij-commentaire" rows={2} defaultValue={data.commentaire || ''} placeholder="Informations complémentaires..." className="mt-1 w-full px-3 py-2 border rounded-lg resize-none" />
                        </div>
                      </div>
                    </div>
                    
                    {/* Section Période d'arrêt */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b">Période d'arrêt de travail</h4>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-700">Date de début</label>
                            <input id="pgpa-ij-debut" type="text" defaultValue={data.periodeDebut || ''} placeholder="JJ/MM/AAAA" className="mt-1 w-full px-3 py-2 border rounded-lg" />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700">Date de fin</label>
                            <input id="pgpa-ij-fin" type="text" defaultValue={data.periodeFin || ''} placeholder="JJ/MM/AAAA" className="mt-1 w-full px-3 py-2 border rounded-lg" />
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-700">Nombre de jours indemnisés</label>
                          <input id="pgpa-ij-jours" type="number" defaultValue={data.jours || ''} placeholder="0" className="mt-1 w-full px-3 py-2 border rounded-lg" />
                          <p className="mt-1 text-xs text-gray-500">Peut différer de la durée calendaire (carence, plafond...)</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Section Montants */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b">Montants</h4>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-700">Indemnité brute perçue</label>
                            <div className="mt-1 relative">
                              <input id="pgpa-ij-brut" type="number" step="0.01" defaultValue={data.montantBrut || ''} placeholder="0.00" className="w-full px-3 py-2 pr-8 border rounded-lg" />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700">CSG-CRDS</label>
                            <div className="mt-1 relative">
                              <input id="pgpa-ij-csg" type="number" step="0.01" defaultValue={data.csgCrds || ''} placeholder="0.00" className="w-full px-3 py-2 pr-8 border rounded-lg" />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-green-800">Indemnité nette perçue</span>
                            <span className="font-semibold text-green-900">{fmt(data.montant || 0)}</span>
                          </div>
                          <p className="text-xs text-green-600 mt-1">Brut − CSG-CRDS</p>
                        </div>
                        
                        <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-purple-800">Créance du tiers payeur</span>
                            <span className="font-bold text-purple-900">{fmt(data.montant || 0)}</span>
                          </div>
                          <p className="text-xs text-purple-600">Ce montant sera déduit de l'indemnité victime et versé directement au tiers payeur</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Panel DFT */}
                {editPanel.type === 'dft-ligne' && (
                  <>
                    {data?.status === 'ai-suggested' && data?.confidence && (
                      <div className="flex items-center gap-3 p-4 rounded-xl bg-indigo-50 border border-indigo-200 mb-4">
                        <Sparkles className="w-5 h-5 text-indigo-600" />
                        <span className="text-[13px] font-medium text-indigo-700">Suggestion IA · Confiance {data.confidence}%</span>
                      </div>
                    )}
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b">Pièces justificatives</h4>

                        {editingPieceIds.length > 0 && (
                          <div className="space-y-2 mb-3">
                            {editingPieceIds.map(pid => {
                              const piece = getPiece(pid);
                              return piece ? (
                                <div key={pid} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg border group">
                                  <span className="w-8 h-8 bg-blue-100 text-blue-700 text-xs font-medium rounded flex items-center justify-center flex-shrink-0">
                                    {getPieceLabel(pid)}
                                  </span>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{piece.intitule || piece.nom}</p>
                                    <p className="text-xs text-gray-500">{piece.type}</p>
                                  </div>
                                  <button onClick={() => setShowPreview(!showPreview)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => setEditingPieceIds(prev => prev.filter(id => id !== pid))} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : null;
                            })}
                          </div>
                        )}

                        <div className="border-2 border-dashed rounded-lg p-3 space-y-3 bg-gray-50/50">
                          {pieces.filter(p => !editingPieceIds.includes(p.id)).length > 0 && (
                            <div>
                              <div className="relative mb-2">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" strokeWidth={1.5} />
                                <input type="text" value={searchPiecesPanel} onChange={(e) => setSearchPiecesPanel(e.target.value)} placeholder="Rechercher une pièce..."
                                  className="w-full pl-8 pr-7 py-1.5 text-[12px] border border-zinc-200 rounded-md bg-white placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-300" />
                                {searchPiecesPanel && <button onClick={() => setSearchPiecesPanel('')} className="absolute right-2 top-1/2 -translate-y-1/2"><X className="w-3 h-3 text-zinc-400" /></button>}
                              </div>
                              <div className="max-h-32 overflow-y-auto space-y-1">
                                {pieces.filter(p => !editingPieceIds.includes(p.id)).filter(p => !searchPiecesPanel.trim() || (p.intitule || p.nom || '').toLowerCase().includes(searchPiecesPanel.trim().toLowerCase()) || (p.type || '').toLowerCase().includes(searchPiecesPanel.trim().toLowerCase())).map(piece => (
                                  <button key={piece.id} onClick={() => { setEditingPieceIds(prev => [...prev, piece.id]); setSearchPiecesPanel(''); }}
                                    className="w-full flex items-center gap-2 p-2 text-left text-sm bg-white border rounded hover:bg-blue-50 hover:border-blue-300 transition-colors">
                                    <span className="w-6 h-6 bg-blue-100 text-blue-700 text-[10px] font-medium rounded flex items-center justify-center flex-shrink-0">{getPieceLabel(piece.id)}</span>
                                    <span className="truncate flex-1">{piece.intitule || piece.nom}</span>
                                    <span className="text-xs text-gray-400">{piece.type}</span>
                                    <Plus className="w-4 h-4 text-blue-600" />
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                          <input type="file" id="panel-piece-upload" multiple accept=".pdf,.jpg,.jpeg,.png" className="hidden"
                            onChange={(e) => { if (e.target.files?.length) { handleUploadPieceForPanel(e.target.files); e.target.value = ''; } }} />
                          <button onClick={() => document.getElementById('panel-piece-upload').click()}
                            className="w-full flex items-center justify-center gap-2 p-2 text-sm text-zinc-600 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 hover:border-zinc-300 transition-colors">
                            <Upload className="w-4 h-4" />
                            Ajouter un document
                          </button>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b">Période</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div><label className="block text-xs text-gray-500 mb-1">Date début</label><input type="text" id="dft-debut" defaultValue={data.debut} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="JJ/MM/AAAA" /></div>
                          <div><label className="block text-xs text-gray-500 mb-1">Date fin</label><input type="text" id="dft-fin" defaultValue={data.fin} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="JJ/MM/AAAA" /></div>
                        </div>
                        <div className="mt-3"><label className="block text-xs text-gray-500 mb-1">Total jours</label><input type="number" id="dft-jours" defaultValue={data.jours} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b">Paramètres</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div><label className="block text-xs text-gray-500 mb-1">Taux DFT</label><div className="relative"><input type="number" id="dft-taux" defaultValue={data.taux || 100} min={0} max={100} className="w-full px-3 py-2 pr-8 border rounded-lg text-sm" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">%</span></div></div>
                          <div><label className="block text-xs text-gray-500 mb-1">Base journalière</label><div className="relative"><input type="number" id="dft-base" defaultValue={chiffrageParams.baseJournaliereDFT || 33} className="w-full px-3 py-2 pr-10 border rounded-lg text-sm" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">€/j</span></div></div>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b">Contenu</h4>
                        <div><label className="block text-xs text-gray-500 mb-1">Libellé</label><input type="text" id="dft-label" defaultValue={data.label || ''} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                        <div className="mt-3"><label className="block text-xs text-gray-500 mb-1">Commentaire</label><textarea id="dft-commentaire" defaultValue={data.commentaire || ''} rows={3} className="w-full px-3 py-2 border rounded-lg text-sm resize-none" /></div>
                      </div>
                    </div>
                  </>
                )}

              </div>

              {/* Bandeau Montant calculé — sticky entre scroll et action bar */}
              {editPanel.type === 'dsa-ligne' && (
                <div className="px-5 py-3 border-t bg-zinc-50 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-zinc-600">Montant calculé</span>
                    <p className="text-[11px] text-zinc-400">Calculé automatiquement à partir des champs ci-dessus</p>
                  </div>
                  <span className="text-lg font-bold text-zinc-900 tabular-nums">{fmt(data.montant || 0)}</span>
                </div>
              )}
              {editPanel.type === 'pgpa-revenu' && (
                <div className="px-5 py-3 border-t bg-zinc-50 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-zinc-600">Montant calculé</span>
                    <p className="text-[11px] text-zinc-400">Calculé automatiquement à partir des champs ci-dessus</p>
                  </div>
                  <span className="text-lg font-bold text-zinc-900 tabular-nums">{fmt(data.montant || 0)}</span>
                </div>
              )}
              {editPanel.type === 'pgpa-revenu-percu' && (
                <div className="px-5 py-3 border-t bg-zinc-50 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-zinc-600">Montant calculé</span>
                    <p className="text-[11px] text-zinc-400">Calculé automatiquement à partir des champs ci-dessus</p>
                  </div>
                  <span className="text-lg font-bold text-zinc-900 tabular-nums">{fmt(data.montant || 0)}</span>
                </div>
              )}
              {editPanel.type === 'pgpa-ij' && (
                <div className="px-5 py-3 border-t bg-zinc-50 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-zinc-600">Montant calculé</span>
                    <p className="text-[11px] text-zinc-400">Indemnité nette (brut − CSG-CRDS)</p>
                  </div>
                  <span className="text-lg font-bold text-zinc-900 tabular-nums">{fmt(data.montant || 0)}</span>
                </div>
              )}
              {editPanel.type === 'dft-ligne' && (
                <div className="px-5 py-3 border-t bg-zinc-50 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-zinc-600">Montant calculé</span>
                    <p className="text-[11px] text-zinc-400">{data.jours || 0}j × {data.taux || 100}% × {chiffrageParams.baseJournaliereDFT || 33} €/j</p>
                  </div>
                  <span className="text-lg font-bold text-zinc-900 tabular-nums">{fmt(data.montant || 0)}</span>
                </div>
              )}

              {/* Footer */}
              {editPanel.type === 'dsa-ligne' && (
                <div className="px-5 py-4 border-t bg-gray-50 flex justify-between">
                  <button onClick={() => { handleRejectLigne(data.id); setEditPanel(null); }} className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2">
                    <Trash2 className="w-4 h-4" />Supprimer
                  </button>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditPanel(null); setShowPreview(false); }} className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg">Annuler</button>
                    <button onClick={() => handleSaveLigne(data.id, {
                      label: document.getElementById('edit-label')?.value || 'Dépense',
                      type: document.getElementById('edit-type')?.value || 'Autre',
                      date: document.getElementById('edit-date')?.value || '',
                      montant: parseFloat(document.getElementById('edit-montant')?.value) || 0,
                      tiers: document.getElementById('edit-tiers')?.value || '',
                      dejaRembourse: parseFloat(document.getElementById('edit-rembourse')?.value) || 0
                    })} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Enregistrer</button>
                  </div>
                </div>
              )}
              {editPanel.type === 'piece-detail' && (
                <div className="px-5 py-4 border-t bg-gray-50 flex justify-between">
                  <button onClick={() => {
                    // Supprimer la pièce
                    setPieces(prev => prev.filter(p => p.id !== data.id));
                    // Supprimer aussi les références dans les lignes DSA, PGPA, etc.
                    setDsaLignes(prev => prev.map(l => ({
                      ...l,
                      pieceIds: l.pieceIds?.filter(pid => pid !== data.id) || []
                    })));
                    setPgpaData(prev => ({
                      ...prev,
                      revenuRef: {
                        ...prev.revenuRef,
                        lignes: prev.revenuRef.lignes.map(l => ({
                          ...l,
                          pieceIds: l.pieceIds?.filter(pid => pid !== data.id) || []
                        }))
                      },
                      revenusPercus: prev.revenusPercus.map(l => ({
                        ...l,
                        pieceIds: l.pieceIds?.filter(pid => pid !== data.id) || []
                      })),
                      ijPercues: prev.ijPercues.map(l => ({
                        ...l,
                        pieceIds: l.pieceIds?.filter(pid => pid !== data.id) || []
                      }))
                    }));
                    setEditPanel(null);
                  }} className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2">
                    <Trash2 className="w-4 h-4" />Supprimer
                  </button>
                  <div className="flex gap-2">
                    <button onClick={() => setEditPanel(null)} className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg">Annuler</button>
                    <button onClick={() => {
                      const updatedPiece = {
                        ...data,
                        intitule: document.getElementById('piece-intitule')?.value || data.intitule,
                        type: document.getElementById('piece-type')?.value || data.type,
                        date: document.getElementById('piece-date')?.value || data.date
                      };
                      setPieces(prev => prev.map(p => p.id === data.id ? updatedPiece : p));
                      setEditPanel(null);
                    }} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Enregistrer</button>
                  </div>
                </div>
              )}
              {(editPanel.type === 'victime' || editPanel.type === 'fait-generateur') && (
                <div className="px-5 py-4 border-t bg-gray-50 flex justify-end gap-2">
                  <button onClick={() => setEditPanel(null)} className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg">Annuler</button>
                  <button onClick={() => {
                    if (editPanel.type === 'victime') {
                      setVictimeData({
                        nom: document.getElementById('victime-nom')?.value || '',
                        prenom: document.getElementById('victime-prenom')?.value || '',
                        sexe: document.getElementById('victime-sexe')?.value || 'Homme',
                        dateNaissance: document.getElementById('victime-naissance')?.value || '',
                        dateDeces: document.getElementById('victime-deces')?.value || null
                      });
                    } else {
                      setFaitGenerateur({
                        type: document.getElementById('fait-type')?.value || '',
                        dateAccident: document.getElementById('fait-date-accident')?.value || '',
                        datePremiereConstatation: document.getElementById('fait-date-constat')?.value || '',
                        dateConsolidation: document.getElementById('fait-date-conso')?.value || '',
                        resume: document.getElementById('fait-resume')?.value || ''
                      });
                    }
                    setEditPanel(null);
                  }} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Enregistrer</button>
                </div>
              )}
              {editPanel.type === 'dossier-expertise' && (
                <div className="px-5 py-4 border-t bg-gray-50 flex justify-end gap-2">
                  <button onClick={() => setEditPanel(null)} className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg">Annuler</button>
                  <button onClick={() => {
                    setCommentaireExpertise(document.getElementById('proc-commentaire')?.value || '');
                    setEditPanel(null);
                  }} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Enregistrer</button>
                </div>
              )}
              {editPanel.type === 'victime-indirecte' && (
                <div className="px-5 py-4 border-t bg-gray-50 flex justify-between">
                  {data && (
                    <button onClick={() => {
                      setVictimesIndirectes(prev => prev.filter(vi => vi.id !== data.id));
                      setEditPanel(null);
                    }} className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2">
                      <Trash2 className="w-4 h-4" />Supprimer
                    </button>
                  )}
                  {!data && <div />}
                  <div className="flex gap-2">
                    <button onClick={() => setEditPanel(null)} className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg">Annuler</button>
                    <button onClick={() => {
                      const newVi = {
                        id: data?.id || `vi-${Date.now()}`,
                        nom: document.getElementById('vi-nom')?.value || '',
                        prenom: document.getElementById('vi-prenom')?.value || '',
                        sexe: document.getElementById('vi-sexe')?.value || 'Homme',
                        dateNaissance: document.getElementById('vi-naissance')?.value || '',
                        lien: document.getElementById('vi-lien')?.value || 'Conjoint'
                      };
                      if (data) {
                        setVictimesIndirectes(prev => prev.map(vi => vi.id === data.id ? newVi : vi));
                      } else {
                        setVictimesIndirectes(prev => [...prev, newVi]);
                      }
                      setEditPanel(null);
                    }} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Enregistrer</button>
                  </div>
                </div>
              )}
              {/* Panel nouvelle-procedure supprimé */}
              {editPanel.type === 'dossier-edit' && (
                <div className="px-5 py-4 border-t bg-gray-50 flex justify-end gap-2">
                  <button onClick={() => setEditPanel(null)} className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg">Annuler</button>
                  <button onClick={() => {
                    setDossierRef(document.getElementById('dossier-ref')?.value || dossierRef);
                    setDossierIntitule(document.getElementById('dossier-intitule')?.value || dossierIntitule);
                    setDossierStatut(document.getElementById('dossier-statut')?.value || dossierStatut);
                    setDossierDateOuverture(document.getElementById('dossier-date-ouverture')?.value || dossierDateOuverture);
                    setDossierAvocat(document.getElementById('dossier-avocat')?.value || dossierAvocat);
                    setDossierNotes(document.getElementById('dossier-notes')?.value || '');
                    setEditPanel(null);
                  }} className="px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700">Enregistrer</button>
                </div>
              )}
              {/* ========== PANELS PGPA ========== */}

              {/* Panel PGPA Revenu de référence */}
              {editPanel.type === 'pgpa-revenu' && (
                <div className="px-5 py-4 border-t bg-gray-50 flex justify-between">
                  <button onClick={() => {
                    setPgpaData(prev => ({
                      ...prev,
                      revenuRef: {
                        ...prev.revenuRef,
                        lignes: prev.revenuRef.lignes.filter(l => l.id !== data.id)
                      }
                    }));
                    setEditPanel(null);
                    setEditingPieceIds([]);
                  }} className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2">
                    <Trash2 className="w-4 h-4" />Supprimer
                  </button>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditPanel(null); setEditingPieceIds([]); }} className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg">Annuler</button>
                    <button onClick={() => {
                      const updatedLigne = {
                        ...data,
                        type: document.getElementById('pgpa-revenu-type')?.value || data.type,
                        label: document.getElementById('pgpa-revenu-label')?.value || data.label,
                        annee: document.getElementById('pgpa-revenu-annee')?.value || data.annee,
                        unite: document.getElementById('pgpa-revenu-unite')?.value || data.unite,
                        commentaire: document.getElementById('pgpa-revenu-commentaire')?.value || '',
                        montant: parseFloat(document.getElementById('pgpa-revenu-montant')?.value) || data.montant,
                        aRevaloriser: document.getElementById('pgpa-revenu-revalo-checkbox')?.checked ?? true,
                        pieceIds: editingPieceIds,
                        status: 'validated'
                      };
                      setPgpaData(prev => ({
                        ...prev,
                        revenuRef: {
                          ...prev.revenuRef,
                          lignes: prev.revenuRef.lignes.map(l => l.id === data.id ? updatedLigne : l)
                        }
                      }));
                      setEditPanel(null);
                      setEditingPieceIds([]);
                    }} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Enregistrer</button>
                  </div>
                </div>
              )}

              {/* Panel PGPA Revenu perçu période */}
              {editPanel.type === 'pgpa-revenu-percu' && (
                <div className="px-5 py-4 border-t bg-gray-50 flex justify-between">
                  <button onClick={() => {
                    setPgpaData(prev => ({
                      ...prev,
                      revenusPercus: prev.revenusPercus.filter(l => l.id !== data.id)
                    }));
                    setEditPanel(null);
                    setEditingPieceIds([]);
                  }} className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2">
                    <Trash2 className="w-4 h-4" />Supprimer
                  </button>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditPanel(null); setEditingPieceIds([]); }} className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg">Annuler</button>
                    <button onClick={() => {
                      const updatedLigne = {
                        ...data,
                        label: document.getElementById('pgpa-percu-label')?.value || data.label,
                        tiers: document.getElementById('pgpa-percu-tiers')?.value || data.tiers,
                        commentaire: document.getElementById('pgpa-percu-commentaire')?.value || '',
                        periodeDebut: document.getElementById('pgpa-percu-debut')?.value || data.periodeDebut,
                        periodeFin: document.getElementById('pgpa-percu-fin')?.value || data.periodeFin,
                        montant: parseFloat(document.getElementById('pgpa-percu-montant')?.value) || data.montant,
                        unite: document.getElementById('pgpa-percu-unite')?.value || data.unite,
                        noRevalo: document.getElementById('pgpa-percu-no-revalo')?.checked ?? false,
                        pieceIds: editingPieceIds,
                        status: 'validated'
                      };
                      setPgpaData(prev => ({
                        ...prev,
                        revenusPercus: prev.revenusPercus.map(l => l.id === data.id ? updatedLigne : l)
                      }));
                      setEditPanel(null);
                      setEditingPieceIds([]);
                    }} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Enregistrer</button>
                  </div>
                </div>
              )}

              {/* Panel PGPA Indemnités journalières */}
              {editPanel.type === 'pgpa-ij' && (
                <div className="px-5 py-4 border-t bg-gray-50 flex justify-between">
                  <button onClick={() => {
                    setPgpaData(prev => ({
                      ...prev,
                      ijPercues: prev.ijPercues.filter(l => l.id !== data.id)
                    }));
                    setEditPanel(null);
                    setEditingPieceIds([]);
                  }} className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2">
                    <Trash2 className="w-4 h-4" />Supprimer
                  </button>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditPanel(null); setEditingPieceIds([]); }} className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg">Annuler</button>
                    <button onClick={() => {
                      const montantBrut = parseFloat(document.getElementById('pgpa-ij-brut')?.value) || 0;
                      const csgCrds = parseFloat(document.getElementById('pgpa-ij-csg')?.value) || 0;
                      const updatedLigne = {
                        ...data,
                        tiers: document.getElementById('pgpa-ij-tiers')?.value || data.tiers,
                        label: document.getElementById('pgpa-ij-label')?.value || data.label,
                        commentaire: document.getElementById('pgpa-ij-commentaire')?.value || '',
                        periodeDebut: document.getElementById('pgpa-ij-debut')?.value || data.periodeDebut,
                        periodeFin: document.getElementById('pgpa-ij-fin')?.value || data.periodeFin,
                        jours: parseInt(document.getElementById('pgpa-ij-jours')?.value) || data.jours,
                        montantBrut: montantBrut,
                        csgCrds: csgCrds,
                        montant: montantBrut - csgCrds,
                        pieceIds: editingPieceIds,
                        status: 'validated'
                      };
                      setPgpaData(prev => ({
                        ...prev,
                        ijPercues: prev.ijPercues.map(l => l.id === data.id ? updatedLigne : l)
                      }));
                      setEditPanel(null);
                      setEditingPieceIds([]);
                    }} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Enregistrer</button>
                  </div>
                </div>
              )}

              {/* Panel DFT Footer */}
              {editPanel.type === 'dft-ligne' && (
                <div className="px-5 py-4 border-t bg-gray-50 flex justify-between">
                  <button onClick={() => {
                    setDftLignes(prev => prev.filter(l => l.id !== data.id));
                    setEditPanel(null); setEditingPieceIds([]);
                  }} className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2">
                    <Trash2 className="w-4 h-4" />Supprimer
                  </button>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditPanel(null); setEditingPieceIds([]); }} className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg">Annuler</button>
                    <button onClick={() => {
                      const jours = parseInt(document.getElementById('dft-jours')?.value) || data.jours;
                      const taux = parseInt(document.getElementById('dft-taux')?.value) || data.taux || 100;
                      const baseJ = parseFloat(document.getElementById('dft-base')?.value) || chiffrageParams.baseJournaliereDFT || 33;
                      const updatedLigne = {
                        ...data,
                        label: document.getElementById('dft-label')?.value || data.label,
                        debut: document.getElementById('dft-debut')?.value || data.debut,
                        fin: document.getElementById('dft-fin')?.value || data.fin,
                        jours, taux,
                        commentaire: document.getElementById('dft-commentaire')?.value || '',
                        montant: Math.round(jours * taux / 100 * baseJ),
                        pieceIds: editingPieceIds,
                        status: 'validated'
                      };
                      setDftLignes(prev => prev.map(l => l.id === data.id ? updatedLigne : l));
                      setEditPanel(null); setEditingPieceIds([]);
                    }} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Enregistrer</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ========== HELPERS STATUT LIGNE ==========
  // Détermine si une ligne est incomplète (champs requis manquants pour calculer le montant)
  const isLigneIncomplete = (ligne) => {
    // Champs requis pour DSA : label, date, montant
    if (!ligne.label || !ligne.date || ligne.montant == null) return true;
    return false;
  };

  // Statut effectif d'une ligne
  const getLigneStatus = (ligne) => {
    if (ligne.status === 'ai-suggested' || ligne.status === 'suggested') return 'suggested';
    return 'normal';
  };

  // ========== DSA LIGNE COMPONENT ==========
  const renderDsaLigne = (ligne) => {
    const status = getLigneStatus(ligne);
    const isError = ligne.status === 'error';
    const pieceCount = ligne.pieceIds?.length || 0;

    if (isError) {
      return (
        <div key={ligne.id} className="relative flex items-center p-3 bg-red-50 group">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <X className="w-3 h-3 text-red-500" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-red-900 truncate">{ligne.fileName}</div>
              <div className="text-xs text-red-600">{ligne.error}</div>
            </div>
          </div>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-l from-red-50 via-red-50 to-transparent pl-6 pr-1">
            <button onClick={() => openDsaEditPanel({ ...ligne, label: '', type: '', date: '', montant: null })} className="px-2.5 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 shadow-sm">Compléter</button>
            <button onClick={() => handleRejectLigne(ligne.id)} className="p-1.5 text-red-500 bg-white hover:bg-red-100 rounded shadow-sm border border-red-200"><X className="w-3.5 h-3.5" /></button>
          </div>
        </div>
      );
    }

    // Icône de statut
    const StatusIcon = () => {
      if (status === 'suggested') return <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0" title="Suggestion IA"><Sparkles className="w-3 h-3 text-indigo-500" /></div>;
      return null;
    };

    // Indicateur pièces avec tooltip
    const PieceIndicator = () => {
      if (pieceCount === 0) return null;
      return (
        <div className="relative group/piece">
          <span className="inline-flex items-center justify-center w-7 h-7 bg-blue-50 text-blue-600 rounded border border-blue-100 relative">
            <FileText className="w-3.5 h-3.5" />
            {pieceCount > 1 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-blue-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {pieceCount}
              </span>
            )}
          </span>
          <div className="absolute left-0 top-full mt-1 w-56 p-2 bg-white border border-zinc-200 rounded-lg shadow-lg opacity-0 invisible group-hover/piece:opacity-100 group-hover/piece:visible transition-all z-50">
            <div className="text-[10px] font-medium text-zinc-400 uppercase tracking-wide mb-1.5">{pieceCount} document{pieceCount > 1 ? 's' : ''} lié{pieceCount > 1 ? 's' : ''}</div>
            <div className="space-y-1">
              {ligne.pieceIds?.map(pid => {
                const piece = getPiece(pid);
                return (
                  <div key={pid} className="flex items-center gap-2 text-xs">
                    <span className="w-5 h-5 bg-blue-100 text-blue-700 text-[10px] font-medium rounded flex items-center justify-center flex-shrink-0">{getPieceLabel(pid)}</span>
                    <span className="truncate text-zinc-700">{piece?.intitule || piece?.nom || 'Document'}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    };

    return (
      <div key={ligne.id} className="relative flex items-center p-3 hover:bg-zinc-50 group transition-colors">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <StatusIcon />
          <PieceIndicator />
          <div className="min-w-0">
            <div className="text-sm font-medium text-zinc-800 truncate">{ligne.label || 'Sans libellé'}</div>
            <div className="text-xs text-zinc-400">{ligne.date || '—'} • {ligne.type || '—'}</div>
          </div>
        </div>

        {/* Montant - PRIORITAIRE */}
        <span className="text-sm font-semibold text-zinc-900 tabular-nums min-w-[90px] text-right flex-shrink-0">
          {ligne.montant != null ? fmt(ligne.montant) : '— €'}
        </span>

        {/* Actions en overlay au hover - minimaliste */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => handleRejectLigne(ligne.id)} className="p-1.5 text-zinc-400 hover:text-zinc-600 transition-colors" title="Supprimer">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  // ========== PGPA/PGPF LIGNE COMPONENT ==========
  const renderPGLigne = (ligne, { onEdit, onDelete, showTiers = true, showPeriode = true, onValidate }) => {
    const isSuggested = ligne.status === 'ai-suggested' || ligne.status === 'suggested';
    const pieceCount = ligne.pieceIds?.length || 0;

    // Icône de statut - harmonisé
    const StatusIcon = () => {
      if (isSuggested) return <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0" title="Suggestion IA"><Sparkles className="w-3 h-3 text-indigo-500" /></div>;
      return null;
    };

    // Indicateur pièces avec tooltip
    const PieceIndicator = () => {
      if (pieceCount === 0) return null;
      return (
        <div className="relative group/piece">
          <span className="inline-flex items-center justify-center w-7 h-7 bg-blue-50 text-blue-600 rounded border border-blue-100 relative">
            <FileText className="w-3.5 h-3.5" />
            {pieceCount > 1 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-blue-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {pieceCount}
              </span>
            )}
          </span>
          <div className="absolute left-0 top-full mt-1 w-56 p-2 bg-white border border-zinc-200 rounded-lg shadow-lg opacity-0 invisible group-hover/piece:opacity-100 group-hover/piece:visible transition-all z-50">
            <div className="text-[10px] font-medium text-zinc-400 uppercase tracking-wide mb-1.5">{pieceCount} document{pieceCount > 1 ? 's' : ''} lié{pieceCount > 1 ? 's' : ''}</div>
            <div className="space-y-1">
              {ligne.pieceIds?.map(pid => {
                const piece = getPiece(pid);
                return (
                  <div key={pid} className="flex items-center gap-2 text-xs">
                    <span className="w-5 h-5 bg-blue-100 text-blue-700 text-[10px] font-medium rounded flex items-center justify-center flex-shrink-0">{getPieceLabel(pid)}</span>
                    <span className="truncate text-zinc-700">{piece?.intitule || piece?.nom || 'Document'}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    };

    // Description secondaire
    const getSecondaryText = () => {
      const parts = [];
      if (showPeriode && ligne.periode) parts.push(ligne.periode);
      if (showPeriode && ligne.annee) parts.push(ligne.annee);
      if (showTiers && ligne.tiers) parts.push(ligne.tiers);
      return parts.join(' • ');
    };

    return (
      <div key={ligne.id} className="relative flex items-center p-3 hover:bg-zinc-50 group transition-colors">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <StatusIcon />
          <PieceIndicator />
          <div className="min-w-0">
            <div className="text-sm font-medium text-zinc-800 truncate">{ligne.label || 'Sans libellé'}</div>
            <div className="text-xs text-zinc-400">{getSecondaryText() || '—'}</div>
          </div>
        </div>

        {/* Montant - PRIORITAIRE */}
        <span className="text-sm font-semibold text-zinc-900 tabular-nums min-w-[90px] text-right flex-shrink-0">
          {fmt(ligne.montant || ligne.revalorise || 0)}
        </span>

        {/* Actions en overlay au hover - minimaliste */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onDelete && (
            <button onClick={() => onDelete(ligne)} className="p-1.5 text-zinc-400 hover:text-zinc-600 transition-colors" title="Supprimer">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  };

  // (wizard supprimé - aplati au niveau dossier)
  const renderSmartProcedureWizard = () => null;

  // ========== RENDER CONTENT ==========
  const renderContent = () => {
    // DOSSIER
    if (currentLevel.type === 'dossier') {
      if (currentLevel.activeTab === 'détail') {
        return (
          <div className="grid grid-cols-3 gap-4 items-start">
            {/* Colonne gauche */}
            <div className="col-span-2 space-y-4">
              {/* Infos Victime */}
              <div className="bg-white rounded-lg border border-zinc-200/60 shadow-sm">
                <div className="px-4 py-2.5 border-b border-zinc-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                    <span className="text-[13px] font-medium">Informations victime</span>
                  </div>
                  <button onClick={() => setEditPanel({ type: 'victime', title: 'Informations victime' })} className="p-1 text-zinc-300 hover:text-zinc-500 hover:bg-zinc-100 rounded transition-colors"><Edit3 className="w-3.5 h-3.5" strokeWidth={1.5} /></button>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                    <div>
                      <div className="text-[12px] text-zinc-400 mb-0.5">Nom</div>
                      <div className="text-[14px] text-zinc-700">{victimeData.nom}</div>
                    </div>
                    <div>
                      <div className="text-[12px] text-zinc-400 mb-0.5">Prénom</div>
                      <div className="text-[14px] text-zinc-700">{victimeData.prenom}</div>
                    </div>
                    <div>
                      <div className="text-[12px] text-zinc-400 mb-0.5">Sexe</div>
                      <div className="text-[14px] text-zinc-700">{victimeData.sexe}</div>
                    </div>
                    <div>
                      <div className="text-[12px] text-zinc-400 mb-0.5">Date de naissance</div>
                      <div className="text-[14px] text-zinc-700">{victimeData.dateNaissance} <span className="text-zinc-400">({calcAge(victimeData.dateNaissance)} ans)</span></div>
                    </div>
                    {victimeData.dateDeces && (
                      <div>
                        <div className="text-[12px] text-zinc-400 mb-0.5">Date de décès</div>
                        <div className="text-[14px] text-zinc-700">{victimeData.dateDeces} <span className="text-zinc-400">({calcAge(victimeData.dateNaissance, victimeData.dateDeces)} ans)</span></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Infos Accident */}
              <div className="bg-white rounded-lg border border-zinc-200/60 shadow-sm">
                <div className="px-4 py-2.5 border-b border-zinc-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                    <span className="text-[13px] font-medium">Fait générateur</span>
                  </div>
                  <button onClick={() => setEditPanel({ type: 'fait-generateur', title: 'Fait générateur' })} className="p-1 text-zinc-300 hover:text-zinc-500 hover:bg-zinc-100 rounded transition-colors"><Edit3 className="w-3.5 h-3.5" strokeWidth={1.5} /></button>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3 mb-4">
                    <div>
                      <div className="text-[12px] text-zinc-400 mb-0.5">Type</div>
                      <div className="text-[14px] text-zinc-700">{faitGenerateur.type}</div>
                    </div>
                    <div>
                      <div className="text-[12px] text-zinc-400 mb-0.5">Date de l'accident</div>
                      <div className="text-[14px] text-zinc-700">{faitGenerateur.dateAccident}</div>
                    </div>
                    <div>
                      <div className="text-[12px] text-zinc-400 mb-0.5">Première constatation</div>
                      <div className="text-[14px] text-zinc-700">{faitGenerateur.datePremiereConstatation}</div>
                    </div>
                    <div>
                      <div className="text-[12px] text-zinc-400 mb-0.5">Consolidation</div>
                      <div className="text-[14px] text-zinc-700">{faitGenerateur.dateConsolidation}</div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="text-[12px] text-zinc-400">Résumé des faits</div>
                      {!faitGenerateur.resume && (
                        <button
                          onClick={handleGenerateResume}
                          disabled={aiGenerating === 'resume'}
                          className="flex items-center gap-1 text-[11px] font-medium text-violet-500 hover:text-violet-700 transition-colors disabled:opacity-50"
                        >
                          {aiGenerating === 'resume' ? (
                            <><Loader2 className="w-3 h-3 animate-spin" strokeWidth={2} />Génération...</>
                          ) : (
                            <><Sparkles className="w-3 h-3" strokeWidth={2} />Générer avec l'IA</>
                          )}
                        </button>
                      )}
                    </div>
                    <div className="text-[14px] text-zinc-600 leading-relaxed">
                      {faitGenerateur.resume || <span className="text-zinc-300 italic">Aucun résumé renseigné.</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Commentaire d'expertise */}
              <div className="bg-white rounded-lg border border-zinc-200/60 shadow-sm">
                <div className="px-4 py-2.5 border-b border-zinc-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                    </svg>
                    <span className="text-[13px] font-medium">Commentaire d'expertise</span>
                  </div>
                  <button onClick={() => setEditPanel({ type: 'dossier-expertise', title: "Commentaire d'expertise" })} className="p-1 text-zinc-300 hover:text-zinc-500 hover:bg-zinc-100 rounded transition-colors"><Edit3 className="w-3.5 h-3.5" strokeWidth={1.5} /></button>
                </div>
                <div className="p-4">
                  <div className="text-[14px] text-zinc-600 leading-relaxed">
                    {commentaireExpertise || <span className="text-zinc-300 italic">Aucun commentaire d'expertise renseigné.</span>}
                  </div>
                  {!commentaireExpertise && (
                    <button
                      onClick={handleGenerateExpertise}
                      disabled={aiGenerating === 'expertise'}
                      className="mt-3 flex items-center gap-1.5 text-[12px] font-medium text-violet-500 hover:text-violet-700 transition-colors disabled:opacity-50"
                    >
                      {aiGenerating === 'expertise' ? (
                        <><Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2} />Génération en cours...</>
                      ) : (
                        <><Sparkles className="w-3.5 h-3.5" strokeWidth={2} />Générer avec l'IA</>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Victimes indirectes */}
              <div className="bg-white rounded-lg border border-zinc-200/60 shadow-sm">
                <div className="px-4 py-2.5 border-b border-zinc-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                    </svg>
                    <span className="text-[13px] font-medium">Victimes indirectes</span>
                  </div>
                  <button
                    onClick={() => setEditPanel({ type: 'victime-indirecte', title: 'Nouvelle victime indirecte', data: null })}
                    className="flex items-center gap-1 px-2 py-1 text-[12px] text-zinc-500 hover:bg-zinc-100 rounded transition-colors"
                  >
                    <Plus className="w-3 h-3" strokeWidth={1.5} />Ajouter
                  </button>
                </div>
                {victimesIndirectes.length > 0 ? (
                  <div className="divide-y divide-zinc-100">
                    {victimesIndirectes.map(vi => (
                      <div key={vi.id} className="flex items-center justify-between p-3 hover:bg-zinc-50 group transition-colors">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-[12px] text-zinc-500 font-medium">
                            {vi.prenom[0]}{vi.nom[0]}
                          </div>
                          <div>
                            <div className="text-[14px] text-zinc-700">{vi.prenom} {vi.nom}</div>
                            <div className="text-[12px] text-zinc-400">{vi.lien} • {calcAge(vi.dateNaissance)} ans</div>
                          </div>
                        </div>
                        <button
                          onClick={() => setEditPanel({ type: 'victime-indirecte', title: 'Modifier victime indirecte', data: vi })}
                          className="p-1 text-zinc-300 hover:text-zinc-500 rounded opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Edit3 className="w-3.5 h-3.5" strokeWidth={1.5} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center">
                    <div className="text-[13px] text-zinc-400">Aucune victime indirecte</div>
                  </div>
                )}
              </div>
            </div>

            {/* Colonne droite — Encart Chiffrage (sticky) */}
            <div className="col-span-1 sticky top-0">
              <div className="bg-white rounded-lg border border-zinc-200/60 shadow-sm">
                <div className="px-4 py-2.5 border-b border-zinc-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Calculator className="w-4 h-4" strokeWidth={1.5} />
                    <span className="text-[13px] font-medium">Chiffrage</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('Chiffrage')}
                    className="flex items-center gap-1 text-[12px] text-zinc-400 hover:text-zinc-600 transition-colors"
                  >
                    Voir le détail
                    <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </div>
                <div className="p-5">
                  <div className="text-center">
                    <div className="text-[36px] font-semibold text-zinc-800 tabular-nums leading-none">{fmt(totalChiffrage)}</div>
                    <div className="text-[13px] text-zinc-400 mt-1.5">{allPostes.filter(p => !p.disabled).length} postes de préjudice chiffrés</div>
                    <button
                      onClick={() => setActiveTab('Chiffrage')}
                      className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-800 text-white text-[13px] font-medium rounded-lg hover:bg-zinc-700 transition-colors"
                    >
                      Voir le chiffrage
                      <ChevronRight className="w-4 h-4" strokeWidth={2} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }
      if (currentLevel.activeTab === 'chiffrage') {
        // ========== CALCUL STATUT POSTE ==========
        const getPosteStatus = (posteId) => {
          let lignes = [];
          if (posteId === 'dsa') lignes = dsaLignes;
          else if (posteId === 'dft') lignes = dftLignes;
          else if (posteId === 'pgpa') {
            lignes = [
              ...pgpaData.revenuRef.lignes,
              ...pgpaData.revenusPercus,
              ...pgpaData.ijPercues
            ];
          }
          if (lignes.length === 0) return 'validated';
          const allSuggested = lignes.every(l => l.status === 'ai-suggested' || l.status === 'suggested');
          const allValidated = lignes.every(l => l.status === 'validated' && !isLigneIncomplete(l));
          if (allSuggested) return 'suggested';
          if (allValidated) return 'validated';
          return 'in_progress';
        };

        const getPosteAiReasoning = () => null;

        // UI de progression pendant l'extraction
        if (extractionState && extractionState.phase !== 'done') {
          const extractionPhases = [
            { key: 'upload', label: 'Réception', icon: Upload },
            { key: 'analyse', label: 'Analyse', icon: FileSearch },
            { key: 'ocr', label: 'Lecture', icon: Eye },
            { key: 'extraction', label: 'Extraction', icon: Sparkles },
            { key: 'postes', label: 'Postes', icon: ListChecks },
          ];
          const currentPhaseIndex = extractionPhases.findIndex(p => p.key === extractionState.phase);

          return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-up">
              <div className="relative w-20 h-20 mb-8">
                <div
                  className="absolute inset-0 rounded-full animate-spin-slow"
                  style={{ background: 'conic-gradient(from 0deg, #71717a, #a1a1aa, #71717a, transparent 70%)' }}
                />
                <div className="absolute inset-[3px] rounded-full bg-white flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-zinc-600 animate-pulse" />
                </div>
              </div>
              <h2 className="text-lg font-semibold text-zinc-800 mb-1 tracking-tight">
                {extractionPhases[currentPhaseIndex]?.label || 'Analyse'} en cours...
              </h2>
              <p className="text-sm text-zinc-500 mb-8">L'IA analyse vos documents</p>
              <div className="flex items-center gap-1 mb-8">
                {extractionPhases.map((phase, i) => {
                  const Icon = phase.icon;
                  const isActive = i === currentPhaseIndex;
                  const isDone = i < currentPhaseIndex;
                  return (
                    <div key={phase.key} className="flex items-center">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-500 ${isDone ? 'bg-zinc-200' : isActive ? 'bg-zinc-200 scale-110' : 'bg-zinc-100'}`}>
                        {isDone ? <Check className="w-4 h-4 text-zinc-600 animate-bounce-in" /> : <Icon className={`w-4 h-4 transition-colors duration-300 ${isActive ? 'text-zinc-700' : 'text-zinc-400'}`} />}
                      </div>
                      {i < extractionPhases.length - 1 && <div className={`w-3 h-0.5 mx-0.5 transition-colors duration-500 ${isDone ? 'bg-zinc-400' : 'bg-zinc-200'}`} />}
                    </div>
                  );
                })}
              </div>
              <div className="w-56 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                <div className="h-full bg-zinc-500 rounded-full transition-all duration-700 ease-out" style={{ width: `${extractionState.progress}%` }} />
              </div>
              <p className="text-xs text-zinc-400 mt-3">{extractionState.progress}%</p>
            </div>
          );
        }

        // Empty state - no postes yet
        if (allPostes.length === 0) {
          return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 animate-fade-up">
              <div className="text-center max-w-sm">
                <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-zinc-100 flex items-center justify-center">
                  <ClipboardList className="w-6 h-6 text-zinc-400" />
                </div>
                <h2 className="text-lg font-semibold text-zinc-800 mb-2">Aucun poste de préjudice</h2>
                <p className="text-sm text-zinc-500 mb-6">Sélectionnez un poste dans le menu latéral pour commencer le chiffrage.</p>
              </div>
            </div>
          );
        }

        const pgpaAiCount = pgpaData.revenuRef.lignes.filter(l => l.status === 'ai-suggested').length +
          pgpaData.revenusPercus.filter(l => l.status === 'ai-suggested').length +
          pgpaData.ijPercues.filter(l => l.status === 'ai-suggested').length;

        const hasAiSuggestions =
          dsaLignes.some(l => l.status === 'ai-suggested') ||
          dftLignes.some(l => l.status === 'ai-suggested') ||
          pgpaAiCount > 0;

        const aiSuggestedCount =
          dsaLignes.filter(l => l.status === 'ai-suggested').length +
          dftLignes.filter(l => l.status === 'ai-suggested').length +
          pgpaAiCount;

        return (
          <>
            {/* Liste des postes */}
            <div className="bg-white rounded-lg border border-zinc-200/60 shadow-sm overflow-hidden">
              {categories.filter(cat => cat.postes.length > 0).map((cat, catIndex) => (
                <div key={cat.id}>
                  <div className={`px-4 py-2 bg-zinc-50/50 border-b border-zinc-100 ${catIndex > 0 ? 'border-t' : ''}`}>
                    <span className="text-[12px] text-zinc-400">{cat.title}</span>
                  </div>
                  <div className="divide-y divide-zinc-100">
                    {cat.postes.map(p => {
                      const status = getPosteStatus(p.id);
                      const aiReasoning = getPosteAiReasoning(p.id) || {
                        dsa: "Identifié à partir des factures et frais médicaux détectés dans vos documents",
                        pgpa: "Calculé sur la base de l'arrêt de travail et des revenus identifiés",
                        dft: "Périodes d'incapacité temporaire identifiées dans le rapport d'expertise",
                        pet: "Préjudice esthétique temporaire identifié dans le rapport d'expertise médicale (cicatrices, appareillage)",
                        atpt: "Besoin d'assistance tierce personne identifié pendant la période de convalescence",
                        se: "Souffrances endurées évaluées à 4/7 par l'expert dans le rapport d'expertise"
                      }[p.id];
                      const isAiPoste = status === 'suggested' || status === 'in_progress';
                      const PosteStatusIcon = () => {
                        if (status === 'suggested') return <span className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center" title="Poste suggéré par l'IA"><Sparkles className="w-3 h-3 text-indigo-500" /></span>;
                        if (status === 'in_progress') return <span className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center" title="En cours de validation"><Loader2 className="w-3 h-3 text-amber-500" /></span>;
                        return <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center" title="Validé"><Check className="w-3 h-3 text-emerald-500" /></span>;
                      };
                      if (p.disabled) {
                        return (
                          <div key={p.id} className="relative group">
                            <div className="w-full flex items-center justify-between px-4 py-3 opacity-50 cursor-default">
                              <div className="flex items-center gap-3">
                                <span className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center" title="Poste suggéré par l'IA"><Sparkles className="w-3 h-3 text-indigo-500" /></span>
                                <span className="text-[13px] font-medium w-12 text-zinc-400">{p.title}</span>
                                <span className="text-[13px] text-zinc-700">{p.fullTitle}</span>
                                {aiReasoning && (
                                  <span className="relative cursor-help">
                                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                                    <span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 w-64 p-2.5 bg-zinc-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-30 pointer-events-none">
                                      <span className="flex items-start gap-2">
                                        <Sparkles className="w-3 h-3 text-indigo-400 flex-shrink-0 mt-0.5" />
                                        <span className="text-zinc-300 leading-relaxed">{aiReasoning}</span>
                                      </span>
                                      <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-zinc-900" />
                                    </span>
                                  </span>
                                )}
                                <span className="text-[10px] font-medium text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded-full">Bientôt</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-[14px] font-semibold text-zinc-900 tabular-nums">{fmt(p.montant)}</span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return (
                        <div key={p.id} className="relative group">
                          <button onClick={() => navigateTo(p)} className="w-full flex items-center justify-between px-4 py-3 hover:bg-zinc-50 transition-colors">
                            <div className="flex items-center gap-3">
                              <PosteStatusIcon />
                              <span className="text-[13px] font-medium w-12 text-zinc-400">{p.title}</span>
                              <span className="text-[13px] text-zinc-700">{p.fullTitle}</span>
                              {status !== 'validated' && aiReasoning && (
                                <span className="relative cursor-help">
                                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                                  <span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 w-64 p-2.5 bg-zinc-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-30 pointer-events-none">
                                    <span className="flex items-start gap-2">
                                      <Sparkles className="w-3 h-3 text-indigo-400 flex-shrink-0 mt-0.5" />
                                      <span className="text-zinc-300 leading-relaxed">{aiReasoning}</span>
                                    </span>
                                    <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-zinc-900" />
                                  </span>
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-[14px] font-semibold text-zinc-900 tabular-nums">{fmt(p.montant)}</span>
                              <ChevronRight className="w-4 h-4 text-zinc-300" strokeWidth={1.5} />
                            </div>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Spacer pour le bandeau sticky */}
            <div className="h-28" />

            {/* Bandeau sticky full width */}
            <div className="fixed bottom-0 left-64 right-0 bg-white border-t border-zinc-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] z-30">
              <div className="flex items-center justify-between px-8 py-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center">
                    <Calculator className="w-5 h-5 text-zinc-500" strokeWidth={1.5} />
                  </div>
                  <div>
                    <div className="text-[14px] font-medium text-zinc-700">Total du chiffrage</div>
                    <div className="text-[12px] text-zinc-400">{allPostes.filter(p => !p.disabled).length} postes · {categories.filter(c => c.postes.length > 0).length} catégories</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[40px] font-bold text-zinc-900 tabular-nums tracking-tight leading-none">{fmt(totalChiffrage)}</div>
                </div>
              </div>
            </div>

            {/* Panel Paramètres Chiffrage */}
            {showChiffrageParams && (
              <div className="fixed inset-0 z-50 flex justify-end">
                <div className="absolute inset-0 bg-black/30" onClick={() => setShowChiffrageParams(false)} />
                <div className="relative w-full max-w-md bg-white shadow-xl flex flex-col">
                  <div className="flex items-center justify-between px-5 py-3 border-b">
                    <h2 className="text-sm font-semibold">Paramètres du chiffrage</h2>
                    <button onClick={() => setShowChiffrageParams(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-4 h-4" /></button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <h3 className="font-semibold text-gray-900">Fraction indemnisable des préjudices</h3>
                        <button className="text-gray-400 hover:text-gray-600"><HelpCircle className="w-4 h-4" /></button>
                      </div>
                      <div className="space-y-3">
                        <input type="range" min="0" max="100" value={chiffrageParams.fractionIndemnisable}
                          onChange={(e) => setChiffrageParams(prev => ({ ...prev, fractionIndemnisable: parseInt(e.target.value) }))} className="w-full" />
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>0</span><span>1/4</span><span>1/3</span><span>1/2</span><span>2/3</span><span>3/4</span><span>1</span>
                        </div>
                        <div className="flex justify-end"><div className="px-3 py-1.5 border rounded-lg text-sm font-medium">{chiffrageParams.fractionIndemnisable} %</div></div>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4">Tiers payeurs</h3>
                      <div className="space-y-2">
                        {chiffrageParams.tiersPayeurs.map((tiers, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <label className="text-xs text-gray-500 w-12">Nom *</label>
                            <input type="text" value={tiers} onChange={(e) => { const newTiers = [...chiffrageParams.tiersPayeurs]; newTiers[idx] = e.target.value; setChiffrageParams(prev => ({ ...prev, tiersPayeurs: newTiers })); }} className="flex-1 px-3 py-2 border rounded-lg text-sm" />
                            <button onClick={() => { const newTiers = chiffrageParams.tiersPayeurs.filter((_, i) => i !== idx); setChiffrageParams(prev => ({ ...prev, tiersPayeurs: newTiers })); }} className="p-2 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        ))}
                        <button onClick={() => setChiffrageParams(prev => ({ ...prev, tiersPayeurs: [...prev.tiersPayeurs, ''] }))} className="text-sm text-blue-600 hover:text-blue-700 font-medium">+ Ajouter un tiers payeur</button>
                      </div>
                    </div>
                  </div>
                  <div className="px-5 py-3 border-t flex justify-end gap-2">
                    <button onClick={() => setShowChiffrageParams(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Fermer</button>
                    <button onClick={() => setShowChiffrageParams(false)} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg">Enregistrer</button>
                  </div>
                </div>
              </div>
            )}
          </>
        );
      }
      if (currentLevel.activeTab === 'pièces') {
        return renderPiecesList(pieces, true);
      }
    }


    // ========== DSA ==========
    if (currentLevel.id === 'dsa') {
      const allLignes = [...dsaLignes].sort((a, b) => {
        if (a.status !== 'validated' && b.status === 'validated') return -1;
        if (a.status === 'validated' && b.status !== 'validated') return 1;
        return 0;
      });
      const hasContent = dsaLignes.length > 0 || processing.length > 0;
      
      // Pièces filtrées pour la recherche (non utilisées)
      const filteredPiecesForSearch = pieces.filter(p => 
        !p.used && (p.intitule || p.nom).toLowerCase().includes(searchPieces.toLowerCase())
      );
      
      // Calculs DSA
      const totalMontant = dsaLignes.filter(l => l.status === 'validated').reduce((s, l) => s + (l.montant || 0), 0);
      const totalRembourse = dsaLignes.filter(l => l.status === 'validated').reduce((s, l) => s + (l.dejaRembourse || 0), 0);
      const totalResteACharge = totalMontant - totalRembourse;
      const partTiersPayeur = totalRembourse;
      const indemniteVictime = totalResteACharge;
      
      return (
        <div className="space-y-4 pb-32">
          {/* Empty state DSA */}
          {dsaLignes.length === 0 && processing.length === 0 && (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleUploadFiles(e.dataTransfer.files, 'dsa'); }}
              className={`bg-white rounded-lg border-2 border-dashed overflow-hidden transition-colors ${isDragging ? 'border-emerald-400 bg-emerald-50/50' : 'border-zinc-200'}`}
            >
              <div className="px-8 py-12 text-center">
                {isDragging ? (
                  <>
                    <Upload className="w-10 h-10 text-emerald-500 mx-auto mb-4" />
                    <h3 className="text-[15px] font-semibold text-emerald-700 mb-1">Déposez vos documents ici</h3>
                    <p className="text-[13px] text-emerald-600">Les fichiers seront analysés automatiquement</p>
                  </>
                ) : (
                  <>
                    <div className="w-14 h-14 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto mb-4">
                      <Receipt className="w-7 h-7 text-zinc-400" />
                    </div>
                    <h3 className="text-[15px] font-semibold text-zinc-800 mb-1.5">Aucune dépense de santé</h3>
                    <p className="text-[13px] text-zinc-400 mb-6 max-w-sm mx-auto">Commencez par ajouter des justificatifs ou créez une ligne manuellement.</p>

                    <div className="flex items-center justify-center gap-3 mb-8">
                      <button onClick={() => document.getElementById('dsa-file-input-empty').click()} className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 text-white text-[13px] font-medium rounded-lg hover:bg-zinc-800 transition-colors">
                        <Upload className="w-4 h-4" /> Ajouter des documents
                      </button>
                      <button onClick={() => handleAddManual('dsa')} className="flex items-center gap-2 px-4 py-2.5 border border-zinc-200 text-zinc-700 text-[13px] font-medium rounded-lg hover:bg-zinc-50 transition-colors">
                        <Edit3 className="w-4 h-4" /> Créer une dépense manuellement
                      </button>
                    </div>
                    <input type="file" id="dsa-file-input-empty" multiple accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => { if (e.target.files?.length) { handleUploadFiles(e.target.files, 'dsa'); e.target.value = ''; } }} />

                    <div className="border-t border-zinc-100 pt-5">
                      <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-3">Documents attendus</p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {['Factures médicales', 'Ordonnances', 'Justificatifs de médicaments', 'Autres justificatifs de dépenses'].map(doc => (
                          <span key={doc} className="px-2.5 py-1 bg-zinc-50 text-[12px] text-zinc-500 rounded-md border border-zinc-100">{doc}</span>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Table des dépenses avec zone d'ajout intégrée */}
          {(dsaLignes.length > 0 || processing.length > 0) && (
          <div className="bg-white rounded-lg border border-zinc-200/60 overflow-hidden">
            {/* Zone d'ajout - only when lines exist */}
            {dsaLignes.length > 0 && (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                handleUploadFiles(e.dataTransfer.files, 'dsa');
              }}
              className={`px-4 py-3 border-b transition-colors ${
                isDragging ? 'bg-emerald-50 border-emerald-200' : 'bg-zinc-50/50'
              }`}
            >
              {/* Input file caché */}
              <input
                type="file"
                id="dsa-file-input"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.length) {
                    handleUploadFiles(e.target.files, 'dsa');
                    e.target.value = '';
                  }
                }}
              />

              <div className="flex items-center gap-4">
                {/* Drop zone compacte - cliquable */}
                <div
                  onClick={() => document.getElementById('dsa-file-input').click()}
                  className={`flex items-center gap-3 px-4 py-2.5 border-2 border-dashed rounded-lg flex-1 transition-all cursor-pointer ${
                    isDragging
                      ? 'border-emerald-400 bg-emerald-50'
                      : 'border-zinc-300 hover:border-zinc-400 hover:bg-zinc-50'
                  }`}
                >
                  <Upload className={`w-5 h-5 ${isDragging ? 'text-emerald-600' : 'text-zinc-400'}`} strokeWidth={1.5} />
                  <span className={`text-[13px] ${isDragging ? 'text-emerald-700 font-medium' : 'text-zinc-500'}`}>
                    {isDragging ? 'Relâchez pour ajouter' : 'Déposez ou cliquez pour ajouter un justificatif'}
                  </span>
                </div>

                {/* Recherche pièce */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Rechercher une pièce existante..."
                    value={searchPieces}
                    onChange={(e) => setSearchPieces(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 border border-zinc-200 rounded-lg text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-zinc-300"
                  />

                  {searchPieces && (
                    <div className="absolute left-0 right-0 top-full mt-1 z-20 bg-white rounded-lg border shadow-lg max-h-48 overflow-y-auto">
                      {filteredPiecesForSearch.length === 0 ? (
                        <p className="text-center text-zinc-500 py-3 text-[13px]">Aucune pièce</p>
                      ) : (
                        <div className="py-1">
                          {filteredPiecesForSearch.map(p => (
                            <button
                              key={p.id}
                              onClick={() => { handleAddFromPiece(p, 'dsa'); setSearchPieces(''); }}
                              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-zinc-50 text-left"
                            >
                              <span className="w-6 h-6 bg-zinc-100 text-zinc-600 text-[11px] font-medium rounded flex items-center justify-center">
                                P{pieces.findIndex(x => x.id === p.id) + 1}
                              </span>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate">{p.intitule || p.nom}</div>
                                <div className="text-xs text-gray-500">{p.type}</div>
                              </div>
                              <Plus className="w-4 h-4 text-blue-600" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Saisie manuelle */}
                <button
                  onClick={() => handleAddManual('dsa')}
                  className="px-3 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors whitespace-nowrap"
                >
                  Ajouter une dépense
                </button>
              </div>
            </div>
            )}
            
            {/* Processing - Version sobre */}
            {processing.length > 0 && (
              <div className="border-b border-zinc-100">
                {processing.map((p, index) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 px-4 py-3 bg-zinc-50 animate-fade-up"
                    style={{ animationDelay: `${index * 80}ms` }}
                  >
                    {/* Cercle de progression SVG sobre */}
                    <div className="relative w-9 h-9 flex-shrink-0">
                      <svg className="w-9 h-9 -rotate-90" viewBox="0 0 36 36">
                        <circle
                          cx="18" cy="18" r="14"
                          fill="none"
                          stroke="#e4e4e7"
                          strokeWidth="2.5"
                        />
                        <circle
                          cx="18" cy="18" r="14"
                          fill="none"
                          stroke="#71717a"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeDasharray="88"
                          strokeDashoffset={p.phase === 'upload' ? '44' : '0'}
                          className="transition-all duration-1000 ease-out"
                        />
                      </svg>
                      {/* Icône centrale */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        {p.phase === 'upload' ? (
                          <Upload className="w-3.5 h-3.5 text-zinc-500" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5 text-zinc-600 animate-pulse" />
                        )}
                      </div>
                    </div>

                    {/* Texte */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-700 truncate">{p.name}</p>
                      <p className="text-xs text-zinc-400">
                        {p.phase === 'upload' ? 'Téléchargement...' : 'Extraction IA...'}
                      </p>
                    </div>

                    {/* Shimmer bar sobre */}
                    <div className="w-16 h-1 bg-zinc-200 rounded-full overflow-hidden flex-shrink-0">
                      <div className="w-full h-full animate-shimmer bg-gradient-to-r from-transparent via-zinc-300 to-transparent" />
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Header table */}
            {allLignes.length > 0 && (
              <>
                <div className="flex items-center px-4 py-2 border-b text-xs font-medium text-gray-500 uppercase tracking-wide">
                  <div className="w-10 flex-shrink-0"></div>
                  <div className="w-12 flex-shrink-0">Pièce</div>
                  <div className="flex-1 min-w-0">Intitulé</div>
                  <div className="w-24 text-right flex-shrink-0">Date</div>
                  <div className="w-28 text-right flex-shrink-0">Montant</div>
                </div>

                {/* Lignes */}
                <div className="divide-y">
                  {allLignes.map(l => {
                    const isSuggested = l.status === 'ai-suggested' || l.status === 'suggested';
                    const isError = l.status === 'error';
                    const pieceCount = l.pieceIds?.length || 0;

                    const StatusIcon = () => {
                      if (isSuggested) return (
                        <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center" title="Suggestion IA">
                          <Sparkles className="w-3 h-3 text-indigo-500" />
                        </div>
                      );
                      return null;
                    };

                    // Composant indicateur pièces avec tooltip
                    const PieceIndicator = () => {
                      if (pieceCount === 0) {
                        return (
                          <span className="inline-flex items-center justify-center w-7 h-7 bg-zinc-50 text-zinc-300 rounded border border-dashed border-zinc-200">
                            <FileText className="w-3.5 h-3.5" />
                          </span>
                        );
                      }
                      return (
                        <div className="relative group/piece">
                          <span className="inline-flex items-center justify-center w-7 h-7 bg-blue-50 text-blue-600 rounded border border-blue-100 relative">
                            <FileText className="w-3.5 h-3.5" />
                            {pieceCount > 1 && (
                              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-blue-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                                {pieceCount}
                              </span>
                            )}
                          </span>
                          {/* Tooltip avec liste des pièces */}
                          <div className="absolute left-0 top-full mt-1 w-56 p-2 bg-white border border-zinc-200 rounded-lg shadow-lg opacity-0 invisible group-hover/piece:opacity-100 group-hover/piece:visible transition-all z-50">
                            <div className="text-[10px] font-medium text-zinc-400 uppercase tracking-wide mb-1.5">{pieceCount} document{pieceCount > 1 ? 's' : ''} lié{pieceCount > 1 ? 's' : ''}</div>
                            <div className="space-y-1">
                              {l.pieceIds?.map(pid => {
                                const piece = getPiece(pid);
                                return (
                                  <div key={pid} className="flex items-center gap-2 text-xs">
                                    <span className="w-5 h-5 bg-blue-100 text-blue-700 text-[10px] font-medium rounded flex items-center justify-center flex-shrink-0">
                                      {getPieceLabel(pid)}
                                    </span>
                                    <span className="truncate text-zinc-700">{piece?.intitule || piece?.nom || 'Document'}</span>
                                  </div>
                                );
                              })}
                            </div>
                            <div className="absolute -top-1.5 left-3 w-3 h-3 bg-white border-l border-t border-zinc-200 rotate-45" />
                          </div>
                        </div>
                      );
                    };

                    return (
                      <div
                        key={l.id}
                        onClick={() => openDsaEditPanel(l)}
                        className={`
                          relative flex items-center px-4 py-3 group cursor-pointer transition-colors
                          ${isSuggested
                            ? 'border-l-[3px] border-indigo-400 hover:bg-zinc-50'
                            : 'hover:bg-zinc-50'
                          }
                        `}
                      >
                        {/* Statut */}
                        <div className="w-10 flex-shrink-0"><StatusIcon /></div>

                        {/* Pièces */}
                        <div className="w-12 flex-shrink-0"><PieceIndicator /></div>

                        {/* Intitulé + type */}
                        <div className="flex-1 min-w-0 pr-4">
                          <div className="text-sm font-medium truncate text-zinc-800">
                            {l.label || 'Sans libellé'}
                          </div>
                          {(l.type || l.tiers) && (
                            <div className="text-xs text-zinc-400 truncate">
                              {l.type}{l.tiers && ` • ${l.tiers}`}
                            </div>
                          )}
                        </div>

                        {/* Date */}
                        <div className="w-24 text-right text-sm text-zinc-500 flex-shrink-0">
                          {l.date || '—'}
                        </div>

                        {/* Montant - PRIORITAIRE */}
                        <div className="w-28 text-right flex-shrink-0">
                          <span className="text-sm font-semibold tabular-nums text-zinc-900">
                            {l.montant != null ? fmt(l.montant) : '— €'}
                          </span>
                        </div>

                        {/* Actions en overlay au hover - minimaliste */}
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleRejectLigne(l.id); }}
                            className="p-1.5 text-zinc-400 hover:text-zinc-600 transition-colors"
                            title="Supprimer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
            
          </div>
          )}

          {/* Bandeau sticky totaux - Pattern ticket de caisse */}
          <div className="fixed bottom-0 left-64 right-0 bg-white border-t shadow-[0_-4px_12px_rgba(0,0,0,0.08)] z-30">
            <div className="flex items-start justify-between px-6 py-5">
              {/* Repère visuel gauche */}
              <div className="flex items-center gap-2 text-gray-400 pt-1">
                <Calculator className="w-5 h-5" />
                <span className="text-sm font-medium">Récapitulatif</span>
              </div>
              
              {/* Ticket aligné à droite */}
              <div className="text-right min-w-[240px]">
                {/* Lignes intermédiaires - discrètes, espacées */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Total des dépenses</span>
                    <span className="tabular-nums font-medium ml-8">{fmt(totalMontant)}</span>
                  </div>
                  {totalRembourse > 0 && (
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Remboursé par tiers</span>
                      <span className="tabular-nums font-medium ml-8">− {fmt(totalRembourse)}</span>
                    </div>
                  )}
                </div>
                
                {/* Séparateur */}
                <div className="border-t border-zinc-200 my-3" />
                
                {/* Résultat final - highlight subtil */}
                <div className="flex items-center justify-between py-2 px-3 -mx-3 rounded" style={{ backgroundColor: '#F5F5F0' }}>
                  <span className="font-semibold text-zinc-700">Indemnité victime</span>
                  <span className="text-xl font-bold text-zinc-900 tabular-nums">{fmt(indemniteVictime)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // ========== PGPA ==========
    if (currentLevel.id === 'pgpa') {
      // Calculs
      const revenuRefAnnuel = pgpaData.revenuRef.total;
      const revenuRefMensuel = revenuRefAnnuel / 12;
      const revenusPercusTotal = pgpaRevPercusTotal;
      const ijPercuesTotal = pgpaIjTotal;
      const perteDeGains = Math.round(revenuRefMensuel * pgpaData.periode.mois) - revenusPercusTotal;
      const indemniteVictimePGPA = perteDeGains - ijPercuesTotal;
      
      // Si on est dans une sous-section
      if (currentLevel.subSection) {
        const subSection = currentLevel.subSection;
        
        // ===== REVENUS DE RÉFÉRENCE =====
        if (subSection === 'revenus-ref') {
          const revenus = pgpaData.revenuRef.lignes.filter(l => l.type === 'revenu');
          const gains = pgpaData.revenuRef.lignes.filter(l => l.type === 'gain');
          const totalRevenus = revenus.reduce((s, l) => s + l.revalorise, 0);
          const totalGains = gains.reduce((s, l) => s + l.revalorise, 0);
          const moyenneAnnuelle = totalRevenus + totalGains;
          
          return (
            <div className="space-y-4 pb-32">
              {/* Empty state revenus de référence */}
              {pgpaData.revenuRef.lignes.length === 0 && (
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleUploadFiles(e.dataTransfer.files, 'pgpa-revenu-ref'); }}
                  className={`bg-white rounded-lg border-2 border-dashed overflow-hidden transition-colors ${isDragging ? 'border-emerald-400 bg-emerald-50/50' : 'border-zinc-200'}`}
                >
                  <div className="px-8 py-12 text-center">
                    {isDragging ? (
                      <>
                        <Upload className="w-10 h-10 text-emerald-500 mx-auto mb-4" />
                        <h3 className="text-[15px] font-semibold text-emerald-700 mb-1">Déposez vos documents ici</h3>
                        <p className="text-[13px] text-emerald-600">Les fichiers seront analysés automatiquement</p>
                      </>
                    ) : (
                      <>
                        <div className="w-14 h-14 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto mb-4">
                          <FileSpreadsheet className="w-7 h-7 text-zinc-400" />
                        </div>
                        <h3 className="text-[15px] font-semibold text-zinc-800 mb-1.5">Aucun revenu de référence</h3>
                        <p className="text-[13px] text-zinc-400 mb-6 max-w-sm mx-auto">Ajoutez les justificatifs de revenus ou créez une ligne manuellement.</p>

                        <div className="flex items-center justify-center gap-3 mb-8">
                          <button onClick={() => document.getElementById('pgpa-revref-file-input-empty').click()} className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 text-white text-[13px] font-medium rounded-lg hover:bg-zinc-800 transition-colors">
                            <Upload className="w-4 h-4" /> Ajouter des documents
                          </button>
                          <button onClick={() => handleAddManual('pgpa-revenu-ref')} className="flex items-center gap-2 px-4 py-2.5 border border-zinc-200 text-zinc-700 text-[13px] font-medium rounded-lg hover:bg-zinc-50 transition-colors">
                            <Edit3 className="w-4 h-4" /> Créer une ligne manuellement
                          </button>
                        </div>
                        <input type="file" id="pgpa-revref-file-input-empty" multiple accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => { if (e.target.files?.length) { handleUploadFiles(e.target.files, 'pgpa-revenu-ref'); e.target.value = ''; } }} />

                        <div className="border-t border-zinc-100 pt-5">
                          <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-3">Documents attendus</p>
                          <div className="flex flex-wrap justify-center gap-2">
                            {['Bulletins de salaire', 'Attestations employeur', "Avis d'imposition", 'Bilans comptables'].map(doc => (
                              <span key={doc} className="px-2.5 py-1 bg-zinc-50 text-[12px] text-zinc-500 rounded-md border border-zinc-100">{doc}</span>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Table avec zone d'ajout */}
              {pgpaData.revenuRef.lignes.length > 0 && (
              <div className="bg-white rounded-lg border overflow-hidden">
                {/* Zone d'ajout */}
                <div
                  onDragOver={(e) => { e.preventDefault(); }}
                  onDrop={(e) => { e.preventDefault(); handleUploadFiles(e.dataTransfer.files, 'pgpa-revenu-ref'); }}
                  className="px-4 py-3 border-b bg-gray-50"
                >
                  <input type="file" id="pgpa-revref-file-input" multiple accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => { if (e.target.files?.length) { handleUploadFiles(e.target.files, 'pgpa-revenu-ref'); e.target.value = ''; } }} />
                  <div className="flex items-center gap-4">
                    <div
                      onClick={() => document.getElementById('pgpa-revref-file-input').click()}
                      className="flex items-center gap-3 px-3 py-2 border-2 border-dashed rounded-lg flex-1 hover:border-gray-400 cursor-pointer"
                    >
                      <Upload className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-500">Déposez bulletins de salaire, avis d'imposition...</span>
                    </div>
                    <button onClick={() => handleAddManual('pgpa-revenu-ref')} className="px-3 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg whitespace-nowrap">
                      Ajouter un revenu
                    </button>
                  </div>
                </div>

                {/* Section REVENUS */}
                <div className="px-4 py-2 bg-gray-100 border-b">
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Revenus professionnels</span>
                </div>
                
                <div className="flex items-center px-4 py-2 border-b text-xs font-medium text-gray-500 uppercase tracking-wide">
                  <div className="w-10 flex-shrink-0">Statut</div>
                  <div className="w-12 flex-shrink-0">Pièce</div>
                  <div className="flex-1">Intitulé</div>
                  <div className="w-20 text-right">Année</div>
                  <div className="w-24 text-right">Montant</div>
                  <div className="w-28 text-right">Revalorisé</div>
                </div>

                <div className="divide-y">
                  {revenus.map(l => {
                    const isSuggested = l.status === 'ai-suggested' || l.status === 'suggested';
                    const pieceCount = l.pieceIds?.length || 0;

                    const StatusIcon = () => {
                      if (isSuggested) return <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center" title="Suggestion IA"><Sparkles className="w-3 h-3 text-indigo-500" /></div>;
                      return null;
                    };

                    const PieceIndicator = () => {
                      if (pieceCount === 0) return <span className="inline-flex items-center justify-center w-7 h-7 bg-zinc-50 text-zinc-300 rounded border border-dashed border-zinc-200"><FileText className="w-3.5 h-3.5" /></span>;
                      return (
                        <div className="relative group/piece">
                          <span className="inline-flex items-center justify-center w-7 h-7 bg-blue-50 text-blue-600 rounded border border-blue-100 relative">
                            <FileText className="w-3.5 h-3.5" />
                            {pieceCount > 1 && <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-blue-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{pieceCount}</span>}
                          </span>
                          <div className="absolute left-0 top-full mt-1 w-56 p-2 bg-white border border-zinc-200 rounded-lg shadow-lg opacity-0 invisible group-hover/piece:opacity-100 group-hover/piece:visible transition-all z-50">
                            <div className="text-[10px] font-medium text-zinc-400 uppercase tracking-wide mb-1.5">{pieceCount} document{pieceCount > 1 ? 's' : ''} lié{pieceCount > 1 ? 's' : ''}</div>
                            <div className="space-y-1">
                              {l.pieceIds?.map(pid => {
                                const piece = getPiece(pid);
                                return <div key={pid} className="flex items-center gap-2 text-xs"><span className="w-5 h-5 bg-blue-100 text-blue-700 text-[10px] font-medium rounded flex items-center justify-center flex-shrink-0">{getPieceLabel(pid)}</span><span className="truncate text-zinc-700">{piece?.intitule || piece?.nom || 'Document'}</span></div>;
                              })}
                            </div>
                            <div className="absolute -top-1.5 left-3 w-3 h-3 bg-white border-l border-t border-zinc-200 rotate-45" />
                          </div>
                        </div>
                      );
                    };

                    return (
                      <div
                        key={l.id}
                        onClick={() => openPgpaEditPanel('pgpa-revenu', l)}
                        className={`flex items-center px-4 py-3 group cursor-pointer transition-colors ${isSuggested ? 'border-l-[3px] border-indigo-400 hover:bg-zinc-50' : 'hover:bg-zinc-50'}`}
                      >
                        <div className="w-10 flex-shrink-0"><StatusIcon /></div>
                        <div className="w-12 flex-shrink-0"><PieceIndicator /></div>
                        <div className="flex-1 min-w-0 pr-4 text-sm font-medium truncate text-zinc-800">{l.label || 'Sans libellé'}</div>
                        <div className="w-20 text-right text-sm text-zinc-500 flex-shrink-0">{l.annee}</div>
                        <div className="w-24 text-right text-sm tabular-nums text-zinc-500 flex-shrink-0">{fmt(l.montant)}</div>
                        <div className="w-28 text-right flex-shrink-0">
                          <span className="font-semibold tabular-nums text-zinc-900">{fmt(l.revalorise)}</span>
                        </div>
                      </div>
                    );
                  })}
                  {revenus.length === 0 && (
                    <div className="px-4 py-6 text-center text-gray-500 text-sm">Aucun revenu enregistré</div>
                  )}
                </div>

                {/* Sous-total revenus */}
                <div className="px-4 py-2 border-t bg-gray-50 flex justify-end">
                  <span className="text-sm text-gray-600">Moyenne annuelle : <span className="font-semibold tabular-nums">{fmt(totalRevenus)}</span></span>
                </div>

                {/* Section GAINS */}
                <div className="px-4 py-2 bg-gray-100 border-t border-b">
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Gains supplémentaires (primes, indemnités, etc.)</span>
                </div>

                <div className="divide-y">
                  {gains.map(l => {
                    const isSuggested = l.status === 'ai-suggested' || l.status === 'suggested';
                    const pieceCount = l.pieceIds?.length || 0;

                    const StatusIcon = () => {
                      if (isSuggested) return <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center" title="Suggestion IA"><Sparkles className="w-3 h-3 text-indigo-500" /></div>;
                      return null;
                    };

                    const PieceIndicator = () => {
                      if (pieceCount === 0) return <span className="inline-flex items-center justify-center w-7 h-7 bg-zinc-50 text-zinc-300 rounded border border-dashed border-zinc-200"><FileText className="w-3.5 h-3.5" /></span>;
                      return (
                        <div className="relative group/piece">
                          <span className="inline-flex items-center justify-center w-7 h-7 bg-blue-50 text-blue-600 rounded border border-blue-100 relative">
                            <FileText className="w-3.5 h-3.5" />
                            {pieceCount > 1 && <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-blue-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{pieceCount}</span>}
                          </span>
                          <div className="absolute left-0 top-full mt-1 w-56 p-2 bg-white border border-zinc-200 rounded-lg shadow-lg opacity-0 invisible group-hover/piece:opacity-100 group-hover/piece:visible transition-all z-50">
                            <div className="text-[10px] font-medium text-zinc-400 uppercase tracking-wide mb-1.5">{pieceCount} document{pieceCount > 1 ? 's' : ''} lié{pieceCount > 1 ? 's' : ''}</div>
                            <div className="space-y-1">
                              {l.pieceIds?.map(pid => {
                                const piece = getPiece(pid);
                                return <div key={pid} className="flex items-center gap-2 text-xs"><span className="w-5 h-5 bg-blue-100 text-blue-700 text-[10px] font-medium rounded flex items-center justify-center flex-shrink-0">{getPieceLabel(pid)}</span><span className="truncate text-zinc-700">{piece?.intitule || piece?.nom || 'Document'}</span></div>;
                              })}
                            </div>
                            <div className="absolute -top-1.5 left-3 w-3 h-3 bg-white border-l border-t border-zinc-200 rotate-45" />
                          </div>
                        </div>
                      );
                    };

                    return (
                      <div
                        key={l.id}
                        onClick={() => openPgpaEditPanel('pgpa-revenu', l)}
                        className={`flex items-center px-4 py-3 group cursor-pointer transition-colors ${isSuggested ? 'border-l-[3px] border-indigo-400 hover:bg-zinc-50' : 'hover:bg-zinc-50'}`}
                      >
                        <div className="w-10 flex-shrink-0"><StatusIcon /></div>
                        <div className="w-12 flex-shrink-0"><PieceIndicator /></div>
                        <div className="flex-1 min-w-0 pr-4 text-sm font-medium truncate text-zinc-800">{l.label || 'Sans libellé'}</div>
                        <div className="w-20 text-right text-sm text-zinc-500 flex-shrink-0">{l.annee}</div>
                        <div className="w-24 text-right text-sm tabular-nums text-zinc-500 flex-shrink-0">{fmt(l.montant)}</div>
                        <div className="w-28 text-right flex-shrink-0">
                          <span className="font-semibold tabular-nums text-zinc-900">{fmt(l.revalorise)}</span>
                        </div>
                      </div>
                    );
                  })}
                  {gains.length === 0 && (
                    <div className="px-4 py-6 text-center text-gray-500 text-sm">Aucun gain enregistré</div>
                  )}
                </div>
                
                {/* Sous-total gains */}
                <div className="px-4 py-2 border-t bg-gray-50 flex justify-end">
                  <span className="text-sm text-gray-600">Indemnité annuelle moyenne : <span className="font-semibold tabular-nums">{fmt(totalGains)}</span></span>
                </div>
              </div>
              )}

              {/* Bandeau ticket */}
              <div className="fixed bottom-0 left-64 right-0 bg-white border-t shadow-[0_-4px_12px_rgba(0,0,0,0.08)] z-30">
                <div className="flex items-start justify-between px-6 py-5">
                  <div className="flex items-center gap-2 text-gray-400 pt-1">
                    <Calculator className="w-5 h-5" />
                    <span className="text-sm font-medium">Récapitulatif</span>
                  </div>
                  <div className="text-right min-w-[280px]">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>Revenus professionnels</span>
                        <span className="tabular-nums font-medium ml-8">{fmt(totalRevenus)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>Gains supplémentaires</span>
                        <span className="tabular-nums font-medium ml-8">{fmt(totalGains)}</span>
                      </div>
                    </div>
                    <div className="border-t border-gray-200 my-4" />
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900">Revenu de référence</span>
                      <span className="text-2xl font-bold text-gray-900 tabular-nums ml-8">{fmt(moyenneAnnuelle)}/an</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        }
        
        // ===== REVENUS PERÇUS =====
        if (subSection === 'revenus-percus') {
          return (
            <div className="space-y-4 pb-32">
              {/* Empty state revenus perçus */}
              {pgpaData.revenusPercus.length === 0 && (
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleUploadFiles(e.dataTransfer.files, 'pgpa-revenu-percu'); }}
                  className={`bg-white rounded-lg border-2 border-dashed overflow-hidden transition-colors ${isDragging ? 'border-emerald-400 bg-emerald-50/50' : 'border-zinc-200'}`}
                >
                  <div className="px-8 py-12 text-center">
                    {isDragging ? (
                      <>
                        <Upload className="w-10 h-10 text-emerald-500 mx-auto mb-4" />
                        <h3 className="text-[15px] font-semibold text-emerald-700 mb-1">Déposez vos documents ici</h3>
                        <p className="text-[13px] text-emerald-600">Les fichiers seront analysés automatiquement</p>
                      </>
                    ) : (
                      <>
                        <div className="w-14 h-14 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto mb-4">
                          <FileSpreadsheet className="w-7 h-7 text-zinc-400" />
                        </div>
                        <h3 className="text-[15px] font-semibold text-zinc-800 mb-1.5">Aucun revenu perçu sur la période</h3>
                        <p className="text-[13px] text-zinc-400 mb-6 max-w-sm mx-auto">Ajoutez les justificatifs de revenus perçus pendant l'arrêt ou créez une ligne.</p>

                        <div className="flex items-center justify-center gap-3 mb-8">
                          <button onClick={() => document.getElementById('pgpa-revpercu-file-input-empty').click()} className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 text-white text-[13px] font-medium rounded-lg hover:bg-zinc-800 transition-colors">
                            <Upload className="w-4 h-4" /> Ajouter des documents
                          </button>
                          <button onClick={() => handleAddManual('pgpa-revenu-percu')} className="flex items-center gap-2 px-4 py-2.5 border border-zinc-200 text-zinc-700 text-[13px] font-medium rounded-lg hover:bg-zinc-50 transition-colors">
                            <Edit3 className="w-4 h-4" /> Créer une ligne manuellement
                          </button>
                        </div>
                        <input type="file" id="pgpa-revpercu-file-input-empty" multiple accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => { if (e.target.files?.length) { handleUploadFiles(e.target.files, 'pgpa-revenu-percu'); e.target.value = ''; } }} />

                        <div className="border-t border-zinc-100 pt-5">
                          <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-3">Documents attendus</p>
                          <div className="flex flex-wrap justify-center gap-2">
                            {['Bulletins de salaire (période accident)', 'Relevés de revenus', 'Attestations employeur'].map(doc => (
                              <span key={doc} className="px-2.5 py-1 bg-zinc-50 text-[12px] text-zinc-500 rounded-md border border-zinc-100">{doc}</span>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Table avec zone d'ajout */}
              {pgpaData.revenusPercus.length > 0 && (
              <div className="bg-white rounded-lg border overflow-hidden">
                <div
                  onDragOver={(e) => { e.preventDefault(); }}
                  onDrop={(e) => { e.preventDefault(); handleUploadFiles(e.dataTransfer.files, 'pgpa-revenu-percu'); }}
                  className="px-4 py-3 border-b bg-gray-50"
                >
                  <input type="file" id="pgpa-revpercu-file-input" multiple accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => { if (e.target.files?.length) { handleUploadFiles(e.target.files, 'pgpa-revenu-percu'); e.target.value = ''; } }} />
                  <div className="flex items-center gap-4">
                    <div
                      onClick={() => document.getElementById('pgpa-revpercu-file-input').click()}
                      className="flex items-center gap-3 px-3 py-2 border-2 border-dashed rounded-lg flex-1 hover:border-gray-400 cursor-pointer"
                    >
                      <Upload className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-500">Déposez bulletins pendant arrêt, attestations employeur...</span>
                    </div>
                    <button onClick={() => handleAddManual('pgpa-revenu-percu')} className="px-3 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg whitespace-nowrap">
                      Ajouter un revenu
                    </button>
                  </div>
                </div>

                <div className="flex items-center px-4 py-2 border-b text-xs font-medium text-gray-500 uppercase tracking-wide">
                  <div className="w-10 flex-shrink-0">Statut</div>
                  <div className="w-12 flex-shrink-0">Pièce</div>
                  <div className="flex-1">Intitulé</div>
                  <div className="w-28">Période</div>
                  <div className="w-16 text-right">Durée</div>
                  <div className="w-28 text-right">Montant</div>
                </div>

                <div className="divide-y">
                  {pgpaData.revenusPercus.map(l => {
                    const isSuggested = l.status === 'ai-suggested' || l.status === 'suggested';
                    const pieceCount = l.pieceIds?.length || 0;

                    const StatusIcon = () => {
                      if (isSuggested) return <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center" title="Suggestion IA"><Sparkles className="w-3 h-3 text-indigo-500" /></div>;
                      return null;
                    };

                    const PieceIndicator = () => {
                      if (pieceCount === 0) return <span className="inline-flex items-center justify-center w-7 h-7 bg-zinc-50 text-zinc-300 rounded border border-dashed border-zinc-200"><FileText className="w-3.5 h-3.5" /></span>;
                      return (
                        <div className="relative group/piece">
                          <span className="inline-flex items-center justify-center w-7 h-7 bg-blue-50 text-blue-600 rounded border border-blue-100 relative">
                            <FileText className="w-3.5 h-3.5" />
                            {pieceCount > 1 && <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-blue-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{pieceCount}</span>}
                          </span>
                          <div className="absolute left-0 top-full mt-1 w-56 p-2 bg-white border border-zinc-200 rounded-lg shadow-lg opacity-0 invisible group-hover/piece:opacity-100 group-hover/piece:visible transition-all z-50">
                            <div className="text-[10px] font-medium text-zinc-400 uppercase tracking-wide mb-1.5">{pieceCount} document{pieceCount > 1 ? 's' : ''} lié{pieceCount > 1 ? 's' : ''}</div>
                            <div className="space-y-1">
                              {l.pieceIds?.map(pid => {
                                const piece = getPiece(pid);
                                return <div key={pid} className="flex items-center gap-2 text-xs"><span className="w-5 h-5 bg-blue-100 text-blue-700 text-[10px] font-medium rounded flex items-center justify-center flex-shrink-0">{getPieceLabel(pid)}</span><span className="truncate text-zinc-700">{piece?.intitule || piece?.nom || 'Document'}</span></div>;
                              })}
                            </div>
                            <div className="absolute -top-1.5 left-3 w-3 h-3 bg-white border-l border-t border-zinc-200 rotate-45" />
                          </div>
                        </div>
                      );
                    };

                    return (
                      <div
                        key={l.id}
                        onClick={() => openPgpaEditPanel('pgpa-revenu-percu', l)}
                        className={`flex items-center px-4 py-3 group cursor-pointer transition-colors ${isSuggested ? 'border-l-[3px] border-indigo-400 hover:bg-zinc-50' : 'hover:bg-zinc-50'}`}
                      >
                        <div className="w-10 flex-shrink-0"><StatusIcon /></div>
                        <div className="w-12 flex-shrink-0"><PieceIndicator /></div>
                        <div className="flex-1 min-w-0 pr-4">
                          <div className="text-sm font-medium text-zinc-800 truncate">{l.label || 'Sans libellé'}</div>
                          <div className="text-xs text-zinc-500">{l.tiers}</div>
                        </div>
                        <div className="w-28 text-sm text-zinc-500 flex-shrink-0">{l.periode}</div>
                        <div className="w-16 text-right text-sm text-zinc-500 tabular-nums flex-shrink-0">{l.dureeJours} j</div>
                        <div className="w-28 text-right flex-shrink-0">
                          <span className="font-semibold tabular-nums text-zinc-900">{fmt(l.montant)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              )}
              
              {/* Bandeau ticket */}
              <div className="fixed bottom-0 left-64 right-0 bg-white border-t shadow-[0_-4px_12px_rgba(0,0,0,0.08)] z-30">
                <div className="flex items-start justify-between px-6 py-5">
                  <div className="flex items-center gap-2 text-gray-400 pt-1">
                    <Calculator className="w-5 h-5" />
                    <span className="text-sm font-medium">Récapitulatif</span>
                  </div>
                  <div className="text-right min-w-[240px]">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900">Revenus perçus</span>
                      <span className="text-2xl font-bold text-gray-900 tabular-nums ml-8">{fmt(revenusPercusTotal)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        }
        
        // ===== INDEMNITÉS JOURNALIÈRES =====
        if (subSection === 'ij') {
          return (
            <div className="space-y-4 pb-32">
              {/* Empty state indemnités journalières */}
              {pgpaData.ijPercues.length === 0 && (
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleUploadFiles(e.dataTransfer.files, 'pgpa-ij'); }}
                  className={`bg-white rounded-lg border-2 border-dashed overflow-hidden transition-colors ${isDragging ? 'border-emerald-400 bg-emerald-50/50' : 'border-zinc-200'}`}
                >
                  <div className="px-8 py-12 text-center">
                    {isDragging ? (
                      <>
                        <Upload className="w-10 h-10 text-emerald-500 mx-auto mb-4" />
                        <h3 className="text-[15px] font-semibold text-emerald-700 mb-1">Déposez vos documents ici</h3>
                        <p className="text-[13px] text-emerald-600">Les fichiers seront analysés automatiquement</p>
                      </>
                    ) : (
                      <>
                        <div className="w-14 h-14 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto mb-4">
                          <Landmark className="w-7 h-7 text-zinc-400" />
                        </div>
                        <h3 className="text-[15px] font-semibold text-zinc-800 mb-1.5">Aucune indemnité journalière</h3>
                        <p className="text-[13px] text-zinc-400 mb-6 max-w-sm mx-auto">Ajoutez les décomptes de tiers payeurs ou créez une ligne manuellement.</p>

                        <div className="flex items-center justify-center gap-3 mb-8">
                          <button onClick={() => document.getElementById('pgpa-ij-file-input-empty').click()} className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 text-white text-[13px] font-medium rounded-lg hover:bg-zinc-800 transition-colors">
                            <Upload className="w-4 h-4" /> Ajouter des documents
                          </button>
                          <button onClick={() => handleAddManual('pgpa-ij')} className="flex items-center gap-2 px-4 py-2.5 border border-zinc-200 text-zinc-700 text-[13px] font-medium rounded-lg hover:bg-zinc-50 transition-colors">
                            <Edit3 className="w-4 h-4" /> Créer une ligne manuellement
                          </button>
                        </div>
                        <input type="file" id="pgpa-ij-file-input-empty" multiple accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => { if (e.target.files?.length) { handleUploadFiles(e.target.files, 'pgpa-ij'); e.target.value = ''; } }} />

                        <div className="border-t border-zinc-100 pt-5">
                          <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-3">Documents attendus</p>
                          <div className="flex flex-wrap justify-center gap-2">
                            {['Décomptes IJ Sécurité sociale', 'Décomptes mutuelle / prévoyance', 'Attestations de tiers payeur'].map(doc => (
                              <span key={doc} className="px-2.5 py-1 bg-zinc-50 text-[12px] text-zinc-500 rounded-md border border-zinc-100">{doc}</span>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Table avec zone d'ajout */}
              {pgpaData.ijPercues.length > 0 && (
              <div className="bg-white rounded-lg border overflow-hidden">
                <div
                  onDragOver={(e) => { e.preventDefault(); }}
                  onDrop={(e) => { e.preventDefault(); handleUploadFiles(e.dataTransfer.files, 'pgpa-ij'); }}
                  className="px-4 py-3 border-b bg-gray-50"
                >
                  <input type="file" id="pgpa-ij-file-input" multiple accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => { if (e.target.files?.length) { handleUploadFiles(e.target.files, 'pgpa-ij'); e.target.value = ''; } }} />
                  <div className="flex items-center gap-4">
                    <div
                      onClick={() => document.getElementById('pgpa-ij-file-input').click()}
                      className="flex items-center gap-3 px-3 py-2 border-2 border-dashed rounded-lg flex-1 hover:border-gray-400 cursor-pointer"
                    >
                      <Upload className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-500">Déposez attestations CPAM, relevés de prévoyance...</span>
                    </div>
                    <button onClick={() => handleAddManual('pgpa-ij')} className="px-3 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg whitespace-nowrap">
                      Ajouter des IJ
                    </button>
                  </div>
                </div>

                <div className="flex items-center px-4 py-2 border-b text-xs font-medium text-gray-500 uppercase tracking-wide">
                  <div className="w-10 flex-shrink-0">Statut</div>
                  <div className="w-12 flex-shrink-0">Pièce</div>
                  <div className="flex-1">Tiers payeur</div>
                  <div className="w-28">Période</div>
                  <div className="w-14 text-right">Jours</div>
                  <div className="w-24 text-right">Brut</div>
                  <div className="w-28 text-right">Net versé</div>
                </div>

                <div className="divide-y">
                  {pgpaData.ijPercues.map(l => {
                    const isSuggested = l.status === 'ai-suggested' || l.status === 'suggested';
                    const pieceCount = l.pieceIds?.length || 0;

                    const StatusIcon = () => {
                      if (isSuggested) return <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center" title="Suggestion IA"><Sparkles className="w-3 h-3 text-indigo-500" /></div>;
                      return null;
                    };

                    const PieceIndicator = () => {
                      if (pieceCount === 0) return <span className="inline-flex items-center justify-center w-7 h-7 bg-zinc-50 text-zinc-300 rounded border border-dashed border-zinc-200"><FileText className="w-3.5 h-3.5" /></span>;
                      return (
                        <div className="relative group/piece">
                          <span className="inline-flex items-center justify-center w-7 h-7 bg-blue-50 text-blue-600 rounded border border-blue-100 relative">
                            <FileText className="w-3.5 h-3.5" />
                            {pieceCount > 1 && <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-blue-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{pieceCount}</span>}
                          </span>
                          <div className="absolute left-0 top-full mt-1 w-56 p-2 bg-white border border-zinc-200 rounded-lg shadow-lg opacity-0 invisible group-hover/piece:opacity-100 group-hover/piece:visible transition-all z-50">
                            <div className="text-[10px] font-medium text-zinc-400 uppercase tracking-wide mb-1.5">{pieceCount} document{pieceCount > 1 ? 's' : ''} lié{pieceCount > 1 ? 's' : ''}</div>
                            <div className="space-y-1">
                              {l.pieceIds?.map(pid => {
                                const piece = getPiece(pid);
                                return <div key={pid} className="flex items-center gap-2 text-xs"><span className="w-5 h-5 bg-blue-100 text-blue-700 text-[10px] font-medium rounded flex items-center justify-center flex-shrink-0">{getPieceLabel(pid)}</span><span className="truncate text-zinc-700">{piece?.intitule || piece?.nom || 'Document'}</span></div>;
                              })}
                            </div>
                            <div className="absolute -top-1.5 left-3 w-3 h-3 bg-white border-l border-t border-zinc-200 rotate-45" />
                          </div>
                        </div>
                      );
                    };

                    return (
                      <div
                        key={l.id}
                        onClick={() => openPgpaEditPanel('pgpa-ij', l)}
                        className={`flex items-center px-4 py-3 group cursor-pointer transition-colors ${isSuggested ? 'border-l-[3px] border-indigo-400 hover:bg-zinc-50' : 'hover:bg-zinc-50'}`}
                      >
                        <div className="w-10 flex-shrink-0"><StatusIcon /></div>
                        <div className="w-12 flex-shrink-0"><PieceIndicator /></div>
                        <div className="flex-1 min-w-0 pr-4">
                          <div className="text-sm font-medium text-zinc-800 truncate">{l.tiers || 'Sans tiers'}</div>
                          <div className="text-xs text-zinc-500">{l.label}</div>
                        </div>
                        <div className="w-28 text-sm text-zinc-500 flex-shrink-0">{l.periode}</div>
                        <div className="w-14 text-right text-sm text-zinc-500 tabular-nums flex-shrink-0">{l.jours}</div>
                        <div className="w-24 text-right text-sm text-zinc-500 tabular-nums flex-shrink-0">{fmt(l.montantBrut)}</div>
                        <div className="w-28 text-right flex-shrink-0">
                          <span className="font-semibold tabular-nums text-zinc-900">{fmt(l.montant)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              )}
              
              {/* Bandeau ticket */}
              <div className="fixed bottom-0 left-64 right-0 bg-white border-t shadow-[0_-4px_12px_rgba(0,0,0,0.08)] z-30">
                <div className="flex items-start justify-between px-6 py-5">
                  <div className="flex items-center gap-2 text-gray-400 pt-1">
                    <Calculator className="w-5 h-5" />
                    <span className="text-sm font-medium">Récapitulatif</span>
                  </div>
                  <div className="text-right min-w-[240px]">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>Total brut</span>
                        <span className="tabular-nums font-medium ml-8">{fmt(pgpaData.ijPercues.reduce((s, l) => s + l.montantBrut, 0))}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>CSG-CRDS</span>
                        <span className="tabular-nums font-medium ml-8">− {fmt(pgpaData.ijPercues.reduce((s, l) => s + l.csgCrds, 0))}</span>
                      </div>
                    </div>
                    <div className="border-t border-gray-200 my-4" />
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900">Total IJ net (tiers payeur)</span>
                      <span className="text-2xl font-bold text-gray-900 tabular-nums ml-8">{fmt(ijPercuesTotal)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        }
      }
      
      // ===== VUE SOMMAIRE PGPA =====
      return (
        <div className="space-y-4 pb-32">
          {/* Liste des sous-sections */}
          <div className="bg-white rounded-lg border border-zinc-200/60 divide-y divide-zinc-100">
            <button
              onClick={() => {
                setNavStack(prev => {
                  const newStack = [...prev];
                  newStack[newStack.length - 1] = { ...newStack[newStack.length - 1], subSection: 'revenus-ref' };
                  return newStack;
                });
              }}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <span className="font-medium text-gray-900">Revenus de référence</span>
              <div className="flex items-center gap-3">
                {revenuRefAnnuel > 0 ? (
                  <span className="font-semibold tabular-nums">{fmt(revenuRefAnnuel)}/an</span>
                ) : (
                  <span className="font-semibold tabular-nums text-gray-400">—</span>
                )}
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </button>
            
            <button
              onClick={() => {
                setNavStack(prev => {
                  const newStack = [...prev];
                  newStack[newStack.length - 1] = { ...newStack[newStack.length - 1], subSection: 'revenus-percus' };
                  return newStack;
                });
              }}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <span className="font-medium text-gray-900">Revenus perçus sur la période</span>
              <div className="flex items-center gap-3">
                {revenusPercusTotal > 0 ? (
                  <span className="font-semibold tabular-nums">{fmt(revenusPercusTotal)}</span>
                ) : (
                  <span className="font-semibold tabular-nums text-gray-400">—</span>
                )}
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </button>
            
            <button
              onClick={() => {
                setNavStack(prev => {
                  const newStack = [...prev];
                  newStack[newStack.length - 1] = { ...newStack[newStack.length - 1], subSection: 'ij' };
                  return newStack;
                });
              }}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <span className="font-medium text-gray-900">Indemnités journalières (tiers payeur)</span>
              <div className="flex items-center gap-3">
                {ijPercuesTotal > 0 ? (
                  <span className="font-semibold tabular-nums">{fmt(ijPercuesTotal)}</span>
                ) : (
                  <span className="font-semibold tabular-nums text-gray-400">—</span>
                )}
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </button>
          </div>
          
          {/* Bandeau sticky totaux */}
          <div className="fixed bottom-0 left-64 right-0 bg-white border-t shadow-[0_-4px_12px_rgba(0,0,0,0.08)] z-30">
            <div className="flex items-start justify-between px-6 py-5">
              <div className="flex items-center gap-2 text-gray-400 pt-1">
                <Calculator className="w-5 h-5" />
                <span className="text-sm font-medium">Récapitulatif</span>
              </div>
              
              <div className="text-right min-w-[280px]">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Perte de gains ({pgpaData.periode.mois} mois)</span>
                    <span className="tabular-nums font-medium ml-8">{fmt(perteDeGains)}</span>
                  </div>
                  {ijPercuesTotal > 0 && (
                    <div className="flex items-center justify-between text-xs text-zinc-500">
                      <span>IJ perçues (tiers payeur)</span>
                      <span className="tabular-nums font-medium ml-8" style={{ color: '#991b1b' }}>− {fmt(ijPercuesTotal)}</span>
                    </div>
                  )}
                </div>
                
                <div className="border-t border-zinc-200 my-3" />
                
                <div className="flex items-center justify-between py-2 px-3 -mx-3 rounded" style={{ backgroundColor: '#F5F5F0' }}>
                  <span className="font-semibold text-zinc-700">Indemnité victime</span>
                  <span className="text-xl font-bold text-zinc-900 tabular-nums">{fmt(indemniteVictimePGPA)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // ========== PGPF ==========
    if (currentLevel.id === 'pgpf') {
      const periodeCL = pgpfData.periodes['pgpf-cl'];
      const periodeAL = pgpfData.periodes['pgpf-al'];
      const tiersTotal = periodeAL.tiersPayeurs.reduce((s, t) => s + t.montantCapitalise, 0);
      
      return (
        <div>
          <div className="text-2xl font-bold mb-4">{fmt(pgpfTotal)}</div>

          {/* Section 1: Conso → Liqui */}
          <div className="bg-white rounded-lg border mb-4 overflow-hidden">
            <button onClick={() => toggleSection('pgpf-cl')} className="w-full flex items-center justify-between p-4 hover:bg-gray-50">
              <div className="flex items-center gap-3">
                {expandedSections.includes('pgpf-cl') ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                <Calendar className="w-5 h-5 text-blue-500" />
                <div className="text-left">
                  <div className="font-semibold">{periodeCL.label}</div>
                  <div className="text-sm text-gray-500">{periodeCL.periode.debut} → {periodeCL.periode.fin} ({periodeCL.periode.mois} mois)</div>
                </div>
                <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">Échu</span>
              </div>
              <span className="text-lg font-bold">{fmt(pgpfClTotal)}</span>
            </button>
            
            {expandedSections.includes('pgpf-cl') && (
              <div className="border-t">
                {/* Revenu ref */}
                <div className="border-b">
                  <div className="px-4 py-3 bg-amber-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-amber-900">Revenu d'activité de référence</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-amber-200 text-amber-800">= {fmt(periodeCL.revenuRef.total)}/an</span>
                    </div>
                    <button className="p-1.5 text-amber-700 hover:bg-amber-100 rounded"><Edit3 className="w-4 h-4" /></button>
                  </div>
                </div>
                
                {/* Revenus perçus */}
                <div className="border-b">
                  <div className="px-4 py-2 bg-gray-50 flex items-center justify-between">
                    <span className="text-sm font-medium">Revenus perçus sur la période</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-red-600">- {fmt(periodeCL.revenusPercus.reduce((s, l) => s + l.montant, 0))}</span>
                      <button className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"><Plus className="w-3 h-3" /></button>
                    </div>
                  </div>
                  <div className="divide-y">
                    {periodeCL.revenusPercus.map(l => renderPGLigne(l, { onEdit: () => {} }))}
                  </div>
                </div>
                
                {/* IJ perçues */}
                <div>
                  <div className="px-4 py-2 bg-gray-50 flex items-center justify-between">
                    <span className="text-sm font-medium">Indemnités journalières perçues</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-red-600">- {fmt(periodeCL.ijPercues.reduce((s, l) => s + l.montant, 0))}</span>
                      <button className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"><Plus className="w-3 h-3" /></button>
                    </div>
                  </div>
                  <div className="divide-y">
                    {periodeCL.ijPercues.map(l => renderPGLigne(l, { onEdit: () => {} }))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Après Liqui */}
          <div className="bg-white rounded-lg border overflow-hidden">
            <button onClick={() => toggleSection('pgpf-al')} className="w-full flex items-center justify-between p-4 hover:bg-gray-50">
              <div className="flex items-center gap-3">
                {expandedSections.includes('pgpf-al') ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                <Landmark className="w-5 h-5 text-purple-500" />
                <div className="text-left">
                  <div className="font-semibold">{periodeAL.label}</div>
                  <div className="text-sm text-gray-500">{periodeAL.periode.debut} → {periodeAL.periode.fin}</div>
                </div>
                <span className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-700">Capitalisation</span>
              </div>
              <span className="text-lg font-bold">{fmt(pgpfAlTotal)}</span>
            </button>
            
            {expandedSections.includes('pgpf-al') && (
              <div className="border-t">
                {/* Paramètres */}
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-purple-900">Paramètres de capitalisation</span>
                    <button className="p-1.5 text-purple-700 hover:bg-purple-100 rounded"><Edit3 className="w-4 h-4" /></button>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div><span className="text-gray-500">Âge</span><p className="font-medium">{periodeAL.params.age} ans</p></div>
                    <div><span className="text-gray-500">Perte annuelle</span><p className="font-medium">{fmt(periodeAL.params.perteGainAnnuelle)}</p></div>
                    <div><span className="text-gray-500">Barème</span><p className="font-medium text-xs">{periodeAL.params.bareme}</p></div>
                    <div><span className="text-gray-500">Âge dernier arrérage</span><p className="font-medium">{periodeAL.params.ageDernierArreage} ans</p></div>
                    <div><span className="text-gray-500">Coefficient</span><p className="font-medium">{periodeAL.params.coefficient}</p></div>
                    <div><span className="text-gray-500">Montant capitalisé</span><p className="font-bold text-purple-700">{fmt(periodeAL.params.montantCapitalise)}</p></div>
                  </div>
                </div>
                
                {/* Tiers payeurs */}
                <div className="border-b">
                  <div className="px-4 py-2 bg-gray-50">
                    <span className="text-sm font-medium">Tiers payeurs</span>
                  </div>
                  <div className="divide-y">
                    {periodeAL.tiersPayeurs.map(tp => (
                      <div key={tp.id} className="flex items-center justify-between p-3 hover:bg-gray-50 group">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{tp.label}</span>
                          {tp.modified && <RefreshCw className="w-3 h-3 text-amber-500" />}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-500">Rente: {fmt(tp.renteAnnuelle)}/an</span>
                          <span className="font-semibold">{fmt(tp.montantCapitalise)}</span>
                          <button className="p-1.5 text-gray-400 hover:text-blue-600 rounded opacity-0 group-hover:opacity-100"><Edit3 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Résultat */}
                <div className={`p-4 ${pgpfAlTotal - tiersTotal < 0 ? 'bg-red-50' : 'bg-green-50'}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Différence (victime)</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xl font-bold ${pgpfAlTotal - tiersTotal < 0 ? 'text-red-700' : 'text-green-700'}`}>{fmt(pgpfAlTotal - tiersTotal)}</span>
                      {pgpfAlTotal - tiersTotal < 0 && (
                        <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />Trop perçu
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    // ========== DFT ==========
    if (currentLevel.id === 'dft') {
      const filteredPiecesForSearch = pieces.filter(p =>
        !p.used && (p.intitule || p.nom).toLowerCase().includes(searchPieces.toLowerCase())
      );
      return (
        <div>
          {/* Empty state */}
          {dftLignes.length === 0 && processing.length === 0 && (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleUploadFiles(e.dataTransfer.files, 'dft'); }}
              className={`bg-white rounded-lg border-2 border-dashed overflow-hidden transition-colors ${isDragging ? 'border-emerald-400 bg-emerald-50/50' : 'border-zinc-200'}`}
            >
              <div className="px-8 py-12 text-center">
                {isDragging ? (
                  <>
                    <Upload className="w-10 h-10 text-emerald-500 mx-auto mb-4" />
                    <h3 className="text-[15px] font-semibold text-emerald-700 mb-1">Déposez vos documents ici</h3>
                    <p className="text-[13px] text-emerald-600">Les fichiers seront analysés automatiquement</p>
                  </>
                ) : (
                  <>
                    <div className="w-14 h-14 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-7 h-7 text-zinc-400" />
                    </div>
                    <h3 className="text-[15px] font-semibold text-zinc-800 mb-1.5">Aucune période de déficit fonctionnel temporaire</h3>
                    <p className="text-[13px] text-zinc-400 mb-6 max-w-sm mx-auto">Commencez par ajouter un rapport d'expertise ou créez une période manuellement.</p>
                    <div className="flex items-center justify-center gap-3 mb-8">
                      <button onClick={() => document.getElementById('dft-file-input-empty').click()} className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 text-white text-[13px] font-medium rounded-lg hover:bg-zinc-800 transition-colors">
                        <Upload className="w-4 h-4" /> Ajouter des documents
                      </button>
                      <button onClick={() => handleAddManual('dft')} className="flex items-center gap-2 px-4 py-2.5 border border-zinc-200 text-zinc-700 text-[13px] font-medium rounded-lg hover:bg-zinc-50 transition-colors">
                        <Edit3 className="w-4 h-4" /> Créer une période manuellement
                      </button>
                    </div>
                    <input type="file" id="dft-file-input-empty" multiple accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => { if (e.target.files?.length) { handleUploadFiles(e.target.files, 'dft'); e.target.value = ''; } }} />
                    <div className="border-t border-zinc-100 pt-5">
                      <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-3">Documents attendus</p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {['Rapport d\'expertise médicale', 'Rapport médical du médecin expert'].map(doc => (
                          <span key={doc} className="px-2.5 py-1 bg-zinc-50 text-[12px] text-zinc-500 rounded-md border border-zinc-100">{doc}</span>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Processing */}
          {processing.length > 0 && (
            <div className="space-y-2 mb-4">
              {processing.map(p => (
                <div key={p.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-zinc-200">
                  <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-zinc-600">{p.phase === 'upload' ? 'Téléchargement...' : 'Analyse en cours...'}</span>
                  <span className="text-sm text-zinc-400 truncate">{p.name}</span>
                </div>
              ))}
            </div>
          )}

          {/* Action header when lines exist */}
          {dftLignes.length > 0 && (
            <div className={`px-4 py-3 border-b transition-colors ${isDragging ? 'bg-emerald-50 border-emerald-200' : 'bg-zinc-50/50'}`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleUploadFiles(e.dataTransfer.files, 'dft'); }}
            >
              <input type="file" id="dft-file-input" multiple accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => { if (e.target.files?.length) { handleUploadFiles(e.target.files, 'dft'); e.target.value = ''; } }} />
              <div className="flex items-center gap-4">
                <div
                  onClick={() => document.getElementById('dft-file-input').click()}
                  className={`flex items-center gap-3 px-4 py-2.5 border-2 border-dashed rounded-lg flex-1 transition-all cursor-pointer ${
                    isDragging ? 'border-emerald-400 bg-emerald-50' : 'border-zinc-300 hover:border-zinc-400 hover:bg-zinc-50'
                  }`}
                >
                  <Upload className={`w-5 h-5 ${isDragging ? 'text-emerald-600' : 'text-zinc-400'}`} strokeWidth={1.5} />
                  <span className={`text-[13px] ${isDragging ? 'text-emerald-700 font-medium' : 'text-zinc-500'}`}>
                    {isDragging ? 'Relâchez pour ajouter' : 'Déposez ou cliquez pour ajouter un document'}
                  </span>
                </div>

                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Rechercher une pièce existante..."
                    value={searchPieces}
                    onChange={(e) => setSearchPieces(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 border border-zinc-200 rounded-lg text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-zinc-300"
                  />
                  {searchPieces && (
                    <div className="absolute left-0 right-0 top-full mt-1 z-20 bg-white rounded-lg border shadow-lg max-h-48 overflow-y-auto">
                      {filteredPiecesForSearch.length === 0 ? (
                        <p className="text-center text-zinc-500 py-3 text-[13px]">Aucune pièce</p>
                      ) : (
                        <div className="py-1">
                          {filteredPiecesForSearch.map(p => (
                            <button key={p.id} onClick={() => { handleAddFromPiece(p, 'dft'); setSearchPieces(''); }} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-zinc-50 text-left">
                              <span className="w-6 h-6 bg-zinc-100 text-zinc-600 text-[11px] font-medium rounded flex items-center justify-center">P{pieces.findIndex(x => x.id === p.id) + 1}</span>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate">{p.intitule || p.nom}</div>
                                <div className="text-xs text-gray-500">{p.type}</div>
                              </div>
                              <Plus className="w-4 h-4 text-blue-600" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <button onClick={() => handleAddManual('dft')} className="px-3 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors whitespace-nowrap">
                  Ajouter une période
                </button>
              </div>
            </div>
          )}

          {/* Table */}
          {dftLignes.length > 0 && (
            <div className="bg-white rounded-lg border overflow-hidden">
              <div className="flex items-center px-4 py-2 border-b text-xs font-medium text-gray-500 uppercase tracking-wide">
                <div className="w-10 flex-shrink-0"></div>
                <div className="w-12 flex-shrink-0">Pièce</div>
                <div className="flex-1 min-w-0">Période & jours</div>
                <div className="w-16 text-center flex-shrink-0">Taux</div>
                <div className="w-28 text-right flex-shrink-0">Montant</div>
              </div>
              <div className="divide-y">
                {dftLignes.map(l => {
                  const isSuggested = l.status === 'ai-suggested' || l.status === 'suggested';
                  const pieceCount = l.pieceIds?.length || 0;

                  const StatusIcon = () => {
                    if (isSuggested) return <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center" title="Suggestion IA"><Sparkles className="w-3 h-3 text-indigo-500" /></div>;
                    return null;
                  };

                  const PieceIndicator = () => {
                    if (pieceCount === 0) return <span className="inline-flex items-center justify-center w-7 h-7 bg-zinc-50 text-zinc-300 rounded border border-dashed border-zinc-200"><FileText className="w-3.5 h-3.5" /></span>;
                    return (
                      <div className="relative group/piece">
                        <span className="inline-flex items-center justify-center w-7 h-7 bg-blue-50 text-blue-600 rounded border border-blue-100 relative">
                          <FileText className="w-3.5 h-3.5" />
                          {pieceCount > 1 && <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-blue-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{pieceCount}</span>}
                        </span>
                        <div className="absolute left-0 top-full mt-1 w-56 p-2 bg-white border border-zinc-200 rounded-lg shadow-lg opacity-0 invisible group-hover/piece:opacity-100 group-hover/piece:visible transition-all z-50">
                          <div className="text-[10px] font-medium text-zinc-400 uppercase tracking-wide mb-1.5">{pieceCount} document{pieceCount > 1 ? 's' : ''} lié{pieceCount > 1 ? 's' : ''}</div>
                          <div className="space-y-1">
                            {l.pieceIds?.map(pid => {
                              const piece = getPiece(pid);
                              return <div key={pid} className="flex items-center gap-2 text-xs"><span className="w-5 h-5 bg-blue-100 text-blue-700 text-[10px] font-medium rounded flex items-center justify-center flex-shrink-0">{getPieceLabel(pid)}</span><span className="truncate text-zinc-700">{piece?.intitule || piece?.nom || 'Document'}</span></div>;
                            })}
                          </div>
                          <div className="absolute -top-1.5 left-3 w-3 h-3 bg-white border-l border-t border-zinc-200 rotate-45" />
                        </div>
                      </div>
                    );
                  };

                  return (
                    <div key={l.id} onClick={() => { setEditingPieceIds(l.pieceIds || []); setSearchPiecesPanel(''); setEditPanel({ type: 'dft-ligne', data: l }); }}
                      className={`flex items-center px-4 py-3 group cursor-pointer transition-colors ${isSuggested ? 'border-l-[3px] border-indigo-400 hover:bg-zinc-50' : 'hover:bg-zinc-50'}`}>
                      <div className="w-10 flex-shrink-0"><StatusIcon /></div>
                      <div className="w-12 flex-shrink-0"><PieceIndicator /></div>
                      <div className="flex-1 min-w-0 pr-4">
                        <div className="text-sm font-medium text-zinc-800">{l.label || 'Sans libellé'}</div>
                        <div className="text-xs text-zinc-400">{l.debut} → {l.fin} · {l.jours}j</div>
                      </div>
                      <div className="w-16 text-center flex-shrink-0">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${l.taux === 100 ? 'bg-zinc-100 text-zinc-700' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>{l.taux || 100}%</span>
                      </div>
                      <div className="w-28 text-right flex-shrink-0">
                        <span className="text-sm font-semibold tabular-nums text-zinc-900">{fmt(l.montant)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sticky recap footer */}
          {dftLignes.length > 0 && (
            <div className="fixed bottom-0 left-64 right-0 bg-white border-t shadow-[0_-4px_12px_rgba(0,0,0,0.08)] z-30">
              <div className="flex items-start justify-between px-6 py-5">
                <div className="flex items-center gap-2 text-gray-400 pt-1">
                  <Calculator className="w-5 h-5" />
                  <span className="text-sm font-medium">Récapitulatif</span>
                </div>
                <div className="text-right min-w-[240px]">
                  <div className="flex items-center justify-between py-2 px-3 -mx-3 rounded" style={{ backgroundColor: '#F5F5F0' }}>
                    <span className="font-semibold text-zinc-700">Total DFT</span>
                    <span className="text-xl font-bold text-zinc-900 tabular-nums">{fmt(dftTotal)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }


    return null;
  };

  // Descriptions des postes
  const posteDescriptions = {
    dsa: "Ensemble des frais médicaux, pharmaceutiques, paramédicaux et d'hospitalisation engagés entre la date du fait dommageable et la consolidation.",
    pgpa: "Pertes de revenus professionnels subies entre le fait dommageable et la consolidation, déduction faite des indemnités journalières perçues.",
    dft: "Indemnisation de la perte de qualité de vie pendant les périodes d'incapacité temporaire (hospitalisation, rééducation, gêne résiduelle).",
    pgpf: "Pertes de revenus professionnels subies après la consolidation, évaluées selon la méthode du calcul ou de la capitalisation."
  };

  // ========== NAVIGATION DOSSIER LIST ==========
  const openDossier = (dossier) => {
    if (activeDossierId) saveDossierData(activeDossierId);
    loadDossierData(dossier.id);
    setActiveDossierId(dossier.id);
    setNavStack([{ id: dossier.id, type: 'dossier', title: dossier.reference, activeTab: 'détail' }]);
    setCurrentPage('dossier');
  };

  const backToList = () => {
    if (activeDossierId) saveDossierData(activeDossierId);
    setCurrentPage('list');
    setActiveDossierId(null);
  };

  // ========== RENDER WIZARD CRÉATION DOSSIER ==========
  // ========== MODALE EXPORT (surfacing, non-actionable) ==========
  const renderExportModal = () => {
    if (!showExportModal) return null;

    const options = [
      {
        icon: Copy,
        label: 'Copier le texte',
        desc: 'Copier le contenu du chiffrage (montants, calculs, argumentaire).',
        tooltip: 'Option envisagée pour permettre une réutilisation rapide du contenu dans vos outils.',
      },
      {
        icon: FileText,
        label: 'Générer un document Word',
        desc: 'Créer automatiquement un document Word (.docx) à partir du chiffrage.',
        tooltip: 'Cette fonctionnalité permettra de générer un document structuré à partir des données du chiffrage.',
      },
      {
        icon: FileSpreadsheet,
        label: 'Utiliser un template personnalisé',
        desc: 'Injecter les données du chiffrage dans votre propre modèle Word.',
        tooltip: 'Approche basée sur des variables, similaire à celle utilisée chez Broker.',
      },
      {
        icon: Plug2,
        label: 'Installer l\'add-in Word',
        desc: 'Importer directement les données dans Word via un add-in.',
        tooltip: 'Objectif : synchroniser le chiffrage avec Word sans export intermédiaire.',
      },
    ];

    const titre = currentLevel.type === 'poste'
      ? `Exporter — ${currentLevel.fullTitle || currentLevel.title}`
      : 'Exporter le chiffrage';

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowExportModal(false)}>
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h2 className="text-[15px] font-semibold text-zinc-800">{titre}</h2>
            <button onClick={() => setShowExportModal(false)} className="p-1.5 hover:bg-zinc-100 rounded-lg transition-colors">
              <X className="w-4 h-4 text-zinc-400" />
            </button>
          </div>
          <div className="p-4 space-y-2">
            {options.map((opt, i) => (
              <div key={i} className="group relative flex items-start gap-4 p-4 rounded-xl hover:bg-zinc-50 transition-colors cursor-default">
                <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center flex-shrink-0 group-hover:bg-zinc-200 transition-colors">
                  <opt.icon className="w-5 h-5 text-zinc-500" strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-800">{opt.label}</p>
                  <p className="text-[12px] text-zinc-500 mt-0.5 leading-relaxed">{opt.desc}</p>
                </div>
                <span className="absolute left-4 right-4 -bottom-1 translate-y-full p-2.5 bg-zinc-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-30 pointer-events-none">
                  {opt.tooltip}
                </span>
              </div>
            ))}
          </div>
          <div className="px-6 py-4 border-t bg-zinc-50 rounded-b-xl">
            <p className="text-[11px] text-zinc-400 text-center">Ces options sont présentées à titre informatif pour recueillir vos retours.</p>
          </div>
        </div>
      </div>
    );
  };

  const renderCreationWizard = () => {
    if (!creationWizard) return null;

    const { step, formData } = creationWizard;

    const updateFormData = (field, value) => {
      setCreationWizard(prev => ({ ...prev, formData: { ...prev.formData, [field]: value } }));
    };

    const ageFromInput = (val) => { if (!val || val.length < 10) return null; const [d, m, y] = val.split('/'); if (!d || !m || !y) return null; const b = new Date(y, m - 1, d); const n = new Date(); let a = n.getFullYear() - b.getFullYear(); if (n.getMonth() < b.getMonth() || (n.getMonth() === b.getMonth() && n.getDate() < b.getDate())) a--; return a; };
    const computedAge = ageFromInput(formData.dateNaissance);

    const canSubmitInfos = formData.nom && formData.prenom && formData.dateNaissance && formData.dateAccident;

    if (step === 'infos') {
      return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl mx-4 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 border-b border-zinc-100">
              <h2 className="text-lg font-semibold text-zinc-800">Nouveau dossier</h2>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-6">
              {/* Section Identité */}
              <div>
                <h3 className="text-[13px] font-semibold text-zinc-700 mb-3">Identité de la victime</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-medium text-zinc-500 mb-1.5">Nom *</label>
                    <input
                      type="text"
                      value={formData.nom}
                      onChange={(e) => updateFormData('nom', e.target.value)}
                      placeholder="Nom de famille"
                      className="w-full px-3 py-2.5 border border-zinc-200 rounded-lg text-[14px] text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-300 focus:border-zinc-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium text-zinc-500 mb-1.5">Prénom *</label>
                    <input
                      type="text"
                      value={formData.prenom}
                      onChange={(e) => updateFormData('prenom', e.target.value)}
                      placeholder="Prénom"
                      className="w-full px-3 py-2.5 border border-zinc-200 rounded-lg text-[14px] text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-300 focus:border-zinc-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium text-zinc-500 mb-1.5">Sexe</label>
                    <select
                      value={formData.sexe}
                      onChange={(e) => updateFormData('sexe', e.target.value)}
                      className="w-full px-3 py-2.5 border border-zinc-200 rounded-lg text-[14px] text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-300 focus:border-zinc-400 transition-colors"
                    >
                      <option value="Homme">Homme</option>
                      <option value="Femme">Femme</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium text-zinc-500 mb-1.5">Date de naissance *</label>
                    <input
                      type="text"
                      placeholder="JJ/MM/AAAA"
                      value={formData.dateNaissance}
                      onChange={(e) => updateFormData('dateNaissance', e.target.value)}
                      className="w-full px-3 py-2.5 border border-zinc-200 rounded-lg text-[14px] text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-300 focus:border-zinc-400 transition-colors"
                    />
                    {computedAge !== null && <div className="text-[11px] text-zinc-400 mt-1">{computedAge} ans</div>}
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[12px] font-medium text-zinc-500 mb-1.5">Date de décès</label>
                    <input
                      type="text"
                      placeholder="JJ/MM/AAAA"
                      value={formData.dateDeces}
                      onChange={(e) => updateFormData('dateDeces', e.target.value)}
                      className="w-full px-3 py-2.5 border border-zinc-200 rounded-lg text-[14px] text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-300 focus:border-zinc-400 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Section Contexte */}
              <div>
                <h3 className="text-[13px] font-semibold text-zinc-700 mb-3">Contexte</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-medium text-zinc-500 mb-1.5">Type de fait générateur</label>
                    <select
                      value={formData.typeFait}
                      onChange={(e) => updateFormData('typeFait', e.target.value)}
                      className="w-full px-3 py-2.5 border border-zinc-200 rounded-lg text-[14px] text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-300 focus:border-zinc-400 transition-colors"
                    >
                      {typesFaitGenerateur.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium text-zinc-500 mb-1.5">Date de l'accident *</label>
                    <input
                      type="text"
                      placeholder="JJ/MM/AAAA"
                      value={formData.dateAccident}
                      onChange={(e) => updateFormData('dateAccident', e.target.value)}
                      className="w-full px-3 py-2.5 border border-zinc-200 rounded-lg text-[14px] text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-300 focus:border-zinc-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium text-zinc-500 mb-1.5">Date de consolidation <span className="text-zinc-300 font-normal">(facultatif)</span></label>
                    <input
                      type="text"
                      placeholder="JJ/MM/AAAA"
                      value={formData.dateConsolidation}
                      onChange={(e) => updateFormData('dateConsolidation', e.target.value)}
                      className="w-full px-3 py-2.5 border border-zinc-200 rounded-lg text-[14px] text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-300 focus:border-zinc-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium text-zinc-500 mb-1.5">Date de liquidation <span className="text-zinc-300 font-normal">(facultatif)</span></label>
                    <input
                      type="text"
                      placeholder="JJ/MM/AAAA"
                      value={formData.dateLiquidation}
                      onChange={(e) => updateFormData('dateLiquidation', e.target.value)}
                      className="w-full px-3 py-2.5 border border-zinc-200 rounded-lg text-[14px] text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-300 focus:border-zinc-400 transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-zinc-100 flex justify-end gap-3">
              <button
                onClick={() => setCreationWizard(null)}
                className="px-4 py-2.5 text-[13px] text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => setCreationWizard(prev => ({ ...prev, step: 'mode-chiffrage' }))}
                disabled={!canSubmitInfos}
                className="px-5 py-2.5 bg-zinc-900 text-white text-[13px] font-medium rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Créer le dossier
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (step === 'mode-chiffrage') {
      return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl mx-4 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 border-b border-zinc-100">
              <h2 className="text-lg font-semibold text-zinc-800">Comment souhaitez-vous commencer ?</h2>
            </div>

            {/* Body */}
            <div className="px-6 py-6 flex gap-4">
              {/* Option A: Avec rapport */}
              <div
                onClick={() => document.getElementById('wizard-file-input').click()}
                className="flex-1 p-6 border-2 border-zinc-200 rounded-xl hover:border-zinc-400 hover:bg-zinc-50 cursor-pointer transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center mb-4 group-hover:bg-zinc-200 transition-colors">
                  <FileText className="w-6 h-6 text-zinc-600" />
                </div>
                <h3 className="text-[15px] font-semibold text-zinc-800 mb-2">J'ai le rapport médical</h3>
                <p className="text-[13px] text-zinc-500 leading-relaxed">Importez le rapport d'expertise et Norma extraira automatiquement les données pour pré-remplir le chiffrage.</p>
                <input
                  id="wizard-file-input"
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files && files.length > 0) {
                      handleCreateDossier(formData);
                      setTimeout(() => handleDocumentUploadForExtraction(files), 100);
                    }
                  }}
                />
              </div>

              {/* Option B: Sans rapport */}
              <div
                onClick={() => handleCreateDossier(formData, 'détail')}
                className="flex-1 p-6 border-2 border-zinc-200 rounded-xl hover:border-zinc-400 hover:bg-zinc-50 cursor-pointer transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center mb-4 group-hover:bg-zinc-200 transition-colors">
                  <Edit3 className="w-6 h-6 text-zinc-600" />
                </div>
                <h3 className="text-[15px] font-semibold text-zinc-800 mb-2">Chiffrer sans rapport médical</h3>
                <p className="text-[13px] text-zinc-500 leading-relaxed">Commencez avec un dossier vide et ajoutez manuellement les postes de préjudice au fur et à mesure.</p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-zinc-100 flex justify-end gap-3">
              <button
                onClick={() => setCreationWizard(prev => ({ ...prev, step: 'infos' }))}
                className="px-4 py-2.5 text-[13px] text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
              >
                Retour
              </button>
              <button
                onClick={() => setCreationWizard(null)}
                className="px-4 py-2.5 text-[13px] text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  // ========== RENDER PAGE LISTE ==========
  const renderDossierListPage = () => (
    <div className="h-screen flex relative" style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '13px', color: '#27272a' }}>
      {/* Sidebar Rail - anthracite */}
      <div className="w-14 bg-zinc-900 flex flex-col items-center py-4 flex-shrink-0">
        {/* Logo Norma */}
        <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center mb-6">
          <span className="text-zinc-900 font-bold text-[15px]">N</span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom: Settings + User */}
        <div className="flex flex-col items-center gap-3">
          <button className="w-9 h-9 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors">
            <Settings className="w-[18px] h-[18px]" />
          </button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white text-xs font-medium cursor-pointer">
            MR
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden" style={{ backgroundColor: '#F8F7F5' }}>
        {/* Header */}
        <div className="px-8 pt-8 pb-6">
          <div className="flex items-center justify-between">
            <h1 style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: '28px', fontWeight: 400, color: '#18181b', letterSpacing: '-0.01em' }}>
              Mes dossiers
            </h1>
            <button
              onClick={() => setCreationWizard({ step: 'infos', formData: { nom: '', prenom: '', sexe: 'Homme', dateNaissance: '', dateDeces: '', reference: '', typeFait: 'Accident de la route', dateAccident: '', dateConsolidation: '', dateLiquidation: '' } })}
              className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nouveau dossier
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto px-8 pb-8">
          <div className="bg-white rounded-lg border border-zinc-200/60 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-100">
                  <th className="px-5 py-3 text-left text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Référence</th>
                  <th className="px-5 py-3 text-left text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Type de fait</th>
                  <th className="px-5 py-3 text-left text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Date</th>
                  <th className="px-5 py-3 text-left text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Dernier édit</th>
                  <th className="px-5 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {dossiers.map(dossier => (
                  <tr
                    key={dossier.id}
                    onClick={() => openDossier(dossier)}
                    className="hover:bg-zinc-50 cursor-pointer transition-colors group"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center flex-shrink-0">
                          <Folder className="w-4 h-4 text-zinc-400" />
                        </div>
                        <span className="text-[14px] font-medium text-zinc-800">{dossier.reference}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[13px] text-zinc-500">{dossier.typeFait}</td>
                    <td className="px-5 py-4 text-[13px] text-zinc-500 tabular-nums">{dossier.date}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center flex-shrink-0">
                          <span className="text-[9px] text-white font-medium">{dossier.lastEditBy.split(' ').map(n => n[0]).join('')}</span>
                        </div>
                        <span className="text-[13px] text-zinc-500">{dossier.lastEditDate}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={(e) => { e.stopPropagation(); }}
                        className="p-1.5 rounded-lg text-zinc-300 hover:text-zinc-600 hover:bg-zinc-100 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {renderCreationWizard()}
    </div>
  );

  // ========== MAIN ==========
  // Obtenir le parent pour le bouton back
  const getParentInfo = () => {
    // Si on est dans une sous-section PGPA
    if (currentLevel.subSection) {
      return { hasBack: true, action: () => {
        setNavStack(prev => {
          const newStack = [...prev];
          delete newStack[newStack.length - 1].subSection;
          return [...newStack];
        });
      }};
    }
    // Navigation normale
    if (navStack.length <= 1) return null;
    return { hasBack: true, action: () => navigateToStackLevel(navStack.length - 2) };
  };
  
  const parentInfo = getParentInfo();

  // ========== ROUTING ==========
  if (currentPage === 'list') {
    return renderDossierListPage();
  }

  return (
    <div
      className="h-screen flex"
      style={{
        backgroundColor: '#F8F7F5',
        fontFamily: "'Inter', system-ui, sans-serif",
        fontSize: '13px',
        color: '#27272a'
      }}
    >
      {/* Sidebar */}
      {renderSidebar()}
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden" style={{ backgroundColor: '#F8F7F5' }}>
        {/* Header - fond beige, imposant */}
        <div className="px-8 pt-6 pb-4">
          {/* Bouton Back */}
          {parentInfo && (
            <button 
              onClick={parentInfo.action}
              className="flex items-center gap-1.5 text-[13px] text-zinc-400 hover:text-zinc-600 mb-3 -ml-1 transition-colors"
            >
              <ChevronRight className="w-4 h-4 rotate-180" strokeWidth={1.5} />
              <span>Retour</span>
            </button>
          )}
          
          <div className="flex items-start justify-between">
            <div>
              {/* Titre + Badge statut */}
              <div className="flex items-center gap-3">
                <h1 style={{ 
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontSize: '32px',
                  fontWeight: 400,
                  color: '#18181b',
                  lineHeight: 1.1,
                  letterSpacing: '-0.01em'
                }}>
                  {currentLevel.subSection === 'revenus-ref' && 'Revenus de référence'}
                  {currentLevel.subSection === 'revenus-percus' && 'Revenus perçus sur la période'}
                  {currentLevel.subSection === 'ij' && 'Indemnités journalières'}
                  {!currentLevel.subSection && (currentLevel.fullTitle || currentLevel.title)}
                </h1>
                
                {/* Badge statut dossier */}
                {currentLevel.type === 'dossier' && (
                  <span className={`px-2.5 py-1 text-[11px] font-medium rounded-full ${
                    dossierStatut === 'ouvert' 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-zinc-100 text-zinc-500'
                  }`}>
                    {dossierStatut === 'ouvert' ? 'Ouvert' : 'Fermé'}
                  </span>
                )}
                
                {/* Bouton édition dossier */}
                {currentLevel.type === 'dossier' && (
                  <button
                    onClick={() => setEditPanel({ type: 'dossier-edit', title: 'Modifier le dossier' })}
                    className="ml-2 p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                )}
              </div>
              
              {/* Description du poste */}
              {currentLevel.type === 'poste' && !currentLevel.subSection && posteDescriptions[currentLevel.id] && (
                <p className="text-[14px] text-zinc-400 mt-3">{posteDescriptions[currentLevel.id]}</p>
              )}
            </div>
            
            {/* CTAs pour Chiffrage */}
            {currentLevel.type === 'dossier' && currentLevel.activeTab === 'chiffrage' && (
              <div className="flex items-center gap-2">
                <button onClick={() => setShowExportModal(true)} className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-zinc-600 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 shadow-sm transition-colors">
                  <Download className="w-4 h-4" strokeWidth={1.5} />
                  Exporter
                </button>
                <button
                  onClick={() => setShowChiffrageParams(true)}
                  className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-zinc-600 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 shadow-sm transition-colors"
                >
                  <Settings className="w-4 h-4" strokeWidth={1.5} />
                  Paramètres
                </button>
              </div>
            )}
            {currentLevel.type === 'poste' && !currentLevel.subSection && (
              <div className="flex items-center gap-2">
                <button onClick={() => setShowExportModal(true)} className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-zinc-600 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 shadow-sm transition-colors">
                  <Download className="w-4 h-4" strokeWidth={1.5} />
                  Exporter
                </button>
              </div>
            )}
          </div>
          
          {/* Tabs */}
          {currentTabs.length > 0 && !currentLevel.subSection && (
            <div className="flex gap-1 mt-6 border-b border-zinc-200/60">
              {currentTabs.map(tab => {
                const isActive = currentLevel.activeTab === tab.toLowerCase();
                return (
                  <button 
                    key={tab} 
                    onClick={() => setActiveTab(tab)} 
                    className={`px-4 py-3 text-[14px] font-medium relative transition-colors ${isActive ? 'text-zinc-800' : 'text-zinc-400 hover:text-zinc-600'}`}
                  >
                    {tab}
                    {isActive && <div className="absolute bottom-0 left-2 right-2 h-[2px] bg-zinc-800 rounded-full" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 pb-8">
          <div className="min-h-full">{renderContent()}</div>
        </div>
      </div>
      {renderAddModal()}
      {renderExportModal()}
      {renderEditPanel()}
      {renderSmartProcedureWizard()}
    </div>
  );
}
// Force deploy Fri Jan 30 16:16:33 CET 2026

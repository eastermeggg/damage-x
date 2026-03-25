import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, ChevronDown, Folder, FileText, Calculator, Plus, X, Edit3, Check, AlertTriangle, RefreshCw, Calendar, Landmark, Upload, Sparkles, Loader2, Search, HelpCircle, Eye, Trash2, FileQuestion, Download, Settings, AlertCircle, Receipt, ClipboardList, FileSpreadsheet, Activity, FileSearch, ListChecks, MoreHorizontal, User, Copy, Plug2, GripVertical, CheckCircle2, Clipboard, Filter, ArrowDown, ArrowDownCircle, Scissors, Paperclip } from 'lucide-react';

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

// ========== DROP FIRST — MOCK DATA ==========
const DROP_FIRST_DOCUMENT_POOL = [
  {
    id: 'df-1',
    originalName: 'scan_20240312.pdf',
    cleanName: 'Rapport d\'expertise médicale Dr. Dubois — 12/03/2024',
    type: 'Expertise',
    date: '2024-03-12',
    postesLies: ['DFT', 'PGPA', 'SE', 'AIPP'],
    summary: 'Rapport d\'expertise médicale définitif du Dr. Dubois, consolidation fixée au 15/01/2024, AIPP 8%, DFT total 45 jours, DFT partiel classe II 120 jours.',
    extractedInfo: { 'Médecin expert': 'Dr. Philippe Dubois', 'Date de consolidation': '15/01/2024', 'AIPP': '8%', 'DFT total': '45 jours', 'DFT partiel (classe II)': '120 jours', 'Souffrances endurées': '4/7', 'Préjudice esthétique': '2.5/7' },
    pages: 28,
    splits: [
      { name: 'Corps du rapport', pages: '1–18', pageCount: 18 },
      { name: 'Annexes médicales', pages: '19–24', pageCount: 6 },
      { name: 'Dire des parties', pages: '25–28', pageCount: 4 }
    ]
  },
  {
    id: 'df-2',
    originalName: 'factures_kine_2023.pdf',
    cleanName: 'Factures kinésithérapie — Cabinet Martin — 2023',
    type: 'Factures',
    date: '2023-11-15',
    postesLies: ['DSA'],
    summary: 'Ensemble de 12 factures de kinésithérapie du cabinet Martin, période mars–novembre 2023, total 1 440 €.',
    extractedInfo: { 'Prestataire': 'Cabinet Martin Kinésithérapie', 'Montant total': '1 440,00 €', 'Période': 'Mars–Novembre 2023', 'Nombre de factures': '12' },
    pages: 12,
    splits: null
  },
  {
    id: 'df-3',
    originalName: 'decompte_cpam.pdf',
    cleanName: 'Décompte prestations CPAM — Période 2022–2024',
    type: 'Médical',
    date: '2024-02-20',
    postesLies: ['DSA', 'DFT'],
    summary: 'Décompte définitif des prestations versées par la CPAM, créance totale 14 320,50 €, couvrant hospitalisation et soins post-accident.',
    extractedInfo: { 'Organisme': 'CPAM Paris', 'Créance totale': '14 320,50 €', 'Période couverte': 'Juin 2022 – Février 2024' },
    pages: 4,
    splits: null
  },
  {
    id: 'df-4',
    originalName: 'bulletins_salaire.pdf',
    cleanName: 'Bulletins de salaire — Dupont Martin SAS — Jan–Déc 2022',
    type: 'Revenus',
    date: '2022-12-31',
    postesLies: ['PGPA', 'PGPF'],
    summary: '12 bulletins de salaire mensuels, salaire net moyen 2 850 €/mois, employeur Dupont Martin SAS.',
    extractedInfo: { 'Employeur': 'Dupont Martin SAS', 'Salaire net moyen': '2 850 €/mois', 'Période': 'Janvier–Décembre 2022' },
    pages: 12,
    splits: null
  },
  {
    id: 'df-5',
    originalName: 'IMG_4521.jpg',
    cleanName: 'Certificat médical initial — Dr. Lefèvre — 05/06/2022',
    type: 'Médical',
    date: '2022-06-05',
    postesLies: ['DFT'],
    summary: 'Certificat médical initial constatant fracture du fémur droit suite à accident de la voie publique, ITT 60 jours.',
    extractedInfo: { 'Médecin': 'Dr. Anne Lefèvre', 'Diagnostic': 'Fracture du fémur droit', 'ITT': '60 jours' },
    pages: 1,
    splits: null
  },
  {
    id: 'df-6',
    originalName: 'jugement_tgi.pdf',
    cleanName: 'Jugement TGI Paris — 14ème chambre — 18/09/2023',
    type: 'Décision',
    date: '2023-09-18',
    postesLies: ['DFT', 'SE', 'PGPA'],
    summary: 'Jugement reconnaissant la responsabilité entière du conducteur adverse, ordonnant expertise médicale complémentaire.',
    extractedInfo: { 'Juridiction': 'TGI Paris, 14ème chambre', 'Date': '18/09/2023', 'Dispositif': 'Responsabilité entière du tiers, expertise ordonnée' },
    pages: 8,
    splits: null
  },
  {
    id: 'df-7',
    originalName: 'courrier_assurance_jan24.pdf',
    cleanName: 'Courrier Allianz — Offre d\'indemnisation — 10/01/2024',
    type: 'Correspondance',
    date: '2024-01-10',
    postesLies: [],
    summary: 'Offre provisionnelle d\'indemnisation de l\'assureur Allianz, montant proposé 15 000 €, sous réserve de consolidation.',
    extractedInfo: { 'Assureur': 'Allianz IARD', 'Montant proposé': '15 000,00 €', 'Conditions': 'Sous réserve de consolidation' },
    pages: 2,
    splits: null
  },
  {
    id: 'df-8',
    originalName: 'avis_impots_2022.pdf',
    cleanName: 'Avis d\'imposition 2022 — Revenus 2021',
    type: 'Revenus',
    date: '2022-08-01',
    postesLies: ['PGPA', 'PGPF'],
    summary: 'Avis d\'imposition sur les revenus 2021, revenu fiscal de référence 38 400 €.',
    extractedInfo: { 'Revenu fiscal de référence': '38 400,00 €', 'Année fiscale': '2021' },
    pages: 2,
    splits: null
  },
  {
    id: 'df-9',
    originalName: 'compte_rendu_hospitalisation.pdf',
    cleanName: 'Compte-rendu d\'hospitalisation — CHU Pitié-Salpêtrière — Juin 2022',
    type: 'Médical',
    date: '2022-06-12',
    postesLies: ['DFT', 'SE', 'DSA'],
    summary: 'Compte-rendu d\'hospitalisation suite à intervention chirurgicale (ostéosynthèse fémur), durée 8 jours, complications mineures.',
    extractedInfo: { 'Établissement': 'CHU Pitié-Salpêtrière', 'Durée': '8 jours', 'Intervention': 'Ostéosynthèse du fémur droit', 'Complications': 'Mineures (infection superficielle)' },
    pages: 6,
    splits: null
  },
  {
    id: 'df-10',
    originalName: 'photos_blessures.zip',
    cleanName: 'Photographies des blessures — Constatations initiales — 05/06/2022',
    type: 'Médical',
    date: '2022-06-05',
    postesLies: ['PE', 'SE'],
    summary: '4 photographies des blessures prises le jour de l\'accident, montrant fracture ouverte et hématomes multiples.',
    extractedInfo: { 'Nombre de photos': '4', 'Type': 'Constatations initiales post-accident' },
    pages: 4,
    splits: null
  },
  {
    id: 'df-11',
    originalName: 'pv_police.pdf',
    cleanName: 'Procès-verbal de police — Commissariat du 12ème — 05/06/2022',
    type: 'Administratif',
    date: '2022-06-05',
    postesLies: [],
    summary: 'Procès-verbal de constatation de l\'accident, témoignages recueillis, schéma de la collision, taux d\'alcoolémie du tiers responsable 0,8 g/L.',
    extractedInfo: { 'Commissariat': '12ème arrondissement', 'Taux d\'alcoolémie (tiers)': '0,8 g/L', 'Nombre de témoins': '2' },
    pages: 5,
    splits: [
      { name: 'Constatations et schéma', pages: '1–3', pageCount: 3 },
      { name: 'Témoignages', pages: '4–5', pageCount: 2 }
    ]
  },
  {
    id: 'df-12',
    originalName: 'arret_travail_prolongation.pdf',
    cleanName: 'Arrêts de travail et prolongations — Juin 2022 – Mars 2023',
    type: 'Médical',
    date: '2022-06-05',
    postesLies: ['DFT', 'PGPA'],
    summary: 'Série d\'arrêts de travail initiaux et prolongations couvrant 9 mois, médecin traitant Dr. Lefèvre.',
    extractedInfo: { 'Médecin traitant': 'Dr. Anne Lefèvre', 'Durée totale': '9 mois', 'Période': 'Juin 2022 – Mars 2023' },
    pages: 9,
    splits: null
  }
];

const DROP_FIRST_VICTIM_DATA = {
  nom: 'Martin', prenom: 'Sophie', sexe: 'Féminin', dateNaissance: '14/03/1985', profession: 'Cadre commercial'
};
const DROP_FIRST_ACCIDENT_DATA = {
  type: 'Accident de la voie publique', dateAccident: '05/06/2022',
  resume: 'Collision frontale avec un véhicule en état d\'ivresse (0,8 g/L) sur la RN7 à hauteur de Fontainebleau. Mme Martin, conductrice, a subi un choc violent au niveau des membres inférieurs.'
};
const DROP_FIRST_MEDICAL_DATA = {
  premiereConstatation: '05/06/2022 — CHU Pitié-Salpêtrière', dateConsolidation: '15/01/2024', aipp: '8%',
  commentaire: 'Fracture complexe du fémur droit avec ostéosynthèse. Séquelles : raideur articulaire, douleurs résiduelles, boiterie légère. Retentissement professionnel modéré.'
};
const DROP_FIRST_POSTES_DETECTES = ['DFT', 'DSA', 'PGPA', 'PGPF', 'SE', 'PE', 'AIPP'];

const PIECE_TYPE_COLORS = {
  'Expertise': 'badge-info',
  'Décision': 'badge-ai',
  'Revenus': 'badge-success',
  'Factures': 'badge-warning',
  'Médical': 'badge-info',
  'Correspondance': 'badge-secondary',
  'Administratif': 'badge-secondary',
};

const PIECE_TYPE_OPTIONS = ['Expertise', 'Factures', 'Revenus', 'Décision', 'Médical', 'Correspondance', 'Administratif'];
// eslint-disable-next-line no-unused-vars
const _POSTES_DINTILHAC_ALL = ['DFT', 'DFP', 'DSA', 'DSF', 'PGPA', 'PGPF', 'SE', 'PE', 'PA', 'IP', 'PAS', 'AIPP'];

export default function App() {

  // ========== LOCALSTORAGE PERSISTENCE ==========
  const LS_GLOBAL = 'plato_global';
  const LS_DOSSIER = 'plato_dossier_';
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
    { id: 'dossier-1', type: 'dossier', title: 'Dossier Dupont', activeTab: 'info dossier' }
  ]);
  const [, setExpandedCategories] = useState(['patrimoniaux-temp', 'extra-patrimoniaux-temp', 'patrimoniaux-perm']);
  const [expandedSections, setExpandedSections] = useState(['pgpf-cl', 'pgpf-al']);
  const [editPanel, setEditPanel] = useState(null);
  const [editingPieceIds, setEditingPieceIds] = useState([]); // Pour tracker les pieceIds pendant l'édition d'une ligne
  const [showAddModal, setShowAddModal] = useState(null); // null | 'dsa' | 'pgpa' | etc.
  const [addModalTab, setAddModalTab] = useState('upload'); // 'upload' | 'pieces' | 'manual'
  const [showPreview, setShowPreview] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [pickerDragging, setPickerDragging] = useState(false);
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

  // ========== DROP FIRST STATE ==========
  const [dropModal, setDropModal] = useState(null); // null | { files: [...], rapportFileId: null|string, rapportDismissed: false }
  const [dropFirstPieces, setDropFirstPieces] = useState([]); // array of { id, originalName, cleanName, type, date, postesLies, summary, extractedInfo, pages, status, sourceFile?, pageRange?, siblings?, poolRef }
  const [dropFirstHasRapport, setDropFirstHasRapport] = useState(false);
  const [dropFirstProcessingDone, setDropFirstProcessingDone] = useState(false);
  const [infoDossierStreaming, setInfoDossierStreaming] = useState(null); // null | { active, fieldsRevealed: [], streamingField: null, streamingText: '' }
  const [pieceOverviewPanel, setPieceOverviewPanel] = useState(null); // null | pieceId
  const [piecesFilter, setPiecesFilter] = useState({ type: null, search: '' });
  const [, setShowAddPiecesZone] = useState(false);
  const [piecesTabDragOver, setPiecesTabDragOver] = useState(false);
  const [reorderDrag, setReorderDrag] = useState(null); // { pieceId, ghostX, ghostY }
  const [reorderDropIdx, setReorderDropIdx] = useState(null);
  const [manualReorder, setManualReorder] = useState(false);
  const [rapportBannerDismissed, setRapportBannerDismissed] = useState(false);
  const [editingPieceField, setEditingPieceField] = useState(null); // null | { pieceId, field }
  const [toastMessage, setToastMessage] = useState(null); // null | string
  const [pickerOpen, setPickerOpen] = useState(null); // null | 'dft' | 'dsa' | 'pgpa-revenu-ref' | 'pgpa-revenu-percu' | 'pgpa-ij'
  const [pickerSelected, setPickerSelected] = useState([]); // array of piece IDs (multi-select)
  const [pickerSearch, setPickerSearch] = useState('');
  const [posteExtracting, setPosteExtracting] = useState(null); // null | { posteType, totalDocs, extractedCount, docIds: [] }
  const processingTimeouts = useRef([]);

  const typesFaitGenerateur = ['Accident de la route', 'Accident du travail', 'Accident médical', 'Agression', 'Accident domestique', 'Autre'];

  // ========== NOTES / ARGUMENTAIRE PAR POSTE ==========
  const [posteNotes, setPosteNotes] = useState({ dsa: '', dft: '', pgpa: '' });

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

  // Auto-format date input: 28091994 → 28/09/1994
  const formatDateInput = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return digits.slice(0, 2) + '/' + digits.slice(2);
    return digits.slice(0, 2) + '/' + digits.slice(2, 4) + '/' + digits.slice(4);
  };

  // Date picker helpers
  const openDatePicker = (targetId) => {
    const picker = document.getElementById(targetId + '-picker');
    if (picker) picker.showPicker();
  };
  const handleDatePick = (e, targetId) => {
    const val = e.target.value;
    if (val) {
      const formatted = formatDateFR(val);
      const target = document.getElementById(targetId);
      if (target) { target.value = formatted; target.dispatchEvent(new Event('input', { bubbles: true })); }
    }
  };

  // Calcul jours entre deux dates DD/MM/YYYY (inclusif)
  const calcDaysBetween = (dateDebut, dateFin) => {
    if (!dateDebut || !dateFin || dateDebut.length < 10 || dateFin.length < 10) return null;
    const [dD, mD, yD] = dateDebut.split('/');
    const [dF, mF, yF] = dateFin.split('/');
    const debut = new Date(yD, mD - 1, dD);
    const fin = new Date(yF, mF - 1, dF);
    if (isNaN(debut.getTime()) || isNaN(fin.getTime())) return null;
    const diff = Math.floor((fin - debut) / (1000 * 60 * 60 * 24));
    return diff >= 0 ? diff + 1 : null;
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
    { id: 'p-5', nom: 'Rapport Dr. Martin.pdf', nomOriginal: 'rapport_expertise_martin.pdf', intitule: "Rapport d'expertise", date: '12/09/2024', type: 'Rapport', used: true },
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
  const [dftLignes, setDftLignes] = useState([
    { id: 'dft-1', status: 'validated', label: 'Hospitalisation initiale', debut: '15/03/2023', fin: '22/03/2023', jours: 8, taux: 100, montant: 264, pieceIds: ['p-5'], confidence: null, commentaire: '' },
    { id: 'dft-2', status: 'validated', label: 'Hospitalisation chirurgie', debut: '28/03/2023', fin: '02/04/2023', jours: 6, taux: 100, montant: 198, pieceIds: ['p-5'], confidence: null, commentaire: '' },
    { id: 'dft-3', status: 'validated', label: 'Alitement strict post-op', debut: '03/04/2023', fin: '15/04/2023', jours: 13, taux: 100, montant: 429, pieceIds: ['p-5'], confidence: null, commentaire: '' },
    { id: 'dft-4', status: 'validated', label: 'Convalescence post-opératoire', debut: '16/04/2023', fin: '30/06/2023', jours: 76, taux: 50, montant: 1254, pieceIds: ['p-5'], confidence: null, commentaire: '' },
    { id: 'dft-5', status: 'validated', label: 'Rééducation active intensive', debut: '01/07/2023', fin: '30/09/2023', jours: 92, taux: 40, montant: 1214, pieceIds: ['p-5'], confidence: null, commentaire: '' },
    { id: 'dft-6', status: 'validated', label: 'Rééducation d\'entretien', debut: '01/10/2023', fin: '31/12/2023', jours: 92, taux: 25, montant: 759, pieceIds: ['p-5'], confidence: null, commentaire: '' },
    { id: 'dft-7', status: 'validated', label: 'Gêne résiduelle pré-consolidation', debut: '01/01/2024', fin: '12/09/2024', jours: 256, taux: 15, montant: 1267, pieceIds: ['p-5'], confidence: null, commentaire: '' },
  ]);

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
    dropFirstPieces: dropFirstPieces.map(p => ({ ...p, justCompleted: false })),
    dropFirstHasRapport, dropFirstProcessingDone,
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
    // Migration: corriger l'intitulé du rapport d'expertise si ancien format
    const loadedPieces = data.pieces ?? [];
    setPieces(loadedPieces.map(p =>
      p.id === 'p-5' ? { ...p, intitule: "Rapport d'expertise", type: 'Rapport' } : p
    ));
    setDsaLignes(data.dsaLignes ?? []);
    setPgpaData(data.pgpaData ?? EMPTY_DOSSIER.pgpaData);
    setPgpfData(data.pgpfData ?? EMPTY_DOSSIER.pgpfData);
    // Migration: fusionner anciens dfttLignes + dftpLignes si format legacy
    setDftLignes(data.dftLignes ?? [...(data.dfttLignes ?? []), ...(data.dftpLignes ?? [])]);
    // Drop-first state restoration
    setDropFirstPieces(data.dropFirstPieces ?? []);
    setDropFirstHasRapport(data.dropFirstHasRapport ?? false);
    setDropFirstProcessingDone(data.dropFirstProcessingDone ?? false);
    setInfoDossierStreaming(null);
    setPieceOverviewPanel(null);
    setPiecesFilter({ type: null, search: '' });
    setRapportBannerDismissed(false);
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
      // Migration: rename 'détail' → 'info dossier' in saved navStack
      if (savedGlobal.navStack) setNavStack(savedGlobal.navStack.map(n => ({ ...n, activeTab: n.activeTab === 'détail' ? 'info dossier' : n.activeTab })));
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
          <span className="text-body text-gray-500">{piecesArray.length} pièce{piecesArray.length > 1 ? 's' : ''}</span>
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
              <span className="text-body text-gray-600">Déposer des documents</span>
            </div>
          )}
        </div>
        
        {/* Liste des pièces */}
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-caption-medium text-gray-500 uppercase tracking-wider w-16">N°</th>
                <th className="px-4 py-3 text-left text-caption-medium text-gray-500 uppercase tracking-wider">Document</th>
                <th className="px-4 py-3 text-left text-caption-medium text-gray-500 uppercase tracking-wider w-24">Type</th>
                <th className="px-4 py-3 text-left text-caption-medium text-gray-500 uppercase tracking-wider w-32">Utilisé dans</th>
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
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 text-gray-700 text-body-medium rounded group-hover:bg-blue-100 group-hover:text-blue-700">
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
                      <span className={`inline-flex px-2 py-1 text-caption-medium rounded-full ${getTypeColor(piece.type)}`}>
                        {piece.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {usages.length > 0 ? (
                        <div className="flex items-center gap-1">
                          {usages.map(u => (
                            <span key={u} className="text-caption px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">{u}</span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-caption text-gray-400">Non utilisé</span>
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

  const tabsConfig = { dossier: ['Info dossier', 'Chiffrage', 'Pièces'], poste: [] };
  const currentTabs = tabsConfig[currentLevel.type] || [];
  const _getSiblings = () => currentLevel.type === 'poste' ? allPostes.filter(p => p.id !== currentLevel.id && !p.disabled) : []; // eslint-disable-line no-unused-vars

  // ========== NAVIGATION ==========
  const navigateTo = (item) => setNavStack([...navStack, { ...item, type: item.type || 'poste', activeTab: tabsConfig[item.type]?.[0]?.toLowerCase() }]);
  const navigateToStackLevel = (index) => setNavStack(navStack.slice(0, index + 1));
  const _navigateToSibling = (sibling) => { // eslint-disable-line no-unused-vars
    const newStack = [...navStack];
    newStack[newStack.length - 1] = { ...sibling, type: 'poste' };
    setNavStack(newStack);
  };
  const setActiveTab = (tab) => {
    const newStack = [...navStack];
    newStack[newStack.length - 1].activeTab = tab.toLowerCase();
    setNavStack(newStack);
  };
  const _toggleCategory = (id) => setExpandedCategories(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]); // eslint-disable-line no-unused-vars
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

  const _handleStartExtraction = async () => { // eslint-disable-line no-unused-vars
    const _formData = {}; // eslint-disable-line no-unused-vars
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

  // ========== DOCUMENT PICKER HELPERS ==========
  const getRelevantPiecesForPoste = (posteId) => {
    if (!posteId) return { suggested: [], others: [] };
    const acronym = posteId.toUpperCase().replace(/-.*/, ''); // 'dft' → 'DFT', 'pgpa-revenu-ref' → 'PGPA'
    const allDocs = dropFirstPieces.filter(p => p.status === 'done' || p.status === 'processing');
    const suggested = allDocs.filter(p => p.postesLies?.includes(acronym));
    const others = allDocs.filter(p => !p.postesLies?.includes(acronym));
    return { suggested, others };
  };

  const handleAddMultipleFromPieces = (selectedIds, posteType) => {
    setPickerOpen(null);
    setPickerSelected([]);
    setPickerSearch('');

    // Build compatible piece objects
    const piecesToExtract = selectedIds.map(pieceId => {
      const dfPiece = dropFirstPieces.find(p => p.id === pieceId);
      if (dfPiece) {
        const compatPiece = {
          id: dfPiece.id,
          nom: dfPiece.cleanName || dfPiece.originalName,
          nomOriginal: dfPiece.originalName,
          intitule: dfPiece.cleanName,
          date: dfPiece.date,
          type: dfPiece.type,
          used: false
        };
        setPieces(prev => {
          if (prev.find(p => p.id === dfPiece.id)) return prev;
          return [...prev, compatPiece];
        });
        return compatPiece;
      }
      return pieces.find(p => p.id === pieceId);
    }).filter(Boolean);

    if (piecesToExtract.length === 0) return;

    // Start extraction progress
    setPosteExtracting({ posteType, totalDocs: piecesToExtract.length, extractedCount: 0, docIds: selectedIds });

    // Add lines one by one with staggered delays
    piecesToExtract.forEach((piece, index) => {
      const delay = 1200 + index * (1500 + Math.random() * 1500);
      setTimeout(() => {
        handleAddFromPiece(piece, posteType);
        setPosteExtracting(prev => {
          if (!prev) return null;
          const newCount = prev.extractedCount + 1;
          if (newCount >= prev.totalDocs) {
            // Done — clear after a short delay
            setTimeout(() => setPosteExtracting(null), 1500);
            return { ...prev, extractedCount: newCount };
          }
          return { ...prev, extractedCount: newCount };
        });
      }, delay);
    });
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

  const _handleValidateLigne = (ligneId) => setDsaLignes(prev => prev.map(l => l.id === ligneId ? { ...l, status: 'validated' } : l)); // eslint-disable-line no-unused-vars
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
    const _getItemTitle = (item) => { // eslint-disable-line no-unused-vars
      if (item.type === 'dossier') {
        const age = calcAge(victimeData.dateNaissance);
        return `${victimeData.nom} ${victimeData.prenom} (${age})`;
      }
      return item.title;
    };
    
    // Contexte par niveau - seulement ce qui n'est plus visible quand on descend
    const _getContextInfo = (item, index) => { // eslint-disable-line no-unused-vars
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
              <span className="text-white font-bold text-body">N</span>
            </div>
            <span className="text-heading-sm text-zinc-800">Norma</span>
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
                      <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-body-medium text-zinc-600">
                        {victimeData.prenom[0]}{victimeData.nom[0]}
                      </div>
                      <div>
                        <div className="text-body-medium text-zinc-800">{victimeData.prenom} {victimeData.nom}</div>
                        <div className="text-caption text-zinc-400">{calcAge(victimeData.dateNaissance)} ans · {victimeData.sexe}</div>
                      </div>
                    </div>
                    {/* Dates */}
                    <div className="mt-3 text-caption text-zinc-400 space-y-1">
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
                    <span className={`text-body-medium ${isHighlighted ? 'text-zinc-800' : 'text-zinc-700'}`}>
                      {item.title}
                    </span>
                  </div>
                  {montant !== null && montant > 0 && (
                    <div className={`mt-1 ml-[26px] text-body-medium font-semibold tabular-nums ${isHighlighted ? 'text-zinc-600' : 'text-zinc-500'}`}>
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
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-body transition-colors relative ${
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
              <div className="text-caption-medium text-zinc-400 uppercase tracking-wider mb-2">
                Paramètres
              </div>
              <div className="space-y-2">
                {currentLevel.id === 'dsa' && (
                  <div>
                    <label className="block text-caption text-zinc-500 mb-1">Revalorisation</label>
                    <select 
                      defaultValue="ipc-annuel"
                      className="w-full px-2.5 py-1.5 text-body border border-zinc-200 rounded-md bg-white"
                    >
                      <option value="ipc-annuel">IPC annuel</option>
                      <option value="ipc-mensuel">IPC mensuel</option>
                      <option value="aucune">Aucune</option>
                    </select>
                  </div>
                )}
                {currentLevel.id === 'pgpa' && (
                  <div>
                    <label className="block text-caption text-zinc-500 mb-1">Revalorisation</label>
                    <select 
                      value={pgpaData.revenuRef.revalorisation}
                      onChange={(e) => setPgpaData(prev => ({ 
                        ...prev, 
                        revenuRef: { ...prev.revenuRef, revalorisation: e.target.value } 
                      }))}
                      className="w-full px-2.5 py-1.5 text-body border border-zinc-200 rounded-md bg-white"
                    >
                      <option value="ipc-annuel">IPC annuel</option>
                      <option value="smic-horaire">SMIC horaire</option>
                      <option value="aucune">Aucune</option>
                    </select>
                  </div>
                )}
                {currentLevel.id === 'dft' && (
                  <div>
                    <label className="block text-caption text-zinc-500 mb-1">Base journalière</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={chiffrageParams.baseJournaliereDFT}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setChiffrageParams(prev => ({ ...prev, baseJournaliereDFT: val }));
                        }}
                        className="w-full px-2.5 py-1.5 pr-10 text-body border border-zinc-200 rounded-md"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-caption text-zinc-400">€/j</span>
                    </div>
                    <p className="text-caption text-zinc-400 mt-1">Utilisée par défaut pour chaque ligne</p>
                  </div>
                )}
                {/* Notes / Argumentaire */}
                {(currentLevel.id === 'dsa' || currentLevel.id === 'dft' || currentLevel.id === 'pgpa') && (
                  <div className="mt-3">
                    <label className="block text-caption text-zinc-500 mb-1">Notes / Argumentaire</label>
                    <textarea
                      value={posteNotes[currentLevel.id] || ''}
                      onChange={(e) => setPosteNotes(prev => ({ ...prev, [currentLevel.id]: e.target.value }))}
                      rows={3}
                      className="w-full px-2.5 py-1.5 text-body border border-zinc-200 rounded-md resize-none"
                      placeholder="Notes sur ce poste..."
                    />
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Taxonomie des postes */}
          {currentLevel.type === 'dossier' && currentLevel.activeTab === 'chiffrage' && (
            <div className="px-4 py-3 border-t border-zinc-200">
              <div className="text-caption-medium text-zinc-400 uppercase tracking-wider mb-2">Postes</div>

              {/* Search */}
              <div className="relative mb-3">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" strokeWidth={1.5} />
                <input type="text" value={searchPostes} onChange={(e) => setSearchPostes(e.target.value)}
                  placeholder="Rechercher un poste..."
                  className="w-full pl-8 pr-7 py-1.5 text-caption border border-zinc-200 rounded-md bg-white placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-300" />
                {searchPostes && (
                  <button onClick={() => setSearchPostes('')} className="absolute right-2 top-1/2 -translate-y-1/2">
                    <X className="w-3 h-3 text-zinc-400" />
                  </button>
                )}
              </div>

              {/* Taxonomy */}
              {(() => {
                const filtered = getFilteredTaxonomy();
                if (filtered.length === 0) return <p className="text-caption text-zinc-400 text-center py-4">Aucun poste trouvé</p>;
                return (
                  <div className="space-y-3">
                    {filtered.map(section => (
                      <div key={section.section}>
                        <div className="text-counter font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">{section.section}</div>
                        <div className="space-y-0.5">
                          {section.categories.map(cat => {
                            const isExpanded = expandedTaxoCategories.includes(cat.id) || searchPostes.trim() !== '';
                            const sorted = [...cat.postes.filter(p => p.enabled), ...cat.postes.filter(p => !p.enabled)];
                            return (
                              <div key={cat.id}>
                                <button onClick={() => setExpandedTaxoCategories(prev => prev.includes(cat.id) ? prev.filter(id => id !== cat.id) : [...prev, cat.id])}
                                  className="w-full flex items-center gap-1.5 py-1.5 text-caption-medium text-zinc-500 hover:text-zinc-700 transition-colors">
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
                                            {p.acronym && <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-counter font-semibold bg-zinc-100 text-zinc-700 rounded flex-shrink-0 group-hover:bg-zinc-200">{p.acronym}</span>}
                                            <span className="text-caption text-zinc-700 truncate flex-1">{p.label}</span>
                                            {montant != null && montant > 0 && <span className="text-caption-medium text-zinc-500 tabular-nums flex-shrink-0">{fmt(montant)}</span>}
                                          </button>
                                        );
                                      }
                                      return (
                                        <div key={p.id} className="flex items-center gap-2 px-2 py-1.5 rounded-md cursor-default">
                                          <span className="text-caption text-zinc-300 truncate">{p.label}</span>
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
            <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-caption-medium text-zinc-600">
              JD
            </div>
            <div className="flex-1 text-left">
              <div className="text-body-medium text-zinc-700">Jean Durand</div>
              <div className="text-caption text-zinc-400">Avocat</div>
            </div>
            <Settings className="w-4 h-4 text-zinc-400" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    );
  };

  // ========== INLINE DOCUMENT PICKER (embedded in empty states) ==========
  const renderInlineDocPicker = (posteType, { icon: Icon, title, description, expectedDocs }) => {
    const { suggested, others } = getRelevantPiecesForPoste(posteType);
    const allDocs = [...suggested, ...others];
    const searchedDocs = pickerSearch && pickerOpen === posteType
      ? allDocs.filter(d => (d.cleanName || d.originalName || '').toLowerCase().includes(pickerSearch.toLowerCase()))
      : allDocs;
    const selectedSet = new Set(pickerSelected);
    const filteredDocs = [...searchedDocs].sort((a, b) => {
      const aProcessing = a.status === 'processing' ? 0 : 1;
      const bProcessing = b.status === 'processing' ? 0 : 1;
      if (aProcessing !== bProcessing) return aProcessing - bProcessing;
      const aSelected = selectedSet.has(a.id) ? 0 : 1;
      const bSelected = selectedSet.has(b.id) ? 0 : 1;
      return aSelected - bSelected;
    });
    const toggleSelect = (id) => {
      setPickerSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
      if (pickerOpen !== posteType) setPickerOpen(posteType);
    };

    // Add files to pool + auto-select, process in background
    const handlePickerAddFiles = (fileList) => {
      const acronym = posteType.toUpperCase().replace(/-.*/, '');
      const typesByPoste = {
        DFT: ['Expertise', 'Médical', 'Médical'],
        DSA: ['Factures', 'Factures', 'Médical'],
        PGPA: ['Revenus', 'Revenus', 'Administratif'],
      };
      const cleanNames = {
        Expertise: (n) => `Rapport d'expertise — ${n}`,
        Médical: (n) => `Certificat médical — ${n}`,
        Factures: (n) => `Facture — ${n}`,
        Revenus: (n) => `Justificatif de revenus — ${n}`,
        Administratif: (n) => `Document administratif — ${n}`,
      };
      const newIds = [];
      for (const file of Array.from(fileList)) {
        const newId = `df-upload-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        newIds.push(newId);
        const rawName = file.name.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' ');
        setDropFirstPieces(prev => [...prev, {
          id: newId,
          originalName: file.name,
          cleanName: rawName,
          type: null,
          date: new Date().toISOString().split('T')[0],
          postesLies: [acronym],
          status: 'processing',
          pages: null,
          splits: null,
          summary: null,
          extractedInfo: null,
        }]);
        // Simulate background categorization
        const delay = 4000 + Math.random() * 3000;
        setTimeout(() => {
          const types = typesByPoste[acronym] || ['Document'];
          const detectedType = types[Math.floor(Math.random() * types.length)];
          const cleanFn = cleanNames[detectedType] || ((n) => n);
          const pageCount = Math.floor(Math.random() * 20) + 1;
          setDropFirstPieces(prev => prev.map(p => p.id === newId ? {
            ...p,
            status: 'done',
            type: detectedType,
            cleanName: cleanFn(rawName),
            pages: pageCount,
          } : p));
        }, delay);
      }
      setPickerSelected(prev => [...prev, ...newIds]);
      if (pickerOpen !== posteType) setPickerOpen(posteType);
    };

    const DocRow = ({ doc, index }) => {
      const isSelected = pickerSelected.includes(doc.id);
      const isProcessing = doc.status === 'processing';

      if (isProcessing) {
        return (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-[7px]">
            <span className="w-4 h-4 flex items-center justify-center flex-shrink-0 opacity-0">
              <span className="w-4 h-4 rounded border border-[#e7e5e3] bg-white" />
            </span>
            <span className="w-[22px] h-[22px] flex items-center justify-center flex-shrink-0">
              <span className="w-4 h-4 border-[1.5px] border-[#78716c] border-t-transparent rounded-full animate-spin" />
            </span>
            <span className="text-sm italic text-[#292524] opacity-40 truncate">{doc.originalName}</span>
          </div>
        );
      }

      return (
        <div
          onClick={() => toggleSelect(doc.id)}
          className={`flex items-center justify-between px-3 py-2.5 rounded-[7px] group transition-colors cursor-pointer ${
            isSelected ? 'bg-[#eeece6] border border-[#d6d3d1]' : 'hover:bg-[#f8f7f5]'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            {/* Checkbox */}
            <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-colors shadow-[0_1px_2px_0_rgba(26,26,26,0.05)] ${
              isSelected ? 'bg-[#292524]' : 'bg-white border border-[#e7e5e3]'
            }`}>
              {isSelected && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
            </div>
            {/* Doc number badge */}
            <span className="w-[22px] h-[22px] flex items-center justify-center flex-shrink-0 bg-[#eeece6] rounded-md text-xs font-semibold text-[#78716c]">{index + 1}</span>
            {/* Doc name */}
            <span className={`text-sm truncate ${isSelected ? 'font-medium text-[#292524]' : 'text-[#292524]'}`}>{doc.cleanName || doc.originalName}</span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 ml-3">
            <span className={`inline-flex items-center px-2 py-1 text-xs font-medium leading-4 rounded-md whitespace-nowrap ${PIECE_TYPE_COLORS[doc.type] || 'bg-[#dfe8f5] text-[#1e3a8a]'}`}>
              {doc.type}
            </span>
          </div>
        </div>
      );
    };

    const hasSelection = pickerSelected.length > 0 && pickerOpen === posteType;

    const posteLabels = {
      dsa: 'dépenses de santé',
      dft: 'déficits fonctionnels temporaires',
      pgpa: 'préjudices',
    };
    const manualLabels = {
      dsa: 'Ajouter une dépense manuellement',
      dft: 'Ajouter une période manuellement',
      pgpa: 'Ajouter un préjudice manuellement',
    };

    return (
      <div
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setPickerDragging(true); }}
        onDragLeave={(e) => { e.preventDefault(); if (!e.currentTarget.contains(e.relatedTarget)) setPickerDragging(false); }}
        onDrop={(e) => { e.preventDefault(); e.stopPropagation(); setPickerDragging(false); handlePickerAddFiles(e.dataTransfer.files); }}
        className={`rounded-lg border border-dashed overflow-hidden transition-colors flex-1 flex flex-col ${pickerDragging ? 'border-[#a8a29e] border-2' : 'border-[#d6d3d1]'}`}
      >
        {pickerDragging ? (
          <div className="flex items-center justify-center p-4 h-full">
            <div className="flex-1 flex flex-col items-center justify-center gap-8 p-8 rounded-lg h-full" style={{ background: 'linear-gradient(to top, rgba(238,236,230,0) 57%, #eeece6 100%)' }}>
              <div className="w-14 h-14 rounded-full bg-[#eeece6] border border-[#d6d3d1] flex items-center justify-center shadow-[0_1px_2px_0_rgba(26,26,26,0.05)]">
                <ArrowDownCircle className="w-6 h-6 text-[#292524]" />
              </div>
              <div className="flex flex-col items-center gap-2 text-center max-w-[576px]">
                <h3 className="text-xl font-medium text-[#292524] tracking-[-0.6px] leading-7">Déposez vos documents ici !</h3>
                <p className="text-sm text-[#78716c] leading-5">Les documents seront analysés automatiquement pour créer les lignes correspondantes</p>
              </div>
            </div>
          </div>
        ) : allDocs.length > 0 ? (
          /* ===== Doc-available state (start/doc-available variant) ===== */
          <div className="flex flex-col items-center justify-center p-8 gap-8">
            <div className="flex flex-col items-center gap-2 text-center max-w-[576px] w-full">
              <h3 className="text-xl font-medium text-[#292524] tracking-[-0.6px] leading-7">
                Commencer à calculer ce poste à partir de documents
              </h3>
              <p className="text-sm text-[#78716c] leading-5">{description}</p>
            </div>

            <div className="flex flex-col gap-4 items-start w-[500px] max-w-full">
              {/* Search + upload */}
              <div className="flex items-center gap-3 w-full">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#78716c]" />
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={pickerOpen === posteType ? pickerSearch : ''}
                    onChange={(e) => { setPickerSearch(e.target.value); if (pickerOpen !== posteType) setPickerOpen(posteType); }}
                    className="w-full pl-9 pr-3 py-2 h-10 border border-[#e7e5e3] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-zinc-200 shadow-[0_1px_2px_0_rgba(26,26,26,0.05)]"
                  />
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); document.getElementById(`picker-file-${posteType}`).click(); }}
                  className="flex items-center gap-2 px-4 py-2 h-10 bg-[#eeece6] rounded-lg text-sm font-medium text-[#44403c] hover:bg-[#e7e5e3] transition-colors whitespace-nowrap"
                >
                  <Upload className="w-4 h-4" /> Ajouter des docs
                </button>
                <input type="file" id={`picker-file-${posteType}`} multiple accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => { if (e.target.files?.length) { handlePickerAddFiles(e.target.files); e.target.value = ''; } }} />
              </div>

              {/* Suggested label */}
              {suggested.length > 0 && (
                <div className="px-1.5">
                  <span className="text-xs font-medium text-[#78716c]">Documents suggérés pour ce poste</span>
                </div>
              )}

              {/* Doc list */}
              <div className="flex flex-col gap-1 w-full max-h-[280px] overflow-y-auto px-1.5">
                {filteredDocs.map((doc, i) => <DocRow key={doc.id} doc={doc} index={i} />)}
              </div>

              {filteredDocs.length === 0 && pickerSearch && (
                <p className="text-sm text-[#78716c] text-center py-4 w-full">Aucun document trouvé</p>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-col items-center gap-3 w-[500px] max-w-full">
              <button
                onClick={() => handleAddMultipleFromPieces(pickerSelected, posteType)}
                disabled={!hasSelection}
                className={`flex items-center justify-center gap-2 w-full h-10 px-6 py-2 rounded-lg text-sm font-medium transition-colors shadow-[0_1px_2px_0_rgba(26,26,26,0.05)] ${
                  hasSelection ? 'bg-[#292524] text-white hover:bg-[#44403c]' : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                }`}
              >
                Commencer à calculer{hasSelection ? ` (${pickerSelected.length} pièce${pickerSelected.length > 1 ? 's' : ''})` : ''}
              </button>
              <button onClick={() => handleAddManual(posteType)} className="flex items-center gap-2 h-9 text-sm font-medium text-[#78716c] hover:text-[#44403c] transition-colors">
                <Edit3 className="w-4 h-4" /> Commencer manuellement
              </button>
            </div>
          </div>
        ) : (
          /* ===== Empty state (tables-empty/default variant) ===== */
          <div className="flex items-center justify-center p-1.5">
            <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4 py-6 rounded-lg" style={{ background: 'linear-gradient(to top, rgba(238,236,230,0) 50%, #f8f7f5 100%)' }}>
              <Upload className="w-5 h-5 text-[#78716c]" />

              <div className="flex flex-col items-center gap-1 text-center max-w-[512px] w-full">
                <p className="text-sm font-medium text-[#44403c] leading-5">
                  Déposez ou{' '}
                  <button
                    onClick={(e) => { e.stopPropagation(); document.getElementById(`picker-file-${posteType}-empty`).click(); }}
                    className="underline text-[#1e3a8a] font-medium cursor-pointer"
                  >parcourez</button>
                  {' '}pour ajouter les justificatifs de {posteLabels[posteType] || '...'}
                </p>
                <p className="text-sm text-[#78716c] leading-5">{description}</p>
              </div>
              <input type="file" id={`picker-file-${posteType}-empty`} multiple accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => { if (e.target.files?.length) { handlePickerAddFiles(e.target.files); e.target.value = ''; } }} />

              {/* Expected doc type badges */}
              <div className="flex flex-wrap justify-center gap-3">
                {expectedDocs.map(doc => (
                  <span key={doc} className="inline-flex items-center px-2 py-1 bg-[#eeece6] text-[#44403c] text-xs font-medium leading-4 rounded-md whitespace-nowrap">{doc}</span>
                ))}
              </div>

              {/* OU divider + manual link */}
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center justify-center gap-3">
                  <div className="h-px w-20 bg-[#d6d3d1]" />
                  <span className="text-xs font-medium text-[#78716c]">OU</span>
                  <div className="h-px w-20 bg-[#d6d3d1]" />
                </div>
                <button onClick={() => handleAddManual(posteType)} className="flex items-center gap-2 h-9 text-sm font-medium text-[#1e3a8a] hover:text-[#1e3a8a]/80 transition-colors">
                  <Edit3 className="w-4 h-4" /> {manualLabels[posteType] || 'Ajouter manuellement'}
                </button>
              </div>
            </div>
          </div>
        )}
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
            <h3 className="text-heading-md">Ajouter une dépense</h3>
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
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-body-medium ${addModalTab === tab.id ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700'}`}>
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
                  <label htmlFor="upload-input" className="px-4 py-2 bg-blue-600 text-white text-body rounded-lg cursor-pointer hover:bg-blue-700">Parcourir</label>
                </div>
                <div className="mt-4 flex items-center gap-2 p-3 bg-amber-50 rounded-lg">
                  <Sparkles className="w-5 h-5 text-amber-600" />
                  <span className="text-body text-amber-800">L'IA extraira automatiquement les informations</span>
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
                        <div className="text-caption text-gray-500">{p.type} • {p.date}</div>
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
      {title && <h4 className="text-caption-medium font-semibold text-zinc-400 uppercase tracking-wider mb-4">{title}</h4>}
      {children}
    </div>
  );
  
  const FormField = ({ label, children, hint, className = '' }) => (
    <div className={className}>
      {label && <label className="block text-body-medium text-zinc-700 mb-2">{label}</label>}
      {children}
      {hint && <p className="mt-1.5 text-caption text-zinc-400">{hint}</p>}
    </div>
  );
  
  const inputClass = "w-full px-3.5 py-2.5 text-body border border-zinc-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-zinc-100 focus:border-zinc-400 transition-colors";
  const selectClass = "w-full px-3.5 py-2.5 text-body border border-zinc-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-zinc-100 focus:border-zinc-400 transition-colors appearance-none";

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
              {isPieceDetail && <span className="px-2.5 py-1 bg-zinc-800 text-white text-caption-medium rounded">P{data.index}</span>}
              <h3 className="text-heading-sm text-zinc-800">{isPieceDetail ? (data.intitule || data.nom) : (editPanel.title || 'Édition')}</h3>
              {data?.status === 'ai-suggested' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-600 text-caption-medium rounded-full">
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
                  <span className="text-body text-zinc-300 truncate">{data.fileName}</span>
                  <button onClick={() => setShowPreview(false)} className="p-1 hover:bg-zinc-700 rounded text-zinc-400"><X className="w-4 h-4" /></button>
                </div>
                <div className="flex-1 p-6 flex items-center justify-center">
                  <div className="bg-white rounded-lg shadow-xl w-full max-w-sm aspect-[210/297] p-6 flex flex-col">
                    <div className="text-caption text-zinc-400 mb-4">DOCUMENT</div>
                    <div className="h-3 bg-zinc-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-zinc-200 rounded w-1/2 mb-4"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-2 bg-zinc-100 rounded w-full"></div>
                      <div className="h-2 bg-zinc-100 rounded w-5/6"></div>
                      <div className="h-2 bg-zinc-100 rounded w-4/6"></div>
                    </div>
                    <div className="mt-auto pt-4 border-t flex justify-between text-body">
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
                            <span className={`text-body-medium ${data.confidence >= 80 ? 'text-emerald-700' : 'text-amber-700'}`}>
                              Extraction IA • Confiance {data.confidence}%
                            </span>
                            {needsValidation && (
                              <p className="text-caption text-amber-600 mt-0.5">Vérifiez les champs surlignés</p>
                            )}
                          </div>
                          {data.status === 'ai-suggested' && (
                            <span className="text-caption px-2 py-1 bg-indigo-100 text-indigo-700 rounded">Suggestion IA</span>
                          )}
                        </div>
                      )}
                      
                      {/* Section Pièces justificatives */}
                      <div>
                        <h4 className="text-body font-semibold text-gray-900 mb-3 pb-2 border-b">Pièces justificatives</h4>
                        {editingPieceIds.length > 0 && (
                          <div className="space-y-2 mb-3">
                            {editingPieceIds.map(pid => {
                              const piece = getPiece(pid);
                              return piece ? (
                                <div key={pid} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg border group">
                                  <span className="w-8 h-8 bg-blue-100 text-blue-700 text-caption-medium rounded flex items-center justify-center flex-shrink-0">{getPieceLabel(pid)}</span>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-body-medium truncate">{piece.intitule || piece.nom}</p>
                                    <p className="text-caption text-gray-500">{piece.type}</p>
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
                                  className="w-full pl-8 pr-7 py-1.5 text-caption border border-zinc-200 rounded-md bg-white placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-300" />
                                {searchPiecesPanel && <button onClick={() => setSearchPiecesPanel('')} className="absolute right-2 top-1/2 -translate-y-1/2"><X className="w-3 h-3 text-zinc-400" /></button>}
                              </div>
                              <div className="max-h-32 overflow-y-auto space-y-1">
                                {pieces.filter(p => !editingPieceIds.includes(p.id)).filter(p => !searchPiecesPanel.trim() || (p.intitule || p.nom || '').toLowerCase().includes(searchPiecesPanel.trim().toLowerCase()) || (p.type || '').toLowerCase().includes(searchPiecesPanel.trim().toLowerCase())).map(piece => (
                                  <button key={piece.id} onClick={() => { setEditingPieceIds(prev => [...prev, piece.id]); setSearchPiecesPanel(''); }}
                                    className="w-full flex items-center gap-2 p-2 text-left text-body bg-white border rounded hover:bg-blue-50 hover:border-blue-300 transition-colors">
                                    <span className="w-6 h-6 bg-blue-100 text-blue-700 text-counter rounded flex items-center justify-center flex-shrink-0">{getPieceLabel(piece.id)}</span>
                                    <span className="truncate flex-1">{piece.intitule || piece.nom}</span>
                                    <span className="text-caption text-gray-400">{piece.type}</span>
                                    <Plus className="w-4 h-4 text-blue-600" />
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                          <input type="file" id="panel-piece-upload" multiple accept=".pdf,.jpg,.jpeg,.png" className="hidden"
                            onChange={(e) => { if (e.target.files?.length) { handleUploadPieceForPanel(e.target.files); e.target.value = ''; } }} />
                          <button onClick={() => document.getElementById('panel-piece-upload').click()}
                            className="w-full flex items-center justify-center gap-2 p-2 text-body text-zinc-600 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 hover:border-zinc-300 transition-colors">
                            <Upload className="w-4 h-4" />
                            Ajouter un document
                          </button>
                        </div>
                      </div>

                      {/* Section Informations */}
                      <div>
                        <h4 className="text-body font-semibold text-gray-900 mb-3 pb-2 border-b">Informations</h4>
                        
                        <div className="space-y-3">
                          <div>
                            <label className="text-body-medium text-gray-700">Libellé</label>
                            <input 
                              type="text" 
                              defaultValue={data.label || ''} 
                              id="edit-label" 
                              placeholder="Ex: Consultation Dr. Martin" 
                              className={`mt-1 w-full px-3 py-2 border rounded-lg ${iaFieldClass(data.label)}`}
                            />
                          </div>
                          
                          <div>
                            <label className="text-body-medium text-gray-700">Description de l'acte</label>
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
                              <label className="text-body-medium text-gray-700">Type de dépense</label>
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
                              <label className="text-body-medium text-gray-700">Tiers / Prestataire</label>
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
                        <h4 className="text-body font-semibold text-gray-900 mb-3 pb-2 border-b">Dates</h4>
                        <div className="space-y-3">
                          {/* Toggle Ponctuelle / Période */}
                          <div>
                            <label className="text-body-medium text-gray-700">Type de dépense</label>
                            <select
                              id="edit-date-type"
                              defaultValue={data.isPeriodique ? 'periode' : 'ponctuelle'}
                              className="mt-1 w-full px-3 py-2 border rounded-lg"
                              onChange={(e) => {
                                document.getElementById('dsa-periode-fields').style.display = e.target.value === 'periode' ? 'block' : 'none';
                                document.getElementById('dsa-ponctuelle-label').textContent = e.target.value === 'periode' ? 'Date de début' : 'Date de la dépense';
                              }}
                            >
                              <option value="ponctuelle">Ponctuelle</option>
                              <option value="periode">Période</option>
                            </select>
                          </div>

                          {/* Date principale (toujours visible) */}
                          <div>
                            <label id="dsa-ponctuelle-label" className="text-body-medium text-gray-700">
                              {data.isPeriodique ? 'Date de début' : 'Date de la dépense'}
                            </label>
                            <div className="relative mt-1">
                              <input type="text" defaultValue={data.date || ''} id="edit-date"
                                placeholder="JJ/MM/AAAA" maxLength={10}
                                onChange={(e) => { e.target.value = formatDateInput(e.target.value); }}
                                className={`w-full px-3 py-2 pr-9 border rounded-lg ${iaFieldClass(data.date)}`}
                              />
                              <input type="date" id="edit-date-picker" className="absolute inset-0 opacity-0 pointer-events-none" onChange={(e) => handleDatePick(e, 'edit-date')} />
                              <button type="button" onClick={() => openDatePicker('edit-date')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-zinc-100 rounded"><Calendar className="w-4 h-4 text-zinc-400" /></button>
                            </div>
                          </div>

                          {/* Champs période (masqués si ponctuelle) */}
                          <div id="dsa-periode-fields" style={{ display: data.isPeriodique ? 'block' : 'none' }}>
                            <div className="space-y-3">
                              <div>
                                <label className="text-body-medium text-gray-700">Date de fin</label>
                                <div className="relative mt-1">
                                  <input type="text" defaultValue={data.dateFin || ''} id="edit-date-fin"
                                    placeholder="JJ/MM/AAAA" maxLength={10}
                                    onChange={(e) => { e.target.value = formatDateInput(e.target.value); }}
                                    className="w-full px-3 py-2 pr-9 border rounded-lg"
                                  />
                                  <input type="date" id="edit-date-fin-picker" className="absolute inset-0 opacity-0 pointer-events-none" onChange={(e) => handleDatePick(e, 'edit-date-fin')} />
                                  <button type="button" onClick={() => openDatePicker('edit-date-fin')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-zinc-100 rounded"><Calendar className="w-4 h-4 text-zinc-400" /></button>
                                </div>
                              </div>

                              {/* Durée calculée (read-only, comme DFT) */}
                              <div className="p-2.5 bg-blue-50 rounded-lg flex items-center justify-between">
                                <span className="text-caption text-blue-700">Durée calculée</span>
                                <span className="text-body-medium font-semibold text-blue-900">
                                  {calcDaysBetween(data.date, data.dateFin) || '—'} jours
                                </span>
                              </div>

                              {/* Périodicité */}
                              <div>
                                <label className="text-body-medium text-gray-700">Périodicité</label>
                                <select defaultValue={data.periodicite || ''} id="edit-periodicite"
                                  className="mt-1 w-full px-3 py-2 border rounded-lg">
                                  <option value="">—</option>
                                  <option>Quotidien</option>
                                  <option>Hebdomadaire</option>
                                  <option>Mensuel</option>
                                  <option>Annuel</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Section Montants */}
                      <div>
                        <h4 className="text-body-medium font-semibold text-gray-900 mb-3 pb-2 border-b">Montants</h4>
                        
                        <div className="space-y-3">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                              type="checkbox" 
                              defaultChecked={data.aRevalo || false}
                              id="edit-revalo"
                              className="rounded text-blue-600"
                            />
                            <span className="text-body">À revaloriser</span>
                          </label>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-body-medium text-gray-700">Montant unitaire</label>
                              <div className="mt-1 relative">
                                <input 
                                  type="number" 
                                  step="0.01" 
                                  defaultValue={data.montantUnitaire ?? ''} 
                                  id="edit-montant-unitaire" 
                                  placeholder="0.00" 
                                  className="w-full px-3 py-2 pr-8 border rounded-lg"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-body">€</span>
                              </div>
                            </div>
                            <div>
                              <label className="text-body-medium text-gray-700">Montant total</label>
                              <div className="mt-1 relative">
                                <input
                                  type="number"
                                  step="0.01"
                                  defaultValue={data.montant ?? ''}
                                  id="edit-montant"
                                  readOnly
                                  className="w-full px-3 py-2 pr-8 border rounded-lg bg-zinc-50 text-zinc-500 cursor-default"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-body">€</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-body-medium text-gray-700">Déjà remboursé</label>
                              <div className="mt-1 relative">
                                <input 
                                  type="number" 
                                  step="0.01" 
                                  defaultValue={data.dejaRembourse || 0} 
                                  id="edit-rembourse" 
                                  className="w-full px-3 py-2 pr-8 border rounded-lg"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-body">€</span>
                              </div>
                            </div>
                            <div>
                              <label className="text-body-medium text-gray-700">Reste à charge retenu</label>
                              <div className="mt-1 relative">
                                <input 
                                  type="number" 
                                  step="0.01" 
                                  defaultValue={data.resteAChargeRetenu ?? ((data.montant || 0) - (data.dejaRembourse || 0))} 
                                  id="edit-reste-charge" 
                                  className="w-full px-3 py-2 pr-8 border rounded-lg bg-gray-50 font-medium"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-body">€</span>
                              </div>
                              <p className="mt-1 text-caption text-gray-500">Revalorisé s'il y a lieu</p>
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
                        <div className="text-caption text-gray-400 mb-3 uppercase tracking-wide">{data.type}</div>
                        <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2 mb-6"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-2 bg-gray-100 rounded w-full"></div>
                          <div className="h-2 bg-gray-100 rounded w-5/6"></div>
                          <div className="h-2 bg-gray-100 rounded w-4/6"></div>
                          <div className="h-2 bg-gray-100 rounded w-full"></div>
                          <div className="h-2 bg-gray-100 rounded w-3/4"></div>
                        </div>
                        <div className="mt-4 pt-4 border-t text-caption text-gray-400">
                          {data.date}
                        </div>
                      </div>
                    </div>
                    
                    {/* Right: Details */}
                    <div className="w-1/2 space-y-4">
                      <div>
                        <label className="text-body-medium text-gray-700">Intitulé</label>
                        <input
                          id="piece-intitule"
                          type="text"
                          defaultValue={data.intitule || data.nom?.replace(/\.[^/.]+$/, '')}
                          className="mt-1 w-full px-3 py-2 border rounded-lg"
                          placeholder="Intitulé descriptif"
                        />
                      </div>

                      <div>
                        <label className="text-body-medium text-gray-700">Nom du fichier original</label>
                        <div className="mt-1 px-3 py-2 bg-gray-50 rounded-lg text-body text-gray-600 truncate">
                          {data.nomOriginal || data.nom}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-body-medium text-gray-700">Type</label>
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
                        <label className="text-body-medium text-gray-700 mb-2 block">Utilisé dans</label>
                        {data.usages && data.usages.length > 0 ? (
                          <div className="space-y-2">
                            {data.usages.includes('DSA') && (
                              <div className="flex items-center justify-between p-2.5 bg-blue-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-blue-600" />
                                  <span className="text-body-medium text-blue-800">DSA</span>
                                </div>
                                <span className="text-caption text-blue-600">Liquidation</span>
                              </div>
                            )}
                            {data.usages.includes('PGPA') && (
                              <div className="flex items-center justify-between p-2.5 bg-green-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-green-600" />
                                  <span className="text-body-medium text-green-800">PGPA</span>
                                </div>
                                <span className="text-caption text-green-600">Liquidation</span>
                              </div>
                            )}
                            {data.usages.includes('DFT') && (
                              <div className="flex items-center justify-between p-2.5 bg-amber-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-amber-600" />
                                  <span className="text-body-medium text-amber-800">DFT</span>
                                </div>
                                <span className="text-caption text-amber-600">Liquidation</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="p-3 bg-gray-50 rounded-lg text-body text-gray-500 text-center">
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
                          <div className="relative">
                            <input type="text" id="victime-naissance" defaultValue={victimeData.dateNaissance} className={`${inputClass} pr-9`} placeholder="JJ/MM/AAAA" maxLength={10} onChange={(e) => { e.target.value = formatDateInput(e.target.value); }} />
                            <input type="date" id="victime-naissance-picker" className="absolute inset-0 opacity-0 pointer-events-none" onChange={(e) => handleDatePick(e, 'victime-naissance')} />
                            <button type="button" onClick={() => openDatePicker('victime-naissance')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-zinc-100 rounded"><Calendar className="w-4 h-4 text-zinc-400" /></button>
                          </div>
                        </FormField>
                      </div>
                    </FormSection>
                    
                    <FormSection title="Décès" noBorder>
                      <FormField label="Date de décès" hint="Laisser vide si non applicable">
                        <div className="relative">
                          <input type="text" id="victime-deces" defaultValue={victimeData.dateDeces || ''} className={`${inputClass} pr-9`} placeholder="JJ/MM/AAAA" maxLength={10} onChange={(e) => { e.target.value = formatDateInput(e.target.value); }} />
                          <input type="date" id="victime-deces-picker" className="absolute inset-0 opacity-0 pointer-events-none" onChange={(e) => handleDatePick(e, 'victime-deces')} />
                          <button type="button" onClick={() => openDatePicker('victime-deces')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-zinc-100 rounded"><Calendar className="w-4 h-4 text-zinc-400" /></button>
                        </div>
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
                          <div className="relative">
                            <input type="text" id="fait-date-accident" defaultValue={faitGenerateur.dateAccident} className={`${inputClass} pr-9`} placeholder="JJ/MM/AAAA" maxLength={10} onChange={(e) => { e.target.value = formatDateInput(e.target.value); }} />
                            <input type="date" id="fait-date-accident-picker" className="absolute inset-0 opacity-0 pointer-events-none" onChange={(e) => handleDatePick(e, 'fait-date-accident')} />
                            <button type="button" onClick={() => openDatePicker('fait-date-accident')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-zinc-100 rounded"><Calendar className="w-4 h-4 text-zinc-400" /></button>
                          </div>
                        </FormField>
                        <FormField label="Date première constatation">
                          <div className="relative">
                            <input type="text" id="fait-date-constat" defaultValue={faitGenerateur.datePremiereConstatation} className={`${inputClass} pr-9`} placeholder="JJ/MM/AAAA" maxLength={10} onChange={(e) => { e.target.value = formatDateInput(e.target.value); }} />
                            <input type="date" id="fait-date-constat-picker" className="absolute inset-0 opacity-0 pointer-events-none" onChange={(e) => handleDatePick(e, 'fait-date-constat')} />
                            <button type="button" onClick={() => openDatePicker('fait-date-constat')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-zinc-100 rounded"><Calendar className="w-4 h-4 text-zinc-400" /></button>
                          </div>
                        </FormField>
                        <FormField label="Date de consolidation">
                          <div className="relative">
                            <input type="text" id="fait-date-conso" defaultValue={faitGenerateur.dateConsolidation} className={`${inputClass} pr-9`} placeholder="JJ/MM/AAAA" maxLength={10} onChange={(e) => { e.target.value = formatDateInput(e.target.value); }} />
                            <input type="date" id="fait-date-conso-picker" className="absolute inset-0 opacity-0 pointer-events-none" onChange={(e) => handleDatePick(e, 'fait-date-conso')} />
                            <button type="button" onClick={() => openDatePicker('fait-date-conso')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-zinc-100 rounded"><Calendar className="w-4 h-4 text-zinc-400" /></button>
                          </div>
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
                      <h4 className="text-body-medium font-semibold text-gray-900 mb-3 pb-2 border-b">Identité</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-body-medium text-gray-700">Nom</label>
                          <input type="text" id="vi-nom" defaultValue={data?.nom || ''} className="mt-1 w-full px-3 py-2 border rounded-lg" />
                        </div>
                        <div>
                          <label className="text-body-medium text-gray-700">Prénom</label>
                          <input type="text" id="vi-prenom" defaultValue={data?.prenom || ''} className="mt-1 w-full px-3 py-2 border rounded-lg" />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-body-medium font-semibold text-gray-900 mb-3 pb-2 border-b">État civil</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-body-medium text-gray-700">Sexe</label>
                          <select id="vi-sexe" defaultValue={data?.sexe || 'Homme'} className="mt-1 w-full px-3 py-2 border rounded-lg">
                            <option>Homme</option>
                            <option>Femme</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-body-medium text-gray-700">Date de naissance</label>
                          <div className="relative mt-1">
                            <input type="text" id="vi-naissance" defaultValue={data?.dateNaissance || ''} className="w-full px-3 py-2 pr-9 border rounded-lg" placeholder="JJ/MM/AAAA" maxLength={10} onChange={(e) => { e.target.value = formatDateInput(e.target.value); }} />
                            <input type="date" id="vi-naissance-picker" className="absolute inset-0 opacity-0 pointer-events-none" onChange={(e) => handleDatePick(e, 'vi-naissance')} />
                            <button type="button" onClick={() => openDatePicker('vi-naissance')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-zinc-100 rounded"><Calendar className="w-4 h-4 text-zinc-400" /></button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-body-medium font-semibold text-gray-900 mb-3 pb-2 border-b">Lien avec la victime</h4>
                      <div>
                        <label className="text-body-medium text-gray-700">Type de lien</label>
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
                        <div className="relative">
                          <input type="text" id="dossier-date-ouverture" defaultValue={dossierDateOuverture} className={`${inputClass} pr-9`} placeholder="JJ/MM/AAAA" maxLength={10} onChange={(e) => { e.target.value = formatDateInput(e.target.value); }} />
                          <input type="date" id="dossier-date-ouverture-picker" className="absolute inset-0 opacity-0 pointer-events-none" onChange={(e) => handleDatePick(e, 'dossier-date-ouverture')} />
                          <button type="button" onClick={() => openDatePicker('dossier-date-ouverture')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-zinc-100 rounded"><Calendar className="w-4 h-4 text-zinc-400" /></button>
                        </div>
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
                      <h4 className="text-body-medium font-semibold text-gray-900 mb-3 pb-2 border-b">Pièces justificatives</h4>
                      {editingPieceIds.length > 0 && (
                        <div className="space-y-2 mb-3">
                          {editingPieceIds.map(pid => {
                            const piece = getPiece(pid);
                            return piece ? (
                              <div key={pid} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg border group">
                                <span className="w-8 h-8 bg-blue-100 text-blue-700 text-caption-medium rounded flex items-center justify-center flex-shrink-0">{getPieceLabel(pid)}</span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-body-medium truncate">{piece.intitule || piece.nom}</p>
                                  <p className="text-caption text-gray-500">{piece.type}</p>
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
                                className="w-full pl-8 pr-7 py-1.5 text-caption border border-zinc-200 rounded-md bg-white placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-300" />
                              {searchPiecesPanel && <button onClick={() => setSearchPiecesPanel('')} className="absolute right-2 top-1/2 -translate-y-1/2"><X className="w-3 h-3 text-zinc-400" /></button>}
                            </div>
                            <div className="max-h-32 overflow-y-auto space-y-1">
                              {pieces.filter(p => !editingPieceIds.includes(p.id)).filter(p => !searchPiecesPanel.trim() || (p.intitule || p.nom || '').toLowerCase().includes(searchPiecesPanel.trim().toLowerCase()) || (p.type || '').toLowerCase().includes(searchPiecesPanel.trim().toLowerCase())).map(piece => (
                                <button key={piece.id} onClick={() => { setEditingPieceIds(prev => [...prev, piece.id]); setSearchPiecesPanel(''); }}
                                  className="w-full flex items-center gap-2 p-2 text-left text-body bg-white border rounded hover:bg-blue-50 hover:border-blue-300 transition-colors">
                                  <span className="w-6 h-6 bg-blue-100 text-blue-700 text-counter rounded flex items-center justify-center flex-shrink-0">{getPieceLabel(piece.id)}</span>
                                  <span className="truncate flex-1">{piece.intitule || piece.nom}</span>
                                  <span className="text-caption text-gray-400">{piece.type}</span>
                                  <Plus className="w-4 h-4 text-blue-600" />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        <input type="file" id="panel-piece-upload" multiple accept=".pdf,.jpg,.jpeg,.png" className="hidden"
                          onChange={(e) => { if (e.target.files?.length) { handleUploadPieceForPanel(e.target.files); e.target.value = ''; } }} />
                        <button onClick={() => document.getElementById('panel-piece-upload').click()}
                          className="w-full flex items-center justify-center gap-2 p-2 text-body text-zinc-600 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 hover:border-zinc-300 transition-colors">
                          <Upload className="w-4 h-4" />
                          Ajouter un document
                        </button>
                      </div>
                    </div>

                    {/* Section Informations */}
                    <div>
                      <h4 className="text-body-medium font-semibold text-gray-900 mb-3 pb-2 border-b">Informations</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="text-body-medium text-gray-700">Type</label>
                          <select id="pgpa-revenu-type" defaultValue={data.type || 'revenu'} className="mt-1 w-full px-3 py-2 border rounded-lg">
                            <option value="revenu">Revenu professionnel</option>
                            <option value="gain">Gain supplémentaire (prime, indemnité...)</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-body-medium text-gray-700">Intitulé</label>
                          <input id="pgpa-revenu-label" type="text" defaultValue={data.label || ''} placeholder="Ex: Salaire net imposable" className="mt-1 w-full px-3 py-2 border rounded-lg" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-body-medium text-gray-700">Année</label>
                            <input id="pgpa-revenu-annee" type="text" defaultValue={data.annee || ''} placeholder="2022" className="mt-1 w-full px-3 py-2 border rounded-lg" />
                          </div>
                          <div>
                            <label className="text-body-medium text-gray-700">Unité de temps</label>
                            <select id="pgpa-revenu-unite" defaultValue={data.unite || 'annuel'} className="mt-1 w-full px-3 py-2 border rounded-lg">
                              <option value="annuel">Annuel</option>
                              <option value="mensuel">Mensuel</option>
                              <option value="journalier">Journalier</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="text-body-medium text-gray-700">Commentaire</label>
                          <textarea id="pgpa-revenu-commentaire" rows={2} defaultValue={data.commentaire || ''} placeholder="Informations complémentaires..." className="mt-1 w-full px-3 py-2 border rounded-lg resize-none" />
                        </div>
                      </div>
                    </div>
                    
                    {/* Section Montants */}
                    <div>
                      <h4 className="text-body-medium font-semibold text-gray-900 mb-3 pb-2 border-b">Montants</h4>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-body-medium text-gray-700">Revenu net payé</label>
                            <div className="mt-1 relative">
                              <input id="pgpa-revenu-montant" type="number" step="0.01" defaultValue={data.montant || ''} readOnly className="w-full px-3 py-2 pr-8 border rounded-lg bg-zinc-50 text-zinc-500 cursor-default" />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-body">€</span>
                            </div>
                          </div>
                          <div>
                            <label className="text-body-medium text-gray-700">Montant revalorisé</label>
                            <div className="mt-1 relative">
                              <input id="pgpa-revenu-revalorise" type="number" step="0.01" defaultValue={data.revalorise || ''} className="w-full px-3 py-2 pr-8 border rounded-lg bg-gray-50 font-medium" readOnly />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-body">€</span>
                            </div>
                            <p className="mt-1 text-caption text-gray-500">Calculé automatiquement selon le barème</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <input type="checkbox" id="pgpa-revenu-revalo-checkbox" defaultChecked={data.aRevaloriser !== false} className="rounded text-blue-600" />
                            <label htmlFor="pgpa-revenu-revalo-checkbox" className="text-body-medium text-gray-700">Appliquer la revalorisation</label>
                          </div>
                          <div className="text-body text-gray-500">
                            {pgpaData.revenuRef.revalorisation === 'ipc-annuel' ? 'IPC annuel' : pgpaData.revenuRef.revalorisation === 'smic-horaire' ? 'SMIC horaire' : 'Aucune'} · Quotient : <span className="font-medium">1.04</span>
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
                      <h4 className="text-body-medium font-semibold text-gray-900 mb-3 pb-2 border-b">Pièces justificatives</h4>
                      {editingPieceIds.length > 0 && (
                        <div className="space-y-2 mb-3">
                          {editingPieceIds.map(pid => {
                            const piece = getPiece(pid);
                            return piece ? (
                              <div key={pid} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg border group">
                                <span className="w-8 h-8 bg-blue-100 text-blue-700 text-caption-medium rounded flex items-center justify-center flex-shrink-0">{getPieceLabel(pid)}</span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-body-medium truncate">{piece.intitule || piece.nom}</p>
                                  <p className="text-caption text-gray-500">{piece.type}</p>
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
                                className="w-full pl-8 pr-7 py-1.5 text-caption border border-zinc-200 rounded-md bg-white placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-300" />
                              {searchPiecesPanel && <button onClick={() => setSearchPiecesPanel('')} className="absolute right-2 top-1/2 -translate-y-1/2"><X className="w-3 h-3 text-zinc-400" /></button>}
                            </div>
                            <div className="max-h-32 overflow-y-auto space-y-1">
                              {pieces.filter(p => !editingPieceIds.includes(p.id)).filter(p => !searchPiecesPanel.trim() || (p.intitule || p.nom || '').toLowerCase().includes(searchPiecesPanel.trim().toLowerCase()) || (p.type || '').toLowerCase().includes(searchPiecesPanel.trim().toLowerCase())).map(piece => (
                                <button key={piece.id} onClick={() => { setEditingPieceIds(prev => [...prev, piece.id]); setSearchPiecesPanel(''); }}
                                  className="w-full flex items-center gap-2 p-2 text-left text-body bg-white border rounded hover:bg-blue-50 hover:border-blue-300 transition-colors">
                                  <span className="w-6 h-6 bg-blue-100 text-blue-700 text-counter rounded flex items-center justify-center flex-shrink-0">{getPieceLabel(piece.id)}</span>
                                  <span className="truncate flex-1">{piece.intitule || piece.nom}</span>
                                  <span className="text-caption text-gray-400">{piece.type}</span>
                                  <Plus className="w-4 h-4 text-blue-600" />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        <input type="file" id="panel-piece-upload" multiple accept=".pdf,.jpg,.jpeg,.png" className="hidden"
                          onChange={(e) => { if (e.target.files?.length) { handleUploadPieceForPanel(e.target.files); e.target.value = ''; } }} />
                        <button onClick={() => document.getElementById('panel-piece-upload').click()}
                          className="w-full flex items-center justify-center gap-2 p-2 text-body text-zinc-600 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 hover:border-zinc-300 transition-colors">
                          <Upload className="w-4 h-4" />
                          Ajouter un document
                        </button>
                      </div>
                    </div>

                    {/* Section Informations */}
                    <div>
                      <h4 className="text-body-medium font-semibold text-gray-900 mb-3 pb-2 border-b">Informations</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="text-body-medium text-gray-700">Intitulé</label>
                          <input id="pgpa-percu-label" type="text" defaultValue={data.label || ''} placeholder="Ex: Maintien de salaire partiel" className="mt-1 w-full px-3 py-2 border rounded-lg" />
                        </div>

                        <div>
                          <label className="text-body-medium text-gray-700">Organisme / Tiers</label>
                          <input id="pgpa-percu-tiers" type="text" defaultValue={data.tiers || ''} placeholder="Ex: Employeur, Prévoyance..." className="mt-1 w-full px-3 py-2 border rounded-lg" />
                        </div>

                        <div>
                          <label className="text-body-medium text-gray-700">Commentaire</label>
                          <textarea id="pgpa-percu-commentaire" rows={2} defaultValue={data.commentaire || ''} placeholder="Informations complémentaires..." className="mt-1 w-full px-3 py-2 border rounded-lg resize-none" />
                        </div>
                      </div>
                    </div>
                    
                    {/* Section Période */}
                    <div>
                      <h4 className="text-body-medium font-semibold text-gray-900 mb-3 pb-2 border-b">Période</h4>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-body-medium text-gray-700">Date de début</label>
                            <div className="relative mt-1">
                              <input id="pgpa-percu-debut" type="text" defaultValue={data.periodeDebut || ''} placeholder="JJ/MM/AAAA" maxLength={10} onChange={(e) => { e.target.value = formatDateInput(e.target.value); }} className="w-full px-3 py-2 pr-9 border rounded-lg" />
                              <input type="date" id="pgpa-percu-debut-picker" className="absolute inset-0 opacity-0 pointer-events-none" onChange={(e) => handleDatePick(e, 'pgpa-percu-debut')} />
                              <button type="button" onClick={() => openDatePicker('pgpa-percu-debut')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-zinc-100 rounded"><Calendar className="w-4 h-4 text-zinc-400" /></button>
                            </div>
                          </div>
                          <div>
                            <label className="text-body-medium text-gray-700">Date de fin</label>
                            <div className="relative mt-1">
                              <input id="pgpa-percu-fin" type="text" defaultValue={data.periodeFin || ''} placeholder="JJ/MM/AAAA" maxLength={10} onChange={(e) => { e.target.value = formatDateInput(e.target.value); }} className="w-full px-3 py-2 pr-9 border rounded-lg" />
                              <input type="date" id="pgpa-percu-fin-picker" className="absolute inset-0 opacity-0 pointer-events-none" onChange={(e) => handleDatePick(e, 'pgpa-percu-fin')} />
                              <button type="button" onClick={() => openDatePicker('pgpa-percu-fin')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-zinc-100 rounded"><Calendar className="w-4 h-4 text-zinc-400" /></button>
                            </div>
                          </div>
                        </div>

                        <div className="p-3 bg-blue-50 rounded-lg flex items-center justify-between">
                          <span className="text-body text-blue-700">Durée calculée</span>
                          <span className="font-semibold text-blue-900">{data.dureeJours || '—'} jours</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Section Montants */}
                    <div>
                      <h4 className="text-body-medium font-semibold text-gray-900 mb-3 pb-2 border-b">Montants</h4>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-body-medium text-gray-700">Revenu perçu net</label>
                            <div className="mt-1 relative">
                              <input id="pgpa-percu-montant" type="number" step="0.01" defaultValue={data.montant || ''} readOnly className="w-full px-3 py-2 pr-8 border rounded-lg bg-zinc-50 text-zinc-500 cursor-default" />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-body">€</span>
                            </div>
                          </div>
                          <div>
                            <label className="text-body-medium text-gray-700">Unité de temps</label>
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
                            <label htmlFor="pgpa-percu-no-revalo" className="text-body-medium text-gray-700">Montant à ne pas revaloriser</label>
                          </div>
                        </div>
                        
                        <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                          <div className="flex items-center justify-between">
                            <span className="text-body text-amber-800">Perte de gains sur la période</span>
                            <span className="font-semibold text-amber-900">{fmt(data.perteGains || 0)}</span>
                          </div>
                          <p className="text-caption text-amber-600 mt-1">Revenu de référence − Revenu perçu</p>
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
                      <h4 className="text-body-medium font-semibold text-gray-900 mb-3 pb-2 border-b">Pièces justificatives</h4>
                      {editingPieceIds.length > 0 && (
                        <div className="space-y-2 mb-3">
                          {editingPieceIds.map(pid => {
                            const piece = getPiece(pid);
                            return piece ? (
                              <div key={pid} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg border group">
                                <span className="w-8 h-8 bg-blue-100 text-blue-700 text-caption-medium rounded flex items-center justify-center flex-shrink-0">{getPieceLabel(pid)}</span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-body-medium truncate">{piece.intitule || piece.nom}</p>
                                  <p className="text-caption text-gray-500">{piece.type}</p>
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
                                className="w-full pl-8 pr-7 py-1.5 text-caption border border-zinc-200 rounded-md bg-white placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-300" />
                              {searchPiecesPanel && <button onClick={() => setSearchPiecesPanel('')} className="absolute right-2 top-1/2 -translate-y-1/2"><X className="w-3 h-3 text-zinc-400" /></button>}
                            </div>
                            <div className="max-h-32 overflow-y-auto space-y-1">
                              {pieces.filter(p => !editingPieceIds.includes(p.id)).filter(p => !searchPiecesPanel.trim() || (p.intitule || p.nom || '').toLowerCase().includes(searchPiecesPanel.trim().toLowerCase()) || (p.type || '').toLowerCase().includes(searchPiecesPanel.trim().toLowerCase())).map(piece => (
                                <button key={piece.id} onClick={() => { setEditingPieceIds(prev => [...prev, piece.id]); setSearchPiecesPanel(''); }}
                                  className="w-full flex items-center gap-2 p-2 text-left text-body bg-white border rounded hover:bg-blue-50 hover:border-blue-300 transition-colors">
                                  <span className="w-6 h-6 bg-blue-100 text-blue-700 text-counter rounded flex items-center justify-center flex-shrink-0">{getPieceLabel(piece.id)}</span>
                                  <span className="truncate flex-1">{piece.intitule || piece.nom}</span>
                                  <span className="text-caption text-gray-400">{piece.type}</span>
                                  <Plus className="w-4 h-4 text-blue-600" />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        <input type="file" id="panel-piece-upload" multiple accept=".pdf,.jpg,.jpeg,.png" className="hidden"
                          onChange={(e) => { if (e.target.files?.length) { handleUploadPieceForPanel(e.target.files); e.target.value = ''; } }} />
                        <button onClick={() => document.getElementById('panel-piece-upload').click()}
                          className="w-full flex items-center justify-center gap-2 p-2 text-body text-zinc-600 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 hover:border-zinc-300 transition-colors">
                          <Upload className="w-4 h-4" />
                          Ajouter un document
                        </button>
                      </div>
                    </div>

                    {/* Section Tiers payeur */}
                    <div>
                      <h4 className="text-body-medium font-semibold text-gray-900 mb-3 pb-2 border-b">Tiers payeur</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="text-body-medium text-gray-700">Organisme</label>
                          <select id="pgpa-ij-tiers" defaultValue={data.tiers || ''} className="mt-1 w-full px-3 py-2 border rounded-lg">
                            <option value="">— Sélectionner —</option>
                            {chiffrageParams.tiersPayeurs.map((t, i) => (
                              <option key={i} value={t}>{t}</option>
                            ))}
                            <option value="autre">Autre...</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-body-medium text-gray-700">Libellé / Description</label>
                          <input id="pgpa-ij-label" type="text" defaultValue={data.label || ''} placeholder="Ex: IJ Sécurité sociale" className="mt-1 w-full px-3 py-2 border rounded-lg" />
                        </div>

                        <div>
                          <label className="text-body-medium text-gray-700">Commentaire</label>
                          <textarea id="pgpa-ij-commentaire" rows={2} defaultValue={data.commentaire || ''} placeholder="Informations complémentaires..." className="mt-1 w-full px-3 py-2 border rounded-lg resize-none" />
                        </div>
                      </div>
                    </div>
                    
                    {/* Section Période d'arrêt */}
                    <div>
                      <h4 className="text-body-medium font-semibold text-gray-900 mb-3 pb-2 border-b">Période d'arrêt de travail</h4>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-body-medium text-gray-700">Date de début</label>
                            <div className="relative mt-1">
                              <input id="pgpa-ij-debut" type="text" defaultValue={data.periodeDebut || ''} placeholder="JJ/MM/AAAA" maxLength={10} onChange={(e) => { e.target.value = formatDateInput(e.target.value); }} className="w-full px-3 py-2 pr-9 border rounded-lg" />
                              <input type="date" id="pgpa-ij-debut-picker" className="absolute inset-0 opacity-0 pointer-events-none" onChange={(e) => handleDatePick(e, 'pgpa-ij-debut')} />
                              <button type="button" onClick={() => openDatePicker('pgpa-ij-debut')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-zinc-100 rounded"><Calendar className="w-4 h-4 text-zinc-400" /></button>
                            </div>
                          </div>
                          <div>
                            <label className="text-body-medium text-gray-700">Date de fin</label>
                            <div className="relative mt-1">
                              <input id="pgpa-ij-fin" type="text" defaultValue={data.periodeFin || ''} placeholder="JJ/MM/AAAA" maxLength={10} onChange={(e) => { e.target.value = formatDateInput(e.target.value); }} className="w-full px-3 py-2 pr-9 border rounded-lg" />
                              <input type="date" id="pgpa-ij-fin-picker" className="absolute inset-0 opacity-0 pointer-events-none" onChange={(e) => handleDatePick(e, 'pgpa-ij-fin')} />
                              <button type="button" onClick={() => openDatePicker('pgpa-ij-fin')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-zinc-100 rounded"><Calendar className="w-4 h-4 text-zinc-400" /></button>
                            </div>
                          </div>
                        </div>

                        <div className="p-3 bg-blue-50 rounded-lg flex items-center justify-between">
                          <span className="text-body text-blue-700">Durée calculée</span>
                          <span className="font-semibold text-blue-900">{data.jours || '—'} jours</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Section Montants */}
                    <div>
                      <h4 className="text-body-medium font-semibold text-gray-900 mb-3 pb-2 border-b">Montants</h4>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-body-medium text-gray-700">Indemnité brute perçue</label>
                            <div className="mt-1 relative">
                              <input id="pgpa-ij-brut" type="number" step="0.01" defaultValue={data.montantBrut || ''} placeholder="0.00" className="w-full px-3 py-2 pr-8 border rounded-lg" />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-body">€</span>
                            </div>
                          </div>
                          <div>
                            <label className="text-body-medium text-gray-700">CSG-CRDS</label>
                            <div className="mt-1 relative">
                              <input id="pgpa-ij-csg" type="number" step="0.01" defaultValue={data.csgCrds || ''} placeholder="0.00" className="w-full px-3 py-2 pr-8 border rounded-lg" />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-body">€</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center justify-between">
                            <span className="text-body text-green-800">Indemnité nette perçue</span>
                            <span className="font-semibold text-green-900">{fmt(data.montant || 0)}</span>
                          </div>
                          <p className="text-caption text-green-600 mt-1">Brut − CSG-CRDS</p>
                        </div>
                        
                        <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-body-medium text-purple-800">Créance du tiers payeur</span>
                            <span className="font-bold text-purple-900">{fmt(data.montant || 0)}</span>
                          </div>
                          <p className="text-caption text-purple-600">Ce montant sera déduit de l'indemnité victime et versé directement au tiers payeur</p>
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
                        <span className="text-body-medium text-indigo-700">Suggestion IA · Confiance {data.confidence}%</span>
                      </div>
                    )}
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-body-medium font-semibold text-gray-900 mb-3 pb-2 border-b">Pièces justificatives</h4>

                        {editingPieceIds.length > 0 && (
                          <div className="space-y-2 mb-3">
                            {editingPieceIds.map(pid => {
                              const piece = getPiece(pid);
                              return piece ? (
                                <div key={pid} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg border group">
                                  <span className="w-8 h-8 bg-blue-100 text-blue-700 text-caption-medium rounded flex items-center justify-center flex-shrink-0">
                                    {getPieceLabel(pid)}
                                  </span>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-body-medium truncate">Rapport d'expertise</p>
                                    <p className="text-caption text-gray-500">{piece.type}</p>
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
                                  className="w-full pl-8 pr-7 py-1.5 text-caption border border-zinc-200 rounded-md bg-white placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-300" />
                                {searchPiecesPanel && <button onClick={() => setSearchPiecesPanel('')} className="absolute right-2 top-1/2 -translate-y-1/2"><X className="w-3 h-3 text-zinc-400" /></button>}
                              </div>
                              <div className="max-h-32 overflow-y-auto space-y-1">
                                {pieces.filter(p => !editingPieceIds.includes(p.id)).filter(p => !searchPiecesPanel.trim() || (p.intitule || p.nom || '').toLowerCase().includes(searchPiecesPanel.trim().toLowerCase()) || (p.type || '').toLowerCase().includes(searchPiecesPanel.trim().toLowerCase())).map(piece => (
                                  <button key={piece.id} onClick={() => { setEditingPieceIds(prev => [...prev, piece.id]); setSearchPiecesPanel(''); }}
                                    className="w-full flex items-center gap-2 p-2 text-left text-body bg-white border rounded hover:bg-blue-50 hover:border-blue-300 transition-colors">
                                    <span className="w-6 h-6 bg-blue-100 text-blue-700 text-counter rounded flex items-center justify-center flex-shrink-0">{getPieceLabel(piece.id)}</span>
                                    <span className="truncate flex-1">Rapport d'expertise</span>
                                    <span className="text-caption text-gray-400">{piece.type}</span>
                                    <Plus className="w-4 h-4 text-blue-600" />
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                          <input type="file" id="panel-piece-upload" multiple accept=".pdf,.jpg,.jpeg,.png" className="hidden"
                            onChange={(e) => { if (e.target.files?.length) { handleUploadPieceForPanel(e.target.files); e.target.value = ''; } }} />
                          <button onClick={() => document.getElementById('panel-piece-upload').click()}
                            className="w-full flex items-center justify-center gap-2 p-2 text-body text-zinc-600 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 hover:border-zinc-300 transition-colors">
                            <Upload className="w-4 h-4" />
                            Ajouter un document
                          </button>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-body-medium font-semibold text-gray-900 mb-3 pb-2 border-b">Période</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div><label className="block text-caption text-gray-500 mb-1">Date début</label><div className="relative"><input type="text" id="dft-debut" defaultValue={data.debut} className="w-full px-3 py-2 pr-9 border rounded-lg text-body" placeholder="JJ/MM/AAAA" maxLength={10} onChange={(e) => { e.target.value = formatDateInput(e.target.value); }} /><input type="date" id="dft-debut-picker" className="absolute inset-0 opacity-0 pointer-events-none" onChange={(e) => handleDatePick(e, 'dft-debut')} /><button type="button" onClick={() => openDatePicker('dft-debut')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-zinc-100 rounded"><Calendar className="w-4 h-4 text-zinc-400" /></button></div></div>
                          <div><label className="block text-caption text-gray-500 mb-1">Date fin</label><div className="relative"><input type="text" id="dft-fin" defaultValue={data.fin} className="w-full px-3 py-2 pr-9 border rounded-lg text-body" placeholder="JJ/MM/AAAA" maxLength={10} onChange={(e) => { e.target.value = formatDateInput(e.target.value); }} /><input type="date" id="dft-fin-picker" className="absolute inset-0 opacity-0 pointer-events-none" onChange={(e) => handleDatePick(e, 'dft-fin')} /><button type="button" onClick={() => openDatePicker('dft-fin')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-zinc-100 rounded"><Calendar className="w-4 h-4 text-zinc-400" /></button></div></div>
                        </div>
                        <div className="mt-3 p-2.5 bg-blue-50 rounded-lg flex items-center justify-between">
                          <span className="text-caption text-blue-700">Durée calculée</span>
                          <span className="text-body-medium font-semibold text-blue-900">{data.jours || '—'} jours</span>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-body-medium font-semibold text-gray-900 mb-3 pb-2 border-b">Paramètres</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div><label className="block text-caption text-gray-500 mb-1">Taux DFT</label><div className="relative"><input type="number" id="dft-taux" defaultValue={data.taux || 100} min={0} max={100} className="w-full px-3 py-2 pr-8 border rounded-lg text-body" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-caption text-gray-400">%</span></div></div>
                          <div><label className="block text-caption text-gray-500 mb-1">Base journalière</label><div className="relative"><input type="number" id="dft-base" defaultValue={chiffrageParams.baseJournaliereDFT || 33} className="w-full px-3 py-2 pr-10 border rounded-lg text-body" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-caption text-gray-400">€/j</span></div></div>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-body-medium font-semibold text-gray-900 mb-3 pb-2 border-b">Contenu</h4>
                        <div><label className="block text-caption text-gray-500 mb-1">Libellé</label><input type="text" id="dft-label" defaultValue={data.label || ''} className="w-full px-3 py-2 border rounded-lg text-body" /></div>
                        <div className="mt-3"><label className="block text-caption text-gray-500 mb-1">Commentaire</label><textarea id="dft-commentaire" defaultValue={data.commentaire || ''} rows={3} className="w-full px-3 py-2 border rounded-lg text-body resize-none" /></div>
                      </div>
                    </div>
                  </>
                )}

              </div>

              {/* Bandeau Montant calculé — sticky entre scroll et action bar */}
              {editPanel.type === 'dsa-ligne' && (
                <div className="px-5 py-3 border-t bg-zinc-50 flex items-center justify-between">
                  <div>
                    <span className="text-body-medium text-zinc-600">Montant calculé</span>
                    <p className="text-caption text-zinc-400">Calculé automatiquement à partir des champs ci-dessus</p>
                  </div>
                  <span className="text-lg font-bold text-zinc-900 tabular-nums">{fmt(data.montant || 0)}</span>
                </div>
              )}
              {editPanel.type === 'pgpa-revenu' && (
                <div className="px-5 py-3 border-t bg-zinc-50 flex items-center justify-between">
                  <div>
                    <span className="text-body-medium text-zinc-600">Montant calculé</span>
                    <p className="text-caption text-zinc-400">Calculé automatiquement à partir des champs ci-dessus</p>
                  </div>
                  <span className="text-lg font-bold text-zinc-900 tabular-nums">{fmt(data.montant || 0)}</span>
                </div>
              )}
              {editPanel.type === 'pgpa-revenu-percu' && (
                <div className="px-5 py-3 border-t bg-zinc-50 flex items-center justify-between">
                  <div>
                    <span className="text-body-medium text-zinc-600">Montant calculé</span>
                    <p className="text-caption text-zinc-400">Calculé automatiquement à partir des champs ci-dessus</p>
                  </div>
                  <span className="text-lg font-bold text-zinc-900 tabular-nums">{fmt(data.montant || 0)}</span>
                </div>
              )}
              {editPanel.type === 'pgpa-ij' && (
                <div className="px-5 py-3 border-t bg-zinc-50 flex items-center justify-between">
                  <div>
                    <span className="text-body-medium text-zinc-600">Montant calculé</span>
                    <p className="text-caption text-zinc-400">Indemnité nette (brut − CSG-CRDS)</p>
                  </div>
                  <span className="text-lg font-bold text-zinc-900 tabular-nums">{fmt(data.montant || 0)}</span>
                </div>
              )}
              {editPanel.type === 'dft-ligne' && (
                <div className="px-5 py-3 border-t bg-zinc-50 flex items-center justify-between">
                  <div>
                    <span className="text-body-medium text-zinc-600">Montant calculé</span>
                    <p className="text-caption text-zinc-400">{data.jours || 0}j × {data.taux || 100}% × {chiffrageParams.baseJournaliereDFT || 33} €/j</p>
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
                    <button onClick={() => {
                      const isPeriode = document.getElementById('edit-date-type')?.value === 'periode';
                      const dateVal = document.getElementById('edit-date')?.value || '';
                      const dateFinVal = isPeriode ? (document.getElementById('edit-date-fin')?.value || '') : '';
                      const periodiciteVal = isPeriode ? (document.getElementById('edit-periodicite')?.value || '') : '';
                      handleSaveLigne(data.id, {
                        label: document.getElementById('edit-label')?.value || 'Dépense',
                        type: document.getElementById('edit-type')?.value || 'Autre',
                        date: dateVal,
                        dateFin: dateFinVal,
                        isPeriodique: isPeriode,
                        periodicite: periodiciteVal,
                        dureeJours: isPeriode ? (calcDaysBetween(dateVal, dateFinVal) || 0) : null,
                        montant: parseFloat(document.getElementById('edit-montant')?.value) || 0,
                        tiers: document.getElementById('edit-tiers')?.value || '',
                        dejaRembourse: parseFloat(document.getElementById('edit-rembourse')?.value) || 0
                      });
                    }} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Enregistrer</button>
                  </div>
                </div>
              )}
              {editPanel.type === 'piece-detail' && (
                <div className="px-5 py-4 border-t bg-gray-50 flex flex-col gap-3">
                  <div className="flex justify-end gap-2">
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
                  <div className="border-t border-gray-200 pt-3">
                    <button onClick={() => {
                      setPieces(prev => prev.filter(p => p.id !== data.id));
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
                    }} className="w-full px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg flex items-center justify-center gap-2 font-medium text-sm transition-colors">
                      <Trash2 className="w-4 h-4" />Supprimer le document
                    </button>
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
                      const debutVal = document.getElementById('pgpa-percu-debut')?.value || data.periodeDebut;
                      const finVal = document.getElementById('pgpa-percu-fin')?.value || data.periodeFin;
                      const updatedLigne = {
                        ...data,
                        label: document.getElementById('pgpa-percu-label')?.value || data.label,
                        tiers: document.getElementById('pgpa-percu-tiers')?.value || data.tiers,
                        commentaire: document.getElementById('pgpa-percu-commentaire')?.value || '',
                        periodeDebut: debutVal,
                        periodeFin: finVal,
                        dureeJours: calcDaysBetween(debutVal, finVal) || data.dureeJours || 0,
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
                      const debutVal = document.getElementById('pgpa-ij-debut')?.value || data.periodeDebut;
                      const finVal = document.getElementById('pgpa-ij-fin')?.value || data.periodeFin;
                      const updatedLigne = {
                        ...data,
                        tiers: document.getElementById('pgpa-ij-tiers')?.value || data.tiers,
                        label: document.getElementById('pgpa-ij-label')?.value || data.label,
                        commentaire: document.getElementById('pgpa-ij-commentaire')?.value || '',
                        periodeDebut: debutVal,
                        periodeFin: finVal,
                        jours: calcDaysBetween(debutVal, finVal) || data.jours || 0,
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
                      const debutVal = document.getElementById('dft-debut')?.value || data.debut;
                      const finVal = document.getElementById('dft-fin')?.value || data.fin;
                      const jours = calcDaysBetween(debutVal, finVal) || data.jours || 0;
                      const taux = parseInt(document.getElementById('dft-taux')?.value) || data.taux || 100;
                      const baseJ = parseFloat(document.getElementById('dft-base')?.value) || chiffrageParams.baseJournaliereDFT || 33;
                      const updatedLigne = {
                        ...data,
                        label: document.getElementById('dft-label')?.value || data.label,
                        debut: debutVal,
                        fin: finVal,
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
  const _renderDsaLigne = (ligne) => { // eslint-disable-line no-unused-vars
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
              <div className="text-body-medium text-red-900 truncate">{ligne.fileName}</div>
              <div className="text-caption text-red-600">{ligne.error}</div>
            </div>
          </div>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-l from-red-50 via-red-50 to-transparent pl-6 pr-1">
            <button onClick={() => openDsaEditPanel({ ...ligne, label: '', type: '', date: '', montant: null })} className="px-2.5 py-1 text-caption bg-red-600 text-white rounded hover:bg-red-700 shadow-sm">Compléter</button>
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
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-blue-600 text-white text-counter font-bold rounded-full flex items-center justify-center">
                {pieceCount}
              </span>
            )}
          </span>
          <div className="absolute left-0 top-full mt-1 w-56 p-2 bg-white border border-zinc-200 rounded-lg shadow-lg opacity-0 invisible group-hover/piece:opacity-100 group-hover/piece:visible transition-all z-50">
            <div className="text-counter text-zinc-400 uppercase tracking-wide mb-1.5">{pieceCount} document{pieceCount > 1 ? 's' : ''} lié{pieceCount > 1 ? 's' : ''}</div>
            <div className="space-y-1">
              {ligne.pieceIds?.map(pid => {
                const piece = getPiece(pid);
                return (
                  <div key={pid} className="flex items-center gap-2 text-caption">
                    <span className="w-5 h-5 bg-blue-100 text-blue-700 text-counter rounded flex items-center justify-center flex-shrink-0">{getPieceLabel(pid)}</span>
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
            <div className="text-body-medium text-zinc-800 truncate">{ligne.label || 'Sans libellé'}</div>
            <div className="text-caption text-zinc-400">{ligne.date || '—'} • {ligne.type || '—'}</div>
          </div>
        </div>

        {/* Montant - PRIORITAIRE */}
        <span className="text-body-medium font-semibold text-zinc-900 tabular-nums min-w-[90px] text-right flex-shrink-0">
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
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-blue-600 text-white text-counter font-bold rounded-full flex items-center justify-center">
                {pieceCount}
              </span>
            )}
          </span>
          <div className="absolute left-0 top-full mt-1 w-56 p-2 bg-white border border-zinc-200 rounded-lg shadow-lg opacity-0 invisible group-hover/piece:opacity-100 group-hover/piece:visible transition-all z-50">
            <div className="text-counter text-zinc-400 uppercase tracking-wide mb-1.5">{pieceCount} document{pieceCount > 1 ? 's' : ''} lié{pieceCount > 1 ? 's' : ''}</div>
            <div className="space-y-1">
              {ligne.pieceIds?.map(pid => {
                const piece = getPiece(pid);
                return (
                  <div key={pid} className="flex items-center gap-2 text-caption">
                    <span className="w-5 h-5 bg-blue-100 text-blue-700 text-counter rounded flex items-center justify-center flex-shrink-0">{getPieceLabel(pid)}</span>
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
            <div className="text-body-medium text-zinc-800 truncate">{ligne.label || 'Sans libellé'}</div>
            <div className="text-caption text-zinc-400">{getSecondaryText() || '—'}</div>
          </div>
        </div>

        {/* Montant - PRIORITAIRE */}
        <span className="text-body-medium font-semibold text-zinc-900 tabular-nums min-w-[90px] text-right flex-shrink-0">
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
      if (currentLevel.activeTab === 'info dossier') {
        // Drop-First Info Dossier (new layout with streaming)
        if (dropFirstPieces.length > 0) {
          const streaming = infoDossierStreaming;
          const isStreaming = streaming?.active;
          const revealed = streaming?.fieldsRevealed || [];
          const streamingField = streaming?.streamingField;
          const streamingText = streaming?.streamingText || '';

          const isRevealed = (key) => revealed.includes(key);
          const isCurrentlyStreaming = (key) => streamingField === key;

          const fieldClass = (key) => {
            if (isCurrentlyStreaming(key)) return 'animate-field-glow pl-3 transition-all duration-300';
            if (isRevealed(key)) return 'border-l-3 border-purple-300/40 pl-3 transition-all duration-500';
            return '';
          };

          const rapportPiece = dropFirstPieces.find(p => p.isRapport);
          const rapportName = rapportPiece?.cleanName || rapportPiece?.originalName || 'Rapport d\'expertise';

          const renderField = (key, label, value, isLongText = false) => {
            const hasValue = isRevealed(key) && value;
            const isActive = isCurrentlyStreaming(key);
            return (
              <div className={fieldClass(key)} key={key}>
                <div className="text-caption-medium text-[#78716c] mb-1 flex items-center gap-1">
                  {label}
                  {isRevealed(key) && (
                    <span className="relative group">
                      <Sparkles className="w-2.5 h-2.5 text-purple-500 cursor-help" fill="currentColor" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-20 pointer-events-none">
                        <div className="bg-zinc-800 text-white rounded-lg px-3 py-2 shadow-lg w-[220px]">
                          <p className="text-caption text-zinc-400 mb-1">Extrait depuis</p>
                          <div className="flex items-center gap-2">
                            <FileText className="w-3.5 h-3.5 text-purple-300 flex-shrink-0" />
                            <span className="text-caption-medium text-white truncate">{rapportName}</span>
                          </div>
                        </div>
                        <div className="w-2 h-2 bg-zinc-800 rotate-45 mx-auto -mt-1"></div>
                      </div>
                    </span>
                  )}
                </div>
                <div className={`text-body ${hasValue || isActive ? 'text-[#292524]' : 'text-zinc-300'} ${isLongText ? 'leading-relaxed' : ''}`}>
                  {isActive ? (
                    <span>{streamingText}<span className="inline-block w-0.5 h-4 bg-purple-500 animate-pulse ml-0.5 align-middle"></span></span>
                  ) : hasValue ? (
                    value
                  ) : (
                    <span className="italic">Non renseigné</span>
                  )}
                </div>
              </div>
            );
          };

          // Track B: CTA banner (no rapport, not dismissed)
          const showRapportCTA = !dropFirstHasRapport && !rapportBannerDismissed && !isStreaming;

          const handleAddRapportLater = (files) => {
            const fileList = Array.from(files);
            if (fileList.length === 0) return;
            setRapportBannerDismissed(true);
            setDropFirstHasRapport(true);
            // Add to pieces table
            const poolEntry = DROP_FIRST_DOCUMENT_POOL[0]; // Expertise entry
            const newItem = {
              id: `dfp-rapport-${Date.now()}`, originalName: fileList[0].name,
              cleanName: null, type: null, date: null, postesLies: [], summary: null,
              extractedInfo: null, pages: null, status: 'pending', poolRef: poolEntry,
              sourceFile: null, pageRange: null, siblings: null,
              fakeSize: (Math.random() * 4 + 0.5).toFixed(1) + ' Mo', isRapport: true,
            };
            setDropFirstPieces(prev => [...prev, newItem]);
            setDropFirstProcessingDone(false);
            setTimeout(() => startProcessingSimulation([newItem], false), 300);
            // Start streaming
            setTimeout(() => startInfoDossierStreaming(), 1500);
          };

          return (
            <div className="space-y-4">
              {/* Track B: Add rapport CTA */}
              {showRapportCTA && (
                <div className="banner banner-minimal banner-ai">
                  <div className="banner-body">
                    <Sparkles className="w-4 h-4 banner-icon flex-shrink-0" fill="currentColor" />
                    <p className="banner-title">Pour remplir automatiquement les informations du dossier, <span className="underline cursor-pointer" onClick={() => document.getElementById('rapport-later-input')?.click()}>ajoutez un rapport d'expertise</span>. <span className="banner-btn-ghost cursor-pointer" onClick={() => setRapportBannerDismissed(true)}>Ignorer</span></p>
                    <input id="rapport-later-input" type="file" accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" className="hidden" onChange={e => handleAddRapportLater(e.target.files)} />
                  </div>
                </div>
              )}

              {/* Streaming in-progress banner */}
              {isStreaming && (
                <div className="banner banner-minimal banner-ai">
                  <div className="banner-body">
                    <Loader2 className="w-4 h-4 banner-icon animate-spin" />
                    <span className="banner-title">Extraction en cours depuis le rapport d'expertise...</span>
                  </div>
                </div>
              )}

              {/* Section: Victime */}
              <div className="bg-white rounded-[5px] border border-[#e7e5e3] shadow-sm overflow-hidden">
                <div className="flex items-center gap-2.5 px-3 py-3.5 border-b border-[#e7e5e3] bg-white">
                  <User className="w-4 h-4 text-[#78716c]" strokeWidth={1.5} />
                  <span className="text-[11px] font-medium text-[#78716c] uppercase tracking-wider" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>Victime</span>
                </div>
                <div className="flex border-b border-[#e7e5e3]">
                  <div className="flex-1 px-5 py-4 space-y-1">
                    {renderField('nom', 'Nom', victimeData.nom)}
                  </div>
                  <div className="flex-1 px-5 py-4 space-y-1">
                    {renderField('prenom', 'Prénom', victimeData.prenom)}
                  </div>
                </div>
                <div className="flex border-b border-[#e7e5e3]">
                  <div className="flex-1 px-5 py-4 space-y-1">
                    {renderField('sexe', 'Sexe', victimeData.sexe)}
                  </div>
                  <div className="flex-1 px-5 py-4 space-y-1">
                    <div className={fieldClass('dateNaissance')}>
                      <div className="text-caption-medium text-[#78716c] mb-0.5 flex items-center gap-1">
                        Date de naissance
                        {isRevealed('dateNaissance') && (
                          <span className="relative group">
                            <Sparkles className="w-2.5 h-2.5 text-purple-500 cursor-help" fill="currentColor" />
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-20 pointer-events-none">
                              <div className="bg-zinc-800 text-white rounded-lg px-3 py-2 shadow-lg w-[220px]">
                                <p className="text-caption text-zinc-400 mb-1">Extrait depuis</p>
                                <div className="flex items-center gap-2">
                                  <FileText className="w-3.5 h-3.5 text-purple-300 flex-shrink-0" />
                                  <span className="text-caption-medium text-white truncate">{rapportName}</span>
                                </div>
                              </div>
                              <div className="w-2 h-2 bg-zinc-800 rotate-45 mx-auto -mt-1"></div>
                            </div>
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-body ${isRevealed('dateNaissance') && victimeData.dateNaissance ? 'text-[#292524]' : 'text-zinc-300 italic'}`}>
                          {isCurrentlyStreaming('dateNaissance') ? (
                            <span>{streamingText}<span className="inline-block w-0.5 h-4 bg-purple-500 animate-pulse ml-0.5 align-middle"></span></span>
                          ) : isRevealed('dateNaissance') && victimeData.dateNaissance ? victimeData.dateNaissance : 'Non renseigné'}
                        </span>
                        {isRevealed('dateNaissance') && victimeData.dateNaissance && calcAge(victimeData.dateNaissance) && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-[#d9d9d9]"></span>
                            <span className="text-body text-[#78716c]">{calcAge(victimeData.dateNaissance)} ans</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section: Fait générateur */}
              <div className="bg-white rounded-[5px] border border-[#e7e5e3] shadow-sm overflow-hidden">
                <div className="flex items-center gap-2.5 px-3 py-3.5 border-b border-[#e7e5e3] bg-white">
                  <AlertTriangle className="w-4 h-4 text-[#78716c]" strokeWidth={1.5} />
                  <span className="text-[11px] font-medium text-[#78716c] uppercase tracking-wider" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>Fait générateur</span>
                </div>
                <div className="flex border-b border-[#e7e5e3]">
                  <div className="flex-1 px-5 py-4 space-y-1">
                    {renderField('typeFait', 'Type', faitGenerateur.type)}
                  </div>
                  <div className="flex-1 px-5 py-4 space-y-1">
                    {renderField('dateAccident', 'Date du fait générateur', faitGenerateur.dateAccident)}
                  </div>
                </div>
                <div className="flex border-b border-[#e7e5e3]">
                  <div className="flex-1 px-5 py-4 space-y-1">
                    {renderField('premiereConstatation', 'Date du fait générateur', faitGenerateur.datePremiereConstatation || faitGenerateur.dateAccident)}
                  </div>
                  <div className="flex-1 px-5 py-4 space-y-1">
                    {renderField('dateConsolidation', 'Consolidation', faitGenerateur.dateConsolidation)}
                  </div>
                </div>
                <div className="px-5 py-4 space-y-1">
                  {renderField('resume', 'Résumé des faits', faitGenerateur.resume || resumeAffaire, true)}
                </div>
              </div>

              {/* Section: Faits et procédure */}
              <div className="bg-white rounded-[5px] border border-[#e7e5e3] shadow-sm overflow-hidden">
                <div className="flex items-center gap-2.5 px-3 py-3.5 border-b border-[#e7e5e3] bg-white">
                  <Activity className="w-4 h-4 text-[#78716c]" strokeWidth={1.5} />
                  <span className="text-[11px] font-medium text-[#78716c] uppercase tracking-wider" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>Faits et procédure</span>
                </div>
                <div className="px-5 py-4 min-h-[92px]">
                  {renderField('commentaire', 'Commentaire d\'expertise', commentaireExpertise, true)}
                </div>
              </div>

            </div>
          );
        }

        // Legacy Info Dossier (existing form-based layout)
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
                    <span className="text-body-medium">Informations victime</span>
                  </div>
                  <button onClick={() => setEditPanel({ type: 'victime', title: 'Informations victime' })} className="p-1 text-zinc-300 hover:text-zinc-500 hover:bg-zinc-100 rounded transition-colors"><Edit3 className="w-3.5 h-3.5" strokeWidth={1.5} /></button>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                    <div>
                      <div className="text-caption text-zinc-400 mb-0.5">Nom</div>
                      <div className="text-body text-zinc-700">{victimeData.nom}</div>
                    </div>
                    <div>
                      <div className="text-caption text-zinc-400 mb-0.5">Prénom</div>
                      <div className="text-body text-zinc-700">{victimeData.prenom}</div>
                    </div>
                    <div>
                      <div className="text-caption text-zinc-400 mb-0.5">Sexe</div>
                      <div className="text-body text-zinc-700">{victimeData.sexe}</div>
                    </div>
                    <div>
                      <div className="text-caption text-zinc-400 mb-0.5">Date de naissance</div>
                      <div className="text-body text-zinc-700">{victimeData.dateNaissance} <span className="text-zinc-400">({calcAge(victimeData.dateNaissance)} ans)</span></div>
                    </div>
                    {victimeData.dateDeces && (
                      <div>
                        <div className="text-caption text-zinc-400 mb-0.5">Date de décès</div>
                        <div className="text-body text-zinc-700">{victimeData.dateDeces} <span className="text-zinc-400">({calcAge(victimeData.dateNaissance, victimeData.dateDeces)} ans)</span></div>
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
                    <span className="text-body-medium">Fait générateur</span>
                  </div>
                  <button onClick={() => setEditPanel({ type: 'fait-generateur', title: 'Fait générateur' })} className="p-1 text-zinc-300 hover:text-zinc-500 hover:bg-zinc-100 rounded transition-colors"><Edit3 className="w-3.5 h-3.5" strokeWidth={1.5} /></button>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3 mb-4">
                    <div>
                      <div className="text-caption text-zinc-400 mb-0.5">Type</div>
                      <div className="text-body text-zinc-700">{faitGenerateur.type}</div>
                    </div>
                    <div>
                      <div className="text-caption text-zinc-400 mb-0.5">Date de l'accident</div>
                      <div className="text-body text-zinc-700">{faitGenerateur.dateAccident}</div>
                    </div>
                    <div>
                      <div className="text-caption text-zinc-400 mb-0.5">Première constatation</div>
                      <div className="text-body text-zinc-700">{faitGenerateur.datePremiereConstatation}</div>
                    </div>
                    <div>
                      <div className="text-caption text-zinc-400 mb-0.5">Consolidation</div>
                      <div className="text-body text-zinc-700">{faitGenerateur.dateConsolidation}</div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="text-caption text-zinc-400">Résumé des faits</div>
                      {!faitGenerateur.resume && (
                        <button
                          onClick={handleGenerateResume}
                          disabled={aiGenerating === 'resume'}
                          className="flex items-center gap-1 text-caption-medium text-violet-500 hover:text-violet-700 transition-colors disabled:opacity-50"
                        >
                          {aiGenerating === 'resume' ? (
                            <><Loader2 className="w-3 h-3 animate-spin" strokeWidth={2} />Génération...</>
                          ) : (
                            <><Sparkles className="w-3 h-3" strokeWidth={2} />Générer avec l'IA</>
                          )}
                        </button>
                      )}
                    </div>
                    <div className="text-body text-zinc-600 leading-relaxed">
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
                    <span className="text-body-medium">Commentaire d'expertise</span>
                  </div>
                  <button onClick={() => setEditPanel({ type: 'dossier-expertise', title: "Commentaire d'expertise" })} className="p-1 text-zinc-300 hover:text-zinc-500 hover:bg-zinc-100 rounded transition-colors"><Edit3 className="w-3.5 h-3.5" strokeWidth={1.5} /></button>
                </div>
                <div className="p-4">
                  <div className="text-body text-zinc-600 leading-relaxed">
                    {commentaireExpertise || <span className="text-zinc-300 italic">Aucun commentaire d'expertise renseigné.</span>}
                  </div>
                  {!commentaireExpertise && (
                    <button
                      onClick={handleGenerateExpertise}
                      disabled={aiGenerating === 'expertise'}
                      className="mt-3 flex items-center gap-1.5 text-caption-medium text-violet-500 hover:text-violet-700 transition-colors disabled:opacity-50"
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
                    <span className="text-body-medium">Victimes indirectes</span>
                  </div>
                  <button
                    onClick={() => setEditPanel({ type: 'victime-indirecte', title: 'Nouvelle victime indirecte', data: null })}
                    className="flex items-center gap-1 px-2 py-1 text-caption text-zinc-500 hover:bg-zinc-100 rounded transition-colors"
                  >
                    <Plus className="w-3 h-3" strokeWidth={1.5} />Ajouter
                  </button>
                </div>
                {victimesIndirectes.length > 0 ? (
                  <div className="divide-y divide-zinc-100">
                    {victimesIndirectes.map(vi => (
                      <div key={vi.id} className="flex items-center justify-between p-3 hover:bg-zinc-50 group transition-colors">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-caption text-zinc-500 font-medium">
                            {vi.prenom[0]}{vi.nom[0]}
                          </div>
                          <div>
                            <div className="text-body text-zinc-700">{vi.prenom} {vi.nom}</div>
                            <div className="text-caption text-zinc-400">{vi.lien} • {calcAge(vi.dateNaissance)} ans</div>
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
                    <div className="text-body text-zinc-400">Aucune victime indirecte</div>
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
                    <span className="text-body-medium">Chiffrage</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('Chiffrage')}
                    className="flex items-center gap-1 text-caption text-zinc-400 hover:text-zinc-600 transition-colors"
                  >
                    Voir le détail
                    <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </div>
                <div className="p-5">
                  <div className="text-center">
                    <div className="text-[36px] font-semibold text-zinc-800 tabular-nums leading-none">{fmt(totalChiffrage)}</div>
                    <div className="text-body text-zinc-400 mt-1.5">{allPostes.filter(p => !p.disabled).length} postes de préjudice chiffrés</div>
                    <button
                      onClick={() => setActiveTab('Chiffrage')}
                      className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-800 text-white text-body-medium rounded-lg hover:bg-zinc-700 transition-colors"
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
              <h2 className="text-heading-md text-zinc-800 mb-1 tracking-tight">
                {extractionPhases[currentPhaseIndex]?.label || 'Analyse'} en cours...
              </h2>
              <p className="text-body text-zinc-500 mb-8">L'IA analyse vos documents</p>
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
              <p className="text-caption text-zinc-400 mt-3">{extractionState.progress}%</p>
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
                <p className="text-body text-zinc-500 mb-6">Sélectionnez un poste dans le menu latéral pour commencer le chiffrage.</p>
              </div>
            </div>
          );
        }

        const pgpaAiCount = pgpaData.revenuRef.lignes.filter(l => l.status === 'ai-suggested').length +
          pgpaData.revenusPercus.filter(l => l.status === 'ai-suggested').length +
          pgpaData.ijPercues.filter(l => l.status === 'ai-suggested').length;

        const _hasAiSuggestions = // eslint-disable-line no-unused-vars
          dsaLignes.some(l => l.status === 'ai-suggested') ||
          dftLignes.some(l => l.status === 'ai-suggested') ||
          pgpaAiCount > 0;

        const _aiSuggestedCount = // eslint-disable-line no-unused-vars
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
                    <span className="text-caption text-zinc-400">{cat.title}</span>
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
                      const _isAiPoste = status === 'suggested' || status === 'in_progress'; // eslint-disable-line no-unused-vars
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
                                <span className="text-body-medium w-12 text-zinc-400">{p.title}</span>
                                <span className="text-body text-zinc-700">{p.fullTitle}</span>
                                {aiReasoning && (
                                  <span className="relative cursor-help">
                                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                                    <span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 w-64 p-2.5 bg-zinc-900 text-white text-caption rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-30 pointer-events-none">
                                      <span className="flex items-start gap-2">
                                        <Sparkles className="w-3 h-3 text-indigo-400 flex-shrink-0 mt-0.5" />
                                        <span className="text-zinc-300 leading-relaxed">{aiReasoning}</span>
                                      </span>
                                      <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-zinc-900" />
                                    </span>
                                  </span>
                                )}
                                <span className="text-counter text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded-full">Bientôt</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-body-medium font-semibold text-zinc-900 tabular-nums">{fmt(p.montant)}</span>
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
                              <span className="text-body-medium w-12 text-zinc-400">{p.title}</span>
                              <span className="text-body text-zinc-700">{p.fullTitle}</span>
                              {status !== 'validated' && aiReasoning && (
                                <span className="relative cursor-help">
                                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                                  <span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 w-64 p-2.5 bg-zinc-900 text-white text-caption rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-30 pointer-events-none">
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
                              <span className="text-body-medium font-semibold text-zinc-900 tabular-nums">{fmt(p.montant)}</span>
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
                    <div className="text-body-medium text-zinc-700">Total du chiffrage</div>
                    <div className="text-caption text-zinc-400">{allPostes.filter(p => !p.disabled).length} postes · {categories.filter(c => c.postes.length > 0).length} catégories</div>
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
                    <h2 className="text-body-medium font-semibold">Paramètres du chiffrage</h2>
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
                        <div className="flex items-center justify-between text-caption text-gray-500">
                          <span>0</span><span>1/4</span><span>1/3</span><span>1/2</span><span>2/3</span><span>3/4</span><span>1</span>
                        </div>
                        <div className="flex justify-end"><div className="px-3 py-1.5 border rounded-lg text-body-medium">{chiffrageParams.fractionIndemnisable} %</div></div>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4">Tiers payeurs</h3>
                      <div className="space-y-2">
                        {chiffrageParams.tiersPayeurs.map((tiers, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <label className="text-caption text-gray-500 w-12">Nom *</label>
                            <input type="text" value={tiers} onChange={(e) => { const newTiers = [...chiffrageParams.tiersPayeurs]; newTiers[idx] = e.target.value; setChiffrageParams(prev => ({ ...prev, tiersPayeurs: newTiers })); }} className="flex-1 px-3 py-2 border rounded-lg text-body" />
                            <button onClick={() => { const newTiers = chiffrageParams.tiersPayeurs.filter((_, i) => i !== idx); setChiffrageParams(prev => ({ ...prev, tiersPayeurs: newTiers })); }} className="p-2 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        ))}
                        <button onClick={() => setChiffrageParams(prev => ({ ...prev, tiersPayeurs: [...prev.tiersPayeurs, ''] }))} className="text-body text-blue-600 hover:text-blue-700 font-medium">+ Ajouter un tiers payeur</button>
                      </div>
                    </div>
                  </div>
                  <div className="px-5 py-3 border-t flex justify-end gap-2">
                    <button onClick={() => setShowChiffrageParams(false)} className="px-4 py-2 text-body text-gray-600 hover:bg-gray-100 rounded-lg">Fermer</button>
                    <button onClick={() => setShowChiffrageParams(false)} className="px-4 py-2 text-body-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg">Enregistrer</button>
                  </div>
                </div>
              </div>
            )}
          </>
        );
      }
      if (currentLevel.activeTab === 'pièces') {
        if (dropFirstPieces.length > 0) return renderDropFirstPiecesTab();
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
      // Calculs DSA
      const totalMontant = dsaLignes.filter(l => l.status === 'validated').reduce((s, l) => s + (l.montant || 0), 0);
      const totalRembourse = dsaLignes.filter(l => l.status === 'validated').reduce((s, l) => s + (l.dejaRembourse || 0), 0);
      const totalResteACharge = totalMontant - totalRembourse;
      const indemniteVictime = totalResteACharge;
      
      return (
        <div className={`space-y-4 pb-32 ${dsaLignes.length === 0 && processing.length === 0 && !(posteExtracting && posteExtracting.posteType === 'dsa') ? 'h-full flex flex-col' : ''}`}>
          {/* Empty state DSA */}
          {dsaLignes.length === 0 && processing.length === 0 && !(posteExtracting && posteExtracting.posteType === 'dsa') && renderInlineDocPicker('dsa', {
            icon: Receipt,
            title: 'Ajoutez vos justificatifs pour créer vos lignes de dépenses',
            description: 'Déposez un ou plusieurs documents. Plato lit, extrait et structure les informations pour chaque ligne.',
            expectedDocs: ['Factures médicales', 'Ordonnances', 'Justificatifs de pharmacie', 'Facture hospitalisation']
          })}

          {/* Table des dépenses avec zone d'ajout intégrée */}
          {(dsaLignes.length > 0 || processing.length > 0 || (posteExtracting && posteExtracting.posteType === 'dsa')) && (
          <div className="bg-white rounded-xl border border-[#e7e5e3] overflow-hidden shadow-[0_1px_2px_0_rgba(26,26,26,0.05)]">
            {/* Header — dashed drop zone + buttons */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleUploadFiles(e.dataTransfer.files, 'dsa'); }}
              className="flex items-center gap-4 p-4 border-b border-[#e7e5e3] bg-white"
            >
              <div className={`flex-1 flex items-center gap-2 px-2.5 py-1.5 h-9 border border-dashed rounded-lg transition-colors ${isDragging ? 'border-[#a8a29e] bg-[#f5f5f4]' : 'border-[#d6d3d1]'}`}>
                {isDragging ? (
                  <><ArrowDown className="w-4 h-4 text-[#78716c] flex-shrink-0" /><span className="text-body text-[#44403c]">Déposez vos documents ici</span></>
                ) : (
                  <><Upload className="w-4 h-4 text-[#78716c] flex-shrink-0" /><span className="text-body text-[#78716c]">Déposez ou <span className="text-body-medium text-[#1e3a8a] cursor-pointer" onClick={() => document.getElementById('dsa-header-upload')?.click()}>cliquez</span> pour ajouter un justificatif</span></>
                )}
                <input type="file" id="dsa-header-upload" multiple accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => { if (e.target.files?.length) { handleUploadFiles(e.target.files, 'dsa'); e.target.value = ''; } }} />
              </div>
              {dropFirstPieces.filter(p => p.status === 'done').length > 0 && (
                <button onClick={() => setPickerOpen('dsa')} className="flex items-center gap-2 px-4 h-9 bg-[#eeece6] text-[#44403c] text-body-medium rounded-lg hover:bg-[#e7e5e3] transition-colors flex-shrink-0">
                  Extraire depuis un doc. existant
                  <ChevronDown className="w-4 h-4" />
                </button>
              )}
              <button onClick={() => handleAddManual('dsa')} className="flex items-center gap-2 text-body-medium text-[#1e3a8a] flex-shrink-0 whitespace-nowrap">
                <Plus className="w-4 h-4" /> Ajouter une dépense
              </button>
            </div>

            {/* Extraction progress row */}
            {posteExtracting && posteExtracting.posteType === 'dsa' && (
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#e7e5e3]" style={{ background: 'linear-gradient(to right, #f8f7f5, white 15%)' }}>
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-[#292524] animate-spin" />
                  <div className="flex items-baseline gap-2">
                    <span className="text-body-medium text-[#292524]">{posteExtracting.totalDocs} document{posteExtracting.totalDocs > 1 ? 's' : ''}</span>
                    <span className="text-caption text-[#78716c]">Extraction en cours…</span>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-[70px] h-1 bg-[#eeece6] rounded-full overflow-hidden">
                    <div className="h-full bg-[#292524] rounded-full transition-all duration-500" style={{ width: `${(posteExtracting.extractedCount / posteExtracting.totalDocs) * 100}%` }} />
                  </div>
                  <span className="text-counter text-[#78716c]">{posteExtracting.extractedCount}/{posteExtracting.totalDocs}</span>
                </div>
              </div>
            )}

            {/* Header table */}
            {allLignes.length > 0 && (
              <>
                <div className="flex items-center h-10 border-b border-[#e7e5e3] bg-white">
                  <div className="w-12 flex-shrink-0"></div>
                  <div className="w-[52px] text-center text-caption-medium text-[#78716c] flex-shrink-0">Doc</div>
                  <div className="flex-1 min-w-0 px-3 text-caption-medium text-[#78716c]">Libellé</div>
                  <div className="flex-1 min-w-0 px-3 text-caption-medium text-[#78716c] text-right">Date</div>
                  <div className="w-[254px] px-3 text-caption-medium text-[#78716c] text-right flex-shrink-0">Montant</div>
                  <div className="flex-1 min-w-0 px-2 text-caption-medium text-[#78716c] text-right">Reste à charge</div>
                  <div className="w-11 flex-shrink-0"></div>
                </div>

                {/* Lignes */}
                {allLignes.map(l => {
                  const isSuggested = l.status === 'ai-suggested' || l.status === 'suggested';
                  const isIncomplete = !l.montant || !l.label || !l.date;
                  const pieceCount = l.pieceIds?.length || 0;

                  return (
                    <div
                      key={l.id}
                      onClick={() => openDsaEditPanel(l)}
                      className="relative flex items-center h-14 border-b border-[#e7e5e3] bg-white group cursor-pointer hover:bg-[#fafaf9] transition-colors"
                    >
                      {/* Left inset border */}
                      {isSuggested && <div className="absolute inset-0 pointer-events-none rounded-[inherit]" style={{ boxShadow: isIncomplete ? 'inset 2px 0 0 0 #eeb97e' : 'inset 2px 0 0 0 #9333ea' }} />}

                      {/* Status icon */}
                      <div className="w-12 flex items-center justify-center flex-shrink-0">
                        {isSuggested && (
                          isIncomplete ? (
                            <div className="w-5 h-5 rounded-full bg-[#f9ecd6] flex items-center justify-center">
                              <AlertCircle className="w-3 h-3 text-[#d97706]" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-[#f3e8ff] flex items-center justify-center">
                              <Sparkles className="w-3 h-3 text-[#9333ea]" />
                            </div>
                          )
                        )}
                      </div>

                      {/* Doc indicator */}
                      <div className="w-[52px] flex items-center justify-center flex-shrink-0">
                        {pieceCount > 0 ? (
                          <div className="relative group/piece">
                            <span className="inline-flex items-center justify-center w-7 h-7 bg-[#dbeafe] rounded-md relative">
                              <FileText className="w-4 h-4 text-[#2563eb]" />
                              <span className="absolute -top-1.5 left-[18px] min-w-[16px] h-4 bg-[#2563eb] text-white text-counter font-medium rounded-full flex items-center justify-center border-2 border-white px-0.5">{pieceCount}</span>
                            </span>
                            <div className="absolute left-0 top-full mt-1 w-56 p-2 bg-white border border-[#e7e5e3] rounded-lg shadow-lg opacity-0 invisible group-hover/piece:opacity-100 group-hover/piece:visible transition-all z-50">
                              <div className="text-counter text-[#78716c] uppercase tracking-wide mb-1.5">{pieceCount} document{pieceCount > 1 ? 's' : ''} lié{pieceCount > 1 ? 's' : ''}</div>
                              <div className="space-y-1">
                                {l.pieceIds?.map(pid => {
                                  const piece = getPiece(pid);
                                  return <div key={pid} className="flex items-center gap-2 text-caption"><span className="w-5 h-5 bg-blue-100 text-blue-700 text-counter rounded flex items-center justify-center flex-shrink-0">{getPieceLabel(pid)}</span><span className="truncate text-[#292524]">{piece?.intitule || piece?.nom || 'Document'}</span></div>;
                                })}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center justify-center w-7 h-7 bg-zinc-50 text-zinc-300 rounded-md border border-dashed border-zinc-200">
                            <FileText className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>

                      {/* Libellé */}
                      <div className="flex-1 min-w-0 px-3">
                        <span className="text-body-medium text-[#292524] truncate block">{l.label || 'Sans libellé'}</span>
                      </div>

                      {/* Date */}
                      <div className="flex-1 min-w-0 px-3 text-right">
                        <span className="text-body text-[#78716c]">{l.date || '—'}</span>
                      </div>

                      {/* Montant */}
                      <div className="w-[254px] px-3 text-right flex-shrink-0">
                        {l.montant != null ? (
                          <span className="text-body text-[#44403c]">{fmt(l.montant)}</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#f9ecd6] rounded-md text-caption-medium text-[#855b31]">
                            <AlertCircle className="w-3 h-3" /> Compléter
                          </span>
                        )}
                      </div>

                      {/* Reste à charge */}
                      <div className="flex-1 min-w-0 px-2 text-right">
                        {l.montant != null ? (
                          <span className="text-body-medium text-[#292524]">{fmt((l.montant || 0) - (l.dejaRembourse || 0))}</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#f9ecd6] rounded-md text-caption-medium text-[#855b31]">
                            <AlertCircle className="w-3 h-3" /> Compléter
                          </span>
                        )}
                      </div>

                      {/* Options menu */}
                      <div className="w-11 flex items-center justify-center flex-shrink-0">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleRejectLigne(l.id); }}
                          className="p-1 text-[#78716c] hover:text-[#292524] opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
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
                <span className="text-body-medium">Récapitulatif</span>
              </div>
              
              {/* Ticket aligné à droite */}
              <div className="text-right min-w-[240px]">
                {/* Lignes intermédiaires - discrètes, espacées */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-body text-gray-500">
                    <span>Total des dépenses</span>
                    <span className="tabular-nums font-medium ml-8">{fmt(totalMontant)}</span>
                  </div>
                  {totalRembourse > 0 && (
                    <div className="flex items-center justify-between text-body text-gray-500">
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
          const totalRevenusAvant = revenus.reduce((s, l) => s + (l.montant || 0), 0);
          const totalGains = gains.reduce((s, l) => s + l.revalorise, 0);
          const totalGainsAvant = gains.reduce((s, l) => s + (l.montant || 0), 0);
          const moyenneAnnuelle = totalRevenus + totalGains;
          
          return (
            <div className="space-y-4 pb-32">
              {/* Empty state revenus de référence */}
              {pgpaData.revenuRef.lignes.length === 0 && renderInlineDocPicker('pgpa-revenu-ref', {
                icon: FileSpreadsheet,
                title: 'Aucun revenu de référence',
                description: 'Ajoutez les justificatifs de revenus ou créez une ligne manuellement.',
                expectedDocs: ['Bulletins de salaire', 'Attestations employeur', "Avis d'imposition", 'Bilans comptables']
              })}

              {/* Table avec zone d'ajout */}
              {pgpaData.revenuRef.lignes.length > 0 && (
              <div className="bg-white rounded-lg border overflow-hidden">
                {/* Zone d'ajout */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleUploadFiles(e.dataTransfer.files, 'pgpa-revenu-ref'); }}
                  className={`flex items-center gap-3 px-4 py-3 border-b transition-colors ${isDragging ? 'bg-[#f5f5f4] border-[#d6d3d1]' : 'bg-gray-50'}`}
                >
                  {isDragging ? (
                    <div className="flex items-center gap-3 flex-1 justify-center py-1">
                      <ArrowDown className="w-5 h-5 text-[#78716c]" />
                      <span className="text-body-medium text-[#44403c]">Déposez vos documents ici</span>
                    </div>
                  ) : (
                    <>
                      <button onClick={() => setPickerOpen('pgpa-revenu-ref')} className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white text-body-medium rounded-lg hover:bg-zinc-800 transition-colors">
                        <Plus className="w-4 h-4" /> Ajouter des documents
                      </button>
                      <button onClick={() => handleAddManual('pgpa-revenu-ref')} className="text-body text-blue-700 hover:text-blue-800 hover:bg-blue-50 px-3 py-2 rounded-lg whitespace-nowrap">
                        Ajouter un revenu
                      </button>
                    </>
                  )}
                </div>

                {/* Section REVENUS */}
                <div className="px-4 py-2 bg-gray-100 border-b">
                  <span className="text-caption-medium font-semibold text-gray-600 uppercase tracking-wide">Revenus professionnels</span>
                </div>
                
                <div className="flex items-center px-4 py-2 border-b text-caption-medium text-gray-500 uppercase tracking-wide">
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
                            {pieceCount > 1 && <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-blue-600 text-white text-counter font-bold rounded-full flex items-center justify-center">{pieceCount}</span>}
                          </span>
                          <div className="absolute left-0 top-full mt-1 w-56 p-2 bg-white border border-zinc-200 rounded-lg shadow-lg opacity-0 invisible group-hover/piece:opacity-100 group-hover/piece:visible transition-all z-50">
                            <div className="text-counter text-zinc-400 uppercase tracking-wide mb-1.5">{pieceCount} document{pieceCount > 1 ? 's' : ''} lié{pieceCount > 1 ? 's' : ''}</div>
                            <div className="space-y-1">
                              {l.pieceIds?.map(pid => {
                                const piece = getPiece(pid);
                                return <div key={pid} className="flex items-center gap-2 text-caption"><span className="w-5 h-5 bg-blue-100 text-blue-700 text-counter rounded flex items-center justify-center flex-shrink-0">{getPieceLabel(pid)}</span><span className="truncate text-zinc-700">{piece?.intitule || piece?.nom || 'Document'}</span></div>;
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
                        <div className="flex-1 min-w-0 pr-4 text-body-medium truncate text-zinc-800">{l.label || 'Sans libellé'}</div>
                        <div className="w-20 text-right text-body text-zinc-500 flex-shrink-0">{l.annee}</div>
                        <div className="w-24 text-right text-body tabular-nums text-zinc-500 flex-shrink-0">{fmt(l.montant)}</div>
                        <div className="w-28 text-right flex-shrink-0">
                          <span className="font-semibold tabular-nums text-zinc-900">{fmt(l.revalorise)}</span>
                        </div>
                      </div>
                    );
                  })}
                  {revenus.length === 0 && (
                    <div className="px-4 py-6 text-center text-gray-500 text-body">Aucun revenu enregistré</div>
                  )}
                </div>

                {/* Sous-total revenus */}
                <div className="px-4 py-2 border-t bg-gray-50 flex justify-between items-center">
                  {pgpaData.revenuRef.revalorisation !== 'aucune' && <span className="text-caption text-zinc-400">Avant revalorisation : {fmt(totalRevenusAvant)}</span>}
                  <span className="text-body text-gray-600 ml-auto">Moyenne annuelle{pgpaData.revenuRef.revalorisation !== 'aucune' ? ' (revalorisée)' : ''} : <span className="font-semibold tabular-nums">{fmt(totalRevenus)}</span></span>
                </div>

                {/* Section GAINS */}
                <div className="px-4 py-2 bg-gray-100 border-t border-b">
                  <span className="text-caption-medium font-semibold text-gray-600 uppercase tracking-wide">Gains supplémentaires (primes, indemnités, etc.)</span>
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
                            {pieceCount > 1 && <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-blue-600 text-white text-counter font-bold rounded-full flex items-center justify-center">{pieceCount}</span>}
                          </span>
                          <div className="absolute left-0 top-full mt-1 w-56 p-2 bg-white border border-zinc-200 rounded-lg shadow-lg opacity-0 invisible group-hover/piece:opacity-100 group-hover/piece:visible transition-all z-50">
                            <div className="text-counter text-zinc-400 uppercase tracking-wide mb-1.5">{pieceCount} document{pieceCount > 1 ? 's' : ''} lié{pieceCount > 1 ? 's' : ''}</div>
                            <div className="space-y-1">
                              {l.pieceIds?.map(pid => {
                                const piece = getPiece(pid);
                                return <div key={pid} className="flex items-center gap-2 text-caption"><span className="w-5 h-5 bg-blue-100 text-blue-700 text-counter rounded flex items-center justify-center flex-shrink-0">{getPieceLabel(pid)}</span><span className="truncate text-zinc-700">{piece?.intitule || piece?.nom || 'Document'}</span></div>;
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
                        <div className="flex-1 min-w-0 pr-4 text-body-medium truncate text-zinc-800">{l.label || 'Sans libellé'}</div>
                        <div className="w-20 text-right text-body text-zinc-500 flex-shrink-0">{l.annee}</div>
                        <div className="w-24 text-right text-body tabular-nums text-zinc-500 flex-shrink-0">{fmt(l.montant)}</div>
                        <div className="w-28 text-right flex-shrink-0">
                          <span className="font-semibold tabular-nums text-zinc-900">{fmt(l.revalorise)}</span>
                        </div>
                      </div>
                    );
                  })}
                  {gains.length === 0 && (
                    <div className="px-4 py-6 text-center text-gray-500 text-body">Aucun gain enregistré</div>
                  )}
                </div>
                
                {/* Sous-total gains */}
                <div className="px-4 py-2 border-t bg-gray-50 flex justify-between items-center">
                  {pgpaData.revenuRef.revalorisation !== 'aucune' && <span className="text-caption text-zinc-400">Avant revalorisation : {fmt(totalGainsAvant)}</span>}
                  <span className="text-body text-gray-600 ml-auto">Indemnité annuelle moyenne{pgpaData.revenuRef.revalorisation !== 'aucune' ? ' (revalorisée)' : ''} : <span className="font-semibold tabular-nums">{fmt(totalGains)}</span></span>
                </div>
              </div>
              )}

              {/* Bandeau ticket */}
              <div className="fixed bottom-0 left-64 right-0 bg-white border-t shadow-[0_-4px_12px_rgba(0,0,0,0.08)] z-30">
                <div className="flex items-start justify-between px-6 py-5">
                  <div className="flex items-center gap-2 text-gray-400 pt-1">
                    <Calculator className="w-5 h-5" />
                    <span className="text-body-medium">Récapitulatif</span>
                  </div>
                  <div className="text-right min-w-[280px]">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-body text-gray-500">
                        <span>Revenus professionnels</span>
                        <span className="tabular-nums font-medium ml-8">{fmt(totalRevenus)}</span>
                      </div>
                      <div className="flex items-center justify-between text-body text-gray-500">
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
              {pgpaData.revenusPercus.length === 0 && renderInlineDocPicker('pgpa-revenu-percu', {
                icon: FileSpreadsheet,
                title: 'Aucun revenu perçu sur la période',
                description: 'Ajoutez les justificatifs de revenus perçus pendant l\'arrêt.',
                expectedDocs: ['Bulletins de salaire (période accident)', 'Relevés de revenus', 'Attestations employeur']
              })}

              {/* Table avec zone d'ajout */}
              {pgpaData.revenusPercus.length > 0 && (
              <div className="bg-white rounded-lg border overflow-hidden">
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleUploadFiles(e.dataTransfer.files, 'pgpa-revenu-percu'); }}
                  className={`flex items-center gap-3 px-4 py-3 border-b transition-colors ${isDragging ? 'bg-[#f5f5f4] border-[#d6d3d1]' : 'bg-gray-50'}`}
                >
                  {isDragging ? (
                    <div className="flex items-center gap-3 flex-1 justify-center py-1">
                      <ArrowDown className="w-5 h-5 text-[#78716c]" />
                      <span className="text-body-medium text-[#44403c]">Déposez vos documents ici</span>
                    </div>
                  ) : (
                    <>
                      <button onClick={() => setPickerOpen('pgpa-revenu-percu')} className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white text-body-medium rounded-lg hover:bg-zinc-800 transition-colors">
                        <Plus className="w-4 h-4" /> Ajouter des documents
                      </button>
                      <button onClick={() => handleAddManual('pgpa-revenu-percu')} className="text-body text-blue-700 hover:text-blue-800 hover:bg-blue-50 px-3 py-2 rounded-lg whitespace-nowrap">
                        Ajouter un revenu
                      </button>
                    </>
                  )}
                </div>

                <div className="flex items-center px-4 py-2 border-b text-caption-medium text-gray-500 uppercase tracking-wide">
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
                            {pieceCount > 1 && <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-blue-600 text-white text-counter font-bold rounded-full flex items-center justify-center">{pieceCount}</span>}
                          </span>
                          <div className="absolute left-0 top-full mt-1 w-56 p-2 bg-white border border-zinc-200 rounded-lg shadow-lg opacity-0 invisible group-hover/piece:opacity-100 group-hover/piece:visible transition-all z-50">
                            <div className="text-counter text-zinc-400 uppercase tracking-wide mb-1.5">{pieceCount} document{pieceCount > 1 ? 's' : ''} lié{pieceCount > 1 ? 's' : ''}</div>
                            <div className="space-y-1">
                              {l.pieceIds?.map(pid => {
                                const piece = getPiece(pid);
                                return <div key={pid} className="flex items-center gap-2 text-caption"><span className="w-5 h-5 bg-blue-100 text-blue-700 text-counter rounded flex items-center justify-center flex-shrink-0">{getPieceLabel(pid)}</span><span className="truncate text-zinc-700">{piece?.intitule || piece?.nom || 'Document'}</span></div>;
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
                          <div className="text-body-medium text-zinc-800 truncate">{l.label || 'Sans libellé'}</div>
                          <div className="text-caption text-zinc-500">{l.tiers}</div>
                        </div>
                        <div className="w-28 text-body text-zinc-500 flex-shrink-0">{l.periode}</div>
                        <div className="w-16 text-right text-body text-zinc-500 tabular-nums flex-shrink-0">{l.dureeJours} j</div>
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
                    <span className="text-body-medium">Récapitulatif</span>
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
              {pgpaData.ijPercues.length === 0 && renderInlineDocPicker('pgpa-ij', {
                icon: Landmark,
                title: 'Aucune indemnité journalière',
                description: 'Ajoutez les décomptes de tiers payeurs ou créez une ligne manuellement.',
                expectedDocs: ['Décomptes IJ Sécurité sociale', 'Décomptes prévoyance', 'Attestations tiers payeur']
              })}

              {/* Table avec zone d'ajout */}
              {pgpaData.ijPercues.length > 0 && (
              <div className="bg-white rounded-lg border overflow-hidden">
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleUploadFiles(e.dataTransfer.files, 'pgpa-ij'); }}
                  className={`flex items-center gap-3 px-4 py-3 border-b transition-colors ${isDragging ? 'bg-[#f5f5f4] border-[#d6d3d1]' : 'bg-gray-50'}`}
                >
                  {isDragging ? (
                    <div className="flex items-center gap-3 flex-1 justify-center py-1">
                      <ArrowDown className="w-5 h-5 text-[#78716c]" />
                      <span className="text-body-medium text-[#44403c]">Déposez vos documents ici</span>
                    </div>
                  ) : (
                    <>
                      <button onClick={() => setPickerOpen('pgpa-ij')} className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white text-body-medium rounded-lg hover:bg-zinc-800 transition-colors">
                        <Plus className="w-4 h-4" /> Ajouter des documents
                      </button>
                      <button onClick={() => handleAddManual('pgpa-ij')} className="text-body text-blue-700 hover:text-blue-800 hover:bg-blue-50 px-3 py-2 rounded-lg whitespace-nowrap">
                        Ajouter des IJ
                      </button>
                    </>
                  )}
                </div>

                <div className="flex items-center px-4 py-2 border-b text-caption-medium text-gray-500 uppercase tracking-wide">
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
                            {pieceCount > 1 && <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-blue-600 text-white text-counter font-bold rounded-full flex items-center justify-center">{pieceCount}</span>}
                          </span>
                          <div className="absolute left-0 top-full mt-1 w-56 p-2 bg-white border border-zinc-200 rounded-lg shadow-lg opacity-0 invisible group-hover/piece:opacity-100 group-hover/piece:visible transition-all z-50">
                            <div className="text-counter text-zinc-400 uppercase tracking-wide mb-1.5">{pieceCount} document{pieceCount > 1 ? 's' : ''} lié{pieceCount > 1 ? 's' : ''}</div>
                            <div className="space-y-1">
                              {l.pieceIds?.map(pid => {
                                const piece = getPiece(pid);
                                return <div key={pid} className="flex items-center gap-2 text-caption"><span className="w-5 h-5 bg-blue-100 text-blue-700 text-counter rounded flex items-center justify-center flex-shrink-0">{getPieceLabel(pid)}</span><span className="truncate text-zinc-700">{piece?.intitule || piece?.nom || 'Document'}</span></div>;
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
                          <div className="text-body-medium text-zinc-800 truncate">{l.tiers || 'Sans tiers'}</div>
                          <div className="text-caption text-zinc-500">{l.label}</div>
                        </div>
                        <div className="w-28 text-body text-zinc-500 flex-shrink-0">{l.periode}</div>
                        <div className="w-14 text-right text-body text-zinc-500 tabular-nums flex-shrink-0">{l.jours}</div>
                        <div className="w-24 text-right text-body text-zinc-500 tabular-nums flex-shrink-0">{fmt(l.montantBrut)}</div>
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
                    <span className="text-body-medium">Récapitulatif</span>
                  </div>
                  <div className="text-right min-w-[240px]">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-body text-gray-500">
                        <span>Total brut</span>
                        <span className="tabular-nums font-medium ml-8">{fmt(pgpaData.ijPercues.reduce((s, l) => s + l.montantBrut, 0))}</span>
                      </div>
                      <div className="flex items-center justify-between text-body text-gray-500">
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
                <span className="text-body-medium">Récapitulatif</span>
              </div>
              
              <div className="text-right min-w-[280px]">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-body text-gray-500">
                    <span>Perte de gains ({pgpaData.periode.mois} mois)</span>
                    <span className="tabular-nums font-medium ml-8">{fmt(perteDeGains)}</span>
                  </div>
                  {ijPercuesTotal > 0 && (
                    <div className="flex items-center justify-between text-caption text-zinc-500">
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
                  <div className="text-body text-gray-500">{periodeCL.periode.debut} → {periodeCL.periode.fin} ({periodeCL.periode.mois} mois)</div>
                </div>
                <span className="text-caption px-2 py-1 rounded bg-blue-100 text-blue-700">Échu</span>
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
                      <span className="text-caption px-2 py-0.5 rounded bg-amber-200 text-amber-800">= {fmt(periodeCL.revenuRef.total)}/an</span>
                    </div>
                    <button className="p-1.5 text-amber-700 hover:bg-amber-100 rounded"><Edit3 className="w-4 h-4" /></button>
                  </div>
                </div>
                
                {/* Revenus perçus */}
                <div className="border-b">
                  <div className="px-4 py-2 bg-gray-50 flex items-center justify-between">
                    <span className="text-body-medium">Revenus perçus sur la période</span>
                    <div className="flex items-center gap-2">
                      <span className="text-body text-red-600">- {fmt(periodeCL.revenusPercus.reduce((s, l) => s + l.montant, 0))}</span>
                      <button className="text-caption text-blue-600 hover:text-blue-700 flex items-center gap-1"><Plus className="w-3 h-3" /></button>
                    </div>
                  </div>
                  <div className="divide-y">
                    {periodeCL.revenusPercus.map(l => renderPGLigne(l, { onEdit: () => {} }))}
                  </div>
                </div>
                
                {/* IJ perçues */}
                <div>
                  <div className="px-4 py-2 bg-gray-50 flex items-center justify-between">
                    <span className="text-body-medium">Indemnités journalières perçues</span>
                    <div className="flex items-center gap-2">
                      <span className="text-body text-red-600">- {fmt(periodeCL.ijPercues.reduce((s, l) => s + l.montant, 0))}</span>
                      <button className="text-caption text-blue-600 hover:text-blue-700 flex items-center gap-1"><Plus className="w-3 h-3" /></button>
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
                  <div className="text-body text-gray-500">{periodeAL.periode.debut} → {periodeAL.periode.fin}</div>
                </div>
                <span className="text-caption px-2 py-1 rounded bg-purple-100 text-purple-700">Capitalisation</span>
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
                  <div className="grid grid-cols-3 gap-4 text-body">
                    <div><span className="text-gray-500">Âge</span><p className="font-medium">{periodeAL.params.age} ans</p></div>
                    <div><span className="text-gray-500">Perte annuelle</span><p className="font-medium">{fmt(periodeAL.params.perteGainAnnuelle)}</p></div>
                    <div><span className="text-gray-500">Barème</span><p className="text-caption-medium">{periodeAL.params.bareme}</p></div>
                    <div><span className="text-gray-500">Âge dernier arrérage</span><p className="font-medium">{periodeAL.params.ageDernierArreage} ans</p></div>
                    <div><span className="text-gray-500">Coefficient</span><p className="font-medium">{periodeAL.params.coefficient}</p></div>
                    <div><span className="text-gray-500">Montant capitalisé</span><p className="font-bold text-purple-700">{fmt(periodeAL.params.montantCapitalise)}</p></div>
                  </div>
                </div>
                
                {/* Tiers payeurs */}
                <div className="border-b">
                  <div className="px-4 py-2 bg-gray-50">
                    <span className="text-body-medium">Tiers payeurs</span>
                  </div>
                  <div className="divide-y">
                    {periodeAL.tiersPayeurs.map(tp => (
                      <div key={tp.id} className="flex items-center justify-between p-3 hover:bg-gray-50 group">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{tp.label}</span>
                          {tp.modified && <RefreshCw className="w-3 h-3 text-amber-500" />}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-body text-gray-500">Rente: {fmt(tp.renteAnnuelle)}/an</span>
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
                        <span className="text-caption px-2 py-1 bg-red-100 text-red-700 rounded flex items-center gap-1">
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
      return (
        <div className={dftLignes.length === 0 && processing.length === 0 && !(posteExtracting && posteExtracting.posteType === 'dft') ? 'h-full flex flex-col' : ''}>
          {/* Empty state */}
          {dftLignes.length === 0 && processing.length === 0 && !(posteExtracting && posteExtracting.posteType === 'dft') && renderInlineDocPicker('dft', {
            icon: Calendar,
            title: 'Ajoutez vos justificatifs pour créer vos lignes de périodes',
            description: 'Déposez un ou plusieurs documents. Plato lit, extrait et structure les informations pour chaque ligne.',
            expectedDocs: ["Rapport d'expertise médicale", "Certificat médical", "Compte-rendu hospitalisation"]
          })}

          {/* Table with header + extraction + rows */}
          {(dftLignes.length > 0 || processing.length > 0 || (posteExtracting && posteExtracting.posteType === 'dft')) && (
            <div className="bg-white rounded-xl border border-[#e7e5e3] overflow-hidden shadow-[0_1px_2px_0_rgba(26,26,26,0.05)]">
              {/* Header — dashed drop zone + buttons */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleUploadFiles(e.dataTransfer.files, 'dft'); }}
                className="flex items-center gap-4 p-4 border-b border-[#e7e5e3] bg-white"
              >
                <div className={`flex-1 flex items-center gap-2 px-2.5 py-1.5 h-9 border border-dashed rounded-lg transition-colors ${isDragging ? 'border-[#a8a29e] bg-[#f5f5f4]' : 'border-[#d6d3d1]'}`}>
                  {isDragging ? (
                    <><ArrowDown className="w-4 h-4 text-[#78716c] flex-shrink-0" /><span className="text-body text-[#44403c]">Déposez vos documents ici</span></>
                  ) : (
                    <><Upload className="w-4 h-4 text-[#78716c] flex-shrink-0" /><span className="text-body text-[#78716c]">Déposez ou <span className="text-body-medium text-[#1e3a8a] cursor-pointer" onClick={() => document.getElementById('dft-header-upload')?.click()}>cliquez</span> pour ajouter un justificatif</span></>
                  )}
                  <input type="file" id="dft-header-upload" multiple accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => { if (e.target.files?.length) { handleUploadFiles(e.target.files, 'dft'); e.target.value = ''; } }} />
                </div>
                {dropFirstPieces.filter(p => p.status === 'done').length > 0 && (
                  <button onClick={() => setPickerOpen('dft')} className="flex items-center gap-2 px-4 h-9 bg-[#eeece6] text-[#44403c] text-body-medium rounded-lg hover:bg-[#e7e5e3] transition-colors flex-shrink-0">
                    Extraire depuis un doc. existant
                    <ChevronDown className="w-4 h-4" />
                  </button>
                )}
                <button onClick={() => handleAddManual('dft')} className="flex items-center gap-2 text-body-medium text-[#1e3a8a] flex-shrink-0 whitespace-nowrap">
                  <Plus className="w-4 h-4" /> Ajouter une période
                </button>
              </div>

              {/* Extraction progress row */}
              {posteExtracting && posteExtracting.posteType === 'dft' && (
                <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#e7e5e3]" style={{ background: 'linear-gradient(to right, #f8f7f5, white 15%)' }}>
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 text-[#292524] animate-spin" />
                    <div className="flex items-baseline gap-2">
                      <span className="text-body-medium text-[#292524]">{posteExtracting.totalDocs} document{posteExtracting.totalDocs > 1 ? 's' : ''}</span>
                      <span className="text-caption text-[#78716c]">Extraction en cours…</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-[70px] h-1 bg-[#eeece6] rounded-full overflow-hidden">
                      <div className="h-full bg-[#292524] rounded-full transition-all duration-500" style={{ width: `${(posteExtracting.extractedCount / posteExtracting.totalDocs) * 100}%` }} />
                    </div>
                    <span className="text-counter text-[#78716c]">{posteExtracting.extractedCount}/{posteExtracting.totalDocs}</span>
                  </div>
                </div>
              )}

              {/* Column headers */}
              {dftLignes.length > 0 && (
                <div className="flex items-center h-10 border-b border-[#e7e5e3] bg-white">
                  <div className="w-12 flex-shrink-0"></div>
                  <div className="w-[52px] text-center text-caption-medium text-[#78716c] flex-shrink-0">Doc</div>
                  <div className="flex-1 min-w-0 px-3 text-caption-medium text-[#78716c]">Période & jours</div>
                  <div className="w-20 px-3 text-caption-medium text-[#78716c] text-center flex-shrink-0">Taux</div>
                  <div className="w-[200px] px-3 text-caption-medium text-[#78716c] text-right flex-shrink-0">Montant</div>
                  <div className="w-11 flex-shrink-0"></div>
                </div>
              )}

              {/* Rows */}
              {dftLignes.map(l => {
                const isSuggested = l.status === 'ai-suggested' || l.status === 'suggested';
                const isIncomplete = !l.montant || !l.label;
                const pieceCount = l.pieceIds?.length || 0;

                return (
                  <div key={l.id} onClick={() => { setEditingPieceIds(l.pieceIds || []); setSearchPiecesPanel(''); setEditPanel({ type: 'dft-ligne', data: l }); }}
                    className="relative flex items-center h-14 border-b border-[#e7e5e3] bg-white group cursor-pointer hover:bg-[#fafaf9] transition-colors">
                    {/* Left inset border */}
                    {isSuggested && <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: isIncomplete ? 'inset 2px 0 0 0 #eeb97e' : 'inset 2px 0 0 0 #9333ea' }} />}

                    {/* Status icon */}
                    <div className="w-12 flex items-center justify-center flex-shrink-0">
                      {isSuggested && (
                        isIncomplete ? (
                          <div className="w-5 h-5 rounded-full bg-[#f9ecd6] flex items-center justify-center">
                            <AlertCircle className="w-3 h-3 text-[#d97706]" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-[#f3e8ff] flex items-center justify-center">
                            <Sparkles className="w-3 h-3 text-[#9333ea]" />
                          </div>
                        )
                      )}
                    </div>

                    {/* Doc indicator */}
                    <div className="w-[52px] flex items-center justify-center flex-shrink-0">
                      {pieceCount > 0 ? (
                        <div className="relative group/piece">
                          <span className="inline-flex items-center justify-center w-7 h-7 bg-[#dbeafe] rounded-md relative">
                            <FileText className="w-4 h-4 text-[#2563eb]" />
                            <span className="absolute -top-1.5 left-[18px] min-w-[16px] h-4 bg-[#2563eb] text-white text-counter font-medium rounded-full flex items-center justify-center border-2 border-white px-0.5">{pieceCount}</span>
                          </span>
                          <div className="absolute left-0 top-full mt-1 w-56 p-2 bg-white border border-[#e7e5e3] rounded-lg shadow-lg opacity-0 invisible group-hover/piece:opacity-100 group-hover/piece:visible transition-all z-50">
                            <div className="text-counter text-[#78716c] uppercase tracking-wide mb-1.5">{pieceCount} document{pieceCount > 1 ? 's' : ''}</div>
                            <div className="space-y-1">
                              {l.pieceIds?.map(pid => <div key={pid} className="flex items-center gap-2 text-caption"><span className="w-5 h-5 bg-blue-100 text-blue-700 text-counter rounded flex items-center justify-center flex-shrink-0">{getPieceLabel(pid)}</span><span className="truncate text-[#292524]">Rapport d'expertise</span></div>)}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="inline-flex items-center justify-center w-7 h-7 bg-zinc-50 text-zinc-300 rounded-md border border-dashed border-zinc-200">
                          <FileText className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>

                    {/* Période & jours */}
                    <div className="flex-1 min-w-0 px-3">
                      <span className="text-body-medium text-[#292524] block">{l.label || 'Sans libellé'}</span>
                      <span className="text-caption text-[#78716c]">{l.debut} → {l.fin} · {l.jours}j</span>
                    </div>

                    {/* Taux */}
                    <div className="w-20 px-3 text-center flex-shrink-0">
                      <span className={`text-caption-medium px-2 py-0.5 rounded-full ${l.taux === 100 ? 'bg-zinc-100 text-zinc-700' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>{l.taux || 100}%</span>
                    </div>

                    {/* Montant */}
                    <div className="w-[200px] px-3 text-right flex-shrink-0">
                      {l.montant != null ? (
                        <span className="text-body-medium text-[#292524] font-semibold tabular-nums">{fmt(l.montant)}</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#f9ecd6] rounded-md text-caption-medium text-[#855b31]">
                          <AlertCircle className="w-3 h-3" /> Compléter
                        </span>
                      )}
                    </div>

                    {/* Options */}
                    <div className="w-11 flex items-center justify-center flex-shrink-0">
                      <button onClick={(e) => { e.stopPropagation(); handleRejectLigne(l.id); }} className="p-1 text-[#78716c] hover:text-[#292524] opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Sticky recap footer */}
          {dftLignes.length > 0 && (
            <div className="fixed bottom-0 left-64 right-0 bg-white border-t shadow-[0_-4px_12px_rgba(0,0,0,0.08)] z-30">
              <div className="flex items-start justify-between px-6 py-5">
                <div className="flex items-center gap-2 text-gray-400 pt-1">
                  <Calculator className="w-5 h-5" />
                  <span className="text-body-medium">Récapitulatif</span>
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
    setNavStack([{ id: dossier.id, type: 'dossier', title: dossier.reference, activeTab: 'info dossier' }]);
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
        label: 'Copier le calcul',
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
            <h2 className="text-heading-sm text-zinc-800">{titre}</h2>
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
                  <p className="text-body-medium text-zinc-800">{opt.label}</p>
                  <p className="text-caption text-zinc-500 mt-0.5 leading-relaxed">{opt.desc}</p>
                </div>
                <span className="absolute left-4 right-4 -bottom-1 translate-y-full p-2.5 bg-zinc-900 text-white text-caption rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-30 pointer-events-none">
                  {opt.tooltip}
                </span>
              </div>
            ))}
          </div>
          <div className="px-6 py-4 border-t bg-zinc-50 rounded-b-xl">
            <p className="text-caption text-zinc-400 text-center">Ces options sont présentées à titre informatif pour recueillir vos retours.</p>
          </div>
        </div>
      </div>
    );
  };

  // ========== DROP FIRST — HANDLERS ==========
  const handleDropFirstCreate = () => {
    if (!dropModal || dropModal.files.length === 0) return;
    const files = [...dropModal.files];
    const hasRapport = !!dropModal.rapportFileId;

    // Save current dossier if any
    if (activeDossierId) saveDossierData(activeDossierId);

    const newId = `dossier-${Date.now()}`;
    const refName = hasRapport ? 'Martin Sophie' : 'Nouveau dossier';

    setDossiers(prev => [{
      id: newId, reference: refName, typeFait: hasRapport ? 'Accident de la voie publique' : '',
      date: new Date().toLocaleDateString('fr-FR'), lastEditBy: 'Meghan R.', lastEditDate: new Date().toLocaleDateString('fr-FR')
    }, ...prev]);

    setVictimeData({ nom: '', prenom: '', sexe: 'Homme', dateNaissance: '', dateDeces: null });
    setFaitGenerateur({ type: '', dateAccident: '', datePremiereConstatation: '', dateConsolidation: '', resume: '' });
    setChiffrageParams(prev => ({ ...EMPTY_DOSSIER.chiffrageParams }));
    setDossierStatut('ouvert');
    setDossierRef('');
    setDossierIntitule(refName);
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

    // Map files to processing items
    const processingItems = files.map((f, i) => {
      const poolEntry = DROP_FIRST_DOCUMENT_POOL[i % DROP_FIRST_DOCUMENT_POOL.length];
      return {
        id: `dfp-${Date.now()}-${i}`,
        originalName: f.name,
        cleanName: null,
        type: null,
        date: null,
        postesLies: [],
        summary: null,
        extractedInfo: null,
        pages: null,
        status: 'pending', // pending → processing → done
        poolRef: poolEntry,
        sourceFile: null,
        pageRange: null,
        siblings: null,
        fakeSize: f.fakeSize,
        isRapport: f.id === dropModal.rapportFileId,
      };
    });

    setDropFirstPieces(processingItems);
    setDropFirstHasRapport(hasRapport);
    setDropFirstProcessingDone(false);
    setPieceOverviewPanel(null);
    setPiecesFilter({ type: null, search: '' });
    setRapportBannerDismissed(false);
    setInfoDossierStreaming(null);

    setNavStack([{ id: newId, type: 'dossier', title: refName, activeTab: 'pièces' }]);
    setActiveDossierId(newId);
    setCurrentPage('dossier');
    setDropModal(null);

    // Start processing simulation after render
    setTimeout(() => startProcessingSimulation(processingItems, hasRapport), 300);
  };

  const startProcessingSimulation = (items, hasRapport) => {
    // Clear any existing timeouts
    processingTimeouts.current.forEach(t => clearTimeout(t));
    processingTimeouts.current = [];

    let cumulativeDelay = 500;
    const processOrder = [...items].sort(() => Math.random() - 0.5); // Random order

    processOrder.forEach((item, idx) => {
      const delay = 1500 + Math.random() * 2500; // 1.5-4s
      cumulativeDelay += delay;

      const tid = setTimeout(() => {
        setDropFirstPieces(prev => {
          const newPieces = [...prev];
          const itemIndex = newPieces.findIndex(p => p.id === item.id);
          if (itemIndex === -1) return prev;

          const poolEntry = newPieces[itemIndex].poolRef;

          if (poolEntry.splits) {
            // Replace single row with multiple split rows
            const splitRows = poolEntry.splits.map((split, si) => ({
              id: `${item.id}-split-${si}`,
              originalName: item.originalName,
              cleanName: `${poolEntry.cleanName.split('—')[0].trim()} — ${split.name}`,
              type: poolEntry.type,
              date: poolEntry.date,
              postesLies: [...poolEntry.postesLies],
              summary: poolEntry.summary,
              extractedInfo: poolEntry.extractedInfo,
              pages: split.pageCount,
              status: 'done',
              poolRef: poolEntry,
              sourceFile: item.originalName,
              pageRange: split.pages,
              splitName: split.name,
              siblings: poolEntry.splits.map((s, j) => ({ name: s.name, pages: s.pages, pageCount: s.pageCount, index: j })),
              splitIndex: si,
              totalSourcePages: poolEntry.pages,
              fakeSize: item.fakeSize,
              isRapport: item.isRapport,
              justCompleted: true,
            }));
            newPieces.splice(itemIndex, 1, ...splitRows);
          } else {
            // Simple completion
            newPieces[itemIndex] = {
              ...newPieces[itemIndex],
              cleanName: poolEntry.cleanName,
              type: poolEntry.type,
              date: poolEntry.date,
              postesLies: [...poolEntry.postesLies],
              summary: poolEntry.summary,
              extractedInfo: poolEntry.extractedInfo,
              pages: poolEntry.pages,
              status: 'done',
              justCompleted: true,
            };
          }
          return newPieces;
        });

        // Clear justCompleted flag after animation
        setTimeout(() => {
          setDropFirstPieces(prev => prev.map(p => ({ ...p, justCompleted: false })));
        }, 600);
      }, cumulativeDelay);

      processingTimeouts.current.push(tid);
    });

    // Mark all done after all items processed
    const finalDelay = cumulativeDelay + 500;
    const doneTid = setTimeout(() => {
      setDropFirstProcessingDone(true);
      // If has rapport, start streaming after a small delay
      if (hasRapport) {
        setTimeout(() => {
          setToastMessage({ text: 'Informations du dossier extraites de l\'expertise', type: 'ai' });
          setTimeout(() => setToastMessage(null), 4000);
          startInfoDossierStreaming();
        }, 2000);
      }
    }, finalDelay);
    processingTimeouts.current.push(doneTid);
  };

  const startInfoDossierStreaming = () => {
    setInfoDossierStreaming({ active: true, fieldsRevealed: [], streamingField: null, streamingText: '' });

    const fields = [
      { key: 'nom', section: 'victime', value: DROP_FIRST_VICTIM_DATA.nom, delay: 400 },
      { key: 'prenom', section: 'victime', value: DROP_FIRST_VICTIM_DATA.prenom, delay: 350 },
      { key: 'sexe', section: 'victime', value: DROP_FIRST_VICTIM_DATA.sexe, delay: 300 },
      { key: 'dateNaissance', section: 'victime', value: DROP_FIRST_VICTIM_DATA.dateNaissance, delay: 350 },
      { key: 'profession', section: 'victime', value: DROP_FIRST_VICTIM_DATA.profession, delay: 400 },
      { key: 'typeFait', section: 'fait', value: DROP_FIRST_ACCIDENT_DATA.type, delay: 400 },
      { key: 'dateAccident', section: 'fait', value: DROP_FIRST_ACCIDENT_DATA.dateAccident, delay: 350 },
      { key: 'resume', section: 'fait', value: DROP_FIRST_ACCIDENT_DATA.resume, delay: 0, stream: true },
      { key: 'premiereConstatation', section: 'medical', value: DROP_FIRST_MEDICAL_DATA.premiereConstatation, delay: 400 },
      { key: 'dateConsolidation', section: 'medical', value: DROP_FIRST_MEDICAL_DATA.dateConsolidation, delay: 350 },
      { key: 'aipp', section: 'medical', value: DROP_FIRST_MEDICAL_DATA.aipp, delay: 300 },
      { key: 'commentaire', section: 'medical', value: DROP_FIRST_MEDICAL_DATA.commentaire, delay: 0, stream: true },
      { key: 'postes', section: 'postes', value: DROP_FIRST_POSTES_DETECTES, delay: 300 },
    ];

    let totalDelay = 500;

    fields.forEach((field, idx) => {
      if (field.stream) {
        // Stream text character by character
        const chars = field.value.split('');
        const streamStart = totalDelay;

        const startTid = setTimeout(() => {
          setInfoDossierStreaming(prev => prev ? { ...prev, streamingField: field.key, streamingText: '' } : prev);
        }, streamStart);
        processingTimeouts.current.push(startTid);

        chars.forEach((char, ci) => {
          const charTid = setTimeout(() => {
            setInfoDossierStreaming(prev => {
              if (!prev) return prev;
              return { ...prev, streamingText: prev.streamingText + char };
            });
          }, streamStart + 30 * (ci + 1));
          processingTimeouts.current.push(charTid);
        });

        totalDelay = streamStart + 30 * chars.length + 300;

        // Commit value and reveal
        const commitTid = setTimeout(() => {
          if (field.key === 'resume') {
            setFaitGenerateur(prev => ({ ...prev, resume: field.value }));
            setResumeAffaire(field.value);
          } else if (field.key === 'commentaire') {
            setCommentaireExpertise(field.value);
          }
          setInfoDossierStreaming(prev => prev ? {
            ...prev, fieldsRevealed: [...prev.fieldsRevealed, field.key], streamingField: null, streamingText: ''
          } : prev);
        }, totalDelay);
        processingTimeouts.current.push(commitTid);
        totalDelay += 200;
      } else {
        totalDelay += field.delay;
        const tid = setTimeout(() => {
          // Set the actual data
          if (field.section === 'victime') {
            if (field.key === 'nom') setVictimeData(prev => ({ ...prev, nom: field.value }));
            else if (field.key === 'prenom') setVictimeData(prev => ({ ...prev, prenom: field.value }));
            else if (field.key === 'sexe') setVictimeData(prev => ({ ...prev, sexe: field.value === 'Féminin' ? 'Femme' : 'Homme' }));
            else if (field.key === 'dateNaissance') setVictimeData(prev => ({ ...prev, dateNaissance: field.value }));
          } else if (field.section === 'fait') {
            if (field.key === 'typeFait') setFaitGenerateur(prev => ({ ...prev, type: field.value }));
            else if (field.key === 'dateAccident') setFaitGenerateur(prev => ({ ...prev, dateAccident: field.value }));
          } else if (field.section === 'medical') {
            if (field.key === 'premiereConstatation') setFaitGenerateur(prev => ({ ...prev, datePremiereConstatation: field.value }));
            else if (field.key === 'dateConsolidation') setFaitGenerateur(prev => ({ ...prev, dateConsolidation: field.value }));
          }
          // Update dossier reference
          if (field.key === 'prenom') {
            setDossierIntitule(`${DROP_FIRST_VICTIM_DATA.nom} ${DROP_FIRST_VICTIM_DATA.prenom}`);
            setDossiers(prev => prev.map(d => d.id === activeDossierId ? { ...d, reference: `${DROP_FIRST_VICTIM_DATA.nom} ${DROP_FIRST_VICTIM_DATA.prenom}` } : d));
          }
          setInfoDossierStreaming(prev => prev ? { ...prev, fieldsRevealed: [...prev.fieldsRevealed, field.key] } : prev);
        }, totalDelay);
        processingTimeouts.current.push(tid);
      }
    });

    // End streaming
    totalDelay += 500;
    const endTid = setTimeout(() => {
      setInfoDossierStreaming(prev => prev ? { ...prev, active: false } : null);
    }, totalDelay);
    processingTimeouts.current.push(endTid);
  };

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // ========== DROP FIRST — PIÈCES TAB ==========
  const getProcessedPieces = () => dropFirstPieces.filter(p => p.status === 'done');
  const getPieceNumber = (piece) => {
    if (piece.status !== 'done') return null;
    if (manualReorder) {
      // After manual reorder, numbering follows array order of done items
      const done = dropFirstPieces.filter(p => p.status === 'done');
      return done.findIndex(p => p.id === piece.id) + 1;
    }
    const done = getProcessedPieces().sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    return done.findIndex(p => p.id === piece.id) + 1;
  };
  const getFilteredPieces = () => {
    let items;
    if (manualReorder) {
      // Respect array order — done first, then pending
      items = [...dropFirstPieces].sort((a, b) => {
        if (a.status === 'done' && b.status !== 'done') return -1;
        if (a.status !== 'done' && b.status === 'done') return 1;
        return 0; // preserve array order within each group
      });
    } else {
      // Sort: done items by date (chronological), pending items at the end
      items = [...dropFirstPieces].sort((a, b) => {
        if (a.status === 'done' && b.status !== 'done') return -1;
        if (a.status !== 'done' && b.status === 'done') return 1;
        if (a.status === 'done' && b.status === 'done') return (a.date || '').localeCompare(b.date || '');
        return 0;
      });
    }
    if (piecesFilter.type) items = items.filter(p => p.type === piecesFilter.type);
    if (piecesFilter.search) {
      const s = piecesFilter.search.toLowerCase();
      items = items.filter(p => (p.cleanName || p.originalName || '').toLowerCase().includes(s));
    }
    return items;
  };

  const handleCopyBordereau = () => {
    const done = manualReorder
      ? dropFirstPieces.filter(p => p.status === 'done')
      : getProcessedPieces().sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    let text = 'BORDEREAU DE PIÈCES\n\nN°    | Pièce\n------|------\n';
    done.forEach((p, i) => {
      const num = String(i + 1).padEnd(6);
      text += `${num}| ${p.cleanName}\n`;
    });
    navigator.clipboard.writeText(text).then(() => showToast('Bordereau copié dans le presse-papier ✓'));
  };

  const handleAddMorePieces = (fileList) => {
    const accepted = Array.from(fileList).filter(f => /\.(pdf|png|jpe?g|docx?)$/i.test(f.name));
    if (accepted.length === 0) return;

    const newItems = accepted.map((f, i) => {
      const poolEntry = DROP_FIRST_DOCUMENT_POOL[(dropFirstPieces.length + i) % DROP_FIRST_DOCUMENT_POOL.length];
      return {
        id: `dfp-add-${Date.now()}-${i}`,
        originalName: f.name,
        cleanName: null, type: null, date: null, postesLies: [], summary: null,
        extractedInfo: null, pages: null, status: 'pending', poolRef: poolEntry,
        sourceFile: null, pageRange: null, siblings: null,
        fakeSize: (Math.random() * 4 + 0.2).toFixed(1) + ' Mo',
        isRapport: false,
      };
    });

    setDropFirstPieces(prev => [...prev, ...newItems]);
    setDropFirstProcessingDone(false);
    setShowAddPiecesZone(false);
    setTimeout(() => startProcessingSimulation(newItems, false), 300);
  };

  const renderDropFirstPiecesTab = () => {
    const totalItems = dropFirstPieces.length;
    const allDone = dropFirstProcessingDone;
    const filtered = getFilteredPieces();
    const isFiltered = !!(piecesFilter.type || piecesFilter.search);
    const selectedPiece = pieceOverviewPanel ? dropFirstPieces.find(p => p.id === pieceOverviewPanel) : null;

    let dragLeaveTimer = null;
    const isExternalFileDrag = (e) => !reorderDrag && e.dataTransfer.types.includes('Files');
    return (
      <div
        className="flex h-full relative"
        onDragOver={e => { e.preventDefault(); if (isExternalFileDrag(e)) { clearTimeout(dragLeaveTimer); setPiecesTabDragOver(true); } }}
        onDragLeave={e => { e.preventDefault(); if (isExternalFileDrag(e)) { dragLeaveTimer = setTimeout(() => setPiecesTabDragOver(false), 50); } }}
        onDrop={e => { e.preventDefault(); if (piecesTabDragOver) { setPiecesTabDragOver(false); handleAddMorePieces(e.dataTransfer.files); } }}
      >
        {/* Full-page drag overlay */}
        {piecesTabDragOver && (
          <div className="absolute inset-0 z-40 border border-dashed border-stone-400 rounded-lg flex flex-col items-center justify-center" style={{ pointerEvents: 'none', background: 'linear-gradient(to top, rgba(238,236,230,0) 0%, #eeece6 100%)' }}>
            <div className="bg-[#eeece6] border border-stone-300 rounded-full p-4 shadow-sm mb-4">
              <ArrowDown className="w-6 h-6 text-stone-600" />
            </div>
            <p className="text-heading-lg-medium text-stone-800">Déposez vos documents ici !</p>
            <p className="text-body text-stone-500 mt-2">Les documents seront analysés automatiquement</p>
          </div>
        )}
        {/* Hidden file input for "Ajouter des pièces" button */}
        <input id="add-pieces-input" type="file" multiple accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" className="hidden" onChange={e => { handleAddMorePieces(e.target.files); e.target.value = ''; }} />
        {/* Main table area */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* Table */}
          <div className="bg-white rounded-lg border border-zinc-200/60 overflow-hidden flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-stone-200">
              <div className="flex items-center gap-3">
                <span className="text-body text-stone-500">{totalItems} pièce{totalItems > 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <select
                    value={piecesFilter.type || ''}
                    onChange={e => setPiecesFilter(prev => ({ ...prev, type: e.target.value || null }))}
                    className="appearance-none h-[36px] pl-8 pr-8 text-body border border-stone-200 rounded-lg bg-white text-stone-600 focus:outline-none focus:ring-1 focus:ring-blue-200 shadow-sm"
                  >
                    <option value="">Tous les types</option>
                    {PIECE_TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <Filter className="w-4 h-4 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={piecesFilter.search}
                    onChange={e => setPiecesFilter(prev => ({ ...prev, search: e.target.value }))}
                    className="w-[180px] h-[36px] pl-8 pr-3 text-body border border-stone-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-200 shadow-sm"
                  />
                  <Search className="w-4 h-4 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {isFiltered && (
                  <button onClick={() => setPiecesFilter({ type: null, search: '' })} className="text-body text-stone-400 hover:text-stone-600 flex items-center gap-1 transition-colors">
                    <X className="w-3.5 h-3.5" /> Réinitialiser
                  </button>
                )}
                <div className="w-px h-5 bg-stone-200"></div>
                <button
                  onClick={handleCopyBordereau}
                  className="h-[36px] px-4 text-body-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Clipboard className="w-4 h-4" /> Bordereau
                </button>
              </div>
            </div>
            {/* Drop zone — inline-tables context */}
            <div
              className="dropzone-inline mx-3 my-3 h-[36px] border border-dashed rounded-lg transition-all cursor-pointer flex items-center gap-2 px-2.5"
              style={{ borderColor: '#d6d3d1' }}
              onClick={() => document.getElementById('add-pieces-input')?.click()}
              onDragOver={e => { e.preventDefault(); e.stopPropagation(); e.currentTarget.classList.add('dropzone-drop'); }}
              onDragLeave={e => { e.preventDefault(); e.currentTarget.classList.remove('dropzone-drop'); }}
              onDrop={e => { e.preventDefault(); e.stopPropagation(); e.currentTarget.classList.remove('dropzone-drop'); handleAddMorePieces(e.dataTransfer.files); }}
            >
              <Upload className="w-4 h-4 text-stone-400 dropzone-icon-default" />
              <ArrowDown className="w-4 h-4 text-stone-600 dropzone-icon-drop hidden" />
              <span className="text-body dropzone-text-default"><span className="text-stone-500">Déposez ou </span><span className="font-medium text-[#1e3a8a]">cliquez</span><span className="text-stone-500"> pour ajouter des pièces</span></span>
              <span className="text-body-medium text-[#292524] dropzone-text-drop hidden">Déposez vos fichiers ici</span>
            </div>
            <table className="w-full">
              <thead>
                <tr className="h-[40px] bg-white border-y" style={{ borderColor: '#e7e5e3' }}>
                  <th className="w-[24px] px-1"></th>
                  <th className="w-[48px] px-3 text-left text-caption-medium" style={{ color: '#78716c' }}>N°</th>
                  <th className="px-3 text-left text-caption-medium" style={{ color: '#78716c' }}>Nom</th>
                  <th className="w-[140px] px-3 text-left text-caption-medium" style={{ color: '#78716c' }}>Type</th>
                  <th className="w-[100px] px-3 text-left text-caption-medium" style={{ color: '#78716c' }}>Date</th>
                  <th className="px-3 text-left text-caption-medium" style={{ color: '#78716c' }}>Postes liés</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((piece, idx) => {
                  const isProcessing = piece.status !== 'done';
                  const pieceNum = piece.status === 'done' ? getPieceNumber(piece) : null;
                  const isSelected = pieceOverviewPanel === piece.id;
                  const isDragging = reorderDrag?.pieceId === piece.id;
                  const canDrag = !isProcessing && !isFiltered;

                  return (
                    <React.Fragment key={piece.id}>
                      {/* Drop indicator line */}
                      {reorderDropIdx === idx && reorderDrag?.pieceId !== piece.id && (
                        <tr><td colSpan={6} className="p-0"><div className="h-0.5 bg-blue-500 rounded-full mx-2" /></td></tr>
                      )}
                      <tr
                        className={`border-b border-zinc-50 transition-all duration-300 ${
                          isDragging ? 'opacity-20 bg-zinc-100' :
                          isProcessing ? 'opacity-60' : 'hover:bg-zinc-50 cursor-pointer'
                        } ${piece.justCompleted ? 'bg-teal-50' : ''} ${isSelected && !isDragging ? 'bg-teal-50/50' : ''}`}
                        onClick={() => !isProcessing && !reorderDrag && setPieceOverviewPanel(piece.id)}
                        style={{ height: '52px' }}
                        draggable={canDrag}
                        onDragStart={e => {
                          if (!canDrag) { e.preventDefault(); return; }
                          // Create invisible drag image (we show custom ghost)
                          const img = new window.Image();
                          img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                          e.dataTransfer.setDragImage(img, 0, 0);
                          e.dataTransfer.effectAllowed = 'move';
                          setReorderDrag({ pieceId: piece.id, ghostX: e.clientX, ghostY: e.clientY, name: piece.cleanName, type: piece.type, num: pieceNum });
                        }}
                        onDrag={e => {
                          if (e.clientX === 0 && e.clientY === 0) return; // browser sends 0,0 at end
                          setReorderDrag(prev => prev ? { ...prev, ghostX: e.clientX, ghostY: e.clientY } : null);
                        }}
                        onDragOver={e => {
                          e.preventDefault();
                          e.dataTransfer.dropEffect = 'move';
                          // Determine if drop should be above or below this row
                          const rect = e.currentTarget.getBoundingClientRect();
                          const midY = rect.top + rect.height / 2;
                          setReorderDropIdx(e.clientY < midY ? idx : idx + 1);
                        }}
                        onDragEnd={() => {
                          if (reorderDrag && reorderDropIdx !== null) {
                            const dragId = reorderDrag.pieceId;
                            const currentFiltered = filtered;
                            const draggedIdx = currentFiltered.findIndex(p => p.id === dragId);
                            let targetIdx = reorderDropIdx;
                            if (targetIdx > draggedIdx) targetIdx -= 1;
                            if (draggedIdx !== targetIdx && draggedIdx >= 0) {
                              setDropFirstPieces(prev => {
                                // Reorder using the filtered (displayed) order as base
                                const doneIds = currentFiltered.filter(p => p.status === 'done').map(p => p.id);
                                const pending = prev.filter(p => p.status !== 'done');
                                const doneMap = {};
                                prev.forEach(p => { if (p.status === 'done') doneMap[p.id] = p; });
                                const ordered = doneIds.map(id => doneMap[id]);
                                // Move the dragged item
                                const fromIdx = ordered.findIndex(p => p.id === dragId);
                                if (fromIdx < 0) return prev;
                                const [moved] = ordered.splice(fromIdx, 1);
                                let toIdx = targetIdx;
                                if (toIdx > ordered.length) toIdx = ordered.length;
                                ordered.splice(toIdx, 0, moved);
                                return [...ordered, ...pending];
                              });
                              setManualReorder(true);
                            }
                          }
                          setReorderDrag(null);
                          setReorderDropIdx(null);
                        }}
                      >
                      {/* Drag handle */}
                      <td className="px-1 text-center">
                        {canDrag && (
                          <GripVertical className="w-3.5 h-3.5 text-zinc-300 cursor-grab hover:text-zinc-500" />
                        )}
                      </td>
                      {/* N° / loader */}
                      <td className="px-2 py-2 text-center">
                        {isProcessing ? (
                          <Loader2 className="w-4 h-4 text-teal-500 animate-spin mx-auto" />
                        ) : (
                          <span className="inline-flex items-center justify-center w-[22px] h-[22px] rounded-[6px] bg-[#dfe8f5] text-caption-medium text-[#292524]">{pieceNum || '—'}</span>
                        )}
                      </td>
                      {/* Nom */}
                      <td className="px-3 py-2">
                        {isProcessing ? (
                          <div className="flex items-center gap-2">
                            <span className="text-body text-zinc-400 italic">{piece.originalName}</span>
                            <div className="h-3 w-24 bg-zinc-100 rounded animate-pulse"></div>
                          </div>
                        ) : (
                          <span className="text-body-medium text-zinc-700">
                            {piece.cleanName}
                          </span>
                        )}
                      </td>
                      {/* Type */}
                      <td className="px-3 py-2">
                        {isProcessing ? (
                          <div className="h-5 w-16 bg-zinc-100 rounded animate-pulse"></div>
                        ) : (
                          <div className="relative">
                            <button
                              className={`badge badge-sm cursor-pointer hover:opacity-80 transition-opacity ${PIECE_TYPE_COLORS[piece.type] || 'badge-secondary'}`}
                              onClick={e => { e.stopPropagation(); setEditingPieceField(editingPieceField?.pieceId === piece.id && editingPieceField?.field === 'type' ? null : { pieceId: piece.id, field: 'type' }); }}
                            >
                              {piece.type}
                              <ChevronDown className="w-3 h-3 opacity-50" />
                            </button>
                            {editingPieceField?.pieceId === piece.id && editingPieceField?.field === 'type' && (
                              <div className="absolute left-0 top-full mt-1 bg-white border border-zinc-200 rounded-lg shadow-lg py-1 z-10 min-w-[160px]">
                                {PIECE_TYPE_OPTIONS.map(t => (
                                  <button
                                    key={t}
                                    className={`w-full text-left px-3 py-1.5 text-body hover:bg-zinc-50 transition-colors flex items-center gap-2 ${piece.type === t ? 'font-medium text-zinc-800' : 'text-zinc-600'}`}
                                    onClick={e => {
                                      e.stopPropagation();
                                      setDropFirstPieces(prev => prev.map(p => p.id === piece.id ? { ...p, type: t } : p));
                                      setEditingPieceField(null);
                                    }}
                                  >
                                    <span className={`w-2 h-2 rounded-full ${piece.type === t ? 'bg-stone-800' : ''}`} />
                                    {t}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      {/* Date */}
                      <td className="px-3 py-2">
                        {isProcessing ? (
                          <span className="text-body text-zinc-300">—</span>
                        ) : (
                          <span
                            className="text-body text-zinc-600"
                            onClick={e => { e.stopPropagation(); setEditingPieceField({ pieceId: piece.id, field: 'date' }); }}
                          >
                            {piece.date ? new Date(piece.date).toLocaleDateString('fr-FR') : '—'}
                          </span>
                        )}
                      </td>
                      {/* Postes liés */}
                      <td className="px-3 py-2">
                        {isProcessing ? null : (
                          <div className="flex flex-wrap gap-1">
                            {(piece.postesLies || []).map(p => (
                              <span key={p} className="badge badge-sm badge-secondary">{p}</span>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                    </React.Fragment>
                  );
                })}
                {/* Drop indicator at the very end */}
                {reorderDropIdx === filtered.length && reorderDrag && (
                  <tr><td colSpan={6} className="p-0"><div className="h-0.5 bg-blue-500 rounded-full mx-2" /></td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Custom drag ghost card */}
          {reorderDrag && (
            <div
              className="fixed z-50 pointer-events-none bg-white border border-stone-200 rounded-lg shadow-lg px-3 py-2 flex items-center gap-2"
              style={{ left: reorderDrag.ghostX + 12, top: reorderDrag.ghostY - 16, minWidth: 200 }}
            >
              <GripVertical className="w-3 h-3 text-stone-300" />
              <span className="inline-flex items-center justify-center w-[22px] h-[22px] rounded-[6px] bg-[#dfe8f5] text-caption-medium text-[#292524]">{reorderDrag.num || '?'}</span>
              <span className="text-body-medium text-stone-700 truncate max-w-[250px]">{reorderDrag.name}</span>
              {reorderDrag.type && (
                <span className={`badge badge-sm ${PIECE_TYPE_COLORS[reorderDrag.type] || 'badge-secondary'}`}>
                  {reorderDrag.type}
                </span>
              )}
            </div>
          )}

          {/* Track B hint — no rapport */}
          {allDone && !dropFirstHasRapport && !rapportBannerDismissed && (
            <div className="mt-3 px-4 py-3 text-body text-zinc-400 flex items-center gap-2">
              <span>💡</span>
              <span>Astuce : ajoutez un rapport d'expertise pour remplir automatiquement les informations du dossier.</span>
            </div>
          )}
        </div>

        {/* Document Overview Panel (Right Drawer) */}
        {selectedPiece && renderPieceOverviewPanel(selectedPiece)}
      </div>
    );
  };

  const renderPieceOverviewPanel = (piece) => {
    const pieceNum = getPieceNumber(piece);
    const hasSplitInfo = !!piece.sourceFile;
    const typeColorLight = piece.type === 'Expertise' ? 'bg-teal-50 border-teal-200' : piece.type === 'Décision' ? 'bg-purple-50 border-purple-200' : piece.type === 'Revenus' ? 'bg-green-50 border-green-200' : piece.type === 'Factures' ? 'bg-orange-50 border-orange-200' : piece.type === 'Médical' ? 'bg-blue-50 border-blue-200' : piece.type === 'Administratif' ? 'bg-slate-50 border-slate-200' : 'bg-zinc-50 border-zinc-200';

    // Navigation: get ordered list of done pieces
    const donePieces = getFilteredPieces().filter(p => p.status === 'done');
    const currentIdx = donePieces.findIndex(p => p.id === piece.id);
    const prevPiece = currentIdx > 0 ? donePieces[currentIdx - 1] : null;
    const nextPiece = currentIdx < donePieces.length - 1 ? donePieces[currentIdx + 1] : null;

    const editingPanelType = editingPieceField?.pieceId === piece.id && editingPieceField?.field === 'panelType';

    return (
      <div className="fixed right-0 top-0 h-screen bg-white border-l border-zinc-200 shadow-xl z-30 flex flex-col" style={{ width: '860px', animation: 'slideInRight 0.2s ease-out' }}>
        {/* Common header: navigation + close — spans full width */}
        <div className="px-5 py-3 border-b border-zinc-200 flex items-center justify-between flex-shrink-0 bg-white">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-[22px] h-[22px] rounded-[6px] bg-[#dfe8f5] text-caption-medium text-[#292524]">{pieceNum || '—'}</span>
              <span className="text-body-medium text-zinc-700 truncate max-w-[300px]">{piece.cleanName}</span>
            </div>
            <span className="text-zinc-200 mx-1">|</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => prevPiece && setPieceOverviewPanel(prevPiece.id)}
                disabled={!prevPiece}
                className={`p-1.5 rounded-md transition-colors ${prevPiece ? 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100' : 'text-zinc-200 cursor-not-allowed'}`}
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
              </button>
              <span className="text-caption text-zinc-400 min-w-[40px] text-center">{currentIdx + 1} / {donePieces.length}</span>
              <button
                onClick={() => nextPiece && setPieceOverviewPanel(nextPiece.id)}
                disabled={!nextPiece}
                className={`p-1.5 rounded-md transition-colors ${nextPiece ? 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100' : 'text-zinc-200 cursor-not-allowed'}`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <button onClick={() => setPieceOverviewPanel(null)} className="p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-md transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Two-column body */}
        <div className="flex flex-1 min-h-0">
        {/* Left: Document Preview */}
        <div className="w-[420px] flex flex-col border-r border-zinc-100 bg-zinc-50">
          {/* Source file card — on top */}
          <div className="px-4 pt-4 pb-2 flex-shrink-0">
            <div className="rounded-lg border border-zinc-200 bg-zinc-50/60 overflow-hidden">
              <div className="flex items-center gap-1.5 px-3 py-2 border-b border-zinc-100">
                {hasSplitInfo ? (
                  <>
                    <Scissors className="w-3 h-3 text-zinc-400" />
                    <span className="text-caption-medium text-zinc-400">Document découpé · partie {piece.splitIndex + 1}/{piece.siblings.length}</span>
                  </>
                ) : (
                  <span className="text-caption-medium text-zinc-400">Document original</span>
                )}
              </div>
              <div className="flex items-center gap-2.5 px-3 py-2.5">
                <div className="flex items-center justify-center w-7 h-7 rounded-md bg-white border border-zinc-200 flex-shrink-0">
                  <FileText className="w-3.5 h-3.5 text-zinc-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-body-medium text-zinc-600 truncate">{piece.originalName || piece.sourceFile || '—'}</p>
                  <p className="text-caption text-zinc-400">{piece.pages || '?'} page{(piece.pages || 0) > 1 ? 's' : ''}</p>
                </div>
              </div>
            </div>
          </div>
          {/* Preview content — placeholder */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className={`w-full h-full min-h-[500px] rounded-lg border ${typeColorLight} flex flex-col items-center justify-center`}>
              <FileText className="w-12 h-12 text-zinc-300 mb-3" />
              <p className="text-body-medium text-zinc-400 mb-1">Aperçu du document</p>
              <p className="text-caption text-zinc-300 text-center px-8">
                {piece.cleanName}
              </p>
              <div className="mt-4 flex items-center gap-2 text-caption text-zinc-300">
                <span>{piece.pages || '?'} page{(piece.pages || 0) > 1 ? 's' : ''}</span>
                {hasSplitInfo && <span>· p. {piece.pageRange}</span>}
              </div>
              {/* Fake page thumbnails */}
              <div className="mt-6 flex flex-wrap gap-2 justify-center px-6">
                {Array.from({ length: Math.min(piece.pages || 1, 6) }).map((_, i) => (
                  <div key={i} className="w-[60px] h-[80px] bg-white rounded border border-zinc-200 shadow-sm flex items-center justify-center">
                    <span className="text-counter text-zinc-300">{i + 1}</span>
                  </div>
                ))}
                {(piece.pages || 0) > 6 && (
                  <div className="w-[60px] h-[80px] bg-white rounded border border-zinc-200 shadow-sm flex items-center justify-center">
                    <span className="text-counter text-zinc-300">+{piece.pages - 6}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Metadata panel */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Content */}
          <div className="flex-1 overflow-y-auto px-5 py-5">
            {/* 1. Name — always-editable input */}
            <div className="mb-2">
              <label className="text-caption text-zinc-400 mb-1 block">Nom du document</label>
              <input
                className="text-body-medium text-zinc-800 bg-white border border-zinc-200 rounded-lg px-3 py-2 w-full hover:border-zinc-300 focus:border-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-200 transition-colors"
                value={piece.cleanName}
                onChange={e => setDropFirstPieces(prev => prev.map(p => p.id === piece.id ? { ...p, cleanName: e.target.value } : p))}
              />
            </div>

            {/* Description — extracted summary */}
            {piece.summary && (
              <div className="mb-4">
                <p className="text-caption text-zinc-500 leading-relaxed">{piece.summary}</p>
              </div>
            )}

            {/* Data rows — label / value, separated by border */}
            <div className="divide-y divide-zinc-100">
              {/* Type */}
              <div className="flex items-center justify-between py-3">
                <span className="text-caption text-zinc-400">Type</span>
                <div className="relative">
                  <button
                    className={`badge badge-md cursor-pointer hover:opacity-80 transition-opacity ${PIECE_TYPE_COLORS[piece.type] || 'badge-secondary'}`}
                    onClick={() => setEditingPieceField(editingPanelType ? null : { pieceId: piece.id, field: 'panelType' })}
                  >
                    {piece.type}
                    <ChevronDown className="w-3 h-3 opacity-50" />
                  </button>
                  {editingPanelType && (
                    <div className="absolute right-0 top-full mt-1 bg-white border border-zinc-200 rounded-lg shadow-lg py-1 z-10 min-w-[160px]">
                      {PIECE_TYPE_OPTIONS.map(t => (
                        <button
                          key={t}
                          className={`w-full text-left px-3 py-1.5 text-body hover:bg-zinc-50 transition-colors flex items-center gap-2 ${piece.type === t ? 'font-medium text-zinc-800' : 'text-zinc-600'}`}
                          onClick={() => {
                            setDropFirstPieces(prev => prev.map(p => p.id === piece.id ? { ...p, type: t } : p));
                            setEditingPieceField(null);
                          }}
                        >
                          <span className={`w-2 h-2 rounded-full ${piece.type === t ? 'bg-stone-800' : ''}`} />
                          {t}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Date */}
              <div className="flex items-center justify-between py-3">
                <span className="text-caption text-zinc-400">Date</span>
                <span className="text-body text-zinc-700">{piece.date ? new Date(piece.date).toLocaleDateString('fr-FR') : '—'}</span>
              </div>

              {/* Postes liés */}
              <div className="flex items-start justify-between py-3">
                <span className="text-caption text-zinc-400 pt-0.5">Postes liés</span>
                <div className="flex flex-wrap gap-1 justify-end max-w-[65%]">
                  {piece.postesLies && piece.postesLies.length > 0 ? piece.postesLies.map(p => (
                    <span key={p} className="badge badge-sm badge-secondary">{p}</span>
                  )) : (
                    <span className="text-caption text-zinc-300">—</span>
                  )}
                </div>
              </div>
            </div>


          </div>
          {/* Footer — fixed at bottom of right column */}
          <div className="px-5 py-4 border-t border-zinc-200 bg-white flex-shrink-0">
            <button
              className="w-full px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg flex items-center justify-center gap-2 font-medium text-sm transition-colors"
              onClick={() => {
                setDropFirstPieces(prev => prev.filter(p => p.id !== piece.id));
                setPieceOverviewPanel(null);
              }}
            >
              <Trash2 className="w-4 h-4" />
              Supprimer le document
            </button>
          </div>
        </div>
        </div>{/* end two-column body */}
      </div>
    );
  };

  // ========== DROP FIRST — MODAL ==========
  const renderDropFirstModal = () => {
    if (!dropModal) return null;

    const { files, rapportFileId, rapportDismissed } = dropModal;
    const hasFiles = files.length > 0;

    const handleFileDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const droppedFiles = Array.from(e.dataTransfer?.files || []);
      addFilesToModal(droppedFiles);
    };

    const handleFileSelect = (e) => {
      const selected = Array.from(e.target.files || []);
      addFilesToModal(selected);
      e.target.value = '';
    };

    const handleRapportFileSelect = (e) => {
      const selected = Array.from(e.target.files || []);
      if (selected.length > 0) {
        const file = selected[0];
        const fileObj = {
          id: `file-${Date.now()}-rapport`,
          name: file.name,
          fakeSize: (Math.random() * 4 + 0.5).toFixed(1) + ' Mo',
          isRapport: true,
          status: 'uploading',
          guessedType: null,
        };
        setDropModal(prev => ({
          ...prev,
          files: [...prev.files, fileObj],
          rapportFileId: fileObj.id,
        }));
        setTimeout(() => {
          setDropModal(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              files: prev.files.map(f =>
                f.id === fileObj.id ? { ...f, status: 'ready', guessedType: 'Expertise' } : f
              ),
            };
          });
        }, 1000 + Math.random() * 500);
      }
      e.target.value = '';
    };

    // Guess a document type from filename — always returns a category
    const guessFileType = (name) => {
      const ln = name.toLowerCase();
      if (ln.includes('expertise') || ln.includes('rapport')) return 'Expertise';
      if (ln.includes('facture') || ln.includes('kine') || ln.includes('kiné')) return 'Factures';
      if (ln.includes('salaire') || ln.includes('bulletin') || ln.includes('impot') || ln.includes('impôt') || ln.includes('revenu') || ln.includes('avis')) return 'Revenus';
      if (ln.includes('jugement') || ln.includes('decision') || ln.includes('décision') || ln.includes('arret') || ln.includes('arrêt') || ln.includes('ordonnance')) return 'Décision';
      if (ln.includes('medical') || ln.includes('médical') || ln.includes('certificat') || ln.includes('hospitalisation') || ln.includes('cpam') || ln.includes('travail') || ln.includes('irm') || ln.includes('scanner') || ln.includes('radio') || ln.includes('compte_rendu') || ln.includes('compte-rendu') || ln.includes('decompte') || ln.includes('décompte') || ln.includes('blessure')) return 'Médical';
      if (ln.includes('courrier') || ln.includes('lettre') || ln.includes('mail') || ln.includes('assurance') || ln.includes('correspondance')) return 'Correspondance';
      if (ln.includes('pv') || ln.includes('police') || ln.includes('constat') || ln.includes('administratif')) return 'Administratif';
      // Fallback: assign a random plausible type for unrecognized filenames
      const fallbackTypes = ['Médical', 'Administratif', 'Correspondance', 'Factures', 'Revenus'];
      return fallbackTypes[Math.floor(Math.random() * fallbackTypes.length)];
    };

    const addFilesToModal = (fileList) => {
      const accepted = fileList.filter(f => /\.(pdf|png|jpe?g|docx?)$/i.test(f.name));
      if (accepted.length === 0) return;

      const newFiles = accepted.map((f, i) => ({
        id: `file-${Date.now()}-${i}`,
        name: f.name,
        fakeSize: (Math.random() * 4 + 0.2).toFixed(1) + ' Mo',
        status: 'uploading',
        guessedType: null,
      }));

      setDropModal(prev => {
        const updatedFiles = [...prev.files, ...newFiles];
        // Auto-detect rapport
        let newRapportId = prev.rapportFileId;
        if (!newRapportId && !prev.rapportDismissed) {
          const rapportFile = updatedFiles.find(f => {
            const ln = f.name.toLowerCase();
            return ln.includes('expertise') || ln.includes('rapport');
          });
          if (rapportFile) newRapportId = rapportFile.id;
        }
        return { ...prev, files: updatedFiles, rapportFileId: newRapportId };
      });

      // Simulate upload + categorization per file with staggered delays
      newFiles.forEach((fileObj, i) => {
        const delay = 800 + i * 400 + Math.random() * 600;
        setTimeout(() => {
          setDropModal(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              files: prev.files.map(f =>
                f.id === fileObj.id
                  ? { ...f, status: 'ready', guessedType: guessFileType(fileObj.name) }
                  : f
              ),
            };
          });
        }, delay);
      });
    };

    const removeFile = (fileId) => {
      setDropModal(prev => {
        const newFiles = prev.files.filter(f => f.id !== fileId);
        return {
          ...prev,
          files: newFiles,
          rapportFileId: prev.rapportFileId === fileId ? null : prev.rapportFileId,
        };
      });
    };

    const rapportFile = rapportFileId ? files.find(f => f.id === rapportFileId) : null;
    const showRapportCard = hasFiles && !rapportDismissed;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[700px] max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4">
            <h2 className="text-display-sm text-zinc-800" style={{ fontFamily: 'Georgia, serif' }}>Nouveau dossier</h2>
            <button onClick={() => setDropModal(null)} className="p-1 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 pb-4">
            {/* Drop zone */}
            <div
              className="dropzone-container border border-dashed rounded-lg transition-all cursor-pointer"
              style={{ borderColor: '#d6d3d1' }}
              onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('dropzone-drop'); }}
              onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove('dropzone-drop'); }}
              onDrop={(e) => { e.currentTarget.classList.remove('dropzone-drop'); handleFileDrop(e); }}
              onClick={() => document.getElementById('drop-first-file-input')?.click()}
            >
              {!hasFiles ? (
                <>
                  {/* Default/hover state — start context */}
                  <div className="dropzone-default-content flex flex-col items-center rounded-lg" style={{ background: 'linear-gradient(to top, rgba(238,236,230,0) 0%, #f8f7f5 100%)' }}>
                    <div className="pt-8 pb-8 px-8 flex flex-col items-center gap-8 w-full max-w-[576px] mx-auto">
                      <div className="bg-[#eeece6] border shadow-sm rounded-full p-4" style={{ borderColor: '#d6d3d1' }}>
                        <Upload className="w-6 h-6 text-stone-500" />
                      </div>
                      <div className="text-center space-y-2">
                        <p className="text-heading-lg-medium text-stone-800 leading-7">Déposez l'ensemble des pièces du dossier</p>
                        <p className="text-body text-stone-500">PDF, images, Word — vous pourrez en ajouter d'autres plus tard</p>
                      </div>
                      <div className="flex flex-wrap justify-center gap-3" onClick={e => e.stopPropagation()}>
                        {['Rapports médicaux', 'Décisions de justice', 'Factures', 'Bulletins de salaire', 'Correspondances', 'PV & constats'].map((label, i) => (
                          <span key={i} className="badge badge-sm badge-secondary">{label}</span>
                        ))}
                      </div>
                      <span className="h-10 px-6 bg-stone-800 text-white text-body-medium rounded-lg hover:bg-stone-900 transition-colors inline-flex items-center gap-2 shadow-sm">
                        <Upload className="w-4 h-4" /> Importer des pièces
                      </span>
                    </div>
                  </div>
                  {/* Drop state */}
                  <div className="dropzone-drop-content hidden flex-col items-center rounded-lg" style={{ background: 'linear-gradient(to top, rgba(238,236,230,0) 0%, #eeece6 100%)' }}>
                    <div className="pt-8 pb-8 px-8 flex flex-col items-center gap-8 w-full max-w-[576px] mx-auto">
                      <div className="bg-[#eeece6] border shadow-sm rounded-full p-4" style={{ borderColor: '#d6d3d1' }}>
                        <ArrowDown className="w-6 h-6 text-stone-600" />
                      </div>
                      <div className="text-center space-y-2">
                        <p className="text-heading-lg-medium text-stone-800 leading-7">Déposez vos documents ici, l'extraction commencera</p>
                        <p className="text-body text-stone-500">Déposez un ou plusieurs documents.</p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Default/hover — panel context */}
                  <div className="dropzone-default-content flex items-center justify-center gap-2.5 py-4 rounded-lg" style={{ background: 'linear-gradient(to top, rgba(238,236,230,0) 50%, #f8f7f5 100%)' }}>
                    <Upload className="w-5 h-5 text-stone-400" />
                    <p className="text-body text-stone-500">Déposez ou <span className="font-medium text-[#1e3a8a]">cliquez</span> pour ajouter des pièces</p>
                  </div>
                  {/* Drop state */}
                  <div className="dropzone-drop-content hidden flex items-center justify-center gap-2.5 py-4 rounded-lg" style={{ background: 'linear-gradient(to top, rgba(238,236,230,0) 50%, #eeece6 100%)' }}>
                    <ArrowDown className="w-5 h-5 text-stone-600" />
                    <p className="text-body-medium text-[#292524]">Déposez vos fichiers ici</p>
                  </div>
                </>
              )}
              <input id="drop-first-file-input" type="file" multiple accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" className="hidden" onChange={handleFileSelect} />
            </div>

            {/* File list */}
            {hasFiles && (
              <div className="mt-4">
                <p className="text-body-medium text-zinc-500 mb-2">{files.length} document{files.length > 1 ? 's' : ''} ajouté{files.length > 1 ? 's' : ''}</p>
                <div className="flex flex-col gap-0.5 max-h-[200px] overflow-y-auto">
                  {files.map((f, idx) => {
                    const isUploading = f.status === 'uploading';
                    const fileType = (f.id === rapportFileId || f.isRapport) ? 'Expertise' : f.guessedType;
                    return (
                      <div key={f.id} className={`flex items-center justify-between px-3 py-2.5 rounded-lg group transition-all ${isUploading ? '' : 'hover:bg-[#f8f7f5]'}`}>
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Icon: spinner while loading, paperclip when ready */}
                          <div className="flex items-center justify-center w-[22px] h-[22px] flex-shrink-0">
                            {isUploading ? (
                              <Loader2 className="w-4 h-4 text-[#78716c] animate-spin" />
                            ) : (
                              <>
                                <Paperclip className="w-4 h-4 text-[#78716c] group-hover:hidden" />
                                <Trash2
                                  className="w-4 h-4 text-[#78716c] hover:text-red-500 hidden group-hover:block cursor-pointer"
                                  onClick={(e) => { e.stopPropagation(); removeFile(f.id); }}
                                />
                              </>
                            )}
                          </div>
                          {/* Filename */}
                          <span className={`text-sm truncate ${isUploading ? 'italic opacity-40 text-[#292524]' : 'text-[#292524]'}`}>{f.name}</span>
                        </div>
                        {/* Badge — only shown when ready */}
                        {!isUploading && fileType && (
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium flex-shrink-0 ${
                            (f.id === rapportFileId || f.isRapport)
                              ? 'bg-[#cce6d9] text-[#064e3b]'
                              : 'bg-[#dfe8f5] text-[#1e3a8a]'
                          }`}>
                            {fileType}
                            <ChevronDown className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Rapport d'expertise prompt — only when no rapport detected */}
            {showRapportCard && !rapportFile && (
              <div className="mt-4">
                <div className="banner banner-regular banner-ai">
                  <div className="banner-body">
                    <Sparkles className="w-5 h-5 banner-icon mt-0.5" fill="currentColor" />
                    <div className="banner-content">
                      <p className="banner-title">Avez-vous un rapport d'expertise médicale ?</p>
                      <p className="banner-description">
                        C'est la pièce maîtresse. À partir de ce document, nous pouvons remplir automatiquement la quasi-totalité de votre dossier : identité de la victime, faits, dates clés, postes de préjudice…
                      </p>
                      <div className="banner-actions">
                        <button
                          onClick={(e) => { e.stopPropagation(); document.getElementById('rapport-file-input')?.click(); }}
                          className="banner-btn-primary"
                        >
                          <Sparkles className="w-3.5 h-3.5" /> Ajouter le rapport d'expertise
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setDropModal(prev => ({ ...prev, rapportDismissed: true })); }}
                          className="banner-btn-ghost"
                        >
                          Je n'en ai pas
                        </button>
                      </div>
                      <input id="rapport-file-input" type="file" accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" className="hidden" onChange={handleRapportFileSelect} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-zinc-100 flex items-center justify-between">
            <button
              onClick={() => {
                setDropModal(null);
                setCreationWizard({ step: 'infos', formData: { nom: '', prenom: '', sexe: 'Homme', dateNaissance: '', dateDeces: '', reference: '', typeFait: 'Accident de la route', dateAccident: '', dateConsolidation: '', dateLiquidation: '' } });
              }}
              className="text-body text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              Créer manuellement
            </button>
            <button
              onClick={handleDropFirstCreate}
              disabled={!hasFiles}
              className={`px-5 py-2.5 text-body-medium rounded-lg transition-all ${
                hasFiles
                  ? 'bg-stone-800 text-white hover:bg-stone-900 shadow-sm'
                  : 'bg-stone-100 text-stone-400 cursor-not-allowed'
              }`}
            >
              Créer le dossier
            </button>
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
                <h3 className="text-body-medium font-semibold text-zinc-700 mb-3">Identité de la victime</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-caption-medium text-zinc-500 mb-1.5">Nom *</label>
                    <input
                      type="text"
                      value={formData.nom}
                      onChange={(e) => updateFormData('nom', e.target.value)}
                      placeholder="Nom de famille"
                      className="w-full px-3 py-2.5 border border-zinc-200 rounded-lg text-body text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-300 focus:border-zinc-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-caption-medium text-zinc-500 mb-1.5">Prénom *</label>
                    <input
                      type="text"
                      value={formData.prenom}
                      onChange={(e) => updateFormData('prenom', e.target.value)}
                      placeholder="Prénom"
                      className="w-full px-3 py-2.5 border border-zinc-200 rounded-lg text-body text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-300 focus:border-zinc-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-caption-medium text-zinc-500 mb-1.5">Sexe</label>
                    <select
                      value={formData.sexe}
                      onChange={(e) => updateFormData('sexe', e.target.value)}
                      className="w-full px-3 py-2.5 border border-zinc-200 rounded-lg text-body text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-300 focus:border-zinc-400 transition-colors"
                    >
                      <option value="Homme">Homme</option>
                      <option value="Femme">Femme</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-caption-medium text-zinc-500 mb-1.5">Date de naissance *</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="JJ/MM/AAAA"
                        value={formData.dateNaissance}
                        onChange={(e) => updateFormData('dateNaissance', formatDateInput(e.target.value))}
                        maxLength={10}
                        className="w-full px-3 py-2.5 pr-9 border border-zinc-200 rounded-lg text-body text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-300 focus:border-zinc-400 transition-colors"
                      />
                      <input type="date" className="absolute inset-0 opacity-0 pointer-events-none" onChange={(e) => { if (e.target.value) updateFormData('dateNaissance', formatDateFR(e.target.value)); }} />
                      <button type="button" onClick={(e) => e.currentTarget.previousElementSibling.showPicker()} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-zinc-100 rounded"><Calendar className="w-4 h-4 text-zinc-400" /></button>
                    </div>
                    {computedAge !== null && <div className="text-caption text-zinc-400 mt-1">{computedAge} ans</div>}
                  </div>
                  <div className="col-span-2">
                    <label className="block text-caption-medium text-zinc-500 mb-1.5">Date de décès</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="JJ/MM/AAAA"
                        value={formData.dateDeces}
                        onChange={(e) => updateFormData('dateDeces', formatDateInput(e.target.value))}
                        maxLength={10}
                        className="w-full px-3 py-2.5 pr-9 border border-zinc-200 rounded-lg text-body text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-300 focus:border-zinc-400 transition-colors"
                      />
                      <input type="date" className="absolute inset-0 opacity-0 pointer-events-none" onChange={(e) => { if (e.target.value) updateFormData('dateDeces', formatDateFR(e.target.value)); }} />
                      <button type="button" onClick={(e) => e.currentTarget.previousElementSibling.showPicker()} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-zinc-100 rounded"><Calendar className="w-4 h-4 text-zinc-400" /></button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section Contexte */}
              <div>
                <h3 className="text-body-medium font-semibold text-zinc-700 mb-3">Contexte</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-caption-medium text-zinc-500 mb-1.5">Type de fait générateur</label>
                    <select
                      value={formData.typeFait}
                      onChange={(e) => updateFormData('typeFait', e.target.value)}
                      className="w-full px-3 py-2.5 border border-zinc-200 rounded-lg text-body text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-300 focus:border-zinc-400 transition-colors"
                    >
                      {typesFaitGenerateur.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-caption-medium text-zinc-500 mb-1.5">Date de l'accident *</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="JJ/MM/AAAA"
                        value={formData.dateAccident}
                        onChange={(e) => updateFormData('dateAccident', formatDateInput(e.target.value))}
                        maxLength={10}
                        className="w-full px-3 py-2.5 pr-9 border border-zinc-200 rounded-lg text-body text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-300 focus:border-zinc-400 transition-colors"
                      />
                      <input type="date" className="absolute inset-0 opacity-0 pointer-events-none" onChange={(e) => { if (e.target.value) updateFormData('dateAccident', formatDateFR(e.target.value)); }} />
                      <button type="button" onClick={(e) => e.currentTarget.previousElementSibling.showPicker()} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-zinc-100 rounded"><Calendar className="w-4 h-4 text-zinc-400" /></button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-caption-medium text-zinc-500 mb-1.5">Date de consolidation <span className="text-zinc-300 font-normal">(facultatif)</span></label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="JJ/MM/AAAA"
                        value={formData.dateConsolidation}
                        onChange={(e) => updateFormData('dateConsolidation', formatDateInput(e.target.value))}
                        maxLength={10}
                        className="w-full px-3 py-2.5 pr-9 border border-zinc-200 rounded-lg text-body text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-300 focus:border-zinc-400 transition-colors"
                      />
                      <input type="date" className="absolute inset-0 opacity-0 pointer-events-none" onChange={(e) => { if (e.target.value) updateFormData('dateConsolidation', formatDateFR(e.target.value)); }} />
                      <button type="button" onClick={(e) => e.currentTarget.previousElementSibling.showPicker()} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-zinc-100 rounded"><Calendar className="w-4 h-4 text-zinc-400" /></button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-caption-medium text-zinc-500 mb-1.5">Date de liquidation <span className="text-zinc-300 font-normal">(facultatif)</span></label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="JJ/MM/AAAA"
                        value={formData.dateLiquidation}
                        onChange={(e) => updateFormData('dateLiquidation', formatDateInput(e.target.value))}
                        maxLength={10}
                        className="w-full px-3 py-2.5 pr-9 border border-zinc-200 rounded-lg text-body text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-300 focus:border-zinc-400 transition-colors"
                      />
                      <input type="date" className="absolute inset-0 opacity-0 pointer-events-none" onChange={(e) => { if (e.target.value) updateFormData('dateLiquidation', formatDateFR(e.target.value)); }} />
                      <button type="button" onClick={(e) => e.currentTarget.previousElementSibling.showPicker()} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-zinc-100 rounded"><Calendar className="w-4 h-4 text-zinc-400" /></button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-zinc-100 flex justify-end gap-3">
              <button
                onClick={() => setCreationWizard(null)}
                className="px-4 py-2.5 text-body text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => setCreationWizard(prev => ({ ...prev, step: 'mode-chiffrage' }))}
                disabled={!canSubmitInfos}
                className="px-5 py-2.5 bg-zinc-900 text-white text-body-medium rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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
              <h2 className="text-lg font-semibold text-zinc-800">Comment souhaitez-vous créer votre chiffrage ?</h2>
            </div>

            {/* Body */}
            <div className="px-6 py-6">
              {/* Options principales */}
              <div className="flex gap-4">
                {/* Option 1: Importer le rapport */}
                <div
                  onClick={() => document.getElementById('wizard-file-input').click()}
                  className="flex-1 p-6 border-2 border-zinc-200 rounded-xl hover:border-zinc-400 hover:bg-zinc-50 cursor-pointer transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center mb-4 group-hover:bg-zinc-200 transition-colors">
                    <Upload className="w-6 h-6 text-zinc-600" />
                  </div>
                  <h3 className="text-heading-sm text-zinc-800 mb-2">Importer mon rapport d'expertise</h3>
                  <p className="text-body text-zinc-500 leading-relaxed">Extraction automatique des données. Pré-remplissage des postes et calculs.</p>
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

                {/* Option 2: Saisie manuelle */}
                <div
                  onClick={() => handleCreateDossier(formData, 'chiffrage')}
                  className="flex-1 p-6 border-2 border-zinc-200 rounded-xl hover:border-zinc-400 hover:bg-zinc-50 cursor-pointer transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center mb-4 group-hover:bg-zinc-200 transition-colors">
                    <Edit3 className="w-6 h-6 text-zinc-600" />
                  </div>
                  <h3 className="text-heading-sm text-zinc-800 mb-2">Saisir les données manuellement</h3>
                  <p className="text-body text-zinc-500 leading-relaxed">Le rapport est sous vos yeux. Renseignez les informations à la main.</p>
                </div>
              </div>

              {/* Option 3: Pas encore de rapport (secondaire) */}
              <div
                onClick={() => handleCreateDossier(formData, 'info dossier')}
                className="mt-4 px-4 py-3 border border-zinc-200 rounded-lg hover:bg-zinc-50 cursor-pointer transition-all flex items-center gap-3 group"
              >
                <div className="w-8 h-8 rounded-lg bg-zinc-50 flex items-center justify-center flex-shrink-0 group-hover:bg-zinc-100 transition-colors">
                  <FileText className="w-4 h-4 text-zinc-400" />
                </div>
                <div>
                  <h3 className="text-body-medium text-zinc-500 group-hover:text-zinc-700 transition-colors">Je n'ai pas encore le rapport d'expertise</h3>
                  <p className="text-caption text-zinc-400 leading-relaxed">Créer le dossier maintenant, le chiffrage pourra démarrer après.</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-zinc-100 flex justify-end gap-3">
              <button
                onClick={() => setCreationWizard(prev => ({ ...prev, step: 'infos' }))}
                className="px-4 py-2.5 text-body text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
              >
                Retour
              </button>
              <button
                onClick={() => setCreationWizard(null)}
                className="px-4 py-2.5 text-body text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
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
          <span className="text-zinc-900 font-bold text-heading-sm">N</span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom: Settings + User */}
        <div className="flex flex-col items-center gap-3">
          <button className="w-9 h-9 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors">
            <Settings className="w-[18px] h-[18px]" />
          </button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white text-caption-medium cursor-pointer">
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
              onClick={() => setDropModal({ files: [], rapportFileId: null, rapportDismissed: false })}
              className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 text-white text-body-medium rounded-lg hover:bg-zinc-800 transition-colors"
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
                  <th className="px-5 py-3 text-left text-caption-medium text-zinc-400 uppercase tracking-wider">Référence</th>
                  <th className="px-5 py-3 text-left text-caption-medium text-zinc-400 uppercase tracking-wider">Type de fait</th>
                  <th className="px-5 py-3 text-left text-caption-medium text-zinc-400 uppercase tracking-wider">Date</th>
                  <th className="px-5 py-3 text-left text-caption-medium text-zinc-400 uppercase tracking-wider">Dernier édit</th>
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
                        <span className="text-body-medium text-zinc-800">{dossier.reference}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-body text-zinc-500">{dossier.typeFait}</td>
                    <td className="px-5 py-4 text-body text-zinc-500 tabular-nums">{dossier.date}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center flex-shrink-0">
                          <span className="text-counter text-white">{dossier.lastEditBy.split(' ').map(n => n[0]).join('')}</span>
                        </div>
                        <span className="text-body text-zinc-500">{dossier.lastEditDate}</span>
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
      {renderDropFirstModal()}
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
              className="flex items-center gap-1.5 text-body text-zinc-400 hover:text-zinc-600 mb-3 -ml-1 transition-colors"
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
                  <span className={`px-2.5 py-1 text-caption-medium rounded-full ${
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
                <p className="text-body text-zinc-400 mt-3">{posteDescriptions[currentLevel.id]}</p>
              )}
            </div>
            
            {/* CTAs pour Chiffrage */}
            {currentLevel.type === 'dossier' && currentLevel.activeTab === 'chiffrage' && (
              <div className="flex items-center gap-2">
                <button onClick={() => setShowExportModal(true)} className="flex items-center gap-2 px-4 py-2 text-body-medium text-zinc-600 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 shadow-sm transition-colors">
                  <Download className="w-4 h-4" strokeWidth={1.5} />
                  Exporter
                </button>
                <button
                  onClick={() => setShowChiffrageParams(true)}
                  className="flex items-center gap-2 px-4 py-2 text-body-medium text-zinc-600 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 shadow-sm transition-colors"
                >
                  <Settings className="w-4 h-4" strokeWidth={1.5} />
                  Paramètres
                </button>
              </div>
            )}
            {currentLevel.type === 'poste' && !currentLevel.subSection && (
              <div className="flex items-center gap-2">
                <button onClick={() => setShowExportModal(true)} className="flex items-center gap-2 px-4 py-2 text-body-medium text-zinc-600 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 shadow-sm transition-colors">
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
                const hasExtracted = tab === 'Info dossier' && infoDossierStreaming?.fieldsRevealed?.length > 0;
                const showDot = hasExtracted && !isActive;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-3 text-body-medium relative transition-colors ${isActive ? 'text-zinc-800' : 'text-zinc-400 hover:text-zinc-600'}`}
                  >
                    <span className="flex items-center gap-1.5">
                      {tab}
                      {showDot && <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse-scale" />}
                    </span>
                    {isActive && <div className="absolute bottom-0 left-2 right-2 h-[2px] bg-zinc-800 rounded-full" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 pb-8">
          <div className="min-h-full flex flex-col">{renderContent()}</div>
        </div>
      </div>
      {renderAddModal()}
      {renderExportModal()}
      {renderEditPanel()}
      {renderSmartProcedureWizard()}

      {/* Toast notification */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 text-white text-body rounded-lg shadow-lg flex items-center gap-2 animate-fade-up ${toastMessage?.type === 'ai' ? 'bg-purple-900' : 'bg-zinc-800'}`}>
          {toastMessage?.type === 'ai' ? (
            <Sparkles className="w-4 h-4 text-purple-300" fill="currentColor" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-teal-400" />
          )}
          {typeof toastMessage === 'string' ? toastMessage : toastMessage?.text}
        </div>
      )}
    </div>
  );
}
// Force deploy Fri Jan 30 16:16:33 CET 2026

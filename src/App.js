import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, ChevronDown, Folder, FileText, Calculator, Plus, X, Edit3, Check, AlertTriangle, RefreshCw, Calendar, Landmark, Upload, Sparkles, Loader2, Search, HelpCircle, Eye, Trash2, FileQuestion, Download, Settings, AlertCircle, Receipt, ClipboardList, FileSpreadsheet, Activity, FileSearch, ListChecks, MoreHorizontal, MoreVertical, User, Copy, Plug2, GripVertical, CheckCircle2, Clipboard, Filter, ListFilter, ArrowDown, ArrowDownCircle, Scissors, Paperclip, ThumbsUp, ThumbsDown, RotateCcw, Lightbulb, ArrowUp, Square, FileMinus, Radical, PanelRightClose } from 'lucide-react';

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
  'Expertise': 'bg-[#dfe8f5] text-[#1e3a8a]',
  'Décision': 'bg-[#ede9fe] text-[#5b21b6]',
  'Revenus': 'bg-[#dcfce7] text-[#166534]',
  'Factures': 'bg-[#f9ecd6] text-[#855b31]',
  'Médical': 'bg-[#dbeafe] text-[#1e40af]',
  'Correspondance': 'bg-[#eeece6] text-[#44403c]',
  'Administratif': 'bg-[#f1f5f9] text-[#475569]',
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
  const [dossiers, setDossiers] = useState([]);

  const [navStack, setNavStack] = useState([]);
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
  const [chatSidebarOpen, setChatSidebarOpen] = useState(true);
  const [chatWidth, setChatWidth] = useState(408);
  const chatResizing = useRef(false);
  const [posteSearchOpen, setPosteSearchOpen] = useState(false);
  const [posteSearchQuery, setPosteSearchQuery] = useState('');
  const [editingPieceField, setEditingPieceField] = useState(null); // null | { pieceId, field }
  const [toastMessage, setToastMessage] = useState(null); // null | string
  const [pickerOpen, setPickerOpen] = useState(null); // null | 'dft' | 'dsa' | 'pgpa-revenu-ref' | 'pgpa-revenu-percu' | 'pgpa-ij'
  const [pickerSelected, setPickerSelected] = useState([]); // array of piece IDs (multi-select)
  const [pickerSearch, setPickerSearch] = useState('');
  const [posteExtracting, setPosteExtracting] = useState(null); // null | { posteType, totalDocs, extractedCount, docIds: [] }
  const processingTimeouts = useRef([]);
  const [activeParamChip, setActiveParamChip] = useState(null); // which param chip config is expanded
  const [totalExpanded, setTotalExpanded] = useState({}); // { [posteId]: boolean }
  const [dossierPostes, setDossierPostes] = useState(['dsa', 'pgpa', 'dft', 'pgpf', 'se', 'dfp', 'pep']); // IDs of postes added to this dossier
  const [formPosteData, setFormPosteData] = useState({
    se: { referentiel: 'cours-appel-2024', cotation: 4, montant: 15000 },
    pep: { referentiel: 'cours-appel-2024', cotation: 3, montant: 4500 },
    dfp: { referentiel: 'cours-appel-2024', age: 42, taux: 18, trancheAge: 'inferieure', trancheTaux: 'inferieure', pointBase: 1500, montant: 27000 },
  });

  // Shared style for all column/table headers — IBM Plex Mono, uppercase, small
  const colHeaderStyle = { fontFamily: "'IBM Plex Mono', monospace", fontWeight: 500, fontSize: '11px', color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.05em' };
  // Section headers: DETAIL DU CALCUL, NOTES / ARGUMENTAIRE, JURISPRUDENCES
  const sectionHeaderStyle = { fontFamily: "'IBM Plex Mono', monospace", fontWeight: 500, fontSize: '11px', color: '#78716c', textTransform: 'uppercase', letterSpacing: '1px' };
  // Serif amounts for card titles and totals
  const serifAmountStyle = { fontFamily: "Georgia, 'Times New Roman', serif", fontSize: '18px', letterSpacing: '-0.5px', fontWeight: 400 };
  // Reusable card block class
  const cardBlockClass = "bg-white rounded-lg border border-[#e7e5e3] overflow-hidden shadow-[0_1px_2px_0_rgba(26,26,26,0.05)]";
  // Total block class
  const totalBlockClass = "bg-[#eeece6] border border-[#e7e5e3] rounded-lg shadow-[0_1px_2px_0_rgba(26,26,26,0.05)] p-4";

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

  // Collapsed sections state for PGPA/PGPF cards (collapsed by default)
  const [expandedCards, setExpandedCards] = useState({});
  const isCardExpanded = (key) => !!expandedCards[key];
  const toggleCard = (key) => setExpandedCards(prev => ({ ...prev, [key]: !prev[key] }));

  // ========== PGPF ==========
  const [pgpfData, setPgpfData] = useState({
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
    }
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
    dossierPostes: [], formPosteData: {},
  };

  const collectCurrentDossierData = () => ({
    victimeData, faitGenerateur, chiffrageParams,
    dossierStatut, dossierRef, dossierIntitule, dossierDateOuverture, dossierAvocat, dossierNotes,
    resumeAffaire, commentaireExpertise, victimesIndirectes, pieces,
    dsaLignes, pgpaData, pgpfData, dftLignes,
    dossierPostes, formPosteData,
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
    setDossierPostes(data.dossierPostes ?? ['dsa', 'pgpa', 'dft', 'pgpf', 'se', 'dfp', 'pep']);
    setFormPosteData(data.formPosteData ?? {
      se: { referentiel: 'cours-appel-2024', cotation: 4, montant: 15000 },
      pep: { referentiel: 'cours-appel-2024', cotation: 3, montant: 4500 },
      dfp: { referentiel: 'cours-appel-2024', age: 42, taux: 18, trancheAge: 'inferieure', trancheTaux: 'inferieure', pointBase: 1500, montant: 27000 },
    });
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
      if (savedGlobal.navStack) setNavStack(savedGlobal.navStack.map(n => ({ ...n, activeTab: n.activeTab === 'détail' || n.activeTab === 'info dossier' ? 'dossier' : n.activeTab })));
      if (savedGlobal.activeDossierId && savedGlobal.currentPage === 'dossier') {
        loadDossierData(savedGlobal.activeDossierId);
      }
    } else {
      // First-ever load: start with empty list
      lsSave(LS_GLOBAL, { dossiers: [], activeDossierId: null, currentPage: 'list', navStack: [] });
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

  // ========== CHAT: proactive announcements after extraction ==========

  // When file processing completes → chat announces docs extracted + thinking stepper
  useEffect(() => {
    if (dropFirstProcessingDone && !chatExtractionAnnounced.current && dropFirstPieces.length > 0) {
      chatExtractionAnnounced.current = true;
      const doneCount = dropFirstPieces.filter(p => p.status === 'done').length;
      const types = [...new Set(dropFirstPieces.filter(p => p.type).map(p => p.type))];
      setChatSidebarOpen(true);
      setChatMessages(prev => [
        ...prev,
        {
          type: 'ai-thinking',
          label: 'Analyse des documents...',
          steps: [
            { tool: 'analyseDocuments', detail: `${doneCount} documents traités`, expandedText: `Types détectés : ${types.join(', ')}` },
          ],
          expanded: false,
        },
      ]);
    }
  }, [dropFirstProcessingDone, dropFirstPieces]);

  // When info streaming finishes → announce dossier filled + suggest postes with artifact cards
  useEffect(() => {
    if (infoDossierStreaming && !infoDossierStreaming.active && !chatPostesAnnounced.current) {
      chatPostesAnnounced.current = true;
      const detectedPostes = DROP_FIRST_POSTES_DETECTES;
      const posteIds = detectedPostes.map(acronym => {
        const found = POSTES_TAXONOMY.flatMap(s => s.categories.flatMap(c => c.postes)).find(p => (p.acronym || '').toUpperCase() === acronym.toUpperCase() || p.id.toUpperCase() === acronym.toUpperCase());
        return found?.id;
      }).filter(Boolean);

      // Add detected postes to dossier (at 0€ — not calculated yet)
      setDossierPostes(prev => {
        const newIds = posteIds.filter(id => !prev.includes(id));
        return newIds.length > 0 ? [...prev, ...newIds] : prev;
      });

      // Update the thinking stepper with extraction + postes steps
      setChatMessages(prev => {
        const updated = prev.map(m => {
          if (m.type === 'ai-thinking' && m.label === 'Analyse des documents...') {
            return {
              ...m,
              label: 'Analyse terminée',
              steps: [
                ...(m.steps || []),
                { tool: 'extractInfoDossier', detail: 'Informations du dossier remplies', expandedText: 'Nom, prénom, date, adresse et autres champs extraits' },
                { tool: 'detectPostes', detail: `${detectedPostes.length} postes identifiés`, expandedText: detectedPostes.join(', ') },
              ],
            };
          }
          return m;
        });

        // Compute info dossier summary
        const victimFields = ['nom', 'prenom', 'sexe', 'dateNaissance', 'profession'].filter(f => DROP_FIRST_VICTIM_DATA[f]);
        const accidentFields = ['type', 'dateAccident', 'resume'].filter(f => DROP_FIRST_ACCIDENT_DATA[f]);
        const medicalFields = ['premiereConstatation', 'dateConsolidation', 'aipp', 'commentaire'].filter(f => DROP_FIRST_MEDICAL_DATA[f]);
        const totalInfoFields = victimFields.length + accidentFields.length + medicalFields.length;
        const visiblePostes = detectedPostes.slice(0, 3);
        const remainingPostes = detectedPostes.length - visiblePostes.length;

        return [
          ...updated,
          {
            type: 'artifact-cards',
            cards: [
              {
                id: 'info-dossier',
                icon: 'FileText',
                title: 'Info dossier remplies',
                subtitle: `${DROP_FIRST_VICTIM_DATA.nom}, ${DROP_FIRST_VICTIM_DATA.prenom}, ${DROP_FIRST_ACCIDENT_DATA.dateAccident}${totalInfoFields > 3 ? ` +${totalInfoFields - 3} infos` : ''}`,
                action: 'Voir',
                navigateTo: 'dossier',
              },
              {
                id: 'postes-suggeres',
                icon: 'Calculator',
                title: `${detectedPostes.length} postes suggérés`,
                subtitle: `${visiblePostes.join(', ')}${remainingPostes > 0 ? ` +${remainingPostes} postes` : ''}`,
                action: 'Voir',
                navigateTo: 'chiffrage',
              },
            ],
          },
          {
            type: 'ai',
            text: `J'ai analysé vos documents, rempli les informations du dossier et identifié ${detectedPostes.length} postes de préjudice à 0 €. Cliquez sur un poste pour lancer le calcul.`,
          },
        ];
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [infoDossierStreaming?.active]);

  // ========== POSTE CALCULATION: triggered by user action ==========

  // Poste-specific welcome messages
  const posteWelcomeMap = {
    dsa: { greeting: 'Bienvenue sur les Dépenses de Santé Actuelles !', analysis: 'Je vais regarder les factures et documents médicaux du dossier pour identifier les dépenses...', proposal: 'J\'ai trouvé 5 lignes de dépenses dans vos documents : hospitalisation, kinésithérapie, IRM, médicaments et consultation. Voulez-vous que je lance le calcul ?' },
    dft: { greeting: 'Bienvenue sur le Déficit Fonctionnel Temporaire !', analysis: 'Je consulte le rapport d\'expertise pour identifier les périodes de déficit...', proposal: 'J\'ai identifié 7 périodes de DFT dans le rapport d\'expertise, allant de 100% (hospitalisation) à 15% (gêne résiduelle). Voulez-vous que je lance le calcul avec un forfait de 28 €/jour ?' },
    pgpa: { greeting: 'Bienvenue sur les Pertes de Gains Professionnels Actuels !', analysis: 'Je vérifie les bulletins de salaire et attestations pour établir le revenu de référence...', proposal: 'J\'ai identifié un revenu de référence de ~37 800 €/an sur la base de 2 années de salaire + primes. Période d\'arrêt : 18 mois. Voulez-vous que je lance le calcul ?' },
    pgpf: { greeting: 'Bienvenue sur les Pertes de Gains Professionnels Futurs !', analysis: 'Je consulte les données post-consolidation et les barèmes de capitalisation...', proposal: 'J\'ai identifié une période échue de 4 mois et une capitalisation viagère à calculer (barème Gazette du Palais 2025). Voulez-vous que je lance le calcul ?' },
    se: { greeting: 'Bienvenue sur les Souffrances Endurées !', analysis: 'Je consulte le rapport d\'expertise pour la cotation...', proposal: 'L\'expert a retenu une cotation de 4/7. Selon le référentiel Cour d\'appel 2024, cela correspond à 12 000 - 18 000 €. Voulez-vous que je propose une évaluation ?' },
    dfp: { greeting: 'Bienvenue sur le Déficit Fonctionnel Permanent !', analysis: 'Je consulte le rapport d\'expertise pour le taux et l\'âge à la consolidation...', proposal: 'Taux DFP retenu : 18%, âge à la consolidation : 42 ans. Selon le référentiel, le point est à 1 500 €. Voulez-vous que je lance le calcul ?' },
    pep: { greeting: 'Bienvenue sur le Préjudice Esthétique Permanent !', analysis: 'Je consulte le rapport d\'expertise pour la cotation esthétique...', proposal: 'L\'expert a retenu une cotation de 3/7 (cicatrices + boiterie). Selon le référentiel Cour d\'appel 2024, fourchette de 3 000 - 6 000 €. Voulez-vous que je propose une évaluation ?' },
  };

  const posteDiscoveryToolMap = {
    dsa: [
      { tool: 'readDocument', detail: 'Factures et documents médicaux', expandedText: 'Lecture des factures de soins et justificatifs' },
      { tool: 'extractMontants', detail: '5 dépenses identifiées', expandedText: 'Hospitalisation, kiné, IRM, médicaments, consultation' },
    ],
    dft: [
      { tool: 'readExpertise', detail: 'Rapport d\'expertise', expandedText: 'Lecture du rapport d\'expertise médicale' },
      { tool: 'extractPeriods', detail: '7 périodes identifiées', expandedText: 'Hospitalisation, chirurgie, convalescence, rééducation...' },
    ],
    pgpa: [
      { tool: 'readBulletins', detail: 'Bulletins de salaire', expandedText: 'Lecture des bulletins et attestations employeur' },
      { tool: 'extractRevenus', detail: 'Revenu de référence identifié', expandedText: '~37 800 €/an sur 2 années de salaire + primes' },
    ],
    pgpf: [
      { tool: 'readExpertise', detail: 'Consolidation et séquelles', expandedText: 'Extraction des données post-consolidation' },
      { tool: 'readBaremes', detail: 'Barème Gazette du Palais 2025', expandedText: 'Recherche du coefficient de capitalisation' },
    ],
    se: [
      { tool: 'readExpertise', detail: 'Cotation expertise', expandedText: 'Lecture de la cotation des souffrances endurées' },
    ],
    dfp: [
      { tool: 'readExpertise', detail: 'Taux DFP et âge', expandedText: 'Lecture du taux et de l\'âge à la consolidation' },
    ],
    pep: [
      { tool: 'readExpertise', detail: 'Cotation esthétique', expandedText: 'Lecture de la cotation du préjudice esthétique' },
    ],
  };

  // Handle the actual calculation (Phase 2: user clicked "Lancer le calcul")
  const handlePosteCalculation = (posteId) => {
    const taxo = POSTES_TAXONOMY.flatMap(s => s.categories.flatMap(c => c.postes)).find(p => p.id === posteId);
    if (!taxo) return;
    const posteName = taxo.acronym || posteId.toUpperCase();

    // Clear any lingering timeouts
    chatAnalysisTimeouts.current.forEach(t => clearTimeout(t));
    chatAnalysisTimeouts.current = [];

    // Push calculation thinking
    setChatMessages(prev => [
      ...prev,
      { type: 'ai-thinking', label: `Calcul du ${posteName}...`, steps: [], expanded: false, _posteCalcId: posteId },
    ]);

    const calcToolMap = {
      dsa: [{ tool: 'calculDSA', detail: 'Calcul des dépenses', expandedText: 'Somme des dépenses de santé actuelles' }],
      dft: [{ tool: 'calculDFT', detail: 'Forfait 28 €/j appliqué', expandedText: 'Application des taux par période' }],
      pgpa: [{ tool: 'calculPGPA', detail: 'Perte calculée sur 18 mois', expandedText: 'Revenu - revenus perçus - IJ' }],
      pgpf: [{ tool: 'calculCapitalisation', detail: 'Capitalisation viagère', expandedText: 'Capitalisation de la perte future' }],
      se: [{ tool: 'calculSE', detail: 'Évaluation souffrances', expandedText: 'Application du référentiel' }],
      dfp: [{ tool: 'calculDFP', detail: 'Calcul point × taux', expandedText: 'Application du barème' }],
      pep: [{ tool: 'calculPEP', detail: 'Évaluation esthétique', expandedText: 'Application du référentiel' }],
    };

    const calcTools = calcToolMap[posteId] || [{ tool: `calcul${posteName}`, detail: `Évaluation ${posteName}`, expandedText: 'Calcul en cours...' }];

    calcTools.forEach((toolData, idx) => {
      const t = setTimeout(() => {
        setChatMessages(prev => prev.map(m => {
          if (m.type === 'ai-thinking' && m._posteCalcId === posteId) {
            return { ...m, steps: [...(m.steps || []), toolData] };
          }
          return m;
        }));
      }, 400 + idx * 500);
      chatAnalysisTimeouts.current.push(t);
    });

    // Final: populate data + notes + summary
    const finalT = setTimeout(() => {
      // ---- Populate mock data for empty postes ----
      if (posteId === 'dsa' && dsaLignes.length === 0) {
        setDsaLignes([
          { id: `dsa-ai-${Date.now()}-1`, status: 'ai-suggested', label: 'Hospitalisation CHU Bordeaux', type: 'Hospitalisation', date: '05/06/2022', montant: 4500, dejaRembourse: 4200, pieceIds: [], confidence: 95 },
          { id: `dsa-ai-${Date.now()}-2`, status: 'ai-suggested', label: 'Kinésithérapie (24 séances)', type: 'Soins', date: '15/07/2022', montant: 1280, dejaRembourse: 960, pieceIds: [], confidence: 92 },
          { id: `dsa-ai-${Date.now()}-3`, status: 'ai-suggested', label: 'IRM genou droit', type: 'Examen', date: '20/06/2022', montant: 320, dejaRembourse: 280, pieceIds: [], confidence: 94 },
          { id: `dsa-ai-${Date.now()}-4`, status: 'ai-suggested', label: 'Médicaments (antalgiques, anti-inflammatoires)', type: 'Pharmacie', date: '05/06/2022', montant: 87.50, dejaRembourse: 65, pieceIds: [], confidence: 88 },
          { id: `dsa-ai-${Date.now()}-5`, status: 'ai-suggested', label: 'Consultation orthopédique Dr. Martin', type: 'Consultation', date: '12/06/2022', montant: 55, dejaRembourse: 25, pieceIds: [], confidence: 90 },
        ]);
      }

      if (posteId === 'dft' && dftLignes.length === 0) {
        const baseJ = chiffrageParams.baseJournaliereDFT || 28;
        setDftLignes([
          { id: `dft-ai-${Date.now()}-1`, status: 'ai-suggested', label: 'Hospitalisation initiale', debut: '05/06/2022', fin: '12/06/2022', jours: 8, taux: 100, montant: Math.round(8 * baseJ), pieceIds: [], confidence: 96 },
          { id: `dft-ai-${Date.now()}-2`, status: 'ai-suggested', label: 'Chirurgie + soins intensifs', debut: '13/06/2022', fin: '18/06/2022', jours: 6, taux: 100, montant: Math.round(6 * baseJ), pieceIds: [], confidence: 94 },
          { id: `dft-ai-${Date.now()}-3`, status: 'ai-suggested', label: 'Alitement strict post-opératoire', debut: '19/06/2022', fin: '01/07/2022', jours: 13, taux: 100, montant: Math.round(13 * baseJ), pieceIds: [], confidence: 93 },
          { id: `dft-ai-${Date.now()}-4`, status: 'ai-suggested', label: 'Convalescence post-opératoire', debut: '02/07/2022', fin: '15/09/2022', jours: 76, taux: 50, montant: Math.round(76 * baseJ * 0.5), pieceIds: [], confidence: 89 },
          { id: `dft-ai-${Date.now()}-5`, status: 'ai-suggested', label: 'Rééducation active intensive', debut: '16/09/2022', fin: '16/12/2022', jours: 92, taux: 40, montant: Math.round(92 * baseJ * 0.4), pieceIds: [], confidence: 86 },
          { id: `dft-ai-${Date.now()}-6`, status: 'ai-suggested', label: 'Rééducation d\'entretien', debut: '17/12/2022', fin: '19/03/2023', jours: 92, taux: 25, montant: Math.round(92 * baseJ * 0.25), pieceIds: [], confidence: 84 },
          { id: `dft-ai-${Date.now()}-7`, status: 'ai-suggested', label: 'Gêne résiduelle pré-consolidation', debut: '20/03/2023', fin: '15/01/2024', jours: 301, taux: 15, montant: Math.round(301 * baseJ * 0.15), pieceIds: [], confidence: 80 },
        ]);
      }

      if (posteId === 'pgpa' && pgpaData.revenuRef.lignes.length === 0) {
        setPgpaData({
          periode: { debut: '15/03/2023', fin: '12/09/2024', mois: 18 },
          revenuRef: {
            revalorisation: 'ipc-annuel',
            coefficientPerteChance: 100,
            lignes: [
              { id: `pgpa-rev-${Date.now()}-1`, status: 'ai-suggested', type: 'revenu', label: 'Salaire net 2022', annee: '2022', montant: 32400, revalorise: 33696, pieceIds: [], confidence: 94 },
              { id: `pgpa-rev-${Date.now()}-2`, status: 'ai-suggested', type: 'revenu', label: 'Salaire net 2021', annee: '2021', montant: 31200, revalorise: 33384, pieceIds: [], confidence: 92 },
              { id: `pgpa-rev-${Date.now()}-3`, status: 'ai-suggested', type: 'gain', label: 'Prime annuelle 2022', annee: '2022', montant: 2400, revalorise: 2496, pieceIds: [], confidence: 88 },
            ],
            total: 37800,
          },
          revenusPercus: [
            { id: `pgpa-rp-${Date.now()}-1`, status: 'ai-suggested', label: 'Maintien partiel salaire', tiers: 'Employeur', periode: 'Mars - Juin 2023', periodeDebut: '15/03/2023', periodeFin: '30/06/2023', jours: 108, montant: 8500, pieceIds: [], confidence: 90 },
          ],
          ijPercues: [
            { id: `pgpa-ij-${Date.now()}-1`, status: 'ai-suggested', label: 'IJ Sécurité sociale', tiers: 'CPAM', periode: 'Mars 2023 - Sept 2024', periodeDebut: '15/03/2023', periodeFin: '12/09/2024', jours: 547, montantBrut: 12200, csgCrds: 550, montant: 11650, pieceIds: [], confidence: 91 },
            { id: `pgpa-ij-${Date.now()}-2`, status: 'ai-suggested', label: 'IJ Prévoyance', tiers: 'AG2R', periode: 'Mars 2023 - Sept 2024', periodeDebut: '15/03/2023', periodeFin: '12/09/2024', jours: 547, montantBrut: 5100, csgCrds: 250, montant: 4850, pieceIds: [], confidence: 87 },
          ],
        });
      }

      if (posteId === 'pgpf' && !pgpfData.periodes['pgpf-cl']) {
        setPgpfData({
          periodes: {
            'pgpf-cl': {
              periode: { debut: '12/09/2024', fin: '15/01/2025', mois: 4 },
              revenuRef: { revalorisation: 'ipc-annuel', coefficientPerteChance: 100, lignes: [], total: 37800, syncPGPA: true },
              revenusPercus: [
                { id: `pgpf-rp-${Date.now()}-1`, status: 'ai-suggested', label: 'Salaire reprise mi-temps', tiers: 'Employeur', periode: 'Sept 2024 - Jan 2025', periodeDebut: '12/09/2024', periodeFin: '15/01/2025', montant: 4800, pieceIds: [] },
              ],
              ijPercues: [
                { id: `pgpf-ij-${Date.now()}-1`, status: 'ai-suggested', label: 'IJ CPAM (mi-temps thérapeutique)', tiers: 'CPAM', periode: 'Sept 2024 - Jan 2025', periodeDebut: '12/09/2024', periodeFin: '15/01/2025', montant: 3200, pieceIds: [] },
              ],
            },
            'pgpf-al': {
              params: {
                perteGainAnnuelle: 9450,
                ageConsolidation: 42,
                baremeCapitalisation: 'gazette-palais-2025-0.5',
                coefficient: 24.5,
                montantCapitalise: 231525,
              },
              tiersPayeurs: [
                { id: `pgpf-tp-${Date.now()}-1`, label: 'Rente CPAM', tiers: 'CPAM', renteAnnuelle: 3600, coefficient: 24.5, montantCapitalise: 88200 },
                { id: `pgpf-tp-${Date.now()}-2`, label: 'Rente prévoyance', tiers: 'AG2R', renteAnnuelle: 1800, coefficient: 24.5, montantCapitalise: 44100 },
              ],
            },
          },
        });
      }

      if (posteId === 'se' && (!formPosteData.se || formPosteData.se.montant === 0)) {
        setFormPosteData(prev => ({ ...prev, se: { referentiel: 'cours-appel-2024', cotation: 4, montant: 15000 } }));
      }
      if (posteId === 'dfp' && (!formPosteData.dfp || formPosteData.dfp.montant === 0)) {
        setFormPosteData(prev => ({ ...prev, dfp: { referentiel: 'cours-appel-2024', age: 42, taux: 18, trancheAge: 'inferieure', trancheTaux: 'inferieure', pointBase: 1500, montant: 27000 } }));
      }
      if (posteId === 'pep' && (!formPosteData.pep || formPosteData.pep.montant === 0)) {
        setFormPosteData(prev => ({ ...prev, pep: { referentiel: 'cours-appel-2024', cotation: 3, montant: 4500 } }));
      }

      // ---- Draft argumentation notes ----
      const mockNotes = {
        dsa: `Au titre des dépenses de santé actuelles, la victime justifie des frais médicaux engagés suite à l'accident du 05/06/2022, comprenant l'hospitalisation initiale au CHU de Bordeaux (4 500 €), les séances de kinésithérapie prescrites (1 280 €), l'IRM de contrôle (320 €), les traitements médicamenteux (87,50 €) et les consultations spécialisées (55 €).\n\nAprès déduction des remboursements de la sécurité sociale et de la mutuelle, le reste à charge s'établit à 712,50 €. Il est demandé la prise en charge intégrale de ce solde au titre de l'indemnisation.`,
        dft: `Le déficit fonctionnel temporaire s'apprécie au regard du rapport d'expertise du Dr. Leroy en date du 15/01/2024.\n\nLa victime a subi un DFT total (100%) durant les phases d'hospitalisation et d'alitement strict (27 jours), puis un DFT partiel décroissant : 50% pendant la convalescence (76 jours), 40% pendant la rééducation active (92 jours), 25% pendant la rééducation d'entretien (92 jours), et 15% pour la gêne résiduelle jusqu'à consolidation (301 jours).\n\nSur la base d'un forfait journalier de 28 €/jour, conforme à la jurisprudence récente de la Cour d'appel de Bordeaux (CA Bordeaux, 5ème ch., 12 mars 2024), l'indemnité totale au titre du DFT s'élève à 5 385 €.`,
        pgpa: `La victime occupait un poste de cadre commercial avec un revenu annuel de référence de 37 800 € net, établi sur la moyenne des revenus 2021-2022 revalorisés selon l'indice IPC.\n\nDurant la période d'arrêt de travail (18 mois, du 15/03/2023 au 12/09/2024), la victime a perçu un maintien partiel de salaire par son employeur (8 500 €) ainsi que des indemnités journalières CPAM (11 650 €) et de prévoyance AG2R (4 850 €).\n\nLa perte de gains professionnels actuels nette s'établit à 31 700 € (revenu attendu) - 8 500 € (maintien) - 11 650 € (IJ CPAM) - 4 850 € (IJ prévoyance) = 6 700 €.`,
        pgpf: `Postérieurement à la consolidation fixée au 12/09/2024, la victime conserve une incapacité partielle affectant sa capacité de gain.\n\nPour la période échue (consolidation → liquidation, 4 mois) : la victime a repris à mi-temps thérapeutique avec un salaire réduit de 4 800 € et des IJ CPAM complémentaires de 3 200 €, générant une perte nette.\n\nPour la période à échoir : la perte de gain annuelle est estimée à 9 450 €, capitalisée selon le barème de la Gazette du Palais 2025 (taux 0,5%), coefficient 24,5 pour un homme de 42 ans, soit un capital de 231 525 €.`,
        se: `Les souffrances endurées sont évaluées à 4/7 au regard du rapport d'expertise, tenant compte des interventions chirurgicales, de la durée de la rééducation et de l'intensité des douleurs rapportées.\n\nSelon le référentiel indicatif de la Cour d'appel 2024, une cotation de 4/7 correspond à une fourchette de 12 000 à 18 000 €. Il est sollicité la somme de 15 000 € au titre de ce poste.`,
        dfp: `Le déficit fonctionnel permanent est fixé à 18% par l'expert, tenant compte des séquelles de raideur articulaire, des douleurs résiduelles et de la boiterie légère.\n\nPour un homme de 42 ans à la date de consolidation, le point d'indemnisation est fixé à 1 500 € selon le référentiel de la Cour d'appel 2024 (tranche d'âge inférieure, tranche de taux inférieure).\n\nL'indemnité au titre du DFP s'établit à : 18 × 1 500 = 27 000 €.`,
        pep: `Le préjudice esthétique permanent est évalué à 3/7 par l'expert, en raison des cicatrices chirurgicales au niveau du membre inférieur droit et de la boiterie résiduelle.\n\nSelon le référentiel indicatif de la Cour d'appel 2024, une cotation de 3/7 correspond à une fourchette de 3 000 à 6 000 €. Il est sollicité la somme de 4 500 € au titre de ce poste.`,
      };

      if (mockNotes[posteId]) {
        setPosteNotes(prev => ({ ...prev, [posteId]: prev[posteId] || mockNotes[posteId] }));
      }

      // ---- Chat summary ----
      const resultTexts = {
        dsa: `DSA calculé : 6 242,50 €. 5 lignes de dépenses pré-remplies et argumentation rédigée.`,
        dft: `DFT calculé : 5 385 €. 7 périodes renseignées, forfait 28 €/jour. Argumentation rédigée.`,
        pgpa: `PGPA calculé : 6 700 €. Revenu de référence : 37 800 €/an, 18 mois d'arrêt, déduction IJ et maintien. Argumentation rédigée.`,
        pgpf: `PGPF calculé. Période échue et capitalisation viagère renseignées. Barème Gazette du Palais 2025 appliqué. Notes rédigées.`,
        se: `SE évalué à 15 000 € (cotation 4/7, référentiel Cour d'appel 2024). Argumentation rédigée.`,
        dfp: `DFP évalué : 27 000 € (18% × 1 500 €/point). Argumentation rédigée.`,
        pep: `PEP évalué à 4 500 € (cotation 3/7, référentiel Cour d'appel 2024). Argumentation rédigée.`,
      };

      setChatMessages(prev => {
        const withoutThinking = prev.filter(m => !(m.type === 'ai-thinking' && m._posteCalcId === posteId));
        return [
          ...withoutThinking,
          {
            type: 'ai',
            thinkingLabel: `Calcul ${posteName} terminé`,
            text: resultTexts[posteId] || `${posteName} calculé. Données et argumentation reportées.`,
          },
        ];
      });
    }, 400 + calcTools.length * 500 + 300);
    chatAnalysisTimeouts.current.push(finalT);
  };

  // When user navigates to a poste → chat greets + analyzes docs → proposes (no calculation yet)
  useEffect(() => {
    const currentLevel = navStack[navStack.length - 1];
    if (!currentLevel || currentLevel.type !== 'poste') return;
    const posteId = currentLevel.id;
    if (!posteId || chatAnalyzedPostes.current.has(posteId)) return;

    // Only auto-analyze if postes have been announced (extraction flow completed)
    if (!chatPostesAnnounced.current && chatMessages.length === 0) return;

    chatAnalyzedPostes.current.add(posteId);

    const tid = setTimeout(() => {
      const taxo = POSTES_TAXONOMY.flatMap(s => s.categories.flatMap(c => c.postes)).find(p => p.id === posteId);
      if (!taxo) return;
      const posteName = taxo.acronym || posteId.toUpperCase();
      const welcome = posteWelcomeMap[posteId] || { greeting: `Bienvenue sur le ${posteName} !`, analysis: 'Je consulte les documents du dossier...', proposal: `J'ai trouvé des éléments à calculer. Voulez-vous que je lance le calcul du ${posteName} ?` };
      const discoveryTools = posteDiscoveryToolMap[posteId] || [{ tool: 'readDocument', detail: 'Pièces du dossier', expandedText: 'Analyse des documents...' }];

      setChatSidebarOpen(true);

      // Clear any lingering timeouts
      chatAnalysisTimeouts.current.forEach(t => clearTimeout(t));
      chatAnalysisTimeouts.current = [];

      // Phase 1: Welcome message
      setChatMessages(prev => [
        ...prev,
        { type: 'ai', text: welcome.greeting },
      ]);

      // Phase 2: Thinking — reading docs
      const t1 = setTimeout(() => {
        setChatMessages(prev => [
          ...prev,
          { type: 'ai-thinking', label: welcome.analysis, steps: [], expanded: false, _posteDiscoveryId: posteId },
        ]);
      }, 500);
      chatAnalysisTimeouts.current.push(t1);

      // Phase 2b: Add discovery steps progressively
      discoveryTools.forEach((toolData, idx) => {
        const t = setTimeout(() => {
          setChatMessages(prev => prev.map(m => {
            if (m.type === 'ai-thinking' && m._posteDiscoveryId === posteId) {
              return { ...m, steps: [...(m.steps || []), toolData] };
            }
            return m;
          }));
        }, 800 + idx * 600);
        chatAnalysisTimeouts.current.push(t);
      });

      // Phase 3: Proposal with action button
      const proposalT = setTimeout(() => {
        setChatMessages(prev => [
          ...prev,
          {
            type: 'ai-proposal',
            text: welcome.proposal,
            posteId: posteId,
            posteName: posteName,
          },
        ]);
      }, 800 + discoveryTools.length * 600 + 400);
      chatAnalysisTimeouts.current.push(proposalT);
    }, 400);

    return () => clearTimeout(tid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navStack]);

  // ========== CALCULS ==========
  const dsaTotal = dsaLignes.filter(l => l.status === 'validated').reduce((s, l) => s + (l.montant || 0), 0);
  
  const pgpaRevPercusTotal = pgpaData.revenusPercus.reduce((s, l) => s + l.montant, 0);
  const pgpaIjTotal = pgpaData.ijPercues.reduce((s, l) => s + l.montant, 0);
  const pgpaTotal = pgpaData.revenuRef.total > 0 ? Math.round((pgpaData.revenuRef.total / 12) * pgpaData.periode.mois - pgpaRevPercusTotal - pgpaIjTotal) : 0;
  
  const pgpfClPeriode = pgpfData.periodes['pgpf-cl'];
  const pgpfAlPeriode = pgpfData.periodes['pgpf-al'];
  const pgpfClTotal = pgpfClPeriode
    ? Math.round((pgpfClPeriode.revenuRef.total / 12) * pgpfClPeriode.periode.mois)
      - pgpfClPeriode.revenusPercus.reduce((s, l) => s + l.montant, 0)
      - pgpfClPeriode.ijPercues.reduce((s, l) => s + l.montant, 0)
    : 0;
  const pgpfAlTotal = pgpfAlPeriode?.params?.montantCapitalise || 0;
  const pgpfTotal = pgpfClTotal + pgpfAlTotal;

  const dftTotal = dftLignes.reduce((s, l) => s + l.montant, 0);

  // Category mapping for Nomenclature Dintilhac
  const CATEGORY_MAP = {
    'vd-pat-temp': { id: 'patrimoniaux-temp', title: 'Préjudices Patrimoniaux Temporaires' },
    'vd-expat-temp': { id: 'extra-patrimoniaux-temp', title: 'Préjudices Extra-Patrimoniaux Temporaires' },
    'vd-pat-perm': { id: 'patrimoniaux-perm', title: 'Préjudices Patrimoniaux Permanents' },
    'vd-expat-perm': { id: 'extra-patrimoniaux-perm', title: 'Préjudices Extra-Patrimoniaux Permanents' },
    'vd-hors-conso': { id: 'hors-conso', title: 'Autres Préjudices Hors Consolidation' },
    'vd-annexes': { id: 'annexes', title: 'Annexes' },
    'vi-pat': { id: 'vi-pat', title: 'Préjudices Patrimoniaux (Victimes Indirectes)' },
    'vi-expat': { id: 'vi-expat', title: 'Préjudices Extra-Patrimoniaux (Victimes Indirectes)' },
  };

  // Flatten taxonomy for lookups
  const allTaxoPostes = POSTES_TAXONOMY.flatMap(s => s.categories.flatMap(c => c.postes.map(p => ({ ...p, categoryId: c.id }))));

  const getPosteMontant = (id) => {
    if (id === 'dsa') return dsaTotal;
    if (id === 'pgpa') return pgpaTotal;
    if (id === 'dft') return dftTotal;
    if (id === 'pgpf') return pgpfTotal;
    return formPosteData[id]?.montant || 0;
  };

  const allPostes = dossierPostes.map(id => {
    const taxo = allTaxoPostes.find(p => p.id === id);
    if (!taxo) return null;
    const cat = CATEGORY_MAP[taxo.categoryId];
    return {
      id,
      title: taxo.acronym || id.toUpperCase(),
      fullTitle: taxo.label,
      montant: getPosteMontant(id),
      category: cat?.id || 'patrimoniaux-temp',
    };
  }).filter(Boolean);

  const categories = Object.values(CATEGORY_MAP)
    .map(cat => ({ ...cat, postes: allPostes.filter(p => p.category === cat.id) }))
    .filter(cat => cat.postes.length > 0);

  const totalChiffrage = allPostes.reduce((s, p) => s + p.montant, 0);

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

  // ========== PIECES HELPERS ==========
  const getTypeColor = (type) => {
    const colors = {
      'Facture': 'bg-blue-100 text-[#1e3a8a]',
      'Bulletin': 'bg-green-100 text-green-700',
      'Attestation': 'bg-purple-100 text-purple-700',
      'Expertise': 'bg-amber-100 text-amber-700',
      'Imagerie': 'bg-pink-100 text-pink-700',
      'Ordonnance': 'bg-cyan-100 text-cyan-700'
    };
    return colors[type] || 'bg-[#F8F7F5] text-gray-700';
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
      <div className="flex flex-col -mx-4 -mt-4">
        {/* Sub-header bar — full width, edge-to-edge */}
        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-[#e7e5e3]">
          <span className="flex-1 text-sm font-medium text-[#292524]">{piecesArray.length} pièce{piecesArray.length > 1 ? 's' : ''}</span>
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2 px-3 py-2 bg-white border border-[#e7e5e3] rounded-lg shadow-sm text-sm text-[#78716c] cursor-pointer hover:border-[#d6d3d1]">
              <ListFilter className="w-4 h-4" strokeWidth={1.5} />
              <span>Filtrer par type</span>
              <ChevronDown className="w-4 h-4" strokeWidth={1.5} />
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-white border border-[#e7e5e3] rounded-lg shadow-sm">
              <Search className="w-4 h-4 text-[#78716c]" strokeWidth={1.5} />
              <span className="text-sm text-[#78716c] opacity-70">Rechercher...</span>
            </div>
            <button className="px-3 py-2 text-sm font-medium text-[#44403c] bg-[#eeece6] rounded-md hover:bg-[#e7e5e3] transition-colors">
              Bordereau
            </button>
          </div>
        </div>

        {/* Content container with padding */}
        <div className="p-4">
          {/* Drop zone */}
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
              className={`mb-4 flex items-center justify-center gap-4 h-16 border border-dashed rounded-lg cursor-pointer transition-colors ${isDragging ? 'border-[#d6d3d1] bg-[#f5f5f4]' : 'border-[#d6d3d1] hover:border-[#a8a29e]'}`}
              style={{ background: isDragging ? '#f5f5f4' : 'linear-gradient(to top, rgba(238,236,230,0) 50%, #f8f7f5 100%)' }}
            >
              <Upload className="w-5 h-5 text-[#78716c]" strokeWidth={1.5} />
              <span className="text-sm">
                <span className="text-[#78716c]">Déposez ou </span>
                <span className="font-medium text-[#1e3a8a]">cliquez</span>
                <span className="text-[#78716c]"> pour ajouter de nouvelles pièces</span>
              </span>
            </div>
          )}

          {/* Table */}
          <div className="border border-[#e7e5e3] rounded-md overflow-hidden">
            {/* Column headers */}
            <div className="flex items-center bg-white border-b border-[#e7e5e3]">
              <div className="w-[38px] h-10 shrink-0" />
              <div className="w-[50px] shrink-0 px-3 py-3 text-center" style={colHeaderStyle}>N°</div>
              <div className="flex-1 min-w-0 px-3 py-3" style={colHeaderStyle}>Nom du document</div>
              <div className="w-[174px] shrink-0 px-3 py-3" style={colHeaderStyle}>Type</div>
              <div className="w-[120px] shrink-0 px-3 py-3" style={colHeaderStyle}>Date</div>
              <div className="w-[224px] shrink-0 px-3 py-3" style={colHeaderStyle}>Postes liés</div>
              <div className="w-[44px] shrink-0" />
            </div>

            {/* Rows */}
            {sortedPieces.map((piece) => {
              const globalIndex = pieces.findIndex(p => p.id === piece.id) + 1;
              const usages = getPieceUsage(piece.id);
              return (
                <div
                  key={piece.id}
                  className="flex items-center h-14 bg-white border-b border-[#e7e5e3] last:border-b-0 hover:bg-[#fafaf9] cursor-pointer group"
                  onClick={() => setEditPanel({ type: 'piece-detail', data: { ...piece, index: globalIndex, usages } })}
                >
                  {/* Grip */}
                  <div className="w-[38px] shrink-0 flex items-center justify-center pl-3">
                    <GripVertical className="w-3.5 h-3.5 text-[#d6d3d1] opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={1.5} />
                  </div>
                  {/* Number badge */}
                  <div className="w-[50px] shrink-0 flex items-center justify-center pl-4 pr-3">
                    <span className="inline-flex items-center justify-center w-[22px] h-[22px] bg-[#eeece6] text-[#78716c] text-xs font-semibold rounded-md">
                      {globalIndex}
                    </span>
                  </div>
                  {/* Document name */}
                  <div className="flex-1 min-w-0 px-3">
                    <span className="text-sm font-medium text-black truncate block">{piece.intitule || piece.nom.replace(/\.[^/.]+$/, '')}</span>
                  </div>
                  {/* Type badge */}
                  <div className="w-[174px] shrink-0 px-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md ${PIECE_TYPE_COLORS[piece.type] || 'bg-[#eeece6] text-[#44403c]'}`}>
                      {piece.type}
                      <ChevronDown className="w-3 h-3" strokeWidth={1.5} />
                    </span>
                  </div>
                  {/* Date */}
                  <div className="w-[120px] shrink-0 px-3">
                    <span className="text-sm text-[#292524]">{piece.date || '—'}</span>
                  </div>
                  {/* Postes liés */}
                  <div className="w-[224px] shrink-0 px-3">
                    {usages.length > 0 ? (
                      <div className="flex flex-wrap gap-1 overflow-hidden">
                        {usages.map(u => (
                          <span key={u} className="px-2 py-0.5 text-xs font-medium text-[#44403c] bg-[#eeece6] rounded-md">{u}</span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-[#a8a29e]">—</span>
                    )}
                  </div>
                  {/* Options */}
                  <div className="w-[44px] shrink-0 flex items-center justify-end pr-4">
                    <MoreVertical className="w-4 h-4 text-[#78716c] opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={1.5} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const tabsConfig = { dossier: ['Dossier', 'Chiffrage', 'Pièces', 'Actes', 'JP'], poste: [] };
  const currentTabs = currentLevel ? (tabsConfig[currentLevel.type] || []) : [];
  const _getSiblings = () => currentLevel?.type === 'poste' ? allPostes.filter(p => p.id !== currentLevel.id && !p.disabled) : []; // eslint-disable-line no-unused-vars

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

    // Reset chat state for new dossier
    setChatMessages([]);
    chatExtractionAnnounced.current = false;
    chatPostesAnnounced.current = false;
    chatAnalyzedPostes.current = new Set();

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

  // ========== SMART ADD POSTE — shared handler for badge click + chat ==========
  const handleSmartAddPoste = (posteId) => {
    const taxo = allTaxoPostes.find(p => p.id === posteId);
    if (!taxo) return;

    // Add poste to dossier if not present
    if (!dossierPostes.includes(posteId)) {
      setDossierPostes(prev => [...prev, posteId]);
    }

    // Navigate to poste detail — the navStack useEffect will auto-trigger chat analysis
    navigateTo({ id: posteId, title: taxo.acronym || posteId.toUpperCase(), fullTitle: taxo.label, type: 'poste', montant: 0 });
    setChatSidebarOpen(true);
  };

  // ========== CHAT SEND — handles user messages + intent detection ==========
  const handleChatSend = () => {
    const text = chatInputValue.trim();
    if (!text && stagedDocs.length === 0) return;

    // Push user message
    const userMsg = { type: 'user', text: text || 'Documents ajoutés', attachments: stagedDocs.length > 0 ? [...stagedDocs] : undefined };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInputValue('');
    setStagedDocs([]);

    // Intent detection: look for poste acronyms in message
    const upperText = text.toUpperCase();
    const matched = allTaxoPostes.find(p => {
      if (p.acronym && upperText.includes(p.acronym)) return true;
      if (upperText.includes(p.id.toUpperCase())) return true;
      return false;
    });

    if (matched) {
      // Delay slightly so user message renders first
      setTimeout(() => handleSmartAddPoste(matched.id), 300);
    } else {
      // Generic response
      setTimeout(() => {
        setChatMessages(prev => [...prev, {
          type: 'ai',
          text: "Je suis prêt à vous aider. Vous pouvez me demander de calculer un poste spécifique (ex: \"Calcule le DFT\") ou ajouter un poste depuis l'onglet Chiffrage.",
        }]);
      }, 500);
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
      setEditPanel({ type: 'dft-ligne', title: 'Éditer la dépense', data: newLigne });
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
    setEditPanel({ type: 'dsa-ligne', title: 'Éditer la dépense', data: ligne });
  };

  // Helper pour ouvrir le panel d'édition PGPA avec initialisation des pieceIds
  const openPgpaEditPanel = (type, ligne) => {
    setEditingPieceIds(ligne.pieceIds || []);
    setSearchPiecesPanel('');
    const titles = { 'pgpa-revenu': 'Ajouter/Modifier une période de revenu', 'pgpa-revenu-percu': 'Ajouter/Modifier une période de revenu perçu', 'pgpa-ij': 'Ajouter/Modifier une perte de chance' };
    setEditPanel({ type, title: titles[type] || 'Édition', data: ligne });
  };

  // ========== TOP BAR ==========
  const renderTopBar = () => {
    const dossierTabs = tabsConfig.dossier;
    return (
      <div className="w-full h-14 bg-white border-b border-stone-200/60 flex items-center justify-between px-4 flex-shrink-0 relative">
        {/* Left: Home + victim name */}
        <div className="flex items-center gap-3 min-w-0 flex-shrink-0">
          <button onClick={backToList} className="w-8 h-8 flex items-center justify-center bg-[#eeece6] rounded-[6px] hover:bg-[#e7e5e3] transition-colors flex-shrink-0">
            <Folder className="w-4 h-4 text-[#44403c]" strokeWidth={1.5} />
          </button>
          <span className="truncate" style={{ fontFamily: "'RL Para Trial Central', Georgia, serif", fontSize: '16px', fontWeight: 500, color: '#292524', letterSpacing: '-0.3px' }}>
            {victimeData.prenom} {victimeData.nom}
          </span>
        </div>

        {/* Center: Tabs — absolutely centered so they never shift */}
        <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 flex items-center pointer-events-none">
          <div className="pointer-events-auto flex gap-1">
          <div className="flex gap-1">
            {dossierTabs.map(tab => {
              const tabKey = tab.toLowerCase();
              const isActive = currentLevel?.type === 'dossier'
                ? currentLevel.activeTab === tabKey
                : navStack[0]?.activeTab === tabKey;
              const hasExtracted = tab === 'Dossier' && infoDossierStreaming?.fieldsRevealed?.length > 0;
              const showDot = hasExtracted && !isActive;
              return (
                <button
                  key={tab}
                  onClick={() => {
                    if (currentLevel?.type === 'poste') {
                      navigateToStackLevel(0);
                      setTimeout(() => setActiveTab(tab), 0);
                    } else {
                      setActiveTab(tab);
                    }
                  }}
                  className={`px-4 py-3 text-body-medium relative transition-colors ${isActive ? 'text-stone-800' : 'text-stone-400 hover:text-stone-600'}`}
                >
                  <span className="flex items-center gap-1.5">
                    {tab}
                    {showDot && <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse-scale" />}
                  </span>
                  {isActive && <div className="absolute bottom-0 left-2 right-2 h-[2px] bg-stone-800 rounded-full" />}
                </button>
              );
            })}
          </div>
        </div></div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 justify-end">
          {/* Chiffrage CTAs removed from header — now in content page */}
          <div className="w-px h-5 bg-[#e7e5e3]" />
          {chatSidebarOpen ? (
            <button
              onClick={() => setChatSidebarOpen(false)}
              className="p-1.5 hover:bg-stone-100 rounded-lg transition-colors"
              title="Masquer le chat"
            >
              <PanelRightClose className="w-5 h-5 text-stone-500" strokeWidth={1.5} />
            </button>
          ) : (
            <button
              onClick={() => setChatSidebarOpen(true)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all hover:shadow-md"
              title="Ouvrir Plato Assistant"
              style={{
                border: '1px solid #aabcd5',
                boxShadow: '0px 1px 2px 0px rgba(0,0,0,0.05)',
                backgroundImage: `url("data:image/svg+xml;utf8,<svg viewBox='0 0 200 36' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect x='0' y='0' height='100%25' width='100%25' fill='url(%23grad)' opacity='0.2'/><defs><radialGradient id='grad' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(0 -3.29 7.6 -0.48 100 18)'><stop stop-color='rgba(185,112,63,1)' offset='0'/><stop stop-color='rgba(203,148,111,0.75)' offset='0.25'/><stop stop-color='rgba(220,183,159,0.5)' offset='0.5'/><stop stop-color='rgba(255,255,255,0)' offset='1'/></radialGradient></defs></svg>"), linear-gradient(90deg, #f8f7f5 0%, #f8f7f5 100%)`,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                <rect width="16" height="16" rx="3" fill="#E8713A" />
                <path d="M4.5 11V5.5H7.25C7.75 5.5 8.15 5.65 8.45 5.95C8.75 6.25 8.9 6.6 8.9 7.05C8.9 7.5 8.75 7.85 8.45 8.15C8.15 8.45 7.75 8.6 7.25 8.6H5.8V11H4.5ZM5.8 7.5H7.1C7.3 7.5 7.45 7.45 7.55 7.35C7.65 7.25 7.7 7.1 7.7 6.95C7.7 6.8 7.65 6.65 7.55 6.55C7.45 6.45 7.3 6.4 7.1 6.4H5.8V7.5Z" fill="white" />
              </svg>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 500, fontSize: '12px', color: '#50443e', whiteSpace: 'nowrap' }}>
                PLATO ASSISTANT
              </span>
            </button>
          )}
        </div>
      </div>
    );
  };

  // ========== CHAT SIDEBAR ==========
  const handleChatResizeStart = (e) => {
    e.preventDefault();
    chatResizing.current = true;
    const startX = e.clientX;
    const startWidth = chatWidth;
    const onMove = (ev) => {
      const delta = startX - ev.clientX;
      setChatWidth(Math.min(640, Math.max(300, startWidth + delta)));
    };
    const onUp = () => {
      chatResizing.current = false;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  // Plato logo icon (orange P) — reusable
  const PlatoIcon = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
      <rect width="16" height="16" rx="3" fill="#E8713A" />
      <path d="M4.5 11V5.5H7.25C7.75 5.5 8.15 5.65 8.45 5.95C8.75 6.25 8.9 6.6 8.9 7.05C8.9 7.5 8.75 7.85 8.45 8.15C8.15 8.45 7.75 8.6 7.25 8.6H5.8V11H4.5ZM5.8 7.5H7.1C7.3 7.5 7.45 7.45 7.55 7.35C7.65 7.25 7.7 7.1 7.7 6.95C7.7 6.8 7.65 6.65 7.55 6.55C7.45 6.45 7.3 6.4 7.1 6.4H5.8V7.5Z" fill="white" />
    </svg>
  );

  // Orange dot grid icon for AI thinking
  const PlatoDotGrid = () => (
    <div className="flex-shrink-0" style={{ width: 15, height: 15, display: 'flex', flexDirection: 'column', gap: 1 }}>
      {[0, 1, 2].map(row => (
        <div key={row} style={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
          {[0, 1, 2].map(col => (
            <div key={col} style={{ width: 3, height: 3, backgroundColor: '#ea7949', borderRadius: 0.5, transform: 'rotate(45deg)' }} />
          ))}
        </div>
      ))}
    </div>
  );

  // Chat state
  const [chatInputValue, setChatInputValue] = useState('');
  const [chatInputFocused, setChatInputFocused] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [stagedDocs, setStagedDocs] = useState([]);
  const chatAnalysisTimeouts = useRef([]);
  const chatExtractionAnnounced = useRef(false);
  const chatPostesAnnounced = useRef(false);
  const chatAnalyzedPostes = useRef(new Set()); // track which postes chat has already analyzed

  const renderChatSidebar = () => {
    const hasContent = chatInputValue.trim().length > 0 || stagedDocs.length > 0;

    return (
      <>
        {/* Draggable resize handle */}
        <div
          className="w-[6px] flex-shrink-0 cursor-col-resize group relative border-l border-r border-[#e7e5e3]"
          style={{ backgroundColor: '#F8F7F5' }}
          onMouseDown={handleChatResizeStart}
        >
          <div className="absolute inset-y-0 -left-1 -right-1 group-hover:bg-stone-300/30 transition-colors" />
        </div>
        <div className="flex-shrink-0 flex flex-col h-full" style={{ width: chatWidth, backgroundColor: '#F8F7F5' }}>
          {/* Header — Badge */}
          <div className="px-4 h-12 border-b flex items-center gap-2.5 flex-shrink-0" style={{ borderColor: '#e7e5e3' }}>
            <PlatoIcon />
            <span className="flex-1" style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 500, fontSize: '12px', color: '#78716c', lineHeight: '32px' }}>
              PLATO MASTER
            </span>
          </div>

          {/* Chat messages area */}
          <div
            className="flex-1 overflow-y-auto p-5 flex flex-col gap-2.5"
            style={{ backgroundColor: '#F8F7F5' }}
            ref={el => {
              if (el) el.scrollTop = el.scrollHeight;
            }}
          >
            {chatMessages.length === 0 && (
              <div className="flex flex-col items-center justify-center flex-1 py-12 px-6">
                <PlatoIcon />
                <p style={{ fontSize: 13, color: '#a8a29e', textAlign: 'center', marginTop: 12, lineHeight: '18px' }}>
                  Ajoutez un poste depuis l'onglet Chiffrage ou demandez-moi directement de calculer un préjudice.
                </p>
              </div>
            )}
            {chatMessages.map((msg, i) => {
              // User message bubble
              if (msg.type === 'user') {
                return (
                  <div key={i} className="flex flex-col items-end pb-4" style={{ paddingLeft: 32 }}>
                    <div
                      className="w-full"
                      style={{
                        backgroundColor: '#292524',
                        borderRadius: 6,
                        padding: '10px 12px',
                        boxShadow: '0px 1px 2px 0px rgba(26,26,26,0.05)',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      <p style={{ fontSize: 14, lineHeight: '20px', color: 'white', margin: 0 }}>{msg.text}</p>
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {msg.attachments.map((doc, di) => (
                            <span key={di} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-white/10 text-white/80">
                              <FileText className="w-3 h-3" />{doc.name}
                            </span>
                          ))}
                        </div>
                      )}
                      <div style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', boxShadow: 'inset 0px -5px 8px 0px rgba(255,255,255,0.12)', pointerEvents: 'none' }} />
                    </div>
                  </div>
                );
              }

              // AI thinking status — collapsible stepper with animations
              if (msg.type === 'ai-thinking') {
                const isExpanded = msg.expanded;
                const steps = msg.steps || [];
                const currentStep = steps.length > 0 ? steps[steps.length - 1] : null;
                const stepIconMap = {
                  readDocument: Search, readExpertise: Search, readBulletins: Search, readBaremes: Search,
                  extractMontants: FileMinus, extractPeriods: FileMinus, extractRevenus: FileMinus,
                  extractInfoDossier: FileText, detectPostes: ListChecks, analyseDocuments: FileSearch,
                  calculDSA: Radical, calculDFT: Radical, calculPGPA: Radical, calculCapitalisation: Radical, calculPGPF: Radical,
                  calculSE: Radical, calculDFP: Radical, calculPEP: Radical,
                };
                const stepStatusColor = (si) => si < steps.length - 1 ? '#16a34a' : '#ea7949';
                return (
                  <div key={i} className="flex flex-col items-start" style={{ paddingRight: 20 }}>
                    {/* Header — always visible */}
                    <div
                      className="flex items-center gap-2.5 cursor-pointer select-none py-1.5 w-full"
                      onClick={() => setChatMessages(prev => prev.map((m, mi) => mi === i ? { ...m, expanded: !m.expanded } : m))}
                    >
                      <div className="animate-dot-grid-pulse"><PlatoDotGrid /></div>
                      <span className="flex-1 min-w-0 truncate" style={{ fontSize: 12, fontWeight: 500, color: '#78716c', lineHeight: '16px' }}>
                        {currentStep ? currentStep.detail || currentStep.tool : msg.label}
                      </span>
                      {/* Animated dots for active state */}
                      {steps.length > 0 && (
                        <span className="flex items-center gap-0.5 flex-shrink-0 mr-1">
                          <span className="w-1 h-1 rounded-full bg-[#ea7949] animate-thinking-dot-1" />
                          <span className="w-1 h-1 rounded-full bg-[#ea7949] animate-thinking-dot-2" />
                          <span className="w-1 h-1 rounded-full bg-[#ea7949] animate-thinking-dot-3" />
                        </span>
                      )}
                      {isExpanded ? <ChevronDown className="w-3 h-3 text-[#a8a29e] flex-shrink-0" /> : <ChevronRight className="w-3 h-3 text-[#a8a29e] flex-shrink-0" />}
                    </div>
                    {/* Expanded timeline */}
                    {isExpanded && steps.length > 0 && (
                      <div className="flex flex-col mt-0.5 ml-[7px] mb-1">
                        {steps.map((step, si) => {
                          const StepIcon = stepIconMap[step.tool] || Search;
                          const isLast = si === steps.length - 1;
                          const isDone = si < steps.length - 1;
                          const dotColor = stepStatusColor(si);
                          return (
                            <div key={si} className="flex gap-3 items-start animate-step-slide-in" style={{ animationDelay: `${si * 50}ms` }}>
                              <div className="flex flex-col items-center flex-shrink-0" style={{ width: 16 }}>
                                {isDone ? (
                                  <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#dcfce7' }}>
                                    <Check className="w-2.5 h-2.5 text-[#16a34a]" strokeWidth={2.5} />
                                  </div>
                                ) : (
                                  <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#fff7ed', border: '1.5px solid #ea7949' }}>
                                    <StepIcon className="flex-shrink-0" style={{ width: 8, height: 8, color: '#ea7949' }} />
                                  </div>
                                )}
                                {!isLast && <div className="animate-line-grow" style={{ width: 1.5, flex: 1, minHeight: 16, backgroundColor: isDone ? '#86efac' : '#e7e5e3', borderRadius: 1 }} />}
                              </div>
                              <div style={{ paddingBottom: isLast ? 0 : 10, paddingTop: 1 }}>
                                <span style={{ fontSize: 12, fontWeight: isDone ? 400 : 500, color: isDone ? '#a8a29e' : '#44403c', lineHeight: '16px', letterSpacing: 0.12 }}>
                                  {step.expandedText || step.detail || step.tool}
                                </span>
                                {isDone && <span style={{ fontSize: 11, color: '#16a34a', marginLeft: 6 }}>✓</span>}
                              </div>
                            </div>
                          );
                        })}
                        {/* Active indicator at bottom */}
                        <div className="flex items-center gap-2 mt-1 ml-1">
                          <span className="flex items-center gap-0.5">
                            <span className="w-1 h-1 rounded-full bg-[#ea7949] animate-thinking-dot-1" />
                            <span className="w-1 h-1 rounded-full bg-[#ea7949] animate-thinking-dot-2" />
                            <span className="w-1 h-1 rounded-full bg-[#ea7949] animate-thinking-dot-3" />
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              // Tool call chip (collapsed)
              if (msg.type === 'tool-call') {
                return (
                  <div key={i} className="flex items-center gap-2 py-0.5" style={{ paddingRight: 20 }}>
                    <div
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full cursor-pointer hover:bg-emerald-100/80 transition-colors"
                      style={{ backgroundColor: '#ecfdf5', border: '1px solid #d1fae5' }}
                      onClick={() => {
                        setChatMessages(prev => prev.map((m, mi) => mi === i ? { ...m, expanded: !m.expanded } : m));
                      }}
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span style={{ fontSize: 11, fontWeight: 500, color: '#065f46', fontFamily: "'IBM Plex Mono', monospace" }}>{msg.tool}</span>
                      {msg.detail && <span style={{ fontSize: 11, color: '#047857' }}>— {msg.detail}</span>}
                    </div>
                    {msg.expanded && msg.expandedText && (
                      <span style={{ fontSize: 12, color: '#78716c' }}>{msg.expandedText}</span>
                    )}
                  </div>
                );
              }

              // Upload CTA (agent asks for documents)
              if (msg.type === 'upload-cta') {
                return (
                  <div key={i} className="flex flex-col gap-2 items-start pb-3" style={{ paddingRight: 20 }}>
                    <p style={{ fontSize: 14, lineHeight: '20px', color: '#292524', margin: 0 }}>{msg.text}</p>
                    <button
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors hover:bg-stone-100"
                      style={{ backgroundColor: '#f5f5f4', color: '#44403c', border: '1px solid #e7e5e3' }}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Ajouter des pièces
                    </button>
                  </div>
                );
              }

              // Artifact cards (info dossier, postes suggérés)
              if (msg.type === 'artifact-cards') {
                const iconMap = { FileText: FileText, Calculator: Calculator };
                return (
                  <div key={i} className="flex flex-col gap-2 pb-3 w-full" style={{ paddingRight: 20 }}>
                    {msg.cards.map(card => {
                      const CardIcon = iconMap[card.icon] || FileText;
                      return (
                        <div
                          key={card.id}
                          className="flex items-center gap-3 rounded-lg border border-[#e7e5e3] cursor-pointer group transition-all duration-200 hover:border-[#d6d3d1] hover:translate-y-[-1px]"
                          style={{
                            padding: '12px 14px',
                            background: 'linear-gradient(135deg, #ffffff 0%, #fafaf9 60%, #f5f5f4 100%)',
                            boxShadow: '0px 1px 3px 0px rgba(26,26,26,0.06), 0px 1px 2px -1px rgba(26,26,26,0.06), inset 0px -2px 4px 0px rgba(0,0,0,0.03)',
                          }}
                          onClick={() => {
                            setNavStack(prev => prev.map((n, ni) => ni === prev.length - 1 ? { ...n, activeTab: card.navigateTo } : n));
                          }}
                        >
                          <div
                            className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0"
                            style={{
                              background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
                              boxShadow: 'inset 0px -1px 2px 0px rgba(234,121,73,0.12)',
                              border: '1px solid rgba(234,121,73,0.15)',
                            }}
                          >
                            <CardIcon className="w-4 h-4" style={{ color: '#ea7949' }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div style={{ fontSize: 13, fontWeight: 500, color: '#292524', lineHeight: '18px' }}>{card.title}</div>
                            <div className="truncate" style={{ fontSize: 12, color: '#a8a29e', lineHeight: '16px' }}>{card.subtitle}</div>
                          </div>
                          <div
                            className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 px-2 py-1 rounded"
                            style={{ fontSize: 12, fontWeight: 500, color: '#ea7949', background: 'rgba(234,121,73,0.06)' }}
                          >
                            {card.action} <ChevronRight className="w-3 h-3" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              }

              // AI proposal — agent proposes, user validates
              if (msg.type === 'ai-proposal') {
                return (
                  <div key={i} className="flex flex-col gap-3 items-start pb-4" style={{ paddingRight: 20 }}>
                    <p style={{ fontSize: 14, lineHeight: '20px', color: '#292524', margin: 0 }}>{msg.text}</p>
                    <button
                      onClick={() => {
                        // Replace proposal with confirmed message
                        setChatMessages(prev => prev.map((m, mi) => mi === i ? { type: 'ai', text: msg.text } : m));
                        // Trigger calculation
                        handlePosteCalculation(msg.posteId);
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90"
                      style={{ backgroundColor: '#292524', color: 'white', boxShadow: '0px 1px 2px 0px rgba(26,26,26,0.05)' }}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Lancer le calcul {msg.posteName}
                    </button>
                  </div>
                );
              }

              // AI response with thinking steps
              if (msg.type === 'ai') {
                return (
                  <div key={i} className="flex flex-col gap-3 items-start pb-4" style={{ paddingRight: 20 }}>
                    {msg.thinkingLabel && (
                      <div className="flex flex-col gap-1.5 w-full">
                        <div className="flex items-center gap-3" style={{ paddingRight: 20 }}>
                          <p style={{ fontSize: 12, fontWeight: 500, color: '#78716c', lineHeight: '16px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'pre', margin: 0 }}>
                            {msg.thinkingLabel}{'  >'}
                          </p>
                        </div>
                        {msg.text && <p style={{ fontSize: 14, lineHeight: '20px', color: '#292524', margin: 0 }}>{msg.text}</p>}
                      </div>
                    )}
                    {!msg.thinkingLabel && msg.text && (
                      <p style={{ fontSize: 14, lineHeight: '20px', color: '#292524', margin: 0 }}>{msg.text}</p>
                    )}

                    {/* Action icons */}
                    <div className="flex items-center gap-2.5">
                      <button className="p-0 bg-transparent border-none cursor-pointer opacity-50 hover:opacity-100 transition-opacity">
                        <Copy className="w-3.5 h-3.5 text-[#78716c]" />
                      </button>
                      <button className="p-0 bg-transparent border-none cursor-pointer opacity-50 hover:opacity-100 transition-opacity">
                        <ThumbsUp className="w-3.5 h-3.5 text-[#78716c]" />
                      </button>
                      <button className="p-0 bg-transparent border-none cursor-pointer opacity-50 hover:opacity-100 transition-opacity">
                        <ThumbsDown className="w-3.5 h-3.5 text-[#78716c]" />
                      </button>
                      <button className="p-0 bg-transparent border-none cursor-pointer opacity-50 hover:opacity-100 transition-opacity">
                        <RotateCcw className="w-3.5 h-3.5 text-[#78716c]" />
                      </button>
                    </div>
                  </div>
                );
              }
              return null;
            })}
          </div>

          {/* Bottom input — Chat Input component */}
          <div
            className="px-3 pb-3 flex-shrink-0"
            style={{ backgroundColor: '#F8F7F5' }}
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const files = Array.from(e.dataTransfer.files);
              if (files.length > 0) {
                setStagedDocs(prev => [...prev, ...files.map(f => ({ name: f.name, size: f.size }))]);
              }
            }}
          >
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 2,
                border: hasContent ? '2px solid #aabcd5' : '2px solid white',
                boxShadow: hasContent
                  ? '0px 0px 0px 0px transparent, 0px 4px 6px -4px rgba(26,26,26,0.05), 0px 8px 10px -1px rgba(26,26,26,0.05)'
                  : '0px 0px 0px 1px #d6d3d1, 0px 4px 6px -4px rgba(26,26,26,0.05), 0px 8px 10px -1px rgba(26,26,26,0.05)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Staged document chips */}
              {stagedDocs.length > 0 && (
                <div className="flex flex-wrap gap-1.5 px-3 pt-2.5">
                  {stagedDocs.map((doc, di) => (
                    <span key={di} className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium" style={{ backgroundColor: '#f5f5f4', color: '#44403c', border: '1px solid #e7e5e3' }}>
                      <FileText className="w-3 h-3 text-[#78716c]" />
                      {doc.name}
                      <button onClick={() => setStagedDocs(prev => prev.filter((_, i) => i !== di))} className="ml-0.5 hover:text-red-500 transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              {/* Text area */}
              <div style={{ padding: '12px 12px 32px 12px' }}>
                <textarea
                  className="w-full text-[14px] resize-none focus:outline-none"
                  style={{ color: chatInputValue ? '#11181c' : '#78716c', lineHeight: '20px', minHeight: 20, maxHeight: 120 }}
                  placeholder="Demander à Plato Master de calculer, rechercher des JP, rédiger des actes..."
                  value={chatInputValue}
                  onChange={(e) => setChatInputValue(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleChatSend(); } }}
                  onFocus={() => setChatInputFocused(true)}
                  onBlur={() => setChatInputFocused(false)}
                  rows={1}
                />
              </div>

              {/* Bottom bar with actions */}
              <div
                className="flex items-center justify-between px-3 py-3"
                style={{
                  background: hasContent ? 'linear-gradient(to bottom, white 44.66%, #eeece6 100%)' : 'transparent',
                }}
              >
                <div className="flex items-center gap-0.5">
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-stone-100 transition-colors">
                    <Paperclip className="w-4 h-4 text-[#78716c]" />
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-stone-100 transition-colors">
                    <Lightbulb className="w-4 h-4 text-[#78716c]" />
                  </button>
                </div>
                <button
                  className="w-8 h-8 flex items-center justify-center rounded-lg transition-all"
                  style={{
                    backgroundColor: hasContent ? '#b9703f' : '#eeece6',
                    boxShadow: hasContent ? '0px 1px 2px 0px rgba(26,26,26,0.05)' : 'none',
                    opacity: hasContent ? 1 : 0.5,
                    cursor: hasContent ? 'pointer' : 'default',
                  }}
                  onClick={hasContent ? handleChatSend : undefined}
                >
                  <ArrowUp className="w-4 h-4" style={{ color: hasContent ? 'white' : '#78716c' }} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  // ========== CONTENT SUB-HEADER ==========
  const renderContentSubHeader = () => {
    if (!currentLevel) return null;

    // Poste level: back arrow + badge + title + amount + CTA
    if (currentLevel.type === 'poste' && !currentLevel.subSection) {
      const posteAmounts = { dsa: dsaTotal, pgpa: pgpaTotal, dft: dftTotal };
      const posteAmount = posteAmounts[currentLevel.id] || 0;
      const isRevalActive = activeParamChip === 'revaloriser';
      return (
        <div className="border-b border-[#e7e5e3] bg-white flex-shrink-0">
          <div className="h-[52px] px-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => navigateToStackLevel(navStack.length - 2)} className="p-1 hover:bg-stone-100 rounded transition-colors">
                <ChevronRight className="w-4 h-4 rotate-180 text-[#a8a29e]" strokeWidth={1.5} />
              </button>
              <span className="inline-flex items-center px-2 py-0.5 text-caption-medium font-semibold border border-[#e7e5e3] text-[#292524] rounded-[6px]">
                {currentLevel.title}
              </span>
              <span className="text-[14px] font-medium text-[#292524]">{currentLevel.fullTitle || currentLevel.title}</span>
            </div>
            <div className="flex items-center gap-3">
              <span style={serifAmountStyle} className="text-[#292524]">{fmt(posteAmount)}</span>
              <div className="w-px h-5 bg-[#e7e5e3]" />
              <button onClick={() => setShowExportModal(true)} className="h-8 flex items-center gap-2 px-4 text-[14px] font-medium text-white bg-[#292524] rounded-lg hover:bg-[#44403c] transition-colors" style={{ boxShadow: '0px 1px 2px 0px rgba(26,26,26,0.05)' }}>
                Copier chiffrage
              </button>
            </div>
          </div>
        </div>
      );
    }

    // PGPA sub-section: back to PGPA summary
    if (currentLevel.subSection) {
      const subLabels = { 'revenus-ref': 'Revenus de référence', 'revenus-percus': 'Revenus perçus sur la période', 'ij': 'Indemnités journalières' };
      return (
        <div className="border-b border-[#e7e5e3] bg-white flex-shrink-0">
          <div className="h-[52px] px-4 flex items-center gap-3">
            <button onClick={() => {
              setNavStack(prev => {
                const newStack = [...prev];
                delete newStack[newStack.length - 1].subSection;
                return [...newStack];
              });
            }} className="p-1 hover:bg-stone-100 rounded transition-colors">
              <ChevronRight className="w-4 h-4 rotate-180 text-[#a8a29e]" strokeWidth={1.5} />
            </button>
            <span className="inline-flex items-center px-2 py-0.5 text-caption-medium font-semibold border border-[#e7e5e3] text-[#292524] rounded-[6px]">
              {currentLevel.title}
            </span>
            <span className="text-[14px] font-medium text-[#292524]">{subLabels[currentLevel.subSection] || currentLevel.subSection}</span>
          </div>
        </div>
      );
    }

    // Dossier level chiffrage: CTAs moved to top bar

    return null;
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
                  hasSelection ? 'bg-[#292524] text-white hover:bg-[#44403c]' : 'bg-[#eeece6] text-[#a8a29e] cursor-not-allowed'
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
            <button onClick={() => setShowAddModal(null)} className="p-1 hover:bg-[#F8F7F5] rounded"><X className="w-5 h-5" /></button>
          </div>
          
          {/* Tabs */}
          <div className="flex border-b">
            {[
              { id: 'upload', label: 'Nouveau document', icon: Upload },
              { id: 'pieces', label: 'Pièces existantes', icon: Folder },
              { id: 'manual', label: 'Saisie manuelle', icon: Edit3 }
            ].map(tab => (
              <button key={tab.id} onClick={() => setAddModalTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-body-medium ${addModalTab === tab.id ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-[#78716c] hover:text-gray-700'}`}>
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
                  <Upload className={`w-10 h-10 mx-auto mb-3 ${isDragging ? 'text-blue-500' : 'text-[#a8a29e]'}`} />
                  <p className="text-[#78716c] mb-3">Glissez vos documents ici</p>
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
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a8a29e]" />
                  <input type="text" value={searchPieces} onChange={(e) => setSearchPieces(e.target.value)} placeholder="Rechercher une pièce..." className="w-full pl-10 pr-4 py-2 border rounded-lg" />
                </div>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {filteredPieces.length === 0 ? (
                    <p className="text-center text-[#78716c] py-4">Aucune pièce disponible</p>
                  ) : filteredPieces.map(p => (
                    <button key={p.id} onClick={() => handleAddFromPiece(p, showAddModal)}
                      className="w-full flex items-center gap-3 p-3 border rounded-lg hover:border-blue-400 hover:bg-[#eef3fa] text-left">
                      <FileText className="w-8 h-8 text-[#a8a29e]" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{p.nom}</div>
                        <div className="text-caption text-[#78716c]">{p.type} • {p.date}</div>
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
                <FileQuestion className="w-12 h-12 mx-auto mb-3 text-[#a8a29e]" />
                <p className="text-[#78716c] mb-4">Créer une ligne sans document associé</p>
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
      {title && <h4 className="text-caption-medium font-semibold text-[#a8a29e] uppercase tracking-wider mb-4">{title}</h4>}
      {children}
    </div>
  );
  
  const FormField = ({ label, children, hint, className = '' }) => (
    <div className={className}>
      {label && <label className="block text-body-medium text-[#44403c] mb-2">{label}</label>}
      {children}
      {hint && <p className="mt-1.5 text-caption text-[#a8a29e]">{hint}</p>}
    </div>
  );
  
  const inputClass = "w-full px-3.5 py-2.5 text-body border border-[#e7e5e3] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-zinc-100 focus:border-zinc-400 transition-colors";
  const selectClass = "w-full px-3.5 py-2.5 text-body border border-[#e7e5e3] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-zinc-100 focus:border-zinc-400 transition-colors appearance-none";

  const renderEditPanel = () => {
    if (!editPanel) return null;
    const data = editPanel.data;
    const isPieceDetail = editPanel.type === 'piece-detail';

    return (
      <>
        {/* Draggable resize handle */}
        <div
          className="w-[6px] flex-shrink-0 cursor-col-resize group relative border-l border-r border-[#e7e5e3]"
          style={{ backgroundColor: '#F8F7F5' }}
          onMouseDown={handleChatResizeStart}
        >
          <div className="absolute inset-y-0 -left-1 -right-1 group-hover:bg-stone-300/30 transition-colors" />
        </div>
        <div className="flex-shrink-0 flex flex-col h-full bg-white" style={{ width: chatWidth }}>
          {/* Header */}
          <div className="px-4 h-12 border-b flex items-center justify-between flex-shrink-0" style={{ borderColor: '#e7e5e3' }}>
            <div className="flex items-center gap-2 min-w-0">
              {isPieceDetail && <span className="px-2 py-0.5 bg-zinc-800 text-white text-caption-medium rounded flex-shrink-0">P{data.index}</span>}
              <h3 className="text-body-medium text-[#292524] truncate">{isPieceDetail ? (data.intitule || data.nom) : (editPanel.title || 'Édition')}</h3>
              {data?.status === 'ai-suggested' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-600 text-caption-medium rounded-full flex-shrink-0">
                  <Sparkles className="w-3 h-3" />AI
                </span>
              )}
            </div>
            <button onClick={() => { setEditPanel(null); setShowPreview(false); }} className="p-1.5 hover:bg-[#eeece6] rounded-lg transition-colors flex-shrink-0">
              <X className="w-4 h-4 text-[#a8a29e]" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto px-5 py-5">
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
                    <div className="space-y-5">
                      {/* Bandeau IA si extraction */}
                      {isIaExtracted && (
                        <div className={`flex items-center gap-3 p-3 rounded-lg ${
                          data.confidence >= 80 ? 'bg-emerald-50 border border-emerald-200' : 'bg-amber-50 border border-amber-200'
                        }`}>
                          <Sparkles className={`w-4 h-4 ${data.confidence >= 80 ? 'text-emerald-600' : 'text-amber-600'}`} />
                          <div className="flex-1">
                            <span className={`text-caption-medium ${data.confidence >= 80 ? 'text-emerald-700' : 'text-amber-700'}`}>
                              Extraction IA • Confiance {data.confidence}%
                            </span>
                            {needsValidation && (
                              <p className="text-caption text-amber-600 mt-0.5">Vérifiez les champs surlignés</p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Libellé dépense */}
                      <div>
                        <label className="text-caption text-[#78716c] mb-1.5 block">Libellé dépense</label>
                        <input
                          type="text"
                          defaultValue={data.label || ''}
                          id="edit-label"
                          placeholder="Nom de la dépense"
                          className={`w-full px-3 py-2 text-body border border-[#e7e5e3] rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#a8a29e] ${iaFieldClass(data.label)}`}
                        />
                      </div>

                      {/* Pièces justificatives */}
                      <div>
                        <label className="text-caption text-[#78716c] mb-1.5 block">Ajouter des pièces justificatives</label>
                        {pieces.filter(p => !editingPieceIds.includes(p.id)).length > 0 && (
                          <div className="relative mb-2">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#a8a29e]" strokeWidth={1.5} />
                            <input type="text" value={searchPiecesPanel} onChange={(e) => setSearchPiecesPanel(e.target.value)} placeholder="Rechercher une pièce..."
                              className="w-full pl-9 pr-7 py-2 text-body border border-[#e7e5e3] rounded-lg bg-white placeholder:text-[#a8a29e] focus:outline-none focus:ring-1 focus:ring-[#a8a29e]" />
                            {searchPiecesPanel && <button onClick={() => setSearchPiecesPanel('')} className="absolute right-2.5 top-1/2 -translate-y-1/2"><X className="w-3.5 h-3.5 text-[#a8a29e]" /></button>}
                          </div>
                        )}
                        {searchPiecesPanel && (
                          <div className="max-h-32 overflow-y-auto space-y-1 mb-2">
                            {pieces.filter(p => !editingPieceIds.includes(p.id)).filter(p => !searchPiecesPanel.trim() || (p.intitule || p.nom || '').toLowerCase().includes(searchPiecesPanel.trim().toLowerCase()) || (p.type || '').toLowerCase().includes(searchPiecesPanel.trim().toLowerCase())).map(piece => (
                              <button key={piece.id} onClick={() => { setEditingPieceIds(prev => [...prev, piece.id]); setSearchPiecesPanel(''); }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-left text-body bg-white border border-[#e7e5e3] rounded-lg hover:bg-[#f5f5f4] transition-colors">
                                <span className="w-6 h-6 bg-[#eeece6] text-[#44403c] text-counter rounded flex items-center justify-center flex-shrink-0">{getPieceLabel(piece.id)}</span>
                                <span className="truncate flex-1">{piece.intitule || piece.nom}</span>
                                <span className="text-caption text-[#a8a29e]">{piece.type}</span>
                              </button>
                            ))}
                          </div>
                        )}
                        <div className="border border-dashed border-[#d6d3d1] rounded-lg p-3 flex items-center justify-center gap-2 text-body text-[#78716c] hover:bg-[#f5f5f4] cursor-pointer transition-colors"
                          onClick={() => document.getElementById('panel-piece-upload').click()}>
                          <Upload className="w-4 h-4" />
                          <span>Déposez ou <span className="text-[#E8713A] font-medium">cliquez</span> pour ajouter un justificatif</span>
                        </div>
                        <input type="file" id="panel-piece-upload" multiple accept=".pdf,.jpg,.jpeg,.png" className="hidden"
                          onChange={(e) => { if (e.target.files?.length) { handleUploadPieceForPanel(e.target.files); e.target.value = ''; } }} />
                        {editingPieceIds.length > 0 && (
                          <div className="mt-2">
                            {editingPieceIds.map(pid => {
                              const piece = getPiece(pid);
                              return piece ? (
                                <div key={pid} className="flex items-center gap-3 px-3 h-12 group hover:bg-[#f5f5f4] transition-colors">
                                  <span className="w-6 h-6 bg-[#eeece6] text-[#44403c] text-counter font-medium rounded flex items-center justify-center flex-shrink-0">{getPieceLabel(pid)}</span>
                                  <span className="text-body text-[#292524] truncate flex-1">{piece.intitule || piece.nom}</span>
                                  <span className="text-caption text-[#a8a29e] flex-shrink-0">{piece.type}</span>
                                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                    <button onClick={() => setShowPreview(!showPreview)} className="p-1 text-[#78716c] hover:text-[#292524]"><Eye className="w-4 h-4" /></button>
                                    <button onClick={() => setEditingPieceIds(prev => prev.filter(id => id !== pid))} className="p-1 text-[#78716c] hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                                  </div>
                                </div>
                              ) : null;
                            })}
                          </div>
                        )}
                      </div>

                      {/* Date de la dépense */}
                      <div>
                        <label id="dsa-ponctuelle-label" className="text-caption text-[#78716c] mb-1.5 block">
                          {data.isPeriodique ? 'Date de début' : 'Date de la dépense'}
                        </label>
                        <div className="relative">
                          <input type="text" defaultValue={data.date || ''} id="edit-date"
                            placeholder="JJ/MM/AAAA" maxLength={10}
                            onChange={(e) => { e.target.value = formatDateInput(e.target.value); }}
                            className={`w-full px-3 py-2 pr-9 text-body border border-[#e7e5e3] rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#a8a29e] ${iaFieldClass(data.date)}`}
                          />
                          <input type="date" id="edit-date-picker" className="absolute inset-0 opacity-0 pointer-events-none" onChange={(e) => handleDatePick(e, 'edit-date')} />
                          <button type="button" onClick={() => openDatePicker('edit-date')} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 hover:bg-[#f5f5f4] rounded"><Calendar className="w-4 h-4 text-[#a8a29e]" /></button>
                        </div>
                        {/* Champs période (masqués si ponctuelle) */}
                        <div id="dsa-periode-fields" style={{ display: data.isPeriodique ? 'block' : 'none' }}>
                          <div className="mt-3 space-y-3">
                            <div>
                              <label className="text-caption text-[#78716c] mb-1.5 block">Date de fin</label>
                              <div className="relative">
                                <input type="text" defaultValue={data.dateFin || ''} id="edit-date-fin"
                                  placeholder="JJ/MM/AAAA" maxLength={10}
                                  onChange={(e) => { e.target.value = formatDateInput(e.target.value); }}
                                  className="w-full px-3 py-2 pr-9 text-body border border-[#e7e5e3] rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#a8a29e]"
                                />
                                <input type="date" id="edit-date-fin-picker" className="absolute inset-0 opacity-0 pointer-events-none" onChange={(e) => handleDatePick(e, 'edit-date-fin')} />
                                <button type="button" onClick={() => openDatePicker('edit-date-fin')} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 hover:bg-[#f5f5f4] rounded"><Calendar className="w-4 h-4 text-[#a8a29e]" /></button>
                              </div>
                            </div>
                            <div className="text-caption text-[#78716c] italic">
                              Durée : {calcDaysBetween(data.date, data.dateFin) || '—'} jours
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Montant dépense */}
                      <div>
                        <label className="text-caption text-[#78716c] mb-1.5 block">Montant dépense</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a8a29e] text-body">€</span>
                          <input
                            type="number"
                            step="0.01"
                            defaultValue={data.montant ?? ''}
                            id="edit-montant"
                            placeholder="0"
                            className={`w-full pl-8 pr-3 py-2 text-body border border-[#e7e5e3] rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#a8a29e] ${iaFieldClass(data.montant)}`}
                          />
                        </div>
                      </div>

                      {/* Reste à charge */}
                      <div>
                        <label className="text-caption text-[#78716c] mb-1.5 block">Reste à charge</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a8a29e] text-body">€</span>
                          <input
                            type="number"
                            step="0.01"
                            defaultValue={data.dejaRembourse || 0}
                            id="edit-rembourse"
                            placeholder="0"
                            className="w-full pl-8 pr-3 py-2 text-body border border-[#e7e5e3] rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#a8a29e]"
                          />
                        </div>
                      </div>

                      {/* Hidden fields to preserve data */}
                      <input type="hidden" id="edit-type" value={data.type || 'Autre'} />
                      <input type="hidden" id="edit-tiers" value={data.tiers || ''} />
                      <input type="hidden" id="edit-date-type" value={data.isPeriodique ? 'periode' : 'ponctuelle'} />
                      <input type="hidden" id="edit-montant-unitaire" value={data.montantUnitaire ?? ''} />
                      <input type="hidden" id="edit-reste-charge" value={data.resteAChargeRetenu ?? ((data.montant || 0) - (data.dejaRembourse || 0))} />
                      <input type="hidden" id="edit-revalo" value={data.aRevalo ? 'true' : 'false'} />
                    </div>
                  );
                })()}
                
                {/* Piece Detail Panel */}
                {editPanel.type === 'piece-detail' && (
                  <div className="flex gap-6 h-full">
                    {/* Left: Preview */}
                    <div className="w-1/2 bg-gray-900 rounded-lg flex items-center justify-center p-6">
                      <div className="bg-white rounded-lg shadow-xl w-full max-w-[280px] aspect-[3/4] p-6 flex flex-col">
                        <div className="text-caption text-[#a8a29e] mb-3 uppercase tracking-wide">{data.type}</div>
                        <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2 mb-6"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-2 bg-[#F8F7F5] rounded w-full"></div>
                          <div className="h-2 bg-[#F8F7F5] rounded w-5/6"></div>
                          <div className="h-2 bg-[#F8F7F5] rounded w-4/6"></div>
                          <div className="h-2 bg-[#F8F7F5] rounded w-full"></div>
                          <div className="h-2 bg-[#F8F7F5] rounded w-3/4"></div>
                        </div>
                        <div className="mt-4 pt-4 border-t text-caption text-[#a8a29e]">
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
                        <div className="mt-1 px-3 py-2 bg-[#F8F7F5] rounded-lg text-body text-[#78716c] truncate">
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
                          <div className="p-3 bg-[#F8F7F5] rounded-lg text-body text-[#78716c] text-center">
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
                            <button type="button" onClick={() => openDatePicker('victime-naissance')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-[#eeece6] rounded"><Calendar className="w-4 h-4 text-[#a8a29e]" /></button>
                          </div>
                        </FormField>
                      </div>
                    </FormSection>
                    
                    <FormSection title="Décès" noBorder>
                      <FormField label="Date de décès" hint="Laisser vide si non applicable">
                        <div className="relative">
                          <input type="text" id="victime-deces" defaultValue={victimeData.dateDeces || ''} className={`${inputClass} pr-9`} placeholder="JJ/MM/AAAA" maxLength={10} onChange={(e) => { e.target.value = formatDateInput(e.target.value); }} />
                          <input type="date" id="victime-deces-picker" className="absolute inset-0 opacity-0 pointer-events-none" onChange={(e) => handleDatePick(e, 'victime-deces')} />
                          <button type="button" onClick={() => openDatePicker('victime-deces')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-[#eeece6] rounded"><Calendar className="w-4 h-4 text-[#a8a29e]" /></button>
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
                            <button type="button" onClick={() => openDatePicker('fait-date-accident')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-[#eeece6] rounded"><Calendar className="w-4 h-4 text-[#a8a29e]" /></button>
                          </div>
                        </FormField>
                        <FormField label="Date première constatation">
                          <div className="relative">
                            <input type="text" id="fait-date-constat" defaultValue={faitGenerateur.datePremiereConstatation} className={`${inputClass} pr-9`} placeholder="JJ/MM/AAAA" maxLength={10} onChange={(e) => { e.target.value = formatDateInput(e.target.value); }} />
                            <input type="date" id="fait-date-constat-picker" className="absolute inset-0 opacity-0 pointer-events-none" onChange={(e) => handleDatePick(e, 'fait-date-constat')} />
                            <button type="button" onClick={() => openDatePicker('fait-date-constat')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-[#eeece6] rounded"><Calendar className="w-4 h-4 text-[#a8a29e]" /></button>
                          </div>
                        </FormField>
                        <FormField label="Date de consolidation">
                          <div className="relative">
                            <input type="text" id="fait-date-conso" defaultValue={faitGenerateur.dateConsolidation} className={`${inputClass} pr-9`} placeholder="JJ/MM/AAAA" maxLength={10} onChange={(e) => { e.target.value = formatDateInput(e.target.value); }} />
                            <input type="date" id="fait-date-conso-picker" className="absolute inset-0 opacity-0 pointer-events-none" onChange={(e) => handleDatePick(e, 'fait-date-conso')} />
                            <button type="button" onClick={() => openDatePicker('fait-date-conso')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-[#eeece6] rounded"><Calendar className="w-4 h-4 text-[#a8a29e]" /></button>
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
                      <h4 className="text-body-medium font-semibold text-[#292524] mb-3 pb-2 border-b">Identité</h4>
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
                      <h4 className="text-body-medium font-semibold text-[#292524] mb-3 pb-2 border-b">État civil</h4>
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
                            <button type="button" onClick={() => openDatePicker('vi-naissance')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-[#eeece6] rounded"><Calendar className="w-4 h-4 text-[#a8a29e]" /></button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-body-medium font-semibold text-[#292524] mb-3 pb-2 border-b">Lien avec la victime</h4>
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
                          <button type="button" onClick={() => openDatePicker('dossier-date-ouverture')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-[#eeece6] rounded"><Calendar className="w-4 h-4 text-[#a8a29e]" /></button>
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
                      <h4 className="text-body-medium font-semibold text-[#292524] mb-3 pb-2 border-b">Pièces justificatives</h4>
                      {editingPieceIds.length > 0 && (
                        <div className="space-y-2 mb-3">
                          {editingPieceIds.map(pid => {
                            const piece = getPiece(pid);
                            return piece ? (
                              <div key={pid} className="flex items-center gap-3 p-2.5 bg-[#F8F7F5] rounded-lg border group">
                                <span className="w-8 h-8 bg-blue-100 text-[#1e3a8a] text-caption-medium rounded flex items-center justify-center flex-shrink-0">{getPieceLabel(pid)}</span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-body-medium truncate">{piece.intitule || piece.nom}</p>
                                  <p className="text-caption text-[#78716c]">{piece.type}</p>
                                </div>
                                <button onClick={() => setShowPreview(!showPreview)} className="p-1.5 text-[#a8a29e] hover:text-blue-600 hover:bg-[#eef3fa] rounded"><Eye className="w-4 h-4" /></button>
                                <button onClick={() => setEditingPieceIds(prev => prev.filter(id => id !== pid))} className="p-1.5 text-[#a8a29e] hover:text-red-600 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                              </div>
                            ) : null;
                          })}
                        </div>
                      )}
                      <div className="border-2 border-dashed rounded-lg p-3 space-y-3 bg-[#F8F7F5]/50">
                        {pieces.filter(p => !editingPieceIds.includes(p.id)).length > 0 && (
                          <div>
                            <div className="relative mb-2">
                              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#a8a29e]" strokeWidth={1.5} />
                              <input type="text" value={searchPiecesPanel} onChange={(e) => setSearchPiecesPanel(e.target.value)} placeholder="Rechercher une pièce..."
                                className="w-full pl-8 pr-7 py-1.5 text-caption border border-[#e7e5e3] rounded-md bg-white placeholder:text-[#a8a29e] focus:outline-none focus:ring-1 focus:ring-zinc-300" />
                              {searchPiecesPanel && <button onClick={() => setSearchPiecesPanel('')} className="absolute right-2 top-1/2 -translate-y-1/2"><X className="w-3 h-3 text-[#a8a29e]" /></button>}
                            </div>
                            <div className="max-h-32 overflow-y-auto space-y-1">
                              {pieces.filter(p => !editingPieceIds.includes(p.id)).filter(p => !searchPiecesPanel.trim() || (p.intitule || p.nom || '').toLowerCase().includes(searchPiecesPanel.trim().toLowerCase()) || (p.type || '').toLowerCase().includes(searchPiecesPanel.trim().toLowerCase())).map(piece => (
                                <button key={piece.id} onClick={() => { setEditingPieceIds(prev => [...prev, piece.id]); setSearchPiecesPanel(''); }}
                                  className="w-full flex items-center gap-2 p-2 text-left text-body bg-white border rounded hover:bg-[#eef3fa] hover:border-blue-300 transition-colors">
                                  <span className="w-6 h-6 bg-blue-100 text-[#1e3a8a] text-counter rounded flex items-center justify-center flex-shrink-0">{getPieceLabel(piece.id)}</span>
                                  <span className="truncate flex-1">{piece.intitule || piece.nom}</span>
                                  <span className="text-caption text-[#a8a29e]">{piece.type}</span>
                                  <Plus className="w-4 h-4 text-blue-600" />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        <input type="file" id="panel-piece-upload" multiple accept=".pdf,.jpg,.jpeg,.png" className="hidden"
                          onChange={(e) => { if (e.target.files?.length) { handleUploadPieceForPanel(e.target.files); e.target.value = ''; } }} />
                        <button onClick={() => document.getElementById('panel-piece-upload').click()}
                          className="w-full flex items-center justify-center gap-2 p-2 text-body text-[#78716c] bg-white border border-[#e7e5e3] rounded-lg hover:bg-[#fafaf9] hover:border-zinc-300 transition-colors">
                          <Upload className="w-4 h-4" />
                          Ajouter un document
                        </button>
                      </div>
                    </div>

                    {/* Section Informations */}
                    <div>
                      <h4 className="text-body-medium font-semibold text-[#292524] mb-3 pb-2 border-b">Informations</h4>
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
                      <h4 className="text-body-medium font-semibold text-[#292524] mb-3 pb-2 border-b">Montants</h4>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-body-medium text-gray-700">Revenu net payé</label>
                            <div className="mt-1 relative">
                              <input id="pgpa-revenu-montant" type="number" step="0.01" defaultValue={data.montant || ''} readOnly className="w-full px-3 py-2 pr-8 border rounded-lg bg-[#F8F7F5] text-[#78716c] cursor-default" />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a8a29e] text-body">€</span>
                            </div>
                          </div>
                          <div>
                            <label className="text-body-medium text-gray-700">Montant revalorisé</label>
                            <div className="mt-1 relative">
                              <input id="pgpa-revenu-revalorise" type="number" step="0.01" defaultValue={data.revalorise || ''} className="w-full px-3 py-2 pr-8 border rounded-lg bg-[#F8F7F5] font-medium" readOnly />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a8a29e] text-body">€</span>
                            </div>
                            <p className="mt-1 text-caption text-[#78716c]">Calculé automatiquement selon le barème</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-[#F8F7F5] rounded-lg border">
                          <div className="flex items-center gap-3">
                            <input type="checkbox" id="pgpa-revenu-revalo-checkbox" defaultChecked={data.aRevaloriser !== false} className="rounded text-blue-600" />
                            <label htmlFor="pgpa-revenu-revalo-checkbox" className="text-body-medium text-gray-700">Appliquer la revalorisation</label>
                          </div>
                          <div className="text-body text-[#78716c]">
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
                      <h4 className="text-body-medium font-semibold text-[#292524] mb-3 pb-2 border-b">Pièces justificatives</h4>
                      {editingPieceIds.length > 0 && (
                        <div className="space-y-2 mb-3">
                          {editingPieceIds.map(pid => {
                            const piece = getPiece(pid);
                            return piece ? (
                              <div key={pid} className="flex items-center gap-3 p-2.5 bg-[#F8F7F5] rounded-lg border group">
                                <span className="w-8 h-8 bg-blue-100 text-[#1e3a8a] text-caption-medium rounded flex items-center justify-center flex-shrink-0">{getPieceLabel(pid)}</span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-body-medium truncate">{piece.intitule || piece.nom}</p>
                                  <p className="text-caption text-[#78716c]">{piece.type}</p>
                                </div>
                                <button onClick={() => setShowPreview(!showPreview)} className="p-1.5 text-[#a8a29e] hover:text-blue-600 hover:bg-[#eef3fa] rounded"><Eye className="w-4 h-4" /></button>
                                <button onClick={() => setEditingPieceIds(prev => prev.filter(id => id !== pid))} className="p-1.5 text-[#a8a29e] hover:text-red-600 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                              </div>
                            ) : null;
                          })}
                        </div>
                      )}
                      <div className="border-2 border-dashed rounded-lg p-3 space-y-3 bg-[#F8F7F5]/50">
                        {pieces.filter(p => !editingPieceIds.includes(p.id)).length > 0 && (
                          <div>
                            <div className="relative mb-2">
                              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#a8a29e]" strokeWidth={1.5} />
                              <input type="text" value={searchPiecesPanel} onChange={(e) => setSearchPiecesPanel(e.target.value)} placeholder="Rechercher une pièce..."
                                className="w-full pl-8 pr-7 py-1.5 text-caption border border-[#e7e5e3] rounded-md bg-white placeholder:text-[#a8a29e] focus:outline-none focus:ring-1 focus:ring-zinc-300" />
                              {searchPiecesPanel && <button onClick={() => setSearchPiecesPanel('')} className="absolute right-2 top-1/2 -translate-y-1/2"><X className="w-3 h-3 text-[#a8a29e]" /></button>}
                            </div>
                            <div className="max-h-32 overflow-y-auto space-y-1">
                              {pieces.filter(p => !editingPieceIds.includes(p.id)).filter(p => !searchPiecesPanel.trim() || (p.intitule || p.nom || '').toLowerCase().includes(searchPiecesPanel.trim().toLowerCase()) || (p.type || '').toLowerCase().includes(searchPiecesPanel.trim().toLowerCase())).map(piece => (
                                <button key={piece.id} onClick={() => { setEditingPieceIds(prev => [...prev, piece.id]); setSearchPiecesPanel(''); }}
                                  className="w-full flex items-center gap-2 p-2 text-left text-body bg-white border rounded hover:bg-[#eef3fa] hover:border-blue-300 transition-colors">
                                  <span className="w-6 h-6 bg-blue-100 text-[#1e3a8a] text-counter rounded flex items-center justify-center flex-shrink-0">{getPieceLabel(piece.id)}</span>
                                  <span className="truncate flex-1">{piece.intitule || piece.nom}</span>
                                  <span className="text-caption text-[#a8a29e]">{piece.type}</span>
                                  <Plus className="w-4 h-4 text-blue-600" />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        <input type="file" id="panel-piece-upload" multiple accept=".pdf,.jpg,.jpeg,.png" className="hidden"
                          onChange={(e) => { if (e.target.files?.length) { handleUploadPieceForPanel(e.target.files); e.target.value = ''; } }} />
                        <button onClick={() => document.getElementById('panel-piece-upload').click()}
                          className="w-full flex items-center justify-center gap-2 p-2 text-body text-[#78716c] bg-white border border-[#e7e5e3] rounded-lg hover:bg-[#fafaf9] hover:border-zinc-300 transition-colors">
                          <Upload className="w-4 h-4" />
                          Ajouter un document
                        </button>
                      </div>
                    </div>

                    {/* Section Informations */}
                    <div>
                      <h4 className="text-body-medium font-semibold text-[#292524] mb-3 pb-2 border-b">Informations</h4>
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
                      <h4 className="text-body-medium font-semibold text-[#292524] mb-3 pb-2 border-b">Période</h4>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-body-medium text-gray-700">Date de début</label>
                            <div className="relative mt-1">
                              <input id="pgpa-percu-debut" type="text" defaultValue={data.periodeDebut || ''} placeholder="JJ/MM/AAAA" maxLength={10} onChange={(e) => { e.target.value = formatDateInput(e.target.value); }} className="w-full px-3 py-2 pr-9 border rounded-lg" />
                              <input type="date" id="pgpa-percu-debut-picker" className="absolute inset-0 opacity-0 pointer-events-none" onChange={(e) => handleDatePick(e, 'pgpa-percu-debut')} />
                              <button type="button" onClick={() => openDatePicker('pgpa-percu-debut')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-[#eeece6] rounded"><Calendar className="w-4 h-4 text-[#a8a29e]" /></button>
                            </div>
                          </div>
                          <div>
                            <label className="text-body-medium text-gray-700">Date de fin</label>
                            <div className="relative mt-1">
                              <input id="pgpa-percu-fin" type="text" defaultValue={data.periodeFin || ''} placeholder="JJ/MM/AAAA" maxLength={10} onChange={(e) => { e.target.value = formatDateInput(e.target.value); }} className="w-full px-3 py-2 pr-9 border rounded-lg" />
                              <input type="date" id="pgpa-percu-fin-picker" className="absolute inset-0 opacity-0 pointer-events-none" onChange={(e) => handleDatePick(e, 'pgpa-percu-fin')} />
                              <button type="button" onClick={() => openDatePicker('pgpa-percu-fin')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-[#eeece6] rounded"><Calendar className="w-4 h-4 text-[#a8a29e]" /></button>
                            </div>
                          </div>
                        </div>

                        <div className="p-3 bg-blue-50 rounded-lg flex items-center justify-between">
                          <span className="text-body text-[#1e3a8a]">Durée calculée</span>
                          <span className="font-semibold text-blue-900">{data.dureeJours || '—'} jours</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Section Montants */}
                    <div>
                      <h4 className="text-body-medium font-semibold text-[#292524] mb-3 pb-2 border-b">Montants</h4>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-body-medium text-gray-700">Revenu perçu net</label>
                            <div className="mt-1 relative">
                              <input id="pgpa-percu-montant" type="number" step="0.01" defaultValue={data.montant || ''} readOnly className="w-full px-3 py-2 pr-8 border rounded-lg bg-[#F8F7F5] text-[#78716c] cursor-default" />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a8a29e] text-body">€</span>
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

                        <div className="flex items-center justify-between p-3 bg-[#F8F7F5] rounded-lg border">
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
                      <h4 className="text-body-medium font-semibold text-[#292524] mb-3 pb-2 border-b">Pièces justificatives</h4>
                      {editingPieceIds.length > 0 && (
                        <div className="space-y-2 mb-3">
                          {editingPieceIds.map(pid => {
                            const piece = getPiece(pid);
                            return piece ? (
                              <div key={pid} className="flex items-center gap-3 p-2.5 bg-[#F8F7F5] rounded-lg border group">
                                <span className="w-8 h-8 bg-blue-100 text-[#1e3a8a] text-caption-medium rounded flex items-center justify-center flex-shrink-0">{getPieceLabel(pid)}</span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-body-medium truncate">{piece.intitule || piece.nom}</p>
                                  <p className="text-caption text-[#78716c]">{piece.type}</p>
                                </div>
                                <button onClick={() => setShowPreview(!showPreview)} className="p-1.5 text-[#a8a29e] hover:text-blue-600 hover:bg-[#eef3fa] rounded"><Eye className="w-4 h-4" /></button>
                                <button onClick={() => setEditingPieceIds(prev => prev.filter(id => id !== pid))} className="p-1.5 text-[#a8a29e] hover:text-red-600 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                              </div>
                            ) : null;
                          })}
                        </div>
                      )}
                      <div className="border-2 border-dashed rounded-lg p-3 space-y-3 bg-[#F8F7F5]/50">
                        {pieces.filter(p => !editingPieceIds.includes(p.id)).length > 0 && (
                          <div>
                            <div className="relative mb-2">
                              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#a8a29e]" strokeWidth={1.5} />
                              <input type="text" value={searchPiecesPanel} onChange={(e) => setSearchPiecesPanel(e.target.value)} placeholder="Rechercher une pièce..."
                                className="w-full pl-8 pr-7 py-1.5 text-caption border border-[#e7e5e3] rounded-md bg-white placeholder:text-[#a8a29e] focus:outline-none focus:ring-1 focus:ring-zinc-300" />
                              {searchPiecesPanel && <button onClick={() => setSearchPiecesPanel('')} className="absolute right-2 top-1/2 -translate-y-1/2"><X className="w-3 h-3 text-[#a8a29e]" /></button>}
                            </div>
                            <div className="max-h-32 overflow-y-auto space-y-1">
                              {pieces.filter(p => !editingPieceIds.includes(p.id)).filter(p => !searchPiecesPanel.trim() || (p.intitule || p.nom || '').toLowerCase().includes(searchPiecesPanel.trim().toLowerCase()) || (p.type || '').toLowerCase().includes(searchPiecesPanel.trim().toLowerCase())).map(piece => (
                                <button key={piece.id} onClick={() => { setEditingPieceIds(prev => [...prev, piece.id]); setSearchPiecesPanel(''); }}
                                  className="w-full flex items-center gap-2 p-2 text-left text-body bg-white border rounded hover:bg-[#eef3fa] hover:border-blue-300 transition-colors">
                                  <span className="w-6 h-6 bg-blue-100 text-[#1e3a8a] text-counter rounded flex items-center justify-center flex-shrink-0">{getPieceLabel(piece.id)}</span>
                                  <span className="truncate flex-1">{piece.intitule || piece.nom}</span>
                                  <span className="text-caption text-[#a8a29e]">{piece.type}</span>
                                  <Plus className="w-4 h-4 text-blue-600" />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        <input type="file" id="panel-piece-upload" multiple accept=".pdf,.jpg,.jpeg,.png" className="hidden"
                          onChange={(e) => { if (e.target.files?.length) { handleUploadPieceForPanel(e.target.files); e.target.value = ''; } }} />
                        <button onClick={() => document.getElementById('panel-piece-upload').click()}
                          className="w-full flex items-center justify-center gap-2 p-2 text-body text-[#78716c] bg-white border border-[#e7e5e3] rounded-lg hover:bg-[#fafaf9] hover:border-zinc-300 transition-colors">
                          <Upload className="w-4 h-4" />
                          Ajouter un document
                        </button>
                      </div>
                    </div>

                    {/* Section Tiers payeur */}
                    <div>
                      <h4 className="text-body-medium font-semibold text-[#292524] mb-3 pb-2 border-b">Tiers payeur</h4>
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
                      <h4 className="text-body-medium font-semibold text-[#292524] mb-3 pb-2 border-b">Période d'arrêt de travail</h4>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-body-medium text-gray-700">Date de début</label>
                            <div className="relative mt-1">
                              <input id="pgpa-ij-debut" type="text" defaultValue={data.periodeDebut || ''} placeholder="JJ/MM/AAAA" maxLength={10} onChange={(e) => { e.target.value = formatDateInput(e.target.value); }} className="w-full px-3 py-2 pr-9 border rounded-lg" />
                              <input type="date" id="pgpa-ij-debut-picker" className="absolute inset-0 opacity-0 pointer-events-none" onChange={(e) => handleDatePick(e, 'pgpa-ij-debut')} />
                              <button type="button" onClick={() => openDatePicker('pgpa-ij-debut')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-[#eeece6] rounded"><Calendar className="w-4 h-4 text-[#a8a29e]" /></button>
                            </div>
                          </div>
                          <div>
                            <label className="text-body-medium text-gray-700">Date de fin</label>
                            <div className="relative mt-1">
                              <input id="pgpa-ij-fin" type="text" defaultValue={data.periodeFin || ''} placeholder="JJ/MM/AAAA" maxLength={10} onChange={(e) => { e.target.value = formatDateInput(e.target.value); }} className="w-full px-3 py-2 pr-9 border rounded-lg" />
                              <input type="date" id="pgpa-ij-fin-picker" className="absolute inset-0 opacity-0 pointer-events-none" onChange={(e) => handleDatePick(e, 'pgpa-ij-fin')} />
                              <button type="button" onClick={() => openDatePicker('pgpa-ij-fin')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-[#eeece6] rounded"><Calendar className="w-4 h-4 text-[#a8a29e]" /></button>
                            </div>
                          </div>
                        </div>

                        <div className="p-3 bg-blue-50 rounded-lg flex items-center justify-between">
                          <span className="text-body text-[#1e3a8a]">Durée calculée</span>
                          <span className="font-semibold text-blue-900">{data.jours || '—'} jours</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Section Montants */}
                    <div>
                      <h4 className="text-body-medium font-semibold text-[#292524] mb-3 pb-2 border-b">Montants</h4>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-body-medium text-gray-700">Indemnité brute perçue</label>
                            <div className="mt-1 relative">
                              <input id="pgpa-ij-brut" type="number" step="0.01" defaultValue={data.montantBrut || ''} placeholder="0.00" className="w-full px-3 py-2 pr-8 border rounded-lg" />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a8a29e] text-body">€</span>
                            </div>
                          </div>
                          <div>
                            <label className="text-body-medium text-gray-700">CSG-CRDS</label>
                            <div className="mt-1 relative">
                              <input id="pgpa-ij-csg" type="number" step="0.01" defaultValue={data.csgCrds || ''} placeholder="0.00" className="w-full px-3 py-2 pr-8 border rounded-lg" />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a8a29e] text-body">€</span>
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
                  <div className="space-y-5">
                    {data?.status === 'ai-suggested' && data?.confidence && (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-indigo-50 border border-indigo-200">
                        <Sparkles className="w-4 h-4 text-indigo-600" />
                        <span className="text-caption-medium text-indigo-700">Suggestion IA · Confiance {data.confidence}%</span>
                      </div>
                    )}

                    {/* Libellé dépense */}
                    <div>
                      <label className="text-caption text-[#78716c] mb-1.5 block">Libellé dépense</label>
                      <input type="text" id="dft-label" defaultValue={data.label || ''} placeholder="Nom de la période"
                        className="w-full px-3 py-2 text-body border border-[#e7e5e3] rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#a8a29e]" />
                    </div>

                    {/* Pièces justificatives */}
                    <div>
                      <label className="text-caption text-[#78716c] mb-1.5 block">Ajouter des pièces justificatives</label>
                      {pieces.filter(p => !editingPieceIds.includes(p.id)).length > 0 && (
                        <div className="relative mb-2">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#a8a29e]" strokeWidth={1.5} />
                          <input type="text" value={searchPiecesPanel} onChange={(e) => setSearchPiecesPanel(e.target.value)} placeholder="Rechercher une pièce..."
                            className="w-full pl-9 pr-7 py-2 text-body border border-[#e7e5e3] rounded-lg bg-white placeholder:text-[#a8a29e] focus:outline-none focus:ring-1 focus:ring-[#a8a29e]" />
                          {searchPiecesPanel && <button onClick={() => setSearchPiecesPanel('')} className="absolute right-2.5 top-1/2 -translate-y-1/2"><X className="w-3.5 h-3.5 text-[#a8a29e]" /></button>}
                        </div>
                      )}
                      {searchPiecesPanel && (
                        <div className="max-h-32 overflow-y-auto space-y-1 mb-2">
                          {pieces.filter(p => !editingPieceIds.includes(p.id)).filter(p => !searchPiecesPanel.trim() || (p.intitule || p.nom || '').toLowerCase().includes(searchPiecesPanel.trim().toLowerCase()) || (p.type || '').toLowerCase().includes(searchPiecesPanel.trim().toLowerCase())).map(piece => (
                            <button key={piece.id} onClick={() => { setEditingPieceIds(prev => [...prev, piece.id]); setSearchPiecesPanel(''); }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-left text-body bg-white border border-[#e7e5e3] rounded-lg hover:bg-[#f5f5f4] transition-colors">
                              <span className="w-6 h-6 bg-[#eeece6] text-[#44403c] text-counter rounded flex items-center justify-center flex-shrink-0">{getPieceLabel(piece.id)}</span>
                              <span className="truncate flex-1">{piece.intitule || piece.nom}</span>
                              <span className="text-caption text-[#a8a29e]">{piece.type}</span>
                            </button>
                          ))}
                        </div>
                      )}
                      <div className="border border-dashed border-[#d6d3d1] rounded-lg p-3 flex items-center justify-center gap-2 text-body text-[#78716c] hover:bg-[#f5f5f4] cursor-pointer transition-colors"
                        onClick={() => document.getElementById('panel-piece-upload').click()}>
                        <Upload className="w-4 h-4" />
                        <span>Déposez ou <span className="text-[#E8713A] font-medium">cliquez</span> pour ajouter un justificatif</span>
                      </div>
                      <input type="file" id="panel-piece-upload" multiple accept=".pdf,.jpg,.jpeg,.png" className="hidden"
                        onChange={(e) => { if (e.target.files?.length) { handleUploadPieceForPanel(e.target.files); e.target.value = ''; } }} />
                      {editingPieceIds.length > 0 && (
                        <div className="mt-2">
                          {editingPieceIds.map(pid => {
                            const piece = getPiece(pid);
                            return piece ? (
                              <div key={pid} className="flex items-center gap-3 px-3 h-12 group hover:bg-[#f5f5f4] transition-colors">
                                <span className="w-6 h-6 bg-[#eeece6] text-[#44403c] text-counter font-medium rounded flex items-center justify-center flex-shrink-0">{getPieceLabel(pid)}</span>
                                <span className="text-body text-[#292524] truncate flex-1">{piece.intitule || piece.nom}</span>
                                <span className="text-caption text-[#a8a29e] flex-shrink-0">{piece.type}</span>
                                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                  <button onClick={() => setShowPreview(!showPreview)} className="p-1 text-[#78716c] hover:text-[#292524]"><Eye className="w-4 h-4" /></button>
                                  <button onClick={() => setEditingPieceIds(prev => prev.filter(id => id !== pid))} className="p-1 text-[#78716c] hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                                </div>
                              </div>
                            ) : null;
                          })}
                        </div>
                      )}
                    </div>

                    {/* Dates side by side */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-caption text-[#78716c] mb-1.5 block">Date de début</label>
                        <div className="relative">
                          <input type="text" id="dft-debut" defaultValue={data.debut} className="w-full px-3 py-2 pr-9 text-body border border-[#e7e5e3] rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#a8a29e]" placeholder="JJ/MM/AAAA" maxLength={10} onChange={(e) => { e.target.value = formatDateInput(e.target.value); }} />
                          <input type="date" id="dft-debut-picker" className="absolute inset-0 opacity-0 pointer-events-none" onChange={(e) => handleDatePick(e, 'dft-debut')} />
                          <button type="button" onClick={() => openDatePicker('dft-debut')} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 hover:bg-[#f5f5f4] rounded"><Calendar className="w-4 h-4 text-[#a8a29e]" /></button>
                        </div>
                      </div>
                      <div>
                        <label className="text-caption text-[#78716c] mb-1.5 block">Date de fin</label>
                        <div className="relative">
                          <input type="text" id="dft-fin" defaultValue={data.fin} className="w-full px-3 py-2 pr-9 text-body border border-[#e7e5e3] rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#a8a29e]" placeholder="JJ/MM/AAAA" maxLength={10} onChange={(e) => { e.target.value = formatDateInput(e.target.value); }} />
                          <input type="date" id="dft-fin-picker" className="absolute inset-0 opacity-0 pointer-events-none" onChange={(e) => handleDatePick(e, 'dft-fin')} />
                          <button type="button" onClick={() => openDatePicker('dft-fin')} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 hover:bg-[#f5f5f4] rounded"><Calendar className="w-4 h-4 text-[#a8a29e]" /></button>
                        </div>
                      </div>
                    </div>
                    <div className="text-caption text-[#78716c] italic -mt-3">
                      Durée : {data.jours || '—'} jours
                    </div>

                    {/* Base journalière + % DFT side by side */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-caption text-[#78716c] mb-1.5 block">Base journalière</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a8a29e] text-body">€</span>
                          <input type="number" id="dft-base" defaultValue={chiffrageParams.baseJournaliereDFT || 33}
                            className="w-full pl-8 pr-3 py-2 text-body border border-[#e7e5e3] rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#a8a29e]" />
                        </div>
                      </div>
                      <div>
                        <label className="text-caption text-[#78716c] mb-1.5 block">% de DFT</label>
                        <div className="relative">
                          <input type="number" id="dft-taux" defaultValue={data.taux || 100} min={0} max={100}
                            className="w-full px-3 py-2 pr-8 text-body border border-[#e7e5e3] rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#a8a29e]" />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a8a29e] text-body">%</span>
                        </div>
                      </div>
                    </div>

                    {/* Commentaire hidden */}
                    <input type="hidden" id="dft-commentaire" value={data.commentaire || ''} />
                  </div>
                )}

              </div>

              {/* Charge Details — Figma style */}
              {editPanel.type === 'dsa-ligne' && (
                <div className="border-t border-[#e7e5e3] bg-[#fafaf9]">
                  <div className="px-5 py-4 space-y-1.5">
                    <div className="flex justify-between text-body">
                      <span className="text-[#44403c]">Montant dépense</span>
                      <span className="tabular-nums text-[#292524] font-medium">{fmt(data.montant || 0)}</span>
                    </div>
                    <div className="flex justify-between text-body">
                      <span className="text-[#44403c]">Reste à charge</span>
                      <span className="tabular-nums text-[#292524] font-medium">{fmt((data.montant || 0) - (data.dejaRembourse || 0))}</span>
                    </div>
                    {data.aRevalo && (
                      <div className="flex justify-between text-body">
                        <div className="flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-[#E8713A]" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                          <span className="text-[#44403c]">Revalorisation</span>
                          <span className="text-caption text-[#a8a29e]">IPC Annuel · 1,08</span>
                        </div>
                        <span className="tabular-nums text-[#292524] font-medium">{fmt(((data.montant || 0) - (data.dejaRembourse || 0)) * 0.08)}</span>
                      </div>
                    )}
                  </div>
                  <div className="mx-5 border-t border-[#e7e5e3]" />
                  <div className="px-5 py-3 flex justify-between items-center">
                    <span className="text-body-medium text-[#292524]">Total indemnisable</span>
                    <span className="text-lg font-bold text-[#292524] tabular-nums">{fmt(data.montant || 0)}</span>
                  </div>
                </div>
              )}
              {editPanel.type === 'pgpa-revenu' && (
                <div className="border-t border-[#e7e5e3] bg-[#fafaf9]">
                  <div className="px-5 py-3 flex justify-between items-center">
                    <span className="text-body-medium text-[#292524]">Revenu de référence</span>
                    <span className="text-lg font-bold text-[#292524] tabular-nums">{fmt(data.montant || 0)}</span>
                  </div>
                </div>
              )}
              {editPanel.type === 'pgpa-revenu-percu' && (
                <div className="border-t border-[#e7e5e3] bg-[#fafaf9]">
                  <div className="px-5 py-3 flex justify-between items-center">
                    <span className="text-body-medium text-[#292524]">Revenu net perçu</span>
                    <span className="text-lg font-bold text-[#292524] tabular-nums">{fmt(data.montant || 0)}</span>
                  </div>
                </div>
              )}
              {editPanel.type === 'pgpa-ij' && (
                <div className="border-t border-[#e7e5e3] bg-[#fafaf9]">
                  <div className="px-5 py-3 flex justify-between items-center">
                    <span className="text-body-medium text-[#292524]">Total IJ net</span>
                    <span className="text-lg font-bold text-[#292524] tabular-nums">{fmt(data.montant || 0)}</span>
                  </div>
                </div>
              )}
              {editPanel.type === 'dft-ligne' && (
                <div className="border-t border-[#e7e5e3] bg-[#fafaf9]">
                  <div className="px-5 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-body-medium text-[#292524]">Total indemnisable</span>
                      <span className="text-caption px-1.5 py-0.5 bg-[#eeece6] text-[#78716c] rounded">{data.jours || 0}j</span>
                    </div>
                    <span className="text-lg font-bold text-[#292524] tabular-nums">{fmt(data.montant || 0)}</span>
                  </div>
                </div>
              )}

              {/* Footer actions */}
              {editPanel.type === 'dsa-ligne' && (
                <div className="px-5 py-4 flex justify-between">
                  <button onClick={() => { handleRejectLigne(data.id); setEditPanel(null); }} className="px-4 py-2 text-[#dc2626] border border-[#fecaca] bg-white hover:bg-[#fef2f2] rounded-lg text-body-medium transition-colors">
                    Supprimer
                  </button>
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
                    }} className="px-4 py-2 bg-[#292524] text-white rounded-lg hover:bg-[#44403c] text-body-medium transition-colors">Enregistrer</button>
                </div>
              )}
              {editPanel.type === 'piece-detail' && (
                <div className="px-5 py-4 flex flex-col gap-3">
                  <div className="flex justify-between">
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
                    }} className="px-4 py-2 text-[#dc2626] border border-[#fecaca] bg-white hover:bg-[#fef2f2] rounded-lg text-body-medium transition-colors">
                      Supprimer
                    </button>
                    <button onClick={() => {
                      const updatedPiece = {
                        ...data,
                        intitule: document.getElementById('piece-intitule')?.value || data.intitule,
                        type: document.getElementById('piece-type')?.value || data.type,
                        date: document.getElementById('piece-date')?.value || data.date
                      };
                      setPieces(prev => prev.map(p => p.id === data.id ? updatedPiece : p));
                      setEditPanel(null);
                    }} className="px-4 py-2 bg-[#292524] text-white rounded-lg hover:bg-[#44403c] text-body-medium transition-colors">Enregistrer</button>
                  </div>
                </div>
              )}
              {(editPanel.type === 'victime' || editPanel.type === 'fait-generateur') && (
                <div className="px-5 py-4 flex justify-end gap-2">
                  <button onClick={() => setEditPanel(null)} className="px-4 py-2 text-[#44403c] hover:bg-[#f5f5f4] rounded-lg text-body-medium transition-colors">Annuler</button>
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
                  }} className="px-4 py-2 bg-[#292524] text-white rounded-lg hover:bg-[#44403c] text-body-medium transition-colors">Enregistrer</button>
                </div>
              )}
              {editPanel.type === 'dossier-expertise' && (
                <div className="px-5 py-4 flex justify-end gap-2">
                  <button onClick={() => setEditPanel(null)} className="px-4 py-2 text-[#44403c] hover:bg-[#f5f5f4] rounded-lg text-body-medium transition-colors">Annuler</button>
                  <button onClick={() => {
                    setCommentaireExpertise(document.getElementById('proc-commentaire')?.value || '');
                    setEditPanel(null);
                  }} className="px-4 py-2 bg-[#292524] text-white rounded-lg hover:bg-[#44403c] text-body-medium transition-colors">Enregistrer</button>
                </div>
              )}
              {editPanel.type === 'victime-indirecte' && (
                <div className="px-5 py-4 flex justify-between">
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
                    <button onClick={() => setEditPanel(null)} className="px-4 py-2 text-[#44403c] hover:bg-[#f5f5f4] rounded-lg text-body-medium transition-colors">Annuler</button>
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
                    }} className="px-4 py-2 bg-[#292524] text-white rounded-lg hover:bg-[#44403c] text-body-medium transition-colors">Enregistrer</button>
                  </div>
                </div>
              )}
              {/* Panel nouvelle-procedure supprimé */}
              {editPanel.type === 'dossier-edit' && (
                <div className="px-5 py-4 flex justify-end gap-2">
                  <button onClick={() => setEditPanel(null)} className="px-4 py-2 text-[#44403c] hover:bg-[#f5f5f4] rounded-lg text-body-medium transition-colors">Annuler</button>
                  <button onClick={() => {
                    setDossierRef(document.getElementById('dossier-ref')?.value || dossierRef);
                    setDossierIntitule(document.getElementById('dossier-intitule')?.value || dossierIntitule);
                    setDossierStatut(document.getElementById('dossier-statut')?.value || dossierStatut);
                    setDossierDateOuverture(document.getElementById('dossier-date-ouverture')?.value || dossierDateOuverture);
                    setDossierAvocat(document.getElementById('dossier-avocat')?.value || dossierAvocat);
                    setDossierNotes(document.getElementById('dossier-notes')?.value || '');
                    setEditPanel(null);
                  }} className="px-4 py-2 bg-[#292524] text-white rounded-lg hover:bg-[#44403c] text-body-medium transition-colors">Enregistrer</button>
                </div>
              )}
              {/* ========== PANELS PGPA ========== */}

              {/* Panel PGPA Revenu de référence */}
              {editPanel.type === 'pgpa-revenu' && (
                <div className="px-5 py-4 flex justify-between">
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
                  }} className="px-4 py-2 text-[#dc2626] border border-[#fecaca] bg-white hover:bg-[#fef2f2] rounded-lg text-body-medium transition-colors">
                    Supprimer
                  </button>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditPanel(null); setEditingPieceIds([]); }} className="px-4 py-2 text-[#44403c] hover:bg-[#f5f5f4] rounded-lg text-body-medium transition-colors">Annuler</button>
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
                    }} className="px-4 py-2 bg-[#292524] text-white rounded-lg hover:bg-[#44403c] text-body-medium transition-colors">Enregistrer</button>
                  </div>
                </div>
              )}

              {/* Panel PGPA Revenu perçu période */}
              {editPanel.type === 'pgpa-revenu-percu' && (
                <div className="px-5 py-4 flex justify-between">
                  <button onClick={() => {
                    setPgpaData(prev => ({
                      ...prev,
                      revenusPercus: prev.revenusPercus.filter(l => l.id !== data.id)
                    }));
                    setEditPanel(null);
                    setEditingPieceIds([]);
                  }} className="px-4 py-2 text-[#dc2626] border border-[#fecaca] bg-white hover:bg-[#fef2f2] rounded-lg text-body-medium transition-colors">
                    Supprimer
                  </button>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditPanel(null); setEditingPieceIds([]); }} className="px-4 py-2 text-[#44403c] hover:bg-[#f5f5f4] rounded-lg text-body-medium transition-colors">Annuler</button>
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
                    }} className="px-4 py-2 bg-[#292524] text-white rounded-lg hover:bg-[#44403c] text-body-medium transition-colors">Enregistrer</button>
                  </div>
                </div>
              )}

              {/* Panel PGPA Indemnités journalières */}
              {editPanel.type === 'pgpa-ij' && (
                <div className="px-5 py-4 flex justify-between">
                  <button onClick={() => {
                    setPgpaData(prev => ({
                      ...prev,
                      ijPercues: prev.ijPercues.filter(l => l.id !== data.id)
                    }));
                    setEditPanel(null);
                    setEditingPieceIds([]);
                  }} className="px-4 py-2 text-[#dc2626] border border-[#fecaca] bg-white hover:bg-[#fef2f2] rounded-lg text-body-medium transition-colors">
                    Supprimer
                  </button>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditPanel(null); setEditingPieceIds([]); }} className="px-4 py-2 text-[#44403c] hover:bg-[#f5f5f4] rounded-lg text-body-medium transition-colors">Annuler</button>
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
                    }} className="px-4 py-2 bg-[#292524] text-white rounded-lg hover:bg-[#44403c] text-body-medium transition-colors">Enregistrer</button>
                  </div>
                </div>
              )}

              {/* Panel DFT Footer */}
              {editPanel.type === 'dft-ligne' && (
                <div className="px-5 py-4 flex justify-between">
                  <button onClick={() => {
                    setDftLignes(prev => prev.filter(l => l.id !== data.id));
                    setEditPanel(null); setEditingPieceIds([]);
                  }} className="px-4 py-2 text-[#dc2626] border border-[#fecaca] bg-white hover:bg-[#fef2f2] rounded-lg text-body-medium transition-colors">
                    Supprimer
                  </button>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditPanel(null); setEditingPieceIds([]); }} className="px-4 py-2 text-[#44403c] hover:bg-[#f5f5f4] rounded-lg text-body-medium transition-colors">Annuler</button>
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
                    }} className="px-4 py-2 bg-[#292524] text-white rounded-lg hover:bg-[#44403c] text-body-medium transition-colors">Enregistrer</button>
                  </div>
                </div>
              )}
          </div>
        </div>
      </>
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
          <div className="absolute left-0 top-full mt-1 w-56 p-2 bg-white border border-[#e7e5e3] rounded-lg shadow-lg opacity-0 invisible group-hover/piece:opacity-100 group-hover/piece:visible transition-all z-50">
            <div className="text-counter text-[#a8a29e] uppercase tracking-wide mb-1.5">{pieceCount} document{pieceCount > 1 ? 's' : ''} lié{pieceCount > 1 ? 's' : ''}</div>
            <div className="space-y-1">
              {ligne.pieceIds?.map(pid => {
                const piece = getPiece(pid);
                return (
                  <div key={pid} className="flex items-center gap-2 text-caption">
                    <span className="w-5 h-5 bg-blue-100 text-[#1e3a8a] text-counter rounded flex items-center justify-center flex-shrink-0">{getPieceLabel(pid)}</span>
                    <span className="truncate text-[#44403c]">{piece?.intitule || piece?.nom || 'Document'}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    };

    return (
      <div key={ligne.id} className="relative flex items-center p-3 hover:bg-[#fafaf9] group transition-colors">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <StatusIcon />
          <PieceIndicator />
          <div className="min-w-0">
            <div className="text-body-medium text-[#292524] truncate">{ligne.label || 'Sans libellé'}</div>
            <div className="text-caption text-[#a8a29e]">{ligne.date || '—'} • {ligne.type || '—'}</div>
          </div>
        </div>

        {/* Montant - PRIORITAIRE */}
        <span className="text-body-medium font-semibold text-[#292524] tabular-nums min-w-[90px] text-right flex-shrink-0">
          {ligne.montant != null ? fmt(ligne.montant) : '— €'}
        </span>

        {/* Actions en overlay au hover - minimaliste */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => handleRejectLigne(ligne.id)} className="p-1.5 text-[#a8a29e] hover:text-[#78716c] transition-colors" title="Supprimer">
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
          <div className="absolute left-0 top-full mt-1 w-56 p-2 bg-white border border-[#e7e5e3] rounded-lg shadow-lg opacity-0 invisible group-hover/piece:opacity-100 group-hover/piece:visible transition-all z-50">
            <div className="text-counter text-[#a8a29e] uppercase tracking-wide mb-1.5">{pieceCount} document{pieceCount > 1 ? 's' : ''} lié{pieceCount > 1 ? 's' : ''}</div>
            <div className="space-y-1">
              {ligne.pieceIds?.map(pid => {
                const piece = getPiece(pid);
                return (
                  <div key={pid} className="flex items-center gap-2 text-caption">
                    <span className="w-5 h-5 bg-blue-100 text-[#1e3a8a] text-counter rounded flex items-center justify-center flex-shrink-0">{getPieceLabel(pid)}</span>
                    <span className="truncate text-[#44403c]">{piece?.intitule || piece?.nom || 'Document'}</span>
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
      <div key={ligne.id} className="relative flex items-center p-3 hover:bg-[#fafaf9] group transition-colors">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <StatusIcon />
          <PieceIndicator />
          <div className="min-w-0">
            <div className="text-body-medium text-[#292524] truncate">{ligne.label || 'Sans libellé'}</div>
            <div className="text-caption text-[#a8a29e]">{getSecondaryText() || '—'}</div>
          </div>
        </div>

        {/* Montant - PRIORITAIRE */}
        <span className="text-body-medium font-semibold text-[#292524] tabular-nums min-w-[90px] text-right flex-shrink-0">
          {fmt(ligne.montant || ligne.revalorise || 0)}
        </span>

        {/* Actions en overlay au hover - minimaliste */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onDelete && (
            <button onClick={() => onDelete(ligne)} className="p-1.5 text-[#a8a29e] hover:text-[#78716c] transition-colors" title="Supprimer">
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
      if (currentLevel.activeTab === 'dossier') {
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
                          <p className="text-caption text-[#a8a29e] mb-1">Extrait depuis</p>
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
                <div className={`text-body ${hasValue || isActive ? 'text-[#292524]' : 'text-[#d6d3d1]'} ${isLongText ? 'leading-relaxed' : ''}`}>
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
                  <span className="text-[11px] font-medium text-[#78716c] uppercase tracking-wider" style={colHeaderStyle}>Victime</span>
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
                                <p className="text-caption text-[#a8a29e] mb-1">Extrait depuis</p>
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
                        <span className={`text-body ${isRevealed('dateNaissance') && victimeData.dateNaissance ? 'text-[#292524]' : 'text-[#d6d3d1] italic'}`}>
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
                  <span className="text-[11px] font-medium text-[#78716c] uppercase tracking-wider" style={colHeaderStyle}>Fait générateur</span>
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
                  <span className="text-[11px] font-medium text-[#78716c] uppercase tracking-wider" style={colHeaderStyle}>Faits et procédure</span>
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
              <div className="bg-white rounded-lg border border-[#e7e5e3]/60 shadow-sm">
                <div className="px-4 py-2.5 border-b border-zinc-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#a8a29e]">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                    <span className="text-body-medium">Informations victime</span>
                  </div>
                  <button onClick={() => setEditPanel({ type: 'victime', title: 'Informations victime' })} className="p-1 text-[#d6d3d1] hover:text-[#78716c] hover:bg-[#eeece6] rounded transition-colors"><Edit3 className="w-3.5 h-3.5" strokeWidth={1.5} /></button>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                    <div>
                      <div className="text-caption text-[#a8a29e] mb-0.5">Nom</div>
                      <div className="text-body text-[#44403c]">{victimeData.nom}</div>
                    </div>
                    <div>
                      <div className="text-caption text-[#a8a29e] mb-0.5">Prénom</div>
                      <div className="text-body text-[#44403c]">{victimeData.prenom}</div>
                    </div>
                    <div>
                      <div className="text-caption text-[#a8a29e] mb-0.5">Sexe</div>
                      <div className="text-body text-[#44403c]">{victimeData.sexe}</div>
                    </div>
                    <div>
                      <div className="text-caption text-[#a8a29e] mb-0.5">Date de naissance</div>
                      <div className="text-body text-[#44403c]">{victimeData.dateNaissance} <span className="text-[#a8a29e]">({calcAge(victimeData.dateNaissance)} ans)</span></div>
                    </div>
                    {victimeData.dateDeces && (
                      <div>
                        <div className="text-caption text-[#a8a29e] mb-0.5">Date de décès</div>
                        <div className="text-body text-[#44403c]">{victimeData.dateDeces} <span className="text-[#a8a29e]">({calcAge(victimeData.dateNaissance, victimeData.dateDeces)} ans)</span></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Infos Accident */}
              <div className="bg-white rounded-lg border border-[#e7e5e3]/60 shadow-sm">
                <div className="px-4 py-2.5 border-b border-zinc-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#a8a29e]">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                    <span className="text-body-medium">Fait générateur</span>
                  </div>
                  <button onClick={() => setEditPanel({ type: 'fait-generateur', title: 'Fait générateur' })} className="p-1 text-[#d6d3d1] hover:text-[#78716c] hover:bg-[#eeece6] rounded transition-colors"><Edit3 className="w-3.5 h-3.5" strokeWidth={1.5} /></button>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3 mb-4">
                    <div>
                      <div className="text-caption text-[#a8a29e] mb-0.5">Type</div>
                      <div className="text-body text-[#44403c]">{faitGenerateur.type}</div>
                    </div>
                    <div>
                      <div className="text-caption text-[#a8a29e] mb-0.5">Date de l'accident</div>
                      <div className="text-body text-[#44403c]">{faitGenerateur.dateAccident}</div>
                    </div>
                    <div>
                      <div className="text-caption text-[#a8a29e] mb-0.5">Première constatation</div>
                      <div className="text-body text-[#44403c]">{faitGenerateur.datePremiereConstatation}</div>
                    </div>
                    <div>
                      <div className="text-caption text-[#a8a29e] mb-0.5">Consolidation</div>
                      <div className="text-body text-[#44403c]">{faitGenerateur.dateConsolidation}</div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="text-caption text-[#a8a29e]">Résumé des faits</div>
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
                    <div className="text-body text-[#78716c] leading-relaxed">
                      {faitGenerateur.resume || <span className="text-[#d6d3d1] italic">Aucun résumé renseigné.</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Commentaire d'expertise */}
              <div className="bg-white rounded-lg border border-[#e7e5e3]/60 shadow-sm">
                <div className="px-4 py-2.5 border-b border-zinc-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#a8a29e]">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                    </svg>
                    <span className="text-body-medium">Commentaire d'expertise</span>
                  </div>
                  <button onClick={() => setEditPanel({ type: 'dossier-expertise', title: "Commentaire d'expertise" })} className="p-1 text-[#d6d3d1] hover:text-[#78716c] hover:bg-[#eeece6] rounded transition-colors"><Edit3 className="w-3.5 h-3.5" strokeWidth={1.5} /></button>
                </div>
                <div className="p-4">
                  <div className="text-body text-[#78716c] leading-relaxed">
                    {commentaireExpertise || <span className="text-[#d6d3d1] italic">Aucun commentaire d'expertise renseigné.</span>}
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
              <div className="bg-white rounded-lg border border-[#e7e5e3]/60 shadow-sm">
                <div className="px-4 py-2.5 border-b border-zinc-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#a8a29e]">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                    </svg>
                    <span className="text-body-medium">Victimes indirectes</span>
                  </div>
                  <button
                    onClick={() => setEditPanel({ type: 'victime-indirecte', title: 'Nouvelle victime indirecte', data: null })}
                    className="flex items-center gap-1 px-2 py-1 text-caption text-[#78716c] hover:bg-[#eeece6] rounded transition-colors"
                  >
                    <Plus className="w-3 h-3" strokeWidth={1.5} />Ajouter
                  </button>
                </div>
                {victimesIndirectes.length > 0 ? (
                  <div className="divide-y divide-[#e7e5e3]">
                    {victimesIndirectes.map(vi => (
                      <div key={vi.id} className="flex items-center justify-between p-3 hover:bg-[#fafaf9] group transition-colors">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#eeece6] flex items-center justify-center text-caption text-[#78716c] font-medium">
                            {vi.prenom[0]}{vi.nom[0]}
                          </div>
                          <div>
                            <div className="text-body text-[#44403c]">{vi.prenom} {vi.nom}</div>
                            <div className="text-caption text-[#a8a29e]">{vi.lien} • {calcAge(vi.dateNaissance)} ans</div>
                          </div>
                        </div>
                        <button
                          onClick={() => setEditPanel({ type: 'victime-indirecte', title: 'Modifier victime indirecte', data: vi })}
                          className="p-1 text-[#d6d3d1] hover:text-[#78716c] rounded opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Edit3 className="w-3.5 h-3.5" strokeWidth={1.5} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center">
                    <div className="text-body text-[#a8a29e]">Aucune victime indirecte</div>
                  </div>
                )}
              </div>
            </div>

            {/* Colonne droite — Encart Chiffrage (sticky) */}
            <div className="col-span-1 sticky top-0">
              <div className="bg-white rounded-lg border border-[#e7e5e3]/60 shadow-sm">
                <div className="px-4 py-2.5 border-b border-zinc-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#a8a29e]">
                    <Calculator className="w-4 h-4" strokeWidth={1.5} />
                    <span className="text-body-medium">Chiffrage</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('Chiffrage')}
                    className="flex items-center gap-1 text-caption text-[#a8a29e] hover:text-[#78716c] transition-colors"
                  >
                    Voir le détail
                    <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </div>
                <div className="p-5">
                  <div className="text-center">
                    <div className="text-[36px] font-semibold text-[#292524] tabular-nums leading-none">{fmt(totalChiffrage)}</div>
                    <div className="text-body text-[#a8a29e] mt-1.5">{allPostes.filter(p => !p.disabled).length} postes de préjudice chiffrés</div>
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
                  <Sparkles className="w-8 h-8 text-[#78716c] animate-pulse" />
                </div>
              </div>
              <h2 className="text-heading-md text-[#292524] mb-1 tracking-tight">
                {extractionPhases[currentPhaseIndex]?.label || 'Analyse'} en cours...
              </h2>
              <p className="text-body text-[#78716c] mb-8">L'IA analyse vos documents</p>
              <div className="flex items-center gap-1 mb-8">
                {extractionPhases.map((phase, i) => {
                  const Icon = phase.icon;
                  const isActive = i === currentPhaseIndex;
                  const isDone = i < currentPhaseIndex;
                  return (
                    <div key={phase.key} className="flex items-center">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-500 ${isDone ? 'bg-zinc-200' : isActive ? 'bg-zinc-200 scale-110' : 'bg-[#eeece6]'}`}>
                        {isDone ? <Check className="w-4 h-4 text-[#78716c] animate-bounce-in" /> : <Icon className={`w-4 h-4 transition-colors duration-300 ${isActive ? 'text-[#44403c]' : 'text-[#a8a29e]'}`} />}
                      </div>
                      {i < extractionPhases.length - 1 && <div className={`w-3 h-0.5 mx-0.5 transition-colors duration-500 ${isDone ? 'bg-zinc-400' : 'bg-zinc-200'}`} />}
                    </div>
                  );
                })}
              </div>
              <div className="w-56 h-1.5 bg-[#eeece6] rounded-full overflow-hidden">
                <div className="h-full bg-[#F8F7F5]0 rounded-full transition-all duration-700 ease-out" style={{ width: `${extractionState.progress}%` }} />
              </div>
              <p className="text-caption text-[#a8a29e] mt-3">{extractionState.progress}%</p>
            </div>
          );
        }

        // Empty state - no postes yet
        if (allPostes.length === 0) {
          return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 animate-fade-up">
              <div className="text-center max-w-sm">
                <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-[#eeece6] flex items-center justify-center">
                  <ClipboardList className="w-6 h-6 text-[#a8a29e]" />
                </div>
                <h2 className="text-lg font-semibold text-[#292524] mb-2">Aucun poste de préjudice</h2>
                <p className="text-body text-[#78716c] mb-6">Sélectionnez un poste dans le menu latéral pour commencer le chiffrage.</p>
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

        // Compute summary totals
        const totalDepenses = allPostes.reduce((s, p) => s + (p.montant || 0), 0);
        const totalTiers = 0; // placeholder
        const totalIndem = totalDepenses - totalTiers;

        return (
          <div className="space-y-6">
            {/* Summary pills + actions row */}
            <div className="flex items-center gap-3 px-px">
              <div className="h-9 px-3 flex items-center gap-2.5 border border-[#d6d3d1] rounded-lg whitespace-nowrap">
                <span style={{ fontSize: 12, fontWeight: 400, color: '#78716c', letterSpacing: 0.12, lineHeight: '16px' }}>Dépenses</span>
                <span style={{ fontSize: 14, fontWeight: 500, color: '#44403c', lineHeight: '20px' }}>{fmt(totalDepenses)}</span>
              </div>
              <div className="h-9 px-3 flex items-center gap-2.5 border border-[#d6d3d1] rounded-lg whitespace-nowrap">
                <span style={{ fontSize: 12, fontWeight: 400, color: '#78716c', letterSpacing: 0.12, lineHeight: '16px' }}>Tiers payeurs</span>
                <span style={{ fontSize: 14, fontWeight: 500, color: '#44403c', lineHeight: '20px' }}>{fmt(totalTiers)}</span>
              </div>
              <div className="h-9 px-3 flex items-center gap-2 border border-[#e7e5e3] rounded-lg whitespace-nowrap" style={{ backgroundColor: '#eeece6' }}>
                <span style={{ fontSize: 12, fontWeight: 400, color: '#292524', letterSpacing: 0.12, lineHeight: '16px' }}>Indem. totale</span>
                <span style={{ fontSize: 14, fontWeight: 500, color: '#292524', lineHeight: '20px' }}>{fmt(totalIndem)}</span>
              </div>
              <div className="flex-1" />
              <button
                className="h-9 px-3 flex items-center gap-2 border border-[#d6d3d1] rounded-lg whitespace-nowrap hover:bg-stone-50 transition-colors"
                style={{ fontSize: 13, fontWeight: 500, color: '#44403c' }}
              >
                <Download className="w-3.5 h-3.5 text-[#78716c]" />
                Exporter
              </button>
              <button
                className="h-9 px-3 flex items-center gap-2 rounded-lg whitespace-nowrap hover:opacity-90 transition-opacity"
                style={{ fontSize: 13, fontWeight: 500, color: 'white', backgroundColor: '#292524' }}
                onClick={() => setPosteSearchOpen(true)}
              >
                <Plus className="w-3.5 h-3.5" />
                Ajouter un poste
              </button>
            </div>

            {/* Category table sections */}
            <div className="space-y-6">
              {categories.filter(cat => cat.postes.length > 0).map((cat) => (
                <div key={cat.id} className="border border-[#e7e5e3] rounded-xl overflow-hidden" style={{ boxShadow: '0px 1px 2px 0px rgba(26,26,26,0.05)' }}>
                  {/* Category header */}
                  <div className="h-10 px-4 flex items-center border-b border-[#e7e5e3]" style={{ backgroundColor: '#f8f7f5' }}>
                    <span style={{ fontSize: 12, fontWeight: 500, color: '#78716c', lineHeight: '16px' }}>{cat.title}</span>
                  </div>
                  {/* Column headers */}
                  <div className="flex items-center h-10 bg-white border-b border-[#e7e5e3]">
                    <div className="flex-1 px-4">
                      <span style={{ fontSize: 12, fontWeight: 500, color: '#78716c', lineHeight: '16px' }}>Nom du poste</span>
                    </div>
                    <div className="w-[140px] px-3 text-right">
                      <span style={{ fontSize: 12, fontWeight: 500, color: '#78716c', lineHeight: '16px' }}>Total</span>
                    </div>
                    <div className="w-[140px] px-3 text-right">
                      <span style={{ fontSize: 12, fontWeight: 500, color: '#78716c', lineHeight: '16px' }}>Tiers</span>
                    </div>
                    <div className="w-[160px] px-3 text-right">
                      <span style={{ fontSize: 12, fontWeight: 500, color: '#78716c', lineHeight: '16px' }}>Indemnisation victime</span>
                    </div>
                    <div className="w-11" />
                  </div>
                  {/* Data rows */}
                  {cat.postes.map((p, pIdx) => {
                    const isLast = pIdx === cat.postes.length - 1;
                    return (
                      <button
                        key={p.id}
                        onClick={() => navigateTo(p)}
                        className={`w-full flex items-center h-14 bg-white hover:bg-[#fafaf9] transition-colors ${!isLast ? 'border-b border-[#e7e5e3]' : ''}`}
                      >
                        {/* Green check badge */}
                        <div className="pl-4 pr-3 flex items-center justify-center">
                          <span className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: '#cce6d9' }}>
                            <Check className="w-3 h-3 text-[#16a34a]" strokeWidth={2.5} />
                          </span>
                        </div>
                        {/* Acronym */}
                        <div className="w-[42px] px-1 flex items-center">
                          <span style={{ fontSize: 12, fontWeight: 500, color: '#78716c', lineHeight: '16px' }}>{p.title}</span>
                        </div>
                        {/* Full name */}
                        <div className="flex-1 px-3 flex items-center min-w-0">
                          <span className="truncate" style={{ fontSize: 14, fontWeight: 400, color: '#292524', lineHeight: '20px' }}>{p.fullTitle}</span>
                        </div>
                        {/* Total column */}
                        <div className="w-[140px] px-3 flex items-center justify-end">
                          {p.montant > 0 ? (
                            <span style={{ fontSize: 14, fontWeight: 400, color: '#78716c', lineHeight: '20px' }}>{fmt(p.montant)}</span>
                          ) : (
                            <span style={{ fontSize: 14, fontWeight: 400, color: '#78716c', lineHeight: '20px' }}>&mdash;</span>
                          )}
                        </div>
                        {/* Tiers column */}
                        <div className="w-[140px] px-3 flex items-center justify-end">
                          <span style={{ fontSize: 14, fontWeight: 400, color: '#78716c', lineHeight: '20px' }}>&mdash;</span>
                        </div>
                        {/* Indemnisation victime column */}
                        <div className="w-[160px] px-3 flex flex-col items-end justify-center">
                          <span style={{ fontSize: 14, fontWeight: 500, color: '#292524', lineHeight: '20px' }}>{fmt(p.montant)}</span>
                        </div>
                        {/* Chevron + ellipsis */}
                        <div className="w-11 pr-4 pl-3 flex items-center justify-end">
                          <MoreVertical className="w-4 h-4 text-[#a8a29e] opacity-0 group-hover:opacity-100" />
                          <ChevronRight className="w-4 h-4 text-[#d6d3d1]" strokeWidth={1.5} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Poste Search Command Palette */}
            {posteSearchOpen && (
              <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]" onClick={() => setPosteSearchOpen(false)}>
                <div className="absolute inset-0 bg-black/30" />
                <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                  {/* Search input */}
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-stone-100">
                    <Search className="w-4 h-4 text-stone-400 flex-shrink-0" strokeWidth={1.5} />
                    <input
                      type="text"
                      value={posteSearchQuery}
                      onChange={(e) => setPosteSearchQuery(e.target.value)}
                      placeholder="Rechercher un poste de préjudice..."
                      className="flex-1 text-body text-stone-700 placeholder:text-stone-400 outline-none bg-transparent"
                      autoFocus
                    />
                    {posteSearchQuery && (
                      <button onClick={() => setPosteSearchQuery('')} className="p-0.5 hover:bg-stone-100 rounded">
                        <X className="w-3.5 h-3.5 text-stone-400" />
                      </button>
                    )}
                  </div>
                  {/* Results */}
                  <div className="max-h-[50vh] overflow-y-auto py-2">
                    {(() => {
                      const q = posteSearchQuery.trim().toLowerCase();
                      const allTaxoPostes = POSTES_TAXONOMY.flatMap(s => s.categories.flatMap(c => c.postes.map(p => ({ ...p, categoryTitle: c.title }))));
                      const filtered = q
                        ? allTaxoPostes.filter(p => p.label.toLowerCase().includes(q) || (p.acronym && p.acronym.toLowerCase().includes(q)))
                        : allTaxoPostes;
                      const alreadyEnabled = allPostes.map(p => p.id);
                      if (filtered.length === 0) return <p className="px-4 py-6 text-center text-body text-stone-400">Aucun poste trouvé</p>;
                      let lastCat = '';
                      return filtered.map(p => {
                        const isEnabled = alreadyEnabled.includes(p.id);
                        const showCat = p.categoryTitle !== lastCat;
                        lastCat = p.categoryTitle;
                        return (
                          <div key={p.id}>
                            {showCat && <div className="px-4 pt-3 pb-1" style={colHeaderStyle}>{p.categoryTitle}</div>}
                            <button
                              onClick={() => {
                                if (!isEnabled) {
                                  handleSmartAddPoste(p.id);
                                } else {
                                  const existing = allPostes.find(ep => ep.id === p.id);
                                  if (existing) navigateTo(existing);
                                }
                                setPosteSearchOpen(false);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-stone-50 transition-colors text-left"
                            >
                              {p.acronym && (
                                <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-counter font-semibold bg-stone-100 text-stone-600 rounded min-w-[36px] text-center">
                                  {p.acronym}
                                </span>
                              )}
                              <span className="flex-1 text-body text-stone-700">{p.label}</span>
                              {isEnabled && <span className="text-counter text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded-full">Actif</span>}
                            </button>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>
            )}

            {/* Panel Paramètres Chiffrage */}
            {showChiffrageParams && (
              <div className="fixed inset-0 z-50 flex justify-end">
                <div className="absolute inset-0 bg-black/30" onClick={() => setShowChiffrageParams(false)} />
                <div className="relative w-full max-w-md bg-white shadow-xl flex flex-col">
                  <div className="flex items-center justify-between px-5 py-3 border-b">
                    <h2 className="text-body-medium font-semibold">Paramètres du chiffrage</h2>
                    <button onClick={() => setShowChiffrageParams(false)} className="p-1 hover:bg-[#F8F7F5] rounded"><X className="w-4 h-4" /></button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <h3 className="font-semibold text-[#292524]">Fraction indemnisable des préjudices</h3>
                        <button className="text-[#a8a29e] hover:text-[#78716c]"><HelpCircle className="w-4 h-4" /></button>
                      </div>
                      <div className="space-y-3">
                        <input type="range" min="0" max="100" value={chiffrageParams.fractionIndemnisable}
                          onChange={(e) => setChiffrageParams(prev => ({ ...prev, fractionIndemnisable: parseInt(e.target.value) }))} className="w-full" />
                        <div className="flex items-center justify-between text-caption text-[#78716c]">
                          <span>0</span><span>1/4</span><span>1/3</span><span>1/2</span><span>2/3</span><span>3/4</span><span>1</span>
                        </div>
                        <div className="flex justify-end"><div className="px-3 py-1.5 border rounded-lg text-body-medium">{chiffrageParams.fractionIndemnisable} %</div></div>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#292524] mb-4">Tiers payeurs</h3>
                      <div className="space-y-2">
                        {chiffrageParams.tiersPayeurs.map((tiers, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <label className="text-caption text-[#78716c] w-12">Nom *</label>
                            <input type="text" value={tiers} onChange={(e) => { const newTiers = [...chiffrageParams.tiersPayeurs]; newTiers[idx] = e.target.value; setChiffrageParams(prev => ({ ...prev, tiersPayeurs: newTiers })); }} className="flex-1 px-3 py-2 border rounded-lg text-body" />
                            <button onClick={() => { const newTiers = chiffrageParams.tiersPayeurs.filter((_, i) => i !== idx); setChiffrageParams(prev => ({ ...prev, tiersPayeurs: newTiers })); }} className="p-2 text-[#a8a29e] hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        ))}
                        <button onClick={() => setChiffrageParams(prev => ({ ...prev, tiersPayeurs: [...prev.tiersPayeurs, ''] }))} className="text-body text-blue-600 hover:text-[#1e3a8a] font-medium">+ Ajouter un tiers payeur</button>
                      </div>
                    </div>
                  </div>
                  <div className="px-5 py-3 border-t flex justify-end gap-2">
                    <button onClick={() => setShowChiffrageParams(false)} className="px-4 py-2 text-body text-[#78716c] hover:bg-[#F8F7F5] rounded-lg">Fermer</button>
                    <button onClick={() => setShowChiffrageParams(false)} className="px-4 py-2 text-body-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg">Enregistrer</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      }
      if (currentLevel.activeTab === 'pièces') {
        if (dropFirstPieces.length > 0) return renderDropFirstPiecesTab();
        return renderPiecesList(pieces, true);
      }

      // Actes tab placeholder
      if (currentLevel.activeTab === 'actes') {
        return (
          <div className="flex-1 flex items-center justify-center py-20">
            <div className="text-center">
              <ClipboardList className="w-10 h-10 text-stone-300 mx-auto mb-3" strokeWidth={1.5} />
              <p className="text-body-medium text-stone-500">Actes de procédure</p>
              <p className="text-caption text-stone-400 mt-1">Bientôt disponible</p>
            </div>
          </div>
        );
      }

      // JP tab placeholder
      if (currentLevel.activeTab === 'jp') {
        return (
          <div className="flex-1 flex items-center justify-center py-20">
            <div className="text-center">
              <Landmark className="w-10 h-10 text-stone-300 mx-auto mb-3" strokeWidth={1.5} />
              <p className="text-body-medium text-stone-500">Jurisprudences</p>
              <p className="text-caption text-stone-400 mt-1">Bientôt disponible</p>
            </div>
          </div>
        );
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
        <div className={`${dsaLignes.length === 0 && processing.length === 0 && !(posteExtracting && posteExtracting.posteType === 'dsa') && !chatAnalyzedPostes.current.has('dsa') ? 'h-full flex flex-col' : ''}`}>
          {/* CALCUL Section */}
          <div className="border-b border-[#e7e5e3]" style={{ backgroundColor: '#F8F7F5' }}>
            <div className="p-4">
              <div className="space-y-4">

          {/* Param chips block */}
          <div className={cardBlockClass}>
            <div className="flex items-center gap-3 px-4 h-[52px]">
              <div className="w-6 h-6 bg-[#eeece6] rounded-[6px] flex items-center justify-center flex-shrink-0">
                <Settings className="w-3.5 h-3.5 text-[#78716c]" />
              </div>
              <button
                onClick={() => setActiveParamChip(activeParamChip === 'revaloriser' ? null : 'revaloriser')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                  activeParamChip === 'revaloriser'
                    ? 'bg-[#eef3fa] border-[#aabcd5] text-[#1e3a8a]'
                    : 'bg-transparent border-[#d6d3d1] text-[#78716c] hover:border-[#a8a29e]'
                }`}
              >
                Revaloriser IPC Annuel
              </button>
            </div>
            {activeParamChip === 'revaloriser' && (
              <div className="px-4 py-3 border-t border-[#e7e5e3]" style={{ backgroundColor: '#F8F7F5' }}>
                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-9 h-5 bg-[#d6d3d1] peer-checked:bg-[#292524] rounded-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                  </label>
                  <div className="w-px h-4 bg-[#e7e5e3]" />
                  <span className="text-xs font-medium text-[#78716c]">Indice</span>
                  <select className="text-xs font-medium text-[#292524] bg-white border border-[#e7e5e3] rounded-lg px-2.5 py-1.5">
                    <option>IPC Annuel</option>
                    <option>IPC Mensuel</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Empty state DSA */}
          {dsaLignes.length === 0 && processing.length === 0 && !(posteExtracting && posteExtracting.posteType === 'dsa') && !chatAnalyzedPostes.current.has('dsa') && renderInlineDocPicker('dsa', {
            icon: Receipt,
            title: 'Ajoutez vos justificatifs pour créer vos lignes de dépenses',
            description: 'Déposez un ou plusieurs documents. Plato lit, extrait et structure les informations pour chaque ligne.',
            expectedDocs: ['Factures médicales', 'Ordonnances', 'Justificatifs de pharmacie', 'Facture hospitalisation']
          })}

          {/* Card Block: Dépenses de santé */}
          {(dsaLignes.length > 0 || processing.length > 0 || (posteExtracting && posteExtracting.posteType === 'dsa') || chatAnalyzedPostes.current.has('dsa')) && (
          <div className={cardBlockClass}>
            {/* Title Row */}
            <div className="flex items-center justify-between h-12 px-4 border-b border-[#e7e5e3]">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-[#eeece6] rounded-[6px] flex items-center justify-center">
                  <Receipt className="w-3.5 h-3.5 text-[#78716c]" />
                </div>
                <span className="text-[14px] font-medium text-[#292524]">Dépenses de santé actuelles</span>
              </div>
              <div className="flex items-center gap-2">
                <span style={serifAmountStyle} className="text-[#292524]">{fmt(totalMontant)}</span>
                <ChevronDown className="w-4 h-4 text-[#78716c]" />
              </div>
            </div>
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
                  <div className="w-[52px] text-center flex-shrink-0" style={colHeaderStyle}>Doc</div>
                  <div className="flex-1 min-w-0 px-3" style={colHeaderStyle}>Libellé</div>
                  <div className="flex-1 min-w-0 px-3 text-right" style={colHeaderStyle}>Date</div>
                  <div className="w-[254px] px-3 text-right flex-shrink-0" style={colHeaderStyle}>Montant</div>
                  <div className="flex-1 min-w-0 px-2 text-right" style={colHeaderStyle}>Reste à charge</div>
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
                      className="relative flex items-center h-[52px] border-b border-[#e7e5e3] last:border-b-0 bg-white group cursor-pointer hover:bg-[#fafaf9] transition-colors"
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
                            <span className="inline-flex items-center justify-center w-7 h-7 bg-[#DFE8F5] rounded-md relative">
                              <FileText className="w-4 h-4 text-[#2563eb]" />
                              <span className="absolute -top-1.5 left-[18px] min-w-[16px] h-4 bg-[#2563eb] text-white text-counter font-medium rounded-full flex items-center justify-center border-2 border-white px-0.5">{pieceCount}</span>
                            </span>
                            <div className="absolute left-0 top-full mt-1 w-56 p-2 bg-white border border-[#e7e5e3] rounded-lg shadow-lg opacity-0 invisible group-hover/piece:opacity-100 group-hover/piece:visible transition-all z-50">
                              <div className="text-counter text-[#78716c] uppercase tracking-wide mb-1.5">{pieceCount} document{pieceCount > 1 ? 's' : ''} lié{pieceCount > 1 ? 's' : ''}</div>
                              <div className="space-y-1">
                                {l.pieceIds?.map(pid => {
                                  const piece = getPiece(pid);
                                  return <div key={pid} className="flex items-center gap-2 text-caption"><span className="w-5 h-5 bg-blue-100 text-[#1e3a8a] text-counter rounded flex items-center justify-center flex-shrink-0">{getPieceLabel(pid)}</span><span className="truncate text-[#292524]">{piece?.intitule || piece?.nom || 'Document'}</span></div>;
                                })}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center justify-center w-7 h-7 bg-[#F8F7F5] text-[#d6d3d1] rounded-md border border-dashed border-[#e7e5e3]">
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

          {/* Total Block */}
          {dsaLignes.length > 0 && (
          <div className={totalBlockClass}>
            <button onClick={() => setTotalExpanded(prev => ({...prev, dsa: !prev.dsa}))} className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-[#d6d3d1] rounded-[6px] flex items-center justify-center">
                  <FileText className="w-3.5 h-3.5 text-[#78716c]" />
                </div>
                <span className="text-[14px] font-medium text-[#292524]">Total</span>
              </div>
              <div className="flex items-center gap-3">
                <span style={serifAmountStyle} className="text-[#292524]">{fmt(indemniteVictime)}</span>
                <ChevronRight className={`w-4 h-4 text-[#78716c] transition-transform ${totalExpanded.dsa ? 'rotate-90' : ''}`} />
              </div>
            </button>
            {totalExpanded.dsa && (
              <>
                <div className="border-t border-[#d6d3d1] mt-3 mb-3" />
                <div className="space-y-2">
                  <div className="flex justify-between"><span className="text-[14px] text-[#78716c]">Total dépenses</span><span className="text-[14px] text-[#292524]">{fmt(totalMontant)}</span></div>
                  <div className="flex justify-between"><span className="text-[14px] text-[#78716c]">Total remboursé</span><span className="text-[14px] text-[#292524]">− {fmt(totalRembourse)}</span></div>
                  <div className="flex justify-between"><span className="text-[14px] text-[#78716c]">Reste à charge</span><span className="text-[14px] text-[#292524]">{fmt(totalResteACharge)}</span></div>
                </div>
              </>
            )}
          </div>
          )}

              </div>{/* end space-y-4 */}
            </div>{/* end p-4 */}
          </div>{/* end CALCUL section */}

          {/* NOTES / ARGUMENTAIRE Section */}
          <div className="p-4 border-b border-[#e7e5e3]" style={{ backgroundColor: '#F8F7F5' }}>
            <div style={sectionHeaderStyle} className="mb-[17px]">NOTES / ARGUMENTAIRE</div>
            <div className="bg-white border border-[#e7e5e3] rounded-[4px] overflow-hidden">
              <div className="flex items-center gap-1 px-3 py-2 border-b border-[#e7e5e3]">
                <button className="px-2 py-1 rounded hover:bg-[#f5f5f4] text-[#78716c] font-bold text-sm">B</button>
                <button className="px-2 py-1 rounded hover:bg-[#f5f5f4] text-[#78716c] italic text-sm">I</button>
                <button className="px-2 py-1 rounded hover:bg-[#f5f5f4] text-[#78716c] underline text-sm">U</button>
              </div>
              <textarea
                value={posteNotes.dsa || ''}
                onChange={(e) => setPosteNotes(prev => ({...prev, dsa: e.target.value}))}
                className="w-full p-4 text-[14px] text-[#292524] leading-[27px] resize-none min-h-[120px] focus:outline-none"
                placeholder="Ajoutez vos notes et arguments..."
              />
            </div>
          </div>

          {/* JURISPRUDENCES Section */}
          <div className="p-4" style={{ backgroundColor: '#F8F7F5' }}>
            <div style={sectionHeaderStyle} className="mb-[17px]">JURISPRUDENCES</div>
            <div className="bg-white border border-[#e7e5e3] rounded-[4px] h-[58px] flex items-center justify-center">
              <span className="text-[14px] text-[#a8a29e]">Aucune jurisprudence ajoutée</span>
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

      // Empty state — before any data (skip if chat has analyzed)
      if (pgpaData.revenuRef.lignes.length === 0 && pgpaData.revenusPercus.length === 0 && pgpaData.ijPercues.length === 0 && !chatAnalyzedPostes.current.has('pgpa')) {
        return renderInlineDocPicker('pgpa-revenu-ref', {
          icon: Calculator,
          title: 'Aucune donnée PGPA',
          description: 'Ajoutez les justificatifs de revenus pour calculer les pertes de gains professionnels actuels.',
          expectedDocs: ['Bulletins de salaire', 'Attestations employeur', "Avis d'imposition", 'Bilans comptables']
        });
      }

      // FLAT PGPA — all cards on one page (per Figma)
      const revenus = pgpaData.revenuRef.lignes.filter(l => l.type === 'revenu');
      const gains = pgpaData.revenuRef.lignes.filter(l => l.type === 'gain');
      const allRevenuRefLignes = [...revenus, ...gains];

      return (
        <div>
          {/* CALCUL Section */}
          <div className="border-b border-[#e7e5e3]" style={{ backgroundColor: '#F8F7F5' }}>
            <div className="p-4">
              <div className="space-y-4">

          {/* Param chips card block */}
          <div className={cardBlockClass}>
            <div className="flex items-center gap-3 px-4 h-[52px]">
              <div className="w-6 h-6 bg-[#eeece6] rounded-[6px] flex items-center justify-center flex-shrink-0">
                <Settings className="w-3.5 h-3.5 text-[#78716c]" />
              </div>
              <button
                onClick={() => setActiveParamChip(activeParamChip === 'revaloriser-pgpa' ? null : 'revaloriser-pgpa')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                  activeParamChip === 'revaloriser-pgpa'
                    ? 'bg-[#eef3fa] border-[#aabcd5] text-[#1e3a8a]'
                    : 'bg-transparent border-[#d6d3d1] text-[#78716c] hover:border-[#a8a29e]'
                }`}
              >
                Revaloriser {pgpaData.revenuRef.revalorisation === 'ipc-annuel' ? 'IPC Annuel' : pgpaData.revenuRef.revalorisation === 'smic-horaire' ? 'SMIC Horaire' : 'Aucune'}
              </button>
            </div>
            {activeParamChip === 'revaloriser-pgpa' && (
              <div className="px-4 py-3 border-t border-[#e7e5e3]" style={{ backgroundColor: '#F8F7F5' }}>
                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-9 h-5 bg-[#d6d3d1] peer-checked:bg-[#292524] rounded-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                  </label>
                  <div className="w-px h-4 bg-[#e7e5e3]" />
                  <span className="text-xs font-medium text-[#78716c]">Indice</span>
                  <select className="text-xs font-medium text-[#292524] bg-white border border-[#e7e5e3] rounded-lg px-2.5 py-1.5">
                    <option>IPC Annuel</option>
                    <option>IPC Mensuel</option>
                    <option>SMIC Horaire</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Card: Revenu de référence */}
          <div className={cardBlockClass}>
            <div className="flex items-center justify-between h-12 px-4 border-b border-[#e7e5e3] cursor-pointer" onClick={() => toggleCard('pgpa-revenu-ref')}>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-[#eeece6] rounded-[6px] flex items-center justify-center">
                  <Calculator className="w-3.5 h-3.5 text-[#78716c]" />
                </div>
                <span className="text-[14px] font-medium text-[#292524]">Revenu de référence</span>
              </div>
              <div className="flex items-center gap-2">
                {revenuRefMensuel > 0 ? (
                  <span style={serifAmountStyle} className="text-[#292524]">{fmt(Math.round(revenuRefMensuel))}<span className="text-[14px] text-[#78716c] ml-1">/ mois</span></span>
                ) : (
                  <span style={serifAmountStyle} className="text-[#a8a29e]">—</span>
                )}
                {isCardExpanded('pgpa-revenu-ref') ? <ChevronDown className="w-4 h-4 text-[#78716c]" /> : <ChevronRight className="w-4 h-4 text-[#78716c]" />}
              </div>
            </div>
            {isCardExpanded('pgpa-revenu-ref') && <>
            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleUploadFiles(e.dataTransfer.files, 'pgpa-revenu-ref'); }}
              className="flex items-center gap-4 p-4 border-b border-[#e7e5e3] bg-white"
            >
              <div className={`flex-1 flex items-center gap-2 px-2.5 py-1.5 h-9 border border-dashed rounded-lg transition-colors ${isDragging ? 'border-[#a8a29e] bg-[#f5f5f4]' : 'border-[#d6d3d1]'}`}>
                <Upload className="w-4 h-4 text-[#78716c] flex-shrink-0" />
                <span className="text-body text-[#78716c]">Déposez ou <span className="text-body-medium text-[#1e3a8a] cursor-pointer" onClick={() => document.getElementById('pgpa-ref-upload')?.click()}>cliquez</span> pour ajouter un justificatif</span>
                <input type="file" id="pgpa-ref-upload" multiple accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => { if (e.target.files?.length) { handleUploadFiles(e.target.files, 'pgpa-revenu-ref'); e.target.value = ''; } }} />
              </div>
              <button onClick={() => handleAddManual('pgpa-revenu-ref')} className="flex items-center gap-2 text-body-medium text-[#1e3a8a] flex-shrink-0 whitespace-nowrap">
                <Plus className="w-4 h-4" /> Ajouter une dépense
              </button>
            </div>
            {/* Column headers */}
            {allRevenuRefLignes.length > 0 && (
              <div className="flex items-center h-10 border-b border-[#e7e5e3] bg-white">
                <div className="w-12 flex-shrink-0"></div>
                <div className="w-[52px] text-center flex-shrink-0" style={colHeaderStyle}>Doc</div>
                <div className="flex-1 min-w-0 px-3" style={colHeaderStyle}>Période</div>
                <div className="w-[200px] px-3 text-right flex-shrink-0" style={colHeaderStyle}>Revenu net période</div>
                <div className="w-11 flex-shrink-0"></div>
              </div>
            )}
            {/* Data rows */}
            {allRevenuRefLignes.map(l => {
              const isSuggested = l.status === 'ai-suggested' || l.status === 'suggested';
              const pieceCount = l.pieceIds?.length || 0;
              return (
                <div key={l.id} onClick={() => { setEditingPieceIds(l.pieceIds || []); setSearchPiecesPanel(''); setEditPanel({ type: 'pgpa-revenu', title: 'Éditer le revenu', data: l }); }}
                  className="relative flex items-center h-[52px] border-b border-[#e7e5e3] last:border-b-0 bg-white group cursor-pointer hover:bg-[#fafaf9] transition-colors">
                  {isSuggested && <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: 'inset 2px 0 0 0 #9333ea' }} />}
                  <div className="w-12 flex items-center justify-center flex-shrink-0">
                    {isSuggested && <div className="w-5 h-5 rounded-full bg-[#f3e8ff] flex items-center justify-center"><Sparkles className="w-3 h-3 text-[#9333ea]" /></div>}
                    {l.status === 'validated' && <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center"><Check className="w-3 h-3 text-emerald-500" /></div>}
                  </div>
                  <div className="w-[52px] flex items-center justify-center flex-shrink-0">
                    {pieceCount > 0 ? (
                      <span className="inline-flex items-center justify-center w-7 h-7 bg-[#DFE8F5] rounded-md relative">
                        <FileText className="w-4 h-4 text-[#2563eb]" />
                        {pieceCount > 1 && <span className="absolute -top-1.5 left-[18px] min-w-[16px] h-4 bg-[#2563eb] text-white text-counter font-medium rounded-full flex items-center justify-center border-2 border-white px-0.5">{pieceCount}</span>}
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-7 h-7 bg-[#F8F7F5] text-[#d6d3d1] rounded-md border border-dashed border-[#e7e5e3]"><FileText className="w-3.5 h-3.5" /></span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 px-3">
                    <span className="text-body-medium text-[#292524] block">{l.label || l.annee || 'Sans libellé'}</span>
                  </div>
                  <div className="w-[200px] px-3 text-right flex-shrink-0">
                    <span className="text-body-medium text-[#292524] font-semibold tabular-nums">{fmt(l.revalorise || l.montant || 0)}</span>
                  </div>
                  <div className="w-11 flex items-center justify-center flex-shrink-0">
                    <button onClick={(e) => { e.stopPropagation(); }} className="p-1 text-[#78716c] hover:text-[#292524] opacity-0 group-hover:opacity-100 transition-opacity"><MoreHorizontal className="w-4 h-4" /></button>
                  </div>
                </div>
              );
            })}
          </>}
          </div>

          {/* Card: Revenus perçus */}
          <div className={cardBlockClass}>
            <div className="flex items-center justify-between h-12 px-4 border-b border-[#e7e5e3] cursor-pointer" onClick={() => toggleCard('pgpa-revenus-percus')}>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-[#eeece6] rounded-[6px] flex items-center justify-center">
                  <Receipt className="w-3.5 h-3.5 text-[#78716c]" />
                </div>
                <span className="text-[14px] font-medium text-[#292524]">Revenus perçus</span>
              </div>
              <div className="flex items-center gap-2">
                {revenusPercusTotal > 0 ? (
                  <span style={serifAmountStyle} className="text-[#292524]">{fmt(revenusPercusTotal)}</span>
                ) : (
                  <span style={serifAmountStyle} className="text-[#a8a29e]">—</span>
                )}
                {isCardExpanded('pgpa-revenus-percus') ? <ChevronDown className="w-4 h-4 text-[#78716c]" /> : <ChevronRight className="w-4 h-4 text-[#78716c]" />}
              </div>
            </div>
            {isCardExpanded('pgpa-revenus-percus') && <>
            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleUploadFiles(e.dataTransfer.files, 'pgpa-revenu-percu'); }}
              className="flex items-center gap-4 p-4 border-b border-[#e7e5e3] bg-white"
            >
              <div className={`flex-1 flex items-center gap-2 px-2.5 py-1.5 h-9 border border-dashed rounded-lg transition-colors ${isDragging ? 'border-[#a8a29e] bg-[#f5f5f4]' : 'border-[#d6d3d1]'}`}>
                <Upload className="w-4 h-4 text-[#78716c] flex-shrink-0" />
                <span className="text-body text-[#78716c]">Déposez ou <span className="text-body-medium text-[#1e3a8a] cursor-pointer" onClick={() => document.getElementById('pgpa-percu-upload')?.click()}>cliquez</span> pour ajouter un justificatif</span>
                <input type="file" id="pgpa-percu-upload" multiple accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => { if (e.target.files?.length) { handleUploadFiles(e.target.files, 'pgpa-revenu-percu'); e.target.value = ''; } }} />
              </div>
              <button onClick={() => handleAddManual('pgpa-revenu-percu')} className="flex items-center gap-2 text-body-medium text-[#1e3a8a] flex-shrink-0 whitespace-nowrap">
                <Plus className="w-4 h-4" /> Ajouter une dépense
              </button>
            </div>
            {/* Column headers */}
            {pgpaData.revenusPercus.length > 0 && (
              <div className="flex items-center h-10 border-b border-[#e7e5e3] bg-white">
                <div className="w-12 flex-shrink-0"></div>
                <div className="w-[52px] text-center flex-shrink-0" style={colHeaderStyle}>Doc</div>
                <div className="flex-1 min-w-0 px-3" style={colHeaderStyle}>Période</div>
                <div className="w-[200px] px-3 text-right flex-shrink-0" style={colHeaderStyle}>Revenu net période</div>
                <div className="w-11 flex-shrink-0"></div>
              </div>
            )}
            {/* Data rows */}
            {pgpaData.revenusPercus.map(l => {
              const pieceCount = l.pieceIds?.length || 0;
              return (
                <div key={l.id} onClick={() => { setEditingPieceIds(l.pieceIds || []); setSearchPiecesPanel(''); setEditPanel({ type: 'pgpa-revenu-percu', title: 'Éditer le revenu perçu', data: l }); }}
                  className="relative flex items-center h-[52px] border-b border-[#e7e5e3] last:border-b-0 bg-white group cursor-pointer hover:bg-[#fafaf9] transition-colors">
                  <div className="w-12 flex items-center justify-center flex-shrink-0">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center"><Check className="w-3 h-3 text-emerald-500" /></div>
                  </div>
                  <div className="w-[52px] flex items-center justify-center flex-shrink-0">
                    {pieceCount > 0 ? (
                      <span className="inline-flex items-center justify-center w-7 h-7 bg-[#DFE8F5] rounded-md relative">
                        <FileText className="w-4 h-4 text-[#2563eb]" />
                        {pieceCount > 1 && <span className="absolute -top-1.5 left-[18px] min-w-[16px] h-4 bg-[#2563eb] text-white text-counter font-medium rounded-full flex items-center justify-center border-2 border-white px-0.5">{pieceCount}</span>}
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-7 h-7 bg-[#F8F7F5] text-[#d6d3d1] rounded-md border border-dashed border-[#e7e5e3]"><FileText className="w-3.5 h-3.5" /></span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 px-3">
                    <span className="text-body-medium text-[#292524] block">{l.label || 'Sans libellé'}</span>
                    <span className="text-caption text-[#78716c]">{l.periodeDebut} → {l.periodeFin}</span>
                  </div>
                  <div className="w-[200px] px-3 text-right flex-shrink-0">
                    <span className="text-body-medium text-[#292524] font-semibold tabular-nums">{fmt(l.montant)}</span>
                  </div>
                  <div className="w-11 flex items-center justify-center flex-shrink-0">
                    <button onClick={(e) => { e.stopPropagation(); }} className="p-1 text-[#78716c] hover:text-[#292524] opacity-0 group-hover:opacity-100 transition-opacity"><MoreHorizontal className="w-4 h-4" /></button>
                  </div>
                </div>
              );
            })}
          </>}
          </div>

          {/* Card: Perte de chance */}
          <div className={cardBlockClass}>
            <div className="flex items-center justify-between h-12 px-4 border-b border-[#e7e5e3] cursor-pointer" onClick={() => toggleCard('pgpa-perte-chance')}>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-[#eeece6] rounded-[6px] flex items-center justify-center">
                  <Activity className="w-3.5 h-3.5 text-[#78716c]" />
                </div>
                <span className="text-[14px] font-medium text-[#292524]">Perte de chance</span>
              </div>
              <div className="flex items-center gap-2">
                <span style={serifAmountStyle} className="text-[#292524]">{fmt(0)}</span>
                {isCardExpanded('pgpa-perte-chance') ? <ChevronDown className="w-4 h-4 text-[#78716c]" /> : <ChevronRight className="w-4 h-4 text-[#78716c]" />}
              </div>
            </div>
            {isCardExpanded('pgpa-perte-chance') && <>
            {/* Column headers */}
            <div className="flex items-center h-10 border-b border-[#e7e5e3] bg-white">
              <div className="w-12 flex-shrink-0"></div>
              <div className="w-[52px] text-center flex-shrink-0" style={colHeaderStyle}>Doc</div>
              <div className="flex-1 min-w-0 px-3" style={colHeaderStyle}>Libellé</div>
              <div className="w-28 px-3 text-right flex-shrink-0" style={colHeaderStyle}>Montant espéré</div>
              <div className="w-24 px-3 text-center flex-shrink-0" style={colHeaderStyle}>Coefficient</div>
              <div className="w-28 px-3 text-right flex-shrink-0" style={colHeaderStyle}>Montant proraté</div>
              <div className="w-11 flex-shrink-0"></div>
            </div>
            {/* Add row */}
            <div className="flex items-center justify-center h-[45px] bg-white">
              <button className="flex items-center gap-2 text-body-medium text-[#1e3a8a]">
                <Plus className="w-4 h-4" /> Ajouter une perte de chance
              </button>
            </div>
          </>}
          </div>

          {/* Total Block */}
          <div className={totalBlockClass}>
            <button onClick={() => setTotalExpanded(prev => ({...prev, pgpa: !prev.pgpa}))} className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-[#d6d3d1] rounded-[6px] flex items-center justify-center">
                  <FileText className="w-3.5 h-3.5 text-[#78716c]" />
                </div>
                <span className="text-[14px] font-medium text-[#292524]">Total perte PGPA</span>
              </div>
              <div className="flex items-center gap-3">
                <span style={serifAmountStyle} className="text-[#292524]">{fmt(indemniteVictimePGPA)}</span>
                <ChevronRight className={`w-4 h-4 text-[#78716c] transition-transform ${totalExpanded.pgpa ? 'rotate-90' : ''}`} />
              </div>
            </button>
            {totalExpanded.pgpa && (
              <>
                <div className="border-t border-[#d6d3d1] mt-3 mb-3" />
                <div className="space-y-2">
                  <div className="flex justify-between"><span className="text-[14px] text-[#78716c]">Revenus attendus sur la période ({pgpaData.periode.mois} mois)</span><span className="text-[14px] text-[#292524]">{fmt(Math.round(revenuRefMensuel * pgpaData.periode.mois))}</span></div>
                  <div className="flex justify-between"><span className="text-[14px] text-[#78716c]">Revenus perçus sur la période</span><span className="text-[14px] text-[#292524]">− {fmt(revenusPercusTotal)}</span></div>
                  <div className="flex justify-between"><span className="text-[14px] text-[#78716c]">Indemnités journalières</span><span className="text-[14px] text-[#292524]">− {fmt(ijPercuesTotal)}</span></div>
                </div>
              </>
            )}
          </div>

              </div>
            </div>
          </div>

          {/* NOTES / ARGUMENTAIRE Section */}
          <div className="p-4 border-b border-[#e7e5e3]" style={{ backgroundColor: '#F8F7F5' }}>
            <div style={sectionHeaderStyle} className="mb-[17px]">NOTES / ARGUMENTAIRE</div>
            <div className="bg-white border border-[#e7e5e3] rounded-[4px] overflow-hidden">
              <div className="flex items-center gap-1 px-3 py-2 border-b border-[#e7e5e3]">
                <button className="px-2 py-1 rounded hover:bg-[#f5f5f4] text-[#78716c] font-bold text-sm">B</button>
                <button className="px-2 py-1 rounded hover:bg-[#f5f5f4] text-[#78716c] italic text-sm">I</button>
                <button className="px-2 py-1 rounded hover:bg-[#f5f5f4] text-[#78716c] underline text-sm">U</button>
              </div>
              <textarea
                value={posteNotes.pgpa || ''}
                onChange={(e) => setPosteNotes(prev => ({...prev, pgpa: e.target.value}))}
                className="w-full p-4 text-[14px] text-[#292524] leading-[27px] resize-none min-h-[120px] focus:outline-none"
                placeholder="Ajoutez vos notes et arguments..."
              />
            </div>
          </div>

          {/* JURISPRUDENCES Section */}
          <div className="p-4" style={{ backgroundColor: '#F8F7F5' }}>
            <div style={sectionHeaderStyle} className="mb-[17px]">JURISPRUDENCES</div>
            <div className="bg-white border border-[#e7e5e3] rounded-[4px] h-[58px] flex items-center justify-center">
              <span className="text-[14px] text-[#a8a29e]">Aucune jurisprudence ajoutée</span>
            </div>
          </div>
        </div>
      );
    }

    // ========== PGPF ==========
    if (currentLevel.id === 'pgpf') {
      // Empty state
      if (!pgpfData.periodes['pgpf-cl'] && !pgpfData.periodes['pgpf-al'] && !chatAnalyzedPostes.current.has('pgpf')) {
        return renderInlineDocPicker('pgpf', {
          icon: Calculator,
          title: 'Aucune donnée PGPF',
          description: 'Ajoutez les justificatifs de revenus pour calculer les pertes de gains futurs.',
          expectedDocs: ['Bulletins de salaire', "Avis d'imposition", "Rapport d'expertise"]
        });
      }
      const periodeCL = pgpfData.periodes['pgpf-cl'];
      const periodeAL = pgpfData.periodes['pgpf-al'];
      const tiersTotal = periodeAL ? periodeAL.tiersPayeurs.reduce((s, t) => s + t.montantCapitalise, 0) : 0;

      return (
        <div>
          {/* CALCUL Section */}
          <div className="border-b border-[#e7e5e3]" style={{ backgroundColor: '#F8F7F5' }}>
            <div className="p-4">
              <div className="space-y-4">

          {/* Param chips card block */}
          <div className={cardBlockClass}>
            <div className="flex items-center gap-3 px-4 h-[52px]">
              <div className="w-6 h-6 bg-[#eeece6] rounded-[6px] flex items-center justify-center flex-shrink-0">
                <Settings className="w-3.5 h-3.5 text-[#78716c]" />
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border bg-transparent border-[#d6d3d1] text-[#78716c]">
                Capitaliser
              </span>
            </div>
          </div>

          {/* Section Label: PRÉ-LIQUIDATION */}
          {periodeCL && (
            <>
            <div style={sectionHeaderStyle} className="mt-2">NOM DE PÉRIODE</div>

            {/* Card: Revenu de référence — synced from PGPA */}
            <div className={cardBlockClass}>
              <div className="flex items-center justify-between h-12 px-4">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-[#eeece6] rounded-[6px] flex items-center justify-center">
                    <Calculator className="w-3.5 h-3.5 text-[#78716c]" />
                  </div>
                  <span className="text-[14px] font-medium text-[#292524]">Revenu de référence</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-[#eef3fa] text-[#1e3a8a] border border-[#aabcd5]">⊕ Sync. PGPA</span>
                </div>
                <div className="flex items-center gap-2">
                  <span style={serifAmountStyle} className="text-[#292524]">{fmt(Math.round(periodeCL.revenuRef.total / 12))}<span className="text-[14px] text-[#78716c] ml-1">/ mois</span></span>
                </div>
              </div>
            </div>

            {/* Card: Revenus perçus */}
            <div className={cardBlockClass}>
              <div className="flex items-center justify-between h-12 px-4 border-b border-[#e7e5e3] cursor-pointer" onClick={() => toggleCard('pgpf-revenus-percus')}>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-[#eeece6] rounded-[6px] flex items-center justify-center">
                    <Receipt className="w-3.5 h-3.5 text-[#78716c]" />
                  </div>
                  <span className="text-[14px] font-medium text-[#292524]">Revenus perçus</span>
                </div>
                <div className="flex items-center gap-2">
                  <span style={serifAmountStyle} className="text-[#292524]">{fmt(periodeCL.revenusPercus.reduce((s, l) => s + l.montant, 0))}</span>
                  {isCardExpanded('pgpf-revenus-percus') ? <ChevronDown className="w-4 h-4 text-[#78716c]" /> : <ChevronRight className="w-4 h-4 text-[#78716c]" />}
                </div>
              </div>
              {isCardExpanded('pgpf-revenus-percus') && <>
              {/* Drop zone */}
              <div className="flex items-center gap-4 p-4 border-b border-[#e7e5e3] bg-white">
                <div className="flex-1 flex items-center gap-2 px-2.5 py-1.5 h-9 border border-dashed rounded-lg border-[#d6d3d1]">
                  <Upload className="w-4 h-4 text-[#78716c] flex-shrink-0" />
                  <span className="text-body text-[#78716c]">Déposez ou <span className="text-body-medium text-[#1e3a8a] cursor-pointer">cliquez</span> pour ajouter un justificatif</span>
                </div>
                <button className="flex items-center gap-2 text-body-medium text-[#1e3a8a] flex-shrink-0 whitespace-nowrap">
                  <Plus className="w-4 h-4" /> Ajouter une dépense
                </button>
              </div>
              {/* Column headers */}
              {periodeCL.revenusPercus.length > 0 && (
                <div className="flex items-center h-10 border-b border-[#e7e5e3] bg-white">
                  <div className="w-12 flex-shrink-0"></div>
                  <div className="w-[52px] text-center flex-shrink-0" style={colHeaderStyle}>Doc</div>
                  <div className="flex-1 min-w-0 px-3" style={colHeaderStyle}>Période</div>
                  <div className="w-[200px] px-3 text-right flex-shrink-0" style={colHeaderStyle}>Revenu net période</div>
                  <div className="w-11 flex-shrink-0"></div>
                </div>
              )}
              {/* Data rows */}
              {periodeCL.revenusPercus.map(l => {
                const pieceCount = l.pieceIds?.length || 0;
                return (
                  <div key={l.id} className="relative flex items-center h-[52px] border-b border-[#e7e5e3] last:border-b-0 bg-white group cursor-pointer hover:bg-[#fafaf9] transition-colors">
                    <div className="w-12 flex items-center justify-center flex-shrink-0">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center"><Check className="w-3 h-3 text-emerald-500" /></div>
                    </div>
                    <div className="w-[52px] flex items-center justify-center flex-shrink-0">
                      {pieceCount > 0 ? (
                        <span className="inline-flex items-center justify-center w-7 h-7 bg-[#DFE8F5] rounded-md relative">
                          <FileText className="w-4 h-4 text-[#2563eb]" />
                          {pieceCount > 1 && <span className="absolute -top-1.5 left-[18px] min-w-[16px] h-4 bg-[#2563eb] text-white text-counter font-medium rounded-full flex items-center justify-center border-2 border-white px-0.5">{pieceCount}</span>}
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-7 h-7 bg-[#F8F7F5] text-[#d6d3d1] rounded-md border border-dashed border-[#e7e5e3]"><FileText className="w-3.5 h-3.5" /></span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 px-3">
                      <span className="text-body-medium text-[#292524] block">{l.label || 'Sans libellé'}</span>
                      <span className="text-caption text-[#78716c]">{l.periode}</span>
                    </div>
                    <div className="w-[200px] px-3 text-right flex-shrink-0">
                      <span className="text-body-medium text-[#292524] font-semibold tabular-nums">{fmt(l.montant)}</span>
                    </div>
                    <div className="w-11 flex items-center justify-center flex-shrink-0">
                      <button onClick={(e) => { e.stopPropagation(); }} className="p-1 text-[#78716c] hover:text-[#292524] opacity-0 group-hover:opacity-100 transition-opacity"><MoreHorizontal className="w-4 h-4" /></button>
                    </div>
                  </div>
                );
              })}
            </>}
            </div>

            {/* Card: Perte de chance */}
            <div className={cardBlockClass}>
              <div className="flex items-center justify-between h-12 px-4 border-b border-[#e7e5e3] cursor-pointer" onClick={() => toggleCard('pgpf-perte-chance')}>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-[#eeece6] rounded-[6px] flex items-center justify-center">
                    <Activity className="w-3.5 h-3.5 text-[#78716c]" />
                  </div>
                  <span className="text-[14px] font-medium text-[#292524]">Perte de chance</span>
                </div>
                <div className="flex items-center gap-2">
                  <span style={serifAmountStyle} className="text-[#292524]">{fmt(0)}</span>
                  {isCardExpanded('pgpf-perte-chance') ? <ChevronDown className="w-4 h-4 text-[#78716c]" /> : <ChevronRight className="w-4 h-4 text-[#78716c]" />}
                </div>
              </div>
              {isCardExpanded('pgpf-perte-chance') && <>
              <div className="flex items-center h-10 border-b border-[#e7e5e3] bg-white">
                <div className="w-12 flex-shrink-0"></div>
                <div className="w-[52px] text-center flex-shrink-0" style={colHeaderStyle}>Doc</div>
                <div className="flex-1 min-w-0 px-3" style={colHeaderStyle}>Libellé</div>
                <div className="w-28 px-3 text-right flex-shrink-0" style={colHeaderStyle}>Montant espéré</div>
                <div className="w-24 px-3 text-center flex-shrink-0" style={colHeaderStyle}>Coefficient</div>
                <div className="w-28 px-3 text-right flex-shrink-0" style={colHeaderStyle}>Montant proraté</div>
                <div className="w-11 flex-shrink-0"></div>
              </div>
              <div className="flex items-center justify-center h-[45px] bg-white">
                <button className="flex items-center gap-2 text-body-medium text-[#1e3a8a]">
                  <Plus className="w-4 h-4" /> Ajouter une perte de chance
                </button>
              </div>
              </>}
            </div>

            {/* Total Block: PGPF échu */}
            <div className={totalBlockClass}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-[#d6d3d1] rounded-[6px] flex items-center justify-center">
                    <FileText className="w-3.5 h-3.5 text-[#78716c]" />
                  </div>
                  <span className="text-[14px] font-medium text-[#292524]">PGPF échu</span>
                </div>
                <div className="flex items-center gap-2">
                  <span style={serifAmountStyle} className="text-[#292524]">{fmt(pgpfClTotal)}</span>
                  <ChevronRight className="w-4 h-4 text-[#78716c]" />
                </div>
              </div>
            </div>
            </>
          )}

          {/* Section Label: POST-LIQUIDATION */}
          {periodeAL && (
            <>
            <div style={sectionHeaderStyle} className="mt-2">NOM DE PÉRIODE</div>

            {/* Card: Arrérage à échoir */}
            <div className={cardBlockClass}>
              <div className="flex items-center justify-between h-12 px-4">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-[#eeece6] rounded-[6px] flex items-center justify-center">
                    <Landmark className="w-3.5 h-3.5 text-[#78716c]" />
                  </div>
                  <span className="text-[14px] font-medium text-[#292524]">Arrérage à échoir</span>
                </div>
                <div className="flex items-center gap-2">
                  <span style={serifAmountStyle} className="text-[#292524]">{fmt(periodeAL.params.perteGainAnnuelle)}<span className="text-[14px] text-[#78716c] ml-1">/ an</span></span>
                  <ChevronDown className="w-4 h-4 text-[#78716c]" />
                </div>
              </div>
            </div>

            {/* Total Block: PGPF à échoir */}
            <div className={totalBlockClass}>
              <button onClick={() => setTotalExpanded(prev => ({...prev, pgpfAl: !prev.pgpfAl}))} className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-[#d6d3d1] rounded-[6px] flex items-center justify-center">
                    <FileText className="w-3.5 h-3.5 text-[#78716c]" />
                  </div>
                  <span className="text-[14px] font-medium text-[#292524]">PGPF à échoir</span>
                </div>
                <div className="flex items-center gap-3">
                  <span style={serifAmountStyle} className="text-[#292524]">{fmt(periodeAL.params.perteGainAnnuelle)}<span className="text-[14px] text-[#78716c] ml-1">/ an</span></span>
                  <ChevronRight className={`w-4 h-4 text-[#78716c] transition-transform ${totalExpanded.pgpfAl ? 'rotate-90' : ''}`} />
                </div>
              </button>
              {totalExpanded.pgpfAl && (
                <>
                  <div className="border-t border-[#d6d3d1] mt-3 mb-3" />
                  <div className="space-y-2">
                    <div className="flex justify-between"><span className="text-[14px] text-[#78716c]">Versement</span><span className="text-[14px] text-[#292524]">En rente, sans capitalisation</span></div>
                  </div>
                </>
              )}
            </div>
            </>
          )}

              </div>
            </div>
          </div>

          {/* NOTES / ARGUMENTAIRE Section */}
          <div className="p-4 border-b border-[#e7e5e3]" style={{ backgroundColor: '#F8F7F5' }}>
            <div style={sectionHeaderStyle} className="mb-[17px]">NOTES / ARGUMENTAIRE</div>
            <div className="bg-white border border-[#e7e5e3] rounded-[4px] overflow-hidden">
              <div className="flex items-center gap-1 px-3 py-2 border-b border-[#e7e5e3]">
                <button className="px-2 py-1 rounded hover:bg-[#f5f5f4] text-[#78716c] font-bold text-sm">B</button>
                <button className="px-2 py-1 rounded hover:bg-[#f5f5f4] text-[#78716c] italic text-sm">I</button>
                <button className="px-2 py-1 rounded hover:bg-[#f5f5f4] text-[#78716c] underline text-sm">U</button>
              </div>
              <textarea
                value={posteNotes.pgpf || ''}
                onChange={(e) => setPosteNotes(prev => ({...prev, pgpf: e.target.value}))}
                className="w-full p-4 text-[14px] text-[#292524] leading-[27px] resize-none min-h-[120px] focus:outline-none"
                placeholder="Ajoutez vos notes et arguments..."
              />
            </div>
          </div>

          {/* JURISPRUDENCES Section */}
          <div className="p-4" style={{ backgroundColor: '#F8F7F5' }}>
            <div style={sectionHeaderStyle} className="mb-[17px]">JURISPRUDENCES</div>
            <div className="bg-white border border-[#e7e5e3] rounded-[4px] h-[58px] flex items-center justify-center">
              <span className="text-[14px] text-[#a8a29e]">Aucune jurisprudence ajoutée</span>
            </div>
          </div>
        </div>
      );
    }

    // ========== DFT ==========
    if (currentLevel.id === 'dft') {
      return (
        <div className={dftLignes.length === 0 && processing.length === 0 && !(posteExtracting && posteExtracting.posteType === 'dft') && !chatAnalyzedPostes.current.has('dft') ? 'h-full flex flex-col' : ''}>
          {/* CALCUL Section */}
          <div className="border-b border-[#e7e5e3]" style={{ backgroundColor: '#F8F7F5' }}>
            <div className="p-4">
              <div className="space-y-4">

          {/* Param chips card block */}
          <div className={cardBlockClass}>
            <div className="flex items-center gap-3 px-4 h-[52px]">
              <div className="w-6 h-6 bg-[#eeece6] rounded-[6px] flex items-center justify-center flex-shrink-0">
                <Settings className="w-3.5 h-3.5 text-[#78716c]" />
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border bg-transparent border-[#d6d3d1] text-[#78716c]">
                Base {chiffrageParams.baseJournaliereDFT} €/j
              </span>
            </div>
          </div>

          {/* Empty state */}
          {dftLignes.length === 0 && processing.length === 0 && !(posteExtracting && posteExtracting.posteType === 'dft') && !chatAnalyzedPostes.current.has('dft') && renderInlineDocPicker('dft', {
            icon: Calendar,
            title: 'Ajoutez vos justificatifs pour créer vos lignes de périodes',
            description: 'Déposez un ou plusieurs documents. Plato lit, extrait et structure les informations pour chaque ligne.',
            expectedDocs: ["Rapport d'expertise médicale", "Certificat médical", "Compte-rendu hospitalisation"]
          })}

          {/* Card Block: DFT */}
          {(dftLignes.length > 0 || processing.length > 0 || (posteExtracting && posteExtracting.posteType === 'dft') || chatAnalyzedPostes.current.has('dft')) && (
            <div className={cardBlockClass}>
              {/* Title Row */}
              <div className="flex items-center justify-between h-12 px-4 border-b border-[#e7e5e3]">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-[#eeece6] rounded-[6px] flex items-center justify-center">
                    <Calendar className="w-3.5 h-3.5 text-[#78716c]" />
                  </div>
                  <span className="text-[14px] font-medium text-[#292524]">Déficit fonctionnel temporaire</span>
                </div>
                <div className="flex items-center gap-2">
                  <span style={serifAmountStyle} className="text-[#292524]">{fmt(dftTotal)}</span>
                  <ChevronDown className="w-4 h-4 text-[#78716c]" />
                </div>
              </div>
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
                  <div className="w-[52px] text-center flex-shrink-0" style={colHeaderStyle}>Doc</div>
                  <div className="flex-1 min-w-0 px-3" style={colHeaderStyle}>Période & jours</div>
                  <div className="w-20 px-3 text-center flex-shrink-0" style={colHeaderStyle}>Taux</div>
                  <div className="w-[200px] px-3 text-right flex-shrink-0" style={colHeaderStyle}>Montant</div>
                  <div className="w-11 flex-shrink-0"></div>
                </div>
              )}

              {/* Rows */}
              {dftLignes.map(l => {
                const isSuggested = l.status === 'ai-suggested' || l.status === 'suggested';
                const isIncomplete = !l.montant || !l.label;
                const pieceCount = l.pieceIds?.length || 0;

                return (
                  <div key={l.id} onClick={() => { setEditingPieceIds(l.pieceIds || []); setSearchPiecesPanel(''); setEditPanel({ type: 'dft-ligne', title: 'Éditer la dépense', data: l }); }}
                    className="relative flex items-center h-[52px] border-b border-[#e7e5e3] last:border-b-0 bg-white group cursor-pointer hover:bg-[#fafaf9] transition-colors">
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
                          <span className="inline-flex items-center justify-center w-7 h-7 bg-[#DFE8F5] rounded-md relative">
                            <FileText className="w-4 h-4 text-[#2563eb]" />
                            <span className="absolute -top-1.5 left-[18px] min-w-[16px] h-4 bg-[#2563eb] text-white text-counter font-medium rounded-full flex items-center justify-center border-2 border-white px-0.5">{pieceCount}</span>
                          </span>
                          <div className="absolute left-0 top-full mt-1 w-56 p-2 bg-white border border-[#e7e5e3] rounded-lg shadow-lg opacity-0 invisible group-hover/piece:opacity-100 group-hover/piece:visible transition-all z-50">
                            <div className="text-counter text-[#78716c] uppercase tracking-wide mb-1.5">{pieceCount} document{pieceCount > 1 ? 's' : ''}</div>
                            <div className="space-y-1">
                              {l.pieceIds?.map(pid => <div key={pid} className="flex items-center gap-2 text-caption"><span className="w-5 h-5 bg-blue-100 text-[#1e3a8a] text-counter rounded flex items-center justify-center flex-shrink-0">{getPieceLabel(pid)}</span><span className="truncate text-[#292524]">Rapport d'expertise</span></div>)}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="inline-flex items-center justify-center w-7 h-7 bg-[#F8F7F5] text-[#d6d3d1] rounded-md border border-dashed border-[#e7e5e3]">
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
                      <span className={`text-caption-medium px-2 py-0.5 rounded-full ${l.taux === 100 ? 'bg-[#eeece6] text-[#44403c]' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>{l.taux || 100}%</span>
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

          {/* Total Block */}
          {dftLignes.length > 0 && (
          <div className={totalBlockClass}>
            <button onClick={() => setTotalExpanded(prev => ({...prev, dft: !prev.dft}))} className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-[#d6d3d1] rounded-[6px] flex items-center justify-center">
                  <FileText className="w-3.5 h-3.5 text-[#78716c]" />
                </div>
                <span className="text-[14px] font-medium text-[#292524]">Total DFT</span>
              </div>
              <div className="flex items-center gap-3">
                <span style={serifAmountStyle} className="text-[#292524]">{fmt(dftTotal)}</span>
                <ChevronRight className={`w-4 h-4 text-[#78716c] transition-transform ${totalExpanded.dft ? 'rotate-90' : ''}`} />
              </div>
            </button>
            {totalExpanded.dft && (
              <>
                <div className="border-t border-[#d6d3d1] mt-3 mb-3" />
                <div className="space-y-2">
                  <div className="flex justify-between"><span className="text-[14px] text-[#78716c]">Nombre de périodes</span><span className="text-[14px] text-[#292524]">{dftLignes.length}</span></div>
                  <div className="flex justify-between"><span className="text-[14px] text-[#78716c]">Total jours</span><span className="text-[14px] text-[#292524]">{dftLignes.reduce((s, l) => s + (l.jours || 0), 0)}j</span></div>
                  <div className="flex justify-between"><span className="text-[14px] text-[#78716c]">Base journalière</span><span className="text-[14px] text-[#292524]">{chiffrageParams.baseJournaliereDFT} €/j</span></div>
                </div>
              </>
            )}
          </div>
          )}

              </div>{/* end space-y-4 */}
            </div>{/* end p-4 */}
          </div>{/* end CALCUL section */}

          {/* NOTES / ARGUMENTAIRE Section */}
          <div className="p-4 border-b border-[#e7e5e3]" style={{ backgroundColor: '#F8F7F5' }}>
            <div style={sectionHeaderStyle} className="mb-[17px]">NOTES / ARGUMENTAIRE</div>
            <div className="bg-white border border-[#e7e5e3] rounded-[4px] overflow-hidden">
              <div className="flex items-center gap-1 px-3 py-2 border-b border-[#e7e5e3]">
                <button className="px-2 py-1 rounded hover:bg-[#f5f5f4] text-[#78716c] font-bold text-sm">B</button>
                <button className="px-2 py-1 rounded hover:bg-[#f5f5f4] text-[#78716c] italic text-sm">I</button>
                <button className="px-2 py-1 rounded hover:bg-[#f5f5f4] text-[#78716c] underline text-sm">U</button>
              </div>
              <textarea
                value={posteNotes.dft || ''}
                onChange={(e) => setPosteNotes(prev => ({...prev, dft: e.target.value}))}
                className="w-full p-4 text-[14px] text-[#292524] leading-[27px] resize-none min-h-[120px] focus:outline-none"
                placeholder="Ajoutez vos notes et arguments..."
              />
            </div>
          </div>

          {/* JURISPRUDENCES Section */}
          <div className="p-4" style={{ backgroundColor: '#F8F7F5' }}>
            <div style={sectionHeaderStyle} className="mb-[17px]">JURISPRUDENCES</div>
            <div className="bg-white border border-[#e7e5e3] rounded-[4px] h-[58px] flex items-center justify-center">
              <span className="text-[14px] text-[#a8a29e]">Aucune jurisprudence ajoutée</span>
            </div>
          </div>

        </div>
      );
    }


    // ========== SE — Souffrances Endurées ==========
    if (currentLevel.id === 'se') {
      const seData = formPosteData.se || { referentiel: 'cours-appel-2024', cotation: 0, montant: 0 };
      const cotations = [1, 2, 3, 4, 5, 6, 7];
      return (
        <div>
          {/* CALCUL Section */}
          <div className="border-b border-[#e7e5e3]" style={{ backgroundColor: '#F8F7F5' }}>
            <div className="p-4">
              <div className="space-y-4">
                {/* Param chips card block */}
                <div className={cardBlockClass}>
                  <div className="flex items-center gap-3 px-4 h-[52px]">
                    <div className="w-6 h-6 bg-[#eeece6] rounded-[6px] flex items-center justify-center flex-shrink-0">
                      <Settings className="w-3.5 h-3.5 text-[#78716c]" />
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border bg-transparent border-[#d6d3d1] text-[#78716c]">
                      Revaloriser
                    </span>
                  </div>
                </div>
                {/* Form Block */}
                <div className={cardBlockClass}>
                  <div className="p-5">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[14px] font-medium text-[#78716c] mb-2">Référentiel</label>
                        <select
                          value={seData.referentiel}
                          onChange={(e) => setFormPosteData(prev => ({ ...prev, se: { ...prev.se, referentiel: e.target.value } }))}
                          className="w-full h-10 px-3 text-[14px] text-[#292524] bg-white border border-[#e7e5e3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#292524]"
                        >
                          <option value="cours-appel-2024">Cour d'appel 2024</option>
                          <option value="cours-appel-2023">Cour d'appel 2023</option>
                          <option value="mornet-2024">Référentiel Mornet 2024</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[14px] font-medium text-[#78716c] mb-2">Cotation</label>
                        <div className="flex gap-1">
                          {cotations.map(c => (
                            <button
                              key={c}
                              onClick={() => setFormPosteData(prev => ({ ...prev, se: { ...prev.se, cotation: c } }))}
                              className={`flex-1 h-10 text-[14px] font-medium rounded-lg border transition-colors ${
                                seData.cotation === c
                                  ? 'bg-[#292524] text-white border-[#292524]'
                                  : 'bg-white text-[#292524] border-[#e7e5e3] hover:bg-[#fafaf9]'
                              }`}
                            >
                              {c}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pièces justificatives */}
                <div style={sectionHeaderStyle} className="mt-2">PIÈCES JUSTIFICATIVES</div>
                <div className={cardBlockClass}>
                  <div
                    className="flex items-center justify-center h-[72px] border border-dashed border-[#d6d3d1] m-4 rounded-lg cursor-pointer hover:border-[#a8a29e] transition-colors"
                    onClick={() => document.getElementById('se-upload')?.click()}
                  >
                    <span className="text-[14px] text-[#78716c]">Déposez ou <span className="text-[#1e3a8a] font-medium">cliquez</span> pour ajouter un justificatif</span>
                    <input type="file" id="se-upload" multiple accept=".pdf,.jpg,.jpeg,.png" className="hidden" />
                  </div>
                </div>

                {/* Total Block */}
                <div className={totalBlockClass}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-[#d6d3d1] rounded-[6px] flex items-center justify-center">
                        <FileText className="w-3.5 h-3.5 text-[#78716c]" />
                      </div>
                      <span className="text-[14px] font-medium text-[#292524]">Total SE</span>
                    </div>
                    <span style={serifAmountStyle} className="text-[#292524]">{fmt(seData.montant)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* NOTES / ARGUMENTAIRE Section */}
          <div className="p-4 border-b border-[#e7e5e3]" style={{ backgroundColor: '#F8F7F5' }}>
            <div style={sectionHeaderStyle} className="mb-[17px]">NOTES / ARGUMENTAIRE</div>
            <div className="bg-white border border-[#e7e5e3] rounded-[4px] overflow-hidden">
              <div className="flex items-center gap-1 px-3 py-2 border-b border-[#e7e5e3]">
                <button className="px-2 py-1 rounded hover:bg-[#f5f5f4] text-[#78716c] font-bold text-sm">B</button>
                <button className="px-2 py-1 rounded hover:bg-[#f5f5f4] text-[#78716c] italic text-sm">I</button>
                <button className="px-2 py-1 rounded hover:bg-[#f5f5f4] text-[#78716c] underline text-sm">U</button>
              </div>
              <textarea
                value={posteNotes.se || ''}
                onChange={(e) => setPosteNotes(prev => ({...prev, se: e.target.value}))}
                className="w-full p-4 text-[14px] text-[#292524] leading-[27px] resize-none min-h-[120px] focus:outline-none"
                placeholder="Ajoutez vos notes et arguments..."
              />
            </div>
          </div>

          {/* JURISPRUDENCES Section */}
          <div className="p-4" style={{ backgroundColor: '#F8F7F5' }}>
            <div style={sectionHeaderStyle} className="mb-[17px]">JURISPRUDENCES</div>
            <div className="bg-white border border-[#e7e5e3] rounded-[4px] h-[58px] flex items-center justify-center">
              <span className="text-[14px] text-[#a8a29e]">Aucune jurisprudence ajoutée</span>
            </div>
          </div>
        </div>
      );
    }

    // ========== PEP — Préjudice Esthétique Permanent ==========
    if (currentLevel.id === 'pep') {
      const pepData = formPosteData.pep || { referentiel: 'cours-appel-2024', cotation: 0, montant: 0 };
      const cotations = [1, 2, 3, 4, 5, 6, 7];
      return (
        <div>
          {/* CALCUL Section */}
          <div className="border-b border-[#e7e5e3]" style={{ backgroundColor: '#F8F7F5' }}>
            <div className="p-4">
              <div className="space-y-4">
                {/* Param chips card block */}
                <div className={cardBlockClass}>
                  <div className="flex items-center gap-3 px-4 h-[52px]">
                    <div className="w-6 h-6 bg-[#eeece6] rounded-[6px] flex items-center justify-center flex-shrink-0">
                      <Settings className="w-3.5 h-3.5 text-[#78716c]" />
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border bg-transparent border-[#d6d3d1] text-[#78716c]">
                      Revaloriser
                    </span>
                  </div>
                </div>
                {/* Form Block */}
                <div className={cardBlockClass}>
                  <div className="p-5">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[14px] font-medium text-[#78716c] mb-2">Référentiel</label>
                        <select
                          value={pepData.referentiel}
                          onChange={(e) => setFormPosteData(prev => ({ ...prev, pep: { ...prev.pep, referentiel: e.target.value } }))}
                          className="w-full h-10 px-3 text-[14px] text-[#292524] bg-white border border-[#e7e5e3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#292524]"
                        >
                          <option value="cours-appel-2024">Cour d'appel 2024</option>
                          <option value="cours-appel-2023">Cour d'appel 2023</option>
                          <option value="mornet-2024">Référentiel Mornet 2024</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[14px] font-medium text-[#78716c] mb-2">Cotation</label>
                        <div className="flex gap-1">
                          {cotations.map(c => (
                            <button
                              key={c}
                              onClick={() => setFormPosteData(prev => ({ ...prev, pep: { ...prev.pep, cotation: c } }))}
                              className={`flex-1 h-10 text-[14px] font-medium rounded-lg border transition-colors ${
                                pepData.cotation === c
                                  ? 'bg-[#292524] text-white border-[#292524]'
                                  : 'bg-white text-[#292524] border-[#e7e5e3] hover:bg-[#fafaf9]'
                              }`}
                            >
                              {c}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pièces justificatives */}
                <div style={sectionHeaderStyle} className="mt-2">PIÈCES JUSTIFICATIVES</div>
                <div className={cardBlockClass}>
                  <div
                    className="flex items-center justify-center h-[72px] border border-dashed border-[#d6d3d1] m-4 rounded-lg cursor-pointer hover:border-[#a8a29e] transition-colors"
                    onClick={() => document.getElementById('pep-upload')?.click()}
                  >
                    <span className="text-[14px] text-[#78716c]">Déposez ou <span className="text-[#1e3a8a] font-medium">cliquez</span> pour ajouter un justificatif</span>
                    <input type="file" id="pep-upload" multiple accept=".pdf,.jpg,.jpeg,.png" className="hidden" />
                  </div>
                </div>

                {/* Total Block */}
                <div className={totalBlockClass}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-[#d6d3d1] rounded-[6px] flex items-center justify-center">
                        <FileText className="w-3.5 h-3.5 text-[#78716c]" />
                      </div>
                      <span className="text-[14px] font-medium text-[#292524]">Total PEP</span>
                    </div>
                    <span style={serifAmountStyle} className="text-[#292524]">{fmt(pepData.montant)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* NOTES / ARGUMENTAIRE Section */}
          <div className="p-4 border-b border-[#e7e5e3]" style={{ backgroundColor: '#F8F7F5' }}>
            <div style={sectionHeaderStyle} className="mb-[17px]">NOTES / ARGUMENTAIRE</div>
            <div className="bg-white border border-[#e7e5e3] rounded-[4px] overflow-hidden">
              <div className="flex items-center gap-1 px-3 py-2 border-b border-[#e7e5e3]">
                <button className="px-2 py-1 rounded hover:bg-[#f5f5f4] text-[#78716c] font-bold text-sm">B</button>
                <button className="px-2 py-1 rounded hover:bg-[#f5f5f4] text-[#78716c] italic text-sm">I</button>
                <button className="px-2 py-1 rounded hover:bg-[#f5f5f4] text-[#78716c] underline text-sm">U</button>
              </div>
              <textarea
                value={posteNotes.pep || ''}
                onChange={(e) => setPosteNotes(prev => ({...prev, pep: e.target.value}))}
                className="w-full p-4 text-[14px] text-[#292524] leading-[27px] resize-none min-h-[120px] focus:outline-none"
                placeholder="Ajoutez vos notes et arguments..."
              />
            </div>
          </div>

          {/* JURISPRUDENCES Section */}
          <div className="p-4" style={{ backgroundColor: '#F8F7F5' }}>
            <div style={sectionHeaderStyle} className="mb-[17px]">JURISPRUDENCES</div>
            <div className="bg-white border border-[#e7e5e3] rounded-[4px] h-[58px] flex items-center justify-center">
              <span className="text-[14px] text-[#a8a29e]">Aucune jurisprudence ajoutée</span>
            </div>
          </div>
        </div>
      );
    }

    // ========== DFP — Déficit Fonctionnel Permanent ==========
    if (currentLevel.id === 'dfp') {
      const dfpData = formPosteData.dfp || { referentiel: 'cours-appel-2024', age: 0, taux: 0, trancheAge: 'inferieure', trancheTaux: 'inferieure', pointBase: 0, montant: 0 };
      return (
        <div>
          {/* CALCUL Section */}
          <div className="border-b border-[#e7e5e3]" style={{ backgroundColor: '#F8F7F5' }}>
            <div className="p-4">
              <div className="space-y-4">
                {/* Param chips card block */}
                <div className={cardBlockClass}>
                  <div className="flex items-center gap-3 px-4 h-[52px]">
                    <div className="w-6 h-6 bg-[#eeece6] rounded-[6px] flex items-center justify-center flex-shrink-0">
                      <Settings className="w-3.5 h-3.5 text-[#78716c]" />
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border bg-transparent border-[#d6d3d1] text-[#78716c]">
                      Revaloriser
                    </span>
                  </div>
                </div>
                {/* Form Block */}
                <div className={cardBlockClass}>
                  <div className="p-5 space-y-5">
                    {/* Référentiel */}
                    <div>
                      <label className="block text-[14px] font-medium text-[#78716c] mb-2">Référentiel</label>
                      <select
                        value={dfpData.referentiel}
                        onChange={(e) => setFormPosteData(prev => ({ ...prev, dfp: { ...prev.dfp, referentiel: e.target.value } }))}
                        className="w-full h-10 px-3 text-[14px] text-[#292524] bg-white border border-[#e7e5e3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#292524]"
                      >
                        <option value="cours-appel-2024">Cour d'appel 2024</option>
                        <option value="cours-appel-2023">Cour d'appel 2023</option>
                        <option value="mornet-2024">Référentiel Mornet 2024</option>
                      </select>
                    </div>
                    {/* Âge + Taux — 2 columns */}
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[14px] font-medium text-[#78716c] mb-2">Âge à la consolidation</label>
                        <input
                          type="number"
                          value={dfpData.age}
                          onChange={(e) => setFormPosteData(prev => ({ ...prev, dfp: { ...prev.dfp, age: parseInt(e.target.value) || 0 } }))}
                          className="w-full h-10 px-3 text-[14px] text-[#292524] bg-white border border-[#e7e5e3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#292524]"
                          placeholder="Âge"
                        />
                        <div className="mt-2 space-y-1.5">
                          {['inferieure', 'superieure'].map(t => (
                            <label key={t} className="flex items-center gap-2 cursor-pointer">
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${dfpData.trancheAge === t ? 'border-[#292524]' : 'border-[#d6d3d1]'}`}>
                                {dfpData.trancheAge === t && <div className="w-2 h-2 rounded-full bg-[#292524]" />}
                              </div>
                              <span className="text-xs text-[#292524]">Tranche {t === 'inferieure' ? 'inférieure' : 'supérieure'} {dfpData.age > 0 && (t === 'inferieure' ? `${Math.floor(dfpData.age / 10) * 10}-${Math.floor(dfpData.age / 10) * 10 + 9}` : `${Math.floor(dfpData.age / 10) * 10 + 1}-${Math.floor(dfpData.age / 10) * 10 + 10}`)}</span>
                              <input type="radio" name="tranche-age" checked={dfpData.trancheAge === t} onChange={() => setFormPosteData(prev => ({ ...prev, dfp: { ...prev.dfp, trancheAge: t } }))} className="sr-only" />
                            </label>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-[14px] font-medium text-[#78716c] mb-2">Taux DFP</label>
                        <div className="relative">
                          <input
                            type="number"
                            value={dfpData.taux}
                            onChange={(e) => setFormPosteData(prev => ({ ...prev, dfp: { ...prev.dfp, taux: parseFloat(e.target.value) || 0 } }))}
                            className="w-full h-10 px-3 pr-8 text-[14px] text-[#292524] bg-white border border-[#e7e5e3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#292524]"
                            placeholder="Taux"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[14px] text-[#78716c]">%</span>
                        </div>
                        <div className="mt-2 space-y-1.5">
                          {['inferieure', 'superieure'].map(t => (
                            <label key={t} className="flex items-center gap-2 cursor-pointer">
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${dfpData.trancheTaux === t ? 'border-[#292524]' : 'border-[#d6d3d1]'}`}>
                                {dfpData.trancheTaux === t && <div className="w-2 h-2 rounded-full bg-[#292524]" />}
                              </div>
                              <span className="text-xs text-[#292524]">Tranche {t === 'inferieure' ? 'inférieure' : 'supérieure'} {dfpData.taux > 0 && (t === 'inferieure' ? `${Math.floor(dfpData.taux / 5) * 5}-${Math.floor(dfpData.taux / 5) * 5 + 5}%` : `${Math.floor(dfpData.taux / 5) * 5 + 1}-${Math.floor(dfpData.taux / 5) * 5 + 5}%`)}</span>
                              <input type="radio" name="tranche-taux" checked={dfpData.trancheTaux === t} onChange={() => setFormPosteData(prev => ({ ...prev, dfp: { ...prev.dfp, trancheTaux: t } }))} className="sr-only" />
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pièces justificatives */}
                <div style={sectionHeaderStyle} className="mt-2">PIÈCES JUSTIFICATIVES</div>
                <div className={cardBlockClass}>
                  <div
                    className="flex items-center justify-center h-[72px] border border-dashed border-[#d6d3d1] m-4 rounded-lg cursor-pointer hover:border-[#a8a29e] transition-colors"
                    onClick={() => document.getElementById('dfp-upload')?.click()}
                  >
                    <span className="text-[14px] text-[#78716c]">Déposez ou <span className="text-[#1e3a8a] font-medium">cliquez</span> pour ajouter un justificatif</span>
                    <input type="file" id="dfp-upload" multiple accept=".pdf,.jpg,.jpeg,.png" className="hidden" />
                  </div>
                </div>

                {/* Total Block — expanded */}
                <div className={totalBlockClass}>
                  <button onClick={() => setTotalExpanded(prev => ({...prev, dfp: !prev.dfp}))} className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-[#d6d3d1] rounded-[6px] flex items-center justify-center">
                        <FileText className="w-3.5 h-3.5 text-[#78716c]" />
                      </div>
                      <span className="text-[14px] font-medium text-[#292524]">Total DFP</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span style={serifAmountStyle} className="text-[#292524]">{fmt(dfpData.montant)}</span>
                      <ChevronRight className={`w-4 h-4 text-[#78716c] transition-transform ${totalExpanded.dfp ? 'rotate-90' : ''}`} />
                    </div>
                  </button>
                  {totalExpanded.dfp && (
                    <>
                      <div className="border-t border-[#d6d3d1] mt-3 mb-3" />
                      <div className="space-y-2">
                        <div className="flex justify-between"><span className="text-[14px] text-[#78716c]">Prix du point</span><span className="text-[14px] text-[#292524]">{fmt(dfpData.pointBase)}</span></div>
                        <div className="flex justify-between"><span className="text-[14px] text-[#78716c]">Taux DFP</span><span className="text-[14px] text-[#292524]">× {dfpData.taux}%</span></div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* NOTES / ARGUMENTAIRE Section */}
          <div className="p-4 border-b border-[#e7e5e3]" style={{ backgroundColor: '#F8F7F5' }}>
            <div style={sectionHeaderStyle} className="mb-[17px]">NOTES / ARGUMENTAIRE</div>
            <div className="bg-white border border-[#e7e5e3] rounded-[4px] overflow-hidden">
              <div className="flex items-center gap-1 px-3 py-2 border-b border-[#e7e5e3]">
                <button className="px-2 py-1 rounded hover:bg-[#f5f5f4] text-[#78716c] font-bold text-sm">B</button>
                <button className="px-2 py-1 rounded hover:bg-[#f5f5f4] text-[#78716c] italic text-sm">I</button>
                <button className="px-2 py-1 rounded hover:bg-[#f5f5f4] text-[#78716c] underline text-sm">U</button>
              </div>
              <textarea
                value={posteNotes.dfp || ''}
                onChange={(e) => setPosteNotes(prev => ({...prev, dfp: e.target.value}))}
                className="w-full p-4 text-[14px] text-[#292524] leading-[27px] resize-none min-h-[120px] focus:outline-none"
                placeholder="Ajoutez vos notes et arguments..."
              />
            </div>
          </div>

          {/* JURISPRUDENCES Section */}
          <div className="p-4" style={{ backgroundColor: '#F8F7F5' }}>
            <div style={sectionHeaderStyle} className="mb-[17px]">JURISPRUDENCES</div>
            <div className="bg-white border border-[#e7e5e3] rounded-[4px] h-[58px] flex items-center justify-center">
              <span className="text-[14px] text-[#a8a29e]">Aucune jurisprudence ajoutée</span>
            </div>
          </div>
        </div>
      );
    }

    // ========== GENERIC MINIMAL FORM — Fallthrough for all other postes ==========
    {
      const posteId = currentLevel.id;
      const data = formPosteData[posteId] || { montant: 0, tiersPayeur: 0 };

      return (
        <div>

          {/* CALCUL Section */}
          <div className="border-b border-[#e7e5e3]" style={{ backgroundColor: '#F8F7F5' }}>
            <div className="p-4">
              <div className="space-y-4">
                {/* Form Block */}
                <div className={cardBlockClass}>
                  <div className="p-5 space-y-4">
                    <div>
                      <label className="block text-[14px] font-medium text-[#78716c] mb-2">Indemnisation</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={data.montant || ''}
                          onChange={(e) => setFormPosteData(prev => ({ ...prev, [posteId]: { ...(prev[posteId] || {}), montant: parseFloat(e.target.value) || 0 } }))}
                          className="w-full h-10 px-3 pr-8 text-[14px] text-[#292524] bg-white border border-[#e7e5e3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#292524]"
                          placeholder="Montant en €"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[14px] text-[#78716c]">€</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[14px] font-medium text-[#78716c] mb-2">Part tiers payeur</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={data.tiersPayeur || ''}
                          onChange={(e) => setFormPosteData(prev => ({ ...prev, [posteId]: { ...(prev[posteId] || {}), tiersPayeur: parseFloat(e.target.value) || 0 } }))}
                          className="w-full h-10 px-3 pr-8 text-[14px] text-[#292524] bg-white border border-[#e7e5e3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#292524]"
                          placeholder="Montant en €"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[14px] text-[#78716c]">€</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pièces justificatives */}
                <div style={sectionHeaderStyle} className="mt-2">PIÈCES JUSTIFICATIVES</div>
                <div className={cardBlockClass}>
                  <div
                    className="flex items-center justify-center h-[72px] border border-dashed border-[#d6d3d1] m-4 rounded-lg cursor-pointer hover:border-[#a8a29e] transition-colors"
                    onClick={() => document.getElementById(`${posteId}-upload`)?.click()}
                  >
                    <span className="text-[14px] text-[#78716c]">Déposez ou <span className="text-[#1e3a8a] font-medium">cliquez</span> pour ajouter un justificatif</span>
                    <input type="file" id={`${posteId}-upload`} multiple accept=".pdf,.jpg,.jpeg,.png" className="hidden" />
                  </div>
                </div>

                {/* Total Block */}
                <div className={totalBlockClass}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-[#d6d3d1] rounded-[6px] flex items-center justify-center">
                        <FileText className="w-3.5 h-3.5 text-[#78716c]" />
                      </div>
                      <span className="text-[14px] font-medium text-[#292524]">Total {currentLevel.title || posteId.toUpperCase()}</span>
                    </div>
                    <span style={serifAmountStyle} className="text-[#292524]">{fmt(data.montant - (data.tiersPayeur || 0))}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* NOTES / ARGUMENTAIRE Section */}
          <div className="p-4 border-b border-[#e7e5e3]" style={{ backgroundColor: '#F8F7F5' }}>
            <div style={sectionHeaderStyle} className="mb-[17px]">NOTES / ARGUMENTAIRE</div>
            <div className="bg-white border border-[#e7e5e3] rounded-[4px] overflow-hidden">
              <div className="flex items-center gap-1 px-3 py-2 border-b border-[#e7e5e3]">
                <button className="px-2 py-1 rounded hover:bg-[#f5f5f4] text-[#78716c] font-bold text-sm">B</button>
                <button className="px-2 py-1 rounded hover:bg-[#f5f5f4] text-[#78716c] italic text-sm">I</button>
                <button className="px-2 py-1 rounded hover:bg-[#f5f5f4] text-[#78716c] underline text-sm">U</button>
              </div>
              <textarea
                value={posteNotes[posteId] || ''}
                onChange={(e) => setPosteNotes(prev => ({...prev, [posteId]: e.target.value}))}
                className="w-full p-4 text-[14px] text-[#292524] leading-[27px] resize-none min-h-[120px] focus:outline-none"
                placeholder="Ajoutez vos notes et arguments..."
              />
            </div>
          </div>

          {/* JURISPRUDENCES Section */}
          <div className="p-4" style={{ backgroundColor: '#F8F7F5' }}>
            <div style={sectionHeaderStyle} className="mb-[17px]">JURISPRUDENCES</div>
            <div className="bg-white border border-[#e7e5e3] rounded-[4px] h-[58px] flex items-center justify-center">
              <span className="text-[14px] text-[#a8a29e]">Aucune jurisprudence ajoutée</span>
            </div>
          </div>
        </div>
      );
    }
  };

  // Descriptions des postes
  const posteDescriptions = { // eslint-disable-line no-unused-vars
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
    setNavStack([{ id: dossier.id, type: 'dossier', title: dossier.reference, activeTab: 'dossier' }]);
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
            <h2 className="text-heading-sm text-[#292524]">{titre}</h2>
            <button onClick={() => setShowExportModal(false)} className="p-1.5 hover:bg-[#eeece6] rounded-lg transition-colors">
              <X className="w-4 h-4 text-[#a8a29e]" />
            </button>
          </div>
          <div className="p-4 space-y-2">
            {options.map((opt, i) => (
              <div key={i} className="group relative flex items-start gap-4 p-4 rounded-xl hover:bg-[#fafaf9] transition-colors cursor-default">
                <div className="w-10 h-10 rounded-lg bg-[#eeece6] flex items-center justify-center flex-shrink-0 group-hover:bg-zinc-200 transition-colors">
                  <opt.icon className="w-5 h-5 text-[#78716c]" strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-body-medium text-[#292524]">{opt.label}</p>
                  <p className="text-caption text-[#78716c] mt-0.5 leading-relaxed">{opt.desc}</p>
                </div>
                <span className="absolute left-4 right-4 -bottom-1 translate-y-full p-2.5 bg-[#292524] text-white text-caption rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-30 pointer-events-none">
                  {opt.tooltip}
                </span>
              </div>
            ))}
          </div>
          <div className="px-6 py-4 border-t bg-[#F8F7F5] rounded-b-xl">
            <p className="text-caption text-[#a8a29e] text-center">Ces options sont présentées à titre informatif pour recueillir vos retours.</p>
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

    // Try to extract a name from file names (e.g. "Martin_Sophie_rapport.pdf" or "dupont jean expertise.pdf")
    const extractNameFromFiles = (fileList) => {
      for (const f of fileList) {
        const base = f.name.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' ');
        // Match two consecutive capitalized words or words at start
        const match = base.match(/\b([A-ZÀ-Ü][a-zà-ÿ]+)\s+([A-ZÀ-Ü][a-zà-ÿ]+)/);
        if (match) return { nom: match[1], prenom: match[2] };
      }
      return null;
    };
    const extracted = extractNameFromFiles(files);
    const refName = extracted ? `${extracted.nom} ${extracted.prenom}` : 'Nouveau dossier';

    setDossiers(prev => [{
      id: newId, reference: refName, typeFait: hasRapport ? 'Accident de la voie publique' : '',
      date: new Date().toLocaleDateString('fr-FR'), lastEditBy: 'Meghan R.', lastEditDate: new Date().toLocaleDateString('fr-FR')
    }, ...prev]);

    setVictimeData(extracted
      ? { nom: extracted.nom, prenom: extracted.prenom, sexe: 'Homme', dateNaissance: '', dateDeces: null }
      : { nom: '', prenom: '', sexe: 'Homme', dateNaissance: '', dateDeces: null });
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

    // Reset chat state for new dossier
    setChatMessages([]);
    chatExtractionAnnounced.current = false;
    chatPostesAnnounced.current = false;
    chatAnalyzedPostes.current = new Set();
    setDossierPostes([]);

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
        className="flex h-full relative -mx-4 -mt-4"
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
        {/* Hidden file input */}
        <input id="add-pieces-input" type="file" multiple accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" className="hidden" onChange={e => { handleAddMorePieces(e.target.files); e.target.value = ''; }} />

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Sub-header bar — edge-to-edge */}
          <div className="flex items-center gap-3 px-4 py-2.5 border-b border-[#e7e5e3]">
            <span className="flex-1 text-sm font-medium text-[#292524]">{totalItems} pièce{totalItems > 1 ? 's' : ''}</span>
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <select
                  value={piecesFilter.type || ''}
                  onChange={e => setPiecesFilter(prev => ({ ...prev, type: e.target.value || null }))}
                  className="appearance-none h-9 pl-8 pr-8 text-sm border border-[#e7e5e3] rounded-lg bg-white text-[#78716c] focus:outline-none focus:ring-1 focus:ring-stone-300 shadow-sm cursor-pointer"
                >
                  <option value="">Filtrer par type</option>
                  {PIECE_TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <ListFilter className="w-4 h-4 text-[#78716c] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" strokeWidth={1.5} />
                <ChevronDown className="w-4 h-4 text-[#78716c] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" strokeWidth={1.5} />
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={piecesFilter.search}
                  onChange={e => setPiecesFilter(prev => ({ ...prev, search: e.target.value }))}
                  className="h-9 pl-8 pr-3 text-sm border border-[#e7e5e3] rounded-lg bg-white text-[#292524] placeholder-[#78716c] placeholder-opacity-70 focus:outline-none focus:ring-1 focus:ring-stone-300 shadow-sm"
                />
                <Search className="w-4 h-4 text-[#78716c] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" strokeWidth={1.5} />
              </div>
              {isFiltered && (
                <button onClick={() => setPiecesFilter({ type: null, search: '' })} className="text-sm text-[#78716c] hover:text-[#44403c] flex items-center gap-1 transition-colors">
                  <X className="w-3.5 h-3.5" /> Réinitialiser
                </button>
              )}
              <button
                onClick={handleCopyBordereau}
                className="h-8 px-3 text-sm font-medium text-[#44403c] bg-[#eeece6] rounded-md hover:bg-[#e7e5e3] transition-colors"
              >
                Bordereau
              </button>
            </div>
          </div>

          {/* Content with padding */}
          <div className="p-4 flex-1 overflow-y-auto">
            {/* Drop zone */}
            <div
              className="mb-4 flex items-center justify-center gap-4 h-16 border border-dashed border-[#d6d3d1] rounded-lg cursor-pointer transition-colors hover:border-[#a8a29e]"
              style={{ background: 'linear-gradient(to top, rgba(238,236,230,0) 50%, #f8f7f5 100%)' }}
              onClick={() => document.getElementById('add-pieces-input')?.click()}
              onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
              onDrop={e => { e.preventDefault(); e.stopPropagation(); handleAddMorePieces(e.dataTransfer.files); }}
            >
              <Upload className="w-5 h-5 text-[#78716c]" strokeWidth={1.5} />
              <span className="text-sm">
                <span className="text-[#78716c]">Déposez ou </span>
                <span className="font-medium text-[#1e3a8a]">cliquez</span>
                <span className="text-[#78716c]"> pour ajouter de nouvelles pièces</span>
              </span>
            </div>

            {/* Table */}
            <div className="border border-[#e7e5e3] rounded-md overflow-hidden bg-white">
              <table className="w-full">
                <thead>
                  <tr className="h-10 bg-white border-b border-[#e7e5e3]">
                    <th className="w-[38px]"></th>
                    <th className="w-[50px] px-3 text-center" style={colHeaderStyle}>N°</th>
                    <th className="px-3 text-left" style={colHeaderStyle}>Nom du document</th>
                    <th className="w-[174px] px-3 text-left" style={colHeaderStyle}>Type</th>
                    <th className="w-[120px] px-3 text-left" style={colHeaderStyle}>Date</th>
                    <th className="w-[224px] px-3 text-left" style={colHeaderStyle}>Postes liés</th>
                    <th className="w-[44px]"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((piece, idx) => {
                    const isProcessing = piece.status !== 'done';
                    const pieceNum = piece.status === 'done' ? getPieceNumber(piece) : null;
                    const isSelected = pieceOverviewPanel === piece.id;
                    const isDragItem = reorderDrag?.pieceId === piece.id;
                    const canDrag = !isProcessing && !isFiltered;

                    return (
                      <React.Fragment key={piece.id}>
                        {/* Drop indicator line */}
                        {reorderDropIdx === idx && reorderDrag?.pieceId !== piece.id && (
                          <tr><td colSpan={7} className="p-0"><div className="h-0.5 bg-blue-500 rounded-full mx-2" /></td></tr>
                        )}
                        <tr
                          className={`border-b border-[#e7e5e3] transition-all duration-300 group bg-white ${
                            isDragItem ? 'opacity-20 !bg-[#f4f4f5]' :
                            isProcessing ? '' : 'hover:bg-[#fafaf9] cursor-pointer'
                          } ${piece.justCompleted ? '!bg-teal-50' : ''} ${isSelected && !isDragItem ? '!bg-[#f8f7f5]' : ''}`}
                          onClick={() => !isProcessing && !reorderDrag && setPieceOverviewPanel(piece.id)}
                          style={{ height: '56px' }}
                          draggable={canDrag}
                          onDragStart={e => {
                            if (!canDrag) { e.preventDefault(); return; }
                            const img = new window.Image();
                            img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                            e.dataTransfer.setDragImage(img, 0, 0);
                            e.dataTransfer.effectAllowed = 'move';
                            setReorderDrag({ pieceId: piece.id, ghostX: e.clientX, ghostY: e.clientY, name: piece.cleanName, type: piece.type, num: pieceNum });
                          }}
                          onDrag={e => {
                            if (e.clientX === 0 && e.clientY === 0) return;
                            setReorderDrag(prev => prev ? { ...prev, ghostX: e.clientX, ghostY: e.clientY } : null);
                          }}
                          onDragOver={e => {
                            e.preventDefault();
                            e.dataTransfer.dropEffect = 'move';
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
                                  const doneIds = currentFiltered.filter(p => p.status === 'done').map(p => p.id);
                                  const pending = prev.filter(p => p.status !== 'done');
                                  const doneMap = {};
                                  prev.forEach(p => { if (p.status === 'done') doneMap[p.id] = p; });
                                  const ordered = doneIds.map(id => doneMap[id]);
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
                        {/* Grip handle */}
                        <td className="w-[38px] text-center">
                          {canDrag ? (
                            <GripVertical className="w-3.5 h-3.5 text-[#d6d3d1] cursor-grab opacity-0 group-hover:opacity-100 transition-opacity inline-block" strokeWidth={1.5} />
                          ) : null}
                        </td>
                        {/* N° / loader */}
                        <td className="w-[50px] px-3 text-center">
                          {isProcessing ? (
                            <Loader2 className="w-5 h-5 text-[#78716c] animate-spin mx-auto" strokeWidth={1.5} />
                          ) : (
                            <span className="inline-flex items-center justify-center w-[22px] h-[22px] bg-[#eeece6] text-[#78716c] text-xs font-semibold rounded-md">{pieceNum || '—'}</span>
                          )}
                        </td>
                        {/* Document name */}
                        <td className="px-3">
                          {isProcessing ? (
                            <span className="text-sm text-[#292524] italic opacity-40">{piece.originalName}</span>
                          ) : (
                            <span className="text-sm font-medium text-black">{piece.cleanName}</span>
                          )}
                        </td>
                        {/* Type */}
                        <td className="w-[174px] px-3">
                          {isProcessing ? (
                            <div className="h-[18px] w-16 bg-[#f4f4f5] rounded" />
                          ) : (
                            <div className="relative">
                              <button
                                className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md cursor-pointer hover:opacity-80 transition-opacity ${PIECE_TYPE_COLORS[piece.type] || 'bg-[#eeece6] text-[#44403c]'}`}
                                onClick={e => { e.stopPropagation(); setEditingPieceField(editingPieceField?.pieceId === piece.id && editingPieceField?.field === 'type' ? null : { pieceId: piece.id, field: 'type' }); }}
                              >
                                {piece.type}
                                <ChevronDown className="w-3 h-3" strokeWidth={1.5} />
                              </button>
                              {editingPieceField?.pieceId === piece.id && editingPieceField?.field === 'type' && (
                                <div className="absolute left-0 top-full mt-1 bg-white border border-[#e7e5e3] rounded-lg shadow-lg py-1 z-10 min-w-[160px]">
                                  {PIECE_TYPE_OPTIONS.map(t => (
                                    <button
                                      key={t}
                                      className={`w-full text-left px-3 py-1.5 text-sm hover:bg-[#fafaf9] transition-colors flex items-center gap-2 ${piece.type === t ? 'font-medium text-[#292524]' : 'text-[#78716c]'}`}
                                      onClick={e => {
                                        e.stopPropagation();
                                        setDropFirstPieces(prev => prev.map(p => p.id === piece.id ? { ...p, type: t } : p));
                                        setEditingPieceField(null);
                                      }}
                                    >
                                      <span className={`w-2 h-2 rounded-full ${piece.type === t ? 'bg-[#292524]' : ''}`} />
                                      {t}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                        {/* Date */}
                        <td className="w-[120px] px-3">
                          {isProcessing ? (
                            <div className="h-[18px] w-16 bg-[#f4f4f5] rounded" />
                          ) : (
                            <span className="text-sm text-[#292524]">
                              {piece.date ? new Date(piece.date).toLocaleDateString('fr-FR') : '—'}
                            </span>
                          )}
                        </td>
                        {/* Postes liés */}
                        <td className="w-[224px] px-3">
                          {isProcessing ? (
                            <div className="h-[18px] w-16 bg-[#f4f4f5] rounded" />
                          ) : (
                            <div className="flex flex-wrap gap-1 overflow-hidden">
                              {(piece.postesLies || []).map(p => (
                                <span key={p} className="px-2 py-0.5 text-xs font-medium text-[#44403c] bg-[#eeece6] rounded-md">{p}</span>
                              ))}
                            </div>
                          )}
                        </td>
                        {/* Options */}
                        <td className="w-[44px] text-right pr-4">
                          {!isProcessing && (
                            <MoreVertical className="w-4 h-4 text-[#78716c] opacity-0 group-hover:opacity-100 transition-opacity inline-block" strokeWidth={1.5} />
                          )}
                        </td>
                      </tr>
                      </React.Fragment>
                    );
                  })}
                  {/* Drop indicator at the very end */}
                  {reorderDropIdx === filtered.length && reorderDrag && (
                    <tr><td colSpan={7} className="p-0"><div className="h-0.5 bg-blue-500 rounded-full mx-2" /></td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Custom drag ghost card */}
          {reorderDrag && (
            <div
              className="fixed z-50 pointer-events-none bg-white border border-[#e7e5e3] rounded-lg shadow-lg px-3 py-2 flex items-center gap-2"
              style={{ left: reorderDrag.ghostX + 12, top: reorderDrag.ghostY - 16, minWidth: 200 }}
            >
              <GripVertical className="w-3 h-3 text-[#d6d3d1]" strokeWidth={1.5} />
              <span className="inline-flex items-center justify-center w-[22px] h-[22px] bg-[#eeece6] text-[#78716c] text-xs font-semibold rounded-md">{reorderDrag.num || '?'}</span>
              <span className="text-sm font-medium text-[#292524] truncate max-w-[250px]">{reorderDrag.name}</span>
              {reorderDrag.type && (
                <span className={`px-2 py-0.5 text-xs font-medium rounded-md ${PIECE_TYPE_COLORS[reorderDrag.type] || 'bg-[#eeece6] text-[#44403c]'}`}>{reorderDrag.type}</span>
              )}
            </div>
          )}

          {/* Track B hint — no rapport */}
          {allDone && !dropFirstHasRapport && !rapportBannerDismissed && (
            <div className="mt-3 px-4 py-3 text-sm text-[#78716c] flex items-center gap-2">
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
    const typeColorLight = piece.type === 'Expertise' ? 'bg-teal-50 border-teal-200' : piece.type === 'Décision' ? 'bg-purple-50 border-purple-200' : piece.type === 'Revenus' ? 'bg-green-50 border-green-200' : piece.type === 'Factures' ? 'bg-orange-50 border-orange-200' : piece.type === 'Médical' ? 'bg-blue-50 border-blue-200' : piece.type === 'Administratif' ? 'bg-slate-50 border-slate-200' : 'bg-[#F8F7F5] border-[#e7e5e3]';

    // Navigation: get ordered list of done pieces
    const donePieces = getFilteredPieces().filter(p => p.status === 'done');
    const currentIdx = donePieces.findIndex(p => p.id === piece.id);
    const prevPiece = currentIdx > 0 ? donePieces[currentIdx - 1] : null;
    const nextPiece = currentIdx < donePieces.length - 1 ? donePieces[currentIdx + 1] : null;

    const editingPanelType = editingPieceField?.pieceId === piece.id && editingPieceField?.field === 'panelType';

    return (
      <div className="fixed right-0 top-0 h-screen bg-white border-l border-[#e7e5e3] shadow-xl z-30 flex flex-col" style={{ width: '860px', animation: 'slideInRight 0.2s ease-out' }}>
        {/* Common header: navigation + close — spans full width */}
        <div className="px-5 py-3 border-b border-[#e7e5e3] flex items-center justify-between flex-shrink-0 bg-white">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-[22px] h-[22px] rounded-[6px] bg-[#dfe8f5] text-caption-medium text-[#292524]">{pieceNum || '—'}</span>
              <span className="text-body-medium text-[#44403c] truncate max-w-[300px]">{piece.cleanName}</span>
            </div>
            <span className="text-zinc-200 mx-1">|</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => prevPiece && setPieceOverviewPanel(prevPiece.id)}
                disabled={!prevPiece}
                className={`p-1.5 rounded-md transition-colors ${prevPiece ? 'text-[#78716c] hover:text-[#292524] hover:bg-[#eeece6]' : 'text-zinc-200 cursor-not-allowed'}`}
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
              </button>
              <span className="text-caption text-[#a8a29e] min-w-[40px] text-center">{currentIdx + 1} / {donePieces.length}</span>
              <button
                onClick={() => nextPiece && setPieceOverviewPanel(nextPiece.id)}
                disabled={!nextPiece}
                className={`p-1.5 rounded-md transition-colors ${nextPiece ? 'text-[#78716c] hover:text-[#292524] hover:bg-[#eeece6]' : 'text-zinc-200 cursor-not-allowed'}`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <button onClick={() => setPieceOverviewPanel(null)} className="p-1.5 text-[#a8a29e] hover:text-[#78716c] hover:bg-[#eeece6] rounded-md transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Two-column body */}
        <div className="flex flex-1 min-h-0">
        {/* Left: Document Preview */}
        <div className="w-[420px] flex flex-col border-r border-zinc-100 bg-[#F8F7F5]">
          {/* Source file card — on top */}
          <div className="px-4 pt-4 pb-2 flex-shrink-0">
            <div className="rounded-lg border border-[#e7e5e3] bg-[#F8F7F5]/60 overflow-hidden">
              <div className="flex items-center gap-1.5 px-3 py-2 border-b border-zinc-100">
                {hasSplitInfo ? (
                  <>
                    <Scissors className="w-3 h-3 text-[#a8a29e]" />
                    <span className="text-caption-medium text-[#a8a29e]">Document découpé · partie {piece.splitIndex + 1}/{piece.siblings.length}</span>
                  </>
                ) : (
                  <span className="text-caption-medium text-[#a8a29e]">Document original</span>
                )}
              </div>
              <div className="flex items-center gap-2.5 px-3 py-2.5">
                <div className="flex items-center justify-center w-7 h-7 rounded-md bg-white border border-[#e7e5e3] flex-shrink-0">
                  <FileText className="w-3.5 h-3.5 text-[#a8a29e]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-body-medium text-[#78716c] truncate">{piece.originalName || piece.sourceFile || '—'}</p>
                  <p className="text-caption text-[#a8a29e]">{piece.pages || '?'} page{(piece.pages || 0) > 1 ? 's' : ''}</p>
                </div>
              </div>
            </div>
          </div>
          {/* Preview content — placeholder */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className={`w-full h-full min-h-[500px] rounded-lg border ${typeColorLight} flex flex-col items-center justify-center`}>
              <FileText className="w-12 h-12 text-[#d6d3d1] mb-3" />
              <p className="text-body-medium text-[#a8a29e] mb-1">Aperçu du document</p>
              <p className="text-caption text-[#d6d3d1] text-center px-8">
                {piece.cleanName}
              </p>
              <div className="mt-4 flex items-center gap-2 text-caption text-[#d6d3d1]">
                <span>{piece.pages || '?'} page{(piece.pages || 0) > 1 ? 's' : ''}</span>
                {hasSplitInfo && <span>· p. {piece.pageRange}</span>}
              </div>
              {/* Fake page thumbnails */}
              <div className="mt-6 flex flex-wrap gap-2 justify-center px-6">
                {Array.from({ length: Math.min(piece.pages || 1, 6) }).map((_, i) => (
                  <div key={i} className="w-[60px] h-[80px] bg-white rounded border border-[#e7e5e3] shadow-sm flex items-center justify-center">
                    <span className="text-counter text-[#d6d3d1]">{i + 1}</span>
                  </div>
                ))}
                {(piece.pages || 0) > 6 && (
                  <div className="w-[60px] h-[80px] bg-white rounded border border-[#e7e5e3] shadow-sm flex items-center justify-center">
                    <span className="text-counter text-[#d6d3d1]">+{piece.pages - 6}</span>
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
              <label className="text-caption text-[#a8a29e] mb-1 block">Nom du document</label>
              <input
                className="text-body-medium text-[#292524] bg-white border border-[#e7e5e3] rounded-lg px-3 py-2 w-full hover:border-zinc-300 focus:border-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-200 transition-colors"
                value={piece.cleanName}
                onChange={e => setDropFirstPieces(prev => prev.map(p => p.id === piece.id ? { ...p, cleanName: e.target.value } : p))}
              />
            </div>

            {/* Description — extracted summary */}
            {piece.summary && (
              <div className="mb-4">
                <p className="text-caption text-[#78716c] leading-relaxed">{piece.summary}</p>
              </div>
            )}

            {/* Data rows — label / value, separated by border */}
            <div className="divide-y divide-[#e7e5e3]">
              {/* Type */}
              <div className="flex items-center justify-between py-3">
                <span className="text-caption text-[#a8a29e]">Type</span>
                <div className="relative">
                  <button
                    className={`badge badge-md cursor-pointer hover:opacity-80 transition-opacity ${PIECE_TYPE_COLORS[piece.type] || 'badge-secondary'}`}
                    onClick={() => setEditingPieceField(editingPanelType ? null : { pieceId: piece.id, field: 'panelType' })}
                  >
                    {piece.type}
                    <ChevronDown className="w-3 h-3 opacity-50" />
                  </button>
                  {editingPanelType && (
                    <div className="absolute right-0 top-full mt-1 bg-white border border-[#e7e5e3] rounded-lg shadow-lg py-1 z-10 min-w-[160px]">
                      {PIECE_TYPE_OPTIONS.map(t => (
                        <button
                          key={t}
                          className={`w-full text-left px-3 py-1.5 text-body hover:bg-[#fafaf9] transition-colors flex items-center gap-2 ${piece.type === t ? 'font-medium text-[#292524]' : 'text-[#78716c]'}`}
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
                <span className="text-caption text-[#a8a29e]">Date</span>
                <span className="text-body text-[#44403c]">{piece.date ? new Date(piece.date).toLocaleDateString('fr-FR') : '—'}</span>
              </div>

              {/* Postes liés */}
              <div className="flex items-start justify-between py-3">
                <span className="text-caption text-[#a8a29e] pt-0.5">Postes liés</span>
                <div className="flex flex-wrap gap-1 justify-end max-w-[65%]">
                  {piece.postesLies && piece.postesLies.length > 0 ? piece.postesLies.map(p => (
                    <span key={p} className="badge badge-sm badge-secondary">{p}</span>
                  )) : (
                    <span className="text-caption text-[#d6d3d1]">—</span>
                  )}
                </div>
              </div>
            </div>


          </div>
          {/* Footer — fixed at bottom of right column */}
          <div className="px-5 py-4 border-t border-[#e7e5e3] bg-white flex-shrink-0">
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
            <h2 className="text-display-sm text-[#292524]" style={{ fontFamily: 'Georgia, serif' }}>Nouveau dossier</h2>
            <button onClick={() => setDropModal(null)} className="p-1 text-[#a8a29e] hover:text-[#78716c] hover:bg-[#eeece6] rounded-lg transition-colors">
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
                <p className="text-body-medium text-[#78716c] mb-2">{files.length} document{files.length > 1 ? 's' : ''} ajouté{files.length > 1 ? 's' : ''}</p>
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
              className="text-body text-[#a8a29e] hover:text-[#78716c] transition-colors"
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
              <h2 className="text-lg font-semibold text-[#292524]">Nouveau dossier</h2>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-6">
              {/* Section Identité */}
              <div>
                <h3 className="text-body-medium font-semibold text-[#44403c] mb-3">Identité de la victime</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-caption-medium text-[#78716c] mb-1.5">Nom *</label>
                    <input
                      type="text"
                      value={formData.nom}
                      onChange={(e) => updateFormData('nom', e.target.value)}
                      placeholder="Nom de famille"
                      className="w-full px-3 py-2.5 border border-[#e7e5e3] rounded-lg text-body text-[#44403c] focus:outline-none focus:ring-2 focus:ring-zinc-300 focus:border-zinc-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-caption-medium text-[#78716c] mb-1.5">Prénom *</label>
                    <input
                      type="text"
                      value={formData.prenom}
                      onChange={(e) => updateFormData('prenom', e.target.value)}
                      placeholder="Prénom"
                      className="w-full px-3 py-2.5 border border-[#e7e5e3] rounded-lg text-body text-[#44403c] focus:outline-none focus:ring-2 focus:ring-zinc-300 focus:border-zinc-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-caption-medium text-[#78716c] mb-1.5">Sexe</label>
                    <select
                      value={formData.sexe}
                      onChange={(e) => updateFormData('sexe', e.target.value)}
                      className="w-full px-3 py-2.5 border border-[#e7e5e3] rounded-lg text-body text-[#44403c] focus:outline-none focus:ring-2 focus:ring-zinc-300 focus:border-zinc-400 transition-colors"
                    >
                      <option value="Homme">Homme</option>
                      <option value="Femme">Femme</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-caption-medium text-[#78716c] mb-1.5">Date de naissance *</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="JJ/MM/AAAA"
                        value={formData.dateNaissance}
                        onChange={(e) => updateFormData('dateNaissance', formatDateInput(e.target.value))}
                        maxLength={10}
                        className="w-full px-3 py-2.5 pr-9 border border-[#e7e5e3] rounded-lg text-body text-[#44403c] focus:outline-none focus:ring-2 focus:ring-zinc-300 focus:border-zinc-400 transition-colors"
                      />
                      <input type="date" className="absolute inset-0 opacity-0 pointer-events-none" onChange={(e) => { if (e.target.value) updateFormData('dateNaissance', formatDateFR(e.target.value)); }} />
                      <button type="button" onClick={(e) => e.currentTarget.previousElementSibling.showPicker()} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-[#eeece6] rounded"><Calendar className="w-4 h-4 text-[#a8a29e]" /></button>
                    </div>
                    {computedAge !== null && <div className="text-caption text-[#a8a29e] mt-1">{computedAge} ans</div>}
                  </div>
                  <div className="col-span-2">
                    <label className="block text-caption-medium text-[#78716c] mb-1.5">Date de décès</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="JJ/MM/AAAA"
                        value={formData.dateDeces}
                        onChange={(e) => updateFormData('dateDeces', formatDateInput(e.target.value))}
                        maxLength={10}
                        className="w-full px-3 py-2.5 pr-9 border border-[#e7e5e3] rounded-lg text-body text-[#44403c] focus:outline-none focus:ring-2 focus:ring-zinc-300 focus:border-zinc-400 transition-colors"
                      />
                      <input type="date" className="absolute inset-0 opacity-0 pointer-events-none" onChange={(e) => { if (e.target.value) updateFormData('dateDeces', formatDateFR(e.target.value)); }} />
                      <button type="button" onClick={(e) => e.currentTarget.previousElementSibling.showPicker()} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-[#eeece6] rounded"><Calendar className="w-4 h-4 text-[#a8a29e]" /></button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section Contexte */}
              <div>
                <h3 className="text-body-medium font-semibold text-[#44403c] mb-3">Contexte</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-caption-medium text-[#78716c] mb-1.5">Type de fait générateur</label>
                    <select
                      value={formData.typeFait}
                      onChange={(e) => updateFormData('typeFait', e.target.value)}
                      className="w-full px-3 py-2.5 border border-[#e7e5e3] rounded-lg text-body text-[#44403c] focus:outline-none focus:ring-2 focus:ring-zinc-300 focus:border-zinc-400 transition-colors"
                    >
                      {typesFaitGenerateur.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-caption-medium text-[#78716c] mb-1.5">Date de l'accident *</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="JJ/MM/AAAA"
                        value={formData.dateAccident}
                        onChange={(e) => updateFormData('dateAccident', formatDateInput(e.target.value))}
                        maxLength={10}
                        className="w-full px-3 py-2.5 pr-9 border border-[#e7e5e3] rounded-lg text-body text-[#44403c] focus:outline-none focus:ring-2 focus:ring-zinc-300 focus:border-zinc-400 transition-colors"
                      />
                      <input type="date" className="absolute inset-0 opacity-0 pointer-events-none" onChange={(e) => { if (e.target.value) updateFormData('dateAccident', formatDateFR(e.target.value)); }} />
                      <button type="button" onClick={(e) => e.currentTarget.previousElementSibling.showPicker()} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-[#eeece6] rounded"><Calendar className="w-4 h-4 text-[#a8a29e]" /></button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-caption-medium text-[#78716c] mb-1.5">Date de consolidation <span className="text-[#d6d3d1] font-normal">(facultatif)</span></label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="JJ/MM/AAAA"
                        value={formData.dateConsolidation}
                        onChange={(e) => updateFormData('dateConsolidation', formatDateInput(e.target.value))}
                        maxLength={10}
                        className="w-full px-3 py-2.5 pr-9 border border-[#e7e5e3] rounded-lg text-body text-[#44403c] focus:outline-none focus:ring-2 focus:ring-zinc-300 focus:border-zinc-400 transition-colors"
                      />
                      <input type="date" className="absolute inset-0 opacity-0 pointer-events-none" onChange={(e) => { if (e.target.value) updateFormData('dateConsolidation', formatDateFR(e.target.value)); }} />
                      <button type="button" onClick={(e) => e.currentTarget.previousElementSibling.showPicker()} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-[#eeece6] rounded"><Calendar className="w-4 h-4 text-[#a8a29e]" /></button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-caption-medium text-[#78716c] mb-1.5">Date de liquidation <span className="text-[#d6d3d1] font-normal">(facultatif)</span></label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="JJ/MM/AAAA"
                        value={formData.dateLiquidation}
                        onChange={(e) => updateFormData('dateLiquidation', formatDateInput(e.target.value))}
                        maxLength={10}
                        className="w-full px-3 py-2.5 pr-9 border border-[#e7e5e3] rounded-lg text-body text-[#44403c] focus:outline-none focus:ring-2 focus:ring-zinc-300 focus:border-zinc-400 transition-colors"
                      />
                      <input type="date" className="absolute inset-0 opacity-0 pointer-events-none" onChange={(e) => { if (e.target.value) updateFormData('dateLiquidation', formatDateFR(e.target.value)); }} />
                      <button type="button" onClick={(e) => e.currentTarget.previousElementSibling.showPicker()} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-[#eeece6] rounded"><Calendar className="w-4 h-4 text-[#a8a29e]" /></button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-zinc-100 flex justify-end gap-3">
              <button
                onClick={() => setCreationWizard(null)}
                className="px-4 py-2.5 text-body text-[#78716c] hover:text-[#44403c] hover:bg-[#eeece6] rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => setCreationWizard(prev => ({ ...prev, step: 'mode-chiffrage' }))}
                disabled={!canSubmitInfos}
                className="px-5 py-2.5 bg-[#292524] text-white text-body-medium rounded-lg hover:bg-[#44403c] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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
              <h2 className="text-lg font-semibold text-[#292524]">Comment souhaitez-vous créer votre chiffrage ?</h2>
            </div>

            {/* Body */}
            <div className="px-6 py-6">
              {/* Options principales */}
              <div className="flex gap-4">
                {/* Option 1: Importer le rapport */}
                <div
                  onClick={() => document.getElementById('wizard-file-input').click()}
                  className="flex-1 p-6 border-2 border-[#e7e5e3] rounded-xl hover:border-zinc-400 hover:bg-[#fafaf9] cursor-pointer transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#eeece6] flex items-center justify-center mb-4 group-hover:bg-zinc-200 transition-colors">
                    <Upload className="w-6 h-6 text-[#78716c]" />
                  </div>
                  <h3 className="text-heading-sm text-[#292524] mb-2">Importer mon rapport d'expertise</h3>
                  <p className="text-body text-[#78716c] leading-relaxed">Extraction automatique des données. Pré-remplissage des postes et calculs.</p>
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
                  className="flex-1 p-6 border-2 border-[#e7e5e3] rounded-xl hover:border-zinc-400 hover:bg-[#fafaf9] cursor-pointer transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#eeece6] flex items-center justify-center mb-4 group-hover:bg-zinc-200 transition-colors">
                    <Edit3 className="w-6 h-6 text-[#78716c]" />
                  </div>
                  <h3 className="text-heading-sm text-[#292524] mb-2">Saisir les données manuellement</h3>
                  <p className="text-body text-[#78716c] leading-relaxed">Le rapport est sous vos yeux. Renseignez les informations à la main.</p>
                </div>
              </div>

              {/* Option 3: Pas encore de rapport (secondaire) */}
              <div
                onClick={() => handleCreateDossier(formData, 'dossier')}
                className="mt-4 px-4 py-3 border border-[#e7e5e3] rounded-lg hover:bg-[#fafaf9] cursor-pointer transition-all flex items-center gap-3 group"
              >
                <div className="w-8 h-8 rounded-lg bg-[#F8F7F5] flex items-center justify-center flex-shrink-0 group-hover:bg-[#eeece6] transition-colors">
                  <FileText className="w-4 h-4 text-[#a8a29e]" />
                </div>
                <div>
                  <h3 className="text-body-medium text-[#78716c] group-hover:text-[#44403c] transition-colors">Je n'ai pas encore le rapport d'expertise</h3>
                  <p className="text-caption text-[#a8a29e] leading-relaxed">Créer le dossier maintenant, le chiffrage pourra démarrer après.</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-zinc-100 flex justify-end gap-3">
              <button
                onClick={() => setCreationWizard(prev => ({ ...prev, step: 'infos' }))}
                className="px-4 py-2.5 text-body text-[#78716c] hover:text-[#44403c] hover:bg-[#eeece6] rounded-lg transition-colors"
              >
                Retour
              </button>
              <button
                onClick={() => setCreationWizard(null)}
                className="px-4 py-2.5 text-body text-[#78716c] hover:text-[#44403c] hover:bg-[#eeece6] rounded-lg transition-colors"
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
      <div className="w-14 bg-[#292524] flex flex-col items-center py-4 flex-shrink-0">
        {/* Logo Norma */}
        <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center mb-6">
          <span className="text-[#292524] font-bold text-heading-sm">N</span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom: Settings + User */}
        <div className="flex flex-col items-center gap-3">
          <button className="w-9 h-9 rounded-lg flex items-center justify-center text-[#78716c] hover:text-[#d6d3d1] hover:bg-[#44403c] transition-colors">
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
              className="flex items-center gap-2 px-4 py-2.5 bg-[#292524] text-white text-body-medium rounded-lg hover:bg-[#44403c] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nouveau dossier
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto px-8 pb-8">
          <div className="bg-white rounded-lg border border-[#e7e5e3]/60 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-100">
                  <th className="px-5 py-3 text-left" style={colHeaderStyle}>Référence</th>
                  <th className="px-5 py-3 text-left" style={colHeaderStyle}>Type de fait</th>
                  <th className="px-5 py-3 text-left" style={colHeaderStyle}>Date</th>
                  <th className="px-5 py-3 text-left" style={colHeaderStyle}>Dernier édit</th>
                  <th className="px-5 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e7e5e3]">
                {dossiers.map(dossier => (
                  <tr
                    key={dossier.id}
                    onClick={() => openDossier(dossier)}
                    className="bg-white hover:bg-[#fafaf9] cursor-pointer transition-colors group"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#eeece6] flex items-center justify-center flex-shrink-0">
                          <Folder className="w-4 h-4 text-[#a8a29e]" />
                        </div>
                        <span className="text-body-medium text-[#292524]">{dossier.reference}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-body text-[#78716c]">{dossier.typeFait}</td>
                    <td className="px-5 py-4 text-body text-[#78716c] tabular-nums">{dossier.date}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center flex-shrink-0">
                          <span className="text-counter text-white">{dossier.lastEditBy.split(' ').map(n => n[0]).join('')}</span>
                        </div>
                        <span className="text-body text-[#78716c]">{dossier.lastEditDate}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={(e) => { e.stopPropagation(); }}
                        className="p-1.5 rounded-lg text-[#d6d3d1] hover:text-[#78716c] hover:bg-[#eeece6] opacity-0 group-hover:opacity-100 transition-all"
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
    if (!currentLevel) return null;
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
  
  const parentInfo = getParentInfo(); // eslint-disable-line no-unused-vars

  // ========== ROUTING ==========
  if (currentPage === 'list') {
    return renderDossierListPage();
  }

  return (
    <div
      className="h-screen flex flex-col"
      style={{
        backgroundColor: '#F8F7F5',
        fontFamily: "'Inter', system-ui, sans-serif",
        fontSize: '13px',
        color: '#27272a'
      }}
    >
      {/* Horizontal split: left content column + right chat sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Top Bar + Content */}
        <div className="flex-1 flex flex-col overflow-hidden" style={{ backgroundColor: '#F8F7F5' }}>
          {renderTopBar()}
          {renderContentSubHeader()}
          <div className="flex-1 overflow-y-auto">
            <div className={`min-h-full flex flex-col ${currentLevel.type === 'dossier' ? 'px-8 pt-6 pb-8' : ''}`}>{renderContent()}</div>
          </div>
        </div>

        {/* Right: Edit Panel or Chat Sidebar (full viewport height) */}
        {editPanel ? renderEditPanel() : (chatSidebarOpen && renderChatSidebar())}
      </div>

      {renderAddModal()}
      {renderExportModal()}
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

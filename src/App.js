import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, ChevronDown, Folder, FileText, Calculator, Plus, X, Edit3, Pencil, Check, AlertTriangle, RefreshCw, Calendar, Landmark, Upload, Sparkles, Loader2, Search, HelpCircle, Eye, Trash2, FileQuestion, Download, Settings, AlertCircle, Receipt, ClipboardList, FileSpreadsheet, Activity, FileSearch, ListChecks, MoreHorizontal, MoreVertical, User, Copy, Plug2, GripVertical, CheckCircle2, Clipboard, Filter, ListFilter, ArrowDown, ArrowDownCircle, Scissors, Paperclip, ThumbsUp, ThumbsDown, RotateCcw, Lightbulb, ArrowUp, Square, FileMinus, Radical, PanelRightClose, CircleArrowUp, LayoutGrid, HeartPulse, Wallet, Scale, Brain, ShieldCheck, Table2, ExternalLink, FileUp, CirclePlus, Hand, Clock, TrendingUp } from 'lucide-react';
import ReasoningStepper, { ThinkingDots, PlatoDotGrid, CrudPill, DotCounter, STEP_COLORS, STEP_TYPE_CONFIG, BACKEND_TOOL_MAP } from './components/ReasoningStepper';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { JPPill, JPPopoverCard, DecisionDrawer, JPListing, JPAddStepper, SlashCommandPalette, JPSearchView } from './components/jp';
import useDemoCommands from './hooks/useDemoCommands';
import { getDecisionById } from './data/mockDecisions';
import { getTPScenario, TP_COMMAND_LIST, TP_COMMAND_MAP } from './data/tpScenarios';
import { BASELINE_DSA_LIGNES, BASELINE_DFT_LIGNES, BASELINE_PGPA_DATA, BASELINE_PGPF_DATA, BASELINE_FORM_POSTE_DATA } from './data/baselineData';

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
        { id: 'ipp', acronym: 'IP', label: 'Incidence professionnelle', enabled: false },
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
        { id: 'prp', label: 'Pertes de revenus des proches', enabled: false },
      ]},
      { title: 'Préjudices extra patrimoniaux', id: 'vi-expat', postes: [
        { id: 'pepe', label: 'Préjudices extra-patrimoniaux exceptionnels', enabled: false },
        { id: 'pai', label: "Préjudice d'angoisse et d'inquiétude", enabled: false },
        { id: 'pafv', label: "Préjudice d'accompagnement de fin de vie", enabled: false },
      ]},
    ]
  }
];

// ========== IV POSTE CONFIG — type-driven rendering ==========
const IV_POSTE_CONFIG = {
  pai:  { type: 'A', columns: ['victime', 'montant'] },
  pafv: { type: 'A', columns: ['victime', 'montant'] },
  pepe: { type: 'A', columns: ['victime', 'intitule', 'montant'] },
  fdp:  { type: 'B', columns: ['intitule', 'montant', 'piece'] },
  fo:   { type: 'C', columns: ['intitule', 'montant', 'payePar', 'piece'] },
  prp:  { type: 'D', columns: ['victime', 'lien', 'partIndividuelle', 'dureeIndemnisation', 'coeffCapitalisation', 'total'] },
};

// ========== BARÈMES & RÉFÉRENTIELS — DEFAULT DATA ==========
const DEFAULT_BAREMES = [
  {
    id: 'gdp_2025_prospective',
    label: 'GDP 2025 Prospective 0,50%',
    type: 'bareme',
    status: 'active',
    source: 'default',
    tableData: {
      columns: ['16 ans', '18 ans', '20 ans', '21 ans', '25 ans', '29 ans', '50 ans', '55 ans', '60 ans', '62 ans', '64 ans', '65 ans', '67 ans'],
      rows: [
        { header: '0', values: [0.000, 0.000, 0.000, 0.000, 0.000, 0.000, 0.000, 0.000, 0.000, 0.000, 0.000, 0.000, 0.000] },
        { header: '1', values: [0.998, 0.998, 0.998, 0.998, 0.998, 0.998, 0.998, 0.998, 0.998, 0.998, 0.998, 0.998, 0.998] },
        { header: '5', values: [4.951, 4.951, 4.951, 4.951, 4.951, 4.951, 4.951, 4.951, 4.951, 4.951, 4.951, 4.951, 4.951] },
        { header: '10', values: [9.778, 9.778, 9.778, 9.778, 9.778, 9.778, 9.778, 9.778, 9.778, 9.778, 9.778, 9.778, 9.778] },
        { header: '15', values: [14.486, 14.486, 14.486, 14.486, 14.486, 14.486, 14.486, 14.486, 14.486, 14.486, 14.486, 14.486, 14.486] },
        { header: '20', values: [19.075, 19.075, 19.075, 19.075, 19.075, 19.075, 19.075, 19.075, 19.075, 19.075, 19.075, 19.075, 19.075] },
        { header: '25', values: [23.550, 23.550, 23.550, 23.550, 23.550, 23.550, 23.550, 23.550, 23.550, 23.550, 23.550, 23.550, 23.550] },
        { header: '30', values: [27.915, 27.915, 27.915, 27.915, 27.915, 27.915, 27.915, 27.915, 27.915, 27.915, 27.915, 27.915, 27.915] },
        { header: '35', values: [32.173, 32.173, 32.173, 32.173, 32.173, 32.173, 32.173, 32.173, 32.173, 32.173, 32.173, 32.173, 32.173] },
        { header: '40', values: [36.327, 36.327, 36.327, 36.327, 36.327, 36.327, 36.327, 36.327, 36.327, 36.327, 36.327, 36.327, 36.327] },
        { header: '42', values: [37.984, 37.984, 37.984, 37.984, 37.984, 37.984, 37.984, 37.984, 37.984, 37.984, 37.984, 37.984, 37.984] },
        { header: '45', values: [40.381, 40.381, 40.381, 40.381, 40.381, 40.381, 40.381, 40.381, 40.381, 40.381, 40.381, 40.381, 40.381] },
        { header: '50', values: [44.338, 44.338, 44.338, 44.338, 44.338, 44.338, 44.338, 44.338, 44.338, 44.338, 44.338, 44.338, 44.338] },
        { header: 'Viager', values: [52.587, 50.644, 48.711, 47.748, 43.932, 40.181, 26.441, 22.981, 19.504, 17.822, 16.119, 15.283, 13.622] },
      ]
    }
  },
  {
    id: 'gdp_2025_stationnaire',
    label: 'GDP 2025 Stationnaire 0,50%',
    type: 'bareme',
    status: 'active',
    source: 'default',
    tableData: {
      columns: ['16 ans', '18 ans', '20 ans', '21 ans', '25 ans', '29 ans', '50 ans', '55 ans', '60 ans', '62 ans', '64 ans', '65 ans', '67 ans'],
      rows: [
        { header: '0', values: [0.000, 0.000, 0.000, 0.000, 0.000, 0.000, 0.000, 0.000, 0.000, 0.000, 0.000, 0.000, 0.000] },
        { header: '1', values: [0.995, 0.995, 0.995, 0.995, 0.995, 0.995, 0.995, 0.995, 0.995, 0.995, 0.995, 0.995, 0.995] },
        { header: '5', values: [4.889, 4.889, 4.889, 4.889, 4.889, 4.889, 4.889, 4.889, 4.889, 4.889, 4.889, 4.889, 4.889] },
        { header: '10', values: [9.554, 9.554, 9.554, 9.554, 9.554, 9.554, 9.554, 9.554, 9.554, 9.554, 9.554, 9.554, 9.554] },
        { header: '15', values: [14.005, 14.005, 14.005, 14.005, 14.005, 14.005, 14.005, 14.005, 14.005, 14.005, 14.005, 14.005, 14.005] },
        { header: '20', values: [18.251, 18.251, 18.251, 18.251, 18.251, 18.251, 18.251, 18.251, 18.251, 18.251, 18.251, 18.251, 18.251] },
        { header: '25', values: [22.300, 22.300, 22.300, 22.300, 22.300, 22.300, 22.300, 22.300, 22.300, 22.300, 22.300, 22.300, 22.300] },
        { header: '30', values: [26.160, 26.160, 26.160, 26.160, 26.160, 26.160, 26.160, 26.160, 26.160, 26.160, 26.160, 26.160, 26.160] },
        { header: '35', values: [29.839, 29.839, 29.839, 29.839, 29.839, 29.839, 29.839, 29.839, 29.839, 29.839, 29.839, 29.839, 29.839] },
        { header: '40', values: [33.344, 33.344, 33.344, 33.344, 33.344, 33.344, 33.344, 33.344, 33.344, 33.344, 33.344, 33.344, 33.344] },
        { header: 'Viager', values: [49.253, 47.451, 45.659, 44.767, 41.189, 37.682, 24.830, 21.609, 18.382, 16.825, 15.255, 14.482, 12.944] },
      ]
    }
  },
  {
    id: 'bcriv_2025',
    label: 'BCRIV 2025',
    type: 'bareme',
    status: 'active',
    source: 'default',
    tableData: {
      columns: ['16 ans', '18 ans', '20 ans', '21 ans', '25 ans', '55 ans', '60 ans', '62 ans', '64 ans', '65 ans', '67 ans', '68 ans'],
      rows: [
        { header: '0', values: [0.000, 0.000, 0.000, 0.000, 0.000, 0.000, 0.000, 0.000, 0.000, 0.000, 0.000, 0.000] },
        { header: '1', values: [0.997, 0.997, 0.997, 0.997, 0.997, 0.997, 0.997, 0.997, 0.997, 0.997, 0.997, 0.997] },
        { header: '5', values: [4.926, 4.926, 4.926, 4.926, 4.926, 4.926, 4.926, 4.926, 4.926, 4.926, 4.926, 4.926] },
        { header: '10', values: [9.681, 9.681, 9.681, 9.681, 9.681, 9.681, 9.681, 9.681, 9.681, 9.681, 9.681, 9.681] },
        { header: '20', values: [18.706, 18.706, 18.706, 18.706, 18.706, 18.706, 18.706, 18.706, 18.706, 18.706, 18.706, 18.706] },
        { header: '30', values: [27.128, 27.128, 27.128, 27.128, 27.128, 27.128, 27.128, 27.128, 27.128, 27.128, 27.128, 27.128] },
        { header: '40', values: [34.989, 34.989, 34.989, 34.989, 34.989, 34.989, 34.989, 34.989, 34.989, 34.989, 34.989, 34.989] },
        { header: 'Viager', values: [51.246, 49.354, 47.474, 46.537, 42.869, 22.349, 18.945, 17.342, 15.729, 14.929, 13.344, 12.557] },
      ]
    }
  },
  {
    id: 'oniam_2025',
    label: 'ONIAM 2025',
    type: 'bareme',
    status: 'active',
    source: 'default',
    tableData: {
      columns: ['25 ans', '62 ans', '67 ans'],
      rows: [
        { header: '0', values: [0.000, 0.000, 0.000] },
        { header: '1', values: [0.996, 0.996, 0.996] },
        { header: '5', values: [4.901, 4.901, 4.901] },
        { header: '10', values: [9.589, 9.589, 9.589] },
        { header: '20', values: [18.324, 18.324, 18.324] },
        { header: '30', values: [26.231, 26.231, 26.231] },
        { header: '40', values: [33.402, 33.402, 33.402] },
        { header: 'Viager', values: [41.543, 16.891, 13.010] },
      ]
    }
  },
  // Référentiels (used by SE, PEP, DFP)
  {
    id: 'cours-appel-2024',
    label: "Cour d'appel 2024",
    type: 'referentiel',
    status: 'active',
    source: 'default',
    tableData: {
      columns: ['Minimum', 'Moyenne', 'Maximum'],
      rows: [
        { header: '0,5/7', values: ['800 €', '1 200 €', '1 600 €'] },
        { header: '1/7', values: ['1 600 €', '2 500 €', '3 400 €'] },
        { header: '1,5/7', values: ['3 400 €', '4 700 €', '6 000 €'] },
        { header: '2/7', values: ['6 000 €', '8 500 €', '11 000 €'] },
        { header: '2,5/7', values: ['11 000 €', '14 500 €', '18 000 €'] },
        { header: '3/7', values: ['18 000 €', '24 000 €', '30 000 €'] },
        { header: '3,5/7', values: ['30 000 €', '37 500 €', '45 000 €'] },
        { header: '4/7', values: ['45 000 €', '52 500 €', '60 000 €'] },
        { header: '4,5/7', values: ['60 000 €', '70 000 €', '80 000 €'] },
        { header: '5/7', values: ['80 000 €', '95 000 €', '110 000 €'] },
        { header: '5,5/7', values: ['110 000 €', '135 000 €', '160 000 €'] },
        { header: '6/7', values: ['160 000 €', '200 000 €', '240 000 €'] },
        { header: '6,5/7', values: ['240 000 €', '290 000 €', '340 000 €'] },
        { header: '7/7', values: ['340 000 €', '390 000 €', '440 000 €'] },
      ]
    }
  },
  {
    id: 'cours-appel-2023',
    label: "Cour d'appel 2023",
    type: 'referentiel',
    status: 'active',
    source: 'default',
    tableData: {
      columns: ['Minimum', 'Moyenne', 'Maximum'],
      rows: [
        { header: '0,5/7', values: ['800 €', '1 100 €', '1 500 €'] },
        { header: '1/7', values: ['1 500 €', '2 300 €', '3 200 €'] },
        { header: '2/7', values: ['5 500 €', '7 800 €', '10 000 €'] },
        { header: '3/7', values: ['16 000 €', '22 000 €', '28 000 €'] },
        { header: '4/7', values: ['42 000 €', '49 000 €', '56 000 €'] },
        { header: '5/7', values: ['75 000 €', '88 000 €', '100 000 €'] },
        { header: '6/7', values: ['150 000 €', '185 000 €', '220 000 €'] },
        { header: '7/7', values: ['320 000 €', '370 000 €', '420 000 €'] },
      ]
    }
  },
  {
    id: 'mornet-2024',
    label: 'Référentiel Mornet 2024',
    type: 'referentiel',
    status: 'active',
    source: 'default',
    tableData: {
      columns: ['Minimum', 'Moyenne', 'Maximum'],
      rows: [
        { header: '1/7', values: ['1 500 €', '2 400 €', '3 300 €'] },
        { header: '2/7', values: ['5 800 €', '8 200 €', '10 500 €'] },
        { header: '3/7', values: ['17 000 €', '23 000 €', '29 000 €'] },
        { header: '4/7', values: ['43 000 €', '50 000 €', '57 000 €'] },
        { header: '5/7', values: ['76 000 €', '90 000 €', '105 000 €'] },
        { header: '6/7', values: ['155 000 €', '190 000 €', '225 000 €'] },
        { header: '7/7', values: ['330 000 €', '380 000 €', '430 000 €'] },
      ]
    }
  },
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

// ========== MOCK DIFF STORE ==========
// Pre-scripted diff events keyed by actionId. Structure matches future agent contract.
const MOCK_DIFF_STORE = {
  'extraction-info-dossier': [
    { actionId: 'extraction-info-dossier', zone: 'infos_dossier', entityId: 'nom', entityLabel: 'Nom', type: 'add', before: null, after: 'Martin', timestamp: 1 },
    { actionId: 'extraction-info-dossier', zone: 'infos_dossier', entityId: 'prenom', entityLabel: 'Prénom', type: 'add', before: null, after: 'Sophie', timestamp: 2 },
    { actionId: 'extraction-info-dossier', zone: 'infos_dossier', entityId: 'dateNaissance', entityLabel: 'Date de naissance', type: 'add', before: null, after: '14/03/1985', timestamp: 3 },
    { actionId: 'extraction-info-dossier', zone: 'infos_dossier', entityId: 'profession', entityLabel: 'Profession', type: 'add', before: null, after: 'Cadre commercial', timestamp: 4 },
    { actionId: 'extraction-info-dossier', zone: 'infos_dossier', entityId: 'dateAccident', entityLabel: 'Date accident', type: 'add', before: null, after: '05/06/2022', timestamp: 5 },
    { actionId: 'extraction-info-dossier', zone: 'infos_dossier', entityId: 'typeFait', entityLabel: 'Type', type: 'add', before: null, after: 'Accident de la voie publique', timestamp: 6 },
    { actionId: 'extraction-info-dossier', zone: 'infos_dossier', entityId: 'dateConsolidation', entityLabel: 'Date de consolidation', type: 'add', before: null, after: '15/01/2024', timestamp: 7 },
    { actionId: 'extraction-info-dossier', zone: 'infos_dossier', entityId: 'aipp', entityLabel: 'AIPP', type: 'add', before: null, after: '8%', timestamp: 8 },
  ],
  'extraction-poste-dft': [
    { actionId: 'extraction-poste-dft', zone: 'postes', entityId: 'dft', entityLabel: 'Déficit fonctionnel temporaire', type: 'add', before: null, after: '0 €', timestamp: 10 },
  ],
  'extraction-poste-dsa': [
    { actionId: 'extraction-poste-dsa', zone: 'postes', entityId: 'dsa', entityLabel: 'Dépenses de santé actuelles', type: 'add', before: null, after: '0 €', timestamp: 11 },
  ],
  'extraction-poste-pgpa': [
    { actionId: 'extraction-poste-pgpa', zone: 'postes', entityId: 'pgpa', entityLabel: 'Pertes de gains prof. actuels', type: 'add', before: null, after: '0 €', timestamp: 12 },
  ],
  'extraction-poste-pgpf': [
    { actionId: 'extraction-poste-pgpf', zone: 'postes', entityId: 'pgpf', entityLabel: 'Pertes de gains prof. futurs', type: 'add', before: null, after: '0 €', timestamp: 13 },
  ],
  'extraction-poste-se': [
    { actionId: 'extraction-poste-se', zone: 'postes', entityId: 'se', entityLabel: 'Souffrances endurées', type: 'add', before: null, after: '0 €', timestamp: 14 },
  ],
  'extraction-poste-pe': [
    { actionId: 'extraction-poste-pe', zone: 'postes', entityId: 'pe', entityLabel: 'Préjudice esthétique', type: 'add', before: null, after: '0 €', timestamp: 15 },
  ],
  'extraction-poste-aipp': [
    { actionId: 'extraction-poste-aipp', zone: 'postes', entityId: 'aipp', entityLabel: 'AIPP', type: 'add', before: null, after: '0 €', timestamp: 16 },
  ],
  'calc-dsa': [
    { actionId: 'calc-dsa', zone: 'postes', entityId: 'dsa-line-1', entityLabel: 'Hospitalisation CHU Bordeaux', type: 'add', fields: [
      { key: 'label', label: 'Libellé', after: 'Hospitalisation CHU Bordeaux' },
      { key: 'type', label: 'Type', after: 'Hospitalisation' },
      { key: 'date', label: 'Date', after: '05/06/2022' },
      { key: 'montant', label: 'Montant', after: '4 500 €' },
      { key: 'dejaRembourse', label: 'Déjà remboursé', after: '4 200 €' },
    ], timestamp: 20 },
    { actionId: 'calc-dsa', zone: 'postes', entityId: 'dsa-line-2', entityLabel: 'Kinésithérapie (24 séances)', type: 'edit', fields: [
      { key: 'montant', label: 'Montant', before: '960 €', after: '1 280 €' },
      { key: 'dejaRembourse', label: 'Déjà remboursé', before: '720 €', after: '960 €' },
      { key: 'date', label: 'Date', before: '10/07/2022', after: '15/07/2022' },
    ], timestamp: 21 },
    { actionId: 'calc-dsa', zone: 'postes', entityId: 'dsa-line-3', entityLabel: 'IRM genou droit', type: 'add', fields: [
      { key: 'label', label: 'Libellé', after: 'IRM genou droit' },
      { key: 'type', label: 'Type', after: 'Examen' },
      { key: 'date', label: 'Date', after: '20/06/2022' },
      { key: 'montant', label: 'Montant', after: '320 €' },
      { key: 'dejaRembourse', label: 'Déjà remboursé', after: '280 €' },
    ], timestamp: 22 },
    { actionId: 'calc-dsa', zone: 'postes', entityId: 'dsa-line-4', entityLabel: 'Consultation Dr. Dupont (doublon)', type: 'delete', fields: [
      { key: 'label', label: 'Libellé', before: 'Consultation Dr. Dupont' },
      { key: 'date', label: 'Date', before: '12/06/2022' },
      { key: 'montant', label: 'Montant', before: '55 €' },
    ], timestamp: 23 },
    { actionId: 'calc-dsa', zone: 'postes', entityId: 'dsa-line-5', entityLabel: 'Médicaments', type: 'add', fields: [
      { key: 'label', label: 'Libellé', after: 'Médicaments (antalgiques, anti-inflammatoires)' },
      { key: 'type', label: 'Type', after: 'Pharmacie' },
      { key: 'date', label: 'Date', after: '05/06/2022' },
      { key: 'montant', label: 'Montant', after: '87,50 €' },
      { key: 'dejaRembourse', label: 'Déjà remboursé', after: '65 €' },
    ], timestamp: 24 },
    { actionId: 'calc-dsa', zone: 'postes', entityId: 'dsa-total', entityLabel: 'Total DSA', type: 'edit', fields: [
      { key: 'montant', label: 'Montant', before: '0 €', after: '6 132,50 €' },
    ], timestamp: 25 },
    { actionId: 'calc-dsa', zone: 'postes', entityId: 'dsa-revalo', entityLabel: 'Revalorisation activée', type: 'add', paramKey: 'revaloriser', fields: [
      { key: 'etat', label: 'État', after: 'On', badge: 'success' },
      { key: 'valeur', label: 'Valeur', after: 'IPC Annuel' },
    ], timestamp: 26 },
  ],
  'calc-dft': [
    { actionId: 'calc-dft', zone: 'postes', entityId: 'dft-line-1', entityLabel: 'Hospitalisation initiale', type: 'add', fields: [
      { key: 'debut', label: 'Début', after: '05/06/2022' },
      { key: 'fin', label: 'Fin', after: '12/06/2022' },
      { key: 'jours', label: 'Jours', after: '8' },
      { key: 'taux', label: 'Taux', after: '100%' },
      { key: 'montant', label: 'Montant', after: '224 €' },
    ], timestamp: 30 },
    { actionId: 'calc-dft', zone: 'postes', entityId: 'dft-line-2', entityLabel: 'Chirurgie + soins intensifs', type: 'add', fields: [
      { key: 'debut', label: 'Début', after: '13/06/2022' },
      { key: 'fin', label: 'Fin', after: '18/06/2022' },
      { key: 'jours', label: 'Jours', after: '6' },
      { key: 'taux', label: 'Taux', after: '100%' },
      { key: 'montant', label: 'Montant', after: '168 €' },
    ], timestamp: 31 },
    { actionId: 'calc-dft', zone: 'postes', entityId: 'dft-line-3', entityLabel: 'Alitement strict post-op.', type: 'add', fields: [
      { key: 'debut', label: 'Début', after: '19/06/2022' },
      { key: 'fin', label: 'Fin', after: '01/07/2022' },
      { key: 'jours', label: 'Jours', after: '13' },
      { key: 'taux', label: 'Taux', after: '100%' },
      { key: 'montant', label: 'Montant', after: '364 €' },
    ], timestamp: 32 },
    { actionId: 'calc-dft', zone: 'postes', entityId: 'dft-line-4', entityLabel: 'Convalescence post-op.', type: 'edit', fields: [
      { key: 'fin', label: 'Fin', before: '30/08/2022', after: '15/09/2022' },
      { key: 'jours', label: 'Jours', before: '60', after: '76' },
      { key: 'montant', label: 'Montant', before: '840 €', after: '1 064 €' },
    ], timestamp: 33 },
    { actionId: 'calc-dft', zone: 'postes', entityId: 'dft-line-5', entityLabel: 'Rééducation active', type: 'add', fields: [
      { key: 'debut', label: 'Début', after: '16/09/2022' },
      { key: 'fin', label: 'Fin', after: '16/12/2022' },
      { key: 'jours', label: 'Jours', after: '92' },
      { key: 'taux', label: 'Taux', after: '40%' },
      { key: 'montant', label: 'Montant', after: '1 030 €' },
    ], timestamp: 34 },
    { actionId: 'calc-dft', zone: 'postes', entityId: 'dft-line-6', entityLabel: "Rééducation d'entretien (doublon)", type: 'delete', fields: [
      { key: 'debut', label: 'Début', before: '17/12/2022' },
      { key: 'fin', label: 'Fin', before: '19/03/2023' },
      { key: 'taux', label: 'Taux', before: '25%' },
      { key: 'montant', label: 'Montant', before: '644 €' },
    ], timestamp: 35 },
    { actionId: 'calc-dft', zone: 'postes', entityId: 'dft-line-7', entityLabel: 'Gêne résiduelle pré-conso.', type: 'add', fields: [
      { key: 'debut', label: 'Début', after: '20/03/2023' },
      { key: 'fin', label: 'Fin', after: '15/01/2024' },
      { key: 'jours', label: 'Jours', after: '301' },
      { key: 'taux', label: 'Taux', after: '15%' },
      { key: 'montant', label: 'Montant', after: '1 264 €' },
    ], timestamp: 36 },
    { actionId: 'calc-dft', zone: 'postes', entityId: 'dft-total', entityLabel: 'Total DFT', type: 'edit', fields: [
      { key: 'montant', label: 'Montant', before: '0 €', after: '5 385 €' },
    ], timestamp: 37 },
    { actionId: 'calc-dft', zone: 'postes', entityId: 'dft-revalo', entityLabel: 'Revalorisation désactivée', type: 'delete', paramKey: 'base-journaliere-dft', fields: [
      { key: 'etat', label: 'État', before: 'On', after: 'Off' },
    ], timestamp: 38 },
  ],
  'calc-pgpa': [
    { actionId: 'calc-pgpa', zone: 'postes', entityId: 'pgpa-rev-1', entityLabel: 'Salaire net 2022', type: 'add', fields: [
      { key: 'annee', label: 'Année', after: '2022' },
      { key: 'montant', label: 'Montant', after: '32 400 €' },
      { key: 'revalorise', label: 'Revalorisé', after: '33 696 €' },
    ], timestamp: 40 },
    { actionId: 'calc-pgpa', zone: 'postes', entityId: 'pgpa-rev-2', entityLabel: 'Salaire net 2021', type: 'edit', fields: [
      { key: 'montant', label: 'Montant', before: '29 800 €', after: '31 200 €' },
      { key: 'revalorise', label: 'Revalorisé', before: '31 886 €', after: '33 384 €' },
    ], timestamp: 41 },
    { actionId: 'calc-pgpa', zone: 'postes', entityId: 'pgpa-rev-3', entityLabel: 'Prime exceptionnelle 2021 (non récurrent)', type: 'delete', fields: [
      { key: 'annee', label: 'Année', before: '2021' },
      { key: 'montant', label: 'Montant', before: '1 500 €' },
    ], timestamp: 42 },
    { actionId: 'calc-pgpa', zone: 'postes', entityId: 'pgpa-rev-4', entityLabel: 'Prime annuelle 2022', type: 'add', fields: [
      { key: 'annee', label: 'Année', after: '2022' },
      { key: 'montant', label: 'Montant', after: '2 400 €' },
      { key: 'revalorise', label: 'Revalorisé', after: '2 496 €' },
    ], timestamp: 42 },
    { actionId: 'calc-pgpa', zone: 'postes', entityId: 'pgpa-rp-1', entityLabel: 'Maintien partiel salaire', type: 'add', fields: [
      { key: 'tiers', label: 'Tiers', after: 'Employeur' },
      { key: 'periode', label: 'Période', after: 'Mars - Juin 2023' },
      { key: 'montant', label: 'Montant', after: '8 500 €' },
    ], timestamp: 43 },
    { actionId: 'calc-pgpa', zone: 'postes', entityId: 'pgpa-ij-1', entityLabel: 'IJ Sécurité sociale', type: 'add', fields: [
      { key: 'tiers', label: 'Tiers', after: 'CPAM' },
      { key: 'periode', label: 'Période', after: 'Mars 2023 - Sept 2024' },
      { key: 'montant', label: 'Montant', after: '11 650 €' },
    ], timestamp: 44 },
    { actionId: 'calc-pgpa', zone: 'postes', entityId: 'pgpa-ij-2', entityLabel: 'IJ Prévoyance', type: 'add', fields: [
      { key: 'tiers', label: 'Tiers', after: 'AG2R' },
      { key: 'periode', label: 'Période', after: 'Mars 2023 - Sept 2024' },
      { key: 'montant', label: 'Montant', after: '4 850 €' },
    ], timestamp: 45 },
    { actionId: 'calc-pgpa', zone: 'postes', entityId: 'pgpa-total', entityLabel: 'Total PGPA', type: 'edit', fields: [
      { key: 'montant', label: 'Montant', before: '0 €', after: '6 700 €' },
    ], timestamp: 46 },
    { actionId: 'calc-pgpa', zone: 'postes', entityId: 'pgpa-revalo', entityLabel: 'Revalorisation modifiée', type: 'edit', paramKey: 'revaloriser-pgpa', fields: [
      { key: 'indice', label: 'Indice', before: 'IPC Annuel', after: 'IPC Mensuel' },
    ], timestamp: 47 },
  ],
  'calc-pgpf': [
    { actionId: 'calc-pgpf', zone: 'postes', entityId: 'pgpf-reprise', entityLabel: 'Salaire reprise mi-temps', type: 'add', fields: [
      { key: 'tiers', label: 'Tiers', after: 'Employeur' },
      { key: 'periode', label: 'Période', after: 'Sept 2024 - Jan 2025' },
      { key: 'montant', label: 'Montant', after: '4 800 €' },
    ], timestamp: 50 },
    { actionId: 'calc-pgpf', zone: 'postes', entityId: 'pgpf-ij', entityLabel: 'IJ CPAM mi-temps thérapeutique', type: 'add', fields: [
      { key: 'tiers', label: 'Tiers', after: 'CPAM' },
      { key: 'periode', label: 'Période', after: 'Sept 2024 - Jan 2025' },
      { key: 'montant', label: 'Montant', after: '3 200 €' },
    ], timestamp: 51 },
    { actionId: 'calc-pgpf', zone: 'postes', entityId: 'pgpf-cap', entityLabel: 'Capitalisation viagère', type: 'add', fields: [
      { key: 'perteAnnuelle', label: 'Perte annuelle', after: '9 450 €' },
      { key: 'age', label: 'Âge consolidation', after: '42 ans' },
      { key: 'bareme', label: 'Barème', after: 'Gazette du Palais 2025 (0,5%)' },
      { key: 'coefficient', label: 'Coefficient', after: '24,5' },
      { key: 'montant', label: 'Capital', after: '231 525 €' },
    ], timestamp: 52 },
    { actionId: 'calc-pgpf', zone: 'postes', entityId: 'pgpf-tp-1', entityLabel: 'Rente CPAM', type: 'add', fields: [
      { key: 'tiers', label: 'Tiers', after: 'CPAM' },
      { key: 'renteAnnuelle', label: 'Rente annuelle', after: '3 600 €' },
      { key: 'montantCapitalise', label: 'Capitalisé', after: '88 200 €' },
    ], timestamp: 53 },
    { actionId: 'calc-pgpf', zone: 'postes', entityId: 'pgpf-tp-2', entityLabel: 'Rente prévoyance', type: 'add', fields: [
      { key: 'tiers', label: 'Tiers', after: 'AG2R' },
      { key: 'renteAnnuelle', label: 'Rente annuelle', after: '1 800 €' },
      { key: 'montantCapitalise', label: 'Capitalisé', after: '44 100 €' },
    ], timestamp: 54 },
    { actionId: 'calc-pgpf', zone: 'postes', entityId: 'pgpf-total', entityLabel: 'Total PGPF', type: 'edit', fields: [
      { key: 'montant', label: 'Montant', before: '0 €', after: '231 525 €' },
    ], timestamp: 55 },
    { actionId: 'calc-pgpf', zone: 'postes', entityId: 'pgpf-capitaliser', entityLabel: 'Capitalisation modifiée', type: 'edit', paramKey: 'capitaliser-pgpf', fields: [
      { key: 'bareme', label: 'Barême', before: 'IPC Mensuel', after: 'IPC Annuel' },
      { key: 'finArrerage', label: 'Fin arrérage', before: 'IPC Mensuel', after: 'IPC Annuel' },
    ], timestamp: 56 },
  ],
  'calc-se': [
    { actionId: 'calc-se', zone: 'postes', entityId: 'se-eval', entityLabel: 'Souffrances endurées', type: 'edit', fields: [
      { key: 'referentiel', label: 'Référentiel', after: 'Cour d\'appel 2024' },
      { key: 'cotation', label: 'Cotation', after: '4/7' },
      { key: 'montant', label: 'Montant', before: '0 €', after: '15 000 €' },
    ], timestamp: 60 },
  ],
  'calc-dfp': [
    { actionId: 'calc-dfp', zone: 'postes', entityId: 'dfp-eval', entityLabel: 'Déficit fonctionnel permanent', type: 'edit', fields: [
      { key: 'referentiel', label: 'Référentiel', after: 'Cour d\'appel 2024' },
      { key: 'age', label: 'Âge', after: '42 ans' },
      { key: 'taux', label: 'Taux', after: '18%' },
      { key: 'pointBase', label: 'Point', after: '1 500 €' },
      { key: 'montant', label: 'Montant', before: '0 €', after: '27 000 €' },
    ], timestamp: 61 },
  ],
  'calc-pep': [
    { actionId: 'calc-pep', zone: 'postes', entityId: 'pep-eval', entityLabel: 'Préjudice esthétique permanent', type: 'edit', fields: [
      { key: 'referentiel', label: 'Référentiel', after: 'Cour d\'appel 2024' },
      { key: 'cotation', label: 'Cotation', after: '3/7' },
      { key: 'montant', label: 'Montant', before: '0 €', after: '4 500 €' },
    ], timestamp: 62 },
  ],
};

/* ============================================================================
 * PARAMETER PILL — SPEC
 * ============================================================================
 *
 * A parameter pill is a compact, rounded-full chip displayed in a chiffrage
 * settings row. It represents a single hypothesis/parameter (e.g. Revaloriser,
 * Capitaliser, Base journalière). When an AI diff targets a parameter, the
 * pill transforms to show the pending change inline, with embedded
 * accept / reject buttons.
 *
 * ── ANATOMY ──────────────────────────────────────────────────────────────────
 *
 *  ┌─────────────────────────────────────────────────────────────────────┐
 *  │  [◆]  ⊙  Label   Value / ~~old~~ → new          [ ✓ ] [ ✗ ]     │
 *  └─────────────────────────────────────────────────────────────────────┘
 *   diamond icon label   value content                accept  reject
 *
 *  • Diamond (◆): 6×6 rotated square. Only shown when a diff is pending.
 *    Color encodes the diff TYPE (green / orange / red).
 *  • Icon: CircleArrowUp, 14×14, always present.
 *  • Label: parameter name, font-weight 500.
 *  • Value content: plain text when no diff; strikethrough old → new when diff.
 *  • Accept / Reject: 20×20 rounded-full circles, only when diff pending.
 *
 * ── COLOR MODEL ──────────────────────────────────────────────────────────────
 *
 *  Pill background/border = TARGET STATE of the parameter (where it's going):
 *    • ON  → info (blue)   — bg #eef3fa, border #aabcd5, text #1e3a8a
 *    • OFF → neutral (gray) — bg transparent, border #d6d3d1, text #78716c
 *
 *  Diamond color = DIFF TYPE (what kind of change):
 *    • add    → green  #059669   (param was OFF, turning ON)
 *    • edit   → orange #bd6c1a   (param stays ON, value changed)
 *    • delete → red    #991b1b   (param was ON, turning OFF)
 *
 *  Summary table:
 *  ┌──────────┬──────────────┬──────────────┬────────────────────────────────┐
 *  │ Diff     │ Pill color   │ Diamond      │ Value content                  │
 *  ├──────────┼──────────────┼──────────────┼────────────────────────────────┤
 *  │ add      │ info (blue)  │ green ◆      │ new value(s)                   │
 *  │ edit     │ info (blue)  │ orange ◆     │ ~~old~~ → new                  │
 *  │ delete   │ neutral (gray)│ red ◆       │ ~~On~~ → Off                   │
 *  │ (none)   │ info / neutral│ —           │ current value(s)               │
 *  │ accepted │ info (blue)  │ —            │ accepted value (no buttons)     │
 *  │ rejected │ info / neutral│ —           │ original value (no buttons)     │
 *  └──────────┴──────────────┴──────────────┴────────────────────────────────┘
 *
 * ── ACCEPT / REJECT BUTTONS ─────────────────────────────────────────────────
 *
 *  Neutral by default to avoid "christmas tree" effect alongside colored pills.
 *  • Rest: white bg, border #d6d3d1, icon #78716c (stone)
 *  • Hover accept: bg #ecfdf5, border #a5c9b7 (subtle green hint)
 *  • Hover reject: bg #fef2f2, border #cf9d9d (subtle red hint)
 *  Same design used in artifact card diff rows for consistency.
 *
 * ── STATE TRANSITIONS ────────────────────────────────────────────────────────
 *
 *  On accept:
 *    • Diff marked approved → diamond + buttons disappear
 *    • add:    enabledParams[key] → true,  pill becomes blue with new value
 *    • edit:   value updates to new,       pill stays blue
 *    • delete: enabledParams[key] → false, pill becomes gray (OFF)
 *
 *  On reject:
 *    • Diff marked rejected → diamond + buttons disappear
 *    • Pill reverts to its original state (value + color unchanged)
 *
 * ── VALUE TYPES ──────────────────────────────────────────────────────────────
 *
 *  • Boolean toggle: "On" / "Off" (or label-only when off)
 *  • Single select:  "IPC Annuel", "SMIC Horaire"
 *  • Numeric:        "28 €/j"
 *  • Multi-value:    "IPC Annuel, XX, XX ans" (concatenated)
 *  • Multi-field diff: "~~IPC Mensuel~~ → Annuel, ~~62~~ → 64 ans"
 *
 * ── EDGE CASE: SUB-FIELD DELETION ────────────────────────────────────────────
 *
 *  When a parameter stays ON but one sub-field is removed (e.g. Capitaliser
 *  keeps Barême but drops Fin arrérage), this is an edit (orange diamond)
 *  on a blue pill. The deleted sub-field renders as strikethrough without
 *  a replacement: "Barême IPC Annuel, ~~Fin arrérage 64 ans~~".
 *
 * ── PILL SCHEMES (5 variants) ────────────────────────────────────────────────
 *
 *  Used by pills AND UI kit specimens. Only info + neutral are used for
 *  live pills; success / warning / destructive are reserved for badges
 *  and future extensions.
 *
 * ── IMPLEMENTATION ───────────────────────────────────────────────────────────
 *
 *  Helper:       renderParamPill({ paramKey, label, values, enabled, onClick })
 *  Diff lookup:  getParamDiff(paramKey) — finds matching pending diff
 *  Wire format:  diff.paramKey must match enabledParams key
 *  Pill shape:   rounded-full, px-3 py-1.5, text-xs font-medium, border
 *  Diamond:      w-1.5 h-1.5, rotate(45deg), borderRadius 0.5px
 *  Buttons:      w-5 h-5, rounded-full, Check/X icons w-3 h-3 strokeWidth 2.5
 *
 * ========================================================================= */
const PILL_SCHEMES = {
  info:        { bg: '#eef3fa', border: '#aabcd5', text: '#1e3a8a' },
  neutral:     { bg: 'transparent', border: '#d6d3d1', text: '#78716c' },
  success:     { bg: '#dcfce7', border: '#a7f3d0', text: '#064e3b' },
  warning:     { bg: '#f9ecd6', border: '#eeb97e', text: '#855b31' },
  destructive: { bg: 'transparent', border: '#fecaca', text: '#7f1d1d' },
};
const DIAMOND_COLORS = { add: '#059669', edit: '#bd6c1a', delete: '#991b1b' };

/* ============================================================================
 * TABLE ROW DIFF — SPEC
 * ============================================================================
 *
 * Figma ref: node 1324:17669
 *
 * ── LEFT STRIP ───────────────────────────────────────────────────────────────
 *
 *  4px wide, absolute left edge, full row height.
 *  Solid COLOR background.
 *    • add    → green  #059669
 *    • edit   → orange #bd6c1a
 *    • delete → red    #991b1b
 *
 * ── ROW TYPES ────────────────────────────────────────────────────────────────
 *
 *  ADD:    Green strip. All values shown normally. White bg.
 *  EDIT:   Orange strip. Changed cells stack old→new vertically:
 *            • Old: 12px line-through #a8a29e (small, above)
 *            • New: 14px medium #292524 (bold, below)
 *          Unchanged cells render normally.
 *  DELETE: Red strip. Dashed icon (white bg, #a8a29e border, 0.4 opacity).
 *          All text: 14px line-through #a8a29e. NO row-level opacity.
 *  MIX:    Orange strip (treated as edit). Individual cells can be:
 *            • Edited (stacked old→new)
 *            • Deleted (line-through, no replacement)
 *            • Unchanged (normal)
 *  NORMAL: No strip. Standard rendering.
 *
 * ── CELL-LEVEL DIFF (EDIT ROWS) ─────────────────────────────────────────────
 *
 *  Each cell checks `l.oldValues[field]` to determine if it changed.
 *  If old value exists → render stacked: oldVal above, newVal below.
 *  If no old value → render current value normally (unchanged cell).
 *
 *  Special cases:
 *    • Badge diff: old badge with line-through (secondary bg) → new badge
 *      (success bg). Example: ~~50%~~ → 100%
 *    • Deleted cell in edit row: line-through #a8a29e, no new value.
 *    • Reimbursement cell: shows the full "250€ · ⊙ 255€" pattern,
 *      with old values stacked above.
 *
 * ── DOC ICON ─────────────────────────────────────────────────────────────────
 *
 *  Normal:  Blue bg (#DFE8F5), counter badge (#1e3a8a bg)
 *  Empty:   Dashed border #e7e5e3, gray icon
 *  Deleted: Dashed border #a8a29e, white bg, icon at 0.4 opacity
 *
 * ── ACCEPT / REJECT ──────────────────────────────────────────────────────────
 *
 *  20×20 rounded-full, neutral at rest (white bg, #d6d3d1 border).
 *  Hover: accept → #ecfdf5 bg + #a5c9b7 border
 *         reject → #fef2f2 bg + #cf9d9d border
 *  Appear on row hover (opacity 0→1 transition).
 *
 * ========================================================================= */
const ROW_DIFF_COLORS = { add: '#059669', edit: '#bd6c1a', delete: '#991b1b' };

const ZONE_LABELS = { infos_dossier: 'Info dossier', postes: 'Postes', pieces: 'Pièces' };
const posteIconMap = {
  dsa: 'HeartPulse',       // Dépenses de santé → health
  pgpa: 'Wallet',          // Pertes de gains → income/wallet
  dft: 'Activity',         // Déficit fonctionnel temporaire → body function
  fda: 'Receipt',          // Frais divers → expenses
  dsf: 'HeartPulse',       // Dépenses de santé futures → health
  pgpf: 'Wallet',          // Pertes de gains futurs → income
  dfp: 'Brain',            // Déficit fonctionnel permanent → permanent impairment
  ipp: 'Scale',            // Incidence professionnelle → balance/justice
};

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

// Reset localStorage via ?reset URL param
if (window.location.search.includes('reset')) {
  localStorage.clear();
  window.location.replace(window.location.pathname);
}

export default function App() {

  // ========== LOCALSTORAGE PERSISTENCE ==========
  const LS_GLOBAL = 'plato_global';
  const LS_DOSSIER = 'plato_dossier_';
  const lsSave = (key, data) => { try { localStorage.setItem(key, JSON.stringify(data)); } catch (e) { console.warn('LS save:', e); } };
  const lsLoad = (key) => { try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : null; } catch (e) { return null; } };
  const isInitialLoad = useRef(true);

  // ========== STATE ==========
  const [currentPage, setCurrentPage] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const page = params.get('page');
    if (page === 'reasoning-demo') return 'reasoning-demo';
    if (page === 'components') return 'components';
    const hash = window.location.hash.split('&')[0].replace('#', '');
    if (hash === 'reasoning-demo') return 'reasoning-demo';
    if (hash === 'components') return 'components';
    return 'list';
  }); // 'list' | 'dossier' | 'components'
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
  const [piecesFilter, setPiecesFilter] = useState({ types: [], search: '' });
  const [piecesTypeMenuOpen, setPiecesTypeMenuOpen] = useState(false);
  const [, setShowAddPiecesZone] = useState(false);
  const [piecesTabDragOver, setPiecesTabDragOver] = useState(false);
  const [reorderDrag, setReorderDrag] = useState(null); // { pieceId, ghostX, ghostY }
  const [reorderDropIdx, setReorderDropIdx] = useState(null);
  const [manualReorder, setManualReorder] = useState(false);
  const [piecesSortMode, setPiecesSortMode] = useState('chrono'); // 'chrono' | 'manuel'
  const [piecesManualOrder, setPiecesManualOrder] = useState(null);
  const [piecesDragState, setPiecesDragState] = useState({ dragging: null, over: null });
  const [piecesMoreMenu, setPiecesMoreMenu] = useState(false);
  const [showReorderHint, setShowReorderHint] = useState(false);
  const [rapportBannerDismissed, setRapportBannerDismissed] = useState(false);
  const [chatSidebarOpen, setChatSidebarOpen] = useState(true);
  const [chatBlocked, setChatBlocked] = useState(false);
  const [chatWidth, setChatWidth] = useState(408);
  const chatResizing = useRef(false);
  const [posteSearchOpen, setPosteSearchOpen] = useState(false);
  const [posteSearchQuery, setPosteSearchQuery] = useState('');
  const [posteSearchVictimeFilter, setPosteSearchVictimeFilter] = useState(null); // null = VD, or victimeId for IV
  const [editingPieceField, setEditingPieceField] = useState(null); // null | { pieceId, field }
  const [toastMessage, setToastMessage] = useState(null); // null | string
  const [activeDiffs, setActiveDiffs] = useState([]); // Array of diff events pushed by mock actions
  // Rejected diffs stay visible (strikethrough + muted) for review
  const [pickerOpen, setPickerOpen] = useState(null); // null | 'dft' | 'dsa' | 'pgpa-revenu-ref' | 'pgpa-revenu-percu' | 'pgpa-ij'
  const [pickerSelected, setPickerSelected] = useState([]); // array of piece IDs (multi-select)
  const [pickerSearch, setPickerSearch] = useState('');
  const [posteExtracting, setPosteExtracting] = useState(null); // null | { posteType, totalDocs, extractedCount, docIds: [] }
  const processingTimeouts = useRef([]);
  const [activeParamChip, setActiveParamChip] = useState(null); // which param chip config is expanded
  const [enabledParams, setEnabledParams] = useState({ 'revaloriser': true, 'revaloriser-pgpa': true, 'capitaliser-pgpf': true, 'base-journaliere-dft': true, 'revaloriser-se': true, 'revaloriser-pep': true, 'revaloriser-dfp': true }); // toggle on/off per param
  const [totalExpanded, setTotalExpanded] = useState({}); // { [posteId]: boolean }
  const [dossierPostes, setDossierPostes] = useState(['dsa', 'pgpa', 'dft', 'pgpf', 'se', 'dfp', 'pep']); // IDs of postes added to this dossier
  const [ivDossierPostes, setIvDossierPostes] = useState(['pai', 'pafv', 'pepe', 'fdp', 'fo', 'prp']); // IDs of IV postes enabled in this dossier
  const [ivPosteData, setIvPosteData] = useState({
    // Type A — Préjudice d'affection
    pai: { bareme: 'mornet-2024', lignes: [
      { victimeId: 'vi-1', montant: 25000, pieceIds: [] },
      { victimeId: 'vi-2', montant: 15000, pieceIds: [] },
      { victimeId: 'vi-3', montant: 15000, pieceIds: [] },
    ]},
    // Type A — Préjudice d'accompagnement de fin de vie
    pafv: { bareme: 'cours-appel-2024', lignes: [
      { victimeId: 'vi-1', montant: 8000, pieceIds: [] },
      { victimeId: 'vi-2', montant: 5000, pieceIds: [] },
      { victimeId: 'vi-3', montant: 5000, pieceIds: [] },
    ]},
    // Type A + intitulé — Préjudices extra-patrimoniaux exceptionnels
    pepe: { bareme: '', lignes: [
      { victimeId: 'vi-1', montant: 10000, pieceIds: [], intitule: 'Syndrome de stress post-traumatique sévère' },
    ]},
    // Type B — Frais divers des proches (grouped by victim)
    fdp: { lignes: [
      { id: 'fdp-1', victimeId: 'vi-1', montant: 1200, pieceIds: ['p-1'], intitule: 'Déplacements hôpital (48 trajets)', source: 'ocr' },
      { id: 'fdp-2', victimeId: 'vi-1', montant: 2800, pieceIds: ['p-2'], intitule: 'Hébergement proche hôpital', source: 'ocr' },
      { id: 'fdp-3', victimeId: 'vi-1', montant: 450, pieceIds: [], intitule: 'Repas sur place' },
      { id: 'fdp-4', victimeId: 'vi-2', montant: 600, pieceIds: [], intitule: 'Déplacements' },
      { id: 'fdp-5', victimeId: 'vi-3', montant: 600, pieceIds: [], intitule: 'Déplacements' },
    ]},
    // Type C — Frais d'obsèques (shared expenses with attributions)
    fo: { lignes: [
      { id: 'fo-1', label: 'Cercueil et préparation', totalAmount: 3200, pieceIds: ['p-7'], attributions: [{ viId: 'vi-1', amount: 1600 }, { viId: 'vi-3', amount: 1600 }] },
      { id: 'fo-2', label: 'Cérémonie religieuse', totalAmount: 800, pieceIds: [], attributions: [{ viId: 'vi-1', amount: 800 }] },
      { id: 'fo-3', label: 'Concession funéraire', totalAmount: 2100, pieceIds: [], attributions: [{ viId: 'vi-1', amount: 714 }, { viId: 'vi-2', amount: 693 }, { viId: 'vi-3', amount: 693 }] },
      { id: 'fo-4', label: 'Marbrerie et gravure', totalAmount: 1450, pieceIds: [], attributions: [{ viId: 'vi-3', amount: 1450 }] },
      { id: 'fo-5', label: 'Transport du corps', totalAmount: 680, pieceIds: [], attributions: [{ viId: 'vi-1', amount: 680 }] },
    ]},
    // Type D — Pertes de revenus des proches (shared foyer + per-VI ventilation)
    prp: { lignes: [
      { victimeId: 'vi-1', partIndividuelle: 50, dureeIndemnisation: 'Viager', anneesEchues: 3, mode: 'capitalisation', coeffCapitalisation: 20 },
      { victimeId: 'vi-2', partIndividuelle: 25, dureeIndemnisation: "Jusqu'à 25 ans (7 ans)", anneesEchues: 3, mode: 'capitalisation', coeffCapitalisation: 6.5 },
      { victimeId: 'vi-3', partIndividuelle: 25, dureeIndemnisation: "Jusqu'à 25 ans (12 ans)", anneesEchues: 3, mode: 'capitalisation', coeffCapitalisation: 10 },
    ]},
  }); // { posteId: { lignes: [...] } }
  const [ivPosteSharedData, setIvPosteSharedData] = useState({
    prp: {
      victimeDecedee: true,
      revenuRefLignes: [
        { id: 'prp-rev-1', source: 'Bulletin de salaire Déc 2022', periode: 'Déc 2022', netMensuel: 4000, pieceIds: [] },
        { id: 'prp-rev-2', source: 'Avis d\'imposition 2022', periode: '2022', netMensuel: 4000, pieceIds: ['p-3'] },
      ],
      autoConsommationMethod: 'percentage',
      revenuConjoint: 24000,
      partAutoConsommation: 25,
      nombreParts: 3,
      revenuActuel: 1000,
    },
  }); // { [posteId]: { ... } }
  const [ivOverviewExpanded, setIvOverviewExpanded] = useState({}); // { [posteId]: boolean } — UI only
  const [ivViewMode, setIvViewMode] = useState('poste'); // 'poste' | 'victime' — UI only
  const [prpUseCase, setPrpUseCase] = useState('decede-capital-echu'); // preset selector for PRP
  const [formPosteData, setFormPosteData] = useState(BASELINE_FORM_POSTE_DATA);

  // ========== TIERS PAYEURS STATE ==========
  const [tpScenarioKey, setTpScenarioKey] = useState('baseline');
  const tpScenario = getTPScenario(tpScenarioKey);
  const hasTP = tpScenario.key !== 'baseline' && tpScenario.tiersPayeurs.length > 0;
  const tauxFinal = tpScenario.tauxResponsabilite ?? 100;

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

  // ========== CHESS PIECE AVATARS ==========
  const CHESS_PATHS = {
    knight: { vb: '0 0 24.19 27.63', d: 'M14.18 0c.02.11.01 1.02.01 1.17l-.001 2.8c.4.29 1.01.66 1.44.93l2.64 1.72c.16.56.29 1.14.43 1.7.06.23.1.49.2.71.14.34 1.84 1.93 2.23 2.32l-4.52 4.45-4.05-.02c-.28-.25-.6-.59-.88-.86-.47-.46-.93-.93-1.4-1.4.04-.87.01-2 .01-2.88-.44.01-.88.01-1.33.01-.04 1.1-.01 2.4-.01 3.51.62.66 1.31 1.29 1.94 1.94l.33.36 2.2-.002c.95 1.35 2.12 2.82 3.13 4.16l.003 2.72c.39.36 1.02.84 1.45 1.19.01.8.003 1.63 0 2.44l-7-0.001-8.74.004-.002-2.45c.45-.4.98-.79 1.44-1.19l-.004-2.73-4.41-.007c.08-.34.13-.79.19-1.15l.3-1.97c.78-.61 1.84-1.23 2.61-1.87.01-.15.04-.36.06-.52-.73.23-1.7.69-2.45.97.13-1.04.34-2.2.5-3.26.82-.42 1.65-.8 2.47-1.22.01-.16.02-.32.03-.48-.76.2-1.56.38-2.33.57.04-.2.07-.43.1-.64.17-1.27.44-2.55.59-3.81.75.25 1.49.5 2.23.76l.18-.37c-.6-.5-1.28-.97-1.87-1.47l2.37-2.33c.39-.39.81-.81 1.21-1.18.45-.03 1.16-.01 1.62-.01l3-.008c.23-.21.49-.49.72-.72.88-.85 1.74-1.75 2.62-2.59zm7.93 12.35c.16.08 1.84 1.82 2.08 2.06l-.04 3.04c-.44.37-.93.75-1.38 1.11-.36-.22-.68-.46-1.03-.7l-1.53-1.05-.31.3c.29.43.64.9.95 1.32.23.32.46.64.68.96l-2.84-.03c-.26-.8-.72-1.84-1.03-2.66.56-.58 1.24-1.23 1.83-1.8.86-.83 1.74-1.73 2.61-2.54zm-.19 2.46l-.004.68.57.06c.07.12.14.23.2.35.13.22.25.45.37.67l.02-1.74c-.04-.03-.02-.03-.06-.03-.35.01-.71.02-1.06.02zm-8.05-7.02c.31.21.64.37.94.56.01.24.01.5.03.74.21.15.48.29.72.41.25-.11.47-.22.72-.35.2.09.41.19.6.29l.21.11-.95-1.76h-2.27z' },
    bishop: { vb: '0 0 12.98 27.86', d: 'M12.67 20.83v3.08h-1.6l.81 3.95H1.1l.83-3.95H.31v-3.08h12.36zM6.49 0c.16.18.5.63.65.84.4.57.91 1.2 1.28 1.78L6.59 7.69c-.37 1.03-.79 2.12-1.13 3.15.12.39.31.87.45 1.25.18.51.37 1.07.57 1.56.13-.28.28-.77.38-1.07.26-.71.52-1.43.77-2.14l2.12-5.88c.19.26.41.6.59.87.38.57.76 1.14 1.13 1.72.3.47.6.95.89 1.43.21.33.43.69.6 1.05-.17.88-.41 1.87-.61 2.75-.11.47-.2.98-.31 1.46-.2.9-.39 1.8-.58 2.69-.12.6-.35 1.43-.43 2l-9.12.002c-.05-.34-.19-.92-.27-1.27-.12-.54-.24-1.08-.35-1.62l-.63-2.86C.46 11.74.24 10.68 0 9.63c.1-.23.33-.58.46-.8.38-.63.77-1.25 1.17-1.86 1.02-1.59 2.07-3.15 3.16-4.68.37-.53.75-1.05 1.14-1.56.19-.25.36-.49.56-.73z' },
    rook: { vb: '0 0 23.58 32.41', d: 'M21.14 27.17c.73.82 1.71 1.66 2.44 2.48l.005 2.76-2.49-.001-21.08.003C-.001 31.49.01 30.58 0 29.65c.79-.83 1.69-1.64 2.46-2.48.02-.6-.001-1.32.006-1.93l18.68-.002c-.004.65-.004 1.29 0 1.94zm-1.97-3.45c-.51.01-1.04.004-1.55.005l-13.18-.005 1.13-8.12c.13-.97.29-1.93.4-2.9l11.63-.002 1.56 11.03zm-.01-12.53H4.43c.004-.64.004-1.29 0-1.93h14.73l-.01 1.93zM6.1.01c.01 1.25-.001 2.54-.001 3.8 1.11.02 2.3 0 3.42.005l-.007-3.8 4.56.004v3.8l3.41-.002-.002-3.8c.32.001 3.56-.02 3.66.03l.002 7.7-18.69-.003-.004-7.72C3.61-.02 4.93.01 6.1.01z' },
    pawn: { vb: '0 0 28 28', d: 'M14 2a4 4 0 00-4 4c0 1.2.53 2.27 1.37 3H9.5a1.5 1.5 0 000 3h1.09A5.99 5.99 0 008 17v1h12v-1a5.99 5.99 0 00-2.59-4.93H18.5a1.5 1.5 0 000-3h-1.87A3.98 3.98 0 0018 6a4 4 0 00-4-4zM6 20v2h16v-2H6zm-2 4v2h20v-2H4z' },
    crown: { vb: '0 0 27.86 27.86', d: 'M19.85 21.59v2.79h-1.39l.7 3.48H8.71l.7-3.48H8.01v-2.79h11.84zM17.79 13.61l2.76-2.47 2.09 1.39-3.83 6.97H9.05l-3.83-6.97 2.09-1.39 2.76 2.47 3.86-3.86 3.86 3.86zM16.37 5.92l-2.44 2.44-2.44-2.44 2.44-2.44 2.44 2.44z' },
    queen: { vb: '0 0 28 28', d: 'M14 2a3 3 0 00-1 5.83V10H9L6 5l-4 9h3l1 8h16l1-8h3L22 5l-3 5h-4V7.83A3 3 0 0014 2zM6 24v2h16v-2H6z' },
    king: { vb: '0 0 28 28', d: 'M15 2h-2v3h-3v2h3v3h2V7h3V5h-3V2zM9 12a5 5 0 0110 0v1H9v-1zm-2 3h14l1 7H6l1-7zm-2 9h18v2H5v-2z' },
  };
  const LIEN_PIECE = { 'Épouse': 'queen', 'Époux': 'king', 'Concubin': 'king', 'Concubine': 'queen', 'Partenaire': 'crown', 'Enfant': 'knight', 'Parent': 'rook', 'Père': 'rook', 'Mère': 'rook', 'Frère': 'bishop', 'Sœur': 'bishop', 'Grand-parent': 'rook', 'Autre': 'pawn' };
  const VI_AVATAR_PALETTE = [
    { bg: '#cce6d9', fill: '#064E3B' }, // green
    { bg: '#dbeafe', fill: '#1e3a8a' }, // blue
    { bg: '#ece0eb', fill: '#581c87' }, // plum
    { bg: '#efdec4', fill: '#78350f' }, // orange
    { bg: '#ffe4e6', fill: '#881337' }, // rose/plum
    { bg: '#eeece6', fill: '#44403c' }, // cream/stone
  ];
  const VD_AVATAR = { bg: '#cce6d9', fill: '#064E3B' }; // green — matching Figma

  const chessPiece = (piece, fill, size) => {
    const p = CHESS_PATHS[piece] || CHESS_PATHS.knight;
    return (
      <svg viewBox={p.vb} fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '80%', height: '80%', display: 'block' }}>
        <path d={p.d} fill={fill} />
      </svg>
    );
  };

  const viAvatar = (vi, size = 28) => {
    const idx = victimesIndirectes.findIndex(v => v.id === vi.id);
    const pal = VI_AVATAR_PALETTE[(idx >= 0 ? idx : 0) % VI_AVATAR_PALETTE.length];
    const piece = LIEN_PIECE[vi.lien] || 'knight';
    return (
      <div className="flex items-end justify-center flex-shrink-0 overflow-hidden" style={{ width: size, height: size, borderRadius: size <= 20 ? 4 : size <= 24 ? 6 : 8, backgroundColor: pal.bg, paddingTop: 2 }}>
        {chessPiece(piece, pal.fill, size)}
      </div>
    );
  };

  const vdAvatar = (size = 32) => (
    <div className="flex items-end justify-center flex-shrink-0 overflow-hidden" style={{ width: size, height: size, borderRadius: size <= 20 ? 4 : size <= 24 ? 6 : 8, backgroundColor: VD_AVATAR.bg, paddingTop: 2 }}>
      {chessPiece('crown', VD_AVATAR.fill, size)}
    </div>
  );

  const typesFaitGenerateur = ['Accident de la route', 'Accident du travail', 'Accident médical', 'Agression', 'Accident domestique', 'Autre'];

  // ========== PARAMETER PILL ==========
  const getParamDiff = (paramKey) => null; // diff states removed

  const renderParamPill = ({ paramKey, label, values, enabled, onClick }) => {
    const scheme = enabled ? PILL_SCHEMES.info : PILL_SCHEMES.neutral;

    return (
      <button
        onClick={onClick}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border transition-colors"
        style={{ background: scheme.bg, borderColor: scheme.border, color: scheme.text }}
      >
        <CircleArrowUp className="w-3.5 h-3.5 flex-shrink-0" />
        <span>{label}</span>
        {values && <span style={{ fontWeight: 400 }}>{values}</span>}
      </button>
    );
  };

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

  // ========== BARÈMES LIBRARY STATE ==========
  const [baremesLibrary, setBaremesLibrary] = useState([...DEFAULT_BAREMES]);
  const [baremeViewerOpen, setBaremeViewerOpen] = useState(null); // baremeId or null
  const [baremeUploadFormOpen, setBaremeUploadFormOpen] = useState(false);
  const [baremeUploadConfirmed, setBaremeUploadConfirmed] = useState(false);
  const [baremeUploadData, setBaremeUploadData] = useState({ nom: '', type: 'bareme', notes: '', fileName: '' });
  const [baremePopover, setBaremePopover] = useState(null); // null | string (popover id like 'se', 'pep', 'dfp', 'pgpf')
  const [baremePopoverSearch, setBaremePopoverSearch] = useState('');

  // Close barème popover on click outside
  useEffect(() => {
    if (!baremePopover) return;
    const handleClick = (e) => {
      // Check if click is inside a popover dropdown (identified by data attribute)
      if (e.target.closest('[data-bareme-popover]')) return;
      setBaremePopover(null);
      setBaremePopoverSearch('');
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [baremePopover]);

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
  const [dsaLignes, setDsaLignes] = useState(BASELINE_DSA_LIGNES);

  // ========== PGPA ==========
  const [pgpaData, setPgpaData] = useState(BASELINE_PGPA_DATA);

  // Collapsed sections state for PGPA/PGPF cards (collapsed by default)
  const [expandedCards, setExpandedCards] = useState({});
  const isCardExpanded = (key) => !!expandedCards[key];
  const isIvCardExpanded = (key) => expandedCards[key] !== false; // defaults to open for IV cards
  const toggleCard = (key) => setExpandedCards(prev => ({ ...prev, [key]: !prev[key] }));

  // ========== PGPF ==========
  const [pgpfData, setPgpfData] = useState(BASELINE_PGPF_DATA);

  // ========== DFT ==========
  const [dftLignes, setDftLignes] = useState(BASELINE_DFT_LIGNES);

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
    victimesIndirectes: [
      { id: 'vi-1', nom: 'Dupont', prenom: 'Marie', sexe: 'Femme', dateNaissance: '22/08/1984', lien: 'Épouse' },
      { id: 'vi-2', nom: 'Dupont', prenom: 'Lucas', sexe: 'Homme', dateNaissance: '10/03/2012', lien: 'Enfant' },
      { id: 'vi-3', nom: 'Dupont', prenom: 'Emma', sexe: 'Femme', dateNaissance: '05/11/2015', lien: 'Enfant' },
    ], pieces: [], dsaLignes: [],
    pgpaData: { periode: { debut: '', fin: '', mois: 0 }, revenuRef: { revalorisation: 'ipc-annuel', coefficientPerteChance: 100, lignes: [], total: 0 }, revenusPercus: [], ijPercues: [] },
    pgpfData: { periodes: {} }, dftLignes: [],
    dossierPostes: [], formPosteData: {},
    ivDossierPostes: ['pai', 'pafv', 'pepe', 'fdp', 'fo', 'prp'],
    ivPosteData: {
      pai: { bareme: 'mornet-2024', lignes: [
        { victimeId: 'vi-1', montant: 25000, pieceIds: [] },
        { victimeId: 'vi-2', montant: 15000, pieceIds: [] },
        { victimeId: 'vi-3', montant: 15000, pieceIds: [] },
      ]},
      pafv: { bareme: 'cours-appel-2024', lignes: [
        { victimeId: 'vi-1', montant: 8000, pieceIds: [] },
        { victimeId: 'vi-2', montant: 5000, pieceIds: [] },
        { victimeId: 'vi-3', montant: 5000, pieceIds: [] },
      ]},
      pepe: { bareme: '', lignes: [
        { victimeId: 'vi-1', montant: 10000, pieceIds: [], intitule: 'Syndrome de stress post-traumatique sévère' },
      ]},
      fdp: { lignes: [
        { id: 'fdp-1', victimeId: 'vi-1', montant: 1200, pieceIds: ['p-1'], intitule: 'Déplacements hôpital (48 trajets)', source: 'ocr' },
        { id: 'fdp-2', victimeId: 'vi-1', montant: 2800, pieceIds: ['p-2'], intitule: 'Hébergement proche hôpital', source: 'ocr' },
        { id: 'fdp-3', victimeId: 'vi-1', montant: 450, pieceIds: [], intitule: 'Repas sur place' },
        { id: 'fdp-4', victimeId: 'vi-2', montant: 600, pieceIds: [], intitule: 'Déplacements' },
        { id: 'fdp-5', victimeId: 'vi-3', montant: 600, pieceIds: [], intitule: 'Déplacements' },
      ]},
      fo: { lignes: [
        { id: 'fo-1', label: 'Cercueil et préparation', totalAmount: 3200, pieceIds: ['p-7'], attributions: [{ viId: 'vi-1', amount: 1600 }, { viId: 'vi-3', amount: 1600 }] },
        { id: 'fo-2', label: 'Cérémonie religieuse', totalAmount: 800, pieceIds: [], attributions: [{ viId: 'vi-1', amount: 800 }] },
        { id: 'fo-3', label: 'Concession funéraire', totalAmount: 2100, pieceIds: [], attributions: [{ viId: 'vi-1', amount: 714 }, { viId: 'vi-2', amount: 693 }, { viId: 'vi-3', amount: 693 }] },
        { id: 'fo-4', label: 'Marbrerie et gravure', totalAmount: 1450, pieceIds: [], attributions: [{ viId: 'vi-3', amount: 1450 }] },
        { id: 'fo-5', label: 'Transport du corps', totalAmount: 680, pieceIds: [], attributions: [{ viId: 'vi-1', amount: 680 }] },
      ]},
      prp: { lignes: [
        { victimeId: 'vi-1', partIndividuelle: 50, dureeIndemnisation: 'Viager', anneesEchues: 3, mode: 'capitalisation', coeffCapitalisation: 20 },
        { victimeId: 'vi-2', partIndividuelle: 25, dureeIndemnisation: "Jusqu'à 25 ans (7 ans)", anneesEchues: 3, mode: 'capitalisation', coeffCapitalisation: 6.5 },
        { victimeId: 'vi-3', partIndividuelle: 25, dureeIndemnisation: "Jusqu'à 25 ans (12 ans)", anneesEchues: 3, mode: 'capitalisation', coeffCapitalisation: 10 },
      ]},
    },
    ivPosteSharedData: {
      prp: {
        victimeDecedee: true,
        revenuRefLignes: [
          { id: 'prp-rev-1', source: 'Bulletin de salaire Déc 2022', periode: 'Déc 2022', netMensuel: 4000, pieceIds: [] },
          { id: 'prp-rev-2', source: 'Avis d\'imposition 2022', periode: '2022', netMensuel: 4000, pieceIds: ['p-3'] },
        ],
        autoConsommationMethod: 'percentage',
        revenuConjoint: 24000,
        partAutoConsommation: 25,
        nombreParts: 3,
        revenuActuel: 1000,
      },
    },
  };

  const collectCurrentDossierData = () => ({
    victimeData, faitGenerateur, chiffrageParams,
    dossierStatut, dossierRef, dossierIntitule, dossierDateOuverture, dossierAvocat, dossierNotes,
    resumeAffaire, commentaireExpertise, victimesIndirectes, pieces,
    dsaLignes, pgpaData, pgpfData, dftLignes,
    dossierPostes, formPosteData,
    ivDossierPostes, ivPosteData, ivPosteSharedData,
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
    setVictimesIndirectes(data.victimesIndirectes ?? EMPTY_DOSSIER.victimesIndirectes);
    // Migration: corriger l'intitulé du rapport d'expertise si ancien format
    const loadedPieces = data.pieces ?? [];
    setPieces(loadedPieces.map(p =>
      p.id === 'p-5' ? { ...p, intitule: "Rapport d'expertise", type: 'Rapport' } : p
    ));
    setDsaLignes(data.dsaLignes ?? BASELINE_DSA_LIGNES);
    setPgpaData(data.pgpaData ?? BASELINE_PGPA_DATA);
    setPgpfData(data.pgpfData ?? BASELINE_PGPF_DATA);
    // Migration: fusionner anciens dfttLignes + dftpLignes si format legacy
    setDftLignes(data.dftLignes ?? [...(data.dfttLignes ?? []), ...(data.dftpLignes ?? BASELINE_DFT_LIGNES)]);
    setDossierPostes(data.dossierPostes ?? ['dsa', 'pgpa', 'dft', 'pgpf', 'se', 'dfp', 'pep']);
    setFormPosteData(data.formPosteData ?? BASELINE_FORM_POSTE_DATA);
    setIvDossierPostes(data.ivDossierPostes ?? EMPTY_DOSSIER.ivDossierPostes);
    setIvPosteData(data.ivPosteData ?? EMPTY_DOSSIER.ivPosteData);
    setIvPosteSharedData(data.ivPosteSharedData ?? EMPTY_DOSSIER.ivPosteSharedData);
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
    dsaLignes, pgpaData, pgpfData, dftLignes,
    ivDossierPostes, ivPosteData, ivPosteSharedData]);

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
      // Thinking message already exists from handleDropFirstCreate — no new message needed
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

      // Add detected VD postes to dossier (at 0€ — not calculated yet)
      setDossierPostes(prev => {
        const newIds = posteIds.filter(id => !prev.includes(id));
        return newIds.length > 0 ? [...prev, ...newIds] : prev;
      });

      // Add IV postes detected from documents
      const ivPostesDetected = ['pai', 'fdp', 'fo'];
      setIvDossierPostes(prev => {
        const newIds = ivPostesDetected.filter(id => !prev.includes(id));
        return newIds.length > 0 ? [...prev, ...newIds] : prev;
      });

      // Seed empty IV lignes for each declared VI (Type A gets one row per VI, B/C start empty)
      setIvPosteData(prev => {
        const updated = { ...prev };
        ivPostesDetected.forEach(pid => {
          if (!updated[pid]?.lignes?.length) {
            const config = IV_POSTE_CONFIG[pid];
            if (config?.type === 'A') {
              updated[pid] = { bareme: '', lignes: victimesIndirectes.map(vi => ({ victimeId: vi.id, montant: 0, pieceIds: [] })) };
            } else {
              updated[pid] = { lignes: [] };
            }
          }
        });
        return updated;
      });

      // Auto-switch to chiffrage tab after a short pause so user sees the transition
      setTimeout(() => setActiveTab('chiffrage'), 800);

      // Update the thinking stepper with extraction + postes steps, mark as done
      setChatMessages(prev => {
        const updated = prev.map(m => {
          if (m._dropFirstThinking) {
            return {
              ...m,
              label: 'Analyse terminée',
              status: 'done',
              done: true,
              summary: `Analyse de ${(m.steps || []).length + 2} documents terminée`,
              expanded: false,
              steps: [
                ...(m.steps || []),
                { tool: 'extractInfoDossier', detail: 'Je remplis les informations du dossier', expandedText: 'Nom, prénom, date de naissance, profession, date de l\'accident' },
                { tool: 'detectPostes', detail: `J'ai identifié ${detectedPostes.length} postes de préjudice`, expandedText: detectedPostes.join(', ') },
              ],
            };
          }
          return m;
        });

        // Push diff events for extraction (per-poste)
        const posteDiffKeys = detectedPostes.map(acronym => `extraction-poste-${acronym.toLowerCase()}`);
        setActiveDiffs(prev => [
          ...prev,
          ...MOCK_DIFF_STORE['extraction-info-dossier'],
          ...posteDiffKeys.flatMap(key => MOCK_DIFF_STORE[key] || []),
        ]);

        // Build one artifact card per detected poste
        const posteCards = detectedPostes.map(acronym => {
          const posteId = acronym.toLowerCase();
          const taxo = POSTES_TAXONOMY.flatMap(s => s.categories.flatMap(c => c.postes)).find(p => p.id === posteId);
          return {
            id: `poste-${posteId}`,
            icon: 'Calculator',
            zone: 'postes',
            actionIds: [`extraction-poste-${posteId}`],
            navigateTo: 'chiffrage',
            posteLabel: taxo ? `${acronym} — ${taxo.label}` : acronym,
          };
        });

        return [
          ...updated,
          {
            type: 'ai-thinking',
            status: 'done',
            summary: `Analyse du dossier — ${detectedPostes.length} postes identifiés`,
            counters: { add: detectedPostes.length, update: 1 },
            steps: [
              { type: 'read_documents', label: 'Analyse de 8 documents', status: 'done' },
              { type: 'read_rapport', label: "Lecture du rapport d'expertise médicale", status: 'done' },
              { type: 'extract_data', label: 'Extraction des informations du dossier', status: 'done', children: ['Identité', 'Date de naissance', 'N° dossier'] },
              { type: 'verify_data', label: 'Vérification des données extraites', status: 'done' },
              ...detectedPostes.map(acronym => ({
                type: 'add_row', label: `Poste ${acronym} identifié`, status: 'done', poste: acronym,
              })),
              { type: 'update_row', label: 'Informations du dossier complétées', status: 'done', poste: 'Dossier' },
            ],
            expanded: false,
          },
          {
            type: 'ai',
            text: `J'ai analysé vos documents, rempli les informations du dossier et identifié ${detectedPostes.length} postes de préjudice à 0 €. Cliquez sur un poste pour lancer le calcul.`,
          },
        ];
      });
      setChatBlocked(false);
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
      { tool: 'readDocument', detail: 'Je recherche les factures et justificatifs médicaux', expandedText: 'Factures de soins, ordonnances, notes d\'honoraires' },
      { tool: 'extractMontants', detail: 'J\'ai trouvé 5 dépenses dans vos documents', expandedText: 'Hospitalisation, kinésithérapie, IRM, médicaments, consultation' },
    ],
    dft: [
      { tool: 'readExpertise', detail: 'Je lis le rapport d\'expertise médicale', expandedText: 'Recherche des périodes de déficit fonctionnel' },
      { tool: 'extractPeriods', detail: 'J\'ai identifié 7 périodes de déficit', expandedText: 'Hospitalisation, chirurgie, convalescence, rééducation...' },
    ],
    pgpa: [
      { tool: 'readBulletins', detail: 'Je lis les bulletins de salaire et attestations', expandedText: 'Analyse des revenus sur les 2 dernières années' },
      { tool: 'extractRevenus', detail: 'J\'ai établi le revenu de référence', expandedText: '~37 800 €/an sur la base de 2 années de salaire + primes' },
    ],
    pgpf: [
      { tool: 'readExpertise', detail: 'Je recherche les données post-consolidation', expandedText: 'Séquelles, capacités résiduelles, impact professionnel' },
      { tool: 'readBaremes', detail: 'Je consulte le barème Gazette du Palais 2025', expandedText: 'Recherche du coefficient de capitalisation adapté' },
    ],
    se: [
      { tool: 'readExpertise', detail: 'Je lis la cotation des souffrances dans l\'expertise', expandedText: 'Évaluation par l\'expert des souffrances physiques et morales' },
    ],
    dfp: [
      { tool: 'readExpertise', detail: 'Je lis le taux de DFP et l\'âge à la consolidation', expandedText: 'Données nécessaires pour appliquer le barème d\'indemnisation' },
    ],
    pep: [
      { tool: 'readExpertise', detail: 'Je lis la cotation esthétique dans l\'expertise', expandedText: 'Évaluation des séquelles visibles par l\'expert' },
    ],
  };

  // When user navigates to a poste → chat greets + analyzes docs → shows result
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
      const discoveryTools = posteDiscoveryToolMap[posteId] || [{ tool: 'readDocument', detail: 'Je recherche les informations dans vos documents', expandedText: 'Analyse des pièces du dossier' }];

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

      // Phase 3: Mark thinking as done + show result summary
      const proposalT = setTimeout(() => {
        // Generate notes for this poste
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

        const resultTexts = {
          dsa: `DSA calculé : 6 242,50 €. 5 lignes de dépenses identifiées et argumentation rédigée.`,
          dft: `DFT calculé : 5 385 €. 7 périodes renseignées, forfait 28 €/jour. Argumentation rédigée.`,
          pgpa: `PGPA calculé : 6 700 €. Revenu de référence : 37 800 €/an, 18 mois d'arrêt, déduction IJ et maintien. Argumentation rédigée.`,
          pgpf: `PGPF calculé. Période échue et capitalisation viagère renseignées. Barème Gazette du Palais 2025 appliqué. Notes rédigées.`,
          se: `SE évalué à 15 000 € (cotation 4/7, référentiel Cour d'appel 2024). Argumentation rédigée.`,
          dfp: `DFP évalué : 27 000 € (18% × 1 500 €/point). Argumentation rédigée.`,
          pep: `PEP évalué à 4 500 € (cotation 3/7, référentiel Cour d'appel 2024). Argumentation rédigée.`,
        };

        // Push diff events
        const diffKey = `calc-${posteId}`;
        if (MOCK_DIFF_STORE[diffKey]) {
          setActiveDiffs(prev => [...prev, ...MOCK_DIFF_STORE[diffKey]]);
        }

        setChatMessages(prev => {
          const updated = prev.map(m => {
            if (m.type === 'ai-thinking' && m._posteDiscoveryId === posteId) {
              return { ...m, status: 'done', expanded: false, summary: welcome.analysis };
            }
            return m;
          });
          return [
            ...updated,
            {
              type: 'ai',
              text: resultTexts[posteId] || `${posteName} calculé. Données et argumentation reportées.`,
            },
          ];
        });
      }, 800 + discoveryTools.length * 600 + 400);
      chatAnalysisTimeouts.current.push(proposalT);
    }, 400);

    return () => clearTimeout(tid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navStack]);

  // ========== CALCULS ==========
  const dsaTotal = dsaLignes.reduce((s, l) => s + (l.montant || 0), 0);
  
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
    // TP overlay: use damageOverride if present
    if (hasTP && tpScenario.damageOverrides?.[id] != null) {
      return tpScenario.damageOverrides[id];
    }
    // Baseline: compute from actual state
    if (id === 'dsa') return dsaTotal;
    if (id === 'pgpa') return pgpaTotal;
    if (id === 'dft') return dftTotal;
    if (id === 'pgpf') return pgpfTotal;
    return formPosteData[id]?.montant || 0;
  };

  const effectivePostes = tpScenario.dossierPostesOverride || dossierPostes;
  const allPostes = effectivePostes.map(id => {
    const taxo = allTaxoPostes.find(p => p.id === id);
    if (!taxo) return null;
    const cat = CATEGORY_MAP[taxo.categoryId];
    const totalDamage = getPosteMontant(id);
    const tpAmount = hasTP ? (tpScenario._imputations || []).filter(imp => imp.posteId === id).reduce((s, imp) => s + (imp.montantImpute || 0), 0) : 0;
    const dp = tpScenario.droitDePreference?.[id];
    const tpEffective = dp ? dp.resteTP : tpAmount;
    const victimeAmount = hasTP && tpAmount > 0
      ? (dp ? dp.victimePref : totalDamage - tpAmount)
      : totalDamage;
    return {
      id,
      title: taxo.acronym || id.toUpperCase(),
      fullTitle: taxo.label,
      montant: totalDamage,
      tpAmount,
      tpEffective,
      victimeAmount,
      category: cat?.id || 'patrimoniaux-temp',
    };
  }).filter(Boolean);

  const categories = Object.values(CATEGORY_MAP)
    .map(cat => ({ ...cat, postes: allPostes.filter(p => p.category === cat.id) }))
    .filter(cat => cat.postes.length > 0);

  // IV computed helpers
  const getIvPosteMontant = (posteId) => {
    const config = IV_POSTE_CONFIG[posteId];
    const lignes = ivPosteData[posteId]?.lignes || [];
    if (config?.type === 'C') return lignes.reduce((sum, l) => sum + (l.totalAmount || 0), 0);
    return lignes.reduce((sum, l) => sum + (l.montant || 0), 0);
  };

  const getIvVictimeTotal = (victimeId) =>
    ivDossierPostes.reduce((sum, pid) => {
      const config = IV_POSTE_CONFIG[pid];
      const lignes = ivPosteData[pid]?.lignes || [];
      if (config?.type === 'C') {
        return sum + lignes.reduce((s, l) => {
          const attr = (l.attributions || []).find(a => a.viId === victimeId);
          return s + (attr?.amount || 0);
        }, 0);
      }
      return sum + lignes.filter(l => l.victimeId === victimeId).reduce((s, l) => s + (l.montant || 0), 0);
    }, 0);

  const allIvPostes = ivDossierPostes.map(id => {
    const taxo = allTaxoPostes.find(p => p.id === id);
    if (!taxo) return null;
    const cat = CATEGORY_MAP[taxo.categoryId];
    return { id, title: taxo.acronym || id.toUpperCase(), fullTitle: taxo.label, montant: getIvPosteMontant(id), category: cat?.id };
  }).filter(Boolean);

  const ivCategories = Object.values(CATEGORY_MAP)
    .filter(cat => cat.id === 'vi-pat' || cat.id === 'vi-expat')
    .map(cat => ({ ...cat, postes: allIvPostes.filter(p => p.category === cat.id) }))
    .filter(cat => cat.postes.length > 0);

  // Filter VD categories (exclude IV categories)
  const vdCategories = categories.filter(cat => cat.id !== 'vi-pat' && cat.id !== 'vi-expat');

  const totalIvChiffrage = allIvPostes.reduce((s, p) => s + p.montant, 0);
  const totalVdVictime = allPostes.reduce((s, p) => s + (p.victimeAmount || 0), 0);
  const totalChiffrage = totalVdVictime + totalIvChiffrage;

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

  const getOrderedPieces = () => {
    if (piecesSortMode === 'manuel' && piecesManualOrder) {
      return piecesManualOrder.map(id => pieces.find(p => p.id === id)).filter(Boolean);
    }
    return sortPiecesByDate(pieces);
  };

  const initManualOrder = () => {
    const chronoSorted = sortPiecesByDate(pieces);
    setPiecesManualOrder(chronoSorted.map(p => p.id));
  };

  const copyBordereau = async () => {
    const ordered = getOrderedPieces();
    const text = ordered.map((p, i) => {
      const label = p.intitule || p.nom.replace(/\.[^/.]+$/, '');
      return `${i + 1}. ${label} [${p.date}]`;
    }).join('\n');
    await navigator.clipboard.writeText(text);
    setToastMessage('Bordereau copié dans le presse-papiers');
    setTimeout(() => setToastMessage(null), 2500);
  };

  const downloadAllAsZip = async () => {
    const ordered = getOrderedPieces();
    const zip = new JSZip();
    ordered.forEach((piece, i) => {
      const prefix = String(i + 1).padStart(2, '0');
      const filename = `${prefix} - ${piece.nom}`;
      zip.file(filename, `[Placeholder] ${piece.intitule}\nDate: ${piece.date}\nType: ${piece.type}`);
    });
    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, 'bordereau-pieces.zip');
  };

  // ========== PIECES LIST COMPONENT ==========
  const renderPiecesList = (piecesArray, showUploadZone = true) => {
    const sortedPieces = getOrderedPieces();

    return (
      <div className="flex flex-col -mx-4 -mt-4">
        {/* Sub-header bar — full width, edge-to-edge */}
        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-[#e7e5e3]">
          {/* Sort toggle pill */}
          <div className="flex items-center bg-[#eeece6] rounded-md p-0.5">
            <button
              onClick={() => { setPiecesSortMode('manuel'); if (!piecesManualOrder) initManualOrder(); }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium uppercase tracking-wide rounded transition-all ${
                piecesSortMode === 'manuel' ? 'bg-white text-[#292524] shadow-sm' : 'text-[#78716c] hover:text-[#44403c]'
              }`}
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              <Hand className="w-3.5 h-3.5" strokeWidth={1.5} />
              Manuel
            </button>
            <button
              onClick={() => setPiecesSortMode('chrono')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium uppercase tracking-wide rounded transition-all ${
                piecesSortMode === 'chrono' ? 'bg-white text-[#292524] shadow-sm' : 'text-[#78716c] hover:text-[#44403c]'
              }`}
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
              Chrono
            </button>
          </div>

          <div className="flex items-center gap-2.5 ml-auto">
            <div className="flex items-center gap-2 px-3 py-2 bg-[#eeece6] rounded-md">
              <Search className="w-4 h-4 text-[#78716c]" strokeWidth={1.5} />
              <span className="text-sm text-[#78716c] opacity-70">Rechercher...</span>
            </div>
            <button
              onClick={downloadAllAsZip}
              className="flex items-center justify-center w-8 h-8 bg-white border border-[#e7e5e3] text-[#78716c] hover:text-[#44403c] hover:bg-[#fafaf9] rounded-md shadow-sm transition-colors"
              title="Télécharger tout"
            >
              <Download className="w-4 h-4" strokeWidth={1.5} />
            </button>
            <button
              onClick={copyBordereau}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-[#292524] rounded-md hover:bg-[#44403c] shadow-sm transition-colors"
            >
              <Copy className="w-4 h-4" strokeWidth={1.5} />
              Copier bordereau
            </button>
            <div className="relative">
              <button
                onClick={() => setPiecesMoreMenu(!piecesMoreMenu)}
                className="flex items-center justify-center w-8 h-8 text-[#78716c] hover:text-[#44403c] hover:bg-[#f5f5f4] rounded-md transition-colors"
              >
                <MoreVertical className="w-4 h-4" strokeWidth={1.5} />
              </button>
              {piecesMoreMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setPiecesMoreMenu(false)} />
                  <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-[#e7e5e3] rounded-lg shadow-lg z-50 py-1">
                    <button
                      onClick={() => { downloadAllAsZip(); setPiecesMoreMenu(false); }}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-[#292524] hover:bg-[#fafaf9] transition-colors"
                    >
                      <Download className="w-4 h-4" strokeWidth={1.5} />
                      Télécharger en ZIP
                    </button>
                  </div>
                </>
              )}
            </div>
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

          {/* Reorder hint banner */}
          {showReorderHint && piecesSortMode !== 'manuel' && (
            <div className="mb-3 flex items-center gap-3 px-4 py-3 bg-[#f8f7f5] border border-[#e7e5e3] rounded-lg">
              <Hand className="w-4 h-4 text-[#78716c] shrink-0" strokeWidth={1.5} />
              <span className="text-sm text-[#44403c]">Passez en mode Manuel pour réordonner les pièces par glisser-déposer.</span>
              <button
                onClick={() => { setPiecesSortMode('manuel'); if (!piecesManualOrder) initManualOrder(); setShowReorderHint(false); }}
                className="ml-auto px-3 py-1.5 text-sm font-medium text-white bg-[#292524] rounded-md hover:bg-[#44403c] transition-colors shrink-0"
              >
                Passer en Manuel
              </button>
              <button onClick={() => setShowReorderHint(false)} className="text-[#a8a29e] hover:text-[#78716c] transition-colors shrink-0">
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
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
            {sortedPieces.map((piece, idx) => {
              const displayIndex = idx + 1;
              const usages = getPieceUsage(piece.id);
              const isDragging = piecesDragState.dragging === piece.id;
              const label = piece.intitule || piece.nom.replace(/\.[^/.]+$/, '');
              return (
                <React.Fragment key={piece.id}>
                  {/* Drop indicator line */}
                  {piecesDragState.over === piece.id && piecesDragState.dragging !== piece.id && (
                    <div className="h-0.5 bg-[#f59e0b] rounded-full mx-2" />
                  )}
                  <div
                    draggable={piecesSortMode === 'manuel'}
                    onDragStart={(e) => {
                      if (piecesSortMode !== 'manuel') { e.preventDefault(); return; }
                      const img = new window.Image();
                      img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                      e.dataTransfer.setDragImage(img, 0, 0);
                      e.dataTransfer.effectAllowed = 'move';
                      setPiecesDragState({ dragging: piece.id, over: null, ghostX: e.clientX, ghostY: e.clientY, name: label, type: piece.type, num: displayIndex });
                    }}
                    onDrag={(e) => {
                      if (e.clientX === 0 && e.clientY === 0) return;
                      setPiecesDragState(prev => prev ? { ...prev, ghostX: e.clientX, ghostY: e.clientY } : prev);
                    }}
                    onDragOver={(e) => {
                      if (piecesSortMode !== 'manuel') return;
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                      if (piecesDragState.over !== piece.id) {
                        setPiecesDragState(prev => ({ ...prev, over: piece.id }));
                      }
                    }}
                    onDragEnd={() => {
                      if (piecesDragState.dragging && piecesDragState.over && piecesDragState.dragging !== piecesDragState.over) {
                        setPiecesManualOrder(prev => {
                          const arr = [...prev];
                          const fromIdx = arr.indexOf(piecesDragState.dragging);
                          const toIdx = arr.indexOf(piecesDragState.over);
                          arr.splice(fromIdx, 1);
                          arr.splice(toIdx, 0, piecesDragState.dragging);
                          return arr;
                        });
                      }
                      setPiecesDragState({ dragging: null, over: null });
                    }}
                    className={`flex items-center h-14 bg-white border-b border-[#e7e5e3] last:border-b-0 hover:bg-[#fafaf9] cursor-pointer group ${isDragging ? 'opacity-20 bg-[#f4f4f5]' : ''}`}
                    onClick={() => setEditPanel({ type: 'piece-detail', data: { ...piece, index: displayIndex, usages } })}
                  >
                    {/* Grip */}
                    <div
                      className={`w-[38px] shrink-0 flex items-center justify-center pl-3 ${piecesSortMode === 'manuel' ? 'cursor-grab' : 'cursor-not-allowed'}`}
                      onClick={(e) => { e.stopPropagation(); if (piecesSortMode !== 'manuel') setShowReorderHint(true); }}
                    >
                      <GripVertical className={`w-3.5 h-3.5 transition-opacity ${piecesSortMode === 'manuel' ? 'text-[#d6d3d1] opacity-100' : 'text-[#d6d3d1] opacity-0 group-hover:opacity-40'}`} strokeWidth={1.5} />
                    </div>
                    {/* Number badge */}
                    <div className="w-[50px] shrink-0 flex items-center justify-center pl-4 pr-3">
                      <span className="inline-flex items-center justify-center w-[22px] h-[22px] bg-[#eeece6] text-[#78716c] text-xs font-semibold rounded-md">
                        {displayIndex}
                      </span>
                    </div>
                    {/* Document name */}
                    <div className="flex-1 min-w-0 px-3">
                      <span className="text-sm font-medium text-black truncate block">{label}</span>
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
                </React.Fragment>
              );
            })}
            {/* Floating ghost card */}
            {piecesDragState.dragging && piecesDragState.ghostX && (
              <div
                className="fixed z-50 pointer-events-none bg-[#292524] border border-[#44403c] rounded-lg shadow-lg px-3 py-2 flex items-center gap-2"
                style={{ left: piecesDragState.ghostX + 12, top: piecesDragState.ghostY - 16, minWidth: 200 }}
              >
                <GripVertical className="w-3 h-3 text-[#78716c]" strokeWidth={1.5} />
                <span className="inline-flex items-center justify-center w-[22px] h-[22px] bg-[#44403c] text-[#d6d3d1] text-xs font-semibold rounded-md">{piecesDragState.num || '?'}</span>
                <span className="text-sm font-medium text-white truncate max-w-[250px]">{piecesDragState.name}</span>
                {piecesDragState.type && (
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-md bg-[#44403c] text-[#d6d3d1]`}>{piecesDragState.type}</span>
                )}
              </div>
            )}
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
    setNavStack(prev => {
      if (prev.length === 0) return prev;
      const base = prev.length > 1 ? [prev[0]] : [...prev];
      base[base.length - 1] = { ...base[base.length - 1], activeTab: tab.toLowerCase() };
      return base;
    });
  };
  const _toggleCategory = (id) => setExpandedCategories(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]); // eslint-disable-line no-unused-vars
  const toggleSection = (id) => setExpandedSections(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);

  // ========== NAVIGATION ANCHORS ==========
  const handleNavigateToZone = (zone, tabName) => {
    // Pop back to dossier level if inside a poste, then switch tab
    setNavStack(prev => {
      const base = prev.length > 1 ? [prev[0]] : [...prev];
      return base.map((n, ni) => ni === base.length - 1 ? { ...n, activeTab: tabName } : n);
    });
    setTimeout(() => {
      const zoneEl = document.querySelector(`[data-zone-id="${zone}"]`);
      if (zoneEl) {
        zoneEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        zoneEl.classList.add('is-zone-highlighted');
        setTimeout(() => zoneEl.classList.remove('is-zone-highlighted'), 3000);
      }
    }, 150);
  };

  const handleNavigateToEntity = (entityId, zone, tabName) => {
    // For postes zone: navigate inside the poste page
    if (zone === 'postes') {
      const poste = allPostes.find(p => p.id === entityId);
      if (poste) {
        // Ensure we're at dossier level first, then drill in
        setNavStack(prev => {
          const base = prev.length > 1 ? [prev[0]] : [...prev];
          const updated = base.map((n, ni) => ni === base.length - 1 ? { ...n, activeTab: 'chiffrage' } : n);
          return [...updated, { ...poste, type: 'poste', activeTab: tabsConfig.poste?.[0]?.toLowerCase() }];
        });
        return;
      }
    }

    // Pop back to dossier level if inside a poste, then switch tab and scroll
    setNavStack(prev => {
      const base = prev.length > 1 ? [prev[0]] : [...prev];
      return base.map((n, ni) => ni === base.length - 1 ? { ...n, activeTab: tabName } : n);
    });
    setTimeout(() => {
      const el = document.querySelector(`[data-entity-id="${entityId}"]`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('is-highlighted');
        setTimeout(() => el.classList.remove('is-highlighted'), 3000);
      } else {
        // Entity not found by ID — fall back to zone-level navigation
        const zoneEl = zone && document.querySelector(`[data-zone-id="${zone}"]`);
        if (zoneEl) {
          zoneEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          zoneEl.classList.add('is-zone-highlighted');
          setTimeout(() => zoneEl.classList.remove('is-zone-highlighted'), 3000);
        }
      }
    }, 150);
  };

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
            ...prev.revenuRef.lignes.filter(l => !l.status || !l.diffType)
          ]
        },
        revenusPercus: [
          ...(pgpa.revenusPercus || []),
          ...prev.revenusPercus.filter(l => !l.status || !l.diffType)
        ],
        ijPercues: [
          ...(pgpa.ijPercues || []),
          ...prev.ijPercues.filter(l => !l.status || !l.diffType)
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
          diffType: 'add'
        },
        {
          id: `dsa-ai-${timestamp}-2`,
          label: 'Intervention chirurgicale LCA',
          type: 'Hospitalisation',
          date: '28/03/2023',
          montant: 4200,
          tiers: 'Clinique du Sport',
          diffType: 'add'
        },
        {
          id: `dsa-ai-${timestamp}-3`,
          label: 'Consultation orthopédique post-op',
          type: 'Consultation',
          date: '10/04/2023',
          montant: 60,
          tiers: 'Dr Leblanc',
          diffType: 'add'
        },
        {
          id: `dsa-ai-${timestamp}-4`,
          label: 'Séances kinésithérapie (45 séances)',
          type: 'Rééducation',
          date: '2023-2024',
          montant: 1800,
          tiers: 'Cabinet Kiné Martin',
          diffType: 'edit'
        },
        {
          id: `dsa-ai-${timestamp}-5`,
          label: 'IRM de contrôle genou',
          type: 'Imagerie',
          date: '15/06/2023',
          montant: 380,
          tiers: 'Centre Imagerie Bordeaux',
          diffType: 'add'
        },
        {
          id: `dsa-ai-${timestamp}-6`,
          label: 'Consultation doublon Dr Dupont',
          type: 'Consultation',
          date: '10/04/2023',
          montant: 60,
          tiers: 'Dr Dupont',
          diffType: 'delete'
        },
        {
          id: `dsa-ai-${timestamp}-7`,
          label: 'Médicaments anti-inflammatoires',
          type: 'Pharmacie',
          date: '03/2023 - 09/2024',
          montant: 245,
          tiers: 'Pharmacie des Lilas',
          diffType: 'add'
        },
        {
          id: `dsa-ai-${timestamp}-8`,
          label: 'Attelle de genou post-opératoire',
          type: 'Appareillage',
          date: '30/03/2023',
          montant: 180,
          tiers: 'Orthopédie Plus',
          diffType: 'add'
        },
        {
          id: `dsa-ai-${timestamp}-9`,
          label: 'Consultations Dr Martin (suivi)',
          type: 'Consultation',
          date: '2023-2024',
          montant: 300,
          tiers: 'Dr Martin',
          diffType: 'add'
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
          diffType: 'add'
        },
        {
          id: `dft-ai-${timestamp}-2`,
          label: 'Hospitalisation chirurgie',
          debut: '28/03/2023',
          fin: '02/04/2023',
          jours: 6,
          taux: 100,
          montant: 150,
          diffType: 'add'
        },
        {
          id: `dft-ai-${timestamp}-3`,
          label: 'Alitement strict post-op',
          debut: '03/04/2023',
          fin: '15/04/2023',
          jours: 13,
          taux: 100,
          montant: 325,
          diffType: 'add'
        },
        {
          id: `dft-ai-${timestamp}-4`,
          label: 'Convalescence post-opératoire',
          debut: '16/04/2023',
          fin: '30/06/2023',
          jours: 76,
          taux: 50,
          montant: 950,
          diffType: 'edit'
        },
        {
          id: `dft-ai-${timestamp}-5`,
          label: 'Rééducation active intensive',
          debut: '01/07/2023',
          fin: '30/09/2023',
          jours: 92,
          taux: 40,
          montant: 920,
          diffType: 'add'
        },
        {
          id: `dft-ai-${timestamp}-6`,
          label: 'Rééducation d\'entretien (doublon)',
          debut: '01/10/2023',
          fin: '31/12/2023',
          jours: 92,
          taux: 25,
          montant: 575,
          diffType: 'delete'
        },
        {
          id: `dft-ai-${timestamp}-7`,
          label: 'Gêne résiduelle pré-consolidation',
          debut: '01/01/2024',
          fin: '12/09/2024',
          jours: 256,
          taux: 15,
          montant: 960,
          diffType: 'add'
        }
      ],

      // DFP (permanent)
      dfpData: {
        taux: 15,
        ageConsolidation: 43,
        pointValue: 1580,
        montantTotal: 23700,
        confidence: 92,
        diffType: 'add'
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
              diffType: 'add'
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
              diffType: 'edit'
            },
            {
              id: `pgpa-ai-gain-${timestamp}-1`,
              type: 'gain',
              label: 'Prime exceptionnelle (non récurrent)',
              annee: '2021',
              montant: 1500,
              revalorise: 1500,
              aRevaloriser: false,
              pieceIds: [],
              confidence: 72,
              diffType: 'delete'
            },
            {
              id: `pgpa-ai-gain-${timestamp}-2`,
              type: 'gain',
              label: 'Prime annuelle',
              annee: '2022',
              montant: 2400,
              revalorise: 2496,
              aRevaloriser: true,
              pieceIds: [],
              confidence: 85,
              diffType: 'add'
            },
            {
              id: `pgpa-ai-gain-${timestamp}-3`,
              type: 'gain',
              label: 'Heures supplémentaires',
              annee: '2022',
              montant: 1600,
              revalorise: 1664,
              aRevaloriser: true,
              pieceIds: [],
              confidence: 79,
              diffType: 'add'
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
            diffType: 'add'
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
            diffType: 'add'
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
            diffType: 'add'
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
    setVictimesIndirectes(EMPTY_DOSSIER.victimesIndirectes);
    setPieces([]);
    setDsaLignes(BASELINE_DSA_LIGNES);
    setDftLignes(BASELINE_DFT_LIGNES);
    setPgpaData(BASELINE_PGPA_DATA);
    setPgpfData(BASELINE_PGPF_DATA);
    setFormPosteData(BASELINE_FORM_POSTE_DATA);
    setIvDossierPostes(EMPTY_DOSSIER.ivDossierPostes);
    setIvPosteData(EMPTY_DOSSIER.ivPosteData);
    setIvPosteSharedData(EMPTY_DOSSIER.ivPosteSharedData);

    // Reset chat state for new dossier
    setChatMessages([]);
    setChatBlocked(false);
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
          diffType: result.status === 'error' ? undefined : hasAllData ? 'add' : undefined,
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
              diffType: 'add',
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
            diffType: 'add',
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
            diffType: 'add',
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
          diffType: 'add',
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

    // Slash command detection — TP commands first, then demo scenarios
    if (text.startsWith('/')) {
      const cmd = text.slice(1).trim();
      setChatInputValue('');

      // TP commands
      if (cmd.startsWith('tp-')) {
        if (cmd === 'tp-help') {
          setChatMessages(prev => [...prev, { type: 'ai', text: "Commandes Tiers payeurs disponibles :\n\n/tp-cr-globale--perte-de-chance — CR globale + perte de chance 30 % (droit de préférence)\n/tp-ligne--classique — Extraction ligne par ligne, 100 % (DSA par facture, IJ CPAM)\n/tp-cascade — Cascade AT/MP (rente capitalisée PGPF → IP → DFP)\n/tp-reset — Revenir au scénario de base" }]);
          return;
        }
        const newKey = TP_COMMAND_MAP[cmd];
        if (newKey) {
          setTpScenarioKey(newKey);
          const sc = getTPScenario(newKey);
          setChatMessages(prev => [...prev, { type: 'ai', text: sc.agentMessage }]);
          return;
        }
      }

      jp.playScenario(cmd);
      return;
    }

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
        diffType: hasAllData ? 'add' : undefined,
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
            diffType: 'add',
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
          diffType: 'add',
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
          diffType: 'add',
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
        diffType: 'add',
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

  // Approve a diff: accept the change and clear diffType so the row becomes "normal"
  // For deletions: approving means removing the row (the deletion is accepted)
  const handleApproveDiff = (ligneId, zone) => {
    const clearDiff = (list) => list.map(l => l.id === ligneId ? { ...l, diffType: undefined } : l);
    const removeLigne = (list) => list.filter(l => l.id !== ligneId);
    const findInList = (list) => list.find(l => l.id === ligneId);

    if (zone === 'dsa' || (!zone && findInList(dsaLignes))) {
      const ligne = dsaLignes.find(l => l.id === ligneId);
      if (ligne?.diffType === 'delete') setDsaLignes(prev => removeLigne(prev));
      else setDsaLignes(prev => clearDiff(prev));
    } else if (zone === 'dft' || (!zone && findInList(dftLignes))) {
      const ligne = dftLignes.find(l => l.id === ligneId);
      if (ligne?.diffType === 'delete') setDftLignes(prev => removeLigne(prev));
      else setDftLignes(prev => clearDiff(prev));
    } else if (zone === 'pgpa') {
      setPgpaData(prev => {
        const inRef = prev.revenuRef.lignes.find(l => l.id === ligneId);
        if (inRef) {
          return inRef.diffType === 'delete'
            ? { ...prev, revenuRef: { ...prev.revenuRef, lignes: prev.revenuRef.lignes.filter(l => l.id !== ligneId) } }
            : { ...prev, revenuRef: { ...prev.revenuRef, lignes: prev.revenuRef.lignes.map(l => l.id === ligneId ? { ...l, diffType: undefined } : l) } };
        }
        const inPercus = prev.revenusPercus.find(l => l.id === ligneId);
        if (inPercus) {
          return inPercus.diffType === 'delete'
            ? { ...prev, revenusPercus: prev.revenusPercus.filter(l => l.id !== ligneId) }
            : { ...prev, revenusPercus: prev.revenusPercus.map(l => l.id === ligneId ? { ...l, diffType: undefined } : l) };
        }
        return prev;
      });
    } else if (zone === 'infos_dossier') {
      // For infos_dossier, approving means keeping the agent's "after" value (already set in state)
      // Just mark as approved in activeDiffs below
    }
    // Remove from activeDiffs — accepted changes become the new baseline
    setActiveDiffs(prev => prev.filter(d => d.entityId !== ligneId));
  };

  // Reject a diff: revert the change — for additions remove the row, for edits/deletes clear diffType
  const handleRejectDiff = (ligneId, zone) => {
    const clearDiff = (list) => list.map(l => l.id === ligneId ? { ...l, diffType: undefined } : l);
    const removeLigne = (list) => list.filter(l => l.id !== ligneId);
    const findInList = (list) => list.find(l => l.id === ligneId);

    if (zone === 'dsa' || (!zone && findInList(dsaLignes))) {
      const ligne = dsaLignes.find(l => l.id === ligneId);
      if (ligne?.diffType === 'add') setDsaLignes(prev => removeLigne(prev));
      else setDsaLignes(prev => clearDiff(prev));
    } else if (zone === 'dft' || (!zone && findInList(dftLignes))) {
      const ligne = dftLignes.find(l => l.id === ligneId);
      if (ligne?.diffType === 'add') setDftLignes(prev => removeLigne(prev));
      else setDftLignes(prev => clearDiff(prev));
    } else if (zone === 'pgpa') {
      setPgpaData(prev => {
        const inRef = prev.revenuRef.lignes.find(l => l.id === ligneId);
        if (inRef) {
          return inRef.diffType === 'add'
            ? { ...prev, revenuRef: { ...prev.revenuRef, lignes: prev.revenuRef.lignes.filter(l => l.id !== ligneId) } }
            : { ...prev, revenuRef: { ...prev.revenuRef, lignes: prev.revenuRef.lignes.map(l => l.id === ligneId ? { ...l, diffType: undefined } : l) } };
        }
        const inPercus = prev.revenusPercus.find(l => l.id === ligneId);
        if (inPercus) {
          return inPercus.diffType === 'add'
            ? { ...prev, revenusPercus: prev.revenusPercus.filter(l => l.id !== ligneId) }
            : { ...prev, revenusPercus: prev.revenusPercus.map(l => l.id === ligneId ? { ...l, diffType: undefined } : l) };
        }
        return prev;
      });
    } else if (zone === 'infos_dossier') {
      // For infos_dossier, rejecting means reverting the field to its "before" value
      const diff = activeDiffs.find(d => d.entityId === ligneId && d.zone === 'infos_dossier' && !d.approved && !d.rejected);
      if (diff) {
        // Determine which state setter to use based on the field key
        const victimeFields = ['nom', 'prenom', 'sexe', 'dateNaissance'];
        const faitFields = ['typeFait', 'dateAccident', 'premiereConstatation', 'dateConsolidation'];
        if (victimeFields.includes(ligneId)) {
          setVictimeData(prev => ({ ...prev, [ligneId]: diff.before ?? '' }));
        } else if (faitFields.includes(ligneId)) {
          const stateKey = ligneId === 'typeFait' ? 'type' : ligneId;
          setFaitGenerateur(prev => ({ ...prev, [stateKey]: diff.before ?? '' }));
        }
      }
    }
    // Also mark as rejected in activeDiffs
    setActiveDiffs(prev => prev.map(d => d.entityId === ligneId ? { ...d, rejected: true } : d));
  };
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

              // Diff diamond: check activeDiffs for pending diffs in this tab's zone
              const tabZoneMap = { dossier: 'infos_dossier', chiffrage: 'postes', 'pièces': 'pieces' };
              const tabZone = tabZoneMap[tabKey];
              const zoneDiffs = tabZone ? activeDiffs.filter(d => d.zone === tabZone && !d.approved && !d.rejected) : [];
              // Determine dominant diff type for color
              const hasAdds = zoneDiffs.some(d => d.type === 'add');
              const hasEdits = zoneDiffs.some(d => d.type === 'edit');
              const hasDeletes = zoneDiffs.some(d => d.type === 'delete');
              const diffDiamondColor = hasEdits ? ROW_DIFF_COLORS.edit : hasDeletes ? ROW_DIFF_COLORS.delete : hasAdds ? ROW_DIFF_COLORS.add : null;
              const showDiffDiamond = zoneDiffs.length > 0;

              // Legacy streaming dot (only if no diff diamond)
              const hasExtracted = tab === 'Dossier' && infoDossierStreaming?.fieldsRevealed?.length > 0;
              const showStreamingDot = hasExtracted && !isActive && !showDiffDiamond;

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
                    {showDiffDiamond && (
                      <span className="inline-flex items-center justify-center w-3 h-3 flex-shrink-0">
                        <span className="w-[6px] h-[6px] flex-shrink-0" style={{
                          background: diffDiamondColor,
                          transform: 'rotate(45deg)',
                          borderRadius: '0.5px',
                          border: '1px solid rgba(0,0,0,0.1)',
                          boxShadow: `0 0 0 3px ${diffDiamondColor}20, 0 1px 2px 0 rgba(26,26,26,0.05)`,
                        }} />
                      </span>
                    )}
                    {tab}
                    {showStreamingDot && <span className="w-1.5 h-1.5 animate-pulse-scale" style={{ background: '#4a9168', transform: 'rotate(45deg)' }} />}
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

  // PlatoDotGrid is now imported from ./components/ReasoningStepper

  // Chat state
  const [chatInputValue, setChatInputValue] = useState('');
  const [chatInputFocused, setChatInputFocused] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [expandedArtifacts, setExpandedArtifacts] = useState({});
  const [stagedDocs, setStagedDocs] = useState([]);
  const chatAnalysisTimeouts = useRef([]);
  const chatExtractionAnnounced = useRef(false);
  const chatPostesAnnounced = useRef(false);
  const chatScrollRef = useRef(null);
  const prevChatCountRef = useRef(0);
  const chatAnalyzedPostes = useRef(new Set()); // track which postes chat has already analyzed

  // ========== JP STATE ==========
  const jp = useDemoCommands({ setChatMessages, setNavStack, tabsConfig: { dossier: ['Dossier', 'Chiffrage', 'Pièces', 'Actes', 'JP'], poste: [] } });
  const [jpPopover, setJpPopover] = useState(null); // { decision, anchorRect }
  const jpPopoverTimeout = useRef(null);

  // Auto-scroll chat only when new messages are added
  useEffect(() => {
    if (chatMessages.length > prevChatCountRef.current && chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
    prevChatCountRef.current = chatMessages.length;
  }, [chatMessages.length]);

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
            ref={chatScrollRef}
          >
            {chatMessages.length === 0 && (
              <div className="flex flex-col items-center justify-center flex-1 py-12 px-6">
                <PlatoIcon />
                <p style={{ fontSize: 14, color: '#a8a29e', textAlign: 'center', marginTop: 12, lineHeight: '18px' }}>
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

              // AI thinking status — collapsible stepper
              if (msg.type === 'ai-thinking') {
                return (
                  <ReasoningStepper
                    key={i}
                    steps={msg.steps || []}
                    label={msg.label}
                    status={msg.status || (msg.done ? 'done' : 'streaming')}
                    summary={msg.summary}
                    counters={msg.counters}
                    expanded={!!msg.expanded}
                    onToggle={() => setChatMessages(prev => prev.map((m, mi) => mi === i ? { ...m, expanded: !m.expanded } : m))}
                  />
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
                      <div className="w-1.5 h-1.5" style={{ background: '#34d399', transform: 'rotate(45deg)' }} />
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

              // Artifact cards — removed, reasoning stepper handles diffs
              if (msg.type === 'artifact-cards') {
                return null;
              }


              // AI JP message — text with inline pill tokens
              if (msg.type === 'ai-jp') {
                const parts = msg.text.split(/(\{pill:[^}]+\})/g);
                return (
                  <div key={i} className="flex flex-col gap-3 items-start pb-4" style={{ paddingRight: 20 }}>
                    <div style={{ fontSize: 14, lineHeight: '24px', color: '#292524', margin: 0 }}>
                      {parts.map((part, pi) => {
                        const match = part.match(/^\{pill:(.+)\}$/);
                        if (match) {
                          const dec = getDecisionById(match[1]);
                          if (!dec) return null;
                          return (
                            <JPPill
                              key={pi}
                              decision={dec}
                              saved={jp.isDecisionPinned(dec.id)}
                              isSelected={jp.jpState.drawerDecisionId === dec.id}
                              onClick={(d) => {
                                const rect = document.querySelector(`[data-pill-id="${d.id}"]`)?.getBoundingClientRect();
                                if (rect) setJpPopover({ decision: d, anchorRect: rect, resultSet: msg.pills || [] });
                              }}
                              onMouseEnter={(e, d) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                clearTimeout(jpPopoverTimeout.current);
                                jpPopoverTimeout.current = setTimeout(() => {
                                  setJpPopover({ decision: d, anchorRect: rect, resultSet: msg.pills || [] });
                                }, 300);
                              }}
                              onMouseLeave={() => {
                                clearTimeout(jpPopoverTimeout.current);
                                jpPopoverTimeout.current = setTimeout(() => setJpPopover(null), 400);
                              }}
                            />
                          );
                        }
                        return <span key={pi}>{part}</span>;
                      })}
                    </div>
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
            <div style={{ position: 'relative' }}>
            {/* Slash command palette */}
            {chatInputValue.startsWith('/') && (
              <SlashCommandPalette
                query={chatInputValue.slice(1).trim()}
                scenarios={[...require('./data/demoScenarios').SCENARIO_LIST, ...TP_COMMAND_LIST]}
                onSelect={(cmd) => {
                  setChatInputValue('');
                  if (cmd.startsWith('tp-')) {
                    if (cmd === 'tp-help') {
                      setChatMessages(prev => [...prev, { type: 'ai', text: "Commandes Tiers payeurs disponibles :\n\n/tp-cr-globale--perte-de-chance — CR globale + perte de chance 30 % (droit de préférence)\n/tp-ligne--classique — Extraction ligne par ligne, 100 % (DSA par facture, IJ CPAM)\n/tp-cascade — Cascade AT/MP (rente capitalisée PGPF → IP → DFP)\n/tp-reset — Revenir au scénario de base" }]);
                    } else {
                      const newKey = TP_COMMAND_MAP[cmd];
                      if (newKey) {
                        setTpScenarioKey(newKey);
                        const sc = getTPScenario(newKey);
                        setChatMessages(prev => [...prev, { type: 'ai', text: sc.agentMessage }]);
                      }
                    }
                  } else {
                    jp.playScenario(cmd);
                  }
                }}
                onDismiss={() => setChatInputValue('')}
              />
            )}
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
              {/* Blocked indicator */}
              {chatBlocked && (
                <div className="flex items-center gap-2 px-3 py-1.5" style={{ borderBottom: '1px solid #e7e5e3' }}>
                  <ThinkingDots />
                  <span style={{ fontSize: 11, color: '#a8a29e' }}>Plato analyse vos documents...</span>
                </div>
              )}
              {/* Text area */}
              <div style={{ padding: '12px 12px 32px 12px' }}>
                <textarea
                  className="w-full text-[14px] resize-none focus:outline-none"
                  style={{ color: chatInputValue ? '#11181c' : '#78716c', lineHeight: '20px', minHeight: 20, maxHeight: 120, opacity: chatBlocked ? 0.5 : 1, cursor: chatBlocked ? 'not-allowed' : undefined }}
                  placeholder={chatBlocked ? 'Plato analyse vos documents...' : 'Demander à Plato Master de calculer, rechercher des JP, rédiger des actes...'}
                  value={chatInputValue}
                  onChange={(e) => { if (!chatBlocked) setChatInputValue(e.target.value); }}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (!chatBlocked) handleChatSend(); } }}
                  onFocus={() => setChatInputFocused(true)}
                  onBlur={() => setChatInputFocused(false)}
                  rows={1}
                  disabled={chatBlocked}
                />
              </div>

              {/* Bottom bar with actions */}
              <div
                className="flex items-center justify-between px-3 py-3"
                style={{
                  background: (hasContent && !chatBlocked) ? 'linear-gradient(to bottom, white 44.66%, #eeece6 100%)' : 'transparent',
                }}
              >
                <div className="flex items-center gap-0.5">
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-stone-100 transition-colors" disabled={chatBlocked} style={{ opacity: chatBlocked ? 0.4 : 1 }}>
                    <Paperclip className="w-4 h-4 text-[#78716c]" />
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-stone-100 transition-colors" disabled={chatBlocked} style={{ opacity: chatBlocked ? 0.4 : 1 }}>
                    <Lightbulb className="w-4 h-4 text-[#78716c]" />
                  </button>
                </div>
                <button
                  className="w-8 h-8 flex items-center justify-center rounded-lg transition-all"
                  style={{
                    backgroundColor: (hasContent && !chatBlocked) ? '#b9703f' : '#eeece6',
                    boxShadow: (hasContent && !chatBlocked) ? '0px 1px 2px 0px rgba(26,26,26,0.05)' : 'none',
                    opacity: (hasContent && !chatBlocked) ? 1 : 0.5,
                    cursor: (hasContent && !chatBlocked) ? 'pointer' : 'default',
                  }}
                  onClick={(hasContent && !chatBlocked) ? handleChatSend : undefined}
                >
                  <ArrowUp className="w-4 h-4" style={{ color: (hasContent && !chatBlocked) ? 'white' : '#78716c' }} />
                </button>
              </div>
            </div>
            </div>{/* close relative wrapper */}
          </div>
        </div>
      </>
    );
  };

  // ========== JP HELPERS ==========
  const jpPosteOptions = dossierPostes.map(pid => {
    const taxo = allTaxoPostes.find(p => p.id === pid);
    return taxo ? { id: pid, acronym: taxo.acronym, label: taxo.label } : null;
  }).filter(Boolean);

  // ========== CONTENT SUB-HEADER ==========
  const renderContentSubHeader = () => {
    if (!currentLevel) return null;

    // Poste level: back arrow + badge + title + CTA
    if (currentLevel.type === 'poste' && !currentLevel.subSection) {
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
            <button onClick={() => setShowExportModal(true)} className="h-8 flex items-center gap-2 px-4 text-[14px] font-medium text-white bg-[#292524] rounded-lg hover:bg-[#44403c] transition-colors" style={{ boxShadow: '0px 1px 2px 0px rgba(26,26,26,0.05)' }}>
              Copier chiffrage
            </button>
          </div>
        </div>
      );
    }

    // IV poste sub-header
    if (currentLevel.type === 'poste-iv') {
      const ivPosteTotal = getIvPosteMontant(currentLevel.id);
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
              <span className="inline-flex items-center px-2 py-0.5 text-caption bg-[#eeece6] text-[#78716c] rounded-full">Victimes indirectes</span>
            </div>
            <div className="flex items-center gap-3">
              <span style={serifAmountStyle} className="text-[#292524]">{fmt(ivPosteTotal)}</span>
            </div>
          </div>
        </div>
      );
    }

    // Cascade view sub-header
    if (currentLevel.type === 'cascade') {
      return (
        <div className="border-b border-[#e7e5e3] bg-white flex-shrink-0">
          <div className="h-[52px] px-4 flex items-center gap-3">
            <button onClick={() => navigateToStackLevel(navStack.length - 2)} className="p-1 hover:bg-stone-100 rounded transition-colors">
              <ChevronRight className="w-4 h-4 rotate-180 text-[#a8a29e]" strokeWidth={1.5} />
            </button>
            <span className="inline-flex items-center px-2 py-0.5 text-caption-medium font-semibold rounded-[6px]" style={{ backgroundColor: '#eeece6', color: '#44403c', border: 'none' }}>
              CASCADE
            </span>
            <span className="text-[14px] font-medium text-[#292524]">{currentLevel.fullTitle || 'Cascade d\'imputation'}</span>
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
              {data?.diffType && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-caption-medium rounded-full flex-shrink-0" style={{
                  background: data.diffType === 'add' ? '#dcfce7' : data.diffType === 'edit' ? '#fff7ed' : '#fef2f2',
                  color: ROW_DIFF_COLORS[data.diffType] || '#bd6c1a',
                }}>
                  {data.diffType === 'add' ? 'Ajout' : data.diffType === 'edit' ? 'Modif.' : 'Suppr.'}
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
                  // Diff helpers
                  const diffColor = data.diffType ? ROW_DIFF_COLORS[data.diffType] : null;
                  const diffLabel = data.diffType === 'add' ? 'Ligne ajoutée par l\'agent' : data.diffType === 'edit' ? 'Ligne modifiée par l\'agent' : data.diffType === 'delete' ? 'Ligne supprimée par l\'agent' : null;
                  const diffBg = data.diffType === 'add' ? '#f0fdf4' : data.diffType === 'edit' ? '#fff7ed' : data.diffType === 'delete' ? '#fef2f2' : null;
                  const diffBorder = data.diffType === 'add' ? '#bbf7d0' : data.diffType === 'edit' ? '#fed7aa' : data.diffType === 'delete' ? '#fecaca' : null;
                  const ov = data.oldValues || {};
                  const hasDiff = (key) => data.diffType === 'edit' && ov[key] != null;
                  const isDeleted = data.diffType === 'delete';

                  // IA extraction helpers
                  const isIaExtracted = data.confidence != null;
                  const needsValidation = data.status === 'pending';
                  const iaFieldClass = (fieldValue) => {
                    if (!isIaExtracted) return '';
                    if (fieldValue == null || fieldValue === '') return 'border-amber-400 bg-amber-50/50';
                    return '';
                  };

                  return (
                    <div className="space-y-5" style={isDeleted ? { opacity: 0.6, pointerEvents: 'none' } : undefined}>
                      {/* Diff banner */}
                      {diffColor && (
                        <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: diffBg, border: `1px solid ${diffBorder}` }}>
                          <div className="w-1.5 h-1.5" style={{ background: diffColor, transform: 'rotate(45deg)' }} />
                          <span style={{ fontSize: 12, fontWeight: 500, color: diffColor }}>{diffLabel}</span>
                        </div>
                      )}
                      {/* Bandeau IA si extraction */}
                      {isIaExtracted && !diffColor && (
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
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <label className="text-body-medium text-[#292524]">Libellé dépense</label>
                          {(data.diffType === 'add' || hasDiff('label')) && <div className="w-1.5 h-1.5 flex-shrink-0" style={{ background: diffColor, transform: 'rotate(45deg)' }} />}
                        </div>
                        <input
                          type="text"
                          defaultValue={data.label || ''}
                          id="edit-label"
                          placeholder="Nom de la dépense"
                          className={`w-full px-3 py-2 text-body border border-[#e7e5e3] rounded-lg bg-white focus:outline-none focus:border-[#292524] focus:shadow-[0_0_0_3px_rgba(163,163,163,0.5)] ${iaFieldClass(data.label)}`}
                          style={{ boxShadow: '0 1px 2px rgba(26,26,26,0.05)' }}
                        />
                        {hasDiff('label') && <p style={{ fontSize: 12, color: '#78716c', marginTop: 6, letterSpacing: '0.12px' }}>Ancien : {ov.label}</p>}
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
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <label id="dsa-ponctuelle-label" className="text-body-medium text-[#292524]">
                            {data.isPeriodique ? 'Date de début' : 'Date de la dépense'}
                          </label>
                          {(data.diffType === 'add' || hasDiff('date')) && <div className="w-1.5 h-1.5 flex-shrink-0" style={{ background: diffColor, transform: 'rotate(45deg)' }} />}
                        </div>
                        <div className="relative">
                          <input type="text" defaultValue={data.date || ''} id="edit-date"
                            placeholder="JJ/MM/AAAA" maxLength={10}
                            onChange={(e) => { e.target.value = formatDateInput(e.target.value); }}
                            className={`w-full px-3 py-2 pr-9 text-body border border-[#e7e5e3] rounded-lg bg-white focus:outline-none focus:border-[#292524] focus:shadow-[0_0_0_3px_rgba(163,163,163,0.5)] ${iaFieldClass(data.date)}`}
                            style={{ boxShadow: '0 1px 2px rgba(26,26,26,0.05)' }}
                          />
                          <input type="date" id="edit-date-picker" className="absolute inset-0 opacity-0 pointer-events-none" onChange={(e) => handleDatePick(e, 'edit-date')} />
                          <button type="button" onClick={() => openDatePicker('edit-date')} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 hover:bg-[#f5f5f4] rounded"><Calendar className="w-4 h-4 text-[#a8a29e]" /></button>
                        </div>
                        {hasDiff('date') && <p style={{ fontSize: 12, color: '#78716c', marginTop: 6, letterSpacing: '0.12px' }}>Ancien : {ov.date}</p>}
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
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <label className="text-body-medium text-[#292524]">Montant dépense</label>
                          {(data.diffType === 'add' || hasDiff('montant')) && <div className="w-1.5 h-1.5 flex-shrink-0" style={{ background: diffColor, transform: 'rotate(45deg)' }} />}
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#78716c]" style={{ fontSize: 14 }}>€</span>
                          <input
                            type="number"
                            step="0.01"
                            defaultValue={data.montant ?? ''}
                            id="edit-montant"
                            placeholder="0"
                            className={`w-full pl-8 pr-3 py-2 text-body border border-[#e7e5e3] rounded-lg bg-white focus:outline-none focus:border-[#292524] focus:shadow-[0_0_0_3px_rgba(163,163,163,0.5)] ${iaFieldClass(data.montant)}`}
                            style={{ boxShadow: '0 1px 2px rgba(26,26,26,0.05)' }}
                          />
                        </div>
                        {hasDiff('montant') && <p style={{ fontSize: 12, color: '#78716c', marginTop: 6, letterSpacing: '0.12px' }}>Ancien : {ov.montant} €</p>}
                      </div>

                      {/* Reste à charge */}
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <label className="text-body-medium text-[#292524]">Reste à charge</label>
                          {(data.diffType === 'add' || hasDiff('dejaRembourse')) && <div className="w-1.5 h-1.5 flex-shrink-0" style={{ background: diffColor, transform: 'rotate(45deg)' }} />}
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#78716c]" style={{ fontSize: 14 }}>€</span>
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
                
                {/* Panel IV ligne — Type A (one amount per VI) */}
                {editPanel.type === 'iv-ligne-a' && (
                  <div className="space-y-6">
                    {data?.hasIntitule && (
                      <div>
                        <h4 className="text-body-medium font-semibold text-[#292524] mb-3 pb-2 border-b">Intitulé du préjudice</h4>
                        <input type="text" id="iv-ligne-intitule" defaultValue={data?.intitule || ''} className="w-full px-3 py-2 border rounded-lg" placeholder="Décrivez le préjudice exceptionnel" />
                      </div>
                    )}
                    <div>
                      <h4 className="text-body-medium font-semibold text-[#292524] mb-3 pb-2 border-b">Montant</h4>
                      <div>
                        <label className="text-body-medium text-gray-700">Montant demandé</label>
                        <div className="relative mt-1">
                          <input type="number" id="iv-ligne-montant" defaultValue={data?.montant || ''} className="w-full px-3 py-2 border rounded-lg pr-8" placeholder="0" step="any" min="0" />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a8a29e] text-body">€</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Panel IV ligne — Type B (expense per VI) */}
                {editPanel.type === 'iv-ligne-b' && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-body-medium font-semibold text-[#292524] mb-3 pb-2 border-b">Description</h4>
                      <input type="text" id="iv-ligne-intitule" defaultValue={data?.intitule || ''} className="w-full px-3 py-2 border rounded-lg" placeholder="Ex : Déplacements hôpital, hébergement..." />
                    </div>
                    <div>
                      <h4 className="text-body-medium font-semibold text-[#292524] mb-3 pb-2 border-b">Montant</h4>
                      <div className="relative">
                        <input type="number" id="iv-ligne-montant" defaultValue={data?.montant || ''} className="w-full px-3 py-2 border rounded-lg pr-8" placeholder="0" step="any" min="0" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a8a29e] text-body">€</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Panel IV ligne — Type C (shared expense with attributions) */}
                {editPanel.type === 'iv-ligne-c' && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-body-medium font-semibold text-[#292524] mb-3 pb-2 border-b">Description</h4>
                      <input type="text" id="iv-ligne-label" defaultValue={data?.label || ''} className="w-full px-3 py-2 border rounded-lg" placeholder="Ex : Cercueil, cérémonie, monument..." />
                    </div>
                    <div>
                      <h4 className="text-body-medium font-semibold text-[#292524] mb-3 pb-2 border-b">Montant total</h4>
                      <div className="relative">
                        <input type="number" id="iv-ligne-total-amount" defaultValue={data?.totalAmount || ''} className="w-full px-3 py-2 border rounded-lg pr-8" placeholder="0" step="any" min="0" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a8a29e] text-body">€</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-body-medium font-semibold text-[#292524] mb-3 pb-2 border-b">Attributions par victime</h4>
                      <div className="space-y-2">
                        {victimesIndirectes.map(vi => {
                          const existing = (data?.attributions || []).find(a => a.viId === vi.id);
                          return (
                            <div key={vi.id} className="flex items-center gap-3">
                              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#f5f5f4' }}>
                                <span style={{ fontSize: 10, fontWeight: 600, color: '#78716c' }}>{`${(vi.prenom || '')[0] || ''}${(vi.nom || '')[0] || ''}`.toUpperCase()}</span>
                              </div>
                              <span className="flex-1 text-body text-[#44403c] truncate">{vi.prenom} {vi.nom}</span>
                              <div className="relative w-[100px]">
                                <input type="number" data-vi-attr={vi.id} defaultValue={existing?.amount || ''} className="w-full px-3 py-1.5 border rounded-lg pr-6 text-right text-body" placeholder="0" step="any" min="0" />
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[#a8a29e] text-caption">€</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Panel IV ligne — Type D (per-VI ventilation) */}
                {editPanel.type === 'iv-ligne-d' && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-body-medium font-semibold text-[#292524] mb-3 pb-2 border-b">Part individuelle</h4>
                      <div className="relative">
                        <input type="number" id="iv-ligne-part" defaultValue={data?.partIndividuelle || ''} className="w-full px-3 py-2 border rounded-lg pr-8" placeholder="0" step="1" min="0" max="100" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a8a29e] text-body">%</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-body-medium font-semibold text-[#292524] mb-3 pb-2 border-b">Durée d'indemnisation</h4>
                      <input type="text" id="iv-ligne-duree" defaultValue={data?.dureeIndemnisation || ''} className="w-full px-3 py-2 border rounded-lg" placeholder="Ex : Viager, jusqu'à 25 ans..." />
                    </div>
                    <div>
                      <h4 className="text-body-medium font-semibold text-[#292524] mb-3 pb-2 border-b">Coefficient de capitalisation</h4>
                      <input type="number" id="iv-ligne-coeff" defaultValue={data?.coeffCapitalisation || ''} className="w-full px-3 py-2 border rounded-lg" placeholder="0" step="0.1" min="0" />
                    </div>
                    {data?.perteAnnuelle > 0 && (data?.partIndividuelle > 0 || data?.coeffCapitalisation > 0) && (
                      <div className="p-3 bg-[#fafaf9] rounded-lg border border-[#e7e5e3]">
                        <span style={{ fontSize: 12, color: '#78716c' }}>
                          Calcul : {fmt(data.perteAnnuelle)} x {data.partIndividuelle || 0}% x {data.coeffCapitalisation || 0} = {fmt(data.perteAnnuelle * (data.partIndividuelle / 100) * data.coeffCapitalisation)}
                        </span>
                      </div>
                    )}
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
                {editPanel.type === 'pgpa-revenu' && (() => {
                  const pgpaRevInputCls = "w-full px-3 py-2 text-body border border-[#e7e5e3] rounded-lg bg-white focus:outline-none focus:border-[#292524] focus:shadow-[0_0_0_3px_rgba(163,163,163,0.5)]";
                  const pgpaRevInputShadow = { boxShadow: '0 1px 2px rgba(26,26,26,0.05)' };
                  return (
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
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <label className="text-body-medium text-[#292524]">Type</label>
                          </div>
                          <select id="pgpa-revenu-type" defaultValue={data.type || 'revenu'} className={pgpaRevInputCls} style={pgpaRevInputShadow}>
                            <option value="revenu">Revenu professionnel</option>
                            <option value="gain">Gain supplémentaire (prime, indemnité...)</option>
                          </select>
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <label className="text-body-medium text-[#292524]">Intitulé</label>
                          </div>
                          <input id="pgpa-revenu-label" type="text" defaultValue={data.label || ''} placeholder="Ex: Salaire net imposable" className={pgpaRevInputCls} style={pgpaRevInputShadow} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <label className="text-body-medium text-[#292524]">Année</label>
                            </div>
                            <input id="pgpa-revenu-annee" type="text" defaultValue={data.annee || ''} placeholder="2022" className={pgpaRevInputCls} style={pgpaRevInputShadow} />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <label className="text-body-medium text-[#292524]">Unité de temps</label>
                            </div>
                            <select id="pgpa-revenu-unite" defaultValue={data.unite || 'annuel'} className={pgpaRevInputCls} style={pgpaRevInputShadow}>
                              <option value="annuel">Annuel</option>
                              <option value="mensuel">Mensuel</option>
                              <option value="journalier">Journalier</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <label className="text-body-medium text-[#292524]">Commentaire</label>
                          </div>
                          <textarea id="pgpa-revenu-commentaire" rows={2} defaultValue={data.commentaire || ''} placeholder="Informations complémentaires..." className={`${pgpaRevInputCls} resize-none`} style={pgpaRevInputShadow} />
                        </div>
                      </div>
                    </div>

                    {/* Section Montants */}
                    <div>
                      <h4 className="text-body-medium font-semibold text-[#292524] mb-3 pb-2 border-b">Montants</h4>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <label className="text-body-medium text-[#292524]">Revenu net payé</label>
                            </div>
                            <div className="relative">
                              <input id="pgpa-revenu-montant" type="number" step="0.01" defaultValue={data.montant || ''} readOnly className={`${pgpaRevInputCls} pr-8 bg-[#F8F7F5] text-[#78716c] cursor-default`} style={pgpaRevInputShadow} />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a8a29e] text-body">€</span>
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <label className="text-body-medium text-[#292524]">Montant revalorisé</label>
                            </div>
                            <div className="relative">
                              <input id="pgpa-revenu-revalorise" type="number" step="0.01" defaultValue={data.revalorise || ''} className={`${pgpaRevInputCls} pr-8 bg-[#F8F7F5] font-medium`} style={pgpaRevInputShadow} readOnly />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a8a29e] text-body">€</span>
                            </div>
                            <p style={{ fontSize: 12, color: '#78716c', marginTop: 6, letterSpacing: '0.12px' }}>Calculé automatiquement selon le barème</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-[#F8F7F5] rounded-lg border">
                          <div className="flex items-center gap-3">
                            <input type="checkbox" id="pgpa-revenu-revalo-checkbox" defaultChecked={data.aRevaloriser !== false} className="rounded text-blue-600" />
                            <label htmlFor="pgpa-revenu-revalo-checkbox" className="text-body-medium text-[#292524]">Appliquer la revalorisation</label>
                          </div>
                          <div className="text-body text-[#78716c]">
                            {pgpaData.revenuRef.revalorisation === 'ipc-annuel' ? 'IPC annuel' : pgpaData.revenuRef.revalorisation === 'smic-horaire' ? 'SMIC horaire' : 'Aucune'} · Quotient : <span className="font-medium">1.04</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  );})()}
                
                {/* Panel PGPA - Revenu perçu période */}
                {editPanel.type === 'pgpa-revenu-percu' && (() => {
                  const prcDiffColor = data.diffType ? ROW_DIFF_COLORS[data.diffType] : null;
                  const prcDiffLabel = data.diffType === 'add' ? 'Ligne ajoutée par l\'agent' : data.diffType === 'edit' ? 'Ligne modifiée par l\'agent' : data.diffType === 'delete' ? 'Ligne supprimée par l\'agent' : null;
                  const prcDiffBg = data.diffType === 'add' ? '#f0fdf4' : data.diffType === 'edit' ? '#fff7ed' : '#fef2f2';
                  const prcDiffBorder = data.diffType === 'add' ? '#bbf7d0' : data.diffType === 'edit' ? '#fed7aa' : '#fecaca';
                  const prcOv = data.oldValues || {};
                  const prcHasDiff = (key) => data.diffType === 'edit' && prcOv[key] != null;
                  const prcInputCls = "w-full px-3 py-2 text-body border border-[#e7e5e3] rounded-lg bg-white focus:outline-none focus:border-[#292524] focus:shadow-[0_0_0_3px_rgba(163,163,163,0.5)]";
                  const prcInputShadow = { boxShadow: '0 1px 2px rgba(26,26,26,0.05)' };
                  const prcDescP = (text) => <p style={{ fontSize: 12, color: '#78716c', marginTop: 6, letterSpacing: '0.12px' }}>Ancien : {text}</p>;
                  return (
                  <div className="space-y-6" style={data.diffType === 'delete' ? { opacity: 0.6, pointerEvents: 'none' } : undefined}>
                    {prcDiffColor && (
                      <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: prcDiffBg, border: `1px solid ${prcDiffBorder}` }}>
                        <div className="w-1.5 h-1.5" style={{ background: prcDiffColor, transform: 'rotate(45deg)' }} />
                        <span style={{ fontSize: 12, fontWeight: 500, color: prcDiffColor }}>{prcDiffLabel}</span>
                      </div>
                    )}

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
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <label className="text-body-medium text-[#292524]">Intitulé</label>
                            {(data.diffType === 'add' || prcHasDiff('label')) && <div className="w-1.5 h-1.5 flex-shrink-0" style={{ background: prcDiffColor, transform: 'rotate(45deg)' }} />}
                          </div>
                          <input id="pgpa-percu-label" type="text" defaultValue={data.label || ''} placeholder="Ex: Maintien de salaire partiel" className={prcInputCls} style={prcInputShadow} />
                          {prcHasDiff('label') && prcDescP(prcOv.label)}
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <label className="text-body-medium text-[#292524]">Organisme / Tiers</label>
                            {(data.diffType === 'add' || prcHasDiff('tiers')) && <div className="w-1.5 h-1.5 flex-shrink-0" style={{ background: prcDiffColor, transform: 'rotate(45deg)' }} />}
                          </div>
                          <input id="pgpa-percu-tiers" type="text" defaultValue={data.tiers || ''} placeholder="Ex: Employeur, Prévoyance..." className={prcInputCls} style={prcInputShadow} />
                          {prcHasDiff('tiers') && prcDescP(prcOv.tiers)}
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <label className="text-body-medium text-[#292524]">Commentaire</label>
                          </div>
                          <textarea id="pgpa-percu-commentaire" rows={2} defaultValue={data.commentaire || ''} placeholder="Informations complémentaires..." className={`${prcInputCls} resize-none`} style={prcInputShadow} />
                        </div>
                      </div>
                    </div>

                    {/* Section Période */}
                    <div>
                      <h4 className="text-body-medium font-semibold text-[#292524] mb-3 pb-2 border-b">Période</h4>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <label className="text-body-medium text-[#292524]">Date de début</label>
                              {(data.diffType === 'add' || prcHasDiff('periodeDebut')) && <div className="w-1.5 h-1.5 flex-shrink-0" style={{ background: prcDiffColor, transform: 'rotate(45deg)' }} />}
                            </div>
                            <div className="relative">
                              <input id="pgpa-percu-debut" type="text" defaultValue={data.periodeDebut || ''} placeholder="JJ/MM/AAAA" maxLength={10} onChange={(e) => { e.target.value = formatDateInput(e.target.value); }} className={`${prcInputCls} pr-9`} style={prcInputShadow} />
                              <input type="date" id="pgpa-percu-debut-picker" className="absolute inset-0 opacity-0 pointer-events-none" onChange={(e) => handleDatePick(e, 'pgpa-percu-debut')} />
                              <button type="button" onClick={() => openDatePicker('pgpa-percu-debut')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-[#eeece6] rounded"><Calendar className="w-4 h-4 text-[#a8a29e]" /></button>
                            </div>
                            {prcHasDiff('periodeDebut') && prcDescP(prcOv.periodeDebut)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <label className="text-body-medium text-[#292524]">Date de fin</label>
                              {(data.diffType === 'add' || prcHasDiff('periodeFin')) && <div className="w-1.5 h-1.5 flex-shrink-0" style={{ background: prcDiffColor, transform: 'rotate(45deg)' }} />}
                            </div>
                            <div className="relative">
                              <input id="pgpa-percu-fin" type="text" defaultValue={data.periodeFin || ''} placeholder="JJ/MM/AAAA" maxLength={10} onChange={(e) => { e.target.value = formatDateInput(e.target.value); }} className={`${prcInputCls} pr-9`} style={prcInputShadow} />
                              <input type="date" id="pgpa-percu-fin-picker" className="absolute inset-0 opacity-0 pointer-events-none" onChange={(e) => handleDatePick(e, 'pgpa-percu-fin')} />
                              <button type="button" onClick={() => openDatePicker('pgpa-percu-fin')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-[#eeece6] rounded"><Calendar className="w-4 h-4 text-[#a8a29e]" /></button>
                            </div>
                            {prcHasDiff('periodeFin') && prcDescP(prcOv.periodeFin)}
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
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <label className="text-body-medium text-[#292524]">Revenu perçu net</label>
                              {(data.diffType === 'add' || prcHasDiff('montant')) && <div className="w-1.5 h-1.5 flex-shrink-0" style={{ background: prcDiffColor, transform: 'rotate(45deg)' }} />}
                            </div>
                            <div className="relative">
                              <input id="pgpa-percu-montant" type="number" step="0.01" defaultValue={data.montant || ''} readOnly className={`${prcInputCls} pr-8 bg-[#F8F7F5] text-[#78716c] cursor-default`} style={prcInputShadow} />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a8a29e] text-body">€</span>
                            </div>
                            {prcHasDiff('montant') && prcDescP(`${prcOv.montant} €`)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <label className="text-body-medium text-[#292524]">Unité de temps</label>
                              {(data.diffType === 'add' || prcHasDiff('unite')) && <div className="w-1.5 h-1.5 flex-shrink-0" style={{ background: prcDiffColor, transform: 'rotate(45deg)' }} />}
                            </div>
                            <select id="pgpa-percu-unite" defaultValue={data.unite || 'total'} className={prcInputCls} style={prcInputShadow}>
                              <option value="total">Total période</option>
                              <option value="mensuel">Par mois</option>
                              <option value="journalier">Par jour</option>
                            </select>
                            {prcHasDiff('unite') && prcDescP(prcOv.unite)}
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-[#F8F7F5] rounded-lg border">
                          <div className="flex items-center gap-3">
                            <input type="checkbox" id="pgpa-percu-no-revalo" defaultChecked={data.noRevalo || false} className="rounded text-blue-600" />
                            <label htmlFor="pgpa-percu-no-revalo" className="text-body-medium text-[#292524]">Montant à ne pas revaloriser</label>
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
                  );})()}
                
                {/* Panel PGPA - Indemnités journalières */}
                {editPanel.type === 'pgpa-ij' && (() => {
                  const ijDiffColor = data.diffType ? ROW_DIFF_COLORS[data.diffType] : null;
                  const ijDiffLabel = data.diffType === 'add' ? 'Ligne ajoutée par l\'agent' : data.diffType === 'edit' ? 'Ligne modifiée par l\'agent' : data.diffType === 'delete' ? 'Ligne supprimée par l\'agent' : null;
                  const ijDiffBg = data.diffType === 'add' ? '#f0fdf4' : data.diffType === 'edit' ? '#fff7ed' : '#fef2f2';
                  const ijDiffBorder = data.diffType === 'add' ? '#bbf7d0' : data.diffType === 'edit' ? '#fed7aa' : '#fecaca';
                  const ijOv = data.oldValues || {};
                  const ijHasDiff = (key) => data.diffType === 'edit' && ijOv[key] != null;
                  const ijInputCls = "w-full px-3 py-2 text-body border border-[#e7e5e3] rounded-lg bg-white focus:outline-none focus:border-[#292524] focus:shadow-[0_0_0_3px_rgba(163,163,163,0.5)]";
                  const ijInputShadow = { boxShadow: '0 1px 2px rgba(26,26,26,0.05)' };
                  const ijDescP = (text) => <p style={{ fontSize: 12, color: '#78716c', marginTop: 6, letterSpacing: '0.12px' }}>Ancien : {text}</p>;
                  return (
                  <div className="space-y-6" style={data.diffType === 'delete' ? { opacity: 0.6, pointerEvents: 'none' } : undefined}>
                    {ijDiffColor && (
                      <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: ijDiffBg, border: `1px solid ${ijDiffBorder}` }}>
                        <div className="w-1.5 h-1.5" style={{ background: ijDiffColor, transform: 'rotate(45deg)' }} />
                        <span style={{ fontSize: 12, fontWeight: 500, color: ijDiffColor }}>{ijDiffLabel}</span>
                      </div>
                    )}

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
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <label className="text-body-medium text-[#292524]">Organisme</label>
                            {(data.diffType === 'add' || ijHasDiff('tiers')) && <div className="w-1.5 h-1.5 flex-shrink-0" style={{ background: ijDiffColor, transform: 'rotate(45deg)' }} />}
                          </div>
                          <select id="pgpa-ij-tiers" defaultValue={data.tiers || ''} className={ijInputCls} style={ijInputShadow}>
                            <option value="">— Sélectionner —</option>
                            {chiffrageParams.tiersPayeurs.map((t, i) => (
                              <option key={i} value={t}>{t}</option>
                            ))}
                            <option value="autre">Autre...</option>
                          </select>
                          {ijHasDiff('tiers') && ijDescP(ijOv.tiers)}
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <label className="text-body-medium text-[#292524]">Libellé / Description</label>
                            {(data.diffType === 'add' || ijHasDiff('label')) && <div className="w-1.5 h-1.5 flex-shrink-0" style={{ background: ijDiffColor, transform: 'rotate(45deg)' }} />}
                          </div>
                          <input id="pgpa-ij-label" type="text" defaultValue={data.label || ''} placeholder="Ex: IJ Sécurité sociale" className={ijInputCls} style={ijInputShadow} />
                          {ijHasDiff('label') && ijDescP(ijOv.label)}
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <label className="text-body-medium text-[#292524]">Commentaire</label>
                          </div>
                          <textarea id="pgpa-ij-commentaire" rows={2} defaultValue={data.commentaire || ''} placeholder="Informations complémentaires..." className={`${ijInputCls} resize-none`} style={ijInputShadow} />
                        </div>
                      </div>
                    </div>

                    {/* Section Période d'arrêt */}
                    <div>
                      <h4 className="text-body-medium font-semibold text-[#292524] mb-3 pb-2 border-b">Période d'arrêt de travail</h4>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <label className="text-body-medium text-[#292524]">Date de début</label>
                              {(data.diffType === 'add' || ijHasDiff('periodeDebut')) && <div className="w-1.5 h-1.5 flex-shrink-0" style={{ background: ijDiffColor, transform: 'rotate(45deg)' }} />}
                            </div>
                            <div className="relative">
                              <input id="pgpa-ij-debut" type="text" defaultValue={data.periodeDebut || ''} placeholder="JJ/MM/AAAA" maxLength={10} onChange={(e) => { e.target.value = formatDateInput(e.target.value); }} className={`${ijInputCls} pr-9`} style={ijInputShadow} />
                              <input type="date" id="pgpa-ij-debut-picker" className="absolute inset-0 opacity-0 pointer-events-none" onChange={(e) => handleDatePick(e, 'pgpa-ij-debut')} />
                              <button type="button" onClick={() => openDatePicker('pgpa-ij-debut')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-[#eeece6] rounded"><Calendar className="w-4 h-4 text-[#a8a29e]" /></button>
                            </div>
                            {ijHasDiff('periodeDebut') && ijDescP(ijOv.periodeDebut)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <label className="text-body-medium text-[#292524]">Date de fin</label>
                              {(data.diffType === 'add' || ijHasDiff('periodeFin')) && <div className="w-1.5 h-1.5 flex-shrink-0" style={{ background: ijDiffColor, transform: 'rotate(45deg)' }} />}
                            </div>
                            <div className="relative">
                              <input id="pgpa-ij-fin" type="text" defaultValue={data.periodeFin || ''} placeholder="JJ/MM/AAAA" maxLength={10} onChange={(e) => { e.target.value = formatDateInput(e.target.value); }} className={`${ijInputCls} pr-9`} style={ijInputShadow} />
                              <input type="date" id="pgpa-ij-fin-picker" className="absolute inset-0 opacity-0 pointer-events-none" onChange={(e) => handleDatePick(e, 'pgpa-ij-fin')} />
                              <button type="button" onClick={() => openDatePicker('pgpa-ij-fin')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-[#eeece6] rounded"><Calendar className="w-4 h-4 text-[#a8a29e]" /></button>
                            </div>
                            {ijHasDiff('periodeFin') && ijDescP(ijOv.periodeFin)}
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
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <label className="text-body-medium text-[#292524]">Indemnité brute perçue</label>
                              {(data.diffType === 'add' || ijHasDiff('montantBrut')) && <div className="w-1.5 h-1.5 flex-shrink-0" style={{ background: ijDiffColor, transform: 'rotate(45deg)' }} />}
                            </div>
                            <div className="relative">
                              <input id="pgpa-ij-brut" type="number" step="0.01" defaultValue={data.montantBrut || ''} placeholder="0.00" className={`${ijInputCls} pr-8`} style={ijInputShadow} />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a8a29e] text-body">€</span>
                            </div>
                            {ijHasDiff('montantBrut') && ijDescP(`${ijOv.montantBrut} €`)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <label className="text-body-medium text-[#292524]">CSG-CRDS</label>
                              {(data.diffType === 'add' || ijHasDiff('csgCrds')) && <div className="w-1.5 h-1.5 flex-shrink-0" style={{ background: ijDiffColor, transform: 'rotate(45deg)' }} />}
                            </div>
                            <div className="relative">
                              <input id="pgpa-ij-csg" type="number" step="0.01" defaultValue={data.csgCrds || ''} placeholder="0.00" className={`${ijInputCls} pr-8`} style={ijInputShadow} />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a8a29e] text-body">€</span>
                            </div>
                            {ijHasDiff('csgCrds') && ijDescP(`${ijOv.csgCrds} €`)}
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
                  );})()}

                {/* Panel DFT */}
                {editPanel.type === 'dft-ligne' && (() => {
                  const dftDiffColor = data.diffType ? ROW_DIFF_COLORS[data.diffType] : null;
                  const dftDiffLabel = data.diffType === 'add' ? 'Ligne ajoutée par l\'agent' : data.diffType === 'edit' ? 'Ligne modifiée par l\'agent' : data.diffType === 'delete' ? 'Ligne supprimée par l\'agent' : null;
                  const dftDiffBg = data.diffType === 'add' ? '#f0fdf4' : data.diffType === 'edit' ? '#fff7ed' : '#fef2f2';
                  const dftDiffBorder = data.diffType === 'add' ? '#bbf7d0' : data.diffType === 'edit' ? '#fed7aa' : '#fecaca';
                  const dftOv = data.oldValues || {};
                  const dftHasDiff = (key) => data.diffType === 'edit' && dftOv[key] != null;
                  const inputShadow = { boxShadow: '0 1px 2px rgba(26,26,26,0.05)' };
                  const inputCls = "w-full px-3 py-2 text-body border border-[#e7e5e3] rounded-lg bg-white focus:outline-none focus:border-[#292524] focus:shadow-[0_0_0_3px_rgba(163,163,163,0.5)]";
                  const descP = (text) => <p style={{ fontSize: 12, color: '#78716c', marginTop: 6, letterSpacing: '0.12px' }}>Ancien : {text}</p>;
                  return (
                  <div className="space-y-5" style={data.diffType === 'delete' ? { opacity: 0.6, pointerEvents: 'none' } : undefined}>
                    {dftDiffColor && (
                      <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: dftDiffBg, border: `1px solid ${dftDiffBorder}` }}>
                        <div className="w-1.5 h-1.5" style={{ background: dftDiffColor, transform: 'rotate(45deg)' }} />
                        <span style={{ fontSize: 12, fontWeight: 500, color: dftDiffColor }}>{dftDiffLabel}</span>
                      </div>
                    )}

                    {/* Libellé dépense */}
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <label className="text-body-medium text-[#292524]">Libellé dépense</label>
                        {(data.diffType === 'add' || dftHasDiff('label')) && <div className="w-1.5 h-1.5 flex-shrink-0" style={{ background: dftDiffColor, transform: 'rotate(45deg)' }} />}
                      </div>
                      <input type="text" id="dft-label" defaultValue={data.label || ''} placeholder="Nom de la période"
                        className={inputCls} style={inputShadow} />
                      {dftHasDiff('label') && descP(dftOv.label)}
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
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <label className="text-body-medium text-[#292524]">Date de début</label>
                          {(data.diffType === 'add' || dftHasDiff('debut')) && <div className="w-1.5 h-1.5 flex-shrink-0" style={{ background: dftDiffColor, transform: 'rotate(45deg)' }} />}
                        </div>
                        <div className="relative">
                          <input type="text" id="dft-debut" defaultValue={data.debut} className={`${inputCls} pr-9`} style={inputShadow} placeholder="JJ/MM/AAAA" maxLength={10} onChange={(e) => { e.target.value = formatDateInput(e.target.value); }} />
                          <input type="date" id="dft-debut-picker" className="absolute inset-0 opacity-0 pointer-events-none" onChange={(e) => handleDatePick(e, 'dft-debut')} />
                          <button type="button" onClick={() => openDatePicker('dft-debut')} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 hover:bg-[#f5f5f4] rounded"><Calendar className="w-4 h-4 text-[#a8a29e]" /></button>
                        </div>
                        {dftHasDiff('debut') && descP(dftOv.debut)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <label className="text-body-medium text-[#292524]">Date de fin</label>
                          {(data.diffType === 'add' || dftHasDiff('fin')) && <div className="w-1.5 h-1.5 flex-shrink-0" style={{ background: dftDiffColor, transform: 'rotate(45deg)' }} />}
                        </div>
                        <div className="relative">
                          <input type="text" id="dft-fin" defaultValue={data.fin} className={`${inputCls} pr-9`} style={inputShadow} placeholder="JJ/MM/AAAA" maxLength={10} onChange={(e) => { e.target.value = formatDateInput(e.target.value); }} />
                          <input type="date" id="dft-fin-picker" className="absolute inset-0 opacity-0 pointer-events-none" onChange={(e) => handleDatePick(e, 'dft-fin')} />
                          <button type="button" onClick={() => openDatePicker('dft-fin')} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 hover:bg-[#f5f5f4] rounded"><Calendar className="w-4 h-4 text-[#a8a29e]" /></button>
                        </div>
                        {dftHasDiff('fin') && descP(dftOv.fin)}
                      </div>
                    </div>
                    <div className="text-caption text-[#78716c] italic -mt-3">
                      Durée : {data.jours || '—'} jours
                    </div>

                    {/* Base journalière + % DFT side by side */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <label className="text-body-medium text-[#292524]">Base journalière</label>
                          {(data.diffType === 'add' || dftHasDiff('base')) && <div className="w-1.5 h-1.5 flex-shrink-0" style={{ background: dftDiffColor, transform: 'rotate(45deg)' }} />}
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a8a29e] text-body">€</span>
                          <input type="number" id="dft-base" defaultValue={chiffrageParams.baseJournaliereDFT || 33}
                            className={`${inputCls} pl-8`} style={inputShadow} />
                        </div>
                        {dftHasDiff('base') && descP(`${dftOv.base} €`)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <label className="text-body-medium text-[#292524]">% de DFT</label>
                          {(data.diffType === 'add' || dftHasDiff('taux')) && <div className="w-1.5 h-1.5 flex-shrink-0" style={{ background: dftDiffColor, transform: 'rotate(45deg)' }} />}
                        </div>
                        <div className="relative">
                          <input type="number" id="dft-taux" defaultValue={data.taux || 100} min={0} max={100}
                            className={`${inputCls} pr-8`} style={inputShadow} />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a8a29e] text-body">%</span>
                        </div>
                        {dftHasDiff('taux') && descP(`${dftOv.taux}%`)}
                      </div>
                    </div>

                    {/* Commentaire hidden */}
                    <input type="hidden" id="dft-commentaire" value={data.commentaire || ''} />
                  </div>
                  );})()}

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
                  <button onClick={() => { handleRejectLigne(data.id); setEditPanel(null); }} className="px-4 py-2 text-[#c45555] border border-[#fecaca] bg-white hover:bg-[#fef2f2] rounded-lg text-body-medium transition-colors">
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
                    }} className="px-4 py-2 text-[#c45555] border border-[#fecaca] bg-white hover:bg-[#fef2f2] rounded-lg text-body-medium transition-colors">
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
                      const affectedPostes = ivDossierPostes.filter(pid =>
                        (ivPosteData[pid]?.lignes || []).some(l => l.victimeId === data.id && l.montant > 0)
                      );
                      const msg = affectedPostes.length > 0
                        ? `${data.prenom} ${data.nom} a des montants chiffrés sur ${affectedPostes.length} poste(s). Supprimer ?`
                        : `Supprimer ${data.prenom} ${data.nom} ?`;
                      if (!window.confirm(msg)) return;
                      setVictimesIndirectes(prev => prev.filter(vi => vi.id !== data.id));
                      // Clean up IV poste data for this victim
                      setIvPosteData(prev => {
                        const next = { ...prev };
                        for (const pid of Object.keys(next)) {
                          if (next[pid]?.lignes) {
                            next[pid] = { ...next[pid], lignes: next[pid].lignes.filter(l => l.victimeId !== data.id) };
                          }
                        }
                        return next;
                      });
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
                      // Duplicate detection
                      const isDuplicate = victimesIndirectes.some(vi =>
                        vi.id !== newVi.id &&
                        vi.nom.toLowerCase() === newVi.nom.toLowerCase() &&
                        vi.prenom.toLowerCase() === newVi.prenom.toLowerCase() &&
                        vi.lien === newVi.lien &&
                        vi.dateNaissance === newVi.dateNaissance
                      );
                      if (isDuplicate) {
                        if (!window.confirm('Une victime indirecte avec ces informations existe déjà. Continuer ?')) return;
                      }
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
              {/* IV ligne save — Type A */}
              {editPanel.type === 'iv-ligne-a' && (
                <div className="px-5 py-4 flex justify-end gap-2">
                  <button onClick={() => setEditPanel(null)} className="px-4 py-2 text-[#44403c] hover:bg-[#f5f5f4] rounded-lg text-body-medium transition-colors">Annuler</button>
                  <button onClick={() => {
                    const montant = parseFloat(document.getElementById('iv-ligne-montant')?.value) || 0;
                    const intitule = document.getElementById('iv-ligne-intitule')?.value || '';
                    const { victimeId, posteId, pieceIds = [] } = data;
                    setIvPosteData(prev => {
                      const existing = prev[posteId]?.lignes || [];
                      const ligneIdx = existing.findIndex(l => l.victimeId === victimeId);
                      const newLigne = { victimeId, montant, pieceIds, intitule };
                      const newLignes = ligneIdx >= 0
                        ? existing.map((l, i) => i === ligneIdx ? newLigne : l)
                        : [...existing, newLigne];
                      return { ...prev, [posteId]: { ...prev[posteId], lignes: newLignes } };
                    });
                    setEditPanel(null);
                  }} className="px-4 py-2 bg-[#292524] text-white rounded-lg hover:bg-[#44403c] text-body-medium transition-colors">Enregistrer</button>
                </div>
              )}
              {/* IV ligne save — Type B */}
              {editPanel.type === 'iv-ligne-b' && (
                <div className="px-5 py-4 flex justify-end gap-2">
                  <button onClick={() => setEditPanel(null)} className="px-4 py-2 text-[#44403c] hover:bg-[#f5f5f4] rounded-lg text-body-medium transition-colors">Annuler</button>
                  <button onClick={() => {
                    const montant = parseFloat(document.getElementById('iv-ligne-montant')?.value) || 0;
                    const intitule = document.getElementById('iv-ligne-intitule')?.value || '';
                    const { id, victimeId, posteId, pieceIds = [] } = data;
                    setIvPosteData(prev => {
                      const existing = prev[posteId]?.lignes || [];
                      const ligneIdx = existing.findIndex(l => l.id === id);
                      const newLigne = { id: id || crypto.randomUUID(), victimeId, montant, pieceIds, intitule };
                      const newLignes = ligneIdx >= 0
                        ? existing.map((l, i) => i === ligneIdx ? newLigne : l)
                        : [...existing, newLigne];
                      return { ...prev, [posteId]: { ...prev[posteId], lignes: newLignes } };
                    });
                    setEditPanel(null);
                  }} className="px-4 py-2 bg-[#292524] text-white rounded-lg hover:bg-[#44403c] text-body-medium transition-colors">Enregistrer</button>
                </div>
              )}
              {/* IV ligne save — Type C */}
              {editPanel.type === 'iv-ligne-c' && (
                <div className="px-5 py-4 flex justify-end gap-2">
                  <button onClick={() => setEditPanel(null)} className="px-4 py-2 text-[#44403c] hover:bg-[#f5f5f4] rounded-lg text-body-medium transition-colors">Annuler</button>
                  <button onClick={() => {
                    const totalAmount = parseFloat(document.getElementById('iv-ligne-total-amount')?.value) || 0;
                    const label = document.getElementById('iv-ligne-label')?.value || '';
                    const { id, posteId, pieceIds = [] } = data;
                    const attributions = [];
                    document.querySelectorAll('[data-vi-attr]').forEach(el => {
                      const amount = parseFloat(el.value) || 0;
                      if (amount > 0) attributions.push({ viId: el.dataset.viAttr, amount });
                    });
                    setIvPosteData(prev => {
                      const existing = prev[posteId]?.lignes || [];
                      const ligneIdx = existing.findIndex(l => l.id === id);
                      const newLigne = { id: id || crypto.randomUUID(), label, totalAmount, pieceIds, attributions };
                      const newLignes = ligneIdx >= 0
                        ? existing.map((l, i) => i === ligneIdx ? newLigne : l)
                        : [...existing, newLigne];
                      return { ...prev, [posteId]: { ...prev[posteId], lignes: newLignes } };
                    });
                    setEditPanel(null);
                  }} className="px-4 py-2 bg-[#292524] text-white rounded-lg hover:bg-[#44403c] text-body-medium transition-colors">Enregistrer</button>
                </div>
              )}
              {/* IV ligne save — Type D */}
              {editPanel.type === 'iv-ligne-d' && (
                <div className="px-5 py-4 flex justify-end gap-2">
                  <button onClick={() => setEditPanel(null)} className="px-4 py-2 text-[#44403c] hover:bg-[#f5f5f4] rounded-lg text-body-medium transition-colors">Annuler</button>
                  <button onClick={() => {
                    const partIndividuelle = parseFloat(document.getElementById('iv-ligne-part')?.value) || 0;
                    const dureeIndemnisation = document.getElementById('iv-ligne-duree')?.value || '';
                    const coeffCapitalisation = parseFloat(document.getElementById('iv-ligne-coeff')?.value) || 0;
                    const { victimeId, posteId, perteAnnuelle } = data;
                    const montant = perteAnnuelle * (partIndividuelle / 100) * coeffCapitalisation;
                    setIvPosteData(prev => {
                      const existing = prev[posteId]?.lignes || [];
                      const ligneIdx = existing.findIndex(l => l.victimeId === victimeId);
                      const newLigne = { victimeId, montant, partIndividuelle, dureeIndemnisation, coeffCapitalisation };
                      const newLignes = ligneIdx >= 0
                        ? existing.map((l, i) => i === ligneIdx ? newLigne : l)
                        : [...existing, newLigne];
                      return { ...prev, [posteId]: { ...prev[posteId], lignes: newLignes } };
                    });
                    setEditPanel(null);
                  }} className="px-4 py-2 bg-[#292524] text-white rounded-lg hover:bg-[#44403c] text-body-medium transition-colors">Enregistrer</button>
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
                  }} className="px-4 py-2 text-[#c45555] border border-[#fecaca] bg-white hover:bg-[#fef2f2] rounded-lg text-body-medium transition-colors">
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
                  }} className="px-4 py-2 text-[#c45555] border border-[#fecaca] bg-white hover:bg-[#fef2f2] rounded-lg text-body-medium transition-colors">
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
                  }} className="px-4 py-2 text-[#c45555] border border-[#fecaca] bg-white hover:bg-[#fef2f2] rounded-lg text-body-medium transition-colors">
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
                  }} className="px-4 py-2 text-[#c45555] border border-[#fecaca] bg-white hover:bg-[#fef2f2] rounded-lg text-body-medium transition-colors">
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

  // Diff color for a line
  const getDiffColor = (ligne) => ligne.diffType ? ROW_DIFF_COLORS[ligne.diffType] : null;

  // ========== DSA LIGNE COMPONENT ==========
  const _renderDsaLigne = (ligne) => { // eslint-disable-line no-unused-vars
    const diffColor = getDiffColor(ligne);
    const pieceCount = ligne.pieceIds?.length || 0;

    // Diff indicator dot
    const DiffIndicator = () => {
      if (!diffColor) return null;
      return <div className="w-1.5 h-1.5 flex-shrink-0" style={{ background: diffColor, transform: 'rotate(45deg)' }} />;
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
        {diffColor && <div className="absolute inset-0 pointer-events-none rounded-[inherit]" style={{ boxShadow: `inset 2px 0 0 0 ${diffColor}` }} />}
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <DiffIndicator />
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
    const diffColor = getDiffColor(ligne);
    const pieceCount = ligne.pieceIds?.length || 0;

    // Diff indicator dot
    const DiffIndicator = () => {
      if (!diffColor) return null;
      return <div className="w-1.5 h-1.5 flex-shrink-0" style={{ background: diffColor, transform: 'rotate(45deg)' }} />;
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
        {diffColor && <div className="absolute inset-0 pointer-events-none rounded-[inherit]" style={{ boxShadow: `inset 2px 0 0 0 ${diffColor}` }} />}
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <DiffIndicator />
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

  // ========== TIERS PAYEURS — RENDER HELPERS ==========

  const fmtTP = (n) => n != null ? n.toLocaleString('fr-FR') + ' €' : '—';

  // ── TP rows injected inside a poste's Total Block expansion ──
  // Returns rows (not a card) — caller wraps in the existing expanded section
  // Shared row style for receipt sublines — 13px, consistent across all rows
  const receiptRowStyle = { fontSize: 13, fontWeight: 400, color: '#78716c' };
  const receiptAmountStyle = { fontSize: 13, fontWeight: 400, color: '#292524', fontFamily: "'IBM Plex Mono', monospace" };

  // ── TP Lego Blocks: composable display primitives ──────────────
  // Small, single-purpose render helpers. Compose them to build any TP surface.

  /** Generic receipt line: label + amount, flush left/right */
  const tpLine = (label, amount, { muted, unit, negative, bold, raw } = {}) => (
    <div className="flex items-center justify-between">
      <span style={{ ...receiptRowStyle, ...(muted && { color: '#a8a29e' }), ...(bold && { fontWeight: 500, color: '#44403c' }) }}>{label}</span>
      <span style={{ ...receiptAmountStyle, ...(muted && { color: '#a8a29e' }), ...(bold && { fontWeight: 500, color: '#292524' }) }}>
        {negative && '\u2212 '}{raw || fmt(amount)}{unit && <span style={{ fontSize: 11, color: '#a8a29e', marginLeft: 4 }}>{unit}</span>}
      </span>
    </div>
  );

  /** Subtotal line with dashed border above — visually closes a section */
  const tpSubtotal = (label, amount) => (
    <div className="border-t border-dashed border-[#d6d3d1] mt-1 pt-1 flex items-center justify-between">
      <span style={{ fontSize: 13, fontWeight: 500, color: '#44403c' }}>{label}</span>
      <span style={{ ...receiptAmountStyle, fontWeight: 500, color: '#292524' }}>{fmt(amount)}</span>
    </div>
  );

  /** Solid section divider — separates damage calc from TP deductions */
  const tpDivider = () => <div className="mt-3 pt-3 border-t border-[#e7e5e3]" />;

  /** TP imputation line: "Imputation {sigle}" with minus amount + explanatory sub-label */
  const tpDeduction = (sigle, amount, subLabel) => (
    <div>
      <div className="flex items-center justify-between">
        <span style={{ fontSize: 13, fontWeight: 500, color: '#44403c' }}>Imputation {sigle}</span>
        <span style={{ ...receiptAmountStyle, fontWeight: 500, color: '#292524' }}>{'\u2212'} {fmtTP(amount)}</span>
      </div>
      {subLabel && <span style={{ fontSize: 12, color: '#a8a29e' }}>{subLabel}</span>}
    </div>
  );

  /** Droit de préférence block — the core "traceability" display */
  const tpPreference = (dp) => {
    if (!dp) return null;
    return (
      <div className="mt-2 px-3 py-2.5 rounded-md" style={{ backgroundColor: '#f5f0e8', border: '1px solid #e2ddd4' }}>
        <div className="flex justify-between items-baseline mb-2">
          <span style={{ fontSize: 13, color: '#44403c', fontWeight: 600 }}>Droit de préférence</span>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: '#78716c' }}>taux {dp.taux} %</span>
        </div>
        <div className="space-y-1">
          {tpLine('Enveloppe disponible', dp.enveloppe, { bold: true })}
          {tpLine('Victime (prioritaire)', dp.victimePref, { bold: true })}
          <div className="border-t border-dashed border-[#e2ddd4] mt-1 pt-1 space-y-0.5">
            {dp.tpDetails?.map((td, i) => (
              <div key={i} className="flex justify-between">
                <span style={{ fontSize: 12, color: '#a8a29e' }}>{td.sigle} \u00b7 non recouvré</span>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: '#a8a29e' }}>{fmtTP(td.nonRecouvre)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderPosteTPSection = (posteId) => {
    if (!hasTP) return null;
    const posteImputations = (tpScenario._imputations || []).filter(imp => imp.posteId === posteId);
    if (posteImputations.length === 0) return null;

    const dp = tpScenario.droitDePreference?.[posteId];
    const grossDamage = getPosteMontant(posteId);
    const dsaResteACharge = posteId === 'dsa' ? grossDamage - dsaLignes.reduce((s, l) => s + (l.dejaRembourse || 0), 0) : null;

    return (
      <div className="space-y-1.5 mt-3">
        {posteId === 'dsa' ? (
          <>
            {tpLine('Total dépenses', grossDamage)}
            {tpLine('Reste à charge', dsaResteACharge)}
          </>
        ) : (
          tpLine('Préjudice total', grossDamage)
        )}

        {tpDivider()}
        {posteImputations.map((imp, idx) => {
          const tp = tpScenario.tiersPayeurs.find(t => t.id === imp.tiersPayeurId);
          const ligne = (tpScenario.lignesTP || []).find(l => l.id === imp.ligneTPId);
          const globalAmount = ligne?.montant;
          return (
            <React.Fragment key={imp.id}>
              <div className="flex justify-between items-center">
                <span style={receiptRowStyle} className="flex items-center gap-1.5">
                  {tp?.sigle || tp?.nom}
                  <span
                    className="inline-flex items-center h-[16px] px-1 rounded cursor-pointer hover:bg-[#d6d3d1]/40"
                    style={{ fontSize: 10, fontWeight: 500, color: '#a8a29e', fontFamily: "'IBM Plex Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.02em' }}
                    onClick={() => {
                      if (imp.source === 'cascade' && tpScenario.cascade) {
                        navigateTo({ type: 'cascade', id: 'cascade-from-poste', title: 'Cascade', fullTitle: tpScenario.cascade.label + ' \u2014 Cascade' });
                      } else {
                        setActiveTab('Dossier');
                      }
                    }}
                  >
                    {imp.source}
                  </span>
                  {globalAmount != null && (
                    <span style={{ fontSize: 10, color: '#a8a29e', fontFamily: "'IBM Plex Mono', monospace" }}>· {fmtTP(globalAmount)}</span>
                  )}
                </span>
                <span style={receiptAmountStyle}>{fmt(imp.montantImpute)}</span>
              </div>
              {idx < posteImputations.length - 1 && tpDivider()}
            </React.Fragment>
          );
        })}

        {tpPreference(dp)}
      </div>
    );
  };

  // ── Shared Total Block — receipt-style wrapper ──
  // Renders the expandable "Total à indemniser" block for any poste.
  // Pass `content` to inject custom children (damage calc, temporal TP sections) before the footer.
  // Without `content`, renders the standard pattern: renderPosteTPSection + footer.
  const renderTotalBlock = (posteId, amount, { guard = true, label = 'Total à indemniser', content = null } = {}) => {
    if (!guard) return null;
    const isOpen = totalExpanded[posteId] || (hasTP && tauxFinal < 100);
    return (
      <div className={totalBlockClass}>
        <button onClick={() => setTotalExpanded(prev => ({...prev, [posteId]: !prev[posteId]}))} className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-[#d6d3d1] rounded-[6px] flex items-center justify-center">
              <FileText className="w-3.5 h-3.5 text-[#78716c]" />
            </div>
            <span className="text-[14px] font-medium text-[#292524]">{label}</span>
          </div>
          <div className="flex items-center gap-3">
            {!isOpen && <span style={serifAmountStyle} className="text-[#292524]">{fmt(amount)}</span>}
            <ChevronRight className={`w-4 h-4 text-[#78716c] transition-transform ${isOpen ? 'rotate-90' : ''}`} />
          </div>
        </button>
        {isOpen && (
          <>
            {content || renderPosteTPSection(posteId)}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#d6d3d1] group/total">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-[#d6d3d1] rounded-[5px] flex items-center justify-center">
                  <FileText className="w-3 h-3 text-[#78716c]" />
                </div>
                <span className="text-[13px] font-medium text-[#292524]">{label}</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#d6d3d1] opacity-0 group-hover/total:opacity-100 transition-opacity" />
              </div>
              <span style={serifAmountStyle} className="text-[#292524]">{fmt(amount)}</span>
            </div>
          </>
        )}
      </div>
    );
  };

  // ── Cascade View (navStack level) ──
  const renderCascadeView = () => {
    const cascade = tpScenario.cascade;
    if (!cascade) {
      return (
        <div className="flex-1 flex items-center justify-center py-20">
          <p className="text-body text-[#a8a29e]">Aucune cascade d'imputation pour ce scénario.</p>
        </div>
      );
    }

    const totalPrejudice = cascade.etapes.reduce((s, e) => s + (e.prejudice || 0), 0);
    const pctAbsorbe = totalPrejudice > 0 ? Math.round(cascade.totalAbsorbe / totalPrejudice * 100) : 0;

    return (
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto py-8 px-6 space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2">
              <h2 style={{ fontFamily: "'RL Para Trial Central', Georgia, serif", fontSize: 22, fontWeight: 500, color: '#292524', letterSpacing: '-0.3px' }}>
                {cascade.label}
              </h2>
              <span className="inline-flex items-center h-5 px-1.5 rounded" style={{ backgroundColor: '#eeece6', fontSize: 10, fontWeight: 500, color: '#44403c', fontFamily: "'IBM Plex Mono', monospace" }}>
                CASCADE
              </span>
            </div>
            <p style={{ fontSize: 13, color: '#78716c', marginTop: 4 }}>Cascade d'imputation</p>
          </div>

          {/* Capitalisation */}
          <div className={cardBlockClass}>
            <div className="px-5 py-3 bg-[#fafaf9] border-b border-[#f0efed]">
              <span style={{ ...sectionHeaderStyle }}>Capitalisation</span>
            </div>
            <div className="px-5 py-4 space-y-2">
              <div className="flex items-center gap-3 flex-wrap" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 14, color: '#292524' }}>
                <span>{cascade.renteAnnuelle.toLocaleString('fr-FR')} €/an</span>
                <span style={{ color: '#a8a29e' }}>×</span>
                <span>{cascade.coefficient}</span>
                <span className="inline-flex items-center h-5 px-1.5 rounded border border-[#e7e5e3]" style={{ fontSize: 10, fontWeight: 500, color: '#78716c' }}>
                  {cascade.bareme}
                </span>
                <span style={{ color: '#a8a29e' }}>=</span>
                <span style={{ fontWeight: 600, color: '#292524' }}>{fmtTP(cascade.capitalise)}</span>
              </div>
              {/* Temporal breakdown */}
              {cascade.arreragesEchus != null && (
                <div className="pt-2 border-t border-[#f0efed] space-y-1">
                  <div className="flex items-center justify-between">
                    <span style={{ fontSize: 12, color: '#78716c' }}>Arrérages échus</span>
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, fontWeight: 500, color: '#292524' }}>{fmtTP(cascade.arreragesEchus)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ fontSize: 12, color: '#78716c' }}>À échoir (capitalisé)</span>
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, fontWeight: 500, color: '#292524' }}>{fmtTP(cascade.arreragesAEchoir)}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-[#f0efed]">
                    <span style={{ fontSize: 12, fontWeight: 500, color: '#292524' }}>Total créance</span>
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, fontWeight: 600, color: '#292524' }}>{fmtTP(cascade.capitalise)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Ordre d'imputation */}
          <div className={cardBlockClass}>
            <div className="px-5 py-3 bg-[#fafaf9] border-b border-[#f0efed] flex items-center justify-between">
              <span style={{ ...sectionHeaderStyle }}>Ordre d'imputation</span>
              <span style={{ fontSize: 11, color: '#a8a29e' }}>{cascade.etapes.map(e => e.label).join(' \u2192 ')}</span>
            </div>

            {/* Waterfall steps */}
            <div className="divide-y divide-[#f0efed]">
              {cascade.etapes.map((etape, i) => {
                const isEpuise = etape.statut === 'épuisé';
                const pct = etape.prejudice > 0 ? Math.round(etape.absorbe / etape.prejudice * 100) : 0;
                return (
                  <div key={etape.posteId} className="px-5 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: isEpuise ? '#eeece6' : '#fafaf9', border: isEpuise ? 'none' : '1px solid #e7e5e3' }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: isEpuise ? '#292524' : '#78716c' }}>{i + 1}</span>
                        </span>
                        <span style={{ fontSize: 14, fontWeight: 600, color: '#292524' }}>{etape.label}</span>
                        <span className="inline-flex items-center h-5 px-1.5 rounded" style={{
                          backgroundColor: isEpuise ? '#eeece6' : '#fafaf9',
                          fontSize: 10, fontWeight: 500,
                          color: isEpuise ? '#292524' : '#78716c',
                          fontFamily: "'IBM Plex Mono', monospace",
                          textTransform: 'uppercase',
                        }}>
                          {etape.statut}
                        </span>
                        {etape.jurisprudentiallyVariable && (
                          <span className="inline-flex items-center h-5 px-1.5 rounded ml-2" style={{ backgroundColor: '#fef3c7', fontSize: 10, fontWeight: 500, color: '#92400e', fontFamily: "'IBM Plex Mono', monospace" }}>
                            JURISPRUDENCE VARIABLE
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-4">
                      <div>
                        <span style={{ fontSize: 11, color: '#a8a29e', display: 'block' }}>Préjudice</span>
                        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 14, fontWeight: 500, color: '#292524' }}>{fmtTP(etape.prejudice)}</span>
                      </div>
                      <div>
                        <span style={{ fontSize: 11, color: '#a8a29e', display: 'block' }}>Absorbé</span>
                        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 14, fontWeight: 500, color: '#292524' }}>{fmtTP(etape.absorbe)}</span>
                      </div>
                      <div>
                        <span style={{ fontSize: 11, color: '#a8a29e', display: 'block' }}>Reste victime</span>
                        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 14, fontWeight: 500, color: '#292524' }}>{fmtTP(etape.prejudice - etape.absorbe)}</span>
                      </div>
                    </div>
                    {etape.absorbeEchu != null && (
                      <div className="mt-2 flex items-center gap-4" style={{ fontSize: 11, color: '#78716c' }}>
                        <span>échu : <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 500, color: '#44403c' }}>{fmtTP(etape.absorbeEchu)}</span></span>
                        <span>à échoir : <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 500, color: '#44403c' }}>{fmtTP(etape.absorbeAEchoir)}</span></span>
                      </div>
                    )}
                    {/* Progress bar */}
                    <div className="mt-2 h-1.5 rounded-full bg-[#f0efed] overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: isEpuise ? '#a8a29e' : '#d6d3d1' }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total */}
            <div className="px-5 py-4 bg-[#fafaf9] border-t border-[#e7e5e3] flex items-center justify-between">
              <span style={{ fontSize: 13, fontWeight: 500, color: '#292524' }}>Total absorbé</span>
              <div className="flex items-center gap-2">
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 14, fontWeight: 600, color: '#292524' }}>
                  {fmtTP(cascade.totalAbsorbe)}
                </span>
                <span style={{ fontSize: 12, color: '#a8a29e' }}>/ {fmtTP(cascade.capitalise)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
            if (isCurrentlyStreaming(key)) return 'animate-field-glow transition-all duration-300';
            if (isRevealed(key)) return 'transition-all duration-500';
            return '';
          };
          const fieldBorderStyle = () => ({});

          const rapportPiece = dropFirstPieces.find(p => p.isRapport);
          const rapportName = rapportPiece?.cleanName || rapportPiece?.originalName || 'Rapport d\'expertise';

          const renderField = (key, label, value, isLongText = false) => {
            const hasValue = isRevealed(key) && value;
            const isActive = isCurrentlyStreaming(key);

            // Diff awareness: look up pending diff for this field
            const pendingDiff = activeDiffs.find(d => d.entityId === key && d.zone === 'infos_dossier' && !d.approved && !d.rejected);
            const approvedDiff = activeDiffs.find(d => d.entityId === key && d.zone === 'infos_dossier' && d.approved);
            const rejectedDiff = activeDiffs.find(d => d.entityId === key && d.zone === 'infos_dossier' && d.rejected);
            const diffColor = pendingDiff ? ROW_DIFF_COLORS[pendingDiff.type === 'edit' ? 'edit' : pendingDiff.type === 'delete' ? 'delete' : 'add'] : null;

            return (
              <div
                className={`${fieldClass(key)} group/field relative`}
                style={{
                  ...fieldBorderStyle(key),
                  ...(pendingDiff ? { paddingLeft: 8, borderRadius: 3 } : {}),
                }}
                key={key}
                data-entity-id={key}
              >
                <div className="text-caption-medium text-[#78716c] mb-1 flex items-center gap-1">
                  {label}
                  {pendingDiff && (
                    <span className="inline-block w-1.5 h-1.5" style={{ background: diffColor, transform: 'rotate(45deg)' }} />
                  )}
                  {isRevealed(key) && !pendingDiff && (
                    <span className="relative group">
                      <span className="inline-block w-1.5 h-1.5 cursor-help" style={{ background: '#4a9168', transform: 'rotate(45deg)' }} />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-20 pointer-events-none">
                        <div className="bg-zinc-800 text-white rounded-lg px-3 py-2 shadow-lg w-[220px]">
                          <p className="text-caption text-[#a8a29e] mb-1">Extrait depuis</p>
                          <div className="flex items-center gap-2">
                            <FileText className="w-3.5 h-3.5 text-[#86efac] flex-shrink-0" />
                            <span className="text-caption-medium text-white truncate">{rapportName}</span>
                          </div>
                        </div>
                        <div className="w-2 h-2 bg-zinc-800 rotate-45 mx-auto -mt-1"></div>
                      </div>
                    </span>
                  )}
                </div>

                {/* Diff: show before/after values */}
                {pendingDiff ? (
                  <div>
                    {pendingDiff.before != null && (
                      <div style={{ fontSize: 12, lineHeight: '16px', color: '#9CA3AF', opacity: 0.5, textDecoration: 'line-through' }}>
                        {pendingDiff.before}
                      </div>
                    )}
                    {pendingDiff.type !== 'delete' && pendingDiff.after != null && (
                      <div style={{ fontSize: 14, lineHeight: '20px', fontWeight: 500, color: '#292524' }}>
                        {pendingDiff.after}
                      </div>
                    )}
                    {pendingDiff.type === 'delete' && (
                      <div style={{ fontSize: 14, lineHeight: '20px', color: '#9CA3AF', textDecoration: 'line-through' }}>
                        {pendingDiff.before}
                      </div>
                    )}
                  </div>
                ) : rejectedDiff ? (
                  <div>
                    <div style={{ fontSize: 12, lineHeight: '16px', color: '#9CA3AF', opacity: 0.5, textDecoration: 'line-through' }}>
                      {rejectedDiff.after}
                    </div>
                    <div className="text-body text-[#292524]">
                      {rejectedDiff.before || value || <span className="italic text-[#d6d3d1]">Non renseigné</span>}
                    </div>
                  </div>
                ) : (
                  <div className={`text-body ${hasValue || isActive ? 'text-[#292524]' : 'text-[#d6d3d1]'} ${isLongText ? 'leading-relaxed' : ''}`}>
                    {isActive ? (
                      <span>{streamingText}<span className="inline-block w-0.5 h-4 animate-pulse ml-0.5 align-middle" style={{ background: '#4a9168' }}></span></span>
                    ) : hasValue ? (
                      value
                    ) : (
                      <span className="italic">Non renseigné</span>
                    )}
                  </div>
                )}

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
            <div className="space-y-4" data-zone-id="infos_dossier">
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
                    {renderField('dateNaissance', 'Date de naissance',
                      victimeData.dateNaissance
                        ? <span className="flex items-center gap-2">{victimeData.dateNaissance}{calcAge(victimeData.dateNaissance) && <><span className="w-1 h-1 rounded-full bg-[#d9d9d9]"></span><span className="text-body text-[#78716c]">{calcAge(victimeData.dateNaissance)} ans</span></>}</span>
                        : null
                    )}
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

                {/* Sub-block: Fraction indemnisable */}
                <div className="border-t border-[#e7e5e3] px-5 py-3">
                  <span style={{ fontSize: 13, color: '#78716c' }}>Fraction indemnisable</span>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, fontWeight: 500, color: tauxFinal < 100 ? '#b9703f' : '#292524', marginTop: 4 }}>
                    {tauxFinal} %
                  </div>
                </div>
              </div>

              {/* Section: Tiers payeurs (dossier-level) */}
              {hasTP && (
                <div className="bg-white rounded-[5px] border border-[#e7e5e3] shadow-sm overflow-hidden">
                  <div className="flex items-center gap-2.5 px-3 py-3.5 border-b border-[#e7e5e3] bg-white">
                    <Receipt className="w-4 h-4 text-[#78716c]" strokeWidth={1.5} />
                    <span className="text-[11px] font-medium text-[#78716c] uppercase tracking-wider" style={colHeaderStyle}>Tiers payeurs</span>
                  </div>

                  {tpScenario.extractionMode?.dsa === 'ligne' ? (
                    /* Flat list — ligne par ligne mode */
                    tpScenario.tiersPayeurs.map((tp) => {
                      const tpImputations = (tpScenario._imputations || []).filter(i => i.tiersPayeurId === tp.id);
                      const totalImpute = tpImputations.reduce((s, i) => s + (i.montantImpute || 0), 0);
                      return (
                        <div key={tp.id} className="flex items-center justify-between px-5 py-3 border-b border-[#f0efed] last:border-b-0">
                          <div className="flex items-center gap-2">
                            <span style={{ fontSize: 13, fontWeight: 500, color: '#292524' }}>{tp.sigle}</span>
                            <span style={{ fontSize: 11, color: '#a8a29e', fontFamily: "'Inter', sans-serif" }}>{tp.type}</span>
                          </div>
                          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, fontWeight: 500, color: '#292524' }}>{fmtTP(totalImpute)}</span>
                        </div>
                      );
                    })
                  ) : (
                    /* Expand/collapse — récap & cascade modes */
                    tpScenario.tiersPayeurs.map((tp) => {
                      const tpImputations = (tpScenario._imputations || []).filter(i => i.tiersPayeurId === tp.id);
                      const totalImpute = tpImputations.reduce((s, i) => s + (i.montantImpute || 0), 0);
                      const tpLignes = (tpScenario.lignesTP || []).filter(l => l.tiersPayeurId === tp.id);
                      const expanded = isCardExpanded(`registre-tp-${tp.id}`);
                      const natureLabel = (n) => ({ CREANCE_RECAPITULATIVE: 'Créance récap.', FACTURE: 'Facture', IJ: 'IJ', RENTE: 'Rente', AUTRE: 'Autre' }[n] || n);

                      return (
                        <div key={tp.id} className="border-b border-[#f0efed] last:border-b-0">
                          <div
                            className="flex items-center justify-between px-5 py-3 cursor-pointer hover:bg-[#fafaf9] transition-colors"
                            onClick={() => toggleCard(`registre-tp-${tp.id}`)}
                          >
                            <div className="flex items-center gap-2">
                              {expanded ? <ChevronDown className="w-3.5 h-3.5 text-[#a8a29e]" strokeWidth={1.5} /> : <ChevronRight className="w-3.5 h-3.5 text-[#a8a29e]" strokeWidth={1.5} />}
                              <span style={{ fontSize: 13, fontWeight: 500, color: '#292524' }}>{tp.sigle}</span>
                              <span style={{ fontSize: 11, color: '#a8a29e', fontFamily: "'Inter', sans-serif" }}>{tp.type}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span style={{ fontSize: 11, color: '#a8a29e' }}>{tpLignes.length} ligne{tpLignes.length > 1 ? 's' : ''}</span>
                              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, fontWeight: 500, color: '#292524' }}>{fmtTP(totalImpute)}</span>
                            </div>
                          </div>
                          {expanded && (
                            <div className="px-5 pb-3 space-y-2">
                              <div style={{ fontSize: 12, color: '#78716c', marginBottom: 4 }}>{tp.nom}</div>
                              {tpLignes.map((ligne) => {
                                const ligneExpanded = isCardExpanded(`registre-ligne-${ligne.id}`);
                                return (
                                  <div key={ligne.id} className="bg-[#fafaf9] rounded border border-[#f0efed] overflow-hidden">
                                    <div
                                      className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-[#f5f4f2] transition-colors"
                                      onClick={() => toggleCard(`registre-ligne-${ligne.id}`)}
                                    >
                                      <div className="flex items-center gap-2">
                                        {ligneExpanded ? <ChevronDown className="w-3 h-3 text-[#a8a29e]" strokeWidth={1.5} /> : <ChevronRight className="w-3 h-3 text-[#a8a29e]" strokeWidth={1.5} />}
                                        <span style={{ fontSize: 12, fontWeight: 500, color: '#44403c' }}>{natureLabel(ligne.nature)}</span>
                                        <span style={{ fontSize: 11, color: '#a8a29e' }}>· {ligne.regle?.toLowerCase()}</span>
                                        {ligne.postesProjetes && <span style={{ fontSize: 11, color: '#a8a29e' }}>· {ligne.postesProjetes.length} poste{ligne.postesProjetes.length > 1 ? 's' : ''}</span>}
                                      </div>
                                      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, fontWeight: 500, color: '#44403c' }}>{fmtTP(ligne.montant)}</span>
                                    </div>
                                    {ligneExpanded && (
                                      <div className="px-3 pb-2 pt-1 border-t border-[#f0efed]">
                                        {ligne.piece && <div style={{ fontSize: 11, color: '#a8a29e', marginBottom: 4 }}>{ligne.piece}</div>}
                                        {ligne.postesProjetes && ligne.postesProjetes.map((pp, idx) => (
                                          <div key={idx} className="flex items-center justify-between py-0.5">
                                            <span style={{ fontSize: 11, color: '#78716c', textTransform: 'uppercase', fontFamily: "'IBM Plex Mono', monospace" }}>{pp.poste}</span>
                                            <span style={{ fontSize: 11, color: '#44403c', fontFamily: "'IBM Plex Mono', monospace" }}>{fmtTP(pp.montant)}</span>
                                          </div>
                                        ))}
                                        {(ligne.regle === 'CASCADE' || ligne.regle === 'CASCADE_CAPITALISEE') && tpScenario.cascade ? (
                                          <button
                                            className="mt-1 text-[11px] text-[#78716c] hover:text-[#44403c] hover:underline transition-colors"
                                            onClick={(e) => { e.stopPropagation(); navigateTo({ type: 'cascade', id: 'cascade-from-registre', title: 'Cascade', fullTitle: tpScenario.cascade.label + ' \u2014 Cascade' }); }}
                                          >voir la cascade {'\u2192'}</button>
                                        ) : null}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}

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

              {/* Section: Victimes indirectes */}
              <div className="bg-white rounded-[5px] border border-[#e7e5e3] shadow-sm overflow-hidden">
                <div className="flex items-center justify-between gap-2.5 px-3 py-3.5 border-b border-[#e7e5e3] bg-white">
                  <div className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-[#78716c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                    </svg>
                    <span className="text-[11px] font-medium text-[#78716c] uppercase tracking-wider" style={colHeaderStyle}>Victimes indirectes</span>
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
                      <div key={vi.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-[#fafaf9] group transition-colors">
                        <div className="flex items-center gap-2.5">
                          {viAvatar(vi, 32)}
                          <div>
                            <div className="text-body text-[#44403c]">{vi.prenom} {vi.nom}</div>
                            <div className="text-caption text-[#a8a29e]">{vi.lien} {vi.dateNaissance ? `• ${calcAge(vi.dateNaissance)} ans` : ''}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button
                            onClick={() => setEditPanel({ type: 'victime-indirecte', title: 'Modifier victime indirecte', data: vi })}
                            className="p-1 text-[#d6d3d1] hover:text-[#78716c] rounded transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" strokeWidth={1.5} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const affectedPostes = ivDossierPostes.filter(pid =>
                                (ivPosteData[pid]?.lignes || []).some(l => l.victimeId === vi.id && l.montant > 0)
                              );
                              const msg = affectedPostes.length > 0
                                ? `${vi.prenom} ${vi.nom} a des montants chiffrés sur ${affectedPostes.length} poste(s). Supprimer ?`
                                : `Supprimer ${vi.prenom} ${vi.nom} ?`;
                              if (!window.confirm(msg)) return;
                              setVictimesIndirectes(prev => prev.filter(v => v.id !== vi.id));
                              setIvPosteData(prev => {
                                const next = { ...prev };
                                for (const pid of Object.keys(next)) {
                                  if (next[pid]?.lignes) {
                                    next[pid] = { ...next[pid], lignes: next[pid].lignes.filter(l => l.victimeId !== vi.id) };
                                  }
                                }
                                return next;
                              });
                            }}
                            className="p-1 text-[#d6d3d1] hover:text-red-500 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-5 py-6 text-center">
                    <div className="text-body text-[#a8a29e]">Aucune victime indirecte</div>
                  </div>
                )}
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
                          {viAvatar(vi, 32)}
                          <div>
                            <div className="text-body text-[#44403c]">{vi.prenom} {vi.nom}</div>
                            <div className="text-caption text-[#a8a29e]">{vi.lien} • {calcAge(vi.dateNaissance)} ans</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button
                            onClick={() => setEditPanel({ type: 'victime-indirecte', title: 'Modifier victime indirecte', data: vi })}
                            className="p-1 text-[#d6d3d1] hover:text-[#78716c] rounded transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" strokeWidth={1.5} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const affectedPostes = ivDossierPostes.filter(pid =>
                                (ivPosteData[pid]?.lignes || []).some(l => l.victimeId === vi.id && l.montant > 0)
                              );
                              const msg = affectedPostes.length > 0
                                ? `${vi.prenom} ${vi.nom} a des montants chiffrés sur ${affectedPostes.length} poste(s). Supprimer ?`
                                : `Supprimer ${vi.prenom} ${vi.nom} ?`;
                              if (!window.confirm(msg)) return;
                              setVictimesIndirectes(prev => prev.filter(v => v.id !== vi.id));
                              setIvPosteData(prev => {
                                const next = { ...prev };
                                for (const pid of Object.keys(next)) {
                                  if (next[pid]?.lignes) {
                                    next[pid] = { ...next[pid], lignes: next[pid].lignes.filter(l => l.victimeId !== vi.id) };
                                  }
                                }
                                return next;
                              });
                            }}
                            className="p-1 text-[#d6d3d1] hover:text-red-500 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                          </button>
                        </div>
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
        // eslint-disable-next-line no-unused-vars
        const _getPosteAiReasoning = () => null;

        // Extraction banner (non-blocking — renders inline above chiffrage content)
        const extractionBanner = (extractionState && extractionState.phase !== 'done') ? (() => {
          const extractionPhases = [
            { key: 'upload', label: 'Réception', icon: Upload },
            { key: 'analyse', label: 'Analyse', icon: FileSearch },
            { key: 'ocr', label: 'Lecture', icon: Eye },
            { key: 'extraction', label: 'Extraction', icon: Sparkles },
            { key: 'postes', label: 'Postes', icon: ListChecks },
          ];
          const currentPhaseIndex = extractionPhases.findIndex(p => p.key === extractionState.phase);
          return (
            <div className="border border-[#e7e5e3] rounded-xl p-4 mb-6 animate-fade-up" style={{ backgroundColor: '#f8f7f5' }}>
              <div className="flex items-center gap-4">
                <div className="relative w-10 h-10 flex-shrink-0">
                  <div className="absolute inset-0 rounded-full animate-spin-slow" style={{ background: 'conic-gradient(from 0deg, #71717a, #a1a1aa, #71717a, transparent 70%)' }} />
                  <div className="absolute inset-[2px] rounded-full bg-[#f8f7f5] flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-[#78716c] animate-pulse" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-body-medium text-[#292524]">{extractionPhases[currentPhaseIndex]?.label || 'Analyse'} en cours...</span>
                    <span className="text-caption text-[#a8a29e]">{extractionState.progress}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {extractionPhases.map((phase, i) => {
                      const Icon = phase.icon;
                      const isActive = i === currentPhaseIndex;
                      const isDone = i < currentPhaseIndex;
                      return (
                        <div key={phase.key} className="flex items-center">
                          <div className={`w-6 h-6 rounded flex items-center justify-center transition-all duration-500 ${isDone ? 'bg-zinc-200' : isActive ? 'bg-zinc-200 scale-110' : 'bg-[#eeece6]'}`}>
                            {isDone ? <Check className="w-3 h-3 text-[#78716c]" /> : <Icon className={`w-3 h-3 transition-colors duration-300 ${isActive ? 'text-[#44403c]' : 'text-[#a8a29e]'}`} />}
                          </div>
                          {i < extractionPhases.length - 1 && <div className={`w-2 h-0.5 mx-0.5 transition-colors duration-500 ${isDone ? 'bg-zinc-400' : 'bg-zinc-200'}`} />}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="w-24 h-1.5 bg-[#eeece6] rounded-full overflow-hidden flex-shrink-0">
                  <div className="h-full bg-[#a8a29e] rounded-full transition-all duration-700 ease-out" style={{ width: `${extractionState.progress}%` }} />
                </div>
              </div>
            </div>
          );
        })() : null;

        // Empty state - no postes yet (but still show add button)
        if (allPostes.length === 0 && !extractionBanner) {
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

        const pgpaAiCount = pgpaData.revenuRef.lignes.filter(l => !!l.diffType).length +
          pgpaData.revenusPercus.filter(l => !!l.diffType).length +
          pgpaData.ijPercues.filter(l => !!l.diffType).length;

        const _hasAiSuggestions = // eslint-disable-line no-unused-vars
          dsaLignes.some(l => !!l.diffType) ||
          dftLignes.some(l => !!l.diffType) ||
          pgpaAiCount > 0;

        const _aiSuggestedCount = // eslint-disable-line no-unused-vars
          dsaLignes.filter(l => !!l.diffType).length +
          dftLignes.filter(l => !!l.diffType).length +
          pgpaAiCount;

        // Compute summary totals
        const totalVd = allPostes.reduce((s, p) => s + (p.montant || 0), 0);
        const totalIv = totalIvChiffrage;
        const totalTiers = hasTP ? allPostes.reduce((s, p) => s + (p.tpEffective || 0), 0) : 0;
        const tauxRatio = (tauxFinal || 100) / 100;
        const totalIndem = (totalVd + totalIv) * tauxRatio - totalTiers;

        // Reusable subtotal/total card component
        // rows: [{ label, amount, muted?, negative? }], totalRow: { label, amount }
        const renderTotalCard = (rows, totalRow) => (
          <div className="border border-[#e7e5e3] rounded-xl overflow-hidden" style={{ boxShadow: '0px 1px 2px 0px rgba(26,26,26,0.05)' }}>
            {rows.map((row, i) => (
              <div key={i} className={`flex items-center justify-between h-9 px-4 bg-white ${i > 0 ? 'border-t border-[#e7e5e3]' : ''}`}>
                <span style={{ fontSize: 13, fontWeight: 400, color: row.muted ? '#a8a29e' : '#78716c' }}>{row.label}</span>
                <span style={{ fontSize: 14, fontWeight: row.muted ? 400 : 500, color: row.muted ? '#a8a29e' : '#292524' }}>
                  {row.muted && row.amount === 0 ? '—' : `${row.negative ? '- ' : ''}${fmt(row.amount)}`}
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between h-11 px-4 border-t border-[#e7e5e3]" style={{ backgroundColor: '#eeece6' }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#292524' }}>{totalRow.label}</span>
              <span style={serifAmountStyle} className="text-[#292524]">{fmt(totalRow.amount)}</span>
            </div>
          </div>
        );

        return (
          <div className="space-y-6" data-zone-id="postes">
            {/* Extraction progress banner (non-blocking) */}
            {extractionBanner}

            {/* Toolbar: summary pills + actions */}
            <div className="flex items-center gap-2 px-px">
              {/* Breakdown pills — compact, white bg */}
              {[
                { label: 'VD', amount: totalVd },
                ...(totalIv > 0 ? [{ label: 'VI', amount: totalIv }] : []),
                { label: 'TP', amount: totalTiers, muted: totalTiers === 0, negative: totalTiers > 0 },
              ].map((item, i) => (
                <div key={i} className="h-8 px-2.5 flex items-center gap-1.5 border border-[#e7e5e3] rounded-lg whitespace-nowrap cursor-default">
                  <span style={{ fontSize: 11, fontWeight: 400, color: item.muted ? '#a8a29e' : '#78716c', letterSpacing: 0.1, lineHeight: '16px' }}>{item.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: item.muted ? '#a8a29e' : '#292524', lineHeight: '18px' }}>
                    {item.muted && item.amount === 0 ? '—' : `${item.negative ? '− ' : ''}${fmt(item.amount)}`}
                  </span>
                </div>
              ))}
              {/* Total pill — cream bg, prominent */}
              <div className="h-8 px-2.5 flex items-center gap-1.5 border border-[#e7e5e3] rounded-lg whitespace-nowrap cursor-default" style={{ backgroundColor: '#eeece6' }}>
                <span style={{ fontSize: 11, fontWeight: 500, color: '#292524', letterSpacing: 0.1, lineHeight: '16px' }}>Indemnisation totale</span>
                <span style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 14, fontWeight: 400, color: '#292524', lineHeight: '20px' }}>{fmt(totalIndem)}</span>
              </div>
              <div className="flex-1" />
              <button
                className="h-9 px-3 flex items-center gap-2 border border-[#d6d3d1] rounded-lg whitespace-nowrap hover:bg-stone-50 transition-colors"
                style={{ fontSize: 14, fontWeight: 500, color: '#44403c' }}
              >
                <Download className="w-3.5 h-3.5 text-[#78716c]" />
                Exporter
              </button>
              <button
                className="h-9 px-3 flex items-center gap-2 rounded-lg whitespace-nowrap hover:opacity-90 transition-opacity"
                style={{ fontSize: 14, fontWeight: 500, color: 'white', backgroundColor: '#292524' }}
                onClick={() => setPosteSearchOpen(true)}
              >
                <Plus className="w-3.5 h-3.5" />
                Ajouter un poste
              </button>
            </div>

            {/* ===== Victim-sectioned category tables ===== */}
            <div className="space-y-8">

              {/* --- Section: Victime directe --- */}
              {vdCategories.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1.5">
                    <div className="flex items-center gap-3">
                      {vdAvatar(32)}
                      <div className="flex flex-col gap-1.5">
                        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 500, color: '#78716c', textTransform: 'uppercase', lineHeight: '1' }}>Victime directe</span>
                        <span style={{ fontSize: 14, fontWeight: 500, color: '#292524', lineHeight: '20px' }}>{victimeData.prenom} {victimeData.nom}</span>
                      </div>
                    </div>
                    <span style={{ ...serifAmountStyle, color: '#292524' }}>{fmt(allPostes.reduce((s, p) => s + (p.victimeAmount || 0), 0))}</span>
                  </div>
                  <div className="space-y-4">
                    {vdCategories.map((cat) => (
                      <div key={cat.id} className="border border-[#e7e5e3] rounded-xl overflow-hidden" style={{ boxShadow: '0px 1px 2px 0px rgba(26,26,26,0.05)' }}>
                        {/* RowCalculation Header/Direct — category label + column headers */}
                        <div className="h-10 px-4 flex items-center border-b border-[#e7e5e3]" style={{ backgroundColor: '#f8f7f5' }}>
                          <div className="flex-1">
                            <span style={colHeaderStyle}>{cat.title}</span>
                          </div>
                          {hasTP && (
                            <div className="w-[140px] max-w-[140px] px-3 flex items-center justify-end">
                              <span style={{ ...colHeaderStyle, fontSize: 10 }}>Tiers payeurs</span>
                            </div>
                          )}
                          <div className="w-[176px] max-w-[176px] px-3 flex items-center justify-end">
                            <span style={{ ...colHeaderStyle, fontSize: 10 }}>Indemnité victime</span>
                          </div>
                          <div className="w-11 flex-shrink-0 pl-3 pr-4" />
                        </div>
                        {cat.postes.map((p, pIdx) => {
                          const isLast = pIdx === cat.postes.length - 1;
                          return (
                            <button
                              key={p.id}
                              data-entity-id={p.id}
                              onClick={() => navigateTo(p)}
                              className={`w-full flex items-center h-14 bg-white hover:bg-[#fafaf9] transition-colors group ${!isLast ? 'border-b border-[#e7e5e3]' : ''}`}
                            >
                              {/* Acronym cell */}
                              <div className="w-16 px-4 flex items-center">
                                <span style={{ fontSize: 12, fontWeight: 500, color: '#78716c', lineHeight: '16px' }}>{p.title}</span>
                              </div>
                              {/* Text cell */}
                              <div className="flex-1 px-3 flex items-center min-w-0">
                                <span className="truncate" style={{ fontSize: 14, fontWeight: 400, color: '#292524', lineHeight: '20px' }}>{p.fullTitle}</span>
                              </div>
                              {/* Tiers payeurs */}
                              {hasTP && (
                                <div className="w-[140px] max-w-[140px] px-3 flex items-center justify-end">
                                  {p.tpAmount > 0 && (
                                    <span style={{ fontSize: 13, fontWeight: 500, color: '#a8a29e', lineHeight: '20px' }}>{fmt(p.tpAmount)}</span>
                                  )}
                                </div>
                              )}
                              {/* Indemnité victime */}
                              <div className="w-[176px] max-w-[176px] px-3 flex items-center justify-end">
                                {p.victimeAmount > 0 ? (
                                  <span style={{ fontSize: 14, fontWeight: 500, color: '#292524', lineHeight: '20px' }}>{fmt(p.victimeAmount)}</span>
                                ) : p.montant > 0 && p.tpAmount >= p.montant ? (
                                  <span style={{ fontSize: 13, fontWeight: 500, color: '#a8a29e', lineHeight: '20px' }}>0 €</span>
                                ) : null}
                              </div>
                              {/* Actions cell */}
                              <div className="w-11 flex items-center justify-center flex-shrink-0 pl-3 pr-4">
                                <MoreVertical className="w-4 h-4 text-[#a8a29e] opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* --- Section: Victimes indirectes (single section, expandable rows) --- */}
              {(ivDossierPostes.length > 0 || victimesIndirectes.length > 0) && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center" style={{ backgroundColor: '#eeece6' }}>
                        <svg className="w-4 h-4 text-[#78716c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                        </svg>
                      </div>
                      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 500, color: '#78716c', textTransform: 'uppercase', lineHeight: '1' }}>Victime indirectes</span>
                      {victimesIndirectes.length > 0 && (
                        <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full border border-[#e7e5e3]" style={{ fontSize: 12, fontWeight: 500, color: '#292524' }}>
                          {victimesIndirectes.length}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {/* View mode toggle */}
                      {victimesIndirectes.length > 0 && ivDossierPostes.length > 0 && (
                        <div className="flex items-center gap-0 h-8 rounded-lg p-1" style={{ backgroundColor: '#eeece6' }}>
                          <button
                            onClick={() => setIvViewMode('poste')}
                            className={`h-full px-2 min-w-[56px] flex items-center justify-center rounded-md transition-all ${ivViewMode === 'poste' ? 'bg-white shadow-[0_1px_4px_0_rgba(26,26,26,0.05),0_1px_2px_0_rgba(26,26,26,0.05)] border border-transparent' : ''}`}
                            style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 500, color: ivViewMode === 'poste' ? '#292524' : '#78716c', textTransform: 'uppercase', whiteSpace: 'nowrap' }}
                          >
                            Par poste
                          </button>
                          <button
                            onClick={() => setIvViewMode('victime')}
                            className={`h-full px-2 min-w-[56px] flex items-center justify-center rounded-md transition-all ${ivViewMode === 'victime' ? 'bg-white shadow-[0_1px_4px_0_rgba(26,26,26,0.05),0_1px_2px_0_rgba(26,26,26,0.05)] border border-transparent' : ''}`}
                            style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 500, color: ivViewMode === 'victime' ? '#292524' : '#78716c', textTransform: 'uppercase', whiteSpace: 'nowrap' }}
                          >
                            Par victime
                          </button>
                        </div>
                      )}
                      <span style={{ ...serifAmountStyle, color: totalIvChiffrage > 0 ? '#292524' : '#a8a29e' }}>{totalIvChiffrage > 0 ? fmt(totalIvChiffrage) : '—'}</span>
                    </div>
                  </div>

                  {victimesIndirectes.length > 0 && ivDossierPostes.length > 0 ? (
                    <>
                      {/* === View: Par poste (aggregated) === */}
                      {ivViewMode === 'poste' && (
                        <div className="space-y-4">
                          {ivCategories.map(cat => (
                            <div key={cat.id} className="border border-[#e7e5e3] rounded-xl overflow-hidden" style={{ boxShadow: '0px 1px 2px 0px rgba(26,26,26,0.05)' }}>
                              {/* RowCalculation Header/Direct — category label + column headers */}
                              <div className="h-10 px-4 flex items-center border-b border-[#e7e5e3]" style={{ backgroundColor: '#f8f7f5' }}>
                                <span style={colHeaderStyle}>{cat.title}</span>
                              </div>
                              {cat.postes.map((p, pIdx) => {
                                const isLast = pIdx === cat.postes.length - 1;
                                const isExpanded = ivOverviewExpanded[p.id];
                                return (
                                  <div key={p.id}>
                                    <div
                                      data-entity-id={p.id}
                                      className={`w-full flex items-center h-14 bg-white hover:bg-[#fafaf9] transition-colors group ${!isLast && !isExpanded ? 'border-b border-[#e7e5e3]' : ''}`}
                                    >
                                      {/* Chevron cell */}
                                      <button
                                        onClick={(e) => { e.stopPropagation(); setIvOverviewExpanded(prev => ({ ...prev, [p.id]: !prev[p.id] })); }}
                                        className="pl-4 pr-3 h-14 flex items-center justify-center hover:bg-[#f5f5f4] transition-colors rounded-l-xl"
                                      >
                                        <ChevronRight className={`w-3.5 h-3.5 text-[#a8a29e] transition-transform ${isExpanded ? 'rotate-90' : ''}`} strokeWidth={2} />
                                      </button>
                                      <button
                                        onClick={() => navigateTo({ ...p, type: 'poste-iv' })}
                                        className="flex-1 flex items-center h-14 min-w-0"
                                      >
                                        {/* Acronym cell */}
                                        <div className="w-16 flex items-center">
                                          <span style={{ fontSize: 12, fontWeight: 500, color: '#78716c', lineHeight: '16px' }}>{p.title}</span>
                                        </div>
                                        {/* Text cell */}
                                        <div className="flex-1 px-3 flex items-center min-w-0">
                                          <span className="truncate" style={{ fontSize: 14, fontWeight: 400, color: '#292524', lineHeight: '20px' }}>{p.fullTitle}</span>
                                        </div>
                                        {/* Amount cell */}
                                        <div className="w-[176px] max-w-[176px] px-3 flex items-center justify-end">
                                          {p.montant > 0 && (
                                            <span style={{ fontSize: 14, fontWeight: 500, color: '#292524', lineHeight: '20px' }}>{fmt(p.montant)}</span>
                                          )}
                                        </div>
                                      </button>
                                      {/* Actions cell */}
                                      <div className="w-11 flex items-center justify-center flex-shrink-0 pl-3 pr-4">
                                        <MoreVertical className="w-4 h-4 text-[#a8a29e] opacity-0 group-hover:opacity-100 transition-opacity" />
                                      </div>
                                    </div>
                                    {isExpanded && (
                                      <div className={`bg-[#f8f7f5] ${!isLast ? 'border-b border-[#e7e5e3]' : ''}`}>
                                        {victimesIndirectes.map((vi, viIdx) => {
                                          const viLigne = (ivPosteData[p.id]?.lignes || []).find(l => l.victimeId === vi.id);
                                          const viMontant = viLigne?.montant || 0;
                                          const isLastVi = viIdx === victimesIndirectes.length - 1;
                                          return (
                                            <button
                                              key={vi.id}
                                              onClick={() => navigateTo({ ...p, type: 'poste-iv' })}
                                              className={`w-full flex items-center h-14 hover:bg-[#f5f5f4]/80 transition-colors ${!isLastVi ? 'border-b border-[#e7e5e3]' : ''}`}
                                            >
                                              {/* Indent spacers to match RowCalculation Subline */}
                                              <div className="w-[42px] flex-shrink-0" />
                                              <div className="w-16 flex-shrink-0" />
                                              {/* CellIV: avatar + name + lien */}
                                              <div className="flex-1 flex items-center gap-3 px-3 min-w-0">
                                                {viAvatar(vi, 28)}
                                                <span className="truncate" style={{ fontSize: 14, fontWeight: 400, color: '#292524' }}>{vi.prenom} {vi.nom}</span>
                                                <span className="flex-shrink-0" style={{ fontSize: 12, fontWeight: 400, color: '#78716c', letterSpacing: '0.12px' }}>({vi.lien})</span>
                                              </div>
                                              <div className="w-[176px] max-w-[176px] px-3 flex items-center justify-end">
                                                {viMontant > 0 && (
                                                  <span style={{ fontSize: 14, fontWeight: 400, color: '#292524' }}>{fmt(viMontant)}</span>
                                                )}
                                              </div>
                                              <div className="w-11 flex items-center justify-center flex-shrink-0">
                                                <MoreVertical className="w-4 h-4 text-[#a8a29e] opacity-0 group-hover:opacity-100" />
                                              </div>
                                            </button>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* === View: Par victime (récap) === */}
                      {ivViewMode === 'victime' && (
                        <div className="space-y-3">
                          {victimesIndirectes.map(vi => {
                            const viTotal = getIvVictimeTotal(vi.id);
                            return (
                              <div key={vi.id} className="border border-[#e7e5e3] rounded-xl overflow-hidden" style={{ boxShadow: '0px 1px 2px 0px rgba(26,26,26,0.05)' }}>
                                <div className="px-4 py-3 flex items-center justify-between border-b border-[#e7e5e3]" style={{ backgroundColor: '#f8f7f5' }}>
                                  <div className="flex items-center gap-3">
                                    {viAvatar(vi, 32)}
                                    <div className="flex items-center gap-3">
                                      <span style={{ fontSize: 14, fontWeight: 500, color: '#292524', lineHeight: '20px' }}>{vi.prenom} {vi.nom}</span>
                                      <span style={{ fontSize: 12, fontWeight: 400, color: '#78716c', lineHeight: '16px', letterSpacing: '0.12px' }}>{vi.lien} {vi.dateNaissance ? `\u2022 ${calcAge(vi.dateNaissance)} ans` : ''}</span>
                                    </div>
                                  </div>
                                  <span style={serifAmountStyle} className="text-[#292524]">{fmt(viTotal)}</span>
                                </div>
                                {ivDossierPostes.map((pid, pIdx) => {
                                  const taxo = allTaxoPostes.find(t => t.id === pid);
                                  if (!taxo) return null;
                                  const ligne = (ivPosteData[pid]?.lignes || []).find(l => l.victimeId === vi.id);
                                  const montant = ligne?.montant || 0;
                                  const isLast = pIdx === ivDossierPostes.length - 1;
                                  return (
                                    <button
                                      key={pid}
                                      onClick={() => navigateTo({ id: pid, type: 'poste-iv', title: taxo.acronym || pid.toUpperCase(), fullTitle: taxo.label })}
                                      className={`w-full flex items-center h-14 bg-white hover:bg-[#fafaf9] transition-colors group ${!isLast ? 'border-b border-[#e7e5e3]' : ''}`}
                                    >
                                      {/* Acronym cell */}
                                      <div className="w-16 pl-4 flex items-center">
                                        <span style={{ fontSize: 12, fontWeight: 500, color: '#78716c', lineHeight: '16px' }}>{taxo.acronym || pid.toUpperCase()}</span>
                                      </div>
                                      {/* Text cell */}
                                      <div className="flex-1 px-3 flex items-center min-w-0">
                                        <span className="truncate" style={{ fontSize: 14, fontWeight: 400, color: '#292524', lineHeight: '20px' }}>{taxo.label}</span>
                                      </div>
                                      {/* Amount cell */}
                                      <div className="w-[176px] max-w-[176px] px-3 flex items-center justify-end">
                                        {montant > 0 && (
                                          <span style={{ fontSize: 14, fontWeight: 500, color: '#292524', lineHeight: '20px' }}>{fmt(montant)}</span>
                                        )}
                                      </div>
                                      {/* Actions cell */}
                                      <div className="w-11 flex items-center justify-center flex-shrink-0 pl-3 pr-4">
                                        <MoreVertical className="w-4 h-4 text-[#a8a29e] opacity-0 group-hover:opacity-100 transition-opacity" />
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="border border-dashed border-[#e7e5e3] rounded-xl p-6 text-center">
                      <span className="text-body text-[#a8a29e]">{victimesIndirectes.length > 0 ? 'Aucun poste ajouté' : 'Aucune victime indirecte déclarée'}</span>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Global total — the final answer */}
            {(totalVd > 0 || totalIv > 0) && (
              <div className="border-t-2 border-[#d6d3d1] pt-6">
                <div className="rounded-xl overflow-hidden" style={{ backgroundColor: '#292524', boxShadow: '0px 2px 8px 0px rgba(26,26,26,0.12)' }}>
                  {/* Breakdown rows */}
                  <div className="px-5 pt-4 pb-2 space-y-1">
                    <div className="flex items-center justify-between">
                      <span style={{ fontSize: 13, fontWeight: 400, color: '#a8a29e' }}>Victime directe</span>
                      <span style={{ fontSize: 14, fontWeight: 500, color: '#d6d3d1' }}>{fmt(totalVd)}</span>
                    </div>
                    {totalIv > 0 && (
                      <div className="flex items-center justify-between">
                        <span style={{ fontSize: 13, fontWeight: 400, color: '#a8a29e' }}>Victimes indirectes</span>
                        <span style={{ fontSize: 14, fontWeight: 500, color: '#d6d3d1' }}>{fmt(totalIv)}</span>
                      </div>
                    )}
                    {totalTiers > 0 && (
                      <div className="flex items-center justify-between">
                        <span style={{ fontSize: 13, fontWeight: 400, color: '#a8a29e' }}>Tiers payeurs</span>
                        <span style={{ fontSize: 14, fontWeight: 500, color: '#d6d3d1' }}>{'\u2212'} {fmt(totalTiers)}</span>
                      </div>
                    )}
                    {tauxRatio < 1 && (
                      <div className="flex items-center justify-between mt-1">
                        <span style={{ fontSize: 13, fontWeight: 400, color: '#a8a29e' }}>Responsabilité appliquée</span>
                        <span style={{ fontSize: 14, fontWeight: 500, color: '#d6d3d1' }}>{tauxFinal} %</span>
                      </div>
                    )}
                  </div>
                  {/* Total row */}
                  <div className="flex items-center justify-between px-5 py-4 border-t border-[#44403c]">
                    <span style={{ fontSize: 14, fontWeight: 500, color: '#fafaf9', letterSpacing: '0.01em' }}>Indemnisation totale</span>
                    <span style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 22, letterSpacing: '-0.5px', fontWeight: 400, color: '#fafaf9' }}>{fmt(totalIndem)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Poste Search Command Palette */}
            {posteSearchOpen && (
              <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]" onClick={() => { setPosteSearchOpen(false); setPosteSearchVictimeFilter(null); }}>
                <div className="absolute inset-0 bg-black/30" />
                <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                  {/* Section tabs: VD / VI */}
                  <div className="flex items-center gap-1 px-4 pt-3 pb-2 border-b border-stone-100">
                    <button
                      onClick={() => setPosteSearchVictimeFilter(null)}
                      className={`px-3 py-1.5 rounded-full text-caption whitespace-nowrap transition-colors ${posteSearchVictimeFilter === null ? 'bg-[#292524] text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
                    >
                      Victime directe
                    </button>
                    <button
                      onClick={() => setPosteSearchVictimeFilter('iv')}
                      className={`px-3 py-1.5 rounded-full text-caption whitespace-nowrap transition-colors ${posteSearchVictimeFilter === 'iv' ? 'bg-[#292524] text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
                    >
                      Victimes indirectes
                    </button>
                  </div>
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
                      const isIvFilter = posteSearchVictimeFilter === 'iv';
                      const sectionFilter = isIvFilter ? 'VICTIME(S) INDIRECTE(S)' : 'VICTIME DIRECTE';
                      const q = posteSearchQuery.trim().toLowerCase();
                      const taxoPostesForSection = POSTES_TAXONOMY
                        .filter(s => s.section === sectionFilter)
                        .flatMap(s => s.categories.flatMap(c => c.postes.map(p => ({ ...p, categoryTitle: c.title }))));
                      const filtered = q
                        ? taxoPostesForSection.filter(p => p.label.toLowerCase().includes(q) || (p.acronym && p.acronym.toLowerCase().includes(q)))
                        : taxoPostesForSection;
                      const alreadyEnabledVd = dossierPostes;
                      const alreadyEnabledIv = ivDossierPostes;
                      if (filtered.length === 0) return <p className="px-4 py-6 text-center text-body text-stone-400">Aucun poste trouvé</p>;
                      let lastCat = '';
                      return filtered.map(p => {
                        const isEnabled = isIvFilter ? alreadyEnabledIv.includes(p.id) : alreadyEnabledVd.includes(p.id);
                        const showCat = p.categoryTitle !== lastCat;
                        lastCat = p.categoryTitle;
                        return (
                          <div key={p.id}>
                            {showCat && <div className="px-4 pt-3 pb-1" style={colHeaderStyle}>{p.categoryTitle}</div>}
                            <button
                              onClick={() => {
                                if (isIvFilter) {
                                  // Add IV poste
                                  if (!alreadyEnabledIv.includes(p.id)) {
                                    setIvDossierPostes(prev => [...prev, p.id]);
                                  }
                                  // Navigate to IV poste detail
                                  const taxo = allTaxoPostes.find(tp => tp.id === p.id);
                                  const cat = taxo ? CATEGORY_MAP[taxo.categoryId] : null;
                                  navigateTo({ id: p.id, type: 'poste-iv', title: p.acronym || p.id.toUpperCase(), fullTitle: p.label, montant: getIvPosteMontant(p.id), category: cat?.id });
                                } else {
                                  if (!isEnabled) {
                                    handleSmartAddPoste(p.id);
                                  } else {
                                    const existing = allPostes.find(ep => ep.id === p.id);
                                    if (existing) navigateTo(existing);
                                  }
                                }
                                setPosteSearchOpen(false);
                                setPosteSearchVictimeFilter(null);
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

      // JP tab — search + saved decisions
      if (currentLevel.activeTab === 'jp') {
        return (
          <div className="flex-1 flex flex-col overflow-hidden">
            <JPSearchView
              pinnedJP={jp.jpState.pinnedJP}
              selectedDecisionId={jp.jpState.drawerDecisionId}
              onOpenDrawer={(id, resultSet) => jp.openDrawer(id, resultSet)}
              onSaveToDossier={(id) => jp.pinDecision(id)}
              onTogglePoste={(id, posteId) => { jp.pinDecision(id); jp.togglePoste(id, posteId); }}
              onUnpin={(id) => jp.unpinDecision(id)}
              onAddClick={() => jp.openStepper('jp-add')}
              posteOptions={jpPosteOptions}
            />
          </div>
        );
      }

    }

    // ========== CASCADE VIEW ==========
    if (currentLevel.type === 'cascade') {
      return renderCascadeView();
    }


    // ========== DSA ==========
    if (currentLevel.id === 'dsa') {
      const allLignes = [...dsaLignes].sort((a, b) => {
        // Sort diff lines first, then non-diff
        if (a.diffType && !b.diffType) return -1;
        if (!a.diffType && b.diffType) return 1;
        return 0;
      });
      // Calculs DSA
      const dsaDamageOverride = tpScenario.damageOverrides?.dsa;
      const totalMontant = hasTP && dsaDamageOverride != null ? dsaDamageOverride : dsaLignes.reduce((s, l) => s + (l.montant || 0), 0);
      const totalRembourse = dsaLignes.reduce((s, l) => s + (l.dejaRembourse || 0), 0);
      const totalResteACharge = totalMontant - totalRembourse;
      const indemniteVictime = allPostes.find(p => p.id === 'dsa')?.victimeAmount ?? totalResteACharge;
      const dsaHasTPImputations = hasTP && (tpScenario._imputations || []).some(i => i.posteId === 'dsa');
      const dsaExtractionMode = hasTP ? tpScenario.extractionMode?.dsa : null;
      const isLigneMode = dsaExtractionMode === 'ligne';
      const ligneExtractions = tpScenario.ligneExtractions?.dsa || [];
      const dsaTPs = isLigneMode ? tpScenario.tiersPayeurs.filter(tp => ligneExtractions.some(le => le.tpAmounts?.[tp.id])) : [];

      return (
        <div>
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
              {renderParamPill({
                paramKey: 'revaloriser',
                label: 'Revaloriser',
                values: 'IPC Annuel',
                enabled: enabledParams['revaloriser'],
                onClick: () => setActiveParamChip(activeParamChip === 'revaloriser' ? null : 'revaloriser'),
              })}
            </div>
            {activeParamChip === 'revaloriser' && (
              <div className="px-4 py-3 border-t border-[#e7e5e3]" style={{ backgroundColor: '#F8F7F5' }}>
                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={enabledParams['revaloriser']} onChange={() => setEnabledParams(p => ({ ...p, 'revaloriser': !p['revaloriser'] }))} className="sr-only peer" />
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

          {/* Card Block: Dépenses de santé */}
          <div className={cardBlockClass}>
            {/* Title Row */}
            <div className="flex items-center justify-between h-12 px-4 border-b border-[#e7e5e3]">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-[#eeece6] rounded-[6px] flex items-center justify-center">
                  <Receipt className="w-3.5 h-3.5 text-[#78716c]" />
                </div>
                <span className="text-[14px] font-medium text-[#292524]">Dépenses de santé actuelles</span>
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
                  <div className="w-[52px] text-center flex-shrink-0 pl-3" style={colHeaderStyle}>Doc</div>
                  <div className="flex-1 min-w-0 px-3" style={colHeaderStyle}>Libellé</div>
                  <div className="flex-1 min-w-0 px-3 text-right" style={colHeaderStyle}>Date</div>
                  <div className={`${isLigneMode ? 'w-[140px]' : 'w-[254px]'} px-3 text-right flex-shrink-0`} style={colHeaderStyle}>Montant</div>
                  {isLigneMode ? (
                    <>
                      {dsaTPs.map(tp => (
                        <div key={tp.id} className="w-[100px] px-2 text-right flex-shrink-0" style={colHeaderStyle}>{tp.sigle}</div>
                      ))}
                      <div className="w-[100px] px-2 text-right flex-shrink-0" style={colHeaderStyle}>RAC</div>
                    </>
                  ) : (
                    <div className="flex-1 min-w-0 px-2 text-right" style={{ ...colHeaderStyle, ...(dsaHasTPImputations ? { color: '#a8a29e' } : {}) }} title={dsaHasTPImputations ? 'Neutralisé par créance récapitulative' : undefined}>Reste à charge</div>
                  )}
                </div>

                {/* Lignes */}
                {allLignes.map(l => {
                  const pieceCount = l.pieceIds?.length || 0;

                  return (
                    <div
                      key={l.id}
                      onClick={() => openDsaEditPanel(l)}
                      className="relative flex items-center h-[52px] border-b border-[#e7e5e3] last:border-b-0 bg-white group cursor-pointer hover:bg-[#fafaf9] transition-colors"
                    >
                      {/* Doc indicator */}
                      <div className="w-[52px] flex items-center justify-center flex-shrink-0 pl-3">
                        {pieceCount > 0 ? (
                          <div className="relative group/piece">
                            <span className="inline-flex items-center justify-center w-7 h-7 bg-[#DFE8F5] rounded-md relative">
                              <FileText className="w-4 h-4 text-[#2563eb]" />
                              <span className="absolute -top-1.5 left-[18px] min-w-[16px] h-4 bg-[#1e3a8a] text-white text-counter font-medium rounded-full flex items-center justify-center border-2 border-white px-0.5">{pieceCount}</span>
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
                        <span className="text-body-medium truncate block" style={{ color: '#292524' }}>{l.label || 'Sans libellé'}</span>
                      </div>

                      {/* Date */}
                      <div className="flex-1 min-w-0 px-3 text-right">
                        <span className="text-body" style={{ color: '#78716c' }}>{l.date || '—'}</span>
                      </div>

                      {/* Montant */}
                      <div className={`${isLigneMode ? 'w-[140px]' : 'w-[254px]'} px-3 text-right flex-shrink-0`}>
                        {l.montant != null ? (
                          <span className="text-body" style={{ color: '#44403c' }}>{fmt(l.montant)}</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#f9ecd6] rounded-md text-caption-medium text-[#855b31]">
                            <AlertCircle className="w-3 h-3" /> Compléter
                          </span>
                        )}
                      </div>

                      {isLigneMode ? (
                        <>
                          {(() => {
                            const ext = ligneExtractions.find(e => e.ligneId === l.id);
                            return dsaTPs.map(tp => (
                              <div key={tp.id} className="w-[100px] px-2 text-right flex-shrink-0">
                                {l.montant != null && ext?.tpAmounts?.[tp.id] ? (
                                  <span className="text-body" style={{ color: '#78716c' }}>{fmt(ext.tpAmounts[tp.id])}</span>
                                ) : (
                                  <span className="text-body" style={{ color: '#d6d3d1' }}>{'\u2014'}</span>
                                )}
                              </div>
                            ));
                          })()}
                          <div className="w-[100px] px-2 text-right flex-shrink-0">
                            {l.montant != null ? (
                              <span className="text-body-medium" style={{ color: '#292524' }}>{fmt((l.montant || 0) - Object.values(ligneExtractions.find(e => e.ligneId === l.id)?.tpAmounts || {}).reduce((s, v) => s + v, 0))}</span>
                            ) : null}
                          </div>
                        </>
                      ) : (
                        <div className="flex-1 min-w-0 px-2 text-right">
                          {l.montant != null ? (
                            <span className="text-body-medium" style={{ color: dsaHasTPImputations ? '#a8a29e' : '#292524' }}>{fmt((l.montant || 0) - (l.dejaRembourse || 0))}</span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#f9ecd6] rounded-md text-caption-medium text-[#855b31]">
                              <AlertCircle className="w-3 h-3" /> Compléter
                            </span>
                          )}
                        </div>
                      )}

                    </div>
                  );
                })}
              </>
            )}

            {/* Table footer total */}
            {allLignes.length > 0 && (
              <div className="border-t border-[#e7e5e3] bg-[#fafaf9]">
                <div className="flex items-center h-10">
                  <div className="w-[52px] flex-shrink-0 pl-3" />
                  <div className="flex-1 min-w-0 px-3">
                    <span style={{ fontSize: 12, fontWeight: 400, color: '#78716c' }}>Total dépenses</span>
                  </div>
                  <div className="flex-1 min-w-0 px-3" />
                  <div className={`${isLigneMode ? 'w-[140px]' : 'w-[254px]'} px-3 text-right flex-shrink-0`}>
                    <span style={{ fontSize: 12, fontWeight: 400, color: '#78716c' }}>{fmt(totalMontant)}</span>
                  </div>
                  {isLigneMode ? (
                    <>
                      {dsaTPs.map(tp => {
                        const tpTotal = ligneExtractions.reduce((s, le) => s + (le.tpAmounts?.[tp.id] || 0), 0);
                        return (
                          <div key={tp.id} className="w-[100px] px-2 text-right flex-shrink-0">
                            <span style={{ fontSize: 12, fontWeight: 400, color: '#a8a29e' }}>{fmt(tpTotal)}</span>
                          </div>
                        );
                      })}
                      <div className="w-[100px] px-2 text-right flex-shrink-0">
                        <span style={{ fontSize: 12, fontWeight: 400, color: '#78716c' }}>{fmt(totalMontant - ligneExtractions.reduce((s, le) => s + Object.values(le.tpAmounts || {}).reduce((ss, v) => ss + v, 0), 0))}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 min-w-0 px-2 text-right">
                      {!dsaHasTPImputations && <span style={{ fontSize: 12, fontWeight: 400, color: '#78716c' }}>{fmt(totalResteACharge)}</span>}
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>

          {renderTotalBlock('dsa', indemniteVictime, { guard: dsaLignes.length > 0 })}

              </div>{/* end space-y-4 */}
            </div>{/* end p-4 */}
          </div>{/* end CALCUL section */}

          {/* JURISPRUDENCES Section */}
          <div className="p-4 border-b border-[#e7e5e3]" style={{ backgroundColor: '#F8F7F5' }}>
            <JPListing
              pinnedJP={jp.getPinnedForPoste(currentLevel.id)}
              selectedDecisionId={jp.jpState.drawerDecisionId}
              compact={true}
              onOpenDrawer={(id, resultSet) => jp.openDrawer(id, resultSet)}
              onAddClick={() => jp.openStepper('jp-add')}
              posteLabel={currentLevel.title}
              onSearchJP={() => {
                const prompt = `Recherche des jurisprudences pertinentes pour le poste ${currentLevel.title} (${currentLevel.fullTitle || currentLevel.title}) dans ce dossier.`;
                setChatMessages(prev => [...prev, { type: 'user', text: prompt }]);
              }}
            />
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
                value={posteNotes.dsa || ''}
                onChange={(e) => setPosteNotes(prev => ({...prev, dsa: e.target.value}))}
                className="w-full p-4 text-[14px] text-[#292524] leading-[27px] resize-none min-h-[120px] focus:outline-none"
                placeholder="Ajoutez vos notes et arguments..."
              />
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
      const pgpaDamageOverride = tpScenario.damageOverrides?.pgpa;
      const indemniteVictimePGPA = allPostes.find(p => p.id === 'pgpa')?.victimeAmount ?? (perteDeGains - ijPercuesTotal);

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
              {renderParamPill({
                paramKey: 'revaloriser-pgpa',
                label: 'Revaloriser',
                values: pgpaData.revenuRef.revalorisation === 'ipc-annuel' ? 'IPC Annuel' : pgpaData.revenuRef.revalorisation === 'smic-horaire' ? 'SMIC Horaire' : 'Aucune',
                enabled: enabledParams['revaloriser-pgpa'],
                onClick: () => setActiveParamChip(activeParamChip === 'revaloriser-pgpa' ? null : 'revaloriser-pgpa'),
              })}
            </div>
            {activeParamChip === 'revaloriser-pgpa' && (
              <div className="px-4 py-3 border-t border-[#e7e5e3]" style={{ backgroundColor: '#F8F7F5' }}>
                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={enabledParams['revaloriser-pgpa']} onChange={() => setEnabledParams(p => ({ ...p, 'revaloriser-pgpa': !p['revaloriser-pgpa'] }))} className="sr-only peer" />
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
              {isCardExpanded('pgpa-revenu-ref') ? <ChevronDown className="w-4 h-4 text-[#78716c]" /> : <ChevronRight className="w-4 h-4 text-[#78716c]" />}
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
                <div className="w-[52px] text-center flex-shrink-0 pl-3" style={colHeaderStyle}>Doc</div>
                <div className="flex-1 min-w-0 px-3" style={colHeaderStyle}>Période</div>
                <div className="w-[200px] px-3 text-right flex-shrink-0" style={colHeaderStyle}>Revenu net période</div>
              </div>
            )}
            {/* Data rows */}
            {allRevenuRefLignes.map(l => {
              const pieceCount = l.pieceIds?.length || 0;
              return (
                <div key={l.id} onClick={() => { setEditingPieceIds(l.pieceIds || []); setSearchPiecesPanel(''); setEditPanel({ type: 'pgpa-revenu', title: 'Éditer le revenu', data: l }); }}
                  className="relative flex items-center h-[52px] border-b border-[#e7e5e3] last:border-b-0 bg-white group cursor-pointer hover:bg-[#fafaf9] transition-colors"
                  >
                  <div className="w-[52px] flex items-center justify-center flex-shrink-0 pl-3">
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
                    <span className="text-body-medium block text-[#292524]">{l.label || l.annee || 'Sans libellé'}</span>
                  </div>
                  <div className="w-[200px] px-3 text-right flex-shrink-0">
                    <span className="text-body-medium font-semibold tabular-nums text-[#292524]">{fmt(l.revalorise || l.montant || 0)}</span>
                  </div>
                </div>
              );
            })}
            {/* Table footer total */}
            {allRevenuRefLignes.length > 0 && (
              <div className="flex items-center h-10 border-t border-[#e7e5e3] bg-[#fafaf9]">
                <div className="w-[52px] flex-shrink-0 pl-3" />
                <div className="flex-1 min-w-0 px-3">
                  <span style={{ fontSize: 12, fontWeight: 400, color: '#78716c' }}>Total</span>
                </div>
                <div className="w-[200px] px-3 text-right flex-shrink-0">
                  <span style={{ fontSize: 12, fontWeight: 400, color: '#78716c' }}>{fmt(Math.round(revenuRefMensuel))}<span style={{ fontSize: 11, color: '#a8a29e', marginLeft: 4 }}>/ mois</span></span>
                </div>
              </div>
            )}
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
              {isCardExpanded('pgpa-revenus-percus') ? <ChevronDown className="w-4 h-4 text-[#78716c]" /> : <ChevronRight className="w-4 h-4 text-[#78716c]" />}
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
            {(() => {
              const pgpaBadges = tpScenario.pgpaRevenusPercusBadges || {};
              const hasBadges = Object.keys(pgpaBadges).length > 0;
              // Merge IJ into revenus perçus display when badges reference IJ entries
              const mergedRevenusPercus = hasBadges && Object.keys(pgpaBadges).some(k => k.startsWith('pgpa-ij'))
                ? [...pgpaData.revenusPercus, ...pgpaData.ijPercues.map(ij => ({ ...ij, _isIJ: true }))]
                : pgpaData.revenusPercus;
              const mergedTotal = mergedRevenusPercus.reduce((s, l) => s + (l.montant || 0), 0);
              return (
                <>
                  {mergedRevenusPercus.length > 0 && (
                    <div className="flex items-center h-10 border-b border-[#e7e5e3] bg-white">
                      <div className="w-[52px] text-center flex-shrink-0 pl-3" style={colHeaderStyle}>Doc</div>
                      <div className="flex-1 min-w-0 px-3" style={colHeaderStyle}>Période</div>
                      <div className="w-[200px] px-3 text-right flex-shrink-0" style={colHeaderStyle}>Revenu net période</div>
                    </div>
                  )}
                  {mergedRevenusPercus.map(l => {
                    const pieceCount = l.pieceIds?.length || 0;
                    const badge = pgpaBadges[l.id];
                    return (
                      <div key={l.id} onClick={() => { if (!l._isIJ) { setEditingPieceIds(l.pieceIds || []); setSearchPiecesPanel(''); setEditPanel({ type: 'pgpa-revenu-percu', title: 'Éditer le revenu perçu', data: l }); } }}
                        className="relative flex items-center h-[52px] border-b border-[#e7e5e3] last:border-b-0 bg-white group cursor-pointer hover:bg-[#fafaf9] transition-colors">
                        <div className="w-[52px] flex items-center justify-center flex-shrink-0 pl-3">
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
                          <div className="flex items-center gap-1.5">
                            <span className="text-body-medium text-[#292524]">{l.label || 'Sans libellé'}</span>
                            {badge && (
                              <span className="inline-flex items-center h-[18px] px-1.5 rounded-sm" style={{ backgroundColor: '#eeece6', fontSize: 10, fontWeight: 500, color: '#44403c', fontFamily: "'IBM Plex Mono', monospace" }}>
                                {badge.badgeLabel}
                              </span>
                            )}
                          </div>
                          <span className="text-caption text-[#78716c]">{l.periodeDebut} {'\u2192'} {l.periodeFin}</span>
                        </div>
                        <div className="w-[200px] px-3 text-right flex-shrink-0">
                          <span className="text-body-medium text-[#292524] font-semibold tabular-nums">{fmt(l.montant)}</span>
                        </div>
                      </div>
                    );
                  })}
                  {mergedRevenusPercus.length > 0 && (
                    <div className="flex items-center h-10 border-t border-[#e7e5e3] bg-[#fafaf9]">
                      <div className="w-[52px] flex-shrink-0 pl-3" />
                      <div className="flex-1 min-w-0 px-3">
                        <span style={{ fontSize: 12, fontWeight: 400, color: '#78716c' }}>Total</span>
                      </div>
                      <div className="w-[200px] px-3 text-right flex-shrink-0">
                        <span style={{ fontSize: 12, fontWeight: 400, color: '#78716c' }}>{fmt(hasBadges ? mergedTotal : revenusPercusTotal)}</span>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
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
              {isCardExpanded('pgpa-perte-chance') ? <ChevronDown className="w-4 h-4 text-[#78716c]" /> : <ChevronRight className="w-4 h-4 text-[#78716c]" />}
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
            </div>
            {/* Add row */}
            <div className="flex items-center justify-center h-[45px] bg-white">
              <button className="flex items-center gap-2 text-body-medium text-[#1e3a8a]">
                <Plus className="w-4 h-4" /> Ajouter une perte de chance
              </button>
            </div>
          </>}
          </div>

          {renderTotalBlock('pgpa', indemniteVictimePGPA)}

              </div>
            </div>
          </div>

          {/* JURISPRUDENCES Section */}
          <div className="p-4 border-b border-[#e7e5e3]" style={{ backgroundColor: '#F8F7F5' }}>
            <JPListing
              pinnedJP={jp.getPinnedForPoste(currentLevel.id)}
              selectedDecisionId={jp.jpState.drawerDecisionId}
              compact={true}
              onOpenDrawer={(id, resultSet) => jp.openDrawer(id, resultSet)}
              onAddClick={() => jp.openStepper('jp-add')}
              posteLabel={currentLevel.title}
              onSearchJP={() => {
                const prompt = `Recherche des jurisprudences pertinentes pour le poste ${currentLevel.title} (${currentLevel.fullTitle || currentLevel.title}) dans ce dossier.`;
                setChatMessages(prev => [...prev, { type: 'user', text: prompt }]);
              }}
            />
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
        </div>
      );
    }

    // ========== PGPF ==========
    if (currentLevel.id === 'pgpf') {
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
              {renderParamPill({
                paramKey: 'capitaliser-pgpf',
                label: 'Capitaliser',
                values: enabledParams['capitaliser-pgpf'] ? 'IPC Annuel, XX, XX ans' : null,
                enabled: enabledParams['capitaliser-pgpf'],
                onClick: () => setActiveParamChip(activeParamChip === 'capitaliser-pgpf' ? null : 'capitaliser-pgpf'),
              })}
            </div>
            {activeParamChip === 'capitaliser-pgpf' && (
              <div className="px-4 py-3 border-t border-[#e7e5e3]" style={{ backgroundColor: '#F8F7F5' }}>
                <div className="flex items-center gap-3 flex-wrap">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={enabledParams['capitaliser-pgpf']} onChange={() => setEnabledParams(p => ({ ...p, 'capitaliser-pgpf': !p['capitaliser-pgpf'] }))} className="sr-only peer" />
                    <div className="w-9 h-5 bg-[#d6d3d1] peer-checked:bg-[#292524] rounded-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                  </label>
                  <div className="w-px h-4 bg-[#d6d3d1]" />
                  {renderBaremePopoverSelect({
                    popoverId: 'pgpf',
                    value: chiffrageParams.baremeCapitalisation,
                    onChange: (id) => setChiffrageParams(prev => ({ ...prev, baremeCapitalisation: id })),
                    filterType: 'bareme',
                    label: 'Barème',
                    variant: 'horizontal',
                  })}
                  <div className="w-px h-4 bg-[#d6d3d1]" />
                  <span className="text-sm font-medium text-[#78716c]">Fin arrérage</span>
                  <select className="text-sm text-[#292524] bg-white border border-[#e7e5e3] rounded-lg px-3 py-1.5" style={{ boxShadow: '0px 1px 2px 0px rgba(26,26,26,0.05)' }}>
                    <option>IPC Annuel</option>
                    <option>IPC Mensuel</option>
                  </select>
                  <div className="w-px h-4 bg-[#d6d3d1]" />
                  <span className="text-sm font-medium text-[#78716c]">Départ retraite</span>
                  <input type="text" defaultValue="XX ans" className="text-sm text-[#292524] bg-white border border-[#e7e5e3] rounded-lg px-3 py-1.5 w-[70px]" style={{ boxShadow: '0px 1px 2px 0px rgba(26,26,26,0.05)' }} />
                </div>
              </div>
            )}
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
                {isCardExpanded('pgpf-revenus-percus') ? <ChevronDown className="w-4 h-4 text-[#78716c]" /> : <ChevronRight className="w-4 h-4 text-[#78716c]" />}
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
                  </div>
                );
              })}
              {/* Table footer total */}
              {periodeCL.revenusPercus.length > 0 && (
                <div className="flex items-center h-10 border-t border-[#e7e5e3] bg-[#fafaf9]">
                  <div className="w-12 flex-shrink-0" />
                  <div className="w-[52px] flex-shrink-0" />
                  <div className="flex-1 min-w-0 px-3">
                    <span style={{ fontSize: 12, fontWeight: 400, color: '#78716c' }}>Total</span>
                  </div>
                  <div className="w-[200px] px-3 text-right flex-shrink-0">
                    <span style={{ fontSize: 12, fontWeight: 400, color: '#78716c' }}>{fmt(periodeCL.revenusPercus.reduce((s, l) => s + l.montant, 0))}</span>
                  </div>
                </div>
              )}
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
                {isCardExpanded('pgpf-perte-chance') ? <ChevronDown className="w-4 h-4 text-[#78716c]" /> : <ChevronRight className="w-4 h-4 text-[#78716c]" />}
              </div>
              {isCardExpanded('pgpf-perte-chance') && <>
              <div className="flex items-center h-10 border-b border-[#e7e5e3] bg-white">
                <div className="w-12 flex-shrink-0"></div>
                <div className="w-[52px] text-center flex-shrink-0" style={colHeaderStyle}>Doc</div>
                <div className="flex-1 min-w-0 px-3" style={colHeaderStyle}>Libellé</div>
                <div className="w-28 px-3 text-right flex-shrink-0" style={colHeaderStyle}>Montant espéré</div>
                <div className="w-24 px-3 text-center flex-shrink-0" style={colHeaderStyle}>Coefficient</div>
                <div className="w-28 px-3 text-right flex-shrink-0" style={colHeaderStyle}>Montant proraté</div>
              </div>
              <div className="flex items-center justify-center h-[45px] bg-white">
                <button className="flex items-center gap-2 text-body-medium text-[#1e3a8a]">
                  <Plus className="w-4 h-4" /> Ajouter une perte de chance
                </button>
              </div>
              </>}
            </div>

            {/* Cascade summary block — shown when ATMP cascade applies to PGPF */}
            {hasTP && tpScenario.cascade && (() => {
              const c = tpScenario.cascade;
              const ligne = (tpScenario.lignesTP || []).find(l => l.id === c.ligneTPId);
              return (
                <div className="px-3 py-3 rounded-md mb-2" style={{ backgroundColor: '#f5f0e8', border: '1px solid #e2ddd4' }}>
                  <div className="flex justify-between items-baseline mb-2">
                    <span style={{ fontSize: 13, color: '#44403c', fontWeight: 600 }}>Imputation {c.sigle} · rente AT/MP</span>
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: '#78716c' }}>cascade capitalisée</span>
                  </div>
                  <div className="space-y-1">
                    {tpLine('Créance globale CPAM AT/MP', c.capitalise, { bold: true })}
                    <div style={{ fontSize: 11, color: '#a8a29e', marginLeft: 8, marginBottom: 4 }}>
                      Rente annuelle capitalisée ({fmt(c.renteAnnuelle)}/an × {c.coefficient}) + arrérages échus {fmt(c.arreragesEchus)}
                    </div>
                    {tpDivider()}
                    {tpLine('Imputation sur PGPF échu', c.arreragesEchus)}
                    {tpLine('Imputation sur PGPF à échoir', c.arreragesAEchoir)}
                    {c.etapes && c.etapes.filter(e => e.posteId !== 'pgpf').map(e => (
                      <React.Fragment key={e.posteId}>{tpLine(`Imputation sur ${e.label}`, e.absorbe, { muted: true })}</React.Fragment>
                    ))}
                    {tpDivider()}
                    {tpLine('Total imputé', c.totalAbsorbe, { bold: true })}
                    {tpLine('Créance non recouvrée', c.nonRecouvre, { muted: true })}
                  </div>
                  {ligne?.piece && (
                    <div className="mt-2">
                      <button
                        className="text-[11px] text-[#78716c] hover:text-[#44403c] hover:underline transition-colors"
                        onClick={() => setActiveTab('Dossier')}
                      >
                        {ligne.piece} {'\u2192'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Total Block: PGPF échu */}
            {(() => {
              const grossEchu = hasTP && tpScenario.damageOverrides?.pgpfEchu != null ? tpScenario.damageOverrides.pgpfEchu : pgpfClTotal;
              const tpEchu = hasTP ? (tpScenario._imputations || []).filter(i => i.posteId === 'pgpf').reduce((s, i) => s + (i.montantImputeEchu || 0), 0) : 0;
              const victimeEchu = Math.max(0, grossEchu - tpEchu);
              const echuImps = hasTP ? (tpScenario._imputations || []).filter(imp => imp.posteId === 'pgpf' && imp.montantImputeEchu) : [];
              const ijTotal = periodeCL.ijPercues ? periodeCL.ijPercues.reduce((s, l) => s + l.montant, 0) : 0;
              return renderTotalBlock('pgpfCl', victimeEchu, { label: 'PGPF échu', content: (
                <>
                  <div className="mt-3 space-y-1">
                    {tpLine('Revenu de référence mensuel', Math.round(periodeCL.revenuRef.total / 12), { unit: '/ mois' })}
                    {tpLine(`\u00d7 ${periodeCL.periode.mois} mois`, Math.round(periodeCL.revenuRef.total / 12) * periodeCL.periode.mois)}
                    {tpLine('\u2212 Revenus perçus', periodeCL.revenusPercus.reduce((s, l) => s + l.montant, 0))}
                    {ijTotal > 0 && tpLine('\u2212 IJ perçues', ijTotal)}
                    {tpSubtotal('Préjudice échu', pgpfClTotal)}
                  </div>
                  {echuImps.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-[#e7e5e3] space-y-1.5">
                      {echuImps.map((imp, idx) => {
                        const tpEntity = tpScenario.tiersPayeurs.find(t => t.id === imp.tiersPayeurId);
                        const ligne = (tpScenario.lignesTP || []).find(l => l.id === imp.ligneTPId);
                        const globalAmount = ligne?.montant;
                        return <React.Fragment key={idx}>{tpDeduction(
                          tpEntity?.sigle || '?',
                          imp.montantImputeEchu,
                          `Arrérages échus de la rente AT/MP${globalAmount != null ? ` · créance globale ${fmtTP(globalAmount)}` : ''}`
                        )}</React.Fragment>;
                      })}
                    </div>
                  )}
                </>
              )});
            })()}
            </>
          )}

          {/* Total Block: PGPF à échoir */}
          {periodeAL && (() => {
            const grossAEchoir = hasTP && tpScenario.damageOverrides?.pgpfAEchoir != null ? tpScenario.damageOverrides.pgpfAEchoir : (periodeAL.params.montantCapitalise || 0);
            const tpAEchoir = hasTP ? (tpScenario._imputations || []).filter(i => i.posteId === 'pgpf').reduce((s, i) => s + (i.montantImputeAEchoir || 0), 0) : 0;
            const victimeAEchoir = Math.max(0, grossAEchoir - tpAEchoir);
            const aEchoirImps = hasTP ? (tpScenario._imputations || []).filter(imp => imp.posteId === 'pgpf' && imp.montantImputeAEchoir) : [];
            return renderTotalBlock('pgpfAl', victimeAEchoir, { label: 'PGPF à échoir', content: (
              <>
                <div className="mt-3 space-y-1">
                  {tpLine('Arrérage annuel', periodeAL.params.perteGainAnnuelle, { unit: '/ an' })}
                  {tpLine('\u00d7 coefficient capitalisation', null, { raw: `\u00d7 ${periodeAL.params.coefficient}` })}
                  {tpSubtotal('Préjudice à échoir', periodeAL.params.montantCapitalise)}
                </div>
                {aEchoirImps.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[#e7e5e3] space-y-1.5">
                    {aEchoirImps.map((imp, idx) => {
                      const tpEntity = tpScenario.tiersPayeurs.find(t => t.id === imp.tiersPayeurId);
                      const ligne = (tpScenario.lignesTP || []).find(l => l.id === imp.ligneTPId);
                      const globalAmount = ligne?.montant;
                      return <React.Fragment key={idx}>{tpDeduction(
                        tpEntity?.sigle || '?',
                        imp.montantImputeAEchoir,
                        `Rente AT/MP capitalisée (${fmt(tpScenario.cascade?.renteAnnuelle || 0)}/an \u00d7 ${tpScenario.cascade?.coefficient || 0})${globalAmount != null ? ` · créance globale ${fmtTP(globalAmount)}` : ''}`
                      )}</React.Fragment>;
                    })}
                  </div>
                )}
              </>
            )});
          })()}

          {/* Total Block: PGPF total summary (spec §3 Block 3) */}
          {(() => {
            const grossEchu = hasTP && tpScenario.damageOverrides?.pgpfEchu != null ? tpScenario.damageOverrides.pgpfEchu : pgpfClTotal;
            const tpEchuSum = hasTP ? (tpScenario._imputations || []).filter(i => i.posteId === 'pgpf').reduce((s, i) => s + (i.montantImputeEchu || 0), 0) : 0;
            const victEchu = Math.max(0, grossEchu - tpEchuSum);
            const grossAEchoir = hasTP && tpScenario.damageOverrides?.pgpfAEchoir != null ? tpScenario.damageOverrides.pgpfAEchoir : pgpfAlTotal;
            const tpAEchoirSum = hasTP ? (tpScenario._imputations || []).filter(i => i.posteId === 'pgpf').reduce((s, i) => s + (i.montantImputeAEchoir || 0), 0) : 0;
            const victAEchoir = Math.max(0, grossAEchoir - tpAEchoirSum);
            const pgpfVictimeTotal = victEchu + victAEchoir;
            return renderTotalBlock('pgpfTotal', pgpfVictimeTotal, { label: 'Total PGPF', content: (
              <div className="mt-3 space-y-1">
                {tpLine('Indemnité victime échue', victEchu)}
                {periodeAL && tpLine('Indemnité victime à échoir', victAEchoir)}
                {hasTP && pgpfVictimeTotal === 0 && tpScenario.cascade && (
                  <div className="mt-2 pt-2 border-t border-[#f0efed]">
                    <span style={{ fontSize: 12, color: '#a8a29e', fontStyle: 'italic', lineHeight: '18px' }}>
                      La rente AT/MP capitalisée couvre l'intégralité du préjudice futur. La victime ne perçoit pas d'indemnité complémentaire sur ce poste.
                    </span>
                  </div>
                )}
              </div>
            )});
          })()}

              </div>
            </div>
          </div>

          {/* JURISPRUDENCES Section */}
          <div className="p-4 border-b border-[#e7e5e3]" style={{ backgroundColor: '#F8F7F5' }}>
            <JPListing
              pinnedJP={jp.getPinnedForPoste(currentLevel.id)}
              selectedDecisionId={jp.jpState.drawerDecisionId}
              compact={true}
              onOpenDrawer={(id, resultSet) => jp.openDrawer(id, resultSet)}
              onAddClick={() => jp.openStepper('jp-add')}
              posteLabel={currentLevel.title}
              onSearchJP={() => {
                const prompt = `Recherche des jurisprudences pertinentes pour le poste ${currentLevel.title} (${currentLevel.fullTitle || currentLevel.title}) dans ce dossier.`;
                setChatMessages(prev => [...prev, { type: 'user', text: prompt }]);
              }}
            />
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
        </div>
      );
    }

    // ========== DFT ==========
    if (currentLevel.id === 'dft') {
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
              {renderParamPill({
                paramKey: 'base-journaliere-dft',
                label: 'Base',
                values: `${chiffrageParams.baseJournaliereDFT} €/j`,
                enabled: enabledParams['base-journaliere-dft'],
                onClick: () => setActiveParamChip(activeParamChip === 'base-journaliere-dft' ? null : 'base-journaliere-dft'),
              })}
            </div>
            {activeParamChip === 'base-journaliere-dft' && (
              <div className="px-4 py-3 border-t border-[#e7e5e3]" style={{ backgroundColor: '#F8F7F5' }}>
                <input
                  type="number"
                  defaultValue={chiffrageParams.baseJournaliereDFT || 33}
                  className="text-sm text-[#292524] text-right bg-white border border-[#e7e5e3] rounded-lg px-3 py-1.5 w-[69px]"
                  style={{ boxShadow: '0px 1px 2px 0px rgba(26,26,26,0.05)' }}
                  onChange={(e) => setChiffrageParams(prev => ({ ...prev, baseJournaliereDFT: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            )}
          </div>

          {/* Card Block: DFT */}
            <div className={cardBlockClass}>
              {/* Title Row */}
              <div className="flex items-center justify-between h-12 px-4 border-b border-[#e7e5e3]">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-[#eeece6] rounded-[6px] flex items-center justify-center">
                    <Calendar className="w-3.5 h-3.5 text-[#78716c]" />
                  </div>
                  <span className="text-[14px] font-medium text-[#292524]">Déficit fonctionnel temporaire</span>
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
                  <div className="w-[52px] text-center flex-shrink-0 pl-3" style={colHeaderStyle}>Doc</div>
                  <div className="flex-1 min-w-0 px-3" style={colHeaderStyle}>Période & jours</div>
                  <div className="w-20 px-3 text-center flex-shrink-0" style={colHeaderStyle}>Taux</div>
                  <div className="w-[200px] px-3 text-right flex-shrink-0" style={colHeaderStyle}>Montant</div>
                </div>
              )}

              {/* Rows */}
              {dftLignes.map(l => {
                const pieceCount = l.pieceIds?.length || 0;
                return (
                  <div key={l.id} onClick={() => { setEditingPieceIds(l.pieceIds || []); setSearchPiecesPanel(''); setEditPanel({ type: 'dft-ligne', title: 'Éditer la dépense', data: l }); }}
                    className="relative flex items-center h-[52px] border-b border-[#e7e5e3] last:border-b-0 bg-white group cursor-pointer hover:bg-[#fafaf9] transition-colors"
                    >
                    {/* Doc indicator */}
                    <div className="w-[52px] flex items-center justify-center flex-shrink-0 pl-3">
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
                      <span className="text-body-medium block text-[#292524]">{l.label || 'Sans libellé'}</span>
                      <span className="text-caption text-[#78716c]">{l.debut} → {l.fin} · {l.jours}j</span>
                    </div>

                    {/* Taux */}
                    <div className="w-20 px-3 text-center flex-shrink-0">
                      <span className={`text-caption-medium px-2 py-0.5 rounded-full ${l.taux === 100 ? 'bg-[#eeece6] text-[#44403c]' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>{l.taux || 100}%</span>
                    </div>

                    {/* Montant */}
                    <div className="w-[200px] px-3 text-right flex-shrink-0">
                      {l.montant != null ? (
                        <span className="text-body-medium font-semibold tabular-nums text-[#292524]">{fmt(l.montant)}</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#f9ecd6] rounded-md text-caption-medium text-[#855b31]">
                          <AlertCircle className="w-3 h-3" /> Compléter
                        </span>
                      )}
                    </div>

                  </div>
                );
              })}

              {/* Table footer total */}
              {dftLignes.length > 0 && (
                <div className="flex items-center h-10 border-t border-[#e7e5e3] bg-[#fafaf9]">
                  <div className="w-12 flex-shrink-0" />
                  <div className="w-[52px] flex-shrink-0" />
                  <div className="flex-1 min-w-0 px-3">
                    <span style={{ fontSize: 12, fontWeight: 400, color: '#78716c' }}>Total DFT</span>
                  </div>
                  <div className="w-20 flex-shrink-0" />
                  <div className="w-[200px] px-3 text-right flex-shrink-0">
                    <span style={{ fontSize: 12, fontWeight: 400, color: '#78716c' }}>{fmt(dftTotal)}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {renderTotalBlock('dft', allPostes.find(p => p.id === 'dft')?.victimeAmount ?? dftTotal, { guard: dftLignes.length > 0 })}

              </div>{/* end space-y-4 */}
            </div>{/* end p-4 */}
          </div>{/* end CALCUL section */}

          {/* JURISPRUDENCES Section */}
          <div className="p-4 border-b border-[#e7e5e3]" style={{ backgroundColor: '#F8F7F5' }}>
            <JPListing
              pinnedJP={jp.getPinnedForPoste(currentLevel.id)}
              selectedDecisionId={jp.jpState.drawerDecisionId}
              compact={true}
              onOpenDrawer={(id, resultSet) => jp.openDrawer(id, resultSet)}
              onAddClick={() => jp.openStepper('jp-add')}
              posteLabel={currentLevel.title}
              onSearchJP={() => {
                const prompt = `Recherche des jurisprudences pertinentes pour le poste ${currentLevel.title} (${currentLevel.fullTitle || currentLevel.title}) dans ce dossier.`;
                setChatMessages(prev => [...prev, { type: 'user', text: prompt }]);
              }}
            />
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
                value={posteNotes.dft || ''}
                onChange={(e) => setPosteNotes(prev => ({...prev, dft: e.target.value}))}
                className="w-full p-4 text-[14px] text-[#292524] leading-[27px] resize-none min-h-[120px] focus:outline-none"
                placeholder="Ajoutez vos notes et arguments..."
              />
            </div>
          </div>

        </div>
      );
    }


    // ========== SE — Souffrances Endurées ==========
    if (currentLevel.id === 'se') {
      const seData = formPosteData.se || { referentiel: 'cours-appel-2024', cotation: 0, montant: 0 };
      const seTotalDisplay = allPostes.find(p => p.id === 'se')?.victimeAmount ?? seData.montant;
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
                    {renderParamPill({
                      paramKey: 'revaloriser-se',
                      label: 'Revaloriser',
                      enabled: enabledParams['revaloriser-se'],
                      onClick: () => setActiveParamChip(activeParamChip === 'revaloriser-se' ? null : 'revaloriser-se'),
                    })}
                  </div>
                  {activeParamChip === 'revaloriser-se' && (
                    <div className="px-4 py-3 border-t border-[#e7e5e3]" style={{ backgroundColor: '#F8F7F5' }}>
                      <div className="flex items-center gap-3">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={enabledParams['revaloriser-se']} onChange={() => setEnabledParams(p => ({ ...p, 'revaloriser-se': !p['revaloriser-se'] }))} className="sr-only peer" />
                          <div className="w-9 h-5 bg-[#d6d3d1] peer-checked:bg-[#292524] rounded-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                        </label>
                        <div className="w-px h-4 bg-[#e7e5e3]" />
                        <span className="text-sm font-medium text-[#78716c]">Indice</span>
                        <select className="text-sm text-[#292524] bg-white border border-[#e7e5e3] rounded-lg px-3 py-1.5" style={{ boxShadow: '0px 1px 2px 0px rgba(26,26,26,0.05)' }}>
                          <option>IPC Annuel</option>
                          <option>IPC Mensuel</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
                {/* Form Block */}
                <div className={cardBlockClass}>
                  <div className="p-5">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        {renderBaremePopoverSelect({
                          popoverId: 'se',
                          value: seData.referentiel,
                          onChange: (id) => setFormPosteData(prev => ({ ...prev, se: { ...prev.se, referentiel: id } })),
                          filterType: 'referentiel',
                          label: 'Référentiel',
                        })}
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

                {renderTotalBlock('se', seTotalDisplay)}
              </div>
            </div>
          </div>

          {/* JURISPRUDENCES Section */}
          <div className="p-4 border-b border-[#e7e5e3]" style={{ backgroundColor: '#F8F7F5' }}>
            <JPListing
              pinnedJP={jp.getPinnedForPoste(currentLevel.id)}
              selectedDecisionId={jp.jpState.drawerDecisionId}
              compact={true}
              onOpenDrawer={(id, resultSet) => jp.openDrawer(id, resultSet)}
              onAddClick={() => jp.openStepper('jp-add')}
              posteLabel={currentLevel.title}
              onSearchJP={() => {
                const prompt = `Recherche des jurisprudences pertinentes pour le poste ${currentLevel.title} (${currentLevel.fullTitle || currentLevel.title}) dans ce dossier.`;
                setChatMessages(prev => [...prev, { type: 'user', text: prompt }]);
              }}
            />
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
                    {renderParamPill({
                      paramKey: 'revaloriser-pep',
                      label: 'Revaloriser',
                      enabled: enabledParams['revaloriser-pep'],
                      onClick: () => setActiveParamChip(activeParamChip === 'revaloriser-pep' ? null : 'revaloriser-pep'),
                    })}
                  </div>
                  {activeParamChip === 'revaloriser-pep' && (
                    <div className="px-4 py-3 border-t border-[#e7e5e3]" style={{ backgroundColor: '#F8F7F5' }}>
                      <div className="flex items-center gap-3">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={enabledParams['revaloriser-pep']} onChange={() => setEnabledParams(p => ({ ...p, 'revaloriser-pep': !p['revaloriser-pep'] }))} className="sr-only peer" />
                          <div className="w-9 h-5 bg-[#d6d3d1] peer-checked:bg-[#292524] rounded-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                        </label>
                        <div className="w-px h-4 bg-[#e7e5e3]" />
                        <span className="text-sm font-medium text-[#78716c]">Indice</span>
                        <select className="text-sm text-[#292524] bg-white border border-[#e7e5e3] rounded-lg px-3 py-1.5" style={{ boxShadow: '0px 1px 2px 0px rgba(26,26,26,0.05)' }}>
                          <option>IPC Annuel</option>
                          <option>IPC Mensuel</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
                {/* Form Block */}
                <div className={cardBlockClass}>
                  <div className="p-5">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        {renderBaremePopoverSelect({
                          popoverId: 'pep',
                          value: pepData.referentiel,
                          onChange: (id) => setFormPosteData(prev => ({ ...prev, pep: { ...prev.pep, referentiel: id } })),
                          filterType: 'referentiel',
                          label: 'Référentiel',
                        })}
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

                {renderTotalBlock('pep', allPostes.find(p => p.id === 'pep')?.victimeAmount ?? pepData.montant)}
              </div>
            </div>
          </div>

          {/* JURISPRUDENCES Section */}
          <div className="p-4 border-b border-[#e7e5e3]" style={{ backgroundColor: '#F8F7F5' }}>
            <JPListing
              pinnedJP={jp.getPinnedForPoste(currentLevel.id)}
              selectedDecisionId={jp.jpState.drawerDecisionId}
              compact={true}
              onOpenDrawer={(id, resultSet) => jp.openDrawer(id, resultSet)}
              onAddClick={() => jp.openStepper('jp-add')}
              posteLabel={currentLevel.title}
              onSearchJP={() => {
                const prompt = `Recherche des jurisprudences pertinentes pour le poste ${currentLevel.title} (${currentLevel.fullTitle || currentLevel.title}) dans ce dossier.`;
                setChatMessages(prev => [...prev, { type: 'user', text: prompt }]);
              }}
            />
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
        </div>
      );
    }

    // ========== DFP — Déficit Fonctionnel Permanent ==========
    if (currentLevel.id === 'dfp') {
      const dfpData = formPosteData.dfp || { referentiel: 'cours-appel-2024', age: 0, taux: 0, trancheAge: 'inferieure', trancheTaux: 'inferieure', pointBase: 0, montant: 0 };
      const dfpTotalDisplay = allPostes.find(p => p.id === 'dfp')?.victimeAmount ?? dfpData.montant;
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
                    {renderParamPill({
                      paramKey: 'revaloriser-dfp',
                      label: 'Revaloriser',
                      enabled: enabledParams['revaloriser-dfp'],
                      onClick: () => setActiveParamChip(activeParamChip === 'revaloriser-dfp' ? null : 'revaloriser-dfp'),
                    })}
                  </div>
                  {activeParamChip === 'revaloriser-dfp' && (
                    <div className="px-4 py-3 border-t border-[#e7e5e3]" style={{ backgroundColor: '#F8F7F5' }}>
                      <div className="flex items-center gap-3">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={enabledParams['revaloriser-dfp']} onChange={() => setEnabledParams(p => ({ ...p, 'revaloriser-dfp': !p['revaloriser-dfp'] }))} className="sr-only peer" />
                          <div className="w-9 h-5 bg-[#d6d3d1] peer-checked:bg-[#292524] rounded-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                        </label>
                        <div className="w-px h-4 bg-[#e7e5e3]" />
                        <span className="text-sm font-medium text-[#78716c]">Indice</span>
                        <select className="text-sm text-[#292524] bg-white border border-[#e7e5e3] rounded-lg px-3 py-1.5" style={{ boxShadow: '0px 1px 2px 0px rgba(26,26,26,0.05)' }}>
                          <option>IPC Annuel</option>
                          <option>IPC Mensuel</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
                {/* Form Block */}
                <div className={cardBlockClass}>
                  <div className="p-5 space-y-5">
                    {/* Référentiel */}
                    <div>
                      {renderBaremePopoverSelect({
                        popoverId: 'dfp',
                        value: dfpData.referentiel,
                        onChange: (id) => setFormPosteData(prev => ({ ...prev, dfp: { ...prev.dfp, referentiel: id } })),
                        filterType: 'referentiel',
                        label: 'Référentiel',
                      })}
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

                {renderTotalBlock('dfp', dfpTotalDisplay)}
              </div>
            </div>
          </div>

          {/* JURISPRUDENCES Section */}
          <div className="p-4 border-b border-[#e7e5e3]" style={{ backgroundColor: '#F8F7F5' }}>
            <JPListing
              pinnedJP={jp.getPinnedForPoste(currentLevel.id)}
              selectedDecisionId={jp.jpState.drawerDecisionId}
              compact={true}
              onOpenDrawer={(id, resultSet) => jp.openDrawer(id, resultSet)}
              onAddClick={() => jp.openStepper('jp-add')}
              posteLabel={currentLevel.title}
              onSearchJP={() => {
                const prompt = `Recherche des jurisprudences pertinentes pour le poste ${currentLevel.title} (${currentLevel.fullTitle || currentLevel.title}) dans ce dossier.`;
                setChatMessages(prev => [...prev, { type: 'user', text: prompt }]);
              }}
            />
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
        </div>
      );
    }

    // ========== IV POSTE DETAIL PAGE (config-driven) ==========
    if (currentLevel.type === 'poste-iv') {
      const ivPosteId = currentLevel.id;
      const ivTaxo = allTaxoPostes.find(p => p.id === ivPosteId);
      const ivLignes = ivPosteData[ivPosteId]?.lignes || [];
      const config = IV_POSTE_CONFIG[ivPosteId] || { type: 'A', columns: ['victime', 'lien', 'montant', 'bareme'] };
      const ivTotal = config.type === 'C'
        ? ivLignes.reduce((s, l) => s + (l.totalAmount || 0), 0)
        : ivLignes.reduce((s, l) => s + (l.montant || 0), 0);
      const hasIntitule = config.columns.includes('intitule');

      // Helper: add a new empty ligne for Type B/C
      const addIvLigne = (victimeId = null) => {
        setIvPosteData(prev => {
          const existing = prev[ivPosteId]?.lignes || [];
          const newLigne = config.type === 'C'
            ? { id: crypto.randomUUID(), label: '', totalAmount: 0, pieceIds: [], attributions: [] }
            : { id: crypto.randomUUID(), victimeId, montant: 0, pieceIds: [], intitule: '' };
          return { ...prev, [ivPosteId]: { ...prev[ivPosteId], lignes: [...existing, newLigne] } };
        });
      };

      // Helper: delete a ligne by id
      const deleteIvLigne = (ligneId) => {
        setIvPosteData(prev => {
          const existing = prev[ivPosteId]?.lignes || [];
          return { ...prev, [ivPosteId]: { ...prev[ivPosteId], lignes: existing.filter(l => l.id !== ligneId) } };
        });
      };

      return (
        <div>
          {/* Per-victim / expense table */}
          <div className="border-b border-[#e7e5e3]" style={{ backgroundColor: '#F8F7F5' }}>
            <div className="p-4">

              {/* ===== TYPE A: one row per VI ===== */}
              {config.type === 'A' && (() => {
                const selectedBareme = baremesLibrary.find(b => b.id === (ivPosteData[ivPosteId]?.bareme || ''));
                const baremeParamKey = `iv-${ivPosteId}-bareme`;
                return (
                <>
                  {/* Param chips block */}
                  <div className={cardBlockClass + ' mb-4'}>
                    <div className="flex items-center gap-3 px-4 h-[52px]">
                      <div className="w-6 h-6 bg-[#eeece6] rounded-[6px] flex items-center justify-center flex-shrink-0">
                        <Settings className="w-3.5 h-3.5 text-[#78716c]" />
                      </div>
                      <button
                        onClick={() => setActiveParamChip(activeParamChip === baremeParamKey ? null : baremeParamKey)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border transition-colors"
                        style={{
                          background: selectedBareme ? PILL_SCHEMES.info.bg : PILL_SCHEMES.neutral.bg,
                          borderColor: selectedBareme ? PILL_SCHEMES.info.border : PILL_SCHEMES.neutral.border,
                          color: selectedBareme ? PILL_SCHEMES.info.text : PILL_SCHEMES.neutral.text,
                        }}
                      >
                        <Scale className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>Barême</span>
                        {selectedBareme && <span style={{ fontWeight: 400 }}>{selectedBareme.label}</span>}
                      </button>
                    </div>
                    {activeParamChip === baremeParamKey && (
                      <div className="px-4 py-2.5 border-t border-[#e7e5e3]" style={{ backgroundColor: '#F8F7F5' }}>
                        <div className="flex items-center gap-3">
                          <div className="flex gap-1 items-baseline flex-shrink-0">
                            <span className="text-sm font-medium text-[#78716c]">Barême</span>
                            {selectedBareme && (
                              <button onClick={() => setBaremeViewerOpen(selectedBareme.id)} className="text-xs font-medium text-[#1e3a8a]">Voir</button>
                            )}
                          </div>
                          <div className="relative" style={{ width: 240 }}>
                            {renderBaremePopoverSelect({
                              popoverId: `iv-${ivPosteId}-bareme`,
                              value: ivPosteData[ivPosteId]?.bareme || '',
                              onChange: (id) => setIvPosteData(prev => ({ ...prev, [ivPosteId]: { ...prev[ivPosteId], bareme: id } })),
                              filterType: 'referentiel',
                              label: '',
                              variant: 'horizontal',
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className={cardBlockClass}>
                    {/* Column headers — RowPostIV Header */}
                    <div className="flex items-center h-10 border-b border-[#e7e5e3]" style={{ backgroundColor: '#fafaf9' }}>
                      <div className={hasIntitule ? 'w-[240px] px-3' : 'flex-1 px-3'}>
                        <span style={colHeaderStyle}>Nom victime indirecte</span>
                      </div>
                      {hasIntitule && (
                        <div className="flex-1 px-3">
                          <span style={colHeaderStyle}>Libellé</span>
                        </div>
                      )}
                      <div className="w-[160px] px-3 text-right">
                        <span style={colHeaderStyle}>Montant</span>
                      </div>
                      <div className="w-11" />
                    </div>

                    {/* Data rows — one per declared VI — RowPostIV Line */}
                    {victimesIndirectes.map((vi, idx) => {
                      const ligne = ivLignes.find(l => l.victimeId === vi.id);
                      const montant = ligne?.montant || 0;
                      return (
                        <div
                          key={vi.id}
                          className="relative flex items-center h-[52px] border-b border-[#e7e5e3] last:border-b-0 bg-white group cursor-pointer hover:bg-[#fafaf9] transition-colors"
                          onClick={() => setEditPanel({
                            type: 'iv-ligne-a',
                            title: `${vi.prenom} ${vi.nom} — ${ivTaxo?.label || ivPosteId}`,
                            data: { victimeId: vi.id, posteId: ivPosteId, montant, pieceIds: ligne?.pieceIds || [], intitule: ligne?.intitule || '', hasIntitule }
                          })}
                        >
                          {/* CellIV: avatar + name + (lien) */}
                          <div className={`${hasIntitule ? 'w-[240px]' : 'flex-1'} px-3 flex items-center gap-3 min-w-0`}>
                            {viAvatar(vi, 28)}
                            <span className="truncate" style={{ fontSize: 14, fontWeight: 400, color: '#292524' }}>{vi.prenom} {vi.nom}</span>
                            <span className="flex-shrink-0" style={{ fontSize: 12, fontWeight: 400, color: '#78716c', letterSpacing: '0.12px' }}>({vi.lien})</span>
                          </div>
                          {hasIntitule && (
                            <div className="flex-1 px-3 min-w-0">
                              <span className="truncate block" style={{ fontSize: 14, fontWeight: 400, color: ligne?.intitule ? '#44403c' : '#a8a29e' }}>{ligne?.intitule || '—'}</span>
                            </div>
                          )}
                          <div className="w-[160px] px-3 flex items-center justify-end">
                            {montant > 0 ? (
                              <span style={{ fontSize: 14, fontWeight: 500, color: '#292524' }}>{fmt(montant)}</span>
                            ) : (
                              <span style={{ fontSize: 14, fontWeight: 400, color: '#a8a29e' }}>—</span>
                            )}
                          </div>
                          <div className="w-11 flex items-center justify-center flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="w-4 h-4 text-[#a8a29e]" />
                          </div>
                        </div>
                      );
                    })}

                    {victimesIndirectes.length === 0 && (
                      <div className="p-6 text-center"><span className="text-body text-[#a8a29e]">Aucune dépense enregistrée</span></div>
                    )}
                  </div>

                </>
                );
              })()}

              {/* ===== TYPE B: flat list sorted by VI ===== */}
              {config.type === 'B' && (() => {
                // Flatten: sorted by VI, then by line order
                const flatRows = [];
                victimesIndirectes.forEach(vi => {
                  ivLignes.filter(l => l.victimeId === vi.id).forEach(ligne => {
                    flatRows.push({ vi, ligne });
                  });
                });

                return (
                  <div className={cardBlockClass}>
                    {/* Column headers — RowPostIV Header */}
                    <div className="flex items-center h-10 border-b border-[#e7e5e3]" style={{ backgroundColor: '#fafaf9' }}>
                      <div className="w-[52px] px-3"><span style={colHeaderStyle}></span></div>
                      <div className="flex-1 px-3"><span style={colHeaderStyle}>Nom victime indirecte</span></div>
                      <div className="flex-1 px-3"><span style={colHeaderStyle}>Libellé</span></div>
                      <div className="w-[160px] px-3 text-right"><span style={colHeaderStyle}>Montant</span></div>
                      <div className="w-11" />
                    </div>

                    {/* Flat rows — RowPostIV Line */}
                    {flatRows.map((row, idx) => {
                      const pieceCount = (row.ligne.pieceIds || []).length;
                      return (
                      <div
                        key={row.ligne.id || idx}
                        className="relative flex items-center h-[52px] border-b border-[#e7e5e3] last:border-b-0 bg-white group cursor-pointer hover:bg-[#fafaf9] transition-colors"
                        onClick={() => setEditPanel({
                          type: 'iv-ligne-b',
                          title: `${row.vi.prenom} ${row.vi.nom} — Dépense`,
                          data: { id: row.ligne.id, victimeId: row.vi.id, posteId: ivPosteId, intitule: row.ligne.intitule || '', montant: row.ligne.montant || 0, pieceIds: row.ligne.pieceIds || [] }
                        })}
                      >
                        {/* Doc holder cell */}
                        <div className="w-[52px] flex items-center justify-center flex-shrink-0 px-3">
                          {pieceCount > 0 ? (
                            <span className="inline-flex items-center justify-center w-[26px] h-[26px] bg-[#DFE8F5] rounded-md relative">
                              <FileText className="w-4 h-4 text-[#2563eb]" />
                              <span className="absolute -top-1.5 left-[18px] min-w-[16px] h-4 bg-[#1e3a8a] text-white font-medium rounded-full flex items-center justify-center border-2 border-white px-0.5" style={{ fontSize: 10 }}>{pieceCount}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center w-[26px] h-[26px] bg-[#F8F7F5] text-[#d6d3d1] rounded-md border border-dashed border-[#e7e5e3]">
                              <FileText className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>
                        {/* CellIV: avatar + name + (lien) */}
                        <div className="flex-1 px-3 flex items-center gap-3 min-w-0">
                          {viAvatar(row.vi, 28)}
                          <span className="truncate" style={{ fontSize: 14, fontWeight: 400, color: '#292524' }}>{row.vi.prenom} {row.vi.nom}</span>
                          <span className="flex-shrink-0" style={{ fontSize: 12, fontWeight: 400, color: '#78716c', letterSpacing: '0.12px' }}>({row.vi.lien})</span>
                        </div>
                        {/* Libellé */}
                        <div className="flex-1 px-3 min-w-0">
                          <span className="truncate block" style={{ fontSize: 14, fontWeight: 400, color: row.ligne.intitule ? '#44403c' : '#a8a29e' }}>
                            {row.ligne.intitule || 'Sans intitulé'}
                          </span>
                        </div>
                        {/* Amount */}
                        <div className="w-[160px] px-3 flex items-center justify-end">
                          {row.ligne.montant > 0 ? (
                            <span style={{ fontSize: 14, fontWeight: 500, color: '#292524' }}>{fmt(row.ligne.montant)}</span>
                          ) : (
                            <span style={{ fontSize: 14, fontWeight: 400, color: '#a8a29e' }}>—</span>
                          )}
                        </div>
                        {/* Actions */}
                        <div className="w-11 flex items-center justify-center flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="w-4 h-4 text-[#a8a29e]" />
                        </div>
                      </div>
                      );
                    })}

                    {flatRows.length === 0 && (
                      <div className="p-6 text-center"><span className="text-body text-[#a8a29e]">Aucune dépense enregistrée</span></div>
                    )}

                    {/* Add expense */}
                    <button
                      onClick={() => addIvLigne(null)}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-body-medium text-[#1e3a8a] hover:bg-[#fafaf9] transition-colors border-t border-[#e7e5e3]"
                    >
                      <Plus className="w-4 h-4" />
                      Ajouter une dépense
                    </button>
                  </div>
                );
              })()}

              {/* ===== TYPE C: flat list — one row per VI attribution ===== */}
              {config.type === 'C' && (() => {
                const viInitials = (vi) => `${(vi.prenom || '')[0] || ''}${(vi.nom || '')[0] || ''}`.toUpperCase();
                const grandTotal = ivLignes.reduce((s, l) => s + (l.totalAmount || 0), 0);

                const openExpensePanel = (ligne) => setEditPanel({
                  type: 'iv-ligne-c',
                  title: ligne.label || 'Dépense',
                  data: { id: ligne.id, posteId: ivPosteId, label: ligne.label || '', totalAmount: ligne.totalAmount || 0, attributions: ligne.attributions || [], pieceIds: ligne.pieceIds || [] }
                });

                // Flatten: one row per VI attribution, sorted by VI then by expense order
                const flatRows = [];
                victimesIndirectes.forEach(vi => {
                  ivLignes.forEach(ligne => {
                    const attr = (ligne.attributions || []).find(a => a.viId === vi.id);
                    if (attr) flatRows.push({ vi, ligne, amount: attr.amount });
                  });
                });

                return (
                  <>
                    <div className={cardBlockClass}>
                      {/* Column headers */}
                      <div className="flex items-center h-10 border-b border-[#e7e5e3]" style={{ backgroundColor: '#fafaf9' }}>
                        <div className="w-[52px] pl-3"><span style={colHeaderStyle}>Pj</span></div>
                        <div className="w-[200px] px-3"><span style={colHeaderStyle}>Victime</span></div>
                        <div className="flex-1 px-3"><span style={colHeaderStyle}>Dépense</span></div>
                        <div className="w-[130px] px-3 text-right"><span style={colHeaderStyle}>Montant</span></div>
                      </div>

                      {/* Flat rows */}
                      {flatRows.map((row, idx) => {
                        const pieceCount = (row.ligne.pieceIds || []).length;
                        return (
                        <div
                          key={`${row.vi.id}-${row.ligne.id}`}
                          className="relative flex items-center h-[52px] border-b border-[#e7e5e3] last:border-b-0 bg-white group cursor-pointer hover:bg-[#fafaf9] transition-colors"
                          onClick={() => openExpensePanel(row.ligne)}
                        >
                          <div className="w-[52px] flex items-center justify-center flex-shrink-0 pl-3">
                            {pieceCount > 0 ? (
                              <span className="inline-flex items-center justify-center w-7 h-7 bg-[#DFE8F5] rounded-md relative">
                                <FileText className="w-4 h-4 text-[#2563eb]" />
                                {pieceCount > 1 && <span className="absolute -top-1.5 left-[18px] min-w-[16px] h-4 bg-[#1e3a8a] text-white text-counter font-medium rounded-full flex items-center justify-center border-2 border-white px-0.5">{pieceCount}</span>}
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center w-7 h-7 bg-[#F8F7F5] text-[#d6d3d1] rounded-md border border-dashed border-[#e7e5e3]">
                                <FileText className="w-3.5 h-3.5" />
                              </span>
                            )}
                          </div>
                          <div className="w-[200px] px-3 flex items-center gap-2 min-w-0">
                            {viAvatar(row.vi, 28)}
                            <span className="truncate" style={{ fontSize: 14, fontWeight: 400, color: '#292524' }}>{row.vi.prenom} {row.vi.nom}</span>
                          </div>
                          <div className="flex-1 px-3 min-w-0">
                            <span className="truncate block" style={{ fontSize: 14, fontWeight: 400, color: row.ligne.label ? '#44403c' : '#a8a29e' }}>
                              {row.ligne.label || 'Sans intitulé'}
                            </span>
                          </div>
                          <div className="w-[130px] px-3 text-right">
                            <span style={{ fontSize: 14, fontWeight: 500, color: '#292524' }}>{fmt(row.amount)}</span>
                          </div>
                        </div>
                        );
                      })}

                      {flatRows.length === 0 && (
                        <div className="p-6 text-center"><span className="text-body text-[#a8a29e]">Aucune dépense enregistrée</span></div>
                      )}

                      {/* Add expense */}
                      <button
                        onClick={() => addIvLigne(null)}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-body-medium text-[#1e3a8a] hover:bg-[#fafaf9] transition-colors border-t border-[#e7e5e3]"
                      >
                        <Plus className="w-4 h-4" />
                        Ajouter une dépense
                      </button>
                    </div>

                  </>
                );
              })()}

              {/* ===== TYPE D: toggle + revenu ref + calcul perte + ventilation ===== */}
              {config.type === 'D' && (() => {
                const shared = ivPosteSharedData[ivPosteId] || {};
                const isDecede = shared.victimeDecedee !== false;
                const revenuRefLignes = shared.revenuRefLignes || [];
                const revenuRefMoyen = revenuRefLignes.length > 0
                  ? revenuRefLignes.reduce((s, l) => s + (l.netMensuel || 0), 0) / revenuRefLignes.length
                  : 0;
                const revenuConjoint = shared.revenuConjoint || 0;
                const revenuAnnuelRef = revenuRefMoyen * 12;
                const revenuTotal = revenuAnnuelRef + revenuConjoint;
                const autoMethod = shared.autoConsommationMethod || 'percentage';
                const nombreParts = shared.nombreParts || 0;
                const partAutoConsommation = autoMethod === 'parts' && nombreParts > 0
                  ? Math.round((1 / nombreParts) * 1000) / 10
                  : (shared.partAutoConsommation || 0);
                const perteAnnuelleBrute = isDecede ? revenuAnnuelRef : 0;
                const perteAnnuelle = isDecede
                  ? revenuAnnuelRef * (1 - partAutoConsommation / 100)
                  : Math.max(0, revenuRefMoyen - (shared.revenuActuel || 0)) * 12;
                const sumParts = ivLignes.reduce((s, l) => s + (l.partIndividuelle || 0), 0);
                const partsWarning = isDecede && (sumParts + partAutoConsommation) !== 100 && sumParts > 0;
                const computeLineAmounts = (l) => {
                  const part = l.partIndividuelle || 0;
                  const perteVI = perteAnnuelle * (part / 100);
                  const anneesEchues = l.anneesEchues || 0;
                  const echu = perteVI * anneesEchues;
                  const coeff = l.coeffCapitalisation || 0;
                  const mode = l.mode || 'capitalisation';
                  const aEchoir = mode === 'capitalisation' ? perteVI * coeff : 0;
                  const total = mode === 'capitalisation' ? echu + aEchoir : echu;
                  return { perteVI, echu, aEchoir, total, mode, coeff, anneesEchues };
                };
                const totalDistribue = ivLignes.reduce((s, l) => s + computeLineAmounts(l).total, 0);

                const updateShared = (updates) => setIvPosteSharedData(prev => ({
                  ...prev, [ivPosteId]: { ...prev[ivPosteId], ...updates }
                }));

                const addRevenuRef = () => updateShared({
                  revenuRefLignes: [...revenuRefLignes, { id: crypto.randomUUID(), source: '', periode: '', netMensuel: 0, pieceIds: [] }]
                });

                const updateRevenuRef = (ligneId, field, value) => updateShared({
                  revenuRefLignes: revenuRefLignes.map(l => l.id === ligneId ? { ...l, [field]: value } : l)
                });

                const deleteRevenuRef = (ligneId) => updateShared({
                  revenuRefLignes: revenuRefLignes.filter(l => l.id !== ligneId)
                });

                return (
                  <>
                    {/* Use case preset selector */}
                    <div className="flex items-center gap-2 mb-4">
                      <span style={{ fontSize: 12, fontWeight: 500, color: '#78716c', letterSpacing: '0.02em' }}>Scénario</span>
                      <select
                        value={prpUseCase}
                        onChange={(e) => {
                          const uc = e.target.value;
                          setPrpUseCase(uc);
                          const isDec = uc.startsWith('decede');
                          const hasEchu = !uc.includes('sans-echu');
                          const anneesVal = hasEchu ? 3 : 0;
                          const modeMap = {
                            'decede-capital-echu': ['capitalisation', 'capitalisation', 'capitalisation'],
                            'decede-rente': ['rente', 'rente', 'rente'],
                            'decede-mixte': ['capitalisation', 'rente', 'rente'],
                            'decede-sans-echu': ['capitalisation', 'capitalisation', 'capitalisation'],
                            'blesse-capital': ['capitalisation', 'capitalisation', 'capitalisation'],
                            'blesse-rente': ['rente', 'rente', 'rente'],
                          };
                          const modes = modeMap[uc] || ['capitalisation', 'capitalisation', 'capitalisation'];
                          updateShared({ victimeDecedee: isDec, revenuActuel: isDec ? 0 : 1000 });
                          setIvPosteData(prev => ({
                            ...prev,
                            [ivPosteId]: {
                              ...prev[ivPosteId],
                              lignes: (prev[ivPosteId]?.lignes || []).map((l, i) => ({
                                ...l, mode: modes[i] || modes[0], anneesEchues: anneesVal,
                              }))
                            }
                          }));
                        }}
                        className="text-caption px-2.5 py-1.5 border border-[#e7e5e3] rounded-lg bg-white text-[#292524] focus:outline-none focus:ring-1 focus:ring-[#292524]"
                      >
                        <option value="decede-capital-echu">Décédé + capital + échu</option>
                        <option value="decede-rente">Décédé + rente</option>
                        <option value="decede-mixte">Décédé + mixte</option>
                        <option value="decede-sans-echu">Décédé + sans échu</option>
                        <option value="blesse-capital">Blessé + capital</option>
                        <option value="blesse-rente">Blessé + rente</option>
                      </select>
                    </div>

                    {/* TABLE 1 — Revenu de référence */}
                    <div className={cardBlockClass + ' mb-4'}>
                      <div className="flex items-center justify-between h-12 px-4 border-b border-[#e7e5e3] cursor-pointer" onClick={() => toggleCard(`iv-${ivPosteId}-d-revref`)}>
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-[#eeece6] rounded-[6px] flex items-center justify-center">
                            <Calculator className="w-3.5 h-3.5 text-[#78716c]" />
                          </div>
                          <span className="text-[14px] font-medium text-[#292524]">Revenu de référence</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {revenuRefMoyen > 0 ? (
                            <span style={serifAmountStyle} className="text-[#292524]">{fmt(Math.round(revenuRefMoyen))}<span className="text-[14px] text-[#78716c] ml-1">/ mois</span></span>
                          ) : (
                            <span style={serifAmountStyle} className="text-[#a8a29e]">—</span>
                          )}
                          {isIvCardExpanded(`iv-${ivPosteId}-d-revref`) ? <ChevronDown className="w-4 h-4 text-[#78716c]" /> : <ChevronRight className="w-4 h-4 text-[#78716c]" />}
                        </div>
                      </div>
                      {isIvCardExpanded(`iv-${ivPosteId}-d-revref`) && (<>
                        <div className="flex items-center h-10 border-b border-[#e7e5e3]" style={{ backgroundColor: '#fafaf9' }}>
                          <div className="w-[52px] pl-3" />
                          <div className="flex-1 px-3"><span style={colHeaderStyle}>Source</span></div>
                          <div className="w-[110px] px-3"><span style={colHeaderStyle}>Période</span></div>
                          <div className="w-[130px] px-3 text-right"><span style={colHeaderStyle}>Net mensuel</span></div>
                        </div>
                        {revenuRefLignes.map((ligne, idx) => (
                          <div key={ligne.id} className={`relative flex items-center h-[52px] border-b border-[#e7e5e3] last:border-b-0 bg-white group cursor-pointer hover:bg-[#fafaf9] transition-colors`}>
                            <div className="w-[52px] flex items-center justify-center flex-shrink-0 pl-3">
                              {ligne.pieceIds?.length > 0 ? (
                                <span className="inline-flex items-center justify-center w-7 h-7 bg-[#DFE8F5] rounded-md relative">
                                  <FileText className="w-4 h-4 text-[#2563eb]" />
                                  {ligne.pieceIds.length > 1 && <span className="absolute -top-1.5 left-[18px] min-w-[16px] h-4 bg-[#1e3a8a] text-white text-counter font-medium rounded-full flex items-center justify-center border-2 border-white px-0.5">{ligne.pieceIds.length}</span>}
                                </span>
                              ) : (
                                <span className="inline-flex items-center justify-center w-7 h-7 bg-[#F8F7F5] rounded-md border border-dashed border-[#e7e5e3]">
                                  <FileText className="w-3.5 h-3.5 text-[#d6d3d1]" />
                                </span>
                              )}
                            </div>
                            <div className="flex-1 px-3">
                              <span className="truncate block" style={{ fontSize: 14, color: ligne.source ? '#292524' : '#a8a29e' }}>{ligne.source || '—'}</span>
                            </div>
                            <div className="w-[110px] px-3">
                              <span style={{ fontSize: 14, color: ligne.periode ? '#292524' : '#a8a29e' }}>{ligne.periode || '—'}</span>
                            </div>
                            <div className="w-[130px] px-3 text-right">
                              <span style={{ fontSize: 14, fontWeight: 500, color: '#292524' }}>{fmt(ligne.netMensuel || 0)}</span>
                            </div>
                          </div>
                        ))}
                        {revenuRefLignes.length === 0 && (
                          <div className="p-6 text-center">
                            <span className="text-body text-[#a8a29e]">Aucun revenu de référence</span>
                          </div>
                        )}
                        {revenuRefLignes.length > 0 && (
                          <div className="flex items-center justify-between h-10 px-4 border-t border-[#e7e5e3]" style={{ backgroundColor: '#fafaf9' }}>
                            <span style={{ fontSize: 12, fontWeight: 500, color: '#78716c' }}>Moyenne mensuelle</span>
                            <span style={{ fontSize: 14, fontWeight: 500, color: '#292524' }}>{fmt(revenuRefMoyen)}</span>
                          </div>
                        )}
                        <button
                          onClick={addRevenuRef}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-body-medium text-[#1e3a8a] hover:bg-[#fafaf9] transition-colors border-t border-[#e7e5e3]"
                        >
                          <Plus className="w-4 h-4" />
                          Ajouter un revenu
                        </button>
                      </>)}
                    </div>

                    {/* TABLE 2 — Calcul de la perte */}
                    <div className={cardBlockClass + ' mb-4'}>
                      <div className="flex items-center justify-between h-12 px-4 border-b border-[#e7e5e3] cursor-pointer" onClick={() => toggleCard(`iv-${ivPosteId}-d-calcul`)}>
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-[#eeece6] rounded-[6px] flex items-center justify-center">
                            <Calculator className="w-3.5 h-3.5 text-[#78716c]" />
                          </div>
                          <span className="text-[14px] font-medium text-[#292524]">Calcul de la perte</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {perteAnnuelle > 0 ? (
                            <span style={serifAmountStyle} className="text-[#292524]">{fmt(Math.round(perteAnnuelle))}<span className="text-[14px] text-[#78716c] ml-1">/ an</span></span>
                          ) : (
                            <span style={serifAmountStyle} className="text-[#a8a29e]">—</span>
                          )}
                          {isIvCardExpanded(`iv-${ivPosteId}-d-calcul`) ? <ChevronDown className="w-4 h-4 text-[#78716c]" /> : <ChevronRight className="w-4 h-4 text-[#78716c]" />}
                        </div>
                      </div>
                      {isIvCardExpanded(`iv-${ivPosteId}-d-calcul`) && (
                      <div className="p-4 space-y-3">
                        {/* Revenu de référence — auto from Table 1 */}
                        <div className="flex items-center justify-between">
                          <span style={{ fontSize: 13, color: '#78716c' }}>{isDecede ? 'Revenu de référence annuel' : 'Revenu de référence mensuel'}</span>
                          <span style={{ fontSize: 14, fontWeight: 500, color: '#292524' }}>{fmt(isDecede ? revenuAnnuelRef : revenuRefMoyen)}</span>
                        </div>

                        {isDecede ? (
                          <>
                            {/* Décédé mode */}
                            <div className="flex items-center justify-between">
                              <span style={{ fontSize: 13, color: '#78716c' }}>Revenu annuel du conjoint survivant</span>
                              <span style={{ fontSize: 14, color: '#292524' }}>{fmt(revenuConjoint)}</span>
                            </div>
                            <div className="flex items-center justify-between py-1 border-t border-[#e7e5e3]">
                              <span style={{ fontSize: 13, fontWeight: 500, color: '#292524' }}>Revenu total du foyer</span>
                              <span style={{ fontSize: 14, fontWeight: 500, color: '#292524' }}>{fmt(revenuTotal)}</span>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                              <span style={{ fontSize: 13, color: '#78716c' }}>Méthode de calcul</span>
                              <span style={{ fontSize: 14, color: '#292524' }}>{autoMethod === 'percentage' ? '% libre' : 'Par parts'}</span>
                            </div>

                            {autoMethod === 'parts' && (
                              <div className="flex items-center justify-between">
                                <span style={{ fontSize: 13, color: '#78716c' }}>Nombre de parts</span>
                                <span style={{ fontSize: 14, color: '#292524' }}>{nombreParts}</span>
                              </div>
                            )}

                            <div className="flex items-center justify-between">
                              <span style={{ fontSize: 13, color: '#78716c' }}>Part d'auto-consommation</span>
                              <span style={{ fontSize: 14, fontWeight: 500, color: '#292524' }}>{partAutoConsommation} %</span>
                            </div>

                            <div className="pt-3 mt-2 border-t border-[#e7e5e3] space-y-2">
                              <div className="flex items-center justify-between">
                                <span style={{ fontSize: 13, color: '#78716c' }}>Perte annuelle brute</span>
                                <span style={{ fontSize: 14, color: '#292524' }}>{fmt(perteAnnuelleBrute)}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span style={{ fontSize: 13, fontWeight: 500, color: '#292524' }}>Perte annuelle nette (à répartir)</span>
                                <span style={{ fontSize: 14, fontWeight: 500, color: '#292524' }}>{fmt(perteAnnuelle)}</span>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            {/* Blessé mode — simplified */}
                            <div className="flex items-center justify-between">
                              <span style={{ fontSize: 13, color: '#78716c' }}>Revenu actuel (victime)</span>
                              <span style={{ fontSize: 14, color: '#292524' }}>{fmt(shared.revenuActuel || 0)}/mois</span>
                            </div>
                            <div className="flex items-center justify-between py-1 border-t border-[#e7e5e3]">
                              <span style={{ fontSize: 13, color: '#78716c' }}>Perte mensuelle</span>
                              <span style={{ fontSize: 14, color: '#292524' }}>{fmt(Math.max(0, revenuRefMoyen - (shared.revenuActuel || 0)))}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span style={{ fontSize: 13, fontWeight: 500, color: '#292524' }}>Perte annuelle</span>
                              <span style={{ fontSize: 14, fontWeight: 500, color: '#292524' }}>{fmt(perteAnnuelle)}</span>
                            </div>
                          </>
                        )}
                      </div>
                      )}
                    </div>

                    {/* TABLE 3a — Échu (past losses) */}
                    {ivLignes.some(l => (l.anneesEchues || 0) > 0) && (
                      <div className={cardBlockClass + ' mb-4'}>
                        <div className="flex items-center justify-between h-12 px-4 border-b border-[#e7e5e3] cursor-pointer" onClick={() => toggleCard(`iv-${ivPosteId}-d-echu`)}>
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-[#eeece6] rounded-[6px] flex items-center justify-center">
                              <Clock className="w-3.5 h-3.5 text-[#78716c]" />
                            </div>
                            <span className="text-[14px] font-medium text-[#292524]">Échu</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span style={serifAmountStyle} className="text-[#292524]">{fmt(ivLignes.reduce((s, l) => s + computeLineAmounts(l).echu, 0))}</span>
                            {isIvCardExpanded(`iv-${ivPosteId}-d-echu`) ? <ChevronDown className="w-4 h-4 text-[#78716c]" /> : <ChevronRight className="w-4 h-4 text-[#78716c]" />}
                          </div>
                        </div>
                        {isIvCardExpanded(`iv-${ivPosteId}-d-echu`) && (<>
                          <div className="flex items-center h-10 border-b border-[#e7e5e3]" style={{ backgroundColor: '#fafaf9' }}>
                            <div className="flex-1 px-3"><span style={colHeaderStyle}>Victime</span></div>
                            <div className="w-[70px] px-2 text-right"><span style={colHeaderStyle}>Part</span></div>
                            <div className="w-[100px] px-2 text-right"><span style={colHeaderStyle}>Perte/an</span></div>
                            <div className="w-[70px] px-2 text-right"><span style={colHeaderStyle}>Années</span></div>
                            <div className="w-[110px] px-2 text-right"><span style={colHeaderStyle}>Échu</span></div>
                          </div>
                          {victimesIndirectes.map(vi => {
                            const ligne = ivLignes.find(l => l.victimeId === vi.id);
                            if (!ligne) return null;
                            const amounts = computeLineAmounts(ligne);
                            return (
                              <div key={vi.id} className="relative flex items-center h-[52px] border-b border-[#e7e5e3] last:border-b-0 bg-white group cursor-pointer hover:bg-[#fafaf9] transition-colors"
                                onClick={() => setEditPanel({ type: 'iv-ligne-d', title: `${vi.prenom} ${vi.nom} — Échu`, data: { victimeId: vi.id, posteId: ivPosteId, partIndividuelle: ligne.partIndividuelle || 0, dureeIndemnisation: ligne.dureeIndemnisation || '', anneesEchues: ligne.anneesEchues || 0, mode: amounts.mode, coeffCapitalisation: amounts.coeff, perteAnnuelle } })}
                              >
                                <div className="flex-1 px-3 flex items-center gap-2 min-w-0">
                                  {viAvatar(vi, 24)}
                                  <span className="truncate" style={{ fontSize: 13, color: '#292524' }}>{vi.prenom} {vi.nom}</span>
                                </div>
                                <div className="w-[70px] px-2 text-right"><span style={{ fontSize: 13, fontWeight: 500, color: '#292524' }}>{ligne.partIndividuelle}%</span></div>
                                <div className="w-[100px] px-2 text-right"><span style={{ fontSize: 13, color: '#292524' }}>{fmt(amounts.perteVI)}</span></div>
                                <div className="w-[70px] px-2 text-right"><span style={{ fontSize: 13, color: '#78716c' }}>{amounts.anneesEchues} ans</span></div>
                                <div className="w-[110px] px-2 text-right"><span style={{ fontSize: 13, fontWeight: 500, color: '#292524' }}>{fmt(amounts.echu)}</span></div>
                              </div>
                            );
                          })}
                          {/* Footer */}
                          <div className="flex items-center h-10 border-t border-[#e7e5e3]" style={{ backgroundColor: '#fafaf9' }}>
                            <div className="flex-1 px-3"><span style={{ fontSize: 12, fontWeight: 600, color: '#44403c' }}>Total échu</span></div>
                            <div className="w-[70px] px-2 text-right"><span style={{ fontSize: 12, fontWeight: 500, color: '#44403c' }}>{sumParts}%</span></div>
                            <div className="w-[100px] px-2 text-right"><span style={{ fontSize: 12, fontWeight: 500, color: '#44403c' }}>{fmt(perteAnnuelle)}</span></div>
                            <div className="w-[70px] px-2" />
                            <div className="w-[110px] px-2 text-right"><span style={{ fontSize: 13, fontWeight: 600, color: '#292524' }}>{fmt(ivLignes.reduce((s, l) => s + computeLineAmounts(l).echu, 0))}</span></div>
                          </div>
                        </>)}
                      </div>
                    )}

                    {/* TABLE 3b — À échoir (future losses) */}
                    <div className={cardBlockClass + ' mb-4'}>
                      <div className="flex items-center justify-between h-12 px-4 border-b border-[#e7e5e3] cursor-pointer" onClick={() => toggleCard(`iv-${ivPosteId}-d-aechoir`)}>
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-[#eeece6] rounded-[6px] flex items-center justify-center">
                            <TrendingUp className="w-3.5 h-3.5 text-[#78716c]" />
                          </div>
                          <span className="text-[14px] font-medium text-[#292524]">À échoir</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {(() => {
                            const totAEchoir = ivLignes.reduce((s, l) => s + computeLineAmounts(l).aEchoir, 0);
                            const hasRente = ivLignes.some(l => (l.mode || 'capitalisation') === 'rente');
                            return totAEchoir > 0 ? (
                              <span style={serifAmountStyle} className="text-[#292524]">{fmt(totAEchoir)}</span>
                            ) : hasRente ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium" style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>RENTE</span>
                            ) : (
                              <span style={serifAmountStyle} className="text-[#a8a29e]">—</span>
                            );
                          })()}
                          {isIvCardExpanded(`iv-${ivPosteId}-d-aechoir`) ? <ChevronDown className="w-4 h-4 text-[#78716c]" /> : <ChevronRight className="w-4 h-4 text-[#78716c]" />}
                        </div>
                      </div>
                      {isIvCardExpanded(`iv-${ivPosteId}-d-aechoir`) && (<>
                        <div className="flex items-center h-10 border-b border-[#e7e5e3]" style={{ backgroundColor: '#fafaf9' }}>
                          <div className="flex-1 px-3"><span style={colHeaderStyle}>Victime</span></div>
                          <div className="w-[70px] px-2 text-right"><span style={colHeaderStyle}>Part</span></div>
                          <div className="w-[100px] px-2 text-right"><span style={colHeaderStyle}>Perte/an</span></div>
                          <div className="w-[100px] px-2"><span style={colHeaderStyle}>Durée</span></div>
                          <div className="w-[70px] px-2"><span style={colHeaderStyle}>Mode</span></div>
                          <div className="w-[55px] px-2 text-right"><span style={colHeaderStyle}>Coeff.</span></div>
                          <div className="w-[110px] px-2 text-right"><span style={colHeaderStyle}>À échoir</span></div>
                        </div>
                        {victimesIndirectes.map(vi => {
                          const ligne = ivLignes.find(l => l.victimeId === vi.id);
                          if (!ligne) return null;
                          const amounts = computeLineAmounts(ligne);
                          return (
                            <div key={vi.id} className="relative flex items-center h-[52px] border-b border-[#e7e5e3] last:border-b-0 bg-white group cursor-pointer hover:bg-[#fafaf9] transition-colors"
                              onClick={() => setEditPanel({ type: 'iv-ligne-d', title: `${vi.prenom} ${vi.nom} — À échoir`, data: { victimeId: vi.id, posteId: ivPosteId, partIndividuelle: ligne.partIndividuelle || 0, dureeIndemnisation: ligne.dureeIndemnisation || '', anneesEchues: ligne.anneesEchues || 0, mode: amounts.mode, coeffCapitalisation: amounts.coeff, perteAnnuelle } })}
                            >
                              <div className="flex-1 px-3 flex items-center gap-2 min-w-0">
                                {viAvatar(vi, 24)}
                                <span className="truncate" style={{ fontSize: 13, color: '#292524' }}>{vi.prenom} {vi.nom}</span>
                              </div>
                              <div className="w-[70px] px-2 text-right"><span style={{ fontSize: 13, fontWeight: 500, color: '#292524' }}>{ligne.partIndividuelle}%</span></div>
                              <div className="w-[100px] px-2 text-right"><span style={{ fontSize: 13, color: '#292524' }}>{fmt(amounts.perteVI)}</span></div>
                              <div className="w-[100px] px-2"><span className="truncate block" style={{ fontSize: 12, color: '#78716c' }}>{ligne.dureeIndemnisation || '—'}</span></div>
                              <div className="w-[70px] px-2"><span style={{ fontSize: 12, color: '#78716c' }}>{amounts.mode === 'capitalisation' ? 'Capital' : 'Rente'}</span></div>
                              <div className="w-[55px] px-2 text-right">
                                {amounts.mode === 'capitalisation' ? (
                                  <span style={{ fontSize: 13, color: '#292524' }}>{amounts.coeff}</span>
                                ) : (
                                  <span style={{ fontSize: 13, color: '#d6d3d1' }}>—</span>
                                )}
                              </div>
                              <div className="w-[110px] px-2 text-right">
                                {amounts.mode === 'capitalisation' ? (
                                  <span style={{ fontSize: 13, fontWeight: 500, color: '#292524' }}>{fmt(amounts.aEchoir)}</span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>
                                    RENTE {fmt(amounts.perteVI)}/an
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        {/* Footer */}
                        {(() => {
                          const totAEchoir = ivLignes.reduce((s, l) => s + computeLineAmounts(l).aEchoir, 0);
                          return (
                            <div className="flex items-center h-10 border-t border-[#e7e5e3]" style={{ backgroundColor: '#fafaf9' }}>
                              <div className="flex-1 px-3"><span style={{ fontSize: 12, fontWeight: 600, color: '#44403c' }}>Total à échoir</span></div>
                              <div className="w-[70px] px-2" />
                              <div className="w-[100px] px-2" />
                              <div className="w-[100px] px-2" />
                              <div className="w-[70px] px-2" />
                              <div className="w-[55px] px-2" />
                              <div className="w-[110px] px-2 text-right"><span style={{ fontSize: 13, fontWeight: 600, color: '#292524' }}>{totAEchoir > 0 ? fmt(totAEchoir) : '—'}</span></div>
                            </div>
                          );
                        })()}
                      </>)}
                    </div>

                    {/* TABLE 3c — Total par bénéficiaire (beige total block) */}
                    <div className={totalBlockClass}>
                      <button onClick={() => toggleCard(`iv-${ivPosteId}-d-recap`)} className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-[#d6d3d1] rounded-[6px] flex items-center justify-center">
                            <User className="w-3.5 h-3.5 text-[#78716c]" />
                          </div>
                          <span className="text-[14px] font-medium text-[#292524]">Total par bénéficiaire</span>
                        </div>
                        <div className="flex items-center gap-3">
                          {totalDistribue > 0 ? (
                            <span style={serifAmountStyle} className="text-[#292524]">{fmt(Math.round(totalDistribue))}</span>
                          ) : (
                            <span style={serifAmountStyle} className="text-[#a8a29e]">—</span>
                          )}
                          <ChevronRight className={`w-4 h-4 text-[#78716c] transition-transform ${isIvCardExpanded(`iv-${ivPosteId}-d-recap`) ? 'rotate-90' : ''}`} />
                        </div>
                      </button>
                      {isIvCardExpanded(`iv-${ivPosteId}-d-recap`) && (<>
                        <div className="border-t border-[#d6d3d1] mt-3 mb-3" />
                        <div className="space-y-2">
                          {victimesIndirectes.map(vi => {
                            const ligne = ivLignes.find(l => l.victimeId === vi.id);
                            if (!ligne) return null;
                            const amounts = computeLineAmounts(ligne);
                            return (
                              <div key={vi.id} className="flex justify-between items-center">
                                <div className="flex items-center gap-2 min-w-0">
                                  {viAvatar(vi, 24)}
                                  <span style={{ fontSize: 14, color: '#78716c' }}>{vi.prenom} {vi.nom}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                  {amounts.echu > 0 && <span style={{ fontSize: 12, color: '#a8a29e' }}>échu {fmt(amounts.echu)}</span>}
                                  {amounts.mode === 'capitalisation' && amounts.aEchoir > 0 && <span style={{ fontSize: 12, color: '#a8a29e' }}>à échoir {fmt(amounts.aEchoir)}</span>}
                                  {amounts.mode === 'rente' && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>
                                      RENTE {fmt(amounts.perteVI)}/an
                                    </span>
                                  )}
                                  <span style={{ fontSize: 14, fontWeight: 500, color: '#292524' }}>{fmt(amounts.total)}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>)}
                    </div>

                    {partsWarning && (
                      <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                        <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" strokeWidth={1.5} />
                        <span style={{ fontSize: 12, color: '#92400e' }}>
                          Somme des parts : {sumParts}% + auto-consommation {partAutoConsommation}% = {sumParts + partAutoConsommation}% (devrait être 100%)
                        </span>
                      </div>
                    )}

                  </>
                );
              })()}
            </div>

            {/* Total block — hidden for Type D (PRP uses Table 3c as total) */}
            {config.type !== 'D' && <div className="p-4 pt-0">
              <div className={totalBlockClass}>
                <button onClick={() => setTotalExpanded(prev => ({...prev, [ivPosteId]: !prev[ivPosteId]}))} className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-[#d6d3d1] rounded-[6px] flex items-center justify-center">
                      <FileText className="w-3.5 h-3.5 text-[#78716c]" />
                    </div>
                    <span className="text-[14px] font-medium text-[#292524]">Total à indemniser</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-[#78716c] transition-transform ${totalExpanded[ivPosteId] ? 'rotate-90' : ''}`} />
                </button>
                {totalExpanded[ivPosteId] && (
                  <>
                    <div className="space-y-1.5 mt-3">
                      {victimesIndirectes.map(vi => {
                        const viAmount = config.type === 'C'
                          ? (ivLignes.reduce((s, l) => s + ((l.attributions || []).filter(a => a.viId === vi.id).reduce((ss, a) => ss + a.amount, 0)), 0))
                          : config.type === 'B'
                            ? ivLignes.filter(l => l.victimeId === vi.id).reduce((s, l) => s + (l.montant || 0), 0)
                            : (ivLignes.find(l => l.victimeId === vi.id)?.montant || 0);
                        return viAmount > 0 ? (
                          <div key={vi.id} className="flex justify-between items-center">
                            <span style={receiptRowStyle}>{vi.prenom} {vi.nom}</span>
                            <span style={receiptAmountStyle}>{fmt(viAmount)}</span>
                          </div>
                        ) : null;
                      })}
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#d6d3d1] group/total">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-[#d6d3d1] rounded-[5px] flex items-center justify-center">
                          <FileText className="w-3 h-3 text-[#78716c]" />
                        </div>
                        <span className="text-[13px] font-medium text-[#292524]">Total à indemniser</span>
                        <ChevronRight className="w-3.5 h-3.5 text-[#d6d3d1] opacity-0 group-hover/total:opacity-100 transition-opacity" />
                      </div>
                      <span style={serifAmountStyle} className="text-[#292524]">{fmt(ivTotal)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>}
          </div>

          {/* NOTES / ARGUMENTAIRE */}
          <div className="p-4 border-b border-[#e7e5e3]" style={{ backgroundColor: '#F8F7F5' }}>
            <div style={sectionHeaderStyle} className="mb-[17px]">NOTES / ARGUMENTAIRE</div>
            <div className="bg-white border border-[#e7e5e3] rounded-[4px] overflow-hidden">
              <div className="flex items-center gap-1 px-3 py-2 border-b border-[#e7e5e3]">
                <button className="px-2 py-1 rounded hover:bg-[#f5f5f4] text-[#78716c] font-bold text-sm">B</button>
                <button className="px-2 py-1 rounded hover:bg-[#f5f5f4] text-[#78716c] italic text-sm">I</button>
                <button className="px-2 py-1 rounded hover:bg-[#f5f5f4] text-[#78716c] underline text-sm">U</button>
              </div>
              <textarea
                value={posteNotes[ivPosteId] || ''}
                onChange={(e) => setPosteNotes(prev => ({...prev, [ivPosteId]: e.target.value}))}
                className="w-full p-4 text-[14px] text-[#292524] leading-[27px] resize-none min-h-[120px] focus:outline-none"
                placeholder="Ajoutez vos notes et arguments juridiques..."
              />
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
                      <span className="text-[14px] font-medium text-[#292524]">Total à indemniser</span>
                    </div>
                    <span style={serifAmountStyle} className="text-[#292524]">{fmt(data.montant - (data.tiersPayeur || 0))}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* JURISPRUDENCES Section */}
          <div className="p-4 border-b border-[#e7e5e3]" style={{ backgroundColor: '#F8F7F5' }}>
            <JPListing
              pinnedJP={jp.getPinnedForPoste(currentLevel.id)}
              selectedDecisionId={jp.jpState.drawerDecisionId}
              compact={true}
              onOpenDrawer={(id, resultSet) => jp.openDrawer(id, resultSet)}
              onAddClick={() => jp.openStepper('jp-add')}
              posteLabel={currentLevel.title}
              onSearchJP={() => {
                const prompt = `Recherche des jurisprudences pertinentes pour le poste ${currentLevel.title} (${currentLevel.fullTitle || currentLevel.title}) dans ce dossier.`;
                setChatMessages(prev => [...prev, { type: 'user', text: prompt }]);
              }}
            />
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
    setVictimesIndirectes(EMPTY_DOSSIER.victimesIndirectes);
    setPieces([]);
    setDsaLignes(BASELINE_DSA_LIGNES);
    setDftLignes(BASELINE_DFT_LIGNES);
    setPgpaData(BASELINE_PGPA_DATA);
    setPgpfData(BASELINE_PGPF_DATA);
    setFormPosteData(BASELINE_FORM_POSTE_DATA);
    setIvDossierPostes(EMPTY_DOSSIER.ivDossierPostes);
    setIvPosteData(EMPTY_DOSSIER.ivPosteData);
    setIvPosteSharedData(EMPTY_DOSSIER.ivPosteSharedData);

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
    setChatBlocked(true);
    setChatSidebarOpen(true);
    setChatMessages([{
      type: 'ai-thinking',
      label: 'Analyse de vos documents...',
      steps: [
        { tool: 'analyseDocuments', detail: `Je commence l'analyse de ${processingItems.length} document${processingItems.length > 1 ? 's' : ''}`, expandedText: processingItems.map(f => f.originalName).join(', ') },
      ],
      expanded: true,
      _dropFirstThinking: true,
    }]);
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

        // Add progressive step to thinking message
        const poolEntry = item.poolRef;
        const stepTool = poolEntry.type === 'Expertise' ? 'readExpertise'
          : poolEntry.type === 'Factures' ? 'extractMontants'
          : poolEntry.type === 'Revenus' ? 'readBulletins'
          : 'readDocument';
        const stepAction = poolEntry.type === 'Expertise' ? 'Lecture du rapport d\'expertise'
          : poolEntry.type === 'Factures' ? 'Extraction des montants depuis une facture'
          : poolEntry.type === 'Revenus' ? 'Lecture d\'un bulletin de salaire'
          : poolEntry.type === 'Certificat médical' ? 'Lecture d\'un certificat médical'
          : 'Lecture d\'un document';
        setChatMessages(prev => prev.map(m => {
          if (!m._dropFirstThinking) return m;
          return {
            ...m,
            steps: [...(m.steps || []), {
              tool: stepTool,
              detail: stepAction,
              expandedText: poolEntry.cleanName || item.originalName,
            }],
          };
        }));

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
      // Add classification step
      const types = [...new Set(items.map(it => it.poolRef?.type).filter(Boolean))];
      setChatMessages(prev => prev.map(m => {
        if (!m._dropFirstThinking) return m;
        return {
          ...m,
          steps: [...(m.steps || []), {
            tool: 'detectPostes',
            detail: 'Je classe les documents par catégorie',
            expandedText: `${types.length} types identifiés : ${types.join(', ')}`,
          }],
        };
      }));

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
    // Auto-navigate to info dossier tab so user sees fields filling live
    setActiveTab('dossier');

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
    if (piecesFilter.types?.length > 0) items = items.filter(p => (piecesFilter.types || []).includes(p.type));
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
    const text = done.map((p, i) => {
      const dateStr = p.date ? `[${p.date.split('-').reverse().join('/')}]` : '';
      return `${i + 1}. ${p.cleanName} ${dateStr}`;
    }).join('\n');
    navigator.clipboard.writeText(text).then(() => showToast('Bordereau copié dans le presse-papier'));
  };

  const downloadDropFirstAsZip = async () => {
    const done = manualReorder
      ? dropFirstPieces.filter(p => p.status === 'done')
      : getProcessedPieces().sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    const zip = new JSZip();
    done.forEach((p, i) => {
      const prefix = String(i + 1).padStart(2, '0');
      const filename = `${prefix} - ${p.cleanName}.pdf`;
      zip.file(filename, `[Placeholder] ${p.cleanName}\nDate: ${p.date}\nType: ${p.type}`);
    });
    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, 'bordereau-pieces.zip');
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
    const isFiltered = !!(piecesFilter.types?.length > 0 || piecesFilter.search);
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
            {/* Sort toggle pill */}
            <div className="flex items-center bg-[#eeece6] rounded-md p-0.5">
              <button
                onClick={() => setManualReorder(true)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium uppercase tracking-wide rounded transition-all ${
                  manualReorder ? 'bg-white text-[#292524] shadow-sm' : 'text-[#78716c] hover:text-[#44403c]'
                }`}
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                <Hand className="w-3.5 h-3.5" strokeWidth={1.5} />
                Manuel
              </button>
              <button
                onClick={() => setManualReorder(false)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium uppercase tracking-wide rounded transition-all ${
                  !manualReorder ? 'bg-white text-[#292524] shadow-sm' : 'text-[#78716c] hover:text-[#44403c]'
                }`}
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
                Chrono
              </button>
            </div>

            <div className="flex items-center gap-2.5 ml-auto">
              <div className="relative">
                <button
                  onClick={() => setPiecesTypeMenuOpen(prev => !prev)}
                  className={`flex items-center gap-2 h-8 pl-8 pr-8 text-sm border rounded-md bg-white shadow-sm cursor-pointer transition-colors ${(piecesFilter.types || []).length > 0 ? 'border-[#292524] text-[#292524]' : 'border-[#e7e5e3] text-[#78716c] hover:border-[#d6d3d1]'}`}
                >
                  {(piecesFilter.types || []).length === 0 ? 'Tous types' : `${(piecesFilter.types || []).length} type${(piecesFilter.types || []).length > 1 ? 's' : ''}`}
                </button>
                <ListFilter className="w-4 h-4 text-[#78716c] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" strokeWidth={1.5} />
                <ChevronDown className="w-4 h-4 text-[#78716c] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" strokeWidth={1.5} />
                {piecesTypeMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setPiecesTypeMenuOpen(false)} />
                    <div className="absolute left-0 top-full mt-1 w-48 bg-white border border-[#e7e5e3] rounded-lg shadow-lg z-50 py-1">
                      {PIECE_TYPE_OPTIONS.map(t => {
                        const active = (piecesFilter.types || []).includes(t);
                        return (
                          <button
                            key={t}
                            onClick={() => setPiecesFilter(prev => ({ ...prev, types: active ? (prev.types || []).filter(x => x !== t) : [...(prev.types || []), t] }))}
                            className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-[#292524] hover:bg-[#fafaf9] transition-colors"
                          >
                            <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${active ? 'bg-[#292524] border-[#292524]' : 'border-[#d6d3d1]'}`}>
                              {active && <Check className="w-3 h-3 text-white" strokeWidth={2} />}
                            </div>
                            <span className={`${active ? 'font-medium' : ''}`}>{t}</span>
                          </button>
                        );
                      })}
                      {(piecesFilter.types || []).length > 0 && (
                        <>
                          <div className="border-t border-[#e7e5e3] my-1" />
                          <button
                            onClick={() => { setPiecesFilter(prev => ({ ...prev, types: [] })); setPiecesTypeMenuOpen(false); }}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#78716c] hover:bg-[#fafaf9] transition-colors"
                          >
                            Réinitialiser
                          </button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={piecesFilter.search}
                  onChange={e => setPiecesFilter(prev => ({ ...prev, search: e.target.value }))}
                  className="h-8 pl-8 pr-3 text-sm bg-[#eeece6] rounded-md text-[#292524] placeholder-[#78716c] placeholder-opacity-70 focus:outline-none focus:ring-1 focus:ring-stone-300"
                />
                <Search className="w-4 h-4 text-[#78716c] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" strokeWidth={1.5} />
              </div>
              <button
                onClick={downloadDropFirstAsZip}
                className="flex items-center justify-center w-8 h-8 bg-white border border-[#e7e5e3] text-[#78716c] hover:text-[#44403c] hover:bg-[#fafaf9] rounded-md shadow-sm transition-colors"
                title="Télécharger tout"
              >
                <Download className="w-4 h-4" strokeWidth={1.5} />
              </button>
              <button
                onClick={handleCopyBordereau}
                className="flex items-center gap-2 h-8 px-3 text-sm font-medium text-white bg-[#292524] rounded-md hover:bg-[#44403c] shadow-sm transition-colors"
              >
                <Copy className="w-4 h-4" strokeWidth={1.5} />
                Copier bordereau
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

            {/* Reorder hint banner */}
            {showReorderHint && !manualReorder && (
              <div className="mb-3 flex items-center gap-3 px-4 py-3 bg-[#f8f7f5] border border-[#e7e5e3] rounded-lg">
                <Hand className="w-4 h-4 text-[#78716c] shrink-0" strokeWidth={1.5} />
                <span className="text-sm text-[#44403c]">Passez en mode Manuel pour réordonner les pièces par glisser-déposer.</span>
                <button
                  onClick={() => { setManualReorder(true); setShowReorderHint(false); }}
                  className="ml-auto px-3 py-1.5 text-sm font-medium text-white bg-[#292524] rounded-md hover:bg-[#44403c] transition-colors shrink-0"
                >
                  Passer en Manuel
                </button>
                <button onClick={() => setShowReorderHint(false)} className="text-[#a8a29e] hover:text-[#78716c] transition-colors shrink-0">
                  <X className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>
            )}

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
                    const canDrag = manualReorder && !isProcessing && !isFiltered;

                    return (
                      <React.Fragment key={piece.id}>
                        {/* Drop indicator line */}
                        {reorderDropIdx === idx && reorderDrag?.pieceId !== piece.id && (
                          <tr><td colSpan={7} className="p-0"><div className="h-0.5 bg-[#f59e0b] rounded-full mx-2" /></td></tr>
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
                        <td
                          className={`w-[38px] text-center ${!isProcessing ? (canDrag ? 'cursor-grab' : 'cursor-not-allowed') : ''}`}
                          onClick={(e) => { if (!isProcessing && !manualReorder) { e.stopPropagation(); setShowReorderHint(true); } }}
                        >
                          {!isProcessing ? (
                            <GripVertical className={`w-3.5 h-3.5 inline-block transition-opacity ${canDrag ? 'text-[#d6d3d1] opacity-100' : 'text-[#d6d3d1] opacity-0 group-hover:opacity-40'}`} strokeWidth={1.5} />
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
              className="fixed z-50 pointer-events-none bg-[#292524] border border-[#44403c] rounded-lg shadow-lg px-3 py-2 flex items-center gap-2"
              style={{ left: reorderDrag.ghostX + 12, top: reorderDrag.ghostY - 16, minWidth: 200 }}
            >
              <GripVertical className="w-3 h-3 text-[#78716c]" strokeWidth={1.5} />
              <span className="inline-flex items-center justify-center w-[22px] h-[22px] bg-[#44403c] text-[#d6d3d1] text-xs font-semibold rounded-md">{reorderDrag.num || '?'}</span>
              <span className="text-sm font-medium text-white truncate max-w-[250px]">{reorderDrag.name}</span>
              {reorderDrag.type && (
                <span className={`px-2 py-0.5 text-xs font-medium rounded-md bg-[#44403c] text-[#d6d3d1]`}>{reorderDrag.type}</span>
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
      {/* Sidebar Rail */}
      <div className="w-12 bg-white border-r border-[#e7e5e3] flex flex-col items-start flex-shrink-0">
        {/* Header — Logo */}
        <div className="w-full flex flex-col items-center justify-center py-3 border-b border-[#e7e5e3]">
          <img src="/logo-plato.png" alt="Plato" className="w-6 h-6" />
        </div>

        {/* Nav items */}
        <div className="flex-1 w-full flex flex-col gap-2 p-2">
          <button
            onClick={() => setCurrentPage('list')}
            title="Mes dossiers"
            className={`w-8 h-8 flex items-center justify-center transition-colors ${currentPage === 'list' ? 'text-[#292524]' : 'text-[#78716c] hover:text-[#292524]'}`}
            style={{ borderRadius: 8 }}
          >
            <Folder className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentPage('baremes')}
            title="Référentiels & Barèmes"
            className={`w-8 h-8 flex items-center justify-center transition-colors ${currentPage === 'baremes' ? 'text-[#292524]' : 'text-[#78716c] hover:text-[#292524]'}`}
            style={{ borderRadius: 8 }}
          >
            <Scale className="w-4 h-4" />
          </button>
        </div>

        {/* Footer — UIKit + Avatar */}
        <div className="w-full border-t border-[#e7e5e3] p-2 flex flex-col gap-2">
          <button
            onClick={() => setCurrentPage('components')}
            title="UI Components"
            className={`w-8 h-8 flex items-center justify-center transition-colors ${currentPage === 'components' ? 'text-[#292524]' : 'text-[#78716c] hover:text-[#292524]'}`}
            style={{ borderRadius: 8 }}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <div className="w-8 h-8 bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white text-[10px] font-medium cursor-pointer overflow-hidden" style={{ borderRadius: 12 }}>
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

  // ========== SHARED SANDBOX COMPONENTS ==========
  // These are reused by both the UI Kit and Diff Engine pages.

  const DIFF_TABLE_TAG_STYLES = {
    add: { bg: '#dcfce7', color: '#064e3b', label: 'ADD' },
    edit: { bg: '#f9ecd6', color: '#855b31', label: 'EDIT' },
    mixed: { bg: '#fff7ed', color: '#9a3412', label: 'MIXED' },
    delete: { bg: '#fef2f2', color: '#991b1b', label: 'DELETE' },
  };
  const diffTag = (type) => { const t = DIFF_TABLE_TAG_STYLES[type]; return <span className="text-counter px-1.5 py-0.5 rounded" style={{ background: t.bg, color: t.color, fontWeight: 600 }}>{t.label}</span>; };

  const DIFF_TABLE_INITIAL_ROWS = [
    { id: 'r1', diffType: 'add', label: 'Hospitalisation jour', date: '15/02/2026', montant: '500 €', reste: '255,00 €', resteBase: '250,00€', taux: '100%', status: 'pending' },
    { id: 'r2', diffType: 'edit', label: 'Hospitalisation jour', date: '15/02/2026', oldDate: '15/02/2026', montant: '200€', oldMontant: '500€', reste: '255,00 €', resteBase: '250,00€', oldReste: '255,00 €', oldResteBase: '250,00€', taux: '100%', status: 'pending' },
    { id: 'r3', diffType: 'edit', label: 'Hospitalisation de nuit', oldLabel: 'Hospitalisation jour', date: '15/02/2026', montant: '200€', reste: '255,00 €', resteBase: '250,00€', taux: '100%', bgAlt: true, status: 'pending' },
    { id: 'r4', diffType: 'edit', label: 'Hospitalisation de nuit', badgeEdit: true, oldTaux: '50%', montant: null, oldMontant: '200€', reste: '255,00 €', resteBase: '250,00€', taux: '100%', tauxSuccess: true, status: 'pending' },
    { id: 'r5', diffType: 'mixed', label: 'Hospitalisation de nuit', oldLabel: 'Hospitalisation jour', date: '15/02/2026', montant: null, oldMontant: '200€', reste: '255,00 €', resteBase: '250,00€', taux: '100%', tauxSuccess: true, status: 'pending' },
    { id: 'r6', diffType: 'delete', label: 'Hospitalisation jour', date: '15/02/2026', montant: '500 €', reste: '255,00 €', resteBase: '250,00€', taux: '100%', status: 'pending' },
    { id: 'r7', diffType: null, label: 'Frais pharmaceutiques', date: '20/07/2022', montant: '320,00 €', reste: '320,00 €', resteBase: '320,00€', taux: '100%', status: null },
  ];

  const ARTIFACT_CARD_INITIAL_DIFFS = [
    { id: 'dsa-1', entityLabel: 'Hospitalisation CHU', type: 'add', fields: [{ label: 'Montant', after: '4 500 €' }, { label: 'Date', after: '05/06/2022' }] },
    { id: 'dsa-2', entityLabel: 'Kinésithérapie', type: 'edit', fields: [{ label: 'Montant', before: '960 €', after: '1 280 €' }] },
    { id: 'dsa-3', entityLabel: 'Consultation doublon', type: 'delete', fields: [{ label: 'Montant', before: '55 €' }] },
    { id: 'dsa-4', entityLabel: 'Revalorisation activée', type: 'add', fields: [{ label: 'État', after: 'On', badge: 'success' }, { label: 'Valeur', after: 'IPC Annuel' }] },
    { id: 'dsa-5', entityLabel: 'Revalorisation modifiée', type: 'edit', fields: [{ label: 'Indice', before: 'IPC Annuel', after: 'IPC Mensuel' }] },
    { id: 'dsa-6', entityLabel: 'Revalorisation désactivée', type: 'delete', fields: [{ label: 'État', before: 'Off', badge: 'secondary' }] },
    { id: 'info-1', entityLabel: 'Nom', type: 'add', fields: [{ label: 'Valeur', after: 'Martin' }] },
    { id: 'info-2', entityLabel: 'Prénom', type: 'add', fields: [{ label: 'Valeur', after: 'Sophie' }] },
    { id: 'info-3', entityLabel: 'Date de naissance', type: 'add', fields: [{ label: 'Valeur', after: '14/03/1985' }] },
    { id: 'info-4', entityLabel: 'Date accident', type: 'edit', fields: [{ label: 'Valeur', before: '04/06/2022', after: '05/06/2022' }] },
    { id: 'info-5', entityLabel: 'Profession', type: 'edit', fields: [{ label: 'Valeur', before: 'Commerciale', after: 'Cadre commercial' }] },
    { id: 'info-6', entityLabel: 'AIPP', type: 'add', fields: [{ label: 'Valeur', after: '8%' }] },
  ];
  const ARTIFACT_CARD_DEFS = [
    { id: 'kit-dsa', title: 'DSA — Dépenses de santé actuelles', Icon: HeartPulse, diffIds: ['dsa-1', 'dsa-2', 'dsa-3', 'dsa-4', 'dsa-5', 'dsa-6'] },
    { id: 'kit-info', title: 'Info dossier', Icon: ClipboardList, diffIds: ['info-1', 'info-2', 'info-3', 'info-4', 'info-5', 'info-6'] },
  ];

  const SharedDiffTableSandbox = () => {
    const [rows, setRows] = React.useState(DIFF_TABLE_INITIAL_ROWS);
    const pending = rows.filter(r => r.status === 'pending');
    const reset = () => setRows(DIFF_TABLE_INITIAL_ROWS);
    const accept = (id) => setRows(prev => prev.map(r => r.id === id ? { ...r, status: 'accepted' } : r));
    const reject = (id) => setRows(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected' } : r));

    const thStyle = { fontSize: 11, fontWeight: 600, color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0 8px' };
    const oldVal = (v) => <div style={{ fontSize: 12, lineHeight: '16px', color: '#a8a29e', textDecoration: 'line-through', letterSpacing: '0.12px' }}>{v}</div>;
    const newVal = (v, opts = {}) => <div style={{ fontSize: 14, lineHeight: '20px', fontWeight: 500, color: '#292524', ...opts }}>{v}</div>;
    const delVal = (v) => <span style={{ fontSize: 14, color: '#a8a29e', textDecoration: 'line-through' }}>{v}</span>;
    const strip = (color) => <div className="absolute left-0 top-0 bottom-0 w-1 pointer-events-none" style={{ background: color }} />;

    const renderBtns = (id) => (
      <span className="absolute right-[-20px] top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover/diff:opacity-100 transition-opacity z-10">
        <button onClick={() => accept(id)} className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-[#ecfdf5] hover:border-[#a5c9b7] transition-colors" style={{ background: 'white', border: '1px solid #d6d3d1', boxShadow: '0 1px 2px rgba(26,26,26,0.05)' }}><Check className="w-3 h-3" style={{ color: '#78716c' }} strokeWidth={2.5} /></button>
        <button onClick={() => reject(id)} className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-[#fef2f2] hover:border-[#cf9d9d] transition-colors" style={{ background: 'white', border: '1px solid #d6d3d1', boxShadow: '0 1px 2px rgba(26,26,26,0.05)' }}><X className="w-3 h-3" style={{ color: '#78716c' }} strokeWidth={2.5} /></button>
      </span>
    );

    const docIcon = (r) => {
      if (r.diffType === 'delete') return <span className="inline-flex items-center justify-center w-7 h-7 bg-white rounded-md border border-dashed border-[#a8a29e]" style={{ opacity: 0.4 }}><FileText className="w-3.5 h-3.5 text-[#a8a29e]" /></span>;
      if (!r.diffType) return <span className="inline-flex items-center justify-center w-7 h-7 bg-[#F8F7F5] text-[#d6d3d1] rounded-md border border-dashed border-[#e7e5e3]"><FileText className="w-3.5 h-3.5" /></span>;
      return <span className="inline-flex items-center justify-center w-7 h-7 bg-[#DFE8F5] rounded-md relative"><FileText className="w-4 h-4 text-[#2563eb]" /><span className="absolute -top-1.5 left-[18px] min-w-[16px] h-4 bg-[#1e3a8a] text-white text-counter font-medium rounded-full flex items-center justify-center border-2 border-white px-0.5">1</span></span>;
    };

    const resteCell = (r, muted) => {
      const c = muted ? '#a8a29e' : '#78716c';
      const mc = muted ? '#a8a29e' : '#292524';
      const strike = muted ? 'line-through' : 'none';
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
          <span style={{ fontSize: 12, color: c, textDecoration: strike, letterSpacing: muted ? '0.12px' : undefined }}>{r.resteBase} ·</span>
          <CircleArrowUp className="w-3 h-3" style={{ color: c }} />
          <span style={{ fontSize: 14, fontWeight: 500, color: mc, textDecoration: strike }}>{r.reste}</span>
        </div>
      );
    };

    const resolvedDocIcon = <span className="inline-flex items-center justify-center w-7 h-7 bg-[#DFE8F5] rounded-md relative"><FileText className="w-4 h-4 text-[#2563eb]" /><span className="absolute -top-1.5 left-[18px] min-w-[16px] h-4 bg-[#1e3a8a] text-white text-counter font-medium rounded-full flex items-center justify-center border-2 border-white px-0.5">1</span></span>;

    return (
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-caption text-[#78716c]">{pending.length} pending · {rows.filter(r => r.status === 'accepted').length} accepted · {rows.filter(r => r.status === 'rejected').length} rejected</span>
          <button onClick={reset} className="flex items-center gap-1.5 text-caption-medium text-[#1e3a8a] hover:text-[#1e40af]"><RotateCcw className="w-3 h-3" /> Reset</button>
        </div>
        <div className="border border-[#e7e5e3] rounded-lg bg-white overflow-visible">
          <div className="flex items-center" style={{ borderBottom: '1px solid #e7e5e3', background: '#fafaf9', padding: '8px 0' }}>
            <div className="w-[52px] flex-shrink-0" style={{ ...thStyle, paddingLeft: 14 }}>Doc</div>
            <div className="flex-1 min-w-0" style={thStyle}>Libellé</div>
            <div className="flex-1 min-w-0" style={thStyle}>Taux</div>
            <div className="flex-1 min-w-0" style={thStyle}>Date</div>
            <div className="flex-1 min-w-0" style={{ ...thStyle, textAlign: 'right' }}>Montant</div>
            <div className="flex-1 min-w-0" style={{ ...thStyle, textAlign: 'right' }}>Reste à charge</div>
            <div className="flex-1 min-w-0" style={{ ...thStyle, textAlign: 'right' }}>Type</div>
          </div>
          {rows.filter(r => {
            if (r.status === 'accepted' && r.diffType === 'delete') return false;
            if (r.status === 'rejected' && r.diffType === 'add') return false;
            return true;
          }).map((r, i, arr) => {
            const isPending = r.status === 'pending';
            const isAccepted = r.status === 'accepted';
            const isRejected = r.status === 'rejected';
            const isDel = r.diffType === 'delete';
            const resolved = isAccepted || isRejected;
            const diffColor = r.diffType ? ROW_DIFF_COLORS[r.diffType === 'mixed' ? 'edit' : r.diffType] : null;
            const showLabel = resolved && isRejected && r.oldLabel ? r.oldLabel : r.label;
            const showDate = resolved && isRejected && r.oldDate ? r.oldDate : r.date;
            const showMontant = resolved && isRejected && r.oldMontant ? r.oldMontant : r.montant;
            const showTaux = resolved && isRejected && r.oldTaux ? r.oldTaux : r.taux;
            const showReste = resolved && isRejected && r.oldReste ? r.oldReste : r.reste;
            const showResteBase = resolved && isRejected && r.oldResteBase ? r.oldResteBase : r.resteBase;
            return (
              <div key={r.id} className={`group/diff relative flex items-center transition-colors ${isAccepted ? 'diff-row-accepted' : isRejected ? 'diff-row-rejected' : ''}`} style={{ borderBottom: i < arr.length - 1 ? '1px solid #f0efed' : 'none', minHeight: 56, background: r.bgAlt && isPending ? '#fafaf9' : undefined }}>
                {isPending && diffColor && strip(diffColor)}
                <div className="w-[52px] flex-shrink-0 px-2 pl-[14px]">{resolved ? resolvedDocIcon : docIcon(r)}</div>
                <div className="flex-1 min-w-0 px-2">
                  {resolved ? newVal(showLabel) : isPending && isDel ? delVal(r.label) : isPending && r.oldLabel ? <>{oldVal(r.oldLabel)}{newVal(r.label)}</> : newVal(r.label)}
                </div>
                <div className="flex-1 min-w-0 px-2">
                  {resolved ? <span className="text-caption-medium px-2 py-0.5 rounded-[6px] bg-[#eeece6] text-[#44403c]">{showTaux}</span>
                    : isPending && r.badgeEdit ? <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span className="text-caption-medium px-2 py-0.5 rounded-[6px] line-through" style={{ background: '#eeece6', color: '#a8a29e' }}>{r.oldTaux}</span><span className="text-caption-medium px-2 py-0.5 rounded-[6px]" style={{ background: '#cce6d9', color: '#064e3b' }}>{r.taux}</span></div>
                    : isPending && isDel ? <span className="text-caption-medium px-2 py-0.5 rounded-[6px] line-through" style={{ background: '#f5f5f4', color: '#a8a29e' }}>{r.taux}</span>
                    : r.tauxSuccess ? <span className="text-caption-medium px-2 py-0.5 rounded-[6px]" style={{ background: '#cce6d9', color: '#064e3b' }}>{r.taux}</span>
                    : <span className="text-caption-medium px-2 py-0.5 rounded-[6px] bg-[#eeece6] text-[#44403c]">{r.taux}</span>}
                </div>
                <div className="flex-1 min-w-0 px-2">
                  {resolved ? <span style={{ fontSize: 14, color: '#78716c' }}>{showDate}</span> : isPending && isDel ? delVal(r.date) : isPending && r.oldDate ? <>{oldVal(r.oldDate)}{newVal(r.date, { fontWeight: 500 })}</> : <span style={{ fontSize: 14, color: '#78716c' }}>{r.date}</span>}
                </div>
                <div className="flex-1 min-w-0 px-2 text-right">
                  {resolved ? (showMontant ? newVal(showMontant, { color: '#44403c' }) : <span style={{ color: '#a8a29e' }}>—</span>) : r.montant == null && r.oldMontant && isPending ? delVal(r.oldMontant) : isPending && isDel ? delVal(r.montant) : isPending && r.oldMontant ? <>{oldVal(r.oldMontant)}{newVal(r.montant)}</> : r.montant ? newVal(r.montant, { color: '#44403c' }) : <span style={{ color: '#a8a29e' }}>—</span>}
                </div>
                <div className="flex-1 min-w-0 px-2 text-right">
                  {resolved ? resteCell({ resteBase: showResteBase, reste: showReste }, false) : isPending && r.oldReste ? <>{resteCell({ resteBase: r.oldResteBase, reste: r.oldReste }, true)}{resteCell(r, false)}</> : resteCell(r, isPending && isDel)}
                </div>
                <div className="flex-1 min-w-0 px-2 text-right">
                  {r.diffType ? diffTag(r.diffType) : <span className="text-counter text-[#a8a29e]">—</span>}
                </div>
                {isPending && r.diffType && renderBtns(r.id)}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const SharedInteractiveCards = ({ initialDiffs = ARTIFACT_CARD_INITIAL_DIFFS, cardDefs = ARTIFACT_CARD_DEFS }) => {
    const [diffs, setDiffs] = React.useState(initialDiffs);
    const [expanded, setExpanded] = React.useState({});
    const reset = () => { setDiffs(initialDiffs); setExpanded({}); };

    return (
      <div className="flex flex-col gap-5" style={{ maxWidth: 420, marginBottom: 24 }}>
        {cardDefs.map(card => {
          const cardDiffs = diffs.filter(d => card.diffIds.includes(d.id));
          const pending = cardDiffs.filter(d => !d.approved && !d.rejected);
          const allResolved = cardDiffs.length > 0 && cardDiffs.every(d => d.approved || d.rejected);
          const isExp = !!expanded[card.id];
          const summary = { adds: pending.filter(d => d.type === 'add').length, edits: pending.filter(d => d.type === 'edit').length, deletes: pending.filter(d => d.type === 'delete').length };
          const chips = [];
          if (summary.adds > 0) chips.push({ icon: Plus, count: summary.adds, color: ROW_DIFF_COLORS.add });
          if (summary.edits > 0) chips.push({ icon: Pencil, count: summary.edits, color: ROW_DIFF_COLORS.edit });
          if (summary.deletes > 0) chips.push({ icon: Trash2, count: summary.deletes, color: ROW_DIFF_COLORS.delete });
          const approvedCnt = cardDiffs.filter(d => d.approved).length;
          const rejectedCnt = cardDiffs.filter(d => d.rejected).length;
          const resType = allResolved ? (rejectedCnt === 0 ? 'all-approved' : approvedCnt === 0 ? 'all-rejected' : 'mixed') : null;
          return (
            <div key={card.id}>
              <div className="rounded-lg border border-[#e7e5e3] bg-white overflow-hidden transition-all duration-300" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.8), inset 0 -2px 4px rgba(0,0,0,0.03)', opacity: allResolved ? 0.85 : 1 }}>
                <div className="flex items-stretch cursor-pointer select-none group/header">
                  <div className="w-10 flex items-center justify-center flex-shrink-0" style={{ background: allResolved ? (resType === 'all-approved' ? '#ecfdf5' : resType === 'all-rejected' ? '#fef2f2' : '#f5f5f4') : '#f5f5f4' }}><card.Icon className="w-3.5 h-3.5" style={{ color: allResolved ? (resType === 'all-approved' ? ROW_DIFF_COLORS.add : resType === 'all-rejected' ? ROW_DIFF_COLORS.delete : '#78716c') : '#78716c' }} /></div>
                  <div className="flex items-center gap-3 flex-1 min-w-0" style={{ padding: '12px 14px 12px 12px' }}>
                    <div className="flex-1 min-w-0">
                      <div className="group-hover/header:underline" style={{ fontSize: 14, fontWeight: 500, color: '#292524', lineHeight: '18px', textDecorationColor: '#d6d3d1' }}>{card.title}</div>
                      {allResolved ? (
                        <div className="flex items-center gap-1 mt-0.5">
                          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 500, lineHeight: '14px', color: resType === 'all-approved' ? ROW_DIFF_COLORS.add : resType === 'all-rejected' ? ROW_DIFF_COLORS.delete : '#78716c' }}>
                            {resType === 'all-approved' ? 'Tout accepté' : resType === 'all-rejected' ? 'Tout rejeté' : `${approvedCnt}/${cardDiffs.length} accepté${approvedCnt > 1 ? 's' : ''}`}
                          </span>
                        </div>
                      ) : chips.length > 0 ? (
                        <div className="flex items-center gap-2 mt-0.5">
                          {chips.map((chip, ci) => { const CI = chip.icon; return <span key={ci} className="inline-flex items-center gap-0.5" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: chip.color, fontWeight: 500 }}><CI className="w-2.5 h-2.5" strokeWidth={2.5} />{chip.count}</span>; })}
                        </div>
                      ) : null}
                    </div>
                    {cardDiffs.length > 0 && <button className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0 hover:bg-[#e7e5e3]" onClick={() => setExpanded(prev => ({ ...prev, [card.id]: !prev[card.id] }))}><ChevronDown className="w-3.5 h-3.5 transition-transform duration-200" style={{ color: '#78716c', transform: isExp ? 'rotate(0deg)' : 'rotate(-90deg)' }} /></button>}
                  </div>
                </div>
                {isExp && (
                  <div style={{ borderTop: '1px solid #f0efed' }}>
                    {cardDiffs.map((diff, di) => {
                      const dotColor = ROW_DIFF_COLORS[diff.type] || ROW_DIFF_COLORS.edit;
                      return (
                        <div key={diff.id} className={`group/diff cursor-pointer transition-colors ${diff.approved ? 'diff-row-accepted' : diff.rejected ? 'diff-row-rejected' : 'hover:bg-[#fafaf9]'}`} style={{ padding: '8px 14px', fontSize: 12, borderBottom: di < cardDiffs.length - 1 ? '1px solid #f0efed' : 'none' }}>
                          <div className="flex items-center gap-2">
                            {diff.approved ? <Check className="w-2.5 h-2.5 flex-shrink-0" style={{ color: ROW_DIFF_COLORS.add }} strokeWidth={3} />
                              : diff.rejected ? (diff.type === 'delete' ? <RotateCcw className="w-2.5 h-2.5 flex-shrink-0" style={{ color: '#a8a29e' }} strokeWidth={2.5} /> : <X className="w-2.5 h-2.5 flex-shrink-0" style={{ color: ROW_DIFF_COLORS.delete }} strokeWidth={3} />)
                              : <div className="w-1.5 h-1.5 flex-shrink-0" style={{ background: dotColor, transform: 'rotate(45deg)' }} />}
                            <span style={{ color: (diff.approved || diff.rejected) ? '#a8a29e' : diff.type === 'delete' ? '#a8a29e' : '#44403c', fontWeight: 500, flex: 1, textDecoration: (diff.type === 'delete' && !diff.rejected) || (diff.rejected && diff.type !== 'delete') ? 'line-through' : 'none' }}>{diff.entityLabel}</span>
                            {!diff.approved && !diff.rejected && (
                              <span className="flex items-center gap-1.5 opacity-0 group-hover/diff:opacity-100 transition-opacity flex-shrink-0">
                                <button className="w-5 h-5 rounded-full flex items-center justify-center transition-colors hover:bg-[#ecfdf5] hover:border-[#a5c9b7]" style={{ background: 'white', border: '1px solid #d6d3d1', boxShadow: '0 1px 2px rgba(26,26,26,0.05)' }} onClick={() => setDiffs(prev => prev.map(d => d.id === diff.id ? { ...d, approved: true } : d))}><Check className="w-3 h-3" style={{ color: '#78716c' }} strokeWidth={2.5} /></button>
                                <button className="w-5 h-5 rounded-full flex items-center justify-center transition-colors hover:bg-[#fef2f2] hover:border-[#cf9d9d]" style={{ background: 'white', border: '1px solid #d6d3d1', boxShadow: '0 1px 2px rgba(26,26,26,0.05)' }} onClick={() => setDiffs(prev => prev.map(d => d.id === diff.id ? { ...d, rejected: true } : d))}><X className="w-3 h-3" style={{ color: '#78716c' }} strokeWidth={2.5} /></button>
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 items-center" style={{ paddingLeft: 14 }}>
                            {diff.fields.map((f, fi) => {
                              const badgeStyle = f.badge ? { display: 'inline-flex', alignItems: 'center', padding: '1px 6px', borderRadius: 6, fontSize: 11, fontWeight: 500, lineHeight: '16px', ...(f.badge === 'success' ? { background: '#cce6d9', color: '#064e3b' } : { background: '#eeece6', color: '#44403c' }) } : null;
                              const renderVal = (val, style) => f.badge ? <span style={{ ...badgeStyle, ...style }}>{val}</span> : <span style={style}>{val}</span>;
                              return (
                                <span key={fi} className="inline-flex items-center gap-1" style={{ fontSize: 12, color: (diff.approved || diff.rejected) ? '#a8a29e' : '#78716c' }}>
                                  <span style={{ color: '#a8a29e' }}>{f.label}:</span>{' '}
                                  {diff.rejected ? (
                                    diff.type === 'delete' ? renderVal(f.before || f.after, { color: '#78716c' })
                                    : diff.type === 'add' ? <>{f.after && renderVal(f.after, { textDecoration: 'line-through', color: '#a8a29e', opacity: f.badge ? 0.5 : 1 })}</>
                                    : <>{f.after && renderVal(f.after, { textDecoration: 'line-through', color: '#a8a29e', opacity: f.badge ? 0.5 : 1 })}{f.before && <span style={{ color: '#a8a29e' }}> → </span>}{f.before && renderVal(f.before, { color: '#78716c' })}</>
                                  ) : (
                                    <>{f.before && renderVal(f.before, { textDecoration: 'line-through', color: '#a8a29e', opacity: f.badge ? 0.5 : 1 })}{f.before && f.after && <span style={{ color: '#a8a29e' }}> → </span>}{f.after && renderVal(f.after, f.badge ? {} : { color: diff.approved ? '#a8a29e' : '#44403c', fontWeight: 500 })}</>
                                  )}
                                  {f.variants && f.variants.length > 1 && !diff.approved && !diff.rejected && (
                                    <span className="inline-flex items-center gap-1 ml-1.5" style={{ position: 'relative' }}>
                                      {f.variants.map((v, vi) => (
                                        <span key={vi} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded" style={{ fontSize: 10, fontWeight: 500, background: vi === 0 ? '#eef3fa' : '#f5f5f4', border: `1px solid ${vi === 0 ? '#aabcd5' : '#e7e5e3'}`, color: vi === 0 ? '#1e3a8a' : '#78716c', boxShadow: vi === 0 ? '0 1px 2px rgba(0,0,0,0.06)' : 'none' }}>
                                          <CircleArrowUp className="w-2.5 h-2.5" />{v.source}: {v.value}
                                        </span>
                                      ))}
                                    </span>
                                  )}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {cardDiffs.length > 0 && !allResolved && (
                  <div style={{ borderTop: '1px solid #f0efed' }} className="flex items-center">
                    <button className="flex-1 flex items-center justify-center gap-1.5 py-2 hover:bg-[#fafaf9]" style={{ fontSize: 12, fontWeight: 500, color: '#78716c' }} onClick={() => setDiffs(prev => prev.map(d => card.diffIds.includes(d.id) ? { ...d, approved: true } : d))}><Check className="w-3.5 h-3.5" strokeWidth={2.5} /> Tout accepter</button>
                    <div style={{ width: 1, height: 16, background: '#e7e5e3' }} />
                    <button className="flex-1 flex items-center justify-center gap-1.5 py-2 hover:bg-[#fafaf9]" style={{ fontSize: 12, fontWeight: 500, color: '#a8a29e' }} onClick={() => setDiffs(prev => prev.map(d => card.diffIds.includes(d.id) ? { ...d, rejected: true } : d))}><RotateCcw className="w-3 h-3" /> Tout annuler</button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <button onClick={reset} className="inline-flex items-center gap-1.5 self-start px-3 py-1.5 rounded-md border border-[#e7e5e3] hover:bg-[#fafaf9] transition-colors" style={{ fontSize: 12, fontWeight: 500, color: '#78716c' }}><RotateCcw className="w-3 h-3" /> Reset</button>
      </div>
    );
  };

  // ========== COMPONENTS SHOWCASE ==========
  const renderComponentsPage = () => {
    const sectionClass = "mb-10";
    const sectionTitle = (title) => <h2 style={{ fontSize: 18, fontWeight: 600, color: '#292524', marginBottom: 16, paddingBottom: 8, borderBottom: '1px solid #e7e5e3' }}>{title}</h2>;
    const subTitle = (title) => <h3 style={{ fontSize: 14, fontWeight: 600, color: '#78716c', marginBottom: 8, marginTop: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</h3>;
    const row = (children) => <div className="flex items-start gap-4 flex-wrap mb-4">{children}</div>;

    // Sample diffs for artifact card demo
    const sampleDiffs = [
      { actionId: 'demo', zone: 'postes', entityId: 'demo-1', entityLabel: 'Hospitalisation CHU', type: 'add', fields: [{ key: 'montant', label: 'Montant', after: '4 500 €' }, { key: 'date', label: 'Date', after: '05/06/2022' }], timestamp: 1 },
      { actionId: 'demo', zone: 'postes', entityId: 'demo-2', entityLabel: 'Kinésithérapie', type: 'edit', fields: [{ key: 'montant', label: 'Montant', before: '960 €', after: '1 280 €' }], timestamp: 2 },
      { actionId: 'demo', zone: 'postes', entityId: 'demo-3', entityLabel: 'Consultation doublon', type: 'delete', fields: [{ key: 'montant', label: 'Montant', before: '55 €' }], timestamp: 3 },
    ];

    return (
      <div className="h-screen flex" style={{ backgroundColor: '#F8F7F5', fontFamily: "'Inter', system-ui, sans-serif" }}>
        {/* Sidebar */}
        <div className="w-[220px] flex-shrink-0 border-r border-[#e7e5e3] bg-white overflow-y-auto" style={{ padding: '20px 16px' }}>
          <button onClick={() => setCurrentPage('list')} className="flex items-center gap-2 text-body-medium text-[#78716c] hover:text-[#292524] mb-6 transition-colors">
            <ChevronRight className="w-4 h-4 rotate-180" /> Retour
          </button>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#292524', marginBottom: 16 }}>UI Components</div>
          <nav className="flex flex-col gap-1">
            {['Diff Rows', 'Panel Diff Inputs', 'Reasoning', 'Chat Messages', 'Field Streaming', 'Badges & Pills', 'Buttons', 'Barème Components', 'Artifact Cards'].map(s => (
              /* Hypothèses diff is a subsection of Diff Rows — no separate nav entry needed */
              <a key={s} href={`#section-${s.toLowerCase().replace(/\s+/g, '-')}`} className="text-body text-[#78716c] hover:text-[#292524] hover:bg-[#fafaf9] px-2 py-1.5 rounded transition-colors">{s}</a>
            ))}
            <div className="mt-4 pt-4 border-t border-[#e7e5e3]">
              <button onClick={() => setCurrentPage('reasoning-demo')} className="w-full text-left text-body-medium text-[#78716c] hover:text-[#292524] hover:bg-[#fafaf9] px-2 py-1.5 rounded transition-colors flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" /> Reasoning Demo
              </button>
              <button onClick={() => setCurrentPage('diff-engine')} className="w-full text-left text-body-medium text-[#78716c] hover:text-[#292524] hover:bg-[#fafaf9] px-2 py-1.5 rounded transition-colors flex items-center gap-2">
                <FileText className="w-3.5 h-3.5" /> Diff Engine
              </button>
              <button onClick={() => setCurrentPage('iv-structures')} className="w-full text-left text-body-medium text-[#78716c] hover:text-[#292524] hover:bg-[#fafaf9] px-2 py-1.5 rounded transition-colors flex items-center gap-2">
                <Table2 className="w-3.5 h-3.5" /> IV Table Structures
              </button>
            </div>
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto" style={{ padding: '32px 48px' }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#292524', marginBottom: 4 }}>Plato UI Components</h1>
            <p style={{ fontSize: 14, color: '#78716c', marginBottom: 32 }}>Composants visuels du prototype Plato — tester les propriétés et variantes en situation.</p>

            {/* ====== DIFF ROWS ====== */}
            <div id="section-diff-rows" className={sectionClass}>
              {sectionTitle('Diff Rows')}
              <p style={{ fontSize: 14, color: '#78716c', marginBottom: 16 }}>Table rows with cell-level diff rendering. Left 4px strip encodes row diff type. Changed cells stack old→new. Figma ref: 1324:17669.</p>

              {subTitle('Multi-column table — all diff types')}
              <p style={{ fontSize: 12, color: '#a8a29e', marginBottom: 12 }}>Interactive sandbox. Accept/reject per row on hover. Reset to restore all pending diffs.</p>
              <SharedDiffTableSandbox />


              {subTitle('Legend — Diff dot colors')}
              {row(<>
                {[
                  { type: 'add', color: ROW_DIFF_COLORS.add, label: 'Ajout' },
                  { type: 'edit', color: ROW_DIFF_COLORS.edit, label: 'Modification' },
                  { type: 'delete', color: ROW_DIFF_COLORS.delete, label: 'Suppression' },
                ].map(d => (
                  <div key={d.type} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#e7e5e3] bg-white">
                    <div className="w-1.5 h-1.5" style={{ background: d.color, transform: 'rotate(45deg)' }} />
                    <span style={{ fontSize: 12, color: '#44403c' }}>{d.label}</span>
                    <code style={{ fontSize: 11, color: '#a8a29e', fontFamily: 'DM Mono, monospace' }}>{d.color}</code>
                  </div>
                ))}
              </>)}

              {subTitle('Cell types in diff context')}
              {(() => {
                const cellLabel = (text) => <div style={{ fontSize: 11, fontWeight: 600, color: '#a8a29e', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>{text}</div>;
                const cellCard = (children, opts = {}) => <div className="border border-[#e7e5e3] rounded-lg bg-white p-3" style={opts.deleted ? { opacity: 0.55 } : undefined}>{children}</div>;
                return (
              <div style={{ maxWidth: 680 }}>
                {/* TEXT — label never changes, only default + deleted */}
                <div style={{ fontSize: 12, fontWeight: 600, color: '#292524', marginBottom: 8, marginTop: 4 }}>Text</div>
                <div className="grid grid-cols-2 gap-3 mb-5" style={{ maxWidth: 440 }}>
                  {cellCard(<>
                    {cellLabel('Default')}
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#292524' }}>Kinésithérapie</div>
                    <div style={{ fontSize: 11, color: '#a8a29e' }}>24 séances post-opératoires</div>
                  </>)}
                  {cellCard(<>
                    {cellLabel('Deleted')}
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#a8a29e', textDecoration: 'line-through' }}>Consultation Dr. Dupont</div>
                    <div style={{ fontSize: 11, color: '#a8a29e', textDecoration: 'line-through' }}>Doublon — déjà comptabilisé</div>
                  </>, { deleted: true })}
                </div>

                {/* AMOUNT */}
                <div style={{ fontSize: 12, fontWeight: 600, color: '#292524', marginBottom: 8 }}>Amount</div>
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {cellCard(<>
                    {cellLabel('Default')}
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#292524', fontVariantNumeric: 'tabular-nums' }}>4 500,00 €</div>
                  </>)}
                  {cellCard(<>
                    {cellLabel('Modified')}
                    <div style={{ fontSize: 11, color: '#a8a29e', textDecoration: 'line-through', fontVariantNumeric: 'tabular-nums' }}>960,00 €</div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#292524', fontVariantNumeric: 'tabular-nums' }}>1 280,00 €</div>
                  </>)}
                  {cellCard(<>
                    {cellLabel('Deleted')}
                    <div style={{ fontSize: 14, color: '#a8a29e', textDecoration: 'line-through', fontVariantNumeric: 'tabular-nums' }}>55,00 €</div>
                  </>, { deleted: true })}
                </div>

                {/* DATE */}
                <div style={{ fontSize: 12, fontWeight: 600, color: '#292524', marginBottom: 8 }}>Date</div>
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {cellCard(<>
                    {cellLabel('Default')}
                    <div style={{ fontSize: 12, color: '#44403c' }}>05/06/2022</div>
                  </>)}
                  {cellCard(<>
                    {cellLabel('Modified')}
                    <div style={{ fontSize: 11, color: '#a8a29e', textDecoration: 'line-through' }}>01/01/2023</div>
                    <div style={{ fontSize: 12, color: '#44403c' }}>15/03/2023</div>
                  </>)}
                  {cellCard(<>
                    {cellLabel('Deleted')}
                    <div style={{ fontSize: 12, color: '#a8a29e', textDecoration: 'line-through' }}>10/01/2022</div>
                  </>, { deleted: true })}
                </div>

                {/* BADGE / PILL */}
                <div style={{ fontSize: 12, fontWeight: 600, color: '#292524', marginBottom: 8 }}>Badge / Pill</div>
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {cellCard(<>
                    {cellLabel('Default')}
                    <span className="text-caption-medium px-2 py-0.5 rounded-full bg-[#eeece6] text-[#44403c]">100%</span>
                  </>)}
                  {cellCard(<>
                    {cellLabel('Modified')}
                    <div className="flex flex-col items-start gap-0.5">
                      <span className="text-caption-medium px-2 py-0.5 rounded-full line-through" style={{ background: '#f5f5f4', color: '#a8a29e', fontSize: 10 }}>50%</span>
                      <span className="text-caption-medium px-2 py-0.5 rounded-full" style={{ background: '#fff7ed', color: ROW_DIFF_COLORS.edit, fontSize: 10 }}>100%</span>
                    </div>
                  </>)}
                  {cellCard(<>
                    {cellLabel('Deleted')}
                    <span className="text-caption-medium px-2 py-0.5 rounded-full line-through" style={{ background: '#fef2f2', color: '#a8a29e' }}>100%</span>
                  </>, { deleted: true })}
                </div>

                {/* TOGGLE / ON-OFF */}
                <div style={{ fontSize: 12, fontWeight: 600, color: '#292524', marginBottom: 8 }}>Toggle</div>
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {cellCard(<>
                    {cellLabel('Default')}
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-caption-medium" style={{ background: '#dcfce7', color: ROW_DIFF_COLORS.add }}>ON</span>
                  </>)}
                  {cellCard(<>
                    {cellLabel('Modified')}
                    <div className="flex flex-col items-start gap-0.5">
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-caption-medium line-through" style={{ background: '#fef2f2', color: '#a8a29e' }}>OFF</span>
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-caption-medium" style={{ background: '#dcfce7', color: ROW_DIFF_COLORS.add }}>ON</span>
                    </div>
                  </>)}
                  {cellCard(<>
                    {cellLabel('Deleted')}
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-caption-medium line-through" style={{ background: '#f5f5f4', color: '#a8a29e' }}>ON</span>
                  </>, { deleted: true })}
                </div>

                {/* TOTAL WITH REVALO */}
                <div style={{ fontSize: 12, fontWeight: 600, color: '#292524', marginBottom: 8 }}>Total with Revalo</div>
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {cellCard(<>
                    {cellLabel('Default')}
                    <div className="flex items-center gap-1.5">
                      <span style={{ fontSize: 13, color: '#78716c', fontVariantNumeric: 'tabular-nums' }}>32 400 €</span>
                      <span style={{ fontSize: 11, color: '#a8a29e' }}>·</span>
                      <CircleArrowUp className="w-3.5 h-3.5 text-[#1e3a8a]" />
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#292524', fontVariantNumeric: 'tabular-nums' }}>33 696 €</span>
                    </div>
                  </>)}
                  {cellCard(<>
                    {cellLabel('Modified — amount changed')}
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5">
                        <span style={{ fontSize: 11, color: '#a8a29e', textDecoration: 'line-through', fontVariantNumeric: 'tabular-nums' }}>29 800 €</span>
                        <span style={{ fontSize: 11, color: '#a8a29e' }}>·</span>
                        <CircleArrowUp className="w-3 h-3 text-[#a8a29e]" />
                        <span style={{ fontSize: 11, color: '#a8a29e', textDecoration: 'line-through', fontVariantNumeric: 'tabular-nums' }}>31 886 €</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span style={{ fontSize: 13, color: '#78716c', fontVariantNumeric: 'tabular-nums' }}>31 200 €</span>
                        <span style={{ fontSize: 11, color: '#a8a29e' }}>·</span>
                        <CircleArrowUp className="w-3.5 h-3.5 text-[#1e3a8a]" />
                        <span style={{ fontSize: 14, fontWeight: 600, color: '#292524', fontVariantNumeric: 'tabular-nums' }}>33 384 €</span>
                      </div>
                    </div>
                  </>)}
                  {cellCard(<>
                    {cellLabel('Modified — revalo toggled ON')}
                    <div className="flex flex-col gap-1">
                      <div>
                        <span style={{ fontSize: 13, color: '#a8a29e', fontVariantNumeric: 'tabular-nums' }}>32 400 €</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span style={{ fontSize: 13, color: '#78716c', fontVariantNumeric: 'tabular-nums' }}>32 400 €</span>
                        <span style={{ fontSize: 11, color: '#a8a29e' }}>·</span>
                        <CircleArrowUp className="w-3.5 h-3.5 text-[#1e3a8a]" />
                        <span style={{ fontSize: 14, fontWeight: 600, color: '#292524', fontVariantNumeric: 'tabular-nums' }}>33 696 €</span>
                      </div>
                    </div>
                  </>)}
                </div>
                <div className="grid grid-cols-3 gap-3 mb-2">
                  {cellCard(<>
                    {cellLabel('Modified — revalo index changed')}
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5">
                        <span style={{ fontSize: 11, color: '#a8a29e', fontVariantNumeric: 'tabular-nums' }}>32 400 €</span>
                        <span style={{ fontSize: 11, color: '#a8a29e' }}>·</span>
                        <CircleArrowUp className="w-3 h-3 text-[#a8a29e]" />
                        <span style={{ fontSize: 11, color: '#a8a29e', textDecoration: 'line-through', fontVariantNumeric: 'tabular-nums' }}>33 048 €</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span style={{ fontSize: 13, color: '#78716c', fontVariantNumeric: 'tabular-nums' }}>32 400 €</span>
                        <span style={{ fontSize: 11, color: '#a8a29e' }}>·</span>
                        <CircleArrowUp className="w-3.5 h-3.5 text-[#1e3a8a]" />
                        <span style={{ fontSize: 14, fontWeight: 600, color: '#292524', fontVariantNumeric: 'tabular-nums' }}>33 696 €</span>
                      </div>
                    </div>
                  </>)}
                  {cellCard(<>
                    {cellLabel('Deleted')}
                    <div className="flex items-center gap-1.5">
                      <span style={{ fontSize: 13, color: '#a8a29e', textDecoration: 'line-through', fontVariantNumeric: 'tabular-nums' }}>32 400 €</span>
                      <span style={{ fontSize: 11, color: '#a8a29e' }}>·</span>
                      <CircleArrowUp className="w-3.5 h-3.5 text-[#a8a29e]" />
                      <span style={{ fontSize: 14, color: '#a8a29e', textDecoration: 'line-through', fontVariantNumeric: 'tabular-nums' }}>33 696 €</span>
                    </div>
                  </>, { deleted: true })}
                  {cellCard(<>
                    {cellLabel('Default — no revalo')}
                    <div className="flex items-center gap-1.5">
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#292524', fontVariantNumeric: 'tabular-nums' }}>32 400 €</span>
                    </div>
                  </>)}
                </div>
              </div>
                );
              })()}

              {subTitle('Field-level streaming indicator')}
              <div className="border border-[#e7e5e3] rounded-lg bg-white p-4" style={{ maxWidth: 320 }}>
                <div className="animate-field-glow">
                  <div className="text-caption-medium text-[#78716c] mb-1 flex items-center gap-1">
                    Nom
                    <span className="inline-block w-1.5 h-1.5" style={{ background: '#4a9168', transform: 'rotate(45deg)' }} />
                  </div>
                  <div className="text-body text-[#292524]">
                    Martin<span className="inline-block w-0.5 h-4 animate-pulse ml-0.5 align-middle" style={{ background: '#4a9168' }}></span>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-caption-medium text-[#78716c] mb-1 flex items-center gap-1">
                    Prénom
                    <span className="inline-block w-1.5 h-1.5" style={{ background: '#4a9168', transform: 'rotate(45deg)' }} />
                  </div>
                  <div className="text-body text-[#292524]">Sophie</div>
                </div>
              </div>
            </div>

            {/* ====== PARAMETER PILLS ====== */}
            <div id="section-param-pills" className={sectionClass}>
              {sectionTitle('Parameter Pills')}
              <p style={{ fontSize: 14, color: '#78716c', marginBottom: 16 }}>Hypothèse/parameter pills with diff states. Accept/reject embedded inside the pill when a diff is pending.</p>

              {subTitle('All states')}
              <div className="flex flex-wrap items-center gap-3" style={{ maxWidth: 900, marginBottom: 24 }}>
                {/* Default enabled (blue info) */}
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border" style={{ background: PILL_SCHEMES.info.bg, borderColor: PILL_SCHEMES.info.border, color: PILL_SCHEMES.info.text }}>
                  <CircleArrowUp className="w-3.5 h-3.5" /> Capitaliser <span style={{ fontWeight: 400 }}>IPC Annuel, XX, XX ans</span>
                </span>
                {/* Default disabled (gray neutral) */}
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border" style={{ background: PILL_SCHEMES.neutral.bg, borderColor: PILL_SCHEMES.neutral.border, color: PILL_SCHEMES.neutral.text }}>
                  <CircleArrowUp className="w-3.5 h-3.5" /> Param
                </span>
                {/* Add diff (blue info + green diamond) */}
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border" style={{ background: PILL_SCHEMES.info.bg, borderColor: PILL_SCHEMES.info.border, color: PILL_SCHEMES.info.text }}>
                  <span className="w-1.5 h-1.5 flex-shrink-0" style={{ background: DIAMOND_COLORS.add, transform: 'rotate(45deg)', borderRadius: '0.5px' }} />
                  <CircleArrowUp className="w-3.5 h-3.5" /> Revaloriser <span style={{ fontWeight: 400 }}>On · IPC Annuel</span>
                  <span className="inline-flex items-center gap-1 ml-0.5">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'white', border: '1px solid #d6d3d1', boxShadow: '0 1px 2px rgba(26,26,26,0.05)' }}><Check className="w-3 h-3" style={{ color: '#78716c' }} strokeWidth={2.5} /></span>
                    <span className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'white', border: '1px solid #d6d3d1', boxShadow: '0 1px 2px rgba(26,26,26,0.05)' }}><X className="w-3 h-3" style={{ color: '#78716c' }} strokeWidth={2.5} /></span>
                  </span>
                </span>
                {/* Edit diff (blue ON + orange diamond) */}
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border" style={{ background: PILL_SCHEMES.info.bg, borderColor: PILL_SCHEMES.info.border, color: PILL_SCHEMES.info.text }}>
                  <span className="w-1.5 h-1.5 flex-shrink-0" style={{ background: DIAMOND_COLORS.edit, transform: 'rotate(45deg)', borderRadius: '0.5px' }} />
                  <CircleArrowUp className="w-3.5 h-3.5" /> Revalorisation <span style={{ fontWeight: 400 }}><span style={{ textDecoration: 'line-through', opacity: 0.6 }}>IPC Mensuel</span> → Annuel</span>
                  <span className="inline-flex items-center gap-1 ml-0.5">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'white', border: '1px solid #d6d3d1', boxShadow: '0 1px 2px rgba(26,26,26,0.05)' }}><Check className="w-3 h-3" style={{ color: '#78716c' }} strokeWidth={2.5} /></span>
                    <span className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'white', border: '1px solid #d6d3d1', boxShadow: '0 1px 2px rgba(26,26,26,0.05)' }}><X className="w-3 h-3" style={{ color: '#78716c' }} strokeWidth={2.5} /></span>
                  </span>
                </span>
                {/* Delete diff (gray OFF + red diamond) */}
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border" style={{ background: PILL_SCHEMES.neutral.bg, borderColor: PILL_SCHEMES.neutral.border, color: PILL_SCHEMES.neutral.text }}>
                  <span className="w-1.5 h-1.5 flex-shrink-0" style={{ background: DIAMOND_COLORS.delete, transform: 'rotate(45deg)', borderRadius: '0.5px' }} />
                  <CircleArrowUp className="w-3.5 h-3.5" /> Capitaliser <span style={{ fontWeight: 400 }}><span style={{ textDecoration: 'line-through', opacity: 0.6 }}>On</span> → Off</span>
                  <span className="inline-flex items-center gap-1 ml-0.5">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'white', border: '1px solid #d6d3d1', boxShadow: '0 1px 2px rgba(26,26,26,0.05)' }}><Check className="w-3 h-3" style={{ color: '#78716c' }} strokeWidth={2.5} /></span>
                    <span className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'white', border: '1px solid #d6d3d1', boxShadow: '0 1px 2px rgba(26,26,26,0.05)' }}><X className="w-3 h-3" style={{ color: '#78716c' }} strokeWidth={2.5} /></span>
                  </span>
                </span>
              </div>

              {subTitle('In-context — settings row with mixed states')}
              <p style={{ fontSize: 12, color: '#a8a29e', marginBottom: 12 }}>Simulates a real settings row: icon + stacked pills, some default, some with pending diffs.</p>
              <div className="border border-[#e7e5e3] rounded-lg bg-white overflow-hidden" style={{ maxWidth: 880, marginBottom: 24, boxShadow: '0 1px 2px rgba(26,26,26,0.05)' }}>
                <div className="flex items-center gap-3 px-4 h-[52px] flex-wrap">
                  <div className="w-6 h-6 bg-[#eeece6] rounded-[6px] flex items-center justify-center flex-shrink-0">
                    <Settings className="w-3.5 h-3.5 text-[#78716c]" />
                  </div>
                  {/* Default enabled */}
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border" style={{ background: PILL_SCHEMES.info.bg, borderColor: PILL_SCHEMES.info.border, color: PILL_SCHEMES.info.text }}>
                    <CircleArrowUp className="w-3.5 h-3.5" /> Capitaliser <span style={{ fontWeight: 400 }}>IPC Annuel, XX, XX ans</span>
                  </span>
                  {/* Edit diff */}
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border" style={{ background: PILL_SCHEMES.info.bg, borderColor: PILL_SCHEMES.info.border, color: PILL_SCHEMES.info.text }}>
                    <span className="w-1.5 h-1.5 flex-shrink-0" style={{ background: DIAMOND_COLORS.edit, transform: 'rotate(45deg)', borderRadius: '0.5px' }} />
                    <CircleArrowUp className="w-3.5 h-3.5" /> Revalorisation <span style={{ fontWeight: 400 }}><span style={{ textDecoration: 'line-through', opacity: 0.6 }}>IPC Mensuel</span> → Annuel</span>
                    <span className="inline-flex items-center gap-1 ml-0.5">
                      <span className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'white', border: '1px solid #d6d3d1', boxShadow: '0 1px 2px rgba(26,26,26,0.05)' }}><Check className="w-3 h-3" style={{ color: '#78716c' }} strokeWidth={2.5} /></span>
                      <span className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'white', border: '1px solid #d6d3d1', boxShadow: '0 1px 2px rgba(26,26,26,0.05)' }}><X className="w-3 h-3" style={{ color: '#78716c' }} strokeWidth={2.5} /></span>
                    </span>
                  </span>
                  {/* Delete diff */}
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border" style={{ background: PILL_SCHEMES.neutral.bg, borderColor: PILL_SCHEMES.neutral.border, color: PILL_SCHEMES.neutral.text }}>
                    <span className="w-1.5 h-1.5 flex-shrink-0" style={{ background: DIAMOND_COLORS.delete, transform: 'rotate(45deg)', borderRadius: '0.5px' }} />
                    <CircleArrowUp className="w-3.5 h-3.5" /> Capitaliser <span style={{ fontWeight: 400 }}><span style={{ textDecoration: 'line-through', opacity: 0.6 }}>On</span> → Off</span>
                  </span>
                  {/* Default disabled */}
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border" style={{ background: PILL_SCHEMES.neutral.bg, borderColor: PILL_SCHEMES.neutral.border, color: PILL_SCHEMES.neutral.text }}>
                    <CircleArrowUp className="w-3.5 h-3.5" /> Param
                  </span>
                </div>
              </div>
            </div>

            {/* ====== ARTIFACT CARDS ====== */}
            <div id="section-artifact-cards" className={sectionClass}>
              {sectionTitle('Artifact Cards')}
              <p style={{ fontSize: 14, color: '#78716c', marginBottom: 16 }}>Cartes affichées dans le chat pour résumer les changements par zone. Expandable avec actions approve/reject.</p>

              {subTitle('By zone type — collapsed')}
              <p style={{ fontSize: 12, color: '#a8a29e', marginBottom: 16 }}>Icon + title identify the zone. Color is reserved exclusively for diff counters (green/orange/red).</p>

              {/* Three cards side by side */}
              <div className="grid grid-cols-3 gap-4" style={{ maxWidth: 880, marginBottom: 24 }}>
                {[
                  { label: 'Poste / Chiffrage', title: 'DSA — Dépenses de santé actuelles', Icon: HeartPulse, adds: 3, edits: 1, deletes: 1 },
                  { label: 'Documents', title: 'Pièces du dossier', Icon: FileText, adds: 4, edits: 0, deletes: 0 },
                  { label: 'Infos dossier', title: 'Info dossier', Icon: ClipboardList, adds: 8, edits: 2, deletes: 0 },
                ].map((zone, zi) => (
                  <div key={zi}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>{zone.label}</div>
                    <div className="rounded-lg border border-[#e7e5e3] bg-white overflow-hidden" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.8), inset 0 -2px 4px rgba(0,0,0,0.03)' }}>
                      <div className="flex items-stretch">
                        <div className="w-10 flex items-center justify-center flex-shrink-0" style={{ background: '#f5f5f4' }}>
                          <zone.Icon className="w-3.5 h-3.5" style={{ color: '#78716c' }} />
                        </div>
                        <div className="flex items-center gap-3 flex-1 min-w-0" style={{ padding: '12px 14px 12px 12px' }}>
                          <div className="flex-1 min-w-0">
                            <div style={{ fontSize: 14, fontWeight: 500, color: '#292524', lineHeight: '18px' }}>{zone.title}</div>
                            <div className="flex items-center gap-2 mt-0.5">
                              {zone.adds > 0 && <span className="inline-flex items-center gap-0.5" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: ROW_DIFF_COLORS.add, fontWeight: 500 }}><Plus className="w-2.5 h-2.5" strokeWidth={2.5} />{zone.adds}</span>}
                              {zone.edits > 0 && <span className="inline-flex items-center gap-0.5" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: ROW_DIFF_COLORS.edit, fontWeight: 500 }}><Pencil className="w-2.5 h-2.5" strokeWidth={2.5} />{zone.edits}</span>}
                              {zone.deletes > 0 && <span className="inline-flex items-center gap-0.5" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: ROW_DIFF_COLORS.delete, fontWeight: 500 }}><Trash2 className="w-2.5 h-2.5" strokeWidth={2.5} />{zone.deletes}</span>}
                            </div>
                          </div>
                          <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#a8a29e', transform: 'rotate(-90deg)' }} />
                        </div>
                      </div>
                      {/* Footer — always visible */}
                      <div style={{ borderTop: '1px solid #f0efed' }} className="flex items-center">
                        <button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 hover:bg-[#fafaf9]" style={{ fontSize: 12, fontWeight: 500, color: '#78716c' }}>
                          <Check className="w-3.5 h-3.5" strokeWidth={2.5} /> Tout accepter
                        </button>
                        <div style={{ width: 1, height: 14, background: '#e7e5e3' }} />
                        <button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 hover:bg-[#fafaf9]" style={{ fontSize: 12, fontWeight: 500, color: '#a8a29e' }}>
                          <RotateCcw className="w-3 h-3" /> Tout annuler
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {subTitle('Interactive — expand/collapse + accept/reject')}
              <p style={{ fontSize: 12, color: '#a8a29e', marginBottom: 12 }}>Click chevron to expand/collapse. Accept/reject per row or bulk. Card collapses to "Traité" when all resolved. Click reset to start over.</p>

              <SharedInteractiveCards />
            </div>

            {/* ====== REASONING ====== */}
            <div id="section-reasoning" className={sectionClass}>
              {sectionTitle('Reasoning')}
              <p style={{ fontSize: 14, color: '#78716c', marginBottom: 16 }}>Composant de raisonnement de l'agent. Streaming → auto-collapse → expand inspection.</p>

              {subTitle('Step type → user label mapping')}
              <div className="flex flex-col gap-0 mb-4 border border-[#e7e5e3] rounded-lg bg-white overflow-hidden" style={{ maxWidth: 520 }}>
                {[
                  ['read_documents',  'Analyse de X documents'],
                  ['read_rapport',    "Lecture du rapport d'expertise"],
                  ['search_document', 'Recherche dans le document'],
                  ['extract_data',    'Extraction des données'],
                  ['calculate',       'Calcul du poste'],
                  ['verify_data',     'Vérification des données'],
                  ['summarize',       'Synthèse des résultats'],
                  ['navigate',        'Navigation vers le poste'],
                  ['add_row',         'X lignes ajoutées'],
                  ['update_row',      'Mise à jour du champ'],
                  ['delete_row',      'X lignes supprimées'],
                  ['sub_agent',       'Agent extraction factures'],
                  ['error',           'Extraction impossible — fichier illisible'],
                ].map(([type, label], i) => {
                  const cfg = STEP_TYPE_CONFIG[type];
                  if (!cfg) return null;
                  const Icon = cfg.Icon;
                  const colors = STEP_COLORS[cfg.color] || STEP_COLORS.default;
                  return (
                    <div key={type} className="flex items-center gap-2.5 px-3 py-1.5" style={{ borderTop: i > 0 ? '1px solid #f5f5f4' : 'none' }}>
                      <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: colors.icon }} />
                      <span className="flex-shrink-0" style={{ fontSize: 11, fontFamily: 'monospace', color: '#a8a29e', width: 120 }}>{type}</span>
                      <span style={{ fontSize: 12, color: '#44403c' }}>{label}</span>
                      {cfg.pill && <CrudPill type={type} />}
                    </div>
                  );
                })}
              </div>

              {subTitle('CRUD Pills')}
              {row(
                <div className="flex items-center gap-3">
                  <CrudPill type="add_row" />
                  <CrudPill type="update_row" />
                  <CrudPill type="delete_row" />
                </div>
              )}

              {subTitle('Dot Counters')}
              {row(
                <div className="flex items-center gap-4">
                  <DotCounter color="green" count={3} />
                  <DotCounter color="orange" count={1} />
                  <DotCounter color="red" count={1} />
                </div>
              )}

              {subTitle('Streaming (active)')}
              <div style={{ maxWidth: 420 }} className="border border-[#e7e5e3] rounded-lg bg-white p-3">
                <ReasoningStepper
                  status="streaming"
                  steps={[
                    { type: 'read_documents', label: 'Analyse de 6 documents', status: 'done', children: ['rapport.pdf', 'facture_1.pdf', 'facture_2.pdf', 'facture_3.pdf', 'bulletin_01.pdf', 'bulletin_02.pdf'] },
                    { type: 'read_rapport', label: "Lecture du rapport d'expertise", status: 'done' },
                    { type: 'extract_data', label: 'Extraction facture CHU Bordeaux', status: 'loading', children: ['Montant : 4 500 €', 'CPAM : 3 200 €', 'RAC : 1 300 €'] },
                  ]}
                  onToggle={() => {}}
                />
              </div>

              {subTitle('Collapsed (done — with CRUD counters)')}
              <div style={{ maxWidth: 420 }} className="border border-[#e7e5e3] rounded-lg bg-white p-3">
                <ReasoningStepper
                  status="done"
                  summary="Complétion du poste DSA depuis 3 factures"
                  counters={{ add: 3, update: 1 }}
                  steps={[
                    { type: 'read_documents', label: 'Analyse de 6 documents', status: 'done' },
                    { type: 'read_rapport', label: "Lecture du rapport d'expertise", status: 'done' },
                    { type: 'extract_data', label: 'Extraction facture CHU Bordeaux', status: 'done', children: ['4 500 € — CPAM 3 200 €'] },
                    { type: 'add_row', label: '3 lignes DSA', status: 'done', poste: 'DSA', children: ['Consultation spécialiste', 'IRM lombaire', 'Kinésithérapie'] },
                    { type: 'update_row', label: 'Taux DFP', status: 'done', poste: 'DFP', children: ['15% → 20%'] },
                  ]}
                  expanded={false}
                  onToggle={() => {}}
                />
              </div>

              {subTitle('Collapsed (read-only — no counters)')}
              <div style={{ maxWidth: 420 }} className="border border-[#e7e5e3] rounded-lg bg-white p-3">
                <ReasoningStepper
                  status="done"
                  summary="Analyse du rapport d'expertise"
                  steps={[
                    { type: 'read_documents', label: 'Analyse de 2 documents', status: 'done' },
                    { type: 'read_rapport', label: "Lecture du rapport d'expertise", status: 'done' },
                  ]}
                  expanded={false}
                  onToggle={() => {}}
                />
              </div>

              {subTitle('Expanded (inspection mode)')}
              <div style={{ maxWidth: 420 }} className="border border-[#e7e5e3] rounded-lg bg-white p-3">
                <ReasoningStepper
                  status="done"
                  summary="Complétion du poste DSA depuis 3 factures"
                  counters={{ add: 3, update: 1 }}
                  steps={[
                    { type: 'read_documents', label: 'Analyse de 6 documents', status: 'done', children: ['rapport.pdf', 'facture_1.pdf', 'facture_2.pdf', 'facture_3.pdf', 'bulletin_01.pdf', 'bulletin_02.pdf'] },
                    { type: 'read_rapport', label: "Lecture du rapport d'expertise", status: 'done' },
                    { type: 'extract_data', label: 'Extraction facture CHU Bordeaux', status: 'done', children: ['Montant : 4 500 €', 'CPAM : 3 200 €', 'RAC : 1 300 €'] },
                    { type: 'add_row', label: '3 lignes DSA', status: 'done', poste: 'DSA', children: ['Consultation spécialiste', 'IRM lombaire', 'Kinésithérapie'] },
                    { type: 'update_row', label: 'Taux DFP', status: 'done', poste: 'DFP', children: ['15% → 20%'] },
                  ]}
                  expanded={true}
                  onToggle={() => {}}
                />
              </div>

              {subTitle('Partial error')}
              <div style={{ maxWidth: 420 }} className="border border-[#e7e5e3] rounded-lg bg-white p-3">
                <ReasoningStepper
                  status="done"
                  summary="Extraction des factures DSA"
                  counters={{ add: 2, error: 1 }}
                  steps={[
                    { type: 'read_documents', label: 'Analyse de 3 documents', status: 'done' },
                    { type: 'extract_data', label: 'Extraction facture CHU', status: 'done', children: ['4 500 € — CPAM 3 200 €'] },
                    { type: 'error', label: 'Extraction impossible — facture_scan.pdf illisible', status: 'error' },
                    { type: 'add_row', label: '2 lignes DSA', status: 'done', poste: 'DSA', children: ['Consultation spécialiste', 'IRM lombaire'] },
                  ]}
                  expanded={true}
                  onToggle={() => {}}
                />
              </div>

              {subTitle('Total error')}
              <div style={{ maxWidth: 420 }} className="border border-[#e7e5e3] rounded-lg bg-white p-3">
                <ReasoningStepper
                  status="done"
                  summary="Analyse du rapport d'expertise"
                  counters={{ error: 1 }}
                  steps={[
                    { type: 'error', label: "Aucun rapport d'expertise dans le dossier", status: 'error' },
                  ]}
                  expanded={false}
                  onToggle={() => {}}
                />
              </div>

              {subTitle('Sub-agent')}
              <div style={{ maxWidth: 420 }} className="border border-[#e7e5e3] rounded-lg bg-white p-3">
                <ReasoningStepper
                  status="done"
                  summary="Extraction et complétion DSA"
                  counters={{ add: 2 }}
                  steps={[
                    { type: 'read_documents', label: 'Analyse de 4 documents', status: 'done' },
                    { type: 'read_rapport', label: "Lecture du rapport d'expertise", status: 'done' },
                    { type: 'sub_agent', label: 'Agent extraction factures', status: 'done', children_steps: [
                      { type: 'extract_data', label: 'Extraction facture CHU', status: 'done', children: ['4 500 €'] },
                      { type: 'extract_data', label: 'Extraction facture clinique', status: 'done', children: ['2 800 €'] },
                    ]},
                    { type: 'add_row', label: '2 lignes DSA', status: 'done', poste: 'DSA', children: ['CHU Bordeaux', 'Clinique St-Jean'] },
                  ]}
                  expanded={true}
                  onToggle={() => {}}
                />
              </div>

              {subTitle('Backend tool mapping (real Plato Supervisor names)')}
              <div style={{ maxWidth: 420 }} className="border border-[#e7e5e3] rounded-lg bg-white p-3">
                <ReasoningStepper
                  status="done"
                  summary="Analyse du poste DFT — 2 problèmes détectés"
                  counters={{ update: 2, delete: 1 }}
                  steps={[
                    { type: 'read_documents', label: 'Lecture du dossier', status: 'done', children: ['rapport_expertise.pdf', 'consolidation_2023.pdf'] },
                    { type: 'extract_data', label: 'Extraction des périodes DFT', status: 'done', children: ['3 périodes identifiées'] },
                    { tool: 'getPosteProblemDetector', detail: 'Vérification des données DFT', expandedText: '2 doublons détectés entre sources' },
                    { tool: 'getHistoireSummaryTool', detail: 'Synthèse des résultats' },
                    { type: 'delete_row', label: '1 ligne en doublon', status: 'done', poste: 'DFT' },
                    { type: 'update_row', label: 'Taux DFT période 2', status: 'done', poste: 'DFT', children: ['25% → 30%'] },
                    { type: 'update_row', label: 'Date fin période 3', status: 'done', poste: 'DFT', children: ['15/03/2023 → 17/05/2023'] },
                  ]}
                  expanded={true}
                  onToggle={() => {}}
                />
              </div>

            </div>

            {/* ====== CHAT MESSAGES ====== */}
            <div id="section-chat-messages" className={sectionClass}>
              {sectionTitle('Chat Messages')}

              {subTitle('Chat blocked indicator')}
              <div style={{ maxWidth: 380 }} className="border border-[#e7e5e3] rounded-lg bg-white overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-1.5" style={{ borderBottom: '1px solid #e7e5e3' }}>
                  <ThinkingDots />
                  <span style={{ fontSize: 11, color: '#a8a29e' }}>Plato analyse vos documents...</span>
                </div>
                <div style={{ padding: '12px', opacity: 0.5 }}>
                  <span className="text-[14px]" style={{ color: '#78716c' }}>Plato analyse vos documents...</span>
                </div>
              </div>
            </div>

            {/* ====== PANEL DIFF INPUTS ====== */}
            <div id="section-panel-diff-inputs" className={sectionClass}>
              {sectionTitle('Panel Diff Inputs')}
              <p style={{ fontSize: 14, color: '#78716c', marginBottom: 16 }}>Champs du panel d'édition avec contexte diff agent. Utilise l'anatomie shadcn Field : label → input (shadow-xs) → description. Le sparkle ✦ signale les champs touchés par l'agent, la description affiche l'ancienne valeur.</p>

              {(() => {
                const inputBase = "w-full px-3 py-2 bg-white border border-[#e7e5e3] rounded-lg text-[14px] leading-5 text-[#292524] placeholder:text-[#78716c] focus:outline-none focus:border-[#292524] focus:shadow-[0_0_0_3px_rgba(163,163,163,0.5)]";
                const shadowXs = '0 1px 2px rgba(26,26,26,0.05)';
                const labelStyle = { fontSize: 14, fontWeight: 500, color: '#292524', lineHeight: '20px' };
                const descStyle = { fontSize: 12, fontWeight: 400, color: '#78716c', lineHeight: '16px', letterSpacing: '0.12px', marginTop: 6 };
                const warnLabelStyle = { ...labelStyle, color: '#855b31' };
                const warnDescStyle = { ...descStyle, color: '#855b31' };

                // Shadcn Field wrapper
                const Field = ({ label: lbl, diffColor, warning, description, descColor, children }) => (
                  <div className="flex flex-col" style={{ gap: 6 }}>
                    <div className="flex items-center gap-1.5">
                      <span style={warning ? warnLabelStyle : labelStyle}>{lbl}</span>
                      {diffColor && <div className="w-1.5 h-1.5 flex-shrink-0" style={{ background: diffColor, transform: 'rotate(45deg)' }} />}
                    </div>
                    {children}
                    {description && <p style={warning ? warnDescStyle : { ...descStyle, color: descColor || '#78716c' }}>{description}</p>}
                  </div>
                );

                const PanelDiffDemo = () => {
                  const [montant, setMontant] = React.useState('1 280,00');
                  const [base, setBase] = React.useState('30');
                  const [date, setDate] = React.useState('12/03/2023');
                  const [label, setLabel] = React.useState('Kinésithérapie (24 séances)');
                  const [saved, setSaved] = React.useState(false);

                  const reset = () => { setMontant('1 280,00'); setBase('30'); setDate('12/03/2023'); setLabel('Kinésithérapie (24 séances)'); setSaved(false); };

                  if (saved) {
                    return (
                      <div style={{ maxWidth: 380 }}>
                        <div className="border border-[#e7e5e3] rounded-lg bg-white p-5 space-y-5">
                          <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                            <Check className="w-4 h-4" style={{ color: ROW_DIFF_COLORS.add }} strokeWidth={2.5} />
                            <span className="text-body-medium" style={{ color: ROW_DIFF_COLORS.add }}>Enregistré — diffs effacés</span>
                          </div>
                          <Field label="Libellé dépense"><input type="text" readOnly value={label} className={inputBase} style={{ boxShadow: shadowXs, background: '#fafaf9' }} /></Field>
                          <Field label="Montant"><input type="text" readOnly value={`€ ${montant}`} className={inputBase} style={{ boxShadow: shadowXs, background: '#fafaf9' }} /></Field>
                        </div>
                        <button onClick={reset} className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#e7e5e3] hover:bg-[#fafaf9] transition-colors" style={{ fontSize: 12, fontWeight: 500, color: '#78716c' }}>
                          <RotateCcw className="w-3 h-3" /> Reset
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div style={{ maxWidth: 380 }}>
                      {/* ---- Edit diff ---- */}
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#a8a29e', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Edit — agent modified fields</div>
                      <div className="border border-[#e7e5e3] rounded-lg bg-white p-5 space-y-5">
                        <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}>
                          <div className="w-1.5 h-1.5" style={{ background: ROW_DIFF_COLORS.edit, transform: 'rotate(45deg)' }} />
                          <span style={{ fontSize: 12, fontWeight: 500, color: ROW_DIFF_COLORS.edit }}>Ligne modifiée par l'agent</span>
                        </div>

                        {/* Untouched field — no sparkle, no description */}
                        <Field label="Libellé dépense">
                          <input type="text" value={label} onChange={e => setLabel(e.target.value)} className={inputBase} style={{ boxShadow: shadowXs }} />
                        </Field>

                        {/* Agent-touched field — sparkle + old value in description */}
                        <Field label="Montant" diffColor={ROW_DIFF_COLORS.edit} description="Ancien : 960,00 €">
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#78716c]" style={{ fontSize: 14 }}>€</span>
                            <input type="text" value={montant} onChange={e => setMontant(e.target.value)} className={inputBase} style={{ boxShadow: shadowXs, paddingLeft: 28 }} />
                          </div>
                        </Field>

                        {/* Agent-touched field — sparkle + old value */}
                        <Field label="Date" diffColor={ROW_DIFF_COLORS.edit} description="Ancien : 01/03/2023">
                          <input type="text" value={date} onChange={e => setDate(e.target.value)} className={inputBase} style={{ boxShadow: shadowXs }} />
                        </Field>

                        {/* Agent-touched + revalo */}
                        <Field label="Base journalière" diffColor={ROW_DIFF_COLORS.edit}>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#78716c]" style={{ fontSize: 14 }}>€</span>
                            <input type="text" value={base} onChange={e => setBase(e.target.value)} className={inputBase} style={{ boxShadow: shadowXs, paddingLeft: 28 }} />
                          </div>
                          {/* Revalo row — matches Figma ↳ Revalo pattern */}
                          <div className="flex items-center gap-2 px-0.5" style={{ marginTop: 6 }}>
                            <div className="flex items-center gap-1 flex-1 min-w-0">
                              <CircleArrowUp className="w-3 h-3 flex-shrink-0" style={{ color: '#1e3a8a' }} />
                              <span style={{ fontSize: 12, fontWeight: 500, lineHeight: '16px' }}>
                                <span style={{ color: '#78716c' }}>Revalo (IPC Annuel)</span>{' '}
                                <span style={{ color: '#1e3a8a' }}>32,70 €</span>
                              </span>
                            </div>
                            <span style={{ fontSize: 12, color: '#78716c', lineHeight: '16px', letterSpacing: '0.12px' }}>30,00 × 1,09</span>
                          </div>
                        </Field>

                        {/* Warning state — missing info */}
                        <Field label="Taux de responsabilité" warning description="Info. manquante pour calculer">
                          <input type="text" placeholder="Ex: 100" className={inputBase} style={{ boxShadow: '0 0 0 3px #f9ecd6', borderColor: '#eeb97e' }} />
                        </Field>

                        <div className="flex items-center gap-3 pt-2">
                          <button onClick={() => setSaved(true)} className="flex-1 px-4 py-2 rounded-lg text-body-medium text-white transition-colors" style={{ backgroundColor: '#292524' }}>Enregistrer</button>
                          <button onClick={reset} className="px-4 py-2 rounded-lg text-body-medium text-[#44403c] hover:bg-[#f5f5f4] transition-colors">Annuler</button>
                        </div>
                      </div>

                      {/* ---- Add ---- */}
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#a8a29e', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, marginTop: 24 }}>Add — all fields are new</div>
                      <div className="border border-[#e7e5e3] rounded-lg bg-white p-5 space-y-5">
                        <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                          <div className="w-1.5 h-1.5" style={{ background: '#4a9168', transform: 'rotate(45deg)' }} />
                          <span style={{ fontSize: 12, fontWeight: 500, color: ROW_DIFF_COLORS.add }}>Ligne ajoutée par l'agent</span>
                        </div>
                        <Field label="Libellé dépense" diffColor={ROW_DIFF_COLORS.add}>
                          <input type="text" defaultValue="Hospitalisation CHU Bordeaux" className={inputBase} style={{ boxShadow: shadowXs }} />
                        </Field>
                        <Field label="Montant" diffColor={ROW_DIFF_COLORS.add}>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#78716c]" style={{ fontSize: 14 }}>€</span>
                            <input type="text" defaultValue="4 500,00" className={inputBase} style={{ boxShadow: shadowXs, paddingLeft: 28 }} />
                          </div>
                        </Field>
                        <Field label="Date" diffColor={ROW_DIFF_COLORS.add}>
                          <input type="text" defaultValue="05/06/2022" className={inputBase} style={{ boxShadow: shadowXs }} />
                        </Field>
                      </div>

                      {/* ---- Delete ---- */}
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#a8a29e', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, marginTop: 24 }}>Delete — read-only</div>
                      <div className="border border-[#e7e5e3] rounded-lg bg-white p-5 space-y-5" style={{ opacity: 0.6 }}>
                        <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
                          <div className="w-1.5 h-1.5" style={{ background: ROW_DIFF_COLORS.delete, transform: 'rotate(45deg)' }} />
                          <span style={{ fontSize: 12, fontWeight: 500, color: ROW_DIFF_COLORS.delete }}>Ligne supprimée par l'agent</span>
                        </div>
                        <Field label="Libellé dépense">
                          <div className={inputBase} style={{ boxShadow: shadowXs, color: '#a8a29e', background: '#fafaf9', textDecoration: 'line-through' }}>Consultation Dr. Dupont</div>
                        </Field>
                        <Field label="Montant">
                          <div className={inputBase} style={{ boxShadow: shadowXs, color: '#a8a29e', background: '#fafaf9', textDecoration: 'line-through' }}>55,00 €</div>
                        </Field>
                        <div className="flex items-center gap-3 pt-2">
                          <button className="flex-1 px-4 py-2 rounded-lg text-body-medium text-[#c45555] border border-[#fecaca] hover:bg-[#fef2f2] transition-colors">Confirmer la suppression</button>
                        </div>
                      </div>
                    </div>
                  );
                };

                return <PanelDiffDemo />;
              })()}
            </div>

            {/* ====== FIELD STREAMING ====== */}
            <div id="section-field-streaming" className={sectionClass}>
              {sectionTitle('Field Streaming')}
              <p style={{ fontSize: 14, color: '#78716c', marginBottom: 16 }}>Indicateurs visuels lors du remplissage automatique des champs par l'agent.</p>

              {subTitle('States: streaming → revealed → default')}
              <div className="border border-[#e7e5e3] rounded-lg bg-white p-4 space-y-4" style={{ maxWidth: 320 }}>
                <div className="animate-field-glow">
                  <div className="text-caption-medium text-[#78716c] mb-1">En cours de saisie</div>
                  <div className="text-body text-[#292524]">Mar<span className="inline-block w-0.5 h-4 animate-pulse ml-0.5 align-middle" style={{ background: '#4a9168' }}></span></div>
                </div>
                <div className="pl-3" style={{ borderLeft: '2px solid rgba(22, 163, 74, 0.35)' }}>
                  <div className="text-caption-medium text-[#78716c] mb-1 flex items-center gap-1">Rempli par l'agent <span className="inline-block w-1.5 h-1.5" style={{ background: '#4a9168', transform: 'rotate(45deg)' }} /></div>
                  <div className="text-body text-[#292524]">Martin</div>
                </div>
                <div>
                  <div className="text-caption-medium text-[#78716c] mb-1">Champ normal</div>
                  <div className="text-body text-[#292524]">Dupont</div>
                </div>
              </div>
            </div>

            {/* ====== BADGES & PILLS ====== */}
            <div id="section-badges-&-pills" className={sectionClass}>
              {sectionTitle('Badges & Pills')}

              {subTitle('Diff type badges')}
              {row(<>
                {[
                  { label: 'Ajout', bg: '#dcfce7', color: ROW_DIFF_COLORS.add },
                  { label: 'Modif.', bg: '#fff7ed', color: ROW_DIFF_COLORS.edit },
                  { label: 'Suppr.', bg: '#fef2f2', color: ROW_DIFF_COLORS.delete },
                ].map(b => (
                  <span key={b.label} className="inline-flex items-center gap-1 px-1.5 py-0.5 text-caption-medium rounded-full" style={{ background: b.bg, color: b.color }}>{b.label}</span>
                ))}
              </>)}

              {subTitle('Diff chips (subtitle)')}
              {row(<>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#e7e5e3] bg-white">
                  <span className="inline-flex items-center gap-0.5" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: ROW_DIFF_COLORS.add, fontWeight: 500 }}><Plus className="w-2.5 h-2.5" strokeWidth={2.5} />3</span>
                  <span className="inline-flex items-center gap-0.5" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: ROW_DIFF_COLORS.edit, fontWeight: 500 }}><Pencil className="w-2.5 h-2.5" strokeWidth={2.5} />2</span>
                  <span className="inline-flex items-center gap-0.5" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: ROW_DIFF_COLORS.delete, fontWeight: 500 }}><Trash2 className="w-2.5 h-2.5" strokeWidth={2.5} />1</span>
                </div>
              </>)}

              {subTitle('DFT taux pills')}
              {row(<>
                <span className="text-caption-medium px-2 py-0.5 rounded-full bg-[#eeece6] text-[#44403c]">100%</span>
                <span className="text-caption-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">50%</span>
                <span className="text-caption-medium px-2 py-0.5 rounded-full bg-red-50 text-red-400 border border-red-200" style={{ textDecoration: 'line-through' }}>25%</span>
              </>)}
            </div>

            {/* ====== BUTTONS ====== */}
            <div id="section-buttons" className={sectionClass}>
              {sectionTitle('Buttons')}

              {subTitle('Primary actions')}
              {row(<>
                <button className="px-4 py-2 rounded-lg text-body-medium text-white" style={{ backgroundColor: '#b9703f' }}>Action principale</button>
                <button className="px-4 py-2 rounded-lg text-body-medium text-[#292524] border border-[#e7e5e3] bg-white hover:bg-[#fafaf9]">Secondaire</button>
                <button className="px-2 py-1 rounded flex items-center gap-1" style={{ fontSize: 12, fontWeight: 500, color: ROW_DIFF_COLORS.edit, background: 'rgba(234,121,73,0.06)' }}>Voir <ChevronRight className="w-3 h-3" /></button>
              </>)}

              {subTitle('Approve / Reject')}
              {row(<>
                <button className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded hover:bg-[#fafaf9] border border-[#e7e5e3]" style={{ fontSize: 12, fontWeight: 500, color: '#78716c' }}>
                  <Check className="w-3.5 h-3.5" strokeWidth={2.5} /> Tout accepter
                </button>
                <span className="flex items-center gap-0.5">
                  <button className="w-6 h-6 rounded flex items-center justify-center hover:bg-[#fafaf9] border border-[#e7e5e3]"><Check className="w-3.5 h-3.5 text-[#44403c]" strokeWidth={2.5} /></button>
                  <button className="w-6 h-6 rounded flex items-center justify-center hover:bg-[#fafaf9] border border-[#e7e5e3]"><X className="w-3.5 h-3.5 text-[#a8a29e]" strokeWidth={2.5} /></button>
                </span>
              </>)}

              {subTitle('Toast notification')}
              {row(<>
                <div className="px-4 py-3 text-white text-body rounded-lg shadow-lg flex items-center gap-2 bg-zinc-800">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#4a9168' }} />
                  Informations du dossier extraites
                </div>
              </>)}
            </div>

            {/* ====== BARÈME COMPONENTS ====== */}
            <div id="section-barème-components" className={sectionClass}>
              {sectionTitle('Barème Components')}
              <p style={{ fontSize: 14, color: '#78716c', marginBottom: 16 }}>Composants pour la gestion des barèmes et référentiels — bibliothèque, sélecteur, viewer, upload.</p>

              {subTitle('StatusBadge — Actif / En traitement')}
              {row(<>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center text-xs px-2 py-0.5 rounded-full" style={{ background: '#dcfce7', color: '#065f46' }}>Actif</span>
                  <span className="inline-flex items-center text-xs px-2.5 py-1 rounded-full" style={{ background: '#dcfce7', color: '#065f46', fontSize: 13 }}>Actif</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center text-xs px-2 py-0.5 rounded-full" style={{ background: '#fef3c7', color: '#92400e' }}>En traitement</span>
                  <span className="inline-flex items-center text-xs px-2.5 py-1 rounded-full" style={{ background: '#fef3c7', color: '#92400e', fontSize: 13 }}>En traitement</span>
                </div>
              </>)}


              {subTitle('BaremeListItem — Row variants')}
              <div className="bg-white rounded-lg border border-[#e7e5e3]/60 overflow-hidden mb-4" style={{ maxWidth: 500 }}>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-100">
                      <th className="px-4 py-2.5 text-left" style={colHeaderStyle}>Nom</th>
                      <th className="px-4 py-2.5 text-left" style={colHeaderStyle}>Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e7e5e3]">
                    {[
                      { label: 'GDP 2025 Prospective 0,50%', status: 'active' },
                      { label: "Cour d'appel 2024", status: 'active' },
                      { label: 'Barème Cabinet Martin', status: 'processing' },
                    ].map((item, i) => (
                      <tr key={i} className={`bg-white ${item.status === 'active' ? 'hover:bg-[#fafaf9] cursor-pointer' : 'opacity-75'}`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-md bg-[#eeece6] flex items-center justify-center"><Scale className="w-3.5 h-3.5 text-[#a8a29e]" /></div>
                            <span className="text-body-medium text-[#292524]">{item.label}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {item.status === 'active'
                            ? <span className="inline-flex items-center text-xs px-2 py-0.5 rounded-full" style={{ background: '#dcfce7', color: '#065f46' }}>Actif</span>
                            : <span className="inline-flex items-center text-xs px-2 py-0.5 rounded-full" style={{ background: '#fef3c7', color: '#92400e' }}>En traitement</span>
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {subTitle('BaremeSelect — Vertical (label above)')}
              <p style={{ fontSize: 12, color: '#a8a29e', marginBottom: 12 }}>Popover dropdown with search + "Ajouter le vôtre" at the bottom. Live component below.</p>
              <div className="bg-white rounded-lg border border-[#e7e5e3] p-5 mb-4" style={{ maxWidth: 420 }}>
                {renderBaremePopoverSelect({
                  popoverId: 'uikit-vertical',
                  value: 'gdp_2025_prospective',
                  onChange: () => {},
                  filterType: 'bareme',
                  label: 'Barême utilisé',
                })}
              </div>

              {subTitle('BaremeSelect — Horizontal (inline label)')}
              <p style={{ fontSize: 12, color: '#a8a29e', marginBottom: 12 }}>Same popover, inline layout. Used in param chip bars (PGPF).</p>
              <div className="bg-white rounded-lg border border-[#e7e5e3] p-5 mb-4" style={{ maxWidth: 560 }}>
                <div className="flex items-center gap-3">
                  {renderBaremePopoverSelect({
                    popoverId: 'uikit-horizontal',
                    value: 'gdp_2025_prospective',
                    onChange: () => {},
                    filterType: 'bareme',
                    label: 'Barème',
                    variant: 'horizontal',
                  })}
                  <div className="w-px h-4 bg-[#d6d3d1]" />
                  <span className="text-sm font-medium text-[#78716c] flex-shrink-0">Fin arrérage</span>
                  <select className="text-sm text-[#292524] bg-white border border-[#e7e5e3] rounded-lg px-3 py-1.5" style={{ boxShadow: '0px 1px 2px 0px rgba(26,26,26,0.05)' }}>
                    <option>IPC Annuel</option>
                    <option>IPC Mensuel</option>
                  </select>
                </div>
              </div>

              {subTitle('BaremeTableViewer — Sidepanel preview')}
              <p style={{ fontSize: 12, color: '#a8a29e', marginBottom: 12 }}>Opens as a right-side panel (same pattern as document preview). Table is rendered inside.</p>
              <div className="bg-white rounded-lg border-l-2 border border-[#e7e5e3] overflow-hidden mb-4 shadow-lg" style={{ maxWidth: 600 }}>
                <div className="px-4 py-3 border-b border-[#e7e5e3] flex items-center gap-3">
                  <div className="w-7 h-7 rounded-md bg-[#eeece6] flex items-center justify-center"><Scale className="w-3.5 h-3.5 text-[#a8a29e]" /></div>
                  <span className="text-body-medium text-[#44403c]">ONIAM 2025</span>
                  <span className="inline-flex items-center text-xs px-2 py-0.5 rounded-full" style={{ background: '#dcfce7', color: '#065f46' }}>Actif</span>
                  <div className="flex-1" />
                  <div className="p-1 text-[#a8a29e]"><X className="w-3.5 h-3.5" /></div>
                </div>
                <div className="overflow-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="px-3 py-2 text-left border border-[#e7e5e3]" style={{ background: '#f5f5f4', fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 600, color: '#78716c', textTransform: 'uppercase' }}>Durée</th>
                        {['25 ans', '62 ans', '67 ans'].map((c, i) => (
                          <th key={i} className="px-3 py-2 text-right border border-[#e7e5e3]" style={{ background: '#f5f5f4', fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 600, color: '#78716c', whiteSpace: 'nowrap' }}>{c}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { h: '1', v: ['0.996', '0.996', '0.996'] },
                        { h: '10', v: ['9.589', '9.589', '9.589'] },
                        { h: '30', v: ['26.231', '26.231', '26.231'] },
                        { h: 'Viager', v: ['41.543', '16.891', '13.010'] },
                      ].map((r, ri) => (
                        <tr key={ri} className="hover:bg-[#fafaf9]">
                          <td className="px-3 py-2 border border-[#e7e5e3]" style={{ background: '#f5f5f4', fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, fontWeight: 600, color: '#44403c' }}>{r.h}</td>
                          {r.v.map((val, ci) => (
                            <td key={ci} className={`px-3 py-2 text-right border border-[#e7e5e3]`} style={{
                              fontFamily: "'DM Mono', 'IBM Plex Mono', monospace", fontSize: 12, color: '#292524',
                              background: ri === 2 && ci === 0 ? '#eff6ff' : 'white',
                              ...(ri === 2 && ci === 0 ? { boxShadow: 'inset 0 0 0 2px #3b82f6', borderRadius: 2 } : {})
                            }}>{val}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-4 py-2 border-t border-[#e7e5e3]" style={{ background: '#fafaf9' }}>
                  <span className="text-xs text-[#a8a29e]">↑ Cellule en surbrillance = valeur retenue pour le dossier</span>
                </div>
              </div>

              {subTitle('BaremeUploadForm — States')}
              {row(<>
                {/* Empty form preview */}
                <div className="bg-white rounded-lg border border-[#e7e5e3] p-5" style={{ width: 260 }}>
                  <div className="text-body-medium text-[#292524] mb-3">Formulaire vide</div>
                  <div className="space-y-2.5">
                    <div className="h-9 bg-[#f5f5f4] rounded-lg border border-[#e7e5e3]" />
                    <div className="h-9 bg-[#f5f5f4] rounded-lg border border-[#e7e5e3]" />
                    <div className="h-20 bg-[#f5f5f4] rounded-lg border-2 border-dashed border-[#d6d3d1] flex items-center justify-center">
                      <FileUp className="w-4 h-4 text-[#a8a29e]" />
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <div className="px-3 py-1.5 text-xs text-[#78716c] rounded">Annuler</div>
                      <div className="px-3 py-1.5 text-xs text-white bg-[#e7e5e3] rounded">Soumettre</div>
                    </div>
                  </div>
                </div>
                {/* Post-submit confirmation preview */}
                <div className="bg-white rounded-lg border border-[#e7e5e3] p-5 text-center" style={{ width: 260 }}>
                  <div className="text-body-medium text-[#292524] mb-3">Confirmation</div>
                  <div className="w-10 h-10 rounded-full bg-[#dcfce7] flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-5 h-5 text-[#16a34a]" />
                  </div>
                  <p className="text-body-medium text-[#292524] mb-1">Demande prise en compte</p>
                  <p className="text-xs text-[#78716c]">Activation sous 48h</p>
                </div>
              </>)}
            </div>

          </div>
        </div>
      </div>
    );
  };

  // ========== DIFF ENGINE DOCUMENTATION ==========
  const renderDiffEnginePage = () => {
    const sectionClass = "mb-16";
    const heading = (title) => <h2 style={{ fontSize: 20, fontWeight: 700, color: '#292524', marginBottom: 8 }}>{title}</h2>;
    const prose = (text) => <p style={{ fontSize: 14, lineHeight: '24px', color: '#57534e', marginBottom: 20, maxWidth: 720 }}>{text}</p>;
    const quote = (text) => <blockquote style={{ borderLeft: '3px solid #e7e5e3', paddingLeft: 16, margin: '16px 0 24px', fontSize: 14, lineHeight: '22px', color: '#78716c', fontStyle: 'italic', maxWidth: 720 }}>{text}</blockquote>;
    const sandboxLabel = () => <div style={{ fontSize: 11, fontWeight: 600, color: '#a8a29e', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Sandbox</div>;

    /* ── S1: The Problem Today ── */
    const BeforeAfterToggle = () => {
      const [view, setView] = React.useState('after');
      return (
        <div>
          <div className="flex items-center gap-2 mb-4">
            {['before', 'after'].map(v => (
              <button key={v} onClick={() => setView(v)}
                className="px-3 py-1.5 rounded-md text-caption-medium transition-colors"
                style={{ background: view === v ? '#292524' : '#eeece6', color: view === v ? 'white' : '#78716c' }}
              >{v === 'before' ? 'Before (no feedback)' : 'After (diff system)'}</button>
            ))}
          </div>
          <div className="border border-[#e7e5e3] rounded-lg bg-white overflow-hidden" style={{ maxWidth: 700 }}>
            {view === 'before' ? (
              /* Before: flat row, no indication of what changed — the user sees final values but has zero visibility */
              <div className="flex items-center h-[56px] px-4 gap-4">
                <span className="inline-flex items-center justify-center w-7 h-7 bg-[#DFE8F5] rounded-md"><FileText className="w-4 h-4 text-[#2563eb]" /></span>
                <span className="text-body-medium text-[#292524] flex-1">Hospitalisation jour</span>
                <span className="text-body text-[#78716c]">15/02/2026</span>
                <span className="text-body-medium text-[#44403c]">500 €</span>
              </div>
            ) : (
              /* After: diff-aware row with before/after values, colored strip, accept/reject */
              <div className="group/diff relative flex items-center h-[56px] px-4 gap-4">
                <div className="absolute left-0 top-0 bottom-0 w-1 pointer-events-none" style={{ background: ROW_DIFF_COLORS.edit }} />
                <span className="inline-flex items-center justify-center w-7 h-7 bg-[#DFE8F5] rounded-md"><FileText className="w-4 h-4 text-[#2563eb]" /></span>
                <span className="text-body-medium text-[#292524] flex-1">Hospitalisation jour</span>
                <div className="text-right">
                  <div style={{ fontSize: 12, lineHeight: '16px', color: '#a8a29e', textDecoration: 'line-through' }}>15/01/2026</div>
                  <div className="text-body-medium text-[#292524]">15/02/2026</div>
                </div>
                <div className="text-right">
                  <div style={{ fontSize: 12, lineHeight: '16px', color: '#a8a29e', textDecoration: 'line-through' }}>350 €</div>
                  <div className="text-body-medium text-[#44403c]">500 €</div>
                </div>
                <span className="flex items-center gap-1 opacity-0 group-hover/diff:opacity-100 transition-opacity">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'white', border: '1px solid #d6d3d1', boxShadow: '0 1px 2px rgba(26,26,26,0.05)' }}><Check className="w-3 h-3" style={{ color: '#78716c' }} strokeWidth={2.5} /></span>
                  <span className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'white', border: '1px solid #d6d3d1', boxShadow: '0 1px 2px rgba(26,26,26,0.05)' }}><X className="w-3 h-3" style={{ color: '#78716c' }} strokeWidth={2.5} /></span>
                </span>
              </div>
            )}
          </div>
        </div>
      );
    };

    /* ── S3: Visual System specimens ── */
    const TypoSpecimen = ({ label, size, weight, color, decoration, value }) => (
      <div className="px-4 py-3 rounded-lg border border-[#e7e5e3] bg-white" style={{ minWidth: 160 }}>
        <div className="text-counter text-[#a8a29e] mb-2 uppercase">{label}</div>
        <span style={{ fontSize: size, fontWeight: weight, color, textDecoration: decoration }}>{value}</span>
        <div className="text-counter text-[#d6d3d1] mt-2">{size}px · {weight === 500 ? 'Medium' : 'Regular'} · {color}</div>
      </div>
    );

    /* ── S4: Canvas Table (reuse DiffTableSandbox) ── */

    /* ── S6: Panel States ── */
    const PanelField = ({ label, value, diffColor, oldValue }) => (
      <div className="mb-4">
        <div className="flex items-center gap-1.5 mb-1">
          {diffColor && <div className="w-1.5 h-1.5 flex-shrink-0" style={{ background: diffColor, transform: 'rotate(45deg)' }} />}
          <label style={{ fontSize: 12, fontWeight: 500, color: '#78716c' }}>{label}</label>
        </div>
        <input type="text" readOnly value={value} className="w-full px-3 py-2 rounded-lg border text-body text-[#292524]" style={{ borderColor: diffColor ? diffColor : '#e7e5e3', background: diffColor ? `${diffColor}08` : 'white' }} />
        {oldValue && <div style={{ fontSize: 11, color: '#a8a29e', marginTop: 2 }}>Ancien : {oldValue}</div>}
      </div>
    );

    /* ── S7: Peels (Hypotheses) ── */
    const PeelSandbox = () => {
      const initialPeels = [
        { id: 'p1', label: 'Revaloriser', diffType: 'add', fields: [{ key: 'etat', before: null, after: 'On' }, { key: 'indice', before: null, after: 'IPC Annuel' }], status: 'pending' },
        { id: 'p2', label: 'Capitaliser', diffType: null, fields: [], enabled: true, values: 'IPC Annuel, 62 ans', status: null },
        { id: 'p3', label: 'Revalorisation', diffType: 'edit', fields: [{ key: 'indice', before: 'IPC Mensuel', after: 'IPC Annuel' }], status: 'pending' },
        { id: 'p4', label: 'Capitaliser', diffType: 'delete', fields: [{ key: 'etat', before: 'On', after: 'Off' }], status: 'pending' },
        { id: 'p5', label: 'Param', diffType: null, fields: [], enabled: false, status: null },
      ];
      const [peels, setPeels] = React.useState(initialPeels);
      const reset = () => setPeels(initialPeels);

      const renderPill = (p) => {
        const hasDiff = p.status === 'pending' && !!p.diffType;
        const isAccepted = p.status === 'accepted';
        const isRejected = p.status === 'rejected';
        const resolved = isAccepted || isRejected;

        // Pill scheme: diff add/edit → info (blue ON), diff delete → neutral (gray OFF), no diff → enabled ? info : neutral
        const scheme = hasDiff
          ? (p.diffType === 'delete' ? PILL_SCHEMES.neutral : PILL_SCHEMES.info)
          : (p.enabled !== false ? PILL_SCHEMES.info : PILL_SCHEMES.neutral);

        // Value display
        let valueContent = null;
        if (hasDiff && p.fields.length > 0) {
          const parts = p.fields.map(f => {
            if (f.before && f.after) return <span key={f.key}><span style={{ textDecoration: 'line-through', opacity: 0.6 }}>{f.before}</span> → {f.after}</span>;
            if (f.after) return <span key={f.key}>{f.after}</span>;
            if (f.before) return <span key={f.key} style={{ textDecoration: 'line-through', opacity: 0.6 }}>{f.before}</span>;
            return null;
          }).filter(Boolean);
          valueContent = parts.length > 0 ? parts.reduce((acc, part, i) => i === 0 ? [part] : [...acc, <span key={`sep-${i}`}>, </span>, part], []) : null;
        } else if (p.values) {
          valueContent = <span style={{ fontWeight: 400 }}>{p.values}</span>;
        }

        // Resolved state: determine winning scheme and value
        // Accepted: keep the "after" state (add/edit → info ON, delete → neutral OFF)
        // Rejected: revert to "before" state (add → neutral OFF/gone, edit → info with old value, delete → info ON)
        const resolvedScheme = isAccepted
          ? (p.diffType === 'delete' ? PILL_SCHEMES.neutral : PILL_SCHEMES.info)
          : (p.diffType === 'add' ? PILL_SCHEMES.neutral : PILL_SCHEMES.info);

        // Build the resolved value content (the winning value after accept/reject)
        let resolvedValueContent = null;
        if (resolved) {
          if (isAccepted) {
            // Show the after values (what the agent proposed)
            const parts = p.fields.filter(f => f.after).map(f => <span key={f.key}>{f.after}</span>);
            resolvedValueContent = parts.length > 0 ? parts.reduce((acc, part, i) => i === 0 ? [part] : [...acc, <span key={`sep-${i}`}>, </span>, part], []) : null;
          } else {
            // Rejected: show the before values (reverted state)
            const parts = p.fields.filter(f => f.before).map(f => <span key={f.key}>{f.before}</span>);
            resolvedValueContent = parts.length > 0 ? parts.reduce((acc, part, i) => i === 0 ? [part] : [...acc, <span key={`sep-${i}`}>, </span>, part], []) : null;
          }
        }

        return (
          <span
            key={p.id}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border transition-all"
            style={{
              background: resolved ? resolvedScheme.bg : scheme.bg,
              borderColor: resolved ? resolvedScheme.border : scheme.border,
              color: resolved ? resolvedScheme.text : scheme.text,
            }}
          >
            {hasDiff && !resolved && (
              <span className="w-1.5 h-1.5 flex-shrink-0" style={{ background: DIAMOND_COLORS[p.diffType], transform: 'rotate(45deg)', borderRadius: '0.5px', boxShadow: '0 1px 2px rgba(26,26,26,0.05)' }} />
            )}
            <CircleArrowUp className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{p.label}</span>
            {!resolved && valueContent && <span style={{ fontWeight: 400 }}>{valueContent}</span>}
            {resolved && resolvedValueContent && <span style={{ fontWeight: 400 }}>{resolvedValueContent}</span>}
            {hasDiff && !resolved && (
              <span className="inline-flex items-center gap-1 ml-0.5 flex-shrink-0">
                <span className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-[#ecfdf5] hover:border-[#a5c9b7] transition-colors cursor-pointer" style={{ background: 'white', border: '1px solid #d6d3d1', boxShadow: '0 1px 2px rgba(26,26,26,0.05)' }} onClick={() => setPeels(prev => prev.map(pp => pp.id === p.id ? { ...pp, status: 'accepted' } : pp))}>
                  <Check className="w-3 h-3" style={{ color: '#78716c' }} strokeWidth={2.5} />
                </span>
                <span className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-[#fef2f2] hover:border-[#cf9d9d] transition-colors cursor-pointer" style={{ background: 'white', border: '1px solid #d6d3d1', boxShadow: '0 1px 2px rgba(26,26,26,0.05)' }} onClick={() => setPeels(prev => prev.map(pp => pp.id === p.id ? { ...pp, status: 'rejected' } : pp))}>
                  <X className="w-3 h-3" style={{ color: '#78716c' }} strokeWidth={2.5} />
                </span>
              </span>
            )}
          </span>
        );
      };

      return (
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-caption text-[#78716c]">{peels.filter(p => p.status === 'pending').length} pending · {peels.filter(p => p.status === 'accepted').length} accepted · {peels.filter(p => p.status === 'rejected').length} rejected</span>
            <button onClick={reset} className="flex items-center gap-1.5 text-caption-medium text-[#1e3a8a] hover:text-[#1e40af]"><RotateCcw className="w-3 h-3" /> Reset</button>
          </div>
          {/* In-context: settings row with mixed pill states */}
          <div className="border border-[#e7e5e3] rounded-lg bg-white overflow-hidden mb-4" style={{ boxShadow: '0 1px 2px rgba(26,26,26,0.05)' }}>
            <div className="flex items-center gap-3 px-4 py-3 flex-wrap">
              <div className="w-6 h-6 bg-[#eeece6] rounded-[6px] flex items-center justify-center flex-shrink-0">
                <Settings className="w-3.5 h-3.5 text-[#78716c]" />
              </div>
              {peels.map(p => renderPill(p))}
            </div>
          </div>
        </div>
      );
    };

    /* ── S8: Rejected State ── */
    const RejectedStateSandbox = () => {
      const [step, setStep] = React.useState('pending');
      const reset = () => setStep('pending');
      return (
        <div>
          <div className="flex items-center gap-2 mb-4">
            {['pending', 'rejected', 'clean'].map(s => (
              <div key={s} className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-counter font-bold" style={{ background: step === s ? '#292524' : '#eeece6', color: step === s ? 'white' : '#78716c' }}>{s === 'pending' ? '1' : s === 'rejected' ? '2' : '3'}</div>
                <span className="text-caption" style={{ color: step === s ? '#292524' : '#a8a29e', fontWeight: step === s ? 500 : 400 }}>{s === 'pending' ? 'Pending diff' : s === 'rejected' ? 'Rejected' : 'Clean state'}</span>
              </div>
            ))}
          </div>
          <div className="border border-[#e7e5e3] rounded-lg bg-white overflow-visible" style={{ maxWidth: 600 }}>
            <div className={`relative flex items-center h-[56px] px-4 gap-4 transition-colors ${step === 'rejected' ? 'diff-row-rejected' : ''}`}>
              {step === 'pending' && <div className="absolute left-0 top-0 bottom-0 w-1 pointer-events-none" style={{ background: ROW_DIFF_COLORS.edit }} />}
              <span className="inline-flex items-center justify-center w-7 h-7 bg-[#DFE8F5] rounded-md"><FileText className="w-4 h-4 text-[#2563eb]" /></span>
              <span className="text-body-medium text-[#292524] flex-1">Kinésithérapie</span>
              {step === 'pending' ? (
                <div className="text-right">
                  <div style={{ fontSize: 12, lineHeight: '16px', color: '#a8a29e', textDecoration: 'line-through' }}>960 €</div>
                  <div className="text-body-medium text-[#44403c]">1 280 €</div>
                </div>
              ) : step === 'rejected' ? (
                <div className="text-right">
                  <span className="text-body-medium text-[#292524]">960 €</span>
                </div>
              ) : (
                <span className="text-body-medium text-[#44403c]">960 €</span>
              )}
              {step === 'pending' && (
                <span className="flex items-center gap-1">
                  <button className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-[#ecfdf5]" style={{ background: 'white', border: '1px solid #d6d3d1', boxShadow: '0 1px 2px rgba(26,26,26,0.05)' }}><Check className="w-3 h-3" style={{ color: '#78716c' }} strokeWidth={2.5} /></button>
                  <button onClick={() => setStep('rejected')} className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-[#fef2f2]" style={{ background: 'white', border: '1px solid #d6d3d1', boxShadow: '0 1px 2px rgba(26,26,26,0.05)' }}><X className="w-3 h-3" style={{ color: '#78716c' }} strokeWidth={2.5} /></button>
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            {step === 'rejected' && <button onClick={() => setStep('clean')} className="px-3 py-1.5 rounded-md text-caption-medium bg-[#292524] text-white">Dismiss → Clean state</button>}
            <button onClick={reset} className="px-3 py-1.5 rounded-md text-caption-medium border border-[#e7e5e3] text-[#78716c] hover:bg-[#fafaf9]"><RotateCcw className="w-3 h-3 inline mr-1" />Reset</button>
          </div>
        </div>
      );
    };


    /* ── Surface recap table ── */
    const SurfaceRecap = () => (
      <div className="border border-[#e7e5e3] rounded-lg bg-white overflow-hidden" style={{ maxWidth: 700 }}>
        {[
          { surface: 'Canvas (table)', sees: true, canAccept: true, canEdit: false },
          { surface: 'Chat (artifact card)', sees: true, canAccept: true, canEdit: false },
          { surface: 'Panel', sees: false, canAccept: false, canEdit: true },
        ].map((row, i) => (
          <div key={i} className="flex items-center" style={{ borderBottom: i < 2 ? '1px solid #f0efed' : 'none', padding: '10px 16px' }}>
            <span className="text-body-medium text-[#292524]" style={{ width: 200 }}>{row.surface}</span>
            <span className="flex-1 text-body" style={{ color: row.sees ? ROW_DIFF_COLORS.add : '#a8a29e' }}>{row.sees ? '✓ Sees diff' : '✗ Banner only'}</span>
            <span className="flex-1 text-body" style={{ color: row.canAccept ? ROW_DIFF_COLORS.add : '#a8a29e' }}>{row.canAccept ? '✓ Accept/Reject' : '✗ Save = implicit accept'}</span>
            <span className="flex-1 text-body" style={{ color: row.canEdit ? ROW_DIFF_COLORS.add : '#a8a29e' }}>{row.canEdit ? '✓ Full edit' : '✗ Read-only'}</span>
          </div>
        ))}
      </div>
    );

    return (
      <div className="h-screen flex flex-col" style={{ backgroundColor: '#F8F7F5', fontFamily: "'Inter', system-ui, sans-serif" }}>
        {/* Top bar */}
        <div className="flex items-center h-12 px-6 border-b border-[#e7e5e3] bg-white flex-shrink-0">
          <button onClick={() => setCurrentPage('components')} className="flex items-center gap-2 text-body-medium text-[#78716c] hover:text-[#292524] transition-colors">
            <ChevronRight className="w-4 h-4 rotate-180" /> Back to UI Kit
          </button>
          <div className="ml-4 pl-4 border-l border-[#e7e5e3]">
            <span style={{ fontSize: 14, fontWeight: 600, color: '#292524' }}>Diff Engine</span>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto" style={{ padding: '48px 64px' }}>
          <div style={{ maxWidth: 1100 }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: '#292524', marginBottom: 4, letterSpacing: '-0.5px' }}>Diff Engine</h1>
            <p style={{ fontSize: 16, color: '#78716c', marginBottom: 48 }}>Visualization & validation system for agent modifications</p>

            {/* S1: The Problem Today */}
            <div id="de-problem" className={sectionClass}>
              {heading('The Problem Today')}
              {prose('The current system uses line-level statuses (AI, Done, Pending) to indicate state. The lawyer can\'t see which fields changed, can\'t validate granularly, and loses track when the agent modifies multiple postes in one exchange.')}
              {quote('We replace line statuses (AI / Done / etc.) with a proper diff system.')}
              {sandboxLabel()}
              <BeforeAfterToggle />
            </div>

            {/* S2: The Solution */}
            <div id="de-solution" className={sectionClass}>
              {heading('The Solution: Diff Engine')}
              {prose('The diff engine visualizes and validates agent modifications. It has three roles:')}
              <div className="flex flex-col gap-3 mb-6" style={{ maxWidth: 720 }}>
                {[
                  { n: '1', title: 'Show', desc: 'What changed (addition, modification, deletion) with before/after values' },
                  { n: '2', title: 'Validate', desc: 'Accept or reject at different levels of granularity' },
                  { n: '3', title: 'Stay transparent', desc: 'Only agent actions are tracked — manual edits by the lawyer don\'t go through the diff system' },
                ].map(item => (
                  <div key={item.n} className="flex items-start gap-3 p-4 rounded-lg border border-[#e7e5e3] bg-white">
                    <span className="w-6 h-6 rounded-full bg-[#292524] text-white text-caption-medium flex items-center justify-center flex-shrink-0">{item.n}</span>
                    <div><span className="text-body-medium text-[#292524]">{item.title}.</span> <span className="text-body text-[#57534e]">{item.desc}</span></div>
                  </div>
                ))}
              </div>
              {quote('The diff is a trust mechanism for agent actions, not a generic change tracker. What the agent does needs to be reviewed. What the lawyer does manually is intentional.')}
              <div className="text-caption-medium text-[#78716c] mb-3 mt-6 uppercase" style={{ letterSpacing: '0.05em' }}>Diff surfaces</div>
              <SurfaceRecap />
            </div>

            {/* S3: Visual System */}
            <div id="de-visual" className={sectionClass}>
              {heading('Visual System — Typography & Color')}
              {prose('The diff relies on typography hierarchy to separate old vs new values, not color on text. Color lives only in structural markers (left border, status tags).')}
              {sandboxLabel()}
              <div className="flex flex-wrap gap-3 mb-8">
                <TypoSpecimen label="Old value (before)" size={12} weight={400} color="#a8a29e" decoration="line-through" value="960 €" />
                <TypoSpecimen label="New value (after)" size={14} weight={500} color="#292524" decoration="none" value="1 280 €" />
                <TypoSpecimen label="Added value" size={14} weight={500} color="#292524" decoration="none" value="4 500 €" />
                <TypoSpecimen label="Deleted value" size={14} weight={400} color="#a8a29e" decoration="line-through" value="55 €" />
              </div>
              <div className="text-caption-medium text-[#78716c] mb-3 uppercase" style={{ letterSpacing: '0.05em' }}>Row-level color system</div>
              <div className="border border-[#e7e5e3] rounded-lg bg-white overflow-hidden" style={{ maxWidth: 400 }}>
                {[
                  { type: 'add', label: 'Ajout', color: ROW_DIFF_COLORS.add },
                  { type: 'edit', label: 'Modif.', color: ROW_DIFF_COLORS.edit },
                  { type: 'delete', label: 'Suppr.', color: ROW_DIFF_COLORS.delete },
                  { type: null, label: 'No diff', color: null },
                ].map((r, i) => (
                  <div key={i} className="relative flex items-center h-10 px-4" style={{ borderBottom: i < 3 ? '1px solid #f0efed' : 'none' }}>
                    {r.color && <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: r.color }} />}
                    <span className="text-body text-[#292524] flex-1">{r.type ? r.label : '—'}</span>
                    {r.color && <span className="text-counter px-1.5 py-0.5 rounded" style={{ background: r.color + '18', color: r.color, fontWeight: 600 }}>{r.label.toUpperCase()}</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Chat (Artifact Cards) */}
            <div id="de-chat" className={sectionClass}>
              {heading('Chat (Artifact Cards)')}
              {prose('The agent displays an artifact card recap in the chat after each action. Cards list added, modified, and deleted postes with per-line detail. Actions: accept all, reject all, or accept/reject line by line.')}
              {sandboxLabel()}
              <SharedInteractiveCards />
            </div>

            {/* S4: Canvas (Poste Table) */}
            <div id="de-canvas" className={sectionClass}>
              {heading('Canvas (Poste Table)')}
              {prose('The table is the primary diff visualization surface. Row-level markers (colored left border + status tag) indicate the diff type. Cell-level stacked values show before/after. Accept/reject buttons appear on hover, overlapping the table edge.')}
              {sandboxLabel()}
              <SharedDiffTableSandbox />
            </div>

            {/* S6: Panel (Manual Editing) */}
            {/* S7: Hypotheses & Parameters (Peels) */}
            <div id="de-peels" className={sectionClass}>
              {heading('Hypotheses & Poste Parameters')}
              {prose('The diff engine also applies to hypotheses and parameters (revalorization, capitalization, rates). Displayed as pills with embedded accept/reject. Each parameter validates independently.')}
              {sandboxLabel()}
              <PeelSandbox />
            </div>

            {/* S8: Rejected State */}
            <div id="de-rejected" className={sectionClass}>
              {heading('Rejected State')}
              {prose('When a value is rejected, it doesn\'t disappear. The stored value reverts to the previous state. The row shows a brief red flash, then displays the original value in default style.')}
              {sandboxLabel()}
              <RejectedStateSandbox />
            </div>

            {/* S9: Bulk Actions */}
            <div id="de-bulk" className={sectionClass}>
              {heading('Bulk Actions → Card Resolution')}
              {prose('Once all lines in an artifact card are treated (accept all, reject all, or one by one), the card reflects a resolved state. Three variants: all approved (green), all rejected (grey), mixed.')}
              {sandboxLabel()}
              <div className="flex gap-4 flex-wrap">
                <div style={{ flex: 1, minWidth: 300 }}>
                  <div className="text-caption-medium text-[#a8a29e] mb-2 uppercase">All approved</div>
                  <SharedInteractiveCards
                    initialDiffs={[
                      { id: 'ba-1', entityLabel: 'Hospitalisation CHU', type: 'add', fields: [{ label: 'Montant', after: '4 500 €' }], approved: true },
                      { id: 'ba-2', entityLabel: 'Kinésithérapie', type: 'edit', fields: [{ label: 'Montant', before: '960 €', after: '1 280 €' }], approved: true },
                    ]}
                    cardDefs={[{ id: 'bulk-approved', title: 'DSA — Batch 1', Icon: HeartPulse, diffIds: ['ba-1', 'ba-2'] }]}
                  />
                </div>
                <div style={{ flex: 1, minWidth: 300 }}>
                  <div className="text-caption-medium text-[#a8a29e] mb-2 uppercase">All rejected</div>
                  <SharedInteractiveCards
                    initialDiffs={[
                      { id: 'br-1', entityLabel: 'Hospitalisation CHU', type: 'add', fields: [{ label: 'Montant', after: '4 500 €' }], rejected: true },
                      { id: 'br-2', entityLabel: 'Consultation doublon', type: 'delete', fields: [{ label: 'Montant', before: '55 €' }], rejected: true },
                    ]}
                    cardDefs={[{ id: 'bulk-rejected', title: 'DSA — Batch 2', Icon: HeartPulse, diffIds: ['br-1', 'br-2'] }]}
                  />
                </div>
                <div style={{ flex: 1, minWidth: 300 }}>
                  <div className="text-caption-medium text-[#a8a29e] mb-2 uppercase">Mixed</div>
                  <SharedInteractiveCards
                    initialDiffs={[
                      { id: 'bm-1', entityLabel: 'Hospitalisation CHU', type: 'add', fields: [{ label: 'Montant', after: '4 500 €' }], approved: true },
                      { id: 'bm-2', entityLabel: 'Kinésithérapie', type: 'edit', fields: [{ label: 'Montant', before: '960 €', after: '1 280 €' }], rejected: true },
                      { id: 'bm-3', entityLabel: 'Consultation', type: 'edit', fields: [{ label: 'Date', before: '04/06', after: '05/06' }], approved: true },
                    ]}
                    cardDefs={[{ id: 'bulk-mixed', title: 'DSA — Batch 3', Icon: HeartPulse, diffIds: ['bm-1', 'bm-2', 'bm-3'] }]}
                  />
                </div>
              </div>
            </div>

            {/* What we don't build */}
            <div id="de-exclusions" className={sectionClass}>
              {heading('What We Don\'t Build')}
              <div className="flex flex-col gap-2" style={{ maxWidth: 720 }}>
                {[
                  'Line statuses AI / Done / Pending → replaced by the diff system',
                  'No diff visuals inside the panel',
                  'No separate review mode vs edit mode',
                  'No per-field accept/reject inside the panel',
                  'No read-only panel state for deleted lines',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-body text-[#78716c]">
                    <X className="w-3.5 h-3.5 text-[#a8a29e]" strokeWidth={2} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Panel (Manual Editing) — last section */}
            <div id="de-panel" className="mb-8">
              {heading('Panel (Manual Editing)')}
              {prose('The panel is NOT part of the diff system. It always shows the latest version. A subtle banner indicates "Modified by assistant" when a diff is pending. Edit + save = implicit accept. Deleted lines cannot be opened in the panel.')}
              {sandboxLabel()}
              <div className="flex gap-6 flex-wrap">
                <div className="rounded-lg border border-[#e7e5e3] bg-white p-5" style={{ width: 280 }}>
                  <div className="text-caption-medium text-[#a8a29e] mb-3 uppercase">Normal</div>
                  <PanelField label="Libellé" value="Hospitalisation jour" />
                  <PanelField label="Date" value="15/02/2026" />
                  <PanelField label="Montant" value="500 €" />
                </div>
                <div className="rounded-lg border border-[#e7e5e3] bg-white p-5" style={{ width: 280 }}>
                  <div className="text-caption-medium text-[#a8a29e] mb-3 uppercase">Pending diff</div>
                  <div className="rounded-lg p-3 mb-4 flex items-center gap-2" style={{ background: `${ROW_DIFF_COLORS.edit}10`, border: `1px solid ${ROW_DIFF_COLORS.edit}30` }}>
                    <div className="w-1.5 h-1.5 flex-shrink-0" style={{ background: ROW_DIFF_COLORS.edit, transform: 'rotate(45deg)' }} />
                    <span style={{ fontSize: 12, fontWeight: 500, color: ROW_DIFF_COLORS.edit }}>Modifié par l'assistant</span>
                  </div>
                  <PanelField label="Libellé" value="Hospitalisation jour" />
                  <PanelField label="Montant" value="1 280 €" diffColor={ROW_DIFF_COLORS.edit} oldValue="960 €" />
                  <PanelField label="Date" value="05/06/2022" diffColor={ROW_DIFF_COLORS.edit} oldValue="04/06/2022" />
                </div>
                <div className="rounded-lg border border-[#e7e5e3] bg-white p-5 flex flex-col items-center justify-center" style={{ width: 280, minHeight: 240 }}>
                  <div className="text-caption-medium text-[#a8a29e] mb-3 uppercase">Deleted line</div>
                  <div className="w-10 h-10 rounded-full bg-[#fef2f2] flex items-center justify-center mb-3">
                    <Trash2 className="w-4 h-4" style={{ color: ROW_DIFF_COLORS.delete }} />
                  </div>
                  <span className="text-body text-[#78716c] text-center">Cette ligne a été supprimée par l'agent.</span>
                  <span className="text-caption text-[#a8a29e] mt-1">Restaurez ou confirmez depuis le tableau.</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  };

  // ========== BARÈME POPOVER SELECT ==========
  const renderBaremePopoverSelect = ({ popoverId, value, onChange, filterType, label, variant = 'vertical' }) => {
    const isOpen = baremePopover === popoverId;
    const filteredBaremes = baremesLibrary
      .filter(b => b.status === 'active' && (filterType ? b.type === filterType : true))
      .filter(b => !baremePopoverSearch || b.label.toLowerCase().includes(baremePopoverSearch.toLowerCase()));
    const selectedBareme = baremesLibrary.find(b => b.id === value);

    const triggerBtn = (
      <button
        data-bareme-popover={popoverId}
        onClick={() => { setBaremePopover(isOpen ? null : popoverId); setBaremePopoverSearch(''); }}
        className={`flex items-center justify-between bg-white border border-[#e7e5e3] transition-colors hover:border-[#d6d3d1] ${
          variant === 'horizontal' ? 'text-sm px-3 py-2' : 'w-full px-3 py-2 text-[14px]'
        } text-[#292524]`}
        style={{ borderRadius: 8, boxShadow: '0px 1px 2px 0px rgba(26,26,26,0.05)' }}
      >
        <span className={`overflow-hidden text-ellipsis whitespace-nowrap ${selectedBareme ? 'text-[#292524]' : 'text-[#78716c]'}`}>{selectedBareme ? selectedBareme.label : 'Sélectionner…'}</span>
        <ChevronDown className="w-4 h-4 text-[#78716c] ml-2 flex-shrink-0" />
      </button>
    );

    const popoverContent = isOpen && (
      <div data-bareme-popover={popoverId} className="absolute z-40 mt-1 bg-white border border-[#e7e5e3] overflow-hidden" style={{ borderRadius: 8, width: variant === 'horizontal' ? 287 : '100%', animation: 'fadeIn 0.1s ease-out', boxShadow: '0px 2px 4px -2px rgba(26,26,26,0.05), 0px 4px 6px -1px rgba(26,26,26,0.05)' }}>
        {/* Command Search */}
        <button className="w-full flex items-center gap-0 px-3 py-3 border-b border-[#e7e5e3] cursor-text" onClick={() => {}}>
          <div className="pr-2 flex-shrink-0"><Search className="w-4 h-4 text-[#78716c]" /></div>
          <input
            type="text"
            value={baremePopoverSearch}
            onChange={(e) => setBaremePopoverSearch(e.target.value)}
            placeholder="Rechercher.."
            className="w-full bg-transparent text-sm text-[#292524] placeholder:text-[#78716c] outline-none"
            autoFocus
          />
        </button>
        {/* Options */}
        <div className="max-h-[200px] overflow-y-auto p-1">
          <div className="p-1">
            {filteredBaremes.length > 0 ? filteredBaremes.map(b => (
              <button
                key={b.id}
                onClick={() => { onChange(b.id); setBaremePopover(null); setBaremePopoverSearch(''); }}
                className={`w-full text-left px-2 py-1.5 text-sm transition-colors flex items-center justify-between gap-2 ${
                  b.id === value ? 'font-medium text-[#292524]' : 'text-[#78716c] hover:bg-[#f8f7f5]'
                }`}
                style={{ borderRadius: 6, background: b.id === value ? '#f8f7f5' : undefined }}
              >
                {b.label}
                {b.id === value && <Check className="w-4 h-4 text-[#292524] flex-shrink-0" />}
              </button>
            )) : (
              <div className="px-2 py-4 text-center text-sm text-[#78716c]">Aucun résultat</div>
            )}
          </div>
        </div>
        {/* Ajouter footer */}
        <div className="border-t border-[#e7e5e3] px-3 py-3">
          <button
            onClick={() => { setBaremePopover(null); setBaremePopoverSearch(''); setBaremeUploadFormOpen(true); setBaremeUploadData({ nom: '', type: filterType || 'bareme', notes: '', fileName: '' }); }}
            className="w-full text-left text-xs flex items-center gap-1.5"
          >
            <CirclePlus className="w-4 h-4 text-[#78716c] flex-shrink-0" style={{ opacity: 0.5 }} />
            <span className="text-[#78716c]" style={{ letterSpacing: '0.12px' }}>Barême introuvable ?</span>
            <span className="font-medium text-[#1e3a8a]">Ajouter le vôtre</span>
          </button>
        </div>
      </div>
    );

    if (variant === 'horizontal') {
      return (
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-sm font-medium text-[#78716c]">{label}</span>
              {value && (
                <button onClick={() => setBaremeViewerOpen(value)} className="text-xs font-normal text-[#1e3a8a] hover:underline transition-colors">
                  Voir
                </button>
              )}
            </div>
            {triggerBtn}
          </div>
          {popoverContent}
        </div>
      );
    }

    return (
      <div className="relative">
        <label className="block text-[14px] font-medium text-[#292524] mb-1.5">{label}</label>
        {triggerBtn}
        {value && (
          <button onClick={() => setBaremeViewerOpen(value)} className="mt-1.5 text-xs font-medium text-[#1e3a8a] hover:underline transition-colors">
            Voir le barême
          </button>
        )}
        {popoverContent}
      </div>
    );
  };

  // ========== BARÈME TABLE VIEWER (sidepanel — adapted from doc preview) ==========
  const renderBaremeViewer = () => {
    const bareme = baremesLibrary.find(b => b.id === baremeViewerOpen);
    if (!bareme) return null;
    return (
      <div className="fixed right-0 top-0 h-screen bg-white border-l border-[#e7e5e3] shadow-xl z-30 flex flex-col" style={{ width: '860px', animation: 'slideInRight 0.2s ease-out' }}>
        {/* Header — matches doc preview pattern */}
        <div className="px-4 border-b border-[#e7e5e3] flex items-center justify-between flex-shrink-0 bg-white" style={{ paddingTop: 14, paddingBottom: 14 }}>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-[22px] h-[22px] rounded-[6px] bg-[#eeece6] flex items-center justify-center flex-shrink-0">
              <Scale className="w-3 h-3 text-[#78716c]" />
            </div>
            <span className="text-[14px] font-medium text-black truncate">{bareme.label}</span>
            {bareme.status === 'active' ? (
              <span className="inline-flex items-center text-xs font-medium px-2 py-1 rounded-[6px] flex-shrink-0" style={{ background: '#dcfce7', color: '#065f46' }}>Actif</span>
            ) : (
              <span className="inline-flex items-center text-xs font-medium px-2 py-1 rounded-[6px] flex-shrink-0" style={{ background: '#fef3c7', color: '#92400e' }}>En traitement</span>
            )}
          </div>
          <button onClick={() => setBaremeViewerOpen(null)} className="w-4 h-4 flex items-center justify-center flex-shrink-0 ml-3 text-[#78716c] hover:text-[#292524] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content — full width, no padding, table fills panel */}
        {bareme.status === 'active' && bareme.tableData ? (
          <div className="flex-1 overflow-auto">
              <div className="overflow-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="sticky top-0 left-0 z-20 px-3 py-2.5 text-left border-b border-r border-[#e7e5e3]" style={{ background: '#f5f5f4', fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 600, color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.05em', minWidth: 80 }}>
                        Durée
                      </th>
                      {bareme.tableData.columns.map((col, i) => (
                        <th key={i} className="sticky top-0 z-10 px-3 py-2.5 text-right border-b border-r border-[#e7e5e3] last:border-r-0" style={{ background: '#f5f5f4', fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 600, color: '#78716c', whiteSpace: 'nowrap', minWidth: 72 }}>
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {bareme.tableData.rows.map((row, ri) => (
                      <tr key={ri} className="hover:bg-[#fafaf9] transition-colors">
                        <td className="sticky left-0 z-10 px-3 py-2 border-b border-r border-[#e7e5e3]" style={{ background: '#f5f5f4', fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, fontWeight: 600, color: '#44403c' }}>
                          {row.header}
                        </td>
                        {row.values.map((val, ci) => (
                          <td key={ci} className="px-3 py-2 text-right border-b border-r border-[#e7e5e3] last:border-r-0" style={{ fontFamily: "'DM Mono', 'IBM Plex Mono', monospace", fontSize: 12, color: '#292524', background: 'white' }}>
                            {typeof val === 'number' ? val.toFixed(3) : val}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: '#f8f7f5' }}>
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-[#d6d3d1] mx-auto mb-3 animate-spin" />
              <p className="text-body text-[#78716c]">Ce barème est en cours de modélisation.</p>
              <p className="text-caption text-[#a8a29e] mt-1">Il sera disponible sous 48h.</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ========== BARÈME UPLOAD FORM MODAL ==========
  const renderBaremeUploadModal = () => {
    if (!baremeUploadFormOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={() => { setBaremeUploadFormOpen(false); setBaremeUploadData({ nom: '', type: 'bareme', notes: '', fileName: '' }); }}>
        <div className="bg-white rounded-xl shadow-2xl" style={{ width: 520 }} onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#e7e5e3]">
            <h2 style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: '18px', fontWeight: 400, color: '#18181b' }}>Ajouter un barème</h2>
            <button onClick={() => { setBaremeUploadFormOpen(false); setBaremeUploadData({ nom: '', type: 'bareme', notes: '', fileName: '' }); }} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#eeece6] transition-colors">
              <X className="w-4 h-4 text-[#78716c]" />
            </button>
          </div>

            {/* Form */}
            <div className="px-6 py-5 space-y-4">
              {/* Nom */}
              <div>
                <label className="block text-[14px] font-medium text-[#78716c] mb-2">Nom du barème <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={baremeUploadData.nom}
                  onChange={(e) => setBaremeUploadData(prev => ({ ...prev, nom: e.target.value }))}
                  placeholder="Ex: GDP 2026, Mornet révisé…"
                  className="w-full h-10 px-3 text-[14px] text-[#292524] bg-white border border-[#e7e5e3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#292524]"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-[14px] font-medium text-[#78716c] mb-2">Type</label>
                <select
                  value={baremeUploadData.type}
                  onChange={(e) => setBaremeUploadData(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full h-10 px-3 text-[14px] text-[#292524] bg-white border border-[#e7e5e3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#292524]"
                >
                  <option value="bareme">Barème</option>
                  <option value="referentiel">Référentiel</option>
                </select>
              </div>

              {/* File upload zone */}
              <div>
                <label className="block text-[14px] font-medium text-[#78716c] mb-2">Document de référence <span className="text-red-400">*</span></label>
                <div
                  className="border-2 border-dashed border-[#d6d3d1] rounded-lg p-6 text-center hover:border-[#a8a29e] transition-colors cursor-pointer"
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = '.pdf,.xlsx,.xls,.png,.jpg,.jpeg';
                    input.onchange = (e) => {
                      if (e.target.files[0]) {
                        setBaremeUploadData(prev => ({ ...prev, fileName: e.target.files[0].name }));
                      }
                    };
                    input.click();
                  }}
                >
                  {baremeUploadData.fileName ? (
                    <div className="flex items-center justify-center gap-2">
                      <FileText className="w-5 h-5 text-[#292524]" />
                      <span className="text-body-medium text-[#292524]">{baremeUploadData.fileName}</span>
                      <button onClick={(e) => { e.stopPropagation(); setBaremeUploadData(prev => ({ ...prev, fileName: '' })); }} className="ml-2 p-1 rounded hover:bg-[#eeece6]">
                        <X className="w-3 h-3 text-[#78716c]" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <FileUp className="w-6 h-6 text-[#a8a29e] mx-auto mb-2" />
                      <p className="text-body text-[#78716c]">Glissez votre fichier ici ou <span className="text-[#292524] font-medium underline">parcourir</span></p>
                      <p className="text-caption text-[#a8a29e] mt-1">PDF, Excel, image</p>
                    </>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[14px] font-medium text-[#78716c] mb-2">Notes</label>
                <textarea
                  value={baremeUploadData.notes}
                  onChange={(e) => setBaremeUploadData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Précisions sur le barème, source, contexte d'utilisation…"
                  rows={3}
                  className="w-full px-3 py-2.5 text-[14px] text-[#292524] bg-white border border-[#e7e5e3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#292524] resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => { setBaremeUploadFormOpen(false); setBaremeUploadData({ nom: '', type: 'bareme', notes: '', fileName: '' }); }}
                  className="px-4 py-2.5 text-body-medium text-[#78716c] rounded-lg hover:bg-[#eeece6] transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    if (!baremeUploadData.nom || !baremeUploadData.fileName) return;
                    const newBareme = {
                      id: baremeUploadData.nom.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, ''),
                      label: baremeUploadData.nom,
                      type: baremeUploadData.type,
                      status: 'processing',
                      source: 'imported',
                      tableData: null,
                      uploadedFileName: baremeUploadData.fileName,
                      notes: baremeUploadData.notes,
                    };
                    setBaremesLibrary(prev => [...prev, newBareme]);
                    setBaremeUploadFormOpen(false);
                    setBaremeUploadData({ nom: '', type: 'bareme', notes: '', fileName: '' });
                    setToastMessage('Demande prise en compte — votre barème sera activé sous 48h.');
                    setTimeout(() => setToastMessage(null), 5000);
                  }}
                  disabled={!baremeUploadData.nom || !baremeUploadData.fileName}
                  className={`px-5 py-2.5 text-body-medium rounded-lg transition-colors ${
                    baremeUploadData.nom && baremeUploadData.fileName
                      ? 'bg-[#292524] text-white hover:bg-[#44403c]'
                      : 'bg-[#e7e5e3] text-[#a8a29e] cursor-not-allowed'
                  }`}
                >
                  Soumettre
                </button>
              </div>
            </div>
        </div>
      </div>
    );
  };

  // ========== RENDER IV TABLE STRUCTURES PAGE ==========
  const renderIvStructuresPage = () => {
    const prose = (text) => <p style={{ fontSize: 14, color: '#44403c', lineHeight: '24px', maxWidth: 680, marginBottom: 16 }}>{text}</p>;
    const codeInline = (text) => <code style={{ fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", backgroundColor: '#f5f5f4', padding: '2px 6px', borderRadius: 4, color: '#292524' }}>{text}</code>;
    const badge = (text, color) => <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ backgroundColor: color === 'amber' ? '#fef3c7' : color === 'blue' ? '#dbeafe' : color === 'green' ? '#dcfce7' : '#f5f5f4', color: color === 'amber' ? '#92400e' : color === 'blue' ? '#1e40af' : color === 'green' ? '#166534' : '#44403c' }}>{text}</span>;

    // Sample data for live tables
    const demoVis = [
      { id: 'vi-1', nom: 'Dupont', prenom: 'Marie', sexe: 'Femme', lien: 'Épouse' },
      { id: 'vi-2', nom: 'Dupont', prenom: 'Lucas', sexe: 'Homme', lien: 'Enfant' },
      { id: 'vi-3', nom: 'Dupont', prenom: 'Emma', sexe: 'Femme', lien: 'Enfant' },
    ];
    const demoViInitials = (vi) => `${(vi.prenom || '')[0] || ''}${(vi.nom || '')[0] || ''}`.toUpperCase();

    // Type A data
    const demoTypeA = [
      { victimeId: 'vi-1', montant: 25000, pieceIds: ['p-1'] },
      { victimeId: 'vi-2', montant: 15000, pieceIds: [] },
      { victimeId: 'vi-3', montant: 15000, pieceIds: [] },
    ];

    // Type B data
    const demoTypeB = [
      { id: 'fdp-1', victimeId: 'vi-1', montant: 1200, pieceIds: ['p-1'], intitule: 'Déplacements hôpital (48 trajets)' },
      { id: 'fdp-2', victimeId: 'vi-1', montant: 2800, pieceIds: ['p-2'], intitule: 'Hébergement proche hôpital' },
      { id: 'fdp-3', victimeId: 'vi-1', montant: 450, pieceIds: [], intitule: 'Repas sur place' },
      { id: 'fdp-4', victimeId: 'vi-2', montant: 600, pieceIds: [], intitule: 'Déplacements' },
    ];

    // Type C data
    const demoTypeC = [
      { id: 'fo-1', label: 'Cercueil et préparation', totalAmount: 3200, pieceIds: ['p-7'], attributions: [{ viId: 'vi-1', amount: 1600 }, { viId: 'vi-3', amount: 1600 }] },
      { id: 'fo-2', label: 'Cérémonie religieuse', totalAmount: 800, pieceIds: [], attributions: [{ viId: 'vi-1', amount: 800 }] },
      { id: 'fo-3', label: 'Concession funéraire', totalAmount: 2100, pieceIds: [], attributions: [{ viId: 'vi-1', amount: 714 }, { viId: 'vi-2', amount: 693 }, { viId: 'vi-3', amount: 693 }] },
    ];
    const demoViTotalsC = {};
    demoVis.forEach(vi => { demoViTotalsC[vi.id] = 0; });
    demoTypeC.forEach(l => (l.attributions || []).forEach(a => { demoViTotalsC[a.viId] = (demoViTotalsC[a.viId] || 0) + a.amount; }));
    const demoGrandTotalC = demoTypeC.reduce((s, l) => s + (l.totalAmount || 0), 0);

    // Type D (PRP) data
    const demoRevenuRefLignes = [
      { id: 'prp-rev-1', source: 'Bulletin de salaire Déc 2022', periode: 'Déc 2022', netMensuel: 4000, pieceIds: [] },
      { id: 'prp-rev-2', source: 'Avis d\'imposition 2022', periode: '2022', netMensuel: 4000, pieceIds: ['p-3'] },
    ];
    const demoRevenuRefMoyen = 4000;
    const demoPerteAnnuelle = 36000;
    const demoPrpLignes = [
      { victimeId: 'vi-1', partIndividuelle: 50, dureeIndemnisation: 'Viager', anneesEchues: 3, mode: 'capitalisation', coeffCapitalisation: 20 },
      { victimeId: 'vi-2', partIndividuelle: 25, dureeIndemnisation: "Jusqu'à 25 ans (7 ans)", anneesEchues: 3, mode: 'capitalisation', coeffCapitalisation: 6.5 },
      { victimeId: 'vi-3', partIndividuelle: 25, dureeIndemnisation: "Jusqu'à 25 ans (12 ans)", anneesEchues: 3, mode: 'capitalisation', coeffCapitalisation: 10 },
    ];
    const demoComputeLine = (l) => {
      const part = l.partIndividuelle || 0;
      const perteVI = demoPerteAnnuelle * (part / 100);
      const anneesEchues = l.anneesEchues || 0;
      const echu = perteVI * anneesEchues;
      const coeff = l.coeffCapitalisation || 0;
      const mode = l.mode || 'capitalisation';
      const aEchoir = mode === 'capitalisation' ? perteVI * coeff : 0;
      const total = mode === 'capitalisation' ? echu + aEchoir : echu;
      return { perteVI, echu, aEchoir, total, mode, coeff, anneesEchues };
    };

    // Doc badge helper
    const docBadge = (pieceIds) => (
      <div className="w-[52px] flex items-center justify-center flex-shrink-0 pl-3">
        {pieceIds?.length > 0 ? (
          <span className="inline-flex items-center justify-center w-7 h-7 bg-[#DFE8F5] rounded-md relative">
            <FileText className="w-4 h-4 text-[#2563eb]" />
            {pieceIds.length > 1 && <span className="absolute -top-1.5 left-[18px] min-w-[16px] h-4 bg-[#1e3a8a] text-white text-counter font-medium rounded-full flex items-center justify-center border-2 border-white px-0.5">{pieceIds.length}</span>}
          </span>
        ) : (
          <span className="inline-flex items-center justify-center w-7 h-7 bg-[#F8F7F5] rounded-md border border-dashed border-[#e7e5e3]">
            <FileText className="w-3.5 h-3.5 text-[#d6d3d1]" />
          </span>
        )}
      </div>
    );

    // Use existing expandedCards state for demo collapse — keys prefixed with 'uikit-'
    const isDemoExpanded = (key) => expandedCards[`uikit-${key}`] !== false;
    const toggleDemoExpanded = (key) => setExpandedCards(prev => ({ ...prev, [`uikit-${key}`]: prev[`uikit-${key}`] === false ? true : false }));

    return (
      <div className="h-screen flex" style={{ backgroundColor: '#F8F7F5', fontFamily: "'Inter', system-ui, sans-serif" }}>
        {/* Sidebar */}
        <div className="w-[220px] flex-shrink-0 border-r border-[#e7e5e3] bg-white overflow-y-auto" style={{ padding: '20px 16px' }}>
          <button onClick={() => setCurrentPage('components')} className="flex items-center gap-2 text-body-medium text-[#78716c] hover:text-[#292524] mb-6 transition-colors">
            <ChevronRight className="w-4 h-4 rotate-180" /> Retour
          </button>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#292524', marginBottom: 16 }}>IV Table Structures</div>
          <nav className="flex flex-col gap-1">
            {['Vue d\'ensemble', 'Type A — Simple', 'Type B — Groupé', 'Type C — Frais partagés', 'Type D — Foyer (PRP)', 'Scénarios PRP', 'Adaptation IA'].map(s => (
              <a key={s} href={`#iv-${s.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} className="text-body text-[#78716c] hover:text-[#292524] hover:bg-[#fafaf9] px-2 py-1.5 rounded transition-colors">{s}</a>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto" style={{ padding: '32px 48px' }}>
          <div>
            <h1 style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 28, fontWeight: 400, color: '#18181b', marginBottom: 4 }}>Victimes indirectes — Table Structures</h1>
            <p style={{ fontSize: 14, color: '#78716c', marginBottom: 40 }}>Architecture des 4 types de tables IV, modes d'affichage, scénarios PRP, et logique d'adaptation IA.</p>

            {/* ====== VUE D'ENSEMBLE ====== */}
            <div id="iv-vue-d-ensemble" className="mb-12">
              <h2 style={{ fontSize: 20, fontWeight: 600, color: '#292524', marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid #e7e5e3' }}>Vue d'ensemble</h2>
              {prose('Les postes de victimes indirectes utilisent 4 structures de table, chacune adaptée à un type de données. La structure est définie par IV_POSTE_CONFIG et détermine le rendu, les colonnes, et les interactions.')}
              <div className={cardBlockClass + ' mb-6'} style={{ maxWidth: 680 }}>
                <div className="flex items-center h-10 border-b border-[#e7e5e3]" style={{ backgroundColor: '#fafaf9' }}>
                  <div className="flex-1 px-3"><span style={colHeaderStyle}>Type</span></div>
                  <div className="w-[200px] px-3"><span style={colHeaderStyle}>Structure</span></div>
                  <div className="w-[160px] px-3"><span style={colHeaderStyle}>Postes</span></div>
                </div>
                {[
                  { type: 'A — Simple', desc: '1 ligne par VI, montant direct', codes: ['pai', 'pafv', 'pepe'] },
                  { type: 'B — Groupé', desc: 'Lignes groupées par VI', codes: ['fdp'] },
                  { type: 'C — Frais partagés', desc: 'Dépenses communes, réparties', codes: ['fo'] },
                  { type: 'D — Foyer (PRP)', desc: 'Revenu → perte → répartition', codes: ['prp'] },
                ].map((row, idx) => (
                  <div key={idx} className="flex items-center h-[52px] border-b border-[#e7e5e3] last:border-b-0 bg-white">
                    <div className="flex-1 px-3"><span style={{ fontSize: 14, fontWeight: 500, color: '#292524' }}>{row.type}</span></div>
                    <div className="w-[200px] px-3"><span style={{ fontSize: 13, color: '#44403c' }}>{row.desc}</span></div>
                    <div className="w-[160px] px-3 flex gap-1">{row.codes.map(c => <span key={c}>{codeInline(c)}</span>)}</div>
                  </div>
                ))}
              </div>
              {prose('Toutes les tables utilisent le même cardBlockClass (blanc, border-radius, shadow), les mêmes hauteurs de ligne (52px data, 44px sub-rows, 40px headers), et la même palette de couleurs.')}
            </div>

            {/* ====== TYPE A — LIVE TABLE ====== */}
            <div id="iv-type-a---simple" className="mb-12">
              <h2 style={{ fontSize: 20, fontWeight: 600, color: '#292524', marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid #e7e5e3' }}>Type A — Simple</h2>
              {prose('Une ligne par victime indirecte. Le montant est saisi individuellement. Utilisé pour les postes où chaque VI a une indemnisation distincte (PAI, PAFV, PEPE).')}

              <div className={cardBlockClass} style={{ maxWidth: 680 }}>
                {/* Column headers */}
                <div className="flex items-center h-10 border-b border-[#e7e5e3]" style={{ backgroundColor: '#fafaf9' }}>
                  <div className="flex-1 px-3"><span style={colHeaderStyle}>Victime</span></div>
                  <div className="w-[130px] px-3 text-right"><span style={colHeaderStyle}>Montant</span></div>
                  <div className="w-10" />
                </div>
                {/* Data rows */}
                {demoVis.map((vi) => {
                  const ligne = demoTypeA.find(l => l.victimeId === vi.id);
                  const montant = ligne?.montant || 0;
                  return (
                    <div key={vi.id} className="relative flex items-center h-[52px] border-b border-[#e7e5e3] last:border-b-0 bg-white group cursor-pointer hover:bg-[#fafaf9] transition-colors">
                      <div className="flex-1 px-3 flex items-center gap-2 min-w-0">
                        {viAvatar(vi, 28)}
                        <span className="truncate" style={{ fontSize: 14, fontWeight: 400, color: '#292524' }}>{vi.prenom} {vi.nom}</span>
                      </div>
                      <div className="w-[130px] px-3 text-right">
                        <span style={{ fontSize: 14, fontWeight: 500, color: '#292524' }}>{fmt(montant)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4">{prose('Colonnes : avatar + prénom nom, montant aligné à droite. Hauteur de ligne 52px. Clic sur la ligne → side panel d\'édition.')}</div>
            </div>

            {/* ====== TYPE B — LIVE TABLE ====== */}
            <div id="iv-type-b---group-" className="mb-12">
              <h2 style={{ fontSize: 20, fontWeight: 600, color: '#292524', marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid #e7e5e3' }}>Type B — Frais divers (FDP)</h2>
              {prose('Plusieurs lignes de dépenses par victime indirecte. Même table plate que les autres types, triée par victime puis par dépense.')}

              {(() => {
                const demoFlatB = [];
                demoVis.forEach(vi => {
                  demoTypeB.filter(l => l.victimeId === vi.id).forEach(ligne => {
                    demoFlatB.push({ vi, ligne });
                  });
                });
                return (
                  <div className={cardBlockClass} style={{ maxWidth: 680 }}>
                    <div className="flex items-center h-10 border-b border-[#e7e5e3]" style={{ backgroundColor: '#fafaf9' }}>
                      <div className="w-[200px] px-3"><span style={colHeaderStyle}>Victime</span></div>
                      <div className="flex-1 px-3"><span style={colHeaderStyle}>Dépense</span></div>
                      <div className="w-[130px] px-3 text-right"><span style={colHeaderStyle}>Montant</span></div>
                    </div>
                    {demoFlatB.map((row) => (
                      <div key={row.ligne.id} className="relative flex items-center h-[52px] border-b border-[#e7e5e3] last:border-b-0 bg-white group cursor-pointer hover:bg-[#fafaf9] transition-colors">
                        <div className="w-[200px] px-3 flex items-center gap-2 min-w-0">
                          {viAvatar(row.vi, 28)}
                          <span className="truncate" style={{ fontSize: 14, fontWeight: 400, color: '#292524' }}>{row.vi.prenom} {row.vi.nom}</span>
                        </div>
                        <div className="flex-1 px-3 min-w-0">
                          <span className="truncate block" style={{ fontSize: 14, fontWeight: 400, color: row.ligne.intitule ? '#44403c' : '#a8a29e' }}>
                            {row.ligne.intitule || 'Sans intitulé'}
                          </span>
                        </div>
                        <div className="w-[130px] px-3 text-right">
                          <span style={{ fontSize: 14, fontWeight: 500, color: '#292524' }}>{fmt(row.ligne.montant)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
              <div className="mt-4">{prose('Même structure que Type A et C : Victime (w-[200px]) | Dépense (flex-1) | Montant. Plusieurs lignes par VI, triées par victime. Marie apparaît 3 fois, Lucas 1 fois.')}</div>
            </div>

            {/* ====== TYPE C — FLAT LIST ====== */}
            <div id="iv-type-c---frais-partag-s" className="mb-12">
              <h2 style={{ fontSize: 20, fontWeight: 600, color: '#292524', marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid #e7e5e3' }}>Type C — Frais partagés (Obsèques)</h2>
              {prose('Les frais d\'obsèques sont des dépenses communes réparties entre plusieurs VI. Chaque ligne = une attribution VI, triée par victime puis par dépense.')}

              {(() => {
                const demoFlatRows = [];
                demoVis.forEach(vi => {
                  demoTypeC.forEach(ligne => {
                    const attr = (ligne.attributions || []).find(a => a.viId === vi.id);
                    if (attr) demoFlatRows.push({ vi, ligne, amount: attr.amount });
                  });
                });
                return (
                  <div className={cardBlockClass} style={{ maxWidth: 680 }}>
                    <div className="flex items-center h-10 border-b border-[#e7e5e3]" style={{ backgroundColor: '#fafaf9' }}>
                      <div className="w-[200px] px-3"><span style={colHeaderStyle}>Victime</span></div>
                      <div className="flex-1 px-3"><span style={colHeaderStyle}>Dépense</span></div>
                      <div className="w-[130px] px-3 text-right"><span style={colHeaderStyle}>Montant</span></div>
                    </div>
                    {demoFlatRows.map((row) => (
                      <div key={`${row.vi.id}-${row.ligne.id}`} className="relative flex items-center h-[52px] border-b border-[#e7e5e3] last:border-b-0 bg-white group cursor-pointer hover:bg-[#fafaf9] transition-colors">
                        <div className="w-[200px] px-3 flex items-center gap-2 min-w-0">
                          {viAvatar(row.vi, 28)}
                          <span className="truncate" style={{ fontSize: 14, fontWeight: 400, color: '#292524' }}>{row.vi.prenom} {row.vi.nom}</span>
                        </div>
                        <div className="flex-1 px-3 min-w-0">
                          <span className="truncate block" style={{ fontSize: 14, fontWeight: 400, color: '#44403c' }}>{row.ligne.label}</span>
                        </div>
                        <div className="w-[130px] px-3 text-right">
                          <span style={{ fontSize: 14, fontWeight: 500, color: '#292524' }}>{fmt(row.amount)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
              <div className="mt-4">{prose('Colonnes : avatar + nom VI (w-[200px]), intitulé dépense (flex-1), montant. Lignes triées par victime — toutes les dépenses de Marie, puis Lucas, puis Emma. Clic → side panel d\'édition.')}</div>
            </div>

            {/* ====== TYPE D — LIVE PRP TABLES ====== */}
            <div id="iv-type-d---foyer--prp-" className="mb-12">
              <h2 style={{ fontSize: 20, fontWeight: 600, color: '#292524', marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid #e7e5e3' }}>Type D — Foyer (PRP)</h2>
              {prose('Le poste Pertes de Revenus des Proches suit une logique économique en 3 étapes : établir le revenu de référence, calculer la perte, puis la répartir entre bénéficiaires.')}

              {/* Table 1 — Revenu de référence */}
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-3">
                  <Calculator className="w-4 h-4 text-[#78716c]" />
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#292524' }}>Table 1 — Revenu de référence</span>
                </div>
                <div className={cardBlockClass} style={{ maxWidth: 680 }}>
                  <div className="flex items-center h-10 border-b border-[#e7e5e3]" style={{ backgroundColor: '#fafaf9' }}>
                    <div className="w-[52px] pl-3" />
                    <div className="flex-1 px-3"><span style={colHeaderStyle}>Source</span></div>
                    <div className="w-[110px] px-3"><span style={colHeaderStyle}>Période</span></div>
                    <div className="w-[130px] px-3 text-right"><span style={colHeaderStyle}>Net mensuel</span></div>
                  </div>
                  {demoRevenuRefLignes.map((ligne) => (
                    <div key={ligne.id} className="relative flex items-center h-[52px] border-b border-[#e7e5e3] last:border-b-0 bg-white group cursor-pointer hover:bg-[#fafaf9] transition-colors">
                      {docBadge(ligne.pieceIds)}
                      <div className="flex-1 px-3">
                        <span className="truncate block" style={{ fontSize: 14, color: '#292524' }}>{ligne.source}</span>
                      </div>
                      <div className="w-[110px] px-3">
                        <span style={{ fontSize: 14, color: '#292524' }}>{ligne.periode}</span>
                      </div>
                      <div className="w-[130px] px-3 text-right">
                        <span style={{ fontSize: 14, fontWeight: 500, color: '#292524' }}>{fmt(ligne.netMensuel)}</span>
                      </div>
                    </div>
                  ))}
                  {/* Footer */}
                  <div className="flex items-center justify-between h-10 px-4 border-t border-[#e7e5e3]" style={{ backgroundColor: '#fafaf9' }}>
                    <span style={{ fontSize: 12, fontWeight: 500, color: '#78716c' }}>Moyenne mensuelle</span>
                    <span style={{ fontSize: 14, fontWeight: 500, color: '#292524' }}>{fmt(demoRevenuRefMoyen)}</span>
                  </div>
                </div>
              </div>

              {/* Table 2 — Calcul de la perte */}
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-3">
                  <Calculator className="w-4 h-4 text-[#78716c]" />
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#292524' }}>Table 2 — Calcul de la perte</span>
                  {badge('DÉCÉDÉ', 'amber')}
                </div>
                <div className={cardBlockClass} style={{ maxWidth: 680 }}>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span style={{ fontSize: 13, color: '#78716c' }}>Revenu de référence annuel</span>
                      <span style={{ fontSize: 14, fontWeight: 500, color: '#292524' }}>{fmt(48000)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span style={{ fontSize: 13, color: '#78716c' }}>Revenu annuel du conjoint survivant</span>
                      <span style={{ fontSize: 14, color: '#292524' }}>{fmt(24000)}</span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-t border-[#e7e5e3]">
                      <span style={{ fontSize: 13, fontWeight: 500, color: '#292524' }}>Revenu total du foyer</span>
                      <span style={{ fontSize: 14, fontWeight: 500, color: '#292524' }}>{fmt(72000)}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <span style={{ fontSize: 13, color: '#78716c' }}>Méthode de calcul</span>
                      <span style={{ fontSize: 14, color: '#292524' }}>% libre</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span style={{ fontSize: 13, color: '#78716c' }}>Part d'auto-consommation</span>
                      <span style={{ fontSize: 14, fontWeight: 500, color: '#292524' }}>25 %</span>
                    </div>
                    <div className="pt-3 mt-2 border-t border-[#e7e5e3] space-y-2">
                      <div className="flex items-center justify-between">
                        <span style={{ fontSize: 13, color: '#78716c' }}>Perte annuelle brute</span>
                        <span style={{ fontSize: 14, color: '#292524' }}>{fmt(48000)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span style={{ fontSize: 13, fontWeight: 500, color: '#292524' }}>Perte annuelle nette (à répartir)</span>
                        <span style={{ fontSize: 14, fontWeight: 500, color: '#292524' }}>{fmt(36000)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Table 3a — Échu */}
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-[#78716c]" />
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#292524' }}>Table 3a — Échu</span>
                </div>
                <div className={cardBlockClass} style={{ maxWidth: 680 }}>
                  <div className="flex items-center h-10 border-b border-[#e7e5e3]" style={{ backgroundColor: '#fafaf9' }}>
                    <div className="flex-1 px-3"><span style={colHeaderStyle}>Victime</span></div>
                    <div className="w-[70px] px-2 text-right"><span style={colHeaderStyle}>Part</span></div>
                    <div className="w-[100px] px-2 text-right"><span style={colHeaderStyle}>Perte/an</span></div>
                    <div className="w-[70px] px-2 text-right"><span style={colHeaderStyle}>Années</span></div>
                    <div className="w-[110px] px-2 text-right"><span style={colHeaderStyle}>Échu</span></div>
                  </div>
                  {demoVis.map(vi => {
                    const ligne = demoPrpLignes.find(l => l.victimeId === vi.id);
                    if (!ligne) return null;
                    const amounts = demoComputeLine(ligne);
                    return (
                      <div key={vi.id} className="relative flex items-center h-[52px] border-b border-[#e7e5e3] last:border-b-0 bg-white group cursor-pointer hover:bg-[#fafaf9] transition-colors">
                        <div className="flex-1 px-3 flex items-center gap-2 min-w-0">
                          {viAvatar(vi, 24)}
                          <span className="truncate" style={{ fontSize: 13, color: '#292524' }}>{vi.prenom} {vi.nom}</span>
                        </div>
                        <div className="w-[70px] px-2 text-right"><span style={{ fontSize: 13, fontWeight: 500, color: '#292524' }}>{ligne.partIndividuelle}%</span></div>
                        <div className="w-[100px] px-2 text-right"><span style={{ fontSize: 13, color: '#292524' }}>{fmt(amounts.perteVI)}</span></div>
                        <div className="w-[70px] px-2 text-right"><span style={{ fontSize: 13, color: '#78716c' }}>{amounts.anneesEchues} ans</span></div>
                        <div className="w-[110px] px-2 text-right"><span style={{ fontSize: 13, fontWeight: 500, color: '#292524' }}>{fmt(amounts.echu)}</span></div>
                      </div>
                    );
                  })}
                  <div className="flex items-center h-10 border-t border-[#e7e5e3]" style={{ backgroundColor: '#fafaf9' }}>
                    <div className="flex-1 px-3"><span style={{ fontSize: 12, fontWeight: 600, color: '#44403c' }}>Total échu</span></div>
                    <div className="w-[70px] px-2 text-right"><span style={{ fontSize: 12, fontWeight: 500, color: '#44403c' }}>100%</span></div>
                    <div className="w-[100px] px-2 text-right"><span style={{ fontSize: 12, fontWeight: 500, color: '#44403c' }}>{fmt(demoPerteAnnuelle)}</span></div>
                    <div className="w-[70px] px-2" />
                    <div className="w-[110px] px-2 text-right"><span style={{ fontSize: 13, fontWeight: 600, color: '#292524' }}>{fmt(demoPrpLignes.reduce((s, l) => s + demoComputeLine(l).echu, 0))}</span></div>
                  </div>
                </div>
              </div>

              {/* Table 3b — À échoir */}
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-[#78716c]" />
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#292524' }}>Table 3b — À échoir</span>
                  <div className="flex items-center gap-2 ml-2">{badge('CAPITAL', 'green')} {badge('RENTE', 'amber')}</div>
                </div>
                <div className={cardBlockClass} style={{ maxWidth: 740 }}>
                  <div className="flex items-center h-10 border-b border-[#e7e5e3]" style={{ backgroundColor: '#fafaf9' }}>
                    <div className="flex-1 px-3"><span style={colHeaderStyle}>Victime</span></div>
                    <div className="w-[70px] px-2 text-right"><span style={colHeaderStyle}>Part</span></div>
                    <div className="w-[100px] px-2 text-right"><span style={colHeaderStyle}>Perte/an</span></div>
                    <div className="w-[100px] px-2"><span style={colHeaderStyle}>Durée</span></div>
                    <div className="w-[70px] px-2"><span style={colHeaderStyle}>Mode</span></div>
                    <div className="w-[55px] px-2 text-right"><span style={colHeaderStyle}>Coeff.</span></div>
                    <div className="w-[110px] px-2 text-right"><span style={colHeaderStyle}>À échoir</span></div>
                  </div>
                  {demoVis.map(vi => {
                    const ligne = demoPrpLignes.find(l => l.victimeId === vi.id);
                    if (!ligne) return null;
                    const amounts = demoComputeLine(ligne);
                    return (
                      <div key={vi.id} className="relative flex items-center h-[52px] border-b border-[#e7e5e3] last:border-b-0 bg-white group cursor-pointer hover:bg-[#fafaf9] transition-colors">
                        <div className="flex-1 px-3 flex items-center gap-2 min-w-0">
                          {viAvatar(vi, 24)}
                          <span className="truncate" style={{ fontSize: 13, color: '#292524' }}>{vi.prenom} {vi.nom}</span>
                        </div>
                        <div className="w-[70px] px-2 text-right"><span style={{ fontSize: 13, fontWeight: 500, color: '#292524' }}>{ligne.partIndividuelle}%</span></div>
                        <div className="w-[100px] px-2 text-right"><span style={{ fontSize: 13, color: '#292524' }}>{fmt(amounts.perteVI)}</span></div>
                        <div className="w-[100px] px-2"><span className="truncate block" style={{ fontSize: 12, color: '#78716c' }}>{ligne.dureeIndemnisation}</span></div>
                        <div className="w-[70px] px-2"><span style={{ fontSize: 12, color: '#78716c' }}>{amounts.mode === 'capitalisation' ? 'Capital' : 'Rente'}</span></div>
                        <div className="w-[55px] px-2 text-right">
                          {amounts.mode === 'capitalisation' ? (
                            <span style={{ fontSize: 13, color: '#292524' }}>{amounts.coeff}</span>
                          ) : (
                            <span style={{ fontSize: 13, color: '#d6d3d1' }}>—</span>
                          )}
                        </div>
                        <div className="w-[110px] px-2 text-right">
                          {amounts.mode === 'capitalisation' ? (
                            <span style={{ fontSize: 13, fontWeight: 500, color: '#292524' }}>{fmt(amounts.aEchoir)}</span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>
                              RENTE {fmt(amounts.perteVI)}/an
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div className="flex items-center h-10 border-t border-[#e7e5e3]" style={{ backgroundColor: '#fafaf9' }}>
                    <div className="flex-1 px-3"><span style={{ fontSize: 12, fontWeight: 600, color: '#44403c' }}>Total à échoir</span></div>
                    <div className="w-[70px] px-2" />
                    <div className="w-[100px] px-2" />
                    <div className="w-[100px] px-2" />
                    <div className="w-[70px] px-2" />
                    <div className="w-[55px] px-2" />
                    <div className="w-[110px] px-2 text-right"><span style={{ fontSize: 13, fontWeight: 600, color: '#292524' }}>{fmt(demoPrpLignes.reduce((s, l) => s + demoComputeLine(l).aEchoir, 0))}</span></div>
                  </div>
                </div>
              </div>

              {/* Table 3c — Total par bénéficiaire (beige total block) */}
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-4 h-4 text-[#78716c]" />
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#292524' }}>Table 3c — Total par bénéficiaire</span>
                </div>
                {(() => {
                  const demoTotalDistribue = demoPrpLignes.reduce((s, l) => s + demoComputeLine(l).total, 0);
                  return (
                    <div className={totalBlockClass} style={{ maxWidth: 680 }}>
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-[#d6d3d1] rounded-[6px] flex items-center justify-center">
                            <User className="w-3.5 h-3.5 text-[#78716c]" />
                          </div>
                          <span className="text-[14px] font-medium text-[#292524]">Total par bénéficiaire</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span style={serifAmountStyle} className="text-[#292524]">{fmt(demoTotalDistribue)}</span>
                          <ChevronRight className="w-4 h-4 text-[#78716c] rotate-90" />
                        </div>
                      </div>
                      <div className="border-t border-[#d6d3d1] mt-3 mb-3" />
                      <div className="space-y-2">
                        {demoVis.map(vi => {
                          const ligne = demoPrpLignes.find(l => l.victimeId === vi.id);
                          if (!ligne) return null;
                          const amounts = demoComputeLine(ligne);
                          return (
                            <div key={vi.id} className="flex justify-between items-center">
                              <div className="flex items-center gap-2 min-w-0">
                                {viAvatar(vi, 24)}
                                <span style={{ fontSize: 14, color: '#78716c' }}>{vi.prenom} {vi.nom}</span>
                              </div>
                              <div className="flex items-center gap-4">
                                {amounts.echu > 0 && <span style={{ fontSize: 12, color: '#a8a29e' }}>échu {fmt(amounts.echu)}</span>}
                                {amounts.mode === 'capitalisation' && amounts.aEchoir > 0 && <span style={{ fontSize: 12, color: '#a8a29e' }}>à échoir {fmt(amounts.aEchoir)}</span>}
                                <span style={{ fontSize: 14, fontWeight: 500, color: '#292524' }}>{fmt(amounts.total)}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* ====== SCÉNARIOS PRP ====== */}
            <div id="iv-sc-narios-prp" className="mb-12">
              <h2 style={{ fontSize: 20, fontWeight: 600, color: '#292524', marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid #e7e5e3' }}>Scénarios PRP</h2>
              {prose('Le sélecteur « Scénario » en haut du poste PRP applique des presets de données pour tester les 6 combinaisons possibles. Il met à jour victimeDecedee, mode par ligne, et anneesEchues.')}

              <div className="grid grid-cols-2 gap-4 mb-6" style={{ maxWidth: 680 }}>
                {[
                  { key: 'decede-capital-echu', label: 'Décédé + capital + échu', desc: 'Scénario de base. 3 ans écoulés, tous en capitalisation. Total = 616 500 €.', color: 'amber' },
                  { key: 'decede-rente', label: 'Décédé + rente', desc: 'Tous les VI en rente. Échu = 108 000 €. À échoir affiché en badges RENTE avec montant/an.', color: 'amber' },
                  { key: 'decede-mixte', label: 'Décédé + mixte', desc: 'Marie en capital (Viager × 20), Lucas et Emma en rente. Teste le mode par ligne.', color: 'amber' },
                  { key: 'decede-sans-echu', label: 'Décédé + sans échu', desc: 'anneesEchues = 0. Table 3a masquée. Seuls 3b et 3c s\'affichent.', color: 'amber' },
                  { key: 'blesse-capital', label: 'Blessé + capital', desc: 'VD vivante, revenu actuel 1 000 €/mois. Pas d\'auto-consommation. Même perte nette.', color: 'blue' },
                  { key: 'blesse-rente', label: 'Blessé + rente', desc: 'Blessé, tous en rente. Mode calcul simplifié (pas d\'auto-conso).', color: 'blue' },
                ].map(s => (
                  <div key={s.key} className="border border-[#e7e5e3] rounded-lg p-4 bg-white">
                    <div className="flex items-center gap-2 mb-2">
                      {badge(s.label, s.color)}
                    </div>
                    <p style={{ fontSize: 12, color: '#78716c', lineHeight: '18px' }}>{s.desc}</p>
                    <div className="mt-2"><span style={{ fontSize: 11, color: '#a8a29e' }}>{codeInline(s.key)}</span></div>
                  </div>
                ))}
              </div>

              <div className={cardBlockClass + ' mb-6'} style={{ maxWidth: 680 }}>
                <div className="flex items-center h-10 border-b border-[#e7e5e3]" style={{ backgroundColor: '#fafaf9' }}>
                  <div className="flex-1 px-3"><span style={colHeaderStyle}>Scénario</span></div>
                  <div className="w-[100px] px-3"><span style={colHeaderStyle}>Auto-conso</span></div>
                  <div className="w-[100px] px-3"><span style={colHeaderStyle}>Rev. actuel</span></div>
                  <div className="w-[140px] px-3"><span style={colHeaderStyle}>À échoir</span></div>
                </div>
                {[
                  { s: 'Décédé + capital', ac: '25%', ra: 'N/A', ae: 'perte × part × coeff' },
                  { s: 'Décédé + rente', ac: '25%', ra: 'N/A', ae: 'badge RENTE /an' },
                  { s: 'Blessé + capital', ac: '—', ra: '1 000 €/mois', ae: 'perte × part × coeff' },
                  { s: 'Blessé + rente', ac: '—', ra: '1 000 €/mois', ae: 'badge RENTE /an' },
                ].map((row, idx) => (
                  <div key={idx} className="flex items-center h-[52px] border-b border-[#e7e5e3] last:border-b-0 bg-white">
                    <div className="flex-1 px-3"><span style={{ fontSize: 13, color: '#292524' }}>{row.s}</span></div>
                    <div className="w-[100px] px-3"><span style={{ fontSize: 13, color: '#78716c' }}>{row.ac}</span></div>
                    <div className="w-[100px] px-3"><span style={{ fontSize: 13, color: '#78716c' }}>{row.ra}</span></div>
                    <div className="w-[140px] px-3"><span style={{ fontSize: 12, color: '#78716c' }}>{row.ae}</span></div>
                  </div>
                ))}
              </div>
            </div>

            {/* ====== AFFICHAGE OBSÈQUES ====== */}
            {/* ====== ADAPTATION IA ====== */}
            <div id="iv-adaptation-ia" className="mb-12">
              <h2 style={{ fontSize: 20, fontWeight: 600, color: '#292524', marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid #e7e5e3' }}>Adaptation aux requêtes IA</h2>
              {prose('Le chat IA peut naviguer vers un poste IV et adapter la visualisation en fonction du contexte de la question. Exemples de mapping intention → action :')}

              <div className="space-y-3 mb-8" style={{ maxWidth: 680 }}>
                {[
                  { query: '« Combien pour les obsèques de Marie ? »', action: 'Naviguer vers FO → filtrer / scroll aux lignes de Marie', mode: 'fo' },
                  { query: '« Détail cercueil et préparation »', action: 'Naviguer vers FO → highlight la ligne Cercueil', mode: 'fo' },
                  { query: '« Calcule la capitalisation de Marie (PRP) »', action: 'Naviguer vers PRP → scénario decede-capital-echu → table 3b visible', mode: 'prp' },
                  { query: '« Passe Lucas en rente »', action: 'Naviguer vers PRP → modifier ligne vi-2 mode=rente → badge RENTE apparaît', mode: 'prp' },
                  { query: '« Combien d\'échu pour toute la famille ? »', action: 'Naviguer vers PRP → table 3a → lire footer total échu', mode: 'prp' },
                  { query: '« Compare les indemnités des enfants »', action: 'Naviguer vers PRP → table 3c (recap) → Lucas vs Emma côte à côte', mode: 'prp' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 items-start border border-[#e7e5e3] rounded-lg p-3.5 bg-white">
                    <div className="flex-shrink-0 mt-0.5">
                      <Brain className="w-4 h-4 text-[#78716c]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#292524', marginBottom: 4 }}>{item.query}</div>
                      <div style={{ fontSize: 12, color: '#78716c', lineHeight: '18px' }}>{item.action}</div>
                    </div>
                    <div className="flex-shrink-0">
                      {badge(item.mode, item.mode === 'prp' ? 'amber' : 'blue')}
                    </div>
                  </div>
                ))}
              </div>

              {prose('L\'IA utilise setPrpUseCase() et la navigation (navigateTo) pour adapter l\'affichage. Le scénario est un paramètre d\'affichage, pas une modification de données — la source de vérité reste ivPosteData.')}
            </div>

          </div>
        </div>
      </div>
    );
  };

  // ========== RENDER BARÈMES LIBRARY PAGE ==========
  const renderBaremesLibraryPage = () => (
    <div className="h-screen flex relative" style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '13px', color: '#27272a' }}>
      {/* Sidebar Rail */}
      <div className="w-12 bg-white border-r border-[#e7e5e3] flex flex-col items-start flex-shrink-0">
        {/* Header — Logo */}
        <div className="w-full flex flex-col items-center justify-center py-3 border-b border-[#e7e5e3]">
          <img src="/logo-plato.png" alt="Plato" className="w-6 h-6" />
        </div>

        {/* Nav items */}
        <div className="flex-1 w-full flex flex-col gap-2 p-2">
          <button
            onClick={() => setCurrentPage('list')}
            title="Mes dossiers"
            className={`w-8 h-8 flex items-center justify-center transition-colors ${currentPage === 'list' ? 'text-[#292524]' : 'text-[#78716c] hover:text-[#292524]'}`}
            style={{ borderRadius: 8 }}
          >
            <Folder className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentPage('baremes')}
            title="Référentiels & Barèmes"
            className={`w-8 h-8 flex items-center justify-center transition-colors ${currentPage === 'baremes' ? 'text-[#292524]' : 'text-[#78716c] hover:text-[#292524]'}`}
            style={{ borderRadius: 8 }}
          >
            <Scale className="w-4 h-4" />
          </button>
        </div>

        {/* Footer — UIKit + Avatar */}
        <div className="w-full border-t border-[#e7e5e3] p-2 flex flex-col gap-2">
          <button
            onClick={() => setCurrentPage('components')}
            title="UI Components"
            className={`w-8 h-8 flex items-center justify-center transition-colors ${currentPage === 'components' ? 'text-[#292524]' : 'text-[#78716c] hover:text-[#292524]'}`}
            style={{ borderRadius: 8 }}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <div className="w-8 h-8 bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white text-[10px] font-medium cursor-pointer overflow-hidden" style={{ borderRadius: 12 }}>
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
              Référentiels & Barèmes
            </h1>
            <button
              onClick={() => { setBaremeUploadFormOpen(true); setBaremeUploadData({ nom: '', type: 'bareme', notes: '', fileName: '' }); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#292524] text-white text-body-medium rounded-lg hover:bg-[#44403c] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Ajouter un barème
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto px-8 pb-8">
          <div className="bg-white rounded-lg border border-[#e7e5e3]/60 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-100">
                  <th className="px-5 py-3 text-left" style={colHeaderStyle}>Nom</th>
                  <th className="px-5 py-3 text-left" style={colHeaderStyle}>Statut</th>
                  <th className="px-5 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e7e5e3]">
                {baremesLibrary.map(bareme => (
                  <tr
                    key={bareme.id}
                    onClick={() => bareme.status === 'active' && setBaremeViewerOpen(bareme.id)}
                    className={`bg-white transition-colors group ${bareme.status === 'active' ? 'hover:bg-[#fafaf9] cursor-pointer' : 'opacity-75'}`}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#eeece6] flex items-center justify-center flex-shrink-0">
                          <Scale className="w-4 h-4 text-[#a8a29e]" />
                        </div>
                        <span className="text-body-medium text-[#292524]">{bareme.label}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {bareme.status === 'active' ? (
                        <span className="inline-flex items-center text-xs px-2 py-0.5 rounded-full" style={{ background: '#dcfce7', color: '#065f46' }}>Actif</span>
                      ) : (
                        <span className="inline-flex items-center text-xs px-2 py-0.5 rounded-full" style={{ background: '#fef3c7', color: '#92400e' }}>En traitement</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {bareme.status === 'active' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setBaremeViewerOpen(bareme.id); }}
                          className="p-1.5 rounded-lg text-[#d6d3d1] hover:text-[#78716c] hover:bg-[#eeece6] opacity-0 group-hover:opacity-100 transition-all"
                          title="Voir le barème"
                        >
                          <Table2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modals */}
      {baremeViewerOpen && renderBaremeViewer()}
      {renderBaremeUploadModal()}
    </div>
  );

  // ========== REASONING DEMO PAGE ==========
  const REASONING_SCENARIOS = {
    A: {
      title: 'Success with CRUD (DSA completion)',
      summary: 'Complétion du poste DSA depuis 3 factures',
      counters: { add: 3, update: 1 },
      response: "J'ai complété le poste DSA avec les 3 lignes extraites des factures et mis à jour le taux DFP à 20%. Le resté à charge total DSA est de 7 300 €.",
      steps: [
        { type: 'read_documents', label: 'Analyse de 6 documents', status: 'done', children: ['rapport.pdf', 'facture_1.pdf', 'facture_2.pdf', 'facture_3.pdf', 'bulletin_01.pdf', 'bulletin_02.pdf'] },
        { type: 'read_rapport', label: "Lecture du rapport d'expertise", status: 'done' },
        { type: 'extract_data', label: 'Extraction facture CHU Bordeaux', status: 'done', children: ['Montant : 4 500 €', 'CPAM : 3 200 €', 'RAC : 1 300 €'] },
        { type: 'add_row', label: '3 lignes DSA', status: 'done', poste: 'DSA', children: ['Consultation spécialiste', 'IRM lombaire', 'Kinésithérapie'] },
        { type: 'update_row', label: 'Taux DFP', status: 'done', poste: 'DFP', children: ['15% → 20%'] },
      ],
    },
    B: {
      title: 'Read-only (analysis)',
      summary: "Analyse du rapport d'expertise",
      counters: {},
      response: "La consolidation est fixée au 15 mars 2024. Le DFP retenu est de 20% et le DFT couvre 4 périodes (187 jours). Souhaitez-vous que je pré-remplisse les postes concernés ?",
      steps: [
        { type: 'read_documents', label: 'Analyse de 2 documents', status: 'done', children: ['rapport.pdf', 'conclusions_amiable.pdf'] },
        { type: 'read_rapport', label: "Lecture du rapport d'expertise", status: 'done' },
      ],
    },
    C: {
      title: 'Partial error',
      summary: 'Extraction des factures DSA',
      counters: { add: 2, error: 1 },
      response: "J'ai extrait 2 factures sur 3 et créé les lignes DSA. Le fichier facture_scan.pdf n'a pas pu être lu — vérifiez qu'il s'agit d'un PDF texte.",
      steps: [
        { type: 'read_documents', label: 'Analyse de 3 documents', status: 'done' },
        { type: 'extract_data', label: 'Extraction facture CHU', status: 'done', children: ['4 500 € — CPAM 3 200 €'] },
        { type: 'error', label: 'Extraction impossible — facture_scan.pdf illisible', status: 'error' },
        { type: 'add_row', label: '2 lignes DSA', status: 'done', poste: 'DSA', children: ['Consultation spécialiste', 'IRM lombaire'] },
      ],
    },
    D: {
      title: 'Total error',
      summary: "Analyse du rapport d'expertise",
      counters: { error: 1 },
      response: "Je n'ai pas trouvé de rapport d'expertise dans ce dossier. Déposez-le dans la section Documents puis relancez l'analyse.",
      steps: [
        { type: 'error', label: "Aucun rapport d'expertise dans le dossier", status: 'error' },
      ],
    },
    E: {
      title: 'Multi-poste with deletion',
      summary: "Pré-remplissage depuis le rapport d'expertise",
      counters: { add: 5, update: 1, delete: 1 },
      response: "J'ai pré-rempli 3 postes depuis le rapport : DSA (3 lignes), DFT (2 périodes) et DFP (taux à 20%). J'ai aussi supprimé un doublon sur DFT.",
      steps: [
        { type: 'read_rapport', label: "Lecture du rapport d'expertise", status: 'done' },
        { type: 'add_row', label: '3 lignes DSA', status: 'done', poste: 'DSA', children: ['Consultation spécialiste', 'IRM lombaire', 'Kinésithérapie'] },
        { type: 'add_row', label: '2 périodes DFT', status: 'done', poste: 'DFT', children: ['01/01 → 15/03/2024 — 25% — 74j', '16/03 → 30/06/2024 — 10% — 107j'] },
        { type: 'update_row', label: 'Taux DFP', status: 'done', poste: 'DFP', children: ['15% → 20%'] },
        { type: 'delete_row', label: '1 ligne DFT doublon', status: 'done', poste: 'DFT', children: ['Période 3 — doublon avec période 2'] },
      ],
    },
    F: {
      title: 'Sub-agent',
      summary: 'Extraction et complétion DSA',
      counters: { add: 2 },
      response: "J'ai extrait les montants de 2 factures via l'agent d'extraction et ajouté les lignes correspondantes au poste DSA.",
      steps: [
        { type: 'read_documents', label: 'Analyse de 4 documents', status: 'done' },
        { type: 'read_rapport', label: "Lecture du rapport d'expertise", status: 'done' },
        { type: 'sub_agent', label: 'Agent extraction factures', status: 'done', children_steps: [
          { type: 'extract_data', label: 'Extraction facture CHU', status: 'done', children: ['4 500 €'] },
          { type: 'extract_data', label: 'Extraction facture clinique', status: 'done', children: ['2 800 €'] },
        ]},
        { type: 'add_row', label: '2 lignes DSA', status: 'done', poste: 'DSA', children: ['CHU Bordeaux', 'Clinique St-Jean'] },
      ],
    },
  };

  const ReasoningDemoScenario = ({ id, scenario }) => {
    const [phase, setPhase] = React.useState('idle'); // idle | streaming | done
    const [visibleSteps, setVisibleSteps] = React.useState([]);
    const [expanded, setExpanded] = React.useState(false);
    const [speed, setSpeed] = React.useState(1);
    const timeoutsRef = React.useRef([]);

    const play = () => {
      // Clear any running timeouts
      timeoutsRef.current.forEach(t => clearTimeout(t));
      timeoutsRef.current = [];
      setPhase('streaming');
      setVisibleSteps([]);
      setExpanded(false);

      const stepInterval = 15000 / Math.max(scenario.steps.length, 1);
      const processingDelay = stepInterval * 0.6;
      scenario.steps.forEach((step, idx) => {
        // Add step in loading state
        const tLoad = setTimeout(() => {
          setVisibleSteps(prev => [...prev, { ...step, status: 'loading' }]);
        }, (400 + idx * stepInterval) / speed);
        timeoutsRef.current.push(tLoad);
        // Flip to done after processing delay
        const tDone = setTimeout(() => {
          setVisibleSteps(prev => prev.map((s, i) => i === idx ? { ...step, status: step.status || 'done' } : s));
        }, (400 + idx * stepInterval + processingDelay) / speed);
        timeoutsRef.current.push(tDone);
      });

      // Auto-collapse after all steps
      const doneT = setTimeout(() => {
        setPhase('done');
        setVisibleSteps(scenario.steps);
      }, (400 + scenario.steps.length * stepInterval + 600) / speed);
      timeoutsRef.current.push(doneT);
    };

    const reset = () => {
      timeoutsRef.current.forEach(t => clearTimeout(t));
      timeoutsRef.current = [];
      setPhase('idle');
      setVisibleSteps([]);
      setExpanded(false);
    };

    return (
      <div className="border border-[#e7e5e3] rounded-lg bg-white overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#e7e5e3]" style={{ backgroundColor: '#fafaf9' }}>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded text-xs font-semibold" style={{ backgroundColor: '#292524', color: 'white' }}>{id}</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: '#292524' }}>{scenario.title}</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Speed control */}
            <div className="flex items-center gap-1 border border-[#e7e5e3] rounded overflow-hidden">
              {[1, 2, 4].map(s => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className="px-2 py-0.5 text-xs transition-colors"
                  style={{ fontWeight: speed === s ? 600 : 400, color: speed === s ? '#292524' : '#a8a29e', backgroundColor: speed === s ? '#eeece6' : 'transparent' }}
                >
                  {s}x
                </button>
              ))}
            </div>
            {phase === 'idle' ? (
              <button onClick={play} className="px-3 py-1 rounded text-xs font-medium text-white transition-colors" style={{ backgroundColor: '#292524' }}>
                Play
              </button>
            ) : (
              <button onClick={reset} className="px-3 py-1 rounded text-xs font-medium transition-colors border border-[#e7e5e3]" style={{ color: '#78716c' }}>
                <RotateCcw className="w-3 h-3 inline mr-1" />Reset
              </button>
            )}
          </div>
        </div>
        {/* Content */}
        <div className="p-4" style={{ minHeight: 60 }}>
          {phase === 'idle' && (
            <p style={{ fontSize: 13, color: '#a8a29e', textAlign: 'center', padding: '16px 0' }}>
              Cliquez Play pour lancer la simulation
            </p>
          )}
          {phase === 'streaming' && (
            <ReasoningStepper
              status="streaming"
              steps={visibleSteps}
              onToggle={() => {}}
            />
          )}
          {phase === 'done' && (
            <>
              <ReasoningStepper
                status="done"
                summary={scenario.summary}
                counters={scenario.counters}
                steps={scenario.steps}
                expanded={expanded}
                onToggle={() => setExpanded(v => !v)}
              />
              {/* Agent response */}
              <div style={{ marginTop: 8, fontSize: 14, lineHeight: '20px', color: '#44403c' }}>
                {scenario.response}
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  const FinishedInspectableCard = ({ summary, counters, steps }) => {
    const [expanded, setExpanded] = React.useState(false);
    return (
      <div className="border border-[#e7e5e3] rounded-lg bg-white overflow-hidden">
        <div className="px-3 py-2" style={{ backgroundColor: '#fafaf9', borderBottom: '1px solid #e7e5e3' }}>
          <span style={{ fontSize: 10, fontWeight: 600, color: '#a8a29e', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Reasoning finished inspectable</span>
        </div>
        <div className="p-4">
          <ReasoningStepper
            status="done"
            summary={summary}
            counters={counters}
            steps={steps}
            expanded={expanded}
            onToggle={() => setExpanded(v => !v)}
          />
        </div>
      </div>
    );
  };

  const ExampleStageCard = ({ label, summary, counters, allSteps }) => {
    const [phase, setPhase] = React.useState('idle'); // idle | streaming | done
    const [visibleSteps, setVisibleSteps] = React.useState([]);
    const [expanded, setExpanded] = React.useState(false);
    const timeoutsRef = React.useRef([]);

    const play = () => {
      timeoutsRef.current.forEach(t => clearTimeout(t));
      timeoutsRef.current = [];
      setPhase('streaming');
      setVisibleSteps([]);
      setExpanded(false);

      const stepInterval = 10000 / Math.max(allSteps.length, 1);
      const processingDelay = stepInterval * 0.6;
      allSteps.forEach((step, idx) => {
        const tLoad = setTimeout(() => {
          setVisibleSteps(prev => [...prev, { ...step, status: 'loading' }]);
        }, 300 + idx * stepInterval);
        timeoutsRef.current.push(tLoad);
        const tDone = setTimeout(() => {
          setVisibleSteps(prev => prev.map((s, i) => i === idx ? { ...step, status: step.status || 'done' } : s));
        }, 300 + idx * stepInterval + processingDelay);
        timeoutsRef.current.push(tDone);
      });

      const doneT = setTimeout(() => {
        setPhase('done');
        setVisibleSteps(allSteps);
        setExpanded(false);
      }, 300 + allSteps.length * stepInterval + 400);
      timeoutsRef.current.push(doneT);
    };

    const reset = () => {
      timeoutsRef.current.forEach(t => clearTimeout(t));
      timeoutsRef.current = [];
      setPhase('idle');
      setVisibleSteps([]);
      setExpanded(false);
    };

    React.useEffect(() => () => timeoutsRef.current.forEach(t => clearTimeout(t)), []);

    return (
      <div className="border border-[#e7e5e3] rounded-lg bg-white overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2" style={{ backgroundColor: '#fafaf9', borderBottom: '1px solid #e7e5e3' }}>
          <span style={{ fontSize: 10, fontWeight: 600, color: '#a8a29e', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
          <div className="flex items-center gap-1.5">
            {phase === 'idle' ? (
              <button onClick={play} className="px-2.5 py-0.5 rounded text-xs font-medium text-white transition-colors" style={{ backgroundColor: '#292524' }}>
                Play
              </button>
            ) : (
              <button onClick={reset} className="px-2.5 py-0.5 rounded text-xs font-medium transition-colors border border-[#e7e5e3]" style={{ color: '#78716c' }}>
                <RotateCcw className="w-3 h-3 inline mr-1" />Reset
              </button>
            )}
          </div>
        </div>
        <div className="p-4" style={{ minHeight: 48 }}>
          {phase === 'idle' && (
            <p style={{ fontSize: 12, color: '#a8a29e', textAlign: 'center', padding: '12px 0' }}>
              Cliquez Play pour lancer
            </p>
          )}
          {phase === 'streaming' && (
            <ReasoningStepper
              status="streaming"
              steps={visibleSteps}
              onToggle={() => {}}
            />
          )}
          {phase === 'done' && (
            <ReasoningStepper
              status="done"
              summary={summary}
              counters={counters}
              steps={allSteps}
              expanded={expanded}
              onToggle={() => setExpanded(v => !v)}
            />
          )}
        </div>
      </div>
    );
  };

  const renderReasoningDemoPage = () => {
    const sH1 = { fontSize: 20, fontWeight: 700, color: '#292524', marginBottom: 6, marginTop: 48 };
    const sH2 = { fontSize: 15, fontWeight: 600, color: '#292524', marginBottom: 6, marginTop: 32 };
    const sP = { fontSize: 13, color: '#78716c', lineHeight: '20px', marginBottom: 16 };
    const sCode = { fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: '#78716c', backgroundColor: '#f5f5f4', padding: '1px 5px', borderRadius: 3 };
    const sCard = "border border-[#e7e5e3] rounded-lg bg-white p-4";
    const sLabel = { fontSize: 10, fontWeight: 600, color: '#a8a29e', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 };

    return (
      <div className="h-screen flex flex-col" style={{ backgroundColor: '#F8F7F5', fontFamily: "'Inter', system-ui, sans-serif" }}>
        {/* Top bar */}
        <div className="flex items-center gap-3 px-6 h-12 border-b border-[#e7e5e3] flex-shrink-0 bg-white">
          <button onClick={() => setCurrentPage('components')} className="flex items-center gap-1.5 text-[#78716c] hover:text-[#292524] transition-colors" style={{ fontSize: 13 }}>
            <ChevronRight className="w-4 h-4 rotate-180" /> UI Kit
          </button>
          <span style={{ color: '#d6d3d1' }}>/</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#292524' }}>Reasoning Stepper</span>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-8">
          <div style={{ maxWidth: 880 }}>

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* TITLE                                                        */}
            {/* ══════════════════════════════════════════════════════════════ */}
            <h1 style={{ fontSize: 28, fontWeight: 700, color: '#292524', marginBottom: 8, letterSpacing: '-0.5px' }}>ReasoningStepper</h1>
            <p style={{ ...sP, maxWidth: 640 }}>
              Affiche les étapes de raisonnement de l'agent Plato. Supporte le streaming progressif, l'auto-collapse, les sous-agents, le groupement CRUD, et la vérification des données.
            </p>

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* EXAMPLES & STAGES                                            */}
            {/* ══════════════════════════════════════════════════════════════ */}
            <h1 style={sH1}>Examples & stages</h1>
            <p style={{ ...sP, maxWidth: 700 }}>
              Component designed to integrate streaming of agent actions, but also designed for V1 where there is no per-action streaming — instead, a single streaming process runs, and at the end, the full payload is displayed (reflecting the trace and all actions performed).
            </p>

            {/* ── Live streaming (future) ── */}
            <h2 style={sH2}>Live streaming</h2>
            <p style={{ fontSize: 12, color: '#a8a29e', lineHeight: '18px', marginBottom: 12 }}>Steps stream one by one in real-time. Each step shows the processing gif while active, then its final icon when done.</p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <ExampleStageCard
                label="Reasoning (streaming)"
                summary="Complétion du poste DSA depuis 3 factures"
                counters={{ add: 3, update: 1 }}
                allSteps={[
                  { type: 'read_documents', label: 'Analyse de 4 documents', status: 'done' },
                  { type: 'read_rapport', label: "Lecture du rapport d'expertise médicale", status: 'done' },
                  { type: 'extract_data', label: 'Extraction facture CHU Bordeaux', status: 'done', children: ['4 500 € — CPAM 3 200 €'] },
                  { type: 'verify_data', label: 'Vérification des données', status: 'done' },
                  { type: 'add_row', label: '3 lignes DSA', status: 'done', poste: 'DSA', children: ['Consultation spécialiste', 'IRM lombaire', 'Kinésithérapie'] },
                  { type: 'update_row', label: 'Taux DFP', status: 'done', poste: 'DFP', children: ['15% → 20%'] },
                ]}
              />
              <FinishedInspectableCard
                summary="Résumé du reasoning usage final"
                counters={{ add: 4, update: 1 }}
                steps={[
                  { type: 'read_documents', label: 'Analyse de 6 documents', status: 'done' },
                  { type: 'read_rapport', label: "Lecture du rapport d'expertise", status: 'done' },
                  { type: 'extract_data', label: 'Extraction facture CHU Bordeaux', status: 'done', children: ['4 500 € — CPAM 3 200 €'] },
                  { type: 'verify_data', label: 'Vérification des données', status: 'done' },
                  { type: 'calculate', label: 'Calcul du poste DSA', status: 'done' },
                  { type: 'add_row', label: '3 lignes DSA', status: 'done', poste: 'DSA', children: ['Consultation spécialiste', 'IRM lombaire', 'Kinésithérapie'] },
                  { type: 'update_row', label: 'Taux DFP', status: 'done', poste: 'DFP', children: ['15% → 20%'] },
                  { type: 'navigate', label: 'Navigation vers le poste', status: 'done' },
                  { type: 'add_row', label: '1 ligne DFT', status: 'done', poste: 'DFT' },
                  { type: 'error', label: 'Extraction impossible — fichier illisible', status: 'error' },
                ]}
              />
            </div>

            {/* ── V1 — no per-action streaming ── */}
            <h2 style={sH2}>V1 — no per-action streaming</h2>
            <p style={{ fontSize: 12, color: '#a8a29e', lineHeight: '18px', marginBottom: 12 }}>No step-by-step detail during processing. A single process runs, then the full trace payload arrives at once.</p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* V1 Processing */}
              <div className="border border-[#e7e5e3] rounded-lg bg-white overflow-hidden">
                <div className="px-3 py-2" style={{ backgroundColor: '#fafaf9', borderBottom: '1px solid #e7e5e3' }}>
                  <span style={{ fontSize: 10, fontWeight: 600, color: '#a8a29e', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Reasoning (processing)</span>
                </div>
                <div className="p-4 flex items-center gap-2">
                  <img src="/plato-thinking.gif" alt="" className="w-3 h-3" style={{ objectFit: 'contain' }} />
                  <span style={{ fontSize: 12, color: '#78716c' }}>Raisonnement en cours…</span>
                </div>
              </div>

              {/* V1 Finished */}
              <FinishedInspectableCard
                summary="Complétion du poste DSA — 3 factures traitées"
                counters={{ add: 3, update: 1 }}
                steps={[
                  { type: 'read_documents', label: 'Analyse de 4 documents', status: 'done' },
                  { type: 'extract_data', label: 'Extraction facture CHU', status: 'done', children: ['4 500 €'] },
                  { type: 'verify_data', label: 'Vérification des données', status: 'done' },
                  { type: 'add_row', label: '3 lignes DSA', status: 'done', poste: 'DSA', children: ['Consultation', 'IRM', 'Kiné'] },
                  { type: 'update_row', label: 'Taux DFP', status: 'done', poste: 'DFP', children: ['15% → 20%'] },
                ]}
              />
            </div>

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* ANATOMY                                                      */}
            {/* ══════════════════════════════════════════════════════════════ */}
            <h1 style={sH1}>Anatomy</h1>

            {/* ── StepIcon ── */}
            <h2 style={sH2}>StepIcon</h2>
            <p style={sP}>Chaque étape a un <span style={sCode}>type</span> qui détermine son icône, sa couleur, et son comportement.</p>
            <p style={{ ...sP, fontSize: 11 }}>Les vrais noms d'outils du Plato Supervisor (PostHog traces) sont mappés via <span style={sCode}>BACKEND_TOOL_MAP</span>.</p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* Left: Icon type table */}
              <div className="flex flex-col gap-0 border border-[#e7e5e3] rounded-lg bg-white overflow-hidden">
                <div className="flex items-center gap-2.5 px-3 py-1.5" style={{ backgroundColor: '#fafaf9', borderBottom: '1px solid #e7e5e3' }}>
                  <span style={{ ...sLabel, marginBottom: 0, width: 16 }}></span>
                  <span style={{ ...sLabel, marginBottom: 0, width: 110 }}>Type</span>
                  <span style={{ ...sLabel, marginBottom: 0, flex: 1 }}>Label utilisateur</span>
                </div>
                {[
                  ['read_documents',  'Analyse de X documents'],
                  ['read_rapport',    "Lecture du rapport d'expertise"],
                  ['search_document', 'Recherche dans le document'],
                  ['extract_data',    'Extraction des données en cours de...'],
                  ['verify_data',     'Vérification des données'],
                  ['summarize',       'Synthèse des résultats'],
                  ['calculate',       'Calcul du poste'],
                  ['navigate',        'Navigation vers le poste'],
                  ['add_row',         'X lignes ajoutées'],
                  ['update_row',      'Mise à jour du champ'],
                  ['delete_row',      'X lignes supprimées'],
                  ['sub_agent',       'Agent extraction factures'],
                  ['error',           'Extraction impossible — Fichier illisible'],
                ].map(([type, label]) => {
                  const cfg = STEP_TYPE_CONFIG[type];
                  if (!cfg) return null;
                  const Icon = cfg.Icon;
                  const colors = STEP_COLORS[cfg.color] || STEP_COLORS.default;
                  return (
                    <div key={type} className="flex items-center gap-2.5 px-3 py-1.5" style={{ borderTop: '1px solid #f5f5f4' }}>
                      <span className="flex items-center justify-center flex-shrink-0" style={{ width: 16 }}>
                        <Icon className="w-3.5 h-3.5" style={{ color: colors.icon }} />
                      </span>
                      <span className="flex-shrink-0" style={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: '#a8a29e', width: 110 }}>{type}</span>
                      <span className="flex items-center gap-1.5 flex-1 truncate" style={{ fontSize: 12, color: '#44403c' }}>
                        {cfg.pill && <CrudPill type={type} />}
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Right: States + backend mapping */}
              <div className="flex flex-col gap-4">
                {/* Hover states */}
                <div className="border border-[#e7e5e3] rounded-lg bg-white p-3">
                  <p style={sLabel}>Item states</p>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: 10, color: '#a8a29e', width: 60 }}>default</span>
                      <div className="flex-1 flex items-start gap-2 p-1 rounded">
                        <span className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                          <Search className="w-3.5 h-3.5" style={{ color: '#a8a29e' }} />
                        </span>
                        <span style={{ fontSize: 12, color: '#44403c' }}>When hovering a collapsed item</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: 10, color: '#a8a29e', width: 60 }}>hover</span>
                      <div className="flex-1 flex items-start gap-2 p-1 rounded" style={{ backgroundColor: '#f8f7f5' }}>
                        <span className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                          <ChevronRight className="w-3.5 h-3.5" style={{ color: '#78716c' }} />
                        </span>
                        <span style={{ fontSize: 12, color: '#44403c' }}>When hovering an expanded item</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: 10, color: '#a8a29e', width: 60 }}>processing</span>
                      <div className="flex-1 flex items-start gap-2 p-1 rounded">
                        <span className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                          <img src="/plato-thinking.gif" alt="" className="w-3 h-3" style={{ objectFit: 'contain' }} />
                        </span>
                        <span style={{ fontSize: 12, color: '#78716c' }}>When step is processing</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Backend tool mapping */}
                <div className="flex flex-col gap-0 border border-[#e7e5e3] rounded-lg bg-white overflow-hidden">
                  <div className="flex items-center gap-2.5 px-3 py-1.5" style={{ backgroundColor: '#fafaf9', borderBottom: '1px solid #e7e5e3' }}>
                    <span style={{ ...sLabel, marginBottom: 0, flex: 1 }}>Backend tool</span>
                    <span style={{ ...sLabel, marginBottom: 0, width: 80 }}>Map to</span>
                    <span style={{ ...sLabel, marginBottom: 0, flex: 1 }}>Label FR</span>
                  </div>
                  {Object.entries(BACKEND_TOOL_MAP).map(([tool, mapping]) => {
                    const cfg = STEP_TYPE_CONFIG[mapping.type];
                    const Icon = cfg?.Icon;
                    const colors = STEP_COLORS[cfg?.color] || STEP_COLORS.default;
                    return (
                      <div key={tool} className="flex items-center gap-2.5 px-3 py-1.5" style={{ borderTop: '1px solid #f5f5f4' }}>
                        <span className="flex-1 truncate" style={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: '#78716c' }}>{tool}</span>
                        <span className="flex items-center gap-1 flex-shrink-0" style={{ width: 80 }}>
                          {Icon && <Icon className="w-3 h-3" style={{ color: colors.icon }} />}
                          <span style={{ fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", color: '#a8a29e' }}>{mapping.type}</span>
                        </span>
                        <span className="flex-1 truncate" style={{ fontSize: 12, color: '#44403c' }}>{mapping.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ── CrudBadges ── */}
            <h2 style={sH2}>CrudBadges (feature level badges)</h2>
            <p style={sP}>Le caractère de chaque étape CRUD est rapidement identifiable par un badge → indicateur. Couleur + diamant = indique le type dans le header collapsed. Indicateur = <span style={sCode}>ajout/modif./suppr.</span> → label mono apparaît dans la ligne d'étape CRUD. Counter → diamant + nombre dans le header collapsed.</p>

            <div className="flex items-center gap-6 mb-6 p-4 border border-[#e7e5e3] rounded-lg bg-white" style={{ maxWidth: 480 }}>
              <div>
                <p style={{ ...sLabel, marginBottom: 6 }}>Pills</p>
                <div className="flex items-center gap-2">
                  <CrudPill type="add_row" />
                  <CrudPill type="update_row" />
                  <CrudPill type="delete_row" />
                </div>
              </div>
              <div style={{ width: 1, height: 32, backgroundColor: '#e7e5e3' }} />
              <div>
                <p style={{ ...sLabel, marginBottom: 6 }}>Counters</p>
                <div className="flex items-center gap-3">
                  <DotCounter color="green" count={3} />
                  <DotCounter color="orange" count={1} />
                  <DotCounter color="red" count={1} />
                </div>
              </div>
            </div>

            {/* ── Tree / Tree zones ── */}
            <h2 style={sH2}>Tree / Tree zones (planning for deeper levels)</h2>
            <p style={sP}>
              Tree = connecteur vertical (1px, <span style={sCode}>#e7e5e4</span>) dans un gutter de 16px, branche horizontale par child row.<br/>
              Tree zone: Level 1 only for now.
            </p>

            <div className="flex items-start gap-4 mb-6">
              {/* Tree component visual */}
              <div className="rounded-lg overflow-hidden" style={{ backgroundColor: '#292524', padding: 20 }}>
                <div className="flex flex-col">
                  {/* Tree connector piece — vertical + horizontal branch */}
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="flex items-stretch" style={{ height: 24 }}>
                      <div className="relative" style={{ width: 20 }}>
                        <div className="absolute" style={{ left: 12, top: 0, bottom: i === 2 ? '50%' : 0, width: 1, backgroundColor: '#e7e5e4' }} />
                      </div>
                      <div className="relative" style={{ width: 20 }}>
                        <div className="absolute" style={{ left: 0, top: '50%', width: 10, height: 1, backgroundColor: '#e7e5e4' }} />
                      </div>
                      <div style={{ width: 40 }} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Tree zone — Level 1 */}
              <div className="rounded-lg overflow-hidden flex items-center justify-center" style={{ backgroundColor: '#292524', padding: 20 }}>
                <div className="rounded border border-dashed flex items-center justify-center" style={{ borderColor: '#78716c', width: 80, height: 64, position: 'relative' }}>
                  <span style={{ fontSize: 10, fontWeight: 600, color: '#a8a29e', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Level 1</span>
                  {/* Tree inside zone */}
                  <div className="absolute" style={{ left: -20, top: 8 }}>
                    {[0, 1].map((i) => (
                      <div key={i} className="flex items-stretch" style={{ height: 24 }}>
                        <div className="relative" style={{ width: 20 }}>
                          <div className="absolute" style={{ left: 12, top: 0, bottom: i === 1 ? '50%' : 0, width: 1, backgroundColor: '#e7e5e4' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Step + StepItem side-by-side ── */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className={sCard}>
                <p style={sLabel}>Step</p>
                <p style={{ fontSize: 11, color: '#78716c', marginBottom: 8 }}>Step est le composant qui gère le type + le style dans le ReasoningStepper.</p>
                <ReasoningStepper status="done" steps={[
                  { type: 'extract_data', label: 'Extraction et traitement DSA', status: 'done' },
                  { type: 'read_documents', label: 'Analyse de 4 documents', status: 'done' },
                  { type: 'read_rapport', label: "Lecture du rapport d'expertise médicale", status: 'done' },
                  { type: 'extract_data', label: 'Extraction des données en cours de...', status: 'done' },
                  { type: 'add_row', label: '3 lignes ajoutées', status: 'done', poste: 'DSA', children: ['Consultation spécialiste', 'IRM lombaire', 'Kinésithérapie'] },
                ]} expanded={true} onToggle={() => {}} />
              </div>
              <div className={sCard}>
                <p style={sLabel}>StepItem</p>
                <p style={{ fontSize: 11, color: '#78716c', marginBottom: 8 }}>StepItem = un simple wrapper padding + state default/hover.</p>
                <div className="flex flex-col gap-0">
                  <div className="flex items-start gap-2 p-1 rounded">
                    <span className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                      <FileSearch className="w-3.5 h-3.5" style={{ color: '#a8a29e' }} />
                    </span>
                    <span style={{ fontSize: 12, color: '#44403c' }}>Analyse de 4 documents</span>
                  </div>
                  <div className="flex items-start gap-2 p-1 rounded" style={{ backgroundColor: '#f8f7f5' }}>
                    <span className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                      <ChevronRight className="w-3.5 h-3.5" style={{ color: '#78716c' }} />
                    </span>
                    <span style={{ fontSize: 12, color: '#44403c' }}>Analyse de 4 documents</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* WHO GOT SUBITEMS, WHO GOT DESC                               */}
            {/* ══════════════════════════════════════════════════════════════ */}
            <h2 style={sH2}>Who got subitems, who got desc ?</h2>
            <p style={sP}>
              <span style={sCode}>1 child</span> = description inline sous le label (pas d'expand, toujours visible).<br/>
              <span style={sCode}>2+ children</span> = expandable tree avec connecteur vertical. Au clic, le chevron toggle les enfants.<br/>
              Un child est une simple ligne de texte ("line step" / sub item) sans icône.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className={sCard}>
                <p style={sLabel}>1 child = description</p>
                <ReasoningStepper status="done" steps={[
                  { type: 'extract_data', label: 'Extraction facture CHU', status: 'done', children: ['4 500 € — CPAM 3 200 €'] },
                ]} expanded={true} onToggle={() => {}} />
              </div>
              <div className={sCard}>
                <p style={sLabel}>2+ children = expandable tree avec connecteur</p>
                <ReasoningStepper status="done" steps={[
                  { type: 'read_documents', label: 'Analyse de 6 documents', status: 'done', children: ['rapport.pdf', 'facture_1.pdf', 'facture_2.pdf', 'facture_3.pdf', 'bulletin_01.pdf', 'bulletin_02.pdf'] },
                ]} expanded={true} onToggle={() => {}} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className={sCard}>
                <p style={sLabel}>Sub-agent with child steps</p>
                <ReasoningStepper status="done" steps={[
                  { type: 'sub_agent', label: 'Agent extraction factures', status: 'done', children_steps: [
                    { type: 'extract_data', label: 'Extraction facture CHU', status: 'done', children: ['4 500 €'] },
                    { type: 'extract_data', label: 'Extraction facture clinique', status: 'done', children: ['2 800 €'] },
                  ]},
                ]} expanded={true} onToggle={() => {}} />
              </div>
              <div className={sCard}>
                <p style={sLabel}>CRUD grouping (consecutive same type+poste)</p>
                <ReasoningStepper status="done" steps={[
                  { type: 'add_row', label: '1 ligne DSA', status: 'done', poste: 'DSA', children: ['Consultation spécialiste'] },
                  { type: 'add_row', label: '1 ligne DSA', status: 'done', poste: 'DSA', children: ['IRM lombaire'] },
                  { type: 'add_row', label: '1 ligne DSA', status: 'done', poste: 'DSA', children: ['Kinésithérapie'] },
                  { type: 'update_row', label: 'Taux DFP', status: 'done', poste: 'DFP', children: ['15% → 20%'] },
                ]} expanded={true} onToggle={() => {}} />
              </div>
            </div>

            {/* Lecture du rapport + sub-agents example */}
            <div className={sCard} style={{ marginBottom: 24 }}>
              <p style={sLabel}>Full example: Lecture + sous-agents + CRUD</p>
              <ReasoningStepper
                status="done"
                summary="Extraction et complétion DSA"
                counters={{ add: 2 }}
                steps={[
                  { type: 'read_rapport', label: "Lecture du rapport d'expertise", status: 'done' },
                  { type: 'sub_agent', label: 'Agent extraction factures', status: 'done', children_steps: [
                    { type: 'extract_data', label: 'Extraction facture CHU', status: 'done', children: ['4 500 €'] },
                    { type: 'extract_data', label: 'Extraction facture clinique', status: 'done', children: ['2 800 €'] },
                  ]},
                  { type: 'add_row', label: '2 lignes DSA', status: 'done', poste: 'DSA', children: ['CHU Bordeaux', 'Clinique St-Jean'] },
                ]}
                expanded={true}
                onToggle={() => {}}
              />
            </div>

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* USE CASE INTERACTIVE SANDBOX                                  */}
            {/* ══════════════════════════════════════════════════════════════ */}
            <h1 style={sH1}>Use case interactive sandbox</h1>
            <p style={sP}>Chaque scénario simule le streaming avec gif de processing (~15s), l'auto-collapse, puis l'expand/collapse pour inspection.</p>
            <div className="flex flex-col gap-4 mb-8" style={{ maxWidth: 560 }}>
              {Object.entries(REASONING_SCENARIOS).map(([id, scenario]) => (
                <ReasoningDemoScenario key={id} id={id} scenario={scenario} />
              ))}
            </div>

          </div>
        </div>
      </div>
    );
  };

  // ========== ROUTING ==========
  if (currentPage === 'reasoning-demo') {
    return renderReasoningDemoPage();
  }
  if (currentPage === 'diff-engine') {
    return renderDiffEnginePage();
  }
  if (currentPage === 'components') {
    return renderComponentsPage();
  }
  if (currentPage === 'iv-structures') {
    return renderIvStructuresPage();
  }
  if (currentPage === 'list') {
    return renderDossierListPage();
  }
  if (currentPage === 'baremes') {
    return renderBaremesLibraryPage();
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
          <div className={`flex-1 ${currentLevel.activeTab === 'jp' ? 'overflow-hidden' : 'overflow-y-auto'}`}>
            <div className={`${currentLevel.activeTab === 'jp' ? 'h-full' : 'min-h-full'} flex flex-col ${currentLevel.type === 'dossier' && currentLevel.activeTab !== 'jp' ? 'px-8 pt-6 pb-8' : ''}`}>{renderContent()}</div>
          </div>
        </div>

        {/* Right: Edit Panel or Chat Sidebar (full viewport height) */}
        {editPanel ? renderEditPanel() : (chatSidebarOpen && renderChatSidebar())}
      </div>

      {renderAddModal()}
      {renderExportModal()}
      {renderSmartProcedureWizard()}
      {baremeViewerOpen && renderBaremeViewer()}

      {/* JP Decision Drawer */}
      {jp.jpState.drawerDecisionId && (
        <DecisionDrawer
          decisionId={jp.jpState.drawerDecisionId}
          resultSet={jp.jpState.drawerResultSet}
          resultIndex={jp.jpState.drawerIndex}
          isPinned={jp.isDecisionPinned(jp.jpState.drawerDecisionId)}
          pinnedPosteIds={(jp.jpState.pinnedJP.find(p => p.decisionId === jp.jpState.drawerDecisionId)?.posteIds) || []}
          onClose={jp.closeDrawer}
          onPrev={jp.drawerPrev}
          onNext={jp.drawerNext}
          onPin={(id) => jp.pinDecision(id)}
          onUnpin={(id) => jp.unpinDecision(id)}
          onAttachToPoste={(id, posteId) => { jp.pinDecision(id); jp.togglePoste(id, posteId); }}
          posteOptions={jpPosteOptions}
        />
      )}

      {/* JP Popover Card */}
      {jpPopover && (
        <JPPopoverCard
          decision={jpPopover.decision}
          anchorRect={jpPopover.anchorRect}
          onOpenDrawer={(id) => { const rs = jpPopover.resultSet; setJpPopover(null); jp.openDrawer(id, rs); }}
          onMouseEnter={() => clearTimeout(jpPopoverTimeout.current)}
          onMouseLeave={() => { jpPopoverTimeout.current = setTimeout(() => setJpPopover(null), 300); }}
        />
      )}

      {/* JP Add Stepper Modal */}
      {jp.jpState.activeStepper === 'jp-add' && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={jp.closeStepper}>
          <div className="w-[460px]" onClick={(e) => e.stopPropagation()}>
            <JPAddStepper
              onClose={jp.closeStepper}
              onSubmit={({ url, impact, posteId }) => {
                // In the prototype, simulate adding a mock decision
                const mockId = 'jp-atpt-01';
                jp.pinDecision(mockId, { impact, posteId });
                setChatMessages(prev => [...prev, {
                  type: 'ai',
                  text: `Décision ajoutée au dossier${posteId ? ` et assignée au poste ${posteId.toUpperCase()}` : ''}.`,
                }]);
              }}
              posteOptions={jpPosteOptions}
            />
          </div>
        </div>
      )}

      {/* Toast notification */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 text-white text-body rounded-lg shadow-lg flex items-center gap-2 animate-fade-up bg-zinc-800`}>
          {toastMessage?.type === 'ai' ? (
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#4a9168' }} />
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

import { useReducer, useCallback, useRef, useEffect } from 'react';
import {
  REDACTION_SCENARIOS,
  ACT_TYPE_FLOW_CONFIG,
  DEFAULT_FLOW_CONFIG,
  EMPTY_ACTE,
  MOCK_ASSIGNATION_TEXT,
} from '../data/redactionScenarios';

// ─── Redaction State Reducer ─────────────────────────────────────────
const initialState = {
  activeStepper: null,       // null | 'awaiting-template-confirm' | 'awaiting-clarification'
  selectedActType: null,     // act type id string
  hasTemplate: false,        // whether a template was confirmed for current flow
  templateName: '',          // name of the confirmed template
  instructions: {},          // { fieldId: value }
  canvasOpen: false,
  canvasContent: '',
  canvasStreaming: false,
  canvasActeId: null,
  canvasActeTitle: '',
  canvasActeType: '',
  dossierActes: [],
};

function redactionReducer(state, action) {
  switch (action.type) {
    case 'SET_STEPPER':
      return { ...state, activeStepper: action.stepperType, selectedActType: action.preselectedType || state.selectedActType };
    case 'CLOSE_STEPPER':
      return { ...state, activeStepper: null };
    case 'SELECT_ACT_TYPE':
      return { ...state, selectedActType: action.actType };
    case 'SET_TEMPLATE':
      return { ...state, hasTemplate: true, templateName: action.name || '' };
    case 'CLEAR_TEMPLATE':
      return { ...state, hasTemplate: false, templateName: '' };
    case 'SET_INSTRUCTIONS':
      return { ...state, instructions: action.instructions };
    case 'OPEN_CANVAS':
      return {
        ...state,
        canvasOpen: true,
        canvasContent: '',
        canvasStreaming: true,
        canvasActeId: action.acteId,
        canvasActeTitle: action.title || '',
        canvasActeType: action.actType || '',
      };
    case 'CLOSE_CANVAS':
      return { ...state, canvasOpen: false, canvasStreaming: false };
    case 'CLEAR_PENDING':
      return { ...state, selectedActType: null, instructions: {}, hasTemplate: false, templateName: '' };
    case 'RESTART_STREAMING':
      return { ...state, canvasContent: '', canvasStreaming: true };
    case 'SET_CONTENT':
      return { ...state, canvasContent: action.text };
    case 'STREAM_CONTENT':
      return { ...state, canvasContent: state.canvasContent + action.text };
    case 'STREAM_COMPLETE':
      return { ...state, canvasStreaming: false };
    case 'ADD_ACTE':
      return { ...state, dossierActes: [...state.dossierActes, action.acte] };
    case 'UPDATE_ACTE': {
      const targetId = action.acteId || state.canvasActeId;
      return {
        ...state,
        dossierActes: state.dossierActes.map(a => a.id === targetId ? { ...a, ...action.updates } : a),
      };
    }
    case 'REOPEN_CANVAS': {
      const acte = state.dossierActes.find(a => a.id === action.acteId);
      if (!acte) return state;
      return {
        ...state,
        canvasOpen: true,
        canvasContent: acte.content,
        canvasStreaming: false,
        canvasActeId: acte.id,
        canvasActeTitle: acte.title,
        canvasActeType: acte.actType,
      };
    }
    default:
      return state;
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────
export default function useRedactionCommands({ setChatMessages, navigateTo, onUserAsk } = {}) {
  const [redactionState, dispatch] = useReducer(redactionReducer, initialState);
  const timeoutsRef = useRef([]);
  const contentRef = useRef('');

  // Keep contentRef in sync so modifyZone always reads the latest content
  useEffect(() => { contentRef.current = redactionState.canvasContent; }, [redactionState.canvasContent]);

  const clearTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  // ─── Generic action player ──────────────────────────────────────────
  // Plays an array of actions with delays, same engine as playScenario
  const playActions = useCallback((actions) => {
    clearTimeouts();
    let cumulativeDelay = 0;

    actions.forEach((action) => {
      if (action.type === 'DELAY') {
        cumulativeDelay += action.ms;
        return;
      }

      const t = setTimeout(() => {
        switch (action.type) {
          case 'USER_MESSAGE':
            setChatMessages?.(prev => [...prev, { type: 'user', text: action.text }]);
            break;

          case 'AGENT_REASONING':
            setChatMessages?.(prev => [...prev, {
              type: 'ai-thinking',
              label: action.headline,
              status: 'done',
              summary: action.detail,
              steps: [{ label: action.detail, status: 'done' }],
            }]);
            break;

          case 'AGENT_REASONING_STEPS':
            setChatMessages?.(prev => [...prev, {
              type: 'ai-thinking',
              label: action.label || 'Rédaction',
              status: 'done',
              steps: action.steps,
            }]);
            break;

          case 'AGENT_MESSAGE':
            setChatMessages?.(prev => [...prev, { type: 'ai', text: action.text }]);
            break;

          case 'REASONING_COLLAPSED':
            setChatMessages?.(prev => [...prev, {
              type: 'ai-thinking',
              label: action.text,
              status: 'done',
              steps: [{ label: action.text, status: 'done' }],
              expanded: false,
              collapsed: true,
            }]);
            break;

          case 'ARTIFACT_CARD':
            // Removed — no artifact cards in chat
            break;

          case 'SET_STEPPER_STATE':
            dispatch({ type: 'SET_STEPPER', stepperType: action.stepperType });
            break;

          case 'USER_ASK':
            onUserAsk?.(action.questions);
            break;

          case 'OPEN_CANVAS': {
            const acteId = `acte-${Date.now()}`;
            dispatch({ type: 'CLOSE_STEPPER' });
            dispatch({ type: 'CLEAR_PENDING' });
            dispatch({
              type: 'ADD_ACTE',
              acte: {
                ...EMPTY_ACTE,
                id: acteId,
                actType: action.actType,
                title: action.title,
                status: 'brouillon',
                lastUpdated: new Date().toLocaleDateString('fr-FR'),
                content: '',
              },
            });
            dispatch({ type: 'OPEN_CANVAS', acteId, title: action.title, actType: action.actType });
            navigateTo?.({ type: 'acte', id: acteId, title: action.title, fullTitle: action.title });
            break;
          }

          case 'RESTART_STREAMING':
            dispatch({ type: 'RESTART_STREAMING' });
            break;

          case 'STREAM_CONTENT': {
            const fullText = action.text;
            const chunkSize = action.chunkSize || 40;
            const chunkDelay = action.chunkDelay || 30;
            const totalChunks = Math.ceil(fullText.length / chunkSize);

            for (let i = 0; i < totalChunks; i++) {
              const chunk = fullText.slice(i * chunkSize, (i + 1) * chunkSize);
              const st = setTimeout(() => {
                dispatch({ type: 'STREAM_CONTENT', text: chunk });
              }, i * chunkDelay);
              timeoutsRef.current.push(st);
            }

            const completionT = setTimeout(() => {
              dispatch({ type: 'STREAM_COMPLETE' });
              dispatch({
                type: 'UPDATE_ACTE',
                acteId: null,
                updates: { content: fullText },
              });
            }, totalChunks * chunkDelay + 100);
            timeoutsRef.current.push(completionT);
            break;
          }

          default:
            break;
        }
      }, cumulativeDelay);

      timeoutsRef.current.push(t);
    });
  }, [setChatMessages, clearTimeouts, navigateTo, onUserAsk]);

  // Play a named scenario from REDACTION_SCENARIOS
  const playScenario = useCallback((scenarioKey) => {
    const scenario = REDACTION_SCENARIOS[scenarioKey];
    if (!scenario) return;
    playActions(scenario.actions);
  }, [playActions]);

  // ─── 5-Step Flow Methods ────────────────────────────────────────────

  // Get flow config for an act type
  const getConfig = (actType) => ACT_TYPE_FLOW_CONFIG[actType] || DEFAULT_FLOW_CONFIG;

  // STEP 1 — Template check
  // Called when user triggers redaction (NL or slash command)
  // templates: array of matching templates from the library
  // attachments: array of docs user attached with the message
  const startRedaction = useCallback((actType, { templates = [], attachments = [] } = {}) => {
    dispatch({ type: 'SELECT_ACT_TYPE', actType });

    const actTypeDef = require('../data/redactionScenarios').REDACTION_ACT_TYPES.find(t => t.id === actType);
    const label = actTypeDef?.label || actType;

    // Step 1: collapsed reasoning for template search
    const actions = [
      { type: 'REASONING_COLLAPSED', text: `Recherche de modèles · ${label.toLowerCase()}` },
      { type: 'DELAY', ms: 500 },
    ];

    if (attachments.length > 0) {
      // User already dropped a template → skip template confirm, go to step 2
      dispatch({ type: 'SET_TEMPLATE', name: attachments[0].name });
      actions.push({
        type: 'AGENT_MESSAGE',
        text: `Je m'appuie sur «${attachments[0].name}» comme modèle pour la ${label.toLowerCase()}.`,
      });
      // Immediately chain into Reasoning #1 → #2 → Generation
      actions.push({ type: 'DELAY', ms: 600 });
      actions.push(...buildReasoning1ThroughGeneration(actType, true));
      playActions(actions);
    } else if (templates.length > 0) {
      // Found templates in library → suggest them
      const names = templates.map(t => `«${t.label || t.fileName}»`);
      const inline = names.length === 1 ? names[0] : names.slice(0, -1).join(', ') + ' et ' + names[names.length - 1];
      actions.push({
        type: 'AGENT_MESSAGE',
        text: `J'ai trouvé ${templates.length > 1 ? templates.length + ' modèles correspondants' : 'un modèle correspondant'} dans votre bibliothèque : ${inline}\n\nSouhaitez-vous l'utiliser, déposer un autre via 📎, ou partir de zéro ?`,
      });
      actions.push({ type: 'SET_STEPPER_STATE', stepperType: 'awaiting-template-confirm' });
      playActions(actions);
    } else {
      // No templates found
      actions.push({
        type: 'AGENT_MESSAGE',
        text: `Pas de modèle de ${label.toLowerCase()} dans votre bibliothèque.\n\nVous pouvez déposer un modèle via 📎 ou je génère librement à partir du dossier.`,
      });
      actions.push({ type: 'SET_STEPPER_STATE', stepperType: 'awaiting-template-confirm' });
      playActions(actions);
    }
  }, [playActions]);

  // STEP 1 response — user confirms template choice
  const handleTemplateConfirm = useCallback((userText, attachments) => {
    dispatch({ type: 'CLOSE_STEPPER' });

    const actType = redactionState.selectedActType;
    if (!actType) return;

    const hasAttachment = attachments && attachments.length > 0;
    const norm = userText.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const confirmedTemplate = hasAttachment || /utilise|oui|ok|yes|modele|template/.test(norm);

    if (hasAttachment) {
      dispatch({ type: 'SET_TEMPLATE', name: attachments[0].name });
    } else if (confirmedTemplate) {
      dispatch({ type: 'SET_TEMPLATE', name: 'bibliothèque' });
    }

    const actions = [];
    if (hasAttachment) {
      actions.push({ type: 'REASONING_COLLAPSED', text: `Modèle reçu : ${attachments[0].name}` });
      actions.push({ type: 'DELAY', ms: 400 });
    }

    // Chain into Reasoning #1 → (maybe clarify) → #2 → Generation
    actions.push(...buildReasoning1ThroughGeneration(actType, confirmedTemplate || hasAttachment));
    playActions(actions);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [redactionState.selectedActType, playActions]);

  // STEP 3 response — user answers clarification questions
  const handleClarificationReply = useCallback((userText) => {
    dispatch({ type: 'CLOSE_STEPPER' });
    dispatch({ type: 'SET_INSTRUCTIONS', instructions: { _freeText: userText } });

    const actType = redactionState.selectedActType;
    if (!actType) return;

    const config = getConfig(actType);
    const gen = config.generation;

    // Steps 4+5: Reasoning #2 → Generation
    const actions = [
      { type: 'AGENT_REASONING_STEPS', label: 'Plan de rédaction', steps: config.reasoning2.steps },
      { type: 'DELAY', ms: 800 },
      { type: 'OPEN_CANVAS', actType: gen.actType, title: gen.title },
      { type: 'DELAY', ms: 300 },
      { type: 'STREAM_CONTENT', text: gen.text, chunkSize: 40, chunkDelay: 30 },
      { type: 'DELAY', ms: 200 },
      { type: 'AGENT_MESSAGE', text: gen.doneMessage },
    ];

    playActions(actions);
  }, [redactionState.selectedActType, playActions]);

  // ─── Action builders ────────────────────────────────────────────────

  // Build actions for Steps 2 through 5 (or 2→3 if gaps)
  function buildReasoning1ThroughGeneration(actType, hasTemplate) {
    const config = getConfig(actType);
    const actions = [];

    // Step 2: Reasoning #1 — context analysis
    const r1Steps = [...config.reasoning1.steps];
    // Swap template step label if user has no template
    if (!hasTemplate) {
      const tplIdx = r1Steps.findIndex(s => s.label.includes('Template'));
      if (tplIdx !== -1) {
        r1Steps[tplIdx] = { ...r1Steps[tplIdx], label: 'Pas de modèle — génération libre' };
      }
    }
    actions.push({ type: 'AGENT_REASONING_STEPS', label: 'Analyse du contexte', steps: r1Steps });

    if (config.reasoning1.hasGaps) {
      // Step 3: Clarify — ask user for missing info
      actions.push({ type: 'DELAY', ms: 500 });
      actions.push({ type: 'AGENT_MESSAGE', text: config.reasoning1.gapMessage });
      actions.push({ type: 'SET_STEPPER_STATE', stepperType: 'awaiting-clarification' });
    } else {
      // No gaps → straight to Step 4+5
      const gen = config.generation;
      actions.push({ type: 'DELAY', ms: 800 });
      actions.push({ type: 'AGENT_REASONING_STEPS', label: 'Plan de rédaction', steps: config.reasoning2.steps });
      actions.push({ type: 'DELAY', ms: 800 });
      actions.push({ type: 'OPEN_CANVAS', actType: gen.actType, title: gen.title });
      actions.push({ type: 'DELAY', ms: 300 });
      actions.push({ type: 'STREAM_CONTENT', text: gen.text, chunkSize: 40, chunkDelay: 30 });
      actions.push({ type: 'DELAY', ms: 200 });
      actions.push({ type: 'AGENT_MESSAGE', text: gen.doneMessage });
    }

    return actions;
  }

  // ─── Zone modification (unchanged) ──────────────────────────────────

  const fakeModify = (zone, instruction) => {
    const lw = instruction.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (lw.includes('supprime') || lw.includes('retire') || lw.includes('enleve')) return '';
    if (lw.includes('remplace par ')) return instruction.slice(instruction.toLowerCase().indexOf('remplace par ') + 13).trim() || zone;
    if (lw.includes('ajoute avant') || lw.includes('insere avant')) return `${instruction.replace(/ajoute avant|ins[eè]re avant/i, '').trim() || 'Conformément aux dispositions applicables,'}\n\n${zone}`;
    if (lw.includes('ajoute') || lw.includes('insere') || lw.includes('mentionne') || lw.includes('integre') || lw.includes('precise')) return `${zone}\n\n${instruction.replace(/ajoute|ins[eè]re|mentionne|int[eè]gre|pr[eé]cise/i, '').trim().replace(/^./, c => c.toUpperCase())}${instruction.endsWith('.') ? '' : '.'}`;
    if (lw.includes('reformule') || lw.includes('reecris') || lw.includes('ameliore') || lw.includes('clarifie')) { const s = zone.split(/(?<=\.)\s+/).filter(Boolean); return s.length > 1 ? [...s.slice(1), s[0]].join(' ') : `Il est établi que ${zone.charAt(0).toLowerCase()}${zone.slice(1)}`; }
    if (lw.includes('raccourcis') || lw.includes('resume') || lw.includes('synthetise')) { const s = zone.split(/(?<=\.)\s+/).filter(Boolean); return s.slice(0, Math.max(1, Math.ceil(s.length / 2))).join(' '); }
    return `${zone}\n\nSelon les éléments du dossier et conformément à l'instruction formulée : ${instruction.charAt(0).toLowerCase()}${instruction.slice(1)}${instruction.endsWith('.') ? '' : '.'}`;
  };

  const modifyZone = useCallback((userInstruction, zoneText) => {
    const currentContent = contentRef.current;

    const cleanZone = zoneText.replace(/…$/, '');
    const zoneIdx = currentContent.indexOf(cleanZone);

    if (zoneIdx !== -1) {
      // extend match to end of paragraph for better context
    }

    setChatMessages?.(prev => [...prev, {
      type: 'ai-thinking',
      label: 'Modification en cours',
      status: 'done',
      steps: [
        { type: 'read_documents', label: `Analyse de la zone : « ${zoneText.slice(0, 40)}${zoneText.length > 40 ? '…' : ''} »`, status: 'done' },
        { type: 'calculate', label: 'Application de la modification demandée', status: 'done' },
        { type: 'read_documents', label: 'Vérification de la cohérence globale', status: 'done' },
      ],
    }]);

    const before = zoneIdx !== -1 ? currentContent.slice(0, zoneIdx) : currentContent;
    const afterZoneEnd = zoneIdx !== -1 ? (currentContent.indexOf('\n\n', zoneIdx + cleanZone.length) !== -1 ? currentContent.indexOf('\n\n', zoneIdx + cleanZone.length) : currentContent.length) : currentContent.length;
    const after = currentContent.slice(afterZoneEnd);
    const modifiedZone = zoneIdx !== -1 ? fakeModify(currentContent.slice(zoneIdx, afterZoneEnd), userInstruction) : fakeModify(zoneText, userInstruction);
    const finalContent = before + modifiedZone + after;

    const t1 = setTimeout(() => {
      dispatch({ type: 'SET_CONTENT', text: before + after });
    }, 800);
    timeoutsRef.current.push(t1);

    const t2 = setTimeout(() => {
      const chunkSize = 20;
      const chunkDelay = 20;
      const totalChunks = Math.ceil(modifiedZone.length / chunkSize);

      for (let i = 0; i < totalChunks; i++) {
        const partial = modifiedZone.slice(0, (i + 1) * chunkSize);
        const st = setTimeout(() => {
          dispatch({ type: 'SET_CONTENT', text: before + partial + after });
        }, i * chunkDelay);
        timeoutsRef.current.push(st);
      }

      const completionT = setTimeout(() => {
        dispatch({ type: 'SET_CONTENT', text: finalContent });
        dispatch({ type: 'STREAM_COMPLETE' });
        dispatch({ type: 'UPDATE_ACTE', acteId: null, updates: { content: finalContent } });
        setChatMessages?.(prev => [...prev, {
          type: 'ai',
          text: `La section a été modifiée selon votre demande :\n\n— **Zone ciblée** : « ${zoneText.slice(0, 50)}${zoneText.length > 50 ? '…' : ''} »\n— **Instruction** : ${userInstruction}\n\nRelisez l'acte et dites-moi si d'autres ajustements sont nécessaires.`,
        }]);
      }, totalChunks * chunkDelay + 50);
      timeoutsRef.current.push(completionT);
    }, 1000);
    timeoutsRef.current.push(t2);
  }, [setChatMessages]);

  // ─── Canvas & Acte management ───────────────────────────────────────

  const openCanvas = useCallback((acteId) => {
    dispatch({ type: 'REOPEN_CANVAS', acteId });
    const acte = redactionState.dossierActes.find(a => a.id === acteId);
    if (acte) {
      navigateTo?.({ type: 'acte', id: acteId, title: acte.title, fullTitle: acte.title });
    }
  }, [redactionState.dossierActes, navigateTo]);

  const closeCanvas = useCallback(() => dispatch({ type: 'CLOSE_CANVAS' }), []);

  const updateActeStatus = useCallback((acteId, status) => {
    dispatch({ type: 'UPDATE_ACTE', acteId, updates: { status } });
  }, []);

  const openStepper = useCallback((type, preselectedType) => {
    dispatch({ type: 'SET_STEPPER', stepperType: type || 'type-select', preselectedType });
  }, []);

  const closeStepper = useCallback(() => dispatch({ type: 'CLOSE_STEPPER' }), []);

  return {
    redactionState,
    dispatch,
    playScenario,
    playActions,
    startRedaction,
    handleTemplateConfirm,
    handleClarificationReply,
    modifyZone,
    openStepper,
    closeStepper,
    openCanvas,
    closeCanvas,
    updateActeStatus,
  };
}

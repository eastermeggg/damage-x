import { useReducer, useCallback, useRef } from 'react';
import { DEMO_SCENARIOS } from '../data/demoScenarios';

// ─── JP State Reducer ─────────────────────────────────────────────────
const initialState = {
  pinnedJP: [],        // Array of PinnedJP records
  drawerDecisionId: null,
  drawerResultSet: [],
  drawerIndex: 0,
  activeStepper: null, // 'jp-add' | 'jp-save' | null
};

function jpReducer(state, action) {
  switch (action.type) {
    case 'PIN_DECISION': {
      if (state.pinnedJP.some(p => p.decisionId === action.decisionId && p.dossierId === action.dossierId)) return state;
      return {
        ...state,
        pinnedJP: [...state.pinnedJP, {
          id: `pin-${Date.now()}`,
          decisionId: action.decisionId,
          dossierId: action.dossierId || 'dossier-1',
          posteId: action.posteId || null,
          impact: action.impact || '',
          addedAt: new Date().toISOString(),
          addedBy: 'user',
        }],
      };
    }
    case 'UNPIN_DECISION':
      return { ...state, pinnedJP: state.pinnedJP.filter(p => p.decisionId !== action.decisionId) };

    case 'ATTACH_TO_POSTE':
      return {
        ...state,
        pinnedJP: state.pinnedJP.map(p =>
          p.decisionId === action.decisionId ? { ...p, posteId: action.posteId } : p
        ),
      };

    case 'OPEN_DRAWER': {
      const resultSet = action.resultSet || [];
      const index = resultSet.indexOf(action.decisionId);
      return {
        ...state,
        drawerDecisionId: action.decisionId,
        drawerResultSet: resultSet,
        drawerIndex: index >= 0 ? index : 0,
      };
    }
    case 'CLOSE_DRAWER':
      return { ...state, drawerDecisionId: null, drawerResultSet: [], drawerIndex: 0 };

    case 'DRAWER_PREV': {
      if (state.drawerIndex <= 0) return state;
      const newIdx = state.drawerIndex - 1;
      return { ...state, drawerIndex: newIdx, drawerDecisionId: state.drawerResultSet[newIdx] };
    }
    case 'DRAWER_NEXT': {
      if (state.drawerIndex >= state.drawerResultSet.length - 1) return state;
      const newIdx = state.drawerIndex + 1;
      return { ...state, drawerIndex: newIdx, drawerDecisionId: state.drawerResultSet[newIdx] };
    }

    case 'SET_STEPPER':
      return { ...state, activeStepper: action.stepperType };
    case 'CLOSE_STEPPER':
      return { ...state, activeStepper: null };

    default:
      return state;
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────
export default function useDemoCommands({ setChatMessages, setNavStack, tabsConfig } = {}) {
  const [jpState, dispatch] = useReducer(jpReducer, initialState);
  const timeoutsRef = useRef([]);

  const clearTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  // Play a demo scenario — dispatches actions with delays into chat + JP state
  const playScenario = useCallback((scenarioKey) => {
    const scenario = DEMO_SCENARIOS[scenarioKey];
    if (!scenario) return;

    clearTimeouts();
    let cumulativeDelay = 0;

    scenario.actions.forEach((action) => {
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

          case 'AGENT_MESSAGE':
            setChatMessages?.(prev => [...prev, {
              type: 'ai-jp',
              text: action.text,
              pills: action.pills || [],
            }]);
            break;

          case 'OPEN_DRAWER':
            dispatch({ type: 'OPEN_DRAWER', decisionId: action.decisionId, resultSet: action.resultSet });
            break;

          case 'TRIGGER_STEPPER':
            dispatch({ type: 'SET_STEPPER', stepperType: action.stepperType });
            break;

          case 'SWITCH_CANVAS_VIEW':
            if (action.view === 'jp-list' && setNavStack) {
              setNavStack(prev => {
                const base = prev.length > 0 ? [{ ...prev[0], activeTab: 'jp' }] : [];
                return base;
              });
            }
            break;

          case 'ARTIFACT_CARD':
            setChatMessages?.(prev => [...prev, {
              type: 'ai',
              text: `${action.title} — ${action.summary}`,
            }]);
            break;

          default:
            break;
        }
      }, cumulativeDelay);

      timeoutsRef.current.push(t);
    });
  }, [setChatMessages, setNavStack, clearTimeouts]);

  // Convenience helpers
  const openDrawer = useCallback((decisionId, resultSet) => {
    dispatch({ type: 'OPEN_DRAWER', decisionId, resultSet });
  }, []);

  const closeDrawer = useCallback(() => dispatch({ type: 'CLOSE_DRAWER' }), []);
  const drawerPrev = useCallback(() => dispatch({ type: 'DRAWER_PREV' }), []);
  const drawerNext = useCallback(() => dispatch({ type: 'DRAWER_NEXT' }), []);

  const pinDecision = useCallback((decisionId, opts = {}) => {
    dispatch({ type: 'PIN_DECISION', decisionId, ...opts });
  }, []);

  const unpinDecision = useCallback((decisionId) => {
    dispatch({ type: 'UNPIN_DECISION', decisionId });
  }, []);

  const attachToPoste = useCallback((decisionId, posteId) => {
    dispatch({ type: 'ATTACH_TO_POSTE', decisionId, posteId });
  }, []);

  const isDecisionPinned = useCallback((decisionId) => {
    return jpState.pinnedJP.some(p => p.decisionId === decisionId);
  }, [jpState.pinnedJP]);

  const getPinnedForPoste = useCallback((posteId) => {
    return jpState.pinnedJP.filter(p => p.posteId === posteId);
  }, [jpState.pinnedJP]);

  const openStepper = useCallback((type) => dispatch({ type: 'SET_STEPPER', stepperType: type }), []);
  const closeStepper = useCallback(() => dispatch({ type: 'CLOSE_STEPPER' }), []);

  return {
    jpState,
    dispatch,
    playScenario,
    openDrawer,
    closeDrawer,
    drawerPrev,
    drawerNext,
    pinDecision,
    unpinDecision,
    attachToPoste,
    isDecisionPinned,
    getPinnedForPoste,
    openStepper,
    closeStepper,
  };
}

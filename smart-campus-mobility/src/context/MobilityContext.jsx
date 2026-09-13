import { createContext, useContext, useReducer, useMemo, useCallback, useRef } from 'react';
import { getBuses, getRoutes, getIncidents } from '../services/mockMobility';
import { getMobilityRecommendation } from '../services/mockAI';
import { DELAY_OVERRIDE, DESTINATIONS } from '../data/mockData';

const MobilityContext = createContext(null);

const initialState = {
  buses: getBuses(),
  routes: getRoutes(),
  incidents: getIncidents(),
  selectedDestination: 'Block C',
  notifications: [],
  demoDelayActive: false,
};

function computeRecommendation(state) {
  return getMobilityRecommendation(
    state.selectedDestination,
    state.buses,
    state.routes,
    state.incidents
  );
}

let toastId = 0;

function reducer(state, action) {
  switch (action.type) {
    case 'SET_DESTINATION': {
      return { ...state, selectedDestination: action.payload };
    }
    case 'SIMULATE_DELAY': {
      const buses = state.buses.map((bus) =>
        bus.id === 'BUS12' ? { ...bus, ...DELAY_OVERRIDE, progress: bus.progress } : bus
      );
      const incidents = [
        {
          id: `inc-${Date.now()}`,
          busId: 'BUS12',
          message: 'Route R1 is experiencing a delay.',
          severity: 'delayed',
        },
      ];
      return { ...state, buses, incidents, demoDelayActive: true };
    }
    case 'RESET_DEMO': {
      return {
        ...state,
        buses: getBuses(),
        routes: getRoutes(),
        incidents: getIncidents(),
        demoDelayActive: false,
      };
    }
    case 'PUSH_NOTIFICATION': {
      const notification = { id: toastId++, ...action.payload };
      return { ...state, notifications: [...state.notifications, notification] };
    }
    case 'DISMISS_NOTIFICATION': {
      return {
        ...state,
        notifications: state.notifications.filter((n) => n.id !== action.payload),
      };
    }
    default:
      return state;
  }
}

export function MobilityProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const prevRecommendedRef = useRef(null);

  const recommendation = useMemo(() => computeRecommendation(state), [
    state.selectedDestination,
    state.buses,
    state.routes,
    state.incidents,
  ]);

  const pushNotification = useCallback((message, tone = 'info') => {
    dispatch({ type: 'PUSH_NOTIFICATION', payload: { message, tone } });
  }, []);

  const dismissNotification = useCallback((id) => {
    dispatch({ type: 'DISMISS_NOTIFICATION', payload: id });
  }, []);

  const setDestination = useCallback(
    (destination) => {
      dispatch({ type: 'SET_DESTINATION', payload: destination });
    },
    []
  );

  const simulateDelay = useCallback(() => {
    dispatch({ type: 'SIMULATE_DELAY' });
    pushNotification('Route R1 is experiencing a delay.', 'delayed');
    pushNotification('BUS 12 is currently delayed.', 'warning');
  }, [pushNotification]);

  const resetDemo = useCallback(() => {
    dispatch({ type: 'RESET_DEMO' });
    pushNotification('Demo reset. All buses are back on schedule.', 'success');
  }, [pushNotification]);

  // Notify when the AI recommendation itself changes bus.
  const recommendedId = recommendation.recommendedBus?.id ?? null;
  if (prevRecommendedRef.current === null) {
    prevRecommendedRef.current = recommendedId;
  } else if (prevRecommendedRef.current !== recommendedId) {
    prevRecommendedRef.current = recommendedId;
    // Fire outside render via microtask to avoid updating state during render.
    queueMicrotask(() => pushNotification('AI recommendation updated.', 'ai'));
  }

  const value = useMemo(
    () => ({
      ...state,
      destinations: DESTINATIONS,
      recommendation,
      setDestination,
      simulateDelay,
      resetDemo,
      pushNotification,
      dismissNotification,
    }),
    [state, recommendation, setDestination, simulateDelay, resetDemo, pushNotification, dismissNotification]
  );

  return <MobilityContext.Provider value={value}>{children}</MobilityContext.Provider>;
}

export function useMobility() {
  const ctx = useContext(MobilityContext);
  if (!ctx) throw new Error('useMobility must be used within a MobilityProvider');
  return ctx;
}

import {
    createContext,
    useContext,
    useReducer,
    useMemo,
    useCallback,
    useRef,
    useEffect,
    useState,
} from "react";

import { getBuses, getRoutes, getIncidents } from "../services/mockMobility";
import { getMobilityRecommendation } from "../services/mockAI";
import { DESTINATIONS } from "../data/mockData";

const MobilityContext = createContext(null);

const initialState = {
    buses: [],
    routes: getRoutes(),
    incidents: getIncidents(),
    selectedDestination: "Main Gate",
    currentLocation: "Main Gate",
    notifications: [],
    demoDelayActive: false,
};

function reducer(state, action) {
    switch (action.type) {
        case "SET_BUSES":
            return {
                ...state,
                buses: action.payload,
            };

        case "SET_CURRENT_LOCATION":
            return {
                ...state,
                currentLocation: action.payload,
            };

        case "SET_DESTINATION":
            return {
                ...state,
                selectedDestination: action.payload,
            };

        case "SIMULATE_DELAY":
            return {
                ...state,
                demoDelayActive: true,
            };

        case "RESET_DEMO":
            return {
                ...state,
                demoDelayActive: false,
            };

        case "PUSH_NOTIFICATION": {
            return {
                ...state,
                notifications: [
                    ...state.notifications,
                    {
                        id: Date.now() + Math.random(),
                        ...action.payload,
                    },
                ],
            };
        }

        case "DISMISS_NOTIFICATION":
            return {
                ...state,
                notifications: state.notifications.filter(
                    (n) => n.id !== action.payload
                ),
            };

        default:
            return state;
    }
}

export function MobilityProvider({ children }) {
    const [state, dispatch] = useReducer(reducer, initialState);

    const [recommendation, setRecommendation] = useState({
        recommendedBus: null,
        eta: null,
        reason: "Loading live recommendation...",
        alternative: null,
    });

    const [loading, setLoading] = useState(true);
    const prevRecommendedRef = useRef(null);

    const loadBuses = useCallback(async () => {
        try {
            const buses = await getBuses();

            dispatch({
                type: "SET_BUSES",
                payload: buses,
            });

            setLoading(false);
        } catch (error) {
            console.error("Unable to load live buses:", error);

            setLoading(false);

            dispatch({
                type: "PUSH_NOTIFICATION",
                payload: {
                    message: "Unable to load live bus data.",
                    tone: "warning",
                },
            });
        }
    }, []);

    useEffect(() => {
        loadBuses();

        const interval = setInterval(() => {
            loadBuses();
        }, 5000);

        return () => clearInterval(interval);
    }, [loadBuses]);

    const loadRecommendation = useCallback(async () => {
        if (!state.selectedDestination) {
            return;
        }

        setRecommendation((current) => ({
            ...current,
            reason: "Finding the best live bus...",
        }));

        const result = await getMobilityRecommendation(
            state.currentLocation,
            state.selectedDestination,
            state.buses,
            state.routes,
            state.incidents
        );

        setRecommendation(result);
    }, [
        state.currentLocation,
        state.selectedDestination,
        state.buses,
        state.routes,
        state.incidents,
    ]);

    useEffect(() => {
        if (state.buses.length > 0) {
            loadRecommendation();
        }
    }, [
        state.selectedDestination,
        state.buses,
        loadRecommendation,
    ]);

    const pushNotification = useCallback((message, tone = "info") => {
        dispatch({
            type: "PUSH_NOTIFICATION",
            payload: { message, tone },
        });
    }, []);

    const dismissNotification = useCallback((id) => {
        dispatch({
            type: "DISMISS_NOTIFICATION",
            payload: id,
        });
    }, []);

    const setCurrentLocation = useCallback((location) => {
        dispatch({
            type: "SET_CURRENT_LOCATION",
            payload: location,
        });
    }, []);

    const setDestination = useCallback((destination) => {
        dispatch({
            type: "SET_DESTINATION",
            payload: destination,
        });
    }, []);

    const simulateDelay = useCallback(async () => {
        try {
            const response = await fetch("http://localhost:3000/api/demo/delay", {
                method: "POST",
            });

            if (!response.ok) {
                throw new Error("Unable to activate demo delay");
            }

            dispatch({ type: "SIMULATE_DELAY" });

            pushNotification(
                "BUS12 delay activated. Live data is updating.",
                "delayed"
            );

            await loadBuses();
        } catch (error) {
            console.error("Demo delay error:", error);

            pushNotification(
                "Unable to activate demo delay.",
                "warning"
            );
        }
    }, [pushNotification, loadBuses]);

    const resetDemo = useCallback(async () => {
        try {
            const response = await fetch("http://localhost:3000/api/demo/reset", {
                method: "POST",
            });

            if (!response.ok) {
                throw new Error("Unable to reset demo");
            }

            dispatch({ type: "RESET_DEMO" });

            await loadBuses();

            pushNotification(
                "Demo reset. Live bus data restored.",
                "success"
            );
        } catch (error) {
            console.error("Demo reset error:", error);

            pushNotification(
                "Unable to reset demo.",
                "warning"
            );
        }
    }, [loadBuses, pushNotification]);

    const recommendedId =
        recommendation.recommendedBus?.id ?? null;

    useEffect(() => {
        if (prevRecommendedRef.current === null) {
            prevRecommendedRef.current = recommendedId;
            return;
        }

        if (
            recommendedId &&
            prevRecommendedRef.current !== recommendedId
        ) {
            prevRecommendedRef.current = recommendedId;

            pushNotification(
                `AI recommendation changed to ${recommendedId}.`,
                "ai"
            );
        }
    }, [recommendedId, pushNotification]);

    const value = useMemo(
        () => ({
            ...state,
            destinations: DESTINATIONS,
            recommendation,
            loading,
            setCurrentLocation,
            setDestination,
            simulateDelay,
            resetDemo,
            pushNotification,
            dismissNotification,
        }),
        [
            state,
            recommendation,
            loading,
            setDestination,
            simulateDelay,
            resetDemo,
            pushNotification,
            dismissNotification,
        ]
    );

    return (
        <MobilityContext.Provider value={value}>
            {children}
        </MobilityContext.Provider>
    );
}

export function useMobility() {
    const ctx = useContext(MobilityContext);

    if (!ctx) {
        throw new Error(
            "useMobility must be used within a MobilityProvider"
        );
    }

    return ctx;
}


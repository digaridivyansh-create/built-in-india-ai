const API_BASE = "http://localhost:3000";

const DESTINATION_MAP = {
    "Main Gate": "NSUT_Main_Gate",
    "Library": "NSUT_Library",
    "NSUT_Main_Gate": "NSUT_Main_Gate",
    "NSUT_Library": "NSUT_Library"
};

function normalizeRecommendation(data) {
    if (!data || !data.recommendation) {
        return {
            recommendedBus: null,
            eta: null,
            reason: data?.explanation || "No recommendation available.",
            alternative: null,
            routeId: data?.routeId || null,
            routePath: data?.routePath || [],
            currentLocation: data?.currentLocation || null,
            destination: data?.destination || null
        };
    }

    const bus = data.recommendation;

    return {
        recommendedBus: {
            id: bus.busId,
            busId: bus.busId,
            routeId: bus.routeId === "ROUTE_A" ? "R1" : bus.routeId,
            status: bus.status,
            eta: bus.eta,
            speed: bus.speed,
            nextStop: bus.nextStop,
            occupancy:
                typeof bus.occupancy === "number"
                    ? bus.occupancy >= 75
                        ? "high"
                        : bus.occupancy >= 40
                        ? "moderate"
                        : "low"
                    : bus.occupancy,
            occupancyPercent: bus.occupancy,
            latitude: bus.latitude,
            longitude: bus.longitude,
            lastUpdated: bus.lastUpdated,
            progress: 0.5
        },
        eta: bus.eta,
        reason: data.explanation,
        alternative: data.alternative || null,
        validation: data.validation,
        routeId: data.routeId || bus.routeId,
        routePath: data.routePath || [],
        currentLocation: data.currentLocation || null,
        destination: data.destination || null
    };
}

export async function getMobilityRecommendation(
    currentLocation,
    destination,
    buses = [],
    routes = [],
    incidents = []
) {
    const backendDestination =
        DESTINATION_MAP[destination] || destination;

    try {
        const response = await fetch(
            `${API_BASE}/api/recommendation?currentLocation=${encodeURIComponent(
                currentLocation
            )}&destination=${encodeURIComponent(
                backendDestination
            )}`
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));

            return {
                recommendedBus: null,
                eta: null,
                reason:
                    errorData.error ||
                    `No live recommendation available from ${currentLocation} to ${destination}.`,
                alternative: null
            };
        }

        const data = await response.json();

        return normalizeRecommendation(data);
    } catch (error) {
        console.error("Real AI recommendation error:", error);

        return {
            recommendedBus: null,
            eta: null,
            reason:
                "Live AI service is currently unavailable. Please try again.",
            alternative: null
        };
    }
}

export function answerAssistantQuestion(
    question,
    { buses = [], routes = [], incidents = [] }
) {
    return "Ask me which bus to take, the next arrival, or about current delays.";
}

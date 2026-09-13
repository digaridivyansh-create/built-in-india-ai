require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");
const db = require("../firebase/firebase_admin");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const recommendationCache = new Map();
const CACHE_TIME = 30000;

const ROUTE_SERVES = {
    R1: ["Main Gate", "Block A", "Library", "Block C"],
    R2: ["Hostel", "Academic Block", "Block B", "Main Gate"],
    R3: ["Hostel", "Library", "Block C"]
};

const DESTINATION_MAP = {
    "NSUT_Main_Gate": "Main Gate",
    "NSUT_Library": "Library"
};

async function getLiveBuses() {
    const snapshot = await db.ref("buses").once("value");
    const buses = snapshot.val();

    if (!buses) {
        throw new Error("No bus data found in Firebase.");
    }

    return Object.values(buses).map((bus) => ({
        busId: bus.busId,
        latitude: bus.latitude,
        longitude: bus.longitude,
        speed: bus.speed,
        status: bus.status,
        routeId: bus.routeId,
        nextStop: bus.nextStop,
        eta: bus.eta,
        occupancy: bus.occupancy,
        lastUpdated: bus.lastUpdated
    }));
}

function selectBestBus(buses, destination) {
    const normalizedDestination =
        (DESTINATION_MAP[destination] || destination).trim().toLowerCase();

    const eligibleBuses = buses.filter((bus) => {
        const routeStops = ROUTE_SERVES[bus.routeId] || [];

        return routeStops.some(
            (stop) => stop.toLowerCase() === normalizedDestination
        );
    });

    if (eligibleBuses.length === 0) {
        throw new Error(
            `No active bus serving destination: ${destination}`
        );
    }

    const ranked = eligibleBuses
        .map((bus) => {
            const statusPenalty =
                bus.status === "on_time" ? 0 : 15;

            const occupancyPenalty =
                bus.occupancy >= 90 ? 10 :
                bus.occupancy >= 75 ? 5 : 0;

            const nextStopBonus =
                bus.nextStop &&
                bus.nextStop.toLowerCase() === normalizedDestination
                    ? -3
                    : 0;

            const score =
                bus.eta +
                statusPenalty +
                occupancyPenalty +
                nextStopBonus;

            return {
                bus,
                score
            };
        })
        .sort((a, b) => a.score - b.score);

    return ranked[0].bus;
}

function createRecommendation(destination, bus, explanation, source) {
    return {
        destination,
        recommendation: {
            busId: bus.busId,
            eta: bus.eta,
            status: bus.status,
            occupancy: bus.occupancy,
            routeId: bus.routeId,
            nextStop: bus.nextStop,
            latitude: bus.latitude,
            longitude: bus.longitude,
            speed: bus.speed,
            lastUpdated: bus.lastUpdated
        },
        explanation,
        validation: "PASSED",
        source
    };
}

function createFallbackExplanation(bus, destination) {
    const statusText =
        bus.status === "on_time" ? "on time" : "delayed";

    return `Take ${bus.busId}. It serves ${destination} and is approximately ${bus.eta} minutes away. The bus is currently ${statusText}.`;
}

async function getAIRecommendation(destination) {
    const buses = await getLiveBuses();

    const selectedBus = selectBestBus(buses, destination);

    const verifiedBus = buses.find(
        (bus) => bus.busId === selectedBus.busId
    );

    if (!verifiedBus) {
        throw new Error("Recommendation failed Firebase validation.");
    }

    const cacheKey = destination.trim().toLowerCase();
    const cached = recommendationCache.get(cacheKey);

    if (
        cached &&
        Date.now() - cached.time < CACHE_TIME &&
        cached.busId === verifiedBus.busId &&
        cached.eta === verifiedBus.eta &&
        cached.status === verifiedBus.status
    ) {
        return {
            ...cached.result,
            source: `${cached.result.source} (cached)`
        };
    }

    const fallbackExplanation =
        createFallbackExplanation(verifiedBus, destination);

    const prompt = `
You are the Smart Campus Mobility AI assistant.

The application selected this bus using live Firebase data:

${JSON.stringify(verifiedBus, null, 2)}

Destination:
${destination}

Give one short explanation for why this bus was selected.

Rules:
- Do not change the selected bus.
- Do not invent any data.
- Use only the provided Firebase values.
- Mention ETA and status.
- Return only the explanation.
`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: prompt
        });

        const explanation =
            response.text && response.text.trim()
                ? response.text.trim()
                : fallbackExplanation;

        const result = createRecommendation(
            destination,
            verifiedBus,
            explanation,
            "Gemini AI"
        );

        recommendationCache.set(cacheKey, {
            time: Date.now(),
            busId: verifiedBus.busId,
            eta: verifiedBus.eta,
            status: verifiedBus.status,
            result
        });

        return result;

    } catch (error) {
        console.error("Gemini unavailable:", error.message);

        const result = createRecommendation(
            destination,
            verifiedBus,
            fallbackExplanation,
            "Rule-based fallback"
        );

        recommendationCache.set(cacheKey, {
            time: Date.now(),
            busId: verifiedBus.busId,
            eta: verifiedBus.eta,
            status: verifiedBus.status,
            result
        });

        return result;
    }
}

module.exports = {
    getAIRecommendation,
    getLiveBuses
};
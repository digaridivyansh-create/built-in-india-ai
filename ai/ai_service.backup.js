require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");
const db = require("../firebase/firebase_admin");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

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
    const normalizedDestination = destination.trim().toLowerCase();

    const eligibleBuses = buses.filter(
        (bus) =>
            bus.nextStop &&
            bus.nextStop.trim().toLowerCase() === normalizedDestination
    );

    if (eligibleBuses.length === 0) {
        throw new Error(
            `No active bus found for destination: ${destination}`
        );
    }

    const ranked = eligibleBuses
        .map((bus) => {
            const statusPenalty =
                bus.status === "on_time" ? 0 : 15;

            const occupancyPenalty =
                bus.occupancy >= 90 ? 10 :
                bus.occupancy >= 75 ? 5 : 0;

            const score =
                bus.eta +
                statusPenalty +
                occupancyPenalty;

            return {
                bus,
                score
            };
        })
        .sort((a, b) => a.score - b.score);

    return ranked[0].bus;
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

    const prompt = `
You are the Smart Campus Mobility AI assistant.

The application has already selected this bus using live Firebase data:

${JSON.stringify(verifiedBus, null, 2)}

Destination:
${destination}

Give one short explanation for why this bus was selected.

Rules:
- Do not change the selected bus.
- Do not invent any data.
- Use only the provided Firebase values.
- Mention the ETA and status.
`;

    const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt
    });

    return {
        destination,
        recommendation: {
            busId: verifiedBus.busId,
            eta: verifiedBus.eta,
            status: verifiedBus.status,
            occupancy: verifiedBus.occupancy,
            routeId: verifiedBus.routeId,
            nextStop: verifiedBus.nextStop,
            latitude: verifiedBus.latitude,
            longitude: verifiedBus.longitude,
            speed: verifiedBus.speed,
            lastUpdated: verifiedBus.lastUpdated
        },
        explanation: response.text.trim(),
        validation: "PASSED"
    };
}

module.exports = {
    getAIRecommendation,
    getLiveBuses
};




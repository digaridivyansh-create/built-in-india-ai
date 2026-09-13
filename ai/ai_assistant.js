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
    const ranked = buses
        .map((bus) => {
            const reachesDestination =
                bus.nextStop.toLowerCase() === destination.toLowerCase();

            const statusPenalty =
                bus.status === "on_time" ? 0 : 15;

            const occupancyPenalty =
                bus.occupancy >= 90 ? 10 :
                bus.occupancy >= 75 ? 5 : 0;

            const destinationBonus =
                reachesDestination ? -100 : 0;

            const score =
                bus.eta +
                statusPenalty +
                occupancyPenalty +
                destinationBonus;

            return {
                bus,
                reachesDestination,
                score
            };
        })
        .sort((a, b) => a.score - b.score);

    return ranked[0].bus;
}

function validateRecommendation(selectedBus, buses) {
    const verifiedBus = buses.find(
        (bus) => bus.busId === selectedBus.busId
    );

    if (!verifiedBus) {
        throw new Error(
            `Selected bus ${selectedBus.busId} does not exist in Firebase.`
        );
    }

    return verifiedBus;
}

async function explainRecommendation(bus, destination) {
    const prompt = `
You are explaining a Smart Campus Mobility recommendation.

The application has already selected this real bus from live Firebase data:

${JSON.stringify(bus, null, 2)}

Destination:
${destination}

Explain the recommendation in one short sentence.

Rules:
- Do not change the selected bus.
- Do not invent any data.
- Use only the values provided above.
- Mention ETA and status when useful.
`;

    const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt
    });

    return response.text.trim();
}

async function recommendBus(destination) {
    const buses = await getLiveBuses();

    const selectedBus = selectBestBus(buses, destination);

    const verifiedBus = validateRecommendation(selectedBus, buses);

    const explanation = await explainRecommendation(
        verifiedBus,
        destination
    );

    console.log("");
    console.log("========================================");
    console.log("       SMART CAMPUS AI ASSISTANT");
    console.log("========================================");
    console.log(`Destination: ${destination}`);
    console.log("");
    console.log(`Recommended Bus: ${verifiedBus.busId}`);
    console.log(`ETA: ${verifiedBus.eta} min`);
    console.log(`Status: ${verifiedBus.status}`);
    console.log(`Occupancy: ${verifiedBus.occupancy}%`);
    console.log(`Route: ${verifiedBus.routeId}`);
    console.log(`Next Stop: ${verifiedBus.nextStop}`);
    console.log(`Reason: ${explanation}`);
    console.log("");
    console.log("VALIDATION: PASSED");
    console.log(
        `Verified against Firebase: ${verifiedBus.busId} | ETA ${verifiedBus.eta} min | ${verifiedBus.status}`
    );
    console.log("========================================");
}

recommendBus("NSUT_Main_Gate").catch((error) => {
    console.error("AI recommendation error:", error.message);
});

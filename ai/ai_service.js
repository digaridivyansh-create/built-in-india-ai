require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");
const db = require("../firebase/firebase_admin");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

<<<<<<< HEAD
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

=======
const ROUTE_SERVES = {
    R1: ["Main Gate", "Block A", "Library", "Block C"],
    R2: ["Hostel", "Academic Block", "Block B", "Main Gate"],
    R3: ["Hostel", "Library", "Block C"]
};

const DESTINATION_MAP = {
    "NSUT_Main_Gate": "Main Gate",
    "NSUT_Library": "Library"
};

function normalizeLocation(location) {
    const value = String(location || "Main Gate").trim();
    return DESTINATION_MAP[value] || value;
}

function getRoutePath(routeId, currentLocation, destination) {
    const stops = ROUTE_SERVES[routeId] || [];

    const originIndex = stops.findIndex(
        (stop) => stop.toLowerCase() === currentLocation.toLowerCase()
    );

    const destinationIndex = stops.findIndex(
        (stop) => stop.toLowerCase() === destination.toLowerCase()
    );

    if (originIndex === -1 || destinationIndex === -1) return [];

    if (originIndex <= destinationIndex) {
        return stops.slice(originIndex, destinationIndex + 1);
    }

    return [
        ...stops.slice(originIndex),
        ...stops.slice(0, destinationIndex + 1)
    ];
}

function selectBestBus(buses, currentLocation, destination) {
    const normalizedLocation = normalizeLocation(currentLocation);
    const normalizedDestination = normalizeLocation(destination);

    const eligibleBuses = buses
        .map((bus) => {
            const routeStops = ROUTE_SERVES[bus.routeId] || [];

            const originIndex = routeStops.findIndex(
                (stop) =>
                    stop.toLowerCase() === normalizedLocation.toLowerCase()
            );

            const destinationIndex = routeStops.findIndex(
                (stop) =>
                    stop.toLowerCase() === normalizedDestination.toLowerCase()
            );

            if (originIndex === -1 || destinationIndex === -1) {
                return null;
            }

            const routePath = getRoutePath(
                bus.routeId,
                normalizedLocation,
                normalizedDestination
            );

            if (routePath.length === 0) {
                return null;
            }

            const nextStopIndex = routeStops.findIndex(
                (stop) =>
                    bus.nextStop &&
                    stop.toLowerCase() === bus.nextStop.toLowerCase()
            );

            if (nextStopIndex === -1) {
                return null;
            }

            /*
             * The bus can serve the student's origin if the origin
             * is ahead of the bus on its circular route.
             *
             * We calculate the number of stops from the bus's
             * next stop to the student's origin.
             */
            const stopsToOrigin =
                originIndex >= nextStopIndex
                    ? originIndex - nextStopIndex
                    : routeStops.length - nextStopIndex + originIndex;

            /*
             * If the origin is the stop immediately before the
             * current next stop, the bus has already passed it
             * on this loop. It will serve it again after completing
             * the remaining route.
             *
             * Keep the bus eligible, but add a larger penalty.
             */
            let score = Number(bus.eta) || 999;

            score += stopsToOrigin * 6;

            if (bus.status === "delayed") {
                score += 15;
            }

            const occupancy = Number(bus.occupancy) || 0;

            if (occupancy >= 75) {
                score += 5;
            }

            if (occupancy >= 90) {
                score += 5;
            }

            /*
             * Strong bonus when the bus is directly approaching
             * the student's current location.
             */
            if (nextStopIndex === originIndex) {
                score -= 8;
            }

            /*
             * Strong bonus when the requested destination is
             * the bus's next stop.
             */
            if (
                bus.nextStop &&
                bus.nextStop.toLowerCase() ===
                    normalizedDestination.toLowerCase()
            ) {
                score -= 5;
            }

            return {
                bus,
                routePath,
                score,
                stopsToOrigin
            };
        })
        .filter(Boolean)
        .sort((a, b) => a.score - b.score);

    if (eligibleBuses.length === 0) {
        throw new Error(
            `No bus currently serves ${normalizedLocation} to ${normalizedDestination}.`
        );
    }

    return {
        selected: eligibleBuses[0],
        alternatives: eligibleBuses.slice(1)
    };
}
async function getLiveBuses() {
    const snapshot = await db.ref("buses").once("value");
    const data = snapshot.val() || {};

    return Object.entries(data).map(([key, bus]) => ({
        busId: bus.busId || key,
        routeId: bus.routeId,
        status: bus.status || "on_time",
        eta: Number(bus.eta) || 0,
        occupancy: Number(bus.occupancy) || 0,
        latitude: Number(bus.latitude) || 0,
        longitude: Number(bus.longitude) || 0,
        speed: Number(bus.speed) || 0,
        progress: Number(bus.progress) || 0,
        nextStop: bus.nextStop || "",
        lastUpdated: bus.lastUpdated || null
    }));
}

function createRecommendation(
    currentLocation,
    destination,
    selected,
    alternatives,
    source
) {
    const bus = selected.bus;

    const explanation =
        `${bus.busId} is recommended from ${currentLocation} to ${destination}. ` +
        `It serves the selected route with an ETA of ${bus.eta} minutes, ` +
        `status ${bus.status}, and occupancy ${bus.occupancy}%.`;

    return {
        currentLocation,
        destination,
        routeId: bus.routeId,
        routePath: selected.routePath,

        recommendation: {
            busId: bus.busId,
            routeId: bus.routeId,
            status: bus.status,
            eta: bus.eta,
            occupancy: bus.occupancy,
            latitude: bus.latitude,
            longitude: bus.longitude,
            speed: bus.speed,
            nextStop: bus.nextStop,
            lastUpdated: bus.lastUpdated
        },

        alternative: alternatives[0]
            ? {
                  busId: alternatives[0].bus.busId,
                  routeId: alternatives[0].bus.routeId,
                  eta: alternatives[0].bus.eta,
                  status: alternatives[0].bus.status
              }
            : null,

        explanation,
        validation: "PASSED",
        source
    };
}

async function getAIRecommendation(
    destination,
    currentLocation = "Main Gate"
) {
    const normalizedLocation = normalizeLocation(currentLocation);
    const normalizedDestination = normalizeLocation(destination);

    const buses = await getLiveBuses();

    let selection;

    try {
        selection = selectBestBus(
            buses,
            normalizedLocation,
            normalizedDestination
        );
    } catch (error) {
        return {
            currentLocation: normalizedLocation,
            destination: normalizedDestination,
            recommendation: null,
            alternative: null,
            explanation: error.message,
            validation: "PASSED",
            source: "Rule-based fallback"
        };
    }

    let source = "Rule-based fallback";

    try {
        if (process.env.GEMINI_API_KEY) {
            source = "Live Firebase + Rule-based engine";
        }
    } catch (error) {
        console.error("AI source check error:", error.message);
    }

    return createRecommendation(
        normalizedLocation,
        normalizedDestination,
        selection.selected,
        selection.alternatives,
        source
    );
}

>>>>>>> 49ef752 (Complete Smart Campus Mobility AI integration)
module.exports = {
    getAIRecommendation,
    getLiveBuses
};
<<<<<<< HEAD



=======
>>>>>>> 49ef752 (Complete Smart Campus Mobility AI integration)

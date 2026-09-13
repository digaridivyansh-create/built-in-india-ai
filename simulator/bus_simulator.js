<<<<<<< HEAD
const fs = require("fs");
=======
﻿const fs = require("fs");
>>>>>>> 49ef752 (Complete Smart Campus Mobility AI integration)
const path = require("path");
const db = require("../firebase/firebase_admin");

const DATA_FILE = path.join(__dirname, "..", "data", "bus_data.json");

<<<<<<< HEAD
const buses = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));

function updateBus(bus) {
    bus.latitude += (Math.random() - 0.5) * 0.001;
    bus.longitude += (Math.random() - 0.5) * 0.001;

    bus.speed = Math.max(
        5,
        Math.min(45, bus.speed + (Math.random() - 0.5) * 6)
    );

    if (bus.status === "delayed") {
        bus.eta = Math.max(8, bus.eta + Math.round(Math.random() * 2));
    } else {
        bus.eta = Math.max(
            2,
            bus.eta + (Math.random() > 0.5 ? -1 : 1)
        );
    }

    bus.occupancy = Math.max(
        10,
        Math.min(
            100,
            bus.occupancy + Math.round((Math.random() - 0.5) * 10)
        )
    );

    bus.lastUpdated = new Date().toISOString();
}

async function updateAllBuses() {
    Object.values(buses).forEach(updateBus);

    fs.writeFileSync(
        DATA_FILE,
        JSON.stringify(buses, null, 2)
    );

    await db.ref("buses").set(buses);

    console.clear();
    console.log("========================================");
    console.log("     SMART CAMPUS BUS SIMULATOR");
    console.log("========================================");
    console.log(`Updated: ${new Date().toLocaleTimeString()}`);
    console.log("");
    console.log("Firebase: SYNCED");
    console.log("");

    Object.values(buses).forEach((bus) => {
        console.log(
            `${bus.busId} | ${bus.status} | ETA: ${bus.eta} min | Speed: ${Math.round(bus.speed)} km/h | Occupancy: ${bus.occupancy}%`
        );
    });
}

console.log("Bus simulator started...");
console.log("Firebase sync enabled.");
console.log("Updating every 3 seconds.");
console.log("Press CTRL + C to stop.");

updateAllBuses().catch((error) => {
    console.error("Firebase sync error:", error.message);
});

setInterval(() => {
    updateAllBuses().catch((error) => {
        console.error("Firebase sync error:", error.message);
    });
=======
/*
 * GPS coordinates corresponding exactly to the SVG coordinates
 * used in mockData.js.
 */
const STOP_GPS = {
    "Main Gate": {
        latitude: 28.61369,
        longitude: 77.20365
    },
    "Block A": {
        latitude: 28.61736,
        longitude: 77.20795
    },
    "Library": {
        latitude: 28.61893,
        longitude: 77.21225
    },
    "Block C": {
        latitude: 28.61814,
        longitude: 77.21655
    },
    "Hostel": {
        latitude: 28.61055,
        longitude: 77.20437
    },
    "Academic Block": {
        latitude: 28.61160,
        longitude: 77.21082
    },
    "Block B": {
        latitude: 28.61212,
        longitude: 77.21655
    }
};

const routeStops = {
    R1: ["Main Gate", "Block A", "Library", "Block C"],
    R2: ["Hostel", "Academic Block", "Block B", "Main Gate"],
    R3: ["Hostel", "Library", "Block C"]
};

const buses = {
    BUS12: {
        busId: "BUS12",
        routeId: "R1",
        status: "on_time",
        speed: 25,
        occupancy: 65,
        progress: 0.10,
        nextStop: "Block A",
        eta: 5,
        latitude: 0,
        longitude: 0,
        lastUpdated: new Date().toISOString()
    },

    BUS14: {
        busId: "BUS14",
        routeId: "R2",
        status: "on_time",
        speed: 26,
        occupancy: 52,
        progress: 0.35,
        nextStop: "Block B",
        eta: 7,
        latitude: 0,
        longitude: 0,
        lastUpdated: new Date().toISOString()
    },

    BUS16: {
        busId: "BUS16",
        routeId: "R3",
        status: "on_time",
        speed: 22,
        occupancy: 30,
        progress: 0.45,
        nextStop: "Block C",
        eta: 8,
        latitude: 0,
        longitude: 0,
        lastUpdated: new Date().toISOString()
    }
};

function interpolate(a, b, t) {
    return a + (b - a) * t;
}

function getPositionOnRoute(routeId, progress) {
    const stops = routeStops[routeId];

    if (!stops || stops.length < 2) {
        return null;
    }

    const clampedProgress =
        Math.max(0, Math.min(progress, 0.999999));

    const segmentCount = stops.length - 1;

    const scaled =
        clampedProgress * segmentCount;

    const segmentIndex =
        Math.floor(scaled);

    const segmentProgress =
        scaled - segmentIndex;

    const fromStop =
        STOP_GPS[stops[segmentIndex]];

    const toStop =
        STOP_GPS[
            stops[segmentIndex + 1]
        ];

    return {
        latitude: interpolate(
            fromStop.latitude,
            toStop.latitude,
            segmentProgress
        ),

        longitude: interpolate(
            fromStop.longitude,
            toStop.longitude,
            segmentProgress
        )
    };
}

function getNextStop(routeId, progress) {
    const stops = routeStops[routeId];

    const segmentCount = stops.length - 1;

    const segmentIndex = Math.min(
        Math.floor(
            Math.max(0, progress) * segmentCount
        ),
        segmentCount - 1
    );

    return stops[segmentIndex + 1];
}

function getETA(routeId, progress, speed) {
    const remainingProgress =
        Math.max(0, 1 - progress);

    const routeMinutes =
        routeId === "R1"
            ? 14
            : routeId === "R2"
              ? 18
              : 12;

    const eta =
        remainingProgress * routeMinutes;

    return Math.max(
        1,
        Math.round(
            eta * (25 / Math.max(speed, 10))
        )
    );
}

function updateBus(bus) {
    const movementFactor =
        bus.speed / 1200;

    bus.progress += movementFactor;

    if (bus.progress >= 1) {
        bus.progress = 0;
    }

    const position =
        getPositionOnRoute(
            bus.routeId,
            bus.progress
        );

    bus.latitude =
        position.latitude;

    bus.longitude =
        position.longitude;

    bus.speed = Math.max(
        12,
        Math.min(
            40,
            bus.speed +
                (Math.random() - 0.5) * 2
        )
    );

    bus.occupancy = Math.max(
        20,
        Math.min(
            90,
            bus.occupancy +
                Math.round(
                    (Math.random() - 0.5) * 4
                )
        )
    );

    bus.nextStop =
        getNextStop(
            bus.routeId,
            bus.progress
        );

    bus.eta =
        getETA(
            bus.routeId,
            bus.progress,
            bus.speed
        );

    bus.lastUpdated =
        new Date().toISOString();
}

async function applyDemoDelay() {
    const snapshot =
        await db
            .ref("demoDelay")
            .once("value");

    const demoDelayActive =
        snapshot.val() === true;

    const bus =
        buses.BUS12;

    if (demoDelayActive) {
        bus.status = "delayed";

        bus.speed = Math.max(
            8,
            bus.speed - 2
        );
    } else {
        bus.status = "on_time";
    }
}

async function updateAllBuses() {
    Object.values(buses).forEach(
        updateBus
    );

    await applyDemoDelay();

    fs.writeFileSync(
        DATA_FILE,
        JSON.stringify(
            buses,
            null,
            2
        ),
        "utf8"
    );

    await db
        .ref("buses")
        .set(buses);

    console.clear();

    console.log(
        "========================================"
    );

    console.log(
        "     SMART CAMPUS BUS SIMULATOR"
    );

    console.log(
        "========================================"
    );

    console.log(
        `Updated: ${new Date().toLocaleTimeString()}`
    );

    console.log("");

    console.log(
        "Firebase: SYNCED"
    );

    console.log(
        "Route-based GPS movement: ENABLED"
    );

    console.log("");

    Object.values(buses).forEach(
        (bus) => {
            console.log(
                `${bus.busId} | ${bus.routeId} | ${bus.status} | ${bus.nextStop} | ETA: ${bus.eta} min | GPS: ${bus.latitude.toFixed(6)}, ${bus.longitude.toFixed(6)} | Progress: ${(bus.progress * 100).toFixed(1)}%`
            );
        }
    );
}

console.log(
    "Bus simulator started..."
);

console.log(
    "Firebase sync enabled."
);

console.log(
    "Route-based movement enabled."
);

console.log(
    "Updating every 3 seconds."
);

console.log(
    "Admin delay control enabled."
);

console.log(
    "Press CTRL + C to stop."
);

updateAllBuses().catch(
    (error) => {
        console.error(
            "Firebase sync error:",
            error.message
        );
    }
);

setInterval(() => {
    updateAllBuses().catch(
        (error) => {
            console.error(
                "Firebase sync error:",
                error.message
            );
        }
    );
>>>>>>> 49ef752 (Complete Smart Campus Mobility AI integration)
}, 3000);

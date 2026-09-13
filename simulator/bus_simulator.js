const fs = require("fs");
const path = require("path");
const db = require("../firebase/firebase_admin");

const DATA_FILE = path.join(__dirname, "..", "data", "bus_data.json");

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
}, 3000);

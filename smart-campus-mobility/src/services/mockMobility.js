const API_BASE = "http://localhost:3000";

function normalizeBus(bus) {
    const stopMap = {
        NSUT_Main_Gate: "Main Gate",
        NSUT_Library: "Library",
    };

    const routeMap = {
        ROUTE_A: "R1",
    };

    let occupancy = "low";

    if (typeof bus.occupancy === "number") {
        if (bus.occupancy >= 75) {
            occupancy = "high";
        } else if (bus.occupancy >= 40) {
            occupancy = "moderate";
        }
    } else if (typeof bus.occupancy === "string") {
        occupancy = bus.occupancy;
    }

    return {
        id: bus.busId,
        busId: bus.busId,
        routeId: routeMap[bus.routeId] || bus.routeId,
        status: bus.status,
        eta: bus.eta,
        speed: bus.speed,
        nextStop: stopMap[bus.nextStop] || bus.nextStop,
        occupancy,
        occupancyPercent: bus.occupancy,
        latitude: bus.latitude,
        longitude: bus.longitude,
        lastUpdated: bus.lastUpdated,
        progress: 0.5,
    };
}

export async function getBuses() {
    const response = await fetch(`${API_BASE}/api/buses`);

    if (!response.ok) {
        throw new Error(`Live bus API failed: ${response.status}`);
    }

    const data = await response.json();

    return (data.buses || []).map(normalizeBus);
}

export function getRoutes() {
    return [
        {
            id: "R1",
            name: "Route R1",
            stops: ["Main Gate", "Block A", "Library", "Block C"],
            durationMin: 14,
        },
        {
            id: "R2",
            name: "Route R2",
            stops: ["Hostel", "Academic Block", "Block B", "Main Gate"],
            durationMin: 18,
        },
        {
            id: "R3",
            name: "Route R3",
            stops: ["Hostel", "Library", "Block C"],
            durationMin: 12,
        },
    ];
}

export function getIncidents() {
    return [];
}

export function getStatusLabel(status) {
    switch (status) {
        case "on_time":
            return "ON TIME";
        case "delayed":
            return "DELAYED";
        case "warning":
            return "WARNING";
        default:
            return status;
    }
}

export function getOccupancyLabel(occupancy) {
    switch (occupancy) {
        case "low":
            return "Low";
        case "moderate":
            return "Moderate";
        case "high":
            return "High";
        default:
            return occupancy;
    }
}

require("dotenv").config();

const express = require("express");
const { getAIRecommendation, getLiveBuses } = require("./ai/ai_service");
﻿require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { getAIRecommendation, getLiveBuses } = require("./ai/ai_service");
const db = require("./firebase/firebase_admin");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());
app.use(express.static("smart-campus-mobility"));

app.get("/", (req, res) => {
    res.json({
        service: "Smart Campus Mobility",
        status: "running",
        role: "Data + AI Integration"
    });
});

app.get("/api/health", (req, res) => {
    res.json({
        service: "Smart Campus Mobility API",
        status: "healthy",
        firebase: "connected",
        ai: "ready"
    });
});

// LIVE BUS DATA
app.get("/api/buses", async (req, res) => {
    try {
        const buses = await getLiveBuses();

        res.json({
            count: buses.length,
            buses
        });

    } catch (error) {
        console.error("Buses API error:", error.message);

        res.status(500).json({
            error: "Unable to fetch live bus data"
        });
    }
});

// AI RECOMMENDATION
app.get("/api/recommendation", async (req, res) => {
    try {
app.get("/api/recommendation", async (req, res) => {
    try {
        const currentLocation = req.query.currentLocation || "Main Gate";
        const destination = req.query.destination;

        if (!destination) {
            return res.status(400).json({
                error: "Destination is required"
            });
        }

        const result = await getAIRecommendation(destination);

        res.json(result);

        const result = await getAIRecommendation(
            destination,
            currentLocation
        );

        res.json(result);
    } catch (error) {
        console.error("Recommendation API error:", error.message);

        res.status(500).json({
            error: "Unable to generate recommendation"
        });
    }
});

app.post("/api/demo/delay", async (req, res) => {
    try {
        await db.ref("demoDelay").set(true);

        res.json({
            success: true,
            message: "Demo delay activated",
            busId: "BUS12",
            status: "delayed"
        });
    } catch (error) {
        console.error("Demo delay error:", error.message);

        res.status(500).json({
            success: false,
            error: "Unable to activate demo delay"
        });
    }
});

app.post("/api/demo/reset", async (req, res) => {
    try {
        await db.ref("demoDelay").set(false);

        res.json({
            success: true,
            message: "Demo delay reset"
        });
    } catch (error) {
        console.error("Demo reset error:", error.message);

        res.status(500).json({
            success: false,
            error: "Unable to reset demo"
        });
    }
});

app.listen(PORT, () => {
    console.log("========================================");
    console.log("   SMART CAMPUS MOBILITY API");
    console.log("========================================");
    console.log(`Server running on http://localhost:${PORT}`);
    console.log("");
    console.log("Live buses:");
    console.log(`http://localhost:${PORT}/api/buses`);
    console.log("");
    console.log("AI endpoint:");
    console.log(
        `http://localhost:${PORT}/api/recommendation?destination=NSUT_Main_Gate`
    );
});
});

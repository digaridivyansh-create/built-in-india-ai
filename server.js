require("dotenv").config();

const express = require("express");
const { getAIRecommendation, getLiveBuses } = require("./ai/ai_service");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

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
        const destination = req.query.destination;

        if (!destination) {
            return res.status(400).json({
                error: "Destination is required"
            });
        }

        const result = await getAIRecommendation(destination);

        res.json(result);

    } catch (error) {
        console.error("Recommendation API error:", error.message);

        res.status(500).json({
            error: "Unable to generate recommendation"
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
const { initializeApp, cert } = require("firebase-admin/app");
const { getDatabase } = require("firebase-admin/database");
const path = require("path");

const serviceAccount = require(
    path.join(__dirname, "..", "config", "serviceAccountKey.json")
);

const app = initializeApp({
    credential: cert(serviceAccount),
    databaseURL: "https://scmobility-div26-default-rtdb.asia-southeast1.firebasedatabase.app"
});

const db = getDatabase(app);

module.exports = db;

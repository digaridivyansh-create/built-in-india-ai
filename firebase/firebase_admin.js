const { initializeApp, cert } = require("firebase-admin/app");
const { getDatabase } = require("firebase-admin/database");

const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
};

const app = initializeApp({
    credential: cert(serviceAccount),
    databaseURL: "https://scmobility-div26-default-rtdb.asia-southeast1.firebasedatabase.app"
});

const db = getDatabase(app);

module.exports = db;

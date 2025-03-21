const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

// Tambahkan endpoint root untuk testing
app.get("/", (req, res) => {
    res.json({ message: "Server is running" });
});

// Tambahkan endpoint /api/test untuk testing
app.get("/api/test", (req, res) => {
    res.json({ message: "API is working" });
});

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Log semua routes yang terdaftar
app.use("/api", require("./routes"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`Root endpoint: http://localhost:${PORT}/`);
    console.log(`API test endpoint: http://localhost:${PORT}/api/test`);
});

require("dotenv").config(); // Load environment variables first

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());


const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Check if MongoDB URI is provided
if (!MONGO_URI) {
  console.error("❌ ERROR: MONGO_URI is missing in the .env file.");
  process.exit(1); // Exit the process to prevent running without a DB connection
}

// MongoDB Connection
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected Successfully!"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1); // Exit the server if MongoDB fails to connect
  });

// Serve static files (Uploaded resumes)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Import Routes
const resumeRoutes = require("./routes/resumeRoutes");
app.use("/api/resumes", resumeRoutes);

app.get("/", (req, res) => {
  res.send("Resume Backend API is running...");
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  res.status(500).json({ error: "Internal Server Error" });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

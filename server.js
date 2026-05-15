const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const Product = require("./models/Product");

const authRoutes = require("./routes/auth");
const buyerRoutes = require("./routes/buyer");
const sellerRoutes = require("./routes/seller");
const paymentRoutes = require("./routes/payment");
const adminRoutes = require("./routes/admin");

const errorHandler = require("./middleware/errorHandler");

const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN : true,
    credentials: true,
  })
);

// Static Files
app.use("/public", express.static(path.join(__dirname, "public")));

// Database Connection
const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/worldstore";
mongoose
  .connect(mongoUri)
  .then(() => {
    const { host, port, name } = mongoose.connection;
    console.log(`✅ Connected to MongoDB Compass at ${host}:${port}/${name}`);
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/buyer", buyerRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/admin", adminRoutes);

// Health Check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date(),
    uptime: process.uptime(),
    dbStatus: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
  });
});

// Serve frontend pages
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));
app.get("/login", (req, res) => res.sendFile(path.join(__dirname, "login.html")));
app.get("/signup", (req, res) => res.sendFile(path.join(__dirname, "signup.html")));
app.get("/buyer", (req, res) => res.sendFile(path.join(__dirname, "buyer-portal.html")));
app.get("/seller", (req, res) => res.sendFile(path.join(__dirname, "seller-portal.html")));
app.get("/admin", (req, res) => res.sendFile(path.join(__dirname, "admin.html")));

// Redirect legacy .html routes to clean routes
app.get("/index.html", (req, res) => res.redirect("/"));
app.get("/login.html", (req, res) => res.redirect("/login"));
app.get("/signup.html", (req, res) => res.redirect("/signup"));
app.get("/buyer-portal.html", (req, res) => res.redirect("/buyer"));
app.get("/seller-portal.html", (req, res) => res.redirect("/seller"));
app.get("/admin.html", (req, res) => res.redirect("/admin"));

// Error Handling Middleware (MUST BE LAST)
app.use(errorHandler);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 WorldStore Server running on http://localhost:${PORT}`);
});

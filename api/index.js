import dotenv from "dotenv";
dotenv.config();
import path from "path";
import { fileURLToPath } from "url";

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";

import authRoutes from "./routes/authRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import patientRoutes from "./routes/patientRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import videoCallRoutes from "./routes/videoCallRoutes.js";
import reminderScheduler from "./reminderScheduler.js";

import jwt from "jsonwebtoken";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"], // React dev server URLs
    methods: ["GET", "POST"],
  },
});

// Store socket mappings
const doctorSockets = {};
const patientSockets = {};

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Register doctor socket
  socket.on("registerDoctor", (doctorId) => {
    if (!doctorSockets[doctorId]) doctorSockets[doctorId] = [];
    if (!doctorSockets[doctorId].includes(socket.id)) {
      doctorSockets[doctorId].push(socket.id);
    }
  });

  // Register patient socket
  socket.on("registerPatient", (patientId) => {
    if (!patientSockets[patientId]) patientSockets[patientId] = [];
    if (!patientSockets[patientId].includes(socket.id)) {
      patientSockets[patientId].push(socket.id);
    }
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    Object.keys(doctorSockets).forEach((key) => {
      doctorSockets[key] = doctorSockets[key].filter((id) => id !== socket.id);
      if (doctorSockets[key].length === 0) delete doctorSockets[key];
    });
    Object.keys(patientSockets).forEach((key) => {
      patientSockets[key] = patientSockets[key].filter((id) => id !== socket.id);
      if (patientSockets[key].length === 0) delete patientSockets[key];
    });
  });
});

// Make socket mappings available to routes
app.set("io", io);
app.set("doctorSockets", doctorSockets);
app.set("patientSockets", patientSockets);

app.use(cors());
app.use(express.json());

// Paths for __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// API routes (must come before static files and catch-all route)
// Public routes
app.use("/api/appointments", patientRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/patient", patientRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/video-call", videoCallRoutes);

// Protected routes
app.use("/api/doctors", doctorRoutes);

// Serve React build (correct relative path) - MUST come after API routes
app.use(express.static(path.join(__dirname, "../client/dist")));

// Catch-all route for React Router - MUST be last
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist", "index.html"));
});

// Connect to MongoDB and start cron
mongoose
  .connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB Connected");
    reminderScheduler();
  })
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, "0.0.0.0", () =>
  console.log(`✅ Server running on http://localhost:${PORT}`)
);

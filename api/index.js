import dotenv from "dotenv";
dotenv.config();
import path from "path";
import { fileURLToPath } from "url";

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
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

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5176",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://127.0.0.1:5175",
  "http://127.0.0.1:5176",
  "http://127.0.0.1:5177",
  "http://localhost:5177",
  "https://healthcard-y14j.onrender.com",
  process.env.FRONTEND_URL
].filter(Boolean);

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: false
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
    console.log(`[SOCKET] Register request from Doctor ID: ${doctorId} (Type: ${typeof doctorId})`);
    if (!doctorSockets[doctorId]) doctorSockets[doctorId] = [];
    if (!doctorSockets[doctorId].includes(socket.id)) {
      doctorSockets[doctorId].push(socket.id);
    }
    socket.join("doctors"); // Join doctors room
    console.log(`[SOCKET] Doctor ${doctorId} registered with socket ${socket.id}. Current map keys: ${Object.keys(doctorSockets)}`);
  });

  // Register patient socket
  socket.on("registerPatient", (patientId) => {
    if (!patientSockets[patientId]) patientSockets[patientId] = [];
    if (!patientSockets[patientId].includes(socket.id)) {
      patientSockets[patientId].push(socket.id);
    }
    socket.join("patients"); // Join patients room
    console.log(`Patient ${patientId} joined 'patients' room`);
  });

  // --- Video Call Signaling (WebRTC) ---
  socket.on("join-video-room", (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined video room ${roomId}`);
    
    // Acknowledge join
    socket.emit("room-joined", roomId);

    // Notify existing users in the room so they can initiate a connection
    const clients = io.sockets.adapter.rooms.get(roomId);
    if (clients && clients.size > 1) {
       socket.to(roomId).emit("user-connected", socket.id);
    }
  });

  socket.on("offer", ({ offer, roomId }) => {
    socket.to(roomId).emit("offer", { offer, senderId: socket.id });
  });

  socket.on("answer", ({ answer, roomId }) => {
    socket.to(roomId).emit("answer", { answer, senderId: socket.id });
  });

  socket.on("ice-candidate", ({ candidate, roomId }) => {
    socket.to(roomId).emit("ice-candidate", { candidate, senderId: socket.id });
  });
  // -------------------------------------

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

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(helmet());
app.use(express.json({ limit: '10mb' })); // Safe limit for medical files

// Paths for __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// API routes (must come before static files and catch-all route)
// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Public routes
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/appointments", patientRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/patient", patientRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/video-call", videoCallRoutes);

// Protected routes
app.use("/api/doctors", doctorRoutes); // Doctor routes mounted

// Serve React build - ONLY in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/dist", "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("API is running...");
  });
}

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

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, "0.0.0.0", () =>
  console.log(`✅ Server running on http://localhost:${PORT}`)
);

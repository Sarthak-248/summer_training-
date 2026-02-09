import express from "express";
import parser from "../middlewares/multerCloudinary.js";
import { authenticate } from "../middlewares/authMiddleware.js";

import {
  createDoctorListing,
  getMyProfile,
  updateDoctorProfile,
  setAvailability,
  saveTimeSlots,
  getMyAvailability,
  deleteAvailability,
  getAvailableDoctors,
  getScheduledAppointments,
  getPatientHistory,
  updateAppointmentStatus,
  getDoctorSlotsForDate,
  getAllDoctors,
} from "../controllers/doctorController.js";

const router = express.Router();

/* =====================================================
   DOCTOR PROFILE
   ===================================================== */

// Create doctor profile
router.post(
  "/create-listing",
  authenticate,
  parser.single("image"),
  createDoctorListing
);

// Get logged-in doctor profile
router.get("/profile", authenticate, getMyProfile);

// Update logged-in doctor profile
router.put(
  "/profile",
  authenticate,
  parser.single("image"),
  updateDoctorProfile
);

/* =====================================================
   AVAILABILITY (🔥 FIXED)
   ===================================================== */

// Set availability (doctor must exist – checked in controller)
router.post("/slots", authenticate, setAvailability);

// Save time slots
router.post("/save-slots", authenticate, saveTimeSlots);

// Get logged-in doctor availability
router.get("/slots", authenticate, getMyAvailability);

// Delete a specific availability slot
router.delete("/slots", authenticate, deleteAvailability);

// Get slots of a doctor for a specific date (patients)
router.get("/:doctorId/slots", getDoctorSlotsForDate);

/* =====================================================
   DOCTOR LISTING / SEARCH
   ===================================================== */

// Get all doctors
router.get("/all", getAllDoctors);

// Get available doctors (search/filter)
router.get("/available", getAvailableDoctors);

/* =====================================================
   APPOINTMENTS
   ===================================================== */

// Get scheduled appointments for logged-in doctor
router.get("/appointments", authenticate, getScheduledAppointments);

// Update appointment status
router.patch(
  "/appointments/:apptId/status",
  authenticate,
  updateAppointmentStatus
);

// Get patient history
router.get(
  "/patient-history/:patientId",
  authenticate,
  getPatientHistory
);

export default router;

import Doctor from "../models/Doctor.js";
import Patient from "../models/Patient.js"; // Assuming you have a Patient model
//port AppointMent from "../models/Appointment.js"; // Assuming you have an Appointment model
import User from '../models/User.js';

// controllers/appointmentController.js
// POST /api/patient/book-appointment/:doctorId


export const bookAppointment = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { patientName, patientContact, appointmentTime, reason } = req.body;

    if (!patientName || !patientContact || !appointmentTime) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    doctor.appointments.push({
      patientName,
      patientContact,
      appointmentTime: new Date(appointmentTime),
      reason,
      patientRef: req.user._id,
    });

    await doctor.save();

    res.status(201).json({ message: 'Appointment booked successfully' });
  } catch (err) {
    console.error('Booking error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


// GET /api/appointments/upcoming
//nst Appointment = require('../models/Doctor'); // or wherever you have doctor model

// Get patient’s appointments


export const getMyAppointments = async (req, res) => {
  try {
    const patientId = req.user._id; // user from JWT token

    // Step 1: Find all doctors where this user has appointments
    const doctors = await Doctor.find({
      'appointments.patientRef': patientId,
    }).select('name specialty appointments');

    const patientAppointments = [];

    // Step 2: Extract only this patient's appointments from each doctor
    doctors.forEach((doctor) => {
      doctor.appointments.forEach((appt) => {
        if (appt.patientRef && appt.patientRef.toString() === patientId.toString()) {
          patientAppointments.push({
            doctorName: doctor.name,
            doctorSpecialty: doctor.specialty,
            appointmentId: appt._id,
            patientName: appt.patientName,
            contact: appt.patientContact,
            date: appt.appointmentTime,
            reason: appt.reason,
            status: appt.status,
            rejectionReason: appt.rejectionReason,
            createdAt: appt.createdAt,
          });
        }
      });
    });

    res.status(200).json(patientAppointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: 'Server error fetching appointments' });
  }
};






export const postHistory = async (req, res) => {
  const { answers } = req.body;
  const patientId = req.user._id;

  console.log("Patient ID:", patientId);
  console.log("Answers:", answers);

  try {
    // Format answers into array of { question, answer }
    const formattedHistory = Object.entries(answers).map(([question, answer]) => ({
      question,
      answer,
    }));

    // Try to find existing patient
    let patient = await Patient.findById(patientId);

    if (!patient) {
      // If patient doesn't exist, fetch from User
      const user = await User.findById(patientId);
      if (!user) return res.status(404).json({ error: "User not found" });

      // Create new Patient entry
      patient = new Patient({
        _id: user._id,
        name: user.name,
        email: user.email,
        contact: user.contact,
        medicalHistory: formattedHistory,
      });

      console.log("🆕 Created new patient record.");
    } else {
      // If exists, update medical history
      patient.medicalHistory = formattedHistory;
      console.log("✏️ Updated existing patient record.");
    }

    await patient.save();
    res.status(200).json({ message: "Medical history saved successfully." });

  } catch (error) {
    console.error("❌ Save error:", error);
    res.status(500).json({ error: "Failed to save medical history." });
  }
};



// Add a doctor to the patient's favorites
// export const addToFavorites = async (req, res) => {
//   try {
//     const patientId = req.user_id;
//     const { doctorId } = req.body;

//     if (!doctorId) {
//       return res.status(400).json({ message: "Doctor ID is required." });
//     }

//     // Find the patient
//     const patient = await Patient.findById(patientId);
//     if (!patient) {
//       return res.status(404).json({ message: "Patient not found" });
//     }

//     // Find the doctor
//     const doctor = await Doctor.findById(doctorId);
//     if (!doctor) {
//       return res.status(404).json({ message: "Doctor not found" });
//     }

//     if (patient.favorites.includes(doctorId)) {
//       return res.status(400).json({ message: "Doctor is already in favorites" });
//     }

//     patient.favorites.push(doctorId);
//     await patient.save();

//     return res.status(200).json({ message: "Doctor added to favorites", favorites: patient.favorites });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: "An error occurred while adding the doctor to favorites" });
//   }
// };


// Add Doctor to Favorites
// Remove a doctor from the patient's favorites
// export const removeFromFavorites = async (req, res) => {
//     try {
//         const { doctorId } = req.body;
//         const patientId = req.user._id;

//         const patient = await Patient.findById(patientId);

//         if (!patient) {
//             return res.status(404).json({ message: "Patient not found" });
//         }

//         // Check if doctor is in favorites
//         if (!patient.favorites.includes(doctorId)) {
//             return res.status(400).json({ message: "Doctor is not in favorites" });
//         }

//         // Remove doctor from favorites
//         patient.favorites = patient.favorites.filter((id) => id.toString() !== doctorId);
//         await patient.save();

//         return res.status(200).json({ message: "Doctor removed from favorites" });
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ message: error.message });
//     }
// };


// Remove Doctor from Favorites


// Get All Favorite Doctors for a Patient
// export const getFavorites = async (req, res) => {
//     try {
//         const patientId = req.user._id;

//         const patient = await Patient.findById(patientId).populate("favorites", "name specialty");

//         if (!patient) {
//             return res.status(404).json({ message: "Patient not found" });
//         }

//         return res.status(200).json({ favorites: patient.favorites });
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ message: error.message });
//     }
// };


export const addDoctorToFavorites = async (req, res) => {
  const { doctorId } = req.body; // doctorId from body
  const patientId = req.user._id; // Logged-in patient's ID from JWT

  console.log('Received doctorId:', doctorId);
  console.log('Patient ID from JWT:', patientId);

  try {
    // Validate doctorId
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      console.log('Invalid doctor ID');
      return res.status(400).json({ message: 'Invalid doctor ID' });
    }

    // Find the patient by ID
    console.log('Searching for patient with ID:', patientId);
    const patient = await Patient.findById(patientId);
    if (!patient) {
      console.log('Patient not found');
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Log patient favorites for debugging
    console.log('Patient favorites before adding doctor:', patient.favorites);

    // Check if the doctor is already in the patient's favorites
    if (patient.favorites.includes(doctorId)) {
      console.log('Doctor is already in favorites');
      return res.status(400).json({ message: 'Doctor is already in favorites' });
    }

    // Find the doctor (optional check)
    console.log('Searching for doctor with ID:', doctorId);
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      console.log('Doctor not found');
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Add doctor to favorites
    patient.favorites.push(doctorId);
    console.log('Adding doctor to favorites');
    await patient.save();

    // Log the updated patient favorites
    console.log('Patient favorites after adding doctor:', patient.favorites);

    res.status(200).json({ success: true, message: 'Doctor added to favorites' });
  } catch (error) {
    console.error('Error adding doctor to favorites:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

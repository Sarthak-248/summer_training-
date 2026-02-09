import Doctor from "../models/Doctor.js";
import Patient from "../models/Patient.js"; // Assuming you have a Patient model
//port AppointMent from "../models/Appointment.js"; // Assuming you have an Appointment model
import User from '../models/User.js';
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs";
import axios from "axios";
// controllers/appointmentController.js
// POST /api/patient/book-appointment/:doctorId
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


export const bookAppointment = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { patientName, patientContact, appointmentTime, appointmentEndTime, reason } = req.body;

    if (!patientName || !patientContact || !appointmentTime) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    // Parse appointment times - ensure UTC handling
    const start = new Date(appointmentTime + (appointmentTime.includes('Z') ? '' : 'Z'));
    const end = appointmentEndTime ? new Date(appointmentEndTime + (appointmentEndTime.includes('Z') ? '' : 'Z')) : new Date(start.getTime() + 60 * 60 * 1000);

    // Check for time conflicts with existing appointments
    const conflictingAppointment = doctor.appointments.find(appt => 
      appt.status !== 'Cancelled' && 
      ((appt.appointmentTime <= start && appt.appointmentEndTime > start) || 
       (appt.appointmentTime < end && appt.appointmentEndTime >= end) ||
       (appt.appointmentTime >= start && appt.appointmentEndTime <= end))
    );

    if (conflictingAppointment) {
      return res.status(400).json({ message: 'Time slot already booked. Please choose a different time.' });
    }

    doctor.appointments.push({
      patientName,
      patientContact,
      appointmentTime: start,
      appointmentEndTime: end,
      reason,
      patientRef: req.user._id,
    });

    await doctor.save();

    // --- Socket.IO Notification to Doctor ---
    const io = req.app.get("io");
    
    console.log(`[NOTIFY] Emitting newAppointment to doctor: ${doctorId}`);
    io.to(doctorId).emit("newAppointment", {
      patientName,
      appointmentTime: new Date(appointmentTime),
      reason,
    });
    // --- End Notification ---

    res.status(201).json({ message: 'Appointment booked successfully' });
  } catch (err) {
    console.error('Booking error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


// GET /api/appointments/upcoming
//nst Appointment = require('../models/Doctor'); // or wherever you have doctor model

// Get patient's appointments


export const getMyAppointments = async (req, res) => {
  try {
    const patientId = req.user._id; // user from JWT token

    // Step 1: Find all doctors where this user has appointments
    const doctors = await Doctor.find({
      'appointments.patientRef': patientId,
    }).select('name specialty consultationFees appointments');

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
            endTime: appt.appointmentEndTime,
            reason: appt.reason,
            status: appt.status,
            rejectionReason: appt.rejectionReason,
            createdAt: appt.createdAt,
            // Payment information
            paymentStatus: appt.paymentStatus || 'Pending',
            amount: appt.amount || doctor.consultationFees || 500,
            paymentId: appt.paymentId || '',
            orderId: appt.orderId || '',
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

// Get patient profile
export const getPatientProfile = async (req, res) => {
  if (!req.user._id) {
    console.error("❌ req.user._id is missing in getPatientProfile");
    return res.status(400).json({ message: "Invalid user ID in token." });
  }
  let patient = await Patient.findById(req.user._id);
  if (!patient) {
    const user = await User.findById(req.user._id);
    if (!user || !user._id) {
      console.error("❌ User not found or user._id is missing in getPatientProfile");
      return res.status(404).json({ message: "User not found" });
    }
    // Defensive: never create with null/undefined _id
    if (!user._id) {
      return res.status(400).json({ message: "Cannot create patient with null _id" });
    }
    patient = await Patient.create({
      _id: user._id,
      userRef: user._id,
      name: user.name,
      email: user.email,
      // ...other default fields
    });
  }
  res.json(patient);
};

// Update patient profile
export const updatePatientProfile = async (req, res) => {
  try {
    const updates = { ...req.body };
    delete updates.name;
    delete updates.email;
    delete updates.role;

    // Remove gender if empty or invalid
    const allowedGenders = ["Male", "Female", "Other"];
    if (!allowedGenders.includes(updates.gender)) {
      delete updates.gender;
    }

    // Debug log file upload
    if (req.file) {
      console.log("[DEBUG] File upload detected:", req.file);
    } else {
      console.log("[DEBUG] No file uploaded");
    }

    // If photo uploaded, set photo field
    if (req.file && req.file.path) {
      console.log("[DEBUG] Photo upload - file path:", req.file.path);
      // Check if it's a Cloudinary URL or local path
      updates.photo = req.file.path.startsWith("http")
        ? req.file.path
        : `/${path.relative(path.join(__dirname, '..'), req.file.path).replace(/\\/g, '/')}`;
      console.log("[DEBUG] Photo URL set to:", updates.photo);
    } else {
      console.log("[DEBUG] No photo file uploaded");
    }

    const patient = await Patient.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );
    if (!patient) return res.status(404).json({ message: "Patient not found" });
    res.json(patient);
  } catch (err) {
    console.error("[ERROR] updatePatientProfile:", err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};

// import path from "path";
// import { exec } from "child_process";
// import { fileURLToPath } from "url";
// import { dirname } from "path";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);
// import path from "path";
// import { exec } from "child_process";



export const testPythonEnvironment = async (req, res) => {
  console.log("🧪 Testing Python environment...");

  try {
    // Check multiple possible Python commands
    let pythonCmd;
    const possiblePythonCmds = ['python3', 'python', '/usr/bin/python3', '/usr/bin/python'];
    
    for (const cmd of possiblePythonCmds) {
      try {
        const { stdout } = await promisify(exec)(`${cmd} --version`);
        pythonCmd = cmd;
        console.log("✅ Found working Python command:", cmd, stdout.trim());
        break;
      } catch (e) {
        console.log("❌ Python command failed:", cmd, e.message);
      }
    }

    if (!pythonCmd) {
      return res.status(500).json({ error: "No working Python interpreter found" });
    }

    // Test basic Python execution
    const testCommand = `${pythonCmd} -c "import sys; print('Python executable:', sys.executable); print('Python version:', sys.version)"`;
    const { stdout: testOutput } = await promisify(exec)(testCommand);
    
    // Test ML library imports
    const mlTestCommand = `${pythonCmd} -c "import pandas as pd; import joblib; import sklearn; print('ML libraries imported successfully')"`;
    const { stdout: mlOutput } = await promisify(exec)(mlTestCommand);
    
    // Check if model files exist
    const modelPath = path.resolve(__dirname, "../rf_model.joblib");
    const encoderPath = path.resolve(__dirname, "../label_encoder.joblib");
    const scriptPath = path.resolve(__dirname, "../ml/model_predictor.py");
    
    const filesExist = {
      model: fs.existsSync(modelPath),
      encoder: fs.existsSync(encoderPath),
      script: fs.existsSync(scriptPath)
    };

    res.json({
      success: true,
      python: {
        command: pythonCmd,
        version: testOutput.trim(),
        mlLibraries: mlOutput.trim()
      },
      files: {
        modelPath,
        encoderPath,
        scriptPath,
        exist: filesExist
      }
    });

  } catch (error) {
    console.error("❌ Python environment test failed:", error);
    res.status(500).json({ 
      error: "Python environment test failed", 
      details: error.message 
    });
  }
};

export const analyzeReport = async (req, res) => {
  console.log("📥 Analyze report triggered");
  console.log("📄 Uploaded file info:", req.file);

  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const cloudinaryUrl = req.file.path; // This is the Cloudinary URL
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const tempDir = path.resolve(__dirname, "../uploads/temp");
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  const tempFilePath = path.join(tempDir, `temp_${Date.now()}_${req.file.originalname}`);

  const execAsync = promisify(exec);

  try {
    console.log("📥 Starting file download from Cloudinary:", cloudinaryUrl);
    
    // Download the file from Cloudinary URL
    const response = await axios.get(cloudinaryUrl, { 
      responseType: 'stream',
      timeout: 30000 // 30 second timeout
    });
    
    console.log("📥 Cloudinary response status:", response.status);
    console.log("📥 Content type:", response.headers['content-type']);
    
    const writer = fs.createWriteStream(tempFilePath);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    console.log("📂 Downloaded to temp file:", tempFilePath);
    
    // Verify file was downloaded
    if (!fs.existsSync(tempFilePath)) {
      throw new Error("Downloaded file not found");
    }
    
    const stats = fs.statSync(tempFilePath);
    console.log("📂 File size:", stats.size, "bytes");
    
    if (stats.size === 0) {
      throw new Error("Downloaded file is empty");
    }

    const scriptPath = path.resolve(__dirname, "../ml/model_predictor.py");

    // Use python3 in production (Docker), fallback to venv for local dev
    // Check multiple possible Python commands
    let pythonCmd;
    const possiblePythonCmds = ['python3', 'python', '/usr/bin/python3', '/usr/bin/python'];
    
    // Always try production approach first (works in Docker/Render)
    let foundPython = false;
    for (const cmd of possiblePythonCmds) {
      try {
        await execAsync(`${cmd} --version`);
        pythonCmd = cmd;
        console.log("✅ Found working Python command:", cmd);
        foundPython = true;
        break;
      } catch (e) {
        console.log("❌ Python command failed:", cmd, e.message);
      }
    }
    
    // Fallback to local venv only if production commands fail
    if (!foundPython) {
      console.log("⚠️ No production Python found, trying local venv...");
      pythonCmd = `"${path.resolve(__dirname, "../../.venv/Scripts/python.exe")}"`;
    }
    
    console.log("📜 Script path:", scriptPath);
    console.log("🐍 Python command:", pythonCmd);
    console.log("📁 Temp file path:", tempFilePath);
    console.log("🌍 NODE_ENV:", process.env.NODE_ENV);

    // Check if files exist before running
    if (!fs.existsSync(scriptPath)) {
      console.error("❌ Python script not found:", scriptPath);
      return res.status(500).json({ error: "ML script not found" });
    }
    if (!fs.existsSync(path.resolve(__dirname, "../rf_model.joblib"))) {
      console.error("❌ Model file not found:", path.resolve(__dirname, "../rf_model.joblib"));
      return res.status(500).json({ error: "ML model file not found" });
    }

    // Test Python availability first
    try {
      const testCommand = `${pythonCmd} --version`;
      console.log("🧪 Testing Python command:", testCommand);
      const { stdout: pythonVersion } = await execAsync(testCommand);
      console.log("✅ Python version:", pythonVersion.trim());
    } catch (pythonError) {
      console.error("❌ Python command failed:", pythonError.message);
      return res.status(500).json({ error: "Python environment not available", details: pythonError.message });
    }

    // Test Python script with a simple import
    try {
      const testScriptCommand = `${pythonCmd} -c "import sys; print('Python working'); print('Python path:', sys.executable)"`;
      console.log("🧪 Testing Python script execution:", testScriptCommand);
      const { stdout: testOutput } = await execAsync(testScriptCommand);
      console.log("✅ Python script test output:", testOutput.trim());
    } catch (scriptError) {
      console.error("❌ Python script test failed:", scriptError.message);
      return res.status(500).json({ error: "Python script execution failed", details: scriptError.message });
    }

    // Use the python interpreter
    const command = `${pythonCmd} "${scriptPath}" "${tempFilePath}"`;
    console.log("🚀 Executing command:", command);

    let stdout, stderr;
    try {
      const result = await execAsync(command);
      stdout = result.stdout;
      stderr = result.stderr;
      console.log("🐍 Command executed successfully");
    } catch (execError) {
      console.error("❌ Command execution failed:", execError.message);
      // Clean up temp file
      fs.unlink(tempFilePath, (unlinkErr) => {
        if (unlinkErr) console.error("Error deleting temp file:", unlinkErr);
      });
      return res.status(500).json({ 
        error: "ML analysis failed", 
        details: execError.message,
        command: command
      });
    }

    // Clean up temp file
    fs.unlink(tempFilePath, (unlinkErr) => {
      if (unlinkErr) console.error("Error deleting temp file:", unlinkErr);
    });

    if (stderr) {
      console.error("⚠️ Python stderr:", stderr);
    }
    console.log("🐍 Raw Python output:", stdout);

    // Attempt to parse the output
    let result;
    try {
      const lines = stdout.trim().split('\n');
      const lastLine = lines[lines.length - 1];
      console.log("🐍 Last line of output:", lastLine);
      result = JSON.parse(lastLine);
    } catch (parseError) {
      console.error("❌ JSON parse error:", parseError.message);
      console.error("❌ Raw stdout:", stdout);
      console.error("❌ Raw stderr:", stderr);
      return res.status(500).json({
        error: "Invalid response from Python script",
        rawOutput: stdout,
        rawError: stderr,
        parseError: parseError.message
      });
    }

    if (result.error) {
      console.error("❌ Script returned error:", result.error);
      
      if (result.error.includes("Missing values")) {
        return res.status(422).json(result);
      }
      if (result.error.includes("format") || result.error.includes("supported")) {
        return res.status(400).json(result);
      }
      
      return res.status(500).json(result);
    }

    console.log("✅ Parsed result:", result);
    return res.json(result);

  } catch (error) {
    console.error("❌ Error in analyzeReport:", error);
    // Clean up temp file if it exists
    if (fs.existsSync(tempFilePath)) {
      fs.unlink(tempFilePath, (unlinkErr) => {
        if (unlinkErr) console.error("Error deleting temp file:", unlinkErr);
      });
    }
    return res.status(500).json({ error: "Failed to analyze report", details: error.message });
  }
};


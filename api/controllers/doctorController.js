import Doctor from "../models/Doctor.js";
import Patient from "../models/Patient.js";


export const updateAppointmentStatus = async (req, res) => {
  try {
    const { apptId } = req.params;
    const { status, rejectionReason = "" } = req.body;

    const doctor = await Doctor.findOne({ userRef: req.user._id });
    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }

    const appointment = doctor.appointments.id(apptId);
    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    appointment.status = status;
    appointment.rejectionReason = rejectionReason;

    await doctor.save();

    // --- Socket.IO Notification to Patient ---
    const io = req.app.get("io");
    const patientSockets = req.app.get("patientSockets");
    
    const patientId = String(appointment.patientRef);
    const patientSocketIds = patientSockets[patientId];
    
    console.log(`[NOTIFY] Appointment ${apptId} status updated to ${status} for patient ${patientId}`);
    console.log(`[NOTIFY DEBUG] Found Patient Socket IDs: ${patientSocketIds}`);

    if (patientSocketIds && patientSocketIds.length > 0) {
      patientSocketIds.forEach(socketId => {
        io.to(socketId).emit("appointmentStatus", {
          appointmentId: apptId,
          status,
          rejectionReason: status === 'Cancelled' ? rejectionReason : undefined,
          doctorName: doctor.name,
        });
      });
      console.log(`[NOTIFY] Emitted appointmentStatus to patient ${patientId} on sockets: ${patientSocketIds}`);
    } else {
      console.log(`[NOTIFY] FAILED: No active socket found for patient ${patientId}`);
    }
    // --- End Notification ---

    res.status(200).json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to update appointment status",
    });
  }
};


/* =========================================================
   CREATE DOCTOR PROFILE
   ========================================================= */
export const createDoctorListing = async (req, res) => {
  try {
    const userId = req.user._id;

    // ✅ Validate that user has doctor role
    if (req.user.role !== 'doctor') {
      return res.status(403).json({
        message: "Access denied. Only users with doctor role can create doctor profiles."
      });
    }

    // Check if profile exists
    const existing = await Doctor.findOne({ userRef: userId });
    if (existing) {
      // Update existing profile
      const updates = { ...req.body };

      if (updates.languages) {
        updates.languages = Array.isArray(updates.languages)
          ? updates.languages
          : updates.languages.split(",").map((l) => l.trim()).filter(Boolean);
      }

      if (req.file) {
        updates.imageUrl = req.file.path.startsWith("http")
          ? req.file.path
          : `/uploads/${req.file.filename}`;
      }

      const updatedDoctor = await Doctor.findOneAndUpdate(
        { userRef: userId },
        updates,
        { new: true, runValidators: true }
      );

      return res.json({ message: "Doctor profile updated successfully", doctor: updatedDoctor });
    }

    // Create new profile
    const {
      name,
      specialty,
      description,
      consultationFees,
      qualifications,
      yearsOfExperience,
      contactNumber,
      clinicName,
      clinicAddress,
      registrationNumber,
      gender,
      languages,
      linkedIn,
      awards,
      services,
    } = req.body;

    const languagesArray = Array.isArray(languages)
      ? languages
      : typeof languages === "string"
      ? languages.split(",").map((l) => l.trim()).filter(Boolean)
      : [];

    const doctorData = {
      name,
      specialty,
      description,
      consultationFees,
      qualifications,
      yearsOfExperience,
      contactNumber,
      clinicName,
      clinicAddress,
      registrationNumber,
      gender,
      languages: languagesArray,
      linkedIn,
      awards,
      services,
      userRef: userId,
    };

    if (req.file) {
      doctorData.imageUrl = req.file.path.startsWith("http")
        ? req.file.path
        : `/uploads/${req.file.filename}`;
    }

    const doctor = await Doctor.create(doctorData);

    res.status(201).json(doctor);
  } catch (error) {
    console.error("Create doctor error:", error);
    res.status(500).json({ message: "Failed to create doctor profile" });
  }
};
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().select("-password");
    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch doctors" });
  }
};

export const getDoctorSlotsForDate = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    if (!doctorId || !date) {
      return res.status(400).json({
        message: "doctorId and date are required",
      });
    }

    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }

    const dayName = new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
    });

    const availability =
      doctor.availableTimeSlots?.find((d) => d.day === dayName) ||
      doctor.availability?.find((d) => d.day === dayName) || null;

    // Get booked slots from doctor's appointments
    const startOfDay = new Date(date + 'T00:00:00Z'); // UTC start of day
    const endOfDay = new Date(date + 'T23:59:59.999Z'); // UTC end of day

    const bookedSlots = doctor.appointments
      .filter(app => 
        app.appointmentTime >= startOfDay && 
        app.appointmentTime <= endOfDay && 
        ['Pending', 'Confirmed'].includes(app.status)
      )
      .map(app => {
        // Convert UTC time to local time for display
        const localStartTime = new Date(app.appointmentTime);
        const localEndTime = app.appointmentEndTime ? new Date(app.appointmentEndTime) : null;
        
        return {
          start: `${localStartTime.getHours().toString().padStart(2, '0')}:${localStartTime.getMinutes().toString().padStart(2, '0')}`,
          end: localEndTime ? `${localEndTime.getHours().toString().padStart(2, '0')}:${localEndTime.getMinutes().toString().padStart(2, '0')}` : null
        };
      });

    res.status(200).json({
      slots: availability?.slots || [],
      booked: bookedSlots
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch slots for date",
    });
  }
};
export const getPatientHistory = async (req, res) => {
  try {
    const { patientId } = req.params;

    // Find the patient and get their medical history
    const patient = await Patient.findById(patientId).select('medicalHistory name');

    if (!patient) {
      return res.status(404).json({
        message: "Patient not found",
      });
    }

    // Format the medical history with timestamps
    const history = patient.medicalHistory.map(item => ({
      question: item.question,
      answer: item.answer,
      createdAt: new Date().toISOString() // Use current date as we don't store individual timestamps
    }));

    res.status(200).json({
      history: history,
      patientName: patient.name
    });
  } catch (error) {
    console.error("Error fetching patient medical history:", error);
    res.status(500).json({
      message: "Failed to fetch patient medical history",
    });
  }
};

/* =========================================================
   GET LOGGED-IN DOCTOR PROFILE
   ========================================================= */
export const getMyProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userRef: req.user._id });
    if (!doctor) {
      return res.status(404).json({ message: "Doctor profile not found" });
    }
    // Add cache control headers to prevent caching
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================================================
   UPDATE DOCTOR PROFILE
   ========================================================= */
export const updateDoctorProfile = async (req, res) => {
  try {
    const updates = { ...req.body };

    if (updates.languages) {
      updates.languages = Array.isArray(updates.languages)
        ? updates.languages
        : updates.languages.split(",").map((l) => l.trim()).filter(Boolean);
    }

    if (req.file) {
      updates.imageUrl = req.file.path.startsWith("http")
        ? req.file.path
        : `/uploads/${req.file.filename}`;
    }

    const doctor = await Doctor.findOneAndUpdate(
      { userRef: req.user._id },
      updates,
      { new: true, runValidators: true }
    );

    if (!doctor) {
      return res.status(404).json({ message: "Doctor profile not found" });
    }

    res.json(doctor);
  } catch (error) {
    console.error("Update doctor error:", error);
    res.status(500).json({ message: "Failed to update doctor profile" });
  }
};

/* =========================================================
   SET AVAILABILITY (🔥 FIXED)
   ========================================================= */
export const setAvailability = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userRef: req.user._id });

    // ❌ doctor does not exist
    if (!doctor) {
      return res.status(404).json({
        message: "Doctor profile not found. Create profile first.",
      });
    }

    doctor.availability = req.body.slots || [];
    await doctor.save();

    res.json({
      message: "Availability updated successfully",
      availability: doctor.availability,
    });
  } catch (error) {
    console.error("Set availability error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================================================
   SAVE TIME SLOTS
   ========================================================= */
export const saveTimeSlots = async (req, res) => {
  try {
    console.log('saveTimeSlots called with body:', req.body);

    const doctor = await Doctor.findOne({ userRef: req.user._id });
    console.log('Doctor found:', !!doctor);

    // ❌ doctor does not exist
    if (!doctor) {
      return res.status(404).json({
        message: "Doctor profile not found. Create profile first.",
      });
    }

    console.log('Slots received:', req.body.slots);

    if (!req.body.slots || !Array.isArray(req.body.slots)) {
      return res.status(400).json({ message: "Invalid slots data" });
    }

    // Group slots by day
    const slotMap = {};
    req.body.slots.forEach(slot => {
      console.log('Processing slot:', slot);
      if (!slot.day || !slot.start || !slot.end) {
        console.log('Invalid slot data:', slot);
        return;
      }
      if (!slotMap[slot.day]) slotMap[slot.day] = [];
      slotMap[slot.day].push({ start: slot.start, end: slot.end });
    });

    const groupedSlots = Object.keys(slotMap).map(day => ({
      day,
      slots: slotMap[day],
    }));

    console.log('Grouped slots:', groupedSlots);

    doctor.availableTimeSlots = groupedSlots;
    await doctor.save();

    res.json({
      message: "Time slots saved successfully",
      availableTimeSlots: doctor.availableTimeSlots,
    });
  } catch (error) {
    console.error("Save time slots error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================================================
   GET AVAILABILITY (LOGGED-IN DOCTOR)
   ========================================================= */
export const getMyAvailability = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userRef: req.user._id });
    if (!doctor) {
      return res.status(404).json({ message: "Doctor profile not found" });
    }
    res.json(doctor.availableTimeSlots || []);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================================================
   DELETE AVAILABILITY SLOT
   ========================================================= */
export const deleteAvailability = async (req, res) => {
  try {
    const { day, start, end } = req.body;

    const doctor = await Doctor.findOne({ userRef: req.user._id });
    if (!doctor) {
      return res.status(404).json({ message: "Doctor profile not found" });
    }

    const daySlot = doctor.availableTimeSlots.find((d) => d.day === day);
    if (daySlot) {
      daySlot.slots = daySlot.slots.filter(
        (s) => !(s.start === start && s.end === end)
      );

      if (daySlot.slots.length === 0) {
        doctor.availableTimeSlots = doctor.availableTimeSlots.filter(
          (d) => d.day !== day
        );
      }

      await doctor.save();
    }

    res.json({
      message: "Slot deleted successfully",
      availableTimeSlots: doctor.availableTimeSlots,
    });
  } catch (error) {
    console.error("Delete availability error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================================================
   GET AVAILABLE DOCTORS (SEARCH)
   ========================================================= */
export const getAvailableDoctors = async (req, res) => {
  try {
    const { name, specialty, maxFee, day, slotTime } = req.query;

    const filter = {
      availability: { $exists: true, $ne: [] },
    };

    if (name) filter.name = { $regex: name, $options: "i" };
    if (specialty) filter.specialty = { $regex: specialty, $options: "i" };
    if (maxFee) filter.consultationFees = { $lte: Number(maxFee) };
    if (day) filter["availability.day"] = day;

    let doctors = await Doctor.find(filter);

    if (day && slotTime) {
      doctors = doctors.filter((doc) => {
        const daySlot = doc.availability.find((d) => d.day === day);
        return daySlot?.slots.some(
          (s) => s.start <= slotTime && s.end > slotTime
        );
      });
    }

    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================================================
   GET SCHEDULED APPOINTMENTS (DOCTOR)
   ========================================================= */
export const getScheduledAppointments = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userRef: req.user._id });
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    const appointments = doctor.appointments.map(appt => ({
      ...appt.toObject(),
      amount: appt.amount || doctor.consultationFees || 500
    }));
    res.json({ appointments });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

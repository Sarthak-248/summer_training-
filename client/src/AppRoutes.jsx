import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/SignUp";
import LandingPage from "./pages/LandingPage";

// Doctor pages
import DoctorHome from "./pages/doctorHome";
import ProfileSettings from "./components/ProfileSettings";
import CreateListing from "./pages/CreateListing";
import DoctorNotifications from "./pages/DoctorNotifications";
import ScheduledAppointment from "./pages/scheduledAppointments";
import ConsultHistory from "./pages/ConsultHistory";
import PatientHistory from "./pages/PatientHistory";
import About from "./pages/About";

// Patient pages
import PatientHome from "./pages/patientHome";
import BookAppointment from "./pages/BookAppointment";
import UpcomingAppointments from "./pages/UpcomingAppointments";
import Favorite from "./pages/Favorites";
import PatientDashboard from "./components/patientDashboard";
import Analyze from "./pages/Analyze";
import PatientNotifications from "./pages/PatientNotifications";
import PatientAbout from "./pages/PatientAbout";

// Shared
import Profile from "./pages/Profile";
import VideoCallPage from "./pages/VideoCallPage";

// Layouts
import DoctorLayout from "./layouts/DoctorLayout";
import PatientLayout from "./layouts/PatientLayout";

const AppRoutes = () => {
  const role = localStorage.getItem("role"); // "doctor" | "patient" | null

  return (
    <Routes>
      {/* ROOT */}
      <Route
        path="/"
        element={
          role === "doctor" ? (
            <Navigate to="/doctor/home" />
          ) : role === "patient" ? (
            <Navigate to="/patient/home" />
          ) : (
            <LandingPage />
          )
        }
      />

      {/* ---------------- DOCTOR ROUTES ---------------- */}
      <Route path="/doctor" element={<DoctorLayout />}>
        <Route path="home" element={<DoctorHome />} />
        <Route path="set-availability" element={<ProfileSettings />} />
        <Route path="create-listing" element={<CreateListing />} />
        <Route path="scheduled-appointments" element={<ScheduledAppointment />} />
        <Route path="consult-history" element={<ConsultHistory />} />
        <Route path="patienthistory/:id" element={<PatientHistory />} />
        <Route path="notifications" element={<DoctorNotifications />} />
        <Route path="about" element={<About />} />
      </Route>

      {/* ---------------- PATIENT ROUTES ---------------- */}
      <Route path="/patient" element={<PatientLayout />}>
        <Route path="home" element={<PatientHome />} />
        <Route path="appointments" element={<BookAppointment />} />
        <Route path="appointments/upcoming" element={<UpcomingAppointments />} />
        <Route path="consult-history" element={<ConsultHistory />} />
        <Route path="post-history" element={<PatientDashboard />} />
        <Route path="analyze-report" element={<Analyze />} />
        <Route path="favorites" element={<Favorite />} />
        <Route path="notifications" element={<PatientNotifications />} />
        <Route path="about" element={<PatientAbout />} />
      </Route>

      {/* ---------------- PUBLIC ROUTES ---------------- */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/video-call/:appointmentId" element={<VideoCallPage />} />

      {/* ---------------- FALLBACK ---------------- */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;

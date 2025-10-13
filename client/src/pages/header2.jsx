import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileDropdown from '../components/ProfileDropdown';
import { Link } from 'react-router-dom';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

const DoctorHome = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('doctorNotifications');
    return saved ? JSON.parse(saved) : [];
  });

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('doctorNotifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    // Request notification permission
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }

    // Register doctor socket connection
    const doctorId = localStorage.getItem('doctorId');
    console.log('[SOCKET] Registering doctor socket with ID:', doctorId);
    if (doctorId) {
      socket.emit('registerDoctor', doctorId);
    }

    // Listen for new appointments
    socket.on('newAppointment', (data) => {
      const newNotification = {
        id: Date.now(),
        type: 'appointment',
        patientName: data.patientName,
        appointmentTime: data.appointmentTime,
        reason: data.reason,
        time: new Date().toLocaleTimeString(),
        read: false
      };
      // Always read latest from localStorage
      const saved = localStorage.getItem('doctorNotifications');
      const current = saved ? JSON.parse(saved) : [];
      const updated = [newNotification, ...current];
      setNotifications(updated);
      localStorage.setItem('doctorNotifications', JSON.stringify(updated));

      // Show browser notification if permission granted [DISABLED]
      // if (Notification.permission === "granted") {
      //   new Notification("New Appointment Request", {
      //     body: `${data.patientName} has requested an appointment`,
      //     icon: "/icons/appointment-success.png"
      //   });
      // }
    });

    // Listen for payment notifications
    socket.on('paymentReceived', (data) => {
      const newNotification = {
        id: Date.now(),
        type: 'payment',
        patientName: data.patientName,
        amount: data.amount,
        paymentId: data.paymentId,
        appointmentId: data.appointmentId,
        time: new Date().toLocaleTimeString(),
        read: false
      };
      // Always read latest from localStorage
      const saved = localStorage.getItem('doctorNotifications');
      const current = saved ? JSON.parse(saved) : [];
      const updated = [newNotification, ...current];
      setNotifications(updated);
      localStorage.setItem('doctorNotifications', JSON.stringify(updated));

      // Show browser notification if permission granted [DISABLED]
      // if (Notification.permission === "granted") {
      //   new Notification("Payment Received", {
      //     body: `Payment of ₹${data.amount} received from ${data.patientName}`,
      //     icon: "/icons/payment-success.png"
      //   });
      // }
    });

    return () => {
      socket.off('newAppointment');
      socket.off('paymentReceived');
    };
  }, []);

  // Notification indicator logic
  const hasUnread = notifications.some(n => !n.read);
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <nav
      className="bg-gradient-to-r from-indigo-900/95 via-purple-900/95 to-pink-900/95 backdrop-blur-lg text-white shadow-2xl fixed top-0 w-full z-50 transition-all duration-300 border-b border-white/10"
      role="navigation"
      aria-label="Doctor Navigation"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Brand with heart icon */}
        <Link
          to="/doctor/home"
          className="group flex items-center gap-3 text-2xl font-black text-white hover:text-pink-300 tracking-wide transition-all duration-300"
          aria-label="Go to Health Care Companion Home"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
            <div className="relative bg-gradient-to-r from-pink-500 to-purple-500 p-2 rounded-lg shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
          </div>
          <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
            Health Care Companion
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-2">
          <Link
            to="/doctor/home"
            className="px-4 py-2 rounded-xl font-semibold transition-all duration-300 hover:bg-white/10 flex items-center gap-2 text-purple-200 hover:text-white"
            aria-label="Go to Home page"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Home
          </Link>
          
          <Link
            to="/doctor/scheduled-appointments"
            className="px-5 py-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
            aria-label="View Scheduled Appointments"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Appointments
          </Link>
          
          <Link
            to="/doctor/notifications"
            className="relative px-4 py-2 rounded-xl font-semibold transition-all duration-300 hover:bg-white/10 flex items-center gap-2 text-purple-200 hover:text-white"
            aria-label="Notifications and Reminders"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>
          
          <Link
            to="/doctor/about"
            className="px-4 py-2 rounded-xl font-semibold transition-all duration-300 hover:bg-white/10 flex items-center gap-2 text-purple-200 hover:text-white"
            aria-label="About this application"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            About
          </Link>

          {/* Profile Dropdown */}
          <ProfileDropdown />
          
          <button
            onClick={handleLogout}
            className="ml-2 px-5 py-2 bg-red-600/80 hover:bg-red-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default DoctorHome;

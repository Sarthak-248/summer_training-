import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import DashboardDropdown from "../components/dashboardDropdown";
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

const PatientHome = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('patientNotifications');
    return saved ? JSON.parse(saved) : [];
  });
  const location = useLocation();
  const navigate = useNavigate();

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Request permission for browser notifications if not granted
  useEffect(() => {
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('patientNotifications', JSON.stringify(notifications));
  }, [notifications]);

  // Socket connection for notifications
  useEffect(() => {
    const patientId = localStorage.getItem('patientId');
    if (patientId) {
      socket.emit('registerPatient', patientId);
    }

    socket.on('appointmentStatus', (data) => {
      let message = data.message || '';
      if (!message) {
        if (data.status === 'Confirmed') {
          message = `Your appointment with Dr. ${data.doctorName} has been accepted`;
        } else if (data.status === 'Cancelled' || data.status === 'Rejected') {
          message = `Your appointment with Dr. ${data.doctorName} was ${data.status.toLowerCase()}`;
        } else {
          message = `Your appointment status was updated: ${data.status}`;
        }
      }

      const newNotification = {
        id: Date.now(),
        type: 'status',
        message,
        status: data.status,
        doctorName: data.doctorName,
        appointmentTime: data.appointmentTime,
        reason: data.reason,
        time: new Date().toLocaleTimeString(),
        read: false
      };

      setNotifications(prev => [newNotification, ...prev]);

      // Show browser notification if permission granted [DISABLED]
      // if (Notification.permission === "granted") {
      //   new Notification("Appointment Update", {
      //     body: message,
      //     icon: data.status === 'Confirmed' ? "/icons/appointment-success.png" : "/icons/appointment-error.png"
      //   });
      // }
    });

    return () => {
      socket.off('appointmentStatus');
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
      className="bg-gradient-to-r from-slate-900/95 via-blue-900/95 to-indigo-900/95 backdrop-blur-lg text-white shadow-2xl fixed top-0 w-full z-50 transition-all duration-300 border-b border-white/10"
      role="navigation"
      aria-label="Main Navigation"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/patient/home"
          className="group flex items-center gap-3 text-2xl font-black text-white hover:text-pink-300 tracking-wide transition-all duration-300"
          aria-label="Go to Health Care Companion Home"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
            <div className="relative bg-gradient-to-r from-blue-500 to-indigo-500 p-2 rounded-lg shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
          </div>
          <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Health Care Companion
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-2">
          <Link
            to="/patient/home"
            className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 hover:bg-white/10 flex items-center gap-2 ${
              location.pathname === "/patient/home" ? "bg-white/20 text-white" : "text-purple-200 hover:text-white"
            }`}
            aria-current={location.pathname === "/patient/home" ? "page" : undefined}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Home
          </Link>
          
          <Link
            to="/patient/appointments"
            className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 hover:bg-white/10 flex items-center gap-2 ${
              location.pathname === "/patient/appointments" ? "bg-white/20 text-white" : "text-purple-200 hover:text-white"
            }`}
            aria-current={location.pathname === "/patient/appointments" ? "page" : undefined}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Book
          </Link>
          
          <Link
            to="/patient/favorites"
            className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 hover:bg-white/10 flex items-center gap-2 ${
              location.pathname === "/patient/favorites" ? "bg-white/20 text-white" : "text-purple-200 hover:text-white"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            Favorites
          </Link>

          <Link
            to="/patient/appointments/upcoming"
            className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
            aria-current={location.pathname === "/patient/appointments/upcoming" ? "page" : undefined}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            My Appointments
          </Link>

          {/* Notification Link */}
          <Link
            to="/patient/notifications"
            className="relative px-4 py-2 rounded-xl font-semibold transition-all duration-300 hover:bg-white/10 flex items-center gap-2 text-purple-200 hover:text-white"
            aria-label="Notifications and Reminders"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>

          <Link
            to="/profile"
            className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 hover:bg-white/10 flex items-center gap-2 ${
              location.pathname === "/profile" ? "bg-white/20 text-white" : "text-purple-200 hover:text-white"
            }`}
            aria-current={location.pathname === "/profile" ? "page" : undefined}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Profile
          </Link>

          <DashboardDropdown />

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

        {/* Mobile Menu Toggle */}
        <button
          className="lg:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={`${menuOpen ? "Close" : "Open"} mobile menu`}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          type="button"
        >
          {menuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {menuOpen && (
        <div
          id="mobile-menu"
          className="lg:hidden bg-gradient-to-b from-indigo-900/95 to-purple-900/95 backdrop-blur-xl border-t border-white/10 shadow-2xl"
          role="menu"
        >
          <div className="px-4 py-6 space-y-2">
            <Link
              to="/patient/home"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                location.pathname === "/patient/home" 
                  ? "bg-white/20 text-white shadow-lg" 
                  : "text-purple-200 hover:bg-white/10 hover:text-white"
              }`}
              onClick={() => setMenuOpen(false)}
              role="menuitem"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home
            </Link>
            
            <Link
              to="/patient/appointments"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                location.pathname === "/patient/appointments" 
                  ? "bg-white/20 text-white shadow-lg" 
                  : "text-purple-200 hover:bg-white/10 hover:text-white"
              }`}
              onClick={() => setMenuOpen(false)}
              role="menuitem"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Book Appointment
            </Link>
            
            <Link
              to="/patient/favorites"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                location.pathname === "/patient/favorites" 
                  ? "bg-white/20 text-white shadow-lg" 
                  : "text-purple-200 hover:bg-white/10 hover:text-white"
              }`}
              onClick={() => setMenuOpen(false)}
              role="menuitem"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Favorites
            </Link>

            <Link
              to="/patient/appointments/upcoming"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                location.pathname === "/patient/appointments/upcoming" 
                  ? "bg-white/20 text-white shadow-lg" 
                  : "text-purple-200 hover:bg-white/10 hover:text-white"
              }`}
              onClick={() => setMenuOpen(false)}
              role="menuitem"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              My Appointments
            </Link>
            
            <Link
              to="/patient/notifications"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 relative ${
                location.pathname === "/patient/notifications" 
                  ? "bg-white/20 text-white shadow-lg" 
                  : "text-purple-200 hover:bg-white/10 hover:text-white"
              }`}
              onClick={() => setMenuOpen(false)}
              role="menuitem"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              Notifications
              {unreadCount > 0 && (
                <span className="ml-auto bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            <Link
              to="/profile"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                location.pathname === "/profile" 
                  ? "bg-white/20 text-white shadow-lg" 
                  : "text-purple-200 hover:bg-white/10 hover:text-white"
              }`}
              onClick={() => setMenuOpen(false)}
              role="menuitem"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Profile
            </Link>

            <div className="pt-4 mt-4 border-t border-white/10">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center gap-3 px-4 py-3 w-full rounded-xl font-semibold bg-red-600/80 hover:bg-red-600 text-white transition-all duration-300 shadow-lg"
                role="menuitem"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default PatientHome;

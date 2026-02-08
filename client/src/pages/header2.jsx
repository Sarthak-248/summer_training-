import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';
import AppLogo from '../assets/logo.svg';

const socket = window.io ? window.io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
  transports: ['websocket', 'polling'],
  upgrade: true,
  rememberUpgrade: true,
  timeout: 20000
}) : null;

// Extracted ProfileMenu Component for better organization
const ProfileMenu = ({ onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 rounded-full hover:bg-white/10 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-pink-500"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-rose-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-white/10 shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="py-1">
            <button
               onClick={() => {
                   setIsOpen(false);
                   navigate('/doctor/set-availability');
               }}
              className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors text-left"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Set Availability
            </button>
            
            <button
               onClick={() => {
                   setIsOpen(false);
                   navigate('/doctor/create-listing');
               }}
              className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors text-left"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              My Profile
            </button>

            <div className="border-t border-white/10 my-1"></div>
            
            <button
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
              className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-left"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};


const DoctorNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('doctorNotifications');
    return saved ? JSON.parse(saved) : [];
  });

  // Save notifications to localStorage
  useEffect(() => {
    localStorage.setItem('doctorNotifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    if (!socket) {
      console.error('[SOCKET] Socket.io not loaded');
      return;
    }
    
    // Register doctor socket connection
    const doctorId = localStorage.getItem('doctorId');
    console.log('[SOCKET] Registering doctor socket with ID:', doctorId);
    
    const registerDoctor = () => {
       if (doctorId) {
         socket.emit('registerDoctor', doctorId);
         console.log('[SOCKET] Emitted registerDoctor for:', doctorId);
       }
    };

    if (socket.connected) {
      registerDoctor();
    }

    socket.on('connect', () => {
      console.log('[SOCKET] Connected to server, registering doctor...');
      registerDoctor();
    });

    socket.on('disconnect', () => {
      console.log('[SOCKET] Disconnected from server');
    });

    // Listen for new appointments
    socket.on('newAppointment', (data) => {
      console.log('[SOCKET] Received newAppointment event:', data);
      
      try {
          // Show attractive toast notification
          toast.custom((t) => (
            <div
              className={`${
                t.visible ? 'animate-enter' : 'animate-leave'
              } max-w-md w-full bg-slate-900 border border-white/10 shadow-2xl rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 z-[9999]`}
            >
              <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 pt-0.5">
                   <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-pink-500 to-rose-500 flex items-center justify-center text-white font-bold animate-pulse">
                      {data.patientName ? data.patientName.charAt(0).toUpperCase() : '!'}
                   </div>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-bold text-white">
                      New Appointment Request
                    </p>
                    <p className="mt-1 text-sm text-slate-300">
                      <span className="font-semibold text-pink-400">{data.patientName}</span> has booked an appointment.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex border-l border-white/10">
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-pink-500 hover:text-pink-400 focus:outline-none hover:bg-white/5 transition-colors"
                >
                  View
                </button>
              </div>
            </div>
          ), { 
              duration: 8000,
              position: 'top-right',
          });
          console.log('[SOCKET] Toast trigger attempted');
      } catch (err) {
          console.error('[SOCKET] Toast failed:', err);
      }

      const newNotification = {
        id: Date.now(),
        type: 'appointment',
        patientName: data.patientName,
        appointmentTime: data.appointmentTime,
        reason: data.reason,
        time: new Date().toLocaleTimeString(),
        read: false
      };
      
      setNotifications(prev => {
        // Prevent duplicates
        const exists = prev.some(n => 
          n.type === 'appointment' && 
          n.appointmentTime === data.appointmentTime && 
          n.patientName === data.patientName &&
          Math.abs(new Date(n.time) - new Date()) < 5000
        );
        if(exists) return prev;
        
        const updated = [newNotification, ...prev];
        localStorage.setItem('doctorNotifications', JSON.stringify(updated));
        return updated;
      });
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

      setNotifications(prev => {
        // Prevent duplicates
        const exists = prev.some(n => 
          n.type === 'payment' && 
          n.paymentId === data.paymentId
        );
        if(exists) return prev;
        
        const updated = [newNotification, ...prev];
        localStorage.setItem('doctorNotifications', JSON.stringify(updated));
        return updated;
      });
    });

    return () => {
      socket.off('newAppointment');
      socket.off('paymentReceived');
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const NavLink = ({ to, children }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        className={`text-sm font-medium transition-all duration-200 px-3 py-2 rounded-lg flex items-center gap-2 ${
          isActive 
            ? "text-white bg-white/10" 
            : "text-white/70 hover:text-white hover:bg-white/5"
        }`}
      >
         {children}
      </Link>
    );
  };

  return (
    <nav className="h-16 w-full fixed top-0 z-50 bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 border-b border-white/10 shadow-lg backdrop-blur-md">
      <Toaster 
        position="top-right" 
        reverseOrder={false}
        toastOptions={{
            duration: 5000,
            style: {
                background: '#1e293b',
                color: '#fff',
                zIndex: 99999,
            },
        }}
        containerStyle={{
            top: 20, // Minimal offset
            zIndex: 99999,
        }}
      />
      <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* LEFT: Branding */}
        <Link 
          to="/doctor/home" 
          className="flex-shrink-0 flex items-center gap-0 group"
        >
           <div className="relative w-12 h-12 flex items-center justify-center rounded-lg transition-all duration-300 transform group-hover:scale-110">
             <img src={AppLogo} alt="HealthCard Logo" className="w-full h-full object-contain drop-shadow-lg" />
           </div>
           <span className="text-xl font-bold bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent tracking-tight">
             HealthCard
           </span>
        </Link>

        {/* CENTER: Navigation Links (Desktop) */}
        <div className="hidden lg:flex items-center gap-1">
          <NavLink to="/doctor/home">Home</NavLink>
          <NavLink to="/doctor/scheduled-appointments">Appointments</NavLink>
          <NavLink to="/doctor/about">About</NavLink>
        </div>

        {/* RIGHT: Actions */}
        <div className="hidden lg:flex items-center gap-4">
          
          {/* Notification Bell */}
          <Link
            to="/doctor/notifications"
            onClick={handleNotificationClick}
            className="relative p-2 text-white/70 hover:text-white transition-colors duration-200 focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full ring-2 ring-slate-900 animate-pulse"></span>
            )}
          </Link>

           {/* Profile Menu */}
           <div className="pl-2 border-l border-white/10">
              <ProfileMenu onLogout={handleLogout} />
           </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex lg:hidden items-center gap-4">
          <Link
            to="/doctor/notifications"
            onClick={handleNotificationClick}
            className="relative p-2 text-white/70 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full ring-1 ring-slate-900"></span>
            )}
          </Link>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 text-white/70 hover:text-white focus:outline-none"
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
      </div>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div className="lg:hidden absolute top-16 left-0 w-full bg-slate-900/95 backdrop-blur-xl border-b border-white/10 shadow-xl p-4 flex flex-col gap-2">
          <Link 
            to="/doctor/home" 
            className="p-3 rounded-lg text-white/80 hover:bg-white/10 hover:text-white font-medium"
            onClick={() => setMenuOpen(false)}
          >
            Home
          </Link>
          <Link 
            to="/doctor/scheduled-appointments" 
            className="p-3 rounded-lg text-white/80 hover:bg-white/10 hover:text-white font-medium"
            onClick={() => setMenuOpen(false)}
          >
            Appointments
          </Link>
          <Link 
            to="/doctor/about" 
            className="p-3 rounded-lg text-white/80 hover:bg-white/10 hover:text-white font-medium"
            onClick={() => setMenuOpen(false)}
          >
            About
          </Link>
          
          <div className="h-px bg-white/10 my-2"></div>
          
           <Link 
            to="/doctor/set-availability" 
            className="p-3 rounded-lg text-white/80 hover:bg-white/10 hover:text-white font-medium flex items-center gap-2"
            onClick={() => setMenuOpen(false)}
          >
            Set Availability
          </Link>
          
           <Link 
            to="/doctor/create-listing" 
            className="p-3 rounded-lg text-white/80 hover:bg-white/10 hover:text-white font-medium flex items-center gap-2"
            onClick={() => setMenuOpen(false)}
          >
            My Profile
          </Link>

          <button
            onClick={() => {
               setMenuOpen(false);
               handleLogout();
            }}
            className="p-3 rounded-lg text-red-400 hover:bg-red-500/10 text-left font-medium mt-2"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default DoctorNavbar;

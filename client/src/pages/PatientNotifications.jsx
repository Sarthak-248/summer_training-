import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

const PatientNotifications = () => {
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('patientNotifications');
    return saved ? JSON.parse(saved) : [];
  });
  const navigate = useNavigate();

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('patientNotifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    // Request notification permission [DISABLED]
    // if (Notification.permission === "default") {
    //   Notification.requestPermission();
    // }

    // Register patient socket connection
    const patientId = localStorage.getItem('patientId');
    console.log('[SOCKET] Patient registering with ID:', patientId);
    if (patientId) {
      socket.emit('registerPatient', patientId);
      console.log('[SOCKET] Emitted registerPatient with ID:', patientId);
    } else {
      console.error('[SOCKET] No patientId found in localStorage');
    }

    // Listen for appointment status updates
    socket.on('appointmentStatus', (data) => {
      console.log('[SOCKET] Received appointmentStatus:', data);
      let message = data.message || '';
      if (!message) {
        if (data.status === 'Confirmed') {
          message = data.paymentRequired 
            ? `Your appointment with Dr. ${data.doctorName} has been confirmed. Please complete payment of ₹${data.amount}`
            : `Your appointment with Dr. ${data.doctorName} has been confirmed`;
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
        paymentRequired: data.paymentRequired,
        amount: data.amount,
        time: new Date().toLocaleTimeString(),
        read: false
      };

      setNotifications(prev => [newNotification, ...prev]);

      console.log('[SOCKET] Adding appointment notification to state:', newNotification);

      // Show browser notification if permission granted [DISABLED]
      // if (Notification.permission === "granted") {
      //   new Notification("Appointment Update", {
      //     body: message,
      //     icon: data.status === 'Confirmed' ? "/icons/appointment-success.png" : "/icons/appointment-error.png"
      //   });
      // }
    });

    // Listen for payment confirmations
    socket.on('paymentReceived', (data) => {
      console.log('[SOCKET] Received paymentReceived:', data);
      const message = `Payment of ₹${data.amount} received for appointment with Dr. ${data.doctorName}. Your appointment is confirmed`;
      
      const newNotification = {
        id: Date.now(),
        type: 'payment',
        message,
        doctorName: data.doctorName,
        amount: data.amount,
        time: new Date().toLocaleTimeString(),
        read: false
      };

      console.log('[SOCKET] Adding payment notification to state:', newNotification);
      setNotifications(prev => [newNotification, ...prev]);

      // Show browser notification if permission granted [DISABLED]
      // if (Notification.permission === "granted") {
      //   new Notification('Payment Confirmed', { body: message });
      // }
    });

    // Connection event logging
    socket.on('connect', () => {
      console.log('[SOCKET] Patient connected to server');
    });

    socket.on('disconnect', () => {
      console.log('[SOCKET] Patient disconnected from server');
    });

    return () => {
      socket.off('appointmentStatus');
      socket.off('paymentReceived');
    };
  }, []);

  const handleNotificationClick = (notification) => {
    setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read: true } : n));
    navigate('/patient/appointments/upcoming');
  };

  const handleRemoveNotification = (e, notificationId) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed':
        return 'text-green-600';
      case 'Cancelled':
      case 'Rejected':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 py-8 px-4">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl top-10 left-10 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl bottom-10 right-10 animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mb-4 shadow-xl">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <h1 className="text-5xl font-black text-white mb-3">Notifications</h1>
          <p className="text-blue-200 text-lg">Stay updated with your health journey</p>
        </div>
        
        {/* Notifications Container */}
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-16 text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-white/10 rounded-full mb-6">
                <svg className="w-12 h-12 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p className="text-2xl font-semibold text-white mb-2">All caught up!</p>
              <p className="text-blue-200">You have no new notifications</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`group relative bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl border transition-all duration-300 hover:bg-white/20 hover:shadow-2xl hover:scale-[1.02] cursor-pointer overflow-hidden ${
                  !notification.read ? 'border-blue-400/50 bg-gradient-to-r from-blue-500/10 to-indigo-500/10' : 'border-white/20'
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                {/* Unread Indicator */}
                {!notification.read && (
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                )}
                
                <div className="p-6 flex items-start gap-4">
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
                    notification.status === 'Confirmed' ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
                    notification.status === 'Cancelled' || notification.status === 'Rejected' ? 'bg-gradient-to-r from-red-400 to-rose-500' :
                    notification.type === 'payment' ? 'bg-gradient-to-r from-blue-400 to-indigo-500' :
                    'bg-gradient-to-r from-blue-400 to-indigo-500'
                  }`}>
                    {notification.type === 'payment' ? (
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    ) : notification.status === 'Confirmed' ? (
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : notification.status === 'Cancelled' || notification.status === 'Rejected' ? (
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-white mb-2 leading-tight">
                      {notification.message}
                    </h3>
                    
                    {notification.doctorName && (
                      <p className="text-purple-200 text-sm mb-1 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Dr. {notification.doctorName}
                      </p>
                    )}
                    
                    {notification.appointmentTime && (
                      <p className="text-purple-200 text-sm mb-1 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(notification.appointmentTime).toLocaleString()}
                      </p>
                    )}
                    
                    {notification.amount && (
                      <p className="text-green-300 text-sm mb-1 flex items-center gap-2 font-semibold">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        ₹{notification.amount}
                      </p>
                    )}
                    
                    <p className="text-xs text-purple-300 mt-2 flex items-center gap-2">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {notification.time}
                    </p>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => handleRemoveNotification(e, notification.id)}
                    className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 hover:bg-red-500 text-white/70 hover:text-white transition-all duration-200 flex items-center justify-center group-hover:scale-110"
                    aria-label="Remove notification"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientNotifications;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client/dist/socket.io.esm.js';

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const socket = io(BACKEND_URL);

const DoctorNotifications = () => {
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('doctorNotifications');
    return saved ? JSON.parse(saved) : [];
  });
  const navigate = useNavigate();

  // Save notifications
  useEffect(() => {
    localStorage.setItem('doctorNotifications', JSON.stringify(notifications));
  }, [notifications]);

  // Socket logic
  useEffect(() => {
    const doctorId = localStorage.getItem('doctorId');
    console.log('[SOCKET] DoctorNotifications mounting. ID:', doctorId);
    
    const register = () => {
        if (doctorId) {
            socket.emit('registerDoctor', doctorId);
            console.log('[SOCKET] Emitted registerDoctor');
        }
    };

    if (socket.connected) register();

    socket.on('connect', () => {
        console.log('[SOCKET] Reconnected, re-registering doctor');
        register();
    });

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
      
      setNotifications(prev => {
        const exists = prev.some(n => 
            n.type === 'appointment' && 
            n.patientName === data.patientName && 
            n.appointmentTime === data.appointmentTime &&
            Math.abs(new Date(n.time) - new Date()) < 5000
        );
        if (exists) return prev;
        return [newNotification, ...prev];
      });
    });

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
         const exists = prev.some(n => 
             n.type === 'payment' && 
             n.paymentId === data.paymentId
         );
         if (exists) return prev;
         return [newNotification, ...prev];
      });
    });

    return () => {
      socket.off('newAppointment');
      socket.off('paymentReceived');
      socket.off('connect');
    };
  }, []);

  const handleNotificationClick = (notification) => {
    setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read: true } : n));
    navigate('/doctor/scheduled-appointments');
  };

  const handleRemoveNotification = (e, notificationId) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const clearAllNotifications = () => {
      setNotifications([]);
  };

  return (
    <div className="w-full pt-2 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="h-4"></div>
        
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                     <svg className="w-8 h-8 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                     </svg>
                </div>
              <h3 className="text-lg font-medium text-white/50">No notifications</h3>
              <p className="mt-1 text-sm text-gray-500">You're all caught up!</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 cursor-pointer 
                    ${!notification.read 
                        ? 'bg-gradient-to-r from-gray-800 to-gray-900 border-pink-500/50 shadow-lg shadow-pink-500/10' 
                        : 'bg-white/5 border-white/5 hover:bg-white/10'
                    }`}
              >
                  {/* Status Indicator */}
                  {!notification.read && (
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-pink-500/20 to-transparent -mr-10 -mt-10 rounded-full blur-2xl"></div>
                  )}

                <div className="p-3 flex items-start gap-3 relative z-10">
                   {/* Icon */}
                  <div className={`p-2 rounded-xl flex-shrink-0 ${
                      notification.type === 'payment' 
                      ? 'bg-green-500/10 text-green-400' 
                      : 'bg-blue-500/10 text-blue-400'
                  }`}>
                      {notification.type === 'payment' ? (
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                         </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                         <div>
                            <h4 className={`text-sm font-semibold ${!notification.read ? 'text-white' : 'text-gray-300'}`}>
                                {notification.type === 'payment' ? 'Payment Received' : 'New Appointment'}
                            </h4>
                            <p className="text-xs text-gray-500">{notification.time}</p>
                         </div>
                         {!notification.read && (
                             <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-pink-500/10 text-pink-400 ring-1 ring-inset ring-pink-500/20">
                                 New
                             </span>
                         )}
                    </div>
                    
                    <div className="mt-1">
                         {notification.type === 'appointment' ? (
                           <div className="text-xs text-gray-400 space-y-0.5">
                                <p><span className="text-gray-500">Patient:</span> <span className="text-gray-300 font-medium">{notification.patientName}</span></p>
                                <p><span className="text-gray-500">Scheduled:</span> <span className="text-gray-300">{new Date(notification.appointmentTime).toLocaleString()}</span></p>
                                {notification.reason && <p className="italic text-gray-500 truncate">"{notification.reason}"</p>}
                           </div>
                         ) : (
                            <div className="text-xs text-gray-400 space-y-0.5">
                                <div className="flex items-center gap-2">
                                     <span className="text-lg font-bold text-white">₹{notification.amount}</span>
                                     <span className="text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded text-[10px]">Success</span>
                                </div>
                                <p>From <span className="text-gray-300">{notification.patientName}</span></p>
                                <p className="text-xs text-gray-600 font-mono">ID: {notification.paymentId?.substring(0, 16)}...</p>
                            </div>
                         )}
                    </div>
                  </div>
                  
                  <button
                    onClick={(e) => handleRemoveNotification(e, notification.id)}
                    className="text-gray-600 hover:text-red-400 transition ml-2 p-1.5 rounded-lg hover:bg-white/5"
                    title="Dismiss"
                  >
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

export default DoctorNotifications;

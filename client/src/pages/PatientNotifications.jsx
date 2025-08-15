import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
  transports: ['websocket', 'polling'],
  timeout: 20000,
  forceNew: true
});

const PatientNotifications = () => {
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('patientNotifications');
      return saved ? JSON.parse(saved) : [];
    } catch (err) {
      console.error("Error parsing saved notifications:", err);
      return [];
    }
  });
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [socketError, setSocketError] = useState(null);

  const navigate = useNavigate();

  // Always re-sync from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('patientNotifications');
      if (saved) {
        setNotifications(JSON.parse(saved));
      }
    } catch (err) {
      console.error("Error parsing localStorage data on mount:", err);
    }
  }, []);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('patientNotifications', JSON.stringify(notifications));
    } catch (err) {
      console.error("Error saving notifications:", err);
    }
  }, [notifications]);

  useEffect(() => {
    // Request notification permission
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }

    // Socket connection handlers
    socket.on('connect', () => {
      console.log('Socket connected successfully');
      setConnectionStatus('connected');
      setSocketError(null);
      
      // Register patient socket connection
      const patientId = localStorage.getItem('patientId');
      if (patientId) {
        console.log("Registering patient socket with ID:", patientId);
        socket.emit('registerPatient', patientId);
      } else {
        console.warn("No patientId found in localStorage — socket may not receive events.");
        setSocketError('No patient ID found. Please log in again.');
      }
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnectionStatus('disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setConnectionStatus('error');
      setSocketError(error.message);
    });

    // Listen for appointment status updates
    socket.on('appointmentStatus', (data) => {
      console.log("Received appointmentStatus event:", data);

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

      setNotifications(prev => {
        // Prevent duplicate notifications
        const exists = prev.some(n => 
          n.message === message && 
          Math.abs(new Date(n.time) - new Date()) < 5000
        );
        if (exists) return prev;
        return [newNotification, ...prev];
      });

      // Show browser notification if permission granted
      if (Notification.permission === "granted") {
        try {
          new Notification("Appointment Update", {
            body: message,
            icon: data.status === 'Confirmed' 
              ? "/icons/appointment-success.png" 
              : "/icons/appointment-error.png"
          });
        } catch (notificationError) {
          console.error('Error showing browser notification:', notificationError);
        }
      }
    });

    // Handle socket errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
      setSocketError(error.message);
    });

    return () => {
      socket.off('appointmentStatus');
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('error');
    };
  }, []);

  const handleNotificationClick = (notification) => {
    setNotifications(prev =>
      prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
    );
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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-950 to-black py-16 px-6 md:px-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Notifications</h1>
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No notifications yet
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-6 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer transition ${!notification.read ? 'bg-yellow-50' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className={`font-semibold text-lg ${getStatusColor(notification.status)}`}>
                      {notification.message}
                    </h3>
                    {notification.doctorName && (
                      <p className="text-gray-600 mt-1">
                        Doctor: Dr. {notification.doctorName}
                      </p>
                    )}
                    {notification.appointmentTime && (
                      <p className="text-gray-600">
                        Time: {new Date(notification.appointmentTime).toLocaleString()}
                      </p>
                    )}
                    {notification.reason && (
                      <p className="text-gray-600 mt-1">
                        Reason: {notification.reason}
                      </p>
                    )}
                    <p className="text-sm text-gray-400 mt-2">
                      {notification.time}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleRemoveNotification(e, notification.id)}
                    className="text-gray-400 hover:text-red-500 transition"
                  >
                    ✖
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

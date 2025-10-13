// Notification System Test Script
// Run this with: node test-notifications.js

import { io } from 'socket.io-client';

// Connect to the server
const socket = io('http://localhost:5000');

socket.on('connect', () => {
  console.log('🔗 Connected to server with socket ID:', socket.id);
  
  // Test patient registration
  const testPatientId = 'test-patient-123';
  console.log('📱 Registering test patient:', testPatientId);
  socket.emit('registerPatient', testPatientId);
  
  // Test doctor registration  
  const testDoctorId = 'test-doctor-456';
  console.log('👨‍⚕️ Registering test doctor:', testDoctorId);
  socket.emit('registerDoctor', testDoctorId);
  
  // Wait a moment then send test notifications
  setTimeout(() => {
    console.log('\n=== SENDING TEST NOTIFICATIONS ===\n');
    
    // Test new appointment notification to doctor
    console.log('📋 Sending newAppointment to doctor...');
    socket.emit('testNotificationToDoctor', {
      doctorId: testDoctorId,
      event: 'newAppointment',
      data: {
        patientName: 'Test Patient',
        appointmentTime: '2024-01-15 10:00 AM',
        reason: 'General Checkup',
        appointmentId: 'apt-123'
      }
    });
    
    // Test appointment status notification to patient
    console.log('📢 Sending appointmentStatus to patient...');
    socket.emit('testNotificationToPatient', {
      patientId: testPatientId,
      event: 'appointmentStatus',
      data: {
        status: 'Confirmed',
        doctorName: 'Dr. Test',
        appointmentTime: '2024-01-15 10:00 AM',
        paymentRequired: true,
        amount: 500,
        message: 'Your appointment has been confirmed'
      }
    });
    
    // Test payment notification to both
    console.log('💰 Sending paymentReceived to both...');
    socket.emit('testPaymentNotification', {
      patientId: testPatientId,
      doctorId: testDoctorId,
      data: {
        amount: 500,
        patientName: 'Test Patient',
        doctorName: 'Dr. Test',
        appointmentId: 'apt-123',
        paymentId: 'pay-789'
      }
    });
    
  }, 2000);
});

socket.on('disconnect', () => {
  console.log('❌ Disconnected from server');
});

// Listen for any events
socket.onAny((eventName, ...args) => {
  console.log('📡 Received event:', eventName, args);
});

console.log('🚀 Starting notification test...');
console.log('📡 Attempting to connect to http://localhost:5000');
console.log('📝 Make sure your server is running first!');
console.log('⏰ This test will run for 10 seconds then exit.\n');

// Auto-exit after 10 seconds
setTimeout(() => {
  console.log('\n✅ Test completed. Check the logs above for any issues.');
  process.exit(0);
}, 10000);

import razorpay from '../config/razorpay.js';
import Doctor from '../models/Doctor.js';
import crypto from 'crypto';

// Create Razorpay order
export const createPaymentOrder = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const patientId = req.user._id;

    // Find the doctor and appointment
    const doctor = await Doctor.findOne({ 'appointments._id': appointmentId });
    if (!doctor) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const appointment = doctor.appointments.id(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if appointment belongs to the patient
    if (appointment.patientRef.toString() !== patientId.toString()) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    // Check if appointment is confirmed
    if (appointment.status !== 'Confirmed') {
      return res.status(400).json({ message: 'Appointment must be confirmed before payment' });
    }

    // Check if already paid
    if (appointment.paymentStatus === 'Paid') {
      return res.status(400).json({ message: 'Payment already completed' });
    }

    const amount = doctor.consultationFees * 100; // Convert to paisa
    appointment.amount = doctor.consultationFees;

    // Create Razorpay order
    const options = {
      amount: amount,
      currency: 'INR',
      receipt: `appointment_${appointmentId}`,
      notes: {
        appointmentId: appointmentId,
        doctorId: doctor._id.toString(),
        patientId: patientId.toString(),
        doctorName: doctor.name,
        patientName: appointment.patientName,
      },
    };

    let order;
    try {
      order = await razorpay.orders.create(options);
    } catch (rzpError) {
      console.warn("Razorpay order creation failed (likely due to invalid keys). switching to Mock Mode.");
      // Create a mock order for testing
      const isMock = process.env.RAZORPAY_KEY_ID?.includes('demo') || true;
      if (isMock) {
        order = {
          id: `order_mock_${Date.now()}`,
          amount: amount,
          currency: 'INR',
          status: 'created',
          receipt: `appointment_${appointmentId}`,
        };
      } else {
        throw rzpError;
      }
    }
    
    // Save order ID to appointment
    appointment.orderId = order.id;
    await doctor.save();

    res.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        doctorName: doctor.name,
        consultationFees: doctor.consultationFees,
        appointmentId: appointmentId,
      },
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Payment order creation error:', error);
    res.status(500).json({ message: 'Failed to create payment order' });
  }
};

// Verify payment
export const verifyPayment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const patientId = req.user._id;

    // Handle Mock Payment Verification
    if (razorpay_order_id && razorpay_order_id.startsWith('order_mock_')) {
      console.log('Verifying Mock Payment for order:', razorpay_order_id);
      
      const doctor = await Doctor.findOne({ 'appointments._id': appointmentId });
      if (!doctor) return res.status(404).json({ message: 'Appointment not found' });
      
      const appointment = doctor.appointments.id(appointmentId);
      if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
      
      appointment.paymentStatus = 'Paid';
      appointment.paymentId = razorpay_payment_id || `pay_mock_${Date.now()}`;
      await doctor.save();

      // Notify Doctor (Socket Logic)
      const io = req.app.get("io");
      const doctorSockets = req.app.get("doctorSockets");
      const doctorIdStr = doctor._id.toString();
      
      console.log('[MOCK PAY] Attempting to notify doctor:', doctorIdStr);
      if (doctorSockets && doctorSockets[doctorIdStr] && doctorSockets[doctorIdStr].length > 0) {
        console.log('[MOCK PAY] Found sockets for doctor, emitting event.');
        doctorSockets[doctorIdStr].forEach(socketId => {
          io.to(socketId).emit("paymentReceived", {
            appointmentId: appointmentId,
            patientName: appointment.patientName,
            amount: appointment.amount,
            paymentId: appointment.paymentId
          });
        });
      } else {
        console.log('[MOCK PAY] Doctor socket not found. Available keys:', Object.keys(doctorSockets || {}));
      }

      return res.json({
        success: true,
        message: 'Payment verified successfully (Mock)',
        paymentId: appointment.paymentId
      });
    }

    // Find the doctor and appointment
    const doctor = await Doctor.findOne({ 'appointments._id': appointmentId });
    if (!doctor) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const appointment = doctor.appointments.id(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if appointment belongs to the patient
    if (appointment.patientRef.toString() !== patientId.toString()) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      appointment.paymentStatus = 'Failed';
      await doctor.save();
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    // Payment successful
    appointment.paymentStatus = 'Paid';
    appointment.paymentId = razorpay_payment_id;
    await doctor.save();

    // Send notification to doctor about successful payment
    const io = req.app.get('io');
    const doctorSockets = req.app.get('doctorSockets');
    // Fix: access doctorSockets using doctor._id, not userRef, consistent with socket registration
    const doctorSocketIds = doctorSockets[doctor._id.toString()];
    console.log('[NOTIFY] Sending paymentReceived to doctor:', doctor._id.toString(), 'socketIds:', doctorSocketIds);
    
    if (doctorSocketIds && doctorSocketIds.length > 0) {
      doctorSocketIds.forEach(socketId => {
        io.to(socketId).emit('paymentReceived', {
          appointmentId: appointmentId,
          patientName: appointment.patientName,
          amount: appointment.amount,
          paymentId: razorpay_payment_id,
        });
      });
      console.log('[NOTIFY] Emitted paymentReceived to doctor', doctor.userRef?.toString());
    } else {
      console.log('[NOTIFY] No socketId found for doctor', doctor.userRef?.toString());
    }

    res.json({
      success: true,
      message: 'Payment successful',
      paymentId: razorpay_payment_id,
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ message: 'Payment verification failed' });
  }
};

// Get payment status
export const getPaymentStatus = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const patientId = req.user._id;

    const doctor = await Doctor.findOne({ 'appointments._id': appointmentId });
    if (!doctor) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const appointment = doctor.appointments.id(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if appointment belongs to the patient
    if (appointment.patientRef.toString() !== patientId.toString()) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    res.json({
      paymentStatus: appointment.paymentStatus,
      amount: appointment.amount || doctor.consultationFees,
      paymentId: appointment.paymentId,
      orderId: appointment.orderId,
    });
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({ message: 'Failed to get payment status' });
  }
};

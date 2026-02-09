import React, { useState } from 'react';
import axios from 'axios';
import { showSuccessToast } from '../utils/toastUtils';

const PaymentComponent = ({ appointmentId, doctorName, amount, onSuccess, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError('');

      // Create payment order
      const token = localStorage.getItem('token');
      const orderResponse = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/payment/create-order/${appointmentId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const { order, razorpayKeyId } = orderResponse.data;

      // Handle Mock Order (Test Mode)
      if (order.id.startsWith('order_mock_')) {
        console.log("Mock Payment Mode Detected");
        // Simulate a delay and then "success"
        setTimeout(async () => {
             const mockResponse = {
                razorpay_order_id: order.id,
                razorpay_payment_id: `pay_mock_${Date.now()}`,
                razorpay_signature: 'mock_signature'
             };
             
             try {
                const verifyResponse = await axios.post(
                  `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/payment/verify/${appointmentId}`,
                  mockResponse,
                  { headers: { Authorization: `Bearer ${token}` } }
                );

                if (verifyResponse.data.success) {
                   showSuccessToast("Payment Successful", `Payment of ₹${amount} completed successfully (Test Mode)`);
                   onSuccess(mockResponse.razorpay_payment_id);
                } else {
                   setError('Payment verification failed');
                }
             } catch (err) {
                setError('Payment verification failed');
             }
             setLoading(false);
        }, 1500); // 1.5s delay to simulate user action
        return; 
      }

      // Configure Razorpay options
      const options = {
        key: razorpayKeyId,
        amount: order.amount,
        currency: order.currency,
        name: 'HealthCare Platform',
        description: `Consultation fee for Dr. ${doctorName}`,
        order_id: order.id,
        handler: async function (response) {
          try {
            // Verify payment
            const verifyResponse = await axios.post(
              `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/payment/verify/${appointmentId}`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            if (verifyResponse.data.success) {
              console.log('Payment verification successful:', verifyResponse.data);
              
              // Show success toast
              showSuccessToast("Payment Successful", `Payment of ₹${amount} completed successfully`);
              
              onSuccess(response.razorpay_payment_id);
            } else {
              console.error('Payment verification failed:', verifyResponse.data);
              setError('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            setError('Payment verification failed');
          }
        },
        prefill: {
          name: localStorage.getItem('userName') || '',
          email: localStorage.getItem('userEmail') || '',
        },
        theme: {
          color: '#8B5CF6',
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      // Open Razorpay checkout
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Payment initiation error:', error);
      setError(error.response?.data?.message || 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md">
      <div className="relative bg-gradient-to-br from-violet-900/90 via-slate-900/95 to-violet-900/90 border border-white/10 rounded-3xl shadow-2xl w-full max-w-md p-8 mx-4 overflow-hidden">
        {/* Decorative Background */}
         <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

        <div className="text-center mb-8 relative z-10">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/20">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white">Payment Required</h2>
          <p className="text-gray-400 mt-2 text-sm">
            Please complete the payment to confirm your appointment
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 relative z-10">
          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-400 text-sm">Doctor</span>
            <span className="font-semibold text-white">Dr. {doctorName}</span>
          </div>
          <div className="w-full h-px bg-white/10 my-3"></div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Consultation Fee</span>
            <span className="font-bold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">₹{amount}</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 relative z-10">
            <div className="flex items-center gap-2">
               <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
               <p className="text-red-300 text-sm font-medium">{error}</p>
            </div>
          </div>
        )}

        <div className="flex gap-4 relative z-10">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 px-4 bg-white/5 hover:bg-white/10 text-gray-300 font-semibold rounded-xl transition-all duration-200 border border-white/5 active:scale-[0.98]"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handlePayment}
            disabled={loading}
            className="flex-1 py-3.5 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold shadow-lg shadow-purple-500/25 hover:from-purple-500 hover:to-pink-500 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Processing...</span>
              </div>
            ) : (
              `Pay ₹${amount}`
            )}
          </button>
        </div>

        <div className="mt-6 text-center text-[10px] text-gray-500 font-medium tracking-wide relative z-10">
          SECURE PAYMENT POWERED BY RAZORPAY
        </div>
      </div>
    </div>
  );
};

export default PaymentComponent;

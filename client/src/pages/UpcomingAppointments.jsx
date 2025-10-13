import { useEffect, useState } from 'react';
import axios from 'axios';
import PaymentComponent from '../components/PaymentComponent';

const UpcomingAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [scrollY, setScrollY] = useState(0); // Track scroll position
  const [error, setError] = useState(null); // Handle errors
  const [loading, setLoading] = useState(true); // Handle loading state
  const [showPayment, setShowPayment] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [updateKey, setUpdateKey] = useState(0); // Force re-render key
  const [currentTime, setCurrentTime] = useState(new Date()); // Track current time for real-time updates
  const token = localStorage.getItem('token');

  // Fetch the appointments
  const fetchAppointments = async () => {
    setLoading(true); // Show loading state
    try {
      const res = await axios.get('http://localhost:5000/api/appointments/getmyappointments', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      setAppointments(res.data);
    } catch (err) {
      // Check for different types of errors
      if (err.response) {
        setError(`Error: ${err.response.data.message || 'An unexpected error occurred.'}`);
      } else if (err.request) {
        setError('No response received. Please check your network connection.');
      } else {
        setError('An error occurred while setting up the request.');
      }
      console.error('Error fetching upcoming appointments:', err);
    } finally {
      setLoading(false); // Hide loading state once data is fetched
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return `${date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })} at ${date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })}`;
  };

  // Handle infinite scrolling
  const loadMoreAppointments = () => {
    if (window.innerHeight + document.documentElement.scrollTop === document.documentElement.offsetHeight) {
      // Implement infinite scroll logic if needed, for now, just fetch more appointments
      fetchAppointments();
    }
  };

  // Handle payment button click
  const handlePaymentClick = (appointment) => {
    console.log('Opening payment for appointment:', appointment);
    setSelectedAppointment(appointment);
    setShowPayment(true);
  };

  // Handle successful payment
  const handlePaymentSuccess = (paymentId) => {
    console.log('Payment successful, updating appointment:', selectedAppointment?.appointmentId);
    
    // Update the appointment payment status in local state immediately
    setAppointments(prev => 
      prev.map(appt => 
        appt.appointmentId === selectedAppointment?.appointmentId 
          ? { ...appt, paymentStatus: 'Paid', paymentId } 
          : appt
      )
    );
    
    setShowPayment(false);
    setSelectedAppointment(null);
    
    // Force component re-render
    setUpdateKey(prev => prev + 1);
    
    // Refresh appointments from server to ensure sync
    setTimeout(() => {
      fetchAppointments();
    }, 1000);
  };

  // Handle payment close
  const handlePaymentClose = () => {
    setShowPayment(false);
    setSelectedAppointment(null);
  };

  useEffect(() => {
    fetchAppointments();

    // Add event listener to track scrolling
    const handleScroll = () => {
      setScrollY(window.scrollY);
      loadMoreAppointments(); // Trigger loading more appointments when scrolled to the bottom
    };

    window.addEventListener('scroll', handleScroll);

    // Update current time every minute for real-time video call button updates
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(timeInterval);
    };
  }, [token]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-950 via-black to-violet-950 items-center px-6 pt-16 pb-8 relative transition-all duration-300">
      {/* Custom Styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-in-out;
        }
      `}</style>
      
      {/* Heading */}
      <div className="text-center mb-10 relative z-10">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mb-4 shadow-2xl">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-lg tracking-wide max-w-4xl w-full">
          Your Upcoming Appointments
        </h1>
        <p className="text-blue-200 text-lg mt-2">Manage and track all your scheduled consultations</p>
      </div>

      {/* Error Handling */}
      {error && (
        <div className="relative z-10 mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl backdrop-blur-sm max-w-2xl mx-auto">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-200 text-sm font-semibold">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="relative z-10 text-center">
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-xl rounded-2xl px-6 py-4 border border-white/20">
            <svg className="animate-spin h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-white font-semibold">Loading your appointments...</span>
          </div>
        </div>
      )}

      {/* Cards Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6">
        {appointments.length === 0 && !loading ? (
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-16 text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-white/10 rounded-full mb-6">
              <svg className="w-12 h-12 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-2xl font-semibold text-white mb-2">No Upcoming Appointments</p>
            <p className="text-blue-200">Book an appointment to see it here</p>
          </div>
        ) : (
          <ul key={updateKey} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
            {appointments.map((appt) => (
              <li
                key={appt._id}
                className="relative bg-white/10 backdrop-blur-xl border-l-4 border-blue-400 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 text-white overflow-hidden"
                style={{ minWidth: '320px' }}
              >
                {/* Background Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 pointer-events-none"></div>

                {/* Status Ribbon */}
                <span
                  className={`absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs font-bold select-none shadow-lg z-10
                    ${appt.status === 'Confirmed' ? 'bg-green-500 text-white' : ''} 
                    ${appt.status === 'Pending' ? 'bg-yellow-400 text-gray-900' : ''} 
                    ${appt.status === 'Cancelled' ? 'bg-red-500 text-white' : ''} 
                    ${appt.status === 'Completed' ? 'bg-blue-500 text-white' : ''}
                    ${appt.status === 'Rejected' ? 'bg-red-600 text-white' : ''}
                    ${appt.status === 'No-show' ? 'bg-gray-500 text-white' : ''}`}
                >
                  {appt.status === 'Confirmed' && '✔️ Confirmed'}
                  {appt.status === 'Pending' && '⏳ Pending'}
                  {appt.status === 'Cancelled' && '❌ Cancelled'}
                  {appt.status === 'Completed' && '✅ Completed'}
                  {appt.status === 'Rejected' && '🚫 Rejected'}
                  {appt.status === 'No-show' && '🚫 No-show'}
                </span>

                {/* Doctor Info */}
                <div className="mb-6 relative z-10">
                  <h2 className="text-2xl font-black bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent tracking-wide mb-2 pr-24">
                    Dr. {appt.doctorName}
                  </h2>
                  {appt.doctorSpecialty && (
                    <p className="text-blue-200 font-semibold text-base flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {appt.doctorSpecialty}
                    </p>
                  )}
                </div>

                {/* Appointment Details */}
                <div className="space-y-3 relative z-10">
                  <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3 border border-white/10">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="text-white font-semibold">{formatDate(appt.date)}</span>
                  </div>

                  <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3 border border-white/10">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-white font-semibold">
                      {new Date(appt.date).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </span>
                  </div>

                  {/* Rejection / Cancel Reason */}
                  {(appt.status === 'Cancelled' || appt.status === 'Rejected') && appt.reason && (
                    <div
                      className="relative bg-red-500/20 backdrop-blur-sm text-red-200 p-4 rounded-xl border-2 border-red-500/50 shadow-lg font-semibold"
                      title="Reason for cancellation or rejection"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <svg
                          className="w-6 h-6 text-red-400 flex-shrink-0"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-base font-bold">Reason:</span>
                      </div>
                      <p className="text-red-100 text-sm leading-relaxed">{appt.rejectionReason}</p>
                    </div>
                  )}
                </div>

                {/* Payment Section */}
                {appt.status === 'Confirmed' && (
                  <div className="mt-6 p-5 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 backdrop-blur-sm rounded-2xl border-2 border-blue-400/30 shadow-lg relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-bold text-blue-200 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Consultation Fee
                      </span>
                      <span className="text-xl font-black text-cyan-300">₹{appt.amount}</span>
                    </div>
                    
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-purple-200">Payment Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold transition-all duration-500 ${
                        appt.paymentStatus === 'Paid' 
                          ? 'bg-green-500 text-white animate-pulse' 
                          : 'bg-yellow-400 text-gray-900'
                      }`}>
                        {appt.paymentStatus === 'Paid' ? '✅ Paid' : '⏳ Pending'}
                      </span>
                    </div>

                    {appt.paymentStatus !== 'Paid' && (
                      <button
                        onClick={() => handlePaymentClick(appt)}
                        className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        Pay Now
                      </button>
                    )}

                    {appt.paymentStatus === 'Paid' && appt.paymentId && (
                      <div className="mt-2 text-xs text-green-300 text-center animate-fadeIn">
                        🎉 Payment Successful! <br />
                        Payment ID: {appt.paymentId}
                      </div>
                    )}

                    {/* Video Call Button - Only show if payment is completed and appointment time is within range */}
                    {appt.paymentStatus === 'Paid' && (() => {
                      const appointmentTime = new Date(appt.date);
                      const timeDiffMinutes = (appointmentTime.getTime() - currentTime.getTime()) / (1000 * 60);
                      
                      // Show button 15 minutes before appointment until 2 hours after
                      const isTimeForCall = timeDiffMinutes <= 15 && timeDiffMinutes >= -120;
                      
                      if (!isTimeForCall) {
                        return (
                          <div className="w-full mt-3 py-2 px-4 bg-gray-400 text-white font-semibold rounded-lg text-center opacity-75">
                            {timeDiffMinutes > 15 
                              ? `📅 Call available ${Math.ceil(timeDiffMinutes - 15)} min before appointment`
                              : '⏰ Call window has ended'
                            }
                          </div>
                        );
                      }
                      
                      return (
                        <button
                          onClick={() => window.open(`/video-call/${appt.appointmentId}`, '_blank')}
                          className="w-full mt-3 py-2 px-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 animate-pulse"
                        >
                          📹 Join Video Call
                          {timeDiffMinutes <= 0 && timeDiffMinutes >= -5 && (
                            <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-bounce">
                              LIVE NOW
                            </span>
                          )}
                        </button>
                      );
                    })()}
                  </div>
                )}

                {/* Booked At Label */}
                <div className="text-xs text-blue-200 mt-6 text-center bg-white/5 rounded-lg py-2 relative z-10">
                  <span className="font-semibold">Booked: </span>
                  {appt.createdAt ? (
                    formatDate(appt.createdAt)
                  ) : (
                    <span>Time not available</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Payment Modal */}
      {showPayment && selectedAppointment && (
        <PaymentComponent
          appointmentId={selectedAppointment.appointmentId}
          doctorName={selectedAppointment.doctorName}
          amount={selectedAppointment.amount}
          onSuccess={handlePaymentSuccess}
          onClose={handlePaymentClose}
        />
      )}
    </div>
  );
};

export default UpcomingAppointments;

import { useEffect, useState } from 'react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';
import PaymentComponent from '../components/PaymentComponent';

const UpcomingAppointments = () => {
  const navigate = useNavigate();
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
      const res = await api.get(`/api/appointments/getmyappointments`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      // Show everything that is not Cancelled/Completed initially.
      // Time-based filtering will happen in Render to ensure it updates dynamically
      const activeAppointments = res.data.filter(appt => appt.status !== 'Cancelled' && appt.status !== 'Completed');

      setAppointments(activeAppointments);
    } catch (err) {
      // Check for different types of errors
      if (err.response) {
        if (err.response.status === 401 || err.response.status === 403) {
          // Token invalid or expired
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }
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
    
    // Re-fetch to ensure consistency
    fetchAppointments();
    
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

    // Update current time every second for real-time video call button updates
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Update every second

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(timeInterval);
    };
  }, [token]);

  const filteredAppointments = appointments.filter(appt => {
    // Dynamic logic to hide expired appointments relative to currentTime
    const startTime = new Date(appt.date || appt.appointmentTime);
    const endTime = appt.endTime ? new Date(appt.endTime) : new Date(startTime.getTime() + 60 * 60 * 1000); 
    return currentTime < endTime;
  });

  return (
    <div className="w-full flex flex-col items-center px-6 pt-4 pb-8 relative transition-all duration-300">
      {/* Custom Styles */}
      <style>{`
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
          <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-xl rounded-2xl px-6 py-4 border border-white/10">
            <svg className="animate-spin h-6 w-6 text-pink-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-white font-semibold">Loading your appointments...</span>
          </div>
        </div>
      )}

      {/* Cards Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6">
        {filteredAppointments.length === 0 && !loading ? (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-16 text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-white/5 rounded-full mb-6 relative group">
              <div className="absolute inset-0 bg-pink-500/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <svg className="w-12 h-12 text-pink-500 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-white mb-2">No Upcoming Appointments</p>
            <p className="text-gray-400">Book an appointment to see it here</p>
          </div>
        ) : (
          <ul key={updateKey} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
            {filteredAppointments.map((appt) => (
              <li
                key={appt._id}
                className="group relative rounded-2xl p-[1px] bg-gradient-to-br from-white/10 via-white/5 to-transparent transition-all duration-500 hover:scale-[1.02] overflow-hidden"
                style={{ minWidth: '320px' }}
              >
                <div className="hover:shadow-[0_0_60px_18px_rgba(190,24,93,0.22)] relative bg-gradient-to-br from-purple-900/20 via-black/50 to-violet-900/20 backdrop-blur-xl rounded-2xl p-6 h-full w-full overflow-hidden">
                
                {/* Status Ribbon */}
                <span
                  className={`absolute top-4 right-4 px-3 py-1 text-xs font-bold select-none rounded z-10 border backdrop-blur-md
                    ${appt.status === 'Confirmed' ? 'bg-green-500/10 text-green-400 border-green-500/20' : ''} 
                    ${appt.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : ''} 
                    ${appt.status === 'Cancelled' ? 'bg-red-500/10 text-red-400 border-red-500/20 delay-0' : ''} 
                    ${appt.status === 'Completed' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : ''}
                    ${appt.status === 'Rejected' ? 'bg-red-600/10 text-red-400 border-red-600/20' : ''}
                    ${appt.status === 'No-show' ? 'bg-gray-500/10 text-gray-400 border-gray-500/20' : ''}`}
                >
                  {appt.status === 'Confirmed' && '● Confirmed'}
                  {appt.status === 'Pending' && '● Pending'}
                  {appt.status === 'Cancelled' && '● Cancelled'}
                  {appt.status === 'Completed' && '● Completed'}
                  {appt.status === 'Rejected' && '● Rejected'}
                  {appt.status === 'No-show' && '● No-show'}
                </span>

                {/* Doctor Info */}
                <div className="mb-6 relative z-10">
                  <h2 className="text-xl font-bold text-white mb-2 pr-24  transition-colors">
                    Dr. {appt.doctorName}
                  </h2>
                  {appt.doctorSpecialty && (
                    <p className="text-pink-400/80 font-medium text-sm flex items-center gap-2">
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {appt.doctorSpecialty}
                    </p>
                  )}
                </div>

                {/* Appointment Details */}
                <div className="space-y-3 relative z-10">
                  <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3 border border-white/5 transition-colors">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                       <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="text-gray-300 text-sm">{formatDate(appt.date)}</span>
                  </div>

                  <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3 border border-white/5 transition-colors">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center">
                       <svg className="w-4 h-4 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-gray-300 text-sm">
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
                      className="relative bg-red-500/10 backdrop-blur-sm p-4 rounded-xl border border-red-500/20 mt-4"
                    >
                      <div className="flex items-center gap-2 mb-1">
                         <svg
                          className="w-4 h-4 text-red-500"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm font-semibold text-red-400">Reason:</span>
                      </div>
                      <p className="text-gray-400 text-xs leading-relaxed">{appt.rejectionReason}</p>
                    </div>
                  )}
                </div>

                {/* Payment Section */}
                {appt.status === 'Confirmed' && (
                  <div className="mt-6 pt-4 border-t border-white/10 relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-medium text-gray-400 flex items-center gap-2">
                        Consultation Fee
                      </span>
                      <span className="text-lg font-bold text-white">₹{appt.amount}</span>
                    </div>
                    
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-gray-400">Status</span>
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        appt.paymentStatus === 'Paid' 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/20' 
                          : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/20'
                      }`}>
                        {appt.paymentStatus === 'Paid' ? 'Paid' : 'Pending'}
                      </span>
                    </div>

                    {appt.paymentStatus !== 'Paid' && (
                      <button
                        onClick={() => handlePaymentClick(appt)}
                        className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-medium rounded-xl shadow-lg shadow-green-500/20 transition-all flex items-center justify-center gap-2 text-sm"
                      >
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        Pay Now
                      </button>
                    )}

                    {appt.paymentStatus === 'Paid' && appt.paymentId && (
                      <div className="mt-2 text-[10px] text-green-400/70 text-center font-mono">
                        ID: {appt.paymentId}
                      </div>
                    )}

                    {/* Video Call Button */}
                    {appt.paymentStatus === 'Paid' && (() => {
                      const startTime = new Date(appt.date);
                      const endTime = appt.endTime ? new Date(appt.endTime) : new Date(startTime.getTime() + 60 * 60 * 1000);
                      
                      const now = currentTime.getTime();
                      const windowStart = startTime.getTime() - 5 * 60 * 1000; // 5 mins before
                      const windowEnd = endTime.getTime();
                      
                      const isTimeForCall = now >= windowStart && now <= windowEnd;
                      const startsInMins = (startTime.getTime() - now) / 60000;

                      if (!isTimeForCall) {
                        return (
                          <div className="w-full mt-3 py-2 px-4 bg-white/5 border border-white/5 text-gray-500 text-xs font-medium rounded-lg text-center">
                            {now < windowStart 
                              ? `Consultation in ${Math.ceil(startsInMins)} mins`
                              : 'Consultation Ended'
                            }
                          </div>
                        );
                      }
                      
                      return (
                        <button
                          onClick={() => window.open(`/video-call/${appt.appointmentId}`, '_blank')}
                          className="w-full mt-3 py-2 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium rounded-xl shadow-lg shadow-purple-500/20 transition-all flex items-center justify-center gap-2 text-sm animate-pulse"
                        >
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Join Video Call
                          {startsInMins <= 0 && startsInMins >= -5 && (
                            <span className="ml-2 bg-red-500/80 text-white text-[10px] px-1.5 py-0.5 rounded uppercase font-bold">
                              LIVE
                            </span>
                          )}
                        </button>
                      );
                    })()}
                  </div>
                )}

                {/* Booked At Label */}
                <div className="text-[10px] text-gray-500 mt-4 text-center">
                  Booked on {appt.createdAt ? formatDate(appt.createdAt) : 'N/A'}
                </div>
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

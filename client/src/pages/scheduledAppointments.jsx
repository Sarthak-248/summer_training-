import React, { useEffect, useState } from "react";
import api from "../utils/api";
import moment from "moment";
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';
import {
  FaUserAlt,
  FaPhoneAlt,
  FaClock,
  FaInfoCircle,
  FaCalendarCheck,
  FaVideo,
  FaTimes,
  FaCheck,
  FaMoneyBillWave,
  FaReceipt,
  FaHistory
} from "react-icons/fa";
import { Link } from "react-router-dom";

const ScheduledAppointment = () => {
  const [appointments, setAppointments] = useState([]);
  const [loadingIds, setLoadingIds] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // State for cancellation modal
  const [cancelModal, setCancelModal] = useState({ open: false, id: null });
  const [cancelReason, setCancelReason] = useState("");

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await api.get(
        `/api/doctors/appointments`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAppointments(res.data.appointments);
    } catch (error) {
      console.error("Failed to fetch appointments", error);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchAppointments();
    } catch (error) {
      console.error("Error during refresh", error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
    const interval = setInterval(fetchAppointments, 30000);
    // Update time every second for real-time button appearance
    const timeInterval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => {
      clearInterval(interval);
      clearInterval(timeInterval);
    };
  }, []);

  const setLoading = (id, val) => {
    setLoadingIds((prev) =>
      val ? [...prev, id] : prev.filter((loadingId) => loadingId !== id)
    );
  };

  const handleAccept = async (id) => {
    setLoading(id, true);
    try {
      const token = localStorage.getItem("token");
      await api.patch(
        `/api/doctors/appointments/${id}/status`,
        { status: "Confirmed" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAppointments((prev) =>
        prev.map((appt) =>
          appt._id === id ? { ...appt, status: "Confirmed" } : appt
        )
      );
      showSuccessToast("Success", "Appointment accepted successfully!");
    } catch {
      showErrorToast("Failed to accept appointment");
    }
    setLoading(id, false);
  };

  const handleCancelClick = (id) => {
      setCancelModal({ open: true, id });
      setCancelReason("");
  };

  const submitCancel = async () => {
      if (!cancelReason.trim()) {
          alert("Please enter a reason.");
          return;
      }
      
      const id = cancelModal.id;
      setLoading(id, true);
      try {
        const token = localStorage.getItem("token");
        await api.patch(
          `/api/doctors/appointments/${id}/status`,
          { status: "Cancelled", reason: cancelReason },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAppointments((prev) =>
          prev.map((appt) =>
            appt._id === id ? { ...appt, status: "Cancelled" } : appt
          )
        );
        setCancelModal({ open: false, id: null });
      } catch (error) {
        console.error(error);
        alert("Failed to cancel appointment");
      }
      setLoading(id, false);
  };

  const filteredAppointments = appointments.filter(appt => {
    // Filter out expired appointments
    const start = new Date(appt.appointmentTime || appt.date); // Handle different field names if necessary
    const end = appt.appointmentEndTime ? new Date(appt.appointmentEndTime) : new Date(start.getTime() + 60 * 60 * 1000);
    
    if (new Date() > end) return false;

    if (paymentFilter === 'all') return true;
    if (paymentFilter === 'paid') return appt.paymentStatus === 'Paid';
    if (paymentFilter === 'pending') return appt.status === 'Confirmed' && appt.paymentStatus !== 'Paid';
    return true;
  });

  return (
    <div className="w-full flex flex-col items-center px-6 pt-6 pb-12 transition-all duration-300">
      {/* Custom Styles */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.5s ease-in-out; }
      `}</style>
      
      {/* Stats Dashboard */}
      <div className="max-w-7xl w-full mx-auto mb-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           <StatCard 
              label="Total Appointments" 
              value={appointments.length} 
              icon={<FaCalendarCheck />} 
              color="from-blue-600/20 to-indigo-600/20"
              borderColor="border-blue-500/30"
              textColor="text-white"
            />
           <StatCard 
              label="Confirmed" 
              value={appointments.filter(a => a.status === 'Confirmed').length} 
              icon={<FaCheck />} 
              color="from-green-600/20 to-emerald-600/20"
              borderColor="border-green-500/30"
              textColor="text-white"
            />
           <StatCard 
              label="Paid Fees" 
              value={appointments.filter(a => a.paymentStatus === 'Paid').length} 
              icon={<FaMoneyBillWave />} 
              color="from-cyan-600/20 to-teal-600/20"
              borderColor="border-cyan-500/30"
              textColor="text-white"
            />
           <StatCard 
              label="Total Earnings" 
              value={`₹${appointments.filter(a => a.paymentStatus === 'Paid').reduce((sum, a) => sum + (a.amount || 0), 0)}`} 
              icon={<FaMoneyBillWave />} 
              color="from-amber-600/20 to-orange-600/20"
              borderColor="border-amber-500/30"
              textColor="text-white"
            />
        </div>
      </div>

       {/* Filters & Actions */}
       <div className="max-w-7xl w-full mx-auto mb-10 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/5 p-4 rounded-3xl border border-white/10 backdrop-blur-xl">
          <div className="flex bg-black/40 p-1.5 rounded-2xl">
              <FilterButton active={paymentFilter === 'all'} onClick={() => setPaymentFilter('all')}>All</FilterButton>
              <FilterButton active={paymentFilter === 'paid'} onClick={() => setPaymentFilter('paid')}>Paid Only</FilterButton>
              <FilterButton active={paymentFilter === 'pending'} onClick={() => setPaymentFilter('pending')}>Pending Payment</FilterButton>
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 text-blue-300 hover:text-white transition-colors px-6 py-2.5 rounded-xl hover:bg-white/5 active:scale-95 duration-200"
          >
            <span className={`text-xl ${refreshing ? "animate-spin" : ""}`}>↻</span>
            {refreshing ? "Refreshing..." : "Refresh Data"}
          </button>
       </div>

      {/* Appointment Grid */}
      <div className="relative z-10 w-full max-w-7xl mx-auto">
        {filteredAppointments.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-16 text-center">
             <div className="mx-auto w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
               <FaCalendarCheck className="text-4xl text-white" />
             </div>
             <h3 className="text-2xl font-semibold text-white mb-2">No Appointments Found</h3>
             <p className="text-white">Try adjusting your filters or check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAppointments.map((appt) => (
               <AppointmentCard 
                  key={appt._id}
                  appt={appt}
                  currentTime={currentTime}
                  loading={loadingIds.includes(appt._id)}
                  onAccept={() => handleAccept(appt._id)}
                  onCancel={() => handleCancelClick(appt._id)}
               />
            ))}
          </div>
        )}
      </div>

      {/* Cancel Modal */}
      {cancelModal.open && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fadeIn">
            <div className="bg-slate-900 w-full max-w-md rounded-3xl border border-white/20 p-8 shadow-2xl overflow-hidden relative">
               <div className="absolute inset-0 bg-red-500/5 pointer-events-none" />
               <h3 className="text-2xl font-bold text-white mb-4 relative z-10">Cancel Appointment</h3>
               <p className="text-white text-sm mb-6 relative z-10">Please provide a reason for cancelling this appointment. This will be sent to the patient.</p>
               
               <textarea
                  className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none transition-all relative z-10 placeholder:text-slate-400"
                  rows="4"
                  placeholder="Reason for cancellation..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  autoFocus
               ></textarea>
               
               <div className="flex justify-end gap-3 mt-8 relative z-10">
                  <button 
                    onClick={() => setCancelModal({open: false, id: null})}
                    className="px-6 py-2.5 text-white hover:text-white transition-colors font-medium"
                  >
                    Back
                  </button>
                  <button 
                    onClick={submitCancel}
                    className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-red-500/20 transition-all active:transform active:scale-95"
                  >
                    Confirm Cancellation
                  </button>
               </div>
            </div>
         </div>
      )}

     

    </div>
  );
};

// --- Sub Components ---

const StatCard = ({ label, value, icon, color, borderColor, textColor }) => (
    <div className={`bg-linear-to-br ${color} backdrop-blur-lg border ${borderColor} p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1`}>
        <div className="flex justify-between items-start">
            <div>
                <p className="text-white text-sm font-semibold uppercase tracking-wider">{label}</p>
                <h3 className={`text-4xl font-black ${textColor} mt-2`}>{value}</h3>
            </div>
            <div className={`text-3xl ${textColor} opacity-80 bg-white/10 p-3 rounded-2xl`}>{icon}</div>
        </div>
    </div>
);

const FilterButton = ({ active, children, onClick }) => (
    <button
        onClick={onClick}
        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
            active 
            ? "bg-white text-slate-900 shadow-lg scale-105" 
            : "text-white hover:text-white hover:bg-white/5"
        }`}
    >
        {children}
    </button>
);

const AppointmentCard = ({ appt, currentTime, loading, onAccept, onCancel }) => {
    // Determine status badge style
    const statusConfig = {
        'Pending': { color: 'bg-yellow-400 text-gray-900', label: '⏳ Pending' },
        'Confirmed': { color: 'bg-emerald-500 text-white', label: '✔️ Confirmed' },
        'Cancelled': { color: 'bg-red-500 text-white', label: '❌ Cancelled' },
        'Completed': { color: 'bg-blue-500 text-white', label: '✅ Completed' },
    };
    
    const config = statusConfig[appt.status] || { color: 'bg-gray-500 text-white', label: appt.status };

    const isPaid = appt.paymentStatus === 'Paid';
    const patientId = appt.patientRef?._id || appt.patientRef;
    
    // Video Call Logic
    const startTime = new Date(appt.appointmentTime || appt.date);
    const endTime = appt.appointmentEndTime ? new Date(appt.appointmentEndTime) : new Date(startTime.getTime() + 60 * 60 * 1000);
    
    // Check if current time is within slot window (Starts exactly at slot time)
    const now = currentTime.getTime();
    const windowStart = startTime.getTime();
    const windowEnd = endTime.getTime();
    
    const isSlotActive = now >= windowStart && now <= windowEnd;
    const isReadyForCall = appt.status === 'Confirmed' && isPaid && isSlotActive;
    
    // Check if slot has started (for LIVE label)
    const hasStarted = now >= startTime.getTime();

    return (
        <div className="relative bg-white/5 backdrop-blur-xl border-t border-white/10 rounded-3xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-2 group overflow-hidden">
             {/* Decorative Gradient Blob */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-500/30 transition-all duration-500"></div>
            
            {/* Status Ribbon */}
            <span
              className={`absolute top-0 right-0 px-4 py-1.5 rounded-bl-2xl text-xs font-bold shadow-lg z-10 ${config.color}`}
            >
              {config.label}
            </span>

            {/* Header / User Info */}
            <div className="relative z-10 mb-6 mt-2">
                <div className="flex items-center gap-4 mb-3">
                   <div className="w-12 h-12 rounded-full bg-linear-to-tr from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold text-xl shadow-lg ring-2 ring-white/10">
                        {appt.patientName ? appt.patientName.charAt(0).toUpperCase() : <FaUserAlt />}
                   </div>
                   <div>
                       <h2 className="text-xl font-black text-white tracking-wide leading-tight">
                           {appt.patientName || "Unknown Patient"}
                       </h2>
                        <p className="text-white text-sm font-medium flex items-center gap-1.5 mt-0.5">
                          <FaPhoneAlt className="text-[10px]" /> {appt.patientContact}
                       </p>
                   </div>
                </div>
            </div>

            {/* Appointment Details */}
            <div className="space-y-3 relative z-10 mb-6">
                <div className="flex gap-3">
                    <div className="flex-1 bg-black/20 rounded-2xl p-3 border border-white/5 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-white">
                             <FaClock />
                        </div>
                        <div>
                             <p className="text-[10px] uppercase text-white font-bold tracking-wider">Date</p>
                             <p className="text-white text-sm font-semibold">{moment(appt.appointmentTime).format("MMM Do")}</p>
                        </div>
                    </div>
                    <div className="flex-1 bg-black/20 rounded-2xl p-3 border border-white/5 flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-white">
                             <FaClock />
                        </div>
                        <div>
                             <p className="text-[10px] uppercase text-white font-bold tracking-wider">Time</p>
                             <p className="text-white text-sm font-semibold">{moment(appt.appointmentTime).format("h:mm A")}</p>
                        </div>
                    </div>
                </div>

                {appt.reason && (
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                        <p className="text-[10px] uppercase text-white font-bold tracking-wider mb-1 flex items-center gap-2">
                           <FaInfoCircle /> Reason
                        </p>
                        <p className="text-white text-sm italic leading-relaxed line-clamp-2">
                            "{appt.reason}"
                        </p>
                    </div>
                )}
                
                {/* Payment Status Bar */}
                {appt.status === 'Confirmed' && (
                  <div className={`rounded-xl p-3 flex items-center justify-between border ${isPaid ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-amber-500/10 border-amber-500/20'}`}>
                      <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-lg ${isPaid ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                              <FaMoneyBillWave />
                          </div>
                          <span className="text-sm font-bold text-white">
                             ₹{appt.amount || appt.consultationFees || 500}
                          </span>
                      </div>
                      <div className="text-right">
                          <span className={`text-xs font-bold uppercase tracking-wider block ${isPaid ? 'text-emerald-400' : 'text-amber-400'}`}>
                              {isPaid ? "Paid" : "Unpaid"}
                          </span>
                      </div>
                  </div>
                )}
            </div>

            {/* Footer Actions */}
            <div className="pt-4 border-t border-white/10 relative z-10">
                {appt.status === 'Pending' ? (
                    <div className="grid grid-cols-2 gap-3">
                         <button 
                             onClick={onAccept}
                             disabled={loading}
                             className="flex items-center justify-center gap-2 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                         >
                            {loading ? "..." : <><FaCheck /> Accept</>}
                         </button>
                         <button 
                             onClick={onCancel}
                             disabled={loading}
                             className="flex items-center justify-center gap-2 bg-white/5 hover:bg-red-500/20 text-white hover:text-red-300 border border-white/10 hover:border-red-500/20 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                         >
                            <FaTimes /> Decline
                         </button>
                    </div>
                ) : (
                    <div className="flex gap-3">
                         <Link to={`/doctor/patienthistory/${patientId}`} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white/5 hover:bg-white/10 text-white hover:text-white rounded-xl text-sm font-bold transition-colors border border-white/5">
                            <FaHistory className="text-xs" /> History
                         </Link>
                         
                         {isReadyForCall && (
                            <button 
                              onClick={() => window.open(`/video-call/${appt._id}`, '_blank')}
                              className="flex-1 py-2.5 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/30 animate-pulse flex items-center justify-center gap-2 transition-all"
                            >
                               <FaVideo /> Join Call
                               {hasStarted && (
                                <span className="ml-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded uppercase font-bold animate-pulse">
                                  LIVE
                                </span>
                               )}
                            </button>
                         )}
                    </div>
                 )}
            </div>
        </div>
    );
};

export default ScheduledAppointment;

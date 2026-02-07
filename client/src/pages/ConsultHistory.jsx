import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUserMd, FaCalendarAlt, FaClock, FaNotesMedical, FaFilePrescription, FaUser } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const ConsultHistory = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('patient');
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      // Determine role based on token or local storage if possible, but easier to try fetching
      // We'll try fetching patient history first, if it fails with 403/401, we might be a doctor? 
      // Actually usually the role is stored in localStorage or decoded token.
      // Let's assume we use the same endpoint but filtered, or fetch standard endpoints.
      
      const role = localStorage.getItem('role') || 'patient'; // You should ensure role is saved on login
      setUserRole(role);

      let url = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/appointments/getmyappointments`;
      if (role === 'doctor') {
         url = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/doctors/scheduled-appointments`;
      } 

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Filter for past appointments
      const allAppts = role === 'doctor' ? res.data.appointments : res.data;
      const history = allAppts.filter(appt => {
         const apptDate = new Date(appt.appointmentTime);
         // Assume 1 hour duration
         const endTime = new Date(apptDate.getTime() + 60 * 60 * 1000);
         return new Date() > endTime || appt.status === 'Cancelled' || appt.status === 'Completed'; 
      });

      setAppointments(history);
    } catch (err) {
      console.error("Error fetching history:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 pt-24 px-6 pb-12 text-white">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
           <div className="p-3 bg-violet-600/20 rounded-xl">
             <FaHistory className="text-3xl text-violet-400" />
           </div>
           <div>
             <h1 className="text-3xl font-bold">Consultation History</h1>
             <p className="text-slate-400">Archive of your past medical appointments</p>
           </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
             <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
             <p className="mt-4 text-slate-400">Loading history...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="bg-slate-800/50 rounded-2xl p-12 text-center border border-slate-700">
             <FaFilePrescription className="text-6xl text-slate-600 mx-auto mb-4" />
             <h3 className="text-xl font-semibold text-slate-300">No History Found</h3>
             <p className="text-slate-500 mt-2">You haven't completed any consultations yet.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {appointments.map((appt) => (
              <div key={appt._id} className="bg-slate-800/40 border border-slate-700 rounded-2xl p-6 flex flex-col md:flex-row gap-6 hover:bg-slate-800/60 transition-all">
                {/* Date Badge */}
                <div className="flex-shrink-0 flex flex-col items-center justify-center p-4 bg-slate-900 rounded-xl border border-slate-700 w-full md:w-32 text-center">
                   <span className="text-xs text-slate-400 uppercase font-bold">{new Date(appt.appointmentTime).toLocaleString('default', { month: 'short' })}</span>
                   <span className="text-3xl font-bold text-white">{new Date(appt.appointmentTime).getDate()}</span>
                   <span className="text-xs text-slate-500">{new Date(appt.appointmentTime).getFullYear()}</span>
                </div>

                {/* Details */}
                <div className="flex-1 space-y-3">
                   <div className="flex items-start justify-between">
                      <div>
                        {userRole === 'patient' ? (
                          <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <FaUserMd className="text-violet-400" /> Dr. {appt.doctorName}
                          </h3>
                        ) : (
                          <h3 className="text-xl font-bold text-white flex items-center gap-2">
                             <FaUser className="text-pink-400" /> {appt.patientName}
                          </h3>
                        )}
                        <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold
                          ${appt.status === 'Completed' ? 'bg-green-500/10 text-green-400' : 
                            appt.status === 'Cancelled' ? 'bg-red-500/10 text-red-400' : 'bg-slate-500/10 text-slate-400'
                          }`}>
                          {appt.status === 'Confirmed' ? 'Completed (Expired)' : appt.status}
                        </span>
                      </div>
                      <div className="text-right">
                         <div className="text-sm text-slate-400 flex items-center justify-end gap-1">
                            <FaClock /> {new Date(appt.appointmentTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                         </div>
                      </div>
                   </div>
                   
                   <div className="pt-4 border-t border-slate-700/50 mt-4 flex gap-4">
                      {/* Placeholder for future features like Prescription download */}
                      <button className="text-sm text-violet-300 hover:text-violet-200 font-medium flex items-center gap-2">
                        <FaNotesMedical /> View Notes
                      </button>
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
import { FaHistory } from 'react-icons/fa';

export default ConsultHistory;

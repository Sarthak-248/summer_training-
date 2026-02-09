import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';  // Make sure to import axios
import notsuccess from '/src/assets/notifysuccess.png';  // Replace with your success notification icon path
import noterror from '/src/assets/notifyerror.png';  // Replace with your error notification icon path
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [form, setForm] = useState({
    patientName: '',
    patientContact: '',
    appointmentTime: new Date().toISOString().slice(0, 16),
    reason: '',
  });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0,10));
  const [doctorSlots, setDoctorSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
    setFavorites(storedFavorites);
  }, []);

  useEffect(() => {
    if (!selectedDoctor) return;
    const fetchSlots = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/doctors/${selectedDoctor._id}/slots`, {
          params: { date: selectedDate }
        });
        setDoctorSlots(res.data.slots || []);
        setBookedSlots(res.data.booked || []);
        setSelectedSlot(""); // Reset slot selection on date change
      } catch (error) {
        console.error('Failed to fetch slots:', error);
        setDoctorSlots([]);
        setBookedSlots([]);
      }
    };
    fetchSlots();
  }, [selectedDoctor, selectedDate]);

  const handleRemoveFromFavorites = (doctorId) => {
    const updatedFavorites = favorites.filter((doctor) => doctor._id !== doctorId);
    setFavorites(updatedFavorites);
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
  };

  const handleBookAppointment = (doctor) => {
    setSelectedDoctor(doctor); // Set the selected doctor when clicking "Book Appointment"
  };

  const isFavorite = (doctorId) => {
    return favorites.some((fav) => fav._id === doctorId);
  };

  // Validate if the date/time chosen is in the future
  const isValidDate = (date) => {
    const appointmentDate = new Date(date);
    return appointmentDate > new Date();  // Make sure the appointment is in the future
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSlot) {
      showErrorToast("Please select a slot.");
      return;
    }
    const appointmentTime = `${selectedDate}T${selectedSlot}:00`;

    if (!isValidDate(appointmentTime)) {
      showErrorToast('Please select a valid appointment time.');
      return;
    }

    // Request notification permission if not granted [DISABLED]
    // if (Notification.permission !== 'granted') {
    //   await Notification.requestPermission();
    // }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `/api/appointments/book-appointment/${selectedDoctor._id}`,
        { ...form, appointmentTime },
        {
          headers: { Authorization: `Bearer ${token}` },
          ContentType: 'application/json',
        }
      );
      
      showSuccessToast(
          'Appointment Requested!',
          <span className="text-white">
            Your appointment with <span className="text-green-400 font-medium">Dr. {selectedDoctor.name}</span> is confirmed.
          </span>
      );

      // Refetch slots to update booked status
      const res = await axios.get(`${BACKEND_URL}/api/doctors/${selectedDoctor._id}/slots`, {
        params: { date: selectedDate }
      });
      setDoctorSlots(res.data.slots || []);
      setBookedSlots(res.data.booked || []);
      setSelectedSlot(""); // Reset slot selection

      setBookingSuccess(true);
      setForm({ patientName: '', patientContact: '', appointmentTime: '', reason: '' });
    } catch (err) {
      console.error('Booking failed:', err);
      showErrorToast("Booking failed. Please try again.");
    }
  };

  return (
    <div className="w-full py-4 px-6 md:px-12 font-sans relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl top-0 left-0 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-pink-500/20 rounded-full blur-3xl bottom-0 right-0 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute w-64 h-64 bg-rose-500/20 rounded-full blur-3xl top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="text-center mb-14 relative z-10">
      </div>

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {favorites.length === 0 ? (
          <div className="col-span-full">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-16 text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-white/10 rounded-full mb-6">
                <svg className="w-12 h-12 text-pink-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>
              <p className="text-2xl font-semibold text-white mb-2">No Favorites Yet</p>
              <p className="text-purple-200">Start adding doctors to your favorites for quick access</p>
            </div>
          </div>
        ) : (
          favorites.map((doc) => (
            <div
              key={doc._id}
              className="group relative rounded-2xl p-[1px] bg-gradient-to-br from-white/10 via-white/5 to-transparent hover:from-purple-500 hover:via-pink-500 hover:to-rose-500 transition-all duration-500 hover:shadow-[0_0_30px_rgba(236,72,153,0.3)] hover:-translate-y-1 overflow-hidden"
            >
              <div className="relative bg-[#0a0a0a] rounded-2xl h-full w-full overflow-hidden">
              <div className="relative overflow-hidden">
                <img
                  src={doc.imageUrl ? (doc.imageUrl.startsWith('http') ? doc.imageUrl : `${BACKEND_URL}${doc.imageUrl}`) : 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'}
                  alt={doc.name}
                  className="h-56 w-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              </div>
              <div className="p-5 text-white">
                <h2 className="text-xl font-bold bg-gradient-to-r from-pink-300 to-rose-300 bg-clip-text text-transparent drop-shadow-md select-none mb-1">
                  Dr. {doc.name}
                </h2>
                <p className="text-sm text-purple-200 italic mb-3 select-none flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {doc.specialty}
                </p>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg px-3 py-2 border border-pink-400/30">
                    <p className="text-xs text-purple-200 mb-1">Consultation Fee</p>
                    <p className="font-bold text-white select-none">₹{doc.consultationFees}</p>
                  </div>
                </div>
                {/* View Details Button */}
                <button
                  onClick={() => handleBookAppointment(doc)}
                  className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 py-3 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Book Appointment
                </button>
              </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Appointment Booking Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md transition-all p-4">
          <div className="relative bg-gradient-to-br from-white via-blue-50 to-cyan-50 rounded-3xl shadow-2xl w-full max-w-4xl p-8 animate-fade-in border-2 border-blue-200 max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => { setSelectedDoctor(null); setBookingSuccess(false); navigate('/patient/appointments/upcoming'); }}
              className="absolute top-4 right-4 bg-red-500/10 hover:bg-red-500 text-red-600 hover:text-white w-10 h-10 rounded-full flex items-center justify-center text-2xl font-bold focus:outline-none transition-all shadow-lg"
              aria-label="Close"
            >
              ×
            </button>
            
            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mb-3 shadow-xl">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Book Appointment</h3>
              <p className="text-gray-600 mt-1">Schedule your consultation with Dr. {selectedDoctor.name}</p>
            </div>

            {bookingSuccess ? (
              <div className="text-center py-8">
                <div className="text-green-500 text-6xl mb-4">✓</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Appointment Booked Successfully!</h3>
                <p className="text-gray-600 mb-6">Your appointment with Dr. {selectedDoctor.name} is confirmed.</p>
                <button
                  onClick={() => { setSelectedDoctor(null); setBookingSuccess(false); navigate('/patient/appointments/upcoming'); }}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold"
                >
                  View My Appointments
                </button>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row gap-8">
              {/* Left Column: Doctor Info, Date, Slots */}
              <div className="flex-1 min-w-[220px]">
                {/* Doctor Info */}
                <div className="flex items-center gap-4 mb-6">
                  <img
                    src={selectedDoctor.imageUrl ? (selectedDoctor.imageUrl.startsWith('http') ? selectedDoctor.imageUrl : `${BACKEND_URL}${selectedDoctor.imageUrl}`) : 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'}
                    alt={selectedDoctor.name}
                    className="w-16 h-16 rounded-full border-4 border-purple-200 shadow-lg object-cover"
                  />
                  <div>
                    <div className="text-lg font-bold text-purple-800">{selectedDoctor.name}</div>
                    <div className="text-purple-500 font-medium">{selectedDoctor.specialty}</div>
                    {selectedDoctor.qualifications && (
                      <div className="text-base font-medium text-gray-700">{selectedDoctor.qualifications}</div>
                    )}
                    {selectedDoctor.yearsOfExperience && (
                      <div className="text-base font-medium text-gray-700">{selectedDoctor.yearsOfExperience} yrs exp.</div>
                    )}
                    {(selectedDoctor.clinicName || selectedDoctor.clinicAddress) && (
                      <div className="text-xs text-purple-700 mt-2">
                        <span className="font-semibold">Clinic Address:</span>{" "}
                        {selectedDoctor.clinicName ? `${selectedDoctor.clinicName}, ` : ""}
                        {selectedDoctor.clinicAddress}
                      </div>
                    )}
                    {selectedDoctor.awards && (
                      <div className="text-xs text-purple-700 mt-2">
                        <span className="font-semibold">Recognitions:</span> {selectedDoctor.awards}
                      </div>
                    )}
                    {selectedDoctor.services && (
                      <div className="text-xs text-purple-700 mt-2">
                        <span className="font-semibold">Services:</span> {selectedDoctor.services}
                      </div>
                    )}
                    <div className="text-sm text-gray-500 mt-2">
                      Fee: ₹{selectedDoctor.consultationFees}
                    </div>
                  </div>
                </div>
                {/* Date Picker */}
                <label className="block text-sm font-semibold text-purple-700 mb-1">Select Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  min={new Date().toISOString().slice(0,10)}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-2 mb-4 rounded-lg border border-purple-300 focus:ring-2 focus:ring-purple-400 transition"
                />
                {/* Slot Picker */}
                <label className="block text-sm font-semibold text-purple-700 mb-1">Available Slots</label>
                <div className="flex flex-wrap gap-2 mb-2 max-h-48 overflow-y-auto">
                  {doctorSlots.length === 0 ? (
                    <span className="text-gray-400 italic">No slots for this day</span>
                  ) : (
                    doctorSlots
                      .slice()
                      .sort((a, b) => a.start.localeCompare(b.start))
                      .map(slot => {
                        const normalizedStart = slot.start.split(':').map(s => s.padStart(2, '0')).join(':');
                        const isBooked = bookedSlots.some(b => b.start === normalizedStart);
                        return (
                          <button
                            key={slot.start}
                            type="button"
                            disabled={isBooked}
                            onClick={() => setSelectedSlot(normalizedStart)}
                            className={`px-4 py-2 rounded-lg border font-semibold shadow-sm transition
                              ${isBooked
                                ? "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed"
                                : selectedSlot === normalizedStart
                                  ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white border-purple-700 scale-105"
                                  : "bg-white text-purple-700 border-purple-300 hover:bg-purple-100"}
                            `}
                            style={{ minWidth: 70 }}
                            title={isBooked ? "Already booked" : "Book this slot"}
                          >
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                              </svg>
                              {slot.start}
                            </span>
                          </button>
                        );
                      })
                  )}
                </div>
              </div>
              {/* Right Column: Patient Details */}
              <div className="flex-1 min-w-[220px]">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-purple-700 mb-1">Your Name</label>
                    <input
                      type="text"
                      placeholder="Enter your name"
                      value={form.patientName}
                      onChange={e => setForm({ ...form, patientName: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-purple-300 focus:ring-2 focus:ring-purple-400 transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-purple-700 mb-1">Contact Number</label>
                    <input
                      type="text"
                      placeholder="Enter contact number"
                      value={form.patientContact}
                      onChange={e => setForm({ ...form, patientContact: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-purple-300 focus:ring-2 focus:ring-purple-400 transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-purple-700 mb-1">Selected Slot</label>
                    <input
                      type="text"
                      value={
                        selectedDate && selectedSlot
                          ? `${selectedDate} | ${selectedSlot}`
                          : "Select a slot on left"
                      }
                      readOnly
                      className="w-full px-4 py-2 rounded-lg border border-purple-200 bg-purple-50 text-purple-700 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-purple-700 mb-1">Reason for Visit</label>
                    <textarea
                      placeholder="Describe your reason for visit"
                      value={form.reason}
                      onChange={e => setForm({ ...form, reason: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-purple-300 focus:ring-2 focus:ring-purple-400 transition"
                      rows={2}
                    />
                  </div>
                  <div className="flex flex-col gap-2 mt-6">
                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold shadow-lg hover:from-purple-700 hover:to-blue-600 transition disabled:opacity-60"
                      disabled={!selectedSlot}
                    >
                      Confirm Appointment
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedDoctor(null)}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-gray-400 to-gray-600 text-white font-bold shadow-lg hover:from-gray-500 hover:to-gray-700 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;

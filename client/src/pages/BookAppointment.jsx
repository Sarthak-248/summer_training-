import { useState, useEffect } from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa'; // Import React Icons
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import notsuccess from '../assets/notifysuccess.png';
import noterror from '../assets/notifyerror.png';
//import DoctorFlipCard from '../components/DoctorFlipCard';

const BookAppointment = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [form, setForm] = useState({
    patientName: '',
    patientContact: '',
    appointmentTime: new Date().toISOString().slice(0, 16), // Default to current date and time
    reason: '',
  });



  const [loading, setLoading] = useState(false); // Loading state for doctors
  const [favorites, setFavorites] = useState(JSON.parse(localStorage.getItem('favorites')) || []); // State to manage favorites

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0,10)); // "YYYY-MM-DD"
  const [doctorSlots, setDoctorSlots] = useState([]); // [{start, end}]
  const [bookedSlots, setBookedSlots] = useState([]); // ["HH:MM", ...]
  const [selectedSlot, setSelectedSlot] = useState(""); // "HH:MM"

  const navigate = useNavigate(); // Hook for redirection

  // Fetch all doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/api/doctors/available');
        setDoctors(res.data);
      } catch (err) {
        console.error('Error fetching doctors:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  // Fetch slots for selected doctor and date
  useEffect(() => {
    if (!selectedDoctor || !selectedDate) return;
    const fetchSlots = async () => {
      const res = await axios.get(`/api/doctors/${selectedDoctor._id}/slots`, {
        params: { date: selectedDate }
      });
      setDoctorSlots(res.data.slots || []);
      setBookedSlots(res.data.booked || []);
      setSelectedSlot(""); // Reset slot selection on date change
    };
    fetchSlots();
  }, [selectedDoctor, selectedDate]);

  // Date validation
  const isValidDate = (dateString) => {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  };

  // Add doctor to favorites in localStorage
  const addToFavorites = (doctor) => {
    let updatedFavorites = [...favorites];
    if (!updatedFavorites.some((fav) => fav._id === doctor._id)) {
      updatedFavorites.push(doctor);
      setFavorites(updatedFavorites); // Update state
      localStorage.setItem('favorites', JSON.stringify(updatedFavorites)); // Save to localStorage
    } else {
      updatedFavorites = updatedFavorites.filter((fav) => fav._id !== doctor._id); // Remove from favorites
      setFavorites(updatedFavorites);
      localStorage.setItem('favorites', JSON.stringify(updatedFavorites)); // Save to localStorage
    }
  };

  // Check if doctor is in favorites
  const isFavorite = (doctorId) => {
    return favorites.some((fav) => fav._id === doctorId);
  };

  // Handle form submission for booking an appointment
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSlot) {
      alert("Please select a slot.");
      return;
    }
    // Compose appointmentTime as ISO string
    const appointmentTime = `${selectedDate}T${selectedSlot}:00`;

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

      // Show success notification if permission granted [DISABLED]
      // if (Notification.permission === 'granted') {
      //   new Notification('Appointment booked!', {
      //     body: `Your appointment with Dr. ${selectedDoctor.name} is confirmed.`,
      //     icon: notsuccess,
      //   });
      // } else {
      //   alert('Appointment booked!');
      // }
      alert('Appointment booked!');

      setSelectedDoctor(null);
      setForm({ patientName: '', patientContact: '', appointmentTime: '', reason: '' });
      navigate('/patient/appointments'); // Redirect to appointments page after booking
    } catch (err) {
      console.error('Booking failed:', err);

      // Show error notification if permission granted [DISABLED]
      // if (Notification.permission === 'granted') {
      //   new Notification('Booking failed', {
      //     body: 'There was an error booking your appointment. Please try again.',
      //     icon: noterror,
      //   });
      // } else {
      //   alert('Booking failed. Please try again.');
      // }
      alert('Booking failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 py-16 px-6 md:px-12 font-sans relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl top-0 left-0 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl bottom-0 right-0 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Title */}
      <div className="text-center mb-14 relative z-10">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mb-4 shadow-2xl">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent mt-4 select-none drop-shadow-lg">
          Available Doctors
        </h1>
        <p className="text-blue-200 text-lg mt-2">Find and book appointments with top healthcare professionals</p>
      </div>

      {/* Loading Indicator */}
      {loading ? (
        <div className="relative z-10 text-center">
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-xl rounded-2xl px-6 py-4 border border-white/20">
            <svg className="animate-spin h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-white font-semibold">Loading doctors...</span>
          </div>
        </div>
      ) : (
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {doctors.length === 0 ? (
            <div className="col-span-full">
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-16 text-center">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-white/10 rounded-full mb-6">
                  <svg className="w-12 h-12 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-2xl font-semibold text-white mb-2">No Doctors Available</p>
                <p className="text-blue-200">Try adjusting your filters to see more results</p>
              </div>
            </div>
          ) : (
            doctors.map((doc) => (
              <div
                key={doc._id}
                className="group cursor-pointer bg-white/10 backdrop-blur-xl rounded-3xl shadow-xl hover:shadow-2xl border border-white/20 hover:border-blue-400/50 transform hover:-translate-y-2 transition-all duration-300 overflow-hidden"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={doc.imageUrl || '/default-doctor.jpg'}
                    alt={doc.name}
                    className="h-56 w-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  {/* Favorite Button Overlay */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      addToFavorites(doc);
                    }}
                    className="absolute top-3 right-3 bg-white/20 backdrop-blur-md p-2 rounded-full hover:bg-white/30 transition-all"
                  >
                    {isFavorite(doc._id) ? (
                      <FaHeart className="text-red-500 drop-shadow-lg" size={20} />
                    ) : (
                      <FaRegHeart className="text-white drop-shadow-lg" size={20} />
                    )}
                  </div>
                </div>
                <div className="p-5 text-white">
                  <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent drop-shadow-md select-none mb-1">
                    Dr. {doc.name}
                  </h2>
                  <p className="text-sm text-blue-200 italic mb-3 select-none flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {doc.specialty}
                  </p>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex-1 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-lg px-3 py-2 border border-blue-400/30">
                      <p className="text-xs text-blue-200 mb-1">Consultation Fee</p>
                      <p className="font-bold text-white select-none">₹{doc.consultationFees}</p>
                    </div>
                  </div>
                  {/* View Details Button */}
                  <button
                    onClick={() => setSelectedDoctor(doc)}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 py-3 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Book Appointment
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Booking Form */}
      {selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md transition-all p-4">
          <div className="relative bg-gradient-to-br from-white via-blue-50 to-cyan-50 rounded-3xl shadow-2xl w-full max-w-4xl p-8 animate-fade-in border-2 border-blue-200 max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setSelectedDoctor(null)}
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
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left Column: Doctor Info, Date, Slots */}
              <div className="flex-1 min-w-[280px]">
                {/* Doctor Info Card */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 mb-6 border-2 border-blue-200 shadow-lg">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative">
                      <img
                        src={selectedDoctor.imageUrl || "/default-doctor.jpg"}
                        alt={selectedDoctor.name}
                        className="w-20 h-20 rounded-full border-4 border-white shadow-xl object-cover"
                      />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="flex-1">
                      <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Dr. {selectedDoctor.name}</div>
                      <div className="text-blue-600 font-semibold flex items-center gap-1 mt-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {selectedDoctor.specialty}
                      </div>
                    
                      {selectedDoctor.qualifications && (
                        <div className="text-sm text-gray-700 flex items-center gap-1 mt-1">
                          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                          </svg>
                          {selectedDoctor.qualifications}
                        </div>
                      )}
                      {selectedDoctor.yearsOfExperience && (
                        <div className="text-sm text-gray-700 flex items-center gap-1 mt-1">
                          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {selectedDoctor.yearsOfExperience} years experience
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {(selectedDoctor.clinicName || selectedDoctor.clinicAddress) && (
                    <div className="bg-white/50 rounded-lg p-3 mb-2">
                      <div className="text-xs font-semibold text-blue-700 mb-1 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Clinic Address
                      </div>
                      <div className="text-sm text-gray-700">
                        {selectedDoctor.clinicName ? `${selectedDoctor.clinicName}, ` : ""}
                        {selectedDoctor.clinicAddress}
                      </div>
                    </div>
                  )}
                  
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg p-3 text-white">
                    <div className="text-xs font-semibold mb-1">Consultation Fee</div>
                    <div className="text-2xl font-bold">₹{selectedDoctor.consultationFees}</div>
                  </div>
                </div>
                
                {/* Date Picker */}
                <label className="block text-sm font-bold text-blue-700 mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  min={new Date().toISOString().slice(0,10)}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-3 mb-6 rounded-xl border-2 border-blue-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all bg-white shadow-sm"
                />
                
                {/* Slot Picker */}
                <label className="block text-sm font-bold text-blue-700 mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Available Time Slots
                </label>
                <div className="bg-white rounded-xl p-4 border-2 border-blue-100 shadow-inner max-h-64 overflow-y-auto">
                  <div className="flex flex-wrap gap-2">
                    {doctorSlots.length === 0 ? (
                      <div className="w-full text-center py-8">
                        <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-gray-400 italic">No slots available for this day</span>
                      </div>
                    ) : (
                      doctorSlots
                        .slice()
                        .sort((a, b) => a.start.localeCompare(b.start))
                        .map(slot => {
                          const isBooked = bookedSlots.includes(slot.start);
                          return (
                            <button
                              key={slot.start}
                              type="button"
                              disabled={isBooked}
                              onClick={() => setSelectedSlot(slot.start)}
                              className={`px-4 py-3 rounded-lg border-2 font-semibold shadow-sm transition-all transform
                                ${isBooked
                                  ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-50"
                                  : selectedSlot === slot.start
                                    ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-blue-600 scale-105 shadow-lg"
                                    : "bg-white text-blue-700 border-blue-200 hover:bg-blue-50 hover:border-blue-400 hover:scale-105"}
                              `}
                              style={{ minWidth: 80 }}
                              title={isBooked ? "Already booked" : "Book this slot"}
                            >
                              <div className="flex items-center gap-1">
                                <svg className={`w-4 h-4 ${selectedSlot === slot.start ? 'text-white' : 'text-blue-500'}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                                {slot.start}
                              </div>
                            </button>
                          );
                        })
                    )}
                  </div>
                </div>
              </div>
              
              {/* Right Column: Patient Details */}
              <div className="flex-1 min-w-[280px]">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200 shadow-lg">
                  <h4 className="text-lg font-bold text-blue-700 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Your Details
                  </h4>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-blue-700 mb-2">Your Name *</label>
                      <input
                        type="text"
                        placeholder="Enter your full name"
                        value={form.patientName}
                        onChange={e => setForm({ ...form, patientName: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-blue-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all bg-white"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-blue-700 mb-2">Contact Number *</label>
                      <input
                        type="text"
                        placeholder="Enter your contact number"
                        value={form.patientContact}
                        onChange={e => setForm({ ...form, patientContact: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-blue-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all bg-white"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-blue-700 mb-2">Selected Appointment</label>
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-3 rounded-xl font-semibold text-center">
                        {selectedDate && selectedSlot ? (
                          <div className="flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {selectedDate} at {selectedSlot}
                          </div>
                        ) : (
                          <span className="text-white/70">Please select a time slot</span>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-blue-700 mb-2">Reason for Visit</label>
                      <textarea
                        placeholder="Briefly describe your health concerns or reason for consultation"
                        value={form.reason}
                        onChange={e => setForm({ ...form, reason: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-blue-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all bg-white resize-none"
                        rows={3}
                      />
                    </div>
                    
                    <div className="flex flex-col gap-3 mt-6 pt-4 border-t-2 border-blue-200">
                      <button
                        type="submit"
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                        disabled={!selectedSlot}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Confirm Appointment
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedDoctor(null)}
                        className="w-full py-3 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold shadow transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookAppointment;

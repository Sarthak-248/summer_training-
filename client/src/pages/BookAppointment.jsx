import { useState, useEffect } from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa'; // Import React Icons
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';
import notsuccess from '../assets/notifysuccess.png';
import noterror from '../assets/notifyerror.png';
import { toast } from 'react-hot-toast'; // Import toast
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';
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
  const [selectedSlot, setSelectedSlot] = useState(null); // { start: "HH:MM", end: "HH:MM" }

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [minFee, setMinFee] = useState('');
  const [maxFee, setMaxFee] = useState('');

  const navigate = useNavigate(); // Hook for redirection

  // Derived state for filtering
  const filteredDoctors = doctors.filter(doc => {
    const matchesName = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = (doc.specialty || '').toLowerCase().includes(specialtyFilter.toLowerCase());
    const matchesMaxFee = maxFee ? doc.consultationFees <= Number(maxFee) : true;
    const matchesMinFee = minFee ? doc.consultationFees >= Number(minFee) : true;
    return matchesName && matchesSpecialty && matchesMaxFee && matchesMinFee;
  });

  // Fetch all doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      try {
        const res = await api.get('/api/doctors/all');
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
      const res = await api.get(`/api/doctors/${selectedDoctor._id}/slots`, {
        params: { date: selectedDate }
      });
      console.log('bookedSlots from backend:', res.data.booked);
      const normalizedBookedSlots = (res.data.booked || []).map(slot => {
        let timeString = '';
        if (typeof slot === 'string') {
          timeString = slot;
        } else if (slot && typeof slot === 'object' && slot.start) {
          // Handle ISO string format - convert UTC to IST for display
          if (slot.start.includes('T')) {
            const utcDate = new Date(slot.start);
            // Convert UTC to IST (add 5 hours 30 minutes)
            const istDate = new Date(utcDate.getTime() + (5.5 * 60 * 60 * 1000));
            timeString = `${istDate.getHours().toString().padStart(2, '0')}:${istDate.getMinutes().toString().padStart(2, '0')}`;
          } else {
            timeString = slot.start;
          }
        } else {
          return ''; // invalid, skip
        }
        return timeString;
      }).filter(Boolean); // remove empty strings
      console.log('normalizedBookedSlots:', normalizedBookedSlots);
      setDoctorSlots(res.data.slots || []);
      setBookedSlots(normalizedBookedSlots);
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
      showErrorToast('Please select a time slot');
      return;
    }
    
    // Create appointment time in IST timezone (explicit handling for India)
    const [startHour, startMinute] = selectedSlot.start.split(':').map(Number);
    const [endHour, endMinute] = selectedSlot.end.split(':').map(Number);
    
    // Create Date objects in local timezone, but ensure IST handling
    const localStartDate = new Date(selectedDate);
    localStartDate.setHours(startHour, startMinute, 0, 0);
    
    const localEndDate = new Date(selectedDate);
    localEndDate.setHours(endHour, endMinute, 0, 0);
    
    // For IST (UTC+5:30), adjust the time to ensure correct UTC conversion
    // If browser is in IST, this should work correctly
    const appointmentTime = localStartDate.toISOString();
    const appointmentEndTime = localEndDate.toISOString();

    // Request notification permission if not granted [DISABLED]
    // if (Notification.permission !== 'granted') {
    //   await Notification.requestPermission();
    // }

    try {
      const token = localStorage.getItem('token');
      await api.post(
        `/api/appointments/book-appointment/${selectedDoctor._id}`,
        { ...form, appointmentTime, appointmentEndTime },
        {
          headers: { Authorization: `Bearer ${token}` },
          ContentType: 'application/json',
        }
      );
      
      // Attractive Success Toast
      showSuccessToast(
        'Appointment Requested!',
        <span>
          Your request has been sent to <span className="text-green-400 font-medium">Dr. {selectedDoctor.name}</span>.
        </span>
      );

      setSelectedDoctor(null);
      setForm({ patientName: '', patientContact: '', appointmentTime: '', reason: '' });
      navigate('/patient/appointments/upcoming'); // Redirect to appointments page after booking
    } catch (err) {
      console.error('Booking failed:', err);
      
      showErrorToast(
        err.response?.data?.message || 'Booking failed. Please try again.'
      );
    }
  };

  return (
    <div className="w-full pt-1 pb-8 px-6 md:px-12 font-sans relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl top-0 left-0 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-pink-500/20 rounded-full blur-3xl bottom-0 right-0 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute w-64 h-64 bg-rose-500/20 rounded-full blur-3xl top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Filters Section */}
      <div className="relative z-10 mb-12 mx-auto max-w-7xl mt-8">
        <div className="bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-2xl border border-white/20 rounded-3xl p-4 shadow-2xl relative overflow-hidden group">
          {/* Decorative shine effect */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl group-hover:bg-pink-500/30 transition-all duration-700"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl group-hover:bg-purple-500/30 transition-all duration-700"></div>
          
          <div className="relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Name Search */}
              <div className="relative group/input md:col-span-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <svg className="h-5 w-5 text-gray-400 group-focus-within/input:text-pink-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search Doctor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-2 bg-black/40 border border-white/10 text-white rounded-2xl focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 focus:bg-white/5 transition-all duration-300 outline-none placeholder-gray-500 backdrop-blur-sm"
                />
              </div>

              {/* Specialty Filter */}
              <div className="relative group/input md:col-span-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <svg className="h-5 w-5 text-gray-400 group-focus-within/input:text-purple-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Specialty (e.g. Heart)"
                  value={specialtyFilter}
                  onChange={(e) => setSpecialtyFilter(e.target.value)}
                  className="w-full pl-12 pr-4 py-2 bg-black/40 border border-white/10 text-white rounded-2xl focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 focus:bg-white/5 transition-all duration-300 outline-none placeholder-gray-500 backdrop-blur-sm"
                />
              </div>

              {/* Fees Range Filter */}
              <div className="md:col-span-2 grid grid-cols-2 gap-4">
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <span className="text-gray-400 group-focus-within/input:text-green-400 transition-colors duration-300 font-bold text-lg">₹</span>
                  </div>
                  <input
                    type="number"
                    placeholder="Min Fee"
                    value={minFee}
                    onChange={(e) => setMinFee(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-black/40 border border-white/10 text-white rounded-2xl focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 focus:bg-white/5 transition-all duration-300 outline-none placeholder-gray-500 backdrop-blur-sm"
                  />
                </div>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <span className="text-gray-400 group-focus-within/input:text-green-400 transition-colors duration-300 font-bold text-lg">₹</span>
                  </div>
                  <input
                    type="number"
                    placeholder="Max Fee"
                    value={maxFee}
                    onChange={(e) => setMaxFee(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-black/40 border border-white/10 text-white rounded-2xl focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 focus:bg-white/5 transition-all duration-300 outline-none placeholder-gray-500 backdrop-blur-sm"
                  />
                </div>
              </div>
            </div>
            
            {/* Active Filters Summary */}
            {(searchTerm || specialtyFilter || minFee || maxFee) && (
               <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/10 animate-fade-in">
                  <span className="text-sm text-gray-400 flex items-center gap-2">Active Filters:</span>
                  {searchTerm && <span className="px-3 py-1 rounded-full bg-pink-500/20 border border-pink-500/30 text-pink-300 text-xs font-semibold">Name: {searchTerm}</span>}
                  {specialtyFilter && <span className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold">Specialty: {specialtyFilter}</span>}
                  {(minFee || maxFee) && <span className="px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30 text-green-300 text-xs font-semibold">Fee: ₹{minFee || 0} - ₹{maxFee || 'Any'}</span>}
                  <button 
                    onClick={() => { setSearchTerm(''); setSpecialtyFilter(''); setMinFee(''); setMaxFee(''); }}
                    className="ml-auto text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
                  >
                    Clear All
                  </button>
               </div>
            )}
          </div>
        </div>
      </div>

      {/* Loading Indicator */}
      {loading ? (
        <div className="relative z-10 text-center">
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-xl rounded-2xl px-6 py-4 border border-white/20">
            <svg className="animate-spin h-6 w-6 text-pink-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-white font-semibold">Loading doctors...</span>
          </div>
        </div>
      ) : (
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {filteredDoctors.length === 0 ? (
            <div className="col-span-full">
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-16 text-center">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-white/10 rounded-full mb-6 relative group">
                  <div className="absolute inset-0 bg-pink-500/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                  <svg className="w-12 h-12 text-pink-300 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <p className="text-2xl font-semibold text-white mb-2">No Matches Found</p>
                <p className="text-purple-200">We couldn't find any doctors matching your criteria.</p>
                <button 
                  onClick={() => { setSearchTerm(''); setSpecialtyFilter(''); setMaxFee(''); }}
                  className="mt-6 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors border border-white/10"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          ) : (
            filteredDoctors.map((doc) => (
              <div
                key={doc._id}
                className="group relative rounded-2xl p-[1px] bg-gradient-to-br from-white/10 via-white/5 to-transparent  transition-all duration-500 hover:shadow-[0_0_30px_rgba(236,72,153,0.3)] hover:-translate-y-1 overflow-hidden"
              >
                <div className="relative bg-transparent rounded-2xl h-full w-full overflow-hidden">

                <div className="relative h-48 overflow-hidden">
                  <img
                    src={doc.imageUrl ? (doc.imageUrl.startsWith('http') ? doc.imageUrl : `${BACKEND_URL}${doc.imageUrl}`) : 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'}
                    alt={doc.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent opacity-90"></div>
                  
                  {/* Favorite Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToFavorites(doc);
                    }}
                    className="absolute top-3 right-3 p-2 bg-black/40 backdrop-blur-md rounded-xl border border-white/10 hover:bg-white/10 transition-all group/btn"
                  >
                    {isFavorite(doc._id) ? (
                      <FaHeart className="text-pink-500 drop-shadow-[0_0_10px_rgba(236,72,153,0.5)]" size={16} />
                    ) : (
                      <FaRegHeart className="text-white/70 group-hover/btn:text-pink-400" size={16} />
                    )}
                  </button>
                </div>

                <div className="p-6 relative -mt-6">
                  <div className="absolute inset-x-0 -top-12 h-12 bg-gradient-to-t from-[#0a0a0a] to-transparent"></div>
                  
                  <h3 className="text-xl font-bold text-white mb-1 group-hover:text-pink-400 transition-colors">Dr. {doc.name}</h3>
                  <p className="text-sm font-medium text-pink-400 mb-4">{doc.specialty}</p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                      <span className="text-xs text-gray-400">Consultation Fee</span>
                      <span className="text-sm font-semibold text-white">₹{doc.consultationFees}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedDoctor(doc)}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:from-purple-500 hover:to-pink-500 transition-all shadow-[0_4px_20px_rgba(219,39,119,0.2)] hover:shadow-[0_4px_20px_rgba(219,39,119,0.4)] active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <span>Book Appointment</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Booking Form */}
      {selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md transition-all p-4">
          <div className="relative bg-gradient-to-br from-violet-900/90 via-slate-900/95 to-violet-900/90 border border-white/10 rounded-3xl shadow-2xl w-full max-w-4xl p-8 animate-fade-in max-h-[90vh] overflow-y-auto custom-scrollbar">
            {/* Close Button */}
            <button
              onClick={() => setSelectedDoctor(null)}
              className="absolute top-4 right-4 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold focus:outline-none transition-all"
              aria-label="Close"
            >
              ×
            </button>
            
            {/* Header Removed */}
            <div className="flex flex-col lg:flex-row gap-8 mt-8">
              {/* Left Column: Doctor Info, Date, Slots */}
              <div className="flex-1 min-w-[280px]">
                {/* Doctor Info Card */}
                <div className="bg-white/5 rounded-2xl p-6 mb-6 border border-white/10">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative">
                      <img
                        src={selectedDoctor.imageUrl ? (selectedDoctor.imageUrl.startsWith('http') ? selectedDoctor.imageUrl : `${BACKEND_URL}${selectedDoctor.imageUrl}`) : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                        alt={selectedDoctor.name}
                        className="w-20 h-20 rounded-full border-2 border-white/20 object-cover"
                      />
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-[#0a0a0a]"></div>
                    </div>
                    <div className="flex-1">
                      <div className="text-xl font-bold text-white">Dr. {selectedDoctor.name}</div>
                      <div className="text-pink-400 text-sm font-medium mt-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {selectedDoctor.specialty}
                      </div>
                    
                      {selectedDoctor.qualifications && (
                        <div className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                          <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                          </svg>
                          {selectedDoctor.qualifications}
                        </div>
                      )}
                      {selectedDoctor.yearsOfExperience && (
                        <div className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                          <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {selectedDoctor.yearsOfExperience} years experience
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {(selectedDoctor.clinicName || selectedDoctor.clinicAddress) && (
                    <div className="bg-white/5 rounded-lg p-3 mb-4 border border-white/5">
                      <div className="text-xs font-semibold text-gray-300 mb-1 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Clinic Address
                      </div>
                      <div className="text-sm text-gray-400">
                        {selectedDoctor.clinicName ? `${selectedDoctor.clinicName}, ` : ""}
                        {selectedDoctor.clinicAddress}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                    <span className="text-sm text-gray-300">Consultation Fee</span>
                    <span className="text-xl font-bold text-white">₹{selectedDoctor.consultationFees}</span>
                  </div>
                </div>
                
                {/* Date Picker */}
                <label className="block text-sm font-medium text-gray-300 mb-2">Select Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  min={new Date().toISOString().slice(0,10)}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-3 mb-6 rounded-xl bg-white/5 border border-white/10 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 text-white transition-all outline-none [color-scheme:dark]"
                />
                
                {/* Slot Picker */}
                <label className="block text-sm font-medium text-gray-300 mb-2">Available Time Slots</label>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10 max-h-60 overflow-y-auto custom-scrollbar">
                  <div className="flex flex-wrap gap-2">
                    {doctorSlots.length === 0 ? (
                      <div className="w-full text-center py-8">
                        <span className="text-gray-500 italic">No slots available for this day</span>
                      </div>
                    ) : (
                      doctorSlots
                        .slice()
                        .sort((a, b) => a.start.localeCompare(b.start))
                        .map(slot => {
                          console.log('Checking slot:', slot.start, 'against bookedSlots:', bookedSlots);
                          const isBooked = bookedSlots.includes(slot.start);
                          console.log('isBooked for', slot.start, ':', isBooked);
                          
                          // Check if slot is in the past (only for today)
                          const isPastTime = (() => {
                            const today = new Date();
                            const todayString = today.getFullYear() + '-' + 
                              String(today.getMonth() + 1).padStart(2, '0') + '-' + 
                              String(today.getDate()).padStart(2, '0');
                            
                            if (selectedDate !== todayString) return false;
                            
                            const now = new Date();
                            const [hours, minutes] = slot.start.split(':').map(Number);
                            const slotTime = new Date();
                            slotTime.setHours(hours, minutes, 0, 0);
                            
                            return slotTime <= now;
                          })();
                          
                          const isDisabled = isBooked || isPastTime;
                          
                          return (
                            <button
                              key={slot.start}
                              type="button"
                              disabled={isDisabled}
                              onClick={() => setSelectedSlot(slot)}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                                ${isDisabled
                                  ? "bg-white/5 text-gray-600 cursor-not-allowed border border-transparent"
                                  : selectedSlot?.start === slot.start
                                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white border border-transparent shadow-lg shadow-purple-500/20"
                                    : "bg-white/5 text-gray-300 border border-white/10 hover:border-pink-500/50 hover:bg-white/10"}
                              `}
                            >
                              {slot.start} - {slot.end}
                            </button>
                          );
                        })
                    )}
                  </div>
                </div>
              </div>
              
              {/* Right Column: Patient Details */}
              <div className="flex-1 min-w-[280px]">
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10 h-full">
                  <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    Your Details
                  </h4>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Your Name *</label>
                      <input
                        type="text"
                        placeholder="Enter your full name"
                        value={form.patientName}
                        onChange={e => setForm({ ...form, patientName: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 text-white transition-all outline-none placeholder-gray-600"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Contact Number *</label>
                      <input
                        type="text"
                        placeholder="Enter your contact number"
                        value={form.patientContact}
                        onChange={e => setForm({ ...form, patientContact: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 text-white transition-all outline-none placeholder-gray-600"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Selected Appointment</label>
                      <div className="bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl font-medium text-center">
                        {selectedDate && selectedSlot ? (
                          <div className="text-pink-400">
                            {selectedDate} | {selectedSlot.start} - {selectedSlot.end}
                          </div>
                        ) : (
                          <span className="text-gray-500">Please select a time slot</span>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Reason for Visit</label>
                      <textarea
                        placeholder="Briefly describe your health concerns..."
                        value={form.reason}
                        onChange={e => setForm({ ...form, reason: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 text-white transition-all outline-none placeholder-gray-600 resize-none"
                        rows={3}
                      />
                    </div>
                    
                    <div className="flex flex-col gap-3 mt-8 pt-6 border-t border-white/10">
                      <button
                        type="submit"
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold shadow-lg shadow-purple-500/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        disabled={!selectedSlot}
                      >
                        Confirm Appointment
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedDoctor(null)}
                        className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-medium transition-all"
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

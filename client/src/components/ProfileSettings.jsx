import React, { useState, useEffect } from "react";
import { toast } from 'react-hot-toast';

const daysOrder = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const ProfileSettings = () => {
  const [availableSlots, setAvailableSlots] = useState([{ day: "", start: "", end: "" }]);
  const [allSlots, setAllSlots] = useState([]);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [profileComplete, setProfileComplete] = useState(false);

  // Fetch doctor's profile and check completeness
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/doctor/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setDoctorProfile(data);
          setProfileComplete(data.isProfileComplete || false);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, []);

  // Fetch existing slots
  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/doctor/slots`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setAllSlots(data);
        }
      } catch (error) {
        console.error('Error fetching slots:', error);
      }
    };

    if (profileComplete) {
      fetchSlots();
    }
  }, [profileComplete]);

  const handleSlotChange = (index, field, value) => {
    const newSlots = [...availableSlots];
    newSlots[index][field] = value;
    setAvailableSlots(newSlots);
  };

  const handleAddSlot = () => {
    setAvailableSlots([...availableSlots, { day: "", start: "", end: "" }]);
  };

  const handleRemoveSlot = (index) => {
    setAvailableSlots(availableSlots.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/doctor/slots`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ slots: availableSlots })
      });

      if (response.ok) {
        toast.success('Slots saved successfully!');
        // Refresh slots
        const fetchResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/doctor/slots`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (fetchResponse.ok) {
          const data = await fetchResponse.json();
          setAllSlots(data);
        }
      } else {
        toast.error('Failed to save slots');
      }
    } catch (error) {
      console.error('Error saving slots:', error);
      toast.error('Error saving slots');
    }
  };

  const handleDeleteSetSlot = async (day, start, end) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/doctor/slots`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ day, start, end })
      });

      if (response.ok) {
        toast.success('Slot deleted successfully!');
        // Refresh slots
        const fetchResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/doctor/slots`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (fetchResponse.ok) {
          const data = await fetchResponse.json();
          setAllSlots(data);
        }
      } else {
        toast.error('Failed to delete slot');
      }
    } catch (error) {
      console.error('Error deleting slot:', error);
      toast.error('Error deleting slot');
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl top-0 left-0 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl bottom-0 right-0 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 max-w-6xl mx-auto p-6">
        
        {/* Profile Completion Check */}
        {!profileComplete && (
          <div className="mb-8 bg-red-500/20 backdrop-blur-xl rounded-3xl shadow-2xl border border-red-500/30 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white">Profile Incomplete</h2>
            </div>
            <p className="text-red-200 text-lg mb-4">
              You must complete your profile before setting availability time slots. Please update your profile with all required information.
            </p>
            <a
              href="/doctor/create-listing"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Update Profile First
            </a>
          </div>
        )}

        {/* Show upcoming slots - only if profile is complete */}
        {profileComplete && (
        <div className="mb-8 bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white">Your Current Schedule</h2>
          </div>
          {allSlots.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-4">
                <svg className="w-8 h-8 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-blue-200 text-lg">No slots set yet. Add your first availability slot below!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {allSlots.map(daySlot => (
                <div key={daySlot.day} className="bg-white/5 rounded-2xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="font-bold text-xl text-cyan-300">{daySlot.day}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {daySlot.slots.map((slot, idx) => (
                      <div key={idx} className="group inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border border-blue-400/30 px-4 py-2 rounded-xl hover:from-blue-500/30 hover:to-indigo-500/30 transition-all duration-300">
                        <svg className="w-4 h-4 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-white font-semibold">{slot.start} - {slot.end}</span>
                        <button
                          onClick={() => handleDeleteSetSlot(daySlot.day, slot.start, slot.end)}
                          className="ml-1 p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white transition-all duration-300"
                          title="Delete Slot"
                          type="button"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        )}

        {/* Add New Slots Section */}
        {profileComplete && (
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white">Add New Time Slots</h2>
          </div>

          <div className="space-y-4">
            {availableSlots.map((slot, index) => (
              <div key={index} className="flex flex-col md:flex-row gap-3 items-stretch md:items-center bg-white/5 rounded-2xl p-4 border border-white/10">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-blue-200 mb-2">Day</label>
                  <select
                    value={slot.day}
                    onChange={(e) => handleSlotChange(index, "day", e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border-2 border-blue-300/30 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
                  >
                    <option value="">Select Day</option>
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                    <option value="Sunday">Sunday</option>
                  </select>
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-semibold text-blue-200 mb-2">Start Time</label>
                  <input
                    type="time"
                    value={slot.start}
                    onChange={(e) => handleSlotChange(index, "start", e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border-2 border-blue-300/30 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
                  />
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-semibold text-blue-200 mb-2">End Time</label>
                  <input
                    type="time"
                    value={slot.end}
                    onChange={(e) => handleSlotChange(index, "end", e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border-2 border-blue-300/30 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
                  />
                </div>

                {availableSlots.length > 1 && (
                  <div className="flex items-center">
                    <button
                      onClick={() => handleRemoveSlot(index)}
                      className="p-2 bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white rounded-xl transition-all duration-300"
                      title="Remove Slot"
                      type="button"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <button
              onClick={handleAddSlot}
              className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Another Time Slot
            </button>

            <button
              onClick={handleSave}
              className="flex-1 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Save All Slots
            </button>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSettings;
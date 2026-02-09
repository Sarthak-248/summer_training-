import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';

const ProfileSettings = () => {
  const navigate = useNavigate();

  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  const [allSlots, setAllSlots] = useState([]);
  const [newSlots, setNewSlots] = useState([
    { day: "", start: "", end: "" },
  ]);

  /* =====================================================
     CHECK IF DOCTOR EXISTS
     ===================================================== */
  const checkDoctor = async () => {
    // Prevent infinite retries
    if (retryCount >= MAX_RETRIES) {
      console.log('[ProfileSettings] Max retries reached, stopping checks');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      const res = await fetch(`/api/doctors/profile?t=${Date.now()}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
      });

      if (res.status === 404) {
        setDoctorExists(false);
        setRetryCount(prev => prev + 1);
        return;
      }

      if (res.ok) {
        setDoctorExists(true);
        setRetryCount(0); // Reset on success
      }
    } catch (err) {
      console.error("Doctor check error:", err);
      setRetryCount(prev => prev + 1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkDoctor();
  }, []);

  // Re-check doctor existence when localStorage changes (e.g., after profile creation)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'doctorId' && e.newValue) {
        console.log('[ProfileSettings] doctorId set, re-checking doctor existence');
        checkDoctor();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Also check periodically in case of same-tab changes
    const intervalId = setInterval(() => {
      const doctorId = localStorage.getItem('doctorId');
      if (doctorId && !doctorExists && retryCount < MAX_RETRIES) {
        console.log('[ProfileSettings] Found doctorId, re-checking existence');
        checkDoctor();
      }
    }, 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, [doctorExists]);

  /* =====================================================
     FETCH AVAILABILITY
     ===================================================== */
  useEffect(() => {
    if (!doctorExists) return;

    const fetchSlots = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch(`/api/doctors/slots`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          setAllSlots(await res.json());
        }
      } catch (err) {
        console.error("Fetch slots error:", err);
      }
    };

    fetchSlots();
  }, [doctorExists]);

  /* =====================================================
     HANDLERS
     ===================================================== */
  const handleSlotChange = (index, field, value) => {
    const updated = [...newSlots];
    updated[index][field] = value;
    setNewSlots(updated);
  };

  const addSlotRow = () => {
    setNewSlots([...newSlots, { day: "", start: "", end: "" }]);
  };

  const removeSlotRow = (index) => {
    setNewSlots(newSlots.filter((_, i) => i !== index));
  };

 const saveSlots = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return;

    // ===============================
    // 1️⃣ BUILD DAY-WISE MERGE LOCALLY
    // ===============================
    const slotMap = {};

    // existing slots
    allSlots.forEach(d => {
      if (!slotMap[d.day]) slotMap[d.day] = [];
      d.slots.forEach(s => {
        slotMap[d.day].push({ start: s.start, end: s.end });
      });
    });

    // newly added slots
    newSlots.forEach(s => {
      if (!s.day || !s.start || !s.end) return;
      if (!slotMap[s.day]) slotMap[s.day] = [];
      slotMap[s.day].push({ start: s.start, end: s.end });
    });

    // remove duplicates per day
    Object.keys(slotMap).forEach(day => {
      slotMap[day] = slotMap[day].filter(
        (slot, index, self) =>
          index ===
          self.findIndex(
            s => s.start === slot.start && s.end === slot.end
          )
      );
    });

    // ===============================
    // 2️⃣ UPDATE UI IMMEDIATELY
    // ===============================
    const updatedAllSlots = Object.keys(slotMap).map(day => ({
      day,
      slots: slotMap[day],
    }));

    setAllSlots(updatedAllSlots);
    setNewSlots([{ day: "", start: "", end: "" }]);

    // ===============================
    // 3️⃣ FLATTEN FOR BACKEND SAVE
    // ===============================
    const flatSlots = updatedAllSlots.flatMap(d =>
      d.slots.map(s => ({
        day: d.day,
        start: s.start,
        end: s.end,
      }))
    );

    const res = await fetch(`/api/doctors/save-slots`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ slots: flatSlots }),
    });

    if (!res.ok) {
      showErrorToast("Failed to save availability");
      return;
    }

    showSuccessToast("Success", "Availability saved");
  } catch (err) {
    console.error(err);
    showErrorToast("Server error");
  }
};



  const deleteSlot = async (day, start, end) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`/api/doctors/slots`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ day, start, end }),
      });

      if (!res.ok) {
        showErrorToast("Failed to delete slot");
        return;
      }

      showSuccessToast("Success", "Slot removed");

      setAllSlots((prev) =>
        prev.map((d) =>
          d.day !== day
            ? d
            : {
                ...d,
                slots: d.slots.filter(
                  (s) => !(s.start === start && s.end === end)
                ),
              }
        )
      );
    } catch (err) {
      console.error(err);
      showErrorToast("Server error");
    }
  };

  if (loading) return null;

  /* =====================================================
     UI
     ===================================================== */
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-950 via-black to-violet-950 p-6 text-white">

      {/* ❌ Doctor NOT created */}
      {!doctorExists && (
        <div className="bg-pink-500/10 border border-pink-500/30 p-6 rounded-2xl max-w-xl mx-auto shadow-[0_0_40px_rgba(236,72,153,0.25)]">
          <h2 className="text-2xl font-bold mb-3 text-pink-400">
            Doctor Profile Required
          </h2>
          <p className="text-pink-200 mb-5">
            Please create your doctor profile before setting availability.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/doctor/create-listing")}
              className="bg-gradient-to-r from-pink-500 to-fuchsia-600 px-6 py-3 rounded-xl font-semibold hover:shadow-[0_0_30px_rgba(236,72,153,0.5)] transition"
            >
              Update Profile
            </button>
            <button
              onClick={() => {
                setLoading(true);
                checkDoctor();
              }}
              className="bg-gray-600 hover:bg-gray-500 px-6 py-3 rounded-xl font-semibold transition"
            >
              Refresh Status
            </button>
          </div>
        </div>
      )}

      {/* ✅ Doctor EXISTS */}
      {doctorExists && (
        <>

          <h2 className="text-3xl font-bold mb-8 text-pink-400">
            Set Availability
          </h2>

          {/* ADD NEW SLOTS */}
          <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-pink-500/20 shadow-[0_0_40px_rgba(236,72,153,0.15)]">
            {newSlots.map((slot, i) => (
              <div key={i} className="flex gap-3 mb-4 flex-wrap">
                <select
                  value={slot.day}
                  onChange={(e) =>
                    handleSlotChange(i, "day", e.target.value)
                  }
                  className="bg-gray-50 border border-pink-500/30 p-2 rounded-lg text-gray-900"
                >
                  <option value="">Day</option>
                  {[
                    "Monday","Tuesday","Wednesday",
                    "Thursday","Friday","Saturday","Sunday",
                  ].map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>

                <input
                  type="time"
                  value={slot.start}
                  onChange={(e) =>
                    handleSlotChange(i, "start", e.target.value)
                  }
                  className="bg-gray-50 border border-pink-500/30 p-2 rounded-lg text-gray-900"
                />

                <input
                  type="time"
                  value={slot.end}
                  onChange={(e) =>
                    handleSlotChange(i, "end", e.target.value)
                  }
                  className="bg-gray-50 border border-pink-500/30 p-2 rounded-lg text-gray-900"
                />

                {newSlots.length > 1 && (
                  <button
                    onClick={() => removeSlotRow(i)}
                    className="text-pink-400 hover:text-red-400"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}

            <div className="flex gap-4 mt-6">
              <button
                onClick={addSlotRow}
                className="bg-gradient-to-r from-pink-500 to-fuchsia-600 px-5 py-2 rounded-xl font-semibold"
              >
                + Add Slot
              </button>

              <button
                onClick={saveSlots}
                className="bg-gradient-to-r from-fuchsia-600 to-pink-500 px-5 py-2 rounded-xl font-semibold"
              >
                Save Slots
              </button>
            </div>
          </div>

          {/* ✅ TRACKING VIEW (DAY + SLOTS IN SAME ROW) */}
          <div className="mt-6 bg-black/40 border border-fuchsia-500/20 rounded-2xl p-5">
            <h3 className="text-xl font-semibold text-fuchsia-300 mb-4">
              Your Current Availability (Tracking)
            </h3>

            {allSlots.length === 0 ? (
              <p className="text-pink-200 text-sm">
                No slots saved yet.
              </p>
            ) : (
              [...allSlots]
                .sort((a, b) => {
                  const days = [
                    "Monday","Tuesday","Wednesday",
                    "Thursday","Friday","Saturday","Sunday",
                  ];
                  return days.indexOf(a.day) - days.indexOf(b.day);
                })
                .map((d) => (
                  <div
                    key={d.day}
                    className="flex flex-wrap items-start gap-4 py-2 border-b border-white/10 last:border-b-0"
                  >
                    <div className="w-28 text-pink-400 font-semibold">
                      {d.day}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {d.slots
                        .sort((a, b) =>
                          a.start.localeCompare(b.start)
                        )
                        .map((s, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 rounded-lg text-sm bg-white/5 border border-pink-500/20 text-pink-100"
                          >
                            {s.start} – {s.end}
                          </span>
                        ))}
                    </div>
                  </div>
                ))
            )}
          </div>

          
        </>
      )}
    </div>
  );
};

export default ProfileSettings;

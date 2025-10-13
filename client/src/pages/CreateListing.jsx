// src/pages/CreateListing.jsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const defaultAvatar = "https://api.dicebear.com/7.x/adventurer/svg?seed=doctor";

// All doctor profile fields
const doctorFields = [
  { key: "specialty", label: "Specialty", type: "text" },
  { key: "qualifications", label: "Qualifications", type: "text" },
  { key: "yearsOfExperience", label: "Years of Experience", type: "number" },
  { key: "contactNumber", label: "Contact Number", type: "text" },
  { key: "clinicName", label: "Clinic/Hospital Name", type: "text" },
  { key: "clinicAddress", label: "Clinic/Hospital Address", type: "text" },
  { key: "registrationNumber", label: "Registration Number", type: "text" },
  { key: "gender", label: "Gender", type: "select", options: ["Male", "Female", "Other"] },
  { key: "languages", label: "Languages Spoken (comma separated)", type: "text" },
  { key: "linkedIn", label: "LinkedIn/Profile Link", type: "text" },
  { key: "awards", label: "Awards/Recognitions", type: "textarea" },
  { key: "services", label: "Services Offered", type: "textarea" },
  { key: "description", label: "Description", type: "textarea" },
  { key: "consultationFees", label: "Consultation Fee (₹)", type: "number" },
];

const CreateListing = () => {
  const [user, setUser] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [form, setForm] = useState({});
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(defaultAvatar);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const fileInputRef = useRef();

  // Fetch user and doctor profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        // Get user info (name, email)
        const userRes = await axios.get("/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(userRes.data);

        // Get doctor profile
        const docRes = await axios.get("/api/doctors/my-profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDoctor(docRes.data);
        setForm({
          ...docRes.data,
          name: docRes.data.name || userRes.data.name,
          languages: docRes.data.languages ? docRes.data.languages.join(", ") : "",
        });
        setPhotoPreview(docRes.data.imageUrl || defaultAvatar);
        setEditMode(false);
      } catch (err) {
        // If no profile, prefill name/email from user
        try {
          const token = localStorage.getItem("token");
          const userRes = await axios.get("/api/auth/profile", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser(userRes.data);
          setForm({ name: userRes.data.name, email: userRes.data.email });
          setPhotoPreview(defaultAvatar);
          setEditMode(true);
        } catch {
          setError("Failed to fetch user info.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setPhotoFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = () => setEditMode(true);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.name.trim()) {
      setError("Name is required.");
      setLoading(false);
      return;
    }
    if (
      !form.name ||
      !form.specialty ||
      !form.description ||
      !form.consultationFees ||
      (!doctor && !photoFile) // For new profile, image is required
    ) {
      setError("Please fill all required fields and upload a profile photo.");
      setLoading(false);
      return;
    }
    setMsg("");
    setError("");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const data = new FormData();

      data.append("name", form.name || "");
      doctorFields.forEach((field) => {
        if (field.key === "languages") {
          data.append("languages", (form.languages || "").split(",").map(l => l.trim()).filter(Boolean));
        } else if (field.key !== "image" && field.key !== "photo") {
          data.append(field.key, form[field.key] || "");
        }
      });
      if (photoFile) data.append("image", photoFile);

      // If doctor profile exists, update; else, create
      let res;
      try {
        res = await axios.put("/api/doctors/my-profile", data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMsg("Profile updated successfully!");
      } catch (err) {
        // If not found, create new
        res = await axios.post("/api/doctors/create-listing", data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMsg("Profile created successfully!");
      }
      setDoctor(res.data);
      setForm({
        ...res.data,
        languages: res.data.languages ? res.data.languages.join(", ") : "",
      });
      setPhotoPreview(res.data.imageUrl || photoPreview);
      setEditMode(false);
      setPhotoFile(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save profile.");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-pink-900 to-rose-900 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl top-0 left-0 animate-pulse"></div>
          <div className="absolute w-96 h-96 bg-pink-500/20 rounded-full blur-3xl bottom-0 right-0 animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-pink-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-2xl text-white font-semibold">Loading Profile...</span>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-rose-900 px-4 py-8 md:py-16 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl top-0 left-0 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-pink-500/20 rounded-full blur-3xl bottom-0 right-0 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute w-64 h-64 bg-rose-500/20 rounded-full blur-3xl top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4 shadow-2xl">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-pink-400 via-purple-400 to-rose-400 bg-clip-text text-transparent drop-shadow-lg">
            Doctor Profile
          </h1>
          <p className="text-purple-200 text-lg mt-2">Manage your professional information</p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6 md:p-10">
          {/* Profile Photo Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-4">
              <div className="w-36 h-36 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 p-1 shadow-2xl">
                <img
                  src={photoPreview || defaultAvatar}
                  alt="Doctor"
                  className="w-full h-full rounded-full object-cover bg-white"
                />
              </div>
              {editMode && (
                <button
                  type="button"
                  className="absolute bottom-0 right-0 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full p-3 shadow-xl hover:from-pink-600 hover:to-rose-600 transition-all transform hover:scale-110"
                  onClick={() => fileInputRef.current.click()}
                  title="Change Photo"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              )}
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handlePhotoChange}
              />
            </div>

            {/* User Info Card */}
            <div className="text-center bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-2xl px-6 py-4 border border-purple-300/30 shadow-lg">
              <h2 className="text-2xl font-extrabold text-white mb-1">{user?.name}</h2>
              <p className="text-purple-200 font-medium flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {user?.email}
              </p>
              <span className="inline-block mt-3 px-4 py-1.5 rounded-full bg-gradient-to-r from-pink-400 to-rose-400 text-white font-bold text-sm shadow-lg">
                👨‍⚕️ Medical Professional
              </span>
            </div>
          </div>

          {/* Profile Details */}
          {editMode ? (
            <form onSubmit={handleSave} className="w-full">
              {/* Name Field (Separate) */}
              <div className="mb-6">
                <label className="flex items-center gap-2 text-purple-200 font-bold mb-2 text-sm">
                  <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name || ""}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 rounded-xl border-2 border-purple-300/30 bg-white/10 text-white placeholder:text-purple-300/50 focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-all backdrop-blur-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {doctorFields.map((field) => (
                  <div key={field.key} className={`flex flex-col ${field.type === 'textarea' ? 'md:col-span-2' : ''}`}>
                    <label className="flex items-center gap-2 text-purple-200 font-bold mb-2 text-sm">
                      {field.key === 'specialty' && (
                        <svg className="w-4 h-4 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      )}
                      {field.key === 'qualifications' && (
                        <svg className="w-4 h-4 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M12 14l9-5-9-5-9 5 9 5z" />
                          <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                        </svg>
                      )}
                      {field.key === 'consultationFees' && (
                        <svg className="w-4 h-4 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                      {field.key === 'contactNumber' && (
                        <svg className="w-4 h-4 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      )}
                      {field.label}
                      {(field.key === 'specialty' || field.key === 'description' || field.key === 'consultationFees') && ' *'}
                    </label>
                    {field.type === "select" ? (
                      <div className="relative">
                        <select
                          name={field.key}
                          value={form[field.key] || ""}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-xl border-2 border-purple-300/30 bg-white/10 text-white focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-all backdrop-blur-sm appearance-none cursor-pointer"
                        >
                          <option value="" className="bg-purple-900">Select {field.label}</option>
                          {field.options.map((opt) => (
                            <option key={opt} value={opt} className="bg-purple-900">{opt}</option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <svg className="w-5 h-5 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    ) : field.type === "textarea" ? (
                      <textarea
                        name={field.key}
                        value={form[field.key] || ""}
                        onChange={handleChange}
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl border-2 border-purple-300/30 bg-white/10 text-white placeholder:text-purple-300/50 focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-all backdrop-blur-sm resize-none"
                      />
                    ) : (
                      <input
                        type={field.type}
                        name={field.key}
                        value={form[field.key] || ""}
                        onChange={handleChange}
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                        className="w-full px-4 py-3 rounded-xl border-2 border-purple-300/30 bg-white/10 text-white placeholder:text-purple-300/50 focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-all backdrop-blur-sm"
                      />
                    )}
                  </div>
                ))}
              </div>
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-center gap-4 items-center mt-8">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Profile
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditMode(false);
                    setForm(doctor || {});
                    setPhotoFile(null);
                    setPhotoPreview(doctor?.imageUrl || defaultAvatar);
                  }}
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel
                </button>
              </div>
              
              {/* Messages */}
              {msg && (
                <div className="mt-6 bg-green-500/20 border-2 border-green-500/50 rounded-2xl p-4 backdrop-blur-sm animate-fade-in">
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-green-200 font-semibold text-lg">{msg}</p>
                  </div>
                </div>
              )}
              {error && (
                <div className="mt-6 bg-red-500/20 border-2 border-red-500/50 rounded-2xl p-4 backdrop-blur-sm animate-fade-in">
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <p className="text-red-200 font-semibold text-lg">{error}</p>
                  </div>
                </div>
              )}
            </form>
          ) : (
            <div className="w-full">
              {/* Name Display (Separate) */}
              <div className="mb-6 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-2xl p-4 border border-purple-300/30">
                <label className="flex items-center gap-2 text-purple-200 font-bold mb-2 text-sm">
                  <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Full Name
                </label>
                <div className="bg-white/10 rounded-xl px-4 py-3 text-white font-semibold shadow-inner min-h-[44px] flex items-center">
                  {doctor && doctor.name ? doctor.name : <span className="text-purple-300/50 italic">Not set</span>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {doctorFields.map((field) => (
                  <div key={field.key} className={`flex flex-col ${field.type === 'textarea' ? 'md:col-span-2' : ''}`}>
                    <label className="flex items-center gap-2 text-purple-200 font-bold mb-2 text-sm">
                      {field.key === 'specialty' && (
                        <svg className="w-4 h-4 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      )}
                      {field.key === 'consultationFees' && (
                        <svg className="w-4 h-4 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                      {field.label}
                    </label>
                    <div className={`bg-white/5 rounded-xl px-4 py-3 text-white shadow-inner border border-purple-300/20 ${field.type === 'textarea' ? 'min-h-[80px]' : 'min-h-[44px]'} flex items-center`}>
                      {field.key === "languages"
                        ? (doctor && doctor.languages && doctor.languages.length
                            ? doctor.languages.join(", ")
                            : <span className="text-purple-300/50 italic">Not set</span>)
                        : doctor && doctor[field.key]
                          ? doctor[field.key]
                          : <span className="text-purple-300/50 italic">Not set</span>
                      }
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-center gap-4 items-center mt-10">
                <button
                  type="button"
                  onClick={handleEdit}
                  className="px-10 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Profile
                </button>
              </div>
              
              {/* Messages */}
              {msg && (
                <div className="mt-6 bg-green-500/20 border-2 border-green-500/50 rounded-2xl p-4 backdrop-blur-sm animate-fade-in">
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-green-200 font-semibold text-lg">{msg}</p>
                  </div>
                </div>
              )}
              {error && (
                <div className="mt-6 bg-red-500/20 border-2 border-red-500/50 rounded-2xl p-4 backdrop-blur-sm animate-fade-in">
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <p className="text-red-200 font-semibold text-lg">{error}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateListing;

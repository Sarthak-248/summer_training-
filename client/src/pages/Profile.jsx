import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from 'react-hot-toast';
import Header1 from './header1';

const fields = [
  { key: "age", label: "Age", type: "number" },
  { key: "gender", label: "Gender", type: "select", options: ["Male", "Female", "Other"] },
  { key: "contactNumber", label: "Contact Number", type: "text" },
  { key: "address", label: "Address", type: "text" },
  { key: "bloodGroup", label: "Blood Group", type: "text" },
  { key: "emergencyContact", label: "Emergency Contact", type: "text" },
  { key: "allergies", label: "Allergies", type: "textarea" },
  { key: "chronicIllnesses", label: "Chronic Illnesses", type: "textarea" },
  { key: "currentMedications", label: "Current Medications", type: "textarea" },
];

const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [patient, setPatient] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const userRes = await axios.get("/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(userRes.data);

        // Fetch patient data distinctively
        if (userRes.data.role === "patient") {
          const patientRes = await axios.get("/api/patient/profile", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setPatient(patientRes.data);
          setForm(patientRes.data);
          setPhotoPreview(patientRes.data.photo || defaultAvatar);
        } else if (userRes.data.role === "doctor") {
             // Industry Standard: Unified Profile
             // Redirect doctors immediately to their listing management page
             navigate('/doctor/create-listing', { replace: true });
             return;
        } else {
             // For others, we can set default avatar
             setPhotoPreview(defaultAvatar);
        }
      } catch (err) {
        toast.error("Failed to fetch profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const handleEdit = () => {
    console.log("Edit clicked");
    setEditMode(true);
  };

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

  const handleSave = async (e) => {
    e.preventDefault();
    console.log("Save clicked");
    try {
      const token = localStorage.getItem("token");
      const data = new FormData();
      fields.forEach((field) => data.append(field.key, form[field.key] || ""));
      if (photoFile) data.append("photo", photoFile);

      const res = await axios.put("/api/patient/profile", data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPatient(res.data);
      setForm(res.data);
      setEditMode(false);
      toast.success("Profile updated successfully!");
      setPhotoFile(null);
      setPhotoPreview(res.data.photo || defaultAvatar);
    } catch (err) {
      toast.error("Failed to update profile.");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-black to-purple-900">
        <span className="text-2xl text-white animate-pulse">Loading...</span>
      </div>
    );

  return (
    <>
        <Header1 />
    <div className="min-h-screen flex items-start justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 px-4 pt-9 pb-10 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl top-10 left-10 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl bottom-10 right-10 animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-10 max-w-4xl w-full border border-white/20">
        {/* Profile Header */}
        <div className="flex flex-col items-center mb-10">
          {/* Profile Photo */}
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
            <img
              src={photoPreview || defaultAvatar}
              alt="Profile"
              className="relative w-40 h-40 rounded-full border-4 border-white/30 shadow-2xl object-cover bg-white"
            />
            {editMode && (
              <button
                type="button"
                className="absolute bottom-2 right-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full p-3 shadow-xl hover:from-blue-500 hover:to-indigo-500 transition-all duration-300 transform hover:scale-110"
                onClick={() => fileInputRef.current.click()}
                title="Change Photo"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

          {/* Name, Email, Role */}
          <div className="text-center">
            <h2 className="text-4xl font-black text-white mb-2 drop-shadow-lg">{user.name}</h2>
            <p className="text-blue-200 font-medium text-lg mb-3">{user.email}</p>
            <span className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold text-sm shadow-xl">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </span>
          </div>
        </div>

        {/* Profile Details */}
{!editMode ? (
  <>
    {user.role === 'patient' ? (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
      {fields.map((field) => (
        <div key={field.key} className="flex flex-col items-start">
          <label className="text-blue-200 font-semibold mb-2 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {field.label}
          </label>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 text-white shadow-lg border border-white/20 min-h-[48px] w-full flex items-center">
            {patient && patient[field.key]
              ? patient[field.key]
              : <span className="text-blue-300 italic">Not set</span>}
          </div>
        </div>
      ))}
    </div>
    ) : (
        <div className="text-center mb-8 p-6 bg-white/5 rounded-2xl border border-white/10">
            <h3 className="text-xl text-white font-semibold mb-2">Doctor Profile</h3>
            <p className="text-blue-200 mb-6">Your professional details, clinic info, and appointment settings are managed in your comprehensive profile.</p>
            <button
                onClick={() => navigate('/doctor/create-listing')}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold shadow-lg hover:shadow-purple-500/30 hover:scale-105 transition-all"
            >
                Go to My Profile
            </button>
        </div>
    )}

    {user.role === 'patient' && (
    <div className="flex justify-center mt-10">
      <button
        type="button"
        onClick={handleEdit}
        className="group px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3"
      >
        <svg className="w-6 h-6 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        Edit Profile
      </button>
    </div>
    )}
    
    {user.role === 'doctor' && (
      <div className="flex justify-center mt-10">
      <button
        type="button"
        onClick={() => {
            // For doctor, handleEdit toggles edit mode for the general user fields (Name, Email) if you want them editable here.
            // But since your prompt said "different forms", let's assume this page is ONLY for User Schema details
             // This button can now enable editing for User Name/Email if intended
             alert("To change Name/Email, please contact support or implement User Update API. To change professional details, go to 'Create / Edit Listing'.");
        }}
        className="hidden group px-10 py-4 bg-gradient-to-r from-gray-600 to-slate-600 hover:from-gray-500 hover:to-slate-500 text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3"
      >
         {/* Hidden button for now as User Update API (PUT /api/auth/profile) might not be fully implemented or requested yet. 
             If you want to allow changing name/email here, we need a separate handler. 
             Ideally, 'CreateListing' updates the Doctor model, while 'Profile' updates the User model.
         */}
        Edit Account Info
      </button>
      </div>
    )}
  </>
) : (
  <form onSubmit={handleSave}
    onKeyDown={e => {
      if (e.key === "Enter" && e.target.type !== "textarea") {
        e.preventDefault();
      }
    }}
    className="w-full"
  >
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {fields.map((field) => (
        <div key={field.key} className="flex flex-col items-start">
          <label className="text-purple-200 font-semibold mb-2 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            {field.label}
          </label>
          {field.type === "select" ? (
            <select
              name={field.key}
              value={form[field.key] || ""}
              onChange={handleChange}
              className="w-full p-3 rounded-xl border-2 border-white/20 bg-white/10 backdrop-blur-sm text-white focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all"
            >
              <option value="" className="bg-purple-900">Select</option>
              {field.options.map((opt) => (
                <option key={opt} value={opt} className="bg-purple-900">{opt}</option>
              ))}
            </select>
          ) : field.type === "textarea" ? (
            <textarea
              name={field.key}
              value={form[field.key] || ""}
              onChange={handleChange}
              rows={3}
              className="w-full p-3 rounded-xl border-2 border-white/20 bg-white/10 backdrop-blur-sm text-white placeholder:text-purple-300 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all"
            />
          ) : (
            <input
              type={field.type}
              name={field.key}
              value={form[field.key] || ""}
              onChange={handleChange}
              className="w-full p-3 rounded-xl border-2 border-white/20 bg-white/10 backdrop-blur-sm text-white placeholder:text-purple-300 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all"
            />
          )}
        </div>
      ))}
    </div>
    <div className="flex flex-col sm:flex-row justify-center gap-4 items-center mt-10">
      <button
        type="submit"
        className="w-full sm:w-auto group px-10 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3"
      >
        <svg className="w-6 h-6 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        Save Changes
      </button>
      <button
        type="button"
        onClick={() => {
          setEditMode(false);
          setForm(patient);
          setPhotoFile(null);
          setPhotoPreview(patient?.photo || defaultAvatar);
        }}
        className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-gray-500 to-gray-700 hover:from-gray-600 hover:to-gray-800 text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
        Cancel
      </button>
    </div>
  </form>
)}
      </div>
    </div>
    <Toaster position="top-right" />
    </>
  );
};

export default Profile;
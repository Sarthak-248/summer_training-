import React from 'react';
import { Link } from 'react-router-dom';
import HomeImage from '../assets/dashboardImage.webp';

const DoctorHome = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white font-sans">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row items-center justify-between px-10 py-20 pt-28 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl -top-20 -left-20 animate-pulse"></div>
          <div className="absolute w-96 h-96 bg-pink-500/20 rounded-full blur-3xl -bottom-20 -right-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="md:w-1/2 mb-10 md:mb-0 relative z-10">
          <div className="space-y-6">
            <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 drop-shadow-2xl leading-tight">
              Welcome Back, Doctor!
            </h1>
            <div className="flex items-start gap-3 text-3xl">
              <span className="animate-bounce">👨‍⚕️</span>
              <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>💼</span>
              <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>✨</span>
            </div>
            <p className="text-xl md:text-2xl text-purple-100 leading-relaxed font-light">
              Stay updated with your appointments, review patient history, and manage your day efficiently. This is your medical command center.
            </p>
            <Link
              to="/doctor/scheduled-appointments"
              className="group relative inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white rounded-2xl font-bold text-lg shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              View Appointments
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
          </div>
        </div>
        <div className="md:w-1/2 flex justify-center relative z-10">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-3xl blur-2xl opacity-30 animate-pulse"></div>
            <img
              src={HomeImage}
              alt="Doctor Dashboard"
              className="relative w-100 h-auto rounded-3xl shadow-2xl transform transition-transform duration-500 hover:scale-105 hover:rotate-1 border-4 border-white/20"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorHome;

import React from 'react';
import { Link } from 'react-router-dom';
import HomeImage from '../assets/dashboardImage.webp';

const DoctorHome = () => {
  return (
    <div className="w-full text-white font-sans">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row items-center justify-between px-10 py-16 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl -top-20 -left-20 animate-pulse"></div>
          <div className="absolute w-96 h-96 bg-pink-500/20 rounded-full blur-3xl -bottom-20 -right-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="md:w-1/2 mt-10 mb-10 md:mb-0 relative z-10">
          <div className="space-y-6">
            <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 drop-shadow-2xl leading-tight">
              Welcome Back, Doctor!
            </h1>
            <div className="flex items-center gap-3 text-4xl mt-4">
              <span>👨‍⚕️</span>
              <span>💊</span>
            </div>
            <p className="text-xl  md:text-2xl text-purple-100 leading-relaxed font-light">
              Stay updated with your appointments, review patient history, and manage your day efficiently. This is your medical command center.
            </p>
            <Link
              to="/doctor/scheduled-appointments"
              className="group relative inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white rounded-2xl font-bold text-lg shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="relative z-10">View Appointments</span>
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

      {/* Features Cards Section */}
      <div className="px-10 pb-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1: Grow Your Reach */}
          <div className="group relative p-1 rounded-3xl bg-gradient-to-b from-white/10 to-transparent transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-pink-500/20">
            <div className="relative h-full bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-[22px] p-8 overflow-hidden">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center mb-6 shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Expand Your Reach</h3>
              <p className="text-purple-200/70 text-sm leading-relaxed">Connect with thousands of patients daily and grow your medical practice effortlessly with HealthCard.</p>
            </div>
          </div>

          {/* Card 2: Smart Practice */}
          <div className="group relative p-1 rounded-3xl bg-gradient-to-b from-white/10 to-transparent transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20">
            <div className="relative h-full bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-[22px] p-8 overflow-hidden">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center mb-6 shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Digital Efficiency</h3>
              <p className="text-purple-200/70 text-sm leading-relaxed">Streamline appointments, manage health records, and automate reminders to focus on what matters most.</p>
            </div>
          </div>

          {/* Card 3: Secure Platform */}
          <div className="group relative p-1 rounded-3xl bg-gradient-to-b from-white/10 to-transparent transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/20">
            <div className="relative h-full bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-[22px] p-8 overflow-hidden">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center mb-6 shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Trusted Platform</h3>
              <p className="text-purple-200/70 text-sm leading-relaxed">Experience enterprise-grade security for patient data with our HIPAA-compliant infrastructure.</p>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default DoctorHome;

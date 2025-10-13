import React from "react";
import patientHome from "../assets/dashboardImage.webp";
import { Link } from "react-router-dom";

const PatientHome = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white px-6 py-20 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-blue-500/15 rounded-full blur-3xl -top-20 -left-20 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl -bottom-20 -right-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Main Content */}
      <div className="z-10 max-w-6xl w-full flex flex-col md:flex-row items-center justify-center gap-12 text-center md:text-left">
        {/* Left Section - Text */}
        <div className="space-y-8 max-w-xl flex-1">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 drop-shadow-2xl leading-tight animate-fade-in">
              Welcome to Health Care Companion
            </h1>
            <div className="flex items-center justify-center md:justify-start gap-3 text-3xl">
              <span className="animate-bounce">💖</span>
              <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>🩺</span>
              <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>✨</span>
            </div>
          </div>

          <p className="text-xl md:text-2xl text-blue-100 leading-relaxed font-light">
            Your complete healthcare companion. Connect with trusted doctors, manage appointments seamlessly, and take charge of your health journey.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link 
              to="/patient/appointments"
              className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-bold text-lg shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                📅 Book Appointment
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="flex justify-center md:justify-start pt-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 min-w-[200px]">
              <div className="text-4xl font-bold text-blue-300">24/7</div>
              <div className="text-base text-blue-200 mt-1">Available Support</div>
            </div>
          </div>
        </div>

        {/* Right Section - Illustration */}
        <div className="flex-1 max-w-lg w-full">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-3xl blur-2xl opacity-30 animate-pulse"></div>
            <img
              src={patientHome}
              alt="Health Care Companion Illustration"
              className="relative rounded-3xl shadow-2xl transform transition-transform duration-500 hover:scale-105 hover:rotate-1 border-4 border-white/20"
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
      `}</style>
    </div>
  );
};

export default PatientHome;

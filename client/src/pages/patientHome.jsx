import React from "react";
import patientHome from "../assets/dashboardImage.webp";
import { Link } from "react-router-dom";
import { FaUserMd, FaCalendarCheck, FaFileMedicalAlt, FaVideo } from "react-icons/fa";

const PatientHome = () => {
  return (
    <div className="w-full min-h-screen text-white py-16 relative overflow-hidden flex flex-col items-center">
      
      {/* 🌌 Deep Space Violet Background */}
      <div className="absolute inset-0 bg-slate-900 overflow-hidden pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-violet-700/30 rounded-full blur-[100px] animate-pulse"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-fuchsia-700/30 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
         <div className="absolute top-[40%] left-[60%] w-[300px] h-[300px] bg-indigo-600/20 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Main Content Container */}
      <div className="z-10 w-full max-w-7xl px-6 flex flex-col gap-20">
        
        {/* 🦸 Hero Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          
          {/* Left: Text & CTA */}
          <div className="flex-1 space-y-8 text-center md:text-left">
            <div className="inline-block px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-sm font-medium tracking-wide mb-2 animate-fade-in-up">
              ✨ Your Health, Reimagined
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
              <span className="block text-white mb-2">Welcome to</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 drop-shadow-2xl">
                HealthCard
              </span>
            </h1>

            <p className="text-xl text-slate-300 max-w-2xl font-light leading-relaxed">
              Connect with top-tier doctors, detect health issues early with AI, and manage your medical history—all in one secure place.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-5 justify-center md:justify-start pt-4">
              <Link 
                to="/patient/appointments"
                className="group relative px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-2xl font-bold text-lg shadow-lg hover:shadow-violet-500/50 hover:scale-[1.02] transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-500 skew-x-12 -translate-x-full"></div>
                <span className="relative flex items-center gap-3">
                  <FaCalendarCheck /> Book Appointment
                </span>
              </Link>

              <Link 
                to="/patient/analyze-report"
                className="group relative px-8 py-4 bg-gradient-to-r from-fuchsia-600 to-pink-600 rounded-2xl font-bold text-lg shadow-lg hover:shadow-fuchsia-500/50 hover:scale-[1.02] transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-500 skew-x-12 -translate-x-full"></div>
                <span className="relative flex items-center gap-3">
                  <FaFileMedicalAlt /> Analyze Report
                </span>
              </Link>
            </div>
          </div>

          {/* Right: Illustration */}
          <div className="flex-1 w-full max-w-lg relative group perspective-1000">
             <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-pink-600 rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
             <img
              src={patientHome}
              alt="Dashboard Preview"
              className="relative rounded-3xl shadow-2xl border border-white/10 bg-slate-800/50 backdrop-blur-xl transform transition-transform duration-500 hover:scale-[1.01]"
            />
          </div>
        </div>

        {/* 💠 Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12">
           <FeatureCard 
             icon={<FaUserMd className="text-4xl text-cyan-400" />}
             title="Find Specialist"
             desc="Browse verified doctors and book consultations instantly."
             link="/patient/book-appointment"
             color="cyan"
           />
           <FeatureCard 
             icon={<FaFileMedicalAlt className="text-4xl text-fuchsia-400" />}
             title="AI Report Analysis"
             desc="Upload your lab reports and get instant AI-powered insights."
             link="/patient/analyze-report"
             color="fuchsia"
           />
           <FeatureCard 
             icon={<FaVideo className="text-4xl text-violet-400" />}
             title="Teleconsultation"
             desc="Secure video calls with your doctor from the comfort of home."
             link="/patient/appointments"
             color="violet"
           />
        </div>

      </div>
      
      {/* Simple Custom Styles for Animations */}
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc, link, color }) => (
  <Link to={link} className={`group relative p-8 rounded-3xl bg-slate-800/40 border border-white/5 transition-all duration-300 overflow-hidden hover:scale-105 hover:shadow-2xl hover:shadow-black/40 hover:border-${color}-500/30`}>
    <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}-500/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-${color}-500/30 transition-all duration-500`}></div>
    
    <div className="relative z-10 flex flex-col items-start gap-4">
      <div className={`p-3 bg-white/5 rounded-2xl group-hover:scale-110 transition-transform duration-300 group-hover:bg-${color}-500/20`}>
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-300 transition-colors">
        {title}
      </h3>
      <p className="text-slate-400 leading-relaxed">
        {desc}
      </p>
    </div>
  </Link>
);

export default PatientHome;

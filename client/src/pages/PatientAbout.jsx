import React from "react";

const PatientAbout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0218] via-[#1a043a] to-black p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Pink Heading */}
        <h1 className="text-4xl font-bold text-center 
                       bg-gradient-to-r from-pink-400 via-pink-500 to-fuchsia-500 
                       bg-clip-text text-transparent mb-8">
          About HealthCard
        </h1>

        {/* Card / Form */}
        <div className="bg-gradient-to-br from-[#16062f] via-[#2a0a52] to-[#0b0218] 
                        border border-violet-700/40 rounded-xl 
                        shadow-[0_0_40px_rgba(236,72,153,0.35)] 
                        p-6 space-y-5">
          
          <p className="text-lg text-violet-100 leading-relaxed">
            Welcome to <span className="font-semibold text-white">HealthCard</span>, 
            a secure, patient-focused digital healthcare platform designed to help 
            you manage your health information with ease and confidence.
          </p>

          <p className="text-lg text-violet-100 leading-relaxed">
            HealthCard enables you to securely store and access your medical records, 
            view laboratory reports, track health history, and manage appointments — 
            all from a single, easy-to-use dashboard.
          </p>

          <p className="text-lg text-violet-100 leading-relaxed">
            The platform is built to simplify healthcare by reducing paperwork, 
            preventing loss of important reports, and ensuring your medical data 
            is available whenever you need it.
          </p>

          <p className="text-lg text-violet-100 leading-relaxed">
            Your privacy and data security are our highest priorities. Patient data 
            is protected using secure authentication methods and encrypted storage 
            to maintain confidentiality at all times.
          </p>

          <p className="text-lg text-violet-200 leading-relaxed">
            <span className="font-semibold text-white">Disclaimer:</span> HealthCard 
            is intended to support personal health management and record keeping. 
            It does not provide medical diagnosis or treatment and should not be 
            considered a substitute for professional medical advice.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PatientAbout;

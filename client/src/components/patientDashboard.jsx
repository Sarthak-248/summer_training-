import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

 // ✅ Required to use navigate()


const questions = [
  "Do you have any allergies?",
  "Are you currently taking any medications (if any, write below)?",
  "Do you have any chronic illnesses?",
  "Have you had any surgeries before?",
  "Do you have a family history of any diseases?",
  "Type 'I will comeback stronger!!'"
];

const PatientDashboard = () => {
    const navigate = useNavigate(); // ✅ This is correct placement
  const [answers, setAnswers] = useState({});
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [input, setInput] = useState("");
  const [animate, setAnimate] = useState(false);
     

  useEffect(() => {
    setAnimate(true);
    const timeout = setTimeout(() => setAnimate(false), 500);
    return () => clearTimeout(timeout);
  }, [currentQIndex]);

  const handleAnswer = () => {
    if (input.trim() === "") return;

    setAnswers(prev => ({
      ...prev,
      [questions[currentQIndex]]: input.trim()
    }));

    setInput("");

    if (currentQIndex < questions.length - 1){
      setCurrentQIndex(currentQIndex + 1);
    } else {
      saveMedicalHistory();
    }
  };

  
const saveMedicalHistory = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.post("http://localhost:5000/api/patient/post-history",
      { answers },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    navigate("/patient/home");
    alert("Medical history saved! Thank you.");
    setCurrentQIndex(0);
    setAnswers({});
   

  } catch (err) {
    console.error("Error saving medical history:", err);
    alert("An error occurred while saving your data.");
  }
};

  const progressPercent = ((currentQIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl top-0 left-0 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl bottom-0 right-0 animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 max-w-2xl w-full mx-auto mt-20 p-10 bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mb-4">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-4xl font-black text-white mb-2 drop-shadow-lg">
            Medical History
          </h2>
          <p className="text-blue-200 text-lg">Help us understand your health better</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-blue-200 mb-2">
            <span>Question {currentQIndex + 1} of {questions.length}</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden shadow-inner">
            <div
              className="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
            </div>
          </div>
        </div>

        {/* Question Card */}
        <div
          className={`relative mb-8 p-6 rounded-2xl bg-gradient-to-br from-white to-blue-50 shadow-xl transition-all duration-500 ease-out ${
            animate ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-70 translate-y-2"
          }`}
          style={{ willChange: "transform, opacity" }}
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
              {currentQIndex + 1}
            </div>
            <p className="text-xl font-semibold text-gray-800 leading-relaxed flex-1">
              {questions[currentQIndex]}
            </p>
          </div>
          <div className="absolute -bottom-3 left-12 w-6 h-6 bg-white rotate-45 shadow-lg"></div>
        </div>

        {/* Input Field */}
        <div className="mb-6">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAnswer()}
            placeholder="Type your answer here..."
            className="w-full rounded-2xl border-2 border-blue-300/50 bg-white/90 backdrop-blur-sm px-6 py-4 text-lg focus:outline-none focus:ring-4 focus:ring-blue-400/50 focus:border-blue-400 transition-all duration-300 shadow-lg placeholder:text-gray-400"
            autoFocus
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center gap-4">
          <button
            onClick={() => {
              setCurrentQIndex(0);
              setAnswers({});
              setInput("");
            }}
            className="flex items-center gap-2 text-blue-200 hover:text-white font-semibold transition-all duration-200 hover:scale-105"
            aria-label="Reset answers"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset
          </button>

          <button
            onClick={handleAnswer}
            disabled={!input.trim()}
            className="group relative px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-blue-600 disabled:hover:to-indigo-600 overflow-hidden"
            aria-label={currentQIndex < questions.length - 1 ? "Next question" : "Submit answers"}
          >
            <span className="relative z-10 flex items-center gap-2">
              {currentQIndex < questions.length - 1 ? "Next" : "Submit"}
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </div>

        {/* Helper Text */}
        <div className="mt-6 text-center text-blue-200 text-sm">
          Press Enter to continue or click the button
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default PatientDashboard;

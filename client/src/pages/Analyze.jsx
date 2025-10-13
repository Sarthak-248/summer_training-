import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Analyze() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState("");
  const [showBotMessage, setShowBotMessage] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (result === "Low" || result === "Mild") {
      setShowBotMessage(true);
      const timeout = setTimeout(() => {
        const iframe = document.querySelector('iframe[src*="chatling.ai"]');
        if (iframe) {
          iframe.style.animation = "pulseScale 2.5s ease-in-out infinite";
          iframe.style.transformOrigin = "center";
        }
      }, 1000);
      return () => {
        clearTimeout(timeout);
        const iframe = document.querySelector('iframe[src*="chatling.ai"]');
        if (iframe) {
          iframe.style.animation = "";
        }
      };
    } else {
      setShowBotMessage(false);
      const iframe = document.querySelector('iframe[src*="chatling.ai"]');
      if (iframe) {
        iframe.style.animation = "";
      }
    }
  }, [result]);

  const handleUpload = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    setShowBotMessage(false);

    const formData = new FormData(e.target);

    try {
      const res = await fetch("http://localhost:5000/api/patient/analyze-report", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.statusText}`);
      }

      const data = await res.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setResult(data.severity);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File too large. Maximum size is 5MB.");
      e.target.value = null;
      setFileName("");
      return;
    }

    if (!["application/pdf", "image/jpeg", "image/png"].includes(file.type)) {
      alert("Unsupported file type. Upload PDF or image (JPG, PNG).");
      e.target.value = null;
      setFileName("");
      return;
    }

    setFileName(file.name);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 py-12 px-4 sm:px-6 lg:px-8">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl top-0 left-0 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl bottom-0 right-0 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <form
        onSubmit={handleUpload}
        className="relative z-10 max-w-xl w-full bg-white/10 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border border-white/20"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mb-4 shadow-xl">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-4xl font-black text-white mb-2">
            Analyze Your Report
          </h2>
          <p className="text-blue-200 text-lg">
            AI-powered health report analysis
          </p>
        </div>

        {/* File Upload Area */}
        <div className="mb-6">
          <label
            htmlFor="file-upload"
            className="group relative block w-full p-8 border-2 border-dashed border-blue-300/50 rounded-2xl bg-white/5 hover:bg-white/10 hover:border-blue-400 transition-all duration-300 cursor-pointer"
          >
            <input
              id="file-upload"
              type="file"
              name="report"
              accept=".pdf,.jpeg,.jpg,.png"
              required
              onChange={handleFileChange}
              className="sr-only"
            />
            <div className="text-center">
              <svg className="mx-auto h-16 w-16 text-blue-300 group-hover:text-blue-200 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="mt-4 text-lg font-semibold text-white">
                {fileName ? 'Change File' : 'Click to upload'}
              </p>
              <p className="mt-2 text-sm text-blue-200">
                PDF, JPEG, JPG, or PNG (max 5MB)
              </p>
            </div>
          </label>
          
          {fileName && (
            <div className="mt-4 p-4 bg-white/10 rounded-xl border border-white/20 flex items-center gap-3">
              <svg className="w-6 h-6 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-white font-medium truncate">{fileName}</span>
            </div>
          )}
        </div>

        {/* Result Display */}
        {result && (
          <div className={`mb-6 p-6 rounded-2xl border-2 ${
            result === "Severe" || result === "High" 
              ? "bg-red-500/20 border-red-400" 
              : result === "Mild"
              ? "bg-cyan-500/20 border-cyan-400"
              : "bg-green-500/20 border-green-400"
          }`}>
            <div className="flex items-center gap-3 mb-2">
              {(result === "Severe" || result === "High") && (
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              )}
              {result === "Mild" && (
                <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {result === "Low" && (
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <div>
                <p className="text-white/70 text-sm font-medium">Severity Status</p>
                <p className="text-2xl font-bold text-white">{result}</p>
              </div>
            </div>
            
            {(result === "Severe" || result === "High") && (
              <p className="text-white/90 text-sm mt-3">
                ⚠️ We recommend consulting with a doctor as soon as possible
              </p>
            )}
            {result === "Mild" && (
              <p className="text-white/90 text-sm mt-3">
                ℹ️ Minor concerns detected. Consider consulting if symptoms persist
              </p>
            )}
            {result === "Low" && (
              <p className="text-white/90 text-sm mt-3">
                ✅ Your report looks good! Maintain a healthy lifestyle
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            type="submit"
            disabled={loading || !fileName}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-gray-500 disabled:to-gray-600 text-white rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-3 group"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing Report...
              </>
            ) : (
              <>
                <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                Analyze Report
              </>
            )}
          </button>

          {(result === "High" || result === "Severe") && (
            <button
              type="button"
              onClick={() => navigate("/patient/appointments")}
              className="w-full py-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-3 animate-pulse-slow"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Consult a Doctor Now
            </button>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-4 bg-red-500/20 border border-red-400 rounded-xl flex items-start gap-3">
            <svg className="w-6 h-6 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-red-200 font-semibold">Error</p>
              <p className="text-red-100 text-sm">{error}</p>
            </div>
          </div>
        )}
      </form>

      {/* Bot Message */}
      {showBotMessage && (
        <div className="fixed bottom-24 right-6 bg-white rounded-2xl p-4 shadow-2xl border-2 border-blue-400 max-w-xs z-50 animate-bounce-slow">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <p className="text-gray-900 font-semibold text-sm">
              Solve health queries with our AI bot! 🤖
            </p>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes animate-bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        .animate-bounce-slow {
          animation: animate-bounce-slow 3s infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}

import React, { useState } from "react";
import api from "../utils/api";
import { useNavigate, Link } from "react-router-dom";
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';
import AppLogo from '../assets/logo.svg';

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await api.post(`/api/auth/login`, { email, password });
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("role", res.data.user.role);
            if (res.data.user.role === "doctor" && res.data.user.doctorId) {
                localStorage.setItem("doctorId", res.data.user.doctorId);
                console.log("[LOGIN] Set doctorId in localStorage:", res.data.user.doctorId);
            }
            if (res.data.user.role === "patient" && res.data.user._id) {
                localStorage.setItem("patientId", res.data.user._id);
            }

            showSuccessToast('Welcome Back!', 'Successfully logged in to your account.');

            if (res.data.user.role === "patient") {
                navigate("/patient/home");
            } else if (res.data.user.role === "doctor") {
                navigate("/doctor/home");
            } else {
                setError("Invalid user role");
                showErrorToast("Invalid user role");
            }
        } catch (error) {
            console.error("Login Error:", error);
            setError(error.response?.data?.error || "Invalid credentials");
            showErrorToast(error.response?.data?.error || "Invalid credentials");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-[#1a0036] via-[#240046] to-[#7B2CBF] p-4 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0">
                <div className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl top-0 left-0 animate-pulse"></div>
                <div className="absolute w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl bottom-0 right-0 animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="relative z-10 bg-white/10 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-white/20 w-full max-w-md">
                {/* Header with Icon */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-28 h-28 mb-4 transition-transform hover:scale-105 duration-300">
                        <img src={AppLogo} alt="HealthCard Logo" className="w-full h-full object-contain drop-shadow-2xl" />
                    </div>
                    <h2 className="text-4xl font-black text-white drop-shadow-lg">Welcome Back</h2>
                    <p className="text-white mt-2">Sign in to your account</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl backdrop-blur-sm">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-red-200 text-sm font-semibold">{error}</p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleLogin} className="flex flex-col gap-5">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                            </svg>
                        </div>
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full pl-12 pr-4 py-3.5 border-2 border-blue-300/30 rounded-xl bg-white/10 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-white placeholder-blue-200 transition-all duration-300"
                        />
                    </div>

                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full pl-12 pr-4 py-3.5 border-2 border-blue-300/30 rounded-xl bg-white/10 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-white placeholder-blue-200 transition-all duration-300"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="group relative mt-4 font-bold py-4 bg-pink-400 hover:bg-pink-500 text-white rounded-xl shadow-2xl hover:shadow-pink-400/50 transition-all duration-300 transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden"
                    >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Logging in...
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                    </svg>
                                    Sign In
                                </>
                            )}
                        </span>
                        {/* Removed blue hover overlay to keep button pink on hover */}
                    </button>
                </form>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-blue-200 text-sm">
                        Don't have an account?{" "}
                        <Link to="/signup" className="text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-2 transition-colors">
                            Sign up here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppLogo from "../assets/logo.svg";
import { Toaster } from 'react-hot-toast';

const LandingPage = () => {
    const navigate = useNavigate();
    const handleNavigation = (path) => navigate(path);

    // Testimonial slider state
    const testimonials = [
        {
            text: "The instant health insights have been incredibly helpful. I can understand my reports better now!",
            author: "Sarah Johnson",
            photo: "https://randomuser.me/api/portraits/women/44.jpg"
        },
        {
            text: "Connecting with specialist doctors has never been easier. Great platform!",
            author: "Dr. Michael Chen",
            photo: "https://randomuser.me/api/portraits/men/32.jpg"
        },
        {
            text: "The AI-powered analysis helps me make informed decisions about my health.",
            author: "Robert Smith",
            photo: "https://randomuser.me/api/portraits/men/65.jpg"
        },
        {
            text: "I love the seamless experience and beautiful design. Highly recommended!",
            author: "Priya Patel",
            photo: "https://randomuser.me/api/portraits/women/68.jpg"
        },
        {
            text: "The reminders and scheduling features make my life so much easier.",
            author: "Alex Lee",
            photo: "https://randomuser.me/api/portraits/men/41.jpg"
        }
    ];
    const [currentTestimonial, setCurrentTestimonial] = useState(0);
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
        }, 3500);
        return () => clearInterval(interval);
    }, [testimonials.length]);

    return (
        <div className="relative min-h-screen flex flex-col bg-gradient-to-br from-[#1a0036] via-[#240046] to-[#7B2CBF] animate-fadeIn">
            <Toaster position="top-right" />
            {/* Animated SVG background */}
            <div className="absolute inset-0 overflow-hidden">
                <svg width="100vw" height="100vh" className="absolute w-full h-full" viewBox="0 0 1920 1080" fill="none">
                    <defs>
                        <radialGradient id="mainGradient" cx="50%" cy="50%" r="80%" fx="50%" fy="50%">
                            <stop offset="0%" stopColor="#E0AAFF" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#240046" stopOpacity="0.1" />
                        </radialGradient>
                    </defs>
                    <ellipse cx="960" cy="540" rx="900" ry="400" fill="url(#mainGradient)" />
                </svg>
                <div className="absolute w-[600px] h-[600px] bg-[#7B2CBF]/30 rounded-full blur-[120px] top-[-100px] left-[-100px] animate-blob"></div>
                <div className="absolute w-[500px] h-[500px] bg-[#E0AAFF]/20 rounded-full blur-[100px] bottom-[-100px] right-[-100px] animate-blob animation-delay-2000"></div>
            </div>

            {/* Logo & Brand */}
            <div className="absolute top-8 left-8 flex items-center gap-2 z-20 animate-fade-in-down">
                <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-xl p-2 shadow-lg border border-white/10 transition-transform hover:scale-110 duration-300">
                    <img src={AppLogo} alt="HealthCard Logo" className="w-full h-full object-contain drop-shadow-lg" />
                </div>
                <span className="text-3xl font-extrabold bg-gradient-to-r from-[#E0AAFF] to-white bg-clip-text text-transparent drop-shadow-md tracking-wide">
                    HealthCard
                </span>
            </div>

            {/* Hero Section */}
            <div className="text-center text-white px-6 pt-36 pb-20 relative z-10 space-y-12">
                <div className="space-y-8">
                    <h1 className="text-5xl md:text-7xl font-extrabold drop-shadow-xl text-pink-400 animate-fade-in">
                        Your Health, Our Mission
                    </h1>
                    <p className="text-2xl md:text-3xl max-w-3xl mx-auto drop-shadow-md text-[#E0AAFF] animate-fade-in">
                        AI-powered health monitoring, instant report analysis, and expert consultations—all in one place.
                    </p>
                </div>
                <div className="absolute top-8 right-8 flex gap-4 z-10">
                    <button 
                        className="px-8 py-3 bg-pink-400 hover:bg-pink-500 text-white font-bold rounded-xl shadow-lg hover:shadow-pink-400/30 transition duration-500 transform hover:scale-105 animate-pulse"
                        style={{ marginTop: '-2rem' }}
                        onClick={() => handleNavigation("/login")}
                    >
                        Login
                    </button>
                    <button 
                        className="px-8 py-3 bg-pink-400 hover:bg-pink-500 text-white font-bold rounded-xl shadow-lg hover:shadow-pink-400/30 transition duration-500 transform hover:scale-105 animate-pulse"
                        style={{ marginTop: '-2rem' }}
                        onClick={() => handleNavigation("/signup")}
                    >
                        Sign Up
                    </button>
                </div>
                {/* Feature Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-12">
                    {/* Card 1 */}
                    <div className="bg-gradient-to-br from-[#1a0036] via-[#240046] to-[#7B2CBF] p-10 rounded-2xl shadow-xl flex flex-col items-center justify-between min-h-[260px] h-full max-h-[320px] w-full transform hover:scale-105 transition duration-500 hover:shadow-lg hover:shadow-[#E0AAFF]/20 border border-[#7B2CBF]/30 animate-slide-up">
                        <div className="text-5xl mb-6">📋</div>
                        <h3 className="text-2xl font-semibold mb-4 text-white">Analyze reports</h3>
                        <p className="text-blue-100 text-center">Get Instant Clarity on Your Health!</p>
                    </div>
                    {/* Card 2 */}
                    <div className="bg-gradient-to-br from-[#1a0036] via-[#240046] to-[#7B2CBF] p-10 rounded-2xl shadow-xl flex flex-col items-center justify-between min-h-[260px] h-full max-h-[320px] w-full transform hover:scale-105 transition duration-500 hover:shadow-lg hover:shadow-[#E0AAFF]/20 border border-[#7B2CBF]/30 animate-slide-up animation-delay-200">
                        <div className="text-5xl mb-6">👨‍⚕️</div>
                        <h3 className="text-2xl font-semibold mb-4 text-white">Expert Doctors</h3>
                        <p className="text-blue-100 text-center">Connect with experienced healthcare professionals</p>
                    </div>
                    {/* Card 3 */}
                    <div className="bg-gradient-to-br from-[#1a0036] via-[#240046] to-[#7B2CBF] p-10 rounded-2xl shadow-xl flex flex-col items-center justify-between min-h-[260px] h-full max-h-[320px] w-full transform hover:scale-105 transition duration-500 hover:shadow-lg hover:shadow-[#E0AAFF]/20 border border-[#7B2CBF]/30 animate-slide-up animation-delay-400">
                        <div className="text-5xl mb-6">💡</div>
                        <h3 className="text-2xl font-semibold mb-4 text-white">Health Insights</h3>
                        <p className="text-blue-100 text-center">Instant Query Support!</p>
                    </div>
                </div>
            </div>
           
            {/* How It Works Section */}
            <div className="text-white px-6 py-20 relative z-10 bg-blue-950/30">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-[#E0AAFF] to-[#7B2CBF]">
                        How It Works
                    </h2>
                    <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-0">
                        {/* Step Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 w-full">
                            {/* Step 1 */}
                            <div className="bg-gradient-to-br from-[#1a0036] via-[#240046] to-[#7B2CBF] p-8 rounded-2xl shadow-xl flex flex-col items-center">
                                <div className="mb-4">
                                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Sign Up</h3>
                                <p className="text-blue-100 text-center">Create your account in minutes</p>
                            </div>
                            {/* Step 2 */}
                            <div className="bg-gradient-to-br from-[#1a0036] via-[#240046] to-[#7B2CBF] p-8 rounded-2xl shadow-xl flex flex-col items-center">
                                <div className="mb-4">
                                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 20v-6m8 6V4a2 2 0 00-2-2H6a2 2 0 00-2 2v16" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Upload Reports</h3>
                                <p className="text-blue-100 text-center">Share your medical reports securely</p>
                            </div>
                            {/* Step 3 */}
                            <div className="bg-gradient-to-br from-[#1a0036] via-[#240046] to-[#7B2CBF] p-8 rounded-2xl shadow-xl flex flex-col items-center">
                                <div className="mb-4">
                                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2a4 4 0 014-4h2a4 4 0 014 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Get Analysis</h3>
                                <p className="text-blue-100 text-center">Receive detailed health insights</p>
                            </div>
                            {/* Step 4 */}
                            <div className="bg-gradient-to-br from-[#1a0036] via-[#240046] to-[#7B2CBF] p-8 rounded-2xl shadow-xl flex flex-col items-center">
                                <div className="mb-4">
                                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7a4 4 0 018 0v4a4 4 0 01-8 0V7z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 17v2m0 0h-2m2 0h2" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Consult Doctors</h3>
                                <p className="text-blue-100 text-center">Connect with specialists</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Testimonials Section */}
            <div className="text-white px-6 py-20 relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-white">
                    What Our Users Say
                </h2>
                <div className="flex justify-center items-center">
                    <div className="relative w-full max-w-xl mx-auto">
                        <div className="overflow-hidden">
                            <div className="transition-all duration-700 ease-in-out">
                                <div className="bg-[#240046]/80 p-10 rounded-2xl shadow-lg flex flex-col items-center animate-fade-in">
                                    <div className="flex items-center justify-center mb-6">
                                        <button
                                            className="mr-4 bg-[#7B2CBF] hover:bg-[#E0AAFF] text-white rounded-full w-10 h-10 flex items-center justify-center shadow-md transition"
                                            onClick={() => setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
                                            aria-label="Previous testimonial"
                                        >
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                            </svg>
                                        </button>
                                        <img
                                            src={testimonials[currentTestimonial].photo}
                                            alt={testimonials[currentTestimonial].author}
                                            className="w-16 h-16 rounded-full border-4 border-[#E0AAFF] object-cover shadow-lg"
                                        />
                                        <button
                                            className="ml-4 bg-[#7B2CBF] hover:bg-[#E0AAFF] text-white rounded-full w-10 h-10 flex items-center justify-center shadow-md transition"
                                            onClick={() => setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)}
                                            aria-label="Next testimonial"
                                        >
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </div>
                                    <p className="text-xl md:text-2xl text-[#E0AAFF] mb-8 text-center font-medium min-h-[80px]">
                                        "{testimonials[currentTestimonial].text}"
                                    </p>
                                    <div className="font-semibold text-white text-lg">- {testimonials[currentTestimonial].author}</div>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-center mt-6 gap-2">
                            {testimonials.map((_, idx) => (
                                <button
                                    key={idx}
                                    className={`w-3 h-3 rounded-full border border-[#E0AAFF] transition-all duration-300 ${currentTestimonial === idx ? 'bg-[#E0AAFF]' : 'bg-[#240046]'}`}
                                    onClick={() => setCurrentTestimonial(idx)}
                                    aria-label={`Show testimonial ${idx + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="text-white px-6 py-20 relative z-10 bg-gradient-to-br from-[#1a0036] via-[#240046] to-[#7B2CBF]">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-8">
                        Ready to Take Control of Your Health?
                    </h2>
                    <p className="text-xl mb-12 text-blue-100">
                        Join thousands of users who trust our platform for their healthcare needs.
                    </p>
                    <button 
                        className="px-8 py-4 bg-pink-400 text-white font-semibold rounded-lg shadow-lg hover:bg-pink-500 transition duration-500 transform hover:scale-105 hover:shadow-pink-400/30"
                        onClick={() => handleNavigation("/signup")}
                    >
                        Get Started Today
                    </button>
                </div>
            </div>

            {/* Footer */}
            <footer className="text-white relative z-10 border-t border-white/10 bg-blue-950/50 backdrop-blur-sm">
                {/* Main Footer Content */}
                <div className="max-w-7xl mx-auto px-6 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 bg-gradient-to-br from-[#1a0036] via-[#240046] to-[#7B2CBF] rounded-2xl p-8">
                        {/* Company Info */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-orange-400">Health Monitor</h3>
                            <p className="text-blue-100 text-sm">Your trusted platform for health monitoring and professional medical consultations.</p>
                            <div className="flex space-x-4 pt-2">
                                {/* Social Media Icons */}
                                <a href="#" className="text-blue-100 hover:text-orange-400 transition-colors">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                                </a>
                                <a href="#" className="text-blue-100 hover:text-orange-400 transition-colors">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                                </a>
                                <a href="#" className="text-blue-100 hover:text-orange-400 transition-colors">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/></svg>
                                </a>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                            <ul className="space-y-2 text-blue-100">
                                <li><a href="#" className="hover:text-orange-400 transition-colors">Home</a></li>
                                <li><a href="#" className="hover:text-orange-400 transition-colors">About Us</a></li>
                                <li><a href="#" className="hover:text-orange-400 transition-colors">Services</a></li>
                                <li><a href="#" className="hover:text-orange-400 transition-colors">Find a Doctor</a></li>
                                <li><a href="#" className="hover:text-orange-400 transition-colors">Health Blog</a></li>
                            </ul>
                        </div>

                        {/* Services */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Our Services</h3>
                            <ul className="space-y-2 text-blue-100">
                                <li><a href="#" className="hover:text-orange-400 transition-colors">Health Monitoring</a></li>
                                <li><a href="#" className="hover:text-orange-400 transition-colors">Online Consultation</a></li>
                                <li><a href="#" className="hover:text-orange-400 transition-colors">Report Analysis</a></li>
                                <li><a href="#" className="hover:text-orange-400 transition-colors">Emergency Support</a></li>
                                <li><a href="#" className="hover:text-orange-400 transition-colors">Mental Health</a></li>
                            </ul>
                        </div>

                        {/* Contact Info */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
                            <ul className="space-y-3 text-blue-100">
                                <li className="flex items-center space-x-3">
                                    <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                                    </svg>
                                    <span>123 Health Street, Medical City</span>
                                </li>
                                <li className="flex items-center space-x-3">
                                    <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                                    </svg>
                                    <span>support@healthmonitor.com</span>
                                </li>
                                <li className="flex items-center space-x-3">
                                    <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                                    </svg>
                                    <span>+1 234 567 8900</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Bottom Footer */}
                <div className="border-t border-white/10 bg-blue-950/70">
                    <div className="bg-gradient-to-br from-[#1a0036] via-[#240046] to-[#7B2CBF] max-w-7xl mx-auto px-6 py-6">
                        <div className="md:flex md:items-center md:justify-between text-sm">
                            <div className="text-blue-100">
                                © 2024 Health Monitoring & Consultations. All rights reserved.
                            </div>
                            <div className="flex space-x-6 mt-4 md:mt-0">
                                <a href="#" className="text-blue-100 hover:text-orange-400 transition-colors">Privacy Policy</a>
                                <a href="#" className="text-blue-100 hover:text-orange-400 transition-colors">Terms of Service</a>
                                <a href="#" className="text-blue-100 hover:text-orange-400 transition-colors">Cookie Policy</a>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
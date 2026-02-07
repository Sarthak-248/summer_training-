import React from 'react';
import Header1 from '../pages/header1';//pariient navbar
import { Outlet } from 'react-router-dom';

const PatientLayout = () => (
  <div className="min-h-screen bg-gradient-to-b from-purple-950 via-black to-violet-950 overflow-hidden relative">
    {/* Animated Background Elements */}
    <div className="fixed inset-0 z-0 pointer-events-none">
      <div className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl top-0 left-0 animate-pulse"></div>
      <div className="absolute w-96 h-96 bg-pink-500/20 rounded-full blur-3xl bottom-0 right-0 animate-pulse" style={{ animationDelay: '1s' }}></div>
    </div>
    <div className="relative z-10 w-full h-full">
      <Header1 />
      <main className="relative z-0 pt-16">
        <Outlet />
      </main>
    </div>
  </div>
);

export default PatientLayout;

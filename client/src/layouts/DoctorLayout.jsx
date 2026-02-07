import React from 'react';
import Header2 from '../pages/header2';//dooctor navbar

import { Outlet } from 'react-router-dom';

const DoctorLayout = () => (
  <div className="min-h-screen bg-gradient-to-b from-purple-950 via-black to-violet-950">
    <Header2 />
    <main className="relative z-0 pt-16">
      <Outlet />
    </main>
  </div>
);

export default DoctorLayout;

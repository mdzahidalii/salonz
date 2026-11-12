import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function CustomerLayout({ children, currentView, setCurrentView }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#2D241E] font-sans">
      {/* Customer Header Navigation */}
      <Navbar currentView={currentView} setCurrentView={setCurrentView} />

      {/* Main Customer Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Customer Website Footer */}
      <Footer setCurrentView={setCurrentView} />
    </div>
  );
}


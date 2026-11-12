import React from 'react';
import { useSalon } from '../context/SalonContext';
import { Sparkles, MapPin, Phone, Mail, Globe, Share2 } from 'lucide-react';

export default function Footer({ setCurrentView }) {
  const { salonInfo, openBookingModal } = useSalon();

  return (
    <footer className="bg-[#2C1C11] text-[#EFE6DC] pt-16 pb-12 border-t border-[#4A2E1B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-[#3D281A]">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#8B5E3C] text-white flex items-center justify-center font-serif text-xl font-bold">
                A
              </div>
              <span className="font-serif text-2xl tracking-widest text-[#FAF7F2] font-semibold">
                A U R A
              </span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              {salonInfo.tagline} A tranquil refuge for hair styling, skin therapies, and bespoke wellness.
            </p>
            <div className="flex items-center gap-3 text-stone-400">
              <a href="#" className="w-8 h-8 rounded-full bg-[#3D281A] flex items-center justify-center hover:text-white transition" title="Social">
                <Globe className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-[#3D281A] flex items-center justify-center hover:text-white transition" title="Share">
                <Share2 className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-semibold tracking-wider uppercase text-[#D4A373]">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <button onClick={() => setCurrentView('customer')} className="hover:text-white transition">
                  Treatment Menu
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('customer-dashboard')} className="hover:text-white transition">
                  Customer Portal &amp; Bookings
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('worker-dashboard')} className="hover:text-white transition">
                  Staff &amp; Stylist Queue
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('login')} className="hover:text-white transition text-[#D4A373] font-medium">
                  Staff &amp; Owner Portal Login
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('owner-dashboard')} className="hover:text-white transition">
                  Owner Dashboard Console
                </button>
              </li>
            </ul>
          </div>

          {/* Working Hours */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-semibold tracking-wider uppercase text-[#D4A373]">
              Sanctuary Hours
            </h4>
            <div className="text-xs text-stone-400 space-y-1.5">
              <p>
                <strong className="text-stone-300">Mon &ndash; Fri:</strong> {salonInfo.workingHours?.weekdays}
              </p>
              <p>
                <strong className="text-stone-300">Sat &ndash; Sun:</strong> {salonInfo.workingHours?.weekends}
              </p>
              <p className="text-[11px] text-[#D4A373] mt-2">
                &bull; Advance reservation recommended
              </p>
            </div>
          </div>

          {/* Concierge & Reservation */}
          <div className="space-y-4">
            <h4 className="font-serif text-sm font-semibold tracking-wider uppercase text-[#D4A373]">
              Concierge
            </h4>
            <div className="text-xs text-stone-400 space-y-2">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#8B5E3C] shrink-0 mt-0.5" />
                <span>{salonInfo.address}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#8B5E3C] shrink-0" />
                <span>{salonInfo.phone}</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#8B5E3C] shrink-0" />
                <span>{salonInfo.email}</span>
              </p>
            </div>

            <button
              onClick={() => openBookingModal()}
              className="w-full bg-[#8B5E3C] hover:bg-[#A3704C] text-white py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition shadow-sm flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Book Appointment
            </button>
          </div>

        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>&copy; {new Date().getFullYear()} AURA Salon &amp; Aesthetic Atelier. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="hover:text-stone-400 transition cursor-pointer">Privacy Charter</span>
            <span>&bull;</span>
            <span className="hover:text-stone-400 transition cursor-pointer">Terms of Rituals</span>
            <span>&bull;</span>
            <span className="hover:text-stone-400 transition cursor-pointer">Security Standards</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

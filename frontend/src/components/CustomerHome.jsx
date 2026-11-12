import React, { useState } from 'react';
import { useSalon } from '../context/SalonContext';
import { 
  Sparkles, 
  Clock, 
  Check, 
  Star, 
  Shield, 
  Leaf, 
  Award, 
  ArrowRight,
  HeartHandshake
} from 'lucide-react';
import GoogleMapsSection from './GoogleMapsSection';

export default function CustomerHome() {
  const { services, workers, openBookingModal } = useSalon();
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', ...new Set(services.map((s) => s.category))];

  const filteredServices = selectedCategory === 'All'
    ? services
    : services.filter((s) => s.category === selectedCategory);

  return (
    <div className="space-y-0">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#F3ECE2] via-[#FAF7F2] to-[#FAF7F2] pt-12 pb-24 border-b border-[#EBE1D5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EFE6DC] border border-[#DFCFC1] text-[#8B5E3C] text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-[#8B5E3C]" />
                Bespoke Luxury Hair &amp; Aesthetic Sanctuary
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#3A2213] leading-tight font-medium">
                Indulge in the Art of <br />
                <span className="italic font-normal text-[#8B5E3C]">Effortless Elegance</span>
              </h1>

              <p className="text-base sm:text-lg text-[#614F43] max-w-xl leading-relaxed font-light">
                Immerse yourself in personalized rituals curated by certified master stylists. 
                From French balayage to botanical hydra-facials, experience quiet luxury crafted exclusively for you.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <button
                  onClick={() => openBookingModal()}
                  className="bg-[#4A2E1B] text-[#FAF7F2] hover:bg-[#341F11] px-8 py-4 rounded-full text-sm font-semibold tracking-wide transition shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group"
                >
                  <span>Reserve Appointment</span>
                  <ArrowRight className="w-4 h-4 transition group-hover:translate-x-1" />
                </button>

                <a
                  href="#services-section"
                  className="bg-[#FFFFFF] text-[#4A2E1B] hover:bg-[#F5EFE8] border border-[#DFCFC1] px-7 py-4 rounded-full text-sm font-medium transition text-center shadow-xs"
                >
                  Explore Treatment Menu
                </a>
              </div>

              {/* Trust Badges */}
              <div className="pt-8 border-t border-[#E8DEC8] grid grid-cols-3 gap-4 text-center sm:text-left">
                <div>
                  <div className="font-serif text-2xl font-bold text-[#4A2E1B]">4.95 &#9733;</div>
                  <div className="text-xs text-stone-500 mt-0.5">Over 2,400+ 5-Star Reviews</div>
                </div>
                <div>
                  <div className="font-serif text-2xl font-bold text-[#4A2E1B]">100%</div>
                  <div className="text-xs text-stone-500 mt-0.5">Cruelty-Free Botanicals</div>
                </div>
                <div>
                  <div className="font-serif text-2xl font-bold text-[#4A2E1B]">5 VIP</div>
                  <div className="text-xs text-stone-500 mt-0.5">Private Styling Suites</div>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Collage */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                  <img
                    src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=900&q=80"
                    alt="Luxury Salon Interior"
                    className="w-full h-[480px] object-cover hover:scale-105 transition duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6">
                    <div className="text-white">
                      <p className="text-xs uppercase tracking-widest text-[#E5D7C7]">Signature Suite</p>
                      <h4 className="font-serif text-xl font-medium mt-0.5">Quiet Luxury &amp; Serene Ambiance</h4>
                    </div>
                  </div>
                </div>

                {/* Floating highlight card */}
                <div className="absolute -bottom-6 -left-6 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-[#E8DEC8] flex items-center gap-3.5 max-w-[240px]">
                  <div className="w-10 h-10 rounded-full bg-[#FAF3EC] text-[#8B5E3C] flex items-center justify-center shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#4A2E1B]">Voted Best Salon</p>
                    <p className="text-[11px] text-stone-500">2026 Luxury Lifestyle Awards</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Salon Pillars / Experience */}
      <section className="py-16 bg-white border-b border-[#EBE1D5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-[#FAF7F2] transition">
              <div className="w-12 h-12 rounded-full bg-[#FAF3EC] text-[#8B5E3C] flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif font-semibold text-[#4A2E1B]">Master Artistry</h3>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  Every specialist undergoes 200+ hours of annual European atelier training.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-[#FAF7F2] transition">
              <div className="w-12 h-12 rounded-full bg-[#FAF3EC] text-[#8B5E3C] flex items-center justify-center shrink-0">
                <Leaf className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif font-semibold text-[#4A2E1B]">Organic Infusions</h3>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  Sulfate-free, vegan shampoos and wildcrafted botanical essential oils.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-[#FAF7F2] transition">
              <div className="w-12 h-12 rounded-full bg-[#FAF3EC] text-[#8B5E3C] flex items-center justify-center shrink-0">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif font-semibold text-[#4A2E1B]">Sterile Precision</h3>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  Hospital-grade autoclave tool sterilization before every treatment.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-[#FAF7F2] transition">
              <div className="w-12 h-12 rounded-full bg-[#FAF3EC] text-[#8B5E3C] flex items-center justify-center shrink-0">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif font-semibold text-[#4A2E1B]">Zero Wait Times</h3>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  Real-time slot scheduling guarantees immediate greeting upon arrival.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Menu Catalog */}
      <section id="services-section" className="py-20 bg-[#FAF7F2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase tracking-widest text-[#8B5E3C] font-semibold">
              The Treatment Collection
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#4A2E1B] mt-2 font-medium">
              Curated Hair &amp; Wellness Services
            </h2>
            <p className="text-stone-600 text-sm mt-3 leading-relaxed">
              Transparent pricing, dedicated service durations, and pure botanical nourishment.
            </p>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-medium transition ${
                    selectedCategory === cat
                      ? 'bg-[#4A2E1B] text-white shadow-sm'
                      : 'bg-white border border-[#E0D4C7] text-stone-700 hover:border-[#8B5E3C]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Service Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-2xl overflow-hidden border border-[#EAE0D3] shadow-xs hover:shadow-xl hover:border-[#D4A373] transition duration-300 flex flex-col group"
              >
                {/* Service Image Banner */}
                <div className="relative h-48 overflow-hidden bg-stone-100">
                  <img
                    src={service.image}
                    alt={service.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-[11px] font-semibold text-[#8B5E3C]">
                    {service.category}
                  </div>
                  <div className="absolute top-3 right-3 bg-[#4A2E1B]/90 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-[11px] font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {service.duration} mins
                  </div>
                </div>

                {/* Service Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-serif text-lg font-semibold text-[#4A2E1B] group-hover:text-[#8B5E3C] transition">
                      {service.name}
                    </h3>
                    <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                      {service.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-stone-500 block uppercase tracking-wider">Service Fee</span>
                      <span className="text-xl font-bold font-serif text-[#4A2E1B]">
                        &#8377;{service.price.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <button
                      onClick={() => openBookingModal(service)}
                      className="bg-[#F4EDE4] text-[#4A2E1B] hover:bg-[#4A2E1B] hover:text-[#FAF7F2] px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition shadow-xs flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Master Stylists Team Showcase */}
      <section id="stylists-section" className="py-20 bg-white border-t border-[#EBE1D5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs uppercase tracking-widest text-[#8B5E3C] font-semibold">
              The Artisans
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#4A2E1B] mt-2 font-medium">
              Meet Our Master Stylists
            </h2>
            <p className="text-stone-600 text-sm mt-3 leading-relaxed">
              Our salon features up to 5 certified master specialists dedicated to personalized, unhurried care.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {workers.map((worker) => (
              <div
                key={worker.id}
                className="bg-[#FAF7F2] rounded-2xl overflow-hidden border border-[#EAE0D3] p-5 text-center flex flex-col items-center hover:shadow-lg transition group"
              >
                <div className="relative mb-4">
                  <img
                    src={worker.avatar}
                    alt={worker.name}
                    className="w-24 h-24 rounded-full object-cover border-2 border-white shadow-md mx-auto group-hover:scale-105 transition"
                  />
                  <span
                    className={`absolute bottom-0 right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                      worker.status === 'active' ? 'bg-emerald-500' : 'bg-amber-400'
                    }`}
                    title={worker.status === 'active' ? 'Available' : 'On Break'}
                  ></span>
                </div>

                <h3 className="font-serif text-base font-semibold text-[#4A2E1B]">
                  {worker.name}
                </h3>
                <p className="text-xs text-[#8B5E3C] font-medium mt-0.5">
                  {worker.role}
                </p>

                <div className="flex items-center justify-center gap-1 mt-2 text-amber-500 text-xs">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span className="font-bold text-stone-800">{worker.rating || 4.9}</span>
                  <span className="text-stone-400">({worker.experience})</span>
                </div>

                <div className="flex flex-wrap gap-1.5 justify-center mt-3">
                  {worker.specialties?.map((spec, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-full bg-white text-stone-600 text-[10px] border border-stone-200"
                    >
                      {spec}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => openBookingModal()}
                  className="mt-5 w-full bg-white hover:bg-[#4A2E1B] hover:text-white text-[#4A2E1B] text-xs font-semibold py-2 rounded-xl border border-[#D5C2B1] transition"
                >
                  Book with {worker.name.split(' ')[0]}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Google Maps & Location Section */}
      <GoogleMapsSection />
    </div>
  );
}


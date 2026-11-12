// Initial seed data and defaults for AURA Salon

export const INITIAL_SERVICES = [
  {
    id: "srv-1",
    name: "Signature Botanical Haircut & Blowout",
    category: "Hair Styling",
    price: 1800,
    duration: 60,
    description: "Personalized consultation, therapeutic scalp massage with botanical oils, precision cut, and salon blowout.",
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "srv-2",
    name: "French Balayage & Gloss Finish",
    category: "Coloring",
    price: 5500,
    duration: 120,
    description: "Hand-painted sun-kissed highlights tailored to your skin tone, followed by an acidic gloss toner for diamond shine.",
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "srv-3",
    name: "Hydra-Infusion Radiance Facial",
    category: "Spa & Facials",
    price: 3200,
    duration: 75,
    description: "Deep ultrasonic pore cleansing, hyaluronic acid cold-hammer infusion, and soothing algae peel-off mask.",
    image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "srv-4",
    name: "Keratin Silk Smooth Therapy",
    category: "Hair Styling",
    price: 4800,
    duration: 150,
    description: "Formaldehyde-free amino smoothing treatment that eliminates frizz and seals cuticle for up to 4 months.",
    image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "srv-5",
    name: "Aromatherapy Hot Stone Body Ritual",
    category: "Spa & Facials",
    price: 4000,
    duration: 90,
    description: "Volcanic basalt stones combined with lavender and bergamot essential oils to melt deep muscle tension.",
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "srv-6",
    name: "Artisan Gel Manicure & Hand Spa",
    category: "Nail Care",
    price: 1500,
    duration: 45,
    description: "Gentle cuticle care, organic walnut exfoliation, massage with shea butter, and chip-resistant gel polish.",
    image: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "srv-7",
    name: "Executive Beard Sculpting & Royal Shave",
    category: "Men's Grooming",
    price: 1200,
    duration: 45,
    description: "Steamed cedarwood towel preparation, straight razor precision edging, and sandalwood beard balm conditioning.",
    image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80"
  }
];

export const INITIAL_WORKERS = [
  {
    id: "w-1",
    name: "Aria Montgomery",
    email: "aria@aurasalon.com",
    role: "Senior Hair Stylist & Creative Director",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    phone: "+91 98765 43210",
    experience: "8+ Years",
    rating: 4.9,
    status: "active", // active, on_break, off_duty, deactivated
    specialties: ["Balayage", "Precision Cut", "Bridal Hair"],
    todayEarnings: 4200
  },
  {
    id: "w-2",
    name: "Julian Brooks",
    email: "julian@aurasalon.com",
    role: "Master Colorist",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    phone: "+91 98765 43211",
    experience: "6 Years",
    rating: 4.8,
    status: "active",
    specialties: ["Color Correction", "Pastel Tones", "Highlights"],
    todayEarnings: 5500
  },
  {
    id: "w-3",
    name: "Elena Rostova",
    email: "elena@aurasalon.com",
    role: "Senior Aesthetician & Skin Specialist",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    phone: "+91 98765 43212",
    experience: "7 Years",
    rating: 4.95,
    status: "active",
    specialties: ["Hydra Facial", "Chemical Peels", "Lymphatic Drainage"],
    todayEarnings: 3200
  },
  {
    id: "w-4",
    name: "David Chen",
    email: "david@aurasalon.com",
    role: "Gentlemen's Stylist & Groomer",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    phone: "+91 98765 43213",
    experience: "5 Years",
    rating: 4.75,
    status: "active",
    specialties: ["Fade Cuts", "Beard Sculpting", "Scalp Treatments"],
    todayEarnings: 2400
  }
];

export const INITIAL_SALON_INFO = {
  name: "AURA Salon & Aesthetic Sanctuary",
  tagline: "Elegance redefined through bespoke hair, skin & wellness rituals.",
  address: "Plot 42, Green Avenue, Jubilee Hills, Hyderabad, Telangana 500033",
  phone: "+91 80088 12345",
  email: "concierge@aurasalon.com",
  coordinates: {
    lat: 17.4319,
    lng: 78.4073
  },
  googleMapsUrl: "https://maps.google.com/?q=17.4319,78.4073",
  workingHours: {
    weekdays: "09:30 AM - 08:30 PM",
    weekends: "09:00 AM - 09:00 PM"
  },
  slotIntervalMinutes: 60
};

export const INITIAL_APPOINTMENTS = [
  {
    id: "apt-101",
    customerName: "Sophia Williams",
    customerEmail: "sophia.w@example.com",
    customerPhone: "+91 99887 76655",
    serviceId: "srv-1",
    serviceName: "Signature Botanical Haircut & Blowout",
    servicePrice: 1800,
    serviceDuration: 60,
    workerId: "w-1",
    workerName: "Aria Montgomery",
    date: new Date().toISOString().split("T")[0],
    time: "11:00 AM",
    status: "confirmed", // confirmed, in_progress, completed, cancelled
    paymentStatus: "paid", // pending, paid, refunded
    paymentMethod: "razorpay", // razorpay, cash
    transactionId: "pay_test_923847294",
    notes: "Prefers organic hair serum with rosemary scent."
  },
  {
    id: "apt-102",
    customerName: "Rohan Verma",
    customerEmail: "rohan.v@example.com",
    customerPhone: "+91 91234 56789",
    serviceId: "srv-7",
    serviceName: "Executive Beard Sculpting & Royal Shave",
    servicePrice: 1200,
    serviceDuration: 45,
    workerId: "w-4",
    workerName: "David Chen",
    date: new Date().toISOString().split("T")[0],
    time: "02:00 PM",
    status: "in_progress",
    paymentStatus: "paid",
    paymentMethod: "razorpay",
    transactionId: "pay_test_923847295",
    notes: "Sensitive skin, use mild pre-shave oil."
  },
  {
    id: "apt-103",
    customerName: "Meera Patel",
    customerEmail: "meera.p@example.com",
    customerPhone: "+91 98760 11223",
    serviceId: "srv-3",
    serviceName: "Hydra-Infusion Radiance Facial",
    servicePrice: 3200,
    serviceDuration: 75,
    workerId: "w-3",
    workerName: "Elena Rostova",
    date: new Date(Date.now() + 86400000).toISOString().split("T")[0], // tomorrow
    time: "03:30 PM",
    status: "confirmed",
    paymentStatus: "paid",
    paymentMethod: "razorpay",
    transactionId: "pay_test_923847296",
    notes: "First time visit, booked for pre-wedding glow."
  }
];


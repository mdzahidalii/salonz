# AURA | Luxury Salon Management & Appointment Booking Platform

A modern, production-grade salon management and booking web application designed with an editorial **cream, white, and warm brown** aesthetic. Features three distinct user roles (**Owner**, **Staff/Workers**, and **Customers**), role-based JWT authentication, **MongoDB Atlas** database integration, **Google Maps API** location routing, and **Razorpay API (Test Mode)** payment processing.

---

## 🏛️ Project Architecture

```
salon/
├── frontend/                     # React 19 + Tailwind CSS + Vite Frontend
│   ├── src/
│   │   ├── api/client.js         # API integration client with JWT interceptor
│   │   ├── layouts/              # Separate portal layouts (CustomerLayout,
│   │   │                         # AdminLayout, WorkerLayout)
│   │   ├── components/           # UI Components (CustomerHome, BookingModal,
│   │   │                         # Dashboards, LoginPage, GoogleMaps, Toast)
│   │   ├── context/              # AuthContext (RBAC) & SalonContext (Real-time Sync)
│   │   ├── utils/                # Google Maps JS SDK dynamic loader
│   │   ├── data/initialData.js   # Fallback catalog & initial seed data
│   │   ├── App.jsx               # Role-based hash router
│   │   └── main.jsx
│   ├── .env.example              # Frontend environment template
│   └── vite.config.js            # Reverse proxy to FastAPI (:8000)
│
├── backend/                      # Python FastAPI REST API
│   ├── app/
│   │   ├── routers/
│   │   │   ├── auth.py           # Register, Login, JWT verification
│   │   │   ├── services.py       # Public service catalog, workers & salon info
│   │   │   ├── customer.py       # Book, reschedule, cancel, my bookings
│   │   │   ├── worker.py         # Worker assigned queue, start/complete, earnings
│   │   │   ├── owner.py          # Worker CRUD (max 5), Service CRUD, Analytics
│   │   │   └── payments.py       # Razorpay order generation & HMAC signature check
│   │   ├── config.py             # Environment configuration (Pydantic / dotenv)
│   │   ├── database.py           # Motor async MongoDB Atlas connection & seeding
│   │   ├── models.py             # Pydantic validation schemas
│   │   ├── security.py           # bcrypt password hashing & JWT token handling
│   │   └── main.py               # FastAPI entry point, CORS, routers & lifespan
│   ├── .env.example              # Backend template environment variables
│   └── requirements.txt          # Python backend dependencies
│
├── .gitignore                    # Excludes node_modules, .venv, dist, and .env secrets
├── .dockerignore                 # Excludes local deps/secrets from Docker build
├── Dockerfile                    # Multi-stage Node 20 + Python 3.12 production build
├── render.yaml                   # Render Blueprint specification (Docker runtime)
├── run_backend.bat               # 1-Click launcher for FastAPI backend
└── run_frontend.bat              # 1-Click launcher for Vite frontend
```

---

## 🎓 Backend Learning Guide: Purpose of Each Integration

### 1. Python FastAPI & Role-Based Access Control (RBAC)
* **Purpose**: Serves as the high-performance asynchronous API engine.
* **How It Works**:
  * Users authenticate via `/api/auth/login`. Passwords are validated using **bcrypt** hashes.
  * Successful login issues a signed **JSON Web Token (JWT)** containing claims (`sub`, `role`, `email`).
  * Fast, declarative dependencies (`require_role(["owner"])`, `require_role(["worker"])`) protect private routes. Customers cannot access staff endpoints, and staff cannot access owner features.

### 2. MongoDB Atlas Integration
* **Purpose**: Cloud document database storing customers, staff, services, appointments, and payments.
* **How It Works**:
  * Uses `motor.motor_asyncio`, an asynchronous Python driver for MongoDB.
  * When connected, it operates on collections: `users`, `workers`, `services`, `appointments`, and `payments`.
  * If MongoDB is offline, it seamlessly falls back to a thread-safe in-memory store so development never halts.
  * **To connect MongoDB Atlas**: Open `backend/.env` and paste your Atlas connection string in `MONGODB_URI`.

### 3. Google Maps API Integration
* **Purpose**: Provides visual salon positioning, interactive mapping, and one-click directions for customers.
* **How It Works**:
  * The frontend embeds an interactive Google Maps viewport centered on the salon's coordinates (`lat`, `lng`).
  * "Get Directions" uses the Google Maps Universal URL Scheme (`https://www.google.com/maps/dir/?api=1&destination=...`) to route customers from their current GPS location.
  * The salon owner can modify the address and coordinates dynamically inside the **Owner Dashboard Settings tab**.

### 4. Razorpay API (Test Mode) Integration
* **Purpose**: Enables secure online card, UPI, and NetBanking payments.
* **How It Works**:
  * **Order Creation**: Frontend requests `/api/payments/create-order` with the service amount. The backend contacts Razorpay (or test sandbox) and returns an `order_id` in paise.
  * **Client Checkout**: The Razorpay Modal opens on the client using the test public key (`key_id`).
  * **Cryptographic Verification**: On successful payment, Razorpay returns `razorpay_order_id`, `razorpay_payment_id`, and `razorpay_signature`. The backend verifies the HMAC SHA256 digest using the secret key before marking the appointment as `paid`.

---

## 🚀 Quick Start Instructions

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- MongoDB (local or MongoDB Atlas cluster URI)

### 1. Configure Environment Variables
Copy the template files and add your credentials:
- `backend/.env.example` -> `backend/.env` (JWT secret, MongoDB URI, Razorpay test keys, Google Maps key)
- `frontend/.env.example` -> `frontend/.env` (`VITE_GOOGLE_MAPS_API_KEY`)

### 2. Setup & Launch Backend
Double-click `run_backend.bat` or run:
```powershell
cd backend
python -m venv .venv
.venv\Scripts\pip install -r requirements.txt
.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
*API Documentation will be live at: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)*

### 3. Setup & Launch Frontend
Double-click `run_frontend.bat` or run:
```powershell
cd frontend
npm install
npm run dev
```
*Open your browser at: [http://localhost:5173](http://localhost:5173)*

---

## ☁️ Deploying to Render (Single-Service Docker)

1. Push the full project (`backend/`, `frontend/`, `Dockerfile`, `.dockerignore`, `render.yaml`) to your GitHub repository.
2. In Render, either create a **Blueprint** (uses `render.yaml` automatically) or set an existing Web Service's **Language** to **`Docker`** and **Health Check Path** to `/api/health`.
3. Add these **Environment Variables** in Render Dashboard -> **Environment**:
   - `JWT_SECRET` (random secret string)
   - `MONGODB_URI` (your `mongodb+srv://...` Atlas connection string; falls back to in-memory seed store if omitted)
   - `DATABASE_NAME=aura_salon_db`
   - `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET`
   - `GOOGLE_MAPS_API_KEY`

---

## 🔑 Pre-Seeded Test Credentials

Use the **1-Click Quick-Switch Bar** at the top of the webpage or log in with:

| Role | Email | Password | Features Accessible |
|---|---|---|---|
| **Owner (Admin)** | `owner@aurasalon.com` | `ownerpassword123` | Worker management (max 5), Services CRUD, Analytics, Location settings |
| **Worker (Stylist)** | `aria@aurasalon.com` | `workerpassword123` | Assigned appointments queue, Start/Complete service, Commission breakdown, Availability status |
| **Customer** | `sophia.w@example.com` | `customerpassword123` | Booking wizard, Reschedule with double-booking guard, Cancel, Razorpay test payments |

---

## 🛡️ Business Rules & Safeguards
- **Double Booking Prevention**: When a customer or owner books an appointment, the system checks whether the selected specialist already has an active booking on that date and time slot. Conflicting slots are disabled and blocked.
- **Worker Cap**: The salon enforces a strict maximum limit of **5 master workers**. Adding a 6th worker is rejected by both the frontend UI and backend Pydantic validator until an existing worker is removed.
- **Role Isolation**: HTTP Bearer JWT tokens verify identity. An unauthorized customer token attempting to access `/api/owner/*` receives an instant `403 Forbidden`.


import logging
from typing import Optional, Dict, Any, List
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.config import settings
from app.security import hash_password

logger = logging.getLogger("aura.database")

# In-memory storage fallback for zero-dependency local development
class InMemoryCollection:
    def __init__(self, name: str, initial_data: Optional[List[dict]] = None):
        self.name = name
        self.data: List[dict] = initial_data or []

    async def find_one(self, query: dict) -> Optional[dict]:
        for doc in self.data:
            match = True
            for k, v in query.items():
                if doc.get(k) != v:
                    match = False
                    break
            if match:
                return doc.copy()
        return None

    def find(self, query: Optional[dict] = None):
        class Cursor:
            def __init__(self, items):
                self.items = items
            def sort(self, *args, **kwargs):
                return self
            async def to_list(self, length: Optional[int] = None):
                if length is not None:
                    return [d.copy() for d in self.items[:length]]
                return [d.copy() for d in self.items]
        
        filtered = []
        q = query or {}
        for doc in self.data:
            match = True
            for k, v in q.items():
                if doc.get(k) != v:
                    match = False
                    break
            if match:
                filtered.append(doc)
        return Cursor(filtered)

    async def insert_one(self, document: dict):
        self.data.append(document.copy())
        class Result:
            inserted_id = document.get("id") or document.get("_id")
        return Result()

    async def update_one(self, query: dict, update: dict):
        doc = await self.find_one(query)
        if doc:
            for idx, item in enumerate(self.data):
                match = True
                for k, v in query.items():
                    if item.get(k) != v:
                        match = False
                        break
                if match:
                    if "$set" in update:
                        self.data[idx].update(update["$set"])
                    break
        class Result:
            modified_count = 1 if doc else 0
        return Result()

    async def delete_one(self, query: dict):
        before_len = len(self.data)
        self.data = [
            d for d in self.data
            if not all(d.get(k) == v for k, v in query.items())
        ]
        class Result:
            deleted_count = before_len - len(self.data)
        return Result()

    async def count_documents(self, query: Optional[dict] = None) -> int:
        if not query:
            return len(self.data)
        count = 0
        for doc in self.data:
            if all(doc.get(k) == v for k, v in query.items()):
                count += 1
        return count


class DatabaseManager:
    client: Optional[AsyncIOMotorClient] = None
    db: Optional[AsyncIOMotorDatabase] = None
    is_connected_to_mongodb: bool = False
    
    # Fallback memory collections
    memory_collections: Dict[str, InMemoryCollection] = {}

    def get_collection(self, name: str):
        if self.is_connected_to_mongodb and self.db is not None:
            return self.db[name]
        if name not in self.memory_collections:
            self.memory_collections[name] = InMemoryCollection(name)
        return self.memory_collections[name]

db_manager = DatabaseManager()

# Default Seed Data
INITIAL_USERS_SEED = [
    {
        "id": "owner-1",
        "name": "Eleanor Vance (Owner)",
        "email": "owner@aurasalon.com",
        "password": hash_password("ownerpassword123"),
        "role": "owner",
        "phone": "+91 80088 12345"
    },
    {
        "id": "w-1",
        "name": "Aria Montgomery",
        "email": "aria@aurasalon.com",
        "password": hash_password("workerpassword123"),
        "role": "worker",
        "worker_id": "w-1",
        "phone": "+91 98765 43210"
    },
    {
        "id": "cust-1",
        "name": "Sophia Williams",
        "email": "sophia.w@example.com",
        "password": hash_password("customerpassword123"),
        "role": "customer",
        "phone": "+91 99887 76655"
    }
]

INITIAL_WORKERS_SEED = [
    {
        "id": "w-1",
        "name": "Aria Montgomery",
        "email": "aria@aurasalon.com",
        "role": "Senior Hair Stylist & Creative Director",
        "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
        "phone": "+91 98765 43210",
        "experience": "8+ Years",
        "rating": 4.9,
        "status": "active",
        "specialties": ["Balayage", "Precision Cut", "Bridal Hair"],
        "todayEarnings": 4200.0
    },
    {
        "id": "w-2",
        "name": "Julian Brooks",
        "email": "julian@aurasalon.com",
        "role": "Master Colorist",
        "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
        "phone": "+91 98765 43211",
        "experience": "6 Years",
        "rating": 4.8,
        "status": "active",
        "specialties": ["Color Correction", "Pastel Tones", "Highlights"],
        "todayEarnings": 5500.0
    },
    {
        "id": "w-3",
        "name": "Elena Rostova",
        "email": "elena@aurasalon.com",
        "role": "Senior Aesthetician & Skin Specialist",
        "avatar": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
        "phone": "+91 98765 43212",
        "experience": "7 Years",
        "rating": 4.95,
        "status": "active",
        "specialties": ["Hydra Facial", "Chemical Peels", "Lymphatic Drainage"],
        "todayEarnings": 3200.0
    },
    {
        "id": "w-4",
        "name": "David Chen",
        "email": "david@aurasalon.com",
        "role": "Gentlemen's Stylist & Groomer",
        "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
        "phone": "+91 98765 43213",
        "experience": "5 Years",
        "rating": 4.75,
        "status": "active",
        "specialties": ["Fade Cuts", "Beard Sculpting", "Scalp Treatments"],
        "todayEarnings": 2400.0
    }
]

INITIAL_SERVICES_SEED = [
    {
        "id": "srv-1",
        "name": "Signature Botanical Haircut & Blowout",
        "category": "Hair Styling",
        "price": 1800.0,
        "duration": 60,
        "description": "Personalized consultation, therapeutic scalp massage with botanical oils, precision cut, and salon blowout.",
        "image": "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80"
    },
    {
        "id": "srv-2",
        "name": "French Balayage & Gloss Finish",
        "category": "Coloring",
        "price": 5500.0,
        "duration": 120,
        "description": "Hand-painted sun-kissed highlights tailored to your skin tone, followed by an acidic gloss toner for diamond shine.",
        "image": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80"
    },
    {
        "id": "srv-3",
        "name": "Hydra-Infusion Radiance Facial",
        "category": "Spa & Facials",
        "price": 3200.0,
        "duration": 75,
        "description": "Deep ultrasonic pore cleansing, hyaluronic acid cold-hammer infusion, and soothing algae peel-off mask.",
        "image": "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80"
    },
    {
        "id": "srv-4",
        "name": "Keratin Silk Smooth Therapy",
        "category": "Hair Styling",
        "price": 4800.0,
        "duration": 150,
        "description": "Formaldehyde-free amino smoothing treatment that eliminates frizz and seals cuticle for up to 4 months.",
        "image": "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=600&q=80"
    },
    {
        "id": "srv-5",
        "name": "Aromatherapy Hot Stone Body Ritual",
        "category": "Spa & Facials",
        "price": 4000.0,
        "duration": 90,
        "description": "Volcanic basalt stones combined with lavender and bergamot essential oils to melt deep muscle tension.",
        "image": "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=600&q=80"
    },
    {
        "id": "srv-6",
        "name": "Artisan Gel Manicure & Hand Spa",
        "category": "Nail Care",
        "price": 1500.0,
        "duration": 45,
        "description": "Gentle cuticle care, organic walnut exfoliation, massage with shea butter, and chip-resistant gel polish.",
        "image": "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=600&q=80"
    },
    {
        "id": "srv-7",
        "name": "Executive Beard Sculpting & Royal Shave",
        "category": "Men's Grooming",
        "price": 1200.0,
        "duration": 45,
        "description": "Steamed cedarwood towel preparation, straight razor precision edging, and sandalwood beard balm conditioning.",
        "image": "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80"
    }
]

INITIAL_CUSTOMERS_SEED = [
    {
        "id": "cust-1",
        "name": "Sophia Williams",
        "email": "sophia.w@example.com",
        "phone": "+91 99887 76655",
        "totalVisits": 1,
        "createdAt": "2026-11-01T10:00:00Z"
    },
    {
        "id": "cust-2",
        "name": "Rohan Verma",
        "email": "rohan.v@example.com",
        "phone": "+91 91234 56789",
        "totalVisits": 1,
        "createdAt": "2026-11-02T11:00:00Z"
    }
]

INITIAL_APPOINTMENTS_SEED = [
    {
        "id": "apt-101",
        "customerId": "cust-1",
        "customerName": "Sophia Williams",
        "customerEmail": "sophia.w@example.com",
        "customerPhone": "+91 99887 76655",
        "serviceId": "srv-1",
        "serviceName": "Signature Botanical Haircut & Blowout",
        "servicePrice": 1800.0,
        "serviceDuration": 60,
        "workerId": "w-1",
        "workerName": "Aria Montgomery",
        "date": "2026-11-06",
        "time": "11:00 AM",
        "status": "confirmed",
        "paymentStatus": "paid",
        "paymentMethod": "razorpay",
        "transactionId": "pay_test_923847294",
        "notes": "Prefers organic hair serum with rosemary scent."
    },
    {
        "id": "apt-102",
        "customerId": "cust-2",
        "customerName": "Rohan Verma",
        "customerEmail": "rohan.v@example.com",
        "customerPhone": "+91 91234 56789",
        "serviceId": "srv-7",
        "serviceName": "Executive Beard Sculpting & Royal Shave",
        "servicePrice": 1200.0,
        "serviceDuration": 45,
        "workerId": "w-4",
        "workerName": "David Chen",
        "date": "2026-11-06",
        "time": "02:00 PM",
        "status": "in_progress",
        "paymentStatus": "paid",
        "paymentMethod": "razorpay",
        "transactionId": "pay_test_923847295",
        "notes": "Sensitive skin, use mild pre-shave oil."
    }
]

INITIAL_SALON_INFO_SEED = {
    "id": "salon-main-info",
    "name": "AURA Salon & Aesthetic Sanctuary",
    "tagline": "Elegance redefined through bespoke hair, skin & wellness rituals.",
    "address": "Plot 42, Green Avenue, Jubilee Hills, Hyderabad, Telangana 500033",
    "phone": "+91 80088 12345",
    "email": "concierge@aurasalon.com",
    "coordinates": {
        "lat": 17.4319,
        "lng": 78.4073
    },
    "googleMapsUrl": "https://maps.google.com/?q=17.4319,78.4073",
    "workingHours": {
        "weekdays": "09:30 AM - 08:30 PM",
        "weekends": "09:00 AM - 09:00 PM"
    }
}

async def init_database():
    """Initializes the database connection and seeds initial records."""
    try:
        # Attempt connecting to MongoDB Atlas / local MongoDB
        client = AsyncIOMotorClient(settings.MONGODB_URI, serverSelectionTimeoutMS=2000)
        # Ping the server
        await client.admin.command('ping')
        db_manager.client = client
        db_manager.db = client[settings.DATABASE_NAME]
        db_manager.is_connected_to_mongodb = True
        logger.info(f"[MongoDB Atlas] Successfully connected to database '{settings.DATABASE_NAME}'")
        print(f"--> [MongoDB Atlas] Connected to database: {settings.DATABASE_NAME}")

        # Seed MongoDB collections if empty
        users_col = db_manager.db["users"]
        if await users_col.count_documents({}) == 0:
            await users_col.insert_many([u.copy() for u in INITIAL_USERS_SEED])

        customers_col = db_manager.db["customers"]
        if await customers_col.count_documents({}) == 0:
            await customers_col.insert_many([c.copy() for c in INITIAL_CUSTOMERS_SEED])

        workers_col = db_manager.db["workers"]
        if await workers_col.count_documents({}) == 0:
            await workers_col.insert_many([w.copy() for w in INITIAL_WORKERS_SEED])

        services_col = db_manager.db["services"]
        if await services_col.count_documents({}) == 0:
            await services_col.insert_many([s.copy() for s in INITIAL_SERVICES_SEED])

        apts_col = db_manager.db["appointments"]
        if await apts_col.count_documents({}) == 0:
            await apts_col.insert_many([a.copy() for a in INITIAL_APPOINTMENTS_SEED])
        else:
            # Ensure existing records have customerId
            await apts_col.update_many({"customerId": {"$exists": False}}, {"$set": {"customerId": "cust-1"}})

        payments_col = db_manager.db["payments"]
        if await payments_col.count_documents({}) == 0:
            await payments_col.insert_one({
                "id": "payrec-init",
                "orderId": "order_init_1",
                "paymentId": "pay_test_923847294",
                "appointmentId": "apt-101",
                "status": "verified",
                "gateway": "razorpay",
                "verifiedAt": "2026-11-06T11:05:00Z"
            })

        info_col = db_manager.db["salon_info"]
        if await info_col.count_documents({}) == 0:
            await info_col.insert_one(INITIAL_SALON_INFO_SEED.copy())

    except Exception as e:
        logger.warning(f"[Database] MongoDB unavailable ({e}). Initializing in-memory fallback store.")
        print(f"--> [Database] MongoDB connection not detected. Using high-performance in-memory fallback store.")
        db_manager.is_connected_to_mongodb = False
        # Initialize memory collections with seeds
        db_manager.memory_collections["users"] = InMemoryCollection("users", [u.copy() for u in INITIAL_USERS_SEED])
        db_manager.memory_collections["customers"] = InMemoryCollection("customers", [c.copy() for c in INITIAL_CUSTOMERS_SEED])
        db_manager.memory_collections["workers"] = InMemoryCollection("workers", [w.copy() for w in INITIAL_WORKERS_SEED])
        db_manager.memory_collections["services"] = InMemoryCollection("services", [s.copy() for s in INITIAL_SERVICES_SEED])
        db_manager.memory_collections["appointments"] = InMemoryCollection("appointments", [a.copy() for a in INITIAL_APPOINTMENTS_SEED])
        db_manager.memory_collections["salon_info"] = InMemoryCollection("salon_info", [INITIAL_SALON_INFO_SEED.copy()])
        db_manager.memory_collections["payments"] = InMemoryCollection("payments", [])

async def close_database():
    """Closes MongoDB connection on shutdown."""
    if db_manager.client:
        db_manager.client.close()
        logger.info("[MongoDB Atlas] Connection closed.")


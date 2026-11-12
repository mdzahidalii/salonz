from fastapi import APIRouter
from typing import List, Dict, Any
from app.models import ServiceOut, WorkerOut
from app.database import db_manager
from app.config import settings

router = APIRouter(prefix="/api", tags=["Public Catalog & Info"])

@router.get("/services", response_model=List[ServiceOut])
async def list_public_services():
    """Returns the list of all available salon treatment services."""
    services_col = db_manager.get_collection("services")
    cursor = services_col.find({})
    services_list = await cursor.to_list(length=100)
    return [
        ServiceOut(
            id=s["id"],
            name=s["name"],
            category=s.get("category", "General"),
            price=s["price"],
            duration=s["duration"],
            description=s["description"],
            image=s.get("image")
        )
        for s in services_list
    ]

@router.get("/workers", response_model=List[WorkerOut])
async def list_public_workers():
    """Returns the team of certified master stylists and aestheticians."""
    workers_col = db_manager.get_collection("workers")
    cursor = workers_col.find({})
    workers_list = await cursor.to_list(length=20)
    return [
        WorkerOut(
            id=w["id"],
            name=w["name"],
            email=w["email"],
            phone=w.get("phone"),
            role=w["role"],
            avatar=w.get("avatar"),
            experience=w.get("experience", "3 Years"),
            rating=w.get("rating", 4.9),
            status=w.get("status", "active"),
            specialties=w.get("specialties", []),
            todayEarnings=w.get("todayEarnings", 0.0)
        )
        for w in workers_list
    ]

@router.get("/salon-info")
async def get_salon_info() -> Dict[str, Any]:
    """Returns salon physical address, coordinates, and operating hours."""
    info_col = db_manager.get_collection("salon_info")
    info = await info_col.find_one({})
    if not info:
        return {
            "name": "AURA Salon & Aesthetic Sanctuary",
            "address": "Plot 42, Green Avenue, Jubilee Hills, Hyderabad, Telangana 500033",
            "phone": "+91 80088 12345",
            "email": "concierge@aurasalon.com",
            "coordinates": {"lat": 17.4319, "lng": 78.4073},
            "googleMapsUrl": "https://maps.google.com/?q=17.4319,78.4073",
            "googleMapsApiKey": settings.GOOGLE_MAPS_API_KEY,
            "workingHours": {
                "weekdays": "09:30 AM - 08:30 PM",
                "weekends": "09:00 AM - 09:00 PM"
            }
        }
    info.pop("_id", None)
    info["googleMapsApiKey"] = settings.GOOGLE_MAPS_API_KEY
    return info


import uuid
from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Dict, Any
from app.models import (
    WorkerCreate, WorkerUpdate, WorkerStatusUpdate, WorkerOut,
    ServiceCreate, ServiceUpdate, ServiceOut,
    AppointmentAssignWorker, SalonInfoUpdate
)
from app.database import db_manager
from app.security import require_role

router = APIRouter(prefix="/api/owner", tags=["Owner Administration"])

# Dependency enforcing that only the salon owner can access these routes
is_owner = require_role(["owner"])

# ==================== WORKER MANAGEMENT (MAX 5 STRICT LIMIT) ====================
@router.post("/workers", response_model=WorkerOut)
async def add_worker(worker_in: WorkerCreate, current_user: dict = Depends(is_owner)):
    """
    Creates a new salon specialist.
    Strictly enforces maximum 5 workers capacity rule.
    """
    workers_col = db_manager.get_collection("workers")
    current_count = await workers_col.count_documents({})
    
    if current_count >= 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Salon worker limit reached (Maximum 5 master stylists allowed). Deactivate or remove a worker first."
        )

    # Check email uniqueness
    existing = await workers_col.find_one({"email": worker_in.email.lower()})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A worker with this email address is already registered."
        )

    worker_id = f"w-{uuid.uuid4().hex[:6]}"
    new_worker = {
        "id": worker_id,
        "name": worker_in.name,
        "email": worker_in.email.lower(),
        "phone": worker_in.phone,
        "role": worker_in.role,
        "avatar": worker_in.avatar or f"https://images.unsplash.com/photo-1534528741775?auto=format&fit=crop&w=400&q=80",
        "experience": worker_in.experience,
        "rating": 5.0,
        "status": "active",
        "specialties": worker_in.specialties,
        "todayEarnings": 0.0
    }

    await workers_col.insert_one(new_worker)
    return WorkerOut(**new_worker)

@router.put("/workers/{worker_id}", response_model=WorkerOut)
async def update_worker(worker_id: str, worker_update: WorkerUpdate, current_user: dict = Depends(is_owner)):
    """Updates worker personal details, title, or specialties."""
    workers_col = db_manager.get_collection("workers")
    worker = await workers_col.find_one({"id": worker_id})
    if not worker:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Worker not found.")

    update_fields = {k: v for k, v in worker_update.model_dump(exclude_unset=True).items() if v is not None}
    if update_fields:
        await workers_col.update_one({"id": worker_id}, {"$set": update_fields})
        worker.update(update_fields)

    return WorkerOut(**worker)

@router.patch("/workers/{worker_id}/status")
async def toggle_worker_status(worker_id: str, status_in: WorkerStatusUpdate, current_user: dict = Depends(is_owner)):
    """Sets a worker's status to 'active', 'on_break', 'off_duty', or 'deactivated'."""
    workers_col = db_manager.get_collection("workers")
    result = await workers_col.update_one({"id": worker_id}, {"$set": {"status": status_in.status}})
    if result.modified_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Worker not found or status already set.")
    return {"message": f"Worker status updated to {status_in.status}"}

# ==================== SERVICE CATALOG MANAGEMENT ====================
@router.post("/services", response_model=ServiceOut)
async def create_service(srv_in: ServiceCreate, current_user: dict = Depends(is_owner)):
    """Adds a new ritual treatment to the catalog."""
    services_col = db_manager.get_collection("services")
    service_id = f"srv-{uuid.uuid4().hex[:6]}"
    new_srv = {
        "id": service_id,
        "name": srv_in.name,
        "category": srv_in.category,
        "price": srv_in.price,
        "duration": srv_in.duration,
        "description": srv_in.description,
        "image": srv_in.image or "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80"
    }
    await services_col.insert_one(new_srv)
    return ServiceOut(**new_srv)

@router.put("/services/{service_id}", response_model=ServiceOut)
async def update_service(service_id: str, srv_in: ServiceUpdate, current_user: dict = Depends(is_owner)):
    """Updates treatment pricing, duration, or description."""
    services_col = db_manager.get_collection("services")
    srv = await services_col.find_one({"id": service_id})
    if not srv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found.")

    update_fields = {k: v for k, v in srv_in.model_dump(exclude_unset=True).items() if v is not None}
    if update_fields:
        await services_col.update_one({"id": service_id}, {"$set": update_fields})
        srv.update(update_fields)

    return ServiceOut(**srv)

@router.delete("/services/{service_id}")
async def delete_service(service_id: str, current_user: dict = Depends(is_owner)):
    """Removes a service from the active menu."""
    services_col = db_manager.get_collection("services")
    result = await services_col.delete_one({"id": service_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found.")
    return {"message": "Service removed successfully."}

# ==================== APPOINTMENT ASSIGNMENT & REASSIGNMENT ====================
@router.patch("/appointments/{appointment_id}/assign")
async def assign_worker_to_appointment(appointment_id: str, assign_in: AppointmentAssignWorker, current_user: dict = Depends(is_owner)):
    """
    Assigns or reassigns an appointment to a worker.
    Guarantees no double-booking on the worker's schedule.
    """
    apts_col = db_manager.get_collection("appointments")
    workers_col = db_manager.get_collection("workers")

    apt = await apts_col.find_one({"id": appointment_id})
    if not apt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found.")

    target_worker = await workers_col.find_one({"id": assign_in.workerId})
    if not target_worker:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Target specialist not found.")

    # Double Booking Check for target worker
    conflict = await apts_col.find_one({
        "id": {"$ne": appointment_id},
        "workerId": assign_in.workerId,
        "date": apt["date"],
        "time": apt["time"],
        "status": {"$ne": "cancelled"}
    })
    if conflict:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"{target_worker['name']} is already scheduled for an appointment at {apt['time']} on {apt['date']}."
        )

    await apts_col.update_one(
        {"id": appointment_id},
        {"$set": {"workerId": assign_in.workerId, "workerName": target_worker["name"]}}
    )

    return {"message": f"Appointment reassigned to {target_worker['name']}"}

# ==================== SALON SETTINGS & GOOGLE MAPS ====================
@router.put("/salon-info")
async def update_salon_settings(info_update: SalonInfoUpdate, current_user: dict = Depends(is_owner)):
    """Updates salon physical address, Google Maps coordinates, or hours."""
    info_col = db_manager.get_collection("salon_info")
    update_data = {k: v for k, v in info_update.model_dump(exclude_unset=True).items() if v is not None}
    
    existing = await info_col.find_one({})
    if existing:
        await info_col.update_one({}, {"$set": update_data})
    else:
        await info_col.insert_one(update_data)

    return {"message": "Salon settings and location coordinates updated."}


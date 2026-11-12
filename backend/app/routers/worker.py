from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Optional
from app.models import AppointmentOut, WorkerStatusUpdate
from app.database import db_manager
from app.security import require_role, get_current_user

router = APIRouter(prefix="/api/worker", tags=["Worker Dashboard Operations"])

# Worker access guard
is_worker = require_role(["worker", "owner"])

@router.get("/appointments", response_model=List[AppointmentOut])
async def get_worker_assigned_appointments(
    date: Optional[str] = None,
    current_user: dict = Depends(is_worker)
):
    """
    Returns appointments assigned to the logged-in worker.
    """
    worker_id = current_user.get("worker_id") or current_user.get("id")
    apts_col = db_manager.get_collection("appointments")
    
    query = {"workerId": worker_id}
    if date:
        query["date"] = date
        
    cursor = apts_col.find(query)
    raw_list = await cursor.to_list(length=100)
    return [AppointmentOut(**a) for a in raw_list]

@router.patch("/appointments/{appointment_id}/start")
async def start_appointment(appointment_id: str, current_user: dict = Depends(is_worker)):
    """
    Worker starts an appointment with the customer, transitioning status to 'in_progress'.
    """
    apts_col = db_manager.get_collection("appointments")
    result = await apts_col.update_one(
        {"id": appointment_id},
        {"$set": {"status": "in_progress"}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found.")
    return {"message": "Appointment started successfully.", "status": "in_progress"}

@router.patch("/appointments/{appointment_id}/complete")
async def complete_appointment(appointment_id: str, current_user: dict = Depends(is_worker)):
    """
    Worker marks appointment completed, concluding the service and recording commission.
    """
    apts_col = db_manager.get_collection("appointments")
    apt = await apts_col.find_one({"id": appointment_id})
    if not apt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found.")

    await apts_col.update_one(
        {"id": appointment_id},
        {"$set": {"status": "completed"}}
    )

    # Credit worker earnings
    workers_col = db_manager.get_collection("workers")
    commission = (apt.get("servicePrice", 0)) * 0.5
    worker_id = apt.get("workerId")
    if worker_id:
        worker = await workers_col.find_one({"id": worker_id})
        if worker:
            current_earnings = worker.get("todayEarnings", 0.0) + commission
            await workers_col.update_one(
                {"id": worker_id},
                {"$set": {"todayEarnings": current_earnings}}
            )

    return {
        "message": "Appointment completed successfully.",
        "status": "completed",
        "earnedCommission": commission
    }

@router.patch("/availability")
async def update_my_availability(status_in: WorkerStatusUpdate, current_user: dict = Depends(is_worker)):
    """
    Allows a worker to set their own duty status: active, on_break, or off_duty.
    """
    worker_id = current_user.get("worker_id") or current_user.get("id")
    workers_col = db_manager.get_collection("workers")
    await workers_col.update_one(
        {"id": worker_id},
        {"$set": {"status": status_in.status}}
    )
    return {"message": f"Availability updated to {status_in.status}"}


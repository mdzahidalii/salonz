import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Optional
from app.models import (
    AppointmentCreate, AppointmentReschedule, AppointmentStatusUpdate, AppointmentOut
)
from app.database import db_manager
from app.security import get_optional_user

router = APIRouter(prefix="/api/appointments", tags=["Appointments Management"])

@router.get("", response_model=List[AppointmentOut])
async def list_appointments(
    email: Optional[str] = None,
    workerId: Optional[str] = None,
    current_user: Optional[dict] = Depends(get_optional_user)
):
    """
    Returns appointments based on role and query parameters:
    - Customer: Only sees their own appointments
    - Worker: Only sees appointments assigned to them
    - Owner: Full access to all salon bookings
    - Anonymous: Can filter by email or workerId, or receive all
    """
    apts_col = db_manager.get_collection("appointments")
    query = {}

    if current_user:
        role = current_user.get("role")
        if role == "worker":
            w_id = current_user.get("worker_id") or current_user.get("id")
            query["workerId"] = w_id
        elif role == "customer":
            c_email = current_user.get("email", "").lower()
            c_id = current_user.get("id", "")
            if email:
                query["customerEmail"] = email.lower()
            else:
                query["$or"] = [
                    {"customerEmail": c_email},
                    {"customerId": c_id}
                ]
        elif role == "owner":
            if workerId:
                query["workerId"] = workerId
            if email:
                query["customerEmail"] = email.lower()
    else:
        if workerId:
            query["workerId"] = workerId
        if email:
            query["customerEmail"] = email.lower()

    cursor = apts_col.find(query).sort("date", -1)
    raw_list = await cursor.to_list(length=300)
    return [AppointmentOut(**a) for a in raw_list]

@router.post("", response_model=AppointmentOut)
async def create_appointment(
    apt_in: AppointmentCreate,
    current_user: Optional[dict] = Depends(get_optional_user)
):
    """
    Reserves a new appointment in MongoDB.
    CRITICAL RULE: Prevents double-booking of the same worker and time slot.
    """
    apts_col = db_manager.get_collection("appointments")
    workers_col = db_manager.get_collection("workers")
    services_col = db_manager.get_collection("services")
    customers_col = db_manager.get_collection("customers")

    # 1. Double Booking Prevention Check on MongoDB
    conflict = await apts_col.find_one({
        "workerId": apt_in.workerId,
        "date": apt_in.date,
        "time": apt_in.time,
        "status": {"$ne": "cancelled"}
    })
    if conflict:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"This specialist is already booked for {apt_in.time} on {apt_in.date}. Please choose another time or specialist."
        )

    # 2. Fetch service & worker metadata from MongoDB
    worker = await workers_col.find_one({"id": apt_in.workerId})
    worker_name = worker["name"] if worker else "Assigned Stylist"

    service = await services_col.find_one({"id": apt_in.serviceId})
    service_name = service["name"] if service else "Custom Service"
    service_price = service["price"] if service else 1000.0
    service_duration = service["duration"] if service else 60

    apt_id = f"apt-{uuid.uuid4().hex[:6]}"
    customer_id = apt_in.customerId or (current_user.get("id") if current_user else None) or f"cust-{uuid.uuid4().hex[:6]}"

    new_apt_doc = {
        "id": apt_id,
        "customerId": customer_id,
        "customerName": apt_in.customerName,
        "customerEmail": apt_in.customerEmail.lower(),
        "customerPhone": apt_in.customerPhone,
        "serviceId": apt_in.serviceId,
        "serviceName": service_name,
        "servicePrice": service_price,
        "serviceDuration": service_duration,
        "workerId": apt_in.workerId,
        "workerName": worker_name,
        "date": apt_in.date,
        "time": apt_in.time,
        "status": "confirmed",
        "paymentStatus": apt_in.paymentStatus or "paid",
        "paymentMethod": apt_in.paymentMethod or "razorpay",
        "transactionId": apt_in.transactionId or f"pay_rzp_{uuid.uuid4().hex[:8]}",
        "notes": apt_in.notes or "",
        "createdAt": datetime.utcnow().isoformat()
    }

    # Save to appointments collection
    await apts_col.insert_one(new_apt_doc)

    # Sync to customers collection
    existing_cust = await customers_col.find_one({"email": apt_in.customerEmail.lower()})
    if existing_cust:
        await customers_col.update_one(
            {"email": apt_in.customerEmail.lower()},
            {
                "$inc": {"totalVisits": 1},
                "$set": {
                    "phone": apt_in.customerPhone,
                    "name": apt_in.customerName,
                    "lastVisit": apt_in.date
                }
            }
        )
    else:
        await customers_col.insert_one({
            "id": customer_id,
            "name": apt_in.customerName,
            "email": apt_in.customerEmail.lower(),
            "phone": apt_in.customerPhone,
            "totalVisits": 1,
            "lastVisit": apt_in.date,
            "createdAt": datetime.utcnow().isoformat()
        })

    return AppointmentOut(**new_apt_doc)

@router.patch("/{appointment_id}/reschedule")
async def reschedule_appointment(
    appointment_id: str,
    resched_in: AppointmentReschedule,
    current_user: Optional[dict] = Depends(get_optional_user)
):
    """
    Reschedules an existing appointment in MongoDB to a new date and time.
    Guarantees no double booking occurs on the new slot.
    """
    apts_col = db_manager.get_collection("appointments")
    apt = await apts_col.find_one({"id": appointment_id})
    if not apt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found.")

    # Guard: Customer can only reschedule their own appointments
    if current_user and current_user.get("role") == "customer":
        if apt.get("customerEmail") != current_user.get("email"):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

    # Check conflict on new date/time
    conflict = await apts_col.find_one({
        "id": {"$ne": appointment_id},
        "workerId": apt["workerId"],
        "date": resched_in.date,
        "time": resched_in.time,
        "status": {"$ne": "cancelled"}
    })
    if conflict:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"The selected time slot {resched_in.time} on {resched_in.date} is already booked."
        )

    await apts_col.update_one(
        {"id": appointment_id},
        {"$set": {"date": resched_in.date, "time": resched_in.time}}
    )

    return {"message": f"Appointment rescheduled to {resched_in.date} at {resched_in.time}"}

@router.post("/{appointment_id}/cancel")
async def cancel_appointment(
    appointment_id: str,
    current_user: Optional[dict] = Depends(get_optional_user)
):
    """
    Cancels an appointment, freeing the slot for other guests.
    """
    apts_col = db_manager.get_collection("appointments")
    apt = await apts_col.find_one({"id": appointment_id})
    if not apt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found.")

    if current_user and current_user.get("role") == "customer":
        if apt.get("customerEmail") != current_user.get("email"):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

    await apts_col.update_one(
        {"id": appointment_id},
        {"$set": {"status": "cancelled"}}
    )

    return {"message": "Appointment cancelled successfully."}

@router.patch("/{appointment_id}/status")
async def update_status(
    appointment_id: str,
    status_in: AppointmentStatusUpdate,
    current_user: Optional[dict] = Depends(get_optional_user)
):
    """Updates appointment progress status across all portals."""
    apts_col = db_manager.get_collection("appointments")
    apt = await apts_col.find_one({"id": appointment_id})
    if not apt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found.")

    await apts_col.update_one(
        {"id": appointment_id},
        {"$set": {"status": status_in.status}}
    )

    # If completed, credit the worker's earnings
    if status_in.status == "completed":
        workers_col = db_manager.get_collection("workers")
        commission = (apt.get("servicePrice", 0)) * 0.5
        worker_id = apt.get("workerId")
        if worker_id:
            await workers_col.update_one(
                {"id": worker_id},
                {"$inc": {"todayEarnings": commission}}
            )

    return {"message": f"Status updated to {status_in.status}", "status": status_in.status}

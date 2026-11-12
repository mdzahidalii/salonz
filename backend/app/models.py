from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# ==================== AUTH & USERS ====================
class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: Optional[str] = None
    password: str = Field(..., min_length=6)
    role: str = Field(default="customer") # "customer", "worker", "owner"
    worker_id: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    role: Optional[str] = "customer"

class UserOut(BaseModel):
    id: str
    name: str
    email: str
    phone: Optional[str] = None
    role: str
    worker_id: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

# ==================== WORKERS ====================
class WorkerCreate(BaseModel):
    name: str = Field(..., min_length=2)
    email: EmailStr
    phone: str
    role: str = "Hair & Beauty Specialist"
    avatar: Optional[str] = None
    experience: str = "3 Years"
    specialties: List[str] = []

class WorkerUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    role: Optional[str] = None
    avatar: Optional[str] = None
    experience: Optional[str] = None
    specialties: Optional[List[str]] = None
    status: Optional[str] = None

class WorkerStatusUpdate(BaseModel):
    status: str # "active", "on_break", "off_duty", "deactivated"

class WorkerOut(BaseModel):
    id: str
    name: str
    email: str
    phone: Optional[str] = None
    role: str
    avatar: Optional[str] = None
    experience: Optional[str] = "3 Years"
    rating: float = 4.9
    status: str = "active"
    specialties: List[str] = []
    todayEarnings: float = 0.0

# ==================== SERVICES ====================
class ServiceCreate(BaseModel):
    name: str = Field(..., min_length=2)
    category: str = "Hair Styling"
    price: float = Field(..., gt=0)
    duration: int = Field(..., gt=0) # duration in minutes
    description: str
    image: Optional[str] = None

class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    duration: Optional[int] = None
    description: Optional[str] = None
    image: Optional[str] = None

class ServiceOut(BaseModel):
    id: str
    name: str
    category: str
    price: float
    duration: int
    description: str
    image: Optional[str] = None

# ==================== APPOINTMENTS ====================
class AppointmentCreate(BaseModel):
    customerId: Optional[str] = None
    customerName: str
    customerEmail: EmailStr
    customerPhone: str
    serviceId: str
    workerId: str
    date: str # YYYY-MM-DD
    time: str # e.g. "11:00 AM"
    paymentMethod: Optional[str] = "razorpay"
    paymentStatus: Optional[str] = "paid"
    transactionId: Optional[str] = None
    notes: Optional[str] = None

class AppointmentReschedule(BaseModel):
    date: str
    time: str

class AppointmentStatusUpdate(BaseModel):
    status: str # "pending", "confirmed", "in_progress", "completed", "cancelled", "rejected"

class AppointmentAssignWorker(BaseModel):
    workerId: str

class AppointmentOut(BaseModel):
    id: str
    customerId: Optional[str] = None
    customerName: str
    customerEmail: str
    customerPhone: str
    serviceId: str
    serviceName: str
    servicePrice: float
    serviceDuration: int
    workerId: str
    workerName: str
    date: str
    time: str
    status: str
    paymentStatus: str
    paymentMethod: str
    transactionId: Optional[str] = None
    notes: Optional[str] = ""
    createdAt: Optional[str] = None

# ==================== PAYMENTS (RAZORPAY) ====================
class RazorpayOrderCreate(BaseModel):
    amount: float
    appointmentId: Optional[str] = None

class RazorpayOrderOut(BaseModel):
    order_id: str
    amount: int # in paise
    currency: str
    key_id: str

class RazorpayPaymentVerify(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    appointmentId: Optional[str] = None

# ==================== SALON INFO ====================
class SalonInfoUpdate(BaseModel):
    name: Optional[str] = None
    tagline: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    coordinates: Optional[Dict[str, float]] = None
    googleMapsUrl: Optional[str] = None
    workingHours: Optional[Dict[str, str]] = None


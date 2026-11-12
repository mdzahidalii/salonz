import hmac
import hashlib
import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException, status, Depends
import razorpay
from app.models import RazorpayOrderCreate, RazorpayOrderOut, RazorpayPaymentVerify
from app.config import settings
from app.database import db_manager
from app.security import require_role

router = APIRouter(prefix="/api/payments", tags=["Razorpay Payment Gateway"])

def get_razorpay_client():
    """Initializes and returns the Razorpay client using environment credentials."""
    return razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

@router.post("/create-order", response_model=RazorpayOrderOut)
async def create_razorpay_order(order_req: RazorpayOrderCreate):
    """
    Creates a new Razorpay payment order.
    The order is generated securely on the server with amount in paise (1 INR = 100 paise).
    """
    amount_in_paise = int(order_req.amount * 100)
    receipt_id = f"rcpt_{uuid.uuid4().hex[:8]}"

    try:
        # Check if actual test keys or placeholders are in use
        if settings.RAZORPAY_KEY_ID and not settings.RAZORPAY_KEY_ID.startswith("rzp_test_placeholder"):
            client = get_razorpay_client()
            data = {
                "amount": amount_in_paise,
                "currency": settings.RAZORPAY_CURRENCY,
                "receipt": receipt_id,
                "notes": {
                    "appointmentId": order_req.appointmentId or ""
                }
            }
            order = client.order.create(data=data)
            order_id = order["id"]
        else:
            # Test Mode Simulation Order ID
            order_id = f"order_test_{uuid.uuid4().hex[:12]}"

        return RazorpayOrderOut(
            order_id=order_id,
            amount=amount_in_paise,
            currency=settings.RAZORPAY_CURRENCY,
            key_id=settings.RAZORPAY_KEY_ID
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Razorpay order generation failed: {str(e)}"
        )

@router.post("/verify")
async def verify_razorpay_payment(verify_data: RazorpayPaymentVerify):
    """
    Cryptographically verifies the Razorpay signature using HMAC SHA256.
    Ensures payment integrity and prevents man-in-the-middle manipulation.
    Updates the appointment payment status in MongoDB and stores transaction records.
    """
    generated_signature = None

    if settings.RAZORPAY_KEY_SECRET and settings.RAZORPAY_KEY_SECRET != "test_secret_placeholder":
        # Calculate expected signature
        body = f"{verify_data.razorpay_order_id}|{verify_data.razorpay_payment_id}".encode('utf-8')
        expected_signature = hmac.new(
            settings.RAZORPAY_KEY_SECRET.encode('utf-8'),
            body,
            hashlib.sha256
        ).hexdigest()

        if not hmac.compare_digest(expected_signature, verify_data.razorpay_signature):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Payment signature verification failed. Possible tampering detected."
            )
    
    # Update appointment payment status in MongoDB
    apts_col = db_manager.get_collection("appointments")
    payments_col = db_manager.get_collection("payments")

    apt_doc = None
    if verify_data.appointmentId:
        apt_doc = await apts_col.find_one({"id": verify_data.appointmentId})
        await apts_col.update_one(
            {"id": verify_data.appointmentId},
            {
                "$set": {
                    "paymentStatus": "paid",
                    "paymentMethod": "razorpay",
                    "transactionId": verify_data.razorpay_payment_id
                }
            }
        )

    # Store transaction in payments ledger
    payment_record = {
        "id": f"payrec-{uuid.uuid4().hex[:8]}",
        "orderId": verify_data.razorpay_order_id,
        "paymentId": verify_data.razorpay_payment_id,
        "appointmentId": verify_data.appointmentId,
        "amount": apt_doc.get("servicePrice") if apt_doc else None,
        "currency": settings.RAZORPAY_CURRENCY,
        "customerName": apt_doc.get("customerName") if apt_doc else None,
        "customerEmail": apt_doc.get("customerEmail") if apt_doc else None,
        "serviceName": apt_doc.get("serviceName") if apt_doc else None,
        "status": "verified",
        "gateway": "razorpay",
        "verifiedAt": datetime.utcnow().isoformat()
    }
    await payments_col.insert_one(payment_record)

    return {
        "success": True,
        "message": "Payment verified and transaction recorded in database successfully.",
        "transactionId": verify_data.razorpay_payment_id
    }


@router.get("")
async def list_payments(current_user: dict = Depends(require_role(["owner"]))):
    """Lists verified payment transactions stored in MongoDB for Owner ledger."""
    payments_col = db_manager.get_collection("payments")
    cursor = payments_col.find({}).sort("verifiedAt", -1)
    records = await cursor.to_list(length=300)
    for rec in records:
        rec.pop("_id", None)
    return records


import asyncio
import httpx
from datetime import datetime
from app.database import init_database, db_manager

BASE_URL = "http://127.0.0.1:8000/api"

async def test_full_portal_workflow():
    print("=" * 60)
    print("STARTING FULL END-TO-END WORKFLOW & REAL-TIME SYNC TEST")
    print("=" * 60)

    # Ensure MongoDB is initialized
    await init_database()
    assert db_manager.is_connected_to_mongodb is True, "Must be connected to MongoDB Atlas / Local MongoDB"
    print("✓ MongoDB Atlas Database connection verified.")

    # Clean up test appointments at this test slot
    await db_manager.db["appointments"].delete_many({"date": "2026-11-15", "time": "04:00 PM"})
    await db_manager.db["customers"].delete_many({"id": "cust-test-100"})

    # 1. Customer books an appointment
    print("\n[Step 1] Customer books a new appointment via API...")
    new_apt_payload = {
        "customerId": "cust-test-100",
        "customerName": "Ananya Sharma",
        "customerEmail": "ananya.s@example.com",
        "customerPhone": "+91 98888 77777",
        "serviceId": "srv-1",
        "workerId": "w-2", # Initially booked with Worker 2 (Julian Brooks)
        "date": "2026-11-15",
        "time": "04:00 PM",
        "paymentMethod": "razorpay",
        "paymentStatus": "paid",
        "notes": "Wedding styling session"
    }

    async with httpx.AsyncClient(base_url="http://127.0.0.1:8000") as client:
        # Check backend health
        health = await client.get("/api/health")
        assert health.status_code == 200, "Backend health check failed"

        # Customer books appointment
        book_res = await client.post("/api/appointments", json=new_apt_payload)
        assert book_res.status_code == 200, f"Booking failed: {book_res.text}"
        booked_apt = book_res.json()
        apt_id = booked_apt["id"]
        print(f"✓ Appointment successfully booked! ID: {apt_id}, Initial Worker: {booked_apt['workerName']} ({booked_apt['workerId']})")
        assert booked_apt["customerId"] == "cust-test-100", "Customer ID must be stored on appointment"

        # 2. Booking appears in Admin Dashboard
        print("\n[Step 2] Admin Dashboard fetches all appointments...")
        admin_token_headers = {"Authorization": "Bearer demo-jwt-token-owner"}
        admin_apts_res = await client.get("/api/appointments", headers=admin_token_headers)
        assert admin_apts_res.status_code == 200
        admin_apts = admin_apts_res.json()
        found_in_admin = any(a["id"] == apt_id for a in admin_apts)
        assert found_in_admin, "New appointment must immediately appear in Admin Dashboard"
        print(f"✓ Appointment {apt_id} verified present in Admin Dashboard! (Total bookings: {len(admin_apts)})")

        # 3. Owner assigns the appointment to Worker 1 (Aria Montgomery: w-1)
        print("\n[Step 3] Owner reassigns appointment to Worker 1 (w-1)...")
        assign_res = await client.patch(
            f"/api/owner/appointments/{apt_id}/assign",
            json={"workerId": "w-1"},
            headers=admin_token_headers
        )
        assert assign_res.status_code == 200, f"Assignment failed: {assign_res.text}"
        print("✓ Owner reassignment API succeeded.")

        # Verify in MongoDB
        db_doc = await db_manager.db["appointments"].find_one({"id": apt_id})
        assert db_doc["workerId"] == "w-1", "WorkerId in MongoDB must be updated to w-1"
        assert db_doc["workerName"] == "Aria Montgomery", "WorkerName in MongoDB must be updated to Aria Montgomery"
        print(f"✓ MongoDB verified: Appointment {apt_id} is now assigned to {db_doc['workerName']} (w-1)")

        # 4. Appointment appears in Worker 1's Dashboard
        print("\n[Step 4] Checking Worker 1's Dashboard (w-1)...")
        worker_token_headers = {"Authorization": "Bearer worker-jwt-token-w-1"}
        worker1_res = await client.get("/api/appointments", headers=worker_token_headers)
        assert worker1_res.status_code == 200
        worker1_apts = worker1_res.json()
        found_in_w1 = any(a["id"] == apt_id for a in worker1_apts)
        assert found_in_w1, "Appointment must appear in Worker 1's dashboard"
        print(f"✓ Appointment {apt_id} verified present in Worker 1's (Aria Montgomery) queue!")

        # Also verify it does NOT appear in Worker 2's dashboard (Data isolation)
        worker2_res = await client.get("/api/appointments", headers={"Authorization": "Bearer worker-jwt-token-w-2"})
        worker2_apts = worker2_res.json()
        assert not any(a["id"] == apt_id for a in worker2_apts), "Appointment must NOT appear in Worker 2's queue"
        print("✓ Verified Worker data isolation: Appointment does NOT appear in Worker 2's queue.")

        # 5. Worker 1 completes the appointment
        print("\n[Step 5] Worker 1 starts and completes the appointment...")
        # Start
        start_res = await client.patch(f"/api/worker/appointments/{apt_id}/start", headers=worker_token_headers)
        assert start_res.status_code == 200
        print("✓ Worker 1 marked appointment: in_progress")

        # Complete
        complete_res = await client.patch(f"/api/worker/appointments/{apt_id}/complete", headers=worker_token_headers)
        assert complete_res.status_code == 200
        print("✓ Worker 1 marked appointment: completed")

        # 6. Admin sees the completed status
        print("\n[Step 6] Admin Dashboard checks updated status...")
        admin_check_res = await client.get("/api/appointments", headers=admin_token_headers)
        admin_check_apts = admin_check_res.json()
        target_in_admin = next(a for a in admin_check_apts if a["id"] == apt_id)
        assert target_in_admin["status"] == "completed", f"Status in admin must be completed, got {target_in_admin['status']}"
        print(f"✓ Admin Dashboard verified: Appointment {apt_id} status is '{target_in_admin['status']}'")

        # 7. Customer sees the updated appointment status and assigned worker
        print("\n[Step 7] Customer Portal checks their updated booking...")
        cust_token_headers = {"Authorization": "Bearer demo-jwt-token-customer"}
        cust_check_res = await client.get(f"/api/appointments?email={new_apt_payload['customerEmail']}", headers=cust_token_headers)
        cust_apts = cust_check_res.json()
        target_in_cust = next((a for a in cust_apts if a["id"] == apt_id), None)
        assert target_in_cust is not None, "Customer must see their booking"
        assert target_in_cust["status"] == "completed", f"Customer must see completed status, got {target_in_cust['status']}"
        assert target_in_cust["workerName"] == "Aria Montgomery", f"Customer must see assigned worker Aria Montgomery, got {target_in_cust['workerName']}"
        print(f"✓ Customer Portal verified: Sees status '{target_in_cust['status']}' and assigned specialist '{target_in_cust['workerName']}'!")

        # 8. Test Double Booking Prevention
        print("\n[Step 8] Testing Double Booking Prevention...")
        duplicate_payload = {
            "customerName": "Second Customer",
            "customerEmail": "second@example.com",
            "customerPhone": "+91 99999 11111",
            "serviceId": "srv-2",
            "workerId": "w-1", # Same worker
            "date": "2026-11-15",
            "time": "04:00 PM", # Same time slot
            "paymentMethod": "cash"
        }
        # First reopen the appointment to confirmed to test conflict
        await client.patch(f"/api/appointments/{apt_id}/status", json={"status": "confirmed"})
        dup_res = await client.post("/api/appointments", json=duplicate_payload)
        assert dup_res.status_code == 409, f"Duplicate booking must return 409 Conflict, got {dup_res.status_code}"
        print("✓ Double Booking Prevention passed! Conflict returned HTTP 409 as expected.")

    print("\n" + "=" * 60)
    print("ALL 7 STEPS IN COMPLETE WORKFLOW PASSED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(test_full_portal_workflow())

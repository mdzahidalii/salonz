import asyncio
from app.database import init_database, db_manager
from app.security import hash_password, verify_password, create_access_token, decode_access_token

async def test_backend():
    print("1. Initializing database...")
    await init_database()
    
    users_col = db_manager.get_collection("users")
    user_count = await users_col.count_documents({})
    print(f"   --> Seeded users: {user_count}")
    
    workers_col = db_manager.get_collection("workers")
    worker_count = await workers_col.count_documents({})
    print(f"   --> Seeded workers: {worker_count}")
    
    services_col = db_manager.get_collection("services")
    service_count = await services_col.count_documents({})
    print(f"   --> Seeded services: {service_count}")
    
    apts_col = db_manager.get_collection("appointments")
    apt_count = await apts_col.count_documents({})
    print(f"   --> Seeded appointments: {apt_count}")

    print("2. Testing password hashing & verification...")
    pw = "secretpassword123"
    hashed = hash_password(pw)
    assert verify_password(pw, hashed) is True
    assert verify_password("wrongpassword", hashed) is False
    print("   --> Password hashing & verification passed!")

    print("3. Testing JWT token encoding & decoding...")
    token = create_access_token({"sub": "usr-1", "role": "owner", "email": "owner@aurasalon.com"})
    decoded = decode_access_token(token)
    assert decoded["sub"] == "usr-1"
    assert decoded["role"] == "owner"
    print("   --> JWT creation & validation passed!")

    print("\nALL BACKEND CORE TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    asyncio.run(test_backend())


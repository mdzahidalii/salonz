import uuid
from fastapi import APIRouter, HTTPException, status, Depends
from app.models import UserRegister, UserLogin, UserOut, TokenResponse
from app.database import db_manager
from app.security import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse)
async def register_user(user_in: UserRegister):
    """
    Registers a new user (Customer by default).
    Ensures email uniqueness and hashes credentials securely.
    """
    users_col = db_manager.get_collection("users")
    existing = await users_col.find_one({"email": user_in.email.lower()})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    user_id = f"usr-{uuid.uuid4().hex[:8]}"
    hashed_pwd = hash_password(user_in.password)

    new_user_doc = {
        "id": user_id,
        "name": user_in.name,
        "email": user_in.email.lower(),
        "phone": user_in.phone or "",
        "password": hashed_pwd,
        "role": user_in.role or "customer",
        "worker_id": user_in.worker_id
    }

    await users_col.insert_one(new_user_doc)

    # Issue JWT token
    access_token = create_access_token(data={
        "sub": user_id,
        "email": new_user_doc["email"],
        "name": new_user_doc["name"],
        "role": new_user_doc["role"],
        "worker_id": new_user_doc["worker_id"]
    })

    user_out = UserOut(
        id=user_id,
        name=new_user_doc["name"],
        email=new_user_doc["email"],
        phone=new_user_doc["phone"],
        role=new_user_doc["role"],
        worker_id=new_user_doc["worker_id"]
    )

    return TokenResponse(access_token=access_token, user=user_out)

@router.post("/login", response_model=TokenResponse)
async def login_user(login_data: UserLogin):
    """
    Authenticates a user by email, password, and expected role.
    Issues a signed JWT bearer token.
    """
    users_col = db_manager.get_collection("users")
    user = await users_col.find_one({"email": login_data.email.lower()})

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    # Verify password hash
    if not verify_password(login_data.password, user.get("password", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    # Verify role isolation
    if login_data.role and user.get("role") != login_data.role:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"This account is registered with role '{user.get('role')}', not '{login_data.role}'."
        )

    # Issue JWT token
    access_token = create_access_token(data={
        "sub": user["id"],
        "email": user["email"],
        "name": user["name"],
        "role": user["role"],
        "worker_id": user.get("worker_id")
    })

    user_out = UserOut(
        id=user["id"],
        name=user["name"],
        email=user["email"],
        phone=user.get("phone"),
        role=user["role"],
        worker_id=user.get("worker_id")
    )

    return TokenResponse(access_token=access_token, user=user_out)

@router.get("/me", response_model=UserOut)
async def get_current_user_profile(current_user: dict = Depends(get_current_user)):
    """Returns the verified profile of the token bearer."""
    return UserOut(
        id=current_user["id"],
        name=current_user["name"],
        email=current_user["email"],
        role=current_user["role"],
        worker_id=current_user.get("worker_id")
    )


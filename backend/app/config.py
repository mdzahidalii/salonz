import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file from backend root
env_path = Path(__file__).resolve().parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

class Settings:
    # App
    APP_NAME: str = "AURA Salon & Atelier API"
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"
    
    # JWT Authentication
    JWT_SECRET: str = os.getenv("JWT_SECRET", "aura_salon_jwt_super_secret_key_production_grade_982347")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
    
    # MongoDB Atlas
    MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "aura_salon_db")
    
    # Razorpay Test Mode
    RAZORPAY_KEY_ID: str = os.getenv("RAZORPAY_KEY_ID", "rzp_test_placeholderKey")
    RAZORPAY_KEY_SECRET: str = os.getenv("RAZORPAY_KEY_SECRET", "test_secret_placeholder")
    RAZORPAY_CURRENCY: str = os.getenv("RAZORPAY_CURRENCY", "INR")
    
    # Google Maps
    GOOGLE_MAPS_API_KEY: str = os.getenv("GOOGLE_MAPS_API_KEY", "")

settings = Settings()


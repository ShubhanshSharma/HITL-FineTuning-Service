import random
from datetime import datetime, timedelta, timezone
from fastapi import Depends
from sqlalchemy.orm import Session
from app.db.models import OTP
from sqlalchemy.exc import IntegrityError

from app.api.deps import get_db

def generate_and_save_otp(email: str, db: Session) -> str:
    """
    Generate a random 6-digit OTP and save it to the database.
    If OTP already exists for this email, it will be updated.
    
    Args:
        email: Email address to save OTP for
        db: Database session
        
    Returns:
        The generated OTP code as string
    """
    # Generate random 6-digit code
    otp_code = str(random.randint(100000, 999999))
    print(f"Generated OTP code: {otp_code} for email: {email}")
    
    # Delete any existing OTP for this email
    deleted_count = db.query(OTP).filter(OTP.email == email).delete()
    db.commit()
    print(f"Deleted {deleted_count} existing OTP(s) for email: {email}")
    
    # Calculate expiration time (6 minutes from now)
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=6)
    
    # Create new OTP record
    otp = OTP(
        email=email,
        otp_code=otp_code,
        expires_at = expires_at
    )
    
    try:
        db.add(otp)
        db.commit()
        db.refresh(otp)
        print(f"Successfully saved OTP for email: {email}")
        return otp_code
    except IntegrityError:
        db.rollback()
        print(f"Failed to save OTP for email: {email}")
        raise Exception(f"Failed to save OTP for email: {email}")


def verify_otp(email: str, code: str, db: Session) -> bool:
    print(f"Verifying OTP for email: {email}")
    
    otp = db.query(OTP).filter(OTP.email == email).first()
    
    if not otp:
        print(f"No OTP found for email: {email}")
        return False
    
    print(f"OTP found for email: {email}, checking expiration and code match")
    
    # Check if OTP has expired by comparing current time with expires_at
    current_time = datetime.now(timezone.utc)
    expires_at_utc = otp.expires_at.replace(tzinfo=timezone.utc) if otp.expires_at.tzinfo is None else otp.expires_at
    print(f"Current time: {current_time}, expires_at: {expires_at_utc}")
    
    if current_time > expires_at_utc:
        print(f"OTP expired for email: {email}")
        db.delete(otp)
        db.commit()
        return False
    
    # Check if code matches (convert both to strings for comparison)
    print(f"Comparing provided code: {code} with stored code: {otp.otp_code}")
    if str(otp.otp_code) != str(code):
        print(f"Code mismatch for email: {email}")
        return False
    
    # Delete OTP after successful verification
    print(f"OTP verified successfully for email: {email}, deleting record")
    db.delete(otp)
    db.commit()
    
    return True
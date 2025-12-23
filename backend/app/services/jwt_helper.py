from datetime import datetime, timedelta
from jose import  JWTError, jwt

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()
JWT_SECRET = "change-this"
JWT_ALGORITHM = "HS256" 
JWT_TTL_MINUTES = 60 * 24 * 30



def create_org_token(org_id: str, version: int) -> str:
    payload = {
        "org_id": org_id,
        "version": version,
        "iat": datetime.utcnow(),
        "exp": datetime.utcnow() + timedelta(minutes=JWT_TTL_MINUTES),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)




def get_org_context(
    creds: HTTPAuthorizationCredentials = Depends(security),
):
    try:
        payload = jwt.decode(
            creds.credentials,
            JWT_SECRET,
            algorithms=[JWT_ALGORITHM],
        )
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )

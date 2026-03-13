from datetime import datetime, timedelta, timezone
from typing import Optional

from passlib.context import CryptContext
import jwt  # PyJWT


# Password hashing config (PBKDF2-SHA256)
pwd_context = CryptContext(
    schemes=["pbkdf2_sha256"],
    deprecated="auto"
)

# JWT config
SECRET_KEY = "super-secret-key-change-this-later"  # for real app, load from env
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60  # 1 hour


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "iat": now})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
def decode_access_token(token: str) -> dict:
    """
    Decode a JWT access token and return the payload.
    Raises an exception if invalid/expired.
    """
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])


from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from .db import get_db
from .models.user import User
import os

# JWT Configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-here")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

security = HTTPBearer()

def create_access_token(data: dict, expires_delta: timedelta = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str):
    """Verify JWT token and return payload"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return user_id
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Get current authenticated user"""
    try:
        user_id = verify_token(credentials.credentials)
        
        # Пробуем получить пользователя стандартным способом
        try:
            user = db.query(User).filter(User.id == user_id).first()
            
            if user is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="User not found",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            
            if not user.is_active:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Inactive user"
                )
            
            return user
            
        except Exception as e:
            # Если ошибка связана с отсутствующей колонкой
            if "column users.is_verified does not exist" in str(e):
                # Используем прямой SQL запрос без проблемных колонок
                from sqlalchemy.sql import text
                result = db.execute(
                    text("SELECT id, username, email, hashed_password, balance, is_active, created_at, updated_at FROM users WHERE id = :id"),
                    {"id": user_id}
                )
                user_data = result.fetchone()
                
                if user_data is None:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="User not found",
                        headers={"WWW-Authenticate": "Bearer"},
                    )
                
                # Проверяем активность пользователя
                if not user_data.is_active:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Inactive user"
                    )
                
                # Создаем объект пользователя из результата запроса
                user = User()
                user.id = user_data.id
                user.username = user_data.username
                user.email = user_data.email
                user.hashed_password = user_data.hashed_password
                user.balance = user_data.balance
                user.is_active = user_data.is_active
                user.created_at = user_data.created_at
                user.updated_at = user_data.updated_at
                
                # Добавляем отсутствующие атрибуты
                user.is_verified = False
                user.last_login = None
                
                return user
            else:
                # Если ошибка не связана с отсутствующей колонкой
                raise
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Failed to authenticate user: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

def get_current_user_id(current_user: User = Depends(get_current_user)) -> int:
    """Get current user ID (convenience function)"""
    return current_user.id

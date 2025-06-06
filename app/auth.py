from fastapi import Depends, HTTPException
from fastapi_jwt_auth import AuthJWT
from fastapi_jwt_auth.exceptions import AuthJWTException
import os

@AuthJWT.load_config
def get_config():
    from pydantic import BaseModel
    class Settings(BaseModel):
        authjwt_secret_key: str = os.getenv("JWT_SECRET_KEY")
    return Settings()

def get_current_user(Authorize: AuthJWT = Depends()):
    try:
        Authorize.jwt_required()
        return Authorize.get_jwt_subject()
    except AuthJWTException:
        raise HTTPException(status_code=401, detail="Invalid token")

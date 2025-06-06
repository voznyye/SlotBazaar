from fastapi import APIRouter, Depends, HTTPException
from fastapi_jwt_auth import AuthJWT
from pydantic import BaseModel

router = APIRouter()

users = {}

class User(BaseModel):
    username: str
    password: str

@router.post("/register")
def register(user: User):
    if user.username in users:
        raise HTTPException(status_code=400, detail="User exists")
    users[user.username] = user.password
    return {"msg": "User registered"}

@router.post("/login")
def login(user: User, Authorize: AuthJWT = Depends()):
    if users.get(user.username) != user.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = Authorize.create_access_token(subject=user.username)
    return {"access_token": token}
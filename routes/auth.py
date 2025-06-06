from fastapi import APIRouter, HTTPException
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
def login(user: User):
    if users.get(user.username) != user.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"msg": "Login successful", "username": user.username}
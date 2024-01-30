from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from dependencies import get_db
from models.user import User
from routers import documents, user
from typing import Annotated
from repo import fake_users_db

app = FastAPI(dependencies=[Depends(get_db)])
app.include_router(documents.router)
app.include_router(user.router)

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.post("/token")
async def login(form_data: Annotated[OAuth2PasswordRequestForm, Depends()]):
    user = fake_users_db.get(form_data.username)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    return {"access_token": user['username'], "token_type": "bearer"}

@app.post("/register")
async def register(user: User, db: Annotated[dict, Depends(get_db)]):
    db['client'].from_("users").insert([user.dict()]).execute() 
    return {"message": "registered"}

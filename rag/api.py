from auth.oauth import create_access_token
from db.user import get_user
from dependencies import get_db
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from models.user import User
from models.auth import Token
from repo import fake_users_db
from routers import documents, user
from typing import Annotated

app = FastAPI(dependencies=[Depends(get_db)])
app.include_router(documents.router)
app.include_router(user.router)


@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.post("/login", response_model=Token)
def login(userdetails: OAuth2PasswordRequestForm = Depends(), db:dict = Depends(get_db)):
    user = get_user(userdetails.username, db)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail=f"The User Does not exist"
        )

    # if not utils.verify_password(userdetails.password, user.password):
    # raise HTTPException(status_code=status.HTTP._401_UNAUTHORIZED, detail="The Passwords do not match")

    print("user found", user)
    access_token = create_access_token(data={"email": "email"})
    return {"access_token": access_token, "token_type": "bearer"}


@app.post("/register")
async def register(user: User, db: Annotated[dict, Depends(get_db)]):
    db["client"].from_("users").insert([user.dict()]).execute()
    return {"message": "registered"}

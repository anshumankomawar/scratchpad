from auth.oauth import create_access_token
from db.user import get_user
from dependencies import get_db
from fastapi import FastAPI, Depends, HTTPException, status, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from models.user import User
from models.auth import Token
from routers import documents, user
from typing import Annotated

app = FastAPI(dependencies=[Depends(get_db)])
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(documents.router)
app.include_router(user.router)


@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.post("/login", response_model=Token)
def login(response: Response, userdetails: OAuth2PasswordRequestForm = Depends(), db:dict = Depends(get_db)):
    user = get_user(userdetails.username, db)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail=f"The User Does not exist"
        )

    # if not utils.verify_password(userdetails.password, user.password):
    # raise HTTPException(status_code=status.HTTP._401_UNAUTHORIZED, detail="The Passwords do not match")

    access_token = create_access_token(data={"email": user["email"]})
    response.set_cookie(key="access_token", value=f"Bearer {access_token}", httponly=True)
    return {"access_token": access_token, "token_type": "bearer"}


@app.post("/register")
async def register(user: User, db: Annotated[dict, Depends(get_db)]):
    db["client"].from_("users").insert([user.dict()]).execute()
    return {"message": "registered"}

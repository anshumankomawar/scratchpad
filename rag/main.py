from auth.oauth import create_access_token
from db.user import get_user
from dependencies import get_db
from fastapi import FastAPI, Depends, HTTPException, status, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from fastapi_utils.timing import add_timing_middleware
from starlette.testclient import TestClient
from models.user import User
from models.auth import Token
from routers import user, document, documents, search, text_search, folders
from typing import Annotated
import asyncio
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
app = FastAPI(dependencies=[Depends(get_db)])
add_timing_middleware(app, record=logger.info, prefix="app", exclude="untimed")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8000", "http://localhost:1420", "tauri://localhost", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(user.router)
app.include_router(document.router)
app.include_router(documents.router)
app.include_router(search.router)
app.include_router(text_search.router)
app.include_router(folders.router)

@app.get("/timed")
async def get_timed() -> None:
    await asyncio.sleep(0.05)


@app.get("/untimed")
async def get_untimed() -> None:
    await asyncio.sleep(0.1)


@app.get("/")
async def root():
    return {"message": "Hello World"}

TestClient(app).get("/timed")

@app.post("/login", response_model=Token)
def login(response: Response, userdetails: OAuth2PasswordRequestForm = Depends(), db:dict = Depends(get_db)):
    user = get_user(userdetails.username, db)
    print(user)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail=f"The User Does not exist"
        )

    # if not utils.verify_password(userdetails.password, user.password):
    # raise HTTPException(status_code=status.HTTP._401_UNAUTHORIZED, detail="The Passwords do not match")

    access_token = create_access_token(data={"email": user["email"]})
    response.set_cookie(key="access_token", value=f"Bearer {access_token}", httponly=True, samesite="none", secure=True)
    response.set_cookie(key="active_session", value="1", samesite="none", secure=True)
    return {"access_token": access_token, "token_type": "bearer"}


@app.post("/register")
async def register(user: User, db: Annotated[dict, Depends(get_db)]):
    db["client"].from_("users").insert([user.dict()]).execute()
    email = user.dict()['email']
    folder_to_insert = {
            "name": "root",
            "email":email,
        }
    response = db["client"].from_("folders").insert(folder_to_insert).execute()
    new_folder_id = response.data[0]['id']
    db["client"].from_("folders").update({'parent_id':new_folder_id}).eq("email", email).eq("id", new_folder_id).execute()
    return {"message": "registered"}
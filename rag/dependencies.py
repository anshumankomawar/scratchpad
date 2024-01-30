from db.supabase import create_supabase_client
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from typing import Annotated
from repo import fake_users_db

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def get_db():
    return {"client":create_supabase_client()}

async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]):
    user = fake_users_db.get(token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


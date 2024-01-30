from dependencies import get_current_user
from fastapi import APIRouter, Depends
from typing import Annotated
from models.user import User 

router = APIRouter(tags = ["users"], dependencies=[Depends(get_current_user)])

@router.get("/user")
async def get_user(current_user: Annotated[User, Depends(get_current_user)]):
    return current_user

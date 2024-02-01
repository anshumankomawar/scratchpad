from fastapi import APIRouter, Depends
from typing import Annotated
from dependencies import get_db
from auth.oauth import get_current_user
from models.user import User

router = APIRouter(tags=["document_data"], dependencies=[Depends(get_db), Depends(get_current_user)])

@router.get("/get_documents")
async def get_documents(db: Annotated[dict, Depends(get_db)], current_user: Annotated[User, Depends(get_current_user)]):
    try:
        email = current_user["email"]
        documents = db["client"].from_("document_data").select("*").eq("email", email).execute()
        return {"message": documents}
    except Exception as e:
        print("Error", e)
        return {"message": "couldnt get documents for specified user"}
    
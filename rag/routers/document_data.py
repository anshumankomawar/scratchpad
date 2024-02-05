from fastapi import APIRouter, Depends
from typing import Annotated
from auth.oauth import get_current_user
from dependencies import get_db
from models.user import User

router = APIRouter(tags=["document_data"], dependencies=[Depends(get_db)])

@router.get("/document_data", tags=["document_data"])
def get_document_data(db: Annotated[dict, Depends(get_db)]):
    try:
        documents = db["client"].from_("document_data").select("*").execute()
        return {"message": documents}
    except Exception as e:
        print("Error", e)
        return {"message": "couldnt get documents"}

@router.get("/document")
async def get_user_documents(db: Annotated[dict, Depends(get_db)], current_user: Annotated[User, Depends(get_current_user)]):
    print(current_user)
    try:
        result = db["client"].from_('document_data').select('filename, content').eq('email', current_user["email"]).execute()
        return {"documents": result.data}
    except Exception as e:
        print("Error", e)
        return {"message": "couldnt get users documents"}

from fastapi import APIRouter, Depends
from typing import Annotated
from dependencies import get_db

router = APIRouter(tags = ["documents"], dependencies=[Depends(get_db)])

@router.post("/documents", tags = ["documents"])
def get_documents(db: Annotated[dict, Depends(get_db)]):
    try:
        documents = db.from_("documents").select("*").execute()
        return {"message":documents}
    except Exception as e:
        print("Error", e)
        return {"message": "couldnt get documents"}
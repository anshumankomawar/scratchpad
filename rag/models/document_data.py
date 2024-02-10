from pydantic import BaseModel

class DocumentData(BaseModel):
    id:str
    email:str
    content:str
    filename:str
    generated:bool

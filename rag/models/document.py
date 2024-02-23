from pydantic import BaseModel

class Document(BaseModel):
    id:str
    email:str
    content:str
    filename:str
    generated:bool
    folder_id:str

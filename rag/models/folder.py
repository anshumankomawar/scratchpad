from pydantic import BaseModel

class Folder(BaseModel):
    id:str
    name:str
    email:str
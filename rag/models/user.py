from pydantic import BaseModel


class User(BaseModel):
    username: str
    email: str 
    password: str
    full_name: str


class UserPerm(BaseModel):
    email: str
    perm: str
    doc_id: str

from pydantic import BaseModel

class User(BaseModel):
    username: str
    email: str | None = None
    password: str | None = None
    full_name: str | None = None

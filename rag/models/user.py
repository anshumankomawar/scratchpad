from pydantic import BaseModel, validator
from typing import Optional

class User(BaseModel):
    username: str
    email: str | None = None
    password: str | None = None
    full_name: str | None = None
    doc: Optional[list]

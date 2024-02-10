from typing import List
from pydantic import BaseModel

class Queries(BaseModel):
    id: str
    doc: str
    email: str
    query: str
    metadat: str
    embedding: List[float]

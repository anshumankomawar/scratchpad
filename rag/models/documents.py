from typing import List
from pydantic import BaseModel

class Document(BaseModel):
    id: str
    content: str
    metadata: str
    embedding: List[float]
    # owner (doesn't change, not null)
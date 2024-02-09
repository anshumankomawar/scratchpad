from typing import List
from pydantic import BaseModel

class Chunk(BaseModel):
    id: str
    doc_id:str
    content: str
    metadata: str
    embedding: List[float]

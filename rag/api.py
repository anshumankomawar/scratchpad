from fastapi import FastAPI, Depends
from dependencies import get_db
from routers import documents

app = FastAPI(dependencies=[Depends(get_db)])

app.include_router(documents.router)
@app.get("/")
async def root():
    return {"message": "Hello World"}
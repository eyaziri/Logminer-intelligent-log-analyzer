from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.hinter.hinter import router as hint_router
from src.parser.parser import router as rag_router

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register the routers
app.include_router(hint_router)
app.include_router(rag_router)

from fastapi import FastAPI
from app.db import engine, Base

from app.routes import auth_routes
from app.routes import onboarding_routes
from app.routes import support_routes

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="VectorX Banking API")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://127.0.0.1:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

app.include_router(auth_routes.router, prefix="/api/auth", tags=["Auth"])
app.include_router(onboarding_routes.router, prefix="/api/onboarding", tags=["Onboarding"])
app.include_router(support_routes.router, prefix="/api/support", tags=["Support"])

@app.get("/")
def home():
    return {"message": "Backend running 🚀"}
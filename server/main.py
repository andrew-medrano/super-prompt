from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import files, prompts

app = FastAPI(title="Super Prompt API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React client
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(files.router, prefix="/api/files", tags=["Files"])
app.include_router(prompts.router, prefix="/api/prompts", tags=["Prompts"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 
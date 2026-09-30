from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from routers.scholarships import router as scholarship_router
import os

app = FastAPI(
    title="ScholarPath API",
    description="Scholarship Recommendation System",
    version="2.0.0"
)

# ── CORS ──
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Include API Routers (must be before static mount) ──
app.include_router(scholarship_router)

# ── Resolve frontend directory ──
frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend"))

# ── Explicit HTML page routes ──
@app.get("/", response_class=FileResponse)
def serve_home():
    return FileResponse(os.path.join(frontend_dir, "index.html"))

@app.get("/form.html", response_class=FileResponse)
def serve_form():
    return FileResponse(os.path.join(frontend_dir, "form.html"))

@app.get("/results.html", response_class=FileResponse)
def serve_results():
    return FileResponse(os.path.join(frontend_dir, "results.html"))

@app.get("/detail.html", response_class=FileResponse)
def serve_detail():
    return FileResponse(os.path.join(frontend_dir, "detail.html"))

@app.get("/about.html", response_class=FileResponse)
def serve_about():
    return FileResponse(os.path.join(frontend_dir, "about.html"))

@app.get("/contact.html", response_class=FileResponse)
def serve_contact():
    return FileResponse(os.path.join(frontend_dir, "contact.html"))

@app.get("/analysis.html", response_class=FileResponse)
def serve_analysis():
    return FileResponse(os.path.join(frontend_dir, "analysis.html"))

@app.get("/courses.html", response_class=FileResponse)
def serve_courses():
    return FileResponse(os.path.join(frontend_dir, "courses.html"))

# ── Mount ALL frontend assets (css, js, images, png) at root ──
# This must come AFTER explicit routes so API routes take priority
if os.path.exists(frontend_dir):
    app.mount("/", StaticFiles(directory=frontend_dir, html=True), name="frontend")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

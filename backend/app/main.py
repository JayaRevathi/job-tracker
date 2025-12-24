from fastapi import FastAPI

app = FastAPI(title="Job Application Tracker")

@app.get("/health")
def health():
    return {"status": "ok"}
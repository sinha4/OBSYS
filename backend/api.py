from fastapi import FastAPI
from backend.engine import run_scheduler
from backend.system_state import get_processes

app = FastAPI()

@app.get("/")
def root():
    return {"status": "OBSYS backend running"}

@app.get("/schedule/{algo}")
def schedule(algo: str, quantum: int | None = None):
    processes = get_processes()

    if not processes:
        return {"error": "No processes to schedule"}

    process_data = [
        (p["pid"], p["arrival"], p["burst"])
        for p in processes
    ]

    result = run_scheduler(
        algo=algo,
        process_data=process_data,
        quantum=quantum
    )

    return result

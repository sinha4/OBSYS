from fastapi import FastAPI, Query, HTTPException
from typing import Optional

from backend.state_store import load_state
from backend.engine import run_scheduler

app = FastAPI()

@app.get("/schedule/{algo}")
def schedule(
    algo: str,
    quantum: Optional[int] = Query(None, gt=0)
):
    state = load_state()

    if state is None:
        raise HTTPException(status_code=400, detail="System state not initialized. Please create a state file first.")

    if not state.processes:
        raise HTTPException(status_code=400, detail="No processes found")

    # Pass the actual Process objects so the scheduler can access attributes like .arrival_time
    # and update .start_time, .finish_time, etc.
    result = run_scheduler(
        algo=algo,
        processes=state.processes,
        quantum=quantum
    )

    return result

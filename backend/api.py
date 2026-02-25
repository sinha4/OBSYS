from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional

from backend.state_store import load_state
from backend.engine import run_scheduler

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

    algo = algo.lower()
    # Pass the actual Process objects so the scheduler can access attributes like .arrival_time
    # and update .start_time, .finish_time, etc.
    result = run_scheduler(
        algo=algo,
        processes=state.processes,
        quantum=quantum
    )

    # Transform to match frontend expected format
    metrics = result.get("metrics", {})
    processes_data = metrics.get("processes", [])
    
    # Calculate system_time as max finish_time
    system_time = max((p.get("finish_time", 0) for p in processes_data), default=0)
    
    # Calculate CPU utilization (assuming total burst time / system_time * 100)
    total_burst = sum(p.burst_time for p in state.processes)
    cpu_utilization = (total_burst / system_time * 100) if system_time > 0 else 0

    # SAVE TO HISTORY
    from backend.db_models import SimulationRunDB
    from backend.database import SessionLocal
    session = SessionLocal()
    try:
        new_run = SimulationRunDB(
            algorithm=algo.upper(),
            avg_waiting_time=metrics.get("average_waiting_time", 0),
            avg_turnaround_time=metrics.get("average_turnaround_time", 0),
            cpu_utilization=cpu_utilization
        )
        session.add(new_run)
        session.commit()
    except Exception as e:
        print(f"Failed to save history: {e}")
    finally:
        session.close()

    return {
        "algorithm": algo.upper(),
        "system_time": system_time,
        "processes": [
            {
                "pid": str(p.get("pid")),
                "program": getattr(state.processes[i], "program", "unknown"),
                "arrival_time": getattr(state.processes[i], "arrival_time", 0),
                "burst_time": getattr(state.processes[i], "burst_time", 0),
                "start_time": getattr(state.processes[i], "start_time", 0),
                "finish_time": p.get("finish_time", 0),
                "turnaround_time": p.get("turnaround_time", 0),
                "waiting_time": p.get("waiting_time", 0),
            }
            for i, p in enumerate(processes_data)
        ],
        "avg_turnaround_time": metrics.get("average_turnaround_time", 0),
        "avg_waiting_time": metrics.get("average_waiting_time", 0),
        "cpu_utilization": cpu_utilization,
        "gantt": [
            {"pid": str(entry[0]), "start": entry[1], "end": entry[2]}
            for entry in result.get("gantt", [])
        ],
        "history": result.get("history")
    }

@app.get("/history")
def get_history():
    from backend.db_models import SimulationRunDB
    from backend.database import SessionLocal
    session = SessionLocal()
    try:
        history = session.query(SimulationRunDB).order_by(SimulationRunDB.timestamp.desc()).all()
        return [
            {
                "id": h.id,
                "algorithm": h.algorithm,
                "timestamp": h.timestamp.isoformat(),
                "avg_waiting_time": h.avg_waiting_time,
                "avg_turnaround_time": h.avg_turnaround_time,
                "cpu_utilization": h.cpu_utilization
            }
            for h in history
        ]
    finally:
        session.close()

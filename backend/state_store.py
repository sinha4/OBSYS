from backend.database import SessionLocal, init_db
from backend.db_models import ProcessDB
from backend.system_state import SystemState
from backend.models import Process

# Initialize database tables
init_db()

def load_state():
    session = SessionLocal()
    try:
        db_processes = session.query(ProcessDB).order_by(ProcessDB.arrival_time).all()
        if not db_processes:
            return None
        
        state = SystemState()
        state.processes = [
            Process(
                pid=p.pid,
                arrival_time=p.arrival_time,
                burst_time=p.burst_time,
                priority=p.priority,
                program=p.program
            ) for p in db_processes
        ]
        # Set next_pid based on existing processes
        if state.processes:
            state.next_pid = max(p.pid for p in state.processes) + 1
        return state
    finally:
        session.close()

def save_state(state: SystemState):
    session = SessionLocal()
    try:
        # For simplicity, we sync the current processes
        # First, remove any processes that are no longer in the state
        current_pids = [p.pid for p in state.processes]
        session.query(ProcessDB).filter(~ProcessDB.pid.in_(current_pids)).delete(synchronize_session=False)

        for p in state.processes:
            # Check if process exists
            db_p = session.query(ProcessDB).filter(ProcessDB.pid == p.pid).first()
            if not db_p:
                db_p = ProcessDB(
                    pid=p.pid,
                    program=p.program,
                    arrival_time=p.arrival_time,
                    burst_time=p.burst_time,
                    priority=p.priority
                )
                session.add(db_p)
            else:
                db_p.program = p.program
                db_p.arrival_time = p.arrival_time
                db_p.burst_time = p.burst_time
                db_p.priority = p.priority
        session.commit()
    finally:
        session.close()

def reset_state():
    session = SessionLocal()
    try:
        session.query(ProcessDB).delete()
        session.commit()
    finally:
        session.close()

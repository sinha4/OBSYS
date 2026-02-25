from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.database import Base

class ProcessDB(Base):
    __tablename__ = "processes"

    id = Column(Integer, primary_key=True, index=True)
    pid = Column(Integer, unique=True, index=True)
    program = Column(String, default="unknown")
    arrival_time = Column(Integer, default=0)
    burst_time = Column(Integer, default=0)
    priority = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

class SimulationRunDB(Base):
    __tablename__ = "simulation_runs"

    id = Column(Integer, primary_key=True, index=True)
    algorithm = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)
    avg_waiting_time = Column(Float)
    avg_turnaround_time = Column(Float)
    cpu_utilization = Column(Float)
    
    # Store Gantt chart as a serialized string or link to another table
    # For now, let's just store the summary metrics. 
    # Detailed steps could be another table if needed.

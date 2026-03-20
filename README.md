# OBSYS: Operating System Simulation Framework

![OBSYS Framework](https://img.shields.io/badge/Status-Active-brightgreen)
![Python Backend](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python-blue)
![React Frontend](https://img.shields.io/badge/Frontend-React%20%7C%20TypeScript-blue)
![Database](https://img.shields.io/badge/Database-SQLite%20%7C%20SQLAlchemy-red)

**OBSYS** is an advanced Operating System Simulation Framework designed to simulate, visualize, and analyze CPU scheduling algorithms in real-time. It provides a highly decoupled Client-Server architecture with a live interactive web dashboard and a seamless Command-Line Interface (CLI).

## Key Features
- **Real-Time Visualization:** Live Gantt Chart and Process Visualizer dynamically updating execution states based on a simulated clock.
- **Multiple Scheduling Algorithms:** Supports **First-Come-First-Served (FCFS)**, **Shortest Job First (SJF)**, **Round Robin (RR)**, and **Priority** scheduling algorithms.
- **Algorithm Comparison:** Parallel execution and visual comparison of performance metrics (Average Waiting Time, Turnaround Time, CPU Utilization).
- **Persistent State:** Real-time data sync between the Terminal (CLI) and Web Dashboard via SQLite and SQLAlchemy.
- **Robust Architecture:** Powered by a high-performance asynchronous **FastAPI** backend and an interactive **React + TypeScript** frontend.

## System Architecture

OBSYS is built on a decoupled, three-tier architecture:
1. **Backend (Python / FastAPI / Uvicorn):** The core engine handling mathematical derivations, process scheduling, and metric computations.
2. **Persistence Layer (SQLite / SQLAlchemy):** A data store preserving process configurations and historical simulations for comparative analysis.
3. **Frontend (React / TypeScript / Vite):** The user interface providing an interactive experience, leveraging custom React Hooks (`useSimulation`) to animate the execution history.

```text
 Terminal (CLI) <---> Database (SQLite) <---> Backend (FastAPI) <---> Web GUI (React)
```

## Getting Started

### Prerequisites
- Python 3.8+
- Node.js & npm (for the frontend)

### Installation
1. **Clone the repository:**
   ```bash
   git clone <repository_url>
   cd spd
   ```

2. **Set up the backend:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install fastapi uvicorn sqlalchemy pydantic
   ```

3. **Set up the frontend:**
   ```bash
   cd frontend
   npm install
   ```

### Running the Application

**Using the OBSYS CLI (Recommended)**
OBSYS provides a built-in CLI for seamless orchestration. From the root directory:
```bash
./obsys schedule
```
*This command automatically spins up both the FastAPI backend server and the React frontend server in the background.*

**Running Manually**
- **Backend:** `cd backend && uvicorn api:app --reload`
- **Frontend:** `cd frontend && npm run dev`

Navigate to `http://localhost:5173` in your browser to interact with the visual dashboard.

## Supported Scheduling Algorithms

- **FCFS (First-Come-First-Served):** A non-preemptive, simple queue-based execution.
- **SJF (Shortest Job First):** A non-preemptive algorithm that selects the process with the smallest burst time. (Proven optimal for minimal Average Waiting Time).
- **Round Robin:** A preemptive algorithm implementing time-slicing (Time Quantum).
- **Priority Scheduling:** Determines process execution order based on priority values (lower value = higher priority).

## Analytics and Metrics
The framework automatically calculates and compares critical performance metrics:
- **Average Waiting Time (AWT):** Turnaround Time - Burst Time.
- **Average Turnaround Time (ATAT):** Finish Time - Arrival Time.
- **CPU Utilization:** Evaluating system efficiency based on total burst time over total system time.

## Security & Best Practices
- **CORS Configuration:** Strictly isolates frontend-backend communication.
- **Input Validation (Pydantic):** Protects the API from invalid or mathematically impossible simulation values.
- **Targeted SQL Injection Prevention:** SQLAlchemy ORM parametrizes all queries securely.

---
*Created as part of an OS System Architecture Simulation Project.*

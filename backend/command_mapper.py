import random
from backend.models import Process

COMMAND_PROFILES = {
    "chrome": {"burst": (8, 12), "priority": 2},
    "vscode": {"burst": (6, 10), "priority": 2},
    "compile": {"burst": (12, 20), "priority": 1},
    "ls": {"burst": (1, 2), "priority": 3},
    "sleep": {"burst": (3, 5), "priority": 3},
}

def command_to_process(command, arrival, pid):
    if command not in COMMAND_PROFILES:
        raise ValueError(f"Unknown command: {command}")

    profile = COMMAND_PROFILES[command]
    burst_time = random.randint(*profile["burst"])

    return Process(
        pid=pid,
        arrival_time=arrival,
        burst_time=burst_time,
        priority=profile["priority"]
    )

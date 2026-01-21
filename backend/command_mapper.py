import random

COMMAND_PROFILES = {
    "chrome": {
        "burst": (8, 12),
        "priority": 2
    },
    "vscode": {
        "burst": (6, 10),
        "priority": 2
    },
    "compile": {
        "burst": (12, 20),
        "priority": 1
    },
    "ls": {
        "burst": (1, 2),
        "priority": 3
    },
    "sleep": {
        "burst": (3, 5),
        "priority": 3
    }
}

_pid_counter = 1

def command_to_process(command, current_time):
    global _pid_counter

    if command not in COMMAND_PROFILES:
        raise ValueError(f"Unknown command: {command}")

    profile = COMMAND_PROFILES[command]
    burst_time = random.randint(*profile["burst"])

    process = {
        "pid": _pid_counter,
        "arrival": current_time,
        "burst": burst_time,
        "priority": profile["priority"],
        "command": command
    }

    _pid_counter += 1
    return process

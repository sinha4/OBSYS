SYSTEM_TIME = 0
PROCESS_TABLE = []

def advance_time(t=1):
    global SYSTEM_TIME
    SYSTEM_TIME += t

def add_process(process):
    PROCESS_TABLE.append(process)

def get_processes():
    return PROCESS_TABLE

def reset_system():
    global SYSTEM_TIME, PROCESS_TABLE
    SYSTEM_TIME = 0
    PROCESS_TABLE = []

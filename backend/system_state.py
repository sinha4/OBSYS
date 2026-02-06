class SystemState:
    def __init__(self):
        self.time = 0
        self.processes = []
        self.next_pid = 1
def get_processes():
    from backend.state_store import load_state
    state = load_state()
    if state is None:
        return []
    return state.processes

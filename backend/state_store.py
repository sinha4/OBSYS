import pickle
import os
from backend.system_state import SystemState

STATE_FILE = os.path.expanduser("~/.obsys_state.pkl")


def load_state():
    if not os.path.exists(STATE_FILE):
        return None
    with open(STATE_FILE, "rb") as f:
        return pickle.load(f)


def save_state(state: SystemState):
    with open(STATE_FILE, "wb") as f:
        pickle.dump(state, f)


def reset_state():
    if os.path.exists(STATE_FILE):
        os.remove(STATE_FILE)

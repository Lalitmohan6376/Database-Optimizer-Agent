import sqlite3
import joblib
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
if (BASE_DIR / "backend" / "models").exists():
    MODELS_DIR = BASE_DIR / "backend" / "models"
elif (BASE_DIR / "models").exists():
    MODELS_DIR = BASE_DIR / "models"
else:
    MODELS_DIR = Path("backend/models")

def _load_model(filename):
    model_path = MODELS_DIR / filename
    if model_path.exists():
        return joblib.load(str(model_path))
    return joblib.load(f"backend/models/{filename}")

anomaly_model = _load_model("anomaly_detection_model.pkl")
time_model = _load_model("database_time_model.pkl")
index_model = _load_model("index_benefit_model.pkl")
benefit_model = index_model

conn = None

def load_models():
    global anomaly_model, time_model, index_model, benefit_model
    try:
        anomaly_model = _load_model("anomaly_detection_model.pkl")
        time_model = _load_model("database_time_model.pkl")
        index_model = _load_model("index_benefit_model.pkl")
        benefit_model = index_model
    except Exception:
        pass
    return True

def load_database(file_path):
    global conn
    if conn:
        try:
            conn.close()
        except Exception:
            pass
        conn = None
    conn = sqlite3.connect(file_path, check_same_thread=False)
    tables = [row[0] for row in conn.execute("SELECT name FROM sqlite_master WHERE type='table';").fetchall()]
    questions = [f"How can I optimize the '{t}' table?" for t in tables]
    return {"tables": tables, "suggested_questions": questions}

connect_db = load_database


connect_db = load_database
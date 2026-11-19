from langchain_core.tools import tool
import time
import pandas as pd
from backend import database_loader as db


@tool
def run_sql(query: str) -> str:
    """Run any SQL query on the database and return the result as a string."""
    if db.conn is None:
        return "Error: No database uploaded or connected yet."
    try:
        cursor = db.conn.execute(query)
        rows = cursor.fetchall()
        if not rows:
            return "Query executed successfully. (0 rows returned)"
        col_names = [d[0] for d in cursor.description] if cursor.description else []
        preview = rows[:50]
        header = f"Columns: {', '.join(col_names)}\n" if col_names else ""
        rows_str = "\n".join([str(r) for r in preview])
        if len(rows) > 50:
            rows_str += f"\n... ({len(rows) - 50} more rows truncated)"
        return f"{header}Rows ({len(preview)} shown, total {len(rows)}):\n{rows_str}"
    except Exception as e:
        return f"SQL Error: {str(e)}"


@tool
def predict_query_time(data: dict) -> str:
    """predict query execution time."""
    try:
        if "data" in data and isinstance(data["data"], dict):
            data = data["data"]
        df = pd.DataFrame([data])
        pred = float(db.time_model.predict(df)[0])
        return str(round(pred, 4))
    except Exception as e:
        return f"Error predicting query time: {str(e)}"


@tool
def predict_index_benefit(data: dict) -> str:
    """predict index benefit."""
    try:
        if "data" in data and isinstance(data["data"], dict):
            data = data["data"]
        df = pd.DataFrame([data])
        pred = float(db.benefit_model.predict(df)[0])
        return str(round(pred, 4))
    except Exception as e:
        return f"Error predicting index benefit: {str(e)}"


@tool
def detect_anomaly(data: dict) -> str:
    """Detect system anomaly from metrics."""
    try:
        if "data" in data and isinstance(data["data"], dict):
            data = data["data"]
        df = pd.DataFrame([data])
        pred = int(db.anomaly_model.predict(df)[0])
        return str(pred)
    except Exception as e:
        return f"Error detecting anomaly: {str(e)}"
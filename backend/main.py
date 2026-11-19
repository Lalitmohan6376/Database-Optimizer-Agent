import os
import sqlite3
from typing import Optional
from fastapi import FastAPI, UploadFile, Body, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, Response
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from langchain_core.messages import HumanMessage
from backend import database_loader as db
from backend.agent.graph import app_agent
from backend.agent.tools import predict_query_time, predict_index_benefit, detect_anomaly

app = FastAPI(title="Database Optimizer Agent API")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

db.load_models()
db.conn = None

router = APIRouter()

class ChatRequest(BaseModel):
    message: Optional[str] = None

class SqlExecuteRequest(BaseModel):
    sql: str

@router.post("/reset-db")
def reset_db():
    if db.conn:
        try:
            db.conn.close()
        except Exception:
            pass
        db.conn = None
    import gc
    gc.collect()
    db_path = "uploaded.db"
    if os.path.exists(db_path):
        try:
            os.remove(db_path)
        except Exception:
            pass
    return {"status": "cleared", "connected": False, "tables": []}

@router.post("/upload-db")
async def upload_db(file: UploadFile):
    content = await file.read()
    db_path = "uploaded.db"

    # Close existing connection if any so the file is not locked on Windows
    if db.conn:
        try:
            db.conn.close()
        except Exception:
            pass
        db.conn = None

    import gc
    gc.collect()

    if file.filename and file.filename.endswith(".sql"):
        # Connect to SQLite and wipe any existing tables/views first
        conn = sqlite3.connect(db_path, check_same_thread=False)
        cursor = conn.cursor()
        cursor.execute("PRAGMA foreign_keys = OFF;")
        existing = cursor.execute(
            "SELECT name, type FROM sqlite_master WHERE type IN ('table', 'view') AND name NOT LIKE 'sqlite_%';"
        ).fetchall()
        for name, item_type in existing:
            cursor.execute(f'DROP {item_type.upper()} IF EXISTS "{name}";')
        conn.commit()

        # Execute the uploaded SQL script
        conn.executescript(content.decode("utf-8", errors="ignore"))
        conn.commit()
        conn.close()
    else:
        if os.path.exists(db_path):
            try:
                os.remove(db_path)
            except Exception:
                pass
        with open(db_path, "wb") as f:
            f.write(content)

    info = db.load_database(db_path)
    return {
        "status": "uploaded",
        "tables": info.get("tables", []),
        "suggested_questions": info.get("suggested_questions", [])
    }

@router.post("/chat")
def chat(req: Optional[ChatRequest] = Body(None), message: Optional[str] = None):
    user_msg = (req.message if req and req.message else message) or ""
    if not user_msg.strip():
        return {"reply": "Please provide a valid message."}
    res = app_agent.invoke({"messages": [HumanMessage(content=user_msg)]})
    return {"reply": res["messages"][-1].content}

@router.get("/tables-info")
def get_tables_info():
    if not db.conn:
        return {"connected": False, "tables": []}
    cursor = db.conn.cursor()
    tables = [row[0] for row in cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';").fetchall()]
    table_details = []
    for t in tables:
        try:
            count = cursor.execute(f'SELECT COUNT(*) FROM "{t}"').fetchone()[0]
        except Exception:
            count = 0
        cols = cursor.execute(f'PRAGMA table_info("{t}")').fetchall()
        columns = [{"cid": c[0], "name": c[1], "type": c[2], "notnull": c[3], "pk": c[5]} for c in cols]
        idx = cursor.execute(f'PRAGMA index_list("{t}")').fetchall()
        indexes = [{"name": i[1], "unique": bool(i[2])} for i in idx]
        table_details.append({
            "name": t,
            "row_count": count,
            "columns": columns,
            "indexes": indexes
        })
    return {"connected": True, "tables": table_details}

@router.get("/table-preview/{table_name}")
def get_table_preview(table_name: str):
    if not db.conn:
        return {"error": "No database connected"}
    cursor = db.conn.cursor()
    try:
        cols = [c[1] for c in cursor.execute(f'PRAGMA table_info("{table_name}")').fetchall()]
        rows = cursor.execute(f'SELECT * FROM "{table_name}" LIMIT 100').fetchall()
        return {"table": table_name, "columns": cols, "rows": [list(r) for r in rows]}
    except Exception as e:
        return {"error": str(e)}

@router.post("/apply-sql")
def apply_sql(req: SqlExecuteRequest):
    if not db.conn:
        return {"success": False, "error": "No database connected"}
    try:
        db.conn.executescript(req.sql)
        db.conn.commit()
        return {"success": True, "message": "SQL applied successfully to the database!"}
    except Exception as e:
        return {"success": False, "error": str(e)}

@router.get("/download-db")
def download_db():
    db_path = "uploaded.db"
    if not os.path.exists(db_path):
        return {"error": "No database file available to download."}
    return FileResponse(db_path, media_type="application/x-sqlite3", filename="optimized_database.db")

@router.get("/download-sql")
def download_sql():
    if not db.conn:
        return {"error": "No database connected"}
    try:
        sql_dump = "\n".join(db.conn.iterdump())
        return Response(
            content=sql_dump,
            media_type="text/plain",
            headers={"Content-Disposition": "attachment; filename=optimized_database.sql"}
        )
    except Exception as e:
        return {"error": str(e)}

@router.post("/predict-time")
def time_api(data: dict):
    res = predict_query_time.invoke({"data": data})
    try:
        return {"result": float(res)}
    except (ValueError, TypeError):
        return {"result": res}

@router.post("/predict-index")
def index_api(data: dict):
    res = predict_index_benefit.invoke({"data": data})
    try:
        return {"result": float(res)}
    except (ValueError, TypeError):
        return {"result": res}

@router.post("/detect-anomaly")
def anomaly_api(data: dict):
    res = detect_anomaly.invoke({"data": data})
    try:
        return {"result": int(res)}
    except (ValueError, TypeError):
        return {"result": res}

# Mount routes to both root and /api for full compatibility with Vite and Direct access
app.include_router(router)
app.include_router(router, prefix="/api")

# Serve React static frontend if built
dist_dir = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
if os.path.exists(dist_dir):
    app.mount("/", StaticFiles(directory=dist_dir, html=True), name="static")
elif os.path.exists("frontend/dist"):
    app.mount("/", StaticFiles(directory="frontend/dist", html=True), name="static")

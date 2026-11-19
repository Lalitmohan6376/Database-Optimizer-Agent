# ⚡ AI Database Optimization Agent

An autonomous, hybrid database performance tuning and optimization system. The agent combines **Large Language Model (LLM) reasoning** (via LangChain & LangGraph) with **deterministic SQLite execution plan inspection** (`EXPLAIN QUERY PLAN`) and **trained scikit-learn machine learning pipelines** to detect database bottlenecks, formulate production-grade composite and covering B-Tree indexes, predict query execution latency, and identify hardware resource anomalies.

---

## 🌟 Key Features

* **Autonomous Table Scan Detection**: Inspects SQLite query execution plans to identify unindexed full table scans (`SCAN` vs. `SEARCH`) that cause quadratic slowdowns as datasets scale.
* **Smart B-Tree Index Recommendations**: Formulates single, composite, and covering indexes following the **Equality-Sort-Range (ESR)** heuristic, eliminating temporary on-disk sorting B-trees for `GROUP BY` and `ORDER BY`.
* **Zero-Risk Read-Only Safety Guardrails**: Restricts autonomous database operations to read-only introspection (`SELECT`, `PRAGMA`, `EXPLAIN`). Modifying indexes requires explicit user interaction (`Apply Index ⚡`).
* **Interactive Machine Learning Suite**:
  * **Query Latency Regressor**: Forecasts query execution duration (in seconds) based on row counts, columns, and system telemetry.
  * **Index Speedup Model**: Estimates throughput improvements and efficiency gains from candidate indexes.
  * **Anomaly Detection Classifier**: Classifies system metrics (CPU, RAM, instruction count, energy efficiency) to flag deadlock and Out-Of-Memory (OOM) risks.
* **Database Studio**: Live table browser displaying the top 100 rows of attached tables with sticky headers and clean formatting.
* **Full Mobile & Desktop Responsiveness**: Responsive UI supporting viewports down to 320px with persistent session state.

---

## 🏗️ System Architecture

```
┌────────────────────────────────────────────────────────┐
│           React 19 + Vite Frontend (UI)                │
│   (Optimizer Chat, Database Studio, Performance ML)    │
└───────────────────────────┬────────────────────────────┘
                            │ REST API (JSON / HTTP)
┌───────────────────────────▼────────────────────────────┐
│               FastAPI Backend Gateway                  │
└──────┬────────────────────┬─────────────────────┬──────┘
       │                    │                     │
┌──────▼─────────────┐┌─────▼──────────────┐┌─────▼──────┐
│  LangGraph Agent   ││ scikit-learn Models││   SQLite   │
│ (StateGraph ReAct) ││ (Time, Index, VM)  ││   Engine   │
│ - run_sql tool     ││ - time_model.pkl   ││ - PRAGMA   │
│ - ChatGroq LLM     ││ - index_model.pkl  ││ - EXPLAIN  │
│ - Safety Checks    ││ - anomaly_model.pkl││ - B-Trees  │
└────────────────────┘└────────────────────┘└────────────┘
```

---

## 🚀 Quickstart & Installation

### Prerequisites
* **Python 3.10+**
* **Node.js 18+** & npm
* A free **Groq API Key** (from [console.groq.com](https://console.groq.com))

### 1. Clone the Repository
```bash
git clone https://github.com/Lalitmohan6376/Database-Optimizer-Agent.git
cd Database-Optimizer-Agent
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Edit `.env` and add your Groq API key:
```env
GROQ_API_KEY=your_actual_groq_api_key_here
```

### 3. Backend Setup
Install Python dependencies and start the FastAPI server:
```bash
pip install -r requirements.txt
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
The backend API documentation will be available at: `http://127.0.0.1:8000/docs`.

### 4. Frontend Setup
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
Open your browser at `http://localhost:3000`.

---

## 📖 Interview Guide & Technical Report

For an in-depth breakdown of the system design, agent decision loop, real-world enterprise use cases, and interview questions:
* Open the included [Database_Agent_Interview_Guide.pdf](./Database_Agent_Interview_Guide.pdf).

---

## 🛡️ License
This project is licensed under the MIT License.

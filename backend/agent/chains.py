from langchain_groq import ChatGroq
from backend.agent.prompt import prompt_template
from backend.agent.tools import run_sql,predict_index_benefit,predict_query_time,detect_anomaly
from dotenv import load_dotenv
from pathlib import Path

load_dotenv()
load_dotenv(dotenv_path=Path(__file__).parent / ".env")

llm = ChatGroq(model="openai/gpt-oss-120b", temperature=0)

tools = [run_sql,predict_index_benefit,detect_anomaly,predict_query_time]

llm_with_tools = llm.bind_tools(tools)

agent_chain = prompt_template | llm_with_tools
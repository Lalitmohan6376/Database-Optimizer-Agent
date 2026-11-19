from langgraph.graph import StateGraph, START, END, MessagesState
from backend.agent.chains import agent_chain, tools
from langgraph.prebuilt import ToolNode, tools_condition

def agent_node(state: MessagesState):
    response = agent_chain.invoke({"messages": state["messages"]})
    return {"messages": [response]}

workflow = StateGraph(MessagesState)

workflow.add_node("agent", agent_node)
workflow.add_node("tools", ToolNode(tools))

workflow.add_edge(START,"agent")
workflow.add_conditional_edges("agent",tools_condition)
workflow.add_edge("tools","agent")

app_agent = workflow.compile()

import os


ROOT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),'.env')
print(ROOT_DIR)
from dotenv import load_dotenv
load_dotenv(ROOT_DIR)
from langchain_openai import ChatOpenAI
from langchain.agents import create_agent
from langgraph.checkpoint.memory import InMemorySaver  
from langchain.messages import HumanMessage
from utils.logging import SessionLogger, log_info
from utils.variables import LOG_FOLDER

# Setup logging for the session
session_id = 'thread_1'
# Ensure we pass a file path, not just the directory
log_file_path = os.path.join(LOG_FOLDER, f"session_{session_id}.log")

# Create and set the logger
logger = SessionLogger.create_session_logger(session_id=session_id, log_file_path=log_file_path)
SessionLogger.set_session_logger(session_id=session_id, logger=logger)

# Test logging
log_info('Basic Agent Logger initialized')

llm = ChatOpenAI(api_key=os.getenv('OPENROUTER_API_KEY'), 
                base_url=os.getenv('OPENROUTER_BASE_URL'), 
                model='openai/gpt-4.1-mini',
                max_tokens=2500,)

from langchain_tavily import TavilySearch
internet_search = TavilySearch(max_results = 5)

system_prompt = "You are a financial analyst who answer questions about companies, profit, revenue, etc."

agent = create_agent(
    model= llm,
    tools=[internet_search],
    system_prompt=system_prompt,
    checkpointer=InMemorySaver(),
)
query = "What is the shorcut letters for the company Saudi Basic Industries Corporation to be used to extract credit scores"

def generate_response(human_message: str, session_key: dict):
    config = {'configurable': {'thread_id': session_key}}
    for msg, meta in agent.stream({'messages':[HumanMessage(human_message)]}, stream_mode='messages', config=config):
        if meta.get('langgraph_node') == "model":
            yield msg.content


# # # CLI test
# for i in generate_response(human_message = query, session_key= 'thread_1'):
#     print(i, end="", flush=True)

import os
from scripts.vectara_api import VectaraAPIs
import json
from pathlib import Path
from pyngrok import ngrok
ROOT_DIR = Path(__file__).parent.parent.parent
print(ROOT_DIR)
from dotenv import load_dotenv
load_dotenv(ROOT_DIR / ".env")

'''
    Vectara Solution
'''

vectara_api = VectaraAPIs(api_key=os.getenv('VECTARA_API'))



# mcp_tools_config = {}
# tools = vectara_api.list_tools()
# values = json.loads(tools.text)
# for tool in values['tools']:
#     if tool['type'] =='mcp':
#         if tool.get('server_id', '') == 'tsr_78':
#             if tool['name'] == 'rm_analysis_tool':
#                 mcp_tools_config[tool['name']] = {'type': 'mcp', 'tool_id':tool['id']}
# print(mcp_tools_config)

orchestrator_prompt = """
You are the ORCHESTRATOR AGENT.
 
You HAVE FULL ACCESS to the following tools:
- rm_analysis_tool(pass the company name only): generates a comprehensive RM report for a given company based on search results.

 
You MUST use these tools to complete the task.
Do NOT claim that you lack access to any tool.
 
STRICT OUTPUT RULE:
- Final response MUST be pure HTML.
- No markdown.
- No explanations.
- No apologies.

NOTES:
Generate a report ONLY IF the user EXCPLICITLY asked for it 

#Output Restrictions:
##Rules:
- Style: Professional blue (#1a1a2e, #16213e), accent gold (#e94560), white bg
- Elements: Header, TOC, sections, tables (striped), footer
- Output: Pure HTML only (<!DOCTYPE html> to </html>), no explanations
- Do not use markdown
- output only the final report in HTML
"""

# create_agent_response = vectara_api.create_agent(key='RM_report_agent',
#                                                  name='RM_report_agent',
#                                                  department='RM_report',
#                                                  description='An agent that has the capability of generating RM reports',
#                                                  tools_config= mcp_tools_config,
#                                                  system_prompt = orchestrator_prompt,
#                                                  model_name='gpt-5-mini',
#                                                  enable_agent=True)
# print(type(create_agent_response))
# print(create_agent_response)
# print(create_agent_response.text)

def generate_response(message, session_key):
    for i in vectara_api.interact_with_agent(agent_key='agt_hello_world_0ff3',
                              session_key=session_key,
                              message=message,
                              stream_response=True):
        # print(i.get('content', ''), end='', flush=True)
        yield i.get('content','')


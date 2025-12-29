
import re
from pathlib import Path
from dotenv import load_dotenv



# -------------------------------------------------------
# LangChain / LangGraph
# -------------------------------------------------------
from langchain_openai import ChatOpenAI
from langchain.agents import create_agent
from langchain_core.prompts import PromptTemplate
from langchain_tavily import TavilySearch

# -------------------------------------------------------
# Custom tools
# -------------------------------------------------------
from agentic_flow.tools.saudi_exchange_company_tool import SaudiExchangeCompanyTool
from agentic_flow.tools.ticker_lookup_tool import TickerLookupTool

# -------------------------------------------------------
# HTTP server
# -------------------------------------------------------
from starlette.applications import Starlette
from starlette.routing import Route
from starlette.responses import JSONResponse, Response
from starlette.middleware import Middleware
from starlette.middleware.cors import CORSMiddleware
import logging
import os
import uvicorn
from mcp.server import Server
from mcp.types import (
    Resource,
    Tool,
    TextContent,
)


# -------------------------------------------------------
# Env loading
# -------------------------------------------------------
ROOT_DIR = Path(__file__).parent.parent.parent
load_dotenv(ROOT_DIR)

# -------------------------------------------------------
# Companies dict
# -------------------------------------------------------
companies_dict= {
    "Energy & Petrochemicals": {
        "Large": [
            "Saudi Aramco",
            "SABIC",
            "Petro Rabigh",
            "Saudi Kayan Petrochemical Company",
            "Sahara International Petrochemical Company (SIPCHEM)",
        ],
        "Medium": [
            "Yanbu National Petrochemical Company (Yansab)",
            "Saudi Arabian Fertilizer Company (SAFCO)",
            "Saudi Chevron Phillips Company",
        ],
        "Small": [
            "Alujain Corporation",
            "Nama Chemicals Company",
            "Alkhorayef Petroleum Company",
        ],
    },
    "Construction & Real Estate": {
        "Large": [
            "Saudi Binladin Group",
            "Nesma & Partners Contracting Co. Ltd.",
            "Emaar, The Economic City (ECC)",
            "Dar Al Arkan Real Estate Development Company",
        ],
        "Medium": [
            "Yanbu Cement Co.",
            "Jabal Omar Development Company (JODC)",
            "Umm Al Qura for Development & Construction Company",
        ],
        "Small": [
            "Saudi Enaya Cooperative Insurance Co",
            "Musharaka REIT Fund",
            "Knowledge Economic City Company",
            "Masah Specialized Construction",
        ],
    },
    "Healthcare": {
        "Large": [
            "Dr. Sulaiman Al Habib Medical Group",
            "Mouwasat Medical Services Company",
            "Dallah Healthcare Company",
            "Almoosa Health Co.",
        ],
        "Medium": [
            "Jamjoom Pharmaceuticals Company",
            "Tabuk Pharmaceuticals Company",
            "Nahdi Medical Company (Pharmacies)",
            "International Medical Center (IMC), Jeddah",
        ],
        "Small": [
            "Saudi Pharmaceutical Industries & Medical Appliances Corp. (SPIMACO)",
            "Al Hammadi Holding Company",
            "Saudi Arabian Cooperative Insurance Co. (MedGulf)",
        ],
    },
    "Technology & IT Services": {
        "Large": [
            "Al Moammar Information Systems Company (MIS)",
            "Elm Company",
            "STC Group",
        ],
        "Medium": [
            "Rasan Information Technology Company",
            "Naseej",
        ],
        "Small": [
            "Edarat Communication & Information Technology Co.",
            "Sure Global Tech Co.",
            "Arab Sea Information Systems Co.",
        ],
    },
    "Retail & Consumer Goods": {
        "Large": [
            "Almarai Company",
            "Jarir Bookstore",
            "Danube",
            "Savola Group",
        ],
        "Medium": [
            "Al-Othaim Supermarket",
            "eXtra (United Electronics Company)",
            "SACO Hardware",
            "Tamimi Markets",
            "Al Hokair Retail",
        ],
        "Small": [
            "Fitaihi Holding Group",
            "Anaam International Holding Group",
            "Arabian Mills for Food Products",
        ],
    },
}

# -------------------------------------------------------
# LLM
# -------------------------------------------------------
llm = ChatOpenAI(
    api_key=os.getenv("OPENROUTER_API_KEY"),
    base_url=os.getenv("OPENROUTER_BASE_URL"),
    model="openai/gpt-4.1-mini",
    max_tokens=2500,
)

internet_search = TavilySearch(max_results=5)

# -------------------------------------------------------
# HTML Formatter
# -------------------------------------------------------
HTML_PROMPT = PromptTemplate(
    template="""Convert report to HTML with inline CSS.
Rules:
- Style: Professional blue (#1a1a2e, #16213e), accent gold (#e94560), white background
- Elements: Header, table of contents, sections, striped tables, footer
- Output: Pure HTML only (<!DOCTYPE html> to </html>)
- No markdown, no explanations

Report:
{report}
"""
)

html_chain = HTML_PROMPT | llm

# -------------------------------------------------------
# RM Report Agent
# -------------------------------------------------------
SYSTEM_PROMPT = """Generate RM report from raw data.
Structure:
1. Executive Summary
2. Company Overview
3. Financial Performance (3yr)
4. Cash Flow Analysis
5. Balance Sheet
6. Collateral Indicators
7. Credit Profile
8. Assets / Properties

Rules:
- Cite sources
- No recommendations
- Add disclaimer:
  "This report is for informational purposes only."
"""

report_agent = create_agent(
    model=llm,
    tools=[
        TickerLookupTool(),
        SaudiExchangeCompanyTool(),
    ],
    system_prompt=SYSTEM_PROMPT,
)

    
    


# -------------------------------------------------------
# Logging
# -------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("rm_mcp_server")


mcp_server = Server("rm_mcp_server")


# -------------------------------------------------------
# Helper functions 
# -------------------------------------------------------
def list_sectors() -> list[str]:
    return list(companies_dict.keys())

def list_company_sizes(sector: str) -> list[str]:
    if sector not in companies_dict:
        raise ValueError(f"Sector '{sector}' not found")
    return list(companies_dict[sector].keys())

def list_companies_in_sector(sector: str, size: str) -> list[str]:
    if sector not in companies_dict:
        raise ValueError(f"Sector '{sector}' not found")
    if size not in companies_dict[sector]:
        raise ValueError(f"Size '{size}' not found in sector '{sector}'")
    return companies_dict[sector][size]

def get_all_companies() -> dict:
    return companies_dict


def rm_analysis_tool(query: str) -> str:
    logger.info("Running RM analysis tool")
    result = report_agent.invoke({"messages": [{"role": "user", "content": query}]})
    return result["messages"][-1].content

def run_html_formatter(report: str) -> str:
    logger.info("Running HTML formatter tool")
    html_result = html_chain.invoke({"report": report})
    html = html_result.content
    html = re.sub(r"```html\n?|```\n?", "", html).strip()
    if not html.startswith("<!DOCTYPE"):
        html = "<!DOCTYPE html>\n" + html
    return html


# -------------------------------------------------------
# MCP: tools
# -------------------------------------------------------




@mcp_server.list_tools()
async def list_tools() -> list[Tool]:
    """List available tools for querying AML Postgres."""
    return [
        Tool(
            name="list_sectors",
            description=(
                "List all available sectors of companies."
            ),
            inputSchema={
                "type": "object",
                "properties": {},
                "required": [],
            },
        ),
        Tool(
            name="list_company_sizes",
            description="List company sizes for a given sector.",
            inputSchema={
                "type": "object",
                "properties": {
                    "sector": {
                        "type": "string",
                        "description": "Sector name, e.g. 'Banking' or 'Real Estate'.",
                    }
                },
                "required": ["sector"],
            },
        ),
        Tool(
            name="list_companies_in_sector",
            description="List companies in a given sector and size.",
            inputSchema={
                "type": "object",
                "properties": {
                    "sector": {
                        "type": "string",
                        "description": "Sector name, e.g. 'Banking' or 'Real Estate'.",
                    },
                    "size": {
                        "type": "string",
                        "description": "Company size, e.g. 'Large', 'Medium', or 'Small'.",
                    }
                },
                "required": ["sector", "size"],
            },
        ),
        Tool(
            name="get_all_companies",
            description=(
                "Get the full dictionary of sectors, sizes, and companies."
            ),
            inputSchema={
                "type": "object",
                "properties": {},
                "required": [],
            },
        ),
        Tool(
            name="rm_analysis_tool",
            description=(
                "Generate comprehensive RM report by analyzing the provided raw financial data."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "user query for report generation",
                    }
                },
                "required": ["query"],
            },
        ),

        Tool(
            name="run_html_formatter",
            description=(
                "Convert the RM report into professionally styled HTML with inline CSS."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "report": {
                        "type": "string",
                        "description": "the Generated report",
                    }
                },
                "required": ["report"],
            },
        )
    ]




@mcp_server.call_tool()
async def call_tool(name: str, arguments: dict) -> list[TextContent]:
    logger.info(f"call_tool name={name}, arguments={arguments}")

    # 2) list_sectors
    if name == "list_sectors":
        result_text = list_sectors()
        return [TextContent(type="text", text=result_text)]


    # 3) list_company_sizes
    if name == "list_company_sizes":
        sector = arguments.get("sector")
        if not sector:
            raise ValueError("Missing 'sector' argument.")
        result_text = list_company_sizes(sector) 
        return [TextContent(type="text", text=result_text)]


    # 4) get_table_info
    if name == "list_companies_in_sector":
        sector = arguments.get("sector")
        size = arguments.get("size")
        if not sector or not size:
            raise ValueError("Missing 'sector' or 'sector' argument.")
        result_text = list_companies_in_sector(sector, sector)
        return [TextContent(type="text", text=result_text)]


    # 5) get_all_companies
    if name == "get_all_companies":
        result_text = get_all_companies()
        return [TextContent(type="text", text=result_text)]




    # 8) run_html_formatter
    if name == "run_html_formatter":
        report = arguments.get("report")
        if not report:
            raise ValueError("Missing 'report' argument.")
        result_text = run_html_formatter(report)
        return [TextContent(type="text", text=result_text)]
    
    
    # 8) rm_analysis_tool
    if name == "rm_analysis_tool":
        query = arguments.get("query")
        if not query:
            raise ValueError("Missing 'query' argument.")
        result_text = rm_analysis_tool(query)
        return [TextContent(type="text", text=result_text)]


    # Unknown tool
    raise ValueError(f"Unknown tool: {name}")




# -------------------------------------------------------
# Resources (currently empty, but MCP requires handlers)
# -------------------------------------------------------




@mcp_server.list_resources()
async def list_resources() -> list[Resource]:
    """Return an empty list of resources (no file-like resources exposed yet)."""
    return []




# -------------------------------------------------------
# JSON-RPC handler for /mcp (HTTP)
# -------------------------------------------------------




async def mcp_http_handler(request):
    """
    Handle MCP JSON-RPC over HTTP POST.
    """
    try:
        body = await request.json()
        logger.info(f"Received MCP request: {body}")
    except Exception as e:
        return JSONResponse(
            {
                "jsonrpc": "2.0",
                "id": None,
                "error": {"code": -32700, "message": f"Parse error: {e}"},
            },
            status_code=400,
        )


    def no_body():
        r = Response(status_code=202)
        r.media_type = None
        return r


    # Batch support (optional)
    if isinstance(body, list):
        results = []
        any_requests = False
        for item in body:
            if isinstance(item, dict) and "id" in item:
                any_requests = True
            resp = await _handle_one(item)
            if resp is not None:
                results.append(resp)
        if not any_requests:
            return no_body()
        return JSONResponse(results)


    is_notification = isinstance(body, dict) and "id" not in body


    # MCP notification some clients send after initialize; ignore
    if body.get("method") == "notifications/initialized":
        return no_body()


    resp = await _handle_one(body)


    if is_notification:
        return no_body()


    if resp is None:
        return JSONResponse(
            {
                "jsonrpc": "2.0",
                "id": body.get("id"),
                "error": {
                    "code": -32603,
                    "message": "Internal error: no response generated",
                },
            },
            status_code=500,
        )


    return JSONResponse(resp)




async def _handle_one(msg: dict) -> dict | None:
    """Dispatch MCP methods. Returns JSON-RPC response dict, or None for notifications."""
    if not isinstance(msg, dict):
        return {
            "jsonrpc": "2.0",
            "id": None,
            "error": {"code": -32600, "message": "Invalid Request"},
        }


    method = msg.get("method")
    params = msg.get("params", {}) or {}
    req_id = msg.get("id")
    is_notification = "id" not in msg


    try:
        # initialize
        if method == "initialize":
            if is_notification:
                return None
            return {
                "jsonrpc": "2.0",
                "id": req_id,
                "result": {
                    "protocolVersion": "2025-03-26",
                    "capabilities": {
                        "resources": {"subscribe": False, "listChanged": False},
                        "tools": {"listChanged": False},
                        "prompts": {"listChanged": False},
                    },
                    "serverInfo": {
                        "name": "aml_postgres_mcp_server",
                        "version": "1.0.0",
                    },
                },
            }


        # ping
        if method == "ping":
            if is_notification:
                return None
            return {"jsonrpc": "2.0", "id": req_id, "result": {}}


        # tools/list
        if method == "tools/list":
            if is_notification:
                return None
            tools_result = await list_tools()
            return {
                "jsonrpc": "2.0",
                "id": req_id,
                "result": {
                    "tools": [
                        {
                            "name": t.name,
                            "description": t.description,
                            "inputSchema": t.inputSchema,
                        }
                        for t in tools_result
                    ]
                },
            }


        # tools/call
        if method == "tools/call":
            if is_notification:
                return None
            tool_name = params.get("name")
            tool_args = params.get("arguments", {}) or {}
            try:
                result = await call_tool(tool_name, tool_args)
                return {
                    "jsonrpc": "2.0",
                    "id": req_id,
                    "result": {
                        "content": [
                            {"type": c.type, "text": c.text} for c in result
                        ],
                        "isError": False,
                    },
                }
            except Exception as e:
                logger.error(f"Tool execution error: {e}")
                return {
                    "jsonrpc": "2.0",
                    "id": req_id,
                    "result": {
                        "content": [
                            {"type": "text", "text": f"Error executing tool: {e}"}
                        ],
                        "isError": True,
                    },
                }


        # resources/list
        if method == "resources/list":
            if is_notification:
                return None
            resources_result = await list_resources()
            return {
                "jsonrpc": "2.0",
                "id": req_id,
                "result": {
                    "resources": [
                        {
                            "uri": str(r.uri),
                            "name": r.name,
                            "mimeType": r.mimeType,
                            "description": r.description,
                        }
                        for r in resources_result
                    ]
                },
            }


        # unknown method
        if is_notification:
            return None


        return {
            "jsonrpc": "2.0",
            "id": req_id,
            "error": {"code": -32601, "message": f"Method not found: {method}"},
        }


    except Exception as e:
        if is_notification:
            return None
        return {
            "jsonrpc": "2.0",
            "id": req_id,
            "error": {"code": -32603, "message": f"Internal error: {e}"},
        }




# -------------------------------------------------------
# Extra HTTP helpers
# -------------------------------------------------------




async def health_check(request):
    return JSONResponse(
        {
            "status": "healthy",
            "service": "RM MCP Server",
            "mcp_endpoint": "/mcp",
            "description": "Use POST requests to /mcp for MCP JSON-RPC calls",
        }
    )




async def test_tools(request):
    try:
        tools = await list_tools()
        return JSONResponse(
            {
                "available_tools": [
                    {
                        "name": tool.name,
                        "description": tool.description,
                        "inputSchema": tool.inputSchema,
                    }
                    for tool in tools
                ]
            }
        )
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)




# -------------------------------------------------------
# Starlette app
# -------------------------------------------------------
middleware = [
    Middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["*"],
        allow_headers=["*"],
    )
]


app = Starlette(
    routes=[
        Route("/", health_check),
        Route("/health", health_check),
        Route("/mcp", mcp_http_handler, methods=["POST"]),
        Route("/tools", test_tools),
    ],
    middleware=middleware,
)


if __name__ == "__main__":
    port = int(os.getenv("RM_MCP_PORT", 4998))
    logger.info(f"Starting RM MCP server on port {port}...")
    logger.info(f"MCP HTTP endpoint: http://localhost:{port}/mcp")
    logger.info(f"Health: http://localhost:{port}/health")
    logger.info(f"Tools test: http://localhost:{port}/tools")


    uvicorn.run(
        app,
        host="0.0.0.0",
        port=port,
        log_level="info",
    )


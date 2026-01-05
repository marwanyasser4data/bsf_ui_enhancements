import os
from dotenv import load_dotenv
from tavily import TavilyClient
from langchain_openai import ChatOpenAI
import json
from typing import List, Optional
from pydantic import BaseModel, Field
from langchain_core.tools import StructuredTool
from langchain_core.prompts import ChatPromptTemplate
import re
# Load environment variables
load_dotenv()



client = TavilyClient(api_key=os.environ["TAVILY_API_KEY"])


# --- 1. Data Models (Output Structure) ---
class FitchSearchResult(BaseModel):
    title: str
    url: str
    snippet: Optional[str] = None
    query_used: str

class FitchSearchResponse(BaseModel):
    company: str
    results: List[FitchSearchResult]

# --- 2. Input Schema (Arguments) ---
class FitchSearchInput(BaseModel):
    company_name: str = Field(description="Company full name, e.g. 'Saudi Basic Industries Corporation'")
    ticker: str = Field(description="The Short Name/Ticker of the company (e.g. SABIC)")
    max_results_per_query: int = Field(default=5, ge=1, le=10)

# --- 3. Core Logic (Search Function) ---
def fitch_search_tool_func(company_name: str, ticker: str, max_results_per_query: int = 5) -> str:
    """
    Performs a deep search on Fitch Ratings using specific queries.
    Requires both Company Name and Ticker for best coverage.
    """
    queries = [
        f'site:fitchratings.com "{company_name}" rating outlook',
        f'site:fitchratings.com {ticker} "Issuer Default Rating"',
        f'site:fitchratings.com {ticker} "Rating Action"',
        f'site:fitchratings.com "{company_name}" "Rating Action"',
    ]

    out = []
    seen = set()

    # NOTE: Ensure 'client' (TavilyClient) is initialized in your notebook
    for q in queries:
        try:
            # OPTIMIZATION: search_depth="advanced" for better snippets
            r = client.search(
                query=q,
                max_results=max_results_per_query,
                include_answer=False,
                search_depth="advanced"
            )
        except NameError:
            return json.dumps({"error": "Tavily 'client' is not defined globally."})

        for h in r.get("results", []):
            url = h.get("url")
            title = h.get("title")

            if not url or not title:
                continue

            # Filter: Strict preference for Fitch domain
            if "fitchratings.com" not in url and "fitch" not in title.lower():
                continue

            if url in seen:
                continue

            seen.add(url)
            out.append(FitchSearchResult(
                title=title,
                url=url,
                snippet=h.get("content"),
                query_used=q
            ))

    payload = FitchSearchResponse(company=company_name, results=out)
    return payload.model_dump_json(indent=2, ensure_ascii=False)

# --- 4. Tool Definition ---
fitch_search = StructuredTool.from_function(
    name="fitch_search",
    description="Search specifically for Fitch Ratings using advanced depth.",
    func=fitch_search_tool_func,
    args_schema=FitchSearchInput,
)

print(" fitch_search tool ready")



def safe_json_parse(text: str) -> dict:
    """
    Robustly parses JSON from LLM output.
    """
    # 1. Attempt direct parsing
    try:
        return json.loads(text)
    except Exception:
        pass

    # 2. Attempt regex extraction
    match = re.search(r"\{.*\}", text, flags=re.DOTALL)
    if match:
        try:
            return json.loads(match.group(0))
        except Exception:
            pass

    # 3. Fallback (Updated to match new structure)
    return {
        "report_markdown": "Error: LLM did not return valid JSON."
    }
    
    
def credit_score_tool(company_name: str, ticker: str):
    print(f"🔎 Analyzing {company_name} ({ticker})...")
    search_results_json = fitch_search.invoke({
        "company_name": company_name,
        "ticker": ticker,
        "max_results_per_query": 3
    })
    return str(safe_json_parse(search_results_json))
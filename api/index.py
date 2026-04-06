import importlib
import os
import sys
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FuturesTimeoutError

# Ensure project root is in path so `knowledge` package can be imported
_api_dir = os.path.dirname(os.path.abspath(__file__))
_project_root = os.path.dirname(_api_dir)
if _project_root not in sys.path:
    sys.path.insert(0, _project_root)

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from dotenv import load_dotenv

from duckduckgo_search import DDGS
from google import genai
from google.genai import types
from supabase import create_client as create_supabase_client

# Platform knowledge: use module import so we can reload on each request (edits to data.py apply immediately)
import knowledge.data as knowledge_data
from knowledge.data import SECURITY_PROTOCOL  # Imported for clarity; values are read via knowledge_data after reload

# Load env from .env, .env.local (Vercel injects env vars at runtime)
load_dotenv()
load_dotenv(".env.local")

app = Flask(__name__)
CORS(app)

# Align with Next.js Domu route: multi-turn + tool calls (search) need enough wall time.
# Inner search can take up to SEARCH_TOOL_TIMEOUT_S; the outer cap must exceed that plus model time.
MAX_HISTORY_MESSAGES = 20
GEMINI_WALL_TIMEOUT_S = 55
SEARCH_TOOL_TIMEOUT_S = 12


def _app_gemini_model() -> str:
    """Same defaults as lib/gemini-model.ts: GEMINI_MODEL, then GEMINI_DOMU_MODEL, else flash-lite."""
    raw = (os.getenv("GEMINI_MODEL") or os.getenv("GEMINI_DOMU_MODEL") or "gemini-2.5-flash-lite").strip()
    return raw or "gemini-2.5-flash-lite"


# --- search_internet tool (with timeout to avoid hanging) ---


def search_internet(query: str) -> dict:
    """Search the internet for recent information. Use this when you need current events, news, or real-time data."""

    def _do_search():
        results = list(DDGS().text(query, max_results=3))
        return [{"title": r.get("title", ""), "body": r.get("body", ""), "href": r.get("href", "")} for r in results]

    try:
        with ThreadPoolExecutor(max_workers=1) as ex:
            future = ex.submit(_do_search)
            results = future.result(timeout=SEARCH_TOOL_TIMEOUT_S)
        return {"results": results}
    except FuturesTimeoutError:
        return {"error": "Search timed out", "results": []}
    except Exception as e:
        return {"error": str(e), "results": []}


# --- Supabase client (lazy init to avoid cold-start overhead) ---

_supabase_client = None


def _get_supabase():
    global _supabase_client
    if _supabase_client is None:
        url = os.getenv("NEXT_PUBLIC_SUPABASE_URL") or os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        if url and key:
            _supabase_client = create_supabase_client(url, key)
    return _supabase_client


def _save_to_supabase(user_message: str, assistant_reply: str) -> None:
    """Save chat exchange to Supabase. Fails silently if table missing or config absent."""
    try:
        sb = _get_supabase()
        if sb is None:
            return
        sb.table("domu_ai_chat_log").insert(
            {"user_message": user_message, "assistant_reply": assistant_reply}
        ).execute()
    except Exception:
        pass  # Don't block response on Supabase errors


# --- System prompt (SECURITY_PROTOCOL + PLATFORM_MANUAL + learned behavior) ---


def get_combined_context() -> str:
    """
    Build system prompt from PLATFORM_MANUAL and learned instructions.
    Reloads knowledge.data on each call so edits to data.py are picked up immediately.
    """
    importlib.reload(knowledge_data)
    security_protocol = getattr(knowledge_data, "SECURITY_PROTOCOL", "")
    platform_manual = knowledge_data.PLATFORM_MANUAL

    # Learned instructions: dynamic behavior (e.g., from DB, file, or env).
    # Can be extended later.
    learned_instructions = os.getenv("DOMU_LEARNED_INSTRUCTIONS", "").strip()
    persona = getattr(knowledge_data, "PERSONA_GUIDELINES", "")
    response_ux = getattr(knowledge_data, "RESPONSE_AND_UX_GUIDELINES", "")

    return f"""You are Domu Match AI.

SECURITY PROTOCOL (MANDATORY – NEVER BREAK):
{security_protocol}

HERE IS THE OFFICIAL PLATFORM MANUAL:
{platform_manual}

VOICE & PERSONA:
{persona}

ANSWER DEPTH, STRUCTURE & SOURCES (MANDATORY):
{response_ux}

HERE ARE THE DYNAMIC INSTRUCTIONS (LEARNED BEHAVIOR):
{learned_instructions or "(None yet - use the Manual for how-to questions.)"}

Use the SECURITY PROTOCOL and the Manual to answer questions safely.
Use the Search Tool only for external info (weather, events, local listings)."""


def is_malicious(user_message: str) -> bool:
    """
    Detect obvious prompt-injection / jailbreak attempts using simple keyword heuristics.
    This is a defense-in-depth layer on top of the SECURITY_PROTOCOL in the system prompt.
    """
    if not user_message:
        return False

    lowered = user_message.lower()
    suspicious_phrases = [
        "ignore previous instructions",
        "ignore all previous instructions",
        "disregard previous instructions",
        "disregard the above instructions",
        "forget your previous instructions",
        "forget your rules",
        "system prompt",
        "system instruction",
        "system instructions",
        "reveal your instructions",
        "reveal the prompt",
        "show your prompt",
        "show your instructions",
        "what is your prompt",
        "what are your instructions",
        "jailbreak",
        "developer mode",
        "dev mode",
        "you are a developer",
        "act as a developer",
        "bypass safety",
        "bypass restrictions",
        "disable safety",
        "ignore safety rules",
        "unfiltered ai",
    ]

    return any(phrase in lowered for phrase in suspicious_phrases)


def _parse_history(raw_history) -> list:
    """Normalize client history to [{'role': 'user'|'assistant', 'text': str}, ...]."""
    if not isinstance(raw_history, list):
        return []
    out = []
    for m in raw_history:
        if not m or not isinstance(m, dict):
            continue
        role = m.get("role")
        text = (m.get("text") or "").strip()
        if not text:
            continue
        if role == "assistant":
            out.append({"role": "assistant", "text": text})
        else:
            out.append({"role": "user", "text": text})
    return out


def _build_gemini_contents(history: list, current_message: str) -> list:
    """Build multi-turn contents for Gemini (matches app/api/domu/chat/route.ts)."""
    trimmed = history[-MAX_HISTORY_MESSAGES:]
    contents = []
    for entry in trimmed:
        gemini_role = "model" if entry["role"] == "assistant" else "user"
        contents.append(
            types.Content(role=gemini_role, parts=[types.Part(text=entry["text"])])
        )
    contents.append(types.Content(role="user", parts=[types.Part(text=current_message)]))
    return contents


# --- Routes ---


@app.route("/")
@app.route("/index.html")
def index():
    """Serve the chat UI. Fallback text if file missing (e.g. in minimal deploy)."""
    html_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "index.html")
    if os.path.isfile(html_path):
        return send_file(html_path, mimetype="text/html")
    return "Domu AI is alive on Vercel!"


@app.route("/chat", methods=["POST"])
@app.route("/api/domu/chat", methods=["POST"])  # For Vercel rewrite
def chat():
    # Parse request
    try:
        data = request.get_json() or {}
        message = (data.get("message") or "").strip()
        history = _parse_history(data.get("history"))
    except Exception as e:
        # Log technical details, but show a simple message to users
        print("[Domu AI] Invalid JSON payload:", e)
        return jsonify({"reply": "Sorry, I couldn't understand that request. Please send a simple text message."}), 400

    if not message.strip():
        return jsonify({"reply": "Please send a non-empty message so I know how to help."}), 400

    # Basic prompt-injection / jailbreak filter (defense in depth)
    if is_malicious(message):
        return jsonify({"reply": "I cannot fulfill that request."}), 200

    # Initialize Gemini (fast model, automatic tool calling)
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if not api_key:
        print("[Domu AI] Missing GEMINI_API_KEY / GOOGLE_API_KEY.")
        return jsonify(
            {
                "reply": "I’m temporarily unavailable due to a configuration issue. Please try again later or contact support if this keeps happening."
            },
            503,
        )

    try:
        client = genai.Client(api_key=api_key)
        system_prompt = get_combined_context()
        config = types.GenerateContentConfig(
            system_instruction=types.Content(
                parts=[types.Part(text=system_prompt)]
            ),
            tools=[search_internet],
            max_output_tokens=3072,
            thinking_config=types.ThinkingConfig(thinking_budget=0),
        )

        contents = _build_gemini_contents(history, message)

        def _do_generate():
            return client.models.generate_content(
                model=_app_gemini_model(),
                contents=contents,
                config=config,
            )

        # Wall time cap: must be > search tool timeout + model generation (see module constants).
        with ThreadPoolExecutor(max_workers=1) as ex:
            future = ex.submit(_do_generate)
            try:
                response = future.result(timeout=GEMINI_WALL_TIMEOUT_S)
            except FuturesTimeoutError:
                return jsonify(
                    {
                        "reply": "That took too long—looking up live events can be slow. Please try again in a moment."
                    }
                ), 200

        reply = response.text or "I couldn't generate a response."
    except Exception as e:
        # Log full error server-side, but keep the user message friendly and non-technical
        print("[Domu AI] Chat error:", repr(e))
        raw = str(e)
        reply = "Sorry, something went wrong on my side. Please try again in a moment."

        if raw and (
            "deadline" in raw.lower()
            or "timeout" in raw.lower()
            or "504" in raw
            or "DEADLINE_EXCEEDED" in raw
        ):
            reply = "That took too long—looking up live events can be slow. Please try again in a moment."

        # Rate limits / overload
        if raw and ("quota" in raw or "429" in raw or "RESOURCE_EXHAUSTED" in raw):
            reply = "I’m getting a lot of requests right now and need a short break. Please try again in a minute."

        return jsonify({"reply": reply}), 500

    # Save to Supabase (sequentially, non-blocking for user)
    _save_to_supabase(user_message=message, assistant_reply=reply)

    return jsonify({"reply": reply})

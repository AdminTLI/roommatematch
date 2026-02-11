import os
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FuturesTimeoutError

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from dotenv import load_dotenv

from duckduckgo_search import DDGS
from google import genai
from google.genai import types
from supabase import create_client as create_supabase_client

# Load env from .env, .env.local (Vercel injects env vars at runtime)
load_dotenv()
load_dotenv(".env.local")

app = Flask(__name__)
CORS(app)

# --- search_internet tool (with timeout to avoid hanging) ---


def search_internet(query: str) -> dict:
    """Search the internet for recent information. Use this when you need current events, news, or real-time data."""

    def _do_search():
        results = list(DDGS().text(query, max_results=3))
        return [{"title": r.get("title", ""), "body": r.get("body", ""), "href": r.get("href", "")} for r in results]

    try:
        with ThreadPoolExecutor(max_workers=1) as ex:
            future = ex.submit(_do_search)
            results = future.result(timeout=8)
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
def chat():
    # Parse request
    try:
        data = request.get_json() or {}
        message = data.get("message") or ""
    except Exception:
        return jsonify({"reply": "Invalid JSON. Send {\"message\": \"...\"}"}), 400

    if not message.strip():
        return jsonify({"reply": "Please send a non-empty message."}), 400

    # Initialize Gemini (fast model, automatic tool calling)
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if not api_key:
        return jsonify({"reply": "Server error: GEMINI_API_KEY not configured."}), 500

    try:
        client = genai.Client(api_key=api_key)
        config = types.GenerateContentConfig(
            tools=[search_internet],
            max_output_tokens=2048,
        )

        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=message,
            config=config,
        )

        reply = response.text or "I couldn't generate a response."
    except Exception as e:
        return jsonify({"reply": f"Error calling AI: {str(e)}"}), 500

    # Save to Supabase (sequentially, non-blocking for user)
    _save_to_supabase(user_message=message, assistant_reply=reply)

    return jsonify({"reply": reply})
